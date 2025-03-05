const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validation');
const { query } = require('express-validator');

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

// Validation des dates
const validateDates = [
  query('debut').optional().isISO8601().withMessage('Date de début invalide'),
  query('fin').optional().isISO8601().withMessage('Date de fin invalide'),
  (req, res, next) => {
    const { debut, fin } = req.query;
    if (debut && fin && new Date(debut) > new Date(fin)) {
      return res.status(400).json({
        status: 'error',
        message: 'La date de début doit être antérieure à la date de fin'
      });
    }
    next();
  },
  validate
];

// Obtenir le chiffre d'affaires
router.get('/chiffre-affaires', [
  ...validateDates,
  query('periode').optional().isIn(['jour', 'semaine', 'mois'])
    .withMessage('Période invalide (jour, semaine, mois)'),
  validate
], statsController.getChiffreAffaires);

// Obtenir les statistiques des articles
router.get('/articles', [
  ...validateDates,
  validate
], statsController.getStatsArticles);

// Obtenir les statistiques des serveurs
router.get('/serveurs', [
  ...validateDates,
  validate
], statsController.getStatsServeurs);

// Obtenir les statistiques des tables
router.get('/tables', [
  ...validateDates,
  validate
], statsController.getStatsTables);

// Obtenir les statistiques de caisse
router.get('/caisse', [
  ...validateDates,
  validate
], statsController.getStatsCaisse);

// Obtenir les statistiques du tableau de bord
router.get('/dashboard', statsController.getDashboardStats);

// Middleware de validation de la période
const validatePeriode = async (req, res, next) => {
  try {
    const { debut, fin } = req.query;
    
    // Si les dates ne sont pas fournies, utiliser la journée en cours
    if (!debut && !fin) {
      const now = new Date();
      req.query.debut = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      req.query.fin = new Date(now.setHours(23, 59, 59, 999)).toISOString();
    }
    // Si une seule date est fournie, utiliser la même pour début et fin
    else if (!fin) {
      req.query.fin = req.query.debut;
    }
    else if (!debut) {
      req.query.debut = req.query.fin;
    }

    // Limiter la période à 1 an maximum
    const debutDate = new Date(req.query.debut);
    const finDate = new Date(req.query.fin);
    const diffYears = (finDate - debutDate) / (1000 * 60 * 60 * 24 * 365);

    if (diffYears > 1) {
      return res.status(400).json({
        status: 'error',
        message: 'La période ne peut pas dépasser 1 an'
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Appliquer la validation de période à toutes les routes avec dates
router.use(['/chiffre-affaires', '/articles', '/serveurs', '/tables', '/caisse'], validatePeriode);

// Middleware de cache pour les statistiques
const cacheMiddleware = (duration) => {
  const cache = new Map();
  
  return (req, res, next) => {
    const key = `${req.originalUrl || req.url}-${JSON.stringify(req.query)}`;
    const cachedResponse = cache.get(key);

    if (cachedResponse && Date.now() - cachedResponse.timestamp < duration) {
      return res.json(cachedResponse.data);
    }

    res.sendResponse = res.json;
    res.json = (body) => {
      cache.set(key, {
        data: body,
        timestamp: Date.now()
      });
      res.sendResponse(body);
    };
    next();
  };
};

// Appliquer le cache aux routes appropriées
router.use('/dashboard', cacheMiddleware(5 * 60 * 1000)); // Cache de 5 minutes
router.use(['/articles', '/serveurs', '/tables'], cacheMiddleware(15 * 60 * 1000)); // Cache de 15 minutes

// Middleware de validation des permissions
router.use((req, res, next) => {
  // Les administrateurs ont accès à toutes les statistiques
  if (req.user.role === 'Administrateur') {
    return next();
  }

  // Les caissiers ont accès uniquement aux statistiques de caisse et au tableau de bord
  if (req.user.role === 'Caissier') {
    if (req.path.includes('/caisse') || req.path.includes('/dashboard')) {
      return next();
    }
  }

  return res.status(403).json({
    status: 'error',
    message: 'Accès non autorisé à ces statistiques'
  });
});

module.exports = router;
