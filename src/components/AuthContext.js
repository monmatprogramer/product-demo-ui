// src/components/AuthContext.js - Updated version
import React, { createContext, useState, useEffect, useCallback } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [products, setProducts] = useState([]);

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

  // Fetch products with improved error handling
  // Update the fetchProducts function in AuthContext.js
  // Revised fetchProducts in AuthContext.js
  const fetchProducts = useCallback(async () => {
    // No need to check for token here anymore for fetching products

    try {
      setLoading(true);
      setError(null);
      const url = "/api/products"; // The public endpoint

      // Define headers *without* Authorization for this public request
      const headers = {
        "Content-Type": "application/json",
        // No 'Authorization' header needed
      };

      console.log("Attempting to fetch public products from:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: headers, // Use headers without Authorization
      });

      console.log("Products API response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        // Provide a more specific error if possible
        throw new Error(
          `HTTP error! status: ${response.status} - ${
            errorText || "Failed to fetch"
          }`
        );
      }

      const data = await response.json();
      console.log("Public products fetched:", data);

      if (Array.isArray(data)) {
        setProducts(data);
        setError(null);
      } else {
        console.warn("API did not return an array for products:", data);
        setProducts([]);
        setError("Received invalid data format for products.");
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
      setError(error.message || "Failed to fetch products. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []); // Keep dependencies empty if it doesn't rely on external state/props changing

  // Login function with direct fetch instead of using the login function
  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
  
      console.log("Attempting login for user:", username);
      
      // Make the login request
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });
      
      if (!response.ok) {
        // Handle error response
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || `Login failed with status: ${response.status}`;
        } catch (e) {
          errorMessage = `Login failed with status: ${response.status}`;
        }
        throw new Error(errorMessage);
      }
  
      // Parse successful response
      const data = await response.json();
      
      // Store the authentication token
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
      // Create user object - IMPORTANT: Include role/isAdmin
      const userData = {
        username: username,
        isAdmin: data.role === 'ADMIN', // Make sure your backend returns role info
        role: data.role || 'USER'
      };
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update state
      setUser(userData);
      setToken(data.token || '');
      
      // Fetch products after login
      fetchProducts();
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
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
    setProducts([]);
    setError(null);
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

        // Try to fetch products if authenticated
        fetchProducts();
      } catch (error) {
        console.error("Error parsing stored user:", error);
        logout();
      }
    } else {
      // Try to fetch public products even if not authenticated
      fetchProducts();
    }

    // Always set loading to false after initial check
    setLoading(false);
  }, [fetchProducts]);

  // Context value
  const contextValue = {
    user,
    token,
    login,
    logout,
    isAuthenticated,
    getAuthHeaders,
    loading,
    error,
    products,
    fetchProducts,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthContext;
