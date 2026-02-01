import React, { useState } from 'react';
import { Activity, Sparkles, Zap, ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDiaryTheme } from '../PaintDiary/ThemeContext';

const PowerHeader = ({ 
    title, 
    icon: Icon,
    stats = [], 
    isPulseActive, 
    onPulseToggle, 
    onAiSuggest, 
    onStatItemClick,
    children, 
    className,
    variant = 'default' // 'default' | 'map'
}) => {
    const { theme } = useDiaryTheme();
    const [activeDropdown, setActiveDropdown] = useState(null);
    
    // Dynamic styles derived from global theme
    const themeColor = theme.primary;
    const glowColor = theme.accent;

    // Pulse secondary color mapping
    const pulseViaMap = {
        emerald: 'teal', amber: 'orange', gold: 'orange', rose: 'pink', ruby: 'pink',
        violet: 'purple', purple: 'purple', blue: 'cyan', cobalt: 'cyan',
        pink: 'rose', orange: 'amber', leather: 'amber', fuchsia: 'pink', magenta: 'pink',
        slate: 'blue', midnight: 'blue', cyan: 'blue', glacier: 'blue',
        indigo: 'purple', nebula: 'purple', green: 'emerald', forest: 'emerald',
        yellow: 'orange', sand: 'orange', lime: 'green', neon: 'green',
        sky: 'blue', neutral: 'slate', carbon: 'slate'
    };
    const pulseVia = pulseViaMap[themeColor] || 'indigo';

    // Ultra-Glass Styling
    const containerClasses = variant === 'map'
        ? "bg-stone-950/60 border-white/5 backdrop-blur-2xl shadow-2xl"
        : `${theme.bg} ${theme.border} backdrop-blur-xl shadow-xl`;

    return (
        <div className={`relative z-20 ${className}`}>
            {/* Main Header Bar */}
            <div className={`
                relative overflow-visible rounded-2xl border transition-all duration-500
                ${containerClasses}
                ${isPulseActive ? `shadow-[0_0_50px_${glowColor}22] border-${themeColor}-500/30` : ''}
            `}>
                {/* Pulse Background Effect */}
                <AnimatePresence>
                    {isPulseActive && (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            className={`absolute inset-0 bg-gradient-to-r from-${themeColor}-500/5 via-${pulseVia}-500/5 to-${themeColor}-500/5 animate-pulse-slow pointer-events-none rounded-2xl`}
                        />
                    )}
                </AnimatePresence>

                <div className="px-4 py-3 flex flex-col xl:flex-row justify-between items-center gap-4 relative z-10">
                    {/* Title & Pulse Toggle */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl transition-colors ${isPulseActive ? `bg-${themeColor}-500 text-white shadow-lg shadow-${themeColor}-500/50` : 'bg-white/5 text-gray-400'}`}>
                                {Icon && <Icon size={20} />}
                            </div>
                            <div>
                                <h1 className="text-lg font-black text-white tracking-tight leading-none uppercase">{title}</h1>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${isPulseActive ? 'bg-green-400 animate-ping' : 'bg-gray-600'}`} />
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                                        {isPulseActive ? 'AI Pulse Active' : 'System Ready'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {onPulseToggle && (
                            <>
                                <div className="h-8 w-px bg-white/10 mx-1 hidden md:block" />
                                <button 
                                    onClick={onPulseToggle}
                                    className={`
                                        group relative px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all overflow-hidden
                                        ${isPulseActive 
                                            ? `bg-${themeColor}-600 text-white shadow-lg shadow-${themeColor}-500/40 hover:bg-${themeColor}-500` 
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'}
                                    `}
                                >
                                    <div className="relative z-10 flex items-center gap-2">
                                        <Activity size={14} className={isPulseActive ? 'animate-bounce' : ''} />
                                        {isPulseActive ? 'Pulse On' : 'Enable Pulse'}
                                    </div>
                                    {isPulseActive && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />}
                                </button>
                            </>
                        )}
                    </div>

                    {/* Central/Right Controls (Project Selectors etc) */}
                    <div className="flex flex-wrap items-center gap-2 justify-center xl:justify-end flex-1">
                        {children}
                        
                        {/* AI Suggestion Button (Only in Pulse Mode) */}
                        <AnimatePresence>
                            {isPulseActive && onAiSuggest && (
                                <motion.button
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    onClick={onAiSuggest}
                                    className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-${themeColor}-500 to-${pulseVia}-600 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-${themeColor}-500/30 hover:brightness-110 transition-all ml-2`}
                                >
                                    <Zap size={14} fill="currentColor" />
                                    <span>AI Suggest</span>
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Stats Bar (Integrated Dropdowns) */}
                {stats.length > 0 && (
                    <div className="relative border-t border-white/5 bg-black/20">
                        <div className="grid grid-cols-3 divide-x divide-white/5">
                            {stats.map((stat, i) => (
                                <div 
                                    key={i} 
                                    className={`relative py-2 px-4 flex items-center justify-center gap-2 hover:bg-white/5 transition-colors group ${stat.data ? 'cursor-pointer' : 'cursor-default'}`}
                                    onClick={() => stat.data && setActiveDropdown(activeDropdown === i ? null : i)}
                                >
                                    <span className={`text-[9px] font-black uppercase text-gray-500 group-hover:text-${themeColor}-400 transition-colors`}>{stat.label}</span>
                                    <div className={`text-sm font-black ${stat.color || 'text-white'}`}>{stat.value}</div>
                                    {stat.data && (
                                        <ChevronDown size={10} className={`text-gray-600 transition-transform ${activeDropdown === i ? 'rotate-180' : ''}`} />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Dropdown Panel */}
                        <AnimatePresence>
                            {activeDropdown !== null && stats[activeDropdown]?.data && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute left-0 right-0 top-full mt-2 mx-4 z-50"
                                >
                                    <div className="bg-stone-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-2 max-h-64 overflow-y-auto custom-scrollbar">
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {stats[activeDropdown].data.map((item, idx) => (
                                                <button
                                                    key={item.id || idx}
                                                    onClick={() => {
                                                        onStatItemClick && onStatItemClick(item, stats[activeDropdown].type);
                                                        setActiveDropdown(null);
                                                    }}
                                                    className="p-2 hover:bg-white/10 rounded-lg text-left flex items-center justify-between group transition-all"
                                                >
                                                    <span className="text-xs font-bold text-gray-300 group-hover:text-white truncate">{item.name}</span>
                                                    <ChevronRight size={12} className="text-gray-600 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all" />
                                                </button>
                                            ))}
                                            {stats[activeDropdown].data.length === 0 && (
                                                <div className="col-span-full text-center py-4 text-[10px] text-gray-500 italic">No data available</div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PowerHeader;