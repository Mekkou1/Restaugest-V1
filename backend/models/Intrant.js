const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const logger = require('../utils/logger');

class Intrant extends Model {
  // Vérifier si le stock est suffisant pour une quantité donnée
  isStockSuffisant(quantite) {
    if (!this.suivi_stock) return true;
    return this.stock_actuel >= quantite;
  }

  // Vérifier si le stock est bas
  isStockBas() {
    if (!this.suivi_stock || !this.stock_minimum) return false;
    return this.stock_actuel <= this.stock_minimum;
  }

  // Ajouter du stock
  async ajouterStock(quantite, options = {}) {
    const {
      type_mouvement = 'entree',
      reference_document = null,
      motif = null,
      effectue_par,
      prix_unitaire = this.prix_unitaire
    } = options;

    if (quantite <= 0) {
      throw new Error('La quantité doit être positive');
    }

    const mouvement = await sequelize.models.MouvementStock.create({
      intrant_id: this.id,
      type_mouvement,
      quantite,
      unite_mesure_id: this.unite_mesure_id,
      prix_unitaire,
      reference_document,
      motif,
      effectue_par
    });

    // Le trigger after_mouvement_stock mettra à jour le stock_actuel
    await this.reload();

    // Vérifier si le stock est bas après l'opération
    if (this.isStockBas()) {
      logger.warn(`Stock bas pour l'intrant ${this.nom} (${this.stock_actuel} ${this.unite_mesure?.symbole})`);
    }

    return mouvement;
  }

  // Retirer du stock
  async retirerStock(quantite, options = {}) {
    const {
      type_mouvement = 'sortie',
      reference_document = null,
      motif = null,
      effectue_par
    } = options;

    if (quantite <= 0) {
      throw new Error('La quantité doit être positive');
    }

    if (!this.isStockSuffisant(quantite)) {
      throw new Error('Stock insuffisant');
    }

    const mouvement = await sequelize.models.MouvementStock.create({
      intrant_id: this.id,
      type_mouvement,
      quantite,
      unite_mesure_id: this.unite_mesure_id,
      reference_document,
      motif,
      effectue_par
    });

    // Le trigger after_mouvement_stock mettra à jour le stock_actuel
    await this.reload();

    return mouvement;
  }

  // Obtenir l'historique des mouvements
  async getMouvements(options = {}) {
    const { limit = 10, offset = 0, type_mouvement = null } = options;

    const where = { intrant_id: this.id };
    if (type_mouvement) {
      where.type_mouvement = type_mouvement;
    }

    return await sequelize.models.MouvementStock.findAndCountAll({
      where,
      limit,
      offset,
      order: [['date_mouvement', 'DESC']],
      include: [
        {
          model: sequelize.models.UniteMesure,
          as: 'uniteMesure'
        },
        {
          model: sequelize.models.Utilisateur,
          as: 'effectuePar',
          attributes: ['id', 'nom', 'prenom']
        }
      ]
    });
  }

  // Calculer la valeur du stock
  getValeurStock() {
    return this.stock_actuel * (this.prix_unitaire || 0);
  }
}

Intrant.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: {
      msg: 'Ce code est déjà utilisé'
    },
    validate: {
      notNull: { msg: 'Le code est requis' },
      notEmpty: { msg: 'Le code ne peut pas être vide' }
    }
  },
  nom: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notNull: { msg: 'Le nom est requis' },
      notEmpty: { msg: 'Le nom ne peut pas être vide' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  unite_mesure_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'unites_mesure',
      key: 'id'
    },
    validate: {
      notNull: { msg: 'L\'unité de mesure est requise' }
    }
  },
  stock_actuel: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'Le stock ne peut pas être négatif'
      }
    }
  },
  stock_minimum: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: true,
    validate: {
      min: {
        args: [0],
        msg: 'Le stock minimum ne peut pas être négatif'
      }
    }
  },
  stock_maximum: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: true,
    validate: {
      min: {
        args: [0],
        msg: 'Le stock maximum ne peut pas être négatif'
      },
      isGreaterThanMin(value) {
        if (this.stock_minimum && value <= this.stock_minimum) {
          throw new Error('Le stock maximum doit être supérieur au stock minimum');
        }
      }
    }
  },
  prix_unitaire: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: {
        args: [0],
        msg: 'Le prix unitaire ne peut pas être négatif'
      }
    }
  },
  suivi_stock: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  emplacement: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  allergenes: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const value = this.getDataValue('allergenes');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('allergenes', JSON.stringify(value));
    }
  }
}, {
  sequelize,
  modelName: 'Intrant',
  tableName: 'intrants',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeValidate: (intrant) => {
      // Si le suivi de stock est désactivé, réinitialiser les valeurs de stock
      if (!intrant.suivi_stock) {
        intrant.stock_minimum = null;
        intrant.stock_maximum = null;
      }
    },
    afterUpdate: async (intrant) => {
      // Vérifier le stock bas après chaque mise à jour
      if (intrant.changed('stock_actuel') && intrant.isStockBas()) {
        logger.warn(`Stock bas pour l'intrant ${intrant.nom}`);
      }
    }
  }
});

module.exports = Intrant;
