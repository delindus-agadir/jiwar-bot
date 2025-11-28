import { databases, DATABASE_ID } from './src/lib/appwrite.js';

async function resetParticipantCounts() {
    console.log('🔄 Resetting participant counts to 0 for all activities...');

    try {
        // 1. Get all activities
        const response = await databases.listDocuments(DATABASE_ID, 'activities');
        const activities = response.documents;

        console.log(`Found ${activities.length} activities.`);

        // 2. Update each activity
        for (const activity of activities) {
            await databases.updateDocument(
                DATABASE_ID,
                'activities',
                activity.$id,
                {
                    current_participants: 0
                }
            );
            console.log(`✅ Reset count for: ${activity.title}`);
        }

        console.log('🎉 All counts reset to 0.');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

resetParticipantCounts();
