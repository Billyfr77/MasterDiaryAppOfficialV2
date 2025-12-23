import React, { useState, useMemo } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, Wrench, Package, X, Sparkles, Clock, DollarSign, Activity, Zap, 
    ShieldCheck, Timer, Cpu, Box, AlertTriangle, Ruler, PenTool, Layout, 
    Award, CloudRain, Sun, Snowflake, ChevronDown, Magnet, FileText,
    TrendingUp, Target, BrainCircuit, Waves, PaintBucket, Layers, ClipboardList,
    GitFork, MessageSquare, ArrowRight, TrendingDown
} from 'lucide-react';
import { useDiaryTheme } from '../PaintDiary/ThemeContext';
import { api } from '../../utils/api';

// --- SHARED COMPONENT: GLASS JEWEL WRAPPER ---
const JewelWrapper = ({ children, theme: nodeTheme, selected, isGhost, shapeClass }) => {
    const { theme } = useDiaryTheme();
    const activeTheme = nodeTheme || {
        bg: theme.bg.replace('bg-', ''),
        border: theme.border,
        glow: theme.glow,
        text: theme.text
    };

    return (
        <div className={`
            group relative min-w-[280px] p-[2px] 
            transition-[box-shadow,transform,filter,opacity] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
            ${shapeClass}
            ${selected ? `scale-105 z-50 ${activeTheme.glow} shadow-[0_0_100px_-20px_currentColor]` : 'hover:scale-[1.02] hover:shadow-2xl'}
            animate-in zoom-in-95 duration-300 fade-in
        `} style={{ willChange: 'transform' }}>
            <div className={`absolute inset-0 ${shapeClass} bg-gradient-to-br ${activeTheme.bg || theme.bg} backdrop-blur-3xl opacity-100 overflow-hidden`}>
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer" />
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
            </div>
            <div className={`absolute inset-0 ${shapeClass} border-[1.5px] ${activeTheme.border || theme.border} pointer-events-none ring-1 ring-white/10`} />
            <div className="relative p-6">
                {children}
            </div>
        </div>
    );
};

export const DelayNode = ({ id, data, selected }) => {
    const { duration = 0, weatherType = 'none', reason } = data;
    const [isExpanded, setIsExpanded] = useState(false);
    const update = (field, value) => data.onUpdate?.(id, { [field]: value });

    const modes = [
        { id: 'none', icon: <AlertTriangle size={12} />, label: 'Off' },
        { id: 'rain', icon: <CloudRain size={12} />, label: 'Rain' },
        { id: 'storm', icon: <Zap size={12} />, label: 'Storm' },
        { id: 'heat', icon: <Sun size={12} />, label: 'Heat' },
        { id: 'snow', icon: <Snowflake size={12} />, label: 'Snow' },
    ];

    const getTheme = () => {
        switch(weatherType) {
            case 'rain': return { accent: '#60a5fa', border: 'border-blue-500/40', bg: 'from-blue-600/30 to-blue-950/80', glow: 'shadow-blue-500/40' };
            case 'storm': return { accent: '#fbce1b', border: 'border-yellow-400/40', bg: 'from-slate-800/60 to-black', glow: 'shadow-yellow-400/50' };
            case 'heat': return { accent: '#fb923c', border: 'border-orange-400/40', bg: 'from-orange-600/30 to-orange-950/80', glow: 'shadow-orange-500/40' };
            case 'snow': return { accent: '#e2e8f0', border: 'border-slate-300/40', bg: 'from-slate-600/30 to-slate-900/80', glow: 'shadow-white/20' };
            default: return { accent: '#f43f5e', border: 'border-rose-500/40', bg: 'from-rose-600/20 to-rose-950/80', glow: 'shadow-rose-500/30' };
        }
    };

    const s = getTheme();

    return (
        <JewelWrapper theme={s} selected={selected} shapeClass="rounded-[2rem]">
            <div className="absolute top-2 right-4 text-[8px] font-mono text-white font-bold tracking-widest pointer-events-none select-none z-30 drop-shadow-md opacity-50">ID:{id}::DELAY</div>
            <div className="flex flex-col gap-5">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-3">Atmospheric Command</div>
                        <div className="flex gap-1 p-1 bg-black/80 rounded-2xl border border-white/10 nodrag w-full">
                            {modes.map(m => (
                                <button
                                    key={m.id}
                                    onClick={(e) => { e.stopPropagation(); update('weatherType', m.id); }}
                                    className={`flex-1 py-2.5 rounded-xl transition-all flex flex-col items-center justify-center gap-1 border ${
                                        weatherType === m.id 
                                        ? 'bg-emerald-500 border-emerald-400 text-black shadow-lg scale-105 z-10' 
                                        : 'bg-white/5 border-transparent text-gray-300 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    <div className={weatherType === m.id ? 'text-black' : 'text-current'}>{m.icon}</div>
                                    <span className={`text-[7px] font-black uppercase tracking-tighter leading-none ${weatherType === m.id ? 'text-black' : 'text-inherit'}`}>
                                        {m.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); data.onDelete?.(); }} className="p-2 rounded-xl bg-white/5 text-white/20 hover:bg-rose-500 hover:text-white transition-all"><X size={16} strokeWidth={3} /></button>
                </div>
                <div className="bg-black/40 rounded-3xl p-5 border border-white/5 shadow-inner relative overflow-hidden nodrag pointer-events-auto">
                    <div className="flex justify-between items-center mb-4 cursor-pointer hover:bg-white/5 p-1 rounded-xl transition-colors" onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}>
                        <div>
                            <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-2">Time Displacement <ChevronDown size={10} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} /></div>
                            <div className="text-3xl font-black text-white font-mono tracking-tighter">{duration}<span className="text-sm text-gray-600 ml-1">HRS</span></div>
                        </div>
                        <div className={`text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60`}>{weatherType === 'none' ? 'Manual Delay' : 'Weather Impact'}</div>
                    </div>
                    {isExpanded && (
                        <div className="grid grid-cols-6 gap-1 animate-in slide-in-from-top-2 duration-300">
                            {[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8].map((val) => (
                                <button key={val} onClick={(e) => { e.stopPropagation(); update('duration', val); }} className={`py-2 rounded-lg text-[9px] font-black transition-all border cursor-pointer pointer-events-auto ${duration === val ? 'bg-emerald-500 border-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-105 z-10' : 'bg-white/5 border-transparent text-gray-300 hover:text-white hover:bg-white/10'}`}>{val === 0 ? '0' : val}</button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-3 px-1 nodrag">
                    <div className={`w-1.5 h-1.5 rounded-full ${weatherType === 'none' ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'} shadow-[0_0_10px_currentColor]`} />
                    <input type="text" placeholder="Log reason for delay..." value={reason || ''} onChange={(e) => update('reason', e.target.value)} className="flex-1 bg-transparent border-none outline-none text-[10px] font-medium text-gray-400 placeholder-gray-700" />
                </div>
            </div>
            <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-white !border-2 !border-black shadow-lg" /><Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-white !border-2 !border-black shadow-lg" />
        </JewelWrapper>
    );
};

export const ImpactNode = ({ id, data, selected }) => {
    const { label, condition, prodImpact = 1, costImpact = 1, weatherType = 'none' } = data;
    const update = (field, value) => data.onUpdate?.(id, { [field]: value });
    const isNegative = prodImpact < 1 || costImpact > 1;

    return (
        <JewelWrapper selected={selected} shapeClass="rounded-[2.5rem]">
            <div className="absolute top-2 right-4 text-[8px] font-mono text-white font-bold tracking-widest pointer-events-none select-none z-30 drop-shadow-md opacity-50">ID:{id}::IMPACT</div>
            <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`p-3.5 rounded-2xl ${isNegative ? 'bg-rose-500/20 text-rose-400' : 'bg-indigo-500/20 text-indigo-400'} border border-white/10 shadow-2xl transition-transform group-hover:scale-110`}><Zap size={24} strokeWidth={2.5} className={isNegative ? 'animate-pulse' : ''} /></div>
                        <div><div className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] mb-0.5">Impact Analysis</div><div className="text-lg font-black text-white uppercase tracking-tight leading-none">{label || 'Site Condition'}</div></div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); data.onDelete?.(); }} className="p-2 rounded-xl bg-white/5 text-white/20 hover:bg-rose-500 hover:text-white transition-all"><X size={14} strokeWidth={3} /></button>
                </div>
                <div className="bg-black/40 rounded-3xl p-5 border border-white/5 shadow-inner space-y-4">
                    <div className="flex justify-between items-center"><span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Live Status</span><select value={weatherType} onChange={(e) => update('weatherType', e.target.value)} className={`px-3 py-1 rounded-full text-[10px] font-black uppercase outline-none bg-white/5 border border-white/10 cursor-pointer ${weatherType === 'none' ? 'text-gray-400' : 'text-amber-400'}`}><option value="none">Normal</option><option value="heat">Extreme Heat</option><option value="rain">Wet Weather</option></select></div>
                    <div className="grid grid-cols-2 gap-3"><div className="flex flex-col gap-1 p-3 bg-white/5 rounded-2xl border border-white/5"><span className="text-[8px] font-bold text-gray-600 uppercase">Productivity</span><span className={`text-xl font-mono font-black ${prodImpact < 1 ? 'text-rose-400' : 'text-emerald-400'}`}>{prodImpact}x</span></div><div className="flex flex-col gap-1 p-3 bg-white/5 rounded-2xl border border-white/5"><span className="text-[8px] font-bold text-gray-600 uppercase">Cost Factor</span><span className={`text-xl font-mono font-black ${costImpact > 1 ? 'text-rose-400' : 'text-emerald-400'}`}>{costImpact}x</span></div></div>
                </div>
                <div className="flex items-center gap-2 px-1"><div className={`w-1.5 h-1.5 rounded-full ${isNegative ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'} shadow-[0_0_10px_currentColor]`} /><span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{condition || 'Operational'}</span></div>
            </div>
            <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-white !border-2 !border-black shadow-lg" /><Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-white !border-2 !border-black shadow-lg" />
        </JewelWrapper>
    );
};

export const ChronosNode = ({ id, data, selected }) => {
    const { label, startTime, finishTime, duration, onDelete, hubData } = data;
    const hasHubData = hubData && (hubData.workers?.length > 0 || hubData.resources?.length > 0);
    const handleTimeChange = (field, value) => {
        const newData = { [field]: value };
        const start = field === 'startTime' ? value : (startTime || '07:00');
        const end = field === 'finishTime' ? value : (finishTime || '17:00');
        const [h1, m1] = start.split(':').map(Number);
        const [h2, m2] = end.split(':').map(Number);
        const totalHours = Math.max(0, (h2 + m2/60) - (h1 + m1/60));
        newData.duration = parseFloat(totalHours.toFixed(2));
        data.onUpdate?.(id, newData);
    };
    return (
        <div className={`
            group relative min-w-[280px] aspect-square transition-all duration-1000
            rounded-full select-none cursor-pointer
            ${selected ? 'scale-110 z-50 shadow-[0_0_150px_-30px_rgba(6,182,212,0.8)]' : 'hover:scale-105 shadow-2xl'}
        `}>
            <div className="absolute top-[15%] left-1/2 -translate-x-1/2 text-[8px] font-mono text-cyan-100 font-bold tracking-widest pointer-events-none select-none z-30 drop-shadow-md opacity-50">ID:{id}::CHRONOS</div>
            <div className={`absolute inset-0 rounded-full border-[6px] border-cyan-500/20 border-t-cyan-400 border-l-cyan-600/50 animate-spin-slow ${hasHubData ? 'shadow-[0_0_50px_rgba(6,182,212,0.5)]' : ''}`} /><div className="absolute inset-2 rounded-full border-[2px] border-dashed border-cyan-300/30 animate-spin-reverse-slower" />
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-cyan-900/90 via-black to-blue-950/90 backdrop-blur-2xl flex flex-col items-center justify-center border border-cyan-500/30 overflow-hidden cursor-pointer">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.15),transparent_70%)] animate-pulse" />
                <div className="relative z-10 text-center space-y-2 pointer-events-none">
                    <button onClick={(e) => { e.stopPropagation(); onDelete?.(); }} className="absolute -top-10 left-1/2 -translate-x-1/2 p-2 rounded-xl bg-white/5 text-white/20 hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 border border-white/10 pointer-events-auto"><X size={16} strokeWidth={3} /></button>
                    <div className="flex items-center justify-center gap-2 text-cyan-400 mb-2"><Clock size={16} className="animate-pulse" /><span className="text-[9px] font-black uppercase tracking-[0.3em]">{hasHubData ? 'Chronos Hub' : 'Chronos'}</span></div>
                    <div className="pointer-events-auto">
                        <input type="time" className="text-4xl font-black text-white font-mono tracking-tighter drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] bg-transparent text-center w-full focus:outline-none cursor-pointer" value={startTime || '07:00'} onChange={(e) => handleTimeChange('startTime', e.target.value)} onClick={(e) => e.stopPropagation()} />
                        <div className="h-px w-12 bg-cyan-500/50 mx-auto my-1" />
                        <input type="time" className="text-2xl font-bold text-cyan-200/50 font-mono tracking-tighter bg-transparent text-center w-full focus:outline-none cursor-pointer" value={finishTime || '17:00'} onChange={(e) => handleTimeChange('finishTime', e.target.value)} onClick={(e) => e.stopPropagation()} />
                    </div>
                    <div className="mt-4 px-4 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-bold">{label || 'Shift A'}</div>
                </div>
            </div>
            {duration > 0 && (
                <div className="absolute -right-4 top-1/2 -translate-y-1/2 bg-black border border-cyan-500 text-cyan-400 px-3 py-1.5 rounded-xl text-xs font-black shadow-xl flex flex-col items-center gap-1 min-w-[60px]">
                    <div className="flex items-center gap-2"><Timer size={12} /> {duration || 0}H</div>
                </div>
            )}
            {hasHubData && (<div className="absolute -left-4 top-1/2 -translate-y-1/2 bg-indigo-600 border border-indigo-400 text-white px-2 py-1 rounded-lg text-[8px] font-black animate-pulse shadow-lg">HUB_SYNC</div>)}
            <Handle type="target" position={Position.Left} className="!w-4 !h-4 !bg-cyan-400 !border-4 !border-black shadow-[0_0_20px_#22d3ee]" /><Handle type="source" position={Position.Right} className="!w-4 !h-4 !bg-cyan-400 !border-4 !border-black shadow-[0_0_20px_#22d3ee]" />
        </div>
    );
};

export const NeuralPrismNode = ({ id, data, selected }) => {
    const { 
        velocity = 1.0, status = 'analyzing', projectFinancials, hubData, 
        causalPath = [], driftStats = {}, insights = [], scenarios = [], 
        burnRate = '$0/hr', currentMargin = '0%', predictedFinalMargin = '0%', 
        marginRisk = 'low', completionDrift = 'Pending'
    } = data;

    const [showInsight, setShowInsight] = useState(false);
    const [activeView, setActiveView] = useState('analysis'); // 'analysis' | 'causal' | 'drift' | 'sims' | 'terminal'
    const [chatInput, setChatInput] = useState('');
    const [terminalHistory, setTerminalHistory] = useState(data.terminalHistory || []);
    const [isThinking, setIsThinking] = useState(false);

    const isPluggedIn = status !== 'disconnected' && status !== 'analyzing';
    const update = (field, value) => data.onUpdate?.(id, { [field]: value });

    const theme = useMemo(() => {
        if (status === 'disconnected') return { color: '#475569', label: 'OFFLINE', glow: 'shadow-slate-500/20', wave: 'bg-slate-500' };
        if (status === 'analyzing') return { color: '#818cf8', label: 'SYNCING', glow: 'shadow-indigo-500/40', wave: 'bg-indigo-500' };
        if (velocity >= 1.2) return { color: '#10b981', label: 'OPTIMAL', glow: 'shadow-emerald-500/50', wave: 'bg-emerald-500' };
        if (velocity >= 0.9) return { color: '#f59e0b', label: 'STABLE', glow: 'shadow-amber-500/50', wave: 'bg-amber-500' };
        return { color: '#f43f5e', label: 'CRITICAL', glow: 'shadow-rose-500/50', wave: 'bg-rose-500' };
    }, [status, velocity]);

    const handleTerminalSend = async (e) => {
        e.preventDefault();
        if (!chatInput.trim() || isThinking) return;
        const userMsg = { role: 'user', content: chatInput };
        const newHistory = [...terminalHistory, userMsg];
        setTerminalHistory(newHistory);
        setChatInput('');
        setIsThinking(true);
        try {
            const res = await api.post('/ai/chat-smart', { 
                message: chatInput,
                context: { type: 'prism_focus', prismId: id, hubData, financials: projectFinancials, history: terminalHistory }
            });
            const aiMsg = { role: 'assistant', content: res.data.reply };
            const finalHistory = [...newHistory, aiMsg];
            setTerminalHistory(finalHistory);
            update('terminalHistory', finalHistory);
        } catch (err) {
            setTerminalHistory([...newHistory, { role: 'assistant', content: "Neural link interrupted." }]);
        } finally { setIsThinking(false); }
    };

    const DriftCard = ({ label, stats, icon: Icon }) => {
        if (!stats) return null;
        const colorClass = stats.severity === 'high' ? 'text-rose-400' : stats.severity === 'med' ? 'text-amber-400' : 'text-emerald-400';
        return (
            <div className="p-3 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-1">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-[8px] font-black text-gray-500 uppercase tracking-widest"><Icon size={10} /> {label}</div>
                    <div className={`text-[8px] ${colorClass}`}>{stats.trend === 'up' ? '↑' : '↓'} {stats.variancePct}%</div>
                </div>
                <div className="text-sm font-black text-white font-mono">{stats.absoluteVariance}</div>
            </div>
        );
    };

    return (
        <div className={`relative w-[320px] h-[320px] transition-all duration-1000 ${selected ? 'scale-110 z-50' : 'hover:scale-105'}`}>
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/80 border border-white/10 rounded-lg text-[8px] font-mono text-indigo-400 font-bold tracking-[0.3em] backdrop-blur-md shadow-2xl">PRISM_CORE::{id}</div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {isPluggedIn && (
                    <div className="absolute inset-[-40px] opacity-20">
                        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2], rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="w-full h-full rounded-full border-2 border-dashed border-white/20" />
                    </div>
                )}
                <svg width="220" height="220" viewBox="0 0 100 100" className="drop-shadow-[0_0_50px_rgba(99,102,241,0.4)]">
                    <defs>
                        <linearGradient id={`grad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#fff" stopOpacity="0.9" /><stop offset="50%" stopColor={theme.color} stopOpacity="0.6" /><stop offset="100%" stopColor="#000" stopOpacity="0.8" /></linearGradient>
                        <filter id="glow"><feGaussianBlur stdDeviation="2" result="blur" /><feComposite in="SourceGraphic" in2="blur" operator="over" /></filter>
                    </defs>
                    <motion.g animate={isPluggedIn ? { rotateY: [0, 360], rotateZ: [0, 5, -5, 0] } : {}} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: '50% 50%' }}>
                        <path d="M50 5 L90 80 L10 80 Z" fill={`url(#grad-${id})`} stroke={theme.color} strokeWidth="0.5" filter="url(#glow)" />
                        <path d="M50 5 L50 80" stroke="white" strokeWidth="0.2" opacity="0.4" />
                        <path d="M10 80 L50 50 L90 80" stroke="white" strokeWidth="0.2" opacity="0.3" fill="none" />
                    </motion.g>
                    {isPluggedIn && <motion.circle cx="50" cy="50" r="40" fill="none" stroke={theme.color} strokeWidth="0.1" animate={{ r: [0, 50], opacity: [1, 0] }} transition={{ duration: 2, repeat: Infinity }} />}
                </svg>
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
                <div onClick={() => isPluggedIn && setShowInsight(!showInsight)} className={`group/core w-24 h-24 rounded-full border-2 backdrop-blur-3xl shadow-2xl z-20 cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${!isPluggedIn ? 'bg-slate-900 border-slate-700' : 'bg-black/80 border-white/20 hover:border-white/50 hover:scale-110 active:scale-95'}`}>
                    <div className={`text-[10px] font-black tracking-tighter ${isPluggedIn ? 'text-white' : 'text-gray-600'}`}>{theme.label}</div>
                    <div className="relative"><Zap size={32} style={{ color: theme.color }} className={isPluggedIn ? 'animate-pulse' : 'opacity-20'} />{insights.length > 0 && <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full animate-ping" />}</div>
                    <div className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.2em]">Core</div>
                </div>
            </div>

            <AnimatePresence>
                {showInsight && (
                    <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-[500px] bg-[#0a0a0c] border-2 border-white/10 rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] z-[100] overflow-hidden backdrop-blur-3xl">
                        <div className="p-8 bg-gradient-to-b from-white/5 to-transparent border-b border-white/5">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-2xl font-black text-white tracking-tighter uppercase">{projectFinancials?.projectName || 'Active Operation'}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className={`w-2 h-2 rounded-full ${isPluggedIn ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{status}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Live Burn</div>
                                    <div className="text-2xl font-black text-rose-400 font-mono tracking-tighter">{burnRate}</div>
                                </div>
                            </div>
                            <div className="flex gap-1 p-1 bg-black/40 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
                                {[
                                    { id: 'analysis', label: 'Analysis', icon: Target },
                                    { id: 'causal', label: 'Path', icon: GitFork },
                                    { id: 'drift', label: 'Drift', icon: Activity },
                                    { id: 'sims', label: 'Simulation', icon: Waves },
                                    { id: 'terminal', label: 'Terminal', icon: MessageSquare }
                                ].map(v => (
                                    <button key={v.id} onClick={() => setActiveView(v.id)} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all min-w-max ${activeView === v.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:bg-white/5'}`}>
                                        <v.icon size={12} /> {v.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-8 max-h-[450px] overflow-y-auto custom-scrollbar">
                            {activeView === 'analysis' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-5 bg-white/5 rounded-3xl border border-white/10">
                                            <div className="text-[9px] font-black text-gray-500 uppercase mb-2">Predicted Margin</div>
                                            <div className={`text-3xl font-black font-mono tracking-tighter ${marginRisk === 'critical' ? 'text-rose-500' : 'text-emerald-400'}`}>{predictedFinalMargin}</div>
                                            <div className={`text-[8px] font-bold mt-1 uppercase ${marginRisk === 'critical' ? 'text-rose-500 animate-pulse' : 'text-emerald-500/50'}`}>Risk: {marginRisk}</div>
                                        </div>
                                        <div className="p-5 bg-white/5 rounded-3xl border border-white/10">
                                            <div className="text-[9px] font-black text-gray-500 uppercase mb-2">Completion Drift</div>
                                            <div className="text-3xl font-black text-white font-mono tracking-tighter">{completionDrift}</div>
                                            <div className="text-[8px] font-bold mt-1 text-gray-500 uppercase">Estimated Finish</div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {insights.map((ins, idx) => (
                                            <div key={idx} className={`p-5 rounded-3xl border flex gap-4 ${ins.severity === 'critical' ? 'bg-rose-500/5 border-rose-500/20' : 'bg-white/5 border-white/10'}`}>
                                                <div className={`mt-1.5 w-2 h-2 rounded-full ${ins.severity === 'critical' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`} />
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{ins.type}</span>
                                                        <span className={`text-[8px] font-black uppercase ${ins.severity === 'critical' ? 'text-rose-400' : 'text-indigo-400'}`}>{ins.severity}</span>
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-200 leading-relaxed">{ins.text}</p>
                                                    {ins.tacticalAdvice && <div className="mt-3 text-[10px] text-indigo-400 font-bold border-t border-white/5 pt-2 flex items-center gap-2"><Zap size={10} /> {ins.tacticalAdvice}</div>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeView === 'causal' && (
                                <div className="space-y-6">
                                    <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-1">Causal Path Analysis</div>
                                    <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                                        {causalPath.map((step, idx) => (
                                            <div key={idx} className="relative group/step cursor-pointer" onClick={() => update('highlightNode', step.nodeId)}>
                                                <div className="absolute left-[-25px] top-1 w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] group-hover:scale-150 transition-transform" />
                                                <div className="text-[10px] font-black text-gray-500 uppercase mb-1">{step.label}</div>
                                                <p className="text-sm font-medium text-white">{step.effect}</p>
                                            </div>
                                        ))}
                                        {causalPath.length === 0 && <p className="text-gray-500 text-xs italic">No causal links detected. System stable.</p>}
                                    </div>
                                </div>
                            )}

                            {activeView === 'drift' && (
                                <div className="space-y-6">
                                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Variance Dashboard</div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <DriftCard label="Labour" stats={driftStats.labour} icon={User} />
                                        <DriftCard label="Equipment" stats={driftStats.equipment} icon={Wrench} />
                                        <DriftCard label="Material" stats={driftStats.material} icon={Package} />
                                        <DriftCard label="Task Progress" stats={driftStats.task} icon={ClipboardList} />
                                        <DriftCard label="Zone Productivity" stats={driftStats.zone} icon={Layout} />
                                        <DriftCard label="Cost Burn" stats={driftStats.cost} icon={DollarSign} />
                                    </div>
                                </div>
                            )}

                            {activeView === 'sims' && (
                                <div className="space-y-4">
                                    {scenarios.map((sim, idx) => (
                                        <div key={idx} className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:bg-white/[0.05] transition-all">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-lg font-black text-white tracking-tight">{sim.name}</span>
                                                <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black ${sim.drift.includes('-') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>{sim.drift} DRIFT</div>
                                            </div>
                                            <p className="text-sm text-gray-400 font-medium leading-relaxed">{sim.impact}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeView === 'terminal' && (
                                <div className="flex flex-col h-[400px]">
                                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar mb-4">
                                        {terminalHistory.map((msg, idx) => (
                                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white/5 border border-white/10 text-gray-300 rounded-tl-none'}`}>{msg.content}</div>
                                            </div>
                                        ))}
                                        {isThinking && <div className="flex justify-start animate-pulse"><div className="bg-white/5 border border-white/10 p-4 rounded-3xl rounded-tl-none flex gap-1"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" /><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full opacity-60" /><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full opacity-30" /></div></div>}
                                    </div>
                                    <form onSubmit={handleTerminalSend} className="relative flex gap-2">
                                        <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Query Neural Prism..." className="flex-1 bg-black border border-white/10 rounded-[1.5rem] py-5 px-8 text-sm text-white focus:border-indigo-500 outline-none transition-all placeholder-gray-700 shadow-inner" />
                                        <button className="p-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-all shadow-lg flex items-center justify-center"><ArrowRight size={20} /></button>
                                    </form>
                                </div>
                            )}
                        </div>

                        <div className="p-8 border-t border-white/5 bg-black/40 flex gap-4">
                            <button onClick={() => data.onDeployFixes?.(suggestedNodes)} className="flex-1 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all flex items-center justify-center gap-3 active:scale-95">
                                <Zap size={18} fill="currentColor" /> Deploy Optimized Model
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[500px] grid grid-cols-4 gap-2 nodrag select-none pointer-events-none group-hover:pointer-events-auto">
                <button onClick={(e) => { e.stopPropagation(); isPluggedIn && update('gravityActive', !data.gravityActive); }} className={`aspect-square rounded-[2rem] border transition-all duration-500 flex flex-col items-center justify-center relative overflow-hidden pointer-events-auto ${!isPluggedIn ? 'bg-slate-900 border-slate-800 text-slate-600 grayscale cursor-not-allowed' : data.gravityActive ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_40px_rgba(99,102,241,0.5)]' : 'bg-black/80 border-white/10 text-gray-500 hover:text-white hover:border-white/30'}`}><Magnet size={24} className={data.gravityActive ? 'animate-bounce' : ''} /><span className="text-[7px] font-black uppercase tracking-tighter mt-1">{data.gravityActive ? 'ACTIVE' : 'GRAVITY'}</span></button>
                <div className="bg-black/90 border border-white/10 rounded-[2rem] p-4 backdrop-blur-2xl flex flex-col justify-center text-center shadow-2xl relative overflow-hidden"><div className="text-[7px] font-black text-gray-500 uppercase tracking-widest mb-1">Burn Rate</div><div className="text-xl font-black text-rose-400 font-mono tracking-tighter">{isPluggedIn ? burnRate : '---'}</div></div>
                <div className="bg-black/90 border border-white/10 rounded-[2rem] p-4 backdrop-blur-2xl flex flex-col justify-center text-center shadow-2xl relative overflow-hidden"><div className="text-[7px] font-black text-gray-500 uppercase tracking-widest mb-1">Drift</div><div className="text-xl font-black text-white font-mono tracking-tighter">{isPluggedIn ? completionDrift : '---'}</div></div>
                <div className="bg-black/90 border border-white/10 rounded-[2rem] p-4 backdrop-blur-2xl flex flex-col justify-center text-center shadow-2xl relative overflow-hidden">
                    <div className="text-[7px] font-black text-gray-500 uppercase tracking-widest mb-1">Margin</div>
                    <div className={`text-2xl font-black font-mono tracking-tighter ${parseFloat(currentMargin) < 15 ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`}>{isPluggedIn ? currentMargin : '---'}</div>
                    <div className="mt-2 w-full h-1 bg-white/5 rounded-full overflow-hidden"><div className={`h-full ${theme.wave} transition-all duration-1000`} style={{ width: `${Math.min(100, velocity * 50)}%` }} /></div>
                </div>
            </div>

            <Handle type="target" position={Position.Left} className="!w-4 !h-4 !bg-white !border-4 !border-black shadow-2xl" /><Handle type="source" position={Position.Right} className="!w-4 !h-4 !bg-white !border-4 !border-black shadow-2xl" />
        </div>
    );
};

export const PhotoNode = ({ id, data, selected }) => {
    const { url, label, onDelete, isBackground } = data;
    const update = (field, value) => data.onUpdate?.(id, { [field]: value });

    return (
        <div 
            className={`relative group transition-all duration-500 ${selected ? 'z-[100]' : isBackground ? 'z-0 nodrag' : 'z-40 hover:scale-[1.02]'}`} 
            style={{ width: '100%', height: '100%', minWidth: 200, minHeight: 150 }}
        >
            <NodeResizer minWidth={200} minHeight={150} isVisible={selected} />
            {!isBackground && <div className="absolute top-4 right-4 text-[8px] font-mono text-white font-bold tracking-widest pointer-events-none select-none z-30 drop-shadow-md opacity-50">ID:{id}::PHOTO</div>}
            <div className={`absolute -inset-4 bg-indigo-500/20 rounded-[2rem] blur-2xl opacity-0 ${!isBackground && 'group-hover:opacity-100'} animate-pulse transition-opacity pointer-events-none`} />
            <div className={`relative w-full h-full rounded-[1.8rem] overflow-hidden transition-all duration-500 ${isBackground ? 'opacity-100 border-4 border-white/10 shadow-inner' : 'bg-gradient-to-br from-white/20 via-white/5 to-black border border-white/10 shadow-2xl p-1'}`}>
                <div className={`relative w-full h-full ${!isBackground && 'rounded-[1.5rem]'} overflow-hidden bg-stone-900`}>
                    <img src={url} alt={label} className="w-full h-full object-cover" />
                    {!isBackground && <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />}
                </div>
            </div>
            <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md transition-all ${selected || !isBackground ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto'}`}>
                <div className="flex items-center gap-2 px-2 border-r border-white/10 mr-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${isBackground ? 'bg-indigo-500' : 'bg-emerald-500 animate-pulse'}`} />
                    <span className="text-[8px] font-black text-white/60 uppercase tracking-widest truncate max-w-[80px]">{label || 'IMAGE'}</span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); update('isBackground', !isBackground); }} className={`p-2 rounded-xl transition-all ${isBackground ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`} title="Toggle Background"><Layers size={14} /></button>
                <div className="w-px h-4 bg-white/10" />
                <button onClick={(e) => { e.stopPropagation(); onDelete?.(); }} className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/20 transition-all"><X size={14} /></button>
            </div>
            <Handle type="target" position={Position.Top} className={`!w-2 !h-2 !bg-indigo-400 !border-none ${isBackground ? 'opacity-0' : ''}`} /><Handle type="source" position={Position.Bottom} className={`!w-2 !h-2 !bg-indigo-400 !border-none ${isBackground ? 'opacity-0' : ''}`} />
        </div>
    );
};

export const DiaryNode = ({ id, data, selected }) => {
  const { label, duration, type, costRate, quantity, onDelete, isGhost } = data;
  const getThemeStyles = (nodeType) => {
      const t = nodeType?.toLowerCase();
      if (isGhost) return { bg: "from-slate-800/60 to-black", border: "border-white/10 border-dashed", glow: "shadow-white/5", icon: "text-slate-400", iconBg: "bg-white/5", accent: "text-slate-500" };
      if (t === 'staff') return { bg: "from-emerald-600/80 via-emerald-900/90 to-black", border: "border-emerald-400/40", glow: "shadow-emerald-500/50", icon: "text-emerald-400", iconBg: "bg-emerald-500/20", accent: "text-emerald-200" };
      if (t === 'equipment') return { bg: "from-amber-600/80 via-amber-900/90 to-black", border: "border-amber-400/40", glow: "shadow-amber-500/50", icon: "text-amber-400", iconBg: "bg-amber-500/20", accent: "text-amber-200" };
      return { bg: "from-indigo-600/80 via-indigo-900/90 to-black", border: "border-indigo-400/40", glow: "shadow-indigo-500/50", icon: "text-indigo-400", iconBg: "bg-indigo-500/20", accent: "text-indigo-200" };
  };
  const nodeTheme = getThemeStyles(type);
  return (
    <JewelWrapper theme={nodeTheme} selected={selected} isGhost={isGhost} shapeClass="rounded-[2rem]">
      <div className="absolute top-2 right-4 text-[8px] font-mono text-white font-bold tracking-widest pointer-events-none select-none z-30 drop-shadow-md opacity-50">ID:{id}::{type?.toUpperCase()}</div>
      <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
              <div className="relative"><div className={`absolute inset-0 rounded-2xl ${nodeTheme.iconBg} animate-ping opacity-20`} /><div className={`relative p-3.5 rounded-2xl ${nodeTheme.iconBg} backdrop-blur-md shadow-2xl border border-white/10 transition-all group-hover:rotate-3`}>{type === 'staff' ? <User size={22} className={nodeTheme.icon} /> : type === 'equipment' ? <Wrench size={22} className={nodeTheme.icon} /> : <Package size={22} className={nodeTheme.icon} />}</div></div>
              {!isGhost && (<button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 rounded-xl bg-white/5 text-white/20 hover:bg-red-500 hover:text-white transition-all scale-90 group-hover:scale-100"><X size={14} strokeWidth={3} /></button>)}
          </div>
          <div><div className="flex items-center gap-2 mb-1"><span className={`text-[8px] font-black uppercase tracking-[0.4em] ${nodeTheme.accent} opacity-60`}>{isGhost ? 'SUGGESTION' : type}</span></div><div className="text-lg font-black text-white leading-tight tracking-tight uppercase line-clamp-2">{label}</div></div>
          {!isGhost && (<div className="flex gap-2 items-center"><div className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/5 flex items-center gap-2"><Cpu size={10} className={`${nodeTheme.accent} opacity-50`} /><span className="text-[10px] font-mono font-black text-white">{type === 'staff' || type === 'equipment' ? `${duration || quantity}H` : `${quantity} UNIT`}</span></div>{costRate > 0 && (<div className={`px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-1.5`}><DollarSign size={10} className={nodeTheme.icon} /><span className="text-[10px] font-mono font-black text-white">${costRate}</span></div>)}</div>)}
      </div>
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-white !border-2 !border-black" /><Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-white !border-2 !border-black" />
    </JewelWrapper>
  );
};

export const DimensionNode = ({ id, data, selected }) => {
    const { label, width, height } = data;
    const area = (width / 20) * (height / 20);
    return (
        <div className={`relative min-w-[150px] min-h-[150px] p-1 transition-all duration-700 rounded-[2rem] border-2 ${selected ? 'border-indigo-500/50 bg-indigo-500/10 shadow-2xl scale-105' : 'border-white/5 bg-black/20 hover:border-white/20'}`} style={{ width: '100%', height: '100%' }}>
            <div className="absolute top-2 right-4 text-[8px] font-mono text-white font-bold tracking-widest pointer-events-none select-none z-30 drop-shadow-md opacity-60">ID:{id}</div>
            <NodeResizer minWidth={150} minHeight={150} isVisible={selected} onResize={data.onResize} />
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2rem]"><div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05),transparent_70%)]" /><div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:20px_20px]" /></div>
            <div className="relative p-6 h-full flex flex-col justify-between"><div><div className="flex items-center gap-3 mb-4"><div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400"><Ruler size={16} /></div><div className="text-sm font-black text-white uppercase tracking-wider truncate">{label}</div></div></div><div className="space-y-2"><div className="flex justify-between items-center text-[10px] font-bold"><span className="text-gray-500 uppercase">Dimensions</span><span className="text-indigo-400 font-mono">{(width/20).toFixed(1)}' x {(height/20).toFixed(1)}'</span></div><div className="flex justify-between items-end"><span className="text-[10px] font-bold text-gray-500 uppercase">Area</span><span className="text-2xl font-black text-white font-mono leading-none">{area.toFixed(0)}<span className="text-xs text-gray-600 ml-1">SQFT</span></span></div></div></div>
            <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-white !border-2 !border-black" /><Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-white !border-2 !border-black" />
        </div>
    );
};

export const AllowanceNode = ({ data, selected }) => {
    const { label, rate, type } = data;
    return (
        <div className={`relative min-w-[220px] p-1 transition-all duration-700 rounded-full ${selected ? 'scale-110 z-50 shadow-[0_0_100px_-10px_rgba(251,191,36,0.8)]' : 'hover:scale-105 shadow-2xl'}`}>
            <div className="absolute -inset-4 rounded-full bg-amber-500/20 blur-xl animate-pulse" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 via-amber-500 to-yellow-800 p-[6px] shadow-[0_0_30px_rgba(245,158,11,0.4)] overflow-hidden"><div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.9),transparent_50%)] z-10 opacity-70" /><div className="absolute inset-0 rounded-full bg-[#1a1200] ring-1 ring-white/20 backdrop-blur-xl flex items-center justify-center overflow-hidden"><div className="absolute inset-0 opacity-[0.07] bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] animate-spin-slow" /></div></div>
            <div className="relative p-8 flex flex-col items-center justify-center text-center gap-3 z-20"><div className="absolute -top-6 p-3 bg-gradient-to-b from-yellow-200 to-amber-600 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.5)] border-2 border-yellow-100 animate-bounce-slow"><Award size={24} className="text-amber-950 drop-shadow-md" strokeWidth={3} /></div><button onClick={(e) => { e.stopPropagation(); data.onDelete?.(); }} className="absolute top-4 right-6 text-amber-500/50 hover:text-red-500 transition-colors bg-black/20 rounded-full p-1"><X size={14} strokeWidth={3} /></button><div className="mt-4 space-y-1"><div className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em] drop-shadow-sm">Allowance</div><div className="text-xl font-black text-white uppercase tracking-tight leading-none drop-shadow-[0_2px_0_rgba(0,0,0,0.5)]">{label || 'Bonus'}</div></div><div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-600/20 to-yellow-600/20 border border-amber-400/50 flex items-center gap-2 shadow-[inset_0_0_10px_rgba(251,191,36,0.2)]"><DollarSign size={12} className="text-yellow-300" /><span className="text-lg font-mono font-black text-yellow-100">${rate || 0}</span><span className="text-[9px] font-bold text-amber-500 uppercase ml-0.5 self-end mb-1">/{type === 'daily' ? 'DAY' : 'HR'}</span></div>{data.allowanceTotal > 0 && (<div className="mt-3 pt-3 border-t border-amber-500/20 w-full flex flex-col items-center"><div className="text-[8px] font-black text-amber-500/40 uppercase tracking-widest mb-1">Live Impact</div><div className="px-3 py-1 bg-emerald-900/40 rounded-lg border border-emerald-500/30 text-emerald-400 text-lg font-mono font-black shadow-[0_0_15px_rgba(16,185,129,0.2)]">+${data.allowanceTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div></div>)}</div>
            <Handle type="source" position={Position.Bottom} className="!w-4 !h-4 !bg-amber-400 !border-4 !border-black shadow-[0_0_15px_#fbbf24]" /><Handle type="target" position={Position.Top} className="!w-4 !h-4 !bg-amber-400 !border-4 !border-black shadow-[0_0_15px_#fbbf24]" />
        </div>
    );
};

export const ZoneNode = ({ id, data, selected }) => {

    const { label = 'New Zone', zoneTotal = 0, drift = '0h', nodeCount = 0, status = 'on-track', onDelete } = data;

    const update = (field, value) => data.onUpdate?.(id, { [field]: value });



    return (

        <div 

            className={`relative rounded-[3rem] border-2 transition-all duration-700 group ${selected ? 'border-white/30 bg-white/5 shadow-[0_0_100px_rgba(255,255,255,0.1)]' : 'border-white/5 bg-black/20'}`} 

            style={{ width: '100%', height: '100%', minWidth: 250, minHeight: 250 }}

        >

            <NodeResizer minWidth={250} minHeight={250} isVisible={selected} />

            

            {/* AI VISION TAG */}

            <div className="absolute top-4 right-8 text-[8px] font-mono text-white/40 font-black tracking-[0.4em] pointer-events-none select-none z-30">ID:{id}::ZONE</div>



            <div className="absolute top-10 left-10 right-10 flex flex-col gap-4">

                <div className="flex justify-between items-start">

                    <div className="flex items-center gap-4">

                        <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${status === 'drifting' ? 'text-rose-400' : 'text-indigo-400'}`}>

                            <Box size={24} />

                        </div>

                        <div>

                            <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em] mb-1">Spatial Container</div>

                            <div className="text-2xl font-black text-white uppercase tracking-tighter">{label}</div>

                        </div>

                    </div>

                    <button onClick={(e) => { e.stopPropagation(); onDelete?.(); }} className="p-2 rounded-xl bg-white/5 text-white/20 hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"><X size={16} /></button>

                </div>



                <div className="grid grid-cols-3 gap-3 mt-4">

                    <div className="bg-black/40 rounded-2xl p-4 border border-white/5">

                        <div className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Burn</div>

                        <div className="text-lg font-black text-emerald-400 font-mono tracking-tighter">${zoneTotal.toLocaleString()}</div>

                    </div>

                    <div className="bg-black/40 rounded-2xl p-4 border border-white/5">

                        <div className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Zone Drift</div>

                        <div className={`text-lg font-black font-mono tracking-tighter ${drift.includes('+') ? 'text-rose-400' : 'text-white'}`}>{drift}</div>

                    </div>

                    <div className="bg-black/40 rounded-2xl p-4 border border-white/5 relative overflow-hidden">

                        <div className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Density</div>

                        <div className="text-lg font-black text-indigo-400 font-mono tracking-tighter">{nodeCount} Nodes</div>

                        {/* ACTIVITY DOTS */}

                        <div className="absolute bottom-2 left-4 flex gap-1">

                            {[...Array(Math.min(5, nodeCount))].map((_, i) => (

                                <div key={i} className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />

                            ))}

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

};



export const WormholeNode = ({ data, selected }) => (

    <div className={`relative rounded-full border-[12px] border-double border-indigo-500/10 bg-black flex items-center justify-center transition-all duration-1000 ${selected ? 'shadow-[0_0_150px_rgba(99,102,241,0.4)] scale-105 border-indigo-400/30' : 'opacity-90'}`} style={{ width: '100%', height: '100%', minWidth: 380, minHeight: 380 }}>

       <NodeResizer minWidth={380} minHeight={380} isVisible={selected} color="#6366f1" />

       <div className="absolute inset-0 rounded-full animate-spin-slow bg-[conic-gradient(from_0deg,transparent,rgba(99,102,241,0.2),transparent)]" />

       <div className="text-center z-10 p-12 bg-black/60 backdrop-blur-3xl rounded-full border border-white/5 shadow-2xl ring-1 ring-white/10"><div className="flex justify-center mb-4"><Zap size={48} className="text-indigo-400" /></div><div className="text-3xl font-black text-white uppercase tracking-[0.5em] mb-2">WORMHOLE</div><div className="text-[10px] text-indigo-300 font-black uppercase tracking-widest opacity-40">Holographic Container V2</div>{data.zoneTotal > 0 && (<div className="mt-8 pt-6 border-t border-white/10"><div className="text-4xl font-mono font-black text-emerald-400 animate-pulse">${data.zoneTotal.toLocaleString()}</div></div>)}</div>

    </div>

);



export const ShapeNode = ({ id, data, selected }) => {

    const { label, color = 'indigo', shapeType = 'square', isBackground, onDelete } = data;

    const update = (field, value) => data.onUpdate?.(id, { [field]: value });

    const [showColors, setShowColors] = useState(false);



    const colorMap = {

        slate: '#64748b', gray: '#6b7280', zinc: '#71717a', neutral: '#737373', stone: '#78716c',

        red: '#ef4444', orange: '#f97316', amber: '#f59e0b', yellow: '#eab308', lime: '#84cc16',

        green: '#22c55e', emerald: '#10b981', teal: '#14b8a6', cyan: '#06b6d4', sky: '#0ea5e9',

        blue: '#3b82f6', indigo: '#6366f1', violet: '#8b5cf6', purple: '#a855f7', fuchsia: '#d946ef',

        pink: '#ec4899', rose: '#f43f5e'

    };



    const colors = Object.keys(colorMap);

    const activeColor = colorMap[color] || colorMap.indigo;



    const getShapeClass = () => {

        if (shapeType === 'circle') return 'rounded-full';

        if (shapeType === 'pill') return 'rounded-[999px]';

        return 'rounded-[2.5rem]';

    };



    return (

        <div 

            className={`relative group transition-all duration-500 ${selected ? 'z-[100]' : isBackground ? 'z-0 nodrag' : 'z-40 hover:scale-[1.02]'}`} 

            style={{ width: '100%', height: '100%', minWidth: 150, minHeight: 150 }}

        >

            <NodeResizer minWidth={150} minHeight={150} isVisible={selected} />

            {!isBackground && <div className="absolute top-4 right-4 text-[8px] font-mono text-white font-bold tracking-widest pointer-events-none select-none z-30 drop-shadow-md opacity-50">ID:{id}::SHAPE</div>}

            <div className={`absolute inset-0 ${getShapeClass()} transition-all duration-500 overflow-hidden backdrop-blur-xl`} style={{ backgroundColor: isBackground ? activeColor : `${activeColor}33`, borderColor: isBackground ? `${activeColor}66` : `${activeColor}66`, borderWidth: isBackground ? '4px' : '1px', borderStyle: 'solid', boxShadow: isBackground ? 'inset 0 0 100px rgba(0,0,0,0.2)' : `0 0 30px ${activeColor}33` }}>

                {!isBackground && <div className={`absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 pointer-events-none`} />}

                {isBackground && <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')]" />}

            </div>

            <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all ${selected || !isBackground ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto'}`}>

                <AnimatePresence>

                    {showColors && (

                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }} className="mb-2 p-3 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl grid grid-cols-6 gap-1.5 w-[180px] shadow-2xl">

                            {colors.map(c => (<button key={c} onClick={(e) => { e.stopPropagation(); update('color', c); }} title={c} className={`w-5 h-5 rounded-full border border-white/10 transition-transform hover:scale-125 ${color === c ? 'ring-2 ring-white scale-110' : ''}`} style={{ backgroundColor: colorMap[c] }} />))}

                        </motion.div>

                    )}

                </AnimatePresence>

                <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md">

                    <button onClick={(e) => { e.stopPropagation(); update('isBackground', !isBackground); }} className={`p-2 rounded-xl transition-all ${isBackground ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`} title="Toggle Background"><Layers size={14} /></button>

                    <div className="w-px h-4 bg-white/10" />

                    <button onClick={(e) => { e.stopPropagation(); setShowColors(!showColors); }} className={`p-2 rounded-xl transition-all flex items-center gap-2 ${showColors ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}><PaintBucket size={14} /><div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: activeColor }} /></button>

                    <div className="w-px h-4 bg-white/10" />

                    <button onClick={(e) => { e.stopPropagation(); onDelete?.(); }} className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/20 transition-all"><X size={14} /></button>

                </div>

            </div>

        </div>

    );

};



export const TaskNode = ({ id, data, selected }) => {

    const { 

        label = 'New Task', plannedHours = 8, actualHours = 0, actualCost = 0, 

        status = 'pending', zoneName = 'Unassigned', timeDrift = '0h', costDrift = '$0',

        hubData, onDelete 

    } = data;

    const update = (field, value) => data.onUpdate?.(id, { [field]: value });

    

    const progress = Math.min(100, (actualHours / (plannedHours || 1)) * 100);

    const isOver = actualHours > plannedHours;



    return (

        <div 

            className={`relative min-w-[280px] p-1 transition-all duration-500 rounded-3xl border-2 ${selected ? 'border-indigo-500 bg-indigo-500/10 shadow-2xl scale-105' : 'border-white/10 bg-black/40 hover:border-white/20 backdrop-blur-xl'}`}

            style={{ width: '100%', height: '100%' }}

        >

            <NodeResizer minWidth={280} minHeight={180} isVisible={selected} />

            

            {/* OCR & ZONE TAGS */}

            <div className="absolute -top-6 left-0 flex gap-2">

                <div className="px-3 py-1 bg-black/80 border border-white/10 rounded-lg text-[8px] font-mono text-indigo-400 font-bold tracking-widest shadow-xl uppercase">TSK-{id.split('-')[0]}</div>

                <div className={`px-3 py-1 bg-indigo-600 border border-indigo-400 rounded-lg text-[8px] font-black text-white shadow-xl uppercase tracking-widest ${zoneName === 'Unassigned' ? 'opacity-30' : ''}`}>{zoneName}</div>

            </div>



            <div className="relative p-6 h-full flex flex-col gap-5">

                <div className="flex justify-between items-start">

                    <div className="flex items-center gap-4">

                        <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 shadow-inner border border-white/5">

                            <ClipboardList size={22} />

                        </div>

                        <div>

                            <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-0.5">Task Unit</div>

                            <div className="text-lg font-black text-white uppercase tracking-tight truncate max-w-[160px] leading-none">{label}</div>

                        </div>

                    </div>

                    <button onClick={(e) => { e.stopPropagation(); onDelete?.(); }} className="p-2 rounded-xl bg-white/5 text-white/20 hover:bg-rose-500 hover:text-white transition-all"><X size={16} /></button>

                </div>



                {/* DRIFT INDICATOR PANEL */}

                <div className="grid grid-cols-2 gap-2">

                    <div className="flex items-center justify-between p-2 bg-white/5 rounded-xl border border-white/5">

                        <span className="text-[8px] font-black text-gray-500 uppercase">Time Drift</span>

                        <span className={`text-[10px] font-mono font-black ${timeDrift.includes('+') ? 'text-rose-400' : 'text-emerald-400'}`}>{timeDrift}</span>

                    </div>

                    <div className="flex items-center justify-between p-2 bg-white/5 rounded-xl border border-white/5">

                        <span className="text-[8px] font-black text-gray-500 uppercase">Cost Drift</span>

                        <span className={`text-[10px] font-mono font-black ${costDrift.includes('+') ? 'text-rose-400' : 'text-emerald-400'}`}>{costDrift}</span>

                    </div>

                </div>



                {/* PROGRESS ENGINE */}

                <div className="space-y-2">

                    <div className="flex justify-between items-end">

                        <div className="text-[9px] font-bold text-gray-400 uppercase">Progress Engine</div>

                        <div className={`text-xs font-mono font-black ${isOver ? 'text-rose-400' : 'text-emerald-400'}`}>{actualHours} / {plannedHours}H</div>

                    </div>

                    <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[2px]">

                        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className={`h-full rounded-full ${isOver ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]' : 'bg-emerald-500 shadow-[0_0_30px_#10b981]'}`} />

                    </div>

                </div>



                {/* RESOURCE CHIPS & COST */}

                <div className="flex justify-between items-center mt-auto pt-2 border-t border-white/5">

                    <div className="flex gap-1.5 opacity-60">

                        {hubData?.workers?.length > 0 && <User size={14} className="text-emerald-400" />}

                        {hubData?.resources?.length > 0 && <Wrench size={14} className="text-amber-400" />}

                        <Package size={14} className="text-indigo-400" />

                    </div>

                    <div className="text-right">

                        <div className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Burned Cost</div>

                        <div className="text-sm font-black text-rose-400 font-mono tracking-tighter">${parseFloat(actualCost).toLocaleString()}</div>

                    </div>

                </div>

            </div>



            {/* Connection Handles */}

            <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-white !border-2 !border-black" />

            <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-white !border-2 !border-black" />

            <Handle type="target" position={Position.Left} id="left" className="!w-2 !h-2 !bg-gray-500" />

            <Handle type="source" position={Position.Right} id="right" className="!w-2 !h-2 !bg-gray-500" />

        </div>

    );

};