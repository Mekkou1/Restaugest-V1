const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');
const logger = require('../utils/logger');
const { Utilisateur } = require('../models');

/**
 * Vérifie si l'utilisateur est authentifié
 */
exports.protect = async (req, res, next) => {
  try {
    // 1) Vérifier si le token existe
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Vous n\'êtes pas connecté. Veuillez vous connecter pour accéder à cette ressource.', 401));
    }

    // 2) Vérifier si le token est valide
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Vérifier si l'utilisateur existe toujours
    const user = await Utilisateur.findByPk(decoded.id);
    if (!user) {
      return next(new AppError('L\'utilisateur associé à ce token n\'existe plus.', 401));
    }

    // 4) Vérifier si l'utilisateur est actif
    if (user.etat !== 'Actif' && user.etat !== 'Connecté') {
      return next(new AppError('Ce compte utilisateur est désactivé.', 401));
    }

    // 5) Stocker l'utilisateur dans req pour une utilisation ultérieure
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Token invalide. Veuillez vous reconnecter.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Votre session a expiré. Veuillez vous reconnecter.', 401));
    }
    next(error);
  }
};

/**
 * Restreint l'accès aux rôles spécifiés
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Vous n\'avez pas la permission d\'effectuer cette action.', 403));
    }
    next();
  };
};

/**
 * Vérifie si l'utilisateur est le propriétaire de la ressource ou un administrateur
 */
exports.checkOwnership = (model) => async (req, res, next) => {
  try {
    const resource = await model.findByPk(req.params.id);
    
    if (!resource) {
      return next(new AppError('Ressource non trouvée.', 404));
    }

    // Les administrateurs ont accès à toutes les ressources
    if (req.user.role === 'Administrateur' || req.user.role === 'SuperAdmin') {
      return next();
    }

    // Vérifier si l'utilisateur est le propriétaire
    if (resource.utilisateur_id !== req.user.id) {
      return next(new AppError('Vous n\'avez pas la permission d\'accéder à cette ressource.', 403));
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Vérifie les permissions spécifiques
 */
exports.checkPermission = (permission) => async (req, res, next) => {
  try {
    // Les administrateurs ont toutes les permissions
    if (req.user.role === 'Administrateur' || req.user.role === 'SuperAdmin') {
      return next();
    }

    const hasPermission = await req.user.hasPermission(permission);
    if (!hasPermission) {
      return next(new AppError('Vous n\'avez pas la permission nécessaire pour effectuer cette action.', 403));
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Vérifie si l'utilisateur est connecté à une caisse
 */
exports.checkCaisseSession = async (req, res, next) => {
  try {
    if (!['Caissier', 'Administrateur', 'SuperAdmin'].includes(req.user.role)) {
      return next(new AppError('Seuls les caissiers peuvent effectuer cette action.', 403));
    }

    const activeCaisseSession = await req.user.getActiveCaisseSession();
    if (!activeCaisseSession) {
      return next(new AppError('Vous devez être connecté à une caisse pour effectuer cette action.', 403));
    }

    req.caisseSession = activeCaisseSession;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Vérifie si l'utilisateur est un serveur assigné à une table
 */
exports.checkTableAssignment = async (req, res, next) => {
  try {
    if (!['Serveur', 'Administrateur', 'SuperAdmin'].includes(req.user.role)) {
      return next(new AppError('Seuls les serveurs peuvent effectuer cette action.', 403));
    }

    const table = await Table.findByPk(req.params.tableId);
    if (!table) {
      return next(new AppError('Table non trouvée.', 404));
    }

    if (table.serveur_id !== req.user.id && !['Administrateur', 'SuperAdmin'].includes(req.user.role)) {
      return next(new AppError('Vous n\'êtes pas assigné à cette table.', 403));
    }

    req.table = table;
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware pour logger les requêtes
exports.logRequest = (req, res, next) => {
  logger.info({
    method: req.method,
    url: req.originalUrl,
    user: req.user ? req.user.id : 'non authentifié',
    body: req.body,
    params: req.params,
    query: req.query
  });
  next();
};
