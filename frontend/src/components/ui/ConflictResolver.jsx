import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RefreshCcw, Save, X, ArrowRight } from 'lucide-react';

const ConflictResolver = ({ isOpen, onResolve, onCancel, serverData, localData }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-stone-900 border border-white/10 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
            >
                <div className="p-10 border-b border-white/5 flex justify-between items-center bg-rose-500/10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-rose-500 rounded-2xl text-white shadow-lg animate-pulse">
                            <AlertTriangle size={32} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Sync Conflict Detected</h3>
                            <p className="text-rose-400 text-xs font-bold uppercase tracking-widest mt-1">Data has been modified by another user</p>
                        </div>
                    </div>
                    <button onClick={onCancel} className="p-3 hover:bg-white/5 rounded-full text-gray-500 transition-all"><X size={24}/></button>
                </div>

                <div className="p-10 space-y-8 flex-1 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-6">
                        {/* Server Version */}
                        <div className="p-6 bg-white/5 rounded-[2rem] border border-indigo-500/20 space-y-4">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">Server Version (Current)</span>
                            <div className="text-sm text-gray-300 italic leading-relaxed">
                                This version was saved while you were editing. It contains the most recent database state.
                            </div>
                            <button 
                                onClick={() => onResolve('RELOAD')}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                            >
                                <RefreshCcw size={14} /> Accept Server
                            </button>
                        </div>

                        {/* Local Version */}
                        <div className="p-6 bg-white/5 rounded-[2rem] border border-rose-500/20 space-y-4">
                            <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest block">Your Version (Pending)</span>
                            <div className="text-sm text-gray-300 italic leading-relaxed">
                                These are your local changes. Overwriting will erase the server version permanently.
                            </div>
                            <button 
                                onClick={() => onResolve('OVERWRITE')}
                                className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                            >
                                <Save size={14} /> Overwrite Server
                            </button>
                        </div>
                    </div>

                    <div className="p-6 bg-black/40 rounded-[2rem] border border-white/5">
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <ArrowRight size={12} /> Strategic Recommendation
                        </h4>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Our Partner recommends **Accepting the Server Version** and re-applying your specific edits to ensure no data from other team members is lost.
                        </p>
                    </div>
                </div>

                <div className="p-8 border-t border-white/5 bg-black/40 text-center">
                    <p className="text-[10px] text-gray-600 uppercase font-black tracking-[0.2em]">MasterDiaryOS // Resilience Core V1.0</p>
                </div>
            </motion.div>
        </div>
    );
};

export default ConflictResolver;