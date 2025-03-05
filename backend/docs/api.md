# Documentation API Restaugest

## Table des matières

1. [Authentification](#authentification)
2. [Utilisateurs](#utilisateurs)
3. [Établissement](#établissement)
4. [Menu](#menu)
5. [Commandes](#commandes)
6. [Préparations](#préparations)
7. [Caisse](#caisse)
8. [Paiements](#paiements)
9. [Devises](#devises)
10. [Statistiques](#statistiques)

## Authentification

### POST /api/auth/login
Connexion d'un utilisateur
```json
{
  "pseudo": "string",
  "mot_de_passe": "string"
}
```

### POST /api/auth/refresh
Rafraîchissement du token d'accès
```json
{
  "refresh_token": "string"
}
```

### POST /api/auth/logout
Déconnexion de l'utilisateur

## Utilisateurs

### GET /api/utilisateurs
Liste des utilisateurs

### POST /api/utilisateurs
Création d'un utilisateur
```json
{
  "pseudo": "string",
  "mot_de_passe": "string",
  "nom": "string",
  "prenom": "string",
  "email": "string",
  "role": "Administrateur|Caissier|Serveur|Cuisinier"
}
```

### PUT /api/utilisateurs/:id
Mise à jour d'un utilisateur

### DELETE /api/utilisateurs/:id
Suppression d'un utilisateur

## Établissement

### GET /api/etablissement
Obtenir les informations de l'établissement

### PUT /api/etablissement/:id
Mettre à jour les informations de l'établissement

### GET /api/etablissement/configuration
Obtenir la configuration système

### PUT /api/etablissement/configuration
Mettre à jour la configuration système

## Menu

### GET /api/menu/salles/:salle_id/menu
Liste des menus d'une salle

### POST /api/menu/salles/:salle_id/menu
Créer un menu pour une salle
```json
{
  "nom": "string",
  "description": "string",
  "categories": [
    {
      "categorie_id": "number",
      "ordre": "number",
      "actif": "boolean"
    }
  ]
}
```

### PUT /api/menu/salles/:salle_id/prix
Définir les prix des articles
```json
{
  "prix": [
    {
      "article_id": "number",
      "devise_id": "number",
      "prix_ht": "number",
      "taux_tva": "number"
    }
  ]
}
```

## Commandes

### GET /api/commandes
Liste des commandes

### POST /api/commandes
Créer une commande
```json
{
  "table_id": "number",
  "articles": [
    {
      "article_id": "number",
      "quantite": "number",
      "notes": "string"
    }
  ]
}
```

## Préparations

### GET /api/preparations
Liste des préparations

### POST /api/preparations
Créer une préparation
```json
{
  "recette_id": "number",
  "commande_id": "number",
  "quantite": "number"
}
```

### PUT /api/preparations/:id/demarrer
Démarrer une préparation

### PUT /api/preparations/:id/terminer
Terminer une préparation

## Caisse

### POST /api/sessions-caisse/ouvrir
Ouvrir une session de caisse
```json
{
  "caisse_id": "number",
  "fond_initial": {
    "devise_id": "number",
    "montant": "number"
  },
  "billetage": [
    {
      "devise_id": "number",
      "valeur": "number",
      "quantite": "number",
      "type": "billet|piece"
    }
  ]
}
```

### PUT /api/sessions-caisse/:id/fermer
Fermer une session de caisse

## Paiements

### POST /api/paiements
Créer un paiement
```json
{
  "ticket_id": "number",
  "mode_paiement_id": "number",
  "devise_id": "number",
  "montant": "number"
}
```

### POST /api/paiements/avoirs
Créer un avoir
```json
{
  "ticket_origine_id": "number",
  "client_nom": "string",
  "montant": "number",
  "date_expiration": "date"
}
```

## Devises

### GET /api/devises
Liste des devises

### POST /api/devises
Créer une devise
```json
{
  "code": "string",
  "nom": "string",
  "symbole": "string",
  "taux_change": "number"
}
```

### PUT /api/devises/:id/taux
Mettre à jour le taux de change
```json
{
  "taux_change": "number",
  "motif": "string"
}
```

## Statistiques

### GET /api/stats/chiffre-affaires
Obtenir le chiffre d'affaires
```
Query params:
- debut: Date de début (YYYY-MM-DD)
- fin: Date de fin (YYYY-MM-DD)
- periode: jour|semaine|mois
```

### GET /api/stats/dashboard
Obtenir les statistiques du tableau de bord

## Codes d'erreur

- 400: Requête invalide
- 401: Non authentifié
- 403: Non autorisé
- 404: Ressource non trouvée
- 409: Conflit
- 500: Erreur serveur

## Websockets

Les événements WebSocket sont disponibles pour les notifications en temps réel :

### Cuisine
- `preparation.created`: Nouvelle préparation
- `preparation.started`: Préparation démarrée
- `preparation.completed`: Préparation terminée

### Caisse
- `payment.created`: Nouveau paiement
- `session.opened`: Session ouverte
- `session.closed`: Session fermée

### Menu
- `menu.updated`: Menu mis à jour
- `prices.updated`: Prix mis à jour

## Notes

- Toutes les requêtes (sauf /auth/login) doivent inclure un token JWT dans l'en-tête Authorization
- Les dates sont au format ISO 8601
- Les montants sont en centimes
- Les réponses suivent le format:
```json
{
  "status": "success|error",
  "data": {},
  "message": "string"
}
