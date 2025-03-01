const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Utilisateur = sequelize.define('Utilisateur', {


  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false
  },
  prenom: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pseudo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  mot_de_passe: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false
  },
  etat: {
    type: DataTypes.STRING,
    defaultValue: 'Déconnecté'
  },
  contact1: {
    type: DataTypes.STRING
  },
  contact2: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'utilisateurs',
  timestamps: false
});

module.exports = Utilisateur;
