# UploadEase 🚀

A powerful Chrome extension that automatically detects file upload requirements and helps you process files to meet those specifications. No more manual resizing, format conversion, or size optimization!

## ✨ Features

### 🎯 Smart Detection
- **Automatic Detection**: Automatically detects file upload fields on any website
- **Requirement Parsing**: Intelligently parses size limits, format requirements, and dimension constraints
- **Smart Assistance**: Shows helpful prompts when upload requirements are detected

### 🖼️ Image Processing
- **Resize Images**: Resize images to specific dimensions while maintaining aspect ratio
- **Format Conversion**: Convert between PNG, JPEG, WebP, and PDF formats
- **Quality Control**: Adjust compression quality for optimal file size
- **Aspect Ratio Warnings**: Warns when resizing might distort the image

### 📄 File Conversion
- **Image to PDF**: Convert images to PDF documents
- **PDF to Image**: Convert PDF pages to images (with PDF.js integration)
- **Format Flexibility**: Support for all major image and document formats

### 🎨 User Experience
- **Drag & Drop**: Intuitive drag-and-drop interface
- **Real-time Preview**: See file information and processing results instantly
- **Smart Suggestions**: Auto-fills detected requirements
- **Modern UI**: Beautiful, responsive interface

### ⚙️ Advanced Features
- **Batch Processing**: Process multiple files at once
- **Custom Settings**: Comprehensive settings page with preferences
- **File Size Optimization**: Automatic compression to meet size limits
- **Metadata Preservation**: Option to preserve EXIF data

## 🚀 How It Works

1. **Detection**: When you visit a website with file upload fields, UploadEase automatically detects the requirements
2. **Assistance Prompt**: A friendly prompt appears asking if you need help with file processing
3. **File Upload**: Drag and drop or select your file in the extension popup
4. **Smart Processing**: The extension automatically suggests optimal settings based on detected requirements
5. **Processing**: Resize, convert, and optimize your file with one click
6. **Easy Upload**: Either download the processed file or use drag-and-drop to upload directly

## 📦 Installation

### From Chrome Web Store (Coming Soon)
1. Visit the Chrome Web Store
2. Search for "UploadEase"
3. Click "Add to Chrome"

### Manual Installation (Developer Mode)
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The UploadEase icon should appear in your browser toolbar

## 🛠️ Development

### Project Structure
```
UploadEase/
├── manifest.json          # Extension manifest
├── background.js          # Service worker
├── content/
│   ├── content.js         # Main content script
│   ├── content.css        # Content script styles
│   └── fileDetector.js    # File upload detection
├── popup/
│   ├── popup.html         # Popup interface
│   ├── popup.css          # Popup styles
│   └── popup.js           # Popup functionality
├── options/
│   ├── options.html       # Settings page
│   ├── options.css        # Settings styles
│   └── options.js         # Settings functionality
├── utils/
│   ├── fileProcessor.js   # Image processing utilities
│   ├── fileConverter.js   # Format conversion utilities
│   ├── validators.js      # Validation functions
│   └── storageManager.js  # Storage utilities
├── icons/                 # Extension icons
└── _locales/             # Localization files
```

### Building from Source
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/UploadEase.git
   cd UploadEase
   ```

2. No build process required - the extension uses vanilla JavaScript and can be loaded directly

3. Load the extension in Chrome:
   - Open `chrome://extensions/`
   - Enable Developer mode
   - Click "Load unpacked" and select the UploadEase folder

## 🎯 Usage Examples

### Passport Photo Upload
1. Visit a government website requiring passport photos
2. UploadEase detects: "Image required, 2x2 inches, 50-100KB"
3. Upload your photo
4. Extension automatically resizes to 2x2 inches and compresses to meet size requirements
5. Drag and drop the processed photo directly to the upload field

### Document Upload
1. Visit a job application site requiring PDF resume
2. UploadEase detects: "PDF required, max 2MB"
3. Upload your Word document or image
4. Convert to PDF and compress if needed
5. Download or drag-and-drop the processed PDF

### Social Media Image
1. Visit a social media platform with image upload
2. UploadEase detects: "Image required, max 1920x1080px, 5MB"
3. Upload your high-resolution photo
4. Resize to fit within dimensions and compress
5. Upload the optimized image

## ⚙️ Settings

Access settings by clicking the gear icon in the extension popup:

- **Auto-detection**: Enable/disable automatic file upload detection
- **Notifications**: Control browser notifications
- **Default Format**: Set preferred output format
- **Default Dimensions**: Set default resize dimensions
- **Quality Settings**: Adjust compression quality
- **File Size Limits**: Set maximum file sizes
- **Advanced Options**: High-quality resizing, metadata preservation

## 🔧 Technical Details

### Supported Formats
- **Images**: PNG, JPEG, WebP, GIF
- **Documents**: PDF
- **Conversions**: All image formats ↔ PDF

### Browser Compatibility
- Chrome 88+
- Edge 88+ (Chromium-based)
- Other Chromium-based browsers

### Performance
- Lightweight: < 1MB total size
- Fast processing: Uses Canvas API for image manipulation
- Memory efficient: Processes files in chunks for large files

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Chrome Extensions API documentation
- Canvas API for image processing
- Modern web standards for file handling
- Open source community for inspiration

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/UploadEase/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/UploadEase/discussions)
- **Email**: support@uploadease.com

## 🗺️ Roadmap

- [ ] PDF.js integration for better PDF handling
- [ ] Batch processing multiple files
- [ ] Cloud storage integration
- [ ] Advanced image filters and effects
- [ ] Video file processing
- [ ] OCR text extraction from images
- [ ] AI-powered automatic optimization

---

Made with ❤️ for the web community
