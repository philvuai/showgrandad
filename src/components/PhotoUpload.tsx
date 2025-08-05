import { useState, useRef } from 'react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { PhotoUpload as PhotoUploadType, MultiPhotoUpload } from '../types';

interface SelectedPhoto {
  file: File;
  preview: string;
  description: string;
}

interface PhotoUploadProps {
  onUpload: (upload: PhotoUploadType) => Promise<void>;
  onMultiUpload: (uploads: MultiPhotoUpload) => Promise<void>;
  isUploading: boolean;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({ onUpload, onMultiUpload, isUploading }) => {
  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhoto[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const preview = e.target?.result as string;
          setSelectedPhotos(prev => [...prev, { file, preview, description: '' }]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const preview = e.target?.result as string;
          setSelectedPhotos(prev => [...prev, { file, preview, description: '' }]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDescriptionChange = (index: number, newDescription: string) => {
    setSelectedPhotos(prev => {
      const updated = [...prev];
      updated[index].description = newDescription;
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedPhotos.length === 0) return;
    
    if (selectedPhotos.length === 1) {
      // Use single upload for single photo
      const photo = selectedPhotos[0];
      await onUpload({ file: photo.file, description: photo.description });
    } else {
      // Use multi-upload for multiple photos
      await onMultiUpload({
        files: selectedPhotos.map(photo => photo.file),
        descriptions: selectedPhotos.map(photo => photo.description)
      });
    }

    // Clear form after successful upload
    setSelectedPhotos([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllPhotos = () => {
    setSelectedPhotos([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Share Photo{selectedPhotos.length !== 1 ? 's' : ''}
        </h2>
        {selectedPhotos.length > 0 && (
          <button
            type="button"
            onClick={clearAllPhotos}
            className="text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File Selection Area */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choose Photos
          </label>
          
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Click to select or drag and drop photos
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, GIF up to 5MB each • Select multiple files
            </p>
            {selectedPhotos.length > 0 && (
              <p className="text-sm text-primary-600 mt-2 font-medium">
                {selectedPhotos.length} photo{selectedPhotos.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFilesSelect}
            className="hidden"
            multiple
          />
        </div>
        
        {/* Selected Photos Preview */}
        {selectedPhotos.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">
              Selected Photos ({selectedPhotos.length})
            </h3>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {selectedPhotos.map((photo, index) => (
                <div key={index} className="relative border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <div className="relative mb-3">
                    <img
                      src={photo.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors"
                      title="Remove photo"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Description for {photo.file.name}
                    </label>
                    <textarea
                      rows={3}
                      className="w-full text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                      placeholder="What's happening in this photo?"
                      value={photo.description}
                      onChange={(e) => handleDescriptionChange(index, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={selectedPhotos.length === 0 || isUploading}
            className="btn-primary"
          >
            {isUploading 
              ? `Uploading ${selectedPhotos.length} photo${selectedPhotos.length !== 1 ? 's' : ''}...` 
              : `Share ${selectedPhotos.length} Photo${selectedPhotos.length !== 1 ? 's' : ''}`
            }
          </button>
        </div>
      </form>
    </div>
  );
};
