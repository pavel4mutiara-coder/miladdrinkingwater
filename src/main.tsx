import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import App from './App.tsx';
import { ErrorFallback } from './components/common/ErrorBoundary';
import './index.css';

console.log('🚀 Milad Water App - Initializing...');

const APP_VERSION = '1.0.1'; // Increment this during deployments to force cache clear

// Force cache clearing on version mismatch
const checkVersion = () => {
  try {
    const storedVersion = localStorage.getItem('milad_app_version');
    if (storedVersion && storedVersion !== APP_VERSION) {
      console.log(`Version mismatch: ${storedVersion} -> ${APP_VERSION}. Clearing cache...`);
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem('milad_app_version', APP_VERSION);
      window.location.reload();
      return true;
    }
    localStorage.setItem('milad_app_version', APP_VERSION);
  } catch (e) {
    console.warn('LocalStorage not available for version check', e);
  }
  return false;
};

if (!checkVersion()) {
  // Listen for chunk load errors
  window.addEventListener('error', (event) => {
    const errorMsg = event.message || '';
    if (errorMsg.includes('ChunkLoadError') || errorMsg.includes('Loading chunk')) {
      console.warn('Chunk load error detected in main. Attempting refresh...');
      window.location.reload();
    }
  }, true);

  // Handle unhandled rejections
  window.onunhandledrejection = (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);
  };

  const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Root element not found! Make sure <div id="root"></div> exists in index.html');
} else {
  console.log('✅ Root element found, mounting React app...');
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <ErrorBoundary 
          FallbackComponent={ErrorFallback} 
          onReset={() => window.location.reload()}
          onError={(error, info) => {
            console.error('ErrorBoundary caught an error:', error, info);
          }}
        >
          <App />
        </ErrorBoundary>
      </StrictMode>,
    );
  } catch (error) {
    console.error('💥 Crash during createRoot.render:', error);
  }
}
}
