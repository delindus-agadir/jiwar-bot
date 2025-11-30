import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID || '69244b9b001284d94352')
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function testConnection() {
    try {
        console.log('Testing connection...');
        const dbs = await databases.list();
        console.log('Databases found:', dbs.total);
        dbs.databases.forEach(db => {
            console.log(`- ${db.name} (${db.$id})`);
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

testConnection();
