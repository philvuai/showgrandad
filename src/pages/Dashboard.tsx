import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { PhotoUpload } from '../components/PhotoUpload';
import { PhotoGallery } from '../components/PhotoGallery';
import { Photo, PhotoUpload as PhotoUploadType, User } from '../types';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Load photos from localStorage on component mount
    const savedPhotos = localStorage.getItem('showgrandad_photos');
    if (savedPhotos) {
      try {
        const parsedPhotos = JSON.parse(savedPhotos);
        setPhotos(parsedPhotos);
      } catch (e) {
        console.error('Error loading photos:', e);
      }
    }
  }, []);

  const handlePhotoUpload = async (upload: PhotoUploadType) => {
    setIsUploading(true);
    
    try {
      // Create a data URL for the image
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        
        const newPhoto: Photo = {
          id: Date.now().toString(),
          filename: upload.file.name,
          description: upload.description,
          uploadedAt: new Date().toISOString(),
          uploadedBy: user.username,
          url: imageUrl,
          thumbnailUrl: imageUrl, // In a real app, you'd generate a thumbnail
        };
        
        const updatedPhotos = [newPhoto, ...photos];
        setPhotos(updatedPhotos);
        
        // Save to localStorage
        localStorage.setItem('showgrandad_photos', JSON.stringify(updatedPhotos));
        
        setIsUploading(false);
      };
      
      reader.readAsDataURL(upload.file);
    } catch (error) {
      console.error('Error uploading photo:', error);
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <PhotoUpload onUpload={handlePhotoUpload} isUploading={isUploading} />
          <PhotoGallery photos={photos} />
        </div>
      </main>
    </div>
  );
};
