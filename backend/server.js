const express = require('express');
const cors = require('cors');
const session = require('express-session');
const dotenv = require('dotenv');
const { initSessionCleanup } = require('./middleware/sessionCleanup');
const WebSocket = require('ws');
const multer = require('multer');
const path = require('path');


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

// Initialize scheduled session cleanup
initSessionCleanup();

// Middleware to parse JSON
app.use(express.json());

// WebSocket Server (temps réel)
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ 
  server,
  clientTracking: true
});

// Broadcast function to all connected clients
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

wss.on('connection', ws => {
  console.log("✅ Client WebSocket connecté !");
  
  ws.on('message', message => {
    try {
      const parsedMessage = JSON.parse(message);
      console.log("📩 Message reçu :", parsedMessage);
      // Broadcast message to all clients
      wss.broadcast(parsedMessage);
    } catch (error) {
      console.error("Erreur de traitement du message:", error);
    }
  });

  ws.on('error', error => {
    console.error("WebSocket error:", error);
  });

  ws.on('close', () => {
    console.log("Client WebSocket déconnecté");
  });
});

// Handle server shutdown gracefully
process.on('SIGINT', () => {
  console.log('Shutting down WebSocket server...');
  wss.clients.forEach(client => client.close());
  wss.close(() => {
    process.exit(0);
  });
});


// Configuration de l'upload des images
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// Middleware pour servir les fichiers statiques
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
const statistiquesRoutes = require('./routes/statistiques');
const performancesRoutes = require('./routes/performances');
const stocksRoutes = require('./routes/stocks');
const avoirsRoutes = require('./routes/avoirs');
const famillesRoutes = require('./routes/familles');
const articlesRoutes = require('./routes/articles');
const cartemenuRoutes = require('./routes/cartemenu');
const serveurRoutes = require('./routes/serveur');
const statsRouter = require('./routes/stats');// Add other routes here


app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/salles', sallesRoutes);
app.use('/api/tables', tablesRoutes);
app.use('/api/plats', platsRoutes);
app.use('/api/boissons', boissonsRoutes);
app.use('/api/intrants', intrantsRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/commandes', commandesRoutes);
app.use('/api/paiements', paiementsRoutes);
app.use('/api/caisses', caissesRoutes);
app.use('/api/statistiques', statistiquesRoutes);
app.use('/api/performances', performancesRoutes);
app.use('/api/stocks', stocksRoutes);
app.use('/api/avoirs', avoirsRoutes);
app.use('/api/familles', famillesRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/cartemenu', cartemenuRoutes);
app.use('/api/serveur', serveurRoutes);
app.use('/api/stats', statsRouter);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});


module.exports = app;
