const logger = require('../utils/logger');

// Configuration des WebSockets
const configureWebSocket = (io) => {
  // Middleware d'authentification pour les WebSockets
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    // Vous pouvez ajouter ici la vérification du token JWT
    next();
  });

  // Gestion des connexions
  io.on('connection', (socket) => {
    logger.info(`Nouvelle connexion WebSocket: ${socket.id}`);

    // Gestion des rooms
    socket.on('joinRoom', (room) => {
      socket.join(room);
      logger.info(`Client ${socket.id} a rejoint la room: ${room}`);
    });

    socket.on('leaveRoom', (room) => {
      socket.leave(room);
      logger.info(`Client ${socket.id} a quitté la room: ${room}`);
    });

    // Événements liés aux stocks
    socket.on('stockBas', (data) => {
      logger.warn('Alerte stock bas:', data);
      io.to('admin').to('cuisine').emit('stockBas', {
        ...data,
        timestamp: new Date()
      });
    });

    socket.on('mouvementStock', (data) => {
      logger.info('Mouvement de stock:', data);
      io.to('admin').to('cuisine').emit('mouvementStock', {
        ...data,
        timestamp: new Date()
      });
    });

    // Événements liés aux recettes
    socket.on('recetteModifiee', (data) => {
      logger.info('Recette modifiée:', data);
      io.to('cuisine').emit('recetteModifiee', {
        ...data,
        timestamp: new Date()
      });
    });

    socket.on('preparationDebutee', (data) => {
      logger.info('Préparation débutée:', data);
      io.to('cuisine').to('serveurs').emit('preparationDebutee', {
        ...data,
        timestamp: new Date()
      });
    });

    socket.on('preparationTerminee', (data) => {
      logger.info('Préparation terminée:', data);
      io.to('cuisine').to('serveurs').emit('preparationTerminee', {
        ...data,
        timestamp: new Date()
      });
    });

    // Événements liés aux commandes
    socket.on('nouvelleCommande', (data) => {
      logger.info('Nouvelle commande:', data);
      io.to('cuisine').emit('nouvelleCommande', {
        ...data,
        timestamp: new Date()
      });
    });

    socket.on('commandeModifiee', (data) => {
      logger.info('Commande modifiée:', data);
      io.to('cuisine').to('serveurs').emit('commandeModifiee', {
        ...data,
        timestamp: new Date()
      });
    });

    socket.on('commandePrete', (data) => {
      logger.info('Commande prête:', data);
      io.to('serveurs').emit('commandePrete', {
        ...data,
        timestamp: new Date()
      });
    });

    // Gestion des erreurs
    socket.on('error', (error) => {
      logger.error('Erreur WebSocket:', error);
    });

    // Gestion de la déconnexion
    socket.on('disconnect', (reason) => {
      logger.info(`Client déconnecté (${reason}): ${socket.id}`);
    });
  });

  // Fonctions utilitaires pour émettre des événements
  const emitToRoom = (room, event, data) => {
    io.to(room).emit(event, {
      ...data,
      timestamp: new Date()
    });
  };

  const broadcastStockAlert = (data) => {
    emitToRoom('admin', 'stockBas', data);
    emitToRoom('cuisine', 'stockBas', data);
  };

  const notifyRecetteUpdate = (data) => {
    emitToRoom('cuisine', 'recetteModifiee', data);
  };

  const notifyPreparation = (data) => {
    emitToRoom('cuisine', 'preparationUpdate', data);
    emitToRoom('serveurs', 'preparationUpdate', data);
  };

  // Export des fonctions utilitaires
  return {
    emitToRoom,
    broadcastStockAlert,
    notifyRecetteUpdate,
    notifyPreparation
  };
};

module.exports = configureWebSocket;
