const sequelize = require('../config/database');
const Utilisateur = require('./Utilisateur');
const Salle=require('./Salles')
const initSession = require('./Session');

// Initialize models
const models = {
  Utilisateur,
  Salles,
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
