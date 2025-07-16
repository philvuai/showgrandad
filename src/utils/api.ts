import { Photo, PhotoUpload } from '../types';

const API_BASE = '/.netlify/functions';

export const api = {
  async getPhotos(): Promise<Photo[]> {
    try {
      // Try to get from server first
      const response = await fetch(`${API_BASE}/photos`);
      if (response.ok) {
        const serverPhotos = await response.json();
        return serverPhotos;
      }
    } catch (error) {
      console.warn('Server not available, falling back to localStorage');
    }

    // Fallback to localStorage
    const localPhotos = localStorage.getItem('showgrandad_photos');
    return localPhotos ? JSON.parse(localPhotos) : [];
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
          // Try to save to server first
          const response = await fetch(`${API_BASE}/photos`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ photo: newPhoto }),
          });

          if (response.ok) {
            resolve(newPhoto);
            return;
          }
        } catch (error) {
          console.warn('Server not available, saving to localStorage');
        }

        // Fallback to localStorage
        const existingPhotos = await this.getPhotos();
        const updatedPhotos = [newPhoto, ...existingPhotos];
        localStorage.setItem('showgrandad_photos', JSON.stringify(updatedPhotos));
        resolve(newPhoto);
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(upload.file);
    });
  },
};
