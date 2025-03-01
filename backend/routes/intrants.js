const express = require("express");
const db = require("../config/database");
const router = express.Router();

// Ajouter un intrant
router.post("/", (req, res) => {
  const { ref, designation, nomenclature, famille_id, stock, seuil_alerte } = req.body;
  db.query(
    "INSERT INTO intrants (ref, designation, nomenclature, famille_id, stock, seuil_alerte) VALUES (?, ?, ?, ?, ?, ?)",
    [ref, designation, nomenclature, famille_id, stock, seuil_alerte],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Intrant ajouté avec succès !" });
    }
  );
});

// Récupérer tous les intrants
router.get("/", (req, res) => {
  db.query("SELECT * FROM intrants", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});

// Mettre à jour un intrant
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { ref, designation, nomenclature, famille_id, stock, seuil_alerte } = req.body;
  db.query(
    "UPDATE intrants SET ref = ?, designation = ?, nomenclature = ?, famille_id = ?, stock = ?, seuil_alerte = ? WHERE id = ?",
    [ref, designation, nomenclature, famille_id, stock, seuil_alerte, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Intrant mis à jour avec succès !" });
    }
  );
});

// Supprimer un intrant
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM intrants WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Intrant supprimé avec succès !" });
  });
});

module.exports = router;
