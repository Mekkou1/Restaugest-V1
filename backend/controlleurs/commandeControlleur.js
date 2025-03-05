const { Commande, Article, TableRestaurant, Utilisateur } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

exports.creerCommande = async (req, res, next) => {
  try {
    const { table_id, articles, notes } = req.body;

    // Vérifier si la table existe
    const table = await TableRestaurant.findByPk(table_id);
    if (!table) {
      return next(new AppError('Table non trouvée', 404));
    }

    // Créer la commande
    const commande = await Commande.create({
      table_id,
      serveur_id: req.user.id,
      statut: 'en_attente',
      notes
    });

    // Ajouter les articles à la commande
    if (articles && articles.length > 0) {
      for (const item of articles) {
        const article = await Article.findByPk(item.article_id);
        if (!article) {
          throw new AppError(`Article ${item.article_id} non trouvé`, 404);
        }
        await commande.addArticle(article, {
          through: { 
            quantite: item.quantite,
            notes: item.notes,
            prix_unitaire: article.prix
          }
        });
      }
    }

    // Notifier la cuisine via WebSocket
    req.wsUtils.notifyCuisine.newOrder(req.wsUtils, {
      commande: {
        id: commande.id,
        table: table.numero,
        articles: articles.length
      }
    });

    // Récupérer la commande complète avec ses relations
    const commandeComplete = await Commande.findByPk(commande.id, {
      include: [
        {
          model: Article,
          through: { attributes: ['quantite', 'notes', 'prix_unitaire'] }
        },
        {
          model: TableRestaurant,
          attributes: ['numero', 'zone']
        },
        {
          model: Utilisateur,
          as: 'serveur',
          attributes: ['id', 'nom', 'prenom']
        }
      ]
    });

    res.status(201).json({
      status: 'success',
      data: commandeComplete
    });
  } catch (error) {
    next(error);
  }
};

exports.mettreAJourCommande = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { statut, articles, notes } = req.body;

    const commande = await Commande.findByPk(id);
    if (!commande) {
      return next(new AppError('Commande non trouvée', 404));
    }

    // Mise à jour du statut et des notes
    await commande.update({
      statut,
      notes
    });

    // Mise à jour des articles si fournis
    if (articles) {
      // Supprimer les anciens articles
      await commande.setArticles([]);

      // Ajouter les nouveaux articles
      for (const item of articles) {
        const article = await Article.findByPk(item.article_id);
        if (!article) {
          throw new AppError(`Article ${item.article_id} non trouvé`, 404);
        }
        await commande.addArticle(article, {
          through: { 
            quantite: item.quantite,
            notes: item.notes,
            prix_unitaire: article.prix
          }
        });
      }
    }

    // Notifier les changements via WebSocket
    if (statut === 'en_preparation') {
      req.wsUtils.notifyCuisine.startPreparation(req.wsUtils, {
        commande: {
          id: commande.id,
          statut
        }
      });
    } else if (statut === 'pret') {
      req.wsUtils.notifyServers.orderReady(req.wsUtils, {
        commande: {
          id: commande.id,
          statut
        }
      });
    }

    // Récupérer la commande mise à jour
    const commandeMAJ = await Commande.findByPk(id, {
      include: [
        {
          model: Article,
          through: { attributes: ['quantite', 'notes', 'prix_unitaire'] }
        },
        {
          model: TableRestaurant,
          attributes: ['numero', 'zone']
        },
        {
          model: Utilisateur,
          as: 'serveur',
          attributes: ['id', 'nom', 'prenom']
        }
      ]
    });

    res.status(200).json({
      status: 'success',
      data: commandeMAJ
    });
  } catch (error) {
    next(error);
  }
};

exports.supprimerCommande = async (req, res, next) => {
  try {
    const { id } = req.params;

    const commande = await Commande.findByPk(id);
    if (!commande) {
      return next(new AppError('Commande non trouvée', 404));
    }

    await commande.destroy();

    res.status(200).json({
      status: 'success',
      message: 'Commande supprimée avec succès'
    });
  } catch (error) {
    next(error);
  }
};

exports.obtenirCommande = async (req, res, next) => {
  try {
    const { id } = req.params;

    const commande = await Commande.findByPk(id, {
      include: [
        {
          model: Article,
          through: { attributes: ['quantite', 'notes', 'prix_unitaire'] }
        },
        {
          model: TableRestaurant,
          attributes: ['numero', 'zone']
        },
        {
          model: Utilisateur,
          as: 'serveur',
          attributes: ['id', 'nom', 'prenom']
        }
      ]
    });

    if (!commande) {
      return next(new AppError('Commande non trouvée', 404));
    }

    res.status(200).json({
      status: 'success',
      data: commande
    });
  } catch (error) {
    next(error);
  }
};

exports.listerCommandes = async (req, res, next) => {
  try {
    const { statut, table_id, serveur_id } = req.query;
    const where = {};

    if (statut) where.statut = statut;
    if (table_id) where.table_id = table_id;
    if (serveur_id) where.serveur_id = serveur_id;

    const commandes = await Commande.findAll({
      where,
      include: [
        {
          model: Article,
          through: { attributes: ['quantite', 'notes', 'prix_unitaire'] }
        },
        {
          model: TableRestaurant,
          attributes: ['numero', 'zone']
        },
        {
          model: Utilisateur,
          as: 'serveur',
          attributes: ['id', 'nom', 'prenom']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: commandes
    });
  } catch (error) {
    next(error);
  }
};
