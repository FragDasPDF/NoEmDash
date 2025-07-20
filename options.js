// Load saved preference
document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get(["separator"], function (result) {
    if (result.separator) {
      document.getElementById("separator").value = result.separator;
    }
  });
});

// Save when changed
document.getElementById("separator").addEventListener("change", (e) => {
  const separator = e.target.value;
  chrome.storage.sync.set({ separator }, function () {
    const status = document.getElementById("status");
    status.textContent = "Settings saved.";
    status.style.display = "block";
    setTimeout(() => {
      status.style.display = "none";
    }, 2000);
  });
});
