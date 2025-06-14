// src/components/AdminRoute.js
import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const AdminRoute = ({ children }) => {
    const auth = useContext(AuthContext);
    const loc = useLocation();
    
    // First, make sure auth context is available and the user is authenticated
    if (!auth.isAuthenticated()) {
        console.log("Not authenticated, redirecting to login");
        return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
    }
    
    // Then check if the user is an admin based on role from API
    if (!auth.user?.isAdmin) {
        console.log("Not an admin, redirecting to home");
        // User is authenticated but not an admin, redirect to home page
        return <Navigate to="/" state={{ from: loc.pathname }} replace />;
    }
    
    // User is authenticated and is an admin, allow access
    return children;
};

export default AdminRoute;