import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const PrivateRoute = ({ children }) => {
    const { user } = useContext(AuthContext);
    const loc = useLocation();
    if (!user) {
        // Redirect to login, keep where we came from
        return <Navigate to="/login" state={{ from: loc }} replace />;
    }
    return children;
};

export default PrivateRoute;
