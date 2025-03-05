# Restaugest - Système de Gestion de Restaurant

## Description
Restaugest est une application web complète de gestion de restaurant qui permet de gérer les commandes, les tables, le personnel, les stocks et plus encore. L'application est construite avec Vue.js 3 pour le frontend et Node.js/Express pour le backend.

## Fonctionnalités principales

- 🔐 Authentification et gestion des sessions
- 👥 Gestion des utilisateurs et des rôles
- 🍽️ Gestion des tables et des salles
- 📝 Prise de commandes
- 🧾 Gestion des tickets et paiements
- 📊 Statistiques et rapports
- 📦 Gestion des stocks
- 🔔 Notifications en temps réel

## Prérequis

- Node.js >= 14.x
- npm >= 6.x
- MySQL >= 8.0

## Installation

1. Cloner le dépôt :
```bash
git clone https://github.com/votre-compte/restaugest.git
cd restaugest
```

2. Installer les dépendances du frontend :
```bash
cd restaugest
npm install
```

3. Installer les dépendances du backend :
```bash
cd backend
npm install
```

4. Configurer les variables d'environnement :
```bash
# Dans le dossier frontend
cp .env.example .env.local

# Dans le dossier backend
cp .env.example .env
```

5. Configurer la base de données :
```bash
# Créer la base de données
mysql -u root -p < backend/database/restaugest_db.sql
```

## Démarrage

1. Démarrer le backend :
```bash
cd backend
npm run start-backend
```

2. Démarrer le frontend :
```bash
cd restaugest
npm run serve
```

L'application sera accessible à l'adresse : http://localhost:8080

## Structure du projet

```
restaugest/
├── backend/               # Backend Node.js/Express
│   ├── config/           # Configuration
│   ├── middleware/       # Middleware Express
│   ├── models/          # Modèles Sequelize
│   ├── routes/          # Routes API
│   └── utils/           # Utilitaires
├── public/              # Fichiers statiques
├── src/                 # Code source frontend
│   ├── assets/         # Images et styles
│   ├── components/     # Composants Vue
│   ├── router/         # Configuration des routes
│   ├── store/          # État global (Vuex)
│   ├── utils/          # Utilitaires
│   └── views/          # Pages/Vues
└── tests/              # Tests unitaires et E2E
```

## Rôles utilisateurs

- **Administrateur** : Accès complet à toutes les fonctionnalités
- **Caissier** : Gestion des paiements et des tickets
- **Serveur** : Prise de commandes et gestion des tables
- **Cuisinier** : Gestion des commandes en cuisine

## Technologies utilisées

### Frontend
- Vue.js 3
- Vuex 4
- Vue Router 4
- Tailwind CSS
- Font Awesome
- WebSocket

### Backend
- Node.js
- Express
- MySQL
- Sequelize
- JWT
- WebSocket

## Fonctionnalités PWA

- Installation sur l'écran d'accueil
- Fonctionnement hors ligne
- Notifications push
- Synchronisation en arrière-plan

## Sécurité

- Authentification JWT
- Protection CSRF
- Validation des entrées
- Rate limiting
- Sessions sécurisées
- Gestion des rôles

## Tests

```bash
# Exécuter les tests unitaires
npm run test:unit

# Exécuter les tests E2E
npm run test:e2e
```

## Déploiement

1. Construire l'application :
```bash
npm run build
```

2. Configurer le serveur de production :
```bash
# Exemple avec PM2
pm2 start backend/server.js --name restaugest-api
```

## Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## Support

Pour toute question ou problème, veuillez ouvrir une issue sur GitHub.

## Auteurs

- Votre nom - [GitHub](https://github.com/votre-compte)

## Remerciements

- Merci à tous les contributeurs
- Inspiré par les besoins réels des restaurateurs
