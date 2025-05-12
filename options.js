// No-EM-Dash Options Script
// Handles saving and loading the user's separator preference for the extension

// Load saved separator preference on page load
document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get(["separator"], function (result) {
    if (result.separator) {
      document.getElementById("separator").value = result.separator;
    }
  });
});

// Save separator preference when changed
// Shows a status message to the user
// This ensures the user's choice is persisted across sessions and devices
document.getElementById("separator").addEventListener("change", (e) => {
  const separator = e.target.value;
  chrome.storage.sync.set({ separator }, function () {
    // Notify the user that the setting was saved
    const status = document.getElementById("status");
    status.textContent = "Settings saved.";
    status.style.display = "block";
    setTimeout(() => {
      status.style.display = "none";
    }, 2000);
  });
});
