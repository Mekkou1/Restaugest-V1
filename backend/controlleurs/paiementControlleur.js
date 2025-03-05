const { Paiement, Ticket, ModePaiement, Devise, Avoir } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

exports.creerPaiement = async (req, res, next) => {
  try {
    const { 
      ticket_id, 
      mode_paiement_id, 
      devise_id, 
      montant,
      reference_transaction,
      notes 
    } = req.body;

    // Vérifier le ticket
    const ticket = await Ticket.findByPk(ticket_id);
    if (!ticket) {
      return next(new AppError('Ticket non trouvé', 404));
    }

    // Vérifier le mode de paiement
    const modePaiement = await ModePaiement.findByPk(mode_paiement_id);
    if (!modePaiement) {
      return next(new AppError('Mode de paiement non trouvé', 404));
    }

    // Vérifier la devise
    const devise = await Devise.findByPk(devise_id);
    if (!devise) {
      return next(new AppError('Devise non trouvée', 404));
    }

    // Calculer le montant converti
    const montant_converti = montant * devise.taux_change;

    // Créer le paiement
    const paiement = await Paiement.create({
      ticket_id,
      mode_paiement_id,
      devise_id,
      montant,
      taux_change: devise.taux_change,
      montant_converti,
      reference_transaction,
      statut: 'en_attente',
      notes
    });

    // Vérifier si le ticket est entièrement payé
    const totalPaiements = await Paiement.sum('montant_converti', {
      where: {
        ticket_id,
        statut: { [Op.in]: ['valide', 'en_attente'] }
      }
    });

    if (totalPaiements >= ticket.montant_final) {
      await ticket.update({ statut: 'paye' });
    }

    // Notifier via WebSocket
    req.wsUtils.notifyCaisse.paymentCreated(req.wsUtils, {
      paiement: {
        id: paiement.id,
        montant: paiement.montant,
        devise: devise.code,
        mode: modePaiement.nom
      },
      ticket: {
        id: ticket.id,
        numero: ticket.numero
      }
    });

    res.status(201).json({
      status: 'success',
      data: paiement
    });
  } catch (error) {
    next(error);
  }
};

exports.validerPaiement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reference_validation } = req.body;

    const paiement = await Paiement.findByPk(id, {
      include: [
        { model: Ticket },
        { model: ModePaiement },
        { model: Devise }
      ]
    });

    if (!paiement) {
      return next(new AppError('Paiement non trouvé', 404));
    }

    if (paiement.statut !== 'en_attente') {
      return next(new AppError('Ce paiement ne peut plus être validé', 400));
    }

    // Mettre à jour le paiement
    await paiement.update({
      statut: 'valide',
      reference_validation,
      notes: req.body.notes || paiement.notes
    });

    // Notifier via WebSocket
    req.wsUtils.notifyCaisse.paymentValidated(req.wsUtils, {
      paiement: {
        id: paiement.id,
        montant: paiement.montant,
        devise: paiement.Devise.code,
        mode: paiement.ModePaiement.nom
      },
      ticket: {
        id: paiement.Ticket.id,
        numero: paiement.Ticket.numero
      }
    });

    res.status(200).json({
      status: 'success',
      data: paiement
    });
  } catch (error) {
    next(error);
  }
};

exports.annulerPaiement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { motif } = req.body;

    const paiement = await Paiement.findByPk(id, {
      include: [
        { model: Ticket },
        { model: ModePaiement },
        { model: Devise }
      ]
    });

    if (!paiement) {
      return next(new AppError('Paiement non trouvé', 404));
    }

    if (paiement.statut === 'annule') {
      return next(new AppError('Ce paiement est déjà annulé', 400));
    }

    // Mettre à jour le paiement
    await paiement.update({
      statut: 'annule',
      notes: `${paiement.notes || ''}\nAnnulation: ${motif}`
    });

    // Mettre à jour le statut du ticket si nécessaire
    const ticket = await Ticket.findByPk(paiement.ticket_id);
    const totalPaiementsValides = await Paiement.sum('montant_converti', {
      where: {
        ticket_id: paiement.ticket_id,
        statut: 'valide'
      }
    });

    if (totalPaiementsValides < ticket.montant_final) {
      await ticket.update({ statut: 'en_attente' });
    }

    // Notifier via WebSocket
    req.wsUtils.notifyCaisse.paymentCanceled(req.wsUtils, {
      paiement: {
        id: paiement.id,
        montant: paiement.montant,
        devise: paiement.Devise.code,
        mode: paiement.ModePaiement.nom
      },
      ticket: {
        id: paiement.Ticket.id,
        numero: paiement.Ticket.numero
      },
      motif
    });

    res.status(200).json({
      status: 'success',
      data: paiement
    });
  } catch (error) {
    next(error);
  }
};

exports.creerAvoir = async (req, res, next) => {
  try {
    const {
      ticket_origine_id,
      client_nom,
      client_telephone,
      devise_id,
      montant,
      date_expiration,
      notes
    } = req.body;

    // Vérifier le ticket d'origine
    if (ticket_origine_id) {
      const ticket = await Ticket.findByPk(ticket_origine_id);
      if (!ticket) {
        return next(new AppError('Ticket d\'origine non trouvé', 404));
      }
    }

    // Vérifier la devise
    const devise = await Devise.findByPk(devise_id);
    if (!devise) {
      return next(new AppError('Devise non trouvée', 404));
    }

    // Générer le numéro d'avoir
    const numero = await generateAvoirNumber();

    // Créer l'avoir
    const avoir = await Avoir.create({
      numero,
      ticket_origine_id,
      client_nom,
      client_telephone,
      devise_id,
      montant,
      taux_change: devise.taux_change,
      date_emission: new Date(),
      date_expiration: new Date(date_expiration),
      statut: 'actif',
      emetteur_id: req.user.id,
      notes
    });

    // Notifier via WebSocket
    req.wsUtils.notifyCaisse.voucherCreated(req.wsUtils, {
      avoir: {
        id: avoir.id,
        numero: avoir.numero,
        montant: avoir.montant,
        devise: devise.code
      },
      emetteur: {
        id: req.user.id,
        nom: req.user.nom,
        prenom: req.user.prenom
      }
    });

    res.status(201).json({
      status: 'success',
      data: avoir
    });
  } catch (error) {
    next(error);
  }
};

exports.utiliserAvoir = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ticket_id } = req.body;

    const avoir = await Avoir.findByPk(id);
    if (!avoir) {
      return next(new AppError('Avoir non trouvé', 404));
    }

    if (avoir.statut !== 'actif') {
      return next(new AppError('Cet avoir n\'est plus valide', 400));
    }

    if (avoir.date_expiration < new Date()) {
      return next(new AppError('Cet avoir a expiré', 400));
    }

    const ticket = await Ticket.findByPk(ticket_id);
    if (!ticket) {
      return next(new AppError('Ticket non trouvé', 404));
    }

    // Mettre à jour l'avoir
    await avoir.update({
      statut: 'utilise',
      utilisateur_utilisation_id: req.user.id,
      ticket_utilisation_id: ticket.id,
      date_utilisation: new Date()
    });

    // Notifier via WebSocket
    req.wsUtils.notifyCaisse.voucherUsed(req.wsUtils, {
      avoir: {
        id: avoir.id,
        numero: avoir.numero,
        montant: avoir.montant
      },
      ticket: {
        id: ticket.id,
        numero: ticket.numero
      }
    });

    res.status(200).json({
      status: 'success',
      data: avoir
    });
  } catch (error) {
    next(error);
  }
};

// Fonction utilitaire pour générer un numéro d'avoir unique
async function generateAvoirNumber() {
  const date = new Date();
  const prefix = 'AV' + 
                date.getFullYear().toString().substr(-2) +
                (date.getMonth() + 1).toString().padStart(2, '0') +
                date.getDate().toString().padStart(2, '0');
  
  const lastAvoir = await Avoir.findOne({
    where: {
      numero: {
        [Op.like]: `${prefix}%`
      }
    },
    order: [['numero', 'DESC']]
  });

  const sequence = lastAvoir 
    ? (parseInt(lastAvoir.numero.substr(-4)) + 1).toString().padStart(4, '0')
    : '0001';

  return `${prefix}${sequence}`;
}
