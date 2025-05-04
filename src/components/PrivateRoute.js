// src/components/PrivateRoute.js
import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const PrivateRoute = ({ children }) => {
    const auth = useContext(AuthContext);
    const loc = useLocation();
    
    if (!auth.isAuthenticated()) {
        // Redirect to login, keep where we came from
        console.log("Not authenticated, redirecting to login");
        return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
    }
    
    // User is authenticated, allow access
    return children;
};

export default PrivateRoute;