// No-EM-Dash Content Script
// Replaces em dashes in ChatGPT and supported sites with the user's preferred separator

/**
 * Replaces all em dashes in relevant conversation elements with the user's chosen separator.
 * For ChatGPT, targets conversation turns and their text content.
 */
function replaceEmDashes() {
  const emDash = "—";

  chrome.storage.sync.get(["separator"], function (result) {
    const separator = result.separator || ",";
    // Add space after comma if that's the separator
    const replacement = separator === "," ? ", " : separator;

    // Target all conversation turns in ChatGPT and similar UIs
    const conversationTurns = document.querySelectorAll('article[data-testid^="conversation-turn-"]');

    conversationTurns.forEach((turn) => {
      // Find all text content within the conversation turn
      const textElements = turn.querySelectorAll(".whitespace-pre-wrap, .text-message");

      textElements.forEach((element) => {
        if (element.textContent.includes(emDash)) {
          element.textContent = element.textContent.replace(new RegExp(emDash, "g"), replacement);
        }
      });
    });
  });
}

// Observe DOM changes to handle dynamically loaded content (e.g., new chat messages)
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      replaceEmDashes();
    }
  });
});

// Initial run and observer setup on page load
window.addEventListener("load", () => {
  replaceEmDashes();
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
});
