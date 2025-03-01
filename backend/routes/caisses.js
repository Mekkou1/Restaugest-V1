const express = require("express");
const db = require("../config/database");
const router = express.Router();

// Créer une caisse
router.post("/", (req, res) => {
  const { solde_jour, solde_veille, monnaie_disponible, devise_id } = req.body;
  db.query("INSERT INTO caisses (solde_jour, solde_veille, monnaie_disponible, devise_id) VALUES (?, ?, ?, ?)", [solde_jour, solde_veille, monnaie_disponible, devise_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Caisse créée avec succès !" });
  });
});

// Récupérer toutes les caisses
router.get("/", (req, res) => {
  db.query("SELECT * FROM caisses", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

module.exports = router;
