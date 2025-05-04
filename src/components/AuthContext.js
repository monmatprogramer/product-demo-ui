// src/components/AuthContext.js - Updated for better token handling
import React, { createContext, useState, useEffect, useCallback } from "react";
import { safeJsonFetch, formatApiError } from "../utils/apiUtils";

export const AuthContext = createContext();

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

      console.log(`Environment: ${process.env.NODE_ENV}, fetching products...`);

      // Make a direct API call to get products (should be public)
      const productsData = await safeJsonFetch("/products", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (Array.isArray(productsData)) {
        console.log(
          `Products fetched successfully: ${productsData.length} items`
        );
        setProducts(productsData);
        setError(null);
      } else {
        console.error("API did not return an array for products");
        setProducts([]);
        setError("Invalid data format received from API");
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);

      // Check if it's an authentication error
      if (
        error.message.includes("401") ||
        error.message.includes("unauthorized")
      ) {
        console.log("Products endpoint requires authentication");
        setAuthRequired(true);
        setError("Authentication required to view products");
      } else {
        setError(formatApiError(error));
      }

      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Login function - updated for better error handling
  const login = async (username, password) => {
    try {
      console.log("Attempting to login with:", username);
      setLoading(true);
      setError(null);

      // Try API login
      try {
        const response = await fetch(
          "http://54.253.83.201:8080/api/auth/login",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
          }
        );

        console.log("Login response status:", response.status);

        if (!response.ok) {
          // Try to extract error message from response
          let errorMessage;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || "Invalid username or password";
          } catch {
            const errorText = await response.text();
            errorMessage = errorText || "Invalid username or password";
          }

          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log("Login successful, received data:", data);

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
          isAdmin:
            data.role === "ADMIN" ||
            data.authorities?.some((a) => a.authority === "ROLE_ADMIN") ||
            false,
        };

        console.log("User data being saved:", userData);
        localStorage.setItem("user", JSON.stringify(userData));

        // Update state
        setUser(userData);
        setToken(data.token);

        return true;
      } catch (apiError) {
        console.error("API Login error:", apiError);

        // Check if we need to fall back to mock authentication for development
        if (
          process.env.NODE_ENV === "development" &&
          window.confirm(
            "API login failed. Do you want to use mock authentication for development?"
          )
        ) {
          console.log("Falling back to mock authentication");

          // Mock authentication for development purposes
          const mockUser = {
            userId: 1,
            username: username,
            email: `${username}@example.com`,
            isAdmin: username.toLowerCase() === "admin", // Make 'admin' user an admin
          };

          // Generate a mock token
          const mockToken = `mock-token-${Math.random()
            .toString(36)
            .substring(2)}`;

          // Store mock data
          localStorage.setItem("user", JSON.stringify(mockUser));
          localStorage.setItem("token", mockToken);

          // Update state
          setUser(mockUser);
          setToken(mockToken);

          return true;
        }

        // If not in development or user declined mock auth, propagate the error
        throw apiError;
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.message || "Failed to login. Please check your credentials."
      );
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
    setError(null);
    setLoading(true);

    try {
      // Try API registration
      try {
        const response = await fetch(
          "http://54.253.83.201:8080/api/auth/register",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage;
          try {
            const errorData = JSON.parse(errorText);
            errorMessage =
              errorData.message || `Registration failed: ${response.status}`;
          } catch {
            errorMessage =
              errorText || `Registration failed: ${response.status}`;
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
        if (
          process.env.NODE_ENV === "development" &&
          window.confirm(
            "API registration failed. Do you want to use mock registration for development?"
          )
        ) {
          console.log("Falling back to mock registration");

          // For demo purposes, simulate API call using localStorage
          const storedUsers = localStorage.getItem("adminUsers");
          let users = storedUsers ? JSON.parse(storedUsers) : [];

          // Check if username already exists
          if (users.some((user) => user.username === userData.username.trim())) {
            throw new Error("Username already exists");
          }

          // Create new user
          const newUser = {
            id: users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1,
            username: userData.username.trim(),
            email: userData.email ? userData.email.trim() : null,
            role: "USER",
          };

          // Add to array
          users.push(newUser);

          // Save to localStorage
          localStorage.setItem("adminUsers", JSON.stringify(users));

          // Auto login after registration
          return login(userData.username, userData.password);
        }

        // If not in development or user declined mock auth, propagate the error
        throw apiError;
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Failed to register. Please try again.");
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

      // Make actual API call to update profile
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Profile update failed: ${response.status}`
        );
      }

      // Get updated user data
      const updatedUserData = await response.json();

      // Create updated user object
      const updatedUser = {
        ...user,
        ...updatedUserData,
      };

      // Update state and localStorage
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      return true;
    } catch (error) {
      console.error("Profile update error:", error);
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