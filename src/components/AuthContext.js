// src/components/AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from "react";

// Mock products to use as fallback
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "Gaming Laptop",
    description: "High-performance gaming laptop with RGB keyboard",
    price: 1299.99,
    imageUrl: ""
  },
  {
    id: 2,
    name: "Mechanical Keyboard",
    description: "Tactile mechanical keyboard with customizable backlighting",
    price: 129.99,
    imageUrl: ""
  },
  {
    id: 3,
    name: "Wireless Mouse",
    description: "Ergonomic wireless mouse with long battery life",
    price: 59.99,
    imageUrl: ""
  },
  {
    id: 4,
    name: "LED Monitor",
    description: "27-inch LED monitor with high refresh rate",
    price: 249.99,
    imageUrl: ""
  }
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
          "Authorization": `Bearer ${currentToken}`,
          "Content-Type": "application/json" 
        }
      : { "Content-Type": "application/json" };
  };

  // Fetch products with improved error handling
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      // Determine which port to use (your local setup seems to use different ports)
      const apiPort = window.location.port === '3000' ? '8080' : window.location.port;
      const apiUrl = `http://localhost:${apiPort}/api/products`;

      // Prepare headers
      const headers = getAuthHeaders();

      const response = await fetch(apiUrl, { 
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        // If unauthorized or other error, throw an error
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Validate data
      if (Array.isArray(data) && data.length > 0) {
        setProducts(data);
      } else {
        console.warn('Empty or invalid product data, using mock products');
        setProducts(MOCK_PRODUCTS);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      
      // Fall back to mock products
      setProducts(MOCK_PRODUCTS);
      
      // Set error state
      setError(error.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, []);

  // Login function with improved error handling
  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);

      // Determine which port to use
      const apiPort = window.location.port === '3000' ? '8080' : window.location.port;
      const loginUrl = `http://localhost:${apiPort}/api/login`;

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        throw new Error('Login failed. Please check your credentials.');
      }

      const data = await response.json();

      // Store token and user info
      localStorage.setItem('token', data.token);
      
      // Create user object
      const userData = {
        id: data.id || 1,
        username: username,
        email: data.email || `${username}@example.com`,
        role: data.role || 'USER'
      };

      localStorage.setItem('user', JSON.stringify(userData));

      // Update state
      setUser(userData);
      setToken(data.token);

      // Fetch products after successful login
      await fetchProducts();

      return true;
    } catch (error) {
      console.error('Login error:', error);
      
      // Fallback to mock authentication for development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Falling back to mock authentication');
        
        // Mock successful login
        const mockUserData = {
          id: 1,
          username: username,
          email: `${username}@example.com`,
          role: username.toLowerCase() === 'admin' ? 'ADMIN' : 'USER'
        };
        
        const mockToken = `mock-token-${Date.now()}`;
        
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUserData));
        
        setUser(mockUserData);
        setToken(mockToken);
        
        // Use mock products
        setProducts(MOCK_PRODUCTS);
        
        return true;
      }

      setError(error.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Reset state
    setUser(null);
    setToken(null);
    setProducts([]);
  };

  // Initialize on mount
  useEffect(() => {
    // Check for existing token and user
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        
        // Try to fetch products if authenticated
        fetchProducts();
      } catch (error) {
        console.error('Error parsing stored user:', error);
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
    fetchProducts
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;