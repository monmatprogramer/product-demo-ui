import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // on mount, check localStorage
    useEffect(() => {
        const stored = localStorage.getItem('user');
        if (stored) setUser(JSON.parse(stored));
    }, []);

    const login = (username) => {
        const u = {
            username,
            isAdmin: username.toLowerCase() === 'admin'
        };
        localStorage.setItem('user', JSON.stringify(u));
        setUser(u);
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
