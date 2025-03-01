const express = require("express");
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Salle, TableRestaurant, Op } = require('../models'); // Importez les modèles et Op pour les requêtes

// Validation rules for salle creation
const salleValidationRules = [
  body('nom').notEmpty().withMessage('Le nom est requis'),
  body('type').notEmpty().withMessage('Le type est requis')
];

// Create a salle with validation
router.post("/", salleValidationRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { nom, type } = req.body;
    const salle = await Salle.create({ nom, type });
    res.status(201).json({ 
      message: "Salle créée avec succès !",
      id: salle.id
    });
  } catch (err) {
    console.error('Error creating salle:', err);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la création de la salle',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get all salles with pagination, search, and their tables
router.get("/", async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const offset = (page - 1) * limit;

  try {
    const whereClause = search ? { nom: { [Op.like]: `%${search}%` } } : {};
    const { count, rows } = await Salle.findAndCountAll({
      where: whereClause,
      include: [{ model: TableRestaurant, as: 'Tables' }], // Inclure les tables associées
      limit: Number(limit),
      offset: Number(offset),
    });

    res.json({
      data: rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
      },
    });
  } catch (err) {
    console.error('Error fetching salles:', err);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération des salles',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get a single salle by ID with its tables
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const salle = await Salle.findByPk(id, {
      include: [{ model: TableRestaurant, as: 'Tables' }], // Inclure les tables associées
    });

    if (!salle) {
      return res.status(404).json({ error: 'Salle non trouvée' });
    }

    res.json(salle);
  } catch (err) {
    console.error('Error fetching salle:', err);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération de la salle',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get tables for a specific salle
router.get("/:id/tables", async (req, res) => {
  const { id } = req.params;

  try {
    const salle = await Salle.findByPk(id, {
      include: [{ model: TableRestaurant, as: 'Tables' }], // Inclure les tables associées
    });

    if (!salle) {
      return res.status(404).json({ error: 'Salle non trouvée' });
    }

    res.json(salle.Tables); // Retourne les tables associées à la salle
  } catch (err) {
    console.error('Error fetching tables for salle:', err);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la récupération des tables',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Update a salle
router.put("/:id", salleValidationRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { nom, type } = req.body;

  try {
    const [updated] = await Salle.update({ nom, type }, { where: { id } });
    if (updated === 0) {
      return res.status(404).json({ error: 'Salle non trouvée' });
    }
    res.json({ message: "Salle mise à jour avec succès !" });
  } catch (err) {
    console.error('Error updating salle:', err);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la mise à jour de la salle',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Delete a salle
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Salle.destroy({ where: { id } });
    if (deleted === 0) {
      return res.status(404).json({ error: 'Salle non trouvée' });
    }
    res.json({ message: "Salle supprimée avec succès !" });
  } catch (err) {
    console.error('Error deleting salle:', err);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la suppression de la salle',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;