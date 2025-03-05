const { Session, Utilisateur } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * Middleware pour nettoyer les sessions expirées
 * et mettre à jour l'état des utilisateurs
 */
const sessionCleanup = async () => {
  try {
    const now = new Date();

    // 1. Trouver toutes les sessions expirées
    const expiredSessions = await Session.findAll({
      where: {
        expires_at: {
          [Op.lt]: now
        }
      },
      include: [{
        model: Utilisateur,
        attributes: ['id', 'etat']
      }]
    });

    // 2. Collecter les IDs des utilisateurs pour mise à jour
    const userIds = new Set();
    expiredSessions.forEach(session => {
      if (session.Utilisateur) {
        userIds.add(session.Utilisateur.id);
      }
    });

    // 3. Supprimer les sessions expirées
    const deletedCount = await Session.destroy({
      where: {
        expires_at: {
          [Op.lt]: now
        }
      }
    });

    // 4. Pour chaque utilisateur, vérifier s'il a encore des sessions actives
    for (const userId of userIds) {
      const activeSessions = await Session.count({
        where: {
          user_id: userId,
          expires_at: {
            [Op.gt]: now
          }
        }
      });

      // Si l'utilisateur n'a plus de sessions actives, le marquer comme déconnecté
      if (activeSessions === 0) {
        await Utilisateur.update(
          { etat: 'Déconnecté' },
          { where: { id: userId } }
        );
      }
    }

    if (deletedCount > 0) {
      logger.info(`Sessions nettoyées : ${deletedCount} sessions expirées supprimées`);
    }

  } catch (error) {
    logger.error('Erreur lors du nettoyage des sessions :', error);
  }
};

/**
 * Planificateur de nettoyage des sessions
 * Exécute le nettoyage toutes les heures par défaut
 */
const scheduleCleanup = (interval = 60 * 60 * 1000) => {
  setInterval(sessionCleanup, interval);
  logger.info(`Planificateur de nettoyage des sessions démarré (intervalle: ${interval}ms)`);
};

/**
 * Middleware pour mettre à jour la dernière activité d'une session
 */
const updateSessionActivity = async (req, res, next) => {
  try {
    if (req.session) {
      await req.session.updateActivity();
    }
    next();
  } catch (error) {
    logger.error('Erreur lors de la mise à jour de l\'activité de la session :', error);
    next();
  }
};

/**
 * Middleware pour vérifier la validité de la session
 */
const checkSessionValidity = async (req, res, next) => {
  try {
    if (!req.session) {
      return next();
    }

    // Vérifier si la session est expirée
    if (req.session.isExpired()) {
      await req.session.destroy();
      return res.status(401).json({
        status: 'error',
        message: 'Session expirée. Veuillez vous reconnecter.'
      });
    }

    // Vérifier si l'adresse IP a changé (sécurité supplémentaire)
    if (req.session.ip_address && req.session.ip_address !== req.ip) {
      logger.warn(`Changement d'IP détecté pour la session ${req.session.id}`);
      // Vous pouvez choisir d'invalider la session ici si vous le souhaitez
    }

    next();
  } catch (error) {
    logger.error('Erreur lors de la vérification de la session :', error);
    next(error);
  }
};

module.exports = {
  sessionCleanup,
  scheduleCleanup,
  updateSessionActivity,
  checkSessionValidity
};
