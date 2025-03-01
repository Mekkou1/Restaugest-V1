const express = require("express");
const db = require("../config/database");
const router = express.Router();

// Créer une famille d'article
router.post("/", (req, res) => {
  const { nom, description } = req.body;
  db.query("INSERT INTO familles (nom, description) VALUES (?, ?)", [nom, description], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Famille d'article créée avec succès !" });
  });
});

// Récupérer toutes les familles d'articles
router.get("/", (req, res) => {
  db.query("SELECT * FROM familles", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// Mettre à jour une famille d'article
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { nom, description } = req.body;
  db.query("UPDATE familles SET nom = ?, description = ? WHERE id = ?", [nom, description, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Famille d'article mise à jour avec succès !" });
  });
});

// Supprimer une famille d'article
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM familles WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Famille d'article supprimée avec succès !" });
  });
});

module.exports = router;
