const express = require('express');
const db = require('../config/database');
const router = express.Router();

// Sauvegarder les associations entre articles et intrants
router.post('/', (req, res) => {
  const associations = req.body;

  associations.forEach(association => {
    const { article_id, intrant_id, quantite } = association;
    db.query(
      'INSERT INTO article_intrant (article_id, intrant_id, quantite) VALUES (?, ?, ?)',
      [article_id, intrant_id, quantite],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
      }
    );
  });

  res.json({ message: 'Associations sauvegardées avec succès !' });
});

module.exports = router;
