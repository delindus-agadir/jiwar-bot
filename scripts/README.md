# Scripts d'Administration Appwrite

Ce dossier contient des scripts pour automatiser la configuration et la gestion d'Appwrite.

## 📋 Scripts Disponibles

### `setup-appwrite-permissions.js`

Configure automatiquement les permissions pour toutes les collections de la base de données.

#### Prérequis

1. **Installer le SDK Appwrite Node.js** :
   ```bash
   npm install node-appwrite
   ```

2. **Créer une API Key dans Appwrite** :
   - Allez dans **Appwrite Console** → **Settings** → **API Keys**
   - Cliquez sur **Create API Key**
   - Nom : `Setup Script`
   - Scopes : Cochez **Database** (Read + Write)
   - Copiez la clé générée

3. **Configurer la clé API** :
   
   **Option 1 - Variable d'environnement (Recommandé)** :
   ```bash
   # Windows PowerShell
   $env:APPWRITE_API_KEY="votre_cle_api_ici"
   
   # Windows CMD
   set APPWRITE_API_KEY=votre_cle_api_ici
   
   # Linux/Mac
   export APPWRITE_API_KEY=votre_cle_api_ici
   ```
   
   **Option 2 - Modifier le script** :
   Ouvrez `setup-appwrite-permissions.js` et remplacez `YOUR_API_KEY_HERE` par votre clé.

#### Utilisation

```bash
# Depuis la racine du projet
node scripts/setup-appwrite-permissions.js
```

#### Ce que fait le script

- Configure les permissions pour toutes les collections :
  - `users`
  - `members`
  - `activities`
  - `activity_registrations`
  - `evaluations`
  - `monthly_scores`

- Permissions appliquées :
  - **Read** : Tout le monde (y compris non-connectés)
  - **Create/Update/Delete** : Utilisateurs connectés uniquement

#### Résultat attendu

```
🚀 Démarrage de la configuration des permissions Appwrite

📝 Configuration des permissions pour: users
✅ Permissions configurées pour: users
📝 Configuration des permissions pour: members
✅ Permissions configurées pour: members
...
✨ Configuration terminée avec succès !
```

## 🔒 Sécurité

⚠️ **IMPORTANT** : Ne commitez JAMAIS votre API Key dans Git !

- Utilisez toujours des variables d'environnement
- Ajoutez `.env` à votre `.gitignore`
- Révoquezles clés API inutilisées

## 🆘 Dépannage

### Erreur : "Invalid API key"
- Vérifiez que votre API Key est correcte
- Assurez-vous que la clé a les permissions Database (Read + Write)

### Erreur : "Collection not found"
- Vérifiez que toutes les collections existent dans Appwrite
- Vérifiez le `DATABASE_ID` dans le script

### Erreur : "Network error"
- Vérifiez votre connexion Internet
- Vérifiez que l'endpoint Appwrite est accessible
