// src/utils/apiDebugHelper.js

/**
 * Utility to diagnose API connection issues
 * Run this in your browser console to debug API problems
 */
export const debugApiConnection = async () => {
  console.group("🔍 API Connection Debug");

  // Test the direct API call
  try {
    console.log("Testing direct API connection to CloudFront...");
    const directResponse = await fetch(
      "https://d1cpw418nlfxh1.cloudfront.net/api/products",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        mode: "cors",
      }
    );

    console.log("Direct API response status:", directResponse.status);
    console.log("Direct API response OK:", directResponse.ok);

    if (directResponse.ok) {
      try {
        const contentType = directResponse.headers.get("content-type");
        console.log("Content-Type:", contentType);

        if (contentType && contentType.includes("application/json")) {
          const data = await directResponse.json();
          console.log("Direct API data received:", data);
        } else {
          const text = await directResponse.text();
          console.log("Direct API non-JSON response:", text.substring(0, 200));
        }
      } catch (e) {
        console.error("Error parsing direct API response:", e);
      }
    }
  } catch (e) {
    console.error("Direct API connection failed:", e);
  }

  // Test the proxied API call
  try {
    console.log("\nTesting proxied API connection...");
    const proxiedResponse = await fetch("/api/products");

    console.log("Proxied API response status:", proxiedResponse.status);
    console.log("Proxied API response OK:", proxiedResponse.ok);

    if (proxiedResponse.ok) {
      try {
        const contentType = proxiedResponse.headers.get("content-type");
        console.log("Content-Type:", contentType);

        if (contentType && contentType.includes("application/json")) {
          const data = await proxiedResponse.json();
          console.log("Proxied API data received:", data);
        } else {
          const text = await proxiedResponse.text();
          console.log("Proxied API non-JSON response:", text.substring(0, 200));
        }
      } catch (e) {
        console.error("Error parsing proxied API response:", e);
      }
    }
  } catch (e) {
    console.error("Proxied API connection failed:", e);
  }

  console.groupEnd();

  return "API debugging complete. Check console for results.";
};

// To use this function, import it and call it in your browser console:
// import { debugApiConnection } from './utils/apiDebugHelper'; debugApiConnection();
