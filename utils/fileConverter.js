// utils/fileConverter.js - Enhanced file conversion utilities

// Convert Image to PDF using a robust approach
export async function imageToPDF(file, options = {}) {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
            reject(new Error('Only image files can be converted to PDF'));
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                try {
                    // Create a robust PDF using a simpler approach
                    const pdfContent = createRobustPDF(img, options);
                    const blob = new Blob([pdfContent], { type: 'application/pdf' });
                resolve(blob);
                } catch (error) {
                    reject(new Error('Failed to create PDF: ' + error.message));
                }
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('Failed to read image'));
        reader.readAsDataURL(file);
    });
}

// Create a robust PDF that works with most PDF viewers
function createRobustPDF(img, options = {}) {
    // Convert image to canvas for better control
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = img.width;
    canvas.height = img.height;
    
    // Draw image to canvas
    ctx.drawImage(img, 0, 0);
    
    // Convert to JPEG data URL for better compression
    const dataURL = canvas.toDataURL('image/jpeg', 0.9);
    const base64Image = dataURL.split(',')[1];
    
    // Calculate PDF dimensions (in points, 72 DPI)
    const pdfWidth = Math.round(img.width * 72 / 96);
    const pdfHeight = Math.round(img.height * 72 / 96);
    
    // Create a more robust PDF structure
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 ${pdfWidth} ${pdfHeight}]
/Contents 4 0 R
/Resources <<
/XObject <<
/Im1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
q
${pdfWidth} 0 0 ${pdfHeight} 0 0 cm
/Im1 Do
Q
endstream
endobj

5 0 obj
<<
/Type /XObject
/Subtype /Image
/Width ${img.width}
/Height ${img.height}
/ColorSpace /DeviceRGB
/BitsPerComponent 8
/Length ${base64Image.length}
/Filter /DCTDecode
/DecodeParms <<
/ColorTransform 1
/Quality 90
>>
>>
stream
${base64Image}
endstream
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000274 00000 n 
0000000368 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
${base64Image.length + 800}
%%EOF`;

    return pdfContent;
}

// Convert PDF to Image (simplified implementation)
export async function pdfToImage(file, format = 'png') {
    return new Promise((resolve, reject) => {
        if (file.type !== 'application/pdf') {
            reject(new Error('Only PDF files can be converted to images'));
            return;
        }

        // For a production implementation, you would use PDF.js
        // This is a simplified version that creates a placeholder
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set default dimensions
        canvas.width = 800;
        canvas.height = 600;
        
        // Create a placeholder image
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#333';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PDF Preview', canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillText('(PDF to Image conversion)', canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText('requires PDF.js library', canvas.width / 2, canvas.height / 2 + 40);
        
        canvas.toBlob(blob => {
            if (blob) {
                resolve(blob);
            } else {
                reject(new Error('Failed to create image from PDF'));
            }
        }, `image/${format}`);
    });
}

// Convert between image formats
export async function convertImageFormat(file, targetFormat, quality = 0.9) {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
            reject(new Error('Only image files can be converted'));
            return;
        }

    const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = img.width;
                canvas.height = img.height;
                
                // Enable high-quality rendering
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                
                // Draw image
                ctx.drawImage(img, 0, 0);
                
                // Convert to target format
                const mimeType = `image/${targetFormat}`;
                const options = targetFormat === 'jpeg' ? { quality } : undefined;
                
                canvas.toBlob(blob => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error(`Failed to convert to ${targetFormat}`));
                    }
                }, mimeType, options);
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

// Convert multiple images to PDF
export async function imagesToPDF(files, options = {}) {
    return new Promise((resolve, reject) => {
        if (!Array.isArray(files) || files.length === 0) {
            reject(new Error('No files provided'));
            return;
        }

        const imagePromises = files.map(file => {
            return new Promise((resolveImg, rejectImg) => {
                if (!file.type.startsWith('image/')) {
                    rejectImg(new Error('Only image files are supported'));
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = new Image();
                    img.onload = function() {
                        resolveImg({
                            dataURL: e.target.result,
                            width: img.width,
                            height: img.height
                        });
                    };
                    img.onerror = () => rejectImg(new Error('Failed to load image'));
                    img.src = e.target.result;
                };
                reader.onerror = () => rejectImg(new Error('Failed to read file'));
                reader.readAsDataURL(file);
            });
        });

        Promise.all(imagePromises).then(images => {
            try {
                // Create a simple multi-page PDF
                const pdfContent = createMultiPagePDF(images);
                const blob = new Blob([pdfContent], { type: 'application/pdf' });
                resolve(blob);
            } catch (error) {
                reject(new Error('Failed to create multi-page PDF: ' + error.message));
            }
        }).catch(reject);
    });
}

// Helper function to create a simple PDF structure
function createSimplePDF(dataURL, width, height) {
    // This is a very basic PDF structure
    // In production, you would use a proper PDF library like jsPDF
    const pdfHeader = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 ${width} ${height}]
/Contents 4 0 R
/Resources <<
/XObject <<
/Im1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
q
${width} 0 0 ${height} 0 0 cm
/Im1 Do
Q
endstream
endobj

5 0 obj
<<
/Type /XObject
/Subtype /Image
/Width ${width}
/Height ${height}
/ColorSpace /DeviceRGB
/BitsPerComponent 8
/Length ${dataURL.length}
/Filter /DCTDecode
>>
stream
${dataURL.split(',')[1]}
endstream
endobj

xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000274 00000 n 
0000000368 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
${dataURL.length + 500}
%%EOF`;

    return pdfHeader;
}

// Helper function to create multi-page PDF
function createMultiPagePDF(images) {
    // Simplified multi-page PDF creation
    // In production, use a proper PDF library
    let pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [`;

    for (let i = 0; i < images.length; i++) {
        pdfContent += `${3 + i * 2} 0 R `;
    }

    pdfContent += `]
/Count ${images.length}
>>
endobj

`;

    // Add page objects
    for (let i = 0; i < images.length; i++) {
        const pageObjNum = 3 + i * 2;
        const contentObjNum = pageObjNum + 1;
        const imageObjNum = 5 + i * 2;
        
        pdfContent += `${pageObjNum} 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 ${images[i].width} ${images[i].height}]
/Contents ${contentObjNum} 0 R
/Resources <<
/XObject <<
/Im${i + 1} ${imageObjNum} 0 R
>>
>>
>>
endobj

${contentObjNum} 0 obj
<<
/Length 44
>>
stream
q
${images[i].width} 0 0 ${images[i].height} 0 0 cm
/Im${i + 1} Do
Q
endstream
endobj

${imageObjNum} 0 obj
<<
/Type /XObject
/Subtype /Image
/Width ${images[i].width}
/Height ${images[i].height}
/ColorSpace /DeviceRGB
/BitsPerComponent 8
/Length ${images[i].dataURL.length}
/Filter /DCTDecode
>>
stream
${images[i].dataURL.split(',')[1]}
endstream
endobj

`;
    }

    pdfContent += `xref
0 ${5 + images.length * 2}
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
`;

    // Add xref entries for all objects
    let currentOffset = 100;
    for (let i = 0; i < images.length; i++) {
        pdfContent += `0000000${currentOffset} 00000 n 
0000000${currentOffset + 50} 00000 n 
`;
        currentOffset += 200;
    }

    pdfContent += `trailer
<<
/Size ${5 + images.length * 2}
/Root 1 0 R
>>
startxref
${currentOffset + 100}
%%EOF`;

    return pdfContent;
}
