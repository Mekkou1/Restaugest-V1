const { Recette, Article, Intrant, IngredientRecette, UniteMesure } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const { notifyRecipe, notifyStock, notifyCuisine } = require('../utils/websocketUtils');

exports.creerRecette = async (req, res, next) => {
  try {
    const {
      article_id,
      nom,
      description,
      nombre_portions,
      temps_preparation,
      instructions,
      ingredients
    } = req.body;

    // Vérifier si l'article existe
    const article = await Article.findByPk(article_id);
    if (!article) {
      return next(new AppError('Article non trouvé', 404));
    }

    // Vérifier si l'article a déjà une recette
    const recetteExistante = await Recette.findOne({ where: { article_id } });
    if (recetteExistante) {
      return next(new AppError('Cet article a déjà une recette', 400));
    }

    // Créer la recette
    const recette = await Recette.create({
      article_id,
      nom,
      description,
      nombre_portions,
      temps_preparation,
      instructions
    });

    // Ajouter les ingrédients
    if (ingredients && ingredients.length > 0) {
      for (const ingredient of ingredients) {
        const intrant = await Intrant.findByPk(ingredient.intrant_id);
        if (!intrant) {
          throw new AppError(`Intrant ${ingredient.intrant_id} non trouvé`, 404);
        }

        await IngredientRecette.create({
          recette_id: recette.id,
          intrant_id: ingredient.intrant_id,
          quantite: ingredient.quantite,
          unite_mesure_id: ingredient.unite_mesure_id || intrant.unite_mesure_id,
          obligatoire: ingredient.obligatoire !== false,
          notes: ingredient.notes
        });
      }
    }

    // Calculer le coût de production
    await recette.calculerCoutProduction();

    // Récupérer la recette complète avec ses ingrédients
    const recetteComplete = await Recette.findByPk(recette.id, {
      include: [{
        model: IngredientRecette,
        as: 'ingredients',
        include: [
          { model: Intrant, as: 'intrant' },
          { model: UniteMesure, as: 'uniteMesure' }
        ]
      }]
    });

    // Notifier les cuisiniers de la nouvelle recette
    notifyRecipe.recipeCreated(req.wsUtils, {
      recette: {
        id: recetteComplete.id,
        nom: recetteComplete.nom,
        article_id: recetteComplete.article_id
      },
      user: {
        id: req.user.id,
        nom: req.user.nom,
        prenom: req.user.prenom
      }
    });

    res.status(201).json({
      status: 'success',
      data: recetteComplete
    });
  } catch (error) {
    next(error);
  }
};

exports.mettreAJourRecette = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      nom,
      description,
      nombre_portions,
      temps_preparation,
      instructions,
      ingredients
    } = req.body;

    const recette = await Recette.findByPk(id);
    if (!recette) {
      return next(new AppError('Recette non trouvée', 404));
    }

    // Mettre à jour les informations de base
    await recette.update({
      nom,
      description,
      nombre_portions,
      temps_preparation,
      instructions
    });

    // Mettre à jour les ingrédients si fournis
    if (ingredients) {
      // Supprimer les anciens ingrédients
      await IngredientRecette.destroy({
        where: { recette_id: id }
      });

      // Ajouter les nouveaux ingrédients
      for (const ingredient of ingredients) {
        const intrant = await Intrant.findByPk(ingredient.intrant_id);
        if (!intrant) {
          throw new AppError(`Intrant ${ingredient.intrant_id} non trouvé`, 404);
        }

        await IngredientRecette.create({
          recette_id: id,
          intrant_id: ingredient.intrant_id,
          quantite: ingredient.quantite,
          unite_mesure_id: ingredient.unite_mesure_id || intrant.unite_mesure_id,
          obligatoire: ingredient.obligatoire !== false,
          notes: ingredient.notes
        });
      }

      // Recalculer le coût de production
      await recette.calculerCoutProduction();
    }

    // Récupérer la recette mise à jour
    const recetteMAJ = await Recette.findByPk(id, {
      include: [{
        model: IngredientRecette,
        as: 'ingredients',
        include: [
          { model: Intrant, as: 'intrant' },
          { model: UniteMesure, as: 'uniteMesure' }
        ]
      }]
    });

    res.status(200).json({
      status: 'success',
      data: recetteMAJ
    });
  } catch (error) {
    next(error);
  }
};

exports.supprimerRecette = async (req, res, next) => {
  try {
    const { id } = req.params;

    const recette = await Recette.findByPk(id);
    if (!recette) {
      return next(new AppError('Recette non trouvée', 404));
    }

    await recette.destroy();

    // Notifier les cuisiniers de la suppression
    notifyRecipe.recipeDeleted(req.wsUtils, {
      recette: {
        id: recette.id,
        nom: recette.nom,
        article_id: recette.article_id
      },
      user: {
        id: req.user.id,
        nom: req.user.nom,
        prenom: req.user.prenom
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Recette supprimée avec succès'
    });
  } catch (error) {
    next(error);
  }
};

exports.obtenirRecette = async (req, res, next) => {
  try {
    const { id } = req.params;

    const recette = await Recette.findByPk(id, {
      include: [
        {
          model: Article,
          as: 'article'
        },
        {
          model: IngredientRecette,
          as: 'ingredients',
          include: [
            { model: Intrant, as: 'intrant' },
            { model: UniteMesure, as: 'uniteMesure' }
          ]
        }
      ]
    });

    if (!recette) {
      return next(new AppError('Recette non trouvée', 404));
    }

    res.status(200).json({
      status: 'success',
      data: recette
    });
  } catch (error) {
    next(error);
  }
};

exports.verifierDisponibiliteIngredients = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantite = 1 } = req.query;

    const recette = await Recette.findByPk(id);
    if (!recette) {
      return next(new AppError('Recette non trouvée', 404));
    }

    const disponibilite = await recette.verifierDisponibiliteIngredients(quantite);

    res.status(200).json({
      status: 'success',
      data: disponibilite
    });
  } catch (error) {
    next(error);
  }
};

exports.preparerRecette = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantite = 1 } = req.body;

    const recette = await Recette.findByPk(id);
    if (!recette) {
      return next(new AppError('Recette non trouvée', 404));
    }

    // Vérifier la disponibilité des ingrédients
    const disponibilite = await recette.verifierDisponibiliteIngredients(quantite);
    if (!disponibilite.disponible) {
      return next(new AppError('Ingrédients insuffisants pour préparer la recette', 400));
    }

    // Déduire les ingrédients du stock
    const mouvements = await recette.deduireIngredients(quantite);

    // Notifier de la préparation
    notifyCuisine.startPreparation(req.wsUtils, {
      recette: {
        id: recette.id,
        nom: recette.nom,
        article_id: recette.article_id
      },
      quantite,
      user: {
        id: req.user.id,
        nom: req.user.nom,
        prenom: req.user.prenom
      }
    });

    // Vérifier les niveaux de stock après déduction
    const ingredients = await recette.getIngredientsRecette({
      include: ['Intrant']
    });

    for (const ingredient of ingredients) {
      const intrant = ingredient.Intrant;
      if (intrant.isStockBas()) {
        notifyStock.lowStock(req.wsUtils, {
          intrant: {
            id: intrant.id,
            code: intrant.code,
            nom: intrant.nom,
            stock_actuel: intrant.stock_actuel,
            stock_minimum: intrant.stock_minimum
          }
        });
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Ingrédients déduits du stock avec succès',
      data: {
        mouvements
      }
    });
  } catch (error) {
    next(error);
  }
};
