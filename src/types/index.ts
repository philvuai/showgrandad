export interface Photo {
  id: string;
  filename: string;
  description: string;
  uploadedAt: string;
  uploadedBy: string;
  url: string;
  thumbnailUrl: string;
}

export interface User {
  id: string;
  username: string;
  isAuthenticated: boolean;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface PhotoUpload {
  file: File;
  description: string;
}

export interface MultiPhotoUpload {
  files: File[];
  descriptions: string[];
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PhotosResponse {
  photos: Photo[];
  pagination: PaginationInfo;
}
