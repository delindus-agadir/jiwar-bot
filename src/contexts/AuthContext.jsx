import React, { createContext, useContext, useState, useEffect } from 'react';
import { account, databases, DATABASE_ID } from '../lib/appwrite';
import { ID } from 'appwrite';
import { checkUserHasMember, createMemberWithUser, getMemberByUserId, getMemberByMatricule, linkMemberToUser } from '../utils/db';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [currentMember, setCurrentMember] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [hasMembership, setHasMembership] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isBlocked, setIsBlocked] = useState(false);
    const [isApproved, setIsApproved] = useState(true);

    useEffect(() => {
        checkUserStatus();
    }, []);

    const checkUserStatus = async () => {
        try {
            const user = await account.get();
            setCurrentUser(user);

            try {
                await fetchUserRole(user.$id, user.email);
            } catch (roleError) {
                console.error('Failed to fetch user role (non-critical):', roleError);
                setUserRole('viewer');
            }

            try {
                console.log('Checking member status for user:', user.$id);
                const member = await getMemberByUserId(user.$id);
                console.log('Member found:', member);

                if (member) {
                    console.log('Setting existing member');
                    setCurrentMember(member);
                    setHasMembership(true);
                } else {
                    console.log('No member found. User needs to complete registration.');
                    setCurrentMember(null);
                    setHasMembership(false);
                }
            } catch (memberError) {
                console.error('Failed to fetch or create member details (non‑critical):', memberError);
                setCurrentMember(null);
                setHasMembership(false);
            }

            return user;
        } catch (error) {
            console.error('User not authenticated:', error);
            setCurrentUser(null);
            setCurrentMember(null);
            setUserRole(null);
            setHasMembership(false);
            setIsBlocked(false);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const fetchUserRole = async (userId, email) => {
        try {
            const userDoc = await databases.getDocument(
                DATABASE_ID,
                'users',
                userId
            );
            setUserRole(userDoc?.role || 'viewer');
            setIsBlocked(userDoc?.blocked || false);
            setIsApproved(userDoc?.approved !== false); // true if approved or field doesn't exist (old users)
        } catch (error) {
            // If document not found (404), create it (Auto-repair)
            if (error.code === 404) {
                console.log('User document missing, auto-repairing...');
                try {
                    await databases.createDocument(
                        DATABASE_ID,
                        'users',
                        userId,
                        {
                            role: 'viewer',
                            email: email || '',
                            blocked: false,
                            approved: false // New users need approval
                        }
                    );
                    setUserRole('viewer');
                    setIsBlocked(false);
                    setIsApproved(false); // New users not approved
                    console.log('User document auto-repaired successfully.');
                } catch (createError) {
                    console.error('Failed to auto-repair user document:', createError);
                    setUserRole('viewer'); // Fallback
                }
            } else {
                console.error('Error fetching user role:', error);
                setUserRole('viewer');
                setIsBlocked(false);
            }
        }
    };

    const signup = async (email, password, role = 'viewer') => {
        const userId = ID.unique();
        try {
            await account.create(userId, email, password);
        } catch (error) {
            console.error("Appwrite account.create error:", error);
            throw error;
        }

        try {
            await login(email, password);
        } catch (error) {
            console.error("Appwrite login after signup error:", error);
            throw error;
        }

        try {
            const user = await account.get();
            await databases.createDocument(
                DATABASE_ID,
                'users',
                user.$id,
                {
                    role: role,
                    email: email,
                    blocked: false
                }
            );
        } catch (error) {
            console.error('Error creating user profile:', error);
        }

        await checkUserStatus();
    };

    const login = async (email, password) => {
        try {
            await account.createEmailPasswordSession(email, password);
            // Small delay to ensure session is fully synchronized (especially on production/Netlify)
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            const user = await checkUserStatus();
            if (user) {
                return;
            }

            console.error("Login session creation error:", error);
            throw error;
        }

        await checkUserStatus();
    };

    const loginWithGoogle = async () => {
        account.createOAuth2Session(
            'google',
            `${window.location.origin}/oauth-callback`,
            `${window.location.origin}/login`
        );
    };

    const completeMemberRegistration = async (memberData) => {
        if (!currentUser) throw new Error('No user logged in');
        if (!currentUser.$id) throw new Error('User ID is missing');

        // Check if member already exists for this user to prevent duplicates
        const existingMember = await getMemberByUserId(currentUser.$id);
        if (existingMember) {
            setHasMembership(true);
            setCurrentMember(existingMember);
            return;
        }

        await createMemberWithUser(memberData, currentUser.$id);
        setHasMembership(true);
        const member = await getMemberByUserId(currentUser.$id);
        setCurrentMember(member);
    };

    const logout = async () => {
        await account.deleteSession('current');
        setCurrentUser(null);
        setCurrentMember(null);
        setUserRole(null);
        setIsBlocked(false);
    };

    const value = {
        currentUser,
        currentMember,
        userRole,
        hasMembership,
        isBlocked,
        isApproved,
        login,
        signup,
        loginWithGoogle,
        completeMemberRegistration,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>جاري التحقق من المستخدم...</div> : children}
        </AuthContext.Provider>
    );
};
