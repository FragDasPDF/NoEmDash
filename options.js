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

  // Load saved preferences
  chrome.storage.sync.get(["separator", "highlight"], function (result) {
    if (result.separator) {
      separatorSelect.value = result.separator;
    }
    highlightCheckbox.checked = !!result.highlight;
  });

  // Function to save settings
  function saveSettings() {
    const separator = separatorSelect.value;
    const highlight = highlightCheckbox.checked;

    chrome.storage.sync.set({ separator, highlight }, function () {
      if (chrome.runtime.lastError) {
        console.error("Error saving settings:", chrome.runtime.lastError);
        statusElement.textContent = chrome.i18n.getMessage("statusError");
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

  // Add event listeners to save settings when they change
  separatorSelect.addEventListener("change", saveSettings);
  highlightCheckbox.addEventListener("change", saveSettings);
});
