// Replace em dashes with user's preferred separator
function replaceEmDashes() {
  const emDash = "—";

  chrome.storage.sync.get(["separator"], function (result) {
    const separator = result.separator || ",";
    const replacement = separator === "," ? ", " : separator;

    const conversationTurns = document.querySelectorAll('article[data-testid^="conversation-turn-"]');

    conversationTurns.forEach((turn) => {
      const textElements = turn.querySelectorAll(".whitespace-pre-wrap, .text-message");

      textElements.forEach((element) => {
        if (element.textContent.includes(emDash)) {
          element.textContent = element.textContent.replace(new RegExp(emDash, "g"), replacement);
        }
      });
    });
  });
}

// Watch for new content
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      replaceEmDashes();
    }
  });
});

window.addEventListener("load", () => {
  replaceEmDashes();
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
});
