// src/utils/apiService.js - Updated for Amplify deployment

/**
 * Determines the correct API URL based on environment
 * @returns {string} The base API URL
 */
export const getApiBaseUrl = () => {
  // First try environment variable (production build)
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }

  // In development, we'll use the proxy set up in setupProxy.js
  if (process.env.NODE_ENV === "development") {
    return "/api";
  }

  // Fallback to CloudFront URL
  return "https://d1cpw418nlfxh1.cloudfront.net/api";
};

/**
 * Handles API response errors
 * @param {Response} response - The fetch response
 * @returns {Promise} - Resolves with the JSON data or rejects with error
 */
export const handleApiResponse = async (response) => {
  // Check if the response is OK (status in the range 200-299)
  if (!response.ok) {
    // Try to extract error details from the response
    let errorMessage;
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || `Error: ${response.status}`;
      } catch {
        errorMessage = `Error: ${response.status}`;
      }
    } else {
      // Handle non-JSON responses (like HTML)
      const text = await response.text();
      errorMessage = `API Error: ${response.status} - Non-JSON response received`;
      console.error("API returned non-JSON format:", text.substring(0, 150)); // Log a preview of the response
    }

    throw new Error(errorMessage);
  }

  // Handle no content response
  if (response.status === 204) {
    return null;
  }

  // Check content type before parsing JSON
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error("Expected JSON response but got another format");
  }

  // Parse the JSON response
  return await response.json();
};

export const apiService = {
  /**
   * Makes an API request with improved error handling
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Request options
   * @param {boolean} requiresAuth - Whether auth is required
   * @returns {Promise<any>} Response data
   */
  async request(endpoint, options = {}, requiresAuth = true) {
    try {
      // Normalize the endpoint
      const normalizedEndpoint = endpoint.startsWith("/")
        ? endpoint
        : `/${endpoint}`;

      // Get the base URL
      const baseUrl = getApiBaseUrl();

      // Construct full URL, handling various formats
      const url = normalizedEndpoint.startsWith("/api/")
        ? `${baseUrl.replace(/\/api\/?$/, "")}${normalizedEndpoint}`
        : `${baseUrl}${normalizedEndpoint}`;

      // Set default headers
      const headers = {
        "Content-Type": "application/json",
        ...options.headers,
      };

      // Add authorization header if required
      if (requiresAuth) {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication required for this request");
        }
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Create request options
      const requestOptions = {
        ...options,
        headers,
      };

      console.log(`Fetching: ${url}`);

      // Make the request
      const response = await fetch(url, requestOptions);

      // Process the response
      return await handleApiResponse(response);
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  },

  // GET request
  async get(endpoint, requiresAuth = true) {
    return this.request(endpoint, { method: "GET" }, requiresAuth);
  },

  // POST request
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

  // PUT request
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

  // DELETE request
  async delete(endpoint, requiresAuth = true) {
    return this.request(endpoint, { method: "DELETE" }, requiresAuth);
  },
};

export default apiService;
