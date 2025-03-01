const db = require('../config/database');

async function checkPasswords() {
  try {
    console.log('Récupération des utilisateurs...');
    
    const users = await db.models.Utilisateur.findAll({
      attributes: ['id', 'pseudo', 'mot_de_passe'],
      raw: true
    });
    
    if (users.length === 0) {
      console.log('Aucun utilisateur trouvé dans la base de données');
      return;
    }
    
    console.log('Liste des utilisateurs et leurs mots de passe :');
    users.forEach(user => {
      console.log(`ID: ${user.id}, Pseudo: ${user.pseudo}, Mot de passe: ${user.mot_de_passe}`);
    });
    
  } catch (error) {
    console.error('Erreur lors de la vérification des mots de passe:', error);
  }
}

checkPasswords();
