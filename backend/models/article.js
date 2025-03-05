const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Article extends Model {
  // Vérifier si l'article est disponible
  isDisponible() {
    return this.disponible && (!this.en_stock || this.stock_actuel > 0);
  }

  // Vérifier si le stock est bas
  isStockBas() {
    return this.en_stock && this.stock_minimum && this.stock_actuel <= this.stock_minimum;
  }

  // Calculer le prix TTC pour une devise donnée
  async getPrixTTC(deviseId) {
    const prixArticle = await this.getPrixArticlesDevises({
      where: { devise_id: deviseId }
    });

    if (!prixArticle || prixArticle.length === 0) {
      return null;
    }

    return prixArticle[0].prix_ttc;
  }

  // Obtenir les prix pour toutes les devises
  async getAllPrix() {
    return await this.getPrixArticlesDevises();
  }

  // Obtenir la recette associée si elle existe
  async getRecetteDetails() {
    return await this.getRecette({
      include: [{
        model: sequelize.models.IngredientsRecette,
        include: [sequelize.models.Intrant]
      }]
    });
  }

  // Vérifier la disponibilité des ingrédients
  async verifierDisponibiliteIngredients() {
    const recette = await this.getRecetteDetails();
    if (!recette) return true; // Si pas de recette, considéré comme disponible

    for (const ingredient of recette.IngredientsRecette) {
      const intrant = ingredient.Intrant;
      if (intrant.suivi_stock && intrant.stock_actuel < ingredient.quantite) {
        return false;
      }
    }
    return true;
  }
}

Article.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(50),
    unique: {
      msg: 'Ce code est déjà utilisé'
    },
    validate: {
      len: {
        args: [3, 50],
        msg: 'Le code doit contenir entre 3 et 50 caractères'
      }
    }
  },
  nom: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notNull: { msg: 'Le nom est requis' },
      notEmpty: { msg: 'Le nom ne peut pas être vide' },
      len: {
        args: [2, 100],
        msg: 'Le nom doit contenir entre 2 et 100 caractères'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  categorie_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'categories_menu',
      key: 'id'
    }
  },
  image_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: {
        msg: 'L\'URL de l\'image n\'est pas valide'
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
  disponible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  en_stock: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  stock_minimum: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: {
        args: [0],
        msg: 'Le stock minimum ne peut pas être négatif'
      }
    }
  },
  type: {
    type: DataTypes.ENUM('plat', 'boisson', 'dessert', 'entree', 'supplement'),
    allowNull: false,
    validate: {
      notNull: { msg: 'Le type est requis' },
      isIn: {
        args: [['plat', 'boisson', 'dessert', 'entree', 'supplement']],
        msg: 'Type invalide'
      }
    }
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
  modelName: 'Article',
  tableName: 'articles',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (article) => {
      if (!article.code) {
        // Générer un code unique si non fourni
        const prefix = article.type.substring(0, 3).toUpperCase();
        const count = await Article.count({ where: { type: article.type } });
        article.code = `${prefix}${(count + 1).toString().padStart(3, '0')}`;
      }
    },
    afterCreate: async (article) => {
      // Créer les prix par défaut dans la devise principale
      const devisePrincipale = await sequelize.models.Devise.findOne({
        where: { devise_principale: true }
      });
      if (devisePrincipale) {
        await article.createPrixArticlesDevise({
          devise_id: devisePrincipale.id,
          prix_ht: 0,
          taux_tva: 20, // Taux par défaut
          actif: true
        });
      }
    }
  }
});

module.exports = Article;
