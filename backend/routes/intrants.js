const express = require('express');
const { body, query } = require('express-validator');
const intrantController = require('../controllers/intrantController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const validate = require('../middleware/validation');

const router = express.Router();

// Middleware de protection - toutes les routes nécessitent une authentification
router.use(protect);

// Validation pour la création/mise à jour d'intrant
const intrantValidation = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Le code est requis')
    .isLength({ min: 3, max: 50 })
    .withMessage('Le code doit contenir entre 3 et 50 caractères'),
  body('nom')
    .trim()
    .notEmpty()
    .withMessage('Le nom est requis')
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  body('unite_mesure_id')
    .isInt()
    .withMessage('ID unité de mesure invalide'),
  body('stock_minimum')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Le stock minimum doit être positif'),
  body('stock_maximum')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Le stock maximum doit être positif')
    .custom((value, { req }) => {
      if (req.body.stock_minimum && value <= req.body.stock_minimum) {
        throw new Error('Le stock maximum doit être supérieur au stock minimum');
      }
      return true;
    }),
  body('prix_unitaire')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Le prix unitaire doit être positif'),
  body('suivi_stock')
    .optional()
    .isBoolean()
    .withMessage('Le suivi de stock doit être un booléen'),
  body('stock_initial')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Le stock initial doit être positif')
];

// Validation pour les mouvements de stock
const mouvementStockValidation = [
  body('quantite')
    .isFloat({ min: 0.001 })
    .withMessage('La quantité doit être positive'),
  body('type_mouvement')
    .isIn(['entree', 'sortie', 'ajustement', 'perte'])
    .withMessage('Type de mouvement invalide'),
  body('prix_unitaire')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Le prix unitaire doit être positif'),
  body('reference_document')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La référence ne doit pas dépasser 100 caractères')
];

// Routes principales
router.route('/')
  .get(
    [
      query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Le numéro de page doit être un entier positif'),
      query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('La limite doit être entre 1 et 100')
    ],
    validate,
    intrantController.listerIntrants
  )
  .post(
    restrictTo('Administrateur'),
    intrantValidation,
    validate,
    intrantController.creerIntrant
  );

router.route('/:id')
  .get(intrantController.obtenirIntrant)
  .put(
    restrictTo('Administrateur'),
    intrantValidation,
    validate,
    intrantController.mettreAJourIntrant
  )
  .delete(
    restrictTo('Administrateur'),
    intrantController.supprimerIntrant
  );

// Routes pour les mouvements de stock
router.post(
  '/:id/mouvements',
  restrictTo('Administrateur', 'Cuisinier'),
  mouvementStockValidation,
  validate,
  intrantController.ajouterMouvementStock
);

router.get(
  '/:id/mouvements',
  [
    query('debut')
      .optional()
      .isISO8601()
      .withMessage('Date de début invalide'),
    query('fin')
      .optional()
      .isISO8601()
      .withMessage('Date de fin invalide'),
    query('type')
      .optional()
      .isIn(['entree', 'sortie', 'ajustement', 'perte'])
      .withMessage('Type de mouvement invalide')
  ],
  validate,
  intrantController.listerMouvementsStock
);

// Route pour les alertes de stock
router.get(
  '/alertes/stock',
  restrictTo('Administrateur', 'Cuisinier'),
  intrantController.obtenirAlertesStock
);

// Route pour obtenir les statistiques de stock
router.get(
  '/:id/statistiques',
  [
    query('debut')
      .optional()
      .isISO8601()
      .withMessage('Date de début invalide'),
    query('fin')
      .optional()
      .isISO8601()
      .withMessage('Date de fin invalide')
  ],
  validate,
  intrantController.obtenirStatistiquesStock
);

module.exports = router;
