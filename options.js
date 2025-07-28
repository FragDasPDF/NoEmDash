// Load saved preference
document.addEventListener("DOMContentLoaded", () => {
  const separatorSelect = document.getElementById("separator");
  const highlightCheckbox = document.getElementById("highlight");
  const enabledCheckbox = document.getElementById("enabled");
  const statusElement = document.getElementById("status");
  const customSeparatorWrapper = document.getElementById("custom-separator-wrapper");
  const customSeparatorInput = document.getElementById("custom-separator");

  if (!separatorSelect) {
    console.error("Separator select element not found");
    return;
  }

  if (!highlightCheckbox) {
    console.error("Highlight checkbox element not found");
    return;
  }

  if (!enabledCheckbox) {
    console.error("Enabled checkbox element not found");
    return;
  }

  if (!statusElement) {
    console.error("Status element not found");
    return;
  }

  // Load saved preferences
  chrome.storage.sync.get(["separator", "customSeparator", "highlight", "enabled"], function (result) {
    if (result.separator) {
      separatorSelect.value = result.separator;
    }
    if (result.separator === "custom") {
      customSeparatorWrapper.style.display = "block";
      customSeparatorInput.value = result.customSeparator || "";
    }
    highlightCheckbox.checked = !!result.highlight;
    // Default to enabled if not set (backwards compatibility)
    enabledCheckbox.checked = result.enabled !== false;
  });

  // Function to save settings
  function saveSettings() {
    const separator = separatorSelect.value;
    const highlight = highlightCheckbox.checked;
    const enabled = enabledCheckbox.checked;
    let settings = { separator, highlight, enabled };

    if (separator === "custom") {
      const customSeparator = customSeparatorInput.value;
      if (customSeparator) {
        settings.customSeparator = customSeparator;
      }
    }

    chrome.storage.sync.set(settings, function () {
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

  // Show/hide custom separator input
  separatorSelect.addEventListener("change", () => {
    if (separatorSelect.value === "custom") {
      customSeparatorWrapper.style.display = "block";
    } else {
      customSeparatorWrapper.style.display = "none";
    }
  });

  // Add event listeners to save settings when they change
  separatorSelect.addEventListener("change", saveSettings);
  customSeparatorInput.addEventListener("input", saveSettings);
  highlightCheckbox.addEventListener("change", saveSettings);
  enabledCheckbox.addEventListener("change", saveSettings);
});
