describe('Authentication Logic', () => {
    test('localStorage should store and retrieve access token correctly', () => {
        localStorage.setItem('access_token', 'test-token-123');
        const token = localStorage.getItem('access_token');
        expect(token).toBe('test-token-123');
        
        localStorage.removeItem('access_token');
        expect(localStorage.getItem('access_token')).toBeNull();
    });
});