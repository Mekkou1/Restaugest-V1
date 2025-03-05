/**
 * Utilitaires pour la gestion des WebSockets dans les contrôleurs
 */

// Notifications pour la cuisine
const notifyCuisine = {
    // Nouvelle commande reçue
    newOrder: (wsUtils, data) => {
      wsUtils.emitToRoom('cuisine', 'nouvelleCommande', {
        ...data,
        type: 'new_order',
        timestamp: new Date()
      });
    },
  
    // Mise à jour du statut d'une commande
    updateOrderStatus: (wsUtils, data) => {
      wsUtils.emitToRoom('cuisine', 'commandeModifiee', {
        ...data,
        type: 'status_update',
        timestamp: new Date()
      });
    },
  
    // Préparation commencée
    startPreparation: (wsUtils, data) => {
      wsUtils.emitToRoom('cuisine', 'preparationDebutee', {
        ...data,
        type: 'preparation_started',
        timestamp: new Date()
      });
    },
  
    // Préparation terminée
    finishPreparation: (wsUtils, data) => {
      wsUtils.emitToRoom('cuisine', 'preparationTerminee', {
        ...data,
        type: 'preparation_finished',
        timestamp: new Date()
      });
    }
  };
  
  // Notifications pour les stocks
  const notifyStock = {
    // Alerte de stock bas
    lowStock: (wsUtils, data) => {
      wsUtils.broadcastStockAlert({
        ...data,
        type: 'low_stock',
        timestamp: new Date()
      });
    },
  
    // Mouvement de stock
    stockMovement: (wsUtils, data) => {
      wsUtils.emitToRoom('admin', 'mouvementStock', {
        ...data,
        type: 'stock_movement',
        timestamp: new Date()
      });
    },
  
    // Stock épuisé
    outOfStock: (wsUtils, data) => {
      wsUtils.broadcastStockAlert({
        ...data,
        type: 'out_of_stock',
        timestamp: new Date(),
        priority: 'high'
      });
    }
  };
  
  // Notifications pour les recettes
  const notifyRecipe = {
    // Recette modifiée
    recipeUpdated: (wsUtils, data) => {
      wsUtils.notifyRecetteUpdate({
        ...data,
        type: 'recipe_updated',
        timestamp: new Date()
      });
    },
  
    // Nouvelle recette créée
    recipeCreated: (wsUtils, data) => {
      wsUtils.notifyRecetteUpdate({
        ...data,
        type: 'recipe_created',
        timestamp: new Date()
      });
    },
  
    // Recette supprimée
    recipeDeleted: (wsUtils, data) => {
      wsUtils.notifyRecetteUpdate({
        ...data,
        type: 'recipe_deleted',
        timestamp: new Date()
      });
    }
  };
  
  // Notifications pour les serveurs
  const notifyServers = {
    // Commande prête
    orderReady: (wsUtils, data) => {
      wsUtils.emitToRoom('serveurs', 'commandePrete', {
        ...data,
        type: 'order_ready',
        timestamp: new Date()
      });
    },
  
    // Mise à jour du statut d'une table
    tableStatusUpdate: (wsUtils, data) => {
      wsUtils.emitToRoom('serveurs', 'tableModifiee', {
        ...data,
        type: 'table_status',
        timestamp: new Date()
      });
    }
  };
  
  // Notifications pour les administrateurs
  const notifyAdmin = {
    // Erreur système
    systemError: (wsUtils, data) => {
      wsUtils.emitToRoom('admin', 'erreurSysteme', {
        ...data,
        type: 'system_error',
        timestamp: new Date(),
        priority: 'high'
      });
    },
  
    // Alerte de performance
    performanceAlert: (wsUtils, data) => {
      wsUtils.emitToRoom('admin', 'alertePerformance', {
        ...data,
        type: 'performance_alert',
        timestamp: new Date()
      });
    },
  
    // Événement de sécurité
    securityEvent: (wsUtils, data) => {
      wsUtils.emitToRoom('admin', 'evenementSecurite', {
        ...data,
        type: 'security_event',
        timestamp: new Date(),
        priority: 'high'
      });
    }
  };
  
  // Formatage des messages
  const formatMessage = (type, data) => ({
    ...data,
    type,
    timestamp: new Date(),
    id: Math.random().toString(36).substr(2, 9)
  });
  
  module.exports = {
    notifyCuisine,
    notifyStock,
    notifyRecipe,
    notifyServers,
    notifyAdmin,
    formatMessage
  };
  