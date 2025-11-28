import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BlockedUserMessage from './BlockedUserMessage';
import PendingApprovalMessage from './PendingApprovalMessage';

const ProtectedRoute = ({ children }) => {
    const { currentUser, loading, isBlocked, isApproved, hasMembership } = useAuth();

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>جاري التحميل...</div>;
    }

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    if (isBlocked) {
        return <BlockedUserMessage />;
    }

    // Check if user is approved
    if (!isApproved) {
        return <PendingApprovalMessage />;
    }

    // Check if user has completed member registration
    // We skip this check if we are already on the complete-registration page (handled by router)
    // But ProtectedRoute is usually for dashboard/profile/activities
    if (!hasMembership && window.location.pathname !== '/complete-registration') {
        return <Navigate to="/complete-registration" />;
    }

    return children;
};

export default ProtectedRoute;
