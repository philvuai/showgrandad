import { useState, useEffect, useCallback } from 'react';
import { Photo, PhotosResponse, PaginationInfo } from '../types';
import { api } from '../utils/api';

export const usePhotos = (initialPage: number = 1, limit: number = 20) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: initialPage,
    limit,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPhotos = useCallback(async (page: number = 1, append: boolean = false, thumbnailsOnly: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const response: PhotosResponse = await api.getPhotos(page, limit, thumbnailsOnly);
      
      if (append) {
        setPhotos(prev => [...prev, ...response.photos]);
      } else {
        setPhotos(response.photos);
      }
      
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load photos');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const loadMore = useCallback(() => {
    if (pagination.hasNext && !loading) {
      loadPhotos(pagination.page + 1, true);
    }
  }, [pagination.hasNext, pagination.page, loading, loadPhotos]);

  const refresh = useCallback(() => {
    loadPhotos(1, false);
  }, [loadPhotos]);

  // Fast initial load with thumbnails only
  const loadThumbnails = useCallback(() => {
    loadPhotos(1, false, true);
  }, [loadPhotos]);

  // Load full images for existing photos
  const loadFullImages = useCallback(async () => {
    if (photos.length === 0) return;
    
    try {
      const response: PhotosResponse = await api.getPhotos(1, limit, false);
      
      // Merge full image data with existing thumbnail data
      setPhotos(prevPhotos => {
        return prevPhotos.map(photo => {
          const fullPhoto = response.photos.find(p => p.id === photo.id);
          return fullPhoto ? { ...photo, url: fullPhoto.url } : photo;
        });
      });
    } catch (err) {
      console.warn('Failed to load full images:', err);
    }
  }, [photos.length, limit]);

  const addPhoto = useCallback((newPhoto: Photo) => {
    setPhotos(prev => [newPhoto, ...prev]);
    setPagination(prev => ({
      ...prev,
      total: prev.total + 1,
    }));
  }, []);

  const addMultiplePhotos = useCallback((newPhotos: Photo[]) => {
    setPhotos(prev => [...newPhotos, ...prev]);
    setPagination(prev => ({
      ...prev,
      total: prev.total + newPhotos.length,
    }));
  }, []);

  useEffect(() => {
    loadPhotos(initialPage);
  }, [loadPhotos, initialPage]);

  return {
    photos,
    pagination,
    loading,
    error,
    loadMore,
    refresh,
    loadThumbnails,
    loadFullImages,
    addPhoto,
    addMultiplePhotos,
  };
};
