// Debug function
function debug(message) {
  const debugDiv = document.getElementById("debug");
  const timestamp = new Date().toLocaleTimeString();
  debugDiv.textContent += `[${timestamp}] ${message}\n`;
  console.log(message);
}

debug("Options page loaded");
debug("Chrome version: " + navigator.userAgent);

const apiKeyInput = document.getElementById("apiKey");
const saveButton = document.getElementById("save");
const testButton = document.getElementById("test");
const saveToneButton = document.getElementById("saveTone");
const statusDiv = document.getElementById("status");
const currentKeyDiv = document.getElementById("currentKey");
const customToneInput = document.getElementById("customTone");
const customToneGroup = document.getElementById("customToneGroup");

// Tone presets configuration
const tonePresets = {
  "genz-founder": {
    name: "🚀 Gen-Z Founder",
    prompt:
      'Reply in a Gen-Z founder tone: innovative, disruptive, using startup terminology like "scaling", "disrupting", "building", etc. Be bold and visionary but authentic. Use occasional tech slang, relevant emojis (🚀💡⚡🔥), and show entrepreneurial mindset. Keep it concise and impactful.',
  },
  professional: {
    name: "💼 Professional",
    prompt:
      "Reply in a professional, business-appropriate tone. Be polished, respectful, and articulate. Use proper grammar and avoid slang. Maintain a constructive and thoughtful approach.",
  },
  casual: {
    name: "😎 Casual",
    prompt:
      "Reply in a friendly, conversational tone. Be approachable and relatable. Use casual language and include appropriate emojis (😊👍💯✨) to make it more engaging. Keep it light and fun.",
  },
  witty: {
    name: "🧠 Witty",
    prompt:
      "Reply with wit and clever humor. Be sharp, intelligent, and entertaining. Use wordplay, clever observations, or light sarcasm when appropriate. Keep it clever but not mean-spirited.",
  },
  supportive: {
    name: "🤗 Supportive",
    prompt:
      "Reply in an encouraging, positive tone. Be uplifting, empathetic, and constructive. Include positive emojis (🤗💪❤️🙌) and offer support, motivation, or helpful perspectives. Spread positivity and good vibes.",
  },
  custom: {
    name: "✏️ Custom",
    prompt: "",
  },
};

let selectedTone = "genz-founder"; // Default to Gen-Z founder

// Show status message
function showStatus(message, isError = false) {
  debug(`Status: ${message}`);
  statusDiv.textContent = message;
  statusDiv.className = isError ? "status error" : "status success";
  statusDiv.style.display = "block";

  setTimeout(() => {
    statusDiv.style.display = "none";
  }, 5000);
}

// Handle tone preset selection
function handleToneSelection() {
  const tonePresetElements = document.querySelectorAll(".tone-preset");

  tonePresetElements.forEach((preset) => {
    preset.addEventListener("click", function () {
      // Remove selected class from all presets
      tonePresetElements.forEach((p) => p.classList.remove("selected"));

      // Add selected class to clicked preset
      this.classList.add("selected");

      // Update selected tone
      selectedTone = this.dataset.tone;

      // Show/hide custom tone input
      if (selectedTone === "custom") {
        customToneGroup.style.display = "block";
      } else {
        customToneGroup.style.display = "none";
      }

      debug(`Selected tone: ${selectedTone}`);
    });
  });
}

// Load tone settings
function loadToneSettings() {
  debug("Loading tone settings...");

  chrome.storage.sync.get(["selectedTone", "customTone"], function (result) {
    if (chrome.runtime.lastError) {
      debug("Error loading tone settings: " + chrome.runtime.lastError.message);
      return;
    }

    // Set selected tone
    if (result.selectedTone) {
      selectedTone = result.selectedTone;
      debug(`Loaded selected tone: ${selectedTone}`);

      // Update UI
      const selectedPreset = document.querySelector(
        `[data-tone="${selectedTone}"]`
      );
      if (selectedPreset) {
        selectedPreset.classList.add("selected");
      }

      // Show custom tone input if needed
      if (selectedTone === "custom") {
        customToneGroup.style.display = "block";
        if (result.customTone) {
          customToneInput.value = result.customTone;
        }
      }
    } else {
      // Default to Gen-Z founder
      const defaultPreset = document.querySelector(
        '[data-tone="genz-founder"]'
      );
      if (defaultPreset) {
        defaultPreset.classList.add("selected");
      }
    }
  });
}

// Save tone settings
saveToneButton.addEventListener("click", function () {
  debug("Saving tone settings...");

  const settingsToSave = {
    selectedTone: selectedTone,
  };

  // Include custom tone if selected
  if (selectedTone === "custom") {
    const customToneValue = customToneInput.value.trim();
    if (!customToneValue) {
      showStatus("Please enter a custom tone description", true);
      return;
    }
    settingsToSave.customTone = customToneValue;
  }

  // Disable button
  saveToneButton.disabled = true;
  saveToneButton.textContent = "Saving...";

  chrome.storage.sync.set(settingsToSave, function () {
    if (chrome.runtime.lastError) {
      debug("Error saving tone settings: " + chrome.runtime.lastError.message);
      showStatus(
        "❌ Error saving tone settings: " + chrome.runtime.lastError.message,
        true
      );
    } else {
      debug("Tone settings saved successfully");
      showStatus("✅ Tone settings saved successfully!");
    }

    // Re-enable button
    saveToneButton.disabled = false;
    saveToneButton.textContent = "Save Tone Settings";
  });
});

// Test storage functionality
testButton.addEventListener("click", function () {
  debug("Testing storage...");

  // Test basic storage
  chrome.storage.sync.set({ test: "hello" }, function () {
    if (chrome.runtime.lastError) {
      debug("Storage test failed: " + chrome.runtime.lastError.message);
      showStatus(
        "Storage test failed: " + chrome.runtime.lastError.message,
        true
      );
    } else {
      debug("Storage test successful");

      // Try to read it back
      chrome.storage.sync.get(["test"], function (result) {
        if (chrome.runtime.lastError) {
          debug(
            "Storage read test failed: " + chrome.runtime.lastError.message
          );
        } else {
          debug("Storage read test result: " + JSON.stringify(result));
          if (result.test === "hello") {
            showStatus("✅ Storage is working correctly!");

            // Clean up test data
            chrome.storage.sync.remove(["test"]);
          } else {
            showStatus("❌ Storage read/write mismatch", true);
          }
        }
      });
    }
  });
});

// Load current API key
function loadCurrentKey() {
  debug("Loading current API key...");

  chrome.storage.sync.get(["apiKey"], function (result) {
    debug("Storage get result: " + JSON.stringify(result));

    if (chrome.runtime.lastError) {
      debug("Error loading API key: " + chrome.runtime.lastError.message);
      currentKeyDiv.textContent =
        "Error loading current key: " + chrome.runtime.lastError.message;
      currentKeyDiv.className = "current-key error";
      return;
    }

    if (result.apiKey) {
      const maskedKey =
        result.apiKey.substring(0, 7) +
        "..." +
        result.apiKey.substring(result.apiKey.length - 4);
      currentKeyDiv.textContent = `✅ Current key: ${maskedKey}`;
      currentKeyDiv.className = "current-key";
      debug("Current key loaded and masked");
    } else {
      currentKeyDiv.textContent = "No API key saved yet";
      currentKeyDiv.className = "current-key";
      debug("No API key found");
    }
  });
}

// Save API key
saveButton.addEventListener("click", function () {
  debug("Save button clicked");

  const key = apiKeyInput.value.trim();
  debug("Key length: " + key.length);
  debug("Key starts with sk-: " + key.startsWith("sk-"));

  if (!key) {
    showStatus("Please enter an API key", true);
    return;
  }

  if (!key.startsWith("sk-")) {
    showStatus('Invalid API key format. OpenAI keys start with "sk-"', true);
    return;
  }

  if (key.length < 20) {
    showStatus("API key seems too short. Please check your key.", true);
    return;
  }

  // Disable button
  saveButton.disabled = true;
  saveButton.textContent = "Saving...";
  debug("Attempting to save API key...");

  // Try to save
  chrome.storage.sync.set({ apiKey: key }, function () {
    debug("Storage set callback called");

    if (chrome.runtime.lastError) {
      debug("Error saving API key: " + chrome.runtime.lastError.message);
      showStatus(
        "❌ Error saving API key: " + chrome.runtime.lastError.message,
        true
      );
    } else {
      debug("API key saved successfully");
      showStatus("✅ API key saved successfully!");

      // Clear input
      apiKeyInput.value = "";

      // Reload current key display
      loadCurrentKey();
    }

    // Re-enable button
    saveButton.disabled = false;
    saveButton.textContent = "Save API Key";
  });
});

// Enter key support
apiKeyInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    saveButton.click();
  }
});

// Initialize when page loads
document.addEventListener("DOMContentLoaded", function () {
  loadCurrentKey();
  loadToneSettings();
  handleToneSelection();
});
