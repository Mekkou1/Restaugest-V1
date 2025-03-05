const { Caisse, Ticket, Utilisateur, MouvementCaisse } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

exports.ouvrirCaisse = async (req, res, next) => {
  try {
    const { fond_initial, notes } = req.body;

    // Vérifier s'il n'y a pas déjà une caisse ouverte
    const caisseOuverte = await Caisse.findOne({
      where: {
        date_fermeture: null
      }
    });

    if (caisseOuverte) {
      return next(new AppError('Une caisse est déjà ouverte', 400));
    }

    // Créer une nouvelle session de caisse
    const caisse = await Caisse.create({
      caissier_id: req.user.id,
      fond_initial,
      solde_theorique: fond_initial,
      notes,
      date_ouverture: new Date()
    });

    // Créer le mouvement d'ouverture
    await MouvementCaisse.create({
      caisse_id: caisse.id,
      type: 'ouverture',
      montant: fond_initial,
      effectue_par: req.user.id,
      notes: 'Ouverture de caisse'
    });

    // Notifier via WebSocket
    req.wsUtils.notifyCaisse.opened(req.wsUtils, {
      caisse: {
        id: caisse.id,
        fond_initial,
        caissier: {
          id: req.user.id,
          nom: req.user.nom,
          prenom: req.user.prenom
        }
      }
    });

    res.status(201).json({
      status: 'success',
      data: caisse
    });
  } catch (error) {
    next(error);
  }
};

exports.fermerCaisse = async (req, res, next) => {
  try {
    const { solde_reel, notes } = req.body;

    // Récupérer la caisse ouverte
    const caisse = await Caisse.findOne({
      where: {
        date_fermeture: null
      }
    });

    if (!caisse) {
      return next(new AppError('Aucune caisse ouverte', 404));
    }

    // Calculer le total des tickets
    const totalTickets = await Ticket.sum('total', {
      where: {
        createdAt: {
          [Op.between]: [caisse.date_ouverture, new Date()]
        },
        statut: 'payé'
      }
    });

    // Calculer le solde théorique
    const soldeTheorique = caisse.fond_initial + totalTickets;

    // Mettre à jour la caisse
    await caisse.update({
      date_fermeture: new Date(),
      solde_theorique: soldeTheorique,
      solde_reel,
      ecart: solde_reel - soldeTheorique,
      notes: notes ? `${caisse.notes}\n${notes}` : caisse.notes
    });

    // Créer le mouvement de fermeture
    await MouvementCaisse.create({
      caisse_id: caisse.id,
      type: 'fermeture',
      montant: solde_reel,
      effectue_par: req.user.id,
      notes: 'Fermeture de caisse'
    });

    // Notifier via WebSocket
    req.wsUtils.notifyCaisse.closed(req.wsUtils, {
      caisse: {
        id: caisse.id,
        solde_theorique: soldeTheorique,
        solde_reel,
        ecart: solde_reel - soldeTheorique
      }
    });

    res.status(200).json({
      status: 'success',
      data: caisse
    });
  } catch (error) {
    next(error);
  }
};

exports.ajouterMouvement = async (req, res, next) => {
  try {
    const { type, montant, notes } = req.body;

    // Vérifier si une caisse est ouverte
    const caisse = await Caisse.findOne({
      where: {
        date_fermeture: null
      }
    });

    if (!caisse) {
      return next(new AppError('Aucune caisse ouverte', 404));
    }

    // Créer le mouvement
    const mouvement = await MouvementCaisse.create({
      caisse_id: caisse.id,
      type,
      montant,
      effectue_par: req.user.id,
      notes
    });

    // Mettre à jour le solde théorique
    const ajustement = type === 'entree' ? montant : -montant;
    await caisse.update({
      solde_theorique: caisse.solde_theorique + ajustement
    });

    // Notifier via WebSocket
    req.wsUtils.notifyCaisse.movement(req.wsUtils, {
      mouvement: {
        id: mouvement.id,
        type,
        montant,
        caisse_id: caisse.id
      }
    });

    res.status(201).json({
      status: 'success',
      data: mouvement
    });
  } catch (error) {
    next(error);
  }
};

exports.obtenirEtatCaisse = async (req, res, next) => {
  try {
    const caisse = await Caisse.findOne({
      where: {
        date_fermeture: null
      },
      include: [
        {
          model: Utilisateur,
          as: 'caissier',
          attributes: ['id', 'nom', 'prenom']
        },
        {
          model: MouvementCaisse,
          include: [
            {
              model: Utilisateur,
              as: 'effectuePar',
              attributes: ['id', 'nom', 'prenom']
            }
          ]
        }
      ]
    });

    if (!caisse) {
      return next(new AppError('Aucune caisse ouverte', 404));
    }

    // Récupérer les tickets de la session
    const tickets = await Ticket.findAll({
      where: {
        createdAt: {
          [Op.between]: [caisse.date_ouverture, new Date()]
        }
      },
      include: [
        {
          model: Utilisateur,
          as: 'caissier',
          attributes: ['id', 'nom', 'prenom']
        }
      ]
    });

    res.status(200).json({
      status: 'success',
      data: {
        caisse,
        tickets
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.listerHistorique = async (req, res, next) => {
  try {
    const { date_debut, date_fin } = req.query;
    const where = {};

    if (date_debut && date_fin) {
      where.date_ouverture = {
        [Op.between]: [new Date(date_debut), new Date(date_fin)]
      };
    }

    const caisses = await Caisse.findAll({
      where,
      include: [
        {
          model: Utilisateur,
          as: 'caissier',
          attributes: ['id', 'nom', 'prenom']
        },
        {
          model: MouvementCaisse,
          include: [
            {
              model: Utilisateur,
              as: 'effectuePar',
              attributes: ['id', 'nom', 'prenom']
            }
          ]
        }
      ],
      order: [['date_ouverture', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: caisses
    });
  } catch (error) {
    next(error);
  }
};
