import { Client, Databases, Query } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config({ path: 'c:\\Antigravity\\telegram-bot\\.env' });

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID;

const checkDuplicates = async () => {
    try {
        let allMembers = [];
        let offset = 0;
        let limit = 100;

        // Fetch all members
        while (true) {
            const response = await databases.listDocuments(
                DATABASE_ID,
                'members',
                [Query.limit(limit), Query.offset(offset)]
            );
            allMembers = [...allMembers, ...response.documents];
            if (response.documents.length < limit) break;
            offset += limit;
        }

        console.log(`Total members: ${allMembers.length}`);

        // Group by telegram_id
        const telegramMap = {};
        allMembers.forEach(member => {
            if (member.telegram_id) {
                if (!telegramMap[member.telegram_id]) {
                    telegramMap[member.telegram_id] = [];
                }
                telegramMap[member.telegram_id].push(member);
            }
        });

        // Find duplicates
        let duplicatesFound = false;
        for (const [telegramId, members] of Object.entries(telegramMap)) {
            if (members.length > 1) {
                duplicatesFound = true;
                console.log(`\n⚠️ Duplicate found for Telegram ID: ${telegramId}`);
                members.forEach(m => {
                    console.log(` - Member ID: ${m.$id}, User ID: ${m.user_id}, Name: ${m.name}`);
                });
            }
        }

        if (!duplicatesFound) {
            console.log('\n✅ No duplicate members found.');
        }

    } catch (error) {
        console.error('Error:', error);
    }
};

checkDuplicates();
