import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { FallbackProps } from 'react-error-boundary';

export const ErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  let displayMessage = error.message;
  let userFriendlyMessage = '';

  try {
    const errorData = JSON.parse(error.message);
    if (errorData.userFriendlyMessage) {
      userFriendlyMessage = errorData.userFriendlyMessage;
      displayMessage = errorData.error;
    }
  } catch (e) {
    // Not a JSON error message, skip
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg p-4">
      <div className="max-w-md w-full bg-white dark:bg-dark-surface p-8 rounded-3xl shadow-xl border border-red-100 dark:border-red-900/20 text-center">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="text-red-500" size={40} />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {userFriendlyMessage || 'Something went wrong'}
        </h1>
        
        <p className="text-gray-600 dark:text-dark-muted mb-6 text-sm">
          {userFriendlyMessage ? displayMessage : (error.message || 'An unexpected error occurred. Please try refreshing the page.')}
        </p>

        <div className="space-y-3">
          <button
            onClick={resetErrorBoundary}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all"
          >
            <RotateCcw size={18} />
            Try Again
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-white rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            Refresh Page
          </button>
        </div>

        {import.meta.env.DEV && (
          <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-left overflow-auto max-h-40">
            <p className="text-xs font-mono text-gray-500 dark:text-gray-400 break-all">
              {error.stack}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
