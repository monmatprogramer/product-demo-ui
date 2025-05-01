// src/setupProxy.js
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:8080",
      changeOrigin: true,
      // Preserve authorization headers
      onProxyReq: (proxyReq, req) => {
        if (req.headers.authorization) {
          proxyReq.setHeader("Authorization", req.headers.authorization);
        }
      },
      // Log proxy activity for debugging
      onProxyRes: (proxyRes, req, res) => {
        console.log(
          `[Proxy] ${req.method} ${req.url} => ${proxyRes.statusCode}`
        );
      },
      // Handle proxy errors
      onError: (err, req, res) => {
        console.error("Proxy error:", err);
        res.writeHead(500, {
          "Content-Type": "application/json",
        });
        res.end(
          JSON.stringify({
            message: "Error connecting to API server",
            error: err.message,
          })
        );
      },
    })
  );
};
