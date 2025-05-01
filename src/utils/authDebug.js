// src/utils/authDebug.js

/**
 * Utility function to diagnose authentication issues
 */
export const debugAuth = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const refreshToken = localStorage.getItem('refreshToken');
  
    console.group('📊 Authentication Debug');
    console.log('Token exists:', !!token);
    console.log('User data exists:', !!user);
    console.log('Refresh token exists:', !!refreshToken);
  
    // Check token format if exists
    if (token) {
      try {
        // Basic check if it looks like a JWT (3 parts separated by dots)
        const parts = token.split('.');
        console.log('Token appears to be valid JWT format:', parts.length === 3);
        
        if (parts.length === 3) {
          // Try to decode payload (middle part)
          try {
            const payload = JSON.parse(atob(parts[1]));
            console.log('Token payload:', payload);
            
            // Check expiration
            if (payload.exp) {
              const expDate = new Date(payload.exp * 1000);
              const now = new Date();
              console.log('Token expired:', expDate < now, '(Expires:', expDate.toLocaleString(), ')');
            }
          } catch (e) {
            console.log('Error decoding token payload:', e);
          }
        }
      } catch (e) {
        console.log('Error analyzing token:', e);
      }
    }
  
    // Check user data
    if (user) {
      try {
        const userData = JSON.parse(user);
        console.log('User data:', userData);
        console.log('Has admin role:', userData.isAdmin || userData.role === 'ADMIN');
      } catch (e) {
        console.log('Error parsing user data:', e);
      }
    }
  
    console.groupEnd();
  
    // Return a summary of findings
    return {
      hasToken: !!token,
      hasUser: !!user,
      hasRefreshToken: !!refreshToken,
      tokenValid: token ? token.split('.').length === 3 : false,
      userIsAdmin: user ? (JSON.parse(user).isAdmin || JSON.parse(user).role === 'ADMIN') : false
    };
  };
  
  /**
   * Test the API connection with different auth scenarios
   */
  export const testApiConnection = async () => {
    console.group('📡 API Connection Test');
    
    // Test 1: No auth
    try {
      console.log('Test 1: Fetching products without auth...');
      const noAuthResponse = await fetch('/api/products');
      console.log('Status:', noAuthResponse.status);
      console.log('OK:', noAuthResponse.ok);
      if (!noAuthResponse.ok) {
        const text = await noAuthResponse.text();
        console.log('Error response:', text);
      }
    } catch (e) {
      console.log('Error in no-auth test:', e);
    }
  
    // Test 2: With auth if available
    const token = localStorage.getItem('token');
    if (token) {
      try {
        console.log('Test 2: Fetching products with auth...');
        const authResponse = await fetch('/api/products', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('Status:', authResponse.status);
        console.log('OK:', authResponse.ok);
        if (authResponse.ok) {
          const data = await authResponse.json();
          console.log('Received data items:', data.length);
        } else {
          const text = await authResponse.text();
          console.log('Error response:', text);
        }
      } catch (e) {
        console.log('Error in auth test:', e);
      }
    } else {
      console.log('Test 2: Skipped (no token available)');
    }
  
    // Test 3: Check if server is reachable
    try {
      console.log('Test 3: Basic server connectivity check...');
      const response = await fetch('/api', { method: 'HEAD' });
      console.log('Server reachable:', response.ok);
      console.log('Status:', response.status);
    } catch (e) {
      console.log('Server connectivity error:', e);
      console.log('This could indicate the API server is down or not running at the expected location');
    }
  
    console.groupEnd();
  };