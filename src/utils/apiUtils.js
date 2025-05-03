// src/utils/apiUtils.js

/**
 * Fetches JSON data with proper error handling for cross-environment deployments
 *
 * @param {string} url - The URL path (without the base URL)
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} - The parsed JSON data or null for empty responses
 * @throws {Error} - If the fetch fails
 */
export async function safeJsonFetch(url, options = {}) {
    // Ensure URL starts with / for consistency
    const normalizedUrl = url.startsWith("/") ? url : `/${url}`;
    
    try {
      console.log(`Fetching data from: ${normalizedUrl}`);
  
      const response = await fetch(normalizedUrl, {
        ...options,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...options.headers,
        },
      });
  
      // Log response details for debugging
      console.log(`Response status: ${response.status} ${response.statusText}`);
  
      // Handle non-success responses
      if (!response.ok) {
        // Check content type to better handle errors
        const contentType = response.headers.get("content-type");
  
        if (contentType && contentType.includes("application/json")) {
          // If JSON error response
          const errorData = await response.json();
          throw new Error(
            errorData.message || `Server error: ${response.status}`
          );
        } else {
          // If non-JSON error (like HTML)
          const errorText = await response.text();
          // Only show the first part of error text to avoid huge HTML responses
          const truncatedError =
            errorText.substring(0, 150) + (errorText.length > 150 ? "..." : "");
          throw new Error(
            `Server error ${response.status}: ${response.statusText || truncatedError}`
          );
        }
      }
  
      // Handle 204 No Content
      if (response.status === 204) {
        return null;
      }
  
      // Check if response is empty
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.warn(`Warning: Expected JSON response but got ${contentType}`);
  
        // Try to read text response
        const text = await response.text();
        if (!text) {
          return null;
        }
  
        // Check if it's JSON anyway
        try {
          return JSON.parse(text);
        } catch (error) {
          console.error("Failed to parse non-JSON response:", error);
          throw new Error(
            `Server returned non-JSON response: ${text.substring(0, 50)}...`
          );
        }
      }
  
      // Parse JSON response normally
      return await response.json();
    } catch (error) {
      // Log details of the error
      console.error(`API request failed: ${normalizedUrl}`, error);
  
      // Enhance error message for common deployment issues
      if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError")
      ) {
        throw new Error(
          `Network error: Could not connect to the API server. Check if CORS is enabled on your backend.`
        );
      }
  
      // If it's a more specific error from our code above, pass it through
      throw error;
    }
  }
  
  /**
   * Handles API errors in a standardized way
   *
   * @param {Error} error - The error to format
   * @returns {string} - A user-friendly error message
   */
  export function formatApiError(error) {
    // Special handling for auth errors
    if (error.message.includes("401") || error.message.includes("unauthorized")) {
      return "Authentication error: Please log in again.";
    }
  
    // Special handling for forbidden access
    if (error.message.includes("403") || error.message.includes("forbidden")) {
      return "Access denied: You don't have permission to access this resource.";
    }
  
    // Special handling for server errors
    if (error.message.includes("500") || error.message.includes("Server error")) {
      return "Server error: The server encountered an issue. Please try again later.";
    }
  
    // Special handling for CORS errors
    if (error.message.includes("CORS")) {
      return "CORS error: The API server isn't configured to accept requests from this domain.";
    }
  
    // Default error message
    return error.message || "An unexpected error occurred. Please try again.";
  }
  
  /**
   * Helper function to test API connection
   * Useful for debugging deployment issues
   */
  export async function testApiConnection() {
    console.group("🔍 API Connection Test");
  
    try {
      console.log(`Testing connection to API at: /api/products`);
  
      // Make request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
  
      const response = await fetch('/api/products', {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });
  
      clearTimeout(timeoutId);
  
      console.log(`Response status: ${response.status} ${response.statusText}`);
      console.log(`Response type: ${response.headers.get("content-type")}`);
  
      if (response.ok) {
        console.log("✅ API connection successful!");
  
        // Check response type
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          console.log(
            `Received ${Array.isArray(data) ? data.length : "non-array"} response`
          );
        } else {
          console.warn(`⚠️ Response is not JSON: ${contentType}`);
          const text = await response.text();
          console.log(`Response preview: ${text.substring(0, 100)}...`);
        }
      } else {
        console.error("❌ API request failed with status:", response.status);
      }
    } catch (error) {
      console.error("❌ API connection test failed:", error);
  
      if (error.name === "AbortError") {
        console.error("Request timed out after 10 seconds");
      }
    }
  
    console.groupEnd();
  }