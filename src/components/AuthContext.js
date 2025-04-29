// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage on component mount
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  /**
   * Login function that authenticates the user
   * @param {string} username - Username to authenticate
   * @param {string} password - Password to authenticate (optional for demo mode)
   * @returns {Promise<boolean>} - Whether login was successful
   */
  const login = async (username, password) => {
    setError(null);

    try {
      // For demo purposes, we'll use local authentication
      // In a real app, this would call an API endpoint
      if (password) {
        // Demo: Admin is 'admin'/'admin', regular user is any other combo
        const isAdmin =
          username.toLowerCase() === "admin" && password === "admin";
        const isRegularUser = username.length > 0 && password.length > 0;

        if (!isAdmin && !isRegularUser) {
          throw new Error("Login failed. Please check your credentials.");
        }

        const userObj = {
          username: username,
          email: `${username}@example.com`,
          isAdmin: isAdmin,
          userId: isAdmin ? 1 : Math.floor(Math.random() * 1000) + 2,
        };

        localStorage.setItem("user", JSON.stringify(userObj));
        setUser(userObj);
        return true;
      } else {
        // Simple mode (just username)
        const userObj = {
          username: username,
          isAdmin: username.toLowerCase() === "admin",
          userId:
            username.toLowerCase() === "admin"
              ? 1
              : Math.floor(Math.random() * 1000) + 2,
        };

        localStorage.setItem("user", JSON.stringify(userObj));
        setUser(userObj);
        return true;
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Failed to login. Please try again.");
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
      // For demo purposes, we'll just create a user locally
      // In a real app, this would call an API endpoint
      const userObj = {
        username: userData.username,
        email: userData.email || "",
        isAdmin: userData.admin === true,
        userId: Math.floor(Math.random() * 1000) + 10,
      };

      localStorage.setItem("user", JSON.stringify(userObj));
      setUser(userObj);

      return true;
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Failed to register. Please try again.");
      return false;
    }
  };

  /**
   * Get authentication headers for API requests
   * @returns {Object} - Headers object with Authorization if logged in
   */
  const getAuthHeaders = () => {
    return user ? { Authorization: `Bearer demo-token-${user.userId}` } : {};
  };

  /**
   * Refresh the access token (dummy implementation for demo)
   * @returns {Promise<boolean>} - Always returns true in this demo
   */
  const refreshAccessToken = async () => {
    return true; // Always succeed in demo mode
  };

  /**
   * Logout the current user
   */
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  /**
   * Check if the user is authenticated
   * @returns {boolean} - Whether user is authenticated
   */
  const isAuthenticated = () => {
    return !!user;
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
    getAuthHeaders,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthContext;
