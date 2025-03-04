const express = require('express');
const cors = require('cors');
const session = require('express-session');
const dotenv = require('dotenv');
const WebSocket = require('ws');
const multer = require('multer');
const path = require('path');
const { authMiddleware } = require('./middleware/authMiddleware');

// Load environment variables
dotenv.config();

// Create express app
const app = express();

// Configure CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:8080',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Configure session
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Middleware to parse JSON
app.use(express.json());

// WebSocket Server
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ 
  server,
  clientTracking: true
});

// Broadcast function
wss.broadcast = function(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

// WebSocket connection handler
wss.on('connection', ws => {
  console.log('✅ Client WebSocket connecté');
  
  ws.on('message', message => {
    try {
      const parsedMessage = JSON.parse(message);
      console.log('📩 Message reçu:', parsedMessage);
      wss.broadcast(parsedMessage);
    } catch (error) {
      console.error('Erreur de traitement du message:', error);
    }
  });

  ws.on('error', error => {
    console.error('WebSocket error:', error);
  });

  ws.on('close', () => {
    console.log('Client WebSocket déconnecté');
  });
});

// Configure file uploads
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/utilisateurs');
const sallesRoutes = require('./routes/salles');
const tablesRoutes = require('./routes/tables');
const platsRoutes = require('./routes/plats');
const boissonsRoutes = require('./routes/boissons');
const intrantsRoutes = require('./routes/intrants');
const ticketsRoutes = require('./routes/tickets');
const commandesRoutes = require('./routes/commandes');
const paiementsRoutes = require('./routes/paiements');
const caissesRoutes = require('./routes/caisses');
const performancesRoutes = require('./routes/performances');
const stocksRoutes = require('./routes/stocks');
const avoirsRoutes = require('./routes/avoirs');
const famillesRoutes = require('./routes/familles');
const articlesRoutes = require('./routes/articles');
const cartemenuRoutes = require('./routes/cartemenu');
const serveurRoutes = require('./routes/serveur');
const statsRouter = require('./routes/stats');

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/users', authMiddleware, usersRoutes);
app.use('/api/salles', authMiddleware, sallesRoutes);
app.use('/api/tables', authMiddleware, tablesRoutes);
app.use('/api/plats', authMiddleware, platsRoutes);
app.use('/api/boissons', authMiddleware, boissonsRoutes);
app.use('/api/intrants', authMiddleware, intrantsRoutes);
app.use('/api/tickets', authMiddleware, ticketsRoutes);
app.use('/api/commandes', authMiddleware, commandesRoutes);
app.use('/api/paiements', authMiddleware, paiementsRoutes);
app.use('/api/caisses', authMiddleware, caissesRoutes);
app.use('/api/performances', authMiddleware, performancesRoutes);
app.use('/api/stocks', authMiddleware, stocksRoutes);
app.use('/api/avoirs', authMiddleware, avoirsRoutes);
app.use('/api/familles', authMiddleware, famillesRoutes);
app.use('/api/articles', authMiddleware, articlesRoutes);
app.use('/api/cartemenu', authMiddleware, cartemenuRoutes);
app.use('/api/serveur', authMiddleware, serveurRoutes);
app.use('/api/stats', authMiddleware, statsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Erreur serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
  console.log(`✅ WebSocket server running on ws://localhost:${PORT}`);
});

// Export WebSocket server
module.exports = { app, wss };
