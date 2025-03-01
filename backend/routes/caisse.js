const express = require('express');
const router = express.Router();

// Stock temporaire des commandes validées
let commandesCuisine = [];
let ventesJournalieres = [];

// Route pour récupérer les commandes reçues du serveur
router.get('/api/caisse/commandes', (req, res) => {
  res.status(200).json({ commandes: commandesCuisine });
});

// Route pour valider une commande et l'envoyer à la cuisine
router.post('/api/caisse/valider', (req, res) => {
  const { commandeId, table, items, total } = req.body;

  if (!commandeId || !table || !items || !total) {
    return res.status(400).json({ message: 'Données incomplètes pour valider la commande.' });
  }

  commandesCuisine.push({ commandeId, table, items, total, date: new Date() });

  res.status(200).json({ message: 'Commande validée et envoyée à la cuisine.' });
});

// Route pour gérer les paiements
router.post('/api/caisse/paiement', (req, res) => {
  const { commandeId, table, total, modePaiement } = req.body;

  if (!commandeId || !table || !total || !modePaiement) {
    return res.status(400).json({ message: 'Données incomplètes pour le paiement.' });
  }

  // Enregistrer la vente dans les ventes journalières
  ventesJournalieres.push({
    commandeId,
    table,
    total,
    modePaiement,
    date: new Date(),
  });

  res.status(200).json({ message: 'Paiement effectué avec succès.' });
});

// Route pour récupérer les ventes journalières
router.get('/api/caisse/ventes', (req, res) => {
  res.status(200).json({ ventes: ventesJournalieres });
});

module.exports = router;
