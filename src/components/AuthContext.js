// src/components/AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from "react";
import { getCart } from "../utils/cartUtils";

// Define MOCK_PRODUCTS here to avoid the undefined error
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
  },
  {
    id: 5,
    name: "USB Hub",
    description: "Multi-port USB hub with fast charging",
    price: 39.99,
    imageUrl: ""
  },
  {
    id: 6,
    name: "External SSD",
    description: "Fast external SSD with USB-C connectivity",
    price: 89.99,
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

  // Define isAuthenticated and getAuthHeaders as regular functions
  const isAuthenticated = () => {
    return !!user && !!token;
  };

  const getAuthHeaders = () => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) {
      console.warn("getAuthHeaders called but no token found in localStorage");
      return { "Content-Type": "application/json" };
    }
    
    return { 
      "Authorization": `Bearer ${currentToken}`,
      "Content-Type": "application/json" 
    };
  };

  // Define fetchProducts as a useCallback so it can be referenced consistently
  const fetchProducts = useCallback(async () => {
    try {
      // Check for authentication token
      const token = localStorage.getItem("token");
      const headers = token ? { "Authorization": `Bearer ${token}` } : {};
      
      console.log("Fetching products");
      const response = await fetch("/api/products", {
        headers: headers
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Fetched products:", data);
      
      if (Array.isArray(data) && data.length > 0) {
        setProducts(data);
      } else {
        // If API returns empty or invalid data, use mock data
        console.log("Using mock product data due to empty response");
        setProducts(MOCK_PRODUCTS);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      // Use mock data on error
      console.log("Using mock product data due to error");
      setProducts(MOCK_PRODUCTS);
    } finally {
      setLoading(false);
    }
  }, []);

  // on mount, check localStorage for existing auth
  useEffect(() => {
    // Try to load user and token from localStorage
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        console.log("Loaded auth from localStorage:", { hasUser: true, hasToken: true });
      } catch (err) {
        console.error("Error parsing stored user data:", err);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    } else {
      console.log("No stored auth found in localStorage");
    }

    // Set loading to false after auth check
    setLoading(false);
    
    // Fetch products after auth check
    fetchProducts();
  }, [fetchProducts]);

  // Login function
  const login = async (username, password) => {
    setError(null);
    
    try {
      console.log("Attempting to login with:", username);
      
      // Try API login first
      try {
        // Use relative URL for API calls to leverage proxy in development
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password })
        });
        
        if (!response.ok) {
          console.error("Login failed with status:", response.status);
          
          // Try to extract error message from response
          const errorText = await response.text();
          let errorMessage;
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || "Invalid username or password";
          } catch {
            errorMessage = errorText || "Invalid username or password";
          }
          
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        console.log("Login response:", data);
        
        // Store the token and user data
        localStorage.setItem("token", data.token);
        
        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
        }
        
        // Create user object from API data
        const userData = {
          userId: data.userId || data.id || 1,
          username: username,
          email: data.email || null,
          isAdmin: data.role === "ADMIN" || 
                  data.authorities?.some(a => a.authority === "ROLE_ADMIN") || 
                  false
        };
        
        localStorage.setItem("user", JSON.stringify(userData));
        
        // Update state
        setUser(userData);
        setToken(data.token);
        
        console.log("Login successful, auth state updated", { 
          hasUser: true, 
          hasToken: true,
          isAdmin: userData.isAdmin
        });
        
        // Refresh products after login
        fetchProducts();
        
        return true;
      } catch (apiError) {
        console.error("API Login error:", apiError);
        
        // Check if we need to fall back to mock authentication for development
        if (process.env.NODE_ENV === 'development' && 
            window.confirm("API login failed. Do you want to use mock authentication for development?")) {
          console.log("Falling back to mock authentication");
          
          // Mock authentication for development purposes
          const mockUser = {
            userId: 1,
            username: username,
            email: `${username}@example.com`,
            isAdmin: username.toLowerCase() === 'admin' // Make 'admin' user an admin
          };
          
          // Generate a mock token (just for structure, not a real JWT)
          const mockToken = `mock-token-${Math.random().toString(36).substring(2)}`;
          
          // Store mock data
          localStorage.setItem("user", JSON.stringify(mockUser));
          localStorage.setItem("token", mockToken);
          
          // Update state
          setUser(mockUser);
          setToken(mockToken);
          
          console.log("Mock login successful", { 
            hasUser: true, 
            hasToken: true,
            isAdmin: mockUser.isAdmin
          });
          
          // Refresh products after mock login
          fetchProducts();
          
          return true;
        } else {
          throw apiError; // If user doesn't want mock auth, propagate the original error
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Failed to login. Please check your credentials.");
      return false;
    }
  };

  // Register function
  const register = async (userData) => {
    setError(null);

    try {
      // Try API registration first
      try {
        // Use relative URL for API calls to leverage proxy in development
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage;
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || `Registration failed: ${response.status}`;
          } catch {
            errorMessage = errorText || `Registration failed: ${response.status}`;
          }
          
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        console.log("Registration successful:", data);
        
        // Auto login after registration
        return login(userData.username, userData.password);
      } catch (apiError) {
        console.error("API Registration error:", apiError);
        
        // Check if we need to fall back to mock registration for development
        if (process.env.NODE_ENV === 'development' && 
            window.confirm("API registration failed. Do you want to use mock registration for development?")) {
          console.log("Falling back to mock registration");
          
          // For demo purposes, simulate API call using localStorage
          const storedUsers = localStorage.getItem("adminUsers");
          let users = storedUsers ? JSON.parse(storedUsers) : [];
          
          // Check if username already exists
          if (users.some(user => user.username === userData.username.trim())) {
              throw new Error('Username already exists');
          }
          
          // Create new user
          const newUser = {
              id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
              username: userData.username.trim(),
              email: userData.email ? userData.email.trim() : null,
              role: 'USER'
          };
          
          // Add to array
          users.push(newUser);
          
          // Save to localStorage
          localStorage.setItem("adminUsers", JSON.stringify(users));
          
          // Auto login after registration
          return login(userData.username, userData.password);
        } else {
          throw apiError; // If user doesn't want mock auth, propagate the original error
        }
      }
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
    console.log("Logged out, auth state cleared");
    
    // Refresh products after logout (will use mock data since auth is cleared)
    fetchProducts();
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
        loading,
        error,
        products,
        fetchProducts
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;