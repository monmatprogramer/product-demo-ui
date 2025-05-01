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

  // Mock login function - in a real app, this would call an API
 // Modified login function in AuthContext.js
const login = async (username, password) => {
  setError(null);
  
  try {
    // For demo purposes, simulate API call using localStorage
    const storedUsers = localStorage.getItem("adminUsers");
    let users = storedUsers ? JSON.parse(storedUsers) : [];
    
    // If no users exist, initialize with admin user
    if (users.length === 0) {
      users = [{
        id: 1,
        username: 'admin',
        email: null,
        role: 'ADMIN'
      }];
      localStorage.setItem("adminUsers", JSON.stringify(users));
    }
    
    // Find user
    const foundUser = users.find(user => 
        user.username === username.trim()
    );
    
    if (!foundUser) {
        throw new Error('Invalid username or password');
    }
    
    // Create user object
    const userData = {
        userId: foundUser.id,
        username: foundUser.username,
        email: foundUser.email,
        isAdmin: foundUser.role === 'ADMIN'
    };
    
    // Generate mock token
    const mockToken = "demo-token-" + Math.random().toString(36).substring(2);
    
    // Store in localStorage
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", mockToken);
    
    // Update state
    setUser(userData);
    setToken(mockToken);
    
    return true;
  } catch (err) {
    console.error("Login error:", err);
    setError(err.message || "Failed to login. Please check your credentials.");
    return false;
  }
};

  // Mock register function
  const register = async (userData) => {
    setError(null);

    try {
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
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Failed to register. Please try again.");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  const isAuthenticated = () => {
    return !!user && !!token;
  };

  // Get authentication headers for API requests
  const getAuthHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
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