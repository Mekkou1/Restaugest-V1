const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TableRestaurant = sequelize.define('TableRestaurant', {
  nom: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('Carrée', 'Ronde', 'Rectangulaire'),
    allowNull: false,
  },
  etat: {
    type: DataTypes.ENUM('Libre', 'Occupée'),
    allowNull: false,
    defaultValue: 'Libre',
  },
}, {
  tableName: 'tables_restaurant',
  timestamps: false,
});

// Définir les associations
TableRestaurant.associate = (models) => {
  TableRestaurant.belongsTo(models.Salle, { foreignKey: 'salle_id', as: 'Salle' });
};

module.exports = TableRestaurant;