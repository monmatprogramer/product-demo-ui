// src/setupProxy.js
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  const apiUrl = "http://product-spring-boot-pro-new-env.eba-ghmu6gcw.ap-southeast-2.elasticbeanstalk.com";
  console.log(`Setting up API proxy to ${apiUrl}`);

  app.use(
    "/api",
    createProxyMiddleware({
      target: apiUrl,
      changeOrigin: true,
      secure: false, // Accept insecure (HTTP) connections
      pathRewrite: { "^/api": "/api" }, // Keep the /api prefix
      logLevel: "debug",
      // Important: Don't send credentials by default
      withCredentials: false,
      // Handle request setup
      onProxyReq: (proxyReq, req) => {
        // Log the path being proxied
        console.log(`Proxying request: ${req.method} ${req.url}`);
        
        // Don't set Origin header as it might interfere with CORS
        // Instead, let changeOrigin handle this
        
        // Make the URL logging more visible in dev tools
        console.log(`📡 Proxy: ${req.method} ${apiUrl}${req.url}`);
      },
      // Log proxy response activity
      onProxyRes: (proxyRes, req, res) => {
        console.log(
          `📥 API Response: ${req.method} ${req.url} => ${proxyRes.statusCode}`
        );
        
        // Log response headers for debugging
        if (proxyRes.statusCode !== 200) {
          console.log('Response headers:', proxyRes.headers);
        }
      },
      // Handle proxy errors
      onError: (err, req, res) => {
        console.error("❌ Proxy error:", err);

        // Send a structured error response
        res.writeHead(500, {
          "Content-Type": "application/json",
        });

        res.end(
          JSON.stringify({
            message: "Error connecting to API server",
            error: err.message,
            details: {
              url: req.url,
              method: req.method,
              target: apiUrl,
            },
          })
        );
      },
    })
  );
};