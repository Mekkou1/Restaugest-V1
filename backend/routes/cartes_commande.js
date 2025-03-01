const express = require("express");
const db = require("../config/database");
const router = express.Router();

// Créer une carte de commande
router.post("/", (req, res) => {
  const { salle_id, article_id, type, photo_url, designation, prix } = req.body;
  db.query("INSERT INTO cartes_commande (salle_id, article_id, type, photo_url, designation, prix) VALUES (?, ?, ?, ?, ?, ?)", [salle_id, article_id, type, photo_url, designation, prix], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Carte de commande créée avec succès !" });
  });
});

// Récupérer toutes les cartes de commande
router.get("/", (req, res) => {
  db.query("SELECT * FROM cartes_commande", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

module.exports = router;
