// Authentication Manager for Read Aloud Cloud
// All API calls go through background.js

class AuthManager {
  constructor() {
    this.token = null;
    this.userEmail = null;
    this.userName = null;
  }

  async initialize() {
    const data = await chrome.storage.local.get([
      CONFIG.STORAGE_KEYS.AUTH_TOKEN,
      CONFIG.STORAGE_KEYS.USER_EMAIL,
      CONFIG.STORAGE_KEYS.USER_NAME,
    ]);

    this.token = data[CONFIG.STORAGE_KEYS.AUTH_TOKEN];
    this.userEmail = data[CONFIG.STORAGE_KEYS.USER_EMAIL];
    this.userName = data[CONFIG.STORAGE_KEYS.USER_NAME];

    return this.isAuthenticated();
  }

  isAuthenticated() {
    return !!this.token;
  }

  getToken() {
    return this.token;
  }

  getUserInfo() {
    return {
      email: this.userEmail,
      name: this.userName,
    };
  }

  async login(email, password) {
    try {
      const response = await chrome.runtime.sendMessage({
        action: "authLogin",  // ✅ Changed from auth_login
        email,
        password,
      });

      if (!response.success) {
        throw new Error(response.error || "Login failed");
      }

      this.token = response.token;
      this.userEmail = email;

      // Get user info
      const userInfoResponse = await chrome.runtime.sendMessage({
        action: "authGetMe",  // ✅ Changed from auth_getMe
        token: this.token,
      });

      if (userInfoResponse.success) {
        this.userName = userInfoResponse.user.name;
      }

      // Save to storage
      await chrome.storage.local.set({
        [CONFIG.STORAGE_KEYS.AUTH_TOKEN]: this.token,
        [CONFIG.STORAGE_KEYS.USER_EMAIL]: this.userEmail,
        [CONFIG.STORAGE_KEYS.USER_NAME]: this.userName,
      });

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.message };
    }
  }

  async register(email, password, name) {
    try {
      const response = await chrome.runtime.sendMessage({
        action: "authRegister",  // ✅ Changed from auth_register
        email,
        password,
        name,
      });

      if (!response.success) {
        throw new Error(response.error || "Registration failed");
      }

      // After registration, we need to login
      return await this.login(email, password);
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error: error.message };
    }
  }

  async logout() {
    this.token = null;
    this.userEmail = null;
    this.userName = null;

    await chrome.storage.local.remove([
      CONFIG.STORAGE_KEYS.AUTH_TOKEN,
      CONFIG.STORAGE_KEYS.USER_EMAIL,
      CONFIG.STORAGE_KEYS.USER_NAME,
    ]);
  }
}

// Create singleton instance
const authManager = new AuthManager();
