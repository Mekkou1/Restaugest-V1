const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// Import des modèles
const Article = require('./Article');
const CategorieMenu = require('./CategorieMenu');
const IngredientRecette = require('./IngredientRecette');
const Intrant = require('./Intrant');
const MouvementStock = require('./MouvementStock');
const Recette = require('./Recette');
const Session = require('./Session');
const UniteMesure = require('./UniteMesure');
const Utilisateur = require('./Utilisateur');

// Associations pour les articles et catégories
Article.belongsTo(CategorieMenu, {
  foreignKey: 'categorie_id',
  as: 'categorie'
});

CategorieMenu.hasMany(Article, {
  foreignKey: 'categorie_id',
  as: 'articles'
});

// Associations pour les recettes
Article.hasOne(Recette, {
  foreignKey: 'article_id',
  as: 'recette'
});

Recette.belongsTo(Article, {
  foreignKey: 'article_id',
  as: 'article'
});

Recette.hasMany(IngredientRecette, {
  foreignKey: 'recette_id',
  as: 'ingredients'
});

IngredientRecette.belongsTo(Recette, {
  foreignKey: 'recette_id',
  as: 'recette'
});

// Associations pour les intrants
IngredientRecette.belongsTo(Intrant, {
  foreignKey: 'intrant_id',
  as: 'intrant'
});

Intrant.hasMany(IngredientRecette, {
  foreignKey: 'intrant_id',
  as: 'utilisationsDansRecettes'
});

Intrant.belongsTo(UniteMesure, {
  foreignKey: 'unite_mesure_id',
  as: 'uniteMesure'
});

UniteMesure.hasMany(Intrant, {
  foreignKey: 'unite_mesure_id',
  as: 'intrants'
});

// Associations pour les mouvements de stock
MouvementStock.belongsTo(Intrant, {
  foreignKey: 'intrant_id',
  as: 'intrant'
});

Intrant.hasMany(MouvementStock, {
  foreignKey: 'intrant_id',
  as: 'mouvements'
});

MouvementStock.belongsTo(UniteMesure, {
  foreignKey: 'unite_mesure_id',
  as: 'uniteMesure'
});

MouvementStock.belongsTo(Utilisateur, {
  foreignKey: 'effectue_par',
  as: 'effectuePar'
});

// Associations pour les sessions utilisateur
Session.belongsTo(Utilisateur, {
  foreignKey: 'user_id',
  as: 'utilisateur'
});

Utilisateur.hasMany(Session, {
  foreignKey: 'user_id',
  as: 'sessions'
});

// Associations hiérarchiques pour les catégories
CategorieMenu.belongsTo(CategorieMenu, {
  foreignKey: 'parent_id',
  as: 'parent'
});

CategorieMenu.hasMany(CategorieMenu, {
  foreignKey: 'parent_id',
  as: 'sousCategories'
});

// Export des modèles
module.exports = {
  sequelize,
  Article,
  CategorieMenu,
  IngredientRecette,
  Intrant,
  MouvementStock,
  Recette,
  Session,
  UniteMesure,
  Utilisateur
};

// Synchronisation des modèles avec la base de données
if (process.env.NODE_ENV === 'development') {
  sequelize.sync({ alter: true })
    .then(() => {
      console.log('Base de données synchronisée en mode development');
    })
    .catch(err => {
      console.error('Erreur lors de la synchronisation de la base de données:', err);
    });
}
