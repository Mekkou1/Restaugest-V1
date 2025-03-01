const express = require("express");
const db = require("../config/database");
const router = express.Router();

// ✅ Récupérer les articles de la carte menu pour une salle donnée
router.get("/:salle_id", (req, res) => {
  const { salle_id } = req.params;

  const query = `
    SELECT cm.id, cm.salle_id, cm.article_id, cm.type, 
           a.designation, cm.prix, cm.visible, a.image_url
    FROM cartemenu cm
    JOIN articles a ON cm.article_id = a.id
    WHERE cm.salle_id = ?;
  `;

  db.query(query, [salle_id], (err, results) => {
    if (err) {
      console.error("❌ Erreur lors de la récupération de la carte menu:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// ✅ Ajouter un article à la carte menu d'une salle
router.post("/", (req, res) => {
  const { salle_id, article_id, type, designation, prix, visible } = req.body;

  if (!salle_id || !article_id || !type || !prix || !designation) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }

  // Vérifier si l'article existe déjà dans la carte
  const checkQuery = `
    SELECT * FROM cartemenu 
    WHERE salle_id = ? AND article_id = ? AND type = ?;
  `;

  db.query(checkQuery, [salle_id, article_id, type], (err, results) => {
    if (err) {
      console.error("❌ Erreur lors de la vérification de l'article:", err);
      return res.status(500).json({ error: err.message });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: "Cet article existe déjà dans la carte menu." });
    }

    // Si l'article n'existe pas, procéder à l'insertion
    const insertQuery = `
      INSERT INTO cartemenu (salle_id, article_id, type, designation, prix, visible)
      VALUES (?, ?, ?, ?, ?, ?);
    `;

    db.query(insertQuery, [salle_id, article_id, type, designation, prix, visible], (err, result) => {
      if (err) {
        console.error("❌ Erreur lors de l'ajout de l'article:", err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "✅ Article ajouté avec succès à la carte menu." });
    });
  });
});

// ✅ Mettre à jour un article de la carte menu
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { prix, visible } = req.body;

  const query = `
    UPDATE cartemenu
    SET prix = ?, visible = ?
    WHERE id = ?;
  `;

  db.query(query, [prix, visible, id], (err, result) => {
    if (err) {
      console.error("❌ Erreur lors de la mise à jour:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "✅ Article mis à jour avec succès dans la carte menu." });
  });
});

// ✅ Supprimer un article de la carte menu
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM cartemenu WHERE id = ?;`;

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("❌ Erreur lors de la suppression:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "✅ Article supprimé avec succès de la carte menu." });
  });
});

// ✅ Récupérer les tables d'une salle
router.get("/tables/:salle_id", (req, res) => {
  const { salle_id } = req.params;

  const query = `
    SELECT id, nom, type, etat 
    FROM tables_restaurant
    WHERE salle_id = ?;
  `;

  db.query(query, [salle_id], (err, results) => {
    if (err) {
      console.error("❌ Erreur lors de la récupération des tables:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

module.exports = router;
