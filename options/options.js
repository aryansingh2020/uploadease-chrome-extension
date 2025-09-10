// options/options.js - Settings page functionality

class UploadEaseOptions {
    constructor() {
        this.defaultSettings = {
            autoDetect: true,
            showNotifications: true,
            rememberSettings: false,
            defaultFormat: 'png',
            defaultWidth: '',
            defaultHeight: '',
            defaultQuality: 0.9,
            maxFileSize: '',
            compressionThreshold: 500,
            highQualityResize: false,
            preserveMetadata: false,
            aspectRatioThreshold: 0.05
        };

        this.initializeElements();
        this.setupEventListeners();
        this.loadSettings();
    }

    initializeElements() {
        // General settings
        this.autoDetect = document.getElementById('auto-detect');
        this.showNotifications = document.getElementById('show-notifications');
        this.rememberSettings = document.getElementById('remember-settings');

        // Processing settings
        this.defaultFormat = document.getElementById('default-format');
        this.defaultWidth = document.getElementById('default-width');
        this.defaultHeight = document.getElementById('default-height');
        this.defaultQuality = document.getElementById('default-quality');
        this.qualityDisplay = document.getElementById('quality-display');

        // File size limits
        this.maxFileSize = document.getElementById('max-file-size');
        this.compressionThreshold = document.getElementById('compression-threshold');

        // Advanced settings
        this.highQualityResize = document.getElementById('high-quality-resize');
        this.preserveMetadata = document.getElementById('preserve-metadata');
        this.aspectRatioThreshold = document.getElementById('aspect-ratio-threshold');
        this.aspectRatioDisplay = document.getElementById('aspect-ratio-display');

        // Buttons
        this.saveBtn = document.getElementById('save-btn');
        this.cancelBtn = document.getElementById('cancel-btn');
        this.resetBtn = document.getElementById('reset-settings');

        // Status
        this.saveStatus = document.getElementById('save-status');
    }

    setupEventListeners() {
        // Quality slider
        this.defaultQuality.addEventListener('input', () => {
            const value = Math.round(this.defaultQuality.value * 100);
            this.qualityDisplay.textContent = `${value}%`;
        });

        // Aspect ratio threshold slider
        this.aspectRatioThreshold.addEventListener('input', () => {
            const value = Math.round(this.aspectRatioThreshold.value * 100);
            this.aspectRatioDisplay.textContent = `${value}%`;
        });

        // Buttons
        this.saveBtn.addEventListener('click', () => this.saveSettings());
        this.cancelBtn.addEventListener('click', () => this.cancelChanges());
        this.resetBtn.addEventListener('click', () => this.resetSettings());

        // Auto-save on changes
        const inputs = [
            this.autoDetect, this.showNotifications, this.rememberSettings,
            this.defaultFormat, this.defaultWidth, this.defaultHeight,
            this.defaultQuality, this.maxFileSize, this.compressionThreshold,
            this.highQualityResize, this.preserveMetadata, this.aspectRatioThreshold
        ];

        inputs.forEach(input => {
            input.addEventListener('change', () => this.markAsChanged());
        });
    }

    loadSettings() {
        chrome.storage.sync.get(Object.keys(this.defaultSettings), (data) => {
            // General settings
            this.autoDetect.checked = data.autoDetect !== false;
            this.showNotifications.checked = data.showNotifications !== false;
            this.rememberSettings.checked = data.rememberSettings || false;

            // Processing settings
            this.defaultFormat.value = data.defaultFormat || 'png';
            this.defaultWidth.value = data.defaultWidth || '';
            this.defaultHeight.value = data.defaultHeight || '';
            this.defaultQuality.value = data.defaultQuality || 0.9;
            this.qualityDisplay.textContent = `${Math.round(this.defaultQuality.value * 100)}%`;

            // File size limits
            this.maxFileSize.value = data.maxFileSize || '';
            this.compressionThreshold.value = data.compressionThreshold || 500;

            // Advanced settings
            this.highQualityResize.checked = data.highQualityResize || false;
            this.preserveMetadata.checked = data.preserveMetadata || false;
            this.aspectRatioThreshold.value = data.aspectRatioThreshold || 0.05;
            this.aspectRatioDisplay.textContent = `${Math.round(this.aspectRatioThreshold.value * 100)}%`;

            this.updateStatus('Settings loaded', 'info');
        });
    }

    saveSettings() {
        const settings = {
            autoDetect: this.autoDetect.checked,
            showNotifications: this.showNotifications.checked,
            rememberSettings: this.rememberSettings.checked,
            defaultFormat: this.defaultFormat.value,
            defaultWidth: this.defaultWidth.value,
            defaultHeight: this.defaultHeight.value,
            defaultQuality: parseFloat(this.defaultQuality.value),
            maxFileSize: this.maxFileSize.value ? parseInt(this.maxFileSize.value) : '',
            compressionThreshold: parseInt(this.compressionThreshold.value) || 500,
            highQualityResize: this.highQualityResize.checked,
            preserveMetadata: this.preserveMetadata.checked,
            aspectRatioThreshold: parseFloat(this.aspectRatioThreshold.value)
        };

        chrome.storage.sync.set(settings, () => {
            if (chrome.runtime.lastError) {
                this.updateStatus('Error saving settings: ' + chrome.runtime.lastError.message, 'error');
            } else {
                this.updateStatus('Settings saved successfully!', 'success');
                this.saveBtn.disabled = true;
            }
        });
    }

    cancelChanges() {
        this.loadSettings();
        this.updateStatus('Changes cancelled', 'info');
    }

    resetSettings() {
        if (confirm('Are you sure you want to reset all settings to their default values? This action cannot be undone.')) {
            chrome.storage.sync.clear(() => {
                this.loadSettings();
                this.updateStatus('Settings reset to defaults', 'info');
            });
        }
    }

    markAsChanged() {
        this.saveBtn.disabled = false;
        this.updateStatus('Settings have been modified', 'info');
    }

    updateStatus(message, type = 'info') {
        this.saveStatus.textContent = message;
        this.saveStatus.className = `footer-status status-${type}`;
        
        // Auto-clear status after 3 seconds
        setTimeout(() => {
            if (this.saveStatus.textContent === message) {
                this.saveStatus.textContent = 'Ready';
                this.saveStatus.className = 'footer-status';
            }
        }, 3000);
    }
}

// Initialize options page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new UploadEaseOptions();
});
