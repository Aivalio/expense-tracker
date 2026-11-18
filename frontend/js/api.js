/**
 * Helper function to make requests to the API.
 * Handles JWT authentication, request headers and API responses.
 */
async function fetchAPI(endpoint, options = {}) {
    // Retrieve the JWT token from localStorage
    const token = localStorage.getItem("access_token");

    // Configure request headers
    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    // Add JWT authentication when a token exists
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    // Determine base URL safely
    const baseUrl = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:8001"
    : "https://expense-tracker-api-yyv8.onrender.com";

    // Make the API request
    const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers,
    });

    // Handle responses without a body (HTTP 204)
    if (response.status === 204) {
        return null;
    }

    // Read the response body
    const responseText = await response.text();

    // Parse JSON when possible
    let responseData = null;

    if (responseText) {
        try {
            responseData = JSON.parse(responseText);
        } catch {
            responseData = responseText;
        }
    }

    // Handle unsuccessful responses
    if (!response.ok) {
        const errorMessage =
            typeof responseData === "object" && responseData !== null
                ? responseData.detail || responseData.message
                : responseData;

        throw new Error(
            errorMessage || "An error occurred while fetching the API."
        );
    }

    return responseData;
}

// Export the function for Jest (without affecting browser scripts)
if (typeof module !== "undefined" && module.exports) {
    module.exports = { fetchAPI };
}