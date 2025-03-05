const { Preparation, Recette, Commande, IngredientRecette, Intrant, Utilisateur } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

exports.creerPreparation = async (req, res, next) => {
  try {
    const { recette_id, commande_id, quantite, notes } = req.body;

    // Vérifier la recette
    const recette = await Recette.findByPk(recette_id, {
      include: [{
        model: IngredientRecette,
        include: [Intrant]
      }]
    });

    if (!recette) {
      return next(new AppError('Recette non trouvée', 404));
    }

    // Vérifier la commande si fournie
    if (commande_id) {
      const commande = await Commande.findByPk(commande_id);
      if (!commande) {
        return next(new AppError('Commande non trouvée', 404));
      }
    }

    // Vérifier la disponibilité des ingrédients
    const ingredientsManquants = [];
    for (const ingredient of recette.IngredientRecettes) {
      const quantiteNecessaire = ingredient.quantite * quantite;
      if (ingredient.Intrant.stock_actuel < quantiteNecessaire) {
        ingredientsManquants.push({
          nom: ingredient.Intrant.nom,
          stock_actuel: ingredient.Intrant.stock_actuel,
          quantite_necessaire: quantiteNecessaire
        });
      }
    }

    if (ingredientsManquants.length > 0) {
      return next(new AppError('Stock insuffisant pour certains ingrédients', 400, {
        ingredients: ingredientsManquants
      }));
    }

    // Créer la préparation
    const preparation = await Preparation.create({
      recette_id,
      commande_id,
      quantite,
      statut: 'en_attente',
      notes
    });

    // Notifier via WebSocket
    req.wsUtils.notifyCuisine.preparationCreated(req.wsUtils, {
      preparation: {
        id: preparation.id,
        recette: recette.nom,
        quantite: preparation.quantite
      },
      commande_id
    });

    res.status(201).json({
      status: 'success',
      data: preparation
    });
  } catch (error) {
    next(error);
  }
};

exports.demarrerPreparation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const preparation = await Preparation.findByPk(id, {
      include: [
        { model: Recette },
        { model: Commande }
      ]
    });

    if (!preparation) {
      return next(new AppError('Préparation non trouvée', 404));
    }

    if (preparation.statut !== 'en_attente') {
      return next(new AppError('Cette préparation ne peut pas être démarrée', 400));
    }

    // Mettre à jour la préparation
    await preparation.update({
      statut: 'en_cours',
      debut_preparation: new Date(),
      preparee_par: req.user.id
    });

    // Notifier via WebSocket
    req.wsUtils.notifyCuisine.preparationStarted(req.wsUtils, {
      preparation: {
        id: preparation.id,
        recette: preparation.Recette.nom,
        quantite: preparation.quantite
      },
      cuisinier: {
        id: req.user.id,
        nom: req.user.nom,
        prenom: req.user.prenom
      }
    });

    res.status(200).json({
      status: 'success',
      data: preparation
    });
  } catch (error) {
    next(error);
  }
};

exports.terminerPreparation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const preparation = await Preparation.findByPk(id, {
      include: [
        { 
          model: Recette,
          include: [{
            model: IngredientRecette,
            include: [Intrant]
          }]
        },
        { model: Commande }
      ]
    });

    if (!preparation) {
      return next(new AppError('Préparation non trouvée', 404));
    }

    if (preparation.statut !== 'en_cours') {
      return next(new AppError('Cette préparation ne peut pas être terminée', 400));
    }

    // Déduire les ingrédients du stock
    const transaction = await sequelize.transaction();
    try {
      for (const ingredient of preparation.Recette.IngredientRecettes) {
        const quantiteUtilisee = ingredient.quantite * preparation.quantite;
        await ingredient.Intrant.decrement('stock_actuel', {
          by: quantiteUtilisee,
          transaction
        });
      }

      // Mettre à jour la préparation
      await preparation.update({
        statut: 'terminee',
        fin_preparation: new Date()
      }, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    // Notifier via WebSocket
    req.wsUtils.notifyCuisine.preparationCompleted(req.wsUtils, {
      preparation: {
        id: preparation.id,
        recette: preparation.Recette.nom,
        quantite: preparation.quantite
      },
      cuisinier: {
        id: req.user.id,
        nom: req.user.nom,
        prenom: req.user.prenom
      }
    });

    // Si la préparation est liée à une commande, notifier les serveurs
    if (preparation.commande_id) {
      req.wsUtils.notifyServers.preparationReady(req.wsUtils, {
        preparation: {
          id: preparation.id,
          recette: preparation.Recette.nom
        },
        commande: {
          id: preparation.Commande.id,
          numero: preparation.Commande.numero
        }
      });
    }

    res.status(200).json({
      status: 'success',
      data: preparation
    });
  } catch (error) {
    next(error);
  }
};

exports.annulerPreparation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { motif } = req.body;

    const preparation = await Preparation.findByPk(id, {
      include: [
        { model: Recette },
        { model: Commande }
      ]
    });

    if (!preparation) {
      return next(new AppError('Préparation non trouvée', 404));
    }

    if (preparation.statut === 'terminee') {
      return next(new AppError('Une préparation terminée ne peut pas être annulée', 400));
    }

    // Mettre à jour la préparation
    await preparation.update({
      statut: 'annulee',
      notes: `${preparation.notes || ''}\nAnnulation: ${motif}`
    });

    // Notifier via WebSocket
    req.wsUtils.notifyCuisine.preparationCanceled(req.wsUtils, {
      preparation: {
        id: preparation.id,
        recette: preparation.Recette.nom,
        quantite: preparation.quantite
      },
      motif,
      utilisateur: {
        id: req.user.id,
        nom: req.user.nom,
        prenom: req.user.prenom
      }
    });

    res.status(200).json({
      status: 'success',
      data: preparation
    });
  } catch (error) {
    next(error);
  }
};

exports.listerPreparations = async (req, res, next) => {
  try {
    const { statut, date_debut, date_fin } = req.query;
    const where = {};

    if (statut) {
      where.statut = statut;
    }

    if (date_debut && date_fin) {
      where.created_at = {
        [Op.between]: [new Date(date_debut), new Date(date_fin)]
      };
    }

    const preparations = await Preparation.findAll({
      where,
      include: [
        { model: Recette },
        { model: Commande },
        {
          model: Utilisateur,
          as: 'preparePar',
          attributes: ['id', 'nom', 'prenom']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: preparations
    });
  } catch (error) {
    next(error);
  }
};

exports.obtenirPreparation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const preparation = await Preparation.findByPk(id, {
      include: [
        { 
          model: Recette,
          include: [{
            model: IngredientRecette,
            include: [Intrant]
          }]
        },
        { model: Commande },
        {
          model: Utilisateur,
          as: 'preparePar',
          attributes: ['id', 'nom', 'prenom']
        }
      ]
    });

    if (!preparation) {
      return next(new AppError('Préparation non trouvée', 404));
    }

    res.status(200).json({
      status: 'success',
      data: preparation
    });
  } catch (error) {
    next(error);
  }
};
