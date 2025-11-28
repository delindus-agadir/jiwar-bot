import { Client, Databases, ID } from 'node-appwrite';

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

async function setup() {
    console.log('🔧 Vérification de la configuration...');

    try {
        // 1. Check/Create magic_links collection
        try {
            await databases.getCollection(DATABASE_ID, 'magic_links');
            console.log('✅ Collection magic_links existe déjà.');
        } catch (e) {
            console.log('⚠️ Collection magic_links manquante. Création...');
            await databases.createCollection(DATABASE_ID, 'magic_links', 'Magic Links');
            console.log('✅ Collection magic_links créée.');
        }

        // 2. Check/Create Attributes
        const attributes = [
            { key: 'token', type: 'string', size: 255, required: true },
            { key: 'type', type: 'string', size: 50, required: true },
            { key: 'telegram_id', type: 'string', size: 50, required: true },
            { key: 'telegram_name', type: 'string', size: 255, required: false },
            { key: 'member_id', type: 'string', size: 255, required: false },
            { key: 'user_id', type: 'string', size: 255, required: false },
            { key: 'expires_at', type: 'string', size: 255, required: true }, // Using string for datetime to be safe
            { key: 'used', type: 'boolean', required: true }
        ];

        for (const attr of attributes) {
            try {
                if (attr.type === 'string') {
                    await databases.createStringAttribute(DATABASE_ID, 'magic_links', attr.key, attr.size, attr.required);
                } else if (attr.type === 'boolean') {
                    await databases.createBooleanAttribute(DATABASE_ID, 'magic_links', attr.key, attr.required);
                }
                console.log(`✅ Attribut ${attr.key} créé/vérifié.`);
            } catch (e) {
                // Attribute might already exist
                console.log(`ℹ️ Attribut ${attr.key} existe déjà ou erreur: ${e.message}`);
            }
        }

        // 3. Create Index
        try {
            await databases.createIndex(DATABASE_ID, 'magic_links', 'token_index', 'key', ['token']);
            console.log('✅ Index token_index créé.');
        } catch (e) {
            console.log(`ℹ️ Index existe déjà ou erreur: ${e.message}`);
        }

        console.log('\n🎉 Configuration terminée ! Attendez quelques secondes que les attributs soient prêts.');

    } catch (error) {
        console.error('❌ Erreur fatale:', error);
    }
}

setup();
