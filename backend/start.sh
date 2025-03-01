#!/bin/bash

# Script pour démarrer le backend
echo "Démarrage du serveur backend..."

# Charger les variables d'environnement
if [ -f .env ]; then
  echo "Chargement des variables d'environnement depuis .env"
  export $(grep -v '^#' .env | xargs)
else
  echo "⚠️  Fichier .env non trouvé. Assurez-vous qu'il existe à la racine du projet."
fi

# Vérification des dépendances
echo "Installation des dépendances si nécessaires..."
npm install

# Lancer le serveur
echo "Lancement du serveur sur http://localhost:$PORT"
npm start
