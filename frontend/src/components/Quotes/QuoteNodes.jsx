/*
 * MasterDiaryOS - Neural Estimation Engine (NEE) Nodes
 * Specialized for high-fidelity quoting, spatial logic, and AI-driven estimation.
 * 
 * UPGRADED: Fully aligned with Neural Diary Engine (NDE) standards.
 */
import React, { useState, useMemo, useEffect } from 'react';
import { Handle, Position, NodeResizer } from '@xyflow/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Ruler, Box, Package, User, DollarSign, TrendingUp, 
    Calculator, ShieldAlert, Layers, X, Plus, Clock, Target,
    Activity, Zap, Info, BarChart3, Tag, BrainCircuit, GitFork,
    MessageSquare, ArrowRight, Scan, Grip, ChevronDown, Sparkles, ShieldCheck, Layout
} from 'lucide-react';
import { useDiaryTheme } from '../PaintDiary/ThemeContext';
import { api } from '../../utils/api';

// --- SHARED JEWEL WRAPPER (Premium Aesthetic) ---
const JewelWrapper = ({ children, theme: nodeTheme, selected, shapeClass }) => {
    const { theme } = useDiaryTheme();
    const activeTheme = nodeTheme || {
        bg: 'from-indigo-900/40 via-black to-black',
        border: 'border-indigo-500/30',
        glow: 'shadow-indigo-500/20',
        accent: 'text-indigo-400'
    };

    return (
        <div className={`
            group relative min-w-[320px] p-[2px] 
            transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
            ${shapeClass}
            ${selected ? `scale-105 z-50 ${activeTheme.glow} shadow-[0_0_80px_-20px_rgba(99,102,241,0.4)]` : 'hover:scale-[1.02] hover:shadow-2xl'}
        `}>
            {/* Atmospheric Background */}
            <div className={`absolute inset-0 ${shapeClass} bg-gradient-to-br ${activeTheme.bg} backdrop-blur-3xl opacity-100 overflow-hidden`}>
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer" />
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
            </div>
            
            {/* Border Ring */}
            <div className={`absolute inset-0 ${shapeClass} border-[1.5px] ${activeTheme.border} pointer-events-none ring-1 ring-white/5`} />
            
            <div className="relative p-6">
                {children}
            </div>
        </div>
    );
};

// --- 1. ESTIMATION PRISM (The AI Brain for Quotes) ---
export const EstimationPrismNode = ({ id, data, selected }) => {
    const { 
        status = 'analyzing', quoteTotal = 0, profitMargin = '0%', 
        riskLevel = 'low', missingItems = [], suggestions = [],
        chatHistory = [], isProcessing = false
    } = data;

    const [showInterface, setShowInterface] = useState(false);
    const [activeTab, setActiveTab] = useState('insight');
    const [input, setInput] = useState('');
    const [history, setHistory] = useState(chatHistory || []);
    const [thinking, setThinking] = useState(false);

    const update = (field, val) => data.onUpdate?.(id, { [field]: val });

    const cognitiveFeed = [
        "Scanning Bill of Materials...",
        "Validating Spatial Logic...",
        "Checking Market Rates...",
        "Analyzing Profit Margins...",
        "Detecting Omissions...",
        "Optimizing Yield..."
    ];
    const [thoughtIndex, setThoughtIndex] = useState(0);

    useEffect(() => {
        if (status === 'analyzing') {
            const interval = setInterval(() => setThoughtIndex(i => (i + 1) % cognitiveFeed.length), 2000);
            return () => clearInterval(interval);
        }
    }, [status]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        const newMsg = { role: 'user', content: input };
        const newHistory = [...history, newMsg];
        setHistory(newHistory);
        setInput('');
        setThinking(true);
        
        try {
            // Use the quote chat endpoint
            const res = await api.post('/ai/chat-quote', { 
                message: input, 
                context: { nodeId: id, total: quoteTotal, margin: profitMargin, ...data.context } 
            });
            const aiMsg = { role: 'assistant', content: res.data.reply };
            const finalHistory = [...newHistory, aiMsg];
            setHistory(finalHistory);
            update('chatHistory', finalHistory);
        } catch (err) {
            setHistory([...newHistory, { role: 'assistant', content: "Connection lost. Please try again." }]);
        } finally {
            setThinking(false);
        }
    };

    const theme = status === 'analyzing' ? { color: '#818cf8', label: 'ANALYZING' } :
                  riskLevel === 'high' ? { color: '#f43f5e', label: 'RISK_DETECTED' } :
                  { color: '#10b981', label: 'OPTIMAL' };

    return (
        <div className={`relative w-[340px] h-[340px] transition-all duration-1000 ${selected ? 'scale-110 z-50' : 'hover:scale-105'}`}>
             {/* Holographic Projection Base */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <svg width="280" height="280" viewBox="0 0 100 100" className="drop-shadow-[0_0_50px_rgba(99,102,241,0.4)]">
                    <defs>
                        <linearGradient id={`prism-grad-${id}`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#fff" stopOpacity="0.9" /><stop offset="50%" stopColor={theme.color} stopOpacity="0.6" /><stop offset="100%" stopColor="#000" stopOpacity="0.8" /></linearGradient>
                    </defs>
                    <motion.g animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: '50% 50%' }}>
                        <circle cx="50" cy="50" r="45" fill="none" stroke={theme.color} strokeWidth="0.2" strokeDasharray="1 3" opacity="0.4" />
                        <circle cx="50" cy="50" r="35" fill="none" stroke={theme.color} strokeWidth="0.1" strokeDasharray="4 4" opacity="0.2" />
                    </motion.g>
                    <motion.path d="M50 10 L85 75 L15 75 Z" fill={`url(#prism-grad-${id})`} stroke={theme.color} strokeWidth="0.5" 
                        animate={{ rotateY: [0, 360], scale: [1, 1.05, 1] }} 
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} 
                        style={{ transformOrigin: '50% 50%' }} 
                    />
                </svg>
            </div>

            {/* Core Interaction Point */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div onClick={() => setShowInterface(!showInterface)} className="w-32 h-32 rounded-full bg-black/80 border border-white/10 backdrop-blur-md cursor-pointer hover:scale-110 hover:border-indigo-500/50 transition-all flex flex-col items-center justify-center shadow-2xl group relative z-10">
                    <BrainCircuit size={40} style={{ color: theme.color }} className={status === 'analyzing' ? 'animate-pulse' : ''} />
                    <div className="mt-2 text-[8px] font-black text-white uppercase tracking-[0.2em]">{theme.label}</div>
                    {status === 'analyzing' && <div className="absolute -bottom-8 w-40 text-center text-[7px] font-mono text-indigo-400 animate-pulse">{cognitiveFeed[thoughtIndex]}</div>}
                </div>
            </div>

            {/* Status Satellites */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 px-4 py-1.5 bg-black/90 border border-white/10 rounded-full flex items-center gap-2 shadow-xl backdrop-blur-md">
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Confidence</span>
                <span className="text-xs font-black text-emerald-400 font-mono">98%</span>
            </div>

            {/* Expanded Interface */}
            <AnimatePresence>
                {showInterface && (
                    <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="absolute top-[-20px] left-1/2 -translate-x-1/2 w-[450px] bg-[#0a0a0c] border border-white/10 rounded-[2rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] z-[100] overflow-hidden backdrop-blur-3xl ring-1 ring-white/5">
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 bg-gradient-to-r from-indigo-900/20 to-transparent">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-black text-white uppercase tracking-wider">Estimation Intelligence</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className={`w-1.5 h-1.5 rounded-full ${theme.color === '#f43f5e' ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`} />
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Neural Link Active</span>
                                    </div>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); setShowInterface(false); }} className="p-2 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-colors"><X size={18} /></button>
                            </div>
                            {/* Tabs */}
                            <div className="flex gap-1 mt-6 p-1 bg-black/40 rounded-xl border border-white/5">
                                {['insight', 'chat', 'risks'].map(t => (
                                    <button key={t} onClick={() => setActiveTab(t)} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 h-[350px] overflow-y-auto custom-scrollbar bg-black/20">
                            {activeTab === 'insight' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-1">Projected Margin</div>
                                            <div className="text-2xl font-black text-emerald-400 font-mono tracking-tighter">{profitMargin}</div>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mb-1">Risk Score</div>
                                            <div className={`text-2xl font-black font-mono tracking-tighter ${riskLevel === 'high' ? 'text-rose-500' : 'text-indigo-400'}`}>{riskLevel.toUpperCase()}</div>
                                        </div>
                                    </div>
                                    {suggestions.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest px-1">Optimization Suggestions</div>
                                            {suggestions.map((s, i) => (
                                                <div key={i} className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex gap-3 items-center">
                                                    <div className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-400"><Sparkles size={12} /></div>
                                                    <span className="text-xs text-gray-300 font-medium">{s}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'chat' && (
                                <div className="flex flex-col h-full">
                                    <div className="flex-1 space-y-3 mb-4 pr-1">
                                        {history.length === 0 && <div className="text-center text-gray-600 text-xs mt-10 italic">Ask me to analyze costs, suggest improvements, or draft a scope...</div>}
                                        {history.map((m, i) => (
                                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[85%] p-3 rounded-2xl text-xs font-medium leading-relaxed ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white/5 border border-white/10 text-gray-300 rounded-tl-sm'}`}>{m.content}</div>
                                            </div>
                                        ))}
                                        {thinking && <div className="flex gap-1 p-2"><span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" /><span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce delay-75" /><span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce delay-150" /></div>}
                                    </div>
                                    <form onSubmit={handleSend} className="relative mt-auto">
                                        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Query estimation engine..." className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-4 pr-10 text-xs text-white focus:border-indigo-500 outline-none transition-all" />
                                        <button type="submit" className="absolute right-2 top-2 p-1.5 bg-indigo-600 rounded-lg text-white hover:bg-indigo-500 transition-colors"><ArrowRight size={14} /></button>
                                    </form>
                                </div>
                            )}

                            {activeTab === 'risks' && (
                                <div className="space-y-3">
                                    {missingItems.length > 0 ? (
                                        missingItems.map((item, i) => (
                                            <div key={i} className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3">
                                                <div className="p-1.5 bg-rose-500/20 rounded-lg text-rose-400"><ShieldAlert size={14} /></div>
                                                <div>
                                                    <div className="text-[10px] font-black text-rose-400 uppercase tracking-wider">Missing Item</div>
                                                    <div className="text-xs text-white font-bold">{item}</div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-emerald-500 opacity-60">
                                            <ShieldCheck size={48} className="mb-2" />
                                            <span className="text-xs font-black uppercase tracking-widest">No Critical Risks</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Handle type="target" position={Position.Top} className="!w-1 !h-1 !opacity-0" />
            <Handle type="source" position={Position.Bottom} className="!w-1 !h-1 !opacity-0" />
        </div>
    );
};

// --- 2. AREA NODE (Spatial Calculator V2) ---
export const AreaNode = ({ id, data, selected }) => {
    const { label = "Main Area", width = 10, length = 10, depth = 0, type = 'floor', onUpdate, onDelete } = data;
    
    const area = width * length;
    const volume = area * (depth / 100); 
    const perimeter = (width + length) * 2;

    const update = (field, val) => onUpdate?.(id, { [field]: parseFloat(val) || 0 });
    const updateLabel = (val) => onUpdate?.(id, { label: val });

    const getTypeIcon = () => {
        switch(type) {
            case 'floor': return <Layout size={20} />;
            case 'wall': return <Box size={20} />;
            case 'roof': return <Layers size={20} />;
            default: return <Ruler size={20} />;
        }
    };

    return (
        <JewelWrapper selected={selected} theme={{ bg: 'from-cyan-900/60 via-cyan-950/40 to-black', border: 'border-cyan-500/40', glow: 'shadow-cyan-500/30', accent: 'text-cyan-400' }} shapeClass="rounded-[2.5rem]">
            <div className="flex flex-col gap-5">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-cyan-500/20 rounded-2xl text-cyan-400 border border-cyan-500/30 shadow-xl shadow-cyan-900/20">{getTypeIcon()}</div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[8px] font-black text-cyan-600 uppercase tracking-[0.3em]">Spatial Node</span>
                                <select 
                                    value={type} 
                                    onChange={(e) => onUpdate?.(id, { type: e.target.value })} 
                                    className="bg-cyan-950/50 text-[8px] text-cyan-400 border border-cyan-500/30 rounded uppercase font-bold outline-none cursor-pointer hover:border-cyan-400"
                                >
                                    <option value="floor">Floor</option>
                                    <option value="wall">Wall</option>
                                    <option value="ceiling">Ceiling</option>
                                    <option value="roof">Roof</option>
                                </select>
                            </div>
                            <input 
                                className="bg-transparent text-xl font-black text-white uppercase outline-none focus:text-cyan-400 transition-colors truncate w-40 placeholder-white/20"
                                value={label}
                                onChange={(e) => updateLabel(e.target.value)}
                                placeholder="AREA NAME"
                            />
                        </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onDelete?.(); }} className="p-2 rounded-xl bg-white/5 text-white/20 hover:bg-rose-500 hover:text-white transition-all"><X size={16} /></button>
                </div>

                {/* Dimensions Grid */}
                <div className="grid grid-cols-3 gap-2">
                    {['width', 'length', 'depth'].map((dim) => (
                        <div key={dim} className="bg-black/40 rounded-xl p-2 border border-white/5 group/input focus-within:border-cyan-500/50 transition-colors">
                            <span className="text-[7px] font-black text-gray-600 uppercase tracking-wider block mb-1">{dim} ({dim === 'depth' ? 'cm' : 'm'})</span>
                            <input 
                                type="number" 
                                step={dim === 'depth' ? 1 : 0.1} 
                                value={dim === 'width' ? width : dim === 'length' ? length : depth} 
                                onChange={(e) => update(dim, e.target.value)} 
                                className="w-full bg-transparent text-sm font-black text-white font-mono outline-none" 
                            />
                        </div>
                    ))}
                </div>

                {/* Calculated Metrics */}
                <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                    <div>
                        <div className="text-[9px] font-black text-cyan-500/60 uppercase tracking-widest mb-0.5">Coverage Area</div>
                        <div className="text-3xl font-black text-white font-mono tracking-tighter drop-shadow-lg">{area.toFixed(1)}<span className="text-sm text-gray-600 ml-1">m²</span></div>
                    </div>
                    <div className="text-right space-y-1">
                        <div className="flex justify-end items-center gap-2">
                            <span className="text-[8px] font-bold text-gray-600 uppercase">Perim</span>
                            <span className="text-xs font-mono font-bold text-cyan-200">{perimeter.toFixed(1)}m</span>
                        </div>
                        {depth > 0 && (
                            <div className="flex justify-end items-center gap-2">
                                <span className="text-[8px] font-bold text-gray-600 uppercase">Vol</span>
                                <span className="text-xs font-mono font-bold text-cyan-200">{volume.toFixed(1)}m³</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Handle type="source" position={Position.Right} className="!w-4 !h-4 !bg-cyan-400 !border-4 !border-black shadow-[0_0_15px_#22d3ee] !transition-transform hover:scale-125" />
        </JewelWrapper>
    );
};

// --- 3. MATERIAL YIELD NODE (Upgraded) ---
export const QuoteMaterialNode = ({ id, data, selected }) => {
    const { label, rate = 0, coverage = 10, waste = 10, unit = 'Unit', onUpdate, onDelete, inheritedArea = 0, quantity } = data;
    
    // Auto-calculate logic
    const isDynamic = inheritedArea > 0;
    const qtyNeeded = isDynamic ? (inheritedArea / coverage) * (1 + (waste / 100)) : (parseFloat(quantity) || 1);
    const totalLine = qtyNeeded * rate;

    return (
        <JewelWrapper selected={selected} theme={{ bg: 'from-indigo-900/60 via-indigo-950/40 to-black', border: 'border-indigo-500/40', glow: 'shadow-indigo-500/30', accent: 'text-indigo-400' }} shapeClass="rounded-[2rem]">
             <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-400 border border-indigo-500/30 shadow-xl shadow-indigo-900/20"><Package size={20} /></div>
                        <div>
                            <div className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-0.5">Material Yield</div>
                            <div className="text-sm font-black text-white uppercase truncate w-40">{label}</div>
                            {isDynamic && <div className="text-[8px] font-bold text-emerald-400 flex items-center gap-1 mt-1"><Zap size={8} fill="currentColor" /> LINKED TO AREA</div>}
                        </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onDelete?.(); }} className="p-2 rounded-xl bg-white/5 text-white/20 hover:bg-rose-500 hover:text-white transition-all"><X size={14} /></button>
                </div>

                <div className="bg-black/40 rounded-2xl p-4 border border-white/5 space-y-3 relative overflow-hidden">
                    {/* Coverage Logic */}
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Coverage</span>
                        <div className="flex items-center gap-2">
                            <input type="number" value={coverage} onChange={(e) => onUpdate?.(id, { coverage: parseFloat(e.target.value) })} className="w-12 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-xs text-right text-indigo-300 font-mono outline-none focus:border-indigo-500 transition-colors" />
                            <span className="text-[8px] text-gray-600 font-bold">m²/{unit}</span>
                        </div>
                    </div>
                    {/* Waste Logic */}
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Wastage</span>
                        <div className="flex items-center gap-2">
                            <input type="number" value={waste} onChange={(e) => onUpdate?.(id, { waste: parseFloat(e.target.value) })} className="w-12 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-xs text-right text-rose-300 font-mono outline-none focus:border-rose-500 transition-colors" />
                            <span className="text-[8px] text-gray-600 font-bold">%</span>
                        </div>
                    </div>
                     {/* Unit Price */}
                     <div className="flex justify-between items-center pt-2 border-t border-white/5">
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Unit Rate</span>
                        <div className="flex items-center gap-1">
                             <span className="text-[10px] text-gray-500">$</span>
                            <input type="number" value={rate} onChange={(e) => onUpdate?.(id, { rate: parseFloat(e.target.value) })} className="w-16 bg-transparent text-sm text-right text-white font-mono font-bold outline-none border-b border-transparent focus:border-indigo-500 transition-all" />
                        </div>
                    </div>
                </div>

                {/* Total Footer */}
                <div className="flex justify-between items-end px-1">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Quantity</span>
                        <div className="text-xl font-black text-white font-mono leading-none">{qtyNeeded.toFixed(1)}<span className="text-[10px] text-gray-600 ml-1">{unit}s</span></div>
                    </div>
                    <div className="text-right">
                        <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Cost</span>
                        <div className="text-xl font-black text-emerald-400 font-mono leading-none">${totalLine.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    </div>
                </div>
            </div>
            <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-black" />
            <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-black" />
        </JewelWrapper>
    );
};

// --- 4. LABOUR NODE (Upgraded) ---
export const QuoteLabourNode = ({ id, data, selected }) => {
    const { label, rate = 0, prodRate = 2, onUpdate, onDelete, inheritedArea = 0, duration } = data;
    
    const isDynamic = inheritedArea > 0;
    const hoursNeeded = isDynamic ? (inheritedArea / prodRate) : (parseFloat(duration) || 8);
    const totalLine = hoursNeeded * rate;

    return (
        <JewelWrapper selected={selected} theme={{ bg: 'from-emerald-900/60 via-emerald-950/40 to-black', border: 'border-emerald-500/40', glow: 'shadow-emerald-500/30', accent: 'text-emerald-400' }} shapeClass="rounded-[2rem]">
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400 border border-emerald-500/30 shadow-xl shadow-emerald-900/20"><User size={20} /></div>
                        <div>
                            <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-0.5">Labour Est.</div>
                            <div className="text-sm font-black text-white uppercase truncate w-40">{label}</div>
                            {isDynamic && <div className="text-[8px] font-bold text-cyan-400 flex items-center gap-1 mt-1"><Zap size={8} fill="currentColor" /> LINKED TO AREA</div>}
                        </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onDelete?.(); }} className="p-2 rounded-xl bg-white/5 text-white/20 hover:bg-rose-500 hover:text-white transition-all"><X size={14} /></button>
                </div>

                <div className="bg-black/40 rounded-2xl p-4 border border-white/5 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Productivity</span>
                        <div className="flex items-center gap-2">
                            <input type="number" step="0.1" value={prodRate} onChange={(e) => onUpdate?.(id, { prodRate: parseFloat(e.target.value) })} className="w-12 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-xs text-right text-emerald-300 font-mono outline-none focus:border-emerald-500 transition-colors" />
                            <span className="text-[8px] text-gray-600 font-bold">m²/hr</span>
                        </div>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Hourly Rate</span>
                        <div className="flex items-center gap-1">
                             <span className="text-[10px] text-gray-500">$</span>
                            <input type="number" value={rate} onChange={(e) => onUpdate?.(id, { rate: parseFloat(e.target.value) })} className="w-16 bg-transparent text-sm text-right text-white font-mono font-bold outline-none border-b border-transparent focus:border-emerald-500 transition-all" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-end px-1">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Time</span>
                        <div className="text-xl font-black text-white font-mono leading-none">{hoursNeeded.toFixed(1)}<span className="text-[10px] text-gray-600 ml-1">hrs</span></div>
                    </div>
                    <div className="text-right">
                        <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Labor Cost</span>
                        <div className="text-xl font-black text-emerald-400 font-mono leading-none">${totalLine.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    </div>
                </div>
            </div>
            <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-black" />
            <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-black" />
        </JewelWrapper>
    );
};

// --- 5. PROFIT NODE (Financial Command Center) ---
export const ProfitNode = ({ id, data, selected }) => {
    const { markup = 20, overhead = 10, contingency = 5, onUpdate, onDelete, quoteTotal = 0 } = data;
    
    const profitVal = quoteTotal * (markup / 100);
    const overheadVal = quoteTotal * (overhead / 100);
    const contingencyVal = quoteTotal * (contingency / 100);
    const finalTotal = quoteTotal + profitVal + overheadVal + contingencyVal;

    const update = (field, val) => onUpdate?.(id, { [field]: parseFloat(val) || 0 });

    return (
        <JewelWrapper selected={selected} theme={{ bg: 'from-amber-900/60 via-amber-950/40 to-black', border: 'border-amber-500/40', glow: 'shadow-amber-500/30', accent: 'text-amber-400' }} shapeClass="rounded-[3rem]">
            <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-amber-500/20 rounded-full text-amber-400 border border-amber-500/30 shadow-2xl shadow-amber-900/40 animate-pulse"><DollarSign size={28} /></div>
                        <div>
                            <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] mb-1">Financial Core</div>
                            <div className="text-2xl font-black text-white uppercase tracking-tighter">Margin Control</div>
                        </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onDelete?.(); }} className="p-2.5 rounded-2xl bg-white/5 text-white/20 hover:bg-rose-500 hover:text-white transition-all"><X size={18} /></button>
                </div>

                {/* Sliders Area */}
                <div className="grid grid-cols-1 gap-5 bg-black/40 p-5 rounded-3xl border border-white/5">
                    {/* Markup Slider */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Gross Profit</span>
                            <span className="text-sm font-black text-amber-400 font-mono">{markup}%</span>
                        </div>
                        <input type="range" min="0" max="100" value={markup} onChange={(e) => update('markup', e.target.value)} className="w-full h-1.5 bg-white/10 rounded-full appearance-none accent-amber-500 nodrag cursor-pointer" />
                         <div className="text-right text-[9px] font-mono text-amber-400/60">+${profitVal.toLocaleString(undefined, {maximumFractionDigits:0})}</div>
                    </div>
                    
                    {/* Overhead Slider */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Overhead</span>
                            <span className="text-sm font-black text-indigo-400 font-mono">{overhead}%</span>
                        </div>
                        <input type="range" min="0" max="50" value={overhead} onChange={(e) => update('overhead', e.target.value)} className="w-full h-1.5 bg-white/10 rounded-full appearance-none accent-indigo-500 nodrag cursor-pointer" />
                        <div className="text-right text-[9px] font-mono text-indigo-400/60">+${overheadVal.toLocaleString(undefined, {maximumFractionDigits:0})}</div>
                    </div>
                </div>

                {/* Totals Display */}
                <div className="pt-4 border-t border-white/5 space-y-2">
                    <div className="flex justify-between items-center">
                         <div className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Base Cost</div>
                         <div className="text-lg font-black text-white/40 font-mono">${quoteTotal.toLocaleString()}</div>
                    </div>
                    <div className="flex justify-between items-end bg-gradient-to-r from-emerald-900/20 to-transparent p-3 rounded-2xl border border-emerald-500/20">
                        <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Contract Value</div>
                        <div className="text-4xl font-black text-emerald-400 font-mono tracking-tighter drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">${finalTotal.toLocaleString(undefined, {maximumFractionDigits:0})}</div>
                    </div>
                </div>
            </div>
            <Handle type="target" position={Position.Left} className="!w-5 !h-5 !bg-amber-500 !border-4 !border-black shadow-[0_0_20px_#f59e0b]" />
        </JewelWrapper>
    );
};

export const QuoteNodeTypes = {
    areaNode: AreaNode,
    quoteMaterial: QuoteMaterialNode,
    quoteLabour: QuoteLabourNode,
    profitNode: ProfitNode,
    estimationPrism: EstimationPrismNode
};