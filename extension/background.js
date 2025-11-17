// Background Service Worker for Read Aloud Cloud
// Handles all API calls to avoid CORS/ad-blocker issues

const API_URL = "http://localhost:8000";
const TTS_URL = "http://localhost:5000";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // TTS Server actions
  if (request.action === "checkTTS") {
    checkTTSServer().then(sendResponse);
    return true;
  }

  if (request.action === "synthesize") {
    synthesizeSpeech(request.text, request.rate).then(sendResponse);
    return true;
  }

  // Cast actions
  if (request.action === "castStatus") {
    checkCastStatus().then(sendResponse);
    return true;
  }

  if (request.action === "castAudio") {
    castAudioData(request.audioData).then(sendResponse);
    return true;
  }

  if (request.action === "castDisconnect") {
    disconnectCast().then(sendResponse);
    return true;
  }

  if (request.action === "castStop") {
    stopCast().then(sendResponse);
    return true;
  }

  if (request.action === "castControl") {
    controlCast(request.control).then(sendResponse);
    return true;
  }

  // Auth API actions
  if (request.action === "authRegister") {
    registerUser(request.email, request.password, request.name).then(
      sendResponse
    );
    return true;
  }

  if (request.action === "authLogin") {
    loginUser(request.email, request.password).then(sendResponse);
    return true;
  }

  if (request.action === "authGetMe") {
    getUserInfo(request.token).then(sendResponse);
    return true;
  }

  // Articles API actions
  if (request.action === "articlesCreate") {
    createArticle(request.token, request.data).then(sendResponse);
    return true;
  }

  if (request.action === "articlesGetAll") {
    getArticles(
      request.token,
      request.skip,
      request.limit,
      request.collectionId
    ).then(sendResponse);
    return true;
  }

  if (request.action === "articlesGetOne") {
    getArticle(request.token, request.id).then(sendResponse);
    return true;
  }

  if (request.action === "articlesUpdate") {
    updateArticle(request.token, request.id, request.data).then(sendResponse);
    return true;
  }

  if (request.action === "articlesDelete") {
    deleteArticle(request.token, request.id).then(sendResponse);
    return true;
  }

  // Collections API actions
  if (request.action === "collectionsGetAll") {
    getCollections(request.token).then(sendResponse);
    return true;
  }

  if (request.action === "collectionsCreate") {
    createCollection(request.token, request.name, request.description).then(
      sendResponse
    );
    return true;
  }
});

// ============================================================================
// TTS SERVER FUNCTIONS
// ============================================================================

async function checkTTSServer() {
  try {
    const response = await fetch(`${TTS_URL}/health`);
    return { success: response.ok };
  } catch (error) {
    return { success: false };
  }
}

async function synthesizeSpeech(text, rate) {
  try {
    const response = await fetch(`${TTS_URL}/synthesize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        rate: rate || 1.0,
      }),
    });

    if (!response.ok) {
      throw new Error("TTS synthesis failed");
    }

    const audioBlob = await response.blob();
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onloadend = () => {
        resolve({
          success: true,
          audioData: reader.result,
        });
      };
      reader.onerror = () => {
        reject(new Error("Failed to read audio data"));
      };
      reader.readAsDataURL(audioBlob);
    });
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// ============================================================================
// CAST FUNCTIONS
// ============================================================================

async function checkCastStatus() {
  try {
    const response = await fetch(`${TTS_URL}/api/cast/status`);
    if (response.ok) {
      return await response.json();
    }
    return { connected: false };
  } catch (error) {
    return { connected: false, error: error.message };
  }
}

async function castAudioData(audioDataArray) {
  try {
    const blob = new Blob([new Uint8Array(audioDataArray)], {
      type: "audio/wav",
    });

    const formData = new FormData();
    formData.append("audio", blob, "audio.wav");

    const response = await fetch(`${TTS_URL}/api/cast/cast_data`, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      return { success: true };
    }
    return { success: false, error: "Cast failed" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function disconnectCast() {
  try {
    const response = await fetch(`${TTS_URL}/api/cast/disconnect`, {
      method: "POST",
    });
    return { success: response.ok };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function stopCast() {
  try {
    const response = await fetch(`${TTS_URL}/api/cast/control`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "stop" }),
    });
    return { success: response.ok };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function controlCast(action) {
  try {
    const response = await fetch(`${TTS_URL}/api/cast/control`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: action }),
    });
    return { success: response.ok };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================================================
// AUTH API FUNCTIONS
// ============================================================================

async function registerUser(email, password, name) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.detail || "Registration failed",
      };
    }

    const data = await response.json();
    return {
      success: true,
      user: data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function loginUser(email, password) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.detail || "Login failed",
      };
    }

    const data = await response.json();
    return {
      success: true,
      token: data.access_token,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function getUserInfo(token) {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: "Failed to get user info",
      };
    }

    const data = await response.json();
    return {
      success: true,
      user: data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// ============================================================================
// ARTICLES API FUNCTIONS
// ============================================================================

async function createArticle(token, articleData) {
  try {
    const response = await fetch(`${API_URL}/articles`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(articleData),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.detail || "Failed to create article",
      };
    }

    const data = await response.json();
    return {
      success: true,
      article: data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function getArticles(token, skip = 0, limit = 50, collectionId = null) {
  try {
    let url = `${API_URL}/articles?skip=${skip}&limit=${limit}`;
    if (collectionId) {
      url += `&collection_id=${collectionId}`;
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: "Failed to get articles",
      };
    }

    const data = await response.json();
    return {
      success: true,
      articles: data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function getArticle(token, id) {
  try {
    const response = await fetch(`${API_URL}/articles/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: "Article not found",
      };
    }

    const data = await response.json();
    return {
      success: true,
      article: data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function updateArticle(token, id, updates) {
  try {
    const response = await fetch(`${API_URL}/articles/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      return {
        success: false,
        error: "Failed to update article",
      };
    }

    const data = await response.json();
    return {
      success: true,
      article: data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function deleteArticle(token, id) {
  try {
    const response = await fetch(`${API_URL}/articles/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      success: response.ok,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// ============================================================================
// COLLECTIONS API FUNCTIONS
// ============================================================================

async function getCollections(token) {
  try {
    const response = await fetch(`${API_URL}/collections`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: "Failed to get collections",
      };
    }

    const data = await response.json();
    return {
      success: true,
      collections: data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function createCollection(token, name, description) {
  try {
    const response = await fetch(`${API_URL}/collections`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, description }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: "Failed to create collection",
      };
    }

    const data = await response.json();
    return {
      success: true,
      collection: data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}
