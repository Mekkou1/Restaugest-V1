const db = require('../config/database');

async function checkUserPassword() {
  try {
    const [user] = await db.query(
      "SELECT pseudo, mot_de_passe FROM utilisateurs WHERE pseudo = 'admin1'"
    );
    
    if (user.length === 0) {
      console.log('Utilisateur non trouvé');
      return;
    }

    console.log('Mot de passe hashé pour admin1:', user[0].mot_de_passe);
  } catch (error) {
    console.error('Erreur lors de la vérification du mot de passe:', error);
  }
}

checkUserPassword();
