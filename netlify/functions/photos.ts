import { Handler } from '@netlify/functions';
import faunadb from 'faunadb';

const q = faunadb.query;

// Initialize FaunaDB client
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET || 'fallback-secret',
});

// Fallback to in-memory storage if FaunaDB is not available
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
        if (!useFallback && process.env.FAUNADB_SECRET) {
          const result = await client.query(
            q.Map(
              q.Paginate(q.Documents(q.Collection('photos'))),
              q.Lambda(['ref'], q.Get(q.Var('ref')))
            )
          );
          const faunaPhotos = (result as any).data.map((photo: any) => ({
            id: photo.ref.id,
            ...photo.data,
          }));
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(faunaPhotos),
          };
        }
      } catch (error) {
        console.warn('FaunaDB not available, using fallback storage');
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
          if (!useFallback && process.env.FAUNADB_SECRET) {
            const result = await client.query(
              q.Create(q.Collection('photos'), {
                data: photo,
              })
            );
            
            const savedPhoto = {
              id: (result as any).ref.id,
              ...(result as any).data,
            };
            
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({ success: true, photo: savedPhoto }),
            };
          }
        } catch (error) {
          console.warn('FaunaDB not available, using fallback storage');
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
          if (!useFallback && process.env.FAUNADB_SECRET) {
            await client.query(
              q.Delete(q.Ref(q.Collection('photos'), photo.id))
            );
            
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({ success: true, deleted: photo.id }),
            };
          }
        } catch (error) {
          console.warn('FaunaDB not available, using fallback storage');
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
