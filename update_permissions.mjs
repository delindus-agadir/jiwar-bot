import { Client, Databases, Permission, Role } from 'node-appwrite';

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

async function updatePermissions() {
    console.log('🔧 Mise à jour des permissions...');

    try {
        // 1. Update magic_links permissions
        console.log('Mise à jour des permissions pour magic_links...');
        await databases.updateCollection(
            DATABASE_ID,
            'magic_links',
            'Magic Links',
            [
                Permission.read(Role.any()),    // Anyone can read (to verify token)
                Permission.create(Role.any()),  // Anyone can create (bot uses API key anyway, but good for testing)
                Permission.update(Role.any()),  // Anyone can update (to mark as used)
                Permission.delete(Role.any())
            ]
        );
        console.log('✅ Permissions magic_links mises à jour.');

        // 2. Update members permissions
        console.log('Mise à jour des permissions pour members...');
        // We need to fetch the collection name first or just assume 'Members' or whatever it is.
        // Let's try to get it first to be safe, or just update with a generic name if ID is what matters.
        // Actually updateCollection requires the name.
        const membersCollection = await databases.getCollection(DATABASE_ID, 'members');

        await databases.updateCollection(
            DATABASE_ID,
            'members',
            membersCollection.name,
            [
                Permission.read(Role.any()),   // Anyone can read (to check existence)
                Permission.create(Role.any()),
                Permission.update(Role.any()),
                Permission.delete(Role.any())
            ]
        );
        console.log('✅ Permissions members mises à jour.');

    } catch (error) {
        console.error('❌ Erreur:', error);
    }
}

updatePermissions();
