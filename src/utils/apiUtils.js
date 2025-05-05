// src/utils/apiUtils.js - Updated for better error handling and proxy support

/**
 * Formats errors into user-friendly messages.
 */
export function formatApiError(error) {
  if (error.message.includes("401") || error.message.includes("unauthorized")) {
    return "Authentication error: Please log in again.";
  }
  if (error.message.includes("403") || error.message.includes("forbidden")) {
    return "Access denied: You don't have permission to access this resource.";
  }
  if (error.message.includes("500") || error.message.includes("Server error")) {
    return "Server error: Please try again later.";
  }
  if (
    error.message.includes("Failed to fetch") ||
    error.message.includes("NetworkError")
  ) {
    return "Network error: Could not connect to the server. Please check your internet connection and try again.";
  }
  return error.message || "An unexpected error occurred. Please try again.";
}

/**
 * Safely performs a JSON fetch with proper error handling
 * @param {string} path - API endpoint (relative to /api)
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} - JSON response
 */
export async function safeJsonFetch(path, options = {}) {
  // normalize incoming path
  let apiPath = path.startsWith("/") ? path : `/${path}`;
  // avoid accidental /api/api duplication
  if (apiPath.startsWith("/api/")) {
    apiPath = apiPath.substring(4);
  }

  // Use relative URLs which will work with the proxy
  const url = `/api${apiPath}`;
  console.log(`🔗 Fetching ${url}`, options);

  try {
    const res = await fetch(url, options);

    if (!res.ok) {
      const ct = res.headers.get("content-type") || "";
      let msg;

      if (ct.includes("application/json")) {
        try {
          const body = await res.json();
          msg = body.message || `Server error: ${res.status}`;
        } catch {
          msg = `Server error: ${res.status}`;
        }
      } else {
        try {
          const text = await res.text();
          msg = `Server error ${res.status}: ${
            res.statusText || text.substring(0, 100)
          }`;
        } catch {
          msg = `Server error: ${res.status}`;
        }
      }

      throw new Error(msg);
    }

    if (res.status === 204) return null; // No Content

    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      try {
        const txt = await res.text();
        if (!txt) return null;
        try {
          return JSON.parse(txt);
        } catch {
          throw new Error(`Non-JSON response: ${txt.substring(0, 50)}…`);
        }
      } catch (error) {
        console.error("Failed to process non-JSON response:", error);
        throw new Error("Failed to process server response");
      }
    }

    return res.json();
  } catch (error) {
    console.error("API request failed:", error);

    // Enhanced error with more information
    const enhancedError = new Error(error.message);
    enhancedError.originalError = error;
    enhancedError.url = url;
    enhancedError.options = options;

    throw enhancedError;
  }
}

/**
 * Fallback function to use demo data when API is unavailable
 * @param {string} type - Type of demo data ("products", etc.)
 * @returns {Array|Object} Demo data
 */
export function getDemoData(type) {
  const demoData = {
    products: [
      {
        id: 1,
        name: "Gaming Laptop",
        price: 1299.99,
        description: "High performance gaming laptop",
      },
      {
        id: 2,
        name: "Wireless Mouse",
        price: 45.99,
        description: "Ergonomic wireless mouse",
      },
      {
        id: 3,
        name: "Mechanical Keyboard",
        price: 129.5,
        description: "RGB mechanical gaming keyboard",
      },
      {
        id: 4,
        name: "LED Monitor",
        price: 249.99,
        description: "27-inch 4K LED monitor",
      },
      {
        id: 5,
        name: "USB Headset",
        price: 79.99,
        description: "Over-ear USB headset with noise cancellation",
      },
    ],
    users: [
      { id: 1, username: "admin", email: "admin@example.com", role: "ADMIN" },
      { id: 2, username: "user", email: "user@example.com", role: "USER" },
    ],
  };

  return demoData[type] || [];
}
