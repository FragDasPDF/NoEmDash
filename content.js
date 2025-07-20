// Replace em dashes with user's preferred separator
function replaceEmDashes() {
  const emDash = "—";

  chrome.storage.sync.get(["separator"], function (result) {
    const separator = result.separator || ",";
    let replacement;

    if (separator === "()") {
      replacement = " (";
    } else if (separator === ",") {
      replacement = ", ";
    } else {
      replacement = separator;
    }

    const conversationTurns = document.querySelectorAll('article[data-testid^="conversation-turn-"]');

    conversationTurns.forEach((turn) => {
      const textElements = turn.querySelectorAll(".whitespace-pre-wrap, .text-message");

      textElements.forEach((element) => {
        if (element.textContent.includes(emDash)) {
          let newText = element.textContent.replace(new RegExp(emDash, "g"), replacement);

          // For parentheses, we need to add closing parenthesis after the next sentence or at the end
          if (separator === "()") {
            // Add closing parenthesis at the end of the text or before the next sentence
            const sentences = newText.split(/(?<=[.!?])\s+/);
            if (sentences.length > 1) {
              // Find where the opening parenthesis was added and add closing parenthesis before the next sentence
              const firstSentence = sentences[0];
              if (firstSentence.includes(" (")) {
                const parts = firstSentence.split(" (");
                if (parts.length > 1) {
                  // Add closing parenthesis before the next sentence
                  sentences[0] = parts[0] + " (" + parts[1] + ")";
                  newText = sentences.join(" ");
                }
              }
            } else {
              // If there's only one sentence, add closing parenthesis at the end
              if (newText.includes(" (")) {
                newText = newText + ")";
              }
            }
          }

          element.textContent = newText;
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
