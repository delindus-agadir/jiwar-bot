import { databases, DATABASE_ID, ID, Query } from './appwrite';

export const RELATIONSHIPS = {
    SON: 'ابن',
    DAUGHTER: 'ابنة',
    WIFE: 'زوجة',
    BROTHER: 'أخ',
    SISTER: 'أخت',
    FATHER: 'أب',
    MOTHER: 'أم',
    OTHER: 'آخر'
};

export const MAX_DEPENDENTS = 10;

export const validateDependent = (data) => {
    const errors = {};

    if (!data.name || data.name.trim().length < 2) {
        errors.name = 'الاسم يجب أن يكون أكثر من حرفين';
    }

    if (!data.birth_date) {
        errors.birth_date = 'تاريخ الميلاد مطلوب';
    } else {
        const birthDate = new Date(data.birth_date);
        const today = new Date();
        if (birthDate > today) {
            errors.birth_date = 'تاريخ الميلاد غير صالح';
        }
    }

    if (!data.relationship || !Object.values(RELATIONSHIPS).includes(data.relationship)) {
        errors.relationship = 'صلة القرابة غير صالحة';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

export const dependents = {
    // Create a new dependent
    create: async (parentUserId, data) => {
        try {
            // Check limit
            const currentDependents = await databases.listDocuments(
                DATABASE_ID,
                'dependents',
                [Query.equal('parent_user_id', parentUserId)]
            );

            if (currentDependents.total >= MAX_DEPENDENTS) {
                throw new Error(`لا يمكن إضافة أكثر من ${MAX_DEPENDENTS} رعايا`);
            }

            const validation = validateDependent(data);
            if (!validation.isValid) {
                throw new Error('بيانات غير صالحة');
            }

            return await databases.createDocument(
                DATABASE_ID,
                'dependents',
                ID.unique(),
                {
                    parent_user_id: parentUserId,
                    name: data.name,
                    birth_date: data.birth_date,
                    relationship: data.relationship,
                    notes: data.notes || '',
                    approved: false,
                    blocked: false
                }
            );
        } catch (error) {
            console.error('Error creating dependent:', error);
            throw error;
        }
    },

    // List dependents for a parent
    listByParent: async (parentUserId) => {
        try {
            return await databases.listDocuments(
                DATABASE_ID,
                'dependents',
                [
                    Query.equal('parent_user_id', parentUserId),
                    Query.orderDesc('$createdAt')
                ]
            );
        } catch (error) {
            console.error('Error listing dependents:', error);
            throw error;
        }
    },

    // Update dependent
    update: async (dependentId, data) => {
        try {
            return await databases.updateDocument(
                DATABASE_ID,
                'dependents',
                dependentId,
                data
            );
        } catch (error) {
            console.error('Error updating dependent:', error);
            throw error;
        }
    },

    // Delete dependent
    delete: async (dependentId) => {
        try {
            return await databases.deleteDocument(
                DATABASE_ID,
                'dependents',
                dependentId
            );
        } catch (error) {
            console.error('Error deleting dependent:', error);
            throw error;
        }
    },

    // List pending dependents (Admin)
    listPending: async () => {
        try {
            return await databases.listDocuments(
                DATABASE_ID,
                'dependents',
                [
                    Query.equal('approved', false),
                    Query.orderDesc('$createdAt')
                ]
            );
        } catch (error) {
            console.error('Error listing pending dependents:', error);
            throw error;
        }
    },

    // Approve/Reject dependent (Admin)
    approve: async (dependentId, isApproved) => {
        try {
            return await databases.updateDocument(
                DATABASE_ID,
                'dependents',
                dependentId,
                {
                    approved: isApproved
                }
            );
        } catch (error) {
            console.error('Error approving dependent:', error);
            throw error;
        }
    }
};
