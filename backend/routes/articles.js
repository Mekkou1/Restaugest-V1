const express = require("express");
const db = require("../config/database");
const multer = require("multer");
const path = require("path");
const router = express.Router();

// Configuration du stockage des images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// Servir les images statiques
router.use("/uploads", express.static(path.join(__dirname, "../uploads")));

/** 
 * 🔹 Récupérer tous les articles (plats, boissons, intrants)
 */
router.get("/", (req, res) => {
  const query = `
    SELECT id, 'plat' AS type, ref, designation, famille_id AS famille, prix, image_url FROM plats
    UNION ALL
    SELECT id, 'boisson' AS type, ref, designation, famille_id AS famille, prix, image_url FROM boissons
    UNION ALL
    SELECT id, 'intrant' AS type, ref, designation, famille_id AS famille, stock AS prix, NULL AS image_url FROM intrants
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

/** 
 * 🔹 Ajouter un article (plat, boisson, intrant)
 */
router.post("/", upload.single("image_url"), (req, res) => {
  const { type, ref, designation, famille, prix } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;
  
  let query;
  if (type === "plat" || type === "boisson") {
    const table = type === "plat" ? "plats" : "boissons";
    query = `INSERT INTO ${table} (ref, designation, famille_id, prix, image_url) VALUES (?, ?, ?, ?, ?)`;
  } else if (type === "intrant") {
    query = `INSERT INTO intrants (ref, designation, famille_id, stock) VALUES (?, ?, ?, ?)`;
  } else {
    return res.status(400).json({ error: "Type d'article invalide" });
  }

  db.query(query, [ref, designation, famille, prix || 0, image_url], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId, ref, designation, famille, prix, image_url });
  });
});

/** 
 * 🔹 Modifier un article existant
 */
router.put("/:id", upload.single("image_url"), (req, res) => {
  const { id } = req.params;
  const { type, ref, designation, famille, prix } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;
  
  let query;
  if (type === "plat" || type === "boisson") {
    const table = type === "plat" ? "plats" : "boissons";
    query = `UPDATE ${table} SET ref = ?, designation = ?, famille_id = ?, prix = ?, image_url = ? WHERE id = ?`;
  } else if (type === "intrant") {
    query = `UPDATE intrants SET ref = ?, designation = ?, famille_id = ?, stock = ? WHERE id = ?`;
  } else {
    return res.status(400).json({ error: "Type d'article invalide" });
  }

  db.query(query, [ref, designation, famille, prix || 0, image_url, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Article mis à jour avec succès" });
  });
});

/** 
 * 🔹 Supprimer un article
 */
router.delete("/:type/:id", (req, res) => {
  const { type, id } = req.params;
  
  let table;
  if (type === "plat") table = "plats";
  else if (type === "boisson") table = "boissons";
  else if (type === "intrant") table = "intrants";
  else return res.status(400).json({ error: "Type d'article invalide" });

  db.query(`DELETE FROM ${table} WHERE id = ?`, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Article supprimé avec succès" });
  });
});

module.exports = router;
