import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MemberRegistrationForm from './MemberRegistrationForm';
import { getMemberByUserId } from '../utils/db';

const CompleteRegistration = () => {
    const { currentUser, completeMemberRegistration } = useAuth();
    const navigate = useNavigate();
    const [checking, setChecking] = useState(true);
    const [memberExists, setMemberExists] = useState(false);

    useEffect(() => {
        const checkMemberExists = async () => {
            if (!currentUser) {
                navigate('/login');
                return;
            }

            try {
                setChecking(true);
                // Wait for the database query to complete
                const existingMember = await getMemberByUserId(currentUser.$id);

                if (existingMember) {
                    // Member already exists, redirect to activities
                    setMemberExists(true);
                    navigate('/activities');
                } else {
                    // No member found, show the registration form
                    setMemberExists(false);
                }
            } catch (error) {
                console.error('Error checking member existence:', error);
                // On error, assume no member exists and show form
                setMemberExists(false);
            } finally {
                setChecking(false);
            }
        };

        checkMemberExists();
    }, [currentUser, navigate]);

    const handleSubmit = async (memberData) => {
        await completeMemberRegistration(memberData);
        navigate('/activities');
    };

    if (!currentUser) {
        return null;
    }

    if (checking) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                gap: '20px'
            }}>
                <div style={{ fontSize: '2rem' }}>⏳</div>
                <p style={{ color: '#64748b' }}>جاري التحقق من بياناتك...</p>
            </div>
        );
    }

    if (memberExists) {
        return null; // Will redirect to activities
    }

    return (
        <MemberRegistrationForm
            onSubmit={handleSubmit}
            currentUser={currentUser}
        />
    );
};

export default CompleteRegistration;
