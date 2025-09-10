// utils/fileProcessor.js - Enhanced file processing utilities

export function resizeImage(file, width, height, format, quality = 0.9) {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith("image/")) {
            reject(new Error("Only image files are supported."));
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement("canvas");
                canvas.width = width || img.width;
                canvas.height = height || img.height;
                
                const ctx = canvas.getContext("2d");
                
                // Enable high-quality image rendering
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                
                // Draw image with proper scaling
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // Convert to blob with appropriate options
                const mimeType = format === 'jpeg' ? 'image/jpeg' : `image/${format}`;
                const options = format === 'jpeg' ? { quality } : undefined;
                
                canvas.toBlob(function(blob) {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error("Failed to create blob from canvas"));
                    }
                }, mimeType, options);
            };
            img.onerror = () => reject(new Error("Failed to load image"));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error("Failed to read file."));
        reader.readAsDataURL(file);
    });
}

export function compressImage(file, maxSizeKB, quality = 0.9) {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith("image/")) {
            reject(new Error("Only image files are supported."));
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                let currentQuality = quality;
                let canvas = document.createElement("canvas");
                let ctx = canvas.getContext("2d");
                
                // Start with original dimensions
                canvas.width = img.width;
                canvas.height = img.height;
                
                const compress = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    
                    canvas.toBlob(function(blob) {
                        if (!blob) {
                            reject(new Error("Failed to create blob"));
                            return;
                        }
                        
                        const sizeKB = blob.size / 1024;
                        
                        if (sizeKB <= maxSizeKB || currentQuality <= 0.1) {
                            resolve(blob);
                        } else {
                            // Reduce quality and try again
                            currentQuality -= 0.1;
                            compress();
                        }
                    }, file.type, currentQuality);
                };
                
                compress();
            };
            img.onerror = () => reject(new Error("Failed to load image"));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error("Failed to read file."));
        reader.readAsDataURL(file);
    });
}

export function resizeImageToFit(file, maxWidth, maxHeight, format, quality = 0.9) {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith("image/")) {
            reject(new Error("Only image files are supported."));
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                let { width, height } = calculateAspectRatioFit(img.width, img.height, maxWidth, maxHeight);
                
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext("2d");
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);
                
                const mimeType = format === 'jpeg' ? 'image/jpeg' : `image/${format}`;
                const options = format === 'jpeg' ? { quality } : undefined;
                
                canvas.toBlob(function(blob) {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error("Failed to create blob from canvas"));
                    }
                }, mimeType, options);
            };
            img.onerror = () => reject(new Error("Failed to load image"));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error("Failed to read file."));
        reader.readAsDataURL(file);
    });
}

export function getImageDimensions(file) {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith("image/")) {
            reject(new Error("Only image files are supported."));
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                resolve({
                    width: img.width,
                    height: img.height,
                    aspectRatio: img.width / img.height
                });
            };
            img.onerror = () => reject(new Error("Failed to load image"));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error("Failed to read file."));
        reader.readAsDataURL(file);
    });
}

export function validateImageConstraints(file, constraints) {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith("image/")) {
            reject(new Error("Only image files are supported."));
            return;
        }

        getImageDimensions(file).then(dimensions => {
            const errors = [];
            
            if (constraints.maxWidth && dimensions.width > constraints.maxWidth) {
                errors.push(`Width ${dimensions.width}px exceeds maximum ${constraints.maxWidth}px`);
            }
            
            if (constraints.minWidth && dimensions.width < constraints.minWidth) {
                errors.push(`Width ${dimensions.width}px below minimum ${constraints.minWidth}px`);
            }
            
            if (constraints.maxHeight && dimensions.height > constraints.maxHeight) {
                errors.push(`Height ${dimensions.height}px exceeds maximum ${constraints.maxHeight}px`);
            }
            
            if (constraints.minHeight && dimensions.height < constraints.minHeight) {
                errors.push(`Height ${dimensions.height}px below minimum ${constraints.minHeight}px`);
            }
            
            if (constraints.maxSize && file.size > constraints.maxSize) {
                errors.push(`File size ${formatFileSize(file.size)} exceeds maximum ${formatFileSize(constraints.maxSize)}`);
            }
            
            if (constraints.minSize && file.size < constraints.minSize) {
                errors.push(`File size ${formatFileSize(file.size)} below minimum ${formatFileSize(constraints.minSize)}`);
            }
            
            resolve({
                valid: errors.length === 0,
                errors: errors,
                dimensions: dimensions
            });
        }).catch(reject);
    });
}

function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {
    const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
    return {
        width: Math.round(srcWidth * ratio),
        height: Math.round(srcHeight * ratio)
    };
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
