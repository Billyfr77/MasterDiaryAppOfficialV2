import React, { useState, useEffect, useMemo } from 'react';
import { X, Clock, User, Wrench, Package, Save, CheckCircle2, ChevronRight, Activity, Zap, Timer, Calendar, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChronosManagerModal = ({ isOpen, onClose, chronosNode, connectedNodes, onUpdateNode, onUpdateItem }) => {
    const [startTime, setStartTime] = useState("07:00");
    const [finishTime, setFinishTime] = useState("15:00");
    const [date, setDate] = useState("");
    const [label, setLabel] = useState("");
    const [overrides, setOverrides] = useState({}); // { itemId: { duration, startTime } }

    useEffect(() => {
        if (chronosNode) {
            setStartTime(chronosNode.data.startTime || "07:00");
            setFinishTime(chronosNode.data.finishTime || "15:00");
            setDate(chronosNode.data.date || new Date().toISOString().split('T')[0]);
            setLabel(chronosNode.data.label || "");
            
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
        const [h1, m1] = startTime.split(':').map(Number);
        const [h2, m2] = finishTime.split(':').map(Number);
        let totalHours = (h2 + m2/60) - (h1 + m1/60);
        if (totalHours < 0) totalHours += 24; 
        return parseFloat(totalHours.toFixed(2));
    }, [startTime, finishTime]);

    // --- INTELLIGENT SHIFT DECOMPOSITION ---
    const b = useMemo(() => {
        const startHr = parseInt(startTime.split(':')[0]);
        const isNight = startHr >= 18 || startHr < 6;
        const dur = chronosDuration;
        if (isNight) return { normal: 0, ot1: 0, ot2: 0, night: dur, theme: 'indigo' };
        
        const normal = Math.min(dur, 8);
        const ot1 = Math.min(Math.max(0, dur - 8), 2);
        const ot2 = Math.max(0, dur - 10);
        return { normal, ot1, ot2, night: 0, theme: 'cyan' };
    }, [startTime, chronosDuration]);

    if (!isOpen || !chronosNode) return null;

    const handleSave = () => {
        onUpdateNode(chronosNode.id, { startTime, finishTime, date, label, duration: chronosDuration });

        connectedNodes.forEach(node => {
            const override = overrides[node.id];
            if (override) {
                onUpdateItem(node.id, { 
                    duration: override.duration, 
                    isOverridden: true 
                });
            } else {
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
            <div className="bg-[#0a0a0c] border border-white/10 w-full max-w-5xl rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className={`p-8 border-b border-white/5 bg-gradient-to-r from-${b.theme}-950/20 to-transparent flex justify-between items-center relative`}>
                    <div className="flex items-center gap-6">
                        <div className={`w-16 h-16 rounded-[1.5rem] bg-${b.theme}-500/20 border border-${b.theme}-500/30 flex items-center justify-center text-${b.theme}-400 shadow-2xl transition-transform hover:rotate-6`}>
                            <Clock size={32} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tighter uppercase leading-none mb-2">Chronos_Command_Center</h3>
                            <div className="flex items-center gap-3">
                                <div className={`px-3 py-1 rounded-full bg-${b.theme}-500/10 border border-${b.theme}-500/20 flex items-center gap-2`}>
                                    <div className={`w-1.5 h-1.5 rounded-full bg-${b.theme}-500 animate-pulse`} />
                                    <span className={`text-[10px] font-black text-${b.theme}-400 uppercase tracking-widest`}>TEMPORAL_SYNC_ACTIVE</span>
                                </div>
                                <div className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">Node_ID: {chronosNode.id}</div>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full transition-colors text-gray-500 hover:text-white border border-white/5"><X size={24} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">
                        
                        {/* Left: Primary Controls */}
                        <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4 block italic">Shift_Identity</label>
                                    <input 
                                        value={label} 
                                        onChange={e => setLabel(e.target.value)}
                                        placeholder="e.g. DAY_SHIFT_01"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xl font-black text-white focus:border-cyan-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4 block italic">Phase_Date</label>
                                    <div className="relative">
                                        <Calendar size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-cyan-500" />
                                        <input 
                                            type="date"
                                            value={date} 
                                            onChange={e => setDate(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-xl font-black text-white focus:border-cyan-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-8 bg-white/[0.02] rounded-[2.5rem] border border-white/5 hover:border-cyan-500/30 transition-all group">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Global_Start</span>
                                        <Timer size={16} className="text-cyan-500" />
                                    </div>
                                    <input 
                                        type="time" 
                                        value={startTime} 
                                        onChange={e => setStartTime(e.target.value)}
                                        className="w-full bg-transparent text-5xl font-black text-white font-mono outline-none cursor-pointer"
                                    />
                                </div>
                                <div className="p-8 bg-white/[0.02] rounded-[2.5rem] border border-white/5 hover:border-cyan-500/30 transition-all group">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Final_Sync</span>
                                        <Timer size={16} className="text-cyan-500" />
                                    </div>
                                    <input 
                                        type="time" 
                                        value={finishTime} 
                                        onChange={e => setFinishTime(e.target.value)}
                                        className="w-full bg-transparent text-5xl font-black text-white font-mono outline-none cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* ANALYTIC BREAKDOWN PANEL */}
                            <div className={`p-10 bg-${b.theme}-500/5 rounded-[3rem] border border-${b.theme}-500/20 space-y-6 relative overflow-hidden shadow-2xl`}>
                                <div className="flex justify-between items-end relative z-10">
                                    <div>
                                        <div className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-1">Effective_Operational_Density</div>
                                        <div className="text-6xl font-black text-white font-mono tracking-tighter">{chronosDuration}<span className="text-xl text-cyan-500/50 ml-3">HRS</span></div>
                                    </div>
                                    <Activity className={`text-${b.theme}-500/20`} size={80} />
                                </div>

                                <div className="space-y-4 relative z-10 pt-6 border-t border-white/5">
                                    <div className="h-5 w-full bg-black/40 rounded-full overflow-hidden flex border border-white/10 p-[2px] shadow-inner">
                                        {b.normal > 0 && <motion.div initial={{ width: 0 }} animate={{ width: `${(b.normal/chronosDuration)*100}%` }} className="h-full bg-cyan-500 rounded-l-full shadow-[0_0_20px_#22d3ee]" />}
                                        {b.ot1 > 0 && <motion.div initial={{ width: 0 }} animate={{ width: `${(b.ot1/chronosDuration)*100}%` }} className="h-full bg-amber-500 shadow-[0_0_20px_#f59e0b]" />}
                                        {b.ot2 > 0 && <motion.div initial={{ width: 0 }} animate={{ width: `${(b.ot2/chronosDuration)*100}%` }} className="h-full bg-rose-500 shadow-[0_0_20px_#f43f5e]" />}
                                        {b.night > 0 && <motion.div initial={{ width: 0 }} animate={{ width: `${(b.night/chronosDuration)*100}%` }} className="h-full bg-indigo-600 animate-pulse shadow-[0_0_20px_#6366f1]" />}
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                        {b.normal > 0 && <div className="px-4 py-2 bg-white/5 rounded-xl flex items-center gap-3 border border-white/5"><div className="w-2 h-2 rounded-full bg-cyan-500" /><span className="text-[10px] font-black text-white uppercase">NORMAL: {b.normal}H</span></div>}
                                        {b.ot1 > 0 && <div className="px-4 py-2 bg-white/5 rounded-xl flex items-center gap-3 border border-white/5"><div className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-[10px] font-black text-white uppercase">1.5x OT: {b.ot1}H</span></div>}
                                        {b.ot2 > 0 && <div className="px-4 py-2 bg-white/5 rounded-xl flex items-center gap-3 border border-white/5"><div className="w-2 h-2 rounded-full bg-rose-500" /><span className="text-[10px] font-black text-white uppercase">2.0x OT: {b.ot2}H</span></div>}
                                        {b.night > 0 && <div className="px-4 py-2 bg-white/5 rounded-xl flex items-center gap-3 border border-white/5"><div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" /><span className="text-[10px] font-black text-white uppercase">NIGHT: {b.night}H</span></div>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Connected Fleet */}
                        <div className="flex flex-col gap-6 bg-black/40 rounded-[2.5rem] border border-white/5 p-8">
                            <div className="flex justify-between items-center px-2">
                                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center gap-2">
                                    <User size={14} className="text-cyan-500" /> Connected_Resource_Fleet
                                </h4>
                                <span className="text-xs font-black text-white font-mono">{connectedNodes.length}</span>
                            </div>
                            <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-4">
                                {connectedNodes.map(node => {
                                    const isOverridden = !!overrides[node.id];
                                    const currentDuration = isOverridden ? overrides[node.id].duration : chronosDuration;

                                    return (
                                        <div key={node.id} className={`p-5 rounded-3xl border transition-all ${isOverridden ? 'bg-amber-500/5 border-amber-500/30' : 'bg-white/[0.02] border-white/5'}`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-2xl ${node.data.type === 'staff' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'} border border-white/5 shadow-xl`}>
                                                        {node.data.type === 'staff' ? <User size={18} /> : <Wrench size={18} />}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-black text-white uppercase truncate w-32 leading-none mb-1">{node.data.label}</div>
                                                        <div className={`text-[8px] font-black px-2 py-0.5 rounded-full inline-block ${node.data.type === 'staff' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>{node.data.type?.toUpperCase()}</div>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => toggleOverride(node.id)}
                                                    className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${isOverridden ? 'bg-amber-500 text-black shadow-lg' : 'bg-white/5 text-gray-500 hover:text-white'}`}
                                                >
                                                    {isOverridden ? 'Manual' : 'Follow'}
                                                </button>
                                            </div>

                                            {isOverridden ? (
                                                <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-300">
                                                    <input 
                                                        type="range" min="0" max="24" step="0.5"
                                                        value={currentDuration}
                                                        onChange={e => updateOverrideDuration(node.id, e.target.value)}
                                                        className="w-full h-1 bg-white/5 rounded-full appearance-none accent-amber-500"
                                                    />
                                                    <div className="flex justify-between items-center px-1">
                                                        <span className="text-[8px] font-bold text-gray-600 uppercase tracking-tighter">Manual Duration</span>
                                                        <span className="text-xs font-mono font-black text-amber-400">{currentDuration}H</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-3 bg-cyan-500/5 rounded-2xl border border-cyan-500/10 flex justify-between items-center">
                                                    <span className="text-[9px] font-black text-cyan-500/60 uppercase italic tracking-tighter">Temporal_Inheritance</span>
                                                    <span className="text-sm font-mono font-black text-white">{chronosDuration}H</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-white/5 bg-black/60 flex justify-end gap-4 items-center">
                    <button onClick={onClose} className="px-8 py-4 text-gray-500 font-black uppercase tracking-widest text-[10px] hover:text-white transition-all">Abort_System_Command</button>
                    <button 
                        onClick={handleSave}
                        className={`px-12 py-5 bg-${b.theme}-600 hover:bg-${b.theme}-500 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-${b.theme}-900/40 transition-all flex items-center gap-3 active:scale-95`}
                    >
                        <Save size={18} /> Commit_Temporal_State
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChronosManagerModal;