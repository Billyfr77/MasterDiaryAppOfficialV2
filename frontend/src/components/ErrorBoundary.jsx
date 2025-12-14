import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
            <AlertTriangle size={40} className="text-red-500" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">System Critical Failure</h1>
          <p className="text-gray-400 max-w-md mb-8">
            The application encountered an unexpected error. Our safety protocols have contained it.
          </p>
          
          <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-left w-full max-w-lg mb-8 font-mono text-xs text-red-300 overflow-auto max-h-40">
            {this.state.error?.toString()}
          </div>

          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors"
          >
            <RefreshCw size={18} />
            Reboot System
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
