# 🤖 Guide de Configuration du Bot Telegram

## 📋 Prérequis

1. Un compte Telegram
2. Node.js installé
3. Accès à votre projet Appwrite

## 🚀 Étape 1 : Créer le Bot Telegram

1. Ouvrez Telegram et cherchez **@BotFather**
2. Envoyez `/newbot`
3. Donnez un nom à votre bot : `Jiwar Association Bot`
4. Donnez un username : `jiwar_association_bot` (doit finir par `_bot`)
5. **Copiez le token** que BotFather vous donne (ressemble à `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

## 🔑 Étape 2 : Obtenir votre Telegram ID

1. Cherchez **@userinfobot** sur Telegram
2. Envoyez `/start`
3. **Copiez votre ID** (un nombre comme `123456789`)

## 🔧 Étape 3 : Créer une clé API Appwrite

1. Allez sur https://cloud.appwrite.io
2. Ouvrez votre projet
3. Allez dans **Settings** → **API Keys**
4. Cliquez sur **Create API Key**
5. Nom : `Telegram Bot`
6. Scopes : Cochez **Database** (Read, Write, Update, Delete)
7. **Copiez la clé** générée

## ⚙️ Étape 4 : Créer la collection `magic_links`

1. Dans Appwrite, allez dans **Databases** → Votre base de données
2. Cliquez sur **Create Collection**
3. Nom : `magic_links`
4. ID : `magic_links`
5. Permissions : **Document Security** (activé)
6. Ajoutez les attributs suivants :

| Attribut | Type | Taille | Requis |
|----------|------|--------|--------|
| token | String | 255 | Oui |
| member_id | String | 255 | Oui |
| user_id | String | 255 | Oui |
| expires_at | DateTime | - | Oui |
| used | Boolean | - | Oui |

7. Créez un **Index** :
   - Key : `token`
   - Type : `key`
   - Attributes : `token`

## 📝 Étape 5 : Ajouter le champ `telegram_id` à la collection `members`

1. Ouvrez la collection **members**
2. Cliquez sur **Create Attribute**
3. Type : **String**
4. Key : `telegram_id`
5. Size : `50`
6. Required : **Non**
7. Default : (vide)

## 🔐 Étape 6 : Configurer le Bot

1. Allez dans le dossier `telegram-bot`
2. Copiez `.env.example` vers `.env` :
   ```bash
   cp .env.example .env
   ```
3. Ouvrez `.env` et remplissez :
   ```env
   TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
   APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
   APPWRITE_PROJECT_ID=69244b9b001284d94352
   APPWRITE_DATABASE_ID=69244cec00107cfda4b7
   APPWRITE_API_KEY=votre_cle_api_ici
   WEB_APP_URL=http://localhost:5173
   ADMIN_TELEGRAM_IDS=123456789
   ```

## 📦 Étape 7 : Installer les dépendances

```bash
cd telegram-bot
npm install
```

## ▶️ Étape 8 : Lancer le Bot

```bash
npm start
```

Vous devriez voir :
```
🤖 Bot Telegram démarré!
📱 Admins: 123456789
```

## ✅ Étape 9 : Tester

1. Cherchez votre bot sur Telegram (ex: `@jiwar_association_bot`)
2. Envoyez `/start`
3. Le bot devrait répondre !

## 🎯 Commandes disponibles

### Pour les utilisateurs :
- `/start` - Démarrer et se connecter

### Pour les admins :
- `/approve <matricule> <telegram_id>` - Approuver un utilisateur
- `/reject <matricule> <telegram_id>` - Rejeter un utilisateur
- `/stats` - Voir les statistiques

## 🔄 Prochaines étapes

1. Créer la page de connexion Telegram sur le site web
2. Tester le flux complet
3. Déployer le bot sur un serveur (Heroku, Railway, etc.)

## 🆘 Dépannage

**Le bot ne répond pas :**
- Vérifiez que le token est correct
- Vérifiez que le bot est démarré (`npm start`)
- Vérifiez les logs dans la console

**Erreur Appwrite :**
- Vérifiez que la clé API a les bonnes permissions
- Vérifiez que la collection `magic_links` existe
- Vérifiez que le champ `telegram_id` existe dans `members`

**Pas de notifications admin :**
- Vérifiez que votre Telegram ID est dans `ADMIN_TELEGRAM_IDS`
- Vérifiez que le bot peut vous envoyer des messages (envoyez-lui `/start` d'abord)
