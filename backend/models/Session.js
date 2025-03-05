const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Session extends Model {
  // Vérifier si la session est active
  isActive() {
    return new Date() < this.expires_at;
  }

  // Vérifier si la session est expirée
  isExpired() {
    return new Date() > this.expires_at;
  }

  // Prolonger la session
  async extend(duration = 7 * 24 * 60 * 60 * 1000) { // 7 jours par défaut
    this.expires_at = new Date(Date.now() + duration);
    this.last_activity = new Date();
    await this.save();
  }

  // Mettre à jour la dernière activité
  async updateActivity() {
    this.last_activity = new Date();
    await this.save();
  }

  // Invalider la session
  async invalidate() {
    this.expires_at = new Date();
    await this.save();
  }
}

Session.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  session_id: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      notNull: { msg: 'L\'ID de session est requis' },
      notEmpty: { msg: 'L\'ID de session ne peut pas être vide' }
    }
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'utilisateurs',
      key: 'id'
    },
    validate: {
      notNull: { msg: 'L\'ID utilisateur est requis' }
    }
  },
  refresh_token: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true,
    validate: {
      isIP: true
    }
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      notNull: { msg: 'La date d\'expiration est requise' },
      isDate: true,
      isAfterNow(value) {
        if (value < new Date()) {
          throw new Error('La date d\'expiration doit être dans le futur');
        }
      }
    }
  },
  last_activity: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    validate: {
      isDate: true
    }
  }
}, {
  sequelize,
  modelName: 'Session',
  tableName: 'sessions',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      name: 'idx_session_id',
      unique: true,
      fields: ['session_id']
    },
    {
      name: 'idx_user_id',
      fields: ['user_id']
    },
    {
      name: 'idx_refresh_token',
      fields: ['refresh_token']
    },
    {
      name: 'idx_expires_at',
      fields: ['expires_at']
    }
  ],
  hooks: {
    beforeCreate: async (session) => {
      // S'assurer que la date d'expiration est dans le futur
      if (session.expires_at < new Date()) {
        throw new Error('La date d\'expiration doit être dans le futur');
      }
    },
    beforeUpdate: async (session) => {
      // Mettre à jour last_activity lors de chaque mise à jour
      session.last_activity = new Date();
    }
  }
});

// Méthodes statiques
Session.cleanupExpired = async function() {
  const now = new Date();
  return await this.destroy({
    where: {
      expires_at: {
        [Op.lt]: now
      }
    }
  });
};

Session.findActiveByUser = async function(userId) {
  const now = new Date();
  return await this.findAll({
    where: {
      user_id: userId,
      expires_at: {
        [Op.gt]: now
      }
    }
  });
};

Session.invalidateAllForUser = async function(userId) {
  const now = new Date();
  return await this.update(
    { expires_at: now },
    {
      where: {
        user_id: userId,
        expires_at: {
          [Op.gt]: now
        }
      }
    }
  );
};

module.exports = Session;
