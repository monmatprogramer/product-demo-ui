// src/components/AuthContext.js
import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

  // on mount, check localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

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
        
        return true;
      } catch (apiError) {
        console.error("API Login error:", apiError);
        
        // Check if we need to fall back to mock authentication for development
        if (!window.confirm("API login failed. Do you want to use mock authentication for development?")) {
          throw apiError; // If user doesn't want mock auth, propagate the original error
        }
        
        console.log("Falling back to mock authentication");
        
        // Mock authentication for development purposes
        const mockUser = {
          userId: 1,
          username: username,
          email: `${username}@example.com`,
          isAdmin: username.toLowerCase() === 'admin' // Make 'admin' user an admin
        };
        
        // Generate a mock token
        const mockToken = `mock-token-${Math.random().toString(36).substring(2)}`;
        
        // Store mock data
        localStorage.setItem("user", JSON.stringify(mockUser));
        localStorage.setItem("token", mockToken);
        
        // Update state
        setUser(mockUser);
        setToken(mockToken);
        
        return true;
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
        if (!window.confirm("API registration failed. Do you want to use mock registration for development?")) {
          throw apiError; // If user doesn't want mock auth, propagate the original error
        }
        
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
  };

  const isAuthenticated = () => {
    return !!user && !!token;
  };

  // Get authentication headers for API requests
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;