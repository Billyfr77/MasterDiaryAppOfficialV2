import React from 'react';
import { Activity, Sparkles, Zap, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PowerHeader = ({ 
    title, 
    icon: Icon,
    stats = [], 
    isPulseActive, 
    onPulseToggle, 
    onAiSuggest, 
    children, // For controls like DatePicker, Selects, etc.
    className 
}) => {
    return (
        <div className={`relative z-20 ${className}`}>
            {/* Main Header Bar */}
            <div className={`
                relative overflow-hidden rounded-3xl border border-white/10 backdrop-blur-xl transition-all duration-500
                ${isPulseActive ? 'bg-indigo-900/40 shadow-[0_0_50px_rgba(79,70,229,0.3)] border-indigo-500/30' : 'bg-stone-900/60 shadow-xl'}
            `}>
                {/* Pulse Background Effect */}
                <AnimatePresence>
                    {isPulseActive && (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 animate-pulse-slow pointer-events-none"
                        />
                    )}
                </AnimatePresence>

                <div className="p-6 flex flex-col xl:flex-row justify-between items-center gap-6 relative z-10">
                    {/* Title & Pulse Toggle */}
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className={`p-3 rounded-2xl transition-colors ${isPulseActive ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/50' : 'bg-white/5 text-gray-400'}`}>
                                {Icon && <Icon size={24} />}
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-white tracking-tight leading-none">{title}</h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className={`w-2 h-2 rounded-full ${isPulseActive ? 'bg-green-400 animate-ping' : 'bg-gray-600'}`} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                        {isPulseActive ? 'AI Pulse Active' : 'Standard Mode'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="h-10 w-px bg-white/10 mx-2 hidden md:block" />

                        <button 
                            onClick={onPulseToggle}
                            className={`
                                group relative px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all overflow-hidden
                                ${isPulseActive 
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 hover:bg-indigo-500' 
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'}
                            `}
                        >
                            <div className="relative z-10 flex items-center gap-2">
                                <Activity size={16} className={isPulseActive ? 'animate-bounce' : ''} />
                                {isPulseActive ? 'Pulse On' : 'Enable Pulse'}
                            </div>
                            {isPulseActive && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />}
                        </button>
                    </div>

                    {/* Central/Right Controls (Project Selectors etc) */}
                    <div className="flex flex-wrap items-center gap-3 justify-center xl:justify-end flex-1">
                        {children}
                        
                        {/* AI Suggestion Button (Only in Pulse Mode) */}
                        <AnimatePresence>
                            {isPulseActive && (
                                <motion.button
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    onClick={onAiSuggest}
                                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-amber-500/30 hover:brightness-110 transition-all ml-2"
                                >
                                    <Zap size={16} fill="currentColor" />
                                    <span>AI Suggest</span>
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Stats Bar (Integrated) */}
                {stats.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 border-t border-white/5 bg-black/20 divide-x divide-white/5">
                        {stats.map((stat, i) => (
                            <div key={i} className="p-4 flex flex-col items-center justify-center hover:bg-white/5 transition-colors group">
                                <span className="text-[10px] font-black uppercase text-gray-500 mb-1 group-hover:text-white transition-colors">{stat.label}</span>
                                <div className={`text-xl font-black ${stat.color || 'text-white'}`}>{stat.value}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PowerHeader;
