import { useState } from 'react';
import { EyeIcon, EyeSlashIcon, UserIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

interface GrandadLoginProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
  error: string | null;
  isLoading: boolean;
  onBack?: () => void;
}

export const GrandadLogin: React.FC<GrandadLoginProps> = ({ onLogin, error, isLoading, onBack }) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin) {
      await onLogin('Grandad', pin);
    }
  };

  const handlePinChange = (value: string) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setPin(numericValue);
  };

  const clearPin = () => {
    setPin('');
  };

  const addDigit = (digit: string) => {
    if (pin.length < 6) {
      setPin(pin + digit);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center mb-4">
            <UserIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome, Grandad!
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Enter your PIN to see family photos
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="card">
            <div className="space-y-6">
              <div>
                <label htmlFor="pin" className="block text-lg font-medium text-gray-700 mb-3">
                  Your PIN
                </label>
                <div className="relative">
                  <input
                    id="pin"
                    name="pin"
                    type={showPin ? 'text' : 'password'}
                    required
                    className="block w-full px-4 py-4 text-2xl text-center border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-primary-500 tracking-widest"
                    placeholder="Enter PIN"
                    value={pin}
                    onChange={(e) => handlePinChange(e.target.value)}
                    maxLength={6}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowPin(!showPin)}
                  >
                    {showPin ? (
                      <EyeSlashIcon className="h-6 w-6 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-6 w-6 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Number pad for easier input */}
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => addDigit(digit.toString())}
                    className="h-16 text-2xl font-bold bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={clearPin}
                  className="h-16 text-lg font-medium bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => addDigit('0')}
                  className="h-16 text-2xl font-bold bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => setPin(pin.slice(0, -1))}
                  className="h-16 text-lg font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  ⌫
                </button>
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me" className="ml-3 block text-lg text-gray-700">
                  Keep me logged in
                </label>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-lg text-red-800">{error}</p>
              </div>
            )}

            <div className="mt-6">
              <button
                type="submit"
                disabled={isLoading || pin.length < 4}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-xl font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Signing in...' : 'View Family Photos'}
              </button>
            </div>
          </div>
        </form>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500">
            Having trouble? Ask a family member for help
          </p>
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back to login options
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
