const { Salle, TableRestaurant } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

exports.creerSalle = async (req, res, next) => {
  try {
    const { nom, description, capacite, etage, plan } = req.body;

    // Vérifier si une salle avec le même nom existe déjà
    const salleExistante = await Salle.findOne({
      where: { nom }
    });

    if (salleExistante) {
      return next(new AppError('Une salle avec ce nom existe déjà', 400));
    }

    // Créer la salle
    const salle = await Salle.create({
      nom,
      description,
      capacite,
      etage,
      plan
    });

    // Notifier via WebSocket
    req.wsUtils.notifyServers.salleCreated(req.wsUtils, {
      salle: {
        id: salle.id,
        nom: salle.nom,
        etage: salle.etage
      }
    });

    res.status(201).json({
      status: 'success',
      data: salle
    });
  } catch (error) {
    next(error);
  }
};

exports.mettreAJourSalle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nom, description, capacite, etage, plan } = req.body;

    const salle = await Salle.findByPk(id);
    if (!salle) {
      return next(new AppError('Salle non trouvée', 404));
    }

    // Vérifier si le nouveau nom n'est pas déjà utilisé par une autre salle
    if (nom && nom !== salle.nom) {
      const salleExistante = await Salle.findOne({
        where: { nom }
      });

      if (salleExistante) {
        return next(new AppError('Une salle avec ce nom existe déjà', 400));
      }
    }

    // Mettre à jour la salle
    await salle.update({
      nom,
      description,
      capacite,
      etage,
      plan
    });

    // Notifier via WebSocket
    req.wsUtils.notifyServers.salleUpdated(req.wsUtils, {
      salle: {
        id: salle.id,
        nom: salle.nom,
        etage: salle.etage
      }
    });

    res.status(200).json({
      status: 'success',
      data: salle
    });
  } catch (error) {
    next(error);
  }
};

exports.supprimerSalle = async (req, res, next) => {
  try {
    const { id } = req.params;

    const salle = await Salle.findByPk(id);
    if (!salle) {
      return next(new AppError('Salle non trouvée', 404));
    }

    // Vérifier s'il y a des tables dans cette salle
    const tablesCount = await TableRestaurant.count({
      where: { salle_id: id }
    });

    if (tablesCount > 0) {
      return next(new AppError('Impossible de supprimer une salle contenant des tables', 400));
    }

    await salle.destroy();

    // Notifier via WebSocket
    req.wsUtils.notifyServers.salleDeleted(req.wsUtils, {
      salle_id: id
    });

    res.status(200).json({
      status: 'success',
      message: 'Salle supprimée avec succès'
    });
  } catch (error) {
    next(error);
  }
};

exports.listerSalles = async (req, res, next) => {
  try {
    const { etage } = req.query;
    const where = {};

    if (etage !== undefined) {
      where.etage = etage;
    }

    const salles = await Salle.findAll({
      where,
      include: [{
        model: TableRestaurant,
        attributes: ['id', 'numero', 'capacite', 'statut', 'position_x', 'position_y']
      }],
      order: [
        ['etage', 'ASC'],
        ['nom', 'ASC']
      ]
    });

    res.status(200).json({
      status: 'success',
      data: salles
    });
  } catch (error) {
    next(error);
  }
};

exports.obtenirSalle = async (req, res, next) => {
  try {
    const { id } = req.params;

    const salle = await Salle.findByPk(id, {
      include: [{
        model: TableRestaurant,
        attributes: ['id', 'numero', 'capacite', 'statut', 'position_x', 'position_y']
      }]
    });

    if (!salle) {
      return next(new AppError('Salle non trouvée', 404));
    }

    res.status(200).json({
      status: 'success',
      data: salle
    });
  } catch (error) {
    next(error);
  }
};

exports.obtenirPlanSalle = async (req, res, next) => {
  try {
    const { id } = req.params;

    const salle = await Salle.findByPk(id, {
      include: [{
        model: TableRestaurant,
        attributes: ['id', 'numero', 'capacite', 'statut', 'position_x', 'position_y'],
        include: [{
          model: Commande,
          where: {
            statut: {
              [Op.notIn]: ['terminée', 'annulée']
            }
          },
          required: false
        }]
      }]
    });

    if (!salle) {
      return next(new AppError('Salle non trouvée', 404));
    }

    // Formater les données pour le plan
    const plan = {
      salle: {
        id: salle.id,
        nom: salle.nom,
        etage: salle.etage,
        plan: salle.plan
      },
      tables: salle.TableRestaurants.map(table => ({
        id: table.id,
        numero: table.numero,
        capacite: table.capacite,
        statut: table.statut,
        position: {
          x: table.position_x,
          y: table.position_y
        },
        commande_active: table.Commandes.length > 0 ? {
          id: table.Commandes[0].id,
          statut: table.Commandes[0].statut
        } : null
      }))
    };

    res.status(200).json({
      status: 'success',
      data: plan
    });
  } catch (error) {
    next(error);
  }
};
