// // src/utils/apiConfig.js

// // The base URL for API requests
// // In development, this will be relative (empty) to work with the proxy
// // In production, this will be the absolute URL of your API
// const API_BASE_URL =
//   process.env.NODE_ENV === "production"
//     ? "http://product-spring-boot-pro-new-env.eba-ghmu6gcw.ap-southeast-2.elasticbeanstalk.com/api"
//     : "/api";

// src/utils/apiConfig.js

/**
 * In production we want every fetch to go to `/api/...`
 * which CloudFront will proxy over HTTPS to your back end.
 */
const API_BASE_URL = '/api';

export default API_BASE_URL;
