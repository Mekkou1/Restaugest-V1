const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Utilisateur, Session } = require('../models');

// Helper function to validate credentials
async function validateCredentials(pseudo, mot_de_passe) {
  const user = await Utilisateur.findOne({ where: { pseudo } });
  if (!user) return null;

  const validPassword = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
  return validPassword ? user : null;
}

// Login route
router.post('/login', async (req, res) => {
  try {
    const { pseudo, mot_de_passe } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    // Validate credentials
    const user = await validateCredentials(pseudo, mot_de_passe);
    if (!user) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    // Check for existing active session
    const existingSession = await Session.getActiveSession(user.id);
    if (existingSession) {
      // End the existing session before creating a new one
      await existingSession.endSession();
    }


    // Generate refresh token first
    const refreshToken = jwt.sign(
      { 
        userId: user.id
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Create new session with the refresh token
    const session = await Session.createSession(
      user.id,
      refreshToken,
      ipAddress,
      userAgent
    );

    // Generate access token with session information
    const accessToken = jwt.sign(
      { 
        userId: user.id, 
        role: user.role,
        sessionId: session.id 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );



    res.json({
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        pseudo: user.pseudo,
        role: user.role
      },
      sessionId: session.id
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Erreur de connexion', error: error.message });
  }
});

// Logout route
router.post('/logout', async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await Session.findByPk(sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Session non trouvée' });
    }

    await session.endSession();
    res.json({ message: 'Déconnexion réussie' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Erreur de déconnexion', error: error.message });
  }
});

// Session history route
router.get('/sessions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const sessions = await Session.getSessionHistory(userId);
    res.json(sessions);
  } catch (error) {
    console.error('Session history error:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération de l\'historique des sessions', 
      error: error.message 
    });
  }
});

module.exports = router;
