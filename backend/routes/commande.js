const express = require("express");
const db = require("../config/database");
const router = express.Router();

// Créer une commande
router.post("/", (req, res) => {
  const { ticket_id, type, article_id, quantite } = req.body;
  db.query("INSERT INTO commandes (ticket_id, type, article_id, quantite) VALUES (?, ?, ?, ?)", [ticket_id, type, article_id, quantite], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Commande créée avec succès !" });
  });
});

// Récupérer toutes les commandes
router.get("/", (req, res) => {
  db.query("SELECT * FROM commandes", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

module.exports = router;
