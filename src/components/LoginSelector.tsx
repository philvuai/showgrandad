import { useState } from 'react';
import { UserIcon, UsersIcon } from '@heroicons/react/24/outline';
import { Login } from './Login';
import { GrandadLogin } from './GrandadLogin';

interface LoginSelectorProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
  error: string | null;
  isLoading: boolean;
}

export const LoginSelector: React.FC<LoginSelectorProps> = ({ onLogin, error, isLoading }) => {
  const [loginType, setLoginType] = useState<'selector' | 'grandad' | 'family'>('selector');

  if (loginType === 'grandad') {
    return (
      <GrandadLogin 
        onLogin={onLogin} 
        error={error} 
        isLoading={isLoading}
        onBack={() => setLoginType('selector')}
      />
    );
  }

  if (loginType === 'family') {
    return (
      <Login 
        onLogin={onLogin} 
        error={error} 
        isLoading={isLoading}
        onBack={() => setLoginType('selector')}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ShowGrandad
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Family Photo Gallery
          </p>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-6 text-center">
            Who are you?
          </h3>
          
          <div className="space-y-4">
            <button
              onClick={() => setLoginType('grandad')}
              className="w-full flex items-center justify-center px-6 py-6 border-2 border-gray-300 rounded-lg text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            >
              <UserIcon className="h-8 w-8 mr-3 text-primary-600" />
              <div className="text-left">
                <div className="font-semibold text-gray-900">I'm Grandad</div>
                <div className="text-sm text-gray-500">Simple PIN login</div>
              </div>
            </button>
            
            <button
              onClick={() => setLoginType('family')}
              className="w-full flex items-center justify-center px-6 py-6 border-2 border-gray-300 rounded-lg text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            >
              <UsersIcon className="h-8 w-8 mr-3 text-primary-600" />
              <div className="text-left">
                <div className="font-semibold text-gray-900">I'm Family</div>
                <div className="text-sm text-gray-500">Password login</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
