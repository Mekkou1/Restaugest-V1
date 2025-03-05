const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const logger = require('../utils/logger');

class MouvementStock extends Model {
  // Calculer la valeur du mouvement
  getValeurMouvement() {
    return this.quantite * (this.prix_unitaire || 0);
  }

  // Vérifier si le mouvement est une entrée
  isEntree() {
    return this.type_mouvement === 'entree';
  }

  // Vérifier si le mouvement est une sortie
  isSortie() {
    return ['sortie', 'perte', 'preparation'].includes(this.type_mouvement);
  }

  // Obtenir le signe du mouvement (+1 pour entrée, -1 pour sortie)
  getSigneMouvement() {
    return this.isEntree() ? 1 : -1;
  }

  // Formater le mouvement pour l'affichage
  async formaterMouvement() {
    const intrant = await this.getIntrant();
    const uniteMesure = await this.getUniteMesure();
    const effectuePar = await this.getEffectuePar();

    return {
      id: this.id,
      date: this.date_mouvement,
      type: this.type_mouvement,
      intrant: intrant ? {
        id: intrant.id,
        code: intrant.code,
        nom: intrant.nom
      } : null,
      quantite: this.quantite,
      unite: uniteMesure ? uniteMesure.symbole : '',
      prix_unitaire: this.prix_unitaire,
      valeur: this.getValeurMouvement(),
      reference: this.reference_document,
      motif: this.motif,
      effectue_par: effectuePar ? `${effectuePar.prenom} ${effectuePar.nom}` : null
    };
  }
}

MouvementStock.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  intrant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'intrants',
      key: 'id'
    },
    validate: {
      notNull: { msg: 'L\'ID de l\'intrant est requis' }
    }
  },
  type_mouvement: {
    type: DataTypes.ENUM('entree', 'sortie', 'ajustement', 'perte', 'preparation'),
    allowNull: false,
    validate: {
      notNull: { msg: 'Le type de mouvement est requis' }
    }
  },
  quantite: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false,
    validate: {
      notNull: { msg: 'La quantité est requise' },
      min: {
        args: [0],
        msg: 'La quantité doit être positive'
      }
    }
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
  reference_document: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  motif: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  effectue_par: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'utilisateurs',
      key: 'id'
    },
    validate: {
      notNull: { msg: 'L\'utilisateur est requis' }
    }
  },
  date_mouvement: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'MouvementStock',
  tableName: 'mouvements_stock',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (mouvement) => {
      // Vérifier la compatibilité des unités de mesure
      const intrant = await sequelize.models.Intrant.findByPk(mouvement.intrant_id);
      if (intrant && intrant.unite_mesure_id !== mouvement.unite_mesure_id) {
        throw new Error('L\'unité de mesure doit correspondre à celle de l\'intrant');
      }

      // Pour les entrées, mettre à jour le prix unitaire de l'intrant si nécessaire
      if (mouvement.type_mouvement === 'entree' && mouvement.prix_unitaire) {
        await intrant.update({ prix_unitaire: mouvement.prix_unitaire });
      }
    },
    afterCreate: async (mouvement) => {
      // Logger le mouvement
      const intrant = await mouvement.getIntrant();
      const uniteMesure = await mouvement.getUniteMesure();
      logger.info(
        `Mouvement de stock: ${mouvement.type_mouvement} de ${mouvement.quantite} ${uniteMesure.symbole} ` +
        `de ${intrant.nom} (${intrant.code})`
      );
    }
  },
  indexes: [
    {
      name: 'idx_mouvements_intrant',
      fields: ['intrant_id']
    },
    {
      name: 'idx_mouvements_date',
      fields: ['date_mouvement']
    },
    {
      name: 'idx_mouvements_type',
      fields: ['type_mouvement']
    }
  ]
});

// Méthodes statiques
MouvementStock.getMouvementsPeriode = async function(debut, fin, options = {}) {
  const { intrant_id, type_mouvement } = options;
  const where = {
    date_mouvement: {
      [sequelize.Op.between]: [debut, fin]
    }
  };

  if (intrant_id) where.intrant_id = intrant_id;
  if (type_mouvement) where.type_mouvement = type_mouvement;

  return await this.findAll({
    where,
    include: [
      { model: sequelize.models.Intrant },
      { model: sequelize.models.UniteMesure },
      { 
        model: sequelize.models.Utilisateur,
        as: 'effectuePar',
        attributes: ['id', 'nom', 'prenom']
      }
    ],
    order: [['date_mouvement', 'DESC']]
  });
};

module.exports = MouvementStock;
