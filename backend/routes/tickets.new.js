const express = require("express");
const router = express.Router();
const db = require("../config/database");
const { validate, sanitizeInput } = require('../middleware/validation');
const logger = require('../utils/logger');

// POST /api/tickets (pas besoin de /tickets dans le chemin)
router.post("/", async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    
    console.log('Création de ticket - Body reçu:', req.body);
    
    const { reference, table_id, etat } = req.body;

    if (!reference || !table_id || !etat) {
      return res.status(400).json({ 
        success: false,
        error: "Référence, table ID et état sont requis" 
      });
    }

    const sanitizedReference = sanitizeInput(reference);
    const sanitizedEtat = sanitizeInput(etat);
    const created_at = new Date();

    await connection.beginTransaction();

    // Vérification de l'unicité de la référence
    const [existingTickets] = await connection.query(
      "SELECT COUNT(*) AS count FROM tickets WHERE reference = ?",
      [sanitizedReference]
    );

    if (existingTickets[0].count > 0) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false,
        error: "Référence de ticket déjà utilisée" 
      });
    }

    // Vérification de l'existence de la table
    const [tableExists] = await connection.query(
      "SELECT id FROM tables_restaurant WHERE id = ?",
      [table_id]
    );

    if (tableExists.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        success: false,
        error: "Table non trouvée" 
      });
    }

    // Insertion du ticket
    const [insertResult] = await connection.query(
      "INSERT INTO tickets (reference, table_id, etat, created_at) VALUES (?, ?, ?, ?)",
      [sanitizedReference, table_id, sanitizedEtat, created_at]
    );

    // Insertion dans l'historique
    await connection.query(
      "INSERT INTO historique_tickets (ticket_id, utilisateur_id, État, updated_at) VALUES (?, ?, ?, ?)",
      [insertResult.insertId, null, sanitizedEtat, created_at]
    );

    await connection.commit();

    logger.info(`Nouveau ticket créé: ${sanitizedReference}`);

    // Émettre l'événement WebSocket via l'event emitter de l'app
    if (req.app.emit) {
      req.app.emit('newTicket', {
        type: 'NOUVEAU_TICKET',
        data: { 
          ticket_id: insertResult.insertId,
          reference: sanitizedReference
        }
      });
    }

    res.json({
      success: true,
      message: "Ticket créé avec succès !",
      data: { 
        ticket_id: insertResult.insertId,
        reference: sanitizedReference,
        created_at 
      }
    });

  } catch (err) {
    if (connection) {
      await connection.rollback();
    }
    logger.error('Erreur lors de la création du ticket:', err);
    
    res.status(500).json({
      success: false,
      error: "Erreur lors de la création du ticket",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// GET /api/tickets
router.get("/", async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [totalCount] = await connection.query(
      "SELECT COUNT(*) as total FROM tickets"
    );

    const [tickets] = await connection.query(
      `SELECT t.*, tr.nom as table_nom, s.nom as salle_nom 
       FROM tickets t 
       LEFT JOIN tables_restaurant tr ON t.table_id = tr.id 
       LEFT JOIN salles s ON tr.salle_id = s.id 
       ORDER BY t.created_at DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const totalPages = Math.ceil(totalCount[0].total / limit);

    res.json({
      success: true,
      data: {
        tickets,
        pagination: {
          total: totalCount[0].total,
          page,
          totalPages,
          limit
        }
      }
    });

  } catch (err) {
    logger.error('Erreur lors de la récupération des tickets:', err);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des tickets",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

module.exports = router;
