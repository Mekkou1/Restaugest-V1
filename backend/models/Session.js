const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Session = sequelize.define('Session', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sessionId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'utilisateurs',
      key: 'id'
    }
  },
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userAgent: {
    type: DataTypes.STRING,
    allowNull: true
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  lastActivity: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'sessions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['sessionId']
    },
    {
      fields: ['refreshToken']
    }
  ]
});

// Instance methods
Session.prototype.isExpired = function() {
  return new Date() > this.expiresAt;
};

Session.prototype.updateLastActivity = async function() {
  this.lastActivity = new Date();
  await this.save();
};

Session.prototype.endSession = async function() {
  this.expiresAt = new Date();
  await this.save();
};

// Static methods
Session.createSession = async function(userId, refreshToken, ipAddress, userAgent) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  return await this.create({
    sessionId: require('crypto').randomBytes(32).toString('hex'),
    userId,
    refreshToken,
    ipAddress,
    userAgent,
    expiresAt
  });
};

Session.getActiveSession = async function(userId) {
  return await this.findOne({
    where: {
      userId,
      expiresAt: {
        [Op.gt]: new Date()
      }
    }
  });
};

Session.endAllUserSessions = async function(userId) {
  return await this.update(
    { expiresAt: new Date() },
    {
      where: {
        userId,
        expiresAt: {
          [Op.gt]: new Date()
        }
      }
    }
  );
};

Session.cleanExpiredSessions = async function() {
  return await this.destroy({
    where: {
      expiresAt: {
        [Op.lt]: new Date()
      }
    }
  });
};

// Associations
Session.associate = function(models) {
  Session.belongsTo(models.Utilisateur, {
    foreignKey: 'userId',
    as: 'user'
  });
};

module.exports = Session;
