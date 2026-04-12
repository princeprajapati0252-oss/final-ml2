import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div className="gradient-text" style={{ fontSize: '1.5rem' }}>Loading...</div>
        </div>
    );

    if (!user) return <Navigate to="/login" />;

    return children;
};

export const AdminRoute = ({ children }) => {
    const { user, loading, isAdmin } = useAuth();

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div className="gradient-text" style={{ fontSize: '1.5rem' }}>Loading...</div>
        </div>
    );

    if (!user || !isAdmin) return <Navigate to="/" />;

    return children;
};

export const SuperAdminRoute = ({ children }) => {
    const { user, loading, isSuperAdmin } = useAuth();

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div className="gradient-text" style={{ fontSize: '1.5rem' }}>Loading...</div>
        </div>
    );

    if (!user || !isSuperAdmin) return <Navigate to="/" />;

    return children;
};
