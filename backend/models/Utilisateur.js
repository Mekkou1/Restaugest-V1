const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const Utilisateur = sequelize.define('Utilisateur', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  pseudo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50]
    }
  },
  mot_de_passe: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false
  },
  prenom: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  role: {
    type: DataTypes.ENUM('Administrateur', 'Caissier', 'Serveur', 'Cuisinier'),
    allowNull: false,
    defaultValue: 'Serveur'
  },
  etat: {
    type: DataTypes.ENUM('Actif', 'Inactif', 'Connecté', 'Déconnecté', 'Suspendu'),
    allowNull: false,
    defaultValue: 'Actif'
  },
  derniere_connexion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  tentatives_connexion: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  bloque_jusqu_a: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'utilisateurs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (user) => {
      if (user.mot_de_passe) {
        user.mot_de_passe = await bcrypt.hash(user.mot_de_passe, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('mot_de_passe')) {
        user.mot_de_passe = await bcrypt.hash(user.mot_de_passe, 10);
      }
    }
  }
});

// Instance methods
Utilisateur.prototype.verifyPassword = async function(password) {
  return await bcrypt.compare(password, this.mot_de_passe);
};

Utilisateur.prototype.isBlocked = function() {
  return this.bloque_jusqu_a && new Date() < this.bloque_jusqu_a;
};

Utilisateur.prototype.incrementLoginAttempts = async function() {
  this.tentatives_connexion += 1;
  
  if (this.tentatives_connexion >= 5) {
    const blockUntil = new Date();
    blockUntil.setMinutes(blockUntil.getMinutes() + 30); // Block for 30 minutes
    this.bloque_jusqu_a = blockUntil;
  }
  
  await this.save();
};

Utilisateur.prototype.resetLoginAttempts = async function() {
  this.tentatives_connexion = 0;
  this.bloque_jusqu_a = null;
  await this.save();
};

Utilisateur.prototype.updateLastLogin = async function() {
  this.derniere_connexion = new Date();
  await this.save();
};

// Static methods
Utilisateur.findByCredentials = async function(pseudo, password) {
  const user = await this.findOne({ where: { pseudo } });
  
  if (!user) {
    throw new Error('Identifiants invalides');
  }

  if (user.isBlocked()) {
    throw new Error('Compte temporairement bloqué');
  }

  const isValid = await user.verifyPassword(password);
  
  if (!isValid) {
    await user.incrementLoginAttempts();
    throw new Error('Identifiants invalides');
  }

  await user.resetLoginAttempts();
  await user.updateLastLogin();
  
  return user;
};

// Associations
Utilisateur.associate = function(models) {
  Utilisateur.hasMany(models.Session, {
    foreignKey: 'userId',
    as: 'sessions'
  });
};

module.exports = Utilisateur;
