const { Client, Databases } = require('node-appwrite');

exports.handler = async (event) => {
    // Only allow POST or GET
    if (event.httpMethod !== 'POST' && event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const secretKey = event.queryStringParameters?.secret || JSON.parse(event.body || '{}').secret;
    const targetEmail = event.queryStringParameters?.email || JSON.parse(event.body || '{}').email;

    // Simple secret protection
    if (secretKey !== 'jiwar-admin-restore-2024') {
        return { statusCode: 403, body: JSON.stringify({ error: 'Invalid secret key' }) };
    }

    if (!targetEmail) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Email is required' }) };
    }

    const client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT)
        .setProject(process.env.APPWRITE_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);
    const DATABASE_ID = process.env.APPWRITE_DATABASE_ID;

    try {
        // 1. Find user by email in users collection
        // Note: We can't query users collection by email easily if it's not indexed, 
        // but usually we can list and filter. 
        // BETTER: Use the Appwrite Users API to find the ID, then update the collection.
        // BUT: We are using a custom 'users' collection for roles.

        const response = await databases.listDocuments(
            DATABASE_ID,
            'users',
            [
                // Assuming email is a field in the users collection
                // If not, we might need to look up in members first
            ]
        );

        // Filter manually if needed, or use query
        const userDoc = response.documents.find(d => d.email === targetEmail);

        if (!userDoc) {
            return { statusCode: 404, body: JSON.stringify({ error: 'User not found in users collection' }) };
        }

        // 2. Update role to admin
        await databases.updateDocument(
            DATABASE_ID,
            'users',
            userDoc.$id,
            {
                role: 'admin',
                blocked: false,
                approved: true
            }
        );

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Successfully restored admin privileges for ${targetEmail}`,
                userId: userDoc.$id
            })
        };

    } catch (error) {
        console.error('Error restoring admin:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
