// src/utils/apiUtils.js

import proxyApi from './proxyApiClient';

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
 * Fetches JSON data with proper error handling for cross-environment deployments
 * This version uses proxy approach for production
 *
 * @param {string} url - The URL path (without the base URL)
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} - The parsed JSON data or null for empty responses
 * @throws {Error} - If the fetch fails
 */
export async function safeJsonFetch(url, options = {}) {
  // Ensure URL starts with / for consistency
  const normalizedUrl = url.startsWith("/") ? url : `/${url}`;
  
  // Extract path, removing /api prefix if needed
  const apiPath = normalizedUrl.startsWith("/api/") 
    ? normalizedUrl.substring(4) // Remove /api/
    : normalizedUrl;

  try {
    // For production environment, use the iframe proxy
    if (process.env.NODE_ENV === "production") {
      console.log(`Using API proxy for: ${apiPath}`);
      
      // Convert options to proxy format
      const headers = options.headers || {};
      
      // Use appropriate method based on options
      const method = options.method?.toUpperCase() || 'GET';
      
      let result;
      if (method === 'GET') {
        result = await proxyApi.get(apiPath, headers);
      } else if (method === 'POST') {
        // For POST, extract body data
        let data = {};
        if (options.body) {
          try {
            data = JSON.parse(options.body);
          } catch (e) {
            console.error('Error parsing request body:', e);
          }
        }
        result = await proxyApi.post(apiPath, data, headers);
      } else if (method === 'PUT') {
        // For PUT, extract body data
        let data = {};
        if (options.body) {
          try {
            data = JSON.parse(options.body);
          } catch (e) {
            console.error('Error parsing request body:', e);
          }
        }
        result = await proxyApi.put(apiPath, data, headers);
      } else if (method === 'DELETE') {
        result = await proxyApi.delete(apiPath, headers);
      } else {
        throw new Error(`Unsupported method: ${method}`);
      }
      
      return result;
    } 
    // For development, use direct fetch
    else {
      console.log(`Direct API call to: ${normalizedUrl}`);
      const response = await fetch(normalizedUrl, options);
      
      // Handle non-success responses
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Server error: ${response.status}`);
        } else {
          const errorText = await response.text();
          const truncatedError = errorText.substring(0, 150) + (errorText.length > 150 ? "..." : "");
          throw new Error(`Server error ${response.status}: ${response.statusText || truncatedError}`);
        }
      }
      
      // Handle 204 No Content
      if (response.status === 204) {
        return null;
      }
      
      // Parse JSON response
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.warn(`Warning: Expected JSON response but got ${contentType}`);
        
        const text = await response.text();
        if (!text) {
          return null;
        }
        
        try {
          return JSON.parse(text);
        } catch (error) {
          console.error("Failed to parse non-JSON response:", error);
          throw new Error(`Server returned non-JSON response: ${text.substring(0, 50)}...`);
        }
      }
      
      return await response.json();
    }
  } catch (error) {
    console.error(`API request failed: ${apiPath}`, error);
    
    if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
      throw new Error(`Network error: Could not connect to the API server. Check if CORS is enabled on your backend.`);
    }
    
    throw error;
  }
}