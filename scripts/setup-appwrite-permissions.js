/**
 * Script de configuration automatique des permissions Appwrite
 * 
 * Ce script configure les permissions pour toutes les collections
 * de la base de données Aljiwar.
 * 
 * Usage:
 *   node scripts/setup-appwrite-permissions.js
 */

const sdk = require('node-appwrite');

// Configuration
const ENDPOINT = 'https://fra.cloud.appwrite.io/v1';
const PROJECT_ID = '69244b9b001284d94352';
const DATABASE_ID = '69244cec00107cfda4b7';

// IMPORTANT: Créez une API Key dans Appwrite Console
// Settings → API Keys → Create API Key
// Permissions: Database (Read, Write)
const API_KEY = process.env.APPWRITE_API_KEY || 'YOUR_API_KEY_HERE';

// Initialiser le client
const client = new sdk.Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new sdk.Databases(client);

/**
 * Configure les permissions pour une collection
 */
async function setCollectionPermissions(collectionId, permissions) {
    try {
        console.log(`📝 Configuration des permissions pour: ${collectionId}`);

        await databases.updateCollection(
            DATABASE_ID,
            collectionId,
            collectionId, // name (unchanged)
            permissions
        );

        console.log(`✅ Permissions configurées pour: ${collectionId}`);
    } catch (error) {
        console.error(`❌ Erreur pour ${collectionId}:`, error.message);
    }
}

/**
 * Configuration principale
 */
async function setupPermissions() {
    console.log('🚀 Démarrage de la configuration des permissions Appwrite\n');

    // 1. Collection: users
    await setCollectionPermissions('users', [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.users()),
        sdk.Permission.update(sdk.Role.users()),
        sdk.Permission.delete(sdk.Role.users())
    ]);

    // 2. Collection: members
    await setCollectionPermissions('members', [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.users()),
        sdk.Permission.update(sdk.Role.users()),
        sdk.Permission.delete(sdk.Role.users())
    ]);

    // 3. Collection: activities
    await setCollectionPermissions('activities', [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.users()),
        sdk.Permission.update(sdk.Role.users()),
        sdk.Permission.delete(sdk.Role.users())
    ]);

    // 4. Collection: activity_registrations
    await setCollectionPermissions('activity_registrations', [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.users()),
        sdk.Permission.update(sdk.Role.users()),
        sdk.Permission.delete(sdk.Role.users()) // ← Permet aux viewers de se désinscrire
    ]);

    // 5. Collection: evaluations
    await setCollectionPermissions('evaluations', [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.users()),
        sdk.Permission.update(sdk.Role.users()),
        sdk.Permission.delete(sdk.Role.users())
    ]);

    // 6. Collection: monthly_scores
    await setCollectionPermissions('monthly_scores', [
        sdk.Permission.read(sdk.Role.any()),
        sdk.Permission.create(sdk.Role.users()),
        sdk.Permission.update(sdk.Role.users()),
        sdk.Permission.delete(sdk.Role.users())
    ]);

    console.log('\n✨ Configuration terminée avec succès !');
}

// Exécuter le script
setupPermissions().catch(console.error);
