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
