// Check if the configuration file has the correct URL
const fs = require('fs');
const path = require('path');


test('Config should have the correct local API URL', () => {
    // Read from the config.js file
    const configPath = path.join(__dirname, '../js/config.js');
    const configContent = fs.readFileSync(configPath, 'utf8');

    // Check if the content contains the expected URL
    expect(configContent).toContain('http://127.0.0.1:8001');
});
