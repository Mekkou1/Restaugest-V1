const winston = require('winston');
const path = require('path');

// Définition des niveaux de log personnalisés
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Définition des couleurs pour chaque niveau
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Ajout des couleurs à Winston
winston.addColors(colors);

// Format personnalisé
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Format pour la console
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Création du logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels,
  format,
  transports: [
    // Écriture de tous les logs dans combined.log
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/combined.log'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    // Écriture des logs d'erreur dans error.log
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    // Écriture des logs HTTP dans http.log
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/http.log'),
      level: 'http',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ]
});

// Si nous ne sommes pas en production, on ajoute la sortie console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Fonction pour logger les requêtes HTTP
logger.logHttp = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('user-agent') || '',
      ip: req.ip
    });
  });
  next();
};

// Fonction pour logger les erreurs avec plus de détails
logger.logError = (error, req = null) => {
  const errorDetails = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  };

  if (req) {
    errorDetails.method = req.method;
    errorDetails.url = req.url;
    errorDetails.headers = req.headers;
    errorDetails.body = req.body;
    errorDetails.params = req.params;
    errorDetails.query = req.query;
  }

  logger.error(errorDetails);
};

// Création des répertoires de logs s'ils n'existent pas
const fs = require('fs');
const logsDir = path.join(__dirname, '../logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

module.exports = logger;
