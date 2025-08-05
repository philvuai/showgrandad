import { Handler } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

// Use a consistent store name that persists across deployments
const SITE_ID = process.env.NETLIFY_SITE_ID || 'local';
const STORE_NAME = `instagrandad-${SITE_ID}`;
const PHOTOS_KEY = 'family-photos-list';

// Initialize store with explicit configuration
const getPhotoStore = () => {
  // Explicitly pass the site ID and token if available
  const config: any = {
    name: STORE_NAME,
  };
  
  if (process.env.NETLIFY_SITE_ID) {
    config.siteID = process.env.NETLIFY_SITE_ID;
  }
  
  if (process.env.NETLIFY_AUTH_TOKEN) {
    config.token = process.env.NETLIFY_AUTH_TOKEN;
  }
  
  
  return getStore(config);
};

// Helper function to create thumbnail from base64 image
const createThumbnail = (base64Data: string, maxWidth: number = 300): string => {
  // For now, we'll use the same image but this could be optimized
  // In a real implementation, you'd resize the image here
  return base64Data;
};

// Helper function to store individual photo as blob
const storePhotoBlob = async (photoId: string, imageData: string): Promise<string> => {
  const store = getPhotoStore();
  const key = `photo-${photoId}`;
  await store.set(key, imageData);
  return key;
};

// Helper function to get photo blob URL
const getPhotoUrl = (photoId: string): string => {
  const siteUrl = process.env.DEPLOY_PRIME_URL || process.env.URL || 'https://strong-dango-91f336.netlify.app';
  return `${siteUrl}/.netlify/functions/photo/${photoId}`;
};

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
      // Get photos with pagination
      const queryParams = event.queryStringParameters || {};
      const page = parseInt(queryParams.page || '1', 10);
      const limit = parseInt(queryParams.limit || '50', 10);
      const includeImages = queryParams.includeImages === 'true';
      
      try {
        const store = getPhotoStore();
        const photosData = await store.get(PHOTOS_KEY);
        const allPhotos = photosData ? JSON.parse(photosData) : [];
        
        // Calculate pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedPhotos = allPhotos.slice(startIndex, endIndex);
        
        // If not including images, remove the image data to reduce payload
        const responsePhotos = includeImages ? paginatedPhotos : paginatedPhotos.map((photo: any) => ({
          ...photo,
          url: getPhotoUrl(photo.id),
          thumbnailUrl: getPhotoUrl(photo.id) + '?thumbnail=true',
          // Remove the base64 data to reduce payload size
          imageData: undefined
        }));
        
        console.log(`Retrieved page ${page} with ${responsePhotos.length} photos from Netlify Blobs`);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            photos: responsePhotos,
            pagination: {
              page,
              limit,
              total: allPhotos.length,
              totalPages: Math.ceil(allPhotos.length / limit),
              hasNext: endIndex < allPhotos.length,
              hasPrev: page > 1
            }
          }),
        };
      } catch (error) {
        console.error('Error accessing Netlify Blobs for GET:', error);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            photos: [],
            pagination: {
              page: 1,
              limit,
              total: 0,
              totalPages: 0,
              hasNext: false,
              hasPrev: false
            }
          }),
        };
      }
    }

    if (event.httpMethod === 'POST') {
      let photo, action;
      
      try {
        const body = JSON.parse(event.body || '{}');
        photo = body.photo;
        action = body.action;
      } catch (parseError) {
        console.error('Error parsing request body:', parseError);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid request body' }),
        };
      }
      
      if (!photo) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Photo data is required' }),
        };
      }
      
      if (action === 'upload' || !action) {
        // Add new photo
        try {
          const store = getPhotoStore();
          
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
          const store = getPhotoStore();
          
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
