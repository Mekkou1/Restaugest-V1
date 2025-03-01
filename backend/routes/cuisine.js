const express = require('express');
const router = express.Router();

// Stock temporaire des commandes en cuisine
let commandesCuisine = [];

// Route pour récupérer les commandes en attente
router.get('/api/cuisine/commandes', (req, res) => {
  res.status(200).json({ commandes: commandesCuisine });
});

// Route pour mettre à jour l'état d'une commande
router.post('/api/cuisine/etat', (req, res) => {
  const { commandeId, etat } = req.body;

  if (!commandeId || !etat) {
    return res.status(400).json({ message: 'Données incomplètes pour la mise à jour.' });
  }

  const commande = commandesCuisine.find((c) => c.commandeId === commandeId);
  if (commande) {
    commande.etat = etat;
    res.status(200).json({ message: 'État de la commande mis à jour.' });
  } else {
    res.status(404).json({ message: 'Commande non trouvée.' });
  }
});

// Route pour signaler une rupture de stock
router.post('/api/cuisine/rupture', (req, res) => {
  const { produit } = req.body;

  if (!produit) {
    return res.status(400).json({ message: 'Nom du produit requis.' });
  }

  console.log(`Produit en rupture : ${produit}`);
  res.status(200).json({ message: `Rupture signalée pour : ${produit}.` });
});

module.exports = router;
