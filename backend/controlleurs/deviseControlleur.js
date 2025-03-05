const { Devise, HistoriqueTauxChange } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

exports.creerDevise = async (req, res, next) => {
  try {
    const { code, nom, symbole, taux_change, devise_principale } = req.body;

    // Vérifier si le code existe déjà
    const deviseExistante = await Devise.findOne({
      where: { code }
    });

    if (deviseExistante) {
      return next(new AppError('Une devise avec ce code existe déjà', 400));
    }

    // Si c'est une devise principale, vérifier qu'il n'en existe pas déjà une
    if (devise_principale) {
      const devisePrincipaleExistante = await Devise.findOne({
        where: { devise_principale: true }
      });

      if (devisePrincipaleExistante) {
        return next(new AppError('Une devise principale existe déjà', 400));
      }
    }

    // Créer la devise
    const devise = await Devise.create({
      code,
      nom,
      symbole,
      taux_change,
      devise_principale: devise_principale || false,
      actif: true
    });

    // Créer l'historique du taux de change
    await HistoriqueTauxChange.create({
      devise_id: devise.id,
      ancien_taux: null,
      nouveau_taux: taux_change,
      utilisateur_id: req.user.id,
      motif: 'Création de la devise'
    });

    // Notifier via WebSocket
    req.wsUtils.notifyAdmin.currencyCreated(req.wsUtils, {
      devise: {
        id: devise.id,
        code: devise.code,
        taux_change: devise.taux_change
      }
    });

    res.status(201).json({
      status: 'success',
      data: devise
    });
  } catch (error) {
    next(error);
  }
};

exports.mettreAJourDevise = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nom, symbole, taux_change, actif } = req.body;

    const devise = await Devise.findByPk(id);
    if (!devise) {
      return next(new AppError('Devise non trouvée', 404));
    }

    // Empêcher la modification du code
    if (req.body.code) {
      return next(new AppError('Le code de la devise ne peut pas être modifié', 400));
    }

    // Empêcher la désactivation de la devise principale
    if (devise.devise_principale && actif === false) {
      return next(new AppError('La devise principale ne peut pas être désactivée', 400));
    }

    // Si le taux change, créer un historique
    if (taux_change && taux_change !== devise.taux_change) {
      await HistoriqueTauxChange.create({
        devise_id: devise.id,
        ancien_taux: devise.taux_change,
        nouveau_taux: taux_change,
        utilisateur_id: req.user.id,
        motif: req.body.motif || 'Mise à jour du taux de change'
      });
    }

    // Mettre à jour la devise
    await devise.update({
      nom,
      symbole,
      taux_change,
      actif
    });

    // Notifier via WebSocket
    req.wsUtils.notifyAdmin.currencyUpdated(req.wsUtils, {
      devise: {
        id: devise.id,
        code: devise.code,
        taux_change: devise.taux_change,
        actif: devise.actif
      }
    });

    res.status(200).json({
      status: 'success',
      data: devise
    });
  } catch (error) {
    next(error);
  }
};

exports.changerTauxChange = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { taux_change, motif } = req.body;

    const devise = await Devise.findByPk(id);
    if (!devise) {
      return next(new AppError('Devise non trouvée', 404));
    }

    // Empêcher la modification du taux de la devise principale
    if (devise.devise_principale) {
      return next(new AppError('Le taux de la devise principale ne peut pas être modifié', 400));
    }

    // Créer l'historique
    await HistoriqueTauxChange.create({
      devise_id: devise.id,
      ancien_taux: devise.taux_change,
      nouveau_taux: taux_change,
      utilisateur_id: req.user.id,
      motif
    });

    // Mettre à jour le taux
    await devise.update({ taux_change });

    // Notifier via WebSocket
    req.wsUtils.notifyAdmin.exchangeRateChanged(req.wsUtils, {
      devise: {
        id: devise.id,
        code: devise.code,
        ancien_taux: devise.taux_change,
        nouveau_taux: taux_change
      },
      utilisateur: {
        id: req.user.id,
        nom: req.user.nom,
        prenom: req.user.prenom
      }
    });

    res.status(200).json({
      status: 'success',
      data: devise
    });
  } catch (error) {
    next(error);
  }
};

exports.listerDevises = async (req, res, next) => {
  try {
    const { actif } = req.query;
    const where = {};

    if (actif !== undefined) {
      where.actif = actif === 'true';
    }

    const devises = await Devise.findAll({
      where,
      order: [
        ['devise_principale', 'DESC'],
        ['code', 'ASC']
      ]
    });

    res.status(200).json({
      status: 'success',
      data: devises
    });
  } catch (error) {
    next(error);
  }
};

exports.obtenirDevise = async (req, res, next) => {
  try {
    const { id } = req.params;

    const devise = await Devise.findByPk(id, {
      include: [{
        model: HistoriqueTauxChange,
        limit: 10,
        order: [['date_changement', 'DESC']],
        include: [{
          model: 'Utilisateur',
          attributes: ['id', 'nom', 'prenom']
        }]
      }]
    });

    if (!devise) {
      return next(new AppError('Devise non trouvée', 404));
    }

    res.status(200).json({
      status: 'success',
      data: devise
    });
  } catch (error) {
    next(error);
  }
};

exports.obtenirHistoriqueTaux = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { debut, fin } = req.query;

    const where = {
      devise_id: id
    };

    if (debut && fin) {
      where.date_changement = {
        [Op.between]: [new Date(debut), new Date(fin)]
      };
    }

    const historique = await HistoriqueTauxChange.findAll({
      where,
      include: [{
        model: 'Utilisateur',
        attributes: ['id', 'nom', 'prenom']
      }],
      order: [['date_changement', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: historique
    });
  } catch (error) {
    next(error);
  }
};

exports.convertirMontant = async (req, res, next) => {
  try {
    const { montant, devise_source_id, devise_cible_id } = req.body;

    const deviseSource = await Devise.findByPk(devise_source_id);
    if (!deviseSource) {
      return next(new AppError('Devise source non trouvée', 404));
    }

    const deviseCible = await Devise.findByPk(devise_cible_id);
    if (!deviseCible) {
      return next(new AppError('Devise cible non trouvée', 404));
    }

    // Convertir vers la devise principale puis vers la devise cible
    const montantPrincipal = montant * deviseSource.taux_change;
    const montantConverti = montantPrincipal / deviseCible.taux_change;

    res.status(200).json({
      status: 'success',
      data: {
        montant_initial: montant,
        devise_source: deviseSource.code,
        montant_converti: montantConverti,
        devise_cible: deviseCible.code,
        taux_change: deviseSource.taux_change / deviseCible.taux_change
      }
    });
  } catch (error) {
    next(error);
  }
};
