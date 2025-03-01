const bcrypt = require('bcrypt');
const db = require('../config/database');

async function resetPassword(pseudo, newPassword) {
  try {
    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password in database
    const [result] = await db.query(
      'UPDATE utilisateurs SET mot_de_passe = ? WHERE pseudo = ?',
      [hashedPassword, pseudo]
    );

    if (result.affectedRows > 0) {
      console.log(`Password for ${pseudo} has been successfully reset`);
    } else {
      console.log(`User ${pseudo} not found`);
    }
  } catch (error) {
    console.error('Error resetting password:', error);
  }
}

// Usage: node resetPassword.js <pseudo> <newPassword>
const args = process.argv.slice(2);
if (args.length === 2) {
  resetPassword(args[0], args[1]);
} else {
  console.log('Usage: node resetPassword.js <pseudo> <newPassword>');
}
