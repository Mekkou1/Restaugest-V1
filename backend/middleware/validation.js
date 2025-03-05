const { validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

/**
 * Middleware de validation des données
 * Utilise express-validator pour valider les données entrantes
 */
module.exports = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Formater les erreurs de manière plus lisible
    const formattedErrors = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }));

    // Si nous sommes en développement, ajouter plus de détails
    if (process.env.NODE_ENV === 'development') {
      return res.status(400).json({
        status: 'error',
        message: 'Erreur de validation',
        errors: formattedErrors,
        details: errors.array()
      });
    }

    // En production, renvoyer uniquement les messages d'erreur essentiels
    return res.status(400).json({
      status: 'error',
      message: 'Erreur de validation',
      errors: formattedErrors.map(err => ({
        field: err.field,
        message: err.message
      }))
    });
  }

  next();
};

/**
 * Validateurs personnalisés
 */
exports.customValidators = {
  // Vérifier si une valeur est un nombre valide
  isValidNumber: (value) => {
    if (typeof value === 'string') {
      return !isNaN(value) && !isNaN(parseFloat(value));
    }
    return typeof value === 'number' && !isNaN(value);
  },

  // Vérifier si une date est valide
  isValidDate: (value) => {
    const date = new Date(value);
    return date instanceof Date && !isNaN(date);
  },

  // Vérifier si une valeur est un tableau non vide
  isNonEmptyArray: (value) => {
    return Array.isArray(value) && value.length > 0;
  },

  // Vérifier si une chaîne contient uniquement des caractères alphanumériques et des espaces
  isAlphanumericWithSpaces: (value) => {
    return /^[a-zA-Z0-9\s]*$/.test(value);
  },

  // Vérifier si une valeur est un montant valide (nombre positif avec max 2 décimales)
  isValidAmount: (value) => {
    if (!exports.customValidators.isValidNumber(value)) return false;
    const amount = parseFloat(value);
    return amount >= 0 && /^\d+(\.\d{1,2})?$/.test(amount.toString());
  },

  // Vérifier si une valeur est un code devise valide (3 caractères majuscules)
  isValidCurrencyCode: (value) => {
    return /^[A-Z]{3}$/.test(value);
  },

  // Vérifier si une valeur est un numéro de téléphone valide
  isValidPhoneNumber: (value) => {
    // Format international avec ou sans +
    return /^(\+?\d{1,3})?[-.\s]?\d{9,}$/.test(value);
  },

  // Vérifier si une valeur est une adresse email valide
  isValidEmail: (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
};

/**
 * Validateurs pour les modèles spécifiques
 */
exports.modelValidators = {
  // Validation des données utilisateur
  user: {
    pseudo: {
      notEmpty: true,
      isLength: { min: 3, max: 50 },
      matches: /^[a-zA-Z0-9_-]+$/
    },
    email: {
      isEmail: true,
      normalizeEmail: true
    },
    password: {
      isLength: { min: 6 },
      matches: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*$/
    }
  },

  // Validation des données de commande
  order: {
    tableId: {
      isInt: true,
      min: 1
    },
    items: {
      isArray: true,
      notEmpty: true
    }
  },

  // Validation des données de paiement
  payment: {
    amount: {
      isFloat: true,
      min: 0.01
    },
    currency: {
      isLength: { min: 3, max: 3 },
      isUppercase: true
    }
  }
};

/**
 * Middleware de sanitization des données
 * Nettoie les données entrantes pour éviter les injections
 */
exports.sanitize = (req, res, next) => {
  // Fonction récursive pour nettoyer un objet
  const sanitizeObject = (obj) => {
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'string') {
        // Nettoyer les chaînes de caractères
        obj[key] = obj[key]
          .trim()
          .replace(/[<>]/g, '') // Supprimer les chevrons
          .replace(/javascript:/gi, '') // Supprimer les protocoles javascript:
          .replace(/on\w+=/gi, ''); // Supprimer les gestionnaires d'événements inline
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        // Récursivement nettoyer les objets imbriqués
        sanitizeObject(obj[key]);
      }
    });
  };

  // Nettoyer le corps de la requête
  if (req.body) {
    sanitizeObject(req.body);
  }

  // Nettoyer les paramètres de requête
  if (req.query) {
    sanitizeObject(req.query);
  }

  next();
};
