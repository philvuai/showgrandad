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
      // Authentication credentials
      const FAMILY_PASSWORD = 'GrandadWebb!123'; // For family members
      const GRANDAD_PIN = '1234'; // Simple PIN for grandad
      
      // Check if it's grandad with PIN or family member with password
      const isValidLogin = (
        (username.toLowerCase() === 'grandad' && password === GRANDAD_PIN) ||
        (username.toLowerCase() !== 'grandad' && password === FAMILY_PASSWORD)
      );
      
      if (isValidLogin) {
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
        if (username.toLowerCase() === 'grandad') {
          setError('Invalid PIN. Please try again.');
        } else {
          setError('Invalid password. Please try again.');
        }
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
