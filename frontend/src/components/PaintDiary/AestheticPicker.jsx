import React, { useState } from 'react';
import { Palette, X, Sparkles, Check, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDiaryTheme } from './ThemeContext';

const AestheticPicker = ({ isOpen, onClose }) => {
    const { allThemes, activeTheme, setActiveTheme, theme } = useDiaryTheme();
    const [hoveredTheme, setHoveredTheme] = useState(null);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
            {/* Backdrop */}
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
            />

            {/* Modal */}
            <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-5xl bg-[#0a0a0c] border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Visual Flair Background */}
                <div className="absolute inset-0 pointer-events-none opacity-30">
                    <div 
                        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] transition-colors duration-1000"
                        style={{ backgroundColor: hoveredTheme ? allThemes[hoveredTheme].accent : theme.accent }}
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                </div>

                {/* Header */}
                <div className="p-10 border-b border-white/5 flex justify-between items-center relative z-10">
                    <div>
                        <h3 className="text-4xl font-black text-white flex items-center gap-4 tracking-tighter">
                            <div className="p-3 bg-white/5 rounded-2xl text-white shadow-xl">
                                <Palette size={32} />
                            </div>
                            SYSTEM AESTHETICS
                        </h3>
                        <p className="text-gray-500 text-sm mt-2 font-bold uppercase tracking-[0.3em] flex items-center gap-2">
                            <Sparkles size={14} className="text-amber-400" /> 
                            Choose your operational atmosphere
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-4 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/10"
                    >
                        <X size={24} className="text-gray-500 hover:text-white" />
                    </button>
                </div>

                {/* Theme Grid */}
                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Object.entries(allThemes).map(([key, t]) => {
                            const isActive = activeTheme === key;
                            return (
                                <motion.button
                                    key={key}
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    whileTap={{ scale: 0.98 }}
                                    onMouseEnter={() => setHoveredTheme(key)}
                                    onMouseLeave={() => setHoveredTheme(null)}
                                    onClick={() => { setActiveTheme(key); }}
                                    className={`
                                        group relative p-6 rounded-[2rem] border transition-all duration-500 text-left overflow-hidden
                                        ${isActive ? 'border-white bg-white/10 shadow-2xl' : 'border-white/5 bg-white/[0.03] hover:border-white/20'}
                                    `}
                                >
                                    {/* Preview Glow */}
                                    <div 
                                        className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"
                                        style={{ backgroundColor: t.accent }}
                                    />

                                    <div className="flex justify-between items-center mb-4">
                                        <div 
                                            className="w-12 h-12 rounded-2xl border border-white/20 shadow-lg flex items-center justify-center transition-transform group-hover:rotate-12"
                                            style={{ backgroundColor: t.accent }}
                                        >
                                            {isActive && <Check size={20} className="text-white drop-shadow-md" strokeWidth={4} />}
                                        </div>
                                        <div className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-gray-500'}`}>
                                            {key}
                                        </div>
                                    </div>

                                    <div>
                                        <div className={`text-xl font-black transition-colors ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                            {t.name}
                                        </div>
                                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                                            High-Fidelity Interface
                                        </div>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between">
                                        <div className="flex gap-1">
                                            <div className="w-4 h-1 rounded-full opacity-40" style={{ backgroundColor: t.accent }} />
                                            <div className="w-8 h-1 rounded-full" style={{ backgroundColor: t.accent }} />
                                        </div>
                                        <ChevronRight size={16} className={`transition-transform duration-500 ${isActive ? 'translate-x-0 opacity-100 text-white' : '-translate-x-4 opacity-0 text-gray-500 group-hover:translate-x-0 group-hover:opacity-100'}`} />
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-white/5 bg-black/40 flex justify-center items-center">
                    <button 
                        onClick={onClose}
                        className={`px-16 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl ${theme.button} text-white`}
                    >
                        Initialize Aesthetic
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default AestheticPicker;
