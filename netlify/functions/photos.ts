import { Handler } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

// Use a consistent store name that persists across deployments
const SITE_ID = process.env.NETLIFY_SITE_ID || 'local';
const STORE_NAME = `instagrandad-${SITE_ID}`;
const PHOTOS_KEY = 'family-photos-list';

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
        const store = getStore(STORE_NAME);
        const photosData = await store.get(PHOTOS_KEY);
        const storedPhotos = photosData ? JSON.parse(photosData) : [];
        
        console.log(`Retrieved ${storedPhotos.length} photos from Netlify Blobs`);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(storedPhotos),
        };
      } catch (error) {
        console.error('Error accessing Netlify Blobs for GET:', error);
        console.log('Environment variables:', {
          NETLIFY_SITE_ID: process.env.NETLIFY_SITE_ID,
          NETLIFY_DEPLOY_ID: process.env.NETLIFY_DEPLOY_ID,
          NODE_ENV: process.env.NODE_ENV
        });
        
        // Return empty array if storage is unavailable
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify([]),
        };
      }
    }

    if (event.httpMethod === 'POST') {
      const { photo, action } = JSON.parse(event.body || '{}');
      
      if (action === 'upload' || !action) {
        // Add new photo
        try {
          const store = getStore(STORE_NAME);
          
          // Get existing photos
          const existingPhotosData = await store.get(PHOTOS_KEY);
          const existingPhotos = existingPhotosData ? JSON.parse(existingPhotosData) : [];
          
          // Add new photo to the beginning
          existingPhotos.unshift(photo);
          
          // Save back to store
          await store.set(PHOTOS_KEY, JSON.stringify(existingPhotos));
          
          console.log(`Saved photo to Netlify Blobs. Total photos: ${existingPhotos.length}`);
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, photo }),
          };
        } catch (error) {
          console.error('Error accessing Netlify Blobs for upload:', error);
          console.log('Environment variables:', {
            NETLIFY_SITE_ID: process.env.NETLIFY_SITE_ID,
            NETLIFY_DEPLOY_ID: process.env.NETLIFY_DEPLOY_ID,
            NODE_ENV: process.env.NODE_ENV
          });
          
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
              error: 'Photo storage is currently unavailable. Please try again later.',
              details: error.message 
            }),
          };
        }
      }
      
      if (action === 'delete') {
        // Delete photo by ID
        try {
          const store = getStore(STORE_NAME);
          
          // Get existing photos
          const existingPhotosData = await store.get(PHOTOS_KEY);
          const existingPhotos = existingPhotosData ? JSON.parse(existingPhotosData) : [];
          
          // Filter out the photo to delete
          const updatedPhotos = existingPhotos.filter((p: any) => p.id !== photo.id);
          
          // Save back to store
          await store.set(PHOTOS_KEY, JSON.stringify(updatedPhotos));
          
          console.log(`Deleted photo from Netlify Blobs. Remaining photos: ${updatedPhotos.length}`);
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, deleted: photo.id }),
          };
        } catch (error) {
          console.error('Error accessing Netlify Blobs for delete:', error);
          
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
              error: 'Photo deletion is currently unavailable. Please try again later.',
              details: error.message 
            }),
          };
        }
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
