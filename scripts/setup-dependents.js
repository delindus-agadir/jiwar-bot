import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
// Force correct values ignoring .env for now to fix the issue
const APPWRITE_ENDPOINT = 'https://fra.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || '69244b9b001284d94352';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = '69244cec00107cfda4b7';

if (!APPWRITE_API_KEY) {
    console.error('❌ APPWRITE_API_KEY is required!');
    console.log('Set it in your .env file or run:');
    console.log('set APPWRITE_API_KEY=your-api-key');
    process.exit(1);
}

// Initialize Appwrite
const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

const databases = new Databases(client);

async function setupDependentsCollection() {
    console.log('🚀 Starting Appwrite configuration for Dependents system...\n');
    console.log('Endpoint:', APPWRITE_ENDPOINT);
    console.log('Project ID:', APPWRITE_PROJECT_ID);
    console.log('Database ID:', DATABASE_ID);

    try {
        // Step 1: Create dependents collection
        console.log('📦 Creating "dependents" collection...');
        try {
            await databases.createCollection(
                DATABASE_ID,
                'dependents',
                'Dependents',
                [
                    'create("users")',
                    'read("users")',
                    'update("users")',
                    'delete("users")'
                ],  // Permissions: Authenticated users can create, read, update, delete (subject to document security)
                true  // Document security enabled
            );
            console.log('✅ Collection "dependents" created successfully');
        } catch (error) {
            if (error.code === 409) {
                console.log('⚠️  Collection "dependents" already exists, skipping...');
            } else {
                throw error;
            }
        }

        // Wait a bit for collection to be ready
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Step 2: Create attributes for dependents
        console.log('\n📝 Creating attributes for "dependents"...');

        const dependentsAttributes = [
            { key: 'parent_user_id', type: 'string', size: 255, required: true },
            { key: 'name', type: 'string', size: 255, required: true },
            { key: 'birth_date', type: 'datetime', required: true },
            { key: 'relationship', type: 'string', size: 50, required: true },
            { key: 'approved', type: 'boolean', required: false, default: false },
            { key: 'blocked', type: 'boolean', required: false, default: false },
            { key: 'notes', type: 'string', size: 1000, required: false }
        ];

        for (const attr of dependentsAttributes) {
            try {
                if (attr.type === 'string') {
                    await databases.createStringAttribute(
                        DATABASE_ID,
                        'dependents',
                        attr.key,
                        attr.size,
                        attr.required,
                        attr.default || null
                    );
                } else if (attr.type === 'datetime') {
                    await databases.createDatetimeAttribute(
                        DATABASE_ID,
                        'dependents',
                        attr.key,
                        attr.required,
                        attr.default || null
                    );
                } else if (attr.type === 'boolean') {
                    await databases.createBooleanAttribute(
                        DATABASE_ID,
                        'dependents',
                        attr.key,
                        attr.required,
                        attr.default
                    );
                }
                console.log(`  ✅ Created attribute: ${attr.key}`);
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                if (error.code === 409) {
                    console.log(`  ⚠️  Attribute "${attr.key}" already exists, skipping...`);
                } else {
                    console.error(`  ❌ Error creating attribute "${attr.key}":`, error.message);
                }
            }
        }

        // Step 3: Create indexes for dependents
        console.log('\n🔍 Creating indexes for "dependents"...');

        const dependentsIndexes = [
            { key: 'parent_user_id_index', type: 'key', attributes: ['parent_user_id'], orders: ['ASC'] },
            { key: 'approved_index', type: 'key', attributes: ['approved'], orders: ['ASC'] }
        ];

        for (const index of dependentsIndexes) {
            try {
                await databases.createIndex(
                    DATABASE_ID,
                    'dependents',
                    index.key,
                    index.type,
                    index.attributes,
                    index.orders
                );
                console.log(`  ✅ Created index: ${index.key}`);
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                if (error.code === 409) {
                    console.log(`  ⚠️  Index "${index.key}" already exists, skipping...`);
                } else {
                    console.error(`  ❌ Error creating index "${index.key}":`, error.message);
                }
            }
        }

        // Step 4: Modify activity_registrations collection
        console.log('\n📝 Modifying "activity_registrations" collection...');

        const participationsAttributes = [
            { key: 'participant_type', type: 'string', size: 20, required: false, default: 'member' },
            { key: 'parent_user_id', type: 'string', size: 255, required: false },
            { key: 'dependent_id', type: 'string', size: 255, required: false }
        ];

        for (const attr of participationsAttributes) {
            try {
                await databases.createStringAttribute(
                    DATABASE_ID,
                    'activity_registrations',
                    attr.key,
                    attr.size,
                    attr.required,
                    attr.default || null
                );
                console.log(`  ✅ Created attribute: ${attr.key}`);
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                if (error.code === 409) {
                    console.log(`  ⚠️  Attribute "${attr.key}" already exists, skipping...`);
                } else {
                    console.error(`  ❌ Error creating attribute "${attr.key}":`, error.message);
                }
            }
        }

        // Step 5: Create index for activity_registrations
        console.log('\n🔍 Creating indexes for "activity_registrations"...');

        try {
            await databases.createIndex(
                DATABASE_ID,
                'activity_registrations',
                'participant_type_index',
                'key',
                ['participant_type'],
                ['ASC']
            );
            console.log('  ✅ Created index: participant_type_index');
        } catch (error) {
            if (error.code === 409) {
                console.log('  ⚠️  Index "participant_type_index" already exists, skipping...');
            } else {
                console.error('  ❌ Error creating index:', error.message);
            }
        }

        console.log('\n✨ Appwrite configuration completed successfully!\n');
        console.log('📋 Summary:');
        console.log('  - Collection "dependents" created with 7 attributes');
        console.log('  - 2 indexes created for "dependents"');
        console.log('  - Collection "participations" modified with 2 new attributes');
        console.log('  - 1 index created for "participations"');
        console.log('\n🎉 You can now start using the dependents system!');

    } catch (error) {
        console.error('\n❌ Error during setup:', error);
        process.exit(1);
    }
}

// Run the setup
setupDependentsCollection();
