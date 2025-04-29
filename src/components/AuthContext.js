import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initialize auth state from localStorage on component mount
    useEffect(() => {
        const initializeAuth = () => {
            try {
                const storedUser = localStorage.getItem('user');
                const token = localStorage.getItem('token');
                const refreshToken = localStorage.getItem('refreshToken');
                
                if (storedUser && token) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (err) {
                console.error('Error initializing auth state:', err);
                // Clear potentially corrupted storage
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
            } finally {
                setLoading(false);
            }
        };
        
        initializeAuth();
    }, []);

    /**
     * Login function that communicates with the Spring Boot backend
     * @param {string} username - Username to authenticate
     * @param {string} password - Password to authenticate
     * @returns {Promise<boolean>} - Whether login was successful
     */
    const login = async (username, password) => {
        setError(null);
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });
            
            // Parse response data
            let data;
            try {
                data = await response.json();
            } catch (err) {
                throw new Error('Invalid response from server');
            }
            
            // Handle failed login
            if (!response.ok) {
                throw new Error(data?.error || data?.message || 'Login failed');
            }
            
            // Create user object
            const userObj = {
                username: data.username,
                email: data.email || '',
                isAdmin: data.role === 'ADMIN',
                userId: data.userId
            };
            
            // Store auth data in localStorage
            localStorage.setItem('user', JSON.stringify(userObj));
            
            // Store tokens
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            
            if (data.refreshToken) {
                localStorage.setItem('refreshToken', data.refreshToken);
            }
            
            // Update context state
            setUser(userObj);
            return true;
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Failed to login. Please try again.');
            return false;
        }
    };

    /**
     * Register a new user
     * @param {Object} userData - User data for registration
     * @returns {Promise<boolean>} - Whether registration was successful
     */
    const register = async (userData) => {
        setError(null);
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });
            
            // Parse response data
            let data;
            try {
                data = await response.json();
            } catch (err) {
                throw new Error('Invalid response from server');
            }
            
            // Handle failed registration
            if (!response.ok) {
                throw new Error(data?.error || data?.message || 'Registration failed');
            }
            
            // If registration returns tokens, store them
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            
            if (data.refreshToken) {
                localStorage.setItem('refreshToken', data.refreshToken);
            }
            
            // Create and store user object
            const userObj = {
                username: data.username,
                email: data.email || '',
                isAdmin: data.role === 'ADMIN',
                userId: data.userId
            };
            
            localStorage.setItem('user', JSON.stringify(userObj));
            setUser(userObj);
            
            return true;
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.message || 'Failed to register. Please try again.');
            return false;
        }
    };

    /**
     * Refresh the access token using the refresh token
     * @returns {Promise<boolean>} - Whether token refresh was successful
     */
    const refreshAccessToken = async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) return false;
        
        try {
            const response = await fetch('/api/auth/refresh-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken })
            });
            
            if (!response.ok) return false;
            
            const data = await response.json();
            
            if (data.token) {
                localStorage.setItem('token', data.token);
                return true;
            }
            
            return false;
        } catch (err) {
            console.error('Token refresh error:', err);
            return false;
        }
    };

    /**
     * Logout the current user
     */
    const logout = async () => {
        try {
            // Call logout endpoint if it exists
            const token = localStorage.getItem('token');
            if (token) {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }).catch(() => {
                    // Ignore network errors for logout
                    console.log('Logout request failed, but proceeding with local logout');
                });
            }
        } finally {
            // Always clear local storage and state regardless of API response
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            setUser(null);
        }
    };

    /**
     * Get authentication headers for API requests
     * @returns {Object} - Headers object with Authorization if logged in
     */
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return token 
            ? { 'Authorization': `Bearer ${token}` }
            : {};
    };

    /**
     * Check if the user is authenticated
     * @returns {boolean} - Whether user is authenticated
     */
    const isAuthenticated = () => {
        return !!user && !!localStorage.getItem('token');
    };

    // Create the context value object
    const contextValue = {
        user,
        loading,
        error,
        login,
        logout,
        register,
        refreshAccessToken,
        isAuthenticated,
        getAuthHeaders
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;