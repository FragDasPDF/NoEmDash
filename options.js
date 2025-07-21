// Load saved preference
document.addEventListener("DOMContentLoaded", () => {
  const separatorSelect = document.getElementById("separator");
  const highlightCheckbox = document.getElementById("highlight");
  const statusElement = document.getElementById("status");

  if (!separatorSelect) {
    console.error("Separator select element not found");
    return;
  }

  if (!highlightCheckbox) {
    console.error("Highlight checkbox element not found");
    return;
  }

  if (!statusElement) {
    console.error("Status element not found");
    return;
  }

  chrome.storage.sync.get(["separator"], function (result) {
    if (result.separator) {
      separatorSelect.value = result.separator;
    }
    if (result.highlight) {
      highlightCheckbox.checked = result.highlight;
    }
  });
});

// Save when changed
document.addEventListener("DOMContentLoaded", () => {
  const separatorSelect = document.getElementById("separator");
  const highlightCheckbox = document.getElementById("highlight");
  const statusElement = document.getElementById("status");

  if (!separatorSelect || !statusElement || !highlightCheckbox) {
    return;
  }

  function saveSettings() {
    const separator = separatorSelect.value;
    const highlight = highlightCheckbox.checked;

    chrome.storage.sync.set({ separator, highlight }, function () {
      if (chrome.runtime.lastError) {
        console.error("Error saving settings:", chrome.runtime.lastError);
        statusElement.textContent = "Error saving settings.";
        statusElement.style.color = "#ff6b6b";
      } else {
        statusElement.textContent = chrome.i18n.getMessage("statusSaved");
        statusElement.style.color = "#FFD600";
      }

      statusElement.style.display = "block";
      setTimeout(() => {
        statusElement.style.display = "none";
      }, 2000);
    });
  }

  separatorSelect.addEventListener("change", saveSettings);
  highlightCheckbox.addEventListener("change", saveSettings);
});
