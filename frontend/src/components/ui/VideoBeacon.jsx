import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Sparkles, Youtube } from 'lucide-react';

const VideoBeacon = ({ videoId, title = "Neural Briefing", position = "bottom-8 right-8" }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!videoId) return null;

    // Map tailwind classes to motion variants or standard classes
    const positionClasses = position;

    return (
        <>
            {/* The Floating Beacon */}
            <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className={`fixed ${positionClasses} z-[100] group`}
            >
                <div className="absolute -inset-4 bg-indigo-500/20 rounded-full blur-xl group-hover:bg-indigo-500/40 transition-all animate-pulse" />
                <button className="relative bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20 transition-all">
                    <div className="bg-white/20 p-1.5 rounded-lg">
                        <Play size={18} fill="currentColor" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest pr-2 hidden md:block">{title}</span>
                </button>
                
                {/* Notification Badge */}
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 rounded-full border-2 border-stone-950 flex items-center justify-center animate-bounce">
                    <Sparkles size={10} className="text-white" />
                </div>
            </motion.div>

            {/* Cinematic Video Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-12"
                    >
                        <div className="relative w-full max-w-5xl aspect-video bg-black rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(99,102,241,0.3)]">
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="absolute top-6 right-6 z-50 p-3 bg-white/10 hover:bg-red-500/20 text-white hover:text-red-400 rounded-full transition-all border border-white/10"
                            >
                                <X size={24} />
                            </button>

                            <iframe 
                                className="w-full h-full"
                                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                                title="MasterDiary Academy"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />

                            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black/60 to-transparent flex justify-between items-end">
                                <div>
                                    <div className="flex items-center gap-2 text-indigo-400 mb-2">
                                        <Youtube size={16} />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">MasterDiary Academy</span>
                                    </div>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">{title}</h2>
                                </div>
                                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pb-1">
                                    Press ESC to close
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default VideoBeacon;
