// src/setupProxy.js - Updated to fix CORS issues
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  // The API URL where your backend is hosted
  const apiUrl = "https://d1cpw418nlfxh1.cloudfront.net";
  console.log(`Setting up API proxy to ${apiUrl}`);

  app.use(
    "/api",
    createProxyMiddleware({
      target: apiUrl,
      changeOrigin: true,
      secure: false, // Accept insecure (HTTP) connections
      pathRewrite: { "^/api": "" }, // Important: Remove the /api prefix for backend
      logLevel: "debug",
      // Important: Don't send credentials by default
      withCredentials: false,
      // Handle request setup
      onProxyReq: (proxyReq, req) => {
        // Log the path being proxied
        console.log(`Proxying request: ${req.method} ${req.url}`);

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
          console.log("Response headers:", proxyRes.headers);
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
