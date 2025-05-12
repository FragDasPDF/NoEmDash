# No-EM-Dash Chrome Extension

Replace em dashes (—) in ChatGPT, FragDasPDF, Intellipaper, and similar sites with your preferred separator (comma, colon, parentheses, or hyphen).

## Features

- Automatically replaces em dashes in chat and message content
- Works on chat.openai.com, chatgpt.com, fragdaspdf.de, and intellipaper.ai
- Choose your preferred separator in the options page
- Modern, accessible, and responsive options UI
- No unnecessary permissions or background scripts

## Installation

1. Download or clone this repository.
2. Build the extension (optional, for `dist/` folder):
   ```bash
   npm install
   npm run build
   ```
   Or, use the root folder directly.
3. Open Chrome and go to `chrome://extensions/`.
4. Enable "Developer mode" (top right).
5. Click "Load unpacked" and select the `dist/` folder (or the root folder if not using a build step).

## Usage

- The extension will automatically replace em dashes in supported sites.
- To change the separator, right-click the extension icon and choose "Options" (or go to the options page in the extension menu).
- Select your preferred separator and your choice will be saved and synced.

## Support

- If you encounter issues, please open an issue on the repository or contact the author.
- No user data is collected or transmitted.

## License

MIT
