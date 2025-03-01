const express = require("express");
const db = require("../config/database");
const router = express.Router();

// Get server statistics
router.get("/stats", (req, res) => {
  const queries = [
    "SELECT COUNT(*) AS total_salles FROM salles",
    "SELECT COUNT(*) AS total_tables FROM tables_restaurant",

    "SELECT COUNT(*) AS total_commandes FROM commandes WHERE DATE(created_at) = CURDATE()"
  ];

  Promise.all(queries.map(query => 
    new Promise((resolve, reject) => {
      db.query(query, (err, result) => {
        if (err) return reject(err);
        resolve(result[0]);
      });
    })
  ))
  .then(results => {
    res.json({
      total_salles: results[0].total_salles,
      total_tables: results[1].total_tables,
      total_commandes: results[2].total_commandes
    });
  })
  .catch(error => {
    console.error("Error fetching server stats:", error);
    res.status(500).json({ error: "Failed to fetch server statistics" });
  });
});

module.exports = router;
