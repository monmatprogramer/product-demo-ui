// src/components/AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from "react";
import { safeJsonFetch, formatApiError } from "../utils/apiUtils";
import { fetchProductsDirect } from "../utils/directApiConnector";

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

      // First try without auth headers
      try {
        const productsData = await safeJsonFetch("/api/products", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (Array.isArray(productsData)) {
          console.log(
            `Products fetched successfully: ${productsData.length} items`
          );
          setProducts(productsData);
          setError(null);
          return; // Exit early on success
        } else {
          console.warn(
            "API did not return an array for products, trying direct connection"
          );

          // Try direct connection as fallback
          const directData = await fetchProductsDirect();
          if (Array.isArray(directData) && directData.length > 0) {
            console.log(
              `Direct API connection successful: ${directData.length} items`
            );
            setProducts(directData);
            setError(
              "Used direct API connection. Consider updating your proxy configuration."
            );
            return; // Exit after successful direct connection
          }

          // If both methods failed, use mock data
          const mockProducts = [
            {
              id: 43,
              name: "Gaming Laptop",
              description: "Powerful specs for AAA titles",
              price: 1899.99,
              imageUrl:
                "https://i.pcmag.com/imagery/reviews/02s3fhQvs6Nz0FQvkQOdmrO-1.fit_lim.size_320x180.v1717007069.jpg",
            },
            {
              id: 44,
              name: "Mechanical Keyboard",
              description: "RGB backlit, blue switches",
              price: 129.5,
              imageUrl:
                "https://cdn.mos.cms.futurecdn.net/AxP8PJXgYVW96hANpNJPXNM-650-80.jpeg.webp",
            },
            {
              id: 45,
              name: "Camo Keycap",
              description: "Stunning camo keycap design",
              price: 34.0,
              imageUrl:
                "https://www.dakeyboard.com/images/deltaforce/5/bascamp/front.png",
            },
          ];
          setProducts(mockProducts);
          setError("Could not connect to product API. Using demo products.");
        }
      } catch (error) {
        // If there's an error, check if it's authentication related
        if (
          error.message.includes("401") ||
          error.message.includes("unauthorized")
        ) {
          console.log("Products endpoint requires authentication");
          setAuthRequired(true);

          const token = localStorage.getItem("token");
          if (token) {
            console.log("Token found, retrying with authentication");
            try {
              const productsData = await safeJsonFetch("/api/products", {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              });

              if (Array.isArray(productsData)) {
                setProducts(productsData);
                setError(null);
              } else {
                // Try direct connection with authentication
                const directData = await fetchProductsDirect();
                if (Array.isArray(directData) && directData.length > 0) {
                  console.log(
                    `Direct API connection successful: ${directData.length} items`
                  );
                  setProducts(directData);
                  setError(
                    "Used direct API connection. Consider updating your proxy configuration."
                  );
                  return;
                }

                // Use mock data if both methods fail
                const mockProducts = [
                  {
                    id: 43,
                    name: "Gaming Laptop",
                    description: "Powerful specs for AAA titles",
                    price: 1899.99,
                    imageUrl:
                      "https://i.pcmag.com/imagery/reviews/02s3fhQvs6Nz0FQvkQOdmrO-1.fit_lim.size_320x180.v1717007069.jpg",
                  },
                  {
                    id: 44,
                    name: "Mechanical Keyboard",
                    description: "RGB backlit, blue switches",
                    price: 129.5,
                    imageUrl:
                      "https://cdn.mos.cms.futurecdn.net/AxP8PJXgYVW96hANpNJPXNM-650-80.jpeg.webp",
                  },
                  {
                    id: 45,
                    name: "Camo Keycap",
                    description: "Stunning camo keycap design",
                    price: 34.0,
                    imageUrl:
                      "https://www.dakeyboard.com/images/deltaforce/5/bascamp/front.png",
                  },
                ];
                setProducts(mockProducts);
                setError(
                  "Received invalid data format from API. Using demo products."
                );
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
          // Try direct connection for other errors
          try {
            console.log("Trying direct API connection as fallback...");
            const directData = await fetchProductsDirect();
            if (Array.isArray(directData) && directData.length > 0) {
              console.log(
                `Direct API connection successful: ${directData.length} items`
              );
              setProducts(directData);
              setError(
                "Used direct API connection. Consider updating your proxy configuration."
              );
              return;
            }
          } catch (directError) {
            console.error("Direct connection also failed:", directError);
          }

          // Handle other types of errors
          console.error("Failed to fetch products:", error);
          // Use mock products for demo
          const mockProducts = [
            {
              id: 43,
              name: "Gaming Laptop",
              description: "Powerful specs for AAA titles",
              price: 1899.99,
              imageUrl:
                "https://i.pcmag.com/imagery/reviews/02s3fhQvs6Nz0FQvkQOdmrO-1.fit_lim.size_320x180.v1717007069.jpg",
            },
            {
              id: 44,
              name: "Mechanical Keyboard",
              description: "RGB backlit, blue switches",
              price: 129.5,
              imageUrl:
                "https://cdn.mos.cms.futurecdn.net/AxP8PJXgYVW96hANpNJPXNM-650-80.jpeg.webp",
            },
            {
              id: 45,
              name: "Camo Keycap",
              description: "Stunning camo keycap design",
              price: 34.0,
              imageUrl:
                "https://www.dakeyboard.com/images/deltaforce/5/bascamp/front.png",
            },
          ];
          setProducts(mockProducts);
          setError("Could not connect to product API. Using demo products.");
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

      // For demo purposes, implement a mock login
      // In a real app, you would use the API
      const mockUser = {
        username: username,
        isAdmin: username === "admin",
        role: username === "admin" ? "ADMIN" : "USER",
      };

      const mockToken = "mock-jwt-token-" + Date.now();

      // Store auth data
      localStorage.setItem("token", mockToken);
      localStorage.setItem("user", JSON.stringify(mockUser));

      // Update state
      setUser(mockUser);
      setToken(mockToken);

      // Fetch products after login
      await fetchProducts();

      return true;
    } catch (error) {
      console.error("Login error:", error);
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

      // For demo purposes, implement a mock registration
      // In a real app, you would use the API
      const mockUser = {
        username: userData.username,
        isAdmin: false,
        role: "USER",
      };

      const mockToken = "mock-jwt-token-" + Date.now();

      // Store auth data
      localStorage.setItem("token", mockToken);
      localStorage.setItem("user", JSON.stringify(mockUser));

      // Update state
      setUser(mockUser);
      setToken(mockToken);

      // Fetch products after login
      await fetchProducts();

      return true;
    } catch (error) {
      console.error("Registration error:", error);
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

      // For demo purposes, implement a mock profile update
      // In a real app, you would use the API
      const updatedUser = {
        ...user,
        ...profileData,
      };

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
