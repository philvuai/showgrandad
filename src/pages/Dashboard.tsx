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
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      // Load from Netlify Functions API
      const response = await fetch('/.netlify/functions/photos');
      if (response.ok) {
        const serverPhotos = await response.json();
        setPhotos(serverPhotos);
        
        // Also save to localStorage as backup
        localStorage.setItem('showgrandad_photos', JSON.stringify(serverPhotos));
        return;
      }
    } catch (error) {
      console.warn('Could not load from server, using localStorage');
    }

    // Fallback to localStorage
    const savedPhotos = localStorage.getItem('showgrandad_photos');
    if (savedPhotos) {
      try {
        const parsedPhotos = JSON.parse(savedPhotos);
        setPhotos(parsedPhotos);
      } catch (e) {
        console.error('Error loading photos:', e);
      }
    }
  };

  const handlePhotoUpload = async (upload: PhotoUploadType) => {
    setIsUploading(true);
    
    try {
      // Create a data URL for the image
      const reader = new FileReader();
      reader.onload = async (e) => {
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
        
        try {
          // Upload to server
          const response = await fetch('/.netlify/functions/photos', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ photo: newPhoto, action: 'upload' }),
          });
          
          if (response.ok) {
            const result = await response.json();
            const uploadedPhoto = result.photo;
            
            // Add to local state
            const updatedPhotos = [uploadedPhoto, ...photos];
            setPhotos(updatedPhotos);
            
            // Also save to localStorage as backup
            localStorage.setItem('showgrandad_photos', JSON.stringify(updatedPhotos));
          } else {
            throw new Error('Failed to upload to server');
          }
        } catch (serverError) {
          console.warn('Could not upload to server, saving locally:', serverError);
          
          // Fallback to localStorage
          const updatedPhotos = [newPhoto, ...photos];
          setPhotos(updatedPhotos);
          localStorage.setItem('showgrandad_photos', JSON.stringify(updatedPhotos));
        }
        
        setIsUploading(false);
      };
      
      reader.readAsDataURL(upload.file);
    } catch (error) {
      console.error('Error uploading photo:', error);
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
            <PhotoUpload onUpload={handlePhotoUpload} isUploading={isUploading} />
          )}
          
          <PhotoGallery photos={photos} isGrandad={isGrandad} />
        </div>
      </main>
    </div>
  );
};
