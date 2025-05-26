# 🚀 Configuration PebbleHost avec MySQL

Ce guide t'explique comment configurer ton bot Discord avec une base de données MySQL sur PebbleHost.

## 📋 Prérequis

1. **Compte PebbleHost** avec un plan Bot Hosting ($3/mois)
2. **Bot Discord** créé sur le Discord Developer Portal
3. **Fichiers du bot** uploadés sur PebbleHost

## 🗄️ Configuration de la Base de Données MySQL

### 1. Créer la Base de Données
1. Connecte-toi à ton panneau PebbleHost
2. Va dans **"MySQL Database"** dans la sidebar
3. Clique sur **"Create Database"**
4. Note les informations de connexion :
   - **Host** : `eu01-sql.pebblehost.com` (ou similaire)
   - **Username** : `customer_XXXXX_botname`
   - **Password** : (généré automatiquement)
   - **Database** : `customer_XXXXX_botname`
   - **Port** : `3306`

### 2. Configurer les Variables d'Environnement
1. Va dans **"File Manager"**
2. Crée un fichier `.env` à la racine de ton projet
3. Ajoute les variables suivantes :

```env
# Discord Bot Configuration
DISCORD_TOKEN=ton_token_discord_ici
CLIENT_ID=ton_client_id_discord_ici

# MySQL Database Configuration (PebbleHost)
DB_HOST=eu01-sql.pebblehost.com
DB_USER=customer_XXXXX_botname
DB_PASSWORD=ton_mot_de_passe_mysql
DB_NAME=customer_XXXXX_botname
DB_PORT=3306

# Optional: Environment
NODE_ENV=production
```

### 3. Installation des Dépendances
1. Va dans **"Console"**
2. Exécute la commande :
```bash
npm install
```

## 🔧 Structure de la Base de Données

Le bot créera automatiquement ces tables au démarrage :

### `server_config`
- Configuration des serveurs (canaux, paramètres)
- **Colonnes** : `guild_id`, `welcome_channel_id`, `blessing_channel_id`, `ticket_category_id`, `ticket_channel_id`, `level_channel_id`

### `user_levels`
- Système de niveaux des utilisateurs
- **Colonnes** : `user_id`, `guild_id`, `xp`, `level`, `last_message`

### `prayer_requests`
- Demandes de prière
- **Colonnes** : `user_id`, `guild_id`, `request_text`, `is_anonymous`

### `used_verses`
- Versets bibliques utilisés (pour éviter les doublons)
- **Colonnes** : `verse_index`, `used_date`, `guild_id`

### `tickets`
- Système de tickets de support
- **Colonnes** : `ticket_id`, `user_id`, `guild_id`, `channel_id`, `subject`, `status`

## 🚀 Démarrage du Bot

1. **Démarrer le bot** :
   ```bash
   npm start
   ```

2. **Vérifier la connexion** :
   - Tu devrais voir : `✅ Connecté à la base de données MySQL`
   - Et : `✅ Tables de base de données initialisées`

## ⚙️ Configuration du Bot

### 1. Configurer les Canaux
Utilise la commande `/config channels` pour configurer :
- **Welcome** : Canal de bienvenue
- **Blessings** : Canal pour les bénédictions quotidiennes (15h00)
- **Ticket Category** : Catégorie pour les tickets
- **Ticket Channel** : Canal de création de tickets
- **Level** : Canal d'annonces de niveau

### 2. Vérifier la Configuration
Utilise `/config view` pour voir la configuration actuelle.

## 🔍 Fonctionnalités Disponibles

### ✅ **Avec MySQL** :
- ✅ Configuration persistante des serveurs
- ✅ Système de niveaux avec XP
- ✅ Demandes de prière sauvegardées
- ✅ Versets quotidiens sans doublons
- ✅ Système de tickets complet
- ✅ Multi-serveurs supporté

### ❌ **Sans MySQL** (fichiers JSON) :
- ❌ Configuration perdue au redémarrage
- ❌ Pas de persistance des niveaux
- ❌ Versets peuvent se répéter
- ❌ Tickets non sauvegardés

## 🛠️ Dépannage

### Erreur de Connexion MySQL
```
❌ Erreur de connexion à la base de données
```
**Solutions** :
1. Vérifier les variables d'environnement dans `.env`
2. S'assurer que la base de données existe
3. Vérifier les permissions MySQL

### Tables Non Créées
```
❌ Erreur lors de l'initialisation des tables
```
**Solutions** :
1. Vérifier les permissions de la base de données
2. Redémarrer le bot
3. Contacter le support PebbleHost

### Bot Ne Répond Pas
**Solutions** :
1. Vérifier que le token Discord est correct
2. S'assurer que le bot a les permissions nécessaires
3. Vérifier les logs dans la console PebbleHost

## 📊 Avantages de MySQL sur PebbleHost

1. **Persistance** : Données sauvegardées même après redémarrage
2. **Performance** : Requêtes optimisées pour les gros serveurs
3. **Fiabilité** : Sauvegardes automatiques par PebbleHost
4. **Scalabilité** : Support de plusieurs serveurs Discord
5. **Gratuit** : 1 base de données MySQL incluse

## 🔗 Liens Utiles

- [PebbleHost Discord Bot Hosting](https://pebblehost.com/bot-hosting)
- [Documentation MySQL](https://dev.mysql.com/doc/)
- [Support PebbleHost](https://help.pebblehost.com/)

---

**Note** : Ce bot est maintenant entièrement compatible avec l'hébergement PebbleHost et utilise MySQL pour une meilleure performance et fiabilité ! 🎉 