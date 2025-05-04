// src/utils/directApiConnector.js

/**
 * Utility to fetch products directly from the API without using the proxy
 * This is a fallback in case the proxy setup isn't working
 */
export const fetchProductsDirect = async () => {
    try {
      console.log('Attempting direct API connection as fallback...');
      
      // Use the full API URL directly
      const apiUrl = 'http://product-spring-boot-pro-new-env.eba-ghmu6gcw.ap-southeast-2.elasticbeanstalk.com/api/products';
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        // Important: This makes the browser include CORS preflight
        mode: 'cors'
      });
      
      if (!response.ok) {
        console.error(`Direct API call failed with status: ${response.status}`);
        return null;
      }
      
      return await response.json();
    } catch (error) {
      console.error('Direct API connection failed:', error);
      return null;
    }
  };