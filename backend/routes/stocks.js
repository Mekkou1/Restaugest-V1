const express = require("express");
const db = require("../config/database");
const router = express.Router();

// Créer un suivi de stock
router.post("/", (req, res) => {
  const { article_id, type, variation } = req.body;
  db.query("INSERT INTO suivi_stocks (article_id, type, variation) VALUES (?, ?, ?)", [article_id, type, variation], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Suivi de stock créé avec succès !" });
  });
});

// Récupérer tous les suivis de stock
router.get("/", (req, res) => {
  db.query("SELECT * FROM suivi_stocks", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

module.exports = router;
