const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class IngredientRecette extends Model {
  // Calculer le coût de l'ingrédient
  async calculerCout() {
    const intrant = await this.getIntrant();
    return (intrant.prix_unitaire || 0) * this.quantite;
  }

  // Vérifier la disponibilité de l'ingrédient
  async verifierDisponibilite() {
    const intrant = await this.getIntrant();
    if (!intrant.suivi_stock) return true;
    
    return {
      disponible: intrant.stock_actuel >= this.quantite,
      stockActuel: intrant.stock_actuel,
      quantiteRequise: this.quantite,
      manquant: Math.max(0, this.quantite - intrant.stock_actuel)
    };
  }

  // Convertir la quantité dans une autre unité de mesure
  async convertirQuantite(nouvelleUniteId) {
    const uniteActuelle = await this.getUniteMesure();
    const nouvelleUnite = await sequelize.models.UniteMesure.findByPk(nouvelleUniteId);
    
    if (!uniteActuelle || !nouvelleUnite) {
      throw new Error('Unités de mesure non trouvées');
    }

    // Implémentez ici votre logique de conversion selon vos besoins
    // Par exemple, conversion entre kg et g, l et ml, etc.
    const conversions = {
      'KG_TO_G': 1000,
      'G_TO_KG': 0.001,
      'L_TO_ML': 1000,
      'ML_TO_L': 0.001
    };

    const conversionKey = `${uniteActuelle.code}_TO_${nouvelleUnite.code}`;
    if (conversions[conversionKey]) {
      return this.quantite * conversions[conversionKey];
    }

    throw new Error('Conversion non supportée');
  }
}

IngredientRecette.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  recette_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'recettes',
      key: 'id'
    },
    validate: {
      notNull: { msg: 'L\'ID de la recette est requis' }
    }
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
  quantite: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false,
    validate: {
      notNull: { msg: 'La quantité est requise' },
      min: {
        args: [0],
        msg: 'La quantité ne peut pas être négative'
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
  obligatoire: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'IngredientRecette',
  tableName: 'ingredients_recette',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['recette_id', 'intrant_id'],
      name: 'unique_ingredient_recette'
    }
  ],
  hooks: {
    beforeCreate: async (ingredient) => {
      // Vérifier la compatibilité des unités de mesure
      const intrant = await sequelize.models.Intrant.findByPk(ingredient.intrant_id);
      if (intrant && intrant.unite_mesure_id !== ingredient.unite_mesure_id) {
        try {
          // Tenter de convertir la quantité dans l'unité de l'intrant
          const quantiteConvertie = await ingredient.convertirQuantite(intrant.unite_mesure_id);
          ingredient.quantite = quantiteConvertie;
          ingredient.unite_mesure_id = intrant.unite_mesure_id;
        } catch (error) {
          throw new Error('Unités de mesure incompatibles');
        }
      }
    },
    afterCreate: async (ingredient) => {
      // Mettre à jour le coût de production de la recette
      const recette = await ingredient.getRecette();
      await recette.calculerCoutProduction();
    },
    afterUpdate: async (ingredient) => {
      if (ingredient.changed('quantite')) {
        // Mettre à jour le coût de production de la recette si la quantité change
        const recette = await ingredient.getRecette();
        await recette.calculerCoutProduction();
      }
    }
  }
});

module.exports = IngredientRecette;
