// // src/utils/apiConfig.js

// // The base URL for API requests
// // In development, this will be relative (empty) to work with the proxy
// // In production, this will be the absolute URL of your API
// const API_BASE_URL =
//   process.env.NODE_ENV === "production"
//     ? "http://product-spring-boot-pro-new-env.eba-ghmu6gcw.ap-southeast-2.elasticbeanstalk.com/api"
//     : "/api";

// export default API_BASE_URL;
// src/utils/apiConfig.js

// Always use the relative /api prefix — CloudFront will proxy it to your EB API
const API_BASE_URL =
  "http://product-spring-boot-pro-new-env.eba-ghmu6gcw.ap-southeast-2.elasticbeanstalk.com/api";

export default API_BASE_URL;
