import React from 'react';
import { Loader2 } from 'lucide-react';

const PremiumLoader = ({ text = "Initializing..." }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050507]" style={{ transform: 'translate3d(0,0,0)', backfaceVisibility: 'hidden' }}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1)_0%,transparent_70%)] animate-pulse" />
      
      <div className="relative flex flex-col items-center gap-8">
        <div className="relative w-24 h-24">
          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-[spin_8s_linear_infinite]" />
          <div className="absolute inset-0 rounded-full border-t-4 border-indigo-500 animate-[spin_2s_linear_infinite]" />
          
          {/* Inner Ring */}
          <div className="absolute inset-4 rounded-full border-4 border-purple-500/20 animate-[spin_4s_linear_infinite_reverse]" />
          <div className="absolute inset-4 rounded-full border-b-4 border-purple-500 animate-[spin_2s_linear_infinite_reverse]" />
          
          {/* Core */}
          <div className="absolute inset-[38px] bg-white rounded-full animate-pulse shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
        </div>

        <div className="flex flex-col items-center gap-2">
          <h2 className="text-xl font-black text-white tracking-[0.2em] uppercase animate-pulse">
            {text}
          </h2>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce delay-0" />
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce delay-150" />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce delay-300" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumLoader;
