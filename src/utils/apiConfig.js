// src/utils/apiConfig.js

// The base URL for API requests
// In development, this will be relative (empty) to work with the proxy
// In production, this will be the absolute URL of your API
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://product-spring-boot-pro-new-env.eba-ghmu6gcw.ap-southeast-2.elasticbeanstalk.com/api'
  : '/api';

export default API_BASE_URL;