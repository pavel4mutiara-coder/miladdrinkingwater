import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import App from './App.tsx';
import { ErrorFallback } from './components/common/ErrorBoundary';
import './index.css';

console.log('🚀 Milad Water App - Initializing...');

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
