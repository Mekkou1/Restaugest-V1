const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all devises
router.get('/api/devise', async (req, res) => {
  try {
    const [devises] = await pool.query('SELECT * FROM devise ORDER BY id DESC');
    res.json(devises);
  } catch (error) {
    console.error('Error fetching devises:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des devises' });
  }
});

// Get a single devise by ID
router.get('/api/devise/:id', async (req, res) => {
  try {
    const [devise] = await pool.query('SELECT * FROM devise WHERE id = ?', [req.params.id]);
    if (devise.length === 0) {
      return res.status(404).json({ message: 'Devise non trouvée' });
    }
    res.json(devise[0]);
  } catch (error) {
    console.error('Error fetching devise:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de la devise' });
  }
});

// Create a new devise
router.post('/api/devise', async (req, res) => {
  const { code, nom, symbole } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO devise (code, nom, symbole) VALUES (?, ?, ?)',
      [code, nom, symbole]
    );
    res.status(201).json({
      id: result.insertId,
      code,
      nom,
      symbole
    });
  } catch (error) {
    console.error('Error creating devise:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la devise' });
  }
});

// Update a devise
router.put('/api/devise/:id', async (req, res) => {
  const { code, nom, symbole } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE devise SET code = ?, nom = ?, symbole = ? WHERE id = ?',
      [code, nom, symbole, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Devise non trouvée' });
    }
    res.json({ id: req.params.id, code, nom, symbole });
  } catch (error) {
    console.error('Error updating devise:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la devise' });
  }
});

// Delete a devise
router.delete('/api/devise/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM devise WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Devise non trouvée' });
    }
    res.json({ message: 'Devise supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting devise:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de la devise' });
  }
});

module.exports = router;
