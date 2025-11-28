import { databases, DATABASE_ID } from '../lib/appwrite.js';
import { ID, Query } from 'appwrite';

export const addMemberToDb = async (member) => {
    const data = {
        name: member.name,
        role: member.role,
        grade: String(member.grade), // Convert to string for Appwrite
        join_date: member.joinDate,
        matricule: parseInt(member.matricule || 0)
    };
    const record = await databases.createDocument(
        DATABASE_ID,
        'members',
        ID.unique(),
        data
    );
    return record;
};

export const updateMemberInDb = async (memberId, updatedData) => {
    const data = {
        name: updatedData.name,
        role: updatedData.role,
        grade: String(updatedData.grade),
        join_date: updatedData.joinDate,
        matricule: parseInt(updatedData.matricule || 0)
    };
    await databases.updateDocument(DATABASE_ID, 'members', memberId, data);
};

export const deleteMemberFromDb = async (memberId) => {
    await databases.deleteDocument(DATABASE_ID, 'members', memberId);
};

export const addEvaluationToDb = async (memberId, evaluation, creatorId) => {
    const data = {
        member_id: memberId,
        Score: parseInt(evaluation.score),
        Max_Score: parseInt(evaluation.maxScore),
        JSdate: evaluation.date,
        creator_id: creatorId,
        Details: JSON.stringify(evaluation.details || {}) // Store details as JSON string
    };
    await databases.createDocument(
        DATABASE_ID,
        'evaluations',
        ID.unique(),
        data
    );
};

export const updateEvaluationInDb = async (evaluationId, updatedData) => {
    const data = {
        Score: parseInt(updatedData.score),
        Max_Score: parseInt(updatedData.maxScore),
        JSdate: updatedData.date,
        Details: JSON.stringify(updatedData.details || {}) // Update details
    };
    await databases.updateDocument(DATABASE_ID, 'evaluations', evaluationId, data);
};

export const deleteEvaluationFromDb = async (evaluationId) => {
    console.log(`[db.js] Deleting evaluation ${evaluationId} from DB ${DATABASE_ID} Collection 'evaluations'`);
    try {
        // Verify existence first
        await databases.getDocument(DATABASE_ID, 'evaluations', evaluationId);
        console.log(`[db.js] Document found. Deleting...`);
    } catch (error) {
        console.error(`[db.js] Document verification failed:`, error);
        throw error;
    }
    await databases.deleteDocument(DATABASE_ID, 'evaluations', evaluationId);
};

export const updateUserRole = async (userId, newRole) => {
    const data = { role: newRole };
    await databases.updateDocument(DATABASE_ID, 'users', userId, data);
};

// Member-User Linking Functions
export const createMemberWithUser = async (memberData, userId) => {
    if (!userId) throw new Error('User ID is required to create a member');

    const data = {
        name: memberData.name,
        role: memberData.role,
        grade: String(memberData.grade),
        join_date: new Date().toISOString().split('T')[0],
        matricule: parseInt(memberData.matricule || Math.floor(Math.random() * 100000)),
        user_id: userId // Link to user
    };
    const member = await databases.createDocument(
        DATABASE_ID,
        'members',
        ID.unique(),
        data
    );

    // No need to update user role - viewers can register for activities if they have a member profile
    return member;
};

export const getMemberByUserId = async (userId) => {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            'members',
            [Query.equal('user_id', userId)]
        );

        // Return the first matching member (should be unique)
        return response.documents.length > 0 ? response.documents[0] : null;
    } catch (error) {
        console.error('Error fetching member by user ID:', error);
        return null;
    }
};

export const getMemberByMatricule = async (matricule) => {
    try {
        // Try both field names for compatibility
        let response = await databases.listDocuments(
            DATABASE_ID,
            'members',
            [Query.equal('matricule', parseInt(matricule))]
        );

        if (response.documents.length === 0) {
            response = await databases.listDocuments(
                DATABASE_ID,
                'members',
                [Query.equal('Matricule', parseInt(matricule))]
            );
        }

        return response.documents.length > 0 ? response.documents[0] : null;
    } catch (error) {
        console.error('Error fetching member by matricule:', error);
        return null;
    }
};

export const linkMemberToUser = async (memberId, userId) => {
    await databases.updateDocument(
        DATABASE_ID,
        'members',
        memberId,
        { user_id: userId }
    );
};

export const checkUserHasMember = async (userId) => {
    try {
        const member = await getMemberByUserId(userId);
        return !!member;
    } catch (error) {
        console.error('Error checking member:', error);
        return false;
    }
};

// ==================== USER MANAGEMENT FUNCTIONS ====================

// Block a user (admin only)
export const blockUser = async (userId) => {
    await databases.updateDocument(
        DATABASE_ID,
        'users',
        userId,
        { blocked: true }
    );
};

// Unblock a user (admin only)
export const unblockUser = async (userId) => {
    await databases.updateDocument(
        DATABASE_ID,
        'users',
        userId,
        { blocked: false }
    );
};

// Delete a user (admin only)
export const deleteUserFromDb = async (userId) => {
    await databases.deleteDocument(
        DATABASE_ID,
        'users',
        userId
    );
};

// ==================== ACTIVITIES FUNCTIONS ====================

// Create a new activity
export const createActivity = async (activityData, adminId) => {
    const data = {
        title: activityData.title,
        event_date: activityData.eventDate,
        registration_deadline: activityData.registrationDeadline,
        location: activityData.location,
        contribution_amount: parseInt(activityData.contributionAmount || 0),
        organizing_committee: activityData.organizingCommittee,
        description: activityData.description || '',
        max_participants: activityData.maxParticipants ? parseInt(activityData.maxParticipants) : null,
        current_participants: 0,
        created_by: adminId,
        created_at: new Date().toISOString(),
        status: 'open'
    };

    return await databases.createDocument(
        DATABASE_ID,
        'activities',
        ID.unique(),
        data
    );
};

// Update an activity
export const updateActivity = async (activityId, activityData) => {
    const data = {
        title: activityData.title,
        event_date: activityData.eventDate,
        registration_deadline: activityData.registrationDeadline,
        location: activityData.location,
        contribution_amount: parseInt(activityData.contributionAmount || 0),
        organizing_committee: activityData.organizingCommittee,
        description: activityData.description || '',
        max_participants: activityData.maxParticipants ? parseInt(activityData.maxParticipants) : null,
        status: activityData.status || 'open'
    };

    return await databases.updateDocument(DATABASE_ID, 'activities', activityId, data);
};

// Delete an activity (with cascade delete of registrations)
export const deleteActivity = async (activityId) => {
    // First, delete all registrations for this activity
    try {
        const registrations = await databases.listDocuments(
            DATABASE_ID,
            'activity_registrations'
        );

        // Filter registrations for this activity
        const activityRegistrations = registrations.documents.filter(
            reg => reg.activity_id === activityId
        );

        // Delete each registration
        for (const registration of activityRegistrations) {
            await databases.deleteDocument(
                DATABASE_ID,
                'activity_registrations',
                registration.$id
            );
        }

        console.log(`Deleted ${activityRegistrations.length} registrations for activity ${activityId}`);
    } catch (error) {
        console.error('Error deleting activity registrations:', error);
        // Continue with activity deletion even if registration deletion fails
    }

    // Then delete the activity itself
    await databases.deleteDocument(DATABASE_ID, 'activities', activityId);
};

// Get all activities
export const getActivities = async (status = null) => {
    try {
        const queries = status ? [`status=${status}`] : [];
        const response = await databases.listDocuments(DATABASE_ID, 'activities', queries);
        return response.documents;
    } catch (error) {
        console.error('Error fetching activities:', error);
        return [];
    }
};

// Get activity by ID
export const getActivityById = async (activityId) => {
    return await databases.getDocument(DATABASE_ID, 'activities', activityId);
};

// ==================== ACTIVITY REGISTRATIONS FUNCTIONS ====================

// Register for an activity
export const registerForActivity = async (activityId, memberId, participationLevel = 'attended') => {
    // Calculate points based on participation level
    const pointsMap = {
        'attended': 6,
        'participated': 8,
        'had_role': 12
    };

    const data = {
        activity_id: activityId,
        member_id: memberId,
        registered_at: new Date().toISOString(),
        participation_level: participationLevel,
        contribution_points: pointsMap[participationLevel],
        payment_status: 'pending',
        payment_amount: 0,
        confirmed_by_admin: false
    };

    const registration = await databases.createDocument(
        DATABASE_ID,
        'activity_registrations',
        ID.unique(),
        data
    );

    // Update activity participant count
    const activity = await getActivityById(activityId);
    await databases.updateDocument(DATABASE_ID, 'activities', activityId, {
        current_participants: activity.current_participants + 1
    });

    return registration;
};

// Update participation level (admin only)
export const updateParticipationLevel = async (registrationId, level, roleDescription = '') => {
    const pointsMap = {
        'attended': 6,
        'participated': 8,
        'had_role': 12
    };

    const data = {
        participation_level: level,
        contribution_points: pointsMap[level],
        confirmed_by_admin: true
    };

    if (level === 'had_role' && roleDescription) {
        data.role_description = roleDescription;
    }

    return await databases.updateDocument(DATABASE_ID, 'activity_registrations', registrationId, data);
};

// Get registrations for a specific activity
export const getActivityRegistrations = async (activityId) => {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            'activity_registrations',
            [Query.equal('activity_id', activityId)]
        );
        return response.documents;
    } catch (error) {
        console.error('Error fetching activity registrations:', error);
        return [];
    }
};

// Update registration confirmation/attendance
export const updateRegistrationStatus = async (registrationId, isConfirmed) => {
    try {
        await databases.updateDocument(
            DATABASE_ID,
            'activity_registrations',
            registrationId,
            {
                confirmed_by_admin: isConfirmed,
                participation_level: isConfirmed ? 'attended' : 'participated' // Default to attended if confirmed
            }
        );
    } catch (error) {
        console.error('Error updating registration status:', error);
        throw error;
    }
};

// Cancel registration
export const cancelRegistration = async (activityId, memberId) => {
    // Find the registration
    const response = await databases.listDocuments(
        DATABASE_ID,
        'activity_registrations'
    );

    const registration = response.documents.find(
        doc => doc.activity_id === activityId && doc.member_id === memberId
    );

    if (!registration) {
        throw new Error('لم يتم العثور على التسجيل');
    }

    // Update activity participant count
    const activity = await getActivityById(activityId);
    await databases.updateDocument(DATABASE_ID, 'activities', activityId, {
        current_participants: Math.max(0, activity.current_participants - 1)
    });

    await databases.deleteDocument(DATABASE_ID, 'activity_registrations', registration.$id);
};

// Get registrations for an activity

// Get member's registrations
export const getMemberRegistrations = async (memberId) => {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            'activity_registrations',
            [`member_id=${memberId}`]
        );
        return response.documents;
    } catch (error) {
        console.error('Error fetching member registrations:', error);
        return [];
    }
};

// Check if member is registered for activity
export const checkIfRegistered = async (activityId, memberId) => {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            'activity_registrations'
        );
        // Filter manually to find matching registration
        const registration = response.documents.find(
            doc => doc.activity_id === activityId && doc.member_id === memberId
        );
        return !!registration;
    } catch (error) {
        console.error('Error checking registration:', error);
        return false;
    }
};

// Calculate member's total contribution points
export const calculateMemberContributionPoints = async (memberId, month = null) => {
    try {
        const registrations = await getMemberRegistrations(memberId);

        // Filter by month if specified
        let filtered = registrations;
        if (month) {
            const monthStart = new Date(month + '-01').toISOString();
            const monthEnd = new Date(new Date(month + '-01').setMonth(new Date(month + '-01').getMonth() + 1)).toISOString();
            filtered = registrations.filter(r => r.registered_at >= monthStart && r.registered_at < monthEnd);
        }

        return filtered.reduce((sum, r) => sum + (r.contribution_points || 0), 0);
    } catch (error) {
        console.error('Error calculating contribution points:', error);
        return 0;
    }
};

// ==================== MONTHLY SCORES FUNCTIONS ====================

// Create or update monthly score
export const createOrUpdateMonthlyScore = async (memberId, month, qualityScore, contributionScore) => {
    const qualityWeight = 0.7;  // 70%
    const contributionWeight = 0.3;  // 30%

    const totalScore = (qualityScore * qualityWeight) + (contributionScore * contributionWeight);

    const data = {
        member_id: memberId,
        month: month,
        quality_score: qualityScore,
        contribution_score: contributionScore,
        quality_weight: qualityWeight,
        contribution_weight: contributionWeight,
        total_score: totalScore,
        created_at: new Date().toISOString()
    };

    try {
        // Check if monthly score already exists
        const response = await databases.listDocuments(
            DATABASE_ID,
            'monthly_scores',
            [`member_id=${memberId}`, `month=${month}`]
        );

        if (response.documents.length > 0) {
            // Update existing
            return await databases.updateDocument(DATABASE_ID, 'monthly_scores', response.documents[0].$id, data);
        } else {
            // Create new
            return await databases.createDocument(DATABASE_ID, 'monthly_scores', ID.unique(), data);
        }
    } catch (error) {
        console.error('Error creating/updating monthly score:', error);
        throw error;
    }
};

// Get monthly scores for a member
export const getMonthlyScores = async (memberId, startMonth = null, endMonth = null) => {
    try {
        const queries = [`member_id=${memberId}`];
        const response = await databases.listDocuments(DATABASE_ID, 'monthly_scores', queries);

        let scores = response.documents;

        // Filter by date range if specified
        if (startMonth) {
            scores = scores.filter(s => s.month >= startMonth);
        }
        if (endMonth) {
            scores = scores.filter(s => s.month <= endMonth);
        }

        // Sort by month descending
        return scores.sort((a, b) => b.month.localeCompare(a.month));
    } catch (error) {
        console.error('Error fetching monthly scores:', error);
        return [];
    }
};

// Calculate annual score with weighted months
export const calculateAnnualScore = async (memberId, year) => {
    const monthlyScores = await getMonthlyScores(memberId, `${year}-01`, `${year}-12`);

    if (monthlyScores.length === 0) return 0;

    // Sort by month ascending for calculation
    const sorted = monthlyScores.sort((a, b) => a.month.localeCompare(b.month));

    // Last 3 months × 60%
    const recent3 = sorted.slice(-3).reduce((sum, s) => sum + s.total_score, 0) * 0.6;

    // 3 months before × 25%
    const middle3 = sorted.slice(-6, -3).reduce((sum, s) => sum + s.total_score, 0) * 0.25;

    // 3 months before × 10%
    const older3 = sorted.slice(-9, -6).reduce((sum, s) => sum + s.total_score, 0) * 0.1;

    // Oldest × 5%
    const oldest = sorted.slice(0, -9).reduce((sum, s) => sum + s.total_score, 0) * 0.05;

    return recent3 + middle3 + older3 + oldest;
};

// ==================== BACKUP FUNCTIONS ====================

// Export all data for backup
export const exportAllData = async () => {
    try {
        const collections = [
            'members',
            'activities',
            'activity_registrations',
            'evaluations',
            'monthly_scores',
            'users'
        ];

        const backupData = {
            timestamp: new Date().toISOString(),
            collections: {}
        };

        for (const collectionId of collections) {
            try {
                // Fetch all documents (handling pagination if needed, but for now assuming < 5000 or using limit)
                // Appwrite listDocuments default limit is 25. We need to fetch more.
                // We'll set a high limit for now.
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    collectionId,
                    [Query.limit(5000)]
                );
                backupData.collections[collectionId] = response.documents;
            } catch (error) {
                console.error(`Error fetching collection ${collectionId}:`, error);
                backupData.collections[collectionId] = { error: error.message };
            }
        }

        return backupData;
    } catch (error) {
        console.error('Error exporting data:', error);
        throw error;
    }
};
