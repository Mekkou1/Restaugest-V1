const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
require('dotenv').config();

// Import des middlewares
const { errorHandler } = require('./middleware/errorHandler');
const { authMiddleware } = require('./middleware/authMiddleware');
const { sessionCleanup } = require('./middleware/sessionCleanup');

// Import des routes
const authRoutes = require('./routes/auth');
const utilisateursRoutes = require('./routes/utilisateurs');
const etablissementRoutes = require('./routes/etablissement');
const menuRoutes = require('./routes/menu-new');
const commandesRoutes = require('./routes/commandes');
const preparationsRoutes = require('./routes/preparations');
const recettesRoutes = require('./routes/recettes');
const intrantsRoutes = require('./routes/intrants');
const paiementsRoutes = require('./routes/paiements-new');
const devisesRoutes = require('./routes/devises');
const transfertsRoutes = require('./routes/transferts');
const sessionsCaisseRoutes = require('./routes/sessions-caisse');
const statsRoutes = require('./routes/stats-new');
const tablesRoutes = require('./routes/tables');
const sallesRoutes = require('./routes/salles');

// Configuration WebSocket
const { configureWebSocket } = require('./config/websocket');

// Création de l'application Express
const app = express();
const server = http.createServer(app);

// Configuration CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  credentials: true
}));

// Configuration des middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration des fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuration WebSocket
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
    methods: ['GET', 'POST'],
    credentials: true
  }
});
configureWebSocket(io);

// Middleware pour ajouter io aux requêtes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes publiques
app.use('/api/auth', authRoutes);

// Routes protégées
app.use('/api/utilisateurs', authMiddleware, utilisateursRoutes);
app.use('/api/etablissement', authMiddleware, etablissementRoutes);
app.use('/api/menu', authMiddleware, menuRoutes);
app.use('/api/commandes', authMiddleware, commandesRoutes);
app.use('/api/preparations', authMiddleware, preparationsRoutes);
app.use('/api/recettes', authMiddleware, recettesRoutes);
app.use('/api/intrants', authMiddleware, intrantsRoutes);
app.use('/api/paiements', authMiddleware, paiementsRoutes);
app.use('/api/devises', authMiddleware, devisesRoutes);
app.use('/api/transferts', authMiddleware, transfertsRoutes);
app.use('/api/sessions-caisse', authMiddleware, sessionsCaisseRoutes);
app.use('/api/stats', authMiddleware, statsRoutes);
app.use('/api/tables', authMiddleware, tablesRoutes);
app.use('/api/salles', authMiddleware, sallesRoutes);

// Middleware de nettoyage des sessions
app.use(sessionCleanup);

// Middleware de gestion des erreurs
app.use(errorHandler);

// Route par défaut
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenue sur l\'API Restaugest',
    version: process.env.npm_package_version || '1.0.0',
    documentation: '/api/docs'
  });
});

// Gestion des routes non trouvées
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route non trouvée'
  });
});

// Configuration du port
const PORT = process.env.PORT || 3000;

// Démarrage du serveur
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`Documentation disponible sur http://localhost:${PORT}/api/docs`);
  console.log(`Interface d'administration sur http://localhost:${PORT}/admin`);
  console.log('Mode:', process.env.NODE_ENV || 'development');
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error('Erreur non capturée:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Promesse rejetée non gérée:', error);
  process.exit(1);
});

module.exports = { app, server };
