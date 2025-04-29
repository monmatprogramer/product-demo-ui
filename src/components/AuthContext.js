// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // on mount, check localStorage
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

  const login = (username, password) => {
    // Demo implementation - admin is 'admin'/'admin', regular user is any other combination
    const isAdmin = username.toLowerCase() === "admin" && password === "admin";
    const u = {
      username,
      email: `${username}@example.com`,
      isAdmin: isAdmin,
      userId: isAdmin ? 1 : Math.floor(Math.random() * 1000) + 2,
    };
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);
    return true;
  };

  const register = async (userData) => {
    setError(null);

    try {
      // For demo purposes, we'll just create a user locally
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

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  // Add the missing isAuthenticated function
  const isAuthenticated = () => {
    return !!user;
  };

  // Get authentication headers for API requests
  const getAuthHeaders = () => {
    return user ? { Authorization: `Bearer demo-token-${user.userId}` } : {};
  };

  // Refresh the access token (dummy implementation for demo)
  const refreshAccessToken = async () => {
    return true; // Always succeed in demo mode
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        isAuthenticated,
        getAuthHeaders,
        refreshAccessToken,
        loading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
