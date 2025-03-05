const express = require('express');
const router = express.Router();
const etablissementController = require('../controllers/etablissementController');
const { authMiddleware } = require('../middleware/authMiddleware');
const fileUpload = require('express-fileupload');

// Middleware pour gérer les fichiers uploadés
router.use(fileUpload());

// Routes protégées par authentification
router.use(authMiddleware);

// Créer un établissement
router.post('/', etablissementController.creerEtablissement);

// Mettre à jour un établissement
router.put('/:id', etablissementController.mettreAJourEtablissement);

// Obtenir les informations de l'établissement
router.get('/', etablissementController.obtenirEtablissement);

// Supprimer le logo
router.delete('/:id/logo', etablissementController.supprimerLogo);

// Obtenir la configuration
router.get('/configuration', etablissementController.obtenirConfiguration);

// Mettre à jour la configuration
router.put('/configuration', etablissementController.mettreAJourConfiguration);

module.exports = router;
