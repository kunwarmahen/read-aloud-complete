// Configuration for Read Aloud Cloud Extension

const CONFIG = {
  // API Base URL - change this to your deployed API URL
  API_URL: 'http://localhost:8000',
  
  // TTS Server URL (for local playback)
  TTS_URL: 'http://localhost:5000',
  
  // Storage keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'readaloud_auth_token',
    USER_EMAIL: 'readaloud_user_email',
    USER_NAME: 'readaloud_user_name',
    LAST_SYNC: 'readaloud_last_sync'
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
