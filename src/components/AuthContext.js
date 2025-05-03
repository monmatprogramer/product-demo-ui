// src/components/AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from "react";
import { safeJsonFetch, formatApiError } from "../utils/apiUtils";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [products, setProducts] = useState([]);
  const [authRequired, setAuthRequired] = useState(false);

  // Utility function to check authentication status
  const isAuthenticated = () => {
    return !!user && !!token;
  };

  // Get authentication headers
  const getAuthHeaders = () => {
    const currentToken = localStorage.getItem("token");
    return currentToken
      ? {
          Authorization: `Bearer ${currentToken}`,
          "Content-Type": "application/json",
        }
      : { "Content-Type": "application/json" };
  };

  // Fetch products with proper error handling for production
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setAuthRequired(false);

      console.log(`Environment: ${process.env.NODE_ENV}, fetching products...`);

      // Make a direct API call to get products (should be public)
      const productsData = await safeJsonFetch("/api/products", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (Array.isArray(productsData)) {
        console.log(`Products fetched successfully: ${productsData.length} items`);
        setProducts(productsData);
        setError(null);
      } else {
        console.error("API did not return an array for products");
        setProducts([]);
        setError("Invalid data format received from API");
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      
      // Check if it's an authentication error
      if (error.message.includes("401") || error.message.includes("unauthorized")) {
        console.log("Products endpoint requires authentication");
        setAuthRequired(true);
        setError("Authentication required to view products");
      } else {
        setError(formatApiError(error));
      }
      
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Attempting login for user:", username);

      // Make actual API call to login endpoint
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Login failed: ${response.status}`);
      }

      // Get authentication data from response
      const authData = await response.json();
      
      // Extract token from response
      const receivedToken = authData.token || authData.accessToken;
      
      if (!receivedToken) {
        throw new Error("No token received from server");
      }
      
      // Extract user information
      const userData = {
        username: authData.username || username,
        isAdmin: authData.role === "ADMIN",
        role: authData.role || "USER",
      };

      // Store auth data
      localStorage.setItem("token", receivedToken);
      localStorage.setItem("user", JSON.stringify(userData));

      // Update state
      setUser(userData);
      setToken(receivedToken);

      // Fetch products after login
      await fetchProducts();

      return true;
    } catch (error) {
      console.error("Login error:", error);
      setError(formatApiError(error));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Clear local storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");

    // Reset state
    setUser(null);
    setToken(null);
    setError(null);

    // Attempt to fetch products after logout (they may be public)
    fetchProducts();
  };

  // Initialize on mount
  useEffect(() => {
    // Check for existing token and user
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        logout();
      }
    }

    // Always fetch products regardless of authentication status
    fetchProducts();

    // Set loading to false after initial check
    setLoading(false);
  }, [fetchProducts]);

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Attempting to register user:", userData.username);

      // Make actual API call to register endpoint
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Registration failed: ${response.status}`);
      }

      // Get authentication data from response
      const authData = await response.json();
      
      // Extract token from response
      const receivedToken = authData.token || authData.accessToken;
      
      if (!receivedToken) {
        throw new Error("No token received from server");
      }
      
      // Create user data object
      const userObject = {
        username: userData.username,
        isAdmin: authData.role === "ADMIN",
        role: authData.role || "USER",
      };

      // Store auth data
      localStorage.setItem("token", receivedToken);
      localStorage.setItem("user", JSON.stringify(userObject));

      // Update state
      setUser(userObject);
      setToken(receivedToken);

      // Fetch products after registration
      await fetchProducts();

      return true;
    } catch (error) {
      console.error("Registration error:", error);
      setError(formatApiError(error));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);

      // Only proceed if authenticated
      if (!isAuthenticated()) {
        throw new Error("You must be logged in to update your profile");
      }

      // Make actual API call to update profile
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Profile update failed: ${response.status}`);
      }

      // Get updated user data
      const updatedUserData = await response.json();

      // Create updated user object
      const updatedUser = {
        ...user,
        ...updatedUserData,
      };

      // Update state and localStorage
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      return true;
    } catch (error) {
      console.error("Profile update error:", error);
      setError(formatApiError(error));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const contextValue = {
    user,
    token,
    login,
    logout,
    register,
    updateProfile,
    isAuthenticated,
    getAuthHeaders,
    loading,
    error,
    products,
    fetchProducts,
    authRequired,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthContext;