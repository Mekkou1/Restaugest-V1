const jwt = require('jsonwebtoken');
const { Utilisateur } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// Générer les tokens JWT
const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
};

// Créer et envoyer les tokens
const createSendTokens = async (user, statusCode, req, res) => {
  const { accessToken, refreshToken } = generateTokens(user.id);

  // Mettre à jour l'état de l'utilisateur
  await user.update({
    etat: 'Connecté',
    derniere_connexion: new Date(),
    tentatives_connexion: 0,
    bloque_jusqu_a: null
  });

  // Créer une nouvelle session
  await user.createSession({
    session_id: require('crypto').randomBytes(32).toString('hex'),
    refresh_token: refreshToken,
    ip_address: req.ip,
    user_agent: req.headers['user-agent'],
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
  });

  // Envoyer la réponse
  res.status(statusCode).json({
    status: 'success',
    accessToken,
    refreshToken,
    data: {
      user: {
        id: user.id,
        pseudo: user.pseudo,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role,
        email: user.email
      }
    }
  });
};

exports.login = async (req, res, next) => {
  try {
    const { pseudo, mot_de_passe } = req.body;

    // 1) Vérifier si pseudo et mot de passe existent
    if (!pseudo || !mot_de_passe) {
      return next(new AppError('Veuillez fournir un pseudo et un mot de passe', 400));
    }

    // 2) Vérifier si l'utilisateur existe
    const user = await Utilisateur.findOne({ where: { pseudo } });
    if (!user) {
      return next(new AppError('Identifiants incorrects', 401));
    }

    // 3) Vérifier si l'utilisateur est bloqué
    if (user.bloque_jusqu_a && user.bloque_jusqu_a > new Date()) {
      return next(new AppError(`Compte temporairement bloqué. Réessayez après ${user.bloque_jusqu_a}`, 401));
    }

    // 4) Vérifier si le mot de passe est correct
    const correct = await user.verifierMotDePasse(mot_de_passe);
    if (!correct) {
      // Incrémenter le compteur de tentatives
      user.tentatives_connexion += 1;
      
      // Bloquer le compte après 5 tentatives
      if (user.tentatives_connexion >= 5) {
        user.bloque_jusqu_a = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        await user.save();
        return next(new AppError('Trop de tentatives. Compte bloqué pendant 30 minutes.', 401));
      }
      
      await user.save();
      return next(new AppError('Identifiants incorrects', 401));
    }

    // 5) Vérifier si l'utilisateur est actif
    if (user.etat === 'Inactif' || user.etat === 'Suspendu') {
      return next(new AppError('Ce compte est désactivé. Contactez un administrateur.', 401));
    }

    // 6) Si tout est ok, envoyer les tokens
    createSendTokens(user, 200, req, res);
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const user = req.user;
    
    // Mettre à jour l'état de l'utilisateur
    await user.update({ etat: 'Déconnecté' });

    // Invalider toutes les sessions de l'utilisateur
    await user.getSessions().then(sessions => {
      sessions.forEach(session => session.destroy());
    });

    res.status(200).json({
      status: 'success',
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AppError('Refresh token manquant', 400));
    }

    // Vérifier le refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Trouver la session correspondante
    const session = await Session.findOne({
      where: { refresh_token: refreshToken },
      include: [{ model: Utilisateur }]
    });

    if (!session || !session.Utilisateur) {
      return next(new AppError('Session invalide', 401));
    }

    // Générer de nouveaux tokens
    const tokens = generateTokens(session.Utilisateur.id);

    // Mettre à jour la session
    await session.update({
      refresh_token: tokens.refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    res.status(200).json({
      status: 'success',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Refresh token invalide', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Refresh token expiré', 401));
    }
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { mot_de_passe_actuel, nouveau_mot_de_passe } = req.body;
    const user = req.user;

    // 1) Vérifier si les mots de passe sont fournis
    if (!mot_de_passe_actuel || !nouveau_mot_de_passe) {
      return next(new AppError('Veuillez fournir le mot de passe actuel et le nouveau mot de passe', 400));
    }

    // 2) Vérifier si le mot de passe actuel est correct
    const correct = await user.verifierMotDePasse(mot_de_passe_actuel);
    if (!correct) {
      return next(new AppError('Mot de passe actuel incorrect', 401));
    }

    // 3) Mettre à jour le mot de passe
    user.mot_de_passe = nouveau_mot_de_passe;
    await user.save();

    // 4) Déconnecter l'utilisateur de toutes les autres sessions
    await user.getSessions().then(sessions => {
      sessions.forEach(session => {
        if (session.id !== req.session.id) {
          session.destroy();
        }
      });
    });

    res.status(200).json({
      status: 'success',
      message: 'Mot de passe modifié avec succès'
    });
  } catch (error) {
    next(error);
  }
};
