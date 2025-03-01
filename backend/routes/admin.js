const express = require('express');
const router = express.Router();

// Stock temporaire pour les utilisateurs, menus, et statistiques
let utilisateurs = [];
let menu = [];
let statistiques = { ventes: 0, commandes: 0, revenus: 0 };

// Gestion des utilisateurs
router.get('/api/admin/utilisateurs', (req, res) => {
  res.status(200).json({ utilisateurs });
});

router.post('/api/admin/utilisateurs', (req, res) => {
  const { nom, role } = req.body;

  if (!nom || !role) {
    return res.status(400).json({ message: 'Données utilisateur incomplètes.' });
  }

  const utilisateur = { id: Date.now(), nom, role };
  utilisateurs.push(utilisateur);
  res.status(201).json({ message: 'Utilisateur ajouté.', utilisateur });
});

router.delete('/api/admin/utilisateurs/:id', (req, res) => {
  const utilisateurId = parseInt(req.params.id);
  utilisateurs = utilisateurs.filter((u) => u.id !== utilisateurId);
  res.status(200).json({ message: 'Utilisateur supprimé.' });
});

// Gestion des menus
router.get('/api/admin/menu', (req, res) => {
  res.status(200).json({ menu });
});

router.post('/api/admin/menu', (req, res) => {
  const { nom, prix } = req.body;

  if (!nom || !prix) {
    return res.status(400).json({ message: 'Données du menu incomplètes.' });
  }

  const item = { id: Date.now(), nom, prix };
  menu.push(item);
  res.status(201).json({ message: 'Item ajouté au menu.', item });
});

router.delete('/api/admin/menu/:id', (req, res) => {
  const itemId = parseInt(req.params.id);
  menu = menu.filter((item) => item.id !== itemId);
  res.status(200).json({ message: 'Item supprimé du menu.' });
});

// Statistiques
router.get('/api/admin/statistiques', (req, res) => {
  res.status(200).json({ statistiques });
});

module.exports = router;
