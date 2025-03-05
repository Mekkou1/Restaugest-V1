const { TransfertCaisse, Caisse, Devise, Utilisateur } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

exports.creerTransfert = async (req, res, next) => {
  try {
    const { 
      caisse_source_id, 
      caisse_destination_id, 
      devise_id, 
      montant,
      motif 
    } = req.body;

    // Vérifier les caisses
    const caisseSource = await Caisse.findByPk(caisse_source_id);
    if (!caisseSource) {
      return next(new AppError('Caisse source non trouvée', 404));
    }

    const caisseDestination = await Caisse.findByPk(caisse_destination_id);
    if (!caisseDestination) {
      return next(new AppError('Caisse destination non trouvée', 404));
    }

    // Vérifier que les caisses sont différentes
    if (caisse_source_id === caisse_destination_id) {
      return next(new AppError('Les caisses source et destination doivent être différentes', 400));
    }

    // Vérifier la devise
    const devise = await Devise.findByPk(devise_id);
    if (!devise) {
      return next(new AppError('Devise non trouvée', 404));
    }

    // Créer le transfert
    const transfert = await TransfertCaisse.create({
      caisse_source_id,
      caisse_destination_id,
      devise_id,
      montant,
      taux_change: devise.taux_change,
      statut: 'en_attente',
      initiateur_id: req.user.id,
      date_initiation: new Date(),
      motif
    });

    // Notifier via WebSocket
    req.wsUtils.notifyCaisse.transferCreated(req.wsUtils, {
      transfert: {
        id: transfert.id,
        montant: transfert.montant,
        devise: devise.code
      },
      source: caisseSource.nom,
      destination: caisseDestination.nom,
      initiateur: {
        id: req.user.id,
        nom: req.user.nom,
        prenom: req.user.prenom
      }
    });

    res.status(201).json({
      status: 'success',
      data: transfert
    });
  } catch (error) {
    next(error);
  }
};

exports.validerTransfert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const transfert = await TransfertCaisse.findByPk(id, {
      include: [
        { model: Caisse, as: 'caisseSource' },
        { model: Caisse, as: 'caisseDestination' },
        { model: Devise },
        { 
          model: Utilisateur,
          as: 'initiateur',
          attributes: ['id', 'nom', 'prenom']
        }
      ]
    });

    if (!transfert) {
      return next(new AppError('Transfert non trouvé', 404));
    }

    if (transfert.statut !== 'en_attente') {
      return next(new AppError('Ce transfert ne peut plus être validé', 400));
    }

    // Vérifier que le validateur est différent de l'initiateur
    if (transfert.initiateur_id === req.user.id) {
      return next(new AppError('L\'initiateur ne peut pas valider son propre transfert', 400));
    }

    // Mettre à jour le transfert
    await transfert.update({
      statut: 'valide',
      validateur_id: req.user.id,
      date_validation: new Date(),
      notes: notes || transfert.notes
    });

    // Notifier via WebSocket
    req.wsUtils.notifyCaisse.transferValidated(req.wsUtils, {
      transfert: {
        id: transfert.id,
        montant: transfert.montant,
        devise: transfert.Devise.code
      },
      source: transfert.caisseSource.nom,
      destination: transfert.caisseDestination.nom,
      validateur: {
        id: req.user.id,
        nom: req.user.nom,
        prenom: req.user.prenom
      }
    });

    res.status(200).json({
      status: 'success',
      data: transfert
    });
  } catch (error) {
    next(error);
  }
};

exports.refuserTransfert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { motif } = req.body;

    const transfert = await TransfertCaisse.findByPk(id, {
      include: [
        { model: Caisse, as: 'caisseSource' },
        { model: Caisse, as: 'caisseDestination' },
        { model: Devise },
        { 
          model: Utilisateur,
          as: 'initiateur',
          attributes: ['id', 'nom', 'prenom']
        }
      ]
    });

    if (!transfert) {
      return next(new AppError('Transfert non trouvé', 404));
    }

    if (transfert.statut !== 'en_attente') {
      return next(new AppError('Ce transfert ne peut plus être refusé', 400));
    }

    // Mettre à jour le transfert
    await transfert.update({
      statut: 'refuse',
      validateur_id: req.user.id,
      date_validation: new Date(),
      notes: `${transfert.notes || ''}\nRefus: ${motif}`
    });

    // Notifier via WebSocket
    req.wsUtils.notifyCaisse.transferRejected(req.wsUtils, {
      transfert: {
        id: transfert.id,
        montant: transfert.montant,
        devise: transfert.Devise.code
      },
      source: transfert.caisseSource.nom,
      destination: transfert.caisseDestination.nom,
      validateur: {
        id: req.user.id,
        nom: req.user.nom,
        prenom: req.user.prenom
      },
      motif
    });

    res.status(200).json({
      status: 'success',
      data: transfert
    });
  } catch (error) {
    next(error);
  }
};

exports.annulerTransfert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { motif } = req.body;

    const transfert = await TransfertCaisse.findByPk(id, {
      include: [
        { model: Caisse, as: 'caisseSource' },
        { model: Caisse, as: 'caisseDestination' },
        { model: Devise }
      ]
    });

    if (!transfert) {
      return next(new AppError('Transfert non trouvé', 404));
    }

    if (transfert.statut !== 'en_attente') {
      return next(new AppError('Ce transfert ne peut plus être annulé', 400));
    }

    // Vérifier que seul l'initiateur peut annuler
    if (transfert.initiateur_id !== req.user.id) {
      return next(new AppError('Seul l\'initiateur peut annuler le transfert', 403));
    }

    // Mettre à jour le transfert
    await transfert.update({
      statut: 'annule',
      notes: `${transfert.notes || ''}\nAnnulation: ${motif}`
    });

    // Notifier via WebSocket
    req.wsUtils.notifyCaisse.transferCanceled(req.wsUtils, {
      transfert: {
        id: transfert.id,
        montant: transfert.montant,
        devise: transfert.Devise.code
      },
      source: transfert.caisseSource.nom,
      destination: transfert.caisseDestination.nom,
      motif
    });

    res.status(200).json({
      status: 'success',
      data: transfert
    });
  } catch (error) {
    next(error);
  }
};

exports.listerTransferts = async (req, res, next) => {
  try {
    const { 
      statut, 
      caisse_id, 
      date_debut, 
      date_fin 
    } = req.query;

    const where = {};

    if (statut) {
      where.statut = statut;
    }

    if (date_debut && date_fin) {
      where.date_initiation = {
        [Op.between]: [new Date(date_debut), new Date(date_fin)]
      };
    }

    if (caisse_id) {
      where[Op.or] = [
        { caisse_source_id: caisse_id },
        { caisse_destination_id: caisse_id }
      ];
    }

    const transferts = await TransfertCaisse.findAll({
      where,
      include: [
        { model: Caisse, as: 'caisseSource' },
        { model: Caisse, as: 'caisseDestination' },
        { model: Devise },
        { 
          model: Utilisateur,
          as: 'initiateur',
          attributes: ['id', 'nom', 'prenom']
        },
        { 
          model: Utilisateur,
          as: 'validateur',
          attributes: ['id', 'nom', 'prenom']
        }
      ],
      order: [['date_initiation', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: transferts
    });
  } catch (error) {
    next(error);
  }
};

exports.obtenirTransfert = async (req, res, next) => {
  try {
    const { id } = req.params;

    const transfert = await TransfertCaisse.findByPk(id, {
      include: [
        { model: Caisse, as: 'caisseSource' },
        { model: Caisse, as: 'caisseDestination' },
        { model: Devise },
        { 
          model: Utilisateur,
          as: 'initiateur',
          attributes: ['id', 'nom', 'prenom']
        },
        { 
          model: Utilisateur,
          as: 'validateur',
          attributes: ['id', 'nom', 'prenom']
        }
      ]
    });

    if (!transfert) {
      return next(new AppError('Transfert non trouvé', 404));
    }

    res.status(200).json({
      status: 'success',
      data: transfert
    });
  } catch (error) {
    next(error);
  }
};
