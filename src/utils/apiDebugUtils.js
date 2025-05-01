// src/utils/apiDebugUtil.js

/**
 * Enhanced fetch function with debugging
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} - Response 
 */
export const debugFetch = async (url, options = {}) => {
  const startTime = performance.now();
  console.group(`🌐 API Request: ${options.method || 'GET'} ${url}`);
  
  // Log request details
  console.log('Request Options:', {
    ...options,
    headers: options.headers || {}
  });
  
  if (options.body) {
    try {
      console.log('Request Body:', typeof options.body === 'string' 
        ? JSON.parse(options.body) 
        : options.body);
    } catch (e) {
      console.log('Request Body (raw):', options.body);
    }
  }
  
  try {
    // Make the actual request
    const response = await fetch(url, options);
    const duration = Math.round(performance.now() - startTime);
    
    // Log basic response info
    console.log(`Response received in ${duration}ms - Status: ${response.status} ${response.statusText}`);
    console.log('Response Headers:', Object.fromEntries([...response.headers]));
    
    // Clone response so we can still use it after reading
    const clonedResponse = response.clone();
    
    // Try to log response body
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await clonedResponse.json();
        console.log('Response JSON:', data);
      } else {
        const text = await clonedResponse.text();
        console.log('Response Text:', text.length > 1000 
          ? text.substring(0, 1000) + '... (truncated)' 
          : text);
      }
    } catch (e) {
      console.log('Could not parse response body:', e.message);
    }
    
    console.groupEnd();
    return response;
  } catch (error) {
    console.error('⚠️ Fetch Error:', error);
    console.groupEnd();
    throw error;
  }
};

/**
 * Test API endpoints for connectivity
 */
export const testApiEndpoints = async () => {
  console.group('🔍 API Connectivity Tests');
  
  // Tests to run
  const tests = [
    { name: 'Products API', url: '/api/products', method: 'GET' },
    { name: 'Login API', url: '/api/auth/login', method: 'POST', 
      body: { username: 'test', password: 'test' } },
    { name: 'Register API', url: '/api/auth/register', method: 'POST', 
      body: { username: 'testuser', password: 'testpass', email: 'test@example.com' } }
  ];
  
  // Run tests
  for (const test of tests) {
    try {
      console.log(`Testing ${test.name}...`);
      
      const options = {
        method: test.method,
        headers: { 'Content-Type': 'application/json' }
      };
      
      if (test.body) {
        options.body = JSON.stringify(test.body);
      }
      
      // Just make an OPTIONS request to check if endpoint exists
      const optionsResponse = await fetch(test.url, { method: 'OPTIONS' });
      console.log(`${test.name} OPTIONS status:`, optionsResponse.status);
      
      // Log the result
      console.log(`${test.name}: ${optionsResponse.ok ? '✅ Available' : '❌ Not available'}`);
    } catch (e) {
      console.error(`${test.name}: ❌ Error - ${e.message}`);
    }
  }
  
  console.groupEnd();
};