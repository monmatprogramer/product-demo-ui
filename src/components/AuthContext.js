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
  // Modify the login function in AuthContext.js to properly handle API tokens
  // Update the login function in AuthContext.js
const login = async (username, password) => {
  setError(null);
  
  try {
    console.log("Attempting to login with:", username);
    
    const response = await fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
      console.error("Login failed with status:", response.status);
      throw new Error("Invalid username or password");
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
      isAdmin: data.role === "ADMIN" || data.authorities?.some(a => a.authority === "ROLE_ADMIN") || false
    };
    
    localStorage.setItem("user", JSON.stringify(userData));
    
    // Update state
    setUser(userData);
    setToken(data.token);
    
    return true;
  } catch (err) {
    console.error("Login error:", err);
    setError(err.message || "Failed to login. Please check your credentials.");
    
    // For development, fall back to mock authentication
    try {
      console.log("Falling back to mock authentication");
      // Mock authentication code (existing code)
      // ...
    } catch (mockError) {
      return false;
    }
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
  // Modify the getAuthHeaders function in AuthContext.js
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { 
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json" 
  } : {
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