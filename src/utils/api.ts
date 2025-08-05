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
  async getPhotos(page: number = 1, limit: number = 50): Promise<PhotosResponse> {
    const response = await fetch(`${API_BASE}/photos?page=${page}&limit=${limit}`);
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
    
    for (let i = 0; i < files.length; i += concurrencyLimit) {
      const batch = files.slice(i, i + concurrencyLimit);
      const batchPromises = batch.map((file, batchIndex) => {
        const globalIndex = i + batchIndex;
        const description = descriptions[globalIndex] || '';
        return processFileForUpload(file, description, username);
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    return results;
  },
};
