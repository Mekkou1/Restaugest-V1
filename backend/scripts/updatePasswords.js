sans se connecté
const bcrypt = require('bcryptjs');
const db = require('../config/database');

const defaultPassword = 'password123'; // Mot de passe par défaut
const saltRounds = 10;

async function updatePasswords() {
  try {
    // Récupérer tous les utilisateurs
    const users = await db.models.Utilisateur.findAll();
    
    // Hacher le mot de passe par défaut
    const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);
    
    // Mettre à jour chaque utilisateur
    for (const user of users) {
      await user.update({ mot_de_passe: hashedPassword });
      console.log(`Mot de passe mis à jour pour ${user.pseudo}`);
    }
    
    console.log('Tous les mots de passe ont été mis à jour');
    console.log(`Le nouveau mot de passe pour tous les utilisateurs est : ${defaultPassword}`);
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour des mots de passe:', error);
  }
}

updatePasswords();
