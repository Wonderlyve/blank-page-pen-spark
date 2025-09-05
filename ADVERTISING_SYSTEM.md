# Système de Publicités - Guide d'utilisation

## Vue d'ensemble

Le système de publicités permet à l'utilisateur "Smart" de créer et gérer des publicités natives qui s'affichent dans le feed principal de l'application.

## Fonctionnalités

### 1. Création de Publicités
- Accès via `/ads` (réservé à l'utilisateur Smart)
- Deux types d'actions possibles :
  - **Landing Page** : Redirige vers une page dédiée dans l'app
  - **Site Externe** : Ouvre un lien externe dans un nouvel onglet

### 2. Types de Contenu
- Titre et description courts pour le feed
- Image principale optionnelle
- Bouton d'action personnalisable
- Pour les landing pages : titre détaillé, description longue et images additionnelles

### 3. Gestion et Statistiques
- Activation/désactivation des publicités
- Suivi des vues et clics en temps réel
- Interface de gestion complète

## Architecture Technique

### Base de Données
- **Table `ads`** : Stockage des publicités
- **Table `ad_clicks`** : Traçage des clics utilisateurs
- **Politiques RLS** : Sécurisation des accès (seul Smart peut créer/modifier)

### Composants
- `AdPost.tsx` : Affichage dans le feed
- `Ads.tsx` : Interface de gestion
- `AdLanding.tsx` : Pages de destination
- `useAds.tsx` : Hook de gestion

### Intégration Feed
Les publicités apparaissent naturellement dans le flux principal toutes les 4 publications.

## Sécurité

- **Accès restreint** : Seul l'utilisateur Smart peut créer des publicités
- **RLS Policies** : Contrôle d'accès au niveau base de données
- **Validation** : Vérification des données avant insertion

## Utilisation

1. Se connecter en tant qu'utilisateur Smart
2. Accéder à `/ads`
3. Créer une nouvelle publicité via l'onglet "Créer"
4. Gérer les publicités existantes via l'onglet "Gérer"
5. Les publicités actives apparaissent automatiquement dans le feed

## Statistiques

- **Vues** : Comptées automatiquement à l'affichage
- **Clics** : Enregistrés lors du clic sur le bouton d'action
- **Mise à jour** : Stats actualisées en temps réel via triggers DB

## Configuration Smart User

L'utilisateur Smart est identifié par :
- Email : `smart@example.com` OU
- Profile : `username = 'smart'` OU `display_name = 'Smart'`

La vérification se fait via la table `profiles` pour plus de sécurité.