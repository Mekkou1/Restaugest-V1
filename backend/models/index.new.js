const sequelize = require('../config/database');
const Utilisateur = require('./Utilisateur');
const Salles = require('./Salles');
const TableRestaurant = require('./TableRestaurant');
const Ticket = require('./Ticket');
const Commande = require('./Commande');
const Article = require('./Article');
const initSession = require('./Session');

// Initialize models
const models = {
  Utilisateur,
  Salles,
  TableRestaurant,
  Ticket,
  Commande,
  Article,
  Session: initSession(sequelize)
};

// Associate models
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

// Export models and sequelize instance
module.exports = {
  ...models,
  sequelize
};
