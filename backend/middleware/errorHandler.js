const logger = require('../utils/logger');

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

const handleSequelizeValidationError = (err) => {
  const errors = err.errors.map(error => ({
    field: error.path,
    message: error.message
  }));
  return new AppError(`Erreur de validation: ${errors[0].message}`, 400);
};

const handleSequelizeUniqueConstraintError = (err) => {
  const field = err.errors[0].path;
  return new AppError(`La valeur '${err.errors[0].value}' existe déjà pour le champ ${field}`, 400);
};

const handleJWTError = () => 
  new AppError('Token invalide. Veuillez vous reconnecter.', 401);

const handleJWTExpiredError = () => 
  new AppError('Votre token a expiré. Veuillez vous reconnecter.', 401);

const sendErrorDev = (err, res) => {
  logger.error('Error 💥', err);
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // Erreur opérationnelle, connue : envoyer message au client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } 
  // Erreur de programmation ou autre : ne pas divulguer les détails
  else {
    logger.error('Error 💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Une erreur inattendue s\'est produite'
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    if (err.name === 'SequelizeValidationError') 
      error = handleSequelizeValidationError(err);
    if (err.name === 'SequelizeUniqueConstraintError') 
      error = handleSequelizeUniqueConstraintError(err);
    if (err.name === 'JsonWebTokenError') 
      error = handleJWTError();
    if (err.name === 'TokenExpiredError') 
      error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

module.exports.AppError = AppError;
