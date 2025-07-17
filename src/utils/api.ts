import { Photo, PhotoUpload, PhotosResponse } from '../types';

const API_BASE = '/.netlify/functions';

// Helper function to compress images
const compressImage = (base64: string, quality: number = 0.8): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions (max 1200px on the longest side)
      const maxSize = 1200;
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Convert to JPEG with specified quality
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };
    
    img.src = base64;
  });
};

export const api = {
  async getPhotos(page: number = 1, limit: number = 12): Promise<PhotosResponse> {
    const response = await fetch(`${API_BASE}/photos?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch photos');
    }
    return response.json();
  },

  async uploadPhoto(upload: PhotoUpload, username: string): Promise<Photo> {
    return new Promise((resolve, reject) => {
      // Check file size (limit to 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (upload.file.size > maxSize) {
        reject(new Error('File size too large. Please use an image smaller than 5MB.'));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string;
        
        // Create a compressed version if the image is too large
        let processedImageUrl = imageUrl;
        if (imageUrl.length > 2 * 1024 * 1024) { // If base64 is > 2MB
          processedImageUrl = await compressImage(imageUrl, 0.8);
        }
        
        const newPhoto: Photo = {
          id: Date.now().toString(),
          filename: upload.file.name,
          description: upload.description,
          uploadedAt: new Date().toISOString(),
          uploadedBy: username,
          url: processedImageUrl,
          thumbnailUrl: processedImageUrl,
        };

        try {
          const response = await fetch(`${API_BASE}/photos`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ photo: newPhoto, action: 'upload' }),
          });

          if (response.ok) {
            resolve(newPhoto);
          } else {
            let errorMessage = 'Failed to upload photo';
            try {
              const errorData = await response.json();
              errorMessage = errorData.error || errorMessage;
            } catch (e) {
              // If we can't parse error response, use default message
            }
            throw new Error(`${errorMessage} (${response.status})`);
          }
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(upload.file);
    });
  },
};
