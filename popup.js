// TweetWizard Popup Script
console.log("🪄 TweetWizard popup opened");

// DOM elements
const apiStatus = document.getElementById("apiStatus");
const toneStatus = document.getElementById("toneStatus");
const openSettingsBtn = document.getElementById("openSettings");
const testOnXBtn = document.getElementById("testOnX");

// Check extension status
async function checkExtensionStatus() {
  try {
    // Check API key
    const { apiKey } = await chrome.storage.sync.get("apiKey");
    if (apiKey && apiKey.startsWith("sk-") && apiKey.length > 20) {
      apiStatus.textContent = "✅";
      apiStatus.className = "status-icon status-good";
    } else {
      apiStatus.textContent = "❌";
      apiStatus.className = "status-icon status-error";
    }

    // Check tone settings
    const { selectedTone = "genz-founder" } = await chrome.storage.sync.get([
      "selectedTone",
    ]);
    if (selectedTone) {
      toneStatus.textContent = "✅";
      toneStatus.className = "status-icon status-good";
    } else {
      toneStatus.textContent = "❌";
      toneStatus.className = "status-icon status-error";
    }

    console.log("✅ Extension status checked");
  } catch (error) {
    console.error("❌ Error checking status:", error);
    apiStatus.textContent = "❓";
    toneStatus.textContent = "❓";
  }
}

// Open settings page
openSettingsBtn.addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
  window.close();
});

// Open X.com in a new tab
testOnXBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: "https://x.com" });
  window.close();
});

// Initialize popup
async function initialize() {
  console.log("🚀 Initializing popup...");
  await checkExtensionStatus();
  console.log("✅ Popup initialized");
}

// Start initialization
initialize();
