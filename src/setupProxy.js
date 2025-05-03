// src/setupProxy.js
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  const apiUrl =
    "http://product-spring-boot-pro-new-env.eba-ghmu6gcw.ap-southeast-2.elasticbeanstalk.com/api/products";
  console.log(`Setting up API proxy to ${apiUrl}`);

  app.use(
    "/api",
    createProxyMiddleware({
      target: apiUrl,
      changeOrigin: true,
      logLevel: "debug",
      pathRewrite: function (path, req) {
        // Keep the path unchanged
        return path;
      },
      // Customize request headers before sending to API server
      onProxyReq: (proxyReq, req) => {
        // Log the path being proxied
        console.log(`Proxying request: ${req.method} ${req.url}`);

        // Don't add auth headers to public endpoints - products should be public!
        if (
          req.url.includes("/api/auth/login") ||
          req.url.includes("/api/auth/register") ||
          req.url.includes("/api/products")
        ) {
          console.log(
            "Public endpoint detected, not forwarding Authorization header"
          );
          // Remove any existing Authorization header
          proxyReq.removeHeader("Authorization");
        } else if (req.headers.authorization) {
          // For auth-required endpoints, forward Authorization header if present
          proxyReq.setHeader("Authorization", req.headers.authorization);
          console.log("Forwarding Authorization header");
        }
      },
      // Log proxy response activity
      onProxyRes: (proxyRes, req, res) => {
        console.log(
          `API Response: ${req.method} ${req.url} => ${proxyRes.statusCode}`
        );

        // If we get a 401 on login, log it clearly
        if (
          req.url.includes("/api/auth/login") &&
          proxyRes.statusCode === 401
        ) {
          console.log("⚠️ LOGIN ENDPOINT RETURNED 401 - Check server config!");
        }

        // If we get a 401 on products, that's a problem
        if (req.url.includes("/api/products") && proxyRes.statusCode === 401) {
          console.log(
            "⚠️ PRODUCTS ENDPOINT RETURNED 401 - Products should be public!"
          );
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
              target: apiUrl,
            },
          })
        );
      },
    })
  );
};
