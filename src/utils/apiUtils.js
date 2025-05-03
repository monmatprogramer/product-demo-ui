// apiUtils.js - Frontend utility to handle API requests

// Base API URL - automatically adjusts based on the frontend protocol
const API_BASE_URL = (() => {
  const apiDomain =
    "product-spring-boot-pro-new-env.eba-ghmu6gcw.ap-southeast-2.elasticbeanstalk.com";

  // If frontend is on HTTPS but backend only supports HTTP, you need a proxy
  // For now, we'll keep using HTTP but this should be addressed for production
  return `http://${apiDomain}`;
})();

// Helper function to handle API calls
async function callApi(endpoint, options = {}) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;

    // Default options
    const defaultOptions = {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // For cookies if used
      mode: "cors", // Explicitly set CORS mode
    };

    // Add authorization header if token exists
    const token = localStorage.getItem("token");
    if (token) {
      defaultOptions.headers["Authorization"] = `Bearer ${token}`;
    }

    // Merge options
    const fetchOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...(options.headers || {}),
      },
    };

    console.log(`Fetching from: ${url}`);
    const response = await fetch(url, fetchOptions);

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();

      // If response is not ok, throw error with response data
      if (!response.ok) {
        throw new Error(data.error || "API request failed");
      }

      return data;
    } else {
      // Handle non-JSON responses
      if (!response.ok) {
        throw new Error("API request failed");
      }

      return await response.text();
    }
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
}

// API helper functions
const api = {
  // Products
  fetchProducts: () => callApi("/api/products"),
  getProduct: (id) => callApi(`/api/products/${id}`),
  createProduct: (data) =>
    callApi("/api/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateProduct: (id, data) =>
    callApi(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteProduct: (id) =>
    callApi(`/api/products/${id}`, {
      method: "DELETE",
    }),

  // Authentication
  login: (credentials) =>
    callApi("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),
  register: (userData) =>
    callApi("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),
  refreshToken: (refreshToken) =>
    callApi("/api/auth/refresh-token", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),
  logout: () => callApi("/api/auth/logout", { method: "POST" }),

  // User management
  getCurrentUser: () => callApi("/api/access/current-user"),
  checkAdmin: () => callApi("/api/access/check-admin"),

  // Testing CORS
  testCors: () => callApi("/api/cors-test"),
};

export default api;
