const db = require('../config/database');
const cron = require('node-cron');

const cleanupExpiredSessions = async () => {
  try {
    const [result] = await db.query("DELETE FROM sessions WHERE expiresAt < NOW()");
    if (result.affectedRows > 0) {
      console.log(`Session cleanup: Removed ${result.affectedRows} expired sessions`);
    }
  } catch (error) {
    console.error('Session cleanup error:', error.message);
  }
};

// Schedule cleanup to run every 15 minutes
const initSessionCleanup = () => {
  cron.schedule('*/15 * * * *', cleanupExpiredSessions);
};


module.exports = {
  initSessionCleanup,
  cleanupExpiredSessions
};
