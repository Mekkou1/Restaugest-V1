import api from './api';

export const userRoles = {
  ADMIN: 'Administrateur',
  CAISSIER: 'Caissier',
  SERVEUR: 'Serveur',
  CUISINIER: 'Cuisinier'
};

export const userStatus = {
  ACTIF: 'Actif',
  INACTIF: 'Inactif',
  CONNECTE: 'Connecté',
  DECONNECTE: 'Déconnecté',
  SUSPENDU: 'Suspendu'
};

export const userManager = {
  /**
   * Get role badge class
   */
  getRoleBadgeClass(role) {
    const classes = {
      [userRoles.ADMIN]: 'bg-danger',
      [userRoles.CAISSIER]: 'bg-success',
      [userRoles.SERVEUR]: 'bg-primary',
      [userRoles.CUISINIER]: 'bg-warning text-dark'
    };
    return `badge ${classes[role] || 'bg-secondary'}`;
  },

  /**
   * Get status badge class
   */
  getStatusBadgeClass(status) {
    const classes = {
      [userStatus.ACTIF]: 'bg-success',
      [userStatus.INACTIF]: 'bg-secondary',
      [userStatus.CONNECTE]: 'bg-primary',
      [userStatus.DECONNECTE]: 'bg-warning text-dark',
      [userStatus.SUSPENDU]: 'bg-danger'
    };
    return `badge ${classes[status] || 'bg-secondary'}`;
  },

  /**
   * Format date
   */
  formatDate(date) {
    if (!date) return 'Jamais';
    return new Date(date).toLocaleString();
  },

  /**
   * Get time ago
   */
  getTimeAgo(date) {
    if (!date) return '';
    
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'il y a quelques secondes';
    if (seconds < 3600) return `il y a ${Math.floor(seconds / 60)} minutes`;
    if (seconds < 86400) return `il y a ${Math.floor(seconds / 3600)} heures`;
    return `il y a ${Math.floor(seconds / 86400)} jours`;
  },

  /**
   * Check if user is blocked
   */
  isBlocked(user) {
    return user.bloque_jusqu_a && new Date(user.bloque_jusqu_a) > new Date();
  },

  /**
   * Get remaining block time
   */
  getRemainingBlockTime(user) {
    if (!this.isBlocked(user)) return '';
    
    const remaining = new Date(user.bloque_jusqu_a) - new Date();
    const minutes = Math.ceil(remaining / 60000);
    
    if (minutes < 60) return `${minutes} minute(s)`;
    return `${Math.ceil(minutes / 60)} heure(s)`;
  },

  /**
   * Check if user has permission
   */
  hasPermission(user, requiredRole) {
    if (!user || !user.role) return false;
    
    // Admin has all permissions
    if (user.role === userRoles.ADMIN) return true;
    
    // Check specific role
    return user.role === requiredRole;
  },

  /**
   * Get available roles for user
   */
  getAvailableRoles(currentUser) {
    if (!currentUser) return [];
    
    // Admin can assign all roles
    if (currentUser.role === userRoles.ADMIN) {
      return Object.values(userRoles);
    }
    
    // Others can't assign roles
    return [];
  },

  /**
   * Validate user data
   */
  validateUserData(userData) {
    const errors = {};

    if (!userData.nom) {
      errors.nom = 'Le nom est requis';
    }

    if (!userData.prenom) {
      errors.prenom = 'Le prénom est requis';
    }

    if (!userData.pseudo) {
      errors.pseudo = 'Le pseudo est requis';
    } else if (userData.pseudo.length < 3) {
      errors.pseudo = 'Le pseudo doit contenir au moins 3 caractères';
    }

    if (!userData.email) {
      errors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.email = 'L\'email n\'est pas valide';
    }

    if (!userData.id && !userData.mot_de_passe) {
      errors.mot_de_passe = 'Le mot de passe est requis';
    } else if (!userData.id && userData.mot_de_passe.length < 6) {
      errors.mot_de_passe = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (!userData.role) {
      errors.role = 'Le rôle est requis';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * Format user agent string
   */
  formatUserAgent(userAgent) {
    if (!userAgent) return '';
    
    const browser = userAgent.match(/(chrome|firefox|safari|edge|opera|msie)[\/\s](\d+)/i);
    const os = userAgent.match(/(windows|mac|linux|android|ios)[\/\s](\d+)/i);
    
    return [
      browser ? `${browser[1].charAt(0).toUpperCase() + browser[1].slice(1)} ${browser[2]}` : '',
      os ? `${os[1].charAt(0).toUpperCase() + os[1].slice(1)}` : ''
    ].filter(Boolean).join(' - ');
  }
};

export default userManager;
