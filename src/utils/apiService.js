// src/utils/apiService.js
export const apiService = {
  /**
   * Base request method for all API calls
   * @param {string} endpoint - API endpoint (without /api prefix)
   * @param {Object} options - Request options
   * @param {boolean} requiresAuth - Whether authentication is required
   * @returns {Promise<any>} - Response data
   */
  async request(endpoint, options = {}, requiresAuth = true) {
    try {
      // Add /api prefix if not present
      const url = endpoint.startsWith("/api") ? endpoint : `/api${endpoint}`;

      // Set default headers
      const headers = {
        "Content-Type": "application/json",
        ...options.headers,
      };

      // Add auth header if required
      if (requiresAuth) {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication required to access this resource");
        }
        headers.Authorization = `Bearer ${token}`;
      }

      // Prepare request options
      const requestOptions = {
        ...options,
        headers,
      };

      // Make request
      const response = await fetch(url, requestOptions);

      // Handle 401 Unauthorized
      if (response.status === 401 && requiresAuth) {
        // Clear invalid credentials
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Throw appropriate error
        throw new Error("Your session has expired. Please log in again.");
      }

      // Handle other errors
      if (!response.ok) {
        // Try to parse error response
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage =
            errorData.message || errorData.error || `Error: ${response.status}`;
        } catch (e) {
          // Fallback to status text if JSON parsing fails
          errorMessage = response.statusText || `Error: ${response.status}`;
        }

        throw new Error(errorMessage);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return null;
      }

      // Parse JSON response
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  },

  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {boolean} requiresAuth - Whether authentication is required
   * @returns {Promise<any>} - Response data
   */
  async get(endpoint, requiresAuth = true) {
    return this.request(endpoint, { method: "GET" }, requiresAuth);
  },

  /**
   * Products API calls - IMPORTANT: Set these to public access (requiresAuth = false)
   */
  products: {
    /**
     * Get all products - PUBLIC ACCESS
     * @returns {Promise<Array>} - Products array
     */
    async getAll() {
      return apiService.get("/products", false);
    },

    /**
     * Get product by ID - PUBLIC ACCESS
     * @param {number} id - Product ID
     * @returns {Promise<Object>} - Product data
     */
    async getById(id) {
      return apiService.get(`/products/${id}`, false);
    },

    /**
     * Create new product (admin only)
     * @param {Object} productData - Product data
     * @returns {Promise<Object>} - Created product
     */
    async create(productData) {
      return apiService.post("/products", productData, true);
    },

    /**
     * Update product (admin only)
     * @param {number} id - Product ID
     * @param {Object} productData - Updated product data
     * @returns {Promise<Object>} - Updated product
     */
    async update(id, productData) {
      return apiService.put(`/products/${id}`, productData, true);
    },

    /**
     * Delete product (admin only)
     * @param {number} id - Product ID
     * @returns {Promise<null>} - Null on success
     */
    async delete(id) {
      return apiService.delete(`/products/${id}`, true);
    },
  },

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {boolean} requiresAuth - Whether authentication is required
   * @returns {Promise<any>} - Response data
   */
  async post(endpoint, data, requiresAuth = true) {
    return this.request(
      endpoint,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      requiresAuth
    );
  },

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {boolean} requiresAuth - Whether authentication is required
   * @returns {Promise<any>} - Response data
   */
  async put(endpoint, data, requiresAuth = true) {
    return this.request(
      endpoint,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      requiresAuth
    );
  },

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @param {boolean} requiresAuth - Whether authentication is required
   * @returns {Promise<any>} - Response data
   */
  async delete(endpoint, requiresAuth = true) {
    return this.request(endpoint, { method: "DELETE" }, requiresAuth);
  },

  /**
   * Authentication API calls
   */
  auth: {
    /**
     * Login user
     * @param {string} username - Username
     * @param {string} password - Password
     * @returns {Promise<Object>} - Auth response with token
     */
    async login(username, password) {
      return apiService.post("/auth/login", { username, password }, false);
    },

    /**
     * Register new user
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} - Registration response
     */
    async register(userData) {
      return apiService.post("/auth/register", userData, false);
    },

    /**
     * Forgot password
     * @param {string} email - Email address
     * @returns {Promise<Object>} - Response
     */
    async forgotPassword(email) {
      return apiService.post("/auth/forgot-password", { email }, false);
    },
  },

  /**
   * User management API calls (admin)
   */
  users: {
    /**
     * Get all users (admin)
     * @returns {Promise<Array>} - Users array
     */
    async getAll() {
      return apiService.get("/admin/users");
    },

    /**
     * Create new user (admin)
     * @param {Object} userData - User data
     * @returns {Promise<Object>} - Created user
     */
    async create(userData) {
      return apiService.post("/admin/users", userData);
    },

    /**
     * Update user (admin)
     * @param {number} id - User ID
     * @param {Object} userData - Updated user data
     * @returns {Promise<Object>} - Updated user
     */
    async update(id, userData) {
      return apiService.put(`/admin/users/${id}`, userData);
    },

    /**
     * Delete user (admin)
     * @param {number} id - User ID
     * @returns {Promise<null>} - Null on success
     */
    async delete(id) {
      return apiService.delete(`/admin/users/${id}`);
    },
  },
};
