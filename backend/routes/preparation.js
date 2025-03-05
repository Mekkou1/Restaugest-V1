const express = require('express');
const router = express.Router();
const preparationController = require('../controllers/preparationController');
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

// Créer une préparation
router.post('/', [
  checkRole(['Cuisinier', 'Administrateur']),
  body('recette_id').isInt().withMessage('ID de recette invalide'),
  body('commande_id').optional().isInt().withMessage('ID de commande invalide'),
  body('quantite').isInt({ min: 1 }).withMessage('Quantité invalide'),
  validate
], preparationController.creerPreparation);

// Démarrer une préparation
router.put('/:id/demarrer', [
  checkRole(['Cuisinier', 'Administrateur']),
  param('id').isInt().withMessage('ID de préparation invalide'),
  validate
], preparationController.demarrerPreparation);

// Terminer une préparation
router.put('/:id/terminer', [
  checkRole(['Cuisinier', 'Administrateur']),
  param('id').isInt().withMessage('ID de préparation invalide'),
  validate
], preparationController.terminerPreparation);

// Annuler une préparation
router.put('/:id/annuler', [
  checkRole(['Cuisinier', 'Administrateur']),
  param('id').isInt().withMessage('ID de préparation invalide'),
  body('motif').isString().notEmpty().withMessage('Motif requis'),
  validate
], preparationController.annulerPreparation);

// Lister les préparations
router.get('/', [
  checkRole(['Cuisinier', 'Administrateur', 'Serveur']),
  query('statut').optional().isIn(['en_attente', 'en_cours', 'terminee', 'annulee'])
    .withMessage('Statut invalide'),
  query('date_debut').optional().isISO8601().withMessage('Date de début invalide'),
  query('date_fin').optional().isISO8601().withMessage('Date de fin invalide'),
  validate
], preparationController.listerPreparations);

// Obtenir une préparation spécifique
router.get('/:id', [
  checkRole(['Cuisinier', 'Administrateur', 'Serveur']),
  param('id').isInt().withMessage('ID de préparation invalide'),
  validate
], preparationController.obtenirPreparation);

// Middleware de validation de l'état de la préparation
const checkPreparationState = (allowedStates) => async (req, res, next) => {
  try {
    const preparation = await Preparation.findByPk(req.params.id);
    if (!preparation) {
      return res.status(404).json({
        status: 'error',
        message: 'Préparation non trouvée'
      });
    }
    if (!allowedStates.includes(preparation.statut)) {
      return res.status(400).json({
        status: 'error',
        message: `Cette préparation ne peut pas être ${req.path.includes('demarrer') ? 'démarrée' : 
                  req.path.includes('terminer') ? 'terminée' : 'annulée'} (statut actuel : ${preparation.statut})`
      });
    }
    req.preparation = preparation;
    next();
  } catch (error) {
    next(error);
  }
};

// Appliquer les validations d'état
router.use('/:id/demarrer', checkPreparationState(['en_attente']));
router.use('/:id/terminer', checkPreparationState(['en_cours']));
router.use('/:id/annuler', checkPreparationState(['en_attente', 'en_cours']));

// Validation des permissions sur les préparations
router.use('/:id', async (req, res, next) => {
  try {
    const preparation = await Preparation.findByPk(req.params.id);
    if (!preparation) {
      return res.status(404).json({
        status: 'error',
        message: 'Préparation non trouvée'
      });
    }
    
    // Seul le cuisinier assigné ou un admin peut modifier la préparation
    if (req.method !== 'GET' && 
        preparation.preparee_par !== req.user.id && 
        req.user.role !== 'Administrateur') {
      return res.status(403).json({
        status: 'error',
        message: 'Vous n\'êtes pas autorisé à modifier cette préparation'
      });
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
