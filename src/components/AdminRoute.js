import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
    const { user } = useContext(AuthContext);
    const loc = useLocation();
    if (!user?.isAdmin) {
        // not an admin → back to home (or show “not authorized”)
        return <Navigate to="/" state={{ from: loc }} replace />;
    }
    return children;
};

export default AdminRoute;
