const { SessionCaisse, Caisse, FondsCaisse, Billetage, Utilisateur, Devise } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

exports.ouvrirSession = async (req, res, next) => {
  try {
    const { caisse_id, fonds_initial, billetage } = req.body;

    // Vérifier la caisse
    const caisse = await Caisse.findByPk(caisse_id);
    if (!caisse) {
      return next(new AppError('Caisse non trouvée', 404));
    }

    // Vérifier si la caisse est déjà ouverte
    if (caisse.etat === 'ouverte') {
      return next(new AppError('Cette caisse est déjà ouverte', 400));
    }

    // Vérifier si l'utilisateur a déjà une session active
    const sessionActive = await SessionCaisse.findOne({
      where: {
        caissier_id: req.user.id,
        date_fermeture: null
      }
    });

    if (sessionActive) {
      return next(new AppError('Vous avez déjà une session de caisse active', 400));
    }

    const transaction = await sequelize.transaction();

    try {
      // Créer la session
      const session = await SessionCaisse.create({
        caisse_id,
        caissier_id: req.user.id,
        date_ouverture: new Date()
      }, { transaction });

      // Enregistrer le fonds initial
      const fondsCaisse = await FondsCaisse.create({
        session_caisse_id: session.id,
        type_operation: 'ouverture',
        devise_id: fonds_initial.devise_id,
        montant: fonds_initial.montant,
        effectue_par: req.user.id,
        notes: 'Fonds initial à l\'ouverture'
      }, { transaction });

      // Enregistrer le billetage si fourni
      if (billetage && billetage.length > 0) {
        await Promise.all(billetage.map(billet => 
          Billetage.create({
            fonds_caisse_id: fondsCaisse.id,
            devise_id: billet.devise_id,
            valeur: billet.valeur,
            quantite: billet.quantite,
            type: billet.type
          }, { transaction })
        ));
      }

      // Mettre à jour l'état de la caisse
      await caisse.update({
        etat: 'ouverte'
      }, { transaction });

      await transaction.commit();

      // Notifier via WebSocket
      req.wsUtils.notifyCaisse.sessionOpened(req.wsUtils, {
        session: {
          id: session.id,
          caisse: caisse.nom
        },
        caissier: {
          id: req.user.id,
          nom: req.user.nom,
          prenom: req.user.prenom
        },
        fonds_initial: {
          montant: fonds_initial.montant,
          devise: fonds_initial.devise_id
        }
      });

      res.status(201).json({
        status: 'success',
        data: {
          session,
          fonds_initial: fondsCaisse,
          billetage
        }
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

exports.fermerSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fonds_final, billetage, notes } = req.body;

    const session = await SessionCaisse.findByPk(id, {
      include: [
        { model: Caisse },
        { 
          model: Utilisateur,
          as: 'caissier',
          attributes: ['id', 'nom', 'prenom']
        }
      ]
    });

    if (!session) {
      return next(new AppError('Session non trouvée', 404));
    }

    if (session.date_fermeture) {
      return next(new AppError('Cette session est déjà fermée', 400));
    }

    // Vérifier que c'est bien le caissier de la session
    if (session.caissier_id !== req.user.id) {
      return next(new AppError('Vous ne pouvez pas fermer cette session', 403));
    }

    const transaction = await sequelize.transaction();

    try {
      // Enregistrer le fonds final
      const fondsCaisse = await FondsCaisse.create({
        session_caisse_id: session.id,
        type_operation: 'fermeture',
        devise_id: fonds_final.devise_id,
        montant: fonds_final.montant,
        effectue_par: req.user.id,
        notes: notes || 'Fonds final à la fermeture'
      }, { transaction });

      // Enregistrer le billetage si fourni
      if (billetage && billetage.length > 0) {
        await Promise.all(billetage.map(billet => 
          Billetage.create({
            fonds_caisse_id: fondsCaisse.id,
            devise_id: billet.devise_id,
            valeur: billet.valeur,
            quantite: billet.quantite,
            type: billet.type
          }, { transaction })
        ));
      }

      // Mettre à jour la session
      await session.update({
        date_fermeture: new Date()
      }, { transaction });

      // Mettre à jour l'état de la caisse
      await session.Caisse.update({
        etat: 'fermee'
      }, { transaction });

      await transaction.commit();

      // Notifier via WebSocket
      req.wsUtils.notifyCaisse.sessionClosed(req.wsUtils, {
        session: {
          id: session.id,
          caisse: session.Caisse.nom
        },
        caissier: {
          id: req.user.id,
          nom: req.user.nom,
          prenom: req.user.prenom
        },
        fonds_final: {
          montant: fonds_final.montant,
          devise: fonds_final.devise_id
        }
      });

      res.status(200).json({
        status: 'success',
        data: {
          session,
          fonds_final: fondsCaisse,
          billetage
        }
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

exports.ajouterFonds = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { montant, devise_id, billetage, notes } = req.body;

    const session = await SessionCaisse.findByPk(id, {
      include: [{ model: Caisse }]
    });

    if (!session) {
      return next(new AppError('Session non trouvée', 404));
    }

    if (session.date_fermeture) {
      return next(new AppError('Cette session est fermée', 400));
    }

    const transaction = await sequelize.transaction();

    try {
      // Enregistrer l'ajout de fonds
      const fondsCaisse = await FondsCaisse.create({
        session_caisse_id: session.id,
        type_operation: 'ajustement',
        devise_id,
        montant,
        effectue_par: req.user.id,
        notes
      }, { transaction });

      // Enregistrer le billetage si fourni
      if (billetage && billetage.length > 0) {
        await Promise.all(billetage.map(billet => 
          Billetage.create({
            fonds_caisse_id: fondsCaisse.id,
            devise_id: billet.devise_id,
            valeur: billet.valeur,
            quantite: billet.quantite,
            type: billet.type
          }, { transaction })
        ));
      }

      await transaction.commit();

      // Notifier via WebSocket
      req.wsUtils.notifyCaisse.fundsAdded(req.wsUtils, {
        session: {
          id: session.id,
          caisse: session.Caisse.nom
        },
        montant,
        devise_id,
        utilisateur: {
          id: req.user.id,
          nom: req.user.nom,
          prenom: req.user.prenom
        }
      });

      res.status(200).json({
        status: 'success',
        data: {
          fonds: fondsCaisse,
          billetage
        }
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

exports.listerSessions = async (req, res, next) => {
  try {
    const { caisse_id, caissier_id, date_debut, date_fin } = req.query;
    const where = {};

    if (caisse_id) where.caisse_id = caisse_id;
    if (caissier_id) where.caissier_id = caissier_id;

    if (date_debut && date_fin) {
      where.date_ouverture = {
        [Op.between]: [new Date(date_debut), new Date(date_fin)]
      };
    }

    const sessions = await SessionCaisse.findAll({
      where,
      include: [
        { model: Caisse },
        { 
          model: Utilisateur,
          as: 'caissier',
          attributes: ['id', 'nom', 'prenom']
        },
        {
          model: FondsCaisse,
          include: [
            { model: Billetage },
            { model: Devise }
          ]
        }
      ],
      order: [['date_ouverture', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: sessions
    });
  } catch (error) {
    next(error);
  }
};

exports.obtenirSession = async (req, res, next) => {
  try {
    const { id } = req.params;

    const session = await SessionCaisse.findByPk(id, {
      include: [
        { model: Caisse },
        { 
          model: Utilisateur,
          as: 'caissier',
          attributes: ['id', 'nom', 'prenom']
        },
        {
          model: FondsCaisse,
          include: [
            { model: Billetage },
            { model: Devise },
            {
              model: Utilisateur,
              as: 'effectuePar',
              attributes: ['id', 'nom', 'prenom']
            }
          ]
        }
      ]
    });

    if (!session) {
      return next(new AppError('Session non trouvée', 404));
    }

    res.status(200).json({
      status: 'success',
      data: session
    });
  } catch (error) {
    next(error);
  }
};
