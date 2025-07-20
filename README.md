# No-EM-Dash Chrome Extension

Replace em dashes (—) in ChatGPT, FragDasPDF, Intellipaper, and similar sites with your preferred separator (comma, colon, parentheses, or hyphen).

## Features

- **Automatic Replacement**: Automatically replaces em dashes in chat and message content
- **Multi-Site Support**: Works on chat.openai.com, chatgpt.com, intellipaper.ai, and fragdaspdf.de
- **Customizable Separators**: Choose your preferred separator in the options page
- **Real-time Updates**: Changes apply immediately without page refresh
- **Modern UI**: Clean, accessible, and responsive options interface
- **Popup Interface**: Quick access to settings via extension popup
- **Privacy-First**: No data collection or external tracking
- **Performance Optimized**: Efficient DOM manipulation with debouncing

## Installation

### From Source

1. Clone this repository:

   ```bash
   git clone https://github.com/yourusername/No-EM-Dash.git
   cd No-EM-Dash
   ```

2. Install dependencies and build:

   ```bash
   npm install
   npm run build
   ```

3. Load in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked" and select the `dist/` folder

### Direct Installation

- Use the root folder directly if you prefer not to build
- Follow steps 3-5 from above, but select the root folder instead

## 🎯 Usage

1. **Automatic Operation**: The extension works automatically on supported sites
2. **Change Settings**:
   - Click the extension icon in the toolbar for quick access
   - Or right-click the extension icon and choose "Options"
   - Select your preferred separator and save

### Supported Separators

- **Comma (,)** - Default, adds space after comma
- **Colon (:)** - Simple colon replacement
- **Parentheses ( )** - Wraps content in parentheses
- **Hyphen (-)** - Simple hyphen replacement

## 🛠️ Development

### Project Structure

```
No-EM-Dash/
├── manifest.json      # Extension configuration
├── content.js         # Content script for DOM manipulation
├── options.html       # Options page UI
├── options.js         # Options page logic
├── popup.html         # Extension popup UI
├── popup.js           # Popup logic
├── build.js           # Build script
├── icons/             # Extension icons
├── img/               # Images and assets
└── dist/              # Built extension (generated)
```

### Available Scripts

- `npm run build` - Build the extension to `dist/` folder
- `npm run clean` - Remove the `dist/` folder
- `npm run package` - Clean and rebuild the extension

### Best Practices Implemented

#### Security

- ✅ Content Security Policy (CSP) configured
- ✅ Input sanitization to prevent XSS
- ✅ Minimal permissions (only `storage`)
- ✅ Secure external links with `rel="noopener noreferrer"`

#### Performance

- ✅ Debounced DOM operations (300ms delay)
- ✅ Efficient mutation observer with targeted checks
- ✅ Lazy loading and cleanup on page unload
- ✅ Optimized selectors and DOM queries

#### Accessibility

- ✅ ARIA labels and roles
- ✅ Keyboard navigation support
- ✅ Screen reader friendly
- ✅ High contrast color schemes
- ✅ Semantic HTML structure

#### User Experience

- ✅ Real-time status feedback
- ✅ Error handling with user-friendly messages
- ✅ Loading states and progress indicators
- ✅ Responsive design for all screen sizes
- ✅ Intuitive popup interface

#### Code Quality

- ✅ Strict mode JavaScript
- ✅ Comprehensive error handling
- ✅ Consistent code formatting
- ✅ Modular architecture
- ✅ Clear documentation

## 🔧 Technical Details

### Manifest V3 Compliance

- Uses Manifest V3 for modern Chrome extension standards
- Implements proper content security policies
- Follows Chrome Web Store guidelines

### Storage

- Uses `chrome.storage.sync` for cross-device synchronization
- Graceful fallback handling for storage errors
- Automatic preference persistence

### Content Scripts

- Runs at `document_end` for optimal timing
- Implements efficient mutation observation
- Handles dynamic content loading
- Includes proper cleanup and error handling

## 🐛 Troubleshooting

### Common Issues

**Extension not working on a site:**

- Check if the site is in the supported domains list
- Ensure the extension is enabled
- Try refreshing the page

**Settings not saving:**

- Check Chrome's storage permissions
- Try disabling and re-enabling the extension
- Clear browser cache if needed

**Performance issues:**

- The extension includes debouncing to prevent excessive DOM manipulation
- Check browser console for any error messages

### Debug Mode

Enable debug logging by opening the browser console and looking for "No-EM-Dash" messages.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and patterns
- Add error handling for new features
- Test on multiple supported sites
- Update documentation for new features
- Ensure accessibility compliance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Powered by [intellipaper.ai](https://intellipaper.ai) - Read, Write, and Research 10x Faster
- Built with modern Chrome extension best practices
- Inspired by the need for better text formatting in AI conversations

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/No-EM-Dash/issues)
- **Email**: matthias@intellipaper.ai
- **Website**: [intellipaper.ai](https://intellipaper.ai)

---

**Note**: This extension does not collect, store, or transmit any user data. All processing happens locally in your browser.
