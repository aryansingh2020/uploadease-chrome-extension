// utils/pdfGenerator.js - PDF generation using PDF.js approach

// PDF.js compatible PDF generator
export class PDFGenerator {
    constructor() {
        this.objects = [];
        this.objectCounter = 1;
    }

    // Create a new PDF document
    createDocument() {
        this.objects = [];
        this.objectCounter = 1;
        
        // PDF header
        const header = '%PDF-1.4\n';
        
        // Create catalog object
        const catalog = this.createObject({
            Type: 'Catalog',
            Pages: this.createReference(this.objectCounter + 1)
        });
        
        // Create pages object
        const pages = this.createObject({
            Type: 'Pages',
            Kids: [this.createReference(this.objectCounter + 1)],
            Count: 1
        });
        
        return { header, catalog, pages };
    }

    // Add an image page to the PDF
    addImagePage(img, options = {}) {
        const pageWidth = Math.round(img.width * 72 / 96);
        const pageHeight = Math.round(img.height * 72 / 96);
        
        // Convert image to JPEG data
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const dataURL = canvas.toDataURL('image/jpeg', 0.9);
        const imageData = dataURL.split(',')[1];
        
        // Create image object
        const imageObj = this.createObject({
            Type: 'XObject',
            Subtype: 'Image',
            Width: img.width,
            Height: img.height,
            ColorSpace: 'DeviceRGB',
            BitsPerComponent: 8,
            Length: imageData.length,
            Filter: 'DCTDecode',
            DecodeParms: {
                ColorTransform: 1,
                Quality: 90
            }
        }, imageData);
        
        // Create page object
        const page = this.createObject({
            Type: 'Page',
            Parent: this.createReference(this.objectCounter - 1),
            MediaBox: [0, 0, pageWidth, pageHeight],
            Contents: this.createReference(this.objectCounter + 1),
            Resources: {
                XObject: {
                    Im1: this.createReference(this.objectCounter - 1)
                }
            }
        });
        
        // Create content stream
        const contentStream = this.createContentStream(pageWidth, pageHeight);
        const contentObj = this.createObject({}, contentStream);
        
        return { page, imageObj, contentObj };
    }

    // Create content stream for the page
    createContentStream(width, height) {
        return `q
${width} 0 0 ${height} 0 0 cm
/Im1 Do
Q`;
    }

    // Create a PDF object
    createObject(dict, stream = null) {
        const objNum = this.objectCounter++;
        const obj = {
            number: objNum,
            dict: dict,
            stream: stream
        };
        this.objects.push(obj);
        return obj;
    }

    // Create a reference to an object
    createReference(objNumber) {
        return `${objNumber} 0 R`;
    }

    // Generate the final PDF content
    generate() {
        let pdf = '%PDF-1.4\n';
        const xref = [];
        let currentPos = pdf.length;
        
        // Write all objects
        for (const obj of this.objects) {
            xref.push({ pos: currentPos, gen: 0, inuse: true });
            
            pdf += `${obj.number} 0 obj\n`;
            pdf += '<<\n';
            
            // Write dictionary
            for (const [key, value] of Object.entries(obj.dict)) {
                if (typeof value === 'object' && value !== null) {
                    pdf += `/${key} <<\n`;
                    for (const [subKey, subValue] of Object.entries(value)) {
                        if (typeof subValue === 'object' && subValue !== null) {
                            pdf += `/${subKey} <<\n`;
                            for (const [subSubKey, subSubValue] of Object.entries(subValue)) {
                                pdf += `/${subSubKey} ${subSubValue}\n`;
                            }
                            pdf += '>>\n';
                        } else {
                            pdf += `/${subKey} ${subValue}\n`;
                        }
                    }
                    pdf += '>>\n';
                } else if (Array.isArray(value)) {
                    pdf += `/${key} [${value.join(' ')}]\n`;
                } else {
                    pdf += `/${key} ${value}\n`;
                }
            }
            
            pdf += '>>\n';
            
            // Write stream if present
            if (obj.stream) {
                pdf += `stream\n${obj.stream}\nendstream\n`;
            }
            
            pdf += 'endobj\n\n';
            currentPos = pdf.length;
        }
        
        // Write xref table
        const xrefStart = pdf.length;
        pdf += 'xref\n';
        pdf += `0 ${xref.length + 1}\n`;
        pdf += '0000000000 65535 f \n';
        
        for (const entry of xref) {
            pdf += `${entry.pos.toString().padStart(10, '0')} ${entry.gen.toString().padStart(5, '0')} n \n`;
        }
        
        // Write trailer
        pdf += 'trailer\n';
        pdf += '<<\n';
        pdf += `/Size ${xref.length + 1}\n`;
        pdf += `/Root 1 0 R\n`;
        pdf += '>>\n';
        pdf += 'startxref\n';
        pdf += `${xrefStart}\n`;
        pdf += '%%EOF';
        
        return pdf;
    }
}

// Simplified PDF creation function
export async function createPDFFromImage(img, options = {}) {
    const generator = new PDFGenerator();
    generator.createDocument();
    generator.addImagePage(img, options);
    return generator.generate();
}
