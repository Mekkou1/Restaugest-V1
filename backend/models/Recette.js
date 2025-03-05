const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Recette extends Model {
  // Vérifier si tous les ingrédients sont disponibles
  async verifierDisponibiliteIngredients() {
    const ingredients = await this.getIngredientsRecette({
      include: ['Intrant']
    });

    for (const ingredient of ingredients) {
      const intrant = ingredient.Intrant;
      if (intrant.suivi_stock && intrant.stock_actuel < ingredient.quantite) {
        return {
          disponible: false,
          intrantManquant: intrant.nom,
          quantiteRequise: ingredient.quantite,
          stockActuel: intrant.stock_actuel
        };
      }
    }
    return { disponible: true };
  }

  // Calculer le coût total de la recette
  async calculerCoutProduction() {
    const ingredients = await this.getIngredientsRecette({
      include: ['Intrant']
    });

    let coutTotal = 0;
    for (const ingredient of ingredients) {
      const intrant = ingredient.Intrant;
      coutTotal += (intrant.prix_unitaire || 0) * ingredient.quantite;
    }
    
    await this.update({ cout_production: coutTotal });
    return coutTotal;
  }

  // Déduire les ingrédients du stock lors de la préparation
  async deduireIngredients(quantite = 1) {
    const ingredients = await this.getIngredientsRecette({
      include: ['Intrant']
    });

    const mouvements = [];
    for (const ingredient of ingredients) {
      const quantiteNecessaire = ingredient.quantite * quantite;
      
      // Créer le mouvement de stock
      const mouvement = await sequelize.models.MouvementStock.create({
        intrant_id: ingredient.intrant_id,
        type_mouvement: 'preparation',
        quantite: quantiteNecessaire,
        unite_mesure_id: ingredient.unite_mesure_id,
        reference_document: `REC-${this.id}`,
        motif: `Préparation ${this.nom} x${quantite}`
      });
      
      mouvements.push(mouvement);
    }

    return mouvements;
  }

  // Obtenir la liste des allergènes de la recette
  async getAllergenes() {
    const ingredients = await this.getIngredientsRecette({
      include: ['Intrant']
    });

    const allergenes = new Set();
    for (const ingredient of ingredients) {
      const intrant = ingredient.Intrant;
      if (intrant.allergenes) {
        const allergenesList = JSON.parse(intrant.allergenes);
        allergenesList.forEach(allergene => allergenes.add(allergene));
      }
    }

    return Array.from(allergenes);
  }
}

Recette.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  article_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: {
      msg: 'Cet article a déjà une recette'
    },
    references: {
      model: 'articles',
      key: 'id'
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
  nombre_portions: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: {
        args: [1],
        msg: 'Le nombre de portions doit être supérieur à 0'
      }
    }
  },
  temps_preparation: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: {
        args: [0],
        msg: 'Le temps de préparation ne peut pas être négatif'
      }
    }
  },
  instructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cout_production: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: {
        args: [0],
        msg: 'Le coût de production ne peut pas être négatif'
      }
    }
  }
}, {
  sequelize,
  modelName: 'Recette',
  tableName: 'recettes',
  timestamps: true,
  underscored: true,
  hooks: {
    afterCreate: async (recette) => {
      // Mettre à jour le temps de préparation de l'article associé
      if (recette.temps_preparation) {
        await sequelize.models.Article.update(
          { temps_preparation: recette.temps_preparation },
          { where: { id: recette.article_id } }
        );
      }
    },
    afterUpdate: async (recette) => {
      // Mettre à jour le temps de préparation de l'article si modifié
      if (recette.changed('temps_preparation')) {
        await sequelize.models.Article.update(
          { temps_preparation: recette.temps_preparation },
          { where: { id: recette.article_id } }
        );
      }
    }
  }
});

module.exports = Recette;
