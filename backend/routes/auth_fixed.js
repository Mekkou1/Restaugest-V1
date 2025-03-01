const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
  try {
    const { pseudo, mot_de_passe } = req.body;

    // Check if user exists
    console.log('Recherche de l\'utilisateur:', pseudo);
    const [user] = await db.query(
      `SELECT * FROM utilisateurs WHERE pseudo = '${pseudo}'`
    );

    console.log('Résultat de la requête:', user);

    if (user.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Verify password directly
    console.log('Vérification du mot de passe');
    const validPassword = await bcrypt.compare(mot_de_passe, user[0].mot_de_passe);
    console.log('Résultat de la vérification:', validPassword);

    if (!validPassword) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    // Réponse réussie
    res.json({
      message: 'Connexion réussie',
      user: {
        id: user[0].id,
        pseudo: user[0].pseudo,
        role: user[0].role
      }
    });

  } catch (error) {
    console.error('Erreur de connexion:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la connexion.' });
  }
});

module.exports = router;
