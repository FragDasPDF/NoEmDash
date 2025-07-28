// content.js

function addStyles() {
  // Check if styles already exist
  if (document.getElementById("no-em-dash-styles")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "no-em-dash-styles";
  style.textContent = `
        .no-em-dash-replacement {
            background-color: #fff2a8; /* light yellow */
            color: #333;
            border-radius: 3px;
            padding: 1px 2px;
        }
    `;
  document.head.appendChild(style);
}

// Helper function to safely call chrome storage APIs
function safeStorageCall(storageFunction, onSuccess, onError = null) {
  if (!chrome || !chrome.storage || !chrome.storage.sync) {
    console.log("No-EM-Dash: Extension context invalidated");
    if (onError) onError();
    return false;
  }

  try {
    storageFunction((result) => {
      if (chrome.runtime.lastError) {
        console.log("No-EM-Dash: Chrome runtime error:", chrome.runtime.lastError);
        if (onError) onError();
        return;
      }
      onSuccess(result);
    });
    return true;
  } catch (error) {
    console.log("No-EM-Dash: Chrome API error:", error);
    if (onError) onError();
    return false;
  }
}

// Helper function to detect platform and get appropriate selectors
function getPlatformSelectors() {
  const isFragDasPDF =
    window.location.hostname.includes("fragdaspdf.de") || window.location.hostname.includes("intellipaper.ai");

  if (isFragDasPDF) {
    return {
      containers: 'div[class*="group-data-[role"], div[class*="flex gap-4"]',
      unprocessed:
        'div[class*="group-data-[role"]:not(.no-em-dash-processed), div[class*="flex gap-4"]:not(.no-em-dash-processed)',
      isFragDasPDF: true,
    };
  } else {
    return {
      containers: 'article[data-testid^="conversation-turn-"]',
      unprocessed: 'article[data-testid^="conversation-turn-"]',
      isFragDasPDF: false,
    };
  }
}

// Check if content has changed since last processing
function hasContentChanged(turn) {
  // Get a more specific content hash that focuses on the actual message content
  const messageContent = turn.querySelector("[data-message-author-role]") || turn;
  const currentContent = messageContent.textContent.trim();
  const lastContent = turn.getAttribute("data-last-content");

  if (currentContent !== lastContent) {
    turn.setAttribute("data-last-content", currentContent);
    return true;
  }
  return false;
}

// Replace em dashes with user's preferred separator
function replaceEmDashes() {
  // Support multiple dash characters that might appear in ChatGPT responses
  const emDash = "—"; // U+2014 EM DASH (primary target)
  const dashVariants = [
    "—", // U+2014 EM DASH (most common in ChatGPT)
    "–", // U+2013 EN DASH (shorter dash)
    "―", // U+2015 HORIZONTAL BAR (similar to em dash)
  ];

  safeStorageCall(
    (callback) => chrome.storage.sync.get(["separator", "customSeparator", "highlight", "enabled"], callback),
    (result) => {
      // Check if extension is disabled
      if (result.enabled === false) {
        return;
      }

      let separator = result.separator || ",";
      const highlight = result.highlight === true; // default to false

      if (separator === "custom") {
        separator = result.customSeparator || ",";
      }

      const replacement = separator;

      // Get platform-specific selectors
      const platform = getPlatformSelectors();
      const conversationTurns = document.querySelectorAll(platform.unprocessed);

      conversationTurns.forEach((turn) => {
        // Check if content has changed or if it's never been processed
        const hasChanged = hasContentChanged(turn);
        const alreadyProcessed = turn.hasAttribute("data-no-em-dash-processed");

        // Process if: never processed, content changed, or forced reprocessing
        if (!alreadyProcessed || hasChanged) {
          // First, remove all existing replacements in this turn to avoid duplicates
          const existingReplacements = turn.querySelectorAll(".no-em-dash-replacement");
          existingReplacements.forEach((span) => {
            const textNode = document.createTextNode("—"); // Restore standard em dash
            span.parentNode.replaceChild(textNode, span);
          });

          // Use TreeWalker on the entire turn to find all text nodes with dash variants
          const treeWalker = document.createTreeWalker(turn, NodeFilter.SHOW_TEXT, {
            acceptNode: function (node) {
              // Skip if inside our own replacement spans (shouldn't exist after cleanup above)
              if (node.parentElement.closest(".no-em-dash-replacement")) {
                return NodeFilter.FILTER_REJECT;
              }
              // Only accept text nodes that contain any dash variants
              const hasDash = dashVariants.some((dash) => node.textContent.includes(dash));
              return hasDash ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            },
          });

          const textNodes = [];
          while (treeWalker.nextNode()) {
            textNodes.push(treeWalker.currentNode);
          }

          // Process all found text nodes
          textNodes.forEach((node) => {
            if (highlight) {
              // Create a regex pattern to match all dash variants
              const dashPattern = new RegExp(`[${dashVariants.join("")}]`, "g");
              const fragment = document.createDocumentFragment();
              let lastIndex = 0;
              let match;

              // Find all dash matches and create spans
              while ((match = dashPattern.exec(node.textContent)) !== null) {
                // Add text before the dash
                if (match.index > lastIndex) {
                  fragment.appendChild(document.createTextNode(node.textContent.slice(lastIndex, match.index)));
                }

                // Add replacement span
                const replacementSpan = document.createElement("span");
                replacementSpan.className = "no-em-dash-replacement";
                replacementSpan.textContent = replacement;
                fragment.appendChild(replacementSpan);

                lastIndex = match.index + match[0].length;
              }

              // Add remaining text after the last dash
              if (lastIndex < node.textContent.length) {
                fragment.appendChild(document.createTextNode(node.textContent.slice(lastIndex)));
              }

              node.parentNode.replaceChild(fragment, node);
            } else {
              // Replace all dash variants with the chosen replacement
              let newText = node.textContent;
              dashVariants.forEach((dash) => {
                newText = newText.replace(new RegExp(dash.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), replacement);
              });
              node.textContent = newText;
            }
          });

          // Mark the turn as processed with timestamp
          turn.setAttribute("data-no-em-dash-processed", Date.now().toString());
        }
      });
    }
  );
}

// Restore original em dashes when extension is disabled
function restoreEmDashes() {
  // Get platform-specific selectors
  const platform = getPlatformSelectors();
  const containers = document.querySelectorAll(platform.containers);

  containers.forEach((container) => {
    // Remove all replacement spans and restore original em dashes
    const replacements = container.querySelectorAll(".no-em-dash-replacement");
    replacements.forEach((span) => {
      const emDashNode = document.createTextNode("—"); // Restore standard em dash
      span.parentNode.replaceChild(emDashNode, span);
    });

    // Clear processing markers
    container.removeAttribute("data-no-em-dash-processed");
    container.removeAttribute("data-last-content");
  });

  // Remove highlighting styles if they exist
  const existingStyle = document.getElementById("no-em-dash-styles");
  if (existingStyle) {
    existingStyle.remove();
  }
}

function handleCopy(event) {
  const selection = window.getSelection();
  if (selection.rangeCount === 0) {
    return;
  }

  const range = selection.getRangeAt(0);
  const selectedContent = range.cloneContents();

  // Check if our span is in the selection
  const hasReplacement = selectedContent.querySelector(".no-em-dash-replacement");

  if (!hasReplacement) {
    // If not, do nothing and let the default copy behavior happen
    return;
  }

  const replacements = selectedContent.querySelectorAll(".no-em-dash-replacement");

  // Replace the spans with their text content
  replacements.forEach((span) => {
    const textNode = document.createTextNode(span.textContent);
    span.parentNode.replaceChild(textNode, span);
  });

  const tempDiv = document.createElement("div");
  tempDiv.appendChild(selectedContent);

  const plainText = tempDiv.innerText;
  const htmlText = tempDiv.innerHTML;

  event.clipboardData.setData("text/plain", plainText);
  event.clipboardData.setData("text/html", htmlText);
  event.preventDefault();
}

// Simple debouncing for content changes
let debounceTimer;
let lastProcessTime = 0;
const DEBOUNCE_DELAY = 200; // Single delay for all scenarios

function scheduleReplacement() {
  safeStorageCall(
    (callback) => chrome.storage.sync.get("enabled", callback),
    (result) => {
      if (result.enabled === false) {
        return; // Extension is disabled, don't process
      }

      // Clear existing timer
      clearTimeout(debounceTimer);

      debounceTimer = setTimeout(() => {
        lastProcessTime = Date.now();
        replaceEmDashes();
      }, DEBOUNCE_DELAY);
    }
  );
}

// Watch for new content
const observer = new MutationObserver((mutations) => {
  let hasRelevantContent = false;
  const platform = getPlatformSelectors();

  // Check if any mutations involve content changes
  mutations.forEach((mutation) => {
    if (mutation.type === "childList" || mutation.type === "characterData") {
      // Check for added nodes
      if (mutation.addedNodes) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
            // Check if this is within a conversation/message container
            const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
            const isRelevantContainer =
              element?.closest(platform.containers.split(", ")[0]) ||
              element?.closest(platform.containers.split(", ")[1]);

            if (isRelevantContainer) {
              hasRelevantContent = true;
            }
          }
        });
      }

      // Check for modified text content
      if (mutation.type === "characterData") {
        const element = mutation.target.parentElement;
        const isRelevantContainer =
          element?.closest(platform.containers.split(", ")[0]) || element?.closest(platform.containers.split(", ")[1]);

        if (isRelevantContainer) {
          hasRelevantContent = true;
        }
      }
    }
  });

  // Schedule processing if any relevant content changes occurred
  if (hasRelevantContent) {
    scheduleReplacement();
  }
});

// Fallback mechanism: periodic check for missed updates
let fallbackInterval;

function startFallbackMonitoring() {
  fallbackInterval = setInterval(() => {
    safeStorageCall(
      (callback) => chrome.storage.sync.get("enabled", callback),
      (result) => {
        if (result.enabled === false) {
          return; // Extension is disabled
        }

        // Only run fallback if no recent processing occurred
        const timeSinceLastProcess = Date.now() - lastProcessTime;
        if (timeSinceLastProcess > 3000) {
          // Reduced to 3 seconds since last processing
          replaceEmDashes();
        }
      },
      () => {
        // On error, stop fallback monitoring
        console.log("No-EM-Dash: Stopping fallback monitoring due to errors");
        stopFallbackMonitoring();
      }
    );
  }, 5000); // Check every 5 seconds (more frequent)
}

function stopFallbackMonitoring() {
  if (fallbackInterval) {
    clearInterval(fallbackInterval);
    fallbackInterval = null;
  }
}

// Listen for storage changes to update settings in real-time
if (chrome && chrome.storage && chrome.storage.onChanged) {
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "sync") {
      let shouldReprocess = false;
      let shouldUpdateStyles = false;
      let shouldRestore = false;

      // Check if extension was enabled/disabled
      if (changes.enabled) {
        const isEnabled = changes.enabled.newValue;
        if (isEnabled === false) {
          // Extension was disabled - restore original em dashes
          shouldRestore = true;
        } else if (isEnabled === true || isEnabled === undefined) {
          // Extension was enabled - process all content
          shouldReprocess = true;
          shouldUpdateStyles = true;
        }
      }

      // Handle restoration (when disabled)
      if (shouldRestore) {
        restoreEmDashes();
        return; // Exit early, no need to reprocess
      }

      // For other settings, check if extension is enabled first
      if (!changes.enabled) {
        safeStorageCall(
          (callback) => chrome.storage.sync.get("enabled", callback),
          (result) => {
            if (result.enabled === false) {
              return; // Extension is disabled, don't process other changes
            }

            // Check if separator-related settings changed
            if (changes.separator || changes.customSeparator) {
              shouldReprocess = true;
            }

            // Check if highlight setting changed
            if (changes.highlight) {
              shouldUpdateStyles = true;
              shouldReprocess = true;
            }

            // Apply the changes
            applyStyleAndProcessingChanges(shouldUpdateStyles, shouldReprocess);
          }
        );
        return;
      }

      // Apply changes if this was an enabled/disabled toggle
      applyStyleAndProcessingChanges(shouldUpdateStyles, shouldReprocess);
    }
  });
}

// Helper function to apply style and processing changes
function applyStyleAndProcessingChanges(shouldUpdateStyles, shouldReprocess) {
  if (shouldUpdateStyles) {
    // Remove existing styles
    const existingStyle = document.getElementById("no-em-dash-styles");
    if (existingStyle) {
      existingStyle.remove();
    }

    // Add styles if highlighting is enabled
    safeStorageCall(
      (callback) => chrome.storage.sync.get("highlight", callback),
      (result) => {
        if (result.highlight === true) {
          addStyles();
        }
      }
    );
  }

  if (shouldReprocess) {
    // Clear all processed markers to force reprocessing
    const platform = getPlatformSelectors();
    const allContainers = document.querySelectorAll(platform.containers);

    allContainers.forEach((container) => {
      container.removeAttribute("data-no-em-dash-processed");
      container.removeAttribute("data-last-content");

      // Remove existing replacement spans
      const existingReplacements = container.querySelectorAll(".no-em-dash-replacement");
      existingReplacements.forEach((span) => {
        const textNode = document.createTextNode(span.textContent);
        span.parentNode.replaceChild(textNode, span);
      });
    });

    // Reprocess all content with new settings
    scheduleReplacement();
  }
}

// Enhanced initialization
window.addEventListener("load", () => {
  safeStorageCall(
    (callback) => chrome.storage.sync.get(["highlight", "enabled"], callback),
    (result) => {
      // Only initialize if extension is enabled (default to enabled if not set)
      if (result.enabled !== false) {
        if (result.highlight === true) {
          addStyles();
        }

        // Initial processing
        replaceEmDashes();
      }
    }
  );

  // Always set up observers and listeners (even when disabled) so they respond to re-enabling
  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true, // Also watch for text changes
  });

  // Set up copy handler
  document.addEventListener("copy", handleCopy);

  // Start fallback monitoring
  startFallbackMonitoring();

  // Handle page visibility changes
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      // Page became visible, do a check (will respect enabled setting)
      scheduleReplacement();
    }
  });
});

// Cleanup on page unload
window.addEventListener("beforeunload", () => {
  stopFallbackMonitoring();
  clearTimeout(debounceTimer);
});
