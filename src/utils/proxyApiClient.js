// src/utils/proxyApiClient.js

/**
 * A proxy-based API client that works around CORS and mixed content issues
 * This uses an iframe to proxy requests via an HTML page hosted on the same domain
 */
class ProxyApiClient {
    constructor() {
      this.proxyUrl = 'https://master.d2ji8l5dbhz3ww.amplifyapp.com/proxy.html';
      this.proxyFrame = null;
      this.isReady = false;
      this.pendingRequests = {};
      this.requestId = 1;
      this.initProxy();
    }
  
    /**
     * Initialize the proxy iframe
     */
    initProxy() {
      // Create hidden iframe if it doesn't exist
      if (!this.proxyFrame) {
        console.log('Initializing API proxy iframe...');
        this.proxyFrame = document.createElement('iframe');
        this.proxyFrame.style.display = 'none';
        this.proxyFrame.src = this.proxyUrl;
        document.body.appendChild(this.proxyFrame);
  
        // Listen for messages from the proxy iframe
        window.addEventListener('message', this.handleProxyMessage.bind(this));
      }
    }
  
    /**
     * Handle messages from the proxy iframe
     */
    handleProxyMessage(event) {
      // Verify origin for security
      if (event.origin !== window.location.origin) {
        console.log(`Ignoring message from unknown origin: ${event.origin}`);
        return;
      }
  
      const message = event.data;
  
      // Handle proxy ready message
      if (message.type === 'proxy-ready') {
        console.log('API proxy is ready');
        this.isReady = true;
        return;
      }
  
      // Handle response or error from a request
      if (message.id && this.pendingRequests[message.id]) {
        const { resolve, reject } = this.pendingRequests[message.id];
        
        if (message.type === 'error') {
          reject(new Error(message.error));
        } else if (message.type === 'response') {
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
     * Make a request via the proxy
     */
    async request(endpoint, options = {}) {
      // Wait for proxy to be ready
      if (!this.isReady) {
        await new Promise(resolve => {
          const checkReady = () => {
            if (this.isReady) {
              resolve();
            } else {
              setTimeout(checkReady, 100);
            }
          };
          checkReady();
        });
      }
  
      // Create a promise for this request
      return new Promise((resolve, reject) => {
        const id = this.requestId++;
        this.pendingRequests[id] = { resolve, reject };
  
        // Ensure endpoint starts with /
        const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        
        // Send request to proxy
        this.proxyFrame.contentWindow.postMessage({
          id,
          endpoint: normalizedEndpoint,
          options
        }, this.proxyUrl);
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