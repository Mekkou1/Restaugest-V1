const { Article, CategorieMenu, Recette, IngredientRecette, Intrant } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

exports.creerArticle = async (req, res, next) => {
  try {
    const { 
      nom, 
      description, 
      prix, 
      categorie_id, 
      image, 
      disponible,
      temps_preparation,
      allergenes 
    } = req.body;

    // Vérifier si la catégorie existe
    if (categorie_id) {
      const categorie = await CategorieMenu.findByPk(categorie_id);
      if (!categorie) {
        return next(new AppError('Catégorie non trouvée', 404));
      }
    }

    // Créer l'article
    const article = await Article.create({
      nom,
      description,
      prix,
      categorie_id,
      image,
      disponible: disponible !== undefined ? disponible : true,
      temps_preparation,
      allergenes: allergenes ? JSON.stringify(allergenes) : null
    });

    // Notifier via WebSocket
    req.wsUtils.notifyMenu.articleCreated(req.wsUtils, {
      article: {
        id: article.id,
        nom: article.nom,
        prix: article.prix,
        disponible: article.disponible
      }
    });

    res.status(201).json({
      status: 'success',
      data: article
    });
  } catch (error) {
    next(error);
  }
};

exports.mettreAJourArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      nom, 
      description, 
      prix, 
      categorie_id, 
      image, 
      disponible,
      temps_preparation,
      allergenes 
    } = req.body;

    const article = await Article.findByPk(id);
    if (!article) {
      return next(new AppError('Article non trouvé', 404));
    }

    // Vérifier si la nouvelle catégorie existe
    if (categorie_id && categorie_id !== article.categorie_id) {
      const categorie = await CategorieMenu.findByPk(categorie_id);
      if (!categorie) {
        return next(new AppError('Catégorie non trouvée', 404));
      }
    }

    // Mettre à jour l'article
    await article.update({
      nom,
      description,
      prix,
      categorie_id,
      image,
      disponible,
      temps_preparation,
      allergenes: allergenes ? JSON.stringify(allergenes) : article.allergenes
    });

    // Notifier via WebSocket
    req.wsUtils.notifyMenu.articleUpdated(req.wsUtils, {
      article: {
        id: article.id,
        nom: article.nom,
        prix: article.prix,
        disponible: article.disponible
      }
    });

    res.status(200).json({
      status: 'success',
      data: article
    });
  } catch (error) {
    next(error);
  }
};

exports.supprimerArticle = async (req, res, next) => {
  try {
    const { id } = req.params;

    const article = await Article.findByPk(id);
    if (!article) {
      return next(new AppError('Article non trouvé', 404));
    }

    // Vérifier si l'article est utilisé dans des commandes actives
    const commandesActives = await article.getCommandes({
      where: {
        statut: {
          [Op.notIn]: ['terminée', 'annulée']
        }
      }
    });

    if (commandesActives.length > 0) {
      return next(new AppError('Impossible de supprimer un article utilisé dans des commandes actives', 400));
    }

    await article.destroy();

    // Notifier via WebSocket
    req.wsUtils.notifyMenu.articleDeleted(req.wsUtils, {
      article_id: id
    });

    res.status(200).json({
      status: 'success',
      message: 'Article supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

exports.changerDisponibilite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { disponible } = req.body;

    const article = await Article.findByPk(id);
    if (!article) {
      return next(new AppError('Article non trouvé', 404));
    }

    await article.update({ disponible });

    // Si l'article devient indisponible, vérifier les ingrédients
    if (!disponible) {
      const recette = await article.getRecette({
        include: [{
          model: IngredientRecette,
          include: [Intrant]
        }]
      });

      if (recette) {
        const ingredientsManquants = recette.IngredientRecettes.filter(ingredient => 
          !ingredient.Intrant.isStockSuffisant(ingredient.quantite)
        );

        if (ingredientsManquants.length > 0) {
          // Notifier le manque d'ingrédients
          req.wsUtils.notifyStock.lowStock(req.wsUtils, {
            article: article.nom,
            ingredients: ingredientsManquants.map(ing => ({
              nom: ing.Intrant.nom,
              stock_actuel: ing.Intrant.stock_actuel,
              quantite_necessaire: ing.quantite
            }))
          });
        }
      }
    }

    // Notifier via WebSocket
    req.wsUtils.notifyMenu.articleAvailabilityChanged(req.wsUtils, {
      article: {
        id: article.id,
        nom: article.nom,
        disponible: article.disponible
      }
    });

    res.status(200).json({
      status: 'success',
      data: article
    });
  } catch (error) {
    next(error);
  }
};

exports.listerArticles = async (req, res, next) => {
  try {
    const { categorie_id, disponible } = req.query;
    const where = {};

    if (categorie_id) where.categorie_id = categorie_id;
    if (disponible !== undefined) where.disponible = disponible === 'true';

    const articles = await Article.findAll({
      where,
      include: [{
        model: CategorieMenu,
        attributes: ['id', 'nom']
      }],
      order: [
        ['categorie_id', 'ASC'],
        ['nom', 'ASC']
      ]
    });

    res.status(200).json({
      status: 'success',
      data: articles
    });
  } catch (error) {
    next(error);
  }
};

exports.obtenirArticle = async (req, res, next) => {
  try {
    const { id } = req.params;

    const article = await Article.findByPk(id, {
      include: [
        {
          model: CategorieMenu,
          attributes: ['id', 'nom']
        },
        {
          model: Recette,
          include: [{
            model: IngredientRecette,
            include: [Intrant]
          }]
        }
      ]
    });

    if (!article) {
      return next(new AppError('Article non trouvé', 404));
    }

    res.status(200).json({
      status: 'success',
      data: article
    });
  } catch (error) {
    next(error);
  }
};
