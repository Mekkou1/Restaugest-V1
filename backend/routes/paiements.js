const express = require("express");
const db = require("../config/database");
const router = express.Router();

// Créer un paiement
router.post("/", (req, res) => {
  const { ticket_id, montant, mode } = req.body;
  db.query("INSERT INTO paiements (ticket_id, montant, mode) VALUES (?, ?, ?)", [ticket_id, montant, mode], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Paiement créé avec succès !" });
  });
});

// Récupérer tous les paiements
router.get("/", (req, res) => {
  db.query("SELECT * FROM paiements", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

module.exports = router;
