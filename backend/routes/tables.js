const express = require("express");
const db = require("../config/database");
const router = express.Router();

// Créer une table
router.post("/", (req, res) => {
  const { nom, salle_id, type } = req.body;
  db.query("INSERT INTO tables_restaurant (nom, salle_id, type) VALUES (?, ?, ?)", [nom, salle_id, type], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Table créée avec succès !" });
  });
});

// Récupérer toutes les tables ou les tables spécifiques à une salle
router.get("/", (req, res) => {
  const { salle_id } = req.query;

  let query = "SELECT * FROM tables_restaurant";
  let params = [];

  if (salle_id) {
    query += " WHERE salle_id = ?";
    params.push(salle_id);
  }

  db.query(query, params, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

module.exports = router;
