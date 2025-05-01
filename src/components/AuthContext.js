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
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use relative path with proxy
      const url = '/api/products';
      let headers = { 'Content-Type': 'application/json' };
      
      // Get the token and add it if available
      const token = localStorage.getItem("token");
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      console.log("Fetching products with headers:", headers);
      
      const response = await fetch(url, {
        method: "GET",
        headers: headers,
      });

      // Log response info for debugging
      console.log("Products API response status:", response.status);
      
      // Handle unauthorized access for a better user experience
      if (response.status === 401) {
        // This is normal - products may require auth
        console.log("Authentication required for products. This is expected if not logged in.");
        setProducts([]);
        return;
      }

      // Check if the response is successful
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Parse the JSON response
      const data = await response.json();
      console.log("Products fetched:", data);

      // Validate the data
      if (Array.isArray(data)) {
        setProducts(data);
        setError(null);
      } else {
        // If no valid products, set empty array
        setProducts([]);
        setError("No products returned from API. Please check your connection.");
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
      setError(error.message || "Failed to fetch products. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Login function with direct fetch instead of using the login function
  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Attempting login for user:", username);

      // Use relative URL for proxy to handle
      const loginUrl = '/api/auth/login';

      // Prepare the request body
      const requestBody = {
        username: username.trim(),
        password: password
      };

      console.log("Login request payload:", requestBody);

      // Make the login request
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log("Login response status:", response.status);
      
      // Check if the response is successful
      if (!response.ok) {
        // Try to parse error message from the response
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || `Login failed with status: ${response.status}`;
        } catch (e) {
          // If we can't parse JSON, use text or status
          const errorText = await response.text();
          errorMessage = errorText || `Login failed with status: ${response.status}`;
        }
        console.error("Login error response:", errorMessage);
        throw new Error(errorMessage);
      }

      // Parse the successful response
      const data = await response.json();
      console.log("Login successful, received data:", data);

      // Check for token in response
      if (!data.token) {
        throw new Error('Invalid login response: No token received');
      }

      // Store the authentication token
      localStorage.setItem('token', data.token);

      // Store refresh token if provided
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      // Create user object from the response
      const userData = {
        id: data.userId || data.id,
        username: username,
        email: data.email,
        role: data.role || 'USER',
        isAdmin: data.role === 'ADMIN'
      };

      console.log("Storing user data:", userData);

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(userData));

      // Update state
      setUser(userData);
      setToken(data.token);

      // Fetch products after successful login
      await fetchProducts();

      return true;
    } catch (error) {
      console.error('Login error:', error);
      
      // Set error message for display
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