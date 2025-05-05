// src/utils/corsUtils.js

/**
 * Utility functions to help with CORS issues when accessing the API
 */

/**
 * Fetch data from the API with multiple fallback strategies
 * @param {string} endpoint - API endpoint (no leading /api, e.g. "/products")
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} API response
 */
export const fetchWithCorsHandling = async (endpoint, options = {}) => {
    // Normalize the endpoint
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // List of strategies to try (in order)
    const strategies = [
      { 
        name: 'Direct API call',
        url: `https://d1cpw418nlfxh1.cloudfront.net/api${path}`,
        fetchOptions: {
          ...options,
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers,
          }
        }
      },
      { 
        name: 'Proxy API through Lambda (if deployed)',
        url: `/api${path}`,
        fetchOptions: {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers,
          }
        }
      },
      { 
        name: 'JSONP-like approach (for GET requests only)',
        execute: async () => {
          // Only works for GET requests
          if (options.method && options.method !== 'GET') {
            throw new Error('JSONP approach only works for GET requests');
          }
          
          return new Promise((resolve, reject) => {
            // Create a unique callback name
            const callbackName = 'jsonp_callback_' + Math.random().toString(36).substring(2);
            
            // Add callback to window
            window[callbackName] = (data) => {
              // Clean up
              document.head.removeChild(script);
              delete window[callbackName];
              resolve(data);
            };
            
            // Create script element
            const script = document.createElement('script');
            script.src = `https://d1cpw418nlfxh1.cloudfront.net/api${path}?callback=${callbackName}`;
            
            // Set timeout and error handler
            script.onerror = () => {
              document.head.removeChild(script);
              delete window[callbackName];
              reject(new Error('JSONP request failed'));
            };
            
            // Add to document
            document.head.appendChild(script);
            
            // Set timeout
            setTimeout(() => {
              if (window[callbackName]) {
                document.head.removeChild(script);
                delete window[callbackName];
                reject(new Error('JSONP request timed out'));
              }
            }, 10000);
          });
        }
      }
    ];
    
    // Try each strategy in order
    let lastError = null;
    
    for (const strategy of strategies) {
      try {
        console.log(`Trying API access strategy: ${strategy.name}`);
        
        if (strategy.execute) {
          // Custom execution strategy
          return await strategy.execute();
        } else {
          // Standard fetch strategy
          const response = await fetch(strategy.url, strategy.fetchOptions);
          
          if (!response.ok) {
            throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
          }
          
          // Check for JSON content type
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            return await response.json();
          } else {
            // Try to parse as JSON anyway
            const text = await response.text();
            try {
              return JSON.parse(text);
            } catch (e) {
              throw new Error(`Received non-JSON response: ${text.substring(0, 100)}...`);
            }
          }
        }
      } catch (error) {
        console.warn(`Strategy "${strategy.name}" failed:`, error.message);
        lastError = error;
        // Continue to next strategy
        continue;
      }
    }
    
    // If we get here, all strategies failed
    throw new Error(`All API access strategies failed. Last error: ${lastError?.message}`);
  };
  
  /**
   * Fetch products with CORS handling
   * @returns {Promise<Array>} Products array
   */
  export const fetchProducts = async () => {
    try {
      return await fetchWithCorsHandling('/products');
    } catch (error) {
      console.error('Failed to fetch products:', error);
      
      // Return mock data as last resort
      return [
        {
          id: 1,
          name: "Gaming Laptop",
          price: 1299.99,
          description: "High performance gaming laptop"
        },
        {
          id: 2,
          name: "Wireless Mouse",
          price: 45.99,
          description: "Ergonomic wireless mouse"
        },
        {
          id: 3,
          name: "Mechanical Keyboard",
          price: 129.5,
          description: "RGB mechanical gaming keyboard"
        },
        {
          id: 4,
          name: "LED Monitor",
          price: 249.99,
          description: "27-inch 4K LED monitor"
        },
        {
          id: 5,
          name: "USB Headset",
          price: 79.99,
          description: "Over-ear USB headset with noise cancellation"
        }
      ];
    }
  };
  
  /**
   * Fetch a specific product by ID with CORS handling
   * @param {string|number} id - Product ID
   * @returns {Promise<Object>} Product object
   */
  export const fetchProductById = async (id) => {
    try {
      return await fetchWithCorsHandling(`/products/${id}`);
    } catch (error) {
      console.error(`Failed to fetch product ${id}:`, error);
      
      // Return mock data as last resort - create a product based on ID
      return {
        id: parseInt(id),
        name: `Product ${id}`,
        price: 99.99,
        description: "This is a fallback product description since the API call failed"
      };
    }
  };