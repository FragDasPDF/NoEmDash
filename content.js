// Function to replace em dashes with the user's preferred separator
function replaceEmDashes() {
  const emDash = "—";

  chrome.storage.sync.get(["separator"], function (result) {
    const separator = result.separator || ",";
    // Add space after comma if that's the separator
    const replacement = separator === "," ? ", " : separator;

    // Target all conversation turns
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

// Create a MutationObserver to watch for new messages
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      replaceEmDashes();
    }
  });
});

// Start observing when the page loads
window.addEventListener("load", () => {
  replaceEmDashes();
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
});
