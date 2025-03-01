const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Salles = sequelize.define('Salle', {
  nom: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('VIP', 'Terrasse', 'Standard'),
    allowNull: false,
  },
}, {
  tableName: 'salles',
  timestamps: false,
});

// Définir les associations
Salles.associate = (models) => {
  Salles.hasMany(models.TableRestaurant, { foreignKey: 'salle_id', as: 'Tables' });
};

module.exports = Salles;