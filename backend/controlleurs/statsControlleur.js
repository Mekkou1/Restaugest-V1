const { Commande, Article, Ticket, Caisse, Utilisateur, TableRestaurant } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

exports.getChiffreAffaires = async (req, res, next) => {
  try {
    const { debut, fin, periode } = req.query;
    const dateDebut = new Date(debut);
    const dateFin = new Date(fin);

    let groupBy;
    switch (periode) {
      case 'jour':
        groupBy = 'DATE(createdAt)';
        break;
      case 'semaine':
        groupBy = 'YEARWEEK(createdAt)';
        break;
      case 'mois':
        groupBy = 'DATE_FORMAT(createdAt, "%Y-%m")';
        break;
      default:
        groupBy = 'DATE(createdAt)';
    }

    const stats = await Ticket.findAll({
      attributes: [
        [sequelize.literal(groupBy), 'date'],
        [sequelize.fn('SUM', sequelize.col('total')), 'total'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'nombre_tickets']
      ],
      where: {
        createdAt: {
          [Op.between]: [dateDebut, dateFin]
        },
        statut: 'payé'
      },
      group: [sequelize.literal(groupBy)],
      order: [sequelize.literal(groupBy)]
    });

    res.status(200).json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

exports.getStatsArticles = async (req, res, next) => {
  try {
    const { debut, fin } = req.query;
    const dateDebut = new Date(debut);
    const dateFin = new Date(fin);

    const stats = await Article.findAll({
      attributes: [
        'id',
        'nom',
        'prix',
        [sequelize.fn('COUNT', sequelize.col('Commandes.id')), 'nombre_commandes'],
        [sequelize.fn('SUM', sequelize.col('Commandes->CommandeArticle.quantite')), 'quantite_totale'],
        [
          sequelize.literal('SUM(Commandes->CommandeArticle.quantite * Commandes->CommandeArticle.prix_unitaire)'),
          'chiffre_affaires'
        ]
      ],
      include: [{
        model: Commande,
        attributes: [],
        through: {
          attributes: []
        },
        where: {
          createdAt: {
            [Op.between]: [dateDebut, dateFin]
          }
        }
      }],
      group: ['Article.id'],
      order: [[sequelize.literal('chiffre_affaires'), 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

exports.getStatsServeurs = async (req, res, next) => {
  try {
    const { debut, fin } = req.query;
    const dateDebut = new Date(debut);
    const dateFin = new Date(fin);

    const stats = await Utilisateur.findAll({
      attributes: [
        'id',
        'nom',
        'prenom',
        [sequelize.fn('COUNT', sequelize.col('Commandes.id')), 'nombre_commandes'],
        [
          sequelize.literal('SUM(Commandes->Articles->CommandeArticle.quantite * Commandes->Articles->CommandeArticle.prix_unitaire)'),
          'chiffre_affaires'
        ]
      ],
      include: [{
        model: Commande,
        as: 'CommandesServies',
        attributes: [],
        include: [{
          model: Article,
          attributes: [],
          through: {
            attributes: []
          }
        }],
        where: {
          createdAt: {
            [Op.between]: [dateDebut, dateFin]
          }
        }
      }],
      where: {
        role: 'Serveur'
      },
      group: ['Utilisateur.id'],
      order: [[sequelize.literal('chiffre_affaires'), 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

exports.getStatsTables = async (req, res, next) => {
  try {
    const { debut, fin } = req.query;
    const dateDebut = new Date(debut);
    const dateFin = new Date(fin);

    const stats = await TableRestaurant.findAll({
      attributes: [
        'id',
        'numero',
        'zone',
        [sequelize.fn('COUNT', sequelize.col('Commandes.id')), 'nombre_commandes'],
        [
          sequelize.literal('SUM(Commandes->Articles->CommandeArticle.quantite * Commandes->Articles->CommandeArticle.prix_unitaire)'),
          'chiffre_affaires'
        ],
        [
          sequelize.literal('AVG(TIMESTAMPDIFF(MINUTE, Commandes.createdAt, Commandes.updatedAt))'),
          'duree_moyenne_service'
        ]
      ],
      include: [{
        model: Commande,
        attributes: [],
        include: [{
          model: Article,
          attributes: [],
          through: {
            attributes: []
          }
        }],
        where: {
          createdAt: {
            [Op.between]: [dateDebut, dateFin]
          }
        }
      }],
      group: ['TableRestaurant.id'],
      order: [[sequelize.literal('chiffre_affaires'), 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

exports.getStatsCaisse = async (req, res, next) => {
  try {
    const { debut, fin } = req.query;
    const dateDebut = new Date(debut);
    const dateFin = new Date(fin);

    const stats = await Caisse.findAll({
      attributes: [
        'id',
        'date_ouverture',
        'date_fermeture',
        'fond_initial',
        'solde_theorique',
        'solde_reel',
        'ecart',
        [
          sequelize.literal('(SELECT COUNT(*) FROM tickets WHERE tickets.createdAt BETWEEN Caisse.date_ouverture AND Caisse.date_fermeture)'),
          'nombre_tickets'
        ],
        [
          sequelize.literal('(SELECT SUM(total) FROM tickets WHERE tickets.createdAt BETWEEN Caisse.date_ouverture AND Caisse.date_fermeture)'),
          'chiffre_affaires'
        ]
      ],
      include: [{
        model: Utilisateur,
        as: 'caissier',
        attributes: ['id', 'nom', 'prenom']
      }],
      where: {
        date_ouverture: {
          [Op.between]: [dateDebut, dateFin]
        }
      },
      order: [['date_ouverture', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const debutJour = new Date(now.setHours(0, 0, 0, 0));
    const finJour = new Date(now.setHours(23, 59, 59, 999));

    // Statistiques du jour
    const statsJour = await Promise.all([
      // Chiffre d'affaires du jour
      Ticket.sum('total', {
        where: {
          createdAt: { [Op.between]: [debutJour, finJour] },
          statut: 'payé'
        }
      }),

      // Nombre de commandes du jour
      Commande.count({
        where: {
          createdAt: { [Op.between]: [debutJour, finJour] }
        }
      }),

      // Ticket moyen du jour
      Ticket.findOne({
        attributes: [
          [sequelize.fn('AVG', sequelize.col('total')), 'ticket_moyen']
        ],
        where: {
          createdAt: { [Op.between]: [debutJour, finJour] },
          statut: 'payé'
        }
      }),

      // Articles les plus vendus du jour
      Article.findAll({
        attributes: [
          'id',
          'nom',
          [sequelize.fn('SUM', sequelize.col('Commandes->CommandeArticle.quantite')), 'quantite_vendue']
        ],
        include: [{
          model: Commande,
          attributes: [],
          through: { attributes: [] },
          where: {
            createdAt: { [Op.between]: [debutJour, finJour] }
          }
        }],
        group: ['Article.id'],
        order: [[sequelize.literal('quantite_vendue'), 'DESC']],
        limit: 5
      })
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        chiffre_affaires_jour: statsJour[0] || 0,
        nombre_commandes_jour: statsJour[1] || 0,
        ticket_moyen_jour: statsJour[2]?.dataValues?.ticket_moyen || 0,
        articles_plus_vendus: statsJour[3] || []
      }
    });
  } catch (error) {
    next(error);
  }
};
