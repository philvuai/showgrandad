import { Handler } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

// Fallback to in-memory storage if Netlify Blobs is not available
let photos: any[] = [];
let useFallback = false;

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    if (event.httpMethod === 'GET') {
      // Get all photos
      try {
        if (!useFallback) {
          const store = getStore('photos');
          const photosData = await store.get('photos-list');
          const storedPhotos = photosData ? JSON.parse(photosData) : [];
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(storedPhotos),
          };
        }
      } catch (error) {
        console.warn('Netlify Blobs not available, using fallback storage');
        useFallback = true;
      }
      
      // Fallback to in-memory storage
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(photos),
      };
    }

    if (event.httpMethod === 'POST') {
      const { photo, action } = JSON.parse(event.body || '{}');
      
      if (action === 'upload' || !action) {
        // Add new photo
        try {
          if (!useFallback) {
            const store = getStore('photos');
            
            // Get existing photos
            const existingPhotosData = await store.get('photos-list');
            const existingPhotos = existingPhotosData ? JSON.parse(existingPhotosData) : [];
            
            // Add new photo to the beginning
            existingPhotos.unshift(photo);
            
            // Save back to store
            await store.set('photos-list', JSON.stringify(existingPhotos));
            
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({ success: true, photo }),
            };
          }
        } catch (error) {
          console.warn('Netlify Blobs not available, using fallback storage');
          useFallback = true;
        }
        
        // Fallback to in-memory storage
        photos.unshift(photo);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, photo }),
        };
      }
      
      if (action === 'delete') {
        // Delete photo by ID
        try {
          if (!useFallback) {
            const store = getStore('photos');
            
            // Get existing photos
            const existingPhotosData = await store.get('photos-list');
            const existingPhotos = existingPhotosData ? JSON.parse(existingPhotosData) : [];
            
            // Filter out the photo to delete
            const updatedPhotos = existingPhotos.filter((p: any) => p.id !== photo.id);
            
            // Save back to store
            await store.set('photos-list', JSON.stringify(updatedPhotos));
            
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({ success: true, deleted: photo.id }),
            };
          }
        } catch (error) {
          console.warn('Netlify Blobs not available, using fallback storage');
          useFallback = true;
        }
        
        // Fallback to in-memory storage
        photos = photos.filter((p: any) => p.id !== photo.id);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, deleted: photo.id }),
        };
      }
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
