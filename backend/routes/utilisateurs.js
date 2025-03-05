const express = require('express');
const bcryptjs = require('bcryptjs');
const db = require('../config/database');
const router = express.Router();

// Get all users
router.get('/', (req, res) => {
  const query = 'SELECT id, nom, prenom, pseudo, role, etat FROM utilisateurs';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Create new user
router.post('/register', async (req, res) => {
  const { nom, prenom, pseudo, mot_de_passe, contact1, contact2, role } = req.body;

  try {
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(mot_de_passe, salt);

    const query = `
      INSERT INTO utilisateurs (nom, prenom, pseudo, mot_de_passe, contact1, contact2, role)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      query,
      [nom, prenom, pseudo, hashedPassword, contact1, contact2, role],
      (err, result) => {
        if (err) {
          console.error('Error creating user:', err);
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
          message: 'User created successfully',
          userId: result.insertId
        });
      }
    );
  } catch (err) {
    console.error('Error hashing password:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nom, prenom, pseudo, mot_de_passe, contact1, contact2, role } = req.body;

  try {
    let updateQuery = `
      UPDATE utilisateurs
      SET nom = ?, prenom = ?, pseudo = ?, contact1 = ?, contact2 = ?, role = ?
    `;
    let queryParams = [nom, prenom, pseudo, contact1, contact2, role];

    // If password is provided, hash it and include in update
    if (mot_de_passe) {
      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(mot_de_passe, salt);
      updateQuery += ', mot_de_passe = ?';
      queryParams.push(hashedPassword);
    }

    updateQuery += ' WHERE id = ?';
    queryParams.push(id);

    db.query(updateQuery, queryParams, (err, result) => {
      if (err) {
        console.error('Error updating user:', err);
        return res.status(500).json({ error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ message: 'User updated successfully' });
    });
  } catch (err) {
    console.error('Error in update process:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete user
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM utilisateurs WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting user:', err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  });
});

module.exports = router;
