const express = require('express');
const router = express.Router();
const paiementController = require('../controllers/paiementController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validation');
const { body, param, query } = require('express-validator');

// Middleware d'authentification
router.use(authMiddleware);

// Middleware de validation des rôles
const checkRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      status: 'error',
      message: 'Non autorisé - rôle requis : ' + roles.join(' ou ')
    });
  }
  next();
};

// Routes protégées par rôle
router.use(checkRole(['Administrateur', 'Caissier']));

// Créer un paiement
router.post('/', [
  body('ticket_id').isInt().withMessage('ID de ticket invalide'),
  body('mode_paiement_id').isInt().withMessage('ID de mode de paiement invalide'),
  body('devise_id').isInt().withMessage('ID de devise invalide'),
  body('montant').isFloat({ min: 0 }).withMessage('Montant invalide'),
  body('reference_transaction').optional().isString(),
  validate
], paiementController.creerPaiement);

// Valider un paiement
router.put('/:id/valider', [
  param('id').isInt().withMessage('ID de paiement invalide'),
  body('reference_validation').optional().isString(),
  validate
], paiementController.validerPaiement);

// Annuler un paiement
router.put('/:id/annuler', [
  param('id').isInt().withMessage('ID de paiement invalide'),
  body('motif').isString().notEmpty().withMessage('Motif d\'annulation requis'),
  validate
], paiementController.annulerPaiement);

// Créer un avoir
router.post('/avoirs', [
  body('ticket_origine_id').optional().isInt().withMessage('ID de ticket invalide'),
  body('client_nom').optional().isString(),
  body('client_telephone').optional().isString(),
  body('devise_id').isInt().withMessage('ID de devise invalide'),
  body('montant').isFloat({ min: 0 }).withMessage('Montant invalide'),
  body('date_expiration').isISO8601().withMessage('Date d\'expiration invalide'),
  validate
], paiementController.creerAvoir);

// Utiliser un avoir
router.put('/avoirs/:id/utiliser', [
  param('id').isInt().withMessage('ID d\'avoir invalide'),
  body('ticket_id').isInt().withMessage('ID de ticket invalide'),
  validate
], paiementController.utiliserAvoir);

// Middleware de validation de l'état du paiement
const checkPaiementState = (allowedStates) => async (req, res, next) => {
  try {
    const paiement = await Paiement.findByPk(req.params.id);
    if (!paiement) {
      return res.status(404).json({
        status: 'error',
        message: 'Paiement non trouvé'
      });
    }
    if (!allowedStates.includes(paiement.statut)) {
      return res.status(400).json({
        status: 'error',
        message: `Ce paiement ne peut pas être ${req.path.includes('valider') ? 'validé' : 'annulé'} (statut actuel : ${paiement.statut})`
      });
    }
    req.paiement = paiement;
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware de validation de l'état de l'avoir
const checkAvoirState = async (req, res, next) => {
  try {
    const avoir = await Avoir.findByPk(req.params.id);
    if (!avoir) {
      return res.status(404).json({
        status: 'error',
        message: 'Avoir non trouvé'
      });
    }
    if (avoir.statut !== 'actif') {
      return res.status(400).json({
        status: 'error',
        message: 'Cet avoir n\'est plus valide'
      });
    }
    if (avoir.date_expiration < new Date()) {
      return res.status(400).json({
        status: 'error',
        message: 'Cet avoir a expiré'
      });
    }
    req.avoir = avoir;
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware de validation du montant du paiement
const validatePaiementMontant = async (req, res, next) => {
  try {
    const ticket = await Ticket.findByPk(req.body.ticket_id);
    if (!ticket) {
      return res.status(404).json({
        status: 'error',
        message: 'Ticket non trouvé'
      });
    }

    // Calculer le total déjà payé
    const totalPaiements = await Paiement.sum('montant_converti', {
      where: {
        ticket_id: ticket.id,
        statut: { [Op.in]: ['valide', 'en_attente'] }
      }
    });

    // Convertir le nouveau montant dans la devise principale
    const devise = await Devise.findByPk(req.body.devise_id);
    const montantConverti = req.body.montant * devise.taux_change;

    // Vérifier si le total ne dépasse pas le montant du ticket
    if (totalPaiements + montantConverti > ticket.montant_final) {
      return res.status(400).json({
        status: 'error',
        message: 'Le montant total des paiements dépasse le montant du ticket'
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Appliquer les validations
router.use('/', validatePaiementMontant);
router.use('/:id/valider', checkPaiementState(['en_attente']));
router.use('/:id/annuler', checkPaiementState(['en_attente', 'valide']));
router.use('/avoirs/:id/utiliser', checkAvoirState);

module.exports = router;
