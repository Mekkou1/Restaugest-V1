const { Model, DataTypes, Op } = require('sequelize');

module.exports = (sequelize) => {
  class Session extends Model {
    static associate(models) {
      // Association with Utilisateur model
      Session.belongsTo(models.Utilisateur, {
        foreignKey: 'userId',
        as: 'user'
      });
    }

    // Create new session and deactivate any existing session
    static async createSession(userId, token) {
      const transaction = await sequelize.transaction();
      
      try {
        // Deactivate any existing active session
        await Session.update(
          { expiresAt: new Date() },
          {
            where: { 
              userId,
              expiresAt: { [Op.gt]: new Date() }
            },
            transaction
          }
        );

        // Create new session
        const session = await Session.create({
          userId,
          refreshToken: token,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }, { transaction });

        await transaction.commit();
        return session;
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    }

    // Get active session for user
    static async getActiveSession(userId) {
      return await Session.findOne({
        where: {
          userId,
          expiresAt: { [Op.gt]: new Date() }
        }
      });
    }

    // Get session history for user
    static async getSessionHistory(userId) {
      return await Session.findAll({
        where: { userId },
        order: [['expiresAt', 'DESC']]
      });
    }

    // End session
    async endSession() {
      return await this.update({
        expiresAt: new Date()
      });
    }
  }

  Session.init({
    sessionId: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Utilisateurs',
        key: 'id'
      }
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: false
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Session',
    tableName: 'sessions',
    timestamps: true,
    paranoid: false,
    hooks: {
      beforeCreate: async (session) => {
        // Generate sessionId
        session.sessionId = require('crypto').randomBytes(16).toString('hex');
      }
    }
  });

  return Session;
};
