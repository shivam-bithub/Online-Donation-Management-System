// Centralized API configuration
// Change this if your backend is running on a different port or host
const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api',
  BACKEND_URL: 'http://localhost:3000'
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API_CONFIG;
}

