// src/setupProxy.js - Updated version for proper API forwarding
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  console.log("Setting up API proxy to http://localhost:8080");
  
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:8080",
      changeOrigin: true,
      // Log all proxy activity
      logLevel: 'debug',
      // Don't add auth header to login/register requests
      pathRewrite: function (path, req) {
        // Keep the path unchanged
        return path;
      },
      // Customize request headers before sending to API server
      onProxyReq: (proxyReq, req) => {
        // Log the path being proxied
        console.log(`Proxying request: ${req.method} ${req.url}`);
        
        // Don't add auth headers to auth endpoints
        if (req.url.includes('/api/auth/login') || req.url.includes('/api/auth/register')) {
          console.log('Auth endpoint detected, not forwarding Authorization header');
          // Remove any existing Authorization header
          proxyReq.removeHeader('Authorization');
        } else if (req.headers.authorization) {
          // For non-auth endpoints, forward Authorization header if present
          proxyReq.setHeader('Authorization', req.headers.authorization);
          console.log('Forwarding Authorization header');
        }
      },
      // Log proxy response activity
      onProxyRes: (proxyRes, req, res) => {
        console.log(`API Response: ${req.method} ${req.url} => ${proxyRes.statusCode}`);
        
        // If we get a 401 on login, log it clearly
        if (req.url.includes('/api/auth/login') && proxyRes.statusCode === 401) {
          console.log('⚠️ LOGIN ENDPOINT RETURNED 401 - Check server config!');
        }
      },
      // Handle proxy errors
      onError: (err, req, res) => {
        console.error("Proxy error:", err);
        
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
              target: "http://localhost:8080"
            }
          })
        );
      },
    })
  );
};