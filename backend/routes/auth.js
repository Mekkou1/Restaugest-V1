const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { Utilisateur, Session } = require('../models');
const { authMiddleware } = require('../middleware/authMiddleware');

// Login route
router.post('/login', async (req, res) => {
  try {
    const { pseudo, mot_de_passe } = req.body;
    
    // Find user
    const user = await Utilisateur.findOne({ where: { pseudo } });
    if (!user) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!validPassword) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    // Check for existing session and end it
    await Session.update(
      { expiresAt: new Date() },
      { where: { 
        userId: user.id,
        expiresAt: { [Op.gt]: new Date() }
      }}
    );

    // Create new session
    const sessionId = require('crypto').randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    const session = await Session.create({
      sessionId,
      userId: user.id,
      refreshToken,
      expiresAt
    });

    // Generate access token
    const token = jwt.sign(
      { 
        userId: user.id,
        role: user.role,
        sessionId: session.sessionId
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Update user status
    await user.update({ etat: 'Connecté' });

    // Send response
    res.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        pseudo: user.pseudo,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        etat: user.etat
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
});

// Logout route
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    // End current session
    await Session.update(
      { expiresAt: new Date() },
      { where: { sessionId: req.session.sessionId } }
    );

    // Update user status
    await req.user.update({ etat: 'Déconnecté' });

    res.json({ message: 'Déconnexion réussie' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Erreur lors de la déconnexion' });
  }
});

// Refresh token route
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token non fourni' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Find valid session
    const session = await Session.findOne({
      where: {
        userId: decoded.userId,
        refreshToken,
        expiresAt: { [Op.gt]: new Date() }
      }
    });

    if (!session) {
      return res.status(401).json({ message: 'Session invalide ou expirée' });
    }

    // Get user
    const user = await Utilisateur.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    // Generate new access token
    const token = jwt.sign(
      { 
        userId: user.id,
        role: user.role,
        sessionId: session.sessionId
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ message: 'Refresh token invalide' });
  }
});

// Verify token route
router.get('/verify', authMiddleware, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        pseudo: req.user.pseudo,
        nom: req.user.nom,
        prenom: req.user.prenom,
        role: req.user.role,
        etat: req.user.etat
      }
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ message: 'Erreur lors de la vérification du token' });
  }
});

module.exports = router;
