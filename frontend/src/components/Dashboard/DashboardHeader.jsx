import React from 'react';
import { Sparkles, Clock, Brain, Activity } from 'lucide-react';
import NotificationDropdown from '../NotificationDropdown';

const DashboardHeader = ({ lastUpdate, healthStatus, isAnalyzing, performAIAnalysis }) => {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-center p-6 bg-stone-900/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl transition-all hover:shadow-indigo-900/20">
      <div className="mb-6 lg:mb-0">
        <div className="flex items-center gap-5 mb-3">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-40 animate-pulse" />
            <div className="relative bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-3 shadow-lg ring-1 ring-white/20">
              <Sparkles size={28} className="text-white" />
            </div>
          </div>
          <div>
            <h1 className="m-0 text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-md">
              AI Ultimate Dashboard
            </h1>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-400 mt-1">
              <span className="bg-white/10 px-2 py-0.5 rounded text-xs text-indigo-300 border border-white/5">V2.5</span>
              <span>Autonomous Business Intelligence</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 mt-5">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-black/20 rounded-full text-xs font-bold text-gray-400 border border-white/5">
            <Clock size={14} className="text-indigo-400" />
            Updated: {lastUpdate.toLocaleTimeString()}
          </div>
          <div 
            className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md transition-all hover:scale-105"
            style={{
              backgroundColor: `${healthStatus.color}15`,
              borderColor: `${healthStatus.color}40`,
              color: healthStatus.color
            }}
          >
            <div className="w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_currentColor]" style={{ backgroundColor: healthStatus.color }} />
            System Health: {healthStatus.status.toUpperCase()}
          </div>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <NotificationDropdown />
        <button
          onClick={performAIAnalysis}
          disabled={isAnalyzing}
          className={`
            group relative flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-sm transition-all duration-300
            ${isAnalyzing 
              ? 'bg-stone-800 cursor-not-allowed text-gray-500 border border-white/5' 
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] hover:-translate-y-1 active:scale-95'}
          `}
        >
          <Brain size={20} className={isAnalyzing ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'} />
          <span className="tracking-wide">{isAnalyzing ? 'PROCESSING DATA...' : 'RUN AI ANALYSIS'}</span>
          
          {/* Button Glow Effect */}
          {!isAnalyzing && <div className="absolute inset-0 rounded-2xl ring-1 ring-white/20 group-hover:ring-white/40 transition-all" />}
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;
