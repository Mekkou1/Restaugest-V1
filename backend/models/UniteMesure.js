const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class UniteMesure extends Model {
  // Vérifier si l'unité est une unité de masse
  isMasse() {
    return ['KG', 'G', 'MG'].includes(this.code);
  }

  // Vérifier si l'unité est une unité de volume
  isVolume() {
    return ['L', 'ML', 'CL'].includes(this.code);
  }

  // Vérifier si l'unité est une unité de comptage
  isComptage() {
    return ['UNITE', 'PIECE', 'PORTION'].includes(this.code);
  }

  // Vérifier si l'unité est une unité de cuillère
  isCuillere() {
    return ['CS', 'CC', 'PINCEE'].includes(this.code);
  }

  // Obtenir le facteur de conversion vers l'unité de base
  getFacteurConversion() {
    const conversions = {
      // Masse (vers grammes)
      'KG': 1000,
      'G': 1,
      'MG': 0.001,
      
      // Volume (vers millilitres)
      'L': 1000,
      'CL': 10,
      'ML': 1,
      
      // Cuillères (vers millilitres approximatifs)
      'CS': 15,
      'CC': 5,
      'PINCEE': 1,
      
      // Unités de comptage (pas de conversion)
      'UNITE': 1,
      'PIECE': 1,
      'PORTION': 1
    };

    return conversions[this.code] || 1;
  }

  // Convertir une quantité vers une autre unité
  convertirVers(quantite, uniteDestination) {
    // Si même unité, pas de conversion nécessaire
    if (this.code === uniteDestination.code) {
      return quantite;
    }

    // Vérifier la compatibilité des unités
    if (this.isMasse() && !uniteDestination.isMasse()) {
      throw new Error('Impossible de convertir une masse vers une non-masse');
    }
    if (this.isVolume() && !uniteDestination.isVolume()) {
      throw new Error('Impossible de convertir un volume vers un non-volume');
    }
    if (this.isComptage() && !uniteDestination.isComptage()) {
      throw new Error('Impossible de convertir une unité de comptage');
    }

    // Effectuer la conversion
    const facteurSource = this.getFacteurConversion();
    const facteurDestination = uniteDestination.getFacteurConversion();

    return (quantite * facteurSource) / facteurDestination;
  }
}

UniteMesure.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: {
      msg: 'Ce code est déjà utilisé'
    },
    validate: {
      notNull: { msg: 'Le code est requis' },
      notEmpty: { msg: 'Le code ne peut pas être vide' },
      isUppercase: { msg: 'Le code doit être en majuscules' }
    }
  },
  nom: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notNull: { msg: 'Le nom est requis' },
      notEmpty: { msg: 'Le nom ne peut pas être vide' }
    }
  },
  symbole: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('masse', 'volume', 'comptage', 'cuillere'),
    allowNull: false,
    defaultValue: 'comptage',
    validate: {
      notNull: { msg: 'Le type est requis' }
    }
  },
  facteur_conversion: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: false,
    defaultValue: 1,
    validate: {
      notNull: { msg: 'Le facteur de conversion est requis' },
      min: {
        args: [0],
        msg: 'Le facteur de conversion doit être positif'
      }
    }
  },
  unite_base: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'UniteMesure',
  tableName: 'unites_mesure',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeValidate: (unite) => {
      // Convertir le code en majuscules
      if (unite.code) {
        unite.code = unite.code.toUpperCase();
      }
    }
  }
});

// Méthodes statiques pour la conversion
UniteMesure.convertir = async function(quantite, uniteSourceId, uniteDestinationId) {
  const uniteSource = await this.findByPk(uniteSourceId);
  const uniteDestination = await this.findByPk(uniteDestinationId);

  if (!uniteSource || !uniteDestination) {
    throw new Error('Unités de mesure non trouvées');
  }

  return uniteSource.convertirVers(quantite, uniteDestination);
};

// Méthodes statiques pour obtenir les unités par type
UniteMesure.getUnitesMasse = function() {
  return this.findAll({
    where: { type: 'masse' },
    order: [['facteur_conversion', 'DESC']]
  });
};

UniteMesure.getUnitesVolume = function() {
  return this.findAll({
    where: { type: 'volume' },
    order: [['facteur_conversion', 'DESC']]
  });
};

UniteMesure.getUnitesComptage = function() {
  return this.findAll({
    where: { type: 'comptage' }
  });
};

UniteMesure.getUnitesCuillere = function() {
  return this.findAll({
    where: { type: 'cuillere' },
    order: [['facteur_conversion', 'DESC']]
  });
};

module.exports = UniteMesure;
