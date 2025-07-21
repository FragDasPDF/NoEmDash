function localizeHtmlPage() {
  // Localize using data-localize attributes
  const elements = document.querySelectorAll("[data-localize]");
  elements.forEach((element) => {
    const messageKey = element.getAttribute("data-localize");
    const translatedMessage = chrome.i18n.getMessage(messageKey);
    if (translatedMessage) {
      element.innerHTML = translatedMessage;
    }
  });

  // Localize title
  const titleElement = document.querySelector("title");
  if (titleElement) {
    const messageKey = titleElement.textContent.match(/__MSG_(\w+)__/);
    if (messageKey && messageKey[1]) {
      const translatedTitle = chrome.i18n.getMessage(messageKey[1]);
      if (translatedTitle) {
        titleElement.textContent = translatedTitle;
      }
    }
  }
}

document.addEventListener("DOMContentLoaded", localizeHtmlPage);
