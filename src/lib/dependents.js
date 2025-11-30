import { ID, Query } from 'appwrite';
import { databases, DATABASE_ID, account } from './appwrite';
import { Client, Account } from 'appwrite';

// Relationship types
export const RELATIONSHIPS = {
    SON: 'ابن',
    DAUGHTER: 'ابنة',
    WIFE: 'زوجة',
    HUSBAND: 'زوج',
    BROTHER: 'أخ',
    SISTER: 'أخت',
    OTHER: 'أخرى'
};

/**
 * Generate a unique email for a dependent
 * Format: parent_email+dep{order}@domain.com
 */
export function generateDependentEmail(parentEmail, order) {
    const [localPart, domain] = parentEmail.split('@');
    return `${localPart}+dep${order}@${domain}`;
}

/**
 * Generate a random password for dependent accounts
 */
function generateRandomPassword() {
    return Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
}

/**
 * Create a new dependent
 * This creates both a user account and a member record
 */
export async function createDependent(parentUserId, dependentData) {
    try {
        // 1. Get parent user and member info
        const parentUser = await account.get();
        if (parentUser.$id !== parentUserId) {
            throw new Error('Unauthorized: You can only create dependents for yourself');
        }

        // Get parent member to get telegram_id
        const parentMembers = await databases.listDocuments(
            DATABASE_ID,
            'members',
            [Query.equal('user_id', parentUserId)]
        );

        if (parentMembers.documents.length === 0) {
            throw new Error('Parent member not found');
        }

        const parentMember = parentMembers.documents[0];

        // 2. Count existing dependents to determine order
        const existingDependents = await databases.listDocuments(
            DATABASE_ID,
            'members',
            [
                Query.equal('parent_user_id', parentUserId),
                Query.equal('is_dependent', true)
            ]
        );

        const order = existingDependents.total + 1;

        // 3. Generate email for dependent
        const dependentEmail = generateDependentEmail(parentUser.email, order);

        // 4. Create user account for dependent using server-side SDK
        // Note: This requires admin API key, so we'll need to do this via a Netlify function
        // For now, we'll create a placeholder and the admin will need to create the account manually

        // 5. Create member record
        const memberData = {
            user_id: `pending_${ID.unique()}`, // Temporary until admin creates the account
            name: dependentData.name,
            matricule: dependentData.matricule,
            grade: dependentData.grade || '1',
            role: dependentData.relationship,
            join_date: new Date().toISOString(),
            approved: false,
            parent_user_id: parentUserId,
            is_dependent: true,
            dependent_order: order,
            telegram_id: parentMember.telegram_id, // Same as parent
            dependent_email: dependentEmail // Store the generated email
        };

        const newMember = await databases.createDocument(
            DATABASE_ID,
            'members',
            ID.unique(),
            memberData
        );

        return newMember;

    } catch (error) {
        console.error('Error creating dependent:', error);
        throw error;
    }
}

/**
 * List all dependents for a parent
 */
export async function listDependentsByParent(parentUserId) {
    try {
        const dependents = await databases.listDocuments(
            DATABASE_ID,
            'members',
            [
                Query.equal('parent_user_id', parentUserId),
                Query.equal('is_dependent', true),
                Query.orderDesc('$createdAt')
            ]
        );

        return dependents;
    } catch (error) {
        console.error('Error listing dependents:', error);
        throw error;
    }
}

/**
 * Update a dependent's information
 */
export async function updateDependent(dependentId, data) {
    try {
        // Only allow updating certain fields
        const allowedFields = ['name', 'matricule', 'role', 'notes'];
        const updateData = {};

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                updateData[field] = data[field];
            }
        }

        const updated = await databases.updateDocument(
            DATABASE_ID,
            'members',
            dependentId,
            updateData
        );

        return updated;
    } catch (error) {
        console.error('Error updating dependent:', error);
        throw error;
    }
}

/**
 * Delete a dependent
 */
export async function deleteDependent(dependentId) {
    try {
        await databases.deleteDocument(
            DATABASE_ID,
            'members',
            dependentId
        );

        return true;
    } catch (error) {
        console.error('Error deleting dependent:', error);
        throw error;
    }
}

/**
 * Validate dependent data
 */
export function validateDependent(data) {
    const errors = {};

    if (!data.name || data.name.trim().length < 2) {
        errors.name = 'الاسم يجب أن يكون على الأقل حرفين';
    }

    if (!data.matricule || data.matricule.toString().trim().length === 0) {
        errors.matricule = 'رقم العضوية مطلوب';
    }

    if (!data.relationship || !Object.values(RELATIONSHIPS).includes(data.relationship)) {
        errors.relationship = 'يرجى اختيار صلة القرابة';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}
