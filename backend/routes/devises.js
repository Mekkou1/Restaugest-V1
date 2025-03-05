const express = require('express');
const router = express.Router();
const deviseController = require('../controllers/deviseController');
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

// Routes publiques (accessibles à tous les utilisateurs authentifiés)
router.get('/', [
  query('actif').optional().isBoolean().withMessage('Valeur actif invalide'),
  validate
], deviseController.listerDevises);

router.get('/:id', [
  param('id').isInt().withMessage('ID de devise invalide'),
  validate
], deviseController.obtenirDevise);

// Routes protégées (accessibles uniquement aux administrateurs)
router.use(checkRole(['Administrateur']));

// Créer une devise
router.post('/', [
  body('code').isString().isLength({ min: 3, max: 3 }).withMessage('Code devise invalide (3 caractères requis)'),
  body('nom').isString().notEmpty().withMessage('Nom requis'),
  body('symbole').isString().notEmpty().withMessage('Symbole requis'),
  body('taux_change').isFloat({ min: 0 }).withMessage('Taux de change invalide'),
  body('devise_principale').optional().isBoolean(),
  validate
], deviseController.creerDevise);

// Mettre à jour une devise
router.put('/:id', [
  param('id').isInt().withMessage('ID de devise invalide'),
  body('nom').optional().isString().notEmpty().withMessage('Nom invalide'),
  body('symbole').optional().isString().notEmpty().withMessage('Symbole invalide'),
  body('taux_change').optional().isFloat({ min: 0 }).withMessage('Taux de change invalide'),
  body('actif').optional().isBoolean(),
  validate
], deviseController.mettreAJourDevise);

// Changer le taux de change
router.put('/:id/taux', [
  param('id').isInt().withMessage('ID de devise invalide'),
  body('taux_change').isFloat({ min: 0 }).withMessage('Taux de change invalide'),
  body('motif').isString().notEmpty().withMessage('Motif requis'),
  validate
], deviseController.changerTauxChange);

// Obtenir l'historique des taux de change
router.get('/:id/historique', [
  param('id').isInt().withMessage('ID de devise invalide'),
  query('debut').optional().isISO8601().withMessage('Date de début invalide'),
  query('fin').optional().isISO8601().withMessage('Date de fin invalide'),
  validate
], deviseController.obtenirHistoriqueTaux);

// Convertir un montant
router.post('/convertir', [
  body('montant').isFloat({ min: 0 }).withMessage('Montant invalide'),
  body('devise_source_id').isInt().withMessage('ID de devise source invalide'),
  body('devise_cible_id').isInt().withMessage('ID de devise cible invalide'),
  validate
], deviseController.convertirMontant);

// Middleware de validation pour les devises principales
const checkDevisePrincipale = async (req, res, next) => {
  try {
    const devise = await Devise.findByPk(req.params.id);
    if (!devise) {
      return res.status(404).json({
        status: 'error',
        message: 'Devise non trouvée'
      });
    }

    // Empêcher la modification du taux de change de la devise principale
    if (devise.devise_principale && req.path.includes('taux')) {
      return res.status(400).json({
        status: 'error',
        message: 'Le taux de change de la devise principale ne peut pas être modifié'
      });
    }

    // Empêcher la désactivation de la devise principale
    if (devise.devise_principale && req.body.actif === false) {
      return res.status(400).json({
        status: 'error',
        message: 'La devise principale ne peut pas être désactivée'
      });
    }

    req.devise = devise;
    next();
  } catch (error) {
    next(error);
  }
};

// Appliquer la validation de devise principale
router.use('/:id/taux', checkDevisePrincipale);
router.use('/:id', checkDevisePrincipale);

// Validation des taux de change
router.use('/:id/taux', async (req, res, next) => {
  try {
    const { taux_change } = req.body;
    const devise = req.devise;

    // Vérifier que le nouveau taux n'est pas trop différent de l'ancien
    const variation = Math.abs((taux_change - devise.taux_change) / devise.taux_change);
    if (variation > 0.1) { // Plus de 10% de variation
      return res.status(400).json({
        status: 'error',
        message: 'Variation du taux de change trop importante. Veuillez vérifier la valeur.'
      });
    }

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
