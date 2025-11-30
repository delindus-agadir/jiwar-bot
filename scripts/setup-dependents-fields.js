import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.DATABASE_ID || '69244cec00107cfda4b7';
const MEMBERS_COLLECTION_ID = 'members';

async function setupDependentsFields() {
    console.log('🚀 Setting up dependents fields in members collection...\n');

    try {
        // 1. Add parent_user_id field (string, optional)
        console.log('Adding parent_user_id field...');
        try {
            await databases.createStringAttribute(
                DATABASE_ID,
                MEMBERS_COLLECTION_ID,
                'parent_user_id',
                255,
                false // not required
            );
            console.log('✅ parent_user_id field created');
        } catch (error) {
            if (error.code === 409) {
                console.log('⚠️  parent_user_id field already exists');
            } else {
                throw error;
            }
        }

        // Wait a bit for Appwrite to process
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 2. Add is_dependent field (boolean, default: false)
        console.log('\nAdding is_dependent field...');
        try {
            await databases.createBooleanAttribute(
                DATABASE_ID,
                MEMBERS_COLLECTION_ID,
                'is_dependent',
                false, // not required
                false  // default value
            );
            console.log('✅ is_dependent field created');
        } catch (error) {
            if (error.code === 409) {
                console.log('⚠️  is_dependent field already exists');
            } else {
                throw error;
            }
        }

        // Wait a bit for Appwrite to process
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 3. Add dependent_order field (integer, optional)
        console.log('\nAdding dependent_order field...');
        try {
            await databases.createIntegerAttribute(
                DATABASE_ID,
                MEMBERS_COLLECTION_ID,
                'dependent_order',
                false, // not required
                0,     // min value
                999,   // max value
                null   // no default
            );
            console.log('✅ dependent_order field created');
        } catch (error) {
            if (error.code === 409) {
                console.log('⚠️  dependent_order field already exists');
            } else {
                throw error;
            }
        }

        // Wait a bit for Appwrite to process
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 4. Create index on parent_user_id for faster queries
        console.log('\nCreating index on parent_user_id...');
        try {
            await databases.createIndex(
                DATABASE_ID,
                MEMBERS_COLLECTION_ID,
                'parent_user_id_idx',
                'key',
                ['parent_user_id'],
                ['ASC']
            );
            console.log('✅ Index created on parent_user_id');
        } catch (error) {
            if (error.code === 409) {
                console.log('⚠️  Index already exists');
            } else {
                throw error;
            }
        }

        console.log('\n✅ All dependents fields setup completed successfully!');
        console.log('\nYou can now:');
        console.log('1. Create dependents linked to parent members');
        console.log('2. Query dependents by parent_user_id');
        console.log('3. Filter members to show only dependents or only regular members');

    } catch (error) {
        console.error('\n❌ Error setting up dependents fields:', error);
        process.exit(1);
    }
}

setupDependentsFields();
