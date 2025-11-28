import { databases, DATABASE_ID, client } from './src/lib/appwrite.js';
import { Query } from 'appwrite';

// Collections to clear
const COLLECTIONS = [
    'members',
    'users',
    'evaluations',
    'activity_registrations',
    'monthly_scores',
    'activities'
];

async function resetDatabase() {
    console.log('⚠️ STARTING DATABASE RESET...');
    console.log('This will delete ALL documents in the specified collections.');

    for (const collectionId of COLLECTIONS) {
        console.log(`\nCleaning collection: ${collectionId}...`);
        try {
            let deletedCount = 0;
            // Loop until no documents remain (handling pagination limits)
            while (true) {
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    collectionId,
                    [Query.limit(100)]
                );

                if (response.documents.length === 0) break;

                const promises = response.documents.map(doc =>
                    databases.deleteDocument(DATABASE_ID, collectionId, doc.$id)
                );

                await Promise.all(promises);
                deletedCount += promises.length;
                console.log(`Deleted ${deletedCount} documents so far...`);
            }
            console.log(`✅ Collection ${collectionId} cleared.`);
        } catch (error) {
            console.error(`❌ Error clearing ${collectionId}:`, error.message);
        }
    }

    console.log('\n🎉 DATABASE RESET COMPLETE.');
    console.log('Note: Auth accounts are NOT deleted by this script (requires Admin API).');
    console.log('You will need to manually delete users in the Appwrite Console Auth section if you want a full clean slate.');
}

resetDatabase();
