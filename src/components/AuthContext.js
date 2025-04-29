// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import { AuthService } from "../services/AuthService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  // on mount, check localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    const storedRefreshToken = localStorage.getItem("refreshToken");
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
        setRefreshToken(storedRefreshToken);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    setError(null);
    
    try {
      const data = await AuthService.login(username, password);
      
      // Create user object from response
      const userData = {
        userId: data.userId,
        username: data.username,
        email: data.email || null,
        isAdmin: data.role === "ADMIN", // Adjust based on your API response
      };

      // Store in localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);

      // Update state
      setUser(userData);
      setToken(data.token);
      setRefreshToken(data.refreshToken);
      
      return true;
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Failed to login. Please check your credentials.");
      return false;
    }
  };

  const register = async (userData) => {
    setError(null);

    try {
      await AuthService.register({
        username: userData.username,
        email: userData.email,
        password: userData.password
        // Add any other required fields based on your API
      });

      // If registration is successful, automatically log them in
      return await login(userData.username, userData.password);
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Failed to register. Please try again.");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setToken(null);
    setRefreshToken(null);
  };

  const isAuthenticated = () => {
    return !!user && !!token;
  };

  // Get authentication headers for API requests
  const getAuthHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Refresh the access token using the refresh token
  const refreshAccessToken = async () => {
    if (!refreshToken) {
      return false;
    }
    
    try {
      const data = await AuthService.refreshToken(refreshToken);
      
      // Update token in localStorage and state
      localStorage.setItem("token", data.token);
      setToken(data.token);
      
      // If the API also returns a new refresh token, update it too
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
        setRefreshToken(data.refreshToken);
      }
      
      return true;
    } catch (err) {
      console.error("Token refresh error:", err);
      // If refresh fails, log the user out
      logout();
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
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