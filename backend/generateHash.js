const bcrypt = require('bcryptjs');

async function generateHash() {
  try {
    const hash = await bcrypt.hash('restaugest123', 10);
    console.log('Hash généré:', hash);
  } catch (error) {
    console.error('Erreur lors de la génération du hash:', error);
  }
}

generateHash();
