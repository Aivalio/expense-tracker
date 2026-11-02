// The local Backend URL
const API_URL = "http:///127.0.0.1:8001";

/** 
 * Helper function to make requests to my API.
 * Responsible for handling the JWT token if it exists
*/

async function fetchAPI(endpoint, options = {}) {
    // Get the JWT token from localStorage
    const token = localStorage.getItem("access_token");

    // Handle & config the headers
    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    // If the token exists, add it to the headers
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    // Make the FastAPI request
    const response = await fetch(`${API_URL}/${endpoint}`, {
        ...options,
        headers,
    });
    
    // If the response is not ok, throw an error
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "An error occurred while fetching the API.");
    }
    return await response.json();
}


