import { useState, useEffect, useCallback } from 'react';
import { Photo, PhotosResponse, PaginationInfo } from '../types';
import { api } from '../utils/api';

export const usePhotos = (initialPage: number = 1, limit: number = 50) => {
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

  const loadPhotos = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const response: PhotosResponse = await api.getPhotos(page, limit);
      
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
    addPhoto,
    addMultiplePhotos,
  };
};
