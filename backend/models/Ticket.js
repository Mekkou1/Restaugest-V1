const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  reference: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  table_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tables_restaurant',
      key: 'id'
    }
  },
  etat: {
    type: DataTypes.ENUM(
      'En attente de validation',
      'En cuisine',
      'En préparation',
      'Servi',
      'Payé',
      'Payé avec avoir'
    ),
    allowNull: false,
    defaultValue: 'En attente de validation'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'tickets',
  timestamps: false
});

// Define associations
Ticket.associate = (models) => {
  Ticket.belongsTo(models.TableRestaurant, {
    foreignKey: 'table_id',
    as: 'table'
  });
  
  Ticket.hasMany(models.Commande, {
    foreignKey: 'ticket_id',
    as: 'commandes'
  });
};

module.exports = Ticket;
