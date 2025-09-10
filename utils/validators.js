export function validateFileType(file, allowedTypes) {
    if (!file.type.startsWith("image/")) return false;
    if (!allowedTypes || allowedTypes.length === 0) return true;
    return allowedTypes.includes(file.type);
}

export function validateFileSize(file, maxSize, minSize) {
    if (maxSize && file.size > maxSize) return false;
    if (minSize && file.size < minSize) return false;
    return true;
}

export function validateAspectRatio(width, height, originalRatio) {
    if (!width || !height) return true;
    const newRatio = width / height;
    return Math.abs(newRatio - originalRatio) < 0.01;
}
