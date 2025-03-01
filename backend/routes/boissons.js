const express = require("express");
const db = require("../config/database");
const multer = require("multer");
const path = require("path");
const router = express.Router();

// 📌 Configuration du stockage des images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// 📌 Servir les images statiques
router.use("/uploads", express.static(path.join(__dirname, "../uploads")));

/** 
 * 🔹 Ajouter une nouvelle boisson
 */
router.post("/", upload.single("image"), (req, res) => {
  const { ref, designation, famille_id, prix, stock, seuil_alerte } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  if (!ref || !designation || !famille_id || !prix || !stock || !seuil_alerte) {
    return res.status(400).json({ error: "Tous les champs sont requis !" });
  }

  const query = `
    INSERT INTO boissons (ref, designation, famille_id, prix, stock, seuil_alerte, image_url) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [ref, designation, famille_id, prix, stock, seuil_alerte, image_url], (err, result) => {
    if (err) {
      console.error("Erreur d'insertion dans la base de données :", err);
      return res.status(500).json({ error: "Erreur lors de l'ajout de la boisson." });
    }
    res.json({ message: "Boisson ajoutée avec succès !", id: result.insertId });
  });
});

module.exports = router;
