// src/utils/apiDebugUtils.js

/**
 * Enhanced fetch function with better error handling and debugging
 * 
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} - Response data
 */
export const debugFetch = async (url, options = {}) => {
    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
    
    if (options.body) {
      console.log('📦 Request Payload:', JSON.parse(options.body));
    }
    
    if (options.headers) {
      console.log('🔑 Request Headers:', options.headers);
    }
    
    try {
      const response = await fetch(url, options);
      
      console.log(`📥 Response Status:`, response.status, response.statusText);
      
      // Try to get response headers
      console.log('📥 Response Headers:', Object.fromEntries([...response.headers]));
      
      // Clone the response so we can read it twice
      const clonedResponse = response.clone();
      
      try {
        // Try to parse as JSON first
        const responseData = await clonedResponse.json();
        console.log('📥 Response Data:', responseData);
        
        // Check if it's an error response
        if (!response.ok) {
          const errorMessage = responseData.message || `Error ${response.status}: ${response.statusText}`;
          throw new Error(errorMessage);
        }
        
        return responseData;
      } catch (jsonError) {
        // If JSON parsing fails, try to get text
        const responseText = await response.text();
        console.log('📥 Response Text:', responseText);
        
        if (!response.ok) {
          throw new Error(responseText || `Error ${response.status}: ${response.statusText}`);
        }
        
        return responseText;
      }
    } catch (error) {
      console.error('❌ Fetch Error:', error);
      throw error;
    }
  };
  
  /**
   * Helper function to check CORS configuration issues
   * 
   * @param {string} url - URL to test
   * @returns {Promise<Object>} - Test results
   */
  export const testCORS = async (url) => {
    try {
      // Test preflight request
      const optionsResponse = await fetch(url, { 
        method: 'OPTIONS',
        headers: { 'Origin': window.location.origin }
      });
      
      // Check CORS headers
      const corsHeaders = {
        'Access-Control-Allow-Origin': optionsResponse.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': optionsResponse.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': optionsResponse.headers.get('Access-Control-Allow-Headers'),
        'Access-Control-Allow-Credentials': optionsResponse.headers.get('Access-Control-Allow-Credentials')
      };
      
      console.log('🔍 CORS Test Results:', corsHeaders);
      
      const origin = corsHeaders['Access-Control-Allow-Origin'];
      let originResult = 'FAILED';
      if (origin === '*') {
        originResult = 'OK (allows all origins)';
      } else if (origin && origin.includes(window.location.origin)) {
        originResult = 'OK (allows this origin)';
      }
      
      return {
        url,
        success: !!corsHeaders['Access-Control-Allow-Origin'],
        details: corsHeaders,
        originAccess: originResult,
        methodsAllowed: corsHeaders['Access-Control-Allow-Methods'] || 'Not specified',
        headersAllowed: corsHeaders['Access-Control-Allow-Headers'] || 'Not specified',
        credentialsAllowed: corsHeaders['Access-Control-Allow-Credentials'] === 'true'
      };
    } catch (error) {
      console.error('🔍 CORS Test Error:', error);
      return {
        url,
        success: false,
        error: error.message
      };
    }
  };
  
  /**
   * Check if a token is formatted as a valid JWT
   * Note: This only checks format, not cryptographic validity
   * 
   * @param {string} token - Token to check
   * @returns {Object} - Validation result
   */
  export const validateTokenFormat = (token) => {
    if (!token) {
      return { valid: false, reason: 'Token is missing' };
    }
    
    // Check if it has JWT format (three parts separated by dots)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { valid: false, reason: 'Not a valid JWT format (should have 3 parts separated by dots)' };
    }
    
    try {
      // Try to decode the middle part (payload)
      const payload = JSON.parse(atob(parts[1]));
      
      // Check for expiration
      if (payload.exp) {
        const expirationDate = new Date(payload.exp * 1000);
        const now = new Date();
        
        if (expirationDate < now) {
          return { 
            valid: false, 
            reason: 'Token has expired', 
            expiry: expirationDate.toLocaleString(),
            payload 
          };
        }
      }
      
      return { 
        valid: true, 
        payload,
        expiry: payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'No expiration'
      };
    } catch (e) {
      return { valid: false, reason: 'Failed to decode token payload', error: e.message };
    }
  };
  
  /**
   * Debug helper for authentication issues
   */
  export const debugAuth = () => {
    // Check for token
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const refreshToken = localStorage.getItem('refreshToken');
    
    console.group('🔐 Authentication Debug Info');
    
    console.log('Token exists:', !!token);
    if (token) {
      const tokenValidation = validateTokenFormat(token);
      console.log('Token format:', tokenValidation.valid ? '✅ Valid' : '❌ Invalid');
      console.log('Token details:', tokenValidation);
    }
    
    console.log('User data exists:', !!user);
    if (user) {
      try {
        const userData = JSON.parse(user);
        console.log('User data:', userData);
      } catch (e) {
        console.log('Failed to parse user data:', e);
      }
    }
    
    console.log('Refresh token exists:', !!refreshToken);
    if (refreshToken) {
      const refreshTokenValidation = validateTokenFormat(refreshToken);
      console.log('Refresh token format:', refreshTokenValidation.valid ? '✅ Valid' : '❌ Invalid');
    }
    
    console.groupEnd();
    
    return {
      hasToken: !!token,
      hasUser: !!user,
      hasRefreshToken: !!refreshToken,
      tokenValid: token ? validateTokenFormat(token).valid : false
    };
  };