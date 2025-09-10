// content/fileDetector.js
let detectedFields = [];

function detectFileInputs() {
    const inputs = document.querySelectorAll('input[type="file"]');
    if (!inputs.length) return;

    detectedFields = [];
    let hasConstraints = false;

    inputs.forEach(input => {
        const fieldData = {
            allowedTypes: input.accept ? input.accept.split(",").map(type => type.trim()) : [],
            maxSize: input.dataset.maxSize || input.getAttribute('data-max-size') || null,
            minSize: input.dataset.minSize || input.getAttribute('data-min-size') || null,
            maxSizeBytes: null,
            minSizeBytes: null,
            element: input,
            constraints: []
        };

        // Parse size constraints from various sources
        const sizeText = input.placeholder || input.title || input.getAttribute('data-constraints') || '';
        const sizeMatch = sizeText.match(/(\d+)\s*[kK][bB]?\s*[-–—]\s*(\d+)\s*[kK][bB]?/);
        if (sizeMatch) {
            fieldData.minSizeBytes = parseInt(sizeMatch[1]) * 1024;
            fieldData.maxSizeBytes = parseInt(sizeMatch[2]) * 1024;
            hasConstraints = true;
        }

        // Check for dimension constraints in placeholder or title
        const dimensionMatch = sizeText.match(/(\d+)\s*[x×]\s*(\d+)/);
        if (dimensionMatch) {
            fieldData.constraints.push({
                type: 'dimensions',
                width: parseInt(dimensionMatch[1]),
                height: parseInt(dimensionMatch[2])
            });
            hasConstraints = true;
        }

        // Check for file type constraints
        if (fieldData.allowedTypes.length > 0) {
            hasConstraints = true;
        }

        // Check for size constraints from attributes
        if (fieldData.maxSize || fieldData.minSize) {
            fieldData.maxSizeBytes = fieldData.maxSize ? parseInt(fieldData.maxSize) : null;
            fieldData.minSizeBytes = fieldData.minSize ? parseInt(fieldData.minSize) : null;
            hasConstraints = true;
        }

        detectedFields.push(fieldData);
    });

    // Send detected fields to background
    if (detectedFields.length > 0) {
        chrome.runtime.sendMessage({ 
            type: "SAVE_FIELDS", 
            data: detectedFields 
        });
    }

    // Show assistance prompt if constraints are detected and not already shown
    if (hasConstraints) {
        assistancePromptShown = true;
    
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10001;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            animation: slideInRight 0.3s ease-out;
        `;
        message.textContent = 'Click the UploadEase extension icon from the Extension Toolbar!';
        document.body.appendChild(message);
    
        setTimeout(() => {
            message.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => message.remove(), 300);
        }, 4000);
    }
    
}

function showAssistancePrompt() {
    // Check if auto-detect is enabled
    chrome.storage.sync.get(['autoDetect', 'showNotifications'], (result) => {
        if (result.autoDetect !== false) {
            assistancePromptShown = true;
            
            // Create assistance prompt overlay
            const prompt = document.createElement('div');
            prompt.id = 'uploadEase-assistance-prompt';
            prompt.innerHTML = `
                <div class="uploadEase-prompt-content">
                    <div class="uploadEase-prompt-header">
                        <img src="${chrome.runtime.getURL('icons/icon48.png')}" alt="UploadEase" class="uploadEase-icon">
                        <h3>UploadEase Assistant</h3>
                    </div>
                    <p>I detected file upload requirements on this page. Would you like assistance with file processing?</p>
                    <div class="uploadEase-prompt-buttons">
                        <button id="uploadEase-accept" class="uploadEase-btn uploadEase-btn-primary">Yes, Help Me</button>
                        <button id="uploadEase-dismiss" class="uploadEase-btn uploadEase-btn-secondary">Not Now</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(prompt);
            
            // Add event listeners
            document.getElementById('uploadEase-accept').addEventListener('click', () => {
                prompt.remove();
                chrome.runtime.sendMessage({ type: "SHOW_ASSISTANCE_PROMPT", showNotification: result.showNotifications });
                
                // Show a message to click the extension icon
                const message = document.createElement('div');
                message.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #4CAF50;
                    color: white;
                    padding: 12px 20px;
                    border-radius: 6px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 10001;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    font-size: 14px;
                    animation: slideInRight 0.3s ease-out;
                `;
                message.textContent = 'Click the UploadEase extension icon from the Extension Toolbar!';
                document.body.appendChild(message);
                
                setTimeout(() => {
                    message.style.animation = 'slideOutRight 0.3s ease-in';
                    setTimeout(() => message.remove(), 300);
                }, 4000);
            });
            
            document.getElementById('uploadEase-dismiss'||'click').addEventListener('click', () => {
                prompt.remove();
                assistancePromptShown = false;
            });
            
            // Auto-dismiss after 10 seconds
            setTimeout(() => {
                if (document.getElementById('uploadEase-assistance-prompt')) {
                    document.getElementById('uploadEase-assistance-prompt').remove();
                    assistancePromptShown = false;
                }
            }, 10000);
        }
    });
}

// Enhanced detection with mutation observer
function observeFileInputs() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                const addedNodes = Array.from(mutation.addedNodes);
                const hasFileInputs = addedNodes.some(node => 
                    node.nodeType === Node.ELEMENT_NODE && 
                    (node.tagName === 'INPUT' && node.type === 'file' || 
                     node.querySelector && node.querySelector('input[type="file"]'))
                );
                
                if (hasFileInputs) {
                    setTimeout(detectFileInputs, 100); // Small delay to ensure DOM is ready
                }
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Initialize detection
window.addEventListener("load", () => {
    detectFileInputs();
    observeFileInputs();
});

// Re-detect on page changes (for SPAs)
window.addEventListener("popstate", () => {
    assistancePromptShown = false;
    setTimeout(detectFileInputs, 100);
});
