// Dans votre fichier backend (par exemple, routes/stats.js)
const express = require('express');
const router = express.Router();
const db = require('../config/database'); // Assurez-vous d'importer votre connexion à la base de données

// Route pour récupérer les statistiques du serveur
router.get('/server', async (req, res) => {
  try {
    // Exemple : Récupérer le nombre total de commandes
    const [totalOrders] = await db.query('SELECT COUNT(*) as total FROM commandes');
    const [completedOrders] = await db.query('SELECT COUNT(*) as total FROM commandes WHERE etat = "Terminée"');
    const [pendingOrders] = await db.query('SELECT COUNT(*) as total FROM commandes WHERE etat = "En attente"');

    res.json({
      totalOrders: totalOrders[0].total,
      completedOrders: completedOrders[0].total,
      pendingOrders: pendingOrders[0].total,
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des statistiques :', err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des statistiques' });
  }
});

module.exports = router;