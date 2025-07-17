import { useState, useRef, useCallback } from 'react';
import { CalendarIcon, UserIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Photo, PaginationInfo } from '../types';

interface PhotoGalleryProps {
  photos: Photo[];
  pagination: PaginationInfo;
  loading: boolean;
  error: string | null;
  onLoadMore: () => void;
  isGrandad?: boolean;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ 
  photos, 
  pagination, 
  loading, 
  error, 
  onLoadMore, 
  isGrandad = false 
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  
  const lastPhotoElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && pagination.hasNext) {
        onLoadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, pagination.hasNext, onLoadMore]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (photos.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="text-gray-400">
          <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No photos yet</h3>
          <p className="text-gray-500">
            {isGrandad 
              ? "Your family hasn't shared any photos yet. They'll appear here when they do!" 
              : "Start by sharing your first photo with grandad!"
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Photo Gallery ({photos.length} photos)
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo, index) => {
            const isLast = index === photos.length - 1;
            return (
              <div
                key={photo.id}
                ref={isLast ? lastPhotoElementRef : null}
                className="group relative bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <div className="aspect-square">
                  <img
                    src={photo.thumbnailUrl || photo.url}
                    alt={photo.description}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                
                <div className="p-3">
                  <p className="text-sm text-gray-900 line-clamp-2 mb-2">
                    {photo.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <UserIcon className="h-3 w-3" />
                      <span>{photo.uploadedBy}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="h-3 w-3" />
                      <span>{formatDate(photo.uploadedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="text-center py-8">
            <div className="text-red-600 mb-2">{error}</div>
            <button 
              onClick={onLoadMore}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Try again
            </button>
          </div>
        )}
        
        {/* End of results */}
        {!loading && !error && !pagination.hasNext && photos.length > 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            You've reached the end of the gallery!
          </div>
        )}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Photo Details</h3>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.description}
                  className="w-full max-h-96 object-contain rounded-lg"
                />
              </div>
              
              <div className="space-y-2">
                <p className="text-gray-900">{selectedPhoto.description}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <UserIcon className="h-4 w-4" />
                    <span>Shared by {selectedPhoto.uploadedBy}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{formatDate(selectedPhoto.uploadedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
