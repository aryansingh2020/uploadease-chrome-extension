// popup/popup.js - Main popup functionality

class UploadEasePopup {
    constructor() {
        this.currentFile = null;
        this.processedBlob = null;
        this.detectedFields = [];
        this.originalImageData = null;

        this.initializeElements();
        this.setupEventListeners();
        this.loadDetectedFields();
        this.loadSettings();
    }

    initializeElements() {
        // File upload elements
        this.uploadArea = document.getElementById('upload-area');
        this.fileInput = document.getElementById('file-input');
        this.fileInfo = document.getElementById('file-info');
        this.fileName = document.getElementById('file-name');
        this.fileSize = document.getElementById('file-size');
        this.removeFileBtn = document.getElementById('remove-file');

        // Requirements elements
        this.requirementsSection = document.getElementById('requirements-section');
        this.requirementsList = document.getElementById('requirements-list');

        // Options elements
        this.optionsSection = document.getElementById('options-section');
        this.widthInput = document.getElementById('width-input');
        this.heightInput = document.getElementById('height-input');
        this.formatSelect = document.getElementById('format-select');
        this.maxSizeInput = document.getElementById('max-size-input');
        this.minSizeInput = document.getElementById('min-size-input');
        this.qualityGroup = document.getElementById('quality-group');
        this.qualitySlider = document.getElementById('quality-slider');
        this.qualityValue = document.getElementById('quality-value');
        this.aspectRatioWarning = document.getElementById('aspect-ratio-warning');

        // Action elements
        this.actionButtons = document.getElementById('action-buttons');
        this.processBtn = document.getElementById('process-btn');
        this.downloadBtn = document.getElementById('download-btn');

        // Status elements
        this.processingStatus = document.getElementById('processing-status');
        this.resultsSection = document.getElementById('results-section');
        this.originalSize = document.getElementById('original-size');
        this.newSize = document.getElementById('new-size');
        this.sizeReduction = document.getElementById('size-reduction');

        // Footer elements
        this.footerStatus = document.getElementById('footer-status');
        this.settingsBtn = document.getElementById('settings-btn');
    }

    setupEventListeners() {
        // File upload
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        this.uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.uploadArea.addEventListener('drop', this.handleDrop.bind(this));
        this.fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        this.removeFileBtn.addEventListener('click', this.removeFile.bind(this));

        // Dimension inputs
        this.widthInput.addEventListener('input', this.handleDimensionChange.bind(this));
        this.heightInput.addEventListener('input', this.handleDimensionChange.bind(this));

        // Format change
        this.formatSelect.addEventListener('change', this.handleFormatChange.bind(this));

        // Quality slider
        this.qualitySlider.addEventListener('input', this.handleQualityChange.bind(this));

        // Action buttons
        this.processBtn.addEventListener('click', this.processFile.bind(this));
        this.downloadBtn.addEventListener('click', this.downloadFile.bind(this));

        // Settings
        // this.settingsBtn.addEventListener('click', this.openSettings.bind(this));
    }

    async loadDetectedFields() {
        try {
            const response = await chrome.runtime.sendMessage({ type: "GET_FIELDS" });
            if (response && response.fields) {
                this.detectedFields = response.fields;
                this.displayRequirements();
            }
        } catch (error) {
            console.error('Error loading detected fields:', error);
        }
    }

    async loadSettings() {
        try {
            const settings = await chrome.storage.sync.get([
                'defaultFormat', 'defaultWidth', 'defaultHeight'
            ]);

            if (settings.defaultFormat) {
                this.formatSelect.value = settings.defaultFormat;
            }
            if (settings.defaultWidth) {
                this.widthInput.value = settings.defaultWidth;
            }
            if (settings.defaultHeight) {
                this.heightInput.value = settings.defaultHeight;
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    displayRequirements() {
        if (this.detectedFields.length === 0) return;

        const requirements = [];
        this.detectedFields.forEach(field => {
            if (field.allowedTypes && field.allowedTypes.length > 0) {
                // Simplify file types display - show only main categories
                const mainTypes = this.simplifyFileTypes(field.allowedTypes);
                requirements.push(`• File types: ${mainTypes.join(', ')}`);
            }
            if (field.maxSizeBytes) {
                requirements.push(`• Max size: ${this.formatFileSize(field.maxSizeBytes)}`);
            }
            if (field.minSizeBytes) {
                requirements.push(`• Min size: ${this.formatFileSize(field.minSizeBytes)}`);
            }
            if (field.constraints && field.constraints.length > 0) {
                field.constraints.forEach(constraint => {
                    if (constraint.type === 'dimensions') {
                        requirements.push(`• Dimensions: ${constraint.width}×${constraint.height}px`);
                    }
                });
            }
        });

        if (requirements.length > 0) {
            this.requirementsList.innerHTML = requirements.join('<br>');
            this.requirementsSection.style.display = 'block';
            this.requirementsSection.classList.add('fade-in');
        }
    }

    simplifyFileTypes(types) {
        const categories = {
            'Images': ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff', 'image/heic'],
            'Documents': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            'Presentations': ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
            'Spreadsheets': ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
        };

        const detectedCategories = [];

        Object.keys(categories).forEach(category => {
            if (categories[category].some(type => types.includes(type))) {
                detectedCategories.push(category);
            }
        });

        // If we have specific file extensions, show them instead
        const extensions = types.filter(type => type.startsWith('.'));
        if (extensions.length > 0 && extensions.length <= 5) {
            return extensions.map(ext => ext.toUpperCase());
        }

        return detectedCategories.length > 0 ? detectedCategories : ['Multiple formats'];
    }

    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.handleFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.handleFile(file);
        }
    }

    handleFile(file) {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            this.showError('Please select a valid image or PDF file.');
            return;
        }

        this.currentFile = file;
        this.displayFileInfo();
        this.showOptions();
        this.updateFooterStatus(`File loaded: ${file.name}`);
    }

    displayFileInfo() {
        this.fileName.textContent = this.currentFile.name;
        this.fileSize.textContent = this.formatFileSize(this.currentFile.size);
        this.fileInfo.style.display = 'flex';
        this.fileInfo.classList.add('fade-in');
    }

    showOptions() {
        this.optionsSection.style.display = 'block';
        this.optionsSection.classList.add('slide-up');
        this.actionButtons.style.display = 'flex';
        this.actionButtons.classList.add('fade-in');

        // Auto-fill dimensions for images
        if (this.currentFile.type.startsWith('image/')) {
            this.loadImageDimensions();
        }

        // Show quality slider for JPEG
        this.handleFormatChange();
    }

    async loadImageDimensions() {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                this.originalImageData = {
                    width: img.width,
                    height: img.height,
                    aspectRatio: img.width / img.height
                };

                // Auto-fill detected requirements
                if (this.detectedFields.length > 0) {
                    const field = this.detectedFields[0];
                    if (field.constraints && field.constraints.length > 0) {
                        const dimensionConstraint = field.constraints.find(c => c.type === 'dimensions');
                        if (dimensionConstraint) {
                            this.widthInput.value = dimensionConstraint.width;
                            this.heightInput.value = dimensionConstraint.height;
                        }
                    }
                    if (field.maxSizeBytes) {
                        this.maxSizeInput.value = Math.round(field.maxSizeBytes / 1024);
                    }
                    if (field.minSizeBytes) {
                        this.minSizeInput.value = Math.round(field.minSizeBytes / 1024);
                    }
                }
                resolve();
            };
            img.src = URL.createObjectURL(this.currentFile);
        });
    }

    handleDimensionChange() {
        if (!this.originalImageData) return;

        const width = parseInt(this.widthInput.value) || this.originalImageData.width;
        const height = parseInt(this.heightInput.value) || this.originalImageData.height;
        const newRatio = width / height;
        const originalRatio = this.originalImageData.aspectRatio;

        if (Math.abs(newRatio - originalRatio) > 0.01) {
            this.aspectRatioWarning.style.display = 'block';
        } else {
            this.aspectRatioWarning.style.display = 'none';
        }
    }

    handleFormatChange() {
        const format = this.formatSelect.value;
        if (format === 'jpeg') {
            this.qualityGroup.style.display = 'block';
        } else {
            this.qualityGroup.style.display = 'none';
        }
    }

    handleQualityChange() {
        const quality = Math.round(this.qualitySlider.value * 100);
        this.qualityValue.textContent = `${quality}%`;
    }

    async processFile() {
        if (!this.currentFile) {
            this.showError('Please select a file first.');
            return;
        }

        this.showProcessing();

        try {
            const width = parseInt(this.widthInput.value) || null;
            const height = parseInt(this.heightInput.value) || null;
            const format = this.formatSelect.value;
            const quality = parseFloat(this.qualitySlider.value);
            const maxSizeKB = parseInt(this.maxSizeInput.value);
            const minSizeKB = parseInt(this.minSizeInput.value);

            let processedBlob;

            if (this.currentFile.type.startsWith('image/')) {
                processedBlob = await this.processImage(width, height, format, quality);
            } else if (this.currentFile.type === 'application/pdf') {
                processedBlob = await this.processPDF(format);
            } else {
                throw new Error('Unsupported file type');
            }

            // Check file size constraints
            if (maxSizeKB && processedBlob.size > maxSizeKB * 1024) {
                // If file is too large, try to compress it
                if (this.currentFile.type.startsWith('image/') && format !== 'pdf') {
                    processedBlob = await this.compressImageToSize(processedBlob, maxSizeKB * 1024, quality);
                } else {
                    throw new Error(`File size ${this.formatFileSize(processedBlob.size)} exceeds maximum ${this.formatFileSize(maxSizeKB * 1024)}`);
                }
            }

            if (minSizeKB && processedBlob.size < minSizeKB * 1024) {
                // For images, try to increase quality to meet minimum size
                if (this.currentFile.type.startsWith('image/') && format !== 'pdf') {
                    processedBlob = await this.increaseImageSize(processedBlob, minSizeKB * 1024, quality);
                } else {
                    throw new Error(`File size ${this.formatFileSize(processedBlob.size)} below minimum ${this.formatFileSize(minSizeKB * 1024)}`);
                }
            }

            this.processedBlob = processedBlob;
            this.showResults();
            this.updateActionButtons();

        } catch (error) {
            this.showError(`Processing failed: ${error.message}`);
        } finally {
            this.hideProcessing();
        }
    }

    async compressImageToSize(blob, targetSizeBytes, quality) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Start with original dimensions
                canvas.width = img.width;
                canvas.height = img.height;

                let currentQuality = quality;
                const compress = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    canvas.toBlob((compressedBlob) => {
                        if (!compressedBlob) {
                            reject(new Error('Failed to compress image'));
                            return;
                        }

                        if (compressedBlob.size <= targetSizeBytes || currentQuality <= 0.1) {
                            resolve(compressedBlob);
                        } else {
                            currentQuality -= 0.1;
                            compress();
                        }
                    }, blob.type, currentQuality);
                };

                compress();
            };
            img.onerror = () => reject(new Error('Failed to load image for compression'));
            img.src = URL.createObjectURL(blob);
        });
    }

    async increaseImageSize(blob, targetSizeBytes, quality) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Start with original dimensions
                canvas.width = img.width;
                canvas.height = img.height;

                let currentQuality = Math.min(quality + 0.1, 1.0);
                const increase = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    canvas.toBlob((increasedBlob) => {
                        if (!increasedBlob) {
                            reject(new Error('Failed to increase image size'));
                            return;
                        }

                        if (increasedBlob.size >= targetSizeBytes || currentQuality >= 1.0) {
                            resolve(increasedBlob);
                        } else {
                            currentQuality = Math.min(currentQuality + 0.1, 1.0);
                            increase();
                        }
                    }, blob.type, currentQuality);
                };

                increase();
            };
            img.onerror = () => reject(new Error('Failed to load image for size increase'));
            img.src = URL.createObjectURL(blob);
        });
    }

    async processImage(width, height, format, quality) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = width || img.width;
                canvas.height = height || img.height;

                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Handle different output formats
                if (format === 'pdf') {
                    // For PDF, we'll convert to PNG first (temporary solution)
                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Failed to create image blob'));
                        }
                    }, 'image/png', 0.9);
                } else {
                    const mimeType = format === 'jpeg' ? 'image/jpeg' : `image/${format}`;
                    const options = format === 'jpeg' ? { quality } : undefined;

                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Failed to create blob'));
                        }
                    }, mimeType, options);
                }
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = URL.createObjectURL(this.currentFile);
        });
    }

    async processPDF(format) {
        // For PDF processing, we'll use a simple approach
        // In a real implementation, you'd use PDF.js or similar
        if (format === 'pdf') {
            return this.currentFile; // Return original if already PDF
        } else {
            // Convert PDF to image (simplified)
            throw new Error('PDF to image conversion requires additional libraries');
        }
    }

    showProcessing() {
        this.processingStatus.style.display = 'flex';
        this.processBtn.disabled = true;
        this.updateFooterStatus('Processing file...');
    }

    hideProcessing() {
        this.processingStatus.style.display = 'none';
        this.processBtn.disabled = false;
    }

    showResults() {
        const originalSize = this.currentFile.size;
        const newSize = this.processedBlob.size;
        const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(1);

        this.originalSize.textContent = this.formatFileSize(originalSize);
        this.newSize.textContent = this.formatFileSize(newSize);
        this.sizeReduction.textContent = `${reduction}% smaller`;

        this.resultsSection.style.display = 'block';
        this.resultsSection.classList.add('fade-in');
        this.updateFooterStatus('File processed successfully!');
    }

    updateActionButtons() {
        this.downloadBtn.style.display = 'flex';
    }

    downloadFile() {
        if (!this.processedBlob) return;

        const url = URL.createObjectURL(this.processedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `processed_${this.currentFile.name.split('.')[0]}.${this.formatSelect.value}`;
        a.click();
        URL.revokeObjectURL(url);
    }


    removeFile() {
        this.currentFile = null;
        this.processedBlob = null;
        this.originalImageData = null;

        this.fileInfo.style.display = 'none';
        this.optionsSection.style.display = 'none';
        this.actionButtons.style.display = 'none';
        this.resultsSection.style.display = 'none';

        this.fileInput.value = '';
        this.updateFooterStatus('Ready to process files');
    }

    openSettings() {
        // Preferred method
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage(() => {
                if (chrome.runtime.lastError) {
                    // Fallback: open the options HTML in a new tab
                    const url = chrome.runtime.getURL('options/options.html');
                    chrome.tabs.create({ url }, () => {
                        if (chrome.runtime.lastError) {
                            console.error('Failed to open options page (tabs fallback):', chrome.runtime.lastError);
                        }
                    });
                }
            });
        } else {
            // Fallback for older runtimes
            const url = chrome.runtime.getURL('options/options.html');
            chrome.tabs.create({ url }, () => {
                if (chrome.runtime.lastError) {
                    console.error('Failed to open options page (final fallback):', chrome.runtime.lastError);
                }
            });
        }
    }



    showError(message) {
        this.updateFooterStatus(`Error: ${message}`);
        // You could also show a toast notification here
    }

    updateFooterStatus(message) {
        this.footerStatus.textContent = message;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize the popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Ensure popup maintains proper dimensions
    document.body.style.width = '400px';
    document.body.style.minWidth = '400px';
    document.body.style.maxWidth = '400px';

    new UploadEasePopup();
});
