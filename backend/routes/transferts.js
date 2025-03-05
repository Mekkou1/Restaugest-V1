const express = require('express');
const router = express.Router();
const transfertController = require('../controllers/transfertController');
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

// Créer un transfert
router.post('/', [
  body('caisse_source_id').isInt().withMessage('ID de caisse source invalide'),
  body('caisse_destination_id').isInt().withMessage('ID de caisse destination invalide'),
  body('devise_id').isInt().withMessage('ID de devise invalide'),
  body('montant').isFloat({ min: 0 }).withMessage('Montant invalide'),
  body('motif').isString().notEmpty().withMessage('Motif requis'),
  validate
], transfertController.creerTransfert);

// Valider un transfert
router.put('/:id/valider', [
  param('id').isInt().withMessage('ID de transfert invalide'),
  body('notes').optional().isString(),
  validate
], transfertController.validerTransfert);

// Refuser un transfert
router.put('/:id/refuser', [
  param('id').isInt().withMessage('ID de transfert invalide'),
  body('motif').isString().notEmpty().withMessage('Motif de refus requis'),
  validate
], transfertController.refuserTransfert);

// Annuler un transfert
router.put('/:id/annuler', [
  param('id').isInt().withMessage('ID de transfert invalide'),
  body('motif').isString().notEmpty().withMessage('Motif d\'annulation requis'),
  validate
], transfertController.annulerTransfert);

// Lister les transferts
router.get('/', [
  query('statut').optional().isIn(['en_attente', 'valide', 'refuse', 'annule'])
    .withMessage('Statut invalide'),
  query('caisse_id').optional().isInt().withMessage('ID de caisse invalide'),
  query('date_debut').optional().isISO8601().withMessage('Date de début invalide'),
  query('date_fin').optional().isISO8601().withMessage('Date de fin invalide'),
  validate
], transfertController.listerTransferts);

// Obtenir un transfert spécifique
router.get('/:id', [
  param('id').isInt().withMessage('ID de transfert invalide'),
  validate
], transfertController.obtenirTransfert);

// Middleware de validation de l'état du transfert
const checkTransfertState = (allowedStates) => async (req, res, next) => {
  try {
    const transfert = await TransfertCaisse.findByPk(req.params.id);
    if (!transfert) {
      return res.status(404).json({
        status: 'error',
        message: 'Transfert non trouvé'
      });
    }
    if (!allowedStates.includes(transfert.statut)) {
      return res.status(400).json({
        status: 'error',
        message: `Ce transfert ne peut pas être ${req.path.includes('valider') ? 'validé' : 
                  req.path.includes('refuser') ? 'refusé' : 'annulé'} (statut actuel : ${transfert.statut})`
      });
    }
    req.transfert = transfert;
    next();
  } catch (error) {
    next(error);
  }
};

// Appliquer les validations d'état
router.use('/:id/valider', checkTransfertState(['en_attente']));
router.use('/:id/refuser', checkTransfertState(['en_attente']));
router.use('/:id/annuler', checkTransfertState(['en_attente']));

// Validation des permissions sur les transferts
router.use('/:id', async (req, res, next) => {
  try {
    const transfert = await TransfertCaisse.findByPk(req.params.id);
    if (!transfert) {
      return res.status(404).json({
        status: 'error',
        message: 'Transfert non trouvé'
      });
    }

    // Seul l'initiateur peut annuler le transfert
    if (req.path.includes('annuler') && 
        transfert.initiateur_id !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Seul l\'initiateur peut annuler le transfert'
      });
    }

    // L'initiateur ne peut pas valider son propre transfert
    if (req.path.includes('valider') && 
        transfert.initiateur_id === req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'L\'initiateur ne peut pas valider son propre transfert'
      });
    }

    // Vérifier les permissions sur les caisses
    if (req.user.role !== 'Administrateur') {
      const caisse = await Caisse.findOne({
        where: {
          id: {
            [Op.in]: [transfert.caisse_source_id, transfert.caisse_destination_id]
          },
          etat: 'ouverte'
        },
        include: [{
          model: SessionCaisse,
          where: {
            caissier_id: req.user.id,
            date_fermeture: null
          },
          required: true
        }]
      });

      if (!caisse) {
        return res.status(403).json({
          status: 'error',
          message: 'Vous n\'avez pas les permissions nécessaires sur les caisses concernées'
        });
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
