import { Handler } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

// Use a consistent store name that persists across deployments
const SITE_ID = process.env.NETLIFY_SITE_ID || 'local';
const STORE_NAME = `instagrandad-${SITE_ID}`;
const PHOTOS_KEY = 'family-photos-list';

// Initialize store with explicit configuration
const getPhotoStore = () => {
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

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
      const store = getPhotoStore();
      
      try {
        const photosData = await store.get(PHOTOS_KEY);
        const allPhotos = photosData ? JSON.parse(photosData) : [];
        
        // Return debug information
        const debugInfo = {
          storeName: STORE_NAME,
          siteId: process.env.NETLIFY_SITE_ID || 'Not set',
          totalPhotos: allPhotos.length,
          photosMetadata: allPhotos.map((photo: any) => ({
            id: photo.id,
            filename: photo.filename,
            description: photo.description?.substring(0, 50) || 'No description',
            uploadedBy: photo.uploadedBy,
            uploadedAt: photo.uploadedAt,
            hasUrl: !!photo.url,
            hasThumb: !!photo.thumbnailUrl,
            urlSize: photo.url ? photo.url.length : 0,
            thumbSize: photo.thumbnailUrl ? photo.thumbnailUrl.length : 0
          })),
          lastFivePhotos: allPhotos.slice(0, 5).map((photo: any) => ({
            id: photo.id,
            filename: photo.filename,
            uploadedAt: photo.uploadedAt,
            uploadedBy: photo.uploadedBy
          }))
        };
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(debugInfo, null, 2),
        };
      } catch (error) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            error: 'Failed to access storage',
            details: error.message,
            storeName: STORE_NAME,
            siteId: process.env.NETLIFY_SITE_ID || 'Not set'
          }, null, 2),
        };
      }
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (error) {
    console.error('Debug function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
    };
  }
};
