const { Intrant, MouvementStock, UniteMesure, Utilisateur } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const { notifyStock } = require('../utils/websocketUtils');

exports.creerIntrant = async (req, res, next) => {
  try {
    const {
      code,
      nom,
      description,
      unite_mesure_id,
      stock_minimum,
      stock_maximum,
      prix_unitaire,
      suivi_stock,
      emplacement,
      allergenes
    } = req.body;

    // Vérifier si l'unité de mesure existe
    const uniteMesure = await UniteMesure.findByPk(unite_mesure_id);
    if (!uniteMesure) {
      return next(new AppError('Unité de mesure non trouvée', 404));
    }

    const intrant = await Intrant.create({
      code,
      nom,
      description,
      unite_mesure_id,
      stock_minimum,
      stock_maximum,
      prix_unitaire,
      suivi_stock,
      emplacement,
      allergenes
    });

    // Si un stock initial est fourni, créer un mouvement de stock
    if (req.body.stock_initial > 0) {
      const mouvement = await MouvementStock.create({
        intrant_id: intrant.id,
        type_mouvement: 'entree',
        quantite: req.body.stock_initial,
        unite_mesure_id,
        prix_unitaire,
        reference_document: 'INIT',
        motif: 'Stock initial',
        effectue_par: req.user.id
      });

      // Notifier du mouvement de stock
      notifyStock.stockMovement(req.wsUtils, {
        mouvement: {
          id: mouvement.id,
          type: 'entree',
          quantite: mouvement.quantite,
          intrant_id: intrant.id
        },
        intrant: {
          code: intrant.code,
          nom: intrant.nom,
          stock_actuel: intrant.stock_actuel
        }
      });
    }

    // Vérifier si le stock initial est inférieur au stock minimum
    if (intrant.isStockBas()) {
      notifyStock.lowStock(req.wsUtils, {
        intrant: {
          id: intrant.id,
          code: intrant.code,
          nom: intrant.nom,
          stock_actuel: intrant.stock_actuel,
          stock_minimum: intrant.stock_minimum
        }
      });
    }

    // Récupérer l'intrant avec ses relations
    const intrantComplet = await Intrant.findByPk(intrant.id, {
      include: [
        { model: UniteMesure, as: 'uniteMesure' }
      ]
    });

    res.status(201).json({
      status: 'success',
      data: intrantComplet
    });
  } catch (error) {
    next(error);
  }
};

exports.mettreAJourIntrant = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      code,
      nom,
      description,
      unite_mesure_id,
      stock_minimum,
      stock_maximum,
      prix_unitaire,
      suivi_stock,
      emplacement,
      allergenes
    } = req.body;

    const intrant = await Intrant.findByPk(id);
    if (!intrant) {
      return next(new AppError('Intrant non trouvé', 404));
    }

    // Si l'unité de mesure change, vérifier qu'elle existe
    if (unite_mesure_id && unite_mesure_id !== intrant.unite_mesure_id) {
      const uniteMesure = await UniteMesure.findByPk(unite_mesure_id);
      if (!uniteMesure) {
        return next(new AppError('Unité de mesure non trouvée', 404));
      }
    }

    await intrant.update({
      code,
      nom,
      description,
      unite_mesure_id,
      stock_minimum,
      stock_maximum,
      prix_unitaire,
      suivi_stock,
      emplacement,
      allergenes
    });

    // Récupérer l'intrant mis à jour avec ses relations
    const intrantMAJ = await Intrant.findByPk(id, {
      include: [
        { model: UniteMesure, as: 'uniteMesure' }
      ]
    });

    res.status(200).json({
      status: 'success',
      data: intrantMAJ
    });
  } catch (error) {
    next(error);
  }
};

exports.supprimerIntrant = async (req, res, next) => {
  try {
    const { id } = req.params;

    const intrant = await Intrant.findByPk(id);
    if (!intrant) {
      return next(new AppError('Intrant non trouvé', 404));
    }

    // Vérifier si l'intrant est utilisé dans des recettes
    const utilisations = await intrant.getUtilisationsDansRecettes();
    if (utilisations.length > 0) {
      return next(new AppError('Impossible de supprimer un intrant utilisé dans des recettes', 400));
    }

    await intrant.destroy();

    res.status(200).json({
      status: 'success',
      message: 'Intrant supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

exports.listerIntrants = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Intrant.findAndCountAll({
      include: [
        { model: UniteMesure, as: 'uniteMesure' }
      ],
      order: [['nom', 'ASC']],
      limit,
      offset
    });

    res.status(200).json({
      status: 'success',
      data: rows,
      pagination: {
        page,
        limit,
        totalItems: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.obtenirIntrant = async (req, res, next) => {
  try {
    const { id } = req.params;

    const intrant = await Intrant.findByPk(id, {
      include: [
        { model: UniteMesure, as: 'uniteMesure' }
      ]
    });

    if (!intrant) {
      return next(new AppError('Intrant non trouvé', 404));
    }

    res.status(200).json({
      status: 'success',
      data: intrant
    });
  } catch (error) {
    next(error);
  }
};

exports.ajouterMouvementStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      type_mouvement,
      quantite,
      prix_unitaire,
      reference_document,
      motif
    } = req.body;

    const intrant = await Intrant.findByPk(id);
    if (!intrant) {
      return next(new AppError('Intrant non trouvé', 404));
    }

    // Pour les sorties, vérifier le stock disponible
    if (['sortie', 'perte'].includes(type_mouvement)) {
      if (!intrant.isStockSuffisant(quantite)) {
        return next(new AppError('Stock insuffisant', 400));
      }
    }

    const mouvement = await MouvementStock.create({
      intrant_id: id,
      type_mouvement,
      quantite,
      unite_mesure_id: intrant.unite_mesure_id,
      prix_unitaire,
      reference_document,
      motif,
      effectue_par: req.user.id
    });

    // Notifier du mouvement de stock
    notifyStock.stockMovement(req.wsUtils, {
      mouvement: {
        id: mouvement.id,
        type: type_mouvement,
        quantite: mouvement.quantite,
        intrant_id: id
      },
      intrant: {
        code: intrant.code,
        nom: intrant.nom,
        stock_actuel: intrant.stock_actuel
      },
      user: {
        id: req.user.id,
        nom: req.user.nom,
        prenom: req.user.prenom
      }
    });

    // Vérifier le niveau de stock après le mouvement
    await intrant.reload();
    if (intrant.isStockBas()) {
      notifyStock.lowStock(req.wsUtils, {
        intrant: {
          id: intrant.id,
          code: intrant.code,
          nom: intrant.nom,
          stock_actuel: intrant.stock_actuel,
          stock_minimum: intrant.stock_minimum
        }
      });
    }

    if (intrant.stock_actuel === 0) {
      notifyStock.outOfStock(req.wsUtils, {
        intrant: {
          id: intrant.id,
          code: intrant.code,
          nom: intrant.nom
        }
      });
    }

    // Récupérer le mouvement avec ses relations
    const mouvementComplet = await MouvementStock.findByPk(mouvement.id, {
      include: [
        { model: Intrant, as: 'intrant' },
        { model: UniteMesure, as: 'uniteMesure' },
        {
          model: Utilisateur,
          as: 'effectuePar',
          attributes: ['id', 'nom', 'prenom']
        }
      ]
    });

    res.status(201).json({
      status: 'success',
      data: mouvementComplet
    });
  } catch (error) {
    next(error);
  }
};

exports.listerMouvementsStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      debut,
      fin,
      type
    } = req.query;

    const where = { intrant_id: id };
    if (debut || fin) {
      where.date_mouvement = {};
      if (debut) where.date_mouvement[Op.gte] = new Date(debut);
      if (fin) where.date_mouvement[Op.lte] = new Date(fin);
    }
    if (type) where.type_mouvement = type;

    const mouvements = await MouvementStock.findAll({
      where,
      include: [
        { model: UniteMesure, as: 'uniteMesure' },
        {
          model: Utilisateur,
          as: 'effectuePar',
          attributes: ['id', 'nom', 'prenom']
        }
      ],
      order: [['date_mouvement', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: mouvements
    });
  } catch (error) {
    next(error);
  }
};

exports.obtenirAlertesStock = async (req, res, next) => {
  try {
    const intrantsEnAlerte = await Intrant.findAll({
      where: {
        suivi_stock: true,
        stock_minimum: {
          [Op.not]: null
        },
        stock_actuel: {
          [Op.lte]: sequelize.col('stock_minimum')
        }
      },
      include: [
        { model: UniteMesure, as: 'uniteMesure' }
      ]
    });

    res.status(200).json({
      status: 'success',
      data: intrantsEnAlerte
    });
  } catch (error) {
    next(error);
  }
};
