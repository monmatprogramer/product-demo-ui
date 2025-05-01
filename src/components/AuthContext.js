// src/components/AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from "react";

// Mock products to use as fallback
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "Gaming Laptop",
    description: "High-performance gaming laptop with RGB keyboard",
    price: 1299.99,
    imageUrl: "",
  },
  {
    id: 2,
    name: "Mechanical Keyboard",
    description: "Tactile mechanical keyboard with customizable backlighting",
    price: 129.99,
    imageUrl: "",
  },
  {
    id: 3,
    name: "Wireless Mouse",
    description: "Ergonomic wireless mouse with long battery life",
    price: 59.99,
    imageUrl: "",
  },
  {
    id: 4,
    name: "LED Monitor",
    description: "27-inch LED monitor with high refresh rate",
    price: 249.99,
    imageUrl: "",
  },
];

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
  // Fetch products method for AuthContext.js
  // Updated fetchProducts method with authentication handling
  // Update this in AuthContext.js
const fetchProducts = useCallback(async () => {
  try {
    setLoading(true);

    // Get the token from localStorage
    const token = localStorage.getItem("token");

    // Prepare headers
    const headers = {
      "Content-Type": "application/json",
      // Always include the Authorization header if token exists
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    // Use relative path with proxy instead of hard-coded URL
    const response = await fetch("/api/products", {
      method: "GET",
      headers: headers,
    });

    // Log response info for debugging
    console.log("Products API response status:", response.status);
    
    // Handle unauthorized access
    if (response.status === 401) {
      // Clear any invalid token
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      throw new Error("Authentication required. Please log in.");
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
    if (Array.isArray(data) && data.length > 0) {
      // Add some basic data validation if needed
      const validProducts = data.filter(
        (product) =>
          product &&
          product.id &&
          product.name &&
          typeof product.price === "number"
      );

      // Set the products
      setProducts(validProducts);
      setError(null);
    } else {
      // If no valid products, use mock data or set empty array
      console.warn("No products returned from API");
      setProducts(MOCK_PRODUCTS);
      setError("No products found");
    }
  } catch (error) {
    console.error("Failed to fetch products:", error);

    // Fall back to mock products on error
    setProducts(MOCK_PRODUCTS);
    setError(error.message || "Failed to fetch products");
  } finally {
    setLoading(false);
  }
}, []);

  // When calling this method in useEffect or elsewhere
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // When calling this method in useEffect or elsewhere
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Login function with improved error handling
  // Updated login method for AuthContext.js
  // Update this in AuthContext.js
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

    // Log response for debugging
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

    // Validate the response structure
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

    // Reset state
    setUser(null);
    setToken(null);
    setProducts([]);
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
