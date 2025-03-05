const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validation');

const router = express.Router();

// Validation des données de connexion
const loginValidation = [
  body('pseudo')
    .trim()
    .notEmpty()
    .withMessage('Le pseudo est requis'),
  body('mot_de_passe')
    .trim()
    .notEmpty()
    .withMessage('Le mot de passe est requis')
];

// Validation du changement de mot de passe
const changePasswordValidation = [
  body('mot_de_passe_actuel')
    .trim()
    .notEmpty()
    .withMessage('Le mot de passe actuel est requis'),
  body('nouveau_mot_de_passe')
    .trim()
    .notEmpty()
    .withMessage('Le nouveau mot de passe est requis')
    .isLength({ min: 6 })
    .withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*$/)
    .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre')
];

// Routes publiques
router.post('/login', loginValidation, validate, authController.login);
router.post('/refresh-token', authController.refreshToken);

// Routes protégées
router.use(protect); // Middleware d'authentification pour toutes les routes suivantes

router.post('/logout', authController.logout);
router.patch(
  '/change-password',
  changePasswordValidation,
  validate,
  authController.changePassword
);

// Route pour vérifier si l'utilisateur est authentifié et obtenir ses informations
router.get('/me', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
});

// Route pour vérifier la validité du token
router.get('/check-token', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Token valide'
  });
});

module.exports = router;
