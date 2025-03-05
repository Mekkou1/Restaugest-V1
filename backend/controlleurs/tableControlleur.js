const { TableRestaurant, Salle, Commande } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

exports.creerTable = async (req, res, next) => {
  try {
    const { numero, capacite, salle_id, position_x, position_y, statut } = req.body;

    // Vérifier si la salle existe
    const salle = await Salle.findByPk(salle_id);
    if (!salle) {
      return next(new AppError('Salle non trouvée', 404));
    }

    // Vérifier si le numéro de table existe déjà dans la salle
    const tableExistante = await TableRestaurant.findOne({
      where: {
        numero,
        salle_id
      }
    });

    if (tableExistante) {
      return next(new AppError('Ce numéro de table existe déjà dans cette salle', 400));
    }

    // Créer la table
    const table = await TableRestaurant.create({
      numero,
      capacite,
      salle_id,
      position_x,
      position_y,
      statut: statut || 'libre'
    });

    // Notifier via WebSocket
    req.wsUtils.notifyServers.tableCreated(req.wsUtils, {
      table: {
        id: table.id,
        numero: table.numero,
        salle_id: table.salle_id,
        statut: table.statut
      }
    });

    res.status(201).json({
      status: 'success',
      data: table
    });
  } catch (error) {
    next(error);
  }
};

exports.mettreAJourTable = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { numero, capacite, salle_id, position_x, position_y, statut } = req.body;

    const table = await TableRestaurant.findByPk(id);
    if (!table) {
      return next(new AppError('Table non trouvée', 404));
    }

    // Si changement de salle, vérifier si la nouvelle salle existe
    if (salle_id && salle_id !== table.salle_id) {
      const salle = await Salle.findByPk(salle_id);
      if (!salle) {
        return next(new AppError('Salle non trouvée', 404));
      }

      // Vérifier si le numéro existe déjà dans la nouvelle salle
      const tableExistante = await TableRestaurant.findOne({
        where: {
          numero,
          salle_id,
          id: { [Op.ne]: id }
        }
      });

      if (tableExistante) {
        return next(new AppError('Ce numéro de table existe déjà dans cette salle', 400));
      }
    }

    // Mettre à jour la table
    await table.update({
      numero,
      capacite,
      salle_id,
      position_x,
      position_y,
      statut
    });

    // Notifier via WebSocket
    req.wsUtils.notifyServers.tableUpdated(req.wsUtils, {
      table: {
        id: table.id,
        numero: table.numero,
        salle_id: table.salle_id,
        statut: table.statut
      }
    });

    res.status(200).json({
      status: 'success',
      data: table
    });
  } catch (error) {
    next(error);
  }
};

exports.supprimerTable = async (req, res, next) => {
  try {
    const { id } = req.params;

    const table = await TableRestaurant.findByPk(id);
    if (!table) {
      return next(new AppError('Table non trouvée', 404));
    }

    // Vérifier s'il y a des commandes en cours sur cette table
    const commandesActives = await Commande.count({
      where: {
        table_id: id,
        statut: {
          [Op.notIn]: ['terminée', 'annulée']
        }
      }
    });

    if (commandesActives > 0) {
      return next(new AppError('Impossible de supprimer une table avec des commandes actives', 400));
    }

    await table.destroy();

    // Notifier via WebSocket
    req.wsUtils.notifyServers.tableDeleted(req.wsUtils, {
      table_id: id
    });

    res.status(200).json({
      status: 'success',
      message: 'Table supprimée avec succès'
    });
  } catch (error) {
    next(error);
  }
};

exports.changerStatutTable = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;

    const table = await TableRestaurant.findByPk(id);
    if (!table) {
      return next(new AppError('Table non trouvée', 404));
    }

    await table.update({ statut });

    // Notifier via WebSocket
    req.wsUtils.notifyServers.tableStatusChanged(req.wsUtils, {
      table: {
        id: table.id,
        numero: table.numero,
        statut: table.statut
      }
    });

    res.status(200).json({
      status: 'success',
      data: table
    });
  } catch (error) {
    next(error);
  }
};

exports.listerTables = async (req, res, next) => {
  try {
    const { salle_id, statut } = req.query;
    const where = {};

    if (salle_id) where.salle_id = salle_id;
    if (statut) where.statut = statut;

    const tables = await TableRestaurant.findAll({
      where,
      include: [{
        model: Salle,
        attributes: ['id', 'nom']
      }],
      order: [
        ['salle_id', 'ASC'],
        ['numero', 'ASC']
      ]
    });

    res.status(200).json({
      status: 'success',
      data: tables
    });
  } catch (error) {
    next(error);
  }
};

exports.obtenirTable = async (req, res, next) => {
  try {
    const { id } = req.params;

    const table = await TableRestaurant.findByPk(id, {
      include: [{
        model: Salle,
        attributes: ['id', 'nom']
      }]
    });

    if (!table) {
      return next(new AppError('Table non trouvée', 404));
    }

    res.status(200).json({
      status: 'success',
      data: table
    });
  } catch (error) {
    next(error);
  }
};
