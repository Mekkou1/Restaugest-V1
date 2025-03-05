const { Etablissement, Salle } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const fs = require('fs').promises;
const path = require('path');

exports.creerEtablissement = async (req, res, next) => {
  try {
    const { nom, adresse, telephone, email, siret, tva_intra } = req.body;
    let logo_url = null;

    // Vérifier si un établissement existe déjà
    const etablissementExistant = await Etablissement.count();
    if (etablissementExistant > 0) {
      return next(new AppError('Un établissement existe déjà', 400));
    }

    // Traiter le logo si présent
    if (req.files && req.files.logo) {
      const logo = req.files.logo;
      const fileName = `logo_${Date.now()}${path.extname(logo.name)}`;
      const uploadPath = path.join(__dirname, '../uploads', fileName);
      
      await logo.mv(uploadPath);
      logo_url = `/uploads/${fileName}`;
    }

    // Créer l'établissement
    const etablissement = await Etablissement.create({
      nom,
      adresse,
      telephone,
      email,
      logo_url,
      siret,
      tva_intra
    });

    // Notifier via WebSocket
    req.wsUtils.notifyAdmin.establishmentCreated(req.wsUtils, {
      etablissement: {
        id: etablissement.id,
        nom: etablissement.nom
      }
    });

    res.status(201).json({
      status: 'success',
      data: etablissement
    });
  } catch (error) {
    next(error);
  }
};

exports.mettreAJourEtablissement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nom, adresse, telephone, email, siret, tva_intra } = req.body;
    let logo_url;

    const etablissement = await Etablissement.findByPk(id);
    if (!etablissement) {
      return next(new AppError('Établissement non trouvé', 404));
    }

    // Traiter le logo si présent
    if (req.files && req.files.logo) {
      // Supprimer l'ancien logo s'il existe
      if (etablissement.logo_url) {
        const oldLogoPath = path.join(__dirname, '..', etablissement.logo_url);
        try {
          await fs.unlink(oldLogoPath);
        } catch (error) {
          logger.warn(`Impossible de supprimer l'ancien logo: ${error.message}`);
        }
      }

      const logo = req.files.logo;
      const fileName = `logo_${Date.now()}${path.extname(logo.name)}`;
      const uploadPath = path.join(__dirname, '../uploads', fileName);
      
      await logo.mv(uploadPath);
      logo_url = `/uploads/${fileName}`;
    }

    // Mettre à jour l'établissement
    await etablissement.update({
      nom,
      adresse,
      telephone,
      email,
      logo_url: logo_url || etablissement.logo_url,
      siret,
      tva_intra
    });

    // Notifier via WebSocket
    req.wsUtils.notifyAdmin.establishmentUpdated(req.wsUtils, {
      etablissement: {
        id: etablissement.id,
        nom: etablissement.nom
      }
    });

    res.status(200).json({
      status: 'success',
      data: etablissement
    });
  } catch (error) {
    next(error);
  }
};

exports.obtenirEtablissement = async (req, res, next) => {
  try {
    const etablissement = await Etablissement.findOne({
      include: [{
        model: Salle,
        attributes: ['id', 'nom', 'capacite', 'etage', 'etat']
      }]
    });

    if (!etablissement) {
      return next(new AppError('Aucun établissement trouvé', 404));
    }

    res.status(200).json({
      status: 'success',
      data: etablissement
    });
  } catch (error) {
    next(error);
  }
};

exports.supprimerLogo = async (req, res, next) => {
  try {
    const { id } = req.params;

    const etablissement = await Etablissement.findByPk(id);
    if (!etablissement) {
      return next(new AppError('Établissement non trouvé', 404));
    }

    if (!etablissement.logo_url) {
      return next(new AppError('Aucun logo à supprimer', 400));
    }

    // Supprimer le fichier
    const logoPath = path.join(__dirname, '..', etablissement.logo_url);
    try {
      await fs.unlink(logoPath);
    } catch (error) {
      logger.warn(`Impossible de supprimer le logo: ${error.message}`);
    }

    // Mettre à jour l'établissement
    await etablissement.update({
      logo_url: null
    });

    // Notifier via WebSocket
    req.wsUtils.notifyAdmin.establishmentLogoRemoved(req.wsUtils, {
      etablissement: {
        id: etablissement.id,
        nom: etablissement.nom
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Logo supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

exports.obtenirConfiguration = async (req, res, next) => {
  try {
    const etablissement = await Etablissement.findOne();
    if (!etablissement) {
      return next(new AppError('Aucun établissement trouvé', 404));
    }

    // Récupérer les configurations système
    const configuration = {
      etablissement: {
        id: etablissement.id,
        nom: etablissement.nom,
        adresse: etablissement.adresse,
        telephone: etablissement.telephone,
        email: etablissement.email,
        logo_url: etablissement.logo_url,
        siret: etablissement.siret,
        tva_intra: etablissement.tva_intra
      },
      systeme: {
        version: process.env.APP_VERSION || '1.0.0',
        environnement: process.env.NODE_ENV || 'development',
        timezone: process.env.TZ || 'UTC',
        devise_principale: process.env.DEVISE_PRINCIPALE || 'XOF',
        tva_defaut: process.env.TVA_DEFAUT || 18
      }
    };

    res.status(200).json({
      status: 'success',
      data: configuration
    });
  } catch (error) {
    next(error);
  }
};

exports.mettreAJourConfiguration = async (req, res, next) => {
  try {
    const { systeme } = req.body;

    // Vérifier les permissions
    if (req.user.role !== 'Administrateur') {
      return next(new AppError('Non autorisé', 403));
    }

    // Mettre à jour les variables d'environnement
    // Note: Dans un environnement de production, cela devrait être fait différemment
    if (systeme) {
      Object.keys(systeme).forEach(key => {
        process.env[key.toUpperCase()] = systeme[key];
      });
    }

    // Notifier via WebSocket
    req.wsUtils.notifyAdmin.configurationUpdated(req.wsUtils, {
      admin: {
        id: req.user.id,
        nom: req.user.nom,
        prenom: req.user.prenom
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Configuration mise à jour avec succès'
    });
  } catch (error) {
    next(error);
  }
};
