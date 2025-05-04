// src/services/HttpClient.js
import { AuthService } from "./AuthService";

const BASE_URL = "http://54.253.83.201:8080/api";

/**
 * Utility class for making HTTP requests with automatic token handling
 */
export class HttpClient {
  /**
   * Make an authenticated HTTP request
   *
   * @param {string} endpoint - API endpoint path
   * @param {Object} options - Request options
   * @param {boolean} requiresAuth - Whether the request requires authentication
   * @returns {Promise<any>} Response data
   */
  static async request(endpoint, options = {}, requiresAuth = true) {
    // Get the full URL - We use relative URLs to work with the proxy
    // This allows the app to work both in development and production
    const url = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

    // Add authentication headers if required
    if (requiresAuth) {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      // Set authorization header
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    // Set default headers
    options.headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Make the request
    let response;
    try {
      response = await fetch(url, options);
    } catch (error) {
      throw new Error("Network error");
    }

    // Handle 401 Unauthorized (token expired)
    if (response.status === 401 && requiresAuth) {
      // Clear auth data and throw error
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      throw new Error("Session expired. Please login again.");
    }

    // Check if the response is ok (status in the range 200-299)
    if (!response.ok) {
      // Try to get error details from the response
      try {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      } catch (e) {
        // If parsing fails, throw a generic error with the status
        throw new Error(`Error: ${response.status}`);
      }
    }

    // Check for no content
    if (response.status === 204) {
      return null;
    }

    // Parse the response
    try {
      const data = await response.json();
      return data;
    } catch (e) {
      // If the response isn't JSON, return null
      return null;
    }
  }

  /**
   * Make a GET request
   *
   * @param {string} endpoint
   * @param {boolean} requiresAuth
   * @returns {Promise<any>}
   */
  static async get(endpoint, requiresAuth = true) {
    return await this.request(endpoint, { method: "GET" }, requiresAuth);
  }

  /**
   * Make a POST request
   *
   * @param {string} endpoint
   * @param {Object} data
   * @param {boolean} requiresAuth
   * @returns {Promise<any>}
   */
  static async post(endpoint, data, requiresAuth = true) {
    return await this.request(
      endpoint,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      requiresAuth
    );
  }

  /**
   * Make a PUT request
   *
   * @param {string} endpoint
   * @param {Object} data
   * @param {boolean} requiresAuth
   * @returns {Promise<any>}
   */
  static async put(endpoint, data, requiresAuth = true) {
    return await this.request(
      endpoint,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      requiresAuth
    );
  }

  /**
   * Make a DELETE request
   *
   * @param {string} endpoint
   * @param {boolean} requiresAuth
   * @returns {Promise<any>}
   */
  static async delete(endpoint, requiresAuth = true) {
    return await this.request(endpoint, { method: "DELETE" }, requiresAuth);
  }
}
