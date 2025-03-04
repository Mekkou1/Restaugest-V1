const { Sequelize } = require('sequelize');
const config = require('../config/database');

// Initialize Sequelize with database configuration
const sequelize = config;

// Import models
const Utilisateur = require('./Utilisateur');
const Session = require('./Session');

// Initialize models
const models = {
  Utilisateur,
  Session
};

// Set up associations
Object.values(models)
  .filter(model => typeof model.associate === 'function')
  .forEach(model => model.associate(models));

// Export models and sequelize instance
module.exports = {
  ...models,
  sequelize
};

// Handle database connection
sequelize
  .authenticate()
  .then(() => {
    console.log('✅ Connexion à la base de données établie avec succès.');
    
    // Sync models with database in development
    if (process.env.NODE_ENV === 'development') {
      return sequelize.sync({ alter: true });
    }
  })
  .then(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Modèles synchronisés avec la base de données');
    }
  })
  .catch(err => {
    console.error('❌ Erreur de connexion à la base de données:', err);
  });
