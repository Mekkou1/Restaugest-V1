const express = require("express");
const db = require("../config/database");
const router = express.Router();

// Créer une performance
router.post("/", (req, res) => {
  const { employe_id, role, nombre_commandes, nombre_paiements, nombre_preparations, date_statistique, total_ventes, total_commandes } = req.body;
  db.query("INSERT INTO performances_employes (employe_id, role, nombre_commandes, nombre_paiements, nombre_preparations, date_statistique, total_ventes, total_commandes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [employe_id, role, nombre_commandes, nombre_paiements, nombre_preparations, date_statistique, total_ventes, total_commandes], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Performance créée avec succès !" });
  });
});

// Récupérer toutes les performances
router.get("/", (req, res) => {
  db.query("SELECT * FROM performances_employes", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

module.exports = router;
