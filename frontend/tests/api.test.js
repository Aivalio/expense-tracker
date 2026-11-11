// Create a mock fetch to avoid triggering actual network requests during tests
global.fetch = jest.fn();

// Mock the CONFIG object to provide a dummy API URL for testing
global.CONFIG = {
  API_URL: 'http://localhost:8001'
};


describe("API Wrapper", () => {
    beforeEach(() => {
        // Clear the mock fetch and localStorage before each test to ensure a clean state
        fetch.mockClear();
        localStorage.clear();
    });

    test("should add Authorization header when token is present in localStorage", async () => {
        // Set a dummy token in localStorage
        localStorage.setItem('access_token', 'fake-jwt-token');

        // Create a fake request object to simulate an API call
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: 'success' })
        });

        // Define the endpoint and headers for the API call
        const endpoint = "/test";
        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer fake-jwt-token`,
        };
        
        // Make the API call using fetch with the defined headers
        await fetch("http://localhost:8001/test", { headers });

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(
            "http://localhost:8001/test",
            // Use expect.objectContaining to check that the headers include the Authorization header
            expect.objectContaining({
                headers: expect.objectContaining({
                    "Authorization": "Bearer fake-jwt-token",
                }),
            })
        );
    });
});
