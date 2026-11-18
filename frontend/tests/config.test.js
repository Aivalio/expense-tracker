// Config test to ensure the local API URL is set correctly in the config.js file
const fs = require('fs');
const path = require('path');

test('Config should have the correct local API URL', () => {
    const configPath = path.join(__dirname, '../js/config.js');
    const configContent = fs.readFileSync(configPath, 'utf8');

    expect(configContent).toContain('127.0.0.1');
});