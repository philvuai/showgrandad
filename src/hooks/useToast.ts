import { useState, useCallback } from 'react';
import { Toast, ToastType } from '../components/Toast';

let toastId = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((
    type: ToastType,
    title: string,
    message?: string,
    duration = 5000
  ) => {
    const id = `toast-${++toastId}`;
    const newToast: Toast = { id, type, title, message, duration };

    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const showSuccess = useCallback((title: string, message?: string, duration?: number) => {
    return addToast('success', title, message, duration);
  }, [addToast]);

  const showError = useCallback((title: string, message?: string, duration?: number) => {
    return addToast('error', title, message, duration);
  }, [addToast]);

  const showWarning = useCallback((title: string, message?: string, duration?: number) => {
    return addToast('warning', title, message, duration);
  }, [addToast]);

  const showInfo = useCallback((title: string, message?: string, duration?: number) => {
    return addToast('info', title, message, duration);
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
