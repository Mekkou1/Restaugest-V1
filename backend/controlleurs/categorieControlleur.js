const { CategorieMenu, Article } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

exports.creerCategorie = async (req, res, next) => {
  try {
    const { nom, description, parent_id, ordre, image, active } = req.body;

    // Vérifier si une catégorie avec le même nom existe déjà
    const categorieExistante = await CategorieMenu.findOne({
      where: { nom }
    });

    if (categorieExistante) {
      return next(new AppError('Une catégorie avec ce nom existe déjà', 400));
    }

    // Vérifier si la catégorie parente existe
    if (parent_id) {
      const parentCategorie = await CategorieMenu.findByPk(parent_id);
      if (!parentCategorie) {
        return next(new AppError('Catégorie parente non trouvée', 404));
      }
    }

    // Créer la catégorie
    const categorie = await CategorieMenu.create({
      nom,
      description,
      parent_id,
      ordre: ordre || 0,
      image,
      active: active !== undefined ? active : true
    });

    // Notifier via WebSocket
    req.wsUtils.notifyMenu.categoryCreated(req.wsUtils, {
      categorie: {
        id: categorie.id,
        nom: categorie.nom,
        parent_id: categorie.parent_id
      }
    });

    res.status(201).json({
      status: 'success',
      data: categorie
    });
  } catch (error) {
    next(error);
  }
};

exports.mettreAJourCategorie = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nom, description, parent_id, ordre, image, active } = req.body;

    const categorie = await CategorieMenu.findByPk(id);
    if (!categorie) {
      return next(new AppError('Catégorie non trouvée', 404));
    }

    // Vérifier si le nouveau nom n'est pas déjà utilisé
    if (nom && nom !== categorie.nom) {
      const categorieExistante = await CategorieMenu.findOne({
        where: { 
          nom,
          id: { [Op.ne]: id }
        }
      });

      if (categorieExistante) {
        return next(new AppError('Une catégorie avec ce nom existe déjà', 400));
      }
    }

    // Vérifier si la nouvelle catégorie parente existe
    if (parent_id && parent_id !== categorie.parent_id) {
      // Empêcher de définir une sous-catégorie comme parent
      const sousCategories = await categorie.getSousCategories();
      if (sousCategories.some(sc => sc.id === parent_id)) {
        return next(new AppError('Une sous-catégorie ne peut pas devenir la catégorie parente', 400));
      }

      const parentCategorie = await CategorieMenu.findByPk(parent_id);
      if (!parentCategorie) {
        return next(new AppError('Catégorie parente non trouvée', 404));
      }
    }

    // Mettre à jour la catégorie
    await categorie.update({
      nom,
      description,
      parent_id,
      ordre,
      image,
      active
    });

    // Notifier via WebSocket
    req.wsUtils.notifyMenu.categoryUpdated(req.wsUtils, {
      categorie: {
        id: categorie.id,
        nom: categorie.nom,
        parent_id: categorie.parent_id,
        active: categorie.active
      }
    });

    res.status(200).json({
      status: 'success',
      data: categorie
    });
  } catch (error) {
    next(error);
  }
};

exports.supprimerCategorie = async (req, res, next) => {
  try {
    const { id } = req.params;

    const categorie = await CategorieMenu.findByPk(id);
    if (!categorie) {
      return next(new AppError('Catégorie non trouvée', 404));
    }

    // Vérifier s'il y a des articles dans cette catégorie
    const articlesCount = await Article.count({
      where: { categorie_id: id }
    });

    if (articlesCount > 0) {
      return next(new AppError('Impossible de supprimer une catégorie contenant des articles', 400));
    }

    // Vérifier s'il y a des sous-catégories
    const sousCategories = await categorie.getSousCategories();
    if (sousCategories.length > 0) {
      return next(new AppError('Impossible de supprimer une catégorie ayant des sous-catégories', 400));
    }

    await categorie.destroy();

    // Notifier via WebSocket
    req.wsUtils.notifyMenu.categoryDeleted(req.wsUtils, {
      categorie_id: id
    });

    res.status(200).json({
      status: 'success',
      message: 'Catégorie supprimée avec succès'
    });
  } catch (error) {
    next(error);
  }
};

exports.listerCategories = async (req, res, next) => {
  try {
    const { active, parent_id } = req.query;
    const where = {};

    if (active !== undefined) where.active = active === 'true';
    if (parent_id !== undefined) where.parent_id = parent_id || null;

    const categories = await CategorieMenu.findAll({
      where,
      include: [
        {
          model: Article,
          attributes: ['id', 'nom', 'prix', 'disponible']
        },
        {
          model: CategorieMenu,
          as: 'sousCategories',
          include: [{
            model: Article,
            attributes: ['id', 'nom', 'prix', 'disponible']
          }]
        }
      ],
      order: [
        ['parent_id', 'ASC'],
        ['ordre', 'ASC'],
        ['nom', 'ASC'],
        [{ model: CategorieMenu, as: 'sousCategories' }, 'ordre', 'ASC']
      ]
    });

    res.status(200).json({
      status: 'success',
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

exports.obtenirCategorie = async (req, res, next) => {
  try {
    const { id } = req.params;

    const categorie = await CategorieMenu.findByPk(id, {
      include: [
        {
          model: Article,
          attributes: ['id', 'nom', 'prix', 'disponible', 'image']
        },
        {
          model: CategorieMenu,
          as: 'sousCategories',
          include: [{
            model: Article,
            attributes: ['id', 'nom', 'prix', 'disponible', 'image']
          }]
        },
        {
          model: CategorieMenu,
          as: 'parent',
          attributes: ['id', 'nom']
        }
      ]
    });

    if (!categorie) {
      return next(new AppError('Catégorie non trouvée', 404));
    }

    res.status(200).json({
      status: 'success',
      data: categorie
    });
  } catch (error) {
    next(error);
  }
};

exports.reordonnerCategories = async (req, res, next) => {
  try {
    const { ordres } = req.body;

    // Vérifier que ordres est un tableau d'objets {id, ordre}
    if (!Array.isArray(ordres)) {
      return next(new AppError('Format invalide pour le réordonnancement', 400));
    }

    // Mettre à jour l'ordre de chaque catégorie
    await Promise.all(ordres.map(async ({ id, ordre }) => {
      const categorie = await CategorieMenu.findByPk(id);
      if (categorie) {
        await categorie.update({ ordre });
      }
    }));

    // Notifier via WebSocket
    req.wsUtils.notifyMenu.categoriesReordered(req.wsUtils, {
      ordres
    });

    res.status(200).json({
      status: 'success',
      message: 'Catégories réordonnées avec succès'
    });
  } catch (error) {
    next(error);
  }
};
