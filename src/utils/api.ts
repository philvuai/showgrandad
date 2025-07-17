import { Photo, PhotoUpload, PhotosResponse } from '../types';

const API_BASE = '/.netlify/functions';

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
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string;
        
        const newPhoto: Photo = {
          id: Date.now().toString(),
          filename: upload.file.name,
          description: upload.description,
          uploadedAt: new Date().toISOString(),
          uploadedBy: username,
          url: imageUrl,
          thumbnailUrl: imageUrl,
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
