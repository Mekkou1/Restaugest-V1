const express = require("express");
const router = express.Router();
const { Commande, Ticket, Article } = require('../models');
const { wss } = require('../server');

// Enregistrer une commande
router.post("/", async (req, res) => {
  const { ticket_id, items } = req.body;

  if (!ticket_id || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Données invalides" });
  }

  try {
    // Vérifier si le ticket existe
    const ticket = await Ticket.findByPk(ticket_id);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket non trouvé" });
    }

    // Créer les commandes
    const commandes = await Promise.all(
      items.map(item => 
        Commande.create({
          ticket_id,
          article_id: item.article_id,
          quantite: item.quantite,
          prix: item.prix
        })
      )
    );

    // Mettre à jour l'état du ticket
    ticket.etat = 'En cuisine';
    await ticket.save();

    // Envoyer une notification via WebSocket
    if (wss) {
      wss.broadcast(JSON.stringify({
        message: "Nouvelle commande",
        ticket_id
      }));
    }

    res.status(201).json({ 
      message: "Commande enregistrée avec succès !",
      commandes
    });
  } catch (err) {
    console.error("Erreur lors de l'enregistrement de la commande:", err);
    res.status(500).json({ error: err.message });
  }
});

// Récupérer les commandes d'un ticket
router.get("/ticket/:ticket_id", async (req, res) => {
  const { ticket_id } = req.params;

  try {
    const commandes = await Commande.findAll({
      where: { ticket_id },
      include: [{
        model: Article,
        as: 'article'
      }],
      order: [['created_at', 'ASC']]
    });

    res.json(commandes);
  } catch (err) {
    console.error("Erreur lors de la récupération des commandes:", err);
    res.status(500).json({ error: err.message });
  }
});

// Mettre à jour une commande
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { quantite } = req.body;

  try {
    const commande = await Commande.findByPk(id);
    
    if (!commande) {
      return res.status(404).json({ error: "Commande non trouvée" });
    }

    commande.quantite = quantite;
    await commande.save();

    res.json({ 
      message: "Commande mise à jour avec succès",
      commande
    });
  } catch (err) {
    console.error("Erreur lors de la mise à jour de la commande:", err);
    res.status(500).json({ error: err.message });
  }
});

// Supprimer une commande
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const commande = await Commande.findByPk(id);
    
    if (!commande) {
      return res.status(404).json({ error: "Commande non trouvée" });
    }

    await commande.destroy();

    res.json({ message: "Commande supprimée avec succès" });
  } catch (err) {
    console.error("Erreur lors de la suppression de la commande:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
