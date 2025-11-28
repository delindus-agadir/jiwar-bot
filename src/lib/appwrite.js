import { Client, Account, Databases } from 'appwrite';

// ⚠️ REPLACE WITH YOUR APPWRITE PROJECT ID AND DATABASE ID
export const PROJECT_ID = '69244b9b001284d94352';
export const DATABASE_ID = '69244cec00107cfda4b7';

export const client = new Client();

client
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject(PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
