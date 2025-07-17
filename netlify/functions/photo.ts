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

// Helper function to create a simple thumbnail by reducing quality
const createThumbnail = (base64Data: string): string => {
  // For now, return the original - in a real implementation you'd resize
  return base64Data;
};

export const handler: Handler = async (event, context) => {
  // Extract photo ID from path: /photo/123 -> 123
  const photoId = event.path.split('/').pop();
  const isThumbnail = event.queryStringParameters?.thumbnail === 'true';
  
  if (!photoId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Photo ID is required' }),
    };
  }

  try {
    const store = getPhotoStore();
    const photosData = await store.get(PHOTOS_KEY);
    const allPhotos = photosData ? JSON.parse(photosData) : [];
    
    // Find the photo
    const photo = allPhotos.find((p: any) => p.id === photoId);
    
    if (!photo) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Photo not found' }),
      };
    }

    // Get the image data (base64)
    const imageData = isThumbnail ? createThumbnail(photo.url) : photo.url;
    
    // Extract the base64 data and mime type
    const matches = imageData.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid image data' }),
      };
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    
    // Convert base64 to binary
    const imageBuffer = Buffer.from(base64Data, 'base64');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
        'Content-Length': imageBuffer.length.toString(),
      },
      body: imageBuffer.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error('Error serving photo:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
