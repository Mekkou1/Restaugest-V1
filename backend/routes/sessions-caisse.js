const express = require('express');
const router = express.Router();
const sessionCaisseController = require('../controllers/sessionCaisseController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Middleware d'authentification
router.use(authMiddleware);

// Ouvrir une session de caisse
router.post('/ouvrir', sessionCaisseController.ouvrirSession);

// Fermer une session de caisse
router.put('/:id/fermer', sessionCaisseController.fermerSession);

// Ajouter des fonds à une session
router.post('/:id/fonds', sessionCaisseController.ajouterFonds);

// Lister les sessions
router.get('/', sessionCaisseController.listerSessions);

// Obtenir une session spécifique
router.get('/:id', sessionCaisseController.obtenirSession);

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

// Middleware de validation de session active
const checkActiveSession = async (req, res, next) => {
  const sessionId = req.params.id;
  try {
    const session = await SessionCaisse.findByPk(sessionId);
    if (!session) {
      return res.status(404).json({
        status: 'error',
        message: 'Session non trouvée'
      });
    }
    if (session.date_fermeture) {
      return res.status(400).json({
        status: 'error',
        message: 'Cette session est déjà fermée'
      });
    }
    if (session.caissier_id !== req.user.id && req.user.role !== 'Administrateur') {
      return res.status(403).json({
        status: 'error',
        message: 'Vous n\'êtes pas autorisé à modifier cette session'
      });
    }
    req.session = session;
    next();
  } catch (error) {
    next(error);
  }
};

// Routes nécessitant une session active
router.use('/:id/fonds', checkActiveSession);
router.use('/:id/fermer', checkActiveSession);

// Validation des données
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validation');

// Validation pour l'ouverture de session
router.post('/ouvrir', [
  body('caisse_id').isInt().withMessage('ID de caisse invalide'),
  body('fonds_initial.montant').isFloat({ min: 0 }).withMessage('Montant invalide'),
  body('fonds_initial.devise_id').isInt().withMessage('ID de devise invalide'),
  validate
]);

// Validation pour l'ajout de fonds
router.post('/:id/fonds', [
  param('id').isInt().withMessage('ID de session invalide'),
  body('montant').isFloat({ min: 0 }).withMessage('Montant invalide'),
  body('devise_id').isInt().withMessage('ID de devise invalide'),
  validate
]);

// Validation pour la fermeture de session
router.put('/:id/fermer', [
  param('id').isInt().withMessage('ID de session invalide'),
  body('fonds_final.montant').isFloat({ min: 0 }).withMessage('Montant invalide'),
  body('fonds_final.devise_id').isInt().withMessage('ID de devise invalide'),
  validate
]);

module.exports = router;
