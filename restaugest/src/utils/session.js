import api from './api';
import store from '../store';

export const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
export const REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds

export const sessionManager = {
  /**
   * Start session monitoring
   */
  startMonitoring() {
    // Update last activity every minute
    setInterval(this.updateLastActivity, 60000);
    
    // Check session expiration every minute
    setInterval(this.checkSessionExpiration, 60000);
    
    // Add activity listeners
    this.addActivityListeners();
  },

  /**
   * Stop session monitoring
   */
  stopMonitoring() {
    // Remove activity listeners
    this.removeActivityListeners();
  },

  /**
   * Update last activity timestamp
   */
  async updateLastActivity() {
    const session = store.getters['auth/getSession'];
    if (!session) return;

    try {
      await api.post('/auth/activity', {
        session_id: session.session_id
      });
      store.commit('auth/UPDATE_LAST_ACTIVITY');
    } catch (error) {
      console.error('Failed to update activity:', error);
    }
  },

  /**
   * Check session expiration and refresh if needed
   */
  async checkSessionExpiration() {
    const session = store.getters['auth/getSession'];
    if (!session) return;

    const expiresAt = new Date(session.expires_at);
    const now = new Date();
    
    // If session expires in less than REFRESH_THRESHOLD, try to refresh
    if ((expiresAt - now) < REFRESH_THRESHOLD) {
      try {
        await store.dispatch('auth/refreshSession');
      } catch (error) {
        console.error('Session refresh failed:', error);
        // If refresh fails, logout
        await store.dispatch('auth/logout');
      }
    }
  },

  /**
   * Add activity listeners for session monitoring
   */
  addActivityListeners() {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      window.addEventListener(event, this.handleUserActivity.bind(this));
    });
  },

  /**
   * Remove activity listeners
   */
  removeActivityListeners() {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      window.removeEventListener(event, this.handleUserActivity.bind(this));
    });
  },

  /**
   * Handle user activity
   */
  handleUserActivity: (() => {
    let timeout;
    
    return () => {
      // Debounce activity updates to prevent too many requests
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        sessionManager.updateLastActivity();
      }, 1000);
    };
  })(),

  /**
   * Get remaining session time in milliseconds
   */
  getRemainingTime() {
    const session = store.getters['auth/getSession'];
    if (!session) return 0;

    const expiresAt = new Date(session.expires_at);
    const now = new Date();
    return Math.max(0, expiresAt - now);
  },

  /**
   * Format remaining time as a human-readable string
   */
  formatRemainingTime() {
    const remaining = this.getRemainingTime();
    
    if (remaining === 0) return 'Expirée';
    
    const minutes = Math.floor(remaining / 60000);
    if (minutes < 60) {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} heure${hours > 1 ? 's' : ''}`;
    }
    
    const days = Math.floor(hours / 24);
    return `${days} jour${days > 1 ? 's' : ''}`;
  },

  /**
   * Check if session is about to expire
   */
  isAboutToExpire() {
    return this.getRemainingTime() < REFRESH_THRESHOLD;
  },

  /**
   * Check if session is expired
   */
  isExpired() {
    return this.getRemainingTime() === 0;
  }
};

export default sessionManager;
