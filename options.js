// Load saved separator preference
document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get(["separator"], function (result) {
    if (result.separator) {
      document.getElementById("separator").value = result.separator;
    }
  });
});

// Save separator preference when changed
document.getElementById("separator").addEventListener("change", (e) => {
  const separator = e.target.value;
  chrome.storage.sync.set({ separator }, function () {
    // Notify the user that the setting was saved
    const status = document.createElement("div");
    status.textContent = "Settings saved.";
    status.style.color = "green";
    status.style.marginTop = "10px";
    document.body.appendChild(status);
    setTimeout(() => {
      status.remove();
    }, 2000);
  });
});
