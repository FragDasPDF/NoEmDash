// content.js

function addStyles() {
  const style = document.createElement("style");
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

// Replace em dashes with user's preferred separator
function replaceEmDashes() {
  const emDash = "—";

  chrome.storage.sync.get(["separator", "highlight"], function (result) {
    const separator = result.separator || ",";
    const highlight = result.highlight !== false; // default to true
    let replacement;

    if (separator === "()") {
      replacement = "()";
    } else if (separator === ",") {
      replacement = ",";
    } else {
      replacement = separator;
    }

    const conversationTurns = document.querySelectorAll('article[data-testid^="conversation-turn-"]');

    conversationTurns.forEach((turn) => {
      // If the turn is already processed or is currently streaming, skip it.
      // We detect streaming by looking for the blinking cursor.
      if (turn.hasAttribute("data-no-em-dash-processed") || turn.querySelector(".blink")) {
        return;
      }

      const textElements = turn.querySelectorAll(".whitespace-pre-wrap, .text-message");

      textElements.forEach((element) => {
        const treeWalker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        const textNodes = [];
        while (treeWalker.nextNode()) {
          // Don't replace inside our own replacement spans
          if (highlight && treeWalker.currentNode.parentElement.closest(".no-em-dash-replacement")) {
            continue;
          }
          if (treeWalker.currentNode.textContent.includes(emDash)) {
            textNodes.push(treeWalker.currentNode);
          }
        }

        textNodes.forEach((node) => {
          if (highlight) {
            const fragment = document.createDocumentFragment();
            const parts = node.textContent.split(emDash);

            parts.forEach((part, index) => {
              fragment.appendChild(document.createTextNode(part));
              if (index < parts.length - 1) {
                const replacementSpan = document.createElement("span");
                replacementSpan.className = "no-em-dash-replacement";
                replacementSpan.textContent = replacement;
                fragment.appendChild(replacementSpan);
              }
            });
            node.parentNode.replaceChild(fragment, node);
          } else {
            const newText = node.textContent.replace(new RegExp(emDash, "g"), replacement);
            node.textContent = newText;
          }
        });
      });

      // Mark the turn as processed
      turn.setAttribute("data-no-em-dash-processed", "true");
    });
  });
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

// Watch for new content
const observer = new MutationObserver((mutations) => {
  // Use a timeout to debounce the function call, so it doesn't fire excessively during streaming
  let timerId;
  clearTimeout(timerId);
  timerId = setTimeout(() => {
    replaceEmDashes();
  }, 500);
});

window.addEventListener("load", () => {
  chrome.storage.sync.get("highlight", (result) => {
    if (result.highlight !== false) {
      addStyles();
    }
  });
  replaceEmDashes();
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
  document.addEventListener("copy", handleCopy);
});
