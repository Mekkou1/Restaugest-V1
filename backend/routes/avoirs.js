const express = require("express");
const db = require("../config/database");
const router = express.Router();

// Créer un avoir
router.post("/", (req, res) => {
  const { ticket_id, montant } = req.body;
  db.query("INSERT INTO avoirs (ticket_id, montant) VALUES (?, ?)", [ticket_id, montant], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Avoir créé avec succès !" });
  });
});

// Récupérer tous les avoirs
router.get("/", (req, res) => {
  db.query("SELECT * FROM avoirs", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

module.exports = router;
