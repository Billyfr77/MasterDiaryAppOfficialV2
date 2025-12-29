import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCcw, ArrowLeft, ShieldAlert } from 'lucide-react';

class SovereignErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[UI_CRASH]", error, errorInfo);
    // Optionally log to backend Audit here if needed
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen bg-[#010102] flex items-center justify-center p-8 text-white font-sans">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.1)_0%,transparent_70%)] pointer-events-none" />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-stone-900 border border-white/10 p-16 rounded-[4rem] max-w-2xl text-center shadow-2xl relative z-10 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-rose-600 shadow-[0_0_20px_#f43f5e]" />
            
            <div className="w-24 h-24 bg-rose-600/20 border border-rose-500/40 rounded-3xl flex items-center justify-center mx-auto mb-10">
                <ShieldAlert size={48} className="text-rose-500 animate-pulse" />
            </div>

            <h1 className="text-4xl font-black uppercase tracking-tight mb-6">Lattice Instability Detected</h1>
            <p className="text-gray-400 text-lg leading-relaxed mb-10">
              A visual component has encountered a critical failure. The Sovereign Core is intact, but this specific view needs to be re-initialized.
            </p>

            <div className="flex flex-col gap-4">
                <button 
                    onClick={() => window.location.reload()}
                    className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all"
                >
                    <RefreshCcw size={20} /> Re-Initialize View
                </button>
                <button 
                    onClick={() => window.history.back()}
                    className="w-full py-5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all"
                >
                    <ArrowLeft size={20} /> Retreat to Safety
                </button>
            </div>

            <div className="mt-12 p-6 bg-black/40 rounded-3xl border border-white/5 text-left">
                <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <AlertTriangle size={12} /> Diagnostic_Trace
                </div>
                <div className="text-[10px] font-mono text-gray-600 break-all leading-relaxed">
                    {this.state.error?.toString()}
                </div>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SovereignErrorBoundary;