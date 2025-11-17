// Read Aloud Cloud - Content Script
// Enhanced with cloud sync capabilities

let currentAudio = null;
let currentUtterance = null;
let currentText = "";
let currentWordIndex = 0;
let words = [];
let isPaused = false;
let isPlaying = false;
let selectedText = "";
let currentHighlight = null;
let highlightInPage = false;
let ttsServerUrl = "http://localhost:5000";
let playbackRate = 1.0;
let ttsMode = "web";
let webSpeechAvailable = false;
let castServerUrl = "http://localhost:5000";
let castConnected = false;
let isCasting = false;
let stopRequested = false;
let castTimeouts = [];
let wordTrackingInterval = null;

// Cloud sync state
let isAuthenticated = false;
let currentArticleId = null;

// Initialize
async function init() {
  await authManager.initialize();
  isAuthenticated = authManager.isAuthenticated();
  createFloatingPanel();
  updateAuthUI();

  // Check token validity every 5 minutes
  setInterval(async () => {
    if (authManager.isAuthenticated()) {
      const response = await chrome.runtime.sendMessage({
        action: "authGetMe",
        token: authManager.getToken(),
      });
      if (!response.success) {
        authManager.logout();
        isAuthenticated = false;
        updateAuthUI();
      }
    }
  }, 5 * 60 * 1000); // 5 minutes
}

// Create floating panel with cloud features
function createFloatingPanel() {
  if (document.getElementById("read-aloud-panel")) return;

  const panel = document.createElement("div");
  panel.id = "read-aloud-panel";
  panel.className = "collapsed";
  panel.innerHTML = `
    <div class="panel-icon" id="panel-icon" title="Read Aloud Cloud">
      🔊
    </div>
    <div class="panel-expanded">
      <div class="panel-header">
        <span class="panel-title">🔊 Read Aloud Cloud</span>
        <button id="close-panel" class="close-btn" title="Collapse">✕</button>
      </div>
      <div class="panel-content">

        <div class="selection-info" id="selection-info"></div>
        
        <div class="source-buttons">
          <button id="load-page-btn" class="source-btn" title="Load page content">
            <span class="btn-icon">📄</span>
            <span class="btn-text">Full Page</span>
          </button>
          <button id="load-selection-btn" class="source-btn" title="Load selected text" disabled>
            <span class="btn-icon">✂️</span>
            <span class="btn-text">Selection</span>
            <span class="btn-helper">Select text first</span>
          </button>
        </div>

        <div class="highlight-toggle">
          <label>
            <input type="checkbox" id="highlight-toggle" />
            <span class="toggle-label">Highlight on page</span>
          </label>
        </div>

        <div class="text-display" id="text-display">
          <p class="placeholder-text">Select text or click Full Page to load content</p>
        </div>

        <div class="playback-controls">
          <button id="rewind-btn" class="playback-btn" title="Rewind 10 words" disabled>⏪</button>
          <button id="play-pause-btn" class="playback-btn pause-play" title="Play" disabled>▶️</button>
          <button id="stop-btn" class="playback-btn" title="Stop" disabled>⏹️</button>
          <button id="forward-btn" class="playback-btn" title="Forward 10 words" disabled>⏩</button>
          <button id="restart-btn" class="playback-btn" title="Restart" disabled>🔄</button>
        </div>

        <div class="speed-control">
          <label>Speed: <span id="speed-value">1.0</span>x</label>
          <input type="range" id="speed-slider" min="0.5" max="2.0" step="0.1" value="1.0">
        </div>
        <div class="voice-control" id="voice-control-section">
          <label>Voice:</label>
          <select id="voice-select"></select>
        </div>
        <div class="progress-bar">
          <div id="progress-fill"></div>
        </div>
        <div class="status">Ready</div>

        <!-- Bottom Icon Bar -->
        <div class="bottom-icon-bar">
          <!-- Auth Icon -->
          <button id="auth-icon-btn" class="icon-btn" title="Login/User" data-modal="auth">
            <span class="icon-content">👤</span>
          </button>

          <!-- TTS Status Icon -->
          <button id="tts-icon-btn" class="icon-btn" title="TTS Setup" data-modal="tts">
            <span class="icon-content">🎙️</span>
          </button>

          <!-- Cast Icon -->
          <button id="cast-icon-btn" class="icon-btn" title="Cast Device" data-modal="cast" style="display: none;">
            <span class="icon-content">📡</span>
          </button>

          <!-- Cloud Save Icon -->
          <button id="cloud-icon-btn" class="icon-btn" title="Save to Cloud" style="display: none;">
            <span class="icon-content">☁️</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Auth Modal -->
    <div id="auth-modal" class="modal" style="display: none;">
      <div class="modal-content">
        <div class="modal-header">
          <h3 id="auth-modal-title">Login to Read Aloud Cloud</h3>
          <button class="modal-close" data-modal="auth">✕</button>
        </div>
        <div class="modal-body">
          <div id="auth-error" class="auth-error" style="display: none;"></div>
          <div id="auth-user-display" class="auth-user-display" style="display: none;">
            <p id="auth-user-name"></p>
            <button id="auth-logout-btn" class="auth-btn">Logout</button>
          </div>
          <div id="auth-form" class="auth-form">
            <input type="email" id="auth-email" placeholder="Email" class="auth-input" />
            <input type="password" id="auth-password" placeholder="Password" class="auth-input" />
            <input type="text" id="auth-name" placeholder="Name (for signup)" class="auth-input" style="display: none;" />
            
            <button id="auth-submit-btn" class="auth-btn">Login</button>
            <button id="auth-toggle-btn" class="auth-link">Need an account? Sign up</button>
          </div>

          <!-- Cloud Save Section inside Auth Modal -->
          <div id="cloud-section" class="cloud-section" style="display: none; margin-top: 20px; padding-top: 20px; border-top: 1px solid #ccc;">
            <div style="margin-bottom: 10px;">
              <button id="save-to-cloud-btn" class="cloud-btn" disabled>
                <span class="btn-icon">☁️</span>
                <span class="btn-text">Save to Cloud</span>
              </button>
              <button id="toggle-create-collection-btn" class="cloud-btn" style="background: #667eea; margin-top: 8px;">
                <span class="btn-icon">➕</span>
                <span class="btn-text">New Collection</span>
              </button>              
            </div>
            <select id="collection-select" class="collection-select" style="display: none;">
              <option value="">No Collection</option>
            </select>
            <!-- Create New Collection Section -->
            <div id="create-collection-section" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd; display: none;">
              <h4 style="margin: 0 0 12px 0; font-size: 13px; font-weight: 600; color: #333;">Create New Collection</h4>
              <input type="text" id="new-collection-name" placeholder="Collection name" class="auth-input" style="margin-bottom: 8px;" />
              <textarea id="new-collection-description" placeholder="Description (optional)" class="auth-input" style="resize: vertical; min-height: 60px; margin-bottom: 10px; font-family: inherit;"></textarea>
              <button id="create-collection-btn" class="cloud-btn" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <span class="btn-icon">➕</span>
                <span class="btn-text">Create Collection</span>
              </button>
              <div id="collection-error" style="display: none; margin-top: 8px; padding: 10px; background: #fee; color: #c33; border-radius: 6px; font-size: 12px;"></div>
              <div id="collection-success" style="display: none; margin-top: 8px; padding: 10px; background: #f1f8f4; color: #2e7d32; border-radius: 6px; font-size: 12px; border-left: 4px solid #4caf50;"></div>
            </div>            
          </div>
        </div>
      </div>
    </div>

    <!-- TTS Server Modal -->
    <div id="tts-modal" class="modal" style="display: none;">
      <div class="modal-content">
        <div class="modal-header">
          <h3>TTS Server Configuration</h3>
          <button class="modal-close" data-modal="tts">✕</button>
        </div>
        <div class="modal-body">
          <div class="tts-mode-info" id="tts-mode-info">Checking TTS...</div>
          <div style="margin-top: 15px;">
            <label>Server URL:</label>
            <input type="text" id="server-url-input" value="http://localhost:5000" placeholder="http://localhost:5000" class="auth-input" />
          </div>
          <div style="display: flex; gap: 10px; margin-top: 15px;">
            <button id="save-server-btn" class="auth-btn" style="flex: 1;">Save</button>
            <button id="cancel-server-btn" class="auth-link" style="flex: 1;">Cancel</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Cast Device Modal -->
    <div id="cast-modal" class="modal" style="display: none;">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Setup Cast Device</h3>
          <button class="modal-close" data-modal="cast">✕</button>
        </div>
        <div class="modal-body">
          <p id="cast-status">Setting up Chromecast device...</p>
          <div id="cast-info" style="margin-top: 15px; padding: 15px; background: #f5f5f5; border-radius: 8px; display: none;">
            <p id="cast-connected-text" style="color: green; font-weight: bold;"></p>
          </div>
          <div style="display: flex; gap: 10px; margin-top: 15px;">
            <button id="setup-cast-btn" class="auth-btn" style="flex: 1;">Setup</button>
            <button id="disconnect-cast-btn" class="auth-link" style="flex: 1; display: none;">Disconnect</button>
            <button  id="cancel-cast-btn" class="auth-link" data-modal="cast" style="flex: 1;">Close</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  // Check cast server
  checkCastServer();

  // Set up event listeners
  setupEventListeners();
  populateVoiceList();
}

// Check if Cast relay server is available
async function checkCastServer() {
  try {
    const response = await chrome.runtime.sendMessage({ action: "castStatus" });
    if (response.connected) {
      castConnected = true;
      document.getElementById("cast-icon-btn").style.display = "block";
      updateCastDisplay();
      return true;
    }
  } catch (error) {
    console.log("Cast relay server not available");
  }
  document.getElementById("cast-icon-btn").style.display = "block";
  castConnected = false;
  updateCastDisplay();
  return false;
}

function updateCastDisplay() {
  const castStatus = document.getElementById("cast-status");
  const castInfo = document.getElementById("cast-info");
  const setupBtn = document.getElementById("setup-cast-btn");
  const disconnectBtn = document.getElementById("disconnect-cast-btn");
  const castIconBtn = document.getElementById("cast-icon-btn");

  if (castConnected) {
    castStatus.textContent = "Chromecast Device Connected";
    castInfo.style.display = "block";
    document.getElementById("cast-connected-text").textContent =
      "✓ Ready for casting";
    setupBtn.style.display = "none";
    disconnectBtn.style.display = "block";
    castIconBtn.querySelector(".icon-content").textContent = "📡✓";
    castIconBtn.style.backgroundColor = "#4CAF50";
    castIconBtn.style.color = "white";
  } else {
    castStatus.textContent = "No device connected";
    castInfo.style.display = "none";
    setupBtn.style.display = "block";
    disconnectBtn.style.display = "none";
    castIconBtn.querySelector(".icon-content").textContent = "📡";
    castIconBtn.style.backgroundColor = "";
    castIconBtn.style.color = "";
  }
}

async function castAudio(audioDataUrl) {
  if (!castConnected) {
    alert("No cast device connected. Click the cast icon to setup first.");
    return false;
  }

  try {
    // Convert data URL to blob
    const response = await fetch(audioDataUrl);
    const blob = await response.blob();

    // Convert blob to array buffer (can be sent via message)
    const arrayBuffer = await blob.arrayBuffer();

    // Send via background worker
    const result = await chrome.runtime.sendMessage({
      action: "castAudio",
      audioData: Array.from(new Uint8Array(arrayBuffer)), // Convert to array
    });

    if (!result.success) {
      throw new Error(result.error);
    }

    isCasting = true;
    return true;
  } catch (error) {
    console.error("Cast error:", error);
    updateStatus("Cast error: " + error.message);
    return false;
  }
}

function openCastSetup() {
  // Open cast relay page in new tab
  window.open(`${castServerUrl}/cast`, "castsetup", "width=600,height=400");

  // Poll for connection
  const checkInterval = setInterval(async () => {
    const connected = await checkCastServer();
    if (connected) {
      clearInterval(checkInterval);
    }
  }, 2000);

  // Stop checking after 30 seconds
  setTimeout(() => clearInterval(checkInterval), 30000);
}

function setupEventListeners() {
  const panel = document.getElementById("read-aloud-panel");
  const panelIcon = document.getElementById("panel-icon");
  const closeBtn = document.getElementById("close-panel");
  const loadPageBtn = document.getElementById("load-page-btn");
  const loadSelectionBtn = document.getElementById("load-selection-btn");
  const playPauseBtn = document.getElementById("play-pause-btn");
  const stopBtn = document.getElementById("stop-btn");
  const restartBtn = document.getElementById("restart-btn");
  const rewindBtn = document.getElementById("rewind-btn");
  const forwardBtn = document.getElementById("forward-btn");
  const speedSlider = document.getElementById("speed-slider");
  const speedValue = document.getElementById("speed-value");
  const voiceSelect = document.getElementById("voice-select");
  const highlightToggle = document.getElementById("highlight-toggle");
  const saveServerBtn = document.getElementById("save-server-btn");
  const cancelServerBtn = document.getElementById("cancel-server-btn");
  const cancelCastBtn = document.getElementById("cancel-cast-btn");
  const serverUrlInput = document.getElementById("server-url-input");

  panelIcon.addEventListener("click", () => {
    panel.classList.remove("collapsed");
  });

  closeBtn.addEventListener("click", () => {
    panel.classList.add("collapsed");
  });

  // Modal close buttons
  document.querySelectorAll(".modal-close").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const modalType = e.currentTarget.getAttribute("data-modal");
      closeModal(modalType);
    });
  });

  // Icon buttons to open modals
  document
    .getElementById("auth-icon-btn")
    .addEventListener("click", () => openModal("auth"));
  document
    .getElementById("tts-icon-btn")
    .addEventListener("click", () => openModal("tts"));
  document
    .getElementById("cast-icon-btn")
    .addEventListener("click", () => openModal("cast"));

  // Cloud save icon button
  document
    .getElementById("cloud-icon-btn")
    .addEventListener("click", saveCurrentToCloud);

  // Cast setup buttons
  document
    .getElementById("setup-cast-btn")
    .addEventListener("click", openCastSetup);
  document
    .getElementById("disconnect-cast-btn")
    .addEventListener("click", () => {
      chrome.runtime.sendMessage({ action: "castDisconnect" }).then(() => {
        castConnected = false;
        updateCastDisplay();
      });
    });

  // TTS server buttons
  saveServerBtn.addEventListener("click", async () => {
    ttsServerUrl = serverUrlInput.value;
    await chrome.storage.local.set({ ttsServerUrl });
    closeModal("tts");
    checkTTSMode();
  });

  cancelServerBtn.addEventListener("click", () => {
    serverUrlInput.value = ttsServerUrl;
    closeModal("tts");
  });

  cancelCastBtn.addEventListener("click", () => {
    closeModal("cast");
  });

  highlightToggle.addEventListener("change", (e) => {
    highlightInPage = e.target.checked;
    if (words.length > 0) {
      displayTextWithHighlight();
    }
  });

  loadPageBtn.addEventListener("click", () => loadText(false));
  loadSelectionBtn.addEventListener("click", () => loadText(true));
  playPauseBtn.addEventListener("click", togglePlayPause);
  stopBtn.addEventListener("click", stopText);
  restartBtn.addEventListener("click", restartText);
  rewindBtn.addEventListener("click", () => skipWords(-10));
  forwardBtn.addEventListener("click", () => skipWords(10));

  speedSlider.addEventListener("input", (e) => {
    speedValue.textContent = e.target.value;
    playbackRate = parseFloat(e.target.value);
    if (ttsMode === "server" && currentAudio && isPlaying) {
      currentAudio.playbackRate = playbackRate;
    }
  });

  voiceSelect.addEventListener("change", () => {
    // Voice changing applies on next play
  });

  document.addEventListener("mouseup", handleTextSelection);
  document.addEventListener("keyup", handleTextSelection);
  setupAuthListeners();
}

// Modal functions
function openModal(type) {
  const modal = document.getElementById(`${type}-modal`);
  if (modal) {
    modal.style.display = "flex";
  }
}

function closeModal(type) {
  const modal = document.getElementById(`${type}-modal`);
  if (modal) {
    modal.style.display = "none";
  }
}

// Close modal when clicking outside
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal")) {
    e.target.style.display = "none";
  }
});

function setupAuthListeners() {
  const authIconBtn = document.getElementById("auth-icon-btn");
  const authForm = document.getElementById("auth-form");
  const authUserDisplay = document.getElementById("auth-user-display");
  const authSubmitBtn = document.getElementById("auth-submit-btn");
  const authToggleBtn = document.getElementById("auth-toggle-btn");
  const authLogoutBtn = document.getElementById("auth-logout-btn");
  let isLoginMode = true;

  authLogoutBtn.addEventListener("click", () => {
    authManager.logout().then(() => {
      isAuthenticated = false;
      updateAuthUI();
      closeModal("auth");
    });
  });

  authToggleBtn.addEventListener("click", () => {
    isLoginMode = !isLoginMode;
    const nameInput = document.getElementById("auth-name");
    const modalTitle = document.getElementById("auth-modal-title");

    if (isLoginMode) {
      nameInput.style.display = "none";
      modalTitle.textContent = "Login to Read Aloud Cloud";
      authSubmitBtn.textContent = "Login";
      authToggleBtn.textContent = "Need an account? Sign up";
    } else {
      nameInput.style.display = "block";
      modalTitle.textContent = "Sign Up for Read Aloud Cloud";
      authSubmitBtn.textContent = "Sign Up";
      authToggleBtn.textContent = "Have an account? Login";
    }
  });

  authSubmitBtn.addEventListener("click", async () => {
    const email = document.getElementById("auth-email").value;
    const password = document.getElementById("auth-password").value;
    const name = document.getElementById("auth-name").value;
    const errorDiv = document.getElementById("auth-error");

    if (!email || !password) {
      errorDiv.textContent = "Please fill in all fields";
      errorDiv.style.display = "block";
      return;
    }

    if (!isLoginMode && !name) {
      errorDiv.textContent = "Please enter your name";
      errorDiv.style.display = "block";
      return;
    }

    authSubmitBtn.disabled = true;
    authSubmitBtn.textContent = isLoginMode ? "Logging in..." : "Signing up...";

    let result;
    if (isLoginMode) {
      result = await authManager.login(email, password);
    } else {
      result = await authManager.register(email, password, name);
    }

    if (result.success) {
      isAuthenticated = true;
      updateAuthUI();
      loadCollections();

      // Clear form
      document.getElementById("auth-email").value = "";
      document.getElementById("auth-password").value = "";
      document.getElementById("auth-name").value = "";
      errorDiv.style.display = "none";
    } else {
      errorDiv.textContent = result.error;
      errorDiv.style.display = "block";
    }

    authSubmitBtn.disabled = false;
    authSubmitBtn.textContent = isLoginMode ? "Login" : "Sign Up";
  });

  // Save to cloud button
  const saveToCloudBtn = document.getElementById("save-to-cloud-btn");
  if (saveToCloudBtn) {
    saveToCloudBtn.addEventListener("click", async () => {
      // ✅ Load/refresh collections before saving
      if (isAuthenticated) {
        await loadCollections();
      }
      saveCurrentToCloud();
    });
  }

  // Create new collection button
  const createCollectionBtn = document.getElementById("create-collection-btn");
  if (createCollectionBtn) {
    createCollectionBtn.addEventListener("click", async () => {
      await handleCreateCollection();
    });
  }

  // Toggle collection creation section
  const toggleCreateBtn = document.getElementById(
    "toggle-create-collection-btn"
  );
  if (toggleCreateBtn) {
    toggleCreateBtn.addEventListener("click", () => {
      const section = document.getElementById("create-collection-section");
      section.style.display =
        section.style.display === "none" ? "block" : "none";
    });
  }
}

function updateAuthUI() {
  const authForm = document.getElementById("auth-form");
  const authUserDisplay = document.getElementById("auth-user-display");
  const authUserName = document.getElementById("auth-user-name");
  const cloudSection = document.getElementById("cloud-section");
  const cloudIconBtn = document.getElementById("cloud-icon-btn");

  if (isAuthenticated) {
    const userInfo = authManager.getUserInfo();
    authForm.style.display = "none";
    authUserDisplay.style.display = "block";
    authUserName.textContent = `Logged in as: ${
      userInfo.name || userInfo.email
    }`;
    cloudSection.style.display = "block";
    cloudIconBtn.style.display = "block";
    document
      .getElementById("auth-icon-btn")
      .querySelector(".icon-content").textContent = "👤✓";
    document.getElementById("auth-icon-btn").style.backgroundColor = "#4CAF50";
    document.getElementById("auth-icon-btn").style.color = "white";
    // ✅ Load collections when user logs in
    loadCollections();
  } else {
    authForm.style.display = "block";
    authUserDisplay.style.display = "none";
    cloudSection.style.display = "none";
    cloudIconBtn.style.display = "none";
    document
      .getElementById("auth-icon-btn")
      .querySelector(".icon-content").textContent = "👤";
    document.getElementById("auth-icon-btn").style.backgroundColor = "";
    document.getElementById("auth-icon-btn").style.color = "";
  }
}

async function loadCollections() {
  if (!isAuthenticated) {
    console.log("Not authenticated, skipping collection load");
    return;
  }

  try {
    console.log("Loading collections...");
    const collections = await cloudSync.getCollections();
    const select = document.getElementById("collection-select");

    if (!select) {
      console.warn("collection-select element not found in DOM");
      return;
    }

    // Clear and reset dropdown
    select.innerHTML =
      '<option value="">📁 No Collection (Save to Saved Articles)</option>';

    // Populate with collections
    if (collections && Array.isArray(collections) && collections.length > 0) {
      collections.forEach((coll) => {
        const option = document.createElement("option");
        option.value = coll.id || coll._id; // Handle both id and _id
        option.textContent = `📁 ${coll.name}` || "Unnamed Collection";
        select.appendChild(option);
      });
      select.style.display = "block";
      console.log(`Loaded ${collections.length} collections`);
    } else {
      select.style.display = "block"; // Show dropdown even if empty
      console.log("No collections exist yet");
    }
  } catch (error) {
    console.error("Failed to load collections:", error);
    // Don't crash - just show error in console
    const select = document.getElementById("collection-select");
    if (select) {
      select.style.display = "block";
    }
  }
}

async function saveCurrentToCloud() {
  if (!isAuthenticated) {
    openModal("auth");
    alert("Please login first");
    return;
  }

  if (!currentText || words.length === 0) {
    alert("Please load content first");
    return;
  }

  const saveBtn = document.getElementById("save-to-cloud-btn");
  saveBtn.disabled = true;
  saveBtn.querySelector(".btn-text").textContent = "Saving...";

  try {
    // Get title
    const title = document.title || words.slice(0, 10).join(" ") + "...";

    // Get collection ID (can be null - backend handles this)
    const collectionSelect = document.getElementById("collection-select");
    const collectionId = collectionSelect?.value || null;

    console.log("Saving article:", {
      title: title,
      contentLength: currentText.length,
      collectionId: collectionId,
    });

    // Call save
    const result = await cloudSync.saveArticle(
      title,
      currentText,
      window.location.href,
      collectionId
    );

    if (result.success) {
      currentArticleId = result.article.id;
      updateStatus("✓ Saved to cloud!");
      console.log("Article saved successfully:", result.article.id);

      // ✅ Reload collections after save
      await loadCollections();

      setTimeout(() => {
        saveBtn.querySelector(".btn-text").textContent = "Save to Cloud";
        saveBtn.disabled = false;
      }, 2000);
    } else {
      console.error("Save failed:", result.error);
      updateStatus(`Failed to save: ${result.error || "Unknown error"}`);
      saveBtn.querySelector(".btn-text").textContent = "Save to Cloud";
      saveBtn.disabled = false;
    }
  } catch (error) {
    console.error("Exception during save:", error);
    updateStatus("Error: " + error.message);
    saveBtn.querySelector(".btn-text").textContent = "Save to Cloud";
    saveBtn.disabled = false;
  }
}

async function handleCreateCollection() {
  const nameInput = document.getElementById("new-collection-name");
  const descriptionInput = document.getElementById(
    "new-collection-description"
  );
  const errorDiv = document.getElementById("collection-error");
  const successDiv = document.getElementById("collection-success");
  const createBtn = document.getElementById("create-collection-btn");

  // Clear previous messages
  errorDiv.style.display = "none";
  successDiv.style.display = "none";

  // Validate input
  const name = nameInput.value?.trim();
  const description = descriptionInput.value?.trim() || null;

  if (!name) {
    errorDiv.textContent = "Please enter a collection name";
    errorDiv.style.display = "block";
    return;
  }

  if (name.length > 100) {
    errorDiv.textContent = "Collection name must be less than 100 characters";
    errorDiv.style.display = "block";
    return;
  }

  // Disable button and show loading state
  createBtn.disabled = true;
  const originalText = createBtn.innerHTML;
  createBtn.innerHTML =
    '<span class="btn-icon">⏳</span><span class="btn-text">Creating...</span>';

  try {
    console.log("Creating collection:", { name, description });

    const result = await cloudSync.createCollection(name, description);

    if (result) {
      // Success
      successDiv.textContent = `✓ Collection "${name}" created successfully!`;
      successDiv.style.display = "block";

      // Clear inputs
      nameInput.value = "";
      descriptionInput.value = "";

      // Reload collections dropdown
      await loadCollections();

      // Hide collection creation section
      document.getElementById("create-collection-section").style.display =
        "none";

      // Revert button after delay
      setTimeout(() => {
        createBtn.disabled = false;
        createBtn.innerHTML = originalText;
        successDiv.style.display = "none";
      }, 2000);
    } else {
      throw new Error("Failed to create collection");
    }
  } catch (error) {
    console.error("Collection creation error:", error);
    errorDiv.textContent =
      error.message || "Failed to create collection. Please try again.";
    errorDiv.style.display = "block";

    // Revert button
    createBtn.disabled = false;
    createBtn.innerHTML = originalText;
  }
}

function handleTextSelection() {
  const selection = window.getSelection();
  const text = selection.toString().trim();
  const selectionInfo = document.getElementById("selection-info");
  const loadSelectionBtn = document.getElementById("load-selection-btn");
  const btnHelper = loadSelectionBtn.querySelector(".btn-helper");

  if (text && text.length > 0) {
    selectedText = text;
    const wordCount = text.split(/\s+/).length;
    selectionInfo.textContent = `✓ ${wordCount} word${
      wordCount > 1 ? "s" : ""
    } selected`;
    selectionInfo.style.display = "block";
    loadSelectionBtn.disabled = false;
    btnHelper.textContent = `${wordCount} words`;
  } else {
    selectedText = "";
    selectionInfo.style.display = "none";
    if (!isPlaying) {
      loadSelectionBtn.disabled = true;
      btnHelper.textContent = "Select text first";
    }
  }
}

function populateVoiceList() {
  checkTTSMode();
}

async function checkTTSMode() {
  // Load saved server URL
  const stored = await chrome.storage.local.get(["ttsServerUrl"]);
  if (stored.ttsServerUrl) {
    ttsServerUrl = stored.ttsServerUrl;
    document.getElementById("server-url-input").value = ttsServerUrl;
  }

  // First check if Web Speech API is available
  if (window.speechSynthesis) {
    try {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        webSpeechAvailable = true;
        ttsMode = "web";
        populateWebVoices(voices);
        updateTTSModeInfo("Using Web Speech API", true);
        document
          .getElementById("tts-icon-btn")
          .querySelector(".icon-content").textContent = "🎙️✓";
        document.getElementById("tts-icon-btn").style.backgroundColor =
          "#4CAF50";
        document.getElementById("tts-icon-btn").style.color = "white";
        return;
      }
    } catch (e) {
      console.log("Web Speech API not functional:", e);
    }
  }

  // If Web Speech not available, try TTS server
  try {
    const response = await chrome.runtime.sendMessage({ action: "checkTTS" });
    if (response.success) {
      ttsMode = "server";
      updateTTSModeInfo("Using Local TTS Server", true);
      document
        .getElementById("tts-icon-btn")
        .querySelector(".icon-content").textContent = "🎙️✓";
      document.getElementById("tts-icon-btn").style.backgroundColor = "#4CAF50";
      document.getElementById("tts-icon-btn").style.color = "white";
      document.getElementById("voice-control-section").style.display = "none";
    } else {
      ttsMode = "none";
      updateTTSModeInfo("TTS not available. Configure server below.", false);
      document
        .getElementById("tts-icon-btn")
        .querySelector(".icon-content").textContent = "🎙️⚠️";
      document.getElementById("tts-icon-btn").style.backgroundColor = "#ff9800";
      document.getElementById("tts-icon-btn").style.color = "white";
      document.getElementById("voice-control-section").style.display = "none";
    }
  } catch (error) {
    ttsMode = "none";
    updateTTSModeInfo("TTS not available. Configure server below.", false);
    document
      .getElementById("tts-icon-btn")
      .querySelector(".icon-content").textContent = "🎙️⚠️";
    document.getElementById("tts-icon-btn").style.backgroundColor = "#ff9800";
    document.getElementById("tts-icon-btn").style.color = "white";
    document.getElementById("voice-control-section").style.display = "none";
  }
}

function populateWebVoices(voices) {
  const voiceSelect = document.getElementById("voice-select");
  voiceSelect.innerHTML = voices
    .map(
      (voice, index) =>
        `<option value="${index}">${voice.name} (${voice.lang})</option>`
    )
    .join("");
}

function updateTTSModeInfo(message, success) {
  const modeInfo = document.getElementById("tts-mode-info");
  modeInfo.textContent = message;
  modeInfo.className = "tts-mode-info " + (success ? "success" : "warning");
}

// Populate voices when they're loaded (for Web Speech API)
if (
  typeof speechSynthesis !== "undefined" &&
  speechSynthesis.onvoiceschanged !== undefined
) {
  speechSynthesis.onvoiceschanged = () => {
    if (ttsMode === "web" || ttsMode === "none") {
      checkTTSMode();
    }
  };
}

function extractPageText() {
  // Get main content, avoiding scripts, styles, etc.
  const body = document.body.cloneNode(true);

  // Remove unwanted elements
  const unwanted = body.querySelectorAll(
    "script, style, noscript, iframe, nav, footer, header"
  );
  unwanted.forEach((el) => el.remove());

  // Get text content
  const text = body.innerText || body.textContent;
  return text.trim();
}

function updateStatus(message) {
  const status = document.querySelector(".status");
  if (status) status.textContent = message;
}

function updateProgress() {
  const progressFill = document.getElementById("progress-fill");
  if (progressFill && words.length > 0) {
    const percentage = (currentWordIndex / words.length) * 100;
    progressFill.style.width = percentage + "%";
  }
}

function displayTextWithHighlight() {
  const textDisplay = document.getElementById("text-display");

  if (highlightInPage) {
    // Hide text display when highlighting on page
    if (textDisplay) {
      textDisplay.style.display = "none";
    }
    highlightWordOnPage();
  } else {
    // Show text in panel
    if (textDisplay) {
      textDisplay.style.display = "block";
    }
    removePageHighlights();

    if (!textDisplay || words.length === 0) return;

    let html = "";
    const contextBefore = 15;
    const contextAfter = 15;

    const startIdx = Math.max(0, currentWordIndex - contextBefore);
    const endIdx = Math.min(words.length, currentWordIndex + contextAfter + 1);

    if (startIdx > 0) html += "... ";

    for (let i = startIdx; i < endIdx; i++) {
      if (i === currentWordIndex) {
        html += `<span class="current-word">${words[i]}</span> `;
      } else {
        html += words[i] + " ";
      }
    }

    if (endIdx < words.length) html += "...";

    textDisplay.innerHTML = `<p>${html}</p>`;

    const currentWordEl = textDisplay.querySelector(".current-word");
    if (currentWordEl) {
      currentWordEl.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  }
}

function highlightWordOnPage() {
  removePageHighlights();

  if (currentWordIndex >= words.length) return;

  const word = words[currentWordIndex];
  const searchText = word.replace(/[.,!?;:]/g, "");

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function (node) {
        if (node.parentElement.closest("#read-aloud-panel")) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  let node;
  while ((node = walker.nextNode())) {
    const text = node.textContent;
    const regex = new RegExp("\\b" + searchText + "\\b", "i");
    const match = text.match(regex);

    if (match) {
      const index = match.index;
      const before = text.substring(0, index);
      const matchText = text.substring(index, index + match[0].length);
      const after = text.substring(index + match[0].length);

      const highlight = document.createElement("span");
      highlight.className = "read-aloud-page-highlight";
      highlight.textContent = matchText;

      const parent = node.parentNode;
      parent.replaceChild(document.createTextNode(after), node);
      parent.insertBefore(highlight, parent.firstChild);
      parent.insertBefore(document.createTextNode(before), highlight);

      highlight.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
  }
}

function removePageHighlights() {
  const highlights = document.querySelectorAll(".read-aloud-page-highlight");
  highlights.forEach((highlight) => {
    const parent = highlight.parentNode;
    parent.replaceChild(
      document.createTextNode(highlight.textContent),
      highlight
    );
    parent.normalize();
  });
}

function removeHighlights() {
  removePageHighlights();
}

function loadText(useSelection = false) {
  if (useSelection && selectedText) {
    currentText = selectedText;
    updateStatus("Selection loaded");
  } else {
    currentText = extractPageText();
    updateStatus("Page loaded");
  }

  if (!currentText) {
    updateStatus("No text found");
    return;
  }

  words = currentText.split(/\s+/).filter((w) => w.length > 0);
  currentWordIndex = 0;
  displayTextWithHighlight();
  updateButtons();

  // Enable play button
  const playPauseBtn = document.getElementById("play-pause-btn");
  if (playPauseBtn) {
    playPauseBtn.disabled = false;
  }

  // Enable save to cloud button if authenticated
  if (isAuthenticated) {
    const saveBtn = document.getElementById("save-to-cloud-btn");
    if (saveBtn) {
      saveBtn.disabled = false;
    }
  }
}

function togglePlayPause() {
  if (!words || words.length === 0) {
    updateStatus("Please load content first");
    return;
  }

  if (isPlaying) {
    if (ttsMode === "web") {
      if (isPaused) {
        speechSynthesis.resume();
        isPaused = false;
        updateStatus("Playing...");
      } else {
        speechSynthesis.pause();
        isPaused = true;
        updateStatus("Paused");
      }
    } else if (ttsMode === "server") {
      if (isPaused) {
        if (currentAudio) {
          currentAudio.play();
        }
        isPaused = false;
        updateStatus("Playing...");

        // If casting, resume by calling playWithServer again
        if (castConnected) {
          chrome.runtime.sendMessage({
            action: "castControl",
            control: "play",
          });
        }
      } else {
        if (currentAudio) {
          currentAudio.pause();
        }
        isPaused = true;
        updateStatus("Paused");

        // If casting, send pause command
        if (castConnected) {
          chrome.runtime.sendMessage({
            action: "castControl",
            control: "pause",
          });
        }
      }
    }
    updateButtons();
  } else {
    // Starting playback - reset stop flag
    stopRequested = false;

    // Auto-switch to server mode if casting
    if (castConnected && ttsMode === "web") {
      updateStatus("Casting requires local TTS server...");
      checkTTSMode();
      if (ttsMode === "web") {
        alert(
          "Casting requires local TTS server. Please start: python3 combined_server.py"
        );
        return;
      }
    }

    if (ttsMode === "web") {
      playWithWebSpeech();
    } else if (ttsMode === "server") {
      playWithServer();
    } else {
      updateStatus("Please configure TTS server");
    }
  }
}

function playWithWebSpeech() {
  if (currentWordIndex >= words.length) {
    currentWordIndex = words.length;
    displayTextWithHighlight();
    stopText();
    updateStatus("Finished");
    return;
  }

  const textToSpeak = words.slice(currentWordIndex).join(" ");

  currentUtterance = new SpeechSynthesisUtterance(textToSpeak);

  const voiceSelect = document.getElementById("voice-select");
  const voices = speechSynthesis.getVoices();
  if (voiceSelect.value) {
    currentUtterance.voice = voices[voiceSelect.value];
  }

  const speedSlider = document.getElementById("speed-slider");
  currentUtterance.rate = parseFloat(speedSlider.value);
  currentUtterance.pitch = 1;
  currentUtterance.volume = 1;

  let lastBoundaryTime = Date.now();
  const minBoundaryInterval = 200;

  currentUtterance.onboundary = (event) => {
    if (event.name === "word") {
      const now = Date.now();
      if (now - lastBoundaryTime < minBoundaryInterval) {
        return;
      }
      lastBoundaryTime = now;

      currentWordIndex++;
      if (currentWordIndex >= words.length) {
        currentWordIndex = words.length - 1;
      }
      displayTextWithHighlight();
      updateProgress();
    }
  };

  currentUtterance.onend = () => {
    currentWordIndex = words.length;
    displayTextWithHighlight();
    stopText();
    updateStatus("Finished");
  };

  currentUtterance.onerror = (event) => {
    console.error("Speech error:", event);
    updateStatus("Error: " + event.error);
    stopText();
  };

  speechSynthesis.speak(currentUtterance);
  isPlaying = true;
  isPaused = false;
  updateStatus("Playing...");
  updateButtons();
}

async function playWithServer() {
  if (stopRequested || isPaused) {
    stopRequested = false;
    return;
  }

  if (currentWordIndex >= words.length) {
    currentWordIndex = words.length;
    displayTextWithHighlight();
    stopText();
    updateStatus("Finished");
    return;
  }

  // Get chunk of words to synthesize (avoid too long chunks)
  const chunkSize = 50;
  const endIndex = Math.min(currentWordIndex + chunkSize, words.length);
  const textChunk = words.slice(currentWordIndex, endIndex).join(" ");

  try {
    updateStatus("Generating speech...");

    const speedSlider = document.getElementById("speed-slider");
    playbackRate = parseFloat(speedSlider.value);

    // Request audio from background worker
    const response = await chrome.runtime.sendMessage({
      action: "synthesize",
      text: textChunk,
      rate: playbackRate,
    });

    if (!response.success) {
      throw new Error(response.error);
    }

    // If casting, send to Chromecast instead of local playback
    console.log("Cast connected:", castConnected, "isCasting:", isCasting);
    if (castConnected) {
      console.log("Attempting to cast audio...");
      const casted = await castAudio(response.audioData);
      console.log("Cast result:", casted);
      if (casted) {
        isPlaying = true;
        isPaused = false;
        updateStatus("Casting...");
        updateButtons();

        // Estimate word duration for tracking
        const wordCount = endIndex - currentWordIndex;
        // Approximate 150 words per minute
        const estimatedDuration = (wordCount / 150) * 60 * 1000;
        const msPerWord = estimatedDuration / wordCount;
        startWordTracking(msPerWord, wordCount);

        // Schedule next chunk
        const timeoutId = setTimeout(() => {
          if (stopRequested) {
            stopRequested = false;
            return; // Don't continue if stop was requested
          }
          currentWordIndex = endIndex;
          if (currentWordIndex < words.length) {
            playWithServer();
          } else {
            currentWordIndex = words.length;
            displayTextWithHighlight();
            stopText();
            updateStatus("Finished");
          }
        }, estimatedDuration);
        // Store timeout ID so we can cancel it
        castTimeouts.push(timeoutId);

        return;
      }
    }
    // Local playback (non-casting)
    currentAudio = new Audio(response.audioData);
    currentAudio.playbackRate = playbackRate;

    // Estimate word duration and update highlight
    const wordCount = endIndex - currentWordIndex;
    currentAudio.addEventListener("loadedmetadata", () => {
      const duration = currentAudio.duration;
      const msPerWord = (duration * 1000) / wordCount;
      startWordTracking(msPerWord, wordCount);
    });

    currentAudio.addEventListener("ended", () => {
      currentWordIndex = endIndex;

      if (currentWordIndex < words.length) {
        playWithServer();
      } else {
        currentWordIndex = words.length;
        displayTextWithHighlight();
        stopText();
        updateStatus("Finished");
      }
    });

    currentAudio.addEventListener("error", (e) => {
      console.error("Audio playback error:", e);
      updateStatus("Playback error");
      stopText();
    });

    await currentAudio.play();
    isPlaying = true;
    isPaused = false;
    updateStatus("Playing...");
    updateButtons();
  } catch (error) {
    console.error("TTS error:", error);
    updateStatus("Error: " + error.message);
    stopText();
  }
}

function startWordTracking(msPerWord, wordCount) {
  // Clear any existing interval first
  if (wordTrackingInterval) {
    clearInterval(wordTrackingInterval);
  }

  let wordOffset = 0;
  wordTrackingInterval = setInterval(() => {
    if (!isPlaying) {
      clearInterval(wordTrackingInterval);
      wordTrackingInterval = null;
      return;
    }

    if (isPaused) {
      return; // Don't increment, just wait
    }

    wordOffset++;
    if (wordOffset > wordCount) {
      clearInterval(wordTrackingInterval);
      wordTrackingInterval = null;
      return;
    }

    displayTextWithHighlight();
    updateProgress();
    currentWordIndex++;
  }, msPerWord);
}

function stopText() {
  // Clear word tracking interval
  if (wordTrackingInterval) {
    clearInterval(wordTrackingInterval);
    wordTrackingInterval = null;
  }

  // Clear all pending cast timeouts
  castTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
  castTimeouts = [];
  stopRequested = true;

  if (ttsMode === "web") {
    speechSynthesis.cancel();
    currentUtterance = null;
  } else if (ttsMode === "server") {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }

    // Stop casting if active
    if (castConnected && isCasting) {
      chrome.runtime.sendMessage({ action: "castStop" });
      isCasting = false;
    }
  }

  removePageHighlights();
  isPlaying = false;
  isPaused = false;
  currentWordIndex = 0;

  if (words.length > 0) {
    displayTextWithHighlight();
  } else {
    const textDisplay = document.getElementById("text-display");
    if (textDisplay) {
      textDisplay.style.display = "block";
      textDisplay.innerHTML =
        '<p class="placeholder-text">Select text or click Full Page to load content</p>';
    }
  }

  updateStatus("Stopped");
  updateButtons();
  updateProgress();
}

function restartText() {
  // Clear word tracking interval
  if (wordTrackingInterval) {
    clearInterval(wordTrackingInterval);
    wordTrackingInterval = null;
  }

  // Clear all pending cast timeouts
  castTimeouts.forEach((timeoutId) => clearTimeout(timeoutId));
  castTimeouts = [];
  stopRequested = true;

  if (ttsMode === "web") {
    speechSynthesis.cancel();
    currentUtterance = null;
  } else if (ttsMode === "server") {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }

    // Stop casting if active
    if (castConnected && isCasting) {
      chrome.runtime.sendMessage({ action: "castStop" });
      isCasting = false;
    }
  }

  currentWordIndex = 0;
  isPaused = false;
  isPlaying = false;
  stopRequested = false; // Reset flag so playback can start
  displayTextWithHighlight();
  updateStatus("Ready to play");
  updateButtons();
}

function skipWords(count) {
  const newIndex = Math.max(
    0,
    Math.min(currentWordIndex + count, words.length - 1)
  );
  currentWordIndex = newIndex;

  if (isPlaying) {
    if (ttsMode === "web") {
      speechSynthesis.cancel();
      playWithWebSpeech();
    } else if (ttsMode === "server") {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }
      playWithServer();
    }
  } else {
    displayTextWithHighlight();
  }
}

function updateButtons() {
  const loadPageBtn = document.getElementById("load-page-btn");
  const loadSelectionBtn = document.getElementById("load-selection-btn");
  const playPauseBtn = document.getElementById("play-pause-btn");
  const stopBtn = document.getElementById("stop-btn");
  const rewindBtn = document.getElementById("rewind-btn");
  const forwardBtn = document.getElementById("forward-btn");
  const restartBtn = document.getElementById("restart-btn");
  const speedSlider = document.getElementById("speed-slider");

  const hasContent = words && words.length > 0;

  if (isPlaying) {
    loadPageBtn.disabled = true;
    loadSelectionBtn.disabled = true;
    playPauseBtn.disabled = false;
    stopBtn.disabled = false;
    rewindBtn.disabled = castConnected; // Disable if casting
    forwardBtn.disabled = castConnected; // Disable if casting
    restartBtn.disabled = false;
    speedSlider.disabled = castConnected; // Disable if casting

    // Update play/pause button
    if (isPaused) {
      playPauseBtn.textContent = "▶️";
      playPauseBtn.title = "Resume";
    } else {
      playPauseBtn.textContent = "⏸️";
      playPauseBtn.title = "Pause";
    }
  } else {
    loadPageBtn.disabled = false;
    loadSelectionBtn.disabled = !selectedText;
    playPauseBtn.disabled = !hasContent;
    stopBtn.disabled = !hasContent;
    rewindBtn.disabled = !hasContent || castConnected; // Disable if casting
    forwardBtn.disabled = !hasContent || castConnected; // Disable if casting
    restartBtn.disabled = !hasContent;
    speedSlider.disabled = castConnected; // Disable if casting
    playPauseBtn.textContent = "▶️";
    playPauseBtn.title = "Play";
  }
}

// Initialize when page loads
init();
