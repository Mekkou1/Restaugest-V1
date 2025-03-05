const { MenuSalle, CategorieMenuSalle, Article, CategorieMenu, PrixArticleSalle } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

exports.creerMenuSalle = async (req, res, next) => {
  try {
    const { salle_id, nom, description, categories, date_debut, date_fin } = req.body;

    // Vérifier si un menu existe déjà pour cette salle
    const menuExistant = await MenuSalle.findOne({
      where: { 
        salle_id,
        actif: true,
        [Op.or]: [
          { date_fin: null },
          { date_fin: { [Op.gt]: new Date() } }
        ]
      }
    });

    if (menuExistant) {
      return next(new AppError('Un menu actif existe déjà pour cette salle', 400));
    }

    const transaction = await sequelize.transaction();

    try {
      // Créer le menu
      const menu = await MenuSalle.create({
        salle_id,
        nom,
        description,
        actif: true,
        date_debut: date_debut || new Date(),
        date_fin
      }, { transaction });

      // Ajouter les catégories si fournies
      if (categories && categories.length > 0) {
        await Promise.all(categories.map((cat, index) => 
          CategorieMenuSalle.create({
            menu_salle_id: menu.id,
            categorie_id: cat.categorie_id,
            ordre: cat.ordre || index,
            actif: cat.actif !== undefined ? cat.actif : true
          }, { transaction })
        ));
      }

      await transaction.commit();

      // Notifier via WebSocket
      req.wsUtils.notifyMenu.menuCreated(req.wsUtils, {
        menu: {
          id: menu.id,
          nom: menu.nom,
          salle_id: menu.salle_id
        }
      });

      res.status(201).json({
        status: 'success',
        data: menu
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

exports.mettreAJourMenu = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nom, description, actif, date_debut, date_fin } = req.body;

    const menu = await MenuSalle.findByPk(id);
    if (!menu) {
      return next(new AppError('Menu non trouvé', 404));
    }

    // Mettre à jour le menu
    await menu.update({
      nom,
      description,
      actif,
      date_debut,
      date_fin
    });

    // Notifier via WebSocket
    req.wsUtils.notifyMenu.menuUpdated(req.wsUtils, {
      menu: {
        id: menu.id,
        nom: menu.nom,
        actif: menu.actif
      }
    });

    res.status(200).json({
      status: 'success',
      data: menu
    });
  } catch (error) {
    next(error);
  }
};

exports.gererCategoriesMenu = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { categories } = req.body;

    const menu = await MenuSalle.findByPk(id);
    if (!menu) {
      return next(new AppError('Menu non trouvé', 404));
    }

    const transaction = await sequelize.transaction();

    try {
      // Supprimer les anciennes associations
      await CategorieMenuSalle.destroy({
        where: { menu_salle_id: id },
        transaction
      });

      // Créer les nouvelles associations
      if (categories && categories.length > 0) {
        await Promise.all(categories.map((cat, index) => 
          CategorieMenuSalle.create({
            menu_salle_id: id,
            categorie_id: cat.categorie_id,
            ordre: cat.ordre || index,
            actif: cat.actif !== undefined ? cat.actif : true
          }, { transaction })
        ));
      }

      await transaction.commit();

      // Notifier via WebSocket
      req.wsUtils.notifyMenu.categoriesUpdated(req.wsUtils, {
        menu: {
          id: menu.id,
          nom: menu.nom
        }
      });

      res.status(200).json({
        status: 'success',
        message: 'Catégories mises à jour avec succès'
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

exports.definirPrixArticles = async (req, res, next) => {
  try {
    const { salle_id } = req.params;
    const { prix } = req.body;

    const transaction = await sequelize.transaction();

    try {
      // Mettre à jour ou créer les prix
      await Promise.all(prix.map(async (p) => {
        await PrixArticleSalle.upsert({
          article_id: p.article_id,
          salle_id,
          devise_id: p.devise_id,
          prix_ht: p.prix_ht,
          taux_tva: p.taux_tva,
          actif: p.actif !== undefined ? p.actif : true,
          date_debut: p.date_debut || new Date(),
          date_fin: p.date_fin
        }, { transaction });
      }));

      await transaction.commit();

      // Notifier via WebSocket
      req.wsUtils.notifyMenu.pricesUpdated(req.wsUtils, {
        salle_id,
        articles_count: prix.length
      });

      res.status(200).json({
        status: 'success',
        message: 'Prix mis à jour avec succès'
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

exports.changerDisponibiliteArticle = async (req, res, next) => {
  try {
    const { salle_id, article_id } = req.params;
    const { disponible } = req.body;

    const articleSalle = await ArticleSalle.findOne({
      where: {
        article_id,
        salle_id
      }
    });

    if (!articleSalle) {
      return next(new AppError('Article non trouvé dans cette salle', 404));
    }

    await articleSalle.update({ disponible });

    // Notifier via WebSocket
    req.wsUtils.notifyMenu.articleAvailabilityChanged(req.wsUtils, {
      article_id,
      salle_id,
      disponible
    });

    res.status(200).json({
      status: 'success',
      data: articleSalle
    });
  } catch (error) {
    next(error);
  }
};

exports.listerMenus = async (req, res, next) => {
  try {
    const { salle_id, actif } = req.query;
    const where = {};

    if (salle_id) where.salle_id = salle_id;
    if (actif !== undefined) where.actif = actif === 'true';

    const menus = await MenuSalle.findAll({
      where,
      include: [
        {
          model: CategorieMenuSalle,
          include: [{
            model: CategorieMenu,
            include: [{
              model: Article,
              include: [{
                model: PrixArticleSalle,
                where: { salle_id },
                required: false
              }]
            }]
          }]
        }
      ],
      order: [
        ['date_debut', 'DESC'],
        [{ model: CategorieMenuSalle }, 'ordre', 'ASC']
      ]
    });

    res.status(200).json({
      status: 'success',
      data: menus
    });
  } catch (error) {
    next(error);
  }
};

exports.obtenirMenu = async (req, res, next) => {
  try {
    const { id } = req.params;

    const menu = await MenuSalle.findByPk(id, {
      include: [
        {
          model: CategorieMenuSalle,
          include: [{
            model: CategorieMenu,
            include: [{
              model: Article,
              include: [{
                model: PrixArticleSalle,
                where: { salle_id: menu.salle_id },
                required: false
              }]
            }]
          }]
        }
      ]
    });

    if (!menu) {
      return next(new AppError('Menu non trouvé', 404));
    }

    res.status(200).json({
      status: 'success',
      data: menu
    });
  } catch (error) {
    next(error);
  }
};

exports.obtenirPrixArticles = async (req, res, next) => {
  try {
    const { salle_id } = req.params;
    const { categorie_id, actif } = req.query;

    const where = { salle_id };
    if (actif !== undefined) where.actif = actif === 'true';

    const prix = await PrixArticleSalle.findAll({
      where,
      include: [{
        model: Article,
        where: categorie_id ? { categorie_id } : {},
        include: [{ model: CategorieMenu }]
      }],
      order: [
        [{ model: Article }, { model: CategorieMenu }, 'ordre', 'ASC'],
        [{ model: Article }, 'nom', 'ASC']
      ]
    });

    res.status(200).json({
      status: 'success',
      data: prix
    });
  } catch (error) {
    next(error);
  }
};
