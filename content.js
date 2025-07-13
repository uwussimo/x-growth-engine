// TweetWizard Content Script - Inline Suggestions
console.log("🪄 TweetWizard: Content script loaded");

let isGenerating = false;
let currentSuggestionsContainer = null;

// Tone presets that match options.js
const tonePresets = {
  "genz-founder":
    'Reply in a Gen-Z founder tone: innovative, disruptive, using startup terminology like "scaling", "disrupting", "building", etc. Be bold and visionary but authentic. Use occasional tech slang, relevant emojis (🚀💡⚡🔥), and show entrepreneurial mindset. Keep it concise and impactful.',
  professional:
    "Reply in a professional, business-appropriate tone. Be polished, respectful, and articulate. Use proper grammar and avoid slang. Maintain a constructive and thoughtful approach.",
  casual:
    "Reply in a friendly, conversational tone. Be approachable and relatable. Use casual language and include appropriate emojis (😊👍💯✨) to make it more engaging. Keep it light and fun.",
  witty:
    "Reply with wit and clever humor. Be sharp, intelligent, and entertaining. Use wordplay, clever observations, or light sarcasm when appropriate. Keep it clever but not mean-spirited.",
  supportive:
    "Reply in an encouraging, positive tone. Be uplifting, empathetic, and constructive. Include positive emojis (🤗💪❤️🙌) and offer support, motivation, or helpful perspectives. Spread positivity and good vibes.",
  custom: "",
};

// Wait for page to load
function waitForPageLoad() {
  return new Promise((resolve) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", resolve);
    } else {
      resolve();
    }
  });
}

// Enhanced tweet text extraction
function extractTweetText() {
  console.log("🔍 Extracting tweet text...");

  // Try multiple selectors for tweet content on X.com
  const selectors = [
    '[data-testid="tweetText"]',
    '[data-testid="tweet"] [dir="auto"]',
    "article [lang]",
    'article [dir="auto"]',
    '[role="article"] [lang]',
    '[role="article"] [dir="auto"]',
    'article [data-testid="tweetText"]',
    // More specific selectors for different tweet types
    'div[data-testid="tweetText"] span',
    'article div[dir="auto"]',
  ];

  // First try to find the main tweet content
  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);

    for (const element of elements) {
      const text = element.textContent?.trim();
      if (
        text &&
        text.length > 10 &&
        text.length < 2000 && // Reasonable tweet length
        !text.includes("Replying to") &&
        !text.includes("Show this thread") &&
        !text.includes("Quote Tweet") &&
        !text.includes("Reposted") &&
        !text.includes("Follow") &&
        !text.includes("Translate") &&
        !text.startsWith("@") && // Skip mention-only content
        !text.match(/^\d+h$|^\d+m$|^\d+s$/)
      ) {
        // Skip timestamps
        console.log("✅ Found tweet text:", text.substring(0, 100) + "...");
        return text;
      }
    }
  }

  // Fallback: look for the parent tweet context more carefully
  const articles = document.querySelectorAll("article");
  for (const article of articles) {
    // Skip if this article contains reply interface elements
    if (article.querySelector('[data-testid="tweetTextarea_0"]')) {
      continue;
    }

    const textNodes = article.querySelectorAll('[dir="auto"]');
    for (const node of textNodes) {
      const text = node.textContent?.trim();
      if (
        text &&
        text.length > 15 &&
        text.length < 2000 &&
        !text.includes("Replying to") &&
        !text.includes("@") &&
        !text.includes("Show this thread") &&
        !text.includes("Reposted") &&
        !text.includes("Quote Tweet") &&
        !node.closest('[data-testid="tweetTextarea_0"]') && // Exclude reply text area
        !node.closest('[role="button"]') && // Exclude buttons
        !node.closest('[data-testid="reply"]') && // Exclude reply UI
        !node.closest('[data-testid="like"]') && // Exclude interaction buttons
        !node.closest('[data-testid="retweet"]')
      ) {
        console.log(
          "✅ Found fallback tweet text:",
          text.substring(0, 100) + "..."
        );
        return text;
      }
    }
  }

  // Last resort: try to find any substantial text content
  const allTextElements = document.querySelectorAll("span, div, p");
  for (const element of allTextElements) {
    const text = element.textContent?.trim();
    if (
      text &&
      text.length > 20 &&
      text.length < 1000 &&
      !text.includes("Replying to") &&
      !text.includes("Show this thread") &&
      !text.includes("@") &&
      !element.closest('[data-testid="tweetTextarea_0"]') &&
      !element.closest('[role="button"]') &&
      element.closest("article")
    ) {
      console.log(
        "✅ Found last resort tweet text:",
        text.substring(0, 100) + "..."
      );
      return text;
    }
  }

  console.log("❌ No tweet text found");
  return "";
}

// Detect system/X theme
function detectTheme() {
  // Check X's theme
  const html = document.documentElement;
  const body = document.body;

  // X uses different theme indicators
  if (
    html.style.colorScheme === "dark" ||
    body.style.backgroundColor === "rgb(0, 0, 0)" ||
    getComputedStyle(body).backgroundColor === "rgb(0, 0, 0)"
  ) {
    return "dark";
  }

  // Fallback to system preference
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }

  return "light";
}

// Create loading spinner
function createSpinner() {
  const spinner = document.createElement("div");
  spinner.className = "tweetwizard-spinner";
  return spinner;
}

// Create suggestion element
function createSuggestionElement(text, index) {
  console.log(`🔨 Creating suggestion element ${index + 1}:`, text);

  const suggestion = document.createElement("div");
  suggestion.className = "tweetwizard-suggestion";
  suggestion.textContent = text;

  // Comprehensive inline styles to bypass all CSS specificity
  suggestion.style.cssText = `
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
    position: relative !important;
    min-height: 30px !important;
    min-width: 200px !important;
    width: auto !important;
    height: auto !important;
    padding: 8px 12px !important;
    margin: 6px 0 !important;
    border: 1px solid #eff3f4 !important;
    border-radius: 8px !important;
    background-color: #f7f9fa !important;
    color: #0f1419 !important;
    font-size: 12px !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif !important;
    line-height: 1.3 !important;
    cursor: pointer !important;
    z-index: 9999 !important;
    box-sizing: border-box !important;
    overflow: visible !important;
    white-space: pre-wrap !important;
    word-wrap: break-word !important;
    user-select: text !important;
    text-align: left !important;
    text-indent: 0 !important;
    text-transform: none !important;
    letter-spacing: normal !important;
    word-spacing: normal !important;
    flex-shrink: 0 !important;
    flex-grow: 0 !important;
    flex-basis: auto !important;
    align-self: auto !important;
    justify-self: auto !important;
    clip: auto !important;
    clip-path: none !important;
    transform: none !important;
    top: auto !important;
    left: auto !important;
    right: auto !important;
    bottom: auto !important;
    max-width: 100% !important;
    contain: none !important;
    content-visibility: visible !important;
    background-clip: padding-box !important;
    background-origin: padding-box !important;
    background-size: auto !important;
    transform-origin: 50% 50% !important;
  `;

  console.log(`✅ Suggestion element ${index + 1} created and styled`);

  suggestion.addEventListener("click", async () => {
    console.log("🖱️ Suggestion clicked:", text.substring(0, 50) + "...");

    // Find the active text area
    const textArea = document.querySelector('[data-testid="tweetTextarea_0"]');
    if (textArea) {
      try {
        // Focus the text area first
        textArea.focus();

        // For contentEditable elements (X uses these), use proper insertion
        if (textArea.contentEditable === "true") {
          // Use execCommand for proper text insertion (preferred method)
          if (document.execCommand) {
            // This inserts text at cursor position without disrupting existing content
            const success = document.execCommand("insertText", false, text);
            console.log(
              `📝 execCommand insertText: ${success ? "success" : "failed"}`
            );

            if (!success) {
              // Fallback: Use Selection API for insertion
              const selection = window.getSelection();
              const range = selection.getRangeAt(0);
              range.deleteContents();
              range.insertNode(document.createTextNode(text));
              range.collapse(false);
              selection.removeAllRanges();
              selection.addRange(range);
              console.log("📝 Used Selection API insertion fallback");
            }
          } else {
            // Modern browsers: Use Selection API
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              range.deleteContents();
              range.insertNode(document.createTextNode(text));
              range.collapse(false);
              selection.removeAllRanges();
              selection.addRange(range);
              console.log("📝 Used Selection API insertion");
            }
          }

          // Trigger essential events for X's SPA
          const events = [
            new InputEvent("beforeinput", {
              bubbles: true,
              inputType: "insertText",
              data: text,
            }),
            new InputEvent("input", {
              bubbles: true,
              inputType: "insertText",
              data: text,
            }),
            new Event("change", { bubbles: true }),
          ];

          // Dispatch events immediately to notify React
          events.forEach((event) => {
            textArea.dispatchEvent(event);
            console.log(`📤 Dispatched ${event.type} event`);
          });

          // Also trigger on parent form
          const form = textArea.closest("form");
          if (form) {
            form.dispatchEvent(new Event("input", { bubbles: true }));
          }
        } else {
          // For regular input/textarea elements - use insertion at cursor
          const start = textArea.selectionStart;
          const end = textArea.selectionEnd;
          const currentValue = textArea.value;

          // Insert text at cursor position
          textArea.value =
            currentValue.substring(0, start) +
            text +
            currentValue.substring(end);

          // Move cursor to end of inserted text
          const newCursorPos = start + text.length;
          textArea.setSelectionRange(newCursorPos, newCursorPos);

          // Trigger events
          textArea.dispatchEvent(new Event("input", { bubbles: true }));
          textArea.dispatchEvent(new Event("change", { bubbles: true }));
        }

        // Show inserted feedback
        const originalText = suggestion.textContent;
        suggestion.classList.add("copied");
        suggestion.textContent = "✓ Inserted!";

        setTimeout(() => {
          suggestion.classList.remove("copied");
          suggestion.textContent = originalText;
        }, 2000);

        console.log("📝 Text inserted at cursor position");

        // Auto-close the suggestions overlay after insertion
        setTimeout(() => {
          cleanupSuggestions();
        }, 1500);
      } catch (err) {
        console.error("Failed to insert text:", err);
        // Fallback to clipboard
        await navigator.clipboard.writeText(text);
        suggestion.classList.add("copied");
        suggestion.textContent = "✓ Copied to clipboard";

        setTimeout(() => {
          suggestion.classList.remove("copied");
          suggestion.textContent = text;
        }, 2000);
      }
    } else {
      // Fallback to clipboard if text area not found
      await navigator.clipboard.writeText(text);
      suggestion.classList.add("copied");
      suggestion.textContent = "✓ Copied to clipboard";

      setTimeout(() => {
        suggestion.classList.remove("copied");
        suggestion.textContent = text;
      }, 2000);
    }
  });

  return suggestion;
}

// Create suggestions container with generate button
function createSuggestionsContainer() {
  const container = document.createElement("div");
  container.className = "tweetwizard-suggestions";

  // Apply theme
  const theme = detectTheme();
  if (theme === "dark") {
    container.setAttribute("data-theme", "dark");
  }

  const header = document.createElement("div");
  header.className = "tweetwizard-header";

  const icon = document.createElement("span");
  icon.className = "tweetwizard-icon";
  icon.textContent = "🪄";

  const title = document.createElement("h4");
  title.className = "tweetwizard-title";
  title.textContent = "Smart Reply Suggestions";

  const generateBtn = document.createElement("button");
  generateBtn.className = "tweetwizard-generate-btn";
  generateBtn.textContent = "Generate";

  // Add settings info
  const settingsInfo = document.createElement("div");
  settingsInfo.className = "tweetwizard-settings-info";
  settingsInfo.style.cssText = `
    font-size: 10px !important;
    color: var(--tw-text-secondary) !important;
    margin-top: 2px !important;
    opacity: 0.8 !important;
  `;

  // Load and display current settings
  chrome.storage.sync.get(["selectedTone", "customTone"], (result) => {
    const selectedTone = result.selectedTone || "genz-founder";
    const toneNames = {
      "genz-founder": "Gen-Z Founder",
      professional: "Professional",
      casual: "Casual",
      witty: "Witty",
      supportive: "Supportive",
      custom: "Custom",
    };
    settingsInfo.textContent = `Using ${
      toneNames[selectedTone] || selectedTone
    } tone`;
  });

  generateBtn.addEventListener("click", () => {
    const tweetText = extractTweetText();
    if (tweetText) {
      generateSuggestions(tweetText, container);
    } else {
      // Clear any existing content and show error inline
      const existingContent = container.querySelectorAll(
        ".tweetwizard-suggestion, .tweetwizard-loading, .tweetwizard-error"
      );
      existingContent.forEach((el) => el.remove());

      const error = document.createElement("div");
      error.className = "tweetwizard-error";
      error.textContent = "❌ Could not find tweet to reply to";
      container.appendChild(error);
    }
  });

  header.appendChild(icon);
  header.appendChild(title);
  header.appendChild(generateBtn);
  container.appendChild(header);
  container.appendChild(settingsInfo);

  return container;
}

// Generate reply suggestions
async function generateSuggestions(tweetText, container) {
  if (isGenerating) {
    console.log("⏳ Already generating suggestions...");
    return;
  }

  console.log("🚀 Starting suggestion generation...");
  console.log("📦 Container status before generation:", {
    isConnected: container.isConnected,
    parentElement: container.parentElement?.tagName,
    childrenCount: container.children.length,
  });

  isGenerating = true;

  // Get the generate button and disable it during generation
  const generateBtn = container.querySelector(".tweetwizard-generate-btn");
  if (generateBtn) {
    generateBtn.disabled = true;
    generateBtn.textContent = "Generating...";
    console.log("🔄 Generate button disabled");
  }

  // Clear any existing suggestions/loading/error, but keep header
  const existingContent = container.querySelectorAll(
    ".tweetwizard-suggestion, .tweetwizard-loading, .tweetwizard-error"
  );
  existingContent.forEach((el) => el.remove());
  console.log(
    "🧹 Cleared existing content, suggestions count:",
    existingContent.length
  );

  // Show loading state
  const loading = document.createElement("div");
  loading.className = "tweetwizard-loading";

  const spinner = createSpinner();
  const text = document.createElement("span");
  text.textContent = "Generating smart replies...";

  loading.appendChild(spinner);
  loading.appendChild(text);
  container.appendChild(loading);
  console.log("⏳ Loading state added to container");

  try {
    console.log(
      "🤖 Generating suggestions for:",
      tweetText.substring(0, 100) + "..."
    );

    // Get API key and tone settings
    console.log("🔧 Retrieving settings from storage...");
    const { apiKey } = await chrome.storage.sync.get("apiKey");
    const { selectedTone = "genz-founder", customTone = "" } =
      await chrome.storage.sync.get(["selectedTone", "customTone"]);

    console.log("⚙️ Retrieved settings:", {
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey ? apiKey.length : 0,
      selectedTone: selectedTone,
      customToneLength: customTone ? customTone.length : 0,
      customTonePreview: customTone
        ? customTone.substring(0, 50) + "..."
        : "none",
    });

    // Validate settings
    if (!apiKey || apiKey.trim() === "") {
      console.log("❌ No API key found or empty");
      // Remove loading and show error, but don't remove container
      loading.remove();
      const error = document.createElement("div");
      error.className = "tweetwizard-error";
      error.innerHTML = `
        ❌ Please set your OpenAI API key in extension options<br>
        <small>Click the extension icon → Options to configure</small>
      `;
      container.appendChild(error);
      return;
    }

    // Validate API key format (basic check)
    if (!apiKey.startsWith("sk-")) {
      console.log("❌ Invalid API key format");
      loading.remove();
      const error = document.createElement("div");
      error.className = "tweetwizard-error";
      error.innerHTML = `
        ❌ Invalid API key format<br>
        <small>OpenAI API keys should start with 'sk-'</small>
      `;
      container.appendChild(error);
      return;
    }

    // Build prompt with tone
    let toneInstruction =
      tonePresets[selectedTone] || tonePresets["genz-founder"];
    if (selectedTone === "custom" && customTone && customTone.trim() !== "") {
      toneInstruction = customTone.trim();
      console.log("🎨 Using custom tone instruction");
    } else if (
      selectedTone === "custom" &&
      (!customTone || customTone.trim() === "")
    ) {
      console.log(
        "⚠️ Custom tone selected but no custom instruction provided, falling back to Gen-Z founder"
      );
      toneInstruction = tonePresets["genz-founder"];
    } else {
      console.log(`🎨 Using ${selectedTone} tone preset`);
    }

    console.log(
      "📝 Tone instruction preview:",
      toneInstruction.substring(0, 100) + "..."
    );

    const prompt = `${toneInstruction}

Generate 3 smart, engaging replies to this tweet. Each reply should be on a separate line and start with a number (1., 2., 3.). Keep replies concise (under 280 characters), conversational, and Twitter-appropriate. Make them feel natural and engaging:

"${tweetText}"`;

    console.log("📤 Making API request...");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 400,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API error:", response.status, errorText);

      let errorMessage = "API request failed";
      if (response.status === 401) {
        errorMessage = "Invalid API key. Check your settings.";
      } else if (response.status === 429) {
        errorMessage = "Rate limit exceeded. Try again later.";
      } else if (response.status === 403) {
        errorMessage = "API access forbidden. Check your OpenAI account.";
      }

      // Remove loading and show error, but keep container
      loading.remove();
      const error = document.createElement("div");
      error.className = "tweetwizard-error";
      error.textContent = `❌ ${errorMessage}`;
      container.appendChild(error);
      console.log("❌ Error added to container, container preserved");
      return;
    }

    const data = await response.json();
    console.log("📨 API response received");
    console.log("🔍 Full API response:", data);

    const suggestions = data.choices[0].message.content
      .split("\n")
      .filter((line) => line.trim() && line.match(/^\d+\./))
      .map((line) => line.replace(/^\d+\.\s*/, "").trim());

    console.log("✨ Generated suggestions:", suggestions.length);
    console.log("📝 Suggestions content:", suggestions);
    console.log("🔍 Raw API content:", data.choices[0].message.content);

    // Remove loading spinner
    if (loading.parentNode) {
      loading.remove();
      console.log("🗑️ Loading spinner removed");
    }

    if (suggestions.length === 0) {
      console.log("❌ No suggestions parsed from API response");
      const error = document.createElement("div");
      error.className = "tweetwizard-error";
      error.textContent = "❌ No suggestions generated. Try again.";
      container.appendChild(error);
      console.log("❌ Error element added to container");
      return;
    }

    // Debug: Check container state before adding suggestions
    console.log("📦 Container ready for suggestions");

    // Add each suggestion to the container
    console.log("🎨 Starting to render suggestions...");
    suggestions.forEach((suggestion, index) => {
      console.log(`🔨 Creating suggestion ${index + 1}:`, suggestion);
      const suggestionElement = createSuggestionElement(suggestion, index);
      container.appendChild(suggestionElement);
      console.log(`✅ Added suggestion ${index + 1} to container`);
    });

    console.log("✅ All suggestions rendered successfully");
    console.log(
      `📊 Final container children count: ${container.children.length}`
    );

    // Verify container is still in DOM
    console.log("🔍 Container still in DOM:", document.contains(container));
  } catch (error) {
    console.error("❌ Error generating suggestions:", error);

    // Remove loading and show error, but preserve container
    if (loading.parentNode) {
      loading.remove();
    }
    const errorEl = document.createElement("div");
    errorEl.className = "tweetwizard-error";
    errorEl.textContent = "❌ Network error. Check your connection.";
    container.appendChild(errorEl);
    console.log("❌ Network error shown, container preserved");
  } finally {
    isGenerating = false;

    // Re-enable the generate button
    if (generateBtn) {
      generateBtn.disabled = false;
      generateBtn.textContent = "Generate";
      console.log("🔄 Generate button re-enabled");
    }

    console.log("🔄 Generation process completed");
    console.log("📦 Final container status:", {
      isConnected: container.isConnected,
      parentElement: container.parentElement?.tagName,
      childrenCount: container.children.length,
    });
  }
}

// Find reply text area and insert suggestions
function findAndInsertSuggestions(clickedElement) {
  console.log("🔍 Finding insertion point for suggestions...");

  // Remove any existing suggestions first
  cleanupSuggestions();

  // Find the reply text area to position our overlay
  const textArea = document.querySelector('[data-testid="tweetTextarea_0"]');
  if (!textArea) {
    console.log("❌ Could not find tweet text area");
    return;
  }

  // Create new suggestions container
  const container = createSuggestionsContainer();
  currentSuggestionsContainer = container;

  console.log("📦 Created new suggestions container");

  // Instead of inserting into X's DOM, create a floating overlay
  // attached directly to body to avoid X's DOM manipulation
  container.style.cssText = `
    position: fixed !important;
    z-index: 99999 !important;
    background: var(--tw-bg-primary) !important;
    border: 1px solid var(--tw-border) !important;
    border-radius: 12px !important;
    padding: 12px !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
    max-width: 480px !important;
    width: auto !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    display: block !important;
    visibility: visible !important;
    opacity: 1 !important;
  `;

  // Position the overlay near the text area
  const positionOverlay = () => {
    const textAreaRect = textArea.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    console.log("📐 Positioning overlay:", {
      textAreaRect: {
        top: textAreaRect.top,
        bottom: textAreaRect.bottom,
        left: textAreaRect.left,
        right: textAreaRect.right,
      },
      windowSize: {
        width: windowWidth,
        height: windowHeight,
      },
    });

    // Calculate optimal position
    let top = textAreaRect.bottom + 8; // 8px below text area
    let left = textAreaRect.left;

    // Ensure it fits in viewport
    if (top + 200 > windowHeight) {
      top = textAreaRect.top - 200 - 8; // Above text area if no space below
      console.log("📐 Positioned above text area - no space below");
    }

    if (left + 480 > windowWidth) {
      left = windowWidth - 480 - 20; // Adjust to fit in viewport
      console.log("📐 Adjusted left position to fit in viewport");
    }

    // Ensure minimum positioning (don't go off-screen)
    if (left < 10) left = 10;
    if (top < 10) top = 10;

    container.style.top = `${top}px`;
    container.style.left = `${left}px`;

    console.log(`📍 Positioned overlay at top: ${top}px, left: ${left}px`);

    // Verify the container is visible
    setTimeout(() => {
      const containerRect = container.getBoundingClientRect();
      console.log("👁️ Container visibility check:", {
        rect: containerRect,
        isVisible: containerRect.width > 0 && containerRect.height > 0,
        inViewport:
          containerRect.top >= 0 &&
          containerRect.left >= 0 &&
          containerRect.bottom <= windowHeight &&
          containerRect.right <= windowWidth,
      });
    }, 100);
  };

  // Initial positioning
  positionOverlay();

  // Attach directly to body to avoid X's DOM manipulation
  document.body.appendChild(container);
  console.log("✅ Attached container to body as floating overlay");

  // Reposition on scroll/resize
  const repositionHandler = () => {
    if (document.contains(container) && document.contains(textArea)) {
      positionOverlay();
    }
  };

  window.addEventListener("scroll", repositionHandler);
  window.addEventListener("resize", repositionHandler);

  // Clean up event listeners when container is removed
  const originalRemove = container.remove;
  container.remove = function () {
    window.removeEventListener("scroll", repositionHandler);
    window.removeEventListener("resize", repositionHandler);
    originalRemove.call(this);
  };

  // Add click outside to close
  const clickOutsideHandler = (event) => {
    // Don't close if clicking on the generate button or any part of our container
    if (container.contains(event.target)) {
      console.log("🖱️ Clicked inside container - keeping open");
      return;
    }

    // Don't close if clicking on the text area
    if (textArea.contains(event.target)) {
      console.log("🖱️ Clicked on text area - keeping open");
      return;
    }

    console.log("🖱️ Clicked outside - closing suggestions");
    cleanupSuggestions();
    document.removeEventListener("click", clickOutsideHandler);
  };

  // Add click outside handler after a brief delay
  setTimeout(() => {
    document.addEventListener("click", clickOutsideHandler);
    console.log("👂 Click outside handler added");
  }, 500); // Increased delay to avoid immediate triggering

  // Verify insertion and add stability monitoring
  setTimeout(() => {
    console.log("🔍 Overlay verification:", {
      containerInDOM: document.contains(container),
      containerParent: container.parentElement?.tagName,
      containerPosition: container.style.position,
      containerTop: container.style.top,
      containerLeft: container.style.left,
      containerZIndex: container.style.zIndex,
      containerBounds: container.getBoundingClientRect(),
    });

    // Monitor for X trying to remove our overlay
    const stabilityCheck = setInterval(() => {
      if (!document.contains(container)) {
        console.log("🚨 CRITICAL: Overlay was removed from body!");
        clearInterval(stabilityCheck);
      } else if (!document.contains(textArea)) {
        console.log("📝 Text area removed - closing suggestions");
        cleanupSuggestions();
        clearInterval(stabilityCheck);
      }
    }, 500);

    setTimeout(() => clearInterval(stabilityCheck), 10000);
  }, 100);
}

// Handle clicks on reply elements
function handleReplyClick(event) {
  const target = event.target;

  // Check if this is a reply-related click with more specific detection
  const isReplyClick =
    target.closest('[data-testid="tweetTextarea_0"]') ||
    target.closest('[data-testid="reply"]') ||
    target.closest('[aria-label*="reply" i]') ||
    target.closest('[aria-label*="Reply" i]') ||
    target.closest('[data-testid="tweetButtonInline"]') ||
    (target.matches('div[contenteditable="true"]') &&
      target.getAttribute("data-testid") === "tweetTextarea_0") ||
    // Also catch clicks on the reply button itself
    target.closest('button[data-testid="reply"]');

  if (isReplyClick) {
    console.log("🎯 Reply click detected");

    // Small delay to ensure X's UI has updated and the text area is available
    setTimeout(() => {
      try {
        findAndInsertSuggestions(target);
      } catch (error) {
        console.error("❌ Error in handleReplyClick:", error);
      }
    }, 600); // Increased delay for more reliable detection
  }
}

// Handle focus events on text areas
function handleFocus(event) {
  const target = event.target;

  if (
    target.getAttribute("data-testid") === "tweetTextarea_0" ||
    (target.contentEditable === "true" &&
      target.closest('[data-testid="tweetTextarea_0"]'))
  ) {
    console.log("🎯 Reply text area focused");

    setTimeout(() => {
      try {
        findAndInsertSuggestions(target);
      } catch (error) {
        console.error("❌ Error in handleFocus:", error);
      }
    }, 400);
  }
}

// Clean up suggestions when navigating away
function cleanupSuggestions() {
  if (currentSuggestionsContainer) {
    console.log("🧹 Cleaning up suggestions overlay");

    // Remove from body (not from X's DOM structure)
    if (document.body.contains(currentSuggestionsContainer)) {
      document.body.removeChild(currentSuggestionsContainer);
      console.log("✅ Removed suggestions overlay from body");
    }

    // Call the custom remove method to clean up event listeners
    if (currentSuggestionsContainer.remove) {
      currentSuggestionsContainer.remove();
    }

    currentSuggestionsContainer = null;
    console.log("🧹 Suggestions cleanup complete");
  }
}

// Setup navigation and reply detection
function setupNavigationAndReplyDetection() {
  let currentUrl = window.location.href;

  const observer = new MutationObserver((mutations) => {
    // Handle URL changes (SPA navigation)
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;
      console.log("🔄 Navigation detected, cleaning up");
      cleanupSuggestions();
    }

    // Watch for new reply text areas appearing
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Check if a tweet text area was added
          const textArea =
            node.querySelector &&
            node.querySelector('[data-testid="tweetTextarea_0"]');
          if (textArea) {
            console.log("🎯 New reply text area detected via mutation");
            setTimeout(() => {
              try {
                findAndInsertSuggestions(textArea);
              } catch (error) {
                console.error("❌ Error in mutation observer:", error);
              }
            }, 800);
          }

          // Also check if the node itself is a text area
          if (
            node.getAttribute &&
            node.getAttribute("data-testid") === "tweetTextarea_0"
          ) {
            console.log("🎯 Reply text area is the added node");
            setTimeout(() => {
              try {
                findAndInsertSuggestions(node);
              } catch (error) {
                console.error("❌ Error in mutation observer (direct):", error);
              }
            }, 800);
          }
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return observer;
}

// Initialize the extension
async function initialize() {
  console.log("🚀 TweetWizard: Initializing...");

  await waitForPageLoad();
  console.log("📄 Page loaded");

  // Verify settings are accessible
  try {
    const settings = await chrome.storage.sync.get([
      "apiKey",
      "selectedTone",
      "customTone",
    ]);
    console.log("⚙️ Initial settings check:", {
      hasApiKey: !!settings.apiKey,
      selectedTone: settings.selectedTone || "genz-founder (default)",
      customToneLength: settings.customTone ? settings.customTone.length : 0,
      availablePresets: Object.keys(tonePresets),
    });

    if (!settings.apiKey) {
      console.log("⚠️ No API key found - user needs to set it in options");
    }
  } catch (error) {
    console.error("❌ Error accessing storage:", error);
  }

  // Add event listeners
  document.addEventListener("click", handleReplyClick, true);
  document.addEventListener("focus", handleFocus, true);

  // Set up navigation and reply detection
  setupNavigationAndReplyDetection();
  console.log("🔍 Navigation and reply detection set up");

  // Listen for theme changes
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", () => {
      console.log("🎨 Theme changed");
      // Update existing suggestions container if present
      if (currentSuggestionsContainer) {
        const theme = detectTheme();
        if (theme === "dark") {
          currentSuggestionsContainer.setAttribute("data-theme", "dark");
        } else {
          currentSuggestionsContainer.removeAttribute("data-theme");
        }
      }
    });

  // Extension ready for use
  console.log("🎯 Ready to generate suggestions on reply interactions");

  console.log("✅ TweetWizard initialization complete");
}

// Start initialization
initialize();
