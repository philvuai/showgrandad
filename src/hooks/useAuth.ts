import { useState, useEffect } from 'react';
import { AuthState, User } from '../types';

export const useAuth = (): AuthState & {
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
} => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already authenticated
    const storedUser = localStorage.getItem('showgrandad_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (e) {
        localStorage.removeItem('showgrandad_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual Netlify Function call
      // For now, we'll use a simple password check
      const FAMILY_PASSWORD = 'GrandadWebb!123'; // This should be stored securely
      
      if (password === FAMILY_PASSWORD) {
        const userData: User = {
          id: Date.now().toString(),
          username,
          isAuthenticated: true,
        };
        
        setUser(userData);
        localStorage.setItem('showgrandad_user', JSON.stringify(userData));
        setIsLoading(false);
        return true;
      } else {
        setError('Invalid password');
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      setError('Authentication failed');
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('showgrandad_user');
  };

  return {
    user,
    isLoading,
    error,
    login,
    logout,
  };
};
