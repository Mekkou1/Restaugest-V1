const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class CategorieMenu extends Model {
  // Obtenir tous les articles de la catégorie
  async getArticlesActifs() {
    return await this.getArticles({
      where: { disponible: true },
      order: [['nom', 'ASC']]
    });
  }

  // Obtenir toutes les sous-catégories
  async getSousCategories() {
    return await CategorieMenu.findAll({
      where: { parent_id: this.id },
      order: [['ordre', 'ASC']]
    });
  }

  // Vérifier si la catégorie a des sous-catégories
  async hasSousCategories() {
    const count = await CategorieMenu.count({
      where: { parent_id: this.id }
    });
    return count > 0;
  }

  // Obtenir l'arborescence complète des parents
  async getArborescence() {
    const arborescence = [this];
    let currentCategorie = this;

    while (currentCategorie.parent_id) {
      currentCategorie = await CategorieMenu.findByPk(currentCategorie.parent_id);
      if (currentCategorie) {
        arborescence.unshift(currentCategorie);
      } else {
        break;
      }
    }

    return arborescence;
  }

  // Obtenir le chemin complet (noms séparés par des ">")
  async getCheminComplet() {
    const arborescence = await this.getArborescence();
    return arborescence.map(cat => cat.nom).join(' > ');
  }
}

CategorieMenu.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  image_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: {
        msg: 'L\'URL de l\'image n\'est pas valide'
      }
    }
  },
  ordre: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: {
        args: [0],
        msg: 'L\'ordre ne peut pas être négatif'
      }
    }
  },
  actif: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'categories_menu',
      key: 'id'
    },
    validate: {
      async isValidParent(value) {
        if (value === this.id) {
          throw new Error('Une catégorie ne peut pas être son propre parent');
        }
        // Vérifier les boucles dans l'arborescence
        if (value) {
          let currentParentId = value;
          const visited = new Set();
          while (currentParentId) {
            if (visited.has(currentParentId)) {
              throw new Error('Boucle détectée dans l\'arborescence des catégories');
            }
            visited.add(currentParentId);
            const parent = await CategorieMenu.findByPk(currentParentId);
            if (!parent) break;
            currentParentId = parent.parent_id;
          }
        }
      }
    }
  }
}, {
  sequelize,
  modelName: 'CategorieMenu',
  tableName: 'categories_menu',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (categorie) => {
      // Si l'ordre n'est pas spécifié, mettre à la fin
      if (!categorie.ordre) {
        const maxOrdre = await CategorieMenu.max('ordre', {
          where: { parent_id: categorie.parent_id }
        });
        categorie.ordre = (maxOrdre || 0) + 1;
      }
    },
    afterUpdate: async (categorie) => {
      // Si la catégorie est désactivée, désactiver aussi les sous-catégories
      if (categorie.changed('actif') && !categorie.actif) {
        await CategorieMenu.update(
          { actif: false },
          { where: { parent_id: categorie.id } }
        );
      }
    }
  },
  indexes: [
    {
      name: 'idx_parent_id',
      fields: ['parent_id']
    },
    {
      name: 'idx_ordre',
      fields: ['ordre']
    }
  ]
});

// Associations réflexives pour la hiérarchie
CategorieMenu.belongsTo(CategorieMenu, {
  as: 'parent',
  foreignKey: 'parent_id'
});

CategorieMenu.hasMany(CategorieMenu, {
  as: 'sousCategories',
  foreignKey: 'parent_id'
});

module.exports = CategorieMenu;
