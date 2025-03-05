const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
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
router.get('/salles/:salle_id/menu', [
  param('salle_id').isInt().withMessage('ID de salle invalide'),
  validate
], menuController.listerMenus);

// Routes protégées (accessibles uniquement aux administrateurs)
router.use(checkRole(['Administrateur']));

// Créer un menu pour une salle
router.post('/salles/:salle_id/menu', [
  param('salle_id').isInt().withMessage('ID de salle invalide'),
  body('nom').isString().notEmpty().withMessage('Nom requis'),
  body('description').optional().isString(),
  body('categories').optional().isArray(),
  body('categories.*.categorie_id').optional().isInt(),
  body('categories.*.ordre').optional().isInt(),
  body('categories.*.actif').optional().isBoolean(),
  body('date_debut').optional().isISO8601(),
  body('date_fin').optional().isISO8601(),
  validate
], menuController.creerMenuSalle);

// Mettre à jour un menu
router.put('/menus/:id', [
  param('id').isInt().withMessage('ID de menu invalide'),
  body('nom').optional().isString().notEmpty().withMessage('Nom invalide'),
  body('description').optional().isString(),
  body('actif').optional().isBoolean(),
  body('date_debut').optional().isISO8601(),
  body('date_fin').optional().isISO8601(),
  validate
], menuController.mettreAJourMenu);

// Gérer les catégories d'un menu
router.put('/menus/:id/categories', [
  param('id').isInt().withMessage('ID de menu invalide'),
  body('categories').isArray(),
  body('categories.*.categorie_id').isInt(),
  body('categories.*.ordre').optional().isInt(),
  body('categories.*.actif').optional().isBoolean(),
  validate
], menuController.gererCategoriesMenu);

// Définir les prix des articles pour une salle
router.put('/salles/:salle_id/prix', [
  param('salle_id').isInt().withMessage('ID de salle invalide'),
  body('prix').isArray(),
  body('prix.*.article_id').isInt(),
  body('prix.*.devise_id').isInt(),
  body('prix.*.prix_ht').isFloat({ min: 0 }),
  body('prix.*.taux_tva').isFloat({ min: 0 }),
  body('prix.*.actif').optional().isBoolean(),
  body('prix.*.date_debut').optional().isISO8601(),
  body('prix.*.date_fin').optional().isISO8601(),
  validate
], menuController.definirPrixArticles);

// Changer la disponibilité d'un article dans une salle
router.put('/salles/:salle_id/articles/:article_id/disponibilite', [
  param('salle_id').isInt().withMessage('ID de salle invalide'),
  param('article_id').isInt().withMessage('ID d\'article invalide'),
  body('disponible').isBoolean().withMessage('Disponibilité invalide'),
  validate
], menuController.changerDisponibiliteArticle);

// Obtenir les prix des articles pour une salle
router.get('/salles/:salle_id/prix', [
  param('salle_id').isInt().withMessage('ID de salle invalide'),
  query('categorie_id').optional().isInt(),
  query('actif').optional().isBoolean(),
  validate
], menuController.obtenirPrixArticles);

// Middleware de validation des dates
const validateDates = (req, res, next) => {
  const { date_debut, date_fin } = req.body;
  if (date_debut && date_fin && new Date(date_debut) > new Date(date_fin)) {
    return res.status(400).json({
      status: 'error',
      message: 'La date de début doit être antérieure à la date de fin'
    });
  }
  next();
};

// Middleware de validation des prix
const validatePrix = async (req, res, next) => {
  try {
    const { prix } = req.body;
    const { salle_id } = req.params;

    // Vérifier que les articles existent et sont disponibles
    for (const p of prix) {
      const article = await Article.findByPk(p.article_id);
      if (!article) {
        return res.status(404).json({
          status: 'error',
          message: `Article ${p.article_id} non trouvé`
        });
      }
      if (!article.disponible) {
        return res.status(400).json({
          status: 'error',
          message: `L'article ${article.nom} n'est pas disponible`
        });
      }
    }

    // Vérifier que les devises existent
    const deviseIds = [...new Set(prix.map(p => p.devise_id))];
    const devises = await Devise.findAll({
      where: { id: deviseIds }
    });
    if (devises.length !== deviseIds.length) {
      return res.status(404).json({
        status: 'error',
        message: 'Une ou plusieurs devises non trouvées'
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Appliquer les validations
router.use([
  '/salles/:salle_id/menu',
  '/menus/:id'
], validateDates);

router.use('/salles/:salle_id/prix', validatePrix);

// Middleware de validation des catégories
router.use('/menus/:id/categories', async (req, res, next) => {
  try {
    const { categories } = req.body;
    const categorieIds = categories.map(c => c.categorie_id);

    // Vérifier que les catégories existent
    const existingCategories = await CategorieMenu.findAll({
      where: { id: categorieIds }
    });

    if (existingCategories.length !== categorieIds.length) {
      return res.status(404).json({
        status: 'error',
        message: 'Une ou plusieurs catégories non trouvées'
      });
    }

    // Vérifier qu'il n'y a pas de doublons
    if (new Set(categorieIds).size !== categorieIds.length) {
      return res.status(400).json({
        status: 'error',
        message: 'Des catégories sont en double'
      });
    }

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
