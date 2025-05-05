// src/config.js - Updated with proper configuration

/**
 * Application configuration with environment-specific settings
 */
const config = {
  // Base configuration (shared across environments)
  app: {
    name: "Computer Store",
    version: "1.0.0",
  },

  // API configuration
  api: {
    // Using relative URLs for API endpoints which will work with the proxy
    baseUrl: "/api",

    // For convenience, access specific endpoints
    endpoints: {
      products: "/products",
      auth: {
        login: "/auth/login",
        register: "/auth/register",
      },
      admin: {
        users: "/admin/users",
        dashboard: "/admin/dashboard",
      },
    },

    // Backend URL for direct connections (only for debugging)
    backendUrl: "https://d1cpw418nlfxh1.cloudfront.net",
  },

  // Environment detection
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",

  // Demo data for fallback when API is unavailable
  demoData: {
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
  },
};

// Export the configuration
export default config;
