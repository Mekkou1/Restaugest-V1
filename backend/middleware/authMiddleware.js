const jwt = require('jsonwebtoken');
const { Utilisateur, Session } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token non fourni' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if session exists and is valid
    const session = await Session.findOne({
      where: {
        sessionId: decoded.sessionId,
        userId: decoded.userId,
        expiresAt: {
          [Op.gt]: new Date()
        }
      }
    });

    if (!session) {
      return res.status(401).json({ message: 'Session invalide ou expirée' });
    }

    // Get user
    const user = await Utilisateur.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    // Add user and session info to request
    req.user = user;
    req.session = session;
    req.token = token;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expiré' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token invalide' });
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Erreur lors de l\'authentification' });
  }
};

// Middleware to check role
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }

    next();
  };
};

module.exports = {
  authMiddleware,
  checkRole
};
