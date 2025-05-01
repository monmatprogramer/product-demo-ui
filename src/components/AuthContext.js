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

      // Determine the API URL (use the port from the current environment)
      const apiPort =
        window.location.port === "3000" ? "8080" : window.location.port;
      const apiUrl = `http://localhost:${apiPort}/api/products`;

      // Fetch products
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: headers,
      });

      // Handle unauthorized access
      if (response.status === 401) {
        // Clear any invalid token
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // If in development, offer mock login
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "Unauthorized access. Using mock authentication for development."
          );

          // Mock login to get a token
          const mockToken = `mock-token-${Date.now()}`;
          localStorage.setItem("token", mockToken);

          const mockUser = {
            id: 1,
            username: "demo_user",
            email: "demo@example.com",
            role: "USER",
          };
          localStorage.setItem("user", JSON.stringify(mockUser));

          // Retry the fetch with mock token
          return await fetchProducts();
        } else {
          throw new Error("Authentication required. Please log in.");
        }
      }

      // Check if the response is successful
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Parse the JSON response
      const data = await response.json();

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
  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);

      // Determine which port to use
      const apiPort =
        window.location.port === "3000" ? "8080" : window.location.port;
      const loginUrl = `http://localhost:${apiPort}/api/login`;

      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed. Please check your credentials.");
      }

      const data = await response.json();

      // Store token and user info
      localStorage.setItem("token", data.token);

      // Create user object
      const userData = {
        id: data.id || 1,
        username: username,
        email: data.email || `${username}@example.com`,
        role: data.role || "USER",
      };

      localStorage.setItem("user", JSON.stringify(userData));

      // Update state
      setUser(userData);
      setToken(data.token);

      // Fetch products after successful login
      await fetchProducts();

      return true;
    } catch (error) {
      console.error("Login error:", error);

      // Fallback to mock authentication for development
      if (process.env.NODE_ENV === "development") {
        console.warn("Falling back to mock authentication");

        // Mock successful login
        const mockUserData = {
          id: 1,
          username: username,
          email: `${username}@example.com`,
          role: username.toLowerCase() === "admin" ? "ADMIN" : "USER",
        };

        const mockToken = `mock-token-${Date.now()}`;

        localStorage.setItem("token", mockToken);
        localStorage.setItem("user", JSON.stringify(mockUserData));

        setUser(mockUserData);
        setToken(mockToken);

        // Use mock products
        setProducts(MOCK_PRODUCTS);

        return true;
      }

      setError(error.message || "Login failed");
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
