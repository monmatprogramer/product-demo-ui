// src/utils/proxyApiClient.js

/**
 * Enhanced proxy-based API client that works around CORS and mixed content issues
 * This uses an iframe to proxy requests via an HTML page hosted on the same domain
 */
class ProxyApiClient {
    constructor() {
      // The URL of your proxy HTML file (must be on the same domain as your app)
      this.proxyUrl = window.location.origin + '/improved-proxy.html';
      this.proxyFrame = null;
      this.isReady = false;
      this.pendingRequests = {};
      this.requestId = 1;
      this.apiAccessible = false;
      this.initializationStarted = false;
    }
  
    /**
     * Initialize the proxy iframe
     */
    initProxy() {
      if (this.initializationStarted) return;
      this.initializationStarted = true;
      
      // Create hidden iframe if it doesn't exist
      console.log('Initializing API proxy iframe...');
      this.proxyFrame = document.createElement('iframe');
      this.proxyFrame.style.display = 'none';
      this.proxyFrame.src = this.proxyUrl;
      document.body.appendChild(this.proxyFrame);
  
      // Listen for messages from the proxy iframe
      window.addEventListener('message', this.handleProxyMessage.bind(this));
      
      // Set a timeout to detect if proxy initialization fails
      setTimeout(() => {
        if (!this.isReady) {
          console.error('Proxy iframe initialization timed out after 10 seconds');
          // Try to reconnect
          this.reconnectProxy();
        }
      }, 10000);
    }
  
    /**
     * Attempt to reconnect the proxy iframe
     */
    reconnectProxy() {
      if (this.proxyFrame) {
        try {
          document.body.removeChild(this.proxyFrame);
        } catch (e) {
          console.error('Error removing proxy iframe:', e);
        }
        this.proxyFrame = null;
      }
      
      this.initializationStarted = false;
      console.log('Attempting to reconnect proxy...');
      setTimeout(() => this.initProxy(), 1000);
    }
  
    /**
     * Handle messages from the proxy iframe
     */
    handleProxyMessage(event) {
      const message = event.data;
      
      // Handle proxy ready message
      if (message.type === 'proxy-ready') {
        console.log('API proxy is ready');
        this.isReady = true;
        this.apiAccessible = message.apiAccessible === true;
        
        if (!this.apiAccessible) {
          console.warn('WARNING: API may not be accessible from the proxy iframe');
        }
        
        // Process any requests that were queued while waiting for proxy
        Object.values(this.pendingRequests).forEach(request => {
          if (request.retry) {
            request.retry();
          }
        });
        
        return;
      }
  
      // Handle response or error from a request
      if (message.id && this.pendingRequests[message.id]) {
        const { resolve, reject } = this.pendingRequests[message.id];
        
        if (message.type === 'error') {
          console.error('Proxy returned error:', message.error);
          reject(new Error(message.error));
        } else if (message.type === 'response') {
          console.log(`Proxy returned status ${message.status} for request #${message.id}`);
          
          if (message.ok) {
            resolve(message.data);
          } else {
            reject(new Error(`API Error: ${message.status}`));
          }
        }
        
        // Clean up
        delete this.pendingRequests[message.id];
      }
    }
  
    /**
     * Ensure the proxy is initialized and ready
     */
    async ensureProxyReady() {
      // Start initialization if not already started
      if (!this.initializationStarted) {
        this.initProxy();
      }
      
      // Wait for proxy to be ready with timeout
      if (!this.isReady) {
        await new Promise((resolve, reject) => {
          const checkReady = () => {
            if (this.isReady) {
              resolve();
            } else {
              setTimeout(checkReady, 100);
            }
          };
          
          // Set timeout for ready check
          const timeout = setTimeout(() => {
            reject(new Error('Proxy initialization timed out'));
          }, 15000);
          
          // Start checking
          checkReady();
          
          // Clear timeout when resolved
          setTimeout(() => clearTimeout(timeout), 15000);
        }).catch(err => {
          console.error('Error waiting for proxy:', err);
          this.reconnectProxy();
          throw new Error('API proxy initialization failed. Please refresh the page and try again.');
        });
      }
      
      return this.isReady;
    }
  
    /**
     * Make a request via the proxy
     */
    async request(endpoint, options = {}) {
      // Make sure proxy is initialized
      try {
        await this.ensureProxyReady();
      } catch (error) {
        console.error('Failed to ensure proxy is ready:', error);
        throw error;
      }
  
      // Ensure endpoint starts with /
      const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const apiPath = normalizedEndpoint.startsWith('/api/') 
        ? normalizedEndpoint 
        : `/api${normalizedEndpoint}`;
      
      // Create a promise for this request
      return new Promise((resolve, reject) => {
        const id = this.requestId++;
        
        // Function to send the actual request to the proxy
        const sendProxyRequest = () => {
          console.log(`Sending request #${id} to proxy for ${apiPath}`);
          
          // Send request to proxy
          try {
            this.proxyFrame.contentWindow.postMessage({
              id,
              endpoint: apiPath,
              options
            }, this.proxyUrl);
          } catch (e) {
            console.error('Error sending message to proxy:', e);
            reject(new Error(`Failed to communicate with API proxy: ${e.message}`));
            delete this.pendingRequests[id];
            return;
          }
          
          // Set a timeout for the request
          const timeoutId = setTimeout(() => {
            console.error(`Request #${id} timed out after 30 seconds`);
            reject(new Error('API request timed out'));
            delete this.pendingRequests[id];
          }, 30000);
          
          // Store the cleanup function
          this.pendingRequests[id].cleanup = () => {
            clearTimeout(timeoutId);
          };
        };
        
        // Store the request handlers and retry function
        this.pendingRequests[id] = {
          resolve: (data) => {
            if (this.pendingRequests[id]?.cleanup) {
              this.pendingRequests[id].cleanup();
            }
            resolve(data);
          },
          reject: (error) => {
            if (this.pendingRequests[id]?.cleanup) {
              this.pendingRequests[id].cleanup();
            }
            reject(error);
          },
          retry: sendProxyRequest
        };
        
        // Send the request
        sendProxyRequest();
      });
    }
  
    /**
     * GET request
     */
    get(endpoint, headers = {}) {
      return this.request(endpoint, {
        method: 'GET',
        headers
      });
    }
  
    /**
     * POST request
     */
    post(endpoint, data, headers = {}) {
      return this.request(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(data)
      });
    }
  
    /**
     * PUT request
     */
    put(endpoint, data, headers = {}) {
      return this.request(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(data)
      });
    }
  
    /**
     * DELETE request
     */
    delete(endpoint, headers = {}) {
      return this.request(endpoint, {
        method: 'DELETE',
        headers
      });
    }
  }
  
  // Create and export a singleton instance
  const proxyApi = new ProxyApiClient();
  export default proxyApi;