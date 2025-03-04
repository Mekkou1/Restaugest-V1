const express = require("express");
const router = express.Router();
const { Ticket, TableRestaurant, Salles } = require('../models');
const { wss } = require('../server');

// Créer un ticket
router.post("/", async (req, res) => {
  const { table_id, etat } = req.body;

  if (!table_id || !etat) {
    return res.status(400).json({ error: "Table ID et état sont requis" });
  }

  try {
    // Générer une référence unique
    const reference = `TK${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const ticket = await Ticket.create({
      reference,
      table_id,
      etat
    });

    // Notifier via WebSocket
    if (wss) {
      wss.broadcast(JSON.stringify({
        message: "Nouvelle commande",
        ticket_id: ticket.id
      }));
    }

    res.status(201).json({ 
      message: "Ticket créé avec succès !",
      id: ticket.id,
      reference: ticket.reference
    });
  } catch (err) {
    console.error("Erreur lors de la création du ticket:", err);
    res.status(500).json({ error: err.message });
  }
});

// Récupérer tous les tickets
router.get("/", async (req, res) => {
  try {
    const tickets = await Ticket.findAll({
      include: [{
        model: TableRestaurant,
        as: 'table',
        include: [{
          model: Salles,
          as: 'salle'
        }]
      }],
      order: [['created_at', 'DESC']]
    });
    res.json(tickets);
  } catch (err) {
    console.error("Erreur lors de la récupération des tickets:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get ticket by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const ticket = await Ticket.findByPk(id, {
      include: [{
        model: TableRestaurant,
        as: 'table',
        include: [{
          model: Salles,
          as: 'salle'
        }]
      }]
    });
    
    if (!ticket) {
      return res.status(404).json({ error: "Ticket non trouvé" });
    }
    
    res.json(ticket);
  } catch (err) {
    console.error("Erreur lors de la récupération du ticket:", err);
    res.status(500).json({ error: err.message });
  }
});

// Mettre à jour l'état d'un ticket
router.put("/:id/etat", async (req, res) => {
  const { id } = req.params;
  const { etat } = req.body;

  if (!etat) {
    return res.status(400).json({ error: "L'état est requis" });
  }

  try {
    const ticket = await Ticket.findByPk(id);
    
    if (!ticket) {
      return res.status(404).json({ error: "Ticket non trouvé" });
    }

    ticket.etat = etat;
    await ticket.save();

    res.json({ message: "État du ticket mis à jour avec succès" });
  } catch (err) {
    console.error("Erreur lors de la mise à jour de l'état du ticket:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
