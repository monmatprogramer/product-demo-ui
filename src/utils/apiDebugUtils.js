// src/utils/apiDebugUtil.js

/**
 * Utility to test API endpoints accessibility
 * This can be used in the browser console to diagnose API issues
 */
export const testApiEndpoints = async () => {
  console.group("🔍 API Connectivity Tests");

  // Core endpoints to test - focus on product endpoints
  const endpoints = [
    { name: "All Products", url: "/api/products", method: "GET" },
    { name: "Single Product", url: "/api/products/1", method: "GET" },
    { name: "Login Endpoint", url: "/api/auth/login", method: "OPTIONS" },
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.name}...`);

      // For GET requests, actually make the request
      if (endpoint.method === "GET") {
        const startTime = performance.now();
        const response = await fetch(endpoint.url);
        const duration = Math.round(performance.now() - startTime);

        console.log(
          `${endpoint.name}: Status ${response.status} (${duration}ms)`
        );

        if (response.ok) {
          console.log(`✅ ${endpoint.name} is accessible!`);
          try {
            const data = await response.json();
            console.log(
              `Data received: ${
                Array.isArray(data)
                  ? `Array with ${data.length} items`
                  : "Object"
              }`
            );
          } catch (e) {
            console.log(`Could not parse response as JSON: ${e.message}`);
          }
        } else {
          console.error(
            `❌ ${endpoint.name} returned error ${response.status}`
          );
        }
      } else {
        // For non-GET methods, just make an OPTIONS request to check CORS
        const response = await fetch(endpoint.url, { method: "OPTIONS" });
        console.log(`${endpoint.name} OPTIONS status: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Error testing ${endpoint.name}:`, error.message);
    }
  }

  console.log("\nTesting authentication state:");
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  console.log(`Token exists: ${!!token}`);
  console.log(`User data exists: ${!!user}`);

  if (user) {
    try {
      const userData = JSON.parse(user);
      console.log(
        `Logged in as: ${userData.username} (${
          userData.isAdmin ? "Admin" : "Regular user"
        })`
      );
    } catch (e) {
      console.log("Error parsing user data");
    }
  }

  console.groupEnd();

  console.log("\n📋 How to fix common issues:");
  console.log(
    "1. If products endpoints return 401, your backend is requiring authentication for products"
  );
  console.log(
    "2. Make sure your backend allows unauthenticated access to /api/products"
  );
  console.log(
    "3. Check setupProxy.js to ensure it's not forwarding auth headers to product endpoints"
  );
  console.log("4. Verify your backend is running at http://54.253.83.201:8080");
};

// You can use this in the browser console by importing and running it:
// import { testApiEndpoints } from './utils/apiDebugUtil.js'; testApiEndpoints();
