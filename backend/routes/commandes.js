const express = require("express");
const db = require("../config/database");
const router = express.Router();
const { wss } = require('../server'); // Importer l'instance WebSocket


/// Enregistrer une commande
router.post("/commandes", async (req, res) => {
  const { ticket_id, items } = req.body;

  if (!ticket_id || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Données invalides" });
  }

  const created_at = new Date();

  try {
    for (const item of items) {
      const { article_id, quantite, prix } = item;
      const insertQuery = "INSERT INTO commandes (ticket_id, article_id, quantite, prix, created_at) VALUES (?, ?, ?, ?, ?)";
      await db.query(insertQuery, [ticket_id, article_id, quantite, prix, created_at]);
    }

    // Envoyer une notification via WebSocket
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ message: "Nouvelle commande", ticket_id }));
      }
    });

    res.json({ message: "Commande enregistrée avec succès !" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
