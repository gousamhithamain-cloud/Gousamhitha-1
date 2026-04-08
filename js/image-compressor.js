/**
 * Image Compressor
 * Compresses images before upload to reduce size
 */

console.log('🖼️ Loading Image Compressor...');

/**
 * Compress an image file to a smaller size
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<string>} - Base64 encoded compressed image
 */
async function compressImage(file, options = {}) {
    const {
        maxWidth = 800,
        maxHeight = 800,
        quality = 0.8,
        outputFormat = 'image/jpeg'
    } = options;
    
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const img = new Image();
            
            img.onload = function() {
                // Calculate new dimensions
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = Math.floor(width * ratio);
                    height = Math.floor(height * ratio);
                }
                
                // Create canvas
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                
                // Draw image on canvas
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to base64
                const compressedBase64 = canvas.toDataURL(outputFormat, quality);
                
                console.log('✅ Image compressed:', {
                    original: `${img.width}x${img.height}`,
                    compressed: `${width}x${height}`,
                    originalSize: `${(file.size / 1024).toFixed(2)} KB`,
                    compressedSize: `${(compressedBase64.length / 1024).toFixed(2)} KB`,
                    reduction: `${(100 - (compressedBase64.length / file.size) * 100).toFixed(1)}%`
                });
                
                resolve(compressedBase64);
            };
            
            img.onerror = function() {
                reject(new Error('Failed to load image'));
            };
            
            img.src = e.target.result;
        };
        
        reader.onerror = function() {
            reject(new Error('Failed to read file'));
        };
        
        reader.readAsDataURL(file);
    });
}

/**
 * Compress image with progress callback
 * @param {File} file - The image file
 * @param {Function} onProgress - Progress callback
 * @param {Object} options - Compression options
 * @returns {Promise<string>} - Compressed base64 image
 */
async function compressImageWithProgress(file, onProgress, options = {}) {
    if (onProgress) onProgress(0);
    
    try {
        if (onProgress) onProgress(30);
        const compressed = await compressImage(file, options);
        if (onProgress) onProgress(100);
        return compressed;
    } catch (error) {
        console.error('❌ Image compression failed:', error);
        throw error;
    }
}

// Export functions
window.ImageCompressor = {
    compress: compressImage,
    compressWithProgress: compressImageWithProgress
};

console.log('✅ Image Compressor loaded');
