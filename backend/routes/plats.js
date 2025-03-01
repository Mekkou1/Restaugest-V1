const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all plats
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM plats');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching plats:', error);
    res.status(500).json({ message: 'Erreur de serveur' });
  }
});

// Get single plat
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM plats WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Plat non trouvé' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching plat:', error);
    res.status(500).json({ message: 'Erreur de serveur' });
  }
});

// Create new plat
router.post('/', async (req, res) => {
  try {
    const { nom, description, prix } = req.body;
    const [result] = await db.query(
      'INSERT INTO plats (nom, description, prix) VALUES (?, ?, ?)',
      [nom, description, prix]
    );
    
    const [newPlat] = await db.query('SELECT * FROM plats WHERE id = ?', [result.insertId]);
    res.status(201).json(newPlat[0]);
  } catch (error) {
    console.error('Error creating plat:', error);
    res.status(500).json({ message: 'Erreur de serveur' });
  }
});

// Update plat
router.put('/:id', async (req, res) => {
  try {
    const { nom, description, prix } = req.body;
    const [result] = await db.query(
      'UPDATE plats SET nom = ?, description = ?, prix = ? WHERE id = ?',
      [nom, description, prix, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Plat non trouvé' });
    }
    
    const [updatedPlat] = await db.query('SELECT * FROM plats WHERE id = ?', [req.params.id]);
    res.json(updatedPlat[0]);
  } catch (error) {
    console.error('Error updating plat:', error);
    res.status(500).json({ message: 'Erreur de serveur' });
  }
});

// Delete plat
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM plats WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Plat non trouvé' });
    }
    
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting plat:', error);
    res.status(500).json({ message: 'Erreur de serveur' });
  }
});

module.exports = router;
