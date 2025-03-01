const db = require('../config/database');

async function checkTableStructure() {
  try {
    const [columns] = await db.query("SHOW COLUMNS FROM utilisateurs");
    console.log('Structure de la table utilisateurs :');
    console.table(columns);
    
    const [data] = await db.query("SELECT * FROM utilisateurs LIMIT 1");
    console.log('Exemple de données :');
    console.table(data);
  } catch (error) {
    console.error('Erreur lors de la vérification de la structure de la table :', error);
  }
}

checkTableStructure();
