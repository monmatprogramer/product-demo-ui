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
      logLevel: "debug",
      // Fix CORS issues by setting these headers
      onProxyReq: (proxyReq, req) => {
        // Log the path being proxied
        console.log(`Proxying request: ${req.method} ${req.url}`);

        // Set custom headers if needed
        proxyReq.setHeader('Origin', apiUrl);
      },
      // Log proxy response activity
      onProxyRes: (proxyRes, req, res) => {
        console.log(
          `API Response: ${req.method} ${req.url} => ${proxyRes.statusCode}`
        );
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