// src/components/AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from "react";
import { safeJsonFetch, formatApiError } from "../utils/apiUtils";

export const AuthContext = createContext();

// Define API base URL - same approach as in apiUtils.js
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://product-spring-boot-pro-new-env.eba-ghmu6gcw.ap-southeast-2.elasticbeanstalk.com'
  : '';

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
      
      // Log the environment and URL being used
      console.log(`Environment: ${process.env.NODE_ENV}, fetching products...`);
      
      // First try without auth headers
      try {
        const productsData = await safeJsonFetch('/api/products', {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        
        if (Array.isArray(productsData)) {
          console.log(`Products fetched successfully: ${productsData.length} items`);
          setProducts(productsData);
          setError(null);
        } else {
          console.warn("API did not return an array for products:", productsData);
          setProducts([]);
          setError("Received invalid data format for products.");
        }
      } catch (error) {
        // Check if the error is due to authentication requirement
        if (error.message.includes('401') || error.message.includes('unauthorized')) {
          console.log("Products endpoint requires authentication");
          setAuthRequired(true);
          
          const token = localStorage.getItem("token");
          if (token) {
            console.log("Token found, retrying with authentication");
            try {
              const productsData = await safeJsonFetch('/api/products', {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`
                }
              });
              
              if (Array.isArray(productsData)) {
                setProducts(productsData);
                setError(null);
              } else {
                setProducts([]);
                setError("Received invalid data format for products.");
              }
            } catch (authError) {
              console.error("Failed to fetch products with auth:", authError);
              setProducts([]);
              setError(formatApiError(authError));
            }
          } else {
            console.log("No authentication token available");
            setProducts([]);
            setError("Authentication required to view products");
          }
        } else {
          // Handle other types of errors
          console.error("Failed to fetch products:", error);
          setProducts([]);
          setError(formatApiError(error));
        }
      }
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
      
      // Make the login request using safeJsonFetch
      const data = await safeJsonFetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });
      
      // Store the authentication token
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
      // Create user object
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
      
      const data = await safeJsonFetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });
      
      // If registration was successful and returns a token, login the user
      if (data.token) {
        localStorage.setItem('token', data.token);
        
        // Create and store user data
        const newUserData = {
          username: userData.username,
          isAdmin: data.role === 'ADMIN',
          role: data.role || 'USER'
        };
        
        localStorage.setItem('user', JSON.stringify(newUserData));
        
        // Update state
        setUser(newUserData);
        setToken(data.token);
        
        // Fetch products after login
        fetchProducts();
        
        return true;
      }
      
      return true; // Registration successful but no auto-login
    } catch (error) {
      console.error('Registration error:', error);
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
      
      const data = await safeJsonFetch('/api/auth/profile', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData)
      });
      
      // Update user data in state and localStorage
      const updatedUser = {
        ...user,
        ...profileData,
      };
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return true;
    } catch (error) {
      console.error('Profile update error:', error);
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