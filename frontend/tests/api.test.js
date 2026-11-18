const { fetchAPI } = require('../js/api');

// Mock global fetch
global.fetch = jest.fn();

describe('API Fetch Wrapper', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test('should include Authorization header when token exists in localStorage', async () => {
        localStorage.setItem('access_token', 'mock-jwt-token');
        
        fetch.mockResolvedValueOnce({
            status: 200,
            ok: true,
            text: async () => JSON.stringify({ success: true })
        });

        const data = await fetchAPI('/test-endpoint');
        
        expect(fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                headers: expect.objectContaining({
                    'Authorization': 'Bearer mock-jwt-token',
                    'Content-Type': 'application/json'
                })
            })
        );
        expect(data).toEqual({ success: true });
    });

    test('should throw an error when response is not ok', async () => {
        fetch.mockResolvedValueOnce({
            status: 400,
            ok: false,
            text: async () => JSON.stringify({ detail: 'Invalid request' })
        });

        await expect(fetchAPI('/bad-endpoint')).rejects.toThrow('Invalid request');
    });
});