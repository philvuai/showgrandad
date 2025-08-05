import { Photo, PhotoUpload, MultiPhotoUpload, PhotosResponse } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { processImage, generateThumbnail, validateImageFile, supportsWebP } from './imageProcessor';

const API_BASE = '/.netlify/functions';

// Cache for processed images to avoid reprocessing
const imageCache = new Map<string, { full: string; thumbnail: string }>();

// Constants
const BASE64_SIZE_THRESHOLD = 2 * 1024 * 1024; // 2MB

/**
 * Process a single file for upload
 */
const processFileForUpload = async (
  file: File,
  description: string,
  username: string
): Promise<Photo> => {
  // Validate file
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Check cache first
  const cacheKey = `${file.name}-${file.size}-${file.lastModified}`;
  let processedImages = imageCache.get(cacheKey);

  if (!processedImages) {
    const reader = new FileReader();
    const base64 = await new Promise<string>((resolve, reject) => {
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
      reader.readAsDataURL(file);
    });

    // Process image with optimized compression
    const shouldCompress = base64.length > BASE64_SIZE_THRESHOLD;
    const format = supportsWebP() ? 'webp' : 'jpeg';
    
    const [fullImage, thumbnail] = await Promise.all([
      shouldCompress ? processImage(base64, { format }) : base64,
      generateThumbnail(base64)
    ]);

    processedImages = { full: fullImage, thumbnail };
    imageCache.set(cacheKey, processedImages);
  }

  const newPhoto: Photo = {
    id: uuidv4(),
    filename: file.name,
    description,
    uploadedAt: new Date().toISOString(),
    uploadedBy: username,
    url: processedImages.full,
    thumbnailUrl: processedImages.thumbnail,
  };

  // Upload to server
  const response = await fetch(`${API_BASE}/photos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ photo: newPhoto, action: 'upload' }),
  });

  if (!response.ok) {
    let errorMessage = `Failed to upload ${file.name}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      // Use default message if parsing fails
    }
    throw new Error(`${errorMessage} (${response.status})`);
  }

  return newPhoto;
};

export const api = {
  async getPhotos(page: number = 1, limit: number = 50, thumbnailsOnly: boolean = false): Promise<PhotosResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      thumbnailsOnly: thumbnailsOnly.toString()
    });
    
    const response = await fetch(`${API_BASE}/photos?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch photos');
    }
    return response.json();
  },

  async uploadPhoto(upload: PhotoUpload, username: string): Promise<Photo> {
    return processFileForUpload(upload.file, upload.description, username);
  },

  async uploadMultiplePhotos(uploads: MultiPhotoUpload, username: string): Promise<Photo[]> {
    const { files, descriptions } = uploads;
    
    // Process all files concurrently with limited concurrency to avoid overwhelming the browser
    const concurrencyLimit = 3;
    const results: Photo[] = [];
    const errors: Array<{ filename: string; error: string }> = [];
    
    for (let i = 0; i < files.length; i += concurrencyLimit) {
      const batch = files.slice(i, i + concurrencyLimit);
      const batchPromises = batch.map(async (file, batchIndex) => {
        const globalIndex = i + batchIndex;
        const description = descriptions[globalIndex] || '';
        
        try {
          return await processFileForUpload(file, description, username);
        } catch (error) {
          // Log the error but don't fail the entire batch
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push({ filename: file.name, error: errorMessage });
          console.error(`Failed to upload ${file.name}:`, errorMessage);
          return null; // Return null for failed uploads
        }
      });
      
      // Use Promise.allSettled to handle partial failures
      const batchResults = await Promise.all(batchPromises);
      
      // Filter out null values (failed uploads) and add successful ones
      const successfulUploads = batchResults.filter((result): result is Photo => result !== null);
      results.push(...successfulUploads);
    }
    
    // Log any errors that occurred, but don't throw if we have some successful uploads
    if (errors.length > 0) {
      console.warn(`${errors.length} out of ${files.length} photos failed to upload:`, errors);
      
      // If ALL uploads failed, throw an error
      if (results.length === 0) {
        const failedFiles = errors.map(e => `${e.filename}: ${e.error}`).join('; ');
        throw new Error(`All uploads failed: ${failedFiles}`);
      }
      
      // If some succeeded and some failed, log the details but don't throw
      // The caller can check results.length vs files.length to detect partial failures
      console.info(`Partial upload success: ${results.length}/${files.length} photos uploaded successfully`);
    }
    
    return results;
  },
};
