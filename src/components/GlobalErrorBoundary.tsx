import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Global Application Error:', error, errorInfo);
  }

  private handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 font-sans">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-[32px] p-8 text-center shadow-2xl">
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-red-500 w-10 h-10" />
            </div>
            <h1 className="text-2xl font-black text-white mb-4">Application Error</h1>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              We encountered an unexpected error. This might be due to a network issue or missing configuration.
            </p>
            
            <div className="bg-slate-950/50 rounded-2xl p-4 mb-8 text-left border border-slate-800">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Error Details</p>
              <p className="text-xs text-red-400 font-mono break-all line-clamp-3">
                {this.state.error?.message || 'Unknown execution error'}
              </p>
            </div>

            <button 
              onClick={this.handleReset}
              className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
            >
              <RefreshCw size={18} />
              Reset & Reload App
            </button>
            <p className="mt-6 text-[10px] text-slate-600 uppercase tracking-[0.2em] font-bold">Milad Management System</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
