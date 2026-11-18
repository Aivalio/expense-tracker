// frontend/js/config.js
const CONFIG = {
    API_URL: window.ENV_API_URL || "http://127.0.0.1:8001"
};

if (typeof module !== "undefined" && module.exports) {
    module.exports = { CONFIG };
}