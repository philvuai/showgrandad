import { useAuth } from './hooks/useAuth';
import { Login } from './components/Login';
import { Dashboard } from './pages/Dashboard';

function App() {
  const { user, isLoading, error, login, logout } = useAuth();

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
    return <Login onLogin={login} error={error} isLoading={isLoading} />;
  }

  return <Dashboard user={user} onLogout={logout} />;
}

export default App;
