import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Play, ChevronRight, ChevronLeft, CheckCircle, Clock, 
    User, MapPin, AlertTriangle, ShieldCheck, Zap, 
    ArrowRight, Sparkles, Smartphone, Box, ClipboardList
} from 'lucide-react';

export default function LatticePlayer({ nodes, edges, updateNodeData }) {
    const [riskSignaled, setRiskSignaled] = useState(false);
    
    // 1. Logic: Order nodes by dependency (Topological Sort)
    const orderedNodes = useMemo(() => {
        const sorted = [];
        const visited = new Set();
        const visiting = new Set();

        const visit = (nodeId) => {
            if (visiting.has(nodeId)) return; // Cycle detected
            if (visited.has(nodeId)) return;
            
            visiting.add(nodeId);
            // Dependencies (incoming)
            edges.filter(e => e.target === nodeId).forEach(e => visit(e.source));
            
            visiting.delete(nodeId);
            visited.add(nodeId);
            const node = nodes.find(n => n.id === nodeId);
            if (node) sorted.push(node);
        };

        nodes.forEach(n => visit(n.id));
        return sorted;
    }, [nodes, edges]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const currentNode = orderedNodes[currentIndex];

    const next = () => setCurrentIndex(prev => Math.min(prev + 1, orderedNodes.length - 1));
    const prev = () => setCurrentIndex(prev => Math.max(prev - 1, 0));

    const completeNode = (id) => {
        const node = nodes.find(n => n.id === id);
        if (node) {
            updateNodeData(id, { ...node.data, status: 'completed' });
            if (currentIndex < orderedNodes.length - 1) next();
        }
    };

    if (!currentNode) return (
        <div className="flex-1 flex items-center justify-center text-slate-500 font-black uppercase tracking-widest">
            <Zap size={48} className="mb-4 opacity-20" />
            No Execution Sequence Loaded
        </div>
    );

    return (
        <div className="flex-1 bg-black flex flex-col items-center justify-center p-4 md:p-10 relative overflow-hidden">
            {/* AMBIENT TELEMETRY BACKGROUND */}
            <div className="absolute inset-0 opacity-30 pointer-events-none">
                <AnimatePresence>
                    {riskSignaled ? (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-rose-900/20 animate-pulse"
                        />
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className={`absolute inset-0 transition-colors duration-1000 ${currentNode.data.status === 'completed' ? 'bg-emerald-900/10' : 'bg-indigo-900/10'}`}
                        />
                    )}
                </AnimatePresence>
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1)_0,transparent_70%)]" />
            </div>

            {/* PLAYER HEADER */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center z-10 w-full px-10">
                <div className="flex justify-between items-center w-full max-w-4xl">
                    <div className="flex items-center gap-3 px-6 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl">
                        <Smartphone size={16} className="text-indigo-400" />
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Operational_Lattice_V5</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Global Status</span>
                            <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Architecture_Stable</span>
                        </div>
                        <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
                            <ShieldCheck size={18} className="text-indigo-400" />
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-1 mt-6 w-full max-w-lg">
                    {orderedNodes.map((_, i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-700 ${i === currentIndex ? 'bg-indigo-500 shadow-[0_0_15px_#6366f1]' : i < currentIndex ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                    ))}
                </div>
            </div>

            {/* MAIN COMMAND CARD */}
            <div className="w-full max-w-2xl relative z-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentNode.id}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="bg-slate-900/80 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] overflow-hidden shadow-[0_80px_150px_rgba(0,0,0,0.9)] relative"
                    >
                        {/* Status Bar */}
                        <div className={`h-2 w-full transition-colors duration-1000 ${riskSignaled ? 'bg-rose-500 shadow-[0_0_20px_#f43f5e]' : currentNode.data.status === 'completed' ? 'bg-emerald-500 shadow-[0_0_20px_#10b981]' : 'bg-indigo-500 shadow-[0_0_20px_#6366f1]'}`} />

                        <div className="p-12 space-y-10">
                            {/* Mission Brief Identity */}
                            <div className="flex justify-between items-start">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-full text-[9px] font-black uppercase tracking-widest">
                                            Stage {currentIndex + 1} of {orderedNodes.length}
                                        </span>
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">NODE_ID: {currentNode.id.slice(-6)}</span>
                                    </div>
                                    <h2 className="text-5xl font-black text-white tracking-tight leading-tight uppercase drop-shadow-2xl">
                                        {currentNode.data.label}
                                    </h2>
                                </div>
                                <div className="p-6 bg-indigo-600 shadow-[0_0_30px_#6366f1] rounded-[2rem] text-white">
                                    <Zap size={32} fill="currentColor" />
                                </div>
                            </div>

                            {/* Strategic Summary */}
                            <div className="grid grid-cols-3 gap-4">
                                <InfoBlock label="Lead Architect" value={currentNode.data.assignee || 'Field Crew'} icon={User} color="text-indigo-400" />
                                <InfoBlock label="Temporal Load" value={`${currentNode.data.config?.plannedHours || 4}H`} icon={Clock} color="text-blue-400" />
                                <InfoBlock label="Deployment Zone" value={currentNode.data.config?.zone || 'Primary Site'} icon={MapPin} color="text-emerald-400" />
                            </div>

                            {/* Execution Brief */}
                            <div className="p-8 bg-black/40 border border-white/5 rounded-[2.5rem] relative group">
                                <div className="absolute top-4 right-4"><Sparkles size={16} className="text-indigo-500/40" /></div>
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Operational Briefing</h4>
                                <p className="text-lg font-bold text-slate-200 leading-relaxed">
                                    "{currentNode.data.description || 'Proceed with standard operational protocol for this stage.'}"
                                </p>
                            </div>

                            {/* Protocol Checklist */}
                            {(currentNode.data.checklist || []).length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <ClipboardList size={14} className="text-amber-400" /> Compliance Protocols
                                        </h4>
                                        <span className="text-[10px] font-mono font-bold text-indigo-400">STATUS: VERIFYING</span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        {currentNode.data.checklist.map((item, i) => (
                                            <div key={i} className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${item.completed ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/5'}`}>
                                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${item.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-700'}`}>
                                                    {item.completed && <CheckCircle size={14} className="text-white" />}
                                                </div>
                                                <span className={`text-sm font-bold ${item.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{item.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Footer Actions */}
                            <div className="flex gap-4 pt-6">
                                <button 
                                    onClick={() => setRiskSignaled(!riskSignaled)}
                                    className={`flex-1 py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs border transition-all flex items-center justify-center gap-3 ${riskSignaled ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_30px_#f43f5e]' : 'bg-white/5 text-slate-500 border-white/10 hover:bg-rose-600/10 hover:text-rose-400 hover:border-rose-500/30'}`}
                                >
                                    <AlertTriangle size={20} /> {riskSignaled ? 'RISK_SIGNALED' : 'REPORT_RISK'}
                                </button>

                                {currentNode.data.status === 'completed' ? (
                                    <div className="flex-[2] py-6 bg-emerald-500/10 border border-emerald-500/30 rounded-[2rem] flex items-center justify-center gap-3 text-emerald-400 font-black uppercase tracking-[0.2em] text-xs">
                                        <CheckCircle size={24} /> STAGE_SECURED
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => {
                                            setRiskSignaled(false);
                                            completeNode(currentNode.id);
                                        }}
                                        className="flex-[2] py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-sm shadow-[0_30px_60px_rgba(99,102,241,0.4)] transition-all active:scale-95 flex items-center justify-center gap-4 group"
                                    >
                                        CONFIRM EXECUTION <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-12 px-10">
                    <button onClick={prev} disabled={currentIndex === 0} className="p-6 bg-white/5 hover:bg-white/10 rounded-full text-slate-500 hover:text-white disabled:opacity-0 transition-all border border-white/10 shadow-xl group">
                        <ChevronLeft size={32} className="group-active:-translate-x-1 transition-transform" />
                    </button>
                    <button onClick={next} disabled={currentIndex === orderedNodes.length - 1} className="p-6 bg-white/5 hover:bg-white/10 rounded-full text-slate-500 hover:text-white disabled:opacity-0 transition-all border border-white/10 shadow-xl group">
                        <ChevronRight size={32} className="group-active:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Ambient Footer Stats */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-12 opacity-30 text-white font-black text-[10px] uppercase tracking-[0.5em] pointer-events-none">
                <div className="flex items-center gap-3"><Box size={14}/> LATTICE_DEPTH_{orderedNodes.length}</div>
                <div className="flex items-center gap-3"><ShieldCheck size={14}/> ARCHITECTURAL_CONTROL_L4</div>
            </div>
        </div>
    );
}

const InfoBlock = ({ label, value, icon: Icon, color }) => (
    <div className="p-5 bg-black/40 rounded-3xl border border-white/5 flex flex-col gap-2 hover:border-white/10 transition-colors">
        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{label}</span>
        <div className="flex items-center gap-3">
            <div className={`p-2 bg-white/5 rounded-xl ${color}`}><Icon size={14} /></div>
            <span className="text-xs font-black text-white truncate">{value}</span>
        </div>
    </div>
);