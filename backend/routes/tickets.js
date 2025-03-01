const express = require("express");
const db = require("../config/database");
const router = express.Router();
const { wss } = require('../server'); // Importer l'instance WebSocket

// Get ticket count for a specific date
router.get("/count", (req, res) => {
  const { date } = req.query;
  const query = `
    SELECT COUNT(*) as count 
    FROM tickets 
    WHERE DATE(created_at) = ?`;
    
  db.query(query, [date], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ count: result[0].count });
  });
});

// Créer un ticket
router.post("/tickets", async (req, res) => {
  const { reference, table_id, etat } = req.body;

  if (!reference || !table_id || !etat) {
    return res.status(400).json({ error: "Référence, table ID et état sont requis" });
  }

  const created_at = new Date();

  try {
    // Vérifiez l'unicité de la référence
    const checkQuery = "SELECT COUNT(*) AS count FROM tickets WHERE reference = ?";
    const [checkResult] = await db.query(checkQuery, [reference]);

    if (checkResult[0].count > 0) {
      return res.status(400).json({ error: "Référence de ticket déjà utilisée" });
    }

    // Insérer le ticket avec la référence fournie
    const insertQuery = "INSERT INTO tickets (reference, table_id, etat, created_at) VALUES (?, ?, ?, ?)";
    const [insertResult] = await db.query(insertQuery, [reference, table_id, etat, created_at]);

    // Insérer une entrée dans la table historique_tickets
    const historiqueQuery = "INSERT INTO historique_tickets (ticket_id, utilisateur_id, État, updated_at) VALUES (?, ?, ?, ?)";
    await db.query(historiqueQuery, [insertResult.insertId, null, etat, created_at]);

    res.json({ message: "Ticket créé avec succès !", ticket_id: insertResult.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Récupérer tous les tickets
router.get("/tickets", (req, res) => {
  db.query("SELECT * FROM tickets", (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
});



module.exports = router;
