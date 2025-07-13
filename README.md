# TweetWizard Chrome Extension

A powerful Chrome extension that provides AI-powered tweet suggestions with customizable tones when replying on X (formerly Twitter). Generate engaging, contextually relevant replies with just one click.

## ✨ Features

- **Inline Reply Suggestions**: Generate suggestions directly in X's interface without popups
- **Multiple Tone Presets**: Choose from 6 different writing styles:
  - 🚀 Gen-Z Founder (energetic, innovative, emoji-rich)
  - 💼 Professional (formal, respectful, business-appropriate)
  - 😊 Casual (friendly, conversational, relaxed)
  - 🎯 Witty (clever, humorous, engaging)
  - 🤝 Supportive (encouraging, empathetic, positive)
  - ✏️ Custom (define your own tone)
- **Smart Positioning**: Floating overlay that adapts to X's dynamic interface
- **Dark/Light Mode**: Automatic theme detection matching X's appearance
- **Focus-Triggered**: Non-intrusive - only appears when you focus on reply text areas
- **One-Click Insertion**: Generated suggestions insert directly at cursor position

## 🚀 Installation

### Method 1: Load Unpacked Extension (Recommended for Development)

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/tweetwizard-extension.git
   cd tweetwizard-extension
   ```

2. **Open Chrome Extension Management**:

   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)

3. **Load the extension**:
   - Click "Load unpacked"
   - Select the project folder
   - The extension should appear in your extensions list

### Method 2: Install from Chrome Web Store

_Coming soon - extension will be published to Chrome Web Store_

## ⚙️ Setup

### 1. Get an OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key (starts with `sk-`)

### 2. Configure the Extension

1. Click the TweetWizard icon in your Chrome toolbar
2. Click "Open Options" or right-click the extension icon → "Options"
3. Enter your OpenAI API key
4. Select your preferred tone preset or create a custom one
5. Click "Save Settings"

## 🎯 Usage

### Basic Usage

1. **Navigate to X (twitter.com)** and log in
2. **Find a tweet** you want to reply to
3. **Click the reply button** on any tweet
4. **Focus on the text area** - the TweetWizard overlay will appear
5. **Click "Generate"** to get AI-powered suggestions
6. **Click any suggestion** to insert it into your reply
7. **Edit if needed** and send your reply

### Advanced Features

- **Tone Customization**: Visit the options page to switch between different writing styles
- **Custom Tones**: Define your own tone with specific instructions and examples
- **Smart Positioning**: The overlay automatically positions itself optimally near the text area
- **Error Handling**: Comprehensive error messages help troubleshoot API issues

## 🛠️ Technical Details

### Architecture

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Content Script**: Injected at document_start for optimal performance
- **Floating Overlay**: Immune to X's SPA framework DOM manipulation
- **Modern CSS**: Uses CSS variables with dark/light mode support
- **Event-Driven**: Responds to focus events and DOM mutations

### Key Files

- `manifest.json` - Extension configuration and permissions
- `content.js` - Main functionality and UI injection (881 lines)
- `content.css` - Styling that matches X's design language (249 lines)
- `options.js` - Settings management and tone configuration
- `popup.js` - Status interface showing current configuration
- `background.js` - Service worker for extension lifecycle

### Browser Compatibility

- **Chrome**: 88+ (Manifest V3 support)
- **Edge**: 88+ (Chromium-based)
- **Other Chromium browsers**: Should work with Manifest V3 support

## 🔧 Development

### Prerequisites

- Chrome browser (88+)
- OpenAI API key
- Basic understanding of Chrome extensions

### Development Setup

1. Clone the repository
2. Load as unpacked extension in Chrome
3. Make changes to the code
4. Reload the extension in `chrome://extensions/`
5. Test on X (twitter.com)

### Project Structure

```
tweetwizard-extension/
├── manifest.json          # Extension configuration
├── content.js            # Main content script
├── content.css          # Styling for injected UI
├── options.html         # Options page HTML
├── options.js           # Options page functionality
├── popup.html           # Extension popup HTML
├── popup.js             # Extension popup functionality
├── background.js        # Service worker
└── README.md            # This file
```

### Key Components

#### Content Script (`content.js`)

- Detects reply text areas on X
- Injects floating overlay UI
- Handles API communication with OpenAI
- Manages text insertion and event handling

#### Styling (`content.css`)

- Matches X's current design language
- Supports dark/light mode detection
- Uses aggressive CSS specificity to override X's styles
- Responsive design for different screen sizes

#### Options Page (`options.js`)

- Manages API key storage
- Handles tone preset configuration
- Provides custom tone editing interface

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Reporting Issues

1. Check existing issues first
2. Create a detailed bug report including:
   - Chrome version
   - Extension version
   - Steps to reproduce
   - Expected vs actual behavior
   - Console errors (if any)

### Submitting Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and patterns
- Test thoroughly on X (twitter.com)
- Ensure compatibility with X's frequent UI changes
- Add comments for complex logic
- Update README if adding new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🚨 Disclaimer

This extension is not affiliated with X (formerly Twitter) or OpenAI. It's an independent project designed to enhance the X user experience. Use responsibly and in accordance with X's Terms of Service and OpenAI's usage policies.

## 🔮 Roadmap

- [ ] Chrome Web Store publication
- [ ] Support for additional AI providers (Claude, Gemini)
- [ ] Thread-aware suggestions
- [ ] Sentiment analysis integration
- [ ] Bulk reply generation
- [ ] Analytics and usage insights
- [ ] Custom prompt templates

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/tweetwizard-extension/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/tweetwizard-extension/discussions)
- **Email**: support@tweetwizard.dev

## 🏆 Acknowledgments

- OpenAI for providing the GPT API
- X (Twitter) for the platform
- The Chrome Extensions community for resources and support
- All contributors and users who make this project possible

---

**Made with ❤️ by the TweetWizard team**
