import { useAuth } from './hooks/useAuth';
import { LoginSelector } from './components/LoginSelector';
import { lazy, Suspense } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import ToastContainer from './components/Toast';
import { useToast } from './hooks/useToast';
const Dashboard = lazy(() => import('./pages/Dashboard'));

function App() {
  const { user, isLoading, error, login, logout } = useAuth();
  const { toasts, removeToast } = useToast();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginSelector onLogin={login} error={error} isLoading={isLoading} />;
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      }>
        <Dashboard user={user} onLogout={logout} />
      </Suspense>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ErrorBoundary>
  );
}

export default App;
