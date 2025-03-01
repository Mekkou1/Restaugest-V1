const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  
  // Ne pas exposer les détails de l'erreur en production
  const error = process.env.NODE_ENV === 'production' 
    ? 'Une erreur est survenue' 
    : err.message;

  res.status(err.status || 500).json({
    success: false,
    error
  });
};

module.exports = errorHandler;
