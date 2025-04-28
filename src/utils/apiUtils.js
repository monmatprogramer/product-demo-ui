// src/utils/apiUtils.js

/**
 * Fetches JSON data with error handling for empty responses
 * 
 * @param {string} url - The URL to fetch from
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} - The parsed JSON data or null for empty responses
 * @throws {Error} - If the fetch fails
 */
export async function safeJsonFetch(url, options = {}) {
    try {
        const response = await fetch(url, options);
        
        // Handle non-success responses
        if (!response.ok) {
            const errorText = await response.text();
            let errorMessage;
            
            try {
                // Try to parse error as JSON
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.message || `Server error: ${response.status}`;
            } catch {
                // If not JSON, use text or status
                errorMessage = errorText || `Server error: ${response.status}`;
            }
            
            throw new Error(errorMessage);
        }
        
        // Handle 204 No Content
        if (response.status === 204) {
            return null;
        }
        
        // Get response text first
        const text = await response.text();
        
        // Handle empty response
        if (!text) {
            return null;
        }
        
        // Parse JSON
        try {
            return JSON.parse(text);
        } catch (error) {
            console.error("Failed to parse response as JSON:", error);
            throw new Error("Invalid JSON response from server");
        }
    } catch (error) {
        // Log the error and re-throw
        console.error(`API request failed: ${url}`, error);
        throw error;
    }
}

/**
 * Handles API errors in a standardized way
 * 
 * @param {Error} error - The error to format
 * @returns {string} - A user-friendly error message
 */
export function formatApiError(error) {
    return error.message || "An unexpected error occurred. Please try again.";
}