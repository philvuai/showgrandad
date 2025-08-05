/**
 * Optimized image processing utilities
 */

interface ImageProcessingOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  format: 'jpeg' | 'webp';
}

/**
 * Check if browser supports WebP
 */
export const supportsWebP = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  } catch {
    return false;
  }
};

const DEFAULT_OPTIONS: ImageProcessingOptions = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.8,
  format: supportsWebP() ? 'webp' : 'jpeg'
};

const THUMBNAIL_OPTIONS: ImageProcessingOptions = {
  maxWidth: 300,
  maxHeight: 300,
  quality: 0.7,
  format: supportsWebP() ? 'webp' : 'jpeg'
};

/**
 * Compress and resize image with optimized canvas operations
 */
export const processImage = (
  base64: string, 
  options: Partial<ImageProcessingOptions> = {}
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const config = { ...DEFAULT_OPTIONS, ...options };
    
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Calculate optimal dimensions
        const { width, height } = calculateDimensions(
          img.width, 
          img.height, 
          config.maxWidth, 
          config.maxHeight
        );
        
        canvas.width = width;
        canvas.height = height;
        
        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        const mimeType = config.format === 'webp' ? 'image/webp' : 'image/jpeg';
        const compressed = canvas.toDataURL(mimeType, config.quality);
        
        resolve(compressed);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = base64;
  });
};

/**
 * Generate thumbnail from image
 */
export const generateThumbnail = (base64: string): Promise<string> => {
  return processImage(base64, THUMBNAIL_OPTIONS);
};

/**
 * Calculate optimal dimensions maintaining aspect ratio
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let { width, height } = { width: originalWidth, height: originalHeight };
  
  // Scale down if needed
  if (width > maxWidth) {
    height = (height * maxWidth) / width;
    width = maxWidth;
  }
  
  if (height > maxHeight) {
    width = (width * maxHeight) / height;
    height = maxHeight;
  }
  
  return { width: Math.round(width), height: Math.round(height) };
}


/**
 * Validate image file
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Unsupported file type. Please use JPEG, PNG, GIF, or WebP.' };
  }
  
  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'File too large. Maximum size is 10MB.' };
  }
  
  return { valid: true };
};
