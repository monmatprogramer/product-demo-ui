// src/config.js - Central configuration for the application

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
      // This is the primary setting you'll change when switching environments
      host: "54.253.83.201",
      port: "8080",
      
      // These are computed based on the host and port
      // No need to modify these when changing environments
      baseUrl: function() {
        return `http://${this.host}${this.port ? `:${this.port}` : ""}`;
      },
      
      fullUrl: function() {
        return `${this.baseUrl()}/api`;
      },
      
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
        }
      }
    },
  
    // Environment detection (useful for conditional logic)
    isProduction: process.env.NODE_ENV === "production",
    isDevelopment: process.env.NODE_ENV === "development",
    
    // Alternate API servers (for easy switching in development)
    alternateServers: {
      local: {
        host: "localhost",
        port: "8080"
      },
      staging: {
        host: "staging-api.example.com",
        port: ""  // Empty string for default port (80/443)
      },
      production: {
        host: "54.253.83.201",
        port: "8080"
      }
    },
    
    // Function to easily switch API servers during development
    // Usage: config.setApiServer('local') or config.setApiServer('production')
    setApiServer: function(serverKey) {
      if (this.alternateServers[serverKey]) {
        this.api.host = this.alternateServers[serverKey].host;
        this.api.port = this.alternateServers[serverKey].port;
        console.log(`API server switched to ${serverKey}: ${this.api.baseUrl()}`);
        return true;
      } else {
        console.error(`Unknown server key: ${serverKey}`);
        return false;
      }
    }
  };
  
  // Export the configuration
  export default config;