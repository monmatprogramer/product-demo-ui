// src/utils/directFetch.js

/**
 * Alternative approach for accessing the API
 * This file uses techniques that might work in some situations
 * where the proxy approach fails
 */

const API_BASE_URL = 'http://product-spring-boot-pro-new-env.eba-ghmu6gcw.ap-southeast-2.elasticbeanstalk.com';

/**
 * Attempt to fetch data directly from API using various techniques
 * @param {string} endpoint - API endpoint (with or without leading slash)
 * @returns {Promise<any>} - API response
 */
export async function directFetch(endpoint) {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${path}`;
  
  console.log(`Attempting direct fetch from: ${url}`);
  
  // Try multiple approaches in sequence
  try {
    // Approach 1: Standard fetch with CORS mode
    try {
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log('Standard CORS fetch succeeded');
        return await response.json();
      }
    } catch (e) {
      console.log('Standard CORS fetch failed:', e.message);
    }
    
    // Approach 2: XMLHttpRequest with custom headers
    try {
      const data = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              try {
                resolve(JSON.parse(xhr.responseText));
              } catch (e) {
                reject(new Error('Failed to parse response as JSON'));
              }
            } else {
              reject(new Error(`Request failed with status: ${xhr.status}`));
            }
          }
        };
        xhr.onerror = function() {
          reject(new Error('Network error during XHR request'));
        };
        xhr.send();
      });
      
      console.log('XMLHttpRequest succeeded');
      return data;
    } catch (e) {
      console.log('XMLHttpRequest failed:', e.message);
    }
    
    // Approach 3: JSONP-like approach (only works if API supports it)
    try {
      const data = await new Promise((resolve, reject) => {
        // Generate a unique callback name
        const callbackName = 'jsonpCallback_' + Math.random().toString(36).substring(2, 15);
        
        // Create global callback function
        window[callbackName] = function(data) {
          delete window[callbackName]; // Clean up
          document.head.removeChild(script); // Remove script tag
          resolve(data);
        };
        
        // Create script element
        const script = document.createElement('script');
        script.src = `${url}${url.includes('?') ? '&' : '?'}callback=${callbackName}`;
        
        // Handle errors
        script.onerror = function() {
          delete window[callbackName];
          document.head.removeChild(script);
          reject(new Error('JSONP request failed'));
        };
        
        // Set timeout
        const timeoutId = setTimeout(() => {
          delete window[callbackName];
          document.head.removeChild(script);
          reject(new Error('JSONP request timed out'));
        }, 10000);
        
        // Add script to document to start request
        document.head.appendChild(script);
      });
      
      console.log('JSONP-like approach succeeded');
      return data;
    } catch (e) {
      console.log('JSONP-like approach failed:', e.message);
    }
    
    // If all approaches fail, throw error
    throw new Error('All direct fetch approaches failed');
  } catch (error) {
    console.error('All direct fetch approaches failed:', error);
    throw error;
  }
}

/**
 * Get all products
 */
export async function getProducts() {
  return directFetch('/api/products');
}

/**
 * Get product by ID
 * @param {number|string} id - Product ID
 */
export async function getProduct(id) {
  return directFetch(`/api/products/${id}`);
}

export default {
  getProducts,
  getProduct,
  directFetch
};