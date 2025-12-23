import React, { useState, useEffect, useMemo } from 'react';
import { X, Clock, User, Wrench, Package, Save, CheckCircle2, ChevronRight, Activity, Zap, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChronosManagerModal = ({ isOpen, onClose, chronosNode, connectedNodes, onUpdateNode, onUpdateItem }) => {
    const [startTime, setStartTime] = useState("07:00");
    const [finishTime, setFinishTime] = useState("15:00");
    const [label, setLabel] = useState("");
    const [overrides, setOverrides] = useState({}); // { itemId: { duration, startTime } }

    useEffect(() => {
        if (chronosNode) {
            setStartTime(chronosNode.data.startTime || "07:00");
            setFinishTime(chronosNode.data.finishTime || "15:00");
            setLabel(chronosNode.data.label || "");
            
            // Initialize overrides from connected nodes if they differ from chronos
            const initialOverrides = {};
            connectedNodes.forEach(node => {
                const diff = Math.abs((parseFloat(node.data.duration) || 0) - (parseFloat(chronosNode.data.duration) || 0));
                if (diff > 0.01) {
                    initialOverrides[node.id] = { duration: node.data.duration };
                }
            });
            setOverrides(initialOverrides);
        }
    }, [chronosNode, connectedNodes]);

    const chronosDuration = useMemo(() => {
        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${finishTime}`);
        if (end > start) return (end - start) / (1000 * 60 * 60);
        return 0;
    }, [startTime, finishTime]);

    if (!isOpen || !chronosNode) return null;

    const handleSave = () => {
        // 1. Update the Chronos Node itself
        onUpdateNode(chronosNode.id, { startTime, finishTime, label, duration: chronosDuration });

        // 2. Update connected items (Standard propagation or Overrides)
        connectedNodes.forEach(node => {
            const override = overrides[node.id];
            if (override) {
                // Manually overridden: set the flag so engine doesn't overwrite it
                onUpdateItem(node.id, { 
                    duration: override.duration, 
                    isOverridden: true 
                });
            } else {
                // Default: Sync to Chronos and clear override flag
                onUpdateItem(node.id, { 
                    startTime, 
                    duration: chronosDuration,
                    isOverridden: false 
                });
            }
        });

        onClose();
    };

    const toggleOverride = (nodeId) => {
        setOverrides(prev => {
            if (prev[nodeId]) {
                const next = { ...prev };
                delete next[nodeId];
                return next;
            }
            return { ...prev, [nodeId]: { duration: chronosDuration } };
        });
    };

    const updateOverrideDuration = (nodeId, val) => {
        setOverrides(prev => ({
            ...prev,
            [nodeId]: { ...prev[nodeId], duration: parseFloat(val) }
        }));
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-[#0a0a0c] border border-cyan-500/20 w-full max-w-4xl rounded-[3rem] shadow-[0_0_100px_rgba(34,211,238,0.1)] overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
                
                {/* Header: The Temporal Core */}
                <div className="p-8 border-b border-white/5 bg-gradient-to-r from-cyan-950/20 to-transparent flex justify-between items-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(34,211,238,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
                    <div className="relative z-10 flex items-center gap-6">
                        <div className="w-16 h-16 rounded-full border-2 border-cyan-500/30 flex items-center justify-center bg-cyan-500/10 animate-pulse">
                            <Clock size={32} className="text-cyan-400" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Chronos_Command_Center</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                                <span className="text-[10px] font-black text-cyan-500/60 uppercase tracking-widest">Active Temporal Sync Active</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="relative z-10 p-3 hover:bg-white/5 rounded-full transition-colors text-gray-500 hover:text-white"><X size={24} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">
                        
                        {/* Left: Primary Controls */}
                        <div className="space-y-8">
                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4 block">Shift_Identity</label>
                                <input 
                                    value={label} 
                                    onChange={e => setLabel(e.target.value)}
                                    placeholder="e.g. MORNING SHIFT / CONCRETE POUR"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xl font-black text-white focus:border-cyan-500 outline-none transition-all placeholder-gray-800"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-cyan-500/30 transition-all group">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Timer size={16} className="text-cyan-500" />
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Global_Start</span>
                                    </div>
                                    <input 
                                        type="time" 
                                        value={startTime} 
                                        onChange={e => setStartTime(e.target.value)}
                                        className="w-full bg-transparent text-4xl font-black text-white font-mono outline-none cursor-pointer"
                                    />
                                </div>
                                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-cyan-500/30 transition-all group">
                                    <div className="flex items-center gap-3 mb-4 text-right justify-end">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Global_Finish</span>
                                        <Timer size={16} className="text-cyan-500" />
                                    </div>
                                    <input 
                                        type="time" 
                                        value={finishTime} 
                                        onChange={e => setFinishTime(e.target.value)}
                                        className="w-full bg-transparent text-4xl font-black text-white font-mono outline-none text-right cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="p-8 bg-cyan-500/5 rounded-3xl border border-cyan-500/20 flex justify-between items-center">
                                <div>
                                    <div className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-1">Effective_Duration</div>
                                    <div className="text-4xl font-black text-white font-mono">{chronosDuration.toFixed(2)}<span className="text-lg text-cyan-500/50 ml-2">HRS</span></div>
                                </div>
                                <div className="text-right">
                                    <Activity className="text-cyan-500/20" size={48} />
                                </div>
                            </div>
                        </div>

                        {/* Right: Connected Fleet */}
                        <div className="flex flex-col gap-4">
                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                                <User size={14} /> Connected_Fleet ({connectedNodes.length})
                            </h4>
                            <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2">
                                {connectedNodes.map(node => {
                                    const isOverridden = !!overrides[node.id];
                                    const currentDuration = isOverridden ? overrides[node.id].duration : chronosDuration;

                                    return (
                                        <div key={node.id} className={`p-4 rounded-2xl border transition-all ${isOverridden ? 'bg-amber-500/5 border-amber-500/20' : 'bg-white/5 border-white/5'}`}>
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${node.data.type === 'staff' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                                        {node.data.type === 'staff' ? <User size={14} /> : <Wrench size={14} />}
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-black text-white uppercase truncate w-32">{node.data.label}</div>
                                                        <div className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">{node.data.type}</div>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => toggleOverride(node.id)}
                                                    className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest transition-all ${isOverridden ? 'bg-amber-500 text-black' : 'bg-white/5 text-gray-500 hover:text-white'}`}
                                                >
                                                    {isOverridden ? 'Overridden' : 'Auto Sync'}
                                                </button>
                                            </div>

                                            {isOverridden ? (
                                                <div className="flex items-center gap-3 animate-fade-in">
                                                    <input 
                                                        type="range" min="0" max={chronosDuration} step="0.5"
                                                        value={currentDuration}
                                                        onChange={e => updateOverrideDuration(node.id, e.target.value)}
                                                        className="flex-1 accent-amber-500"
                                                    />
                                                    <span className="text-xs font-mono font-black text-amber-400">{currentDuration}H</span>
                                                </div>
                                            ) : (
                                                <div className="text-[10px] font-mono font-bold text-cyan-500/60 flex justify-between items-center">
                                                    <span>Following Global Time</span>
                                                    <span>{chronosDuration}H</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                {connectedNodes.length === 0 && (
                                    <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-[2rem]">
                                        <Zap className="mx-auto text-gray-800 mb-2" size={32} />
                                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">No nodes connected</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer: Commit Command */}
                <div className="p-8 border-t border-white/5 bg-black flex justify-end gap-4">
                    <button onClick={onClose} className="px-8 py-4 text-gray-500 font-black uppercase tracking-widest text-xs hover:text-white transition-all">Abort_Command</button>
                    <button 
                        onClick={handleSave}
                        className="px-12 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all flex items-center gap-3"
                    >
                        <Save size={18} /> Sync_Temporal_Lattice
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChronosManagerModal;