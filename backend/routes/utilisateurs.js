const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/database');

// Get all users
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM utilisateurs');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Erreur de serveur' });
  }
});

// Get single user
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM utilisateurs WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Erreur de serveur' });
  }
});

// Create new user
router.post('/', async (req, res) => {
  try {
    const { nom, prenom, pseudo, mot_de_passe, role } = req.body;
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
    
    const [result] = await db.query(
      'INSERT INTO utilisateurs (nom, prenom, pseudo, mot_de_passe, role) VALUES (?, ?, ?, ?, ?)',
      [nom, prenom, pseudo, hashedPassword, role]
    );
    
    const [newUser] = await db.query('SELECT * FROM utilisateurs WHERE id = ?', [result.insertId]);
    res.status(201).json(newUser[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Erreur de serveur' });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { nom, prenom, pseudo, role } = req.body;
    
    const [result] = await db.query(
      'UPDATE utilisateurs SET nom = ?, prenom = ?, pseudo = ?, role = ? WHERE id = ?',
      [nom, prenom, pseudo, role, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    const [updatedUser] = await db.query('SELECT * FROM utilisateurs WHERE id = ?', [req.params.id]);
    res.json(updatedUser[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Erreur de serveur' });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM utilisateurs WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Erreur de serveur' });
  }
});

module.exports = router;
