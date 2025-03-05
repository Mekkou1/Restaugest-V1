const { Utilisateur, Session } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

exports.creerUtilisateur = async (req, res, next) => {
  try {
    const { pseudo, mot_de_passe, nom, prenom, email, role } = req.body;

    // Vérifier si le pseudo existe déjà
    const utilisateurExistant = await Utilisateur.findOne({
      where: {
        [Op.or]: [{ pseudo }, { email }]
      }
    });

    if (utilisateurExistant) {
      return next(new AppError('Pseudo ou email déjà utilisé', 400));
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(mot_de_passe, salt);

    // Créer l'utilisateur
    const utilisateur = await Utilisateur.create({
      pseudo,
      mot_de_passe: hashedPassword,
      nom,
      prenom,
      email,
      role,
      etat: 'Actif',
      created_at: new Date(),
      updated_at: new Date()
    });

    // Notifier via WebSocket
    req.wsUtils.notifyAdmin.userCreated(req.wsUtils, {
      utilisateur: {
        id: utilisateur.id,
        pseudo: utilisateur.pseudo,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        role: utilisateur.role
      }
    });

    res.status(201).json({
      status: 'success',
      data: {
        id: utilisateur.id,
        pseudo: utilisateur.pseudo,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role: utilisateur.role,
        etat: utilisateur.etat
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.mettreAJourUtilisateur = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nom, prenom, email, role, etat } = req.body;

    const utilisateur = await Utilisateur.findByPk(id);
    if (!utilisateur) {
      return next(new AppError('Utilisateur non trouvé', 404));
    }

    // Vérifier si l'email est déjà utilisé
    if (email && email !== utilisateur.email) {
      const emailExistant = await Utilisateur.findOne({
        where: { email }
      });
      if (emailExistant) {
        return next(new AppError('Email déjà utilisé', 400));
      }
    }

    // Mettre à jour l'utilisateur
    await utilisateur.update({
      nom,
      prenom,
      email,
      role,
      etat,
      updated_at: new Date()
    });

    // Notifier via WebSocket
    req.wsUtils.notifyAdmin.userUpdated(req.wsUtils, {
      utilisateur: {
        id: utilisateur.id,
        pseudo: utilisateur.pseudo,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        role: utilisateur.role,
        etat: utilisateur.etat
      }
    });

    res.status(200).json({
      status: 'success',
      data: {
        id: utilisateur.id,
        pseudo: utilisateur.pseudo,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role: utilisateur.role,
        etat: utilisateur.etat
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.changerMotDePasse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ancien_mot_de_passe, nouveau_mot_de_passe } = req.body;

    const utilisateur = await Utilisateur.findByPk(id);
    if (!utilisateur) {
      return next(new AppError('Utilisateur non trouvé', 404));
    }

    // Vérifier l'ancien mot de passe
    const isValidPassword = await bcrypt.compare(ancien_mot_de_passe, utilisateur.mot_de_passe);
    if (!isValidPassword) {
      return next(new AppError('Ancien mot de passe incorrect', 400));
    }

    // Hasher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(nouveau_mot_de_passe, salt);

    // Mettre à jour le mot de passe
    await utilisateur.update({
      mot_de_passe: hashedPassword,
      updated_at: new Date()
    });

    // Déconnecter toutes les sessions de l'utilisateur
    await Session.destroy({
      where: { user_id: id }
    });

    res.status(200).json({
      status: 'success',
      message: 'Mot de passe modifié avec succès'
    });
  } catch (error) {
    next(error);
  }
};

exports.reinitialiserMotDePasse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nouveau_mot_de_passe } = req.body;

    const utilisateur = await Utilisateur.findByPk(id);
    if (!utilisateur) {
      return next(new AppError('Utilisateur non trouvé', 404));
    }

    // Vérifier les permissions
    if (req.user.role !== 'Administrateur') {
      return next(new AppError('Non autorisé', 403));
    }

    // Hasher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(nouveau_mot_de_passe, salt);

    // Mettre à jour le mot de passe
    await utilisateur.update({
      mot_de_passe: hashedPassword,
      tentatives_connexion: 0,
      bloque_jusqu_a: null,
      updated_at: new Date()
    });

    // Déconnecter toutes les sessions de l'utilisateur
    await Session.destroy({
      where: { user_id: id }
    });

    // Notifier via WebSocket
    req.wsUtils.notifyAdmin.passwordReset(req.wsUtils, {
      utilisateur: {
        id: utilisateur.id,
        pseudo: utilisateur.pseudo
      },
      admin: {
        id: req.user.id,
        nom: req.user.nom,
        prenom: req.user.prenom
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Mot de passe réinitialisé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

exports.changerEtat = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { etat } = req.body;

    const utilisateur = await Utilisateur.findByPk(id);
    if (!utilisateur) {
      return next(new AppError('Utilisateur non trouvé', 404));
    }

    // Vérifier les permissions
    if (req.user.role !== 'Administrateur') {
      return next(new AppError('Non autorisé', 403));
    }

    // Mettre à jour l'état
    await utilisateur.update({
      etat,
      updated_at: new Date()
    });

    // Si l'utilisateur est désactivé, déconnecter toutes ses sessions
    if (etat === 'Inactif' || etat === 'Suspendu') {
      await Session.destroy({
        where: { user_id: id }
      });
    }

    // Notifier via WebSocket
    req.wsUtils.notifyAdmin.userStateChanged(req.wsUtils, {
      utilisateur: {
        id: utilisateur.id,
        pseudo: utilisateur.pseudo,
        etat: utilisateur.etat
      },
      admin: {
        id: req.user.id,
        nom: req.user.nom,
        prenom: req.user.prenom
      }
    });

    res.status(200).json({
      status: 'success',
      data: {
        id: utilisateur.id,
        pseudo: utilisateur.pseudo,
        etat: utilisateur.etat
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.listerUtilisateurs = async (req, res, next) => {
  try {
    const { role, etat } = req.query;
    const where = {};

    if (role) where.role = role;
    if (etat) where.etat = etat;

    const utilisateurs = await Utilisateur.findAll({
      where,
      attributes: { exclude: ['mot_de_passe'] },
      order: [
        ['role', 'ASC'],
        ['nom', 'ASC'],
        ['prenom', 'ASC']
      ]
    });

    res.status(200).json({
      status: 'success',
      data: utilisateurs
    });
  } catch (error) {
    next(error);
  }
};

exports.obtenirUtilisateur = async (req, res, next) => {
  try {
    const { id } = req.params;

    const utilisateur = await Utilisateur.findByPk(id, {
      attributes: { exclude: ['mot_de_passe'] },
      include: [{
        model: Session,
        attributes: ['id', 'ip_address', 'user_agent', 'last_activity']
      }]
    });

    if (!utilisateur) {
      return next(new AppError('Utilisateur non trouvé', 404));
    }

    res.status(200).json({
      status: 'success',
      data: utilisateur
    });
  } catch (error) {
    next(error);
  }
};

exports.supprimerUtilisateur = async (req, res, next) => {
  try {
    const { id } = req.params;

    const utilisateur = await Utilisateur.findByPk(id);
    if (!utilisateur) {
      return next(new AppError('Utilisateur non trouvé', 404));
    }

    // Vérifier les permissions
    if (req.user.role !== 'Administrateur') {
      return next(new AppError('Non autorisé', 403));
    }

    // Vérifier si l'utilisateur n'est pas l'administrateur principal
    if (utilisateur.role === 'Administrateur' && utilisateur.id === 1) {
      return next(new AppError('Impossible de supprimer l\'administrateur principal', 400));
    }

    // Supprimer toutes les sessions de l'utilisateur
    await Session.destroy({
      where: { user_id: id }
    });

    // Supprimer l'utilisateur
    await utilisateur.destroy();

    // Notifier via WebSocket
    req.wsUtils.notifyAdmin.userDeleted(req.wsUtils, {
      utilisateur: {
        id: utilisateur.id,
        pseudo: utilisateur.pseudo
      },
      admin: {
        id: req.user.id,
        nom: req.user.nom,
        prenom: req.user.prenom
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};
