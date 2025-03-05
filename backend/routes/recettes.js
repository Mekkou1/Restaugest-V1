const express = require('express');
const { body } = require('express-validator');
const recetteController = require('../controllers/recetteController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const validate = require('../middleware/validation');

const router = express.Router();

// Middleware de protection - toutes les routes nécessitent une authentification
router.use(protect);

// Validation pour la création/mise à jour de recette
const recetteValidation = [
  body('article_id')
    .isInt()
    .withMessage('ID article invalide'),
  body('nom')
    .trim()
    .notEmpty()
    .withMessage('Le nom est requis')
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  body('nombre_portions')
    .isInt({ min: 1 })
    .withMessage('Le nombre de portions doit être supérieur à 0'),
  body('temps_preparation')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Le temps de préparation doit être positif'),
  body('ingredients')
    .isArray()
    .withMessage('Les ingrédients doivent être un tableau')
    .notEmpty()
    .withMessage('Au moins un ingrédient est requis'),
  body('ingredients.*.intrant_id')
    .isInt()
    .withMessage('ID intrant invalide'),
  body('ingredients.*.quantite')
    .isFloat({ min: 0 })
    .withMessage('La quantité doit être positive'),
  body('ingredients.*.unite_mesure_id')
    .optional()
    .isInt()
    .withMessage('ID unité de mesure invalide')
];

// Routes pour les recettes
router.route('/')
  .post(
    restrictTo('Administrateur', 'Cuisinier'),
    recetteValidation,
    validate,
    recetteController.creerRecette
  );

router.route('/:id')
  .get(recetteController.obtenirRecette)
  .put(
    restrictTo('Administrateur', 'Cuisinier'),
    recetteValidation,
    validate,
    recetteController.mettreAJourRecette
  )
  .delete(
    restrictTo('Administrateur'),
    recetteController.supprimerRecette
  );

// Route pour vérifier la disponibilité des ingrédients
router.get(
  '/:id/disponibilite',
  recetteController.verifierDisponibiliteIngredients
);

// Route pour préparer une recette (déduire les ingrédients)
router.post(
  '/:id/preparer',
  restrictTo('Administrateur', 'Cuisinier'),
  [
    body('quantite')
      .optional()
      .isInt({ min: 1 })
      .withMessage('La quantité doit être un entier positif')
  ],
  validate,
  recetteController.preparerRecette
);

module.exports = router;
