import { Client, Databases } from 'node-appwrite';

// Configuration
const ENDPOINT = 'https://fra.cloud.appwrite.io/v1';
const PROJECT_ID = '69244b9b001284d94352';
const DATABASE_ID = '69244cec00107cfda4b7';
const API_KEY = 'standard_c024ef4e64c74f58b31458e4fa569ebe1d087503ae51fa3ca5cf7b59c93c527b7f7f93981e733e257cff0d3dd2c00713f1c9c3fd0889554fbbb0c39918b9bf45eb75baff125646fe676446fbbfb637c57c1db021fee436c88398dfdd4fb548688dd55ac5875e5f03486d4917f0ecbdb54e9fcf809da5652c599b491247f89de5';

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

async function updateUsersSchema() {
    console.log('🔧 Mise à jour du schéma Users...');

    try {
        // Ensure users collection exists
        try {
            await databases.getCollection(DATABASE_ID, 'users');
            console.log('✅ Collection users existe.');
        } catch (e) {
            console.log('⚠️ Collection users manquante. Création...');
            await databases.createCollection(DATABASE_ID, 'users', 'Users');
            console.log('✅ Collection users créée.');
        }

        const attributes = [
            { key: 'email', type: 'string', size: 255, required: true },
            { key: 'role', type: 'string', size: 50, required: true },
            { key: 'approved', type: 'boolean', required: true },
            { key: 'blocked', type: 'boolean', required: true }
        ];

        for (const attr of attributes) {
            try {
                if (attr.type === 'string') {
                    await databases.createStringAttribute(DATABASE_ID, 'users', attr.key, attr.size, attr.required);
                } else if (attr.type === 'boolean') {
                    await databases.createBooleanAttribute(DATABASE_ID, 'users', attr.key, attr.required);
                }
                console.log(`✅ Attribut ${attr.key} créé.`);
            } catch (e) {
                console.log(`ℹ️ Attribut ${attr.key} existe déjà ou erreur: ${e.message}`);
            }
        }

        console.log('\n🎉 Mise à jour terminée !');

    } catch (error) {
        console.error('❌ Erreur:', error);
    }
}

updateUsersSchema();
