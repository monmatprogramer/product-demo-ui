// src/utils/apiUtils.js
import config from '../config';

/**
 * Formats errors into user-friendly messages.
 */
export function formatApiError(error) {
  if (error.message.includes("401") || error.message.includes("unauthorized")) {
    return "Authentication error: Please log in again.";
  }
  if (error.message.includes("403") || error.message.includes("forbidden")) {
    return "Access denied: You don't have permission to access this resource.";
  }
  if (error.message.includes("500") || error.message.includes("Server error")) {
    return "Server error: Please try again later.";
  }
  return error.message || "An unexpected error occurred. Please try again.";
}

/**
 * Performs a JSON fetch at CloudFront-proxied /api endpoint.
 *   safeJsonFetch("/products")  → GET /api/products  
 */
export async function safeJsonFetch(path, options = {}) {
  // normalize incoming path
  let normalized = path.startsWith('/') ? path : `/${path}`;
  // avoid accidental /api/api duplication
  if (normalized.startsWith('/api/')) {
    normalized = normalized.substring(4);
  }

  // Use centralized config for API URL
  const url = `${config.api.fullUrl()}${normalized}`;
  console.log(`🔗 Fetching ${url}`, options);

  const res = await fetch(url, options);
  if (!res.ok) {
    const ct = res.headers.get('content-type') || '';
    let msg;
    if (ct.includes('application/json')) {
      const body = await res.json().catch(() => ({}));
      msg = body.message || `Server error: ${res.status}`;
    } else {
      const text = await res.text();
      msg = `Server error ${res.status}: ${res.statusText || text.substring(0,100)}`;
    }
    throw new Error(msg);
  }

  if (res.status === 204) return null; // No Content

  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    const txt = await res.text();
    if (!txt) return null;
    try { return JSON.parse(txt); }
    catch { throw new Error(`Non-JSON response: ${txt.substring(0,50)}…`); }
  }

  return res.json();
}