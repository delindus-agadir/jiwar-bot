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

async function updateSchema() {
    console.log('🔧 Mise à jour du schéma Members...');

    try {
        // 1. Add telegram_id attribute
        try {
            await databases.createStringAttribute(DATABASE_ID, 'members', 'telegram_id', 50, false);
            console.log('✅ Attribut telegram_id créé.');
        } catch (e) {
            console.log(`ℹ️ Attribut telegram_id existe déjà ou erreur: ${e.message}`);
        }

        // Wait a bit for attribute to be available
        console.log('⏳ Attente de la création de l\'attribut...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 2. Create Index
        try {
            await databases.createIndex(DATABASE_ID, 'members', 'telegram_id_index', 'key', ['telegram_id']);
            console.log('✅ Index telegram_id_index créé.');
        } catch (e) {
            console.log(`ℹ️ Index existe déjà ou erreur: ${e.message}`);
        }

        console.log('\n🎉 Mise à jour terminée !');

    } catch (error) {
        console.error('❌ Erreur:', error);
    }
}

updateSchema();
