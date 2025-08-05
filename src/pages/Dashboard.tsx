import { useState } from 'react';
import { Header } from '../components/Header';
import { PhotoUpload } from '../components/PhotoUpload';
import { PhotoGallery } from '../components/PhotoGallery';
import { PhotoUpload as PhotoUploadType, MultiPhotoUpload, User } from '../types';
import { usePhotos } from '../hooks/usePhotos';
import { api } from '../utils/api';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [isUploading, setIsUploading] = useState(false);
  const { photos, pagination, loading, error, loadMore, addPhoto, addMultiplePhotos } = usePhotos();

  const handlePhotoUpload = async (upload: PhotoUploadType) => {
    setIsUploading(true);
    
    try {
      const uploadedPhoto = await api.uploadPhoto(upload, user.username);
      addPhoto(uploadedPhoto);
    } catch (error) {
      console.error('Error uploading photo:', error);
      // TODO: Add user-friendly error handling
    } finally {
      setIsUploading(false);
    }
  };

  const handleMultiPhotoUpload = async (uploads: MultiPhotoUpload) => {
    setIsUploading(true);
    
    try {
      const uploadedPhotos = await api.uploadMultiplePhotos(uploads, user.username);
      addMultiplePhotos(uploadedPhotos);
    } catch (error) {
      console.error('Error uploading photos:', error);
      // TODO: Add user-friendly error handling
    } finally {
      setIsUploading(false);
    }
  };

  const isGrandad = user.username.toLowerCase() === 'grandad';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {isGrandad && (
            <div className="card text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome, Grandad!</h2>
              <p className="text-lg text-gray-600">
                Here are all the photos your family has shared with you
              </p>
            </div>
          )}
          
          {!isGrandad && (
            <PhotoUpload 
              onUpload={handlePhotoUpload} 
              onMultiUpload={handleMultiPhotoUpload}
              isUploading={isUploading} 
            />
          )}
          
          <PhotoGallery 
            photos={photos} 
            pagination={pagination}
            loading={loading}
            error={error}
            onLoadMore={loadMore}
            isGrandad={isGrandad} 
          />
        </div>
      </main>
    </div>
  );
};
