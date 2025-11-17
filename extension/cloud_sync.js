// Cloud Sync Manager for Read Aloud Cloud
// All API calls go through background.js

class CloudSync {
  constructor() {
    this.syncing = false;
  }

  async saveArticle(title, content, sourceUrl, collectionId = null) {
    if (!authManager.isAuthenticated()) {
      throw new Error("Not authenticated");
    }

    try {
      const response = await chrome.runtime.sendMessage({
        action: "articlesCreate",  // ✅ Changed from cloud_saveArticle
        token: authManager.getToken(),
        data: {  // ✅ Changed from 'article' to 'data' to match background.js
          title,
          content,
          source_url: sourceUrl,
          collection_id: collectionId,
        },
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to save article");
      }

      // Update last sync time
      await chrome.storage.local.set({
        [CONFIG.STORAGE_KEYS.LAST_SYNC]: new Date().toISOString(),
      });

      return { success: true, article: response.article };
    } catch (error) {
      console.error("Save article error:", error);
      return { success: false, error: error.message };
    }
  }

  async getArticles(skip = 0, limit = 50, collectionId = null) {
    if (!authManager.isAuthenticated()) {
      throw new Error("Not authenticated");
    }

    try {
      const response = await chrome.runtime.sendMessage({
        action: "articlesGetAll",  // ✅ Changed from cloud_getArticles
        token: authManager.getToken(),
        skip,
        limit,
        collectionId,
      });

      if (!response.success) {
        throw new Error("Failed to get articles");
      }

      return response.articles;
    } catch (error) {
      console.error("Get articles error:", error);
      return [];
    }
  }

  async getArticle(articleId) {
    if (!authManager.isAuthenticated()) {
      throw new Error("Not authenticated");
    }

    try {
      const response = await chrome.runtime.sendMessage({
        action: "articlesGetOne",  // ✅ Changed from cloud_getArticle
        token: authManager.getToken(),
        id: articleId,  // ✅ Changed from 'articleId' to 'id'
      });

      if (!response.success) {
        throw new Error("Article not found");
      }

      return response.article;
    } catch (error) {
      console.error("Get article error:", error);
      return null;
    }
  }

  async updateArticle(articleId, updates) {
    if (!authManager.isAuthenticated()) {
      throw new Error("Not authenticated");
    }

    try {
      const response = await chrome.runtime.sendMessage({
        action: "articlesUpdate",  // ✅ Changed from cloud_updateArticle
        token: authManager.getToken(),
        id: articleId,  // ✅ Changed from 'articleId' to 'id'
        data: updates,  // ✅ Changed from 'updates' to 'data'
      });

      if (!response.success) {
        throw new Error("Failed to update article");
      }

      return response.article;
    } catch (error) {
      console.error("Update article error:", error);
      return null;
    }
  }

  async deleteArticle(articleId) {
    if (!authManager.isAuthenticated()) {
      throw new Error("Not authenticated");
    }

    try {
      const response = await chrome.runtime.sendMessage({
        action: "articlesDelete",  // ✅ Changed from cloud_deleteArticle
        token: authManager.getToken(),
        id: articleId,  // ✅ Changed from 'articleId' to 'id'
      });

      return response.success;
    } catch (error) {
      console.error("Delete article error:", error);
      return false;
    }
  }

  async getCollections() {
    if (!authManager.isAuthenticated()) {
      throw new Error("Not authenticated");
    }

    try {
      const response = await chrome.runtime.sendMessage({
        action: "collectionsGetAll",  // ✅ Changed from cloud_getCollections
        token: authManager.getToken(),
      });

      if (!response.success) {
        throw new Error("Failed to get collections");
      }

      return response.collections;
    } catch (error) {
      console.error("Get collections error:", error);
      return [];
    }
  }

  async createCollection(name, description = null) {
    if (!authManager.isAuthenticated()) {
      throw new Error("Not authenticated");
    }

    try {
      const response = await chrome.runtime.sendMessage({
        action: "collectionsCreate",  // ✅ Changed from cloud_createCollection
        token: authManager.getToken(),
        name,
        description,
      });

      if (!response.success) {
        throw new Error("Failed to create collection");
      }

      return response.collection;
    } catch (error) {
      console.error("Create collection error:", error);
      return null;
    }
  }
}

// Create singleton instance
const cloudSync = new CloudSync();
