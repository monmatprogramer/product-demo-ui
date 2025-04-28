// src/utils/apiUtils.js

/**
 * Fetch JSON, but if the response has no body (status 204 or empty), return null
 */
// should be (correct)


export async function safeJsonFetch(input, init) {
    const res = await fetch(input, init);
    if (res.status === 204) return null;
    // some servers don’t set content-length; guard against empty text
    const text = await res.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        // fallback if parsing fails
        return null;
    }
}
