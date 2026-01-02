import React, { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
    CreditCard, ShieldCheck, Truck, BookOpen, FileText, 
    ArrowRight, MoreHorizontal, User, AlertTriangle, 
    DollarSign, HardHat, Calendar, ExternalLink, Zap, Sparkles, Clock, MapPin, TrendingUp, Activity, Folder, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const IntegrationIcon = ({ type }) => {
    switch (type) {
        case 'invoiceNode': return <CreditCard size={18} className="text-emerald-400" />;
        case 'safetyNode': return <ShieldCheck size={18} className="text-rose-400" />;
        case 'resourceNode': return <Truck size={18} className="text-amber-400" />;
        case 'diaryNode': return <BookOpen size={18} className="text-cyan-400" />;
        case 'quoteNode': return <FileText size={18} className="text-indigo-400" />;
        case 'forensicNode': return <AlertTriangle size={18} className="text-violet-400" />;
        case 'delayNode': return <Clock size={18} className="text-orange-400" />;
        case 'wormholeNode': return <Zap size={18} className="text-fuchsia-400" />;
        case 'mapNode': return <MapPin size={18} className="text-blue-400" />;
        case 'clientNode': return <User size={18} className="text-indigo-400" />;
        case 'projectNode': return <Folder size={18} className="text-indigo-400" />;
        case 'variationNode': return <TrendingUp size={18} className="text-emerald-500" />;
        case 'quoteAction': return <FileText size={18} className="text-emerald-400" />;
        case 'diaryAction': return <Calendar size={18} className="text-purple-400" />;
        case 'resourceAction': return <Truck size={18} className="text-amber-400" />;
        default: return <Zap size={18} className="text-slate-400" />;
    }
};

const IntegrationColor = ({ type, isBorder = false, isBg = false }) => {
    if (isBorder) {
        switch (type) {
            case 'invoiceNode': return 'border-emerald-500/50';
            case 'safetyNode': return 'border-rose-500/50';
            case 'resourceNode': return 'border-amber-500/50';
            case 'diaryNode': return 'border-cyan-500/50';
            case 'quoteNode': return 'border-indigo-500/50';
            case 'forensicNode': return 'border-violet-500/50';
            case 'delayNode': return 'border-orange-500/50';
            case 'wormholeNode': return 'border-fuchsia-500/50';
            case 'mapNode': return 'border-blue-500/50';
            case 'clientNode': return 'border-indigo-500/50';
            case 'projectNode': return 'border-indigo-400/50';
            case 'variationNode': return 'border-emerald-600/50';
            case 'quoteAction': return 'border-emerald-500/50';
            case 'diaryAction': return 'border-purple-500/50';
            case 'resourceAction': return 'border-amber-500/50';
            default: return 'border-slate-500/50';
        }
    }
    if (isBg) {
        switch (type) {
            case 'invoiceNode': return 'bg-emerald-500/10';
            case 'safetyNode': return 'bg-rose-500/10';
            case 'resourceNode': return 'bg-amber-500/10';
            case 'diaryNode': return 'bg-cyan-500/10';
            case 'quoteNode': return 'bg-indigo-500/10';
            case 'forensicNode': return 'bg-violet-500/10';
            case 'delayNode': return 'bg-orange-500/10';
            case 'wormholeNode': return 'bg-fuchsia-500/10';
            case 'mapNode': return 'bg-blue-500/10';
            case 'clientNode': return 'bg-indigo-500/10';
            case 'projectNode': return 'bg-indigo-400/10';
            case 'variationNode': return 'bg-emerald-600/10';
            case 'quoteAction': return 'bg-emerald-500/10';
            case 'diaryAction': return 'bg-purple-500/10';
            case 'resourceAction': return 'bg-amber-500/10';
            default: return 'bg-slate-500/10';
        }
    }
    switch (type) {
        case 'invoiceNode': return 'text-emerald-400';
        case 'safetyNode': return 'text-rose-400';
        case 'resourceNode': return 'text-amber-400';
        case 'diaryNode': return 'text-cyan-400';
        case 'quoteNode': return 'text-indigo-400';
        case 'forensicNode': return 'text-violet-400';
        case 'delayNode': return 'text-orange-400';
        case 'wormholeNode': return 'text-fuchsia-400';
        case 'mapNode': return 'text-blue-400';
        case 'clientNode': return 'text-indigo-400';
        case 'projectNode': return 'text-indigo-400';
        case 'variationNode': return 'text-emerald-500';
        case 'quoteAction': return 'text-emerald-400';
        case 'diaryAction': return 'text-purple-400';
        case 'resourceAction': return 'text-amber-400';
        default: return 'text-slate-400';
    }
};

export default memo(({ data, type, selected }) => {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);
    const status = data.status || 'pending';
    const config = data.config || {};
    const forensicActive = data.forensicActive || false;
    const theme = data.theme || 'indigo';
    const isGhost = data.isGhost || false;
    const isSuggestion = data.isSuggestion || false;

    // --- THEME COLOR ENGINE ---
    const themeColors = {
        indigo: '#6366f1',
        emerald: '#10b981',
        solar: '#fbbf24',
        rose: '#f43f5e',
        violet: '#8b5cf6',
        cyan: '#06b6d4',
        amber: '#f59e0b',
        slate: '#64748b'
    };
    const activeColor = themeColors[theme] || themeColors.indigo;

    // --- MASTERPIECE: NEURAL HEALTH (INTEGRATION SPECIFIC) ---
    const getHealth = () => {
        if (status === 'error' || data.simulationError) return 'broken';
        if (type === 'invoiceNode' && !config.amount) return 'incomplete';
        if (type === 'safetyNode' && !config.template) return 'incomplete';
        if (type === 'resourceNode' && !config.resourceType) return 'incomplete';
        if (type === 'projectNode' && !config.projectName) return 'incomplete';
        if (!data.label || data.label.includes('Integration Node')) return 'warning';
        return 'optimized';
    };
    const health = getHealth();

    // --- SIMULATION OVERLAY LOGIC ---
    const simResult = data.simulationResult;
    const simColorMap = {
        green: 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]',
        yellow: 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)]',
        red: 'border-rose-500 shadow-[0_0_30px_rgba(225,29,72,0.5)]',
        blue: 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)]',
        grey: 'border-slate-700 opacity-40 grayscale shadow-none'
    };

    let baseClasses = "relative min-w-[320px] rounded-2xl border backdrop-blur-2xl transition-all duration-500 group hover:-translate-y-1 hover:shadow-2xl";
    
    // Status Logic
    let borderColor = IntegrationColor({ type, isBorder: true });
    let bgGradient = 'bg-gradient-to-b from-slate-900/95 to-black';
    
    // --- DYNAMIC HEALTH GLOWS ---
    const healthShadows = {
        optimized: `shadow-[0_0_20px_${activeColor}22]`,
        warning: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]',
        incomplete: 'shadow-[0_0_20px_rgba(59,130,246,0.2)]',
        broken: 'shadow-[0_0_30px_rgba(239,68,68,0.4)]'
    };
    let shadow = selected ? `shadow-[0_0_40px_${activeColor}44]` : healthShadows[health];
    
    if (selected) {
        borderColor = 'border-white/40';
        bgGradient = 'bg-slate-900';
    }

    if (simResult) {
        const simStyle = simColorMap[simResult.status] || '';
        borderColor = simStyle.split(' ')[0];
        shadow = simStyle.split(' ').slice(1).join(' ');
    }

    // Suggestion Mode Style (Holographic Shadow)
    if (isSuggestion) {
        return (
            <div 
              onClick={data.onManifest}
              className="relative min-w-[280px] rounded-2xl border-2 border-dashed border-indigo-500/30 bg-indigo-500/5 backdrop-blur-sm p-5 cursor-pointer group hover:bg-indigo-500/10 hover:border-indigo-500/60 transition-all duration-500"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 group-hover:scale-110 transition-transform">
                        <Zap size={16} className="animate-pulse" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-indigo-400/60 uppercase tracking-widest block">AI Integration</span>
                        <span className="text-sm font-bold text-white/40 group-hover:text-white/80 transition-colors">{data.label}</span>
                    </div>
                </div>
                <div className="mt-4 flex justify-end">
                    <div className="px-3 py-1 bg-indigo-600 rounded-lg text-[8px] font-black text-white uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                        Manifest Node
                    </div>
                </div>
            </div>
        );
    }

    // Ghost Mode Style
    if (isGhost) {
        return (
          <div className="relative min-w-[320px] rounded-2xl border border-white/5 bg-white/[0.02] opacity-20 grayscale blur-[1px] pointer-events-none scale-95 origin-center">
              <div className="p-5">
                  <div className="h-4 w-24 bg-white/10 rounded mb-2" />
                  <div className="h-2 w-full bg-white/5 rounded" />
              </div>
          </div>
        );
    }

    // Forensic Mode Styling
    if (forensicActive) {
        borderColor = 'border-violet-500/80';
        shadow = 'shadow-[0_0_30px_rgba(139,92,246,0.4)]';
    }

    const handleAction = (e) => {
        e.stopPropagation();
        const urlMap = {
            invoiceNode: '/invoices',
            safetyNode: '/safety',
            resourceNode: '/resources',
            diaryNode: '/diary',
            quoteNode: '/quotes/builder',
            projectNode: '/projects'
        };
        if (urlMap[type]) window.open(urlMap[type], '_blank');
    };

    return (
        <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`${baseClasses} ${borderColor} ${bgGradient} ${shadow}`}
            style={{ background: 'transparent', border: 'none' }}
        >
             {/* WORMHOLE PREVIEW PORTAL */}
             <AnimatePresence>
                 {type === 'wormholeNode' && isHovered && data.config?.targetWorkflow && (
                     <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: -160, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.8 }}
                        className="absolute left-1/2 -translate-x-1/2 w-64 h-40 bg-slate-900/90 backdrop-blur-2xl border border-fuchsia-500/40 rounded-3xl z-[100] shadow-[0_30px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(192,38,211,0.2)] overflow-hidden pointer-events-none p-4"
                     >
                         <div className="flex items-center gap-2 mb-3">
                             <Eye size={12} className="text-fuchsia-400" />
                             <span className="text-[8px] font-black text-white uppercase tracking-widest">Target_Lattice_Preview</span>
                         </div>
                         <div className="space-y-2 opacity-40">
                             <div className="h-2 w-20 bg-fuchsia-500/30 rounded" />
                             <div className="h-2 w-full bg-white/10 rounded" />
                             <div className="h-2 w-3/4 bg-white/10 rounded" />
                             <div className="flex gap-2 pt-2">
                                 <div className="w-4 h-4 rounded bg-white/10" />
                                 <div className="w-4 h-4 rounded bg-white/10" />
                                 <div className="w-4 h-4 rounded bg-white/10" />
                             </div>
                         </div>
                         <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-slate-950 to-transparent">
                             <span className="text-[10px] font-black text-fuchsia-400 uppercase">{data.config.targetWorkflow}</span>
                         </div>
                     </motion.div>
                 )}
             </AnimatePresence>

             {/* Forensic Scanner Overlay */}
             {forensicActive && (
                 <motion.div 
                    initial={{ top: -100 }}
                    animate={{ top: 200 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-10 bg-violet-500/10 blur-xl z-0 pointer-events-none"
                 />
             )}

             <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                {/* Header Theme Stripe */}
                <div className={`absolute top-0 left-0 right-0 h-1`} style={{ backgroundColor: activeColor }} />

                {/* MASTERPIECE: PULSE FLASH */}
                <AnimatePresence>
                    {data.isSimulating && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0] }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8 }}
                            className="absolute inset-0 bg-white/20 z-30"
                        />
                    )}
                </AnimatePresence>

                {/* MASTERPIECE: ERROR FLASH */}
                <AnimatePresence>
                    {data.simulationError && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0, 1, 0] }}
                            transition={{ duration: 0.4, repeat: Infinity }}
                            className="absolute inset-0 bg-red-500/30 z-30"
                        />
                    )}
                </AnimatePresence>
             </div>

             {/* Handles */}
             <Handle 
                type="target" 
                position={Position.Left} 
                className="!bg-slate-900 !w-4 !h-4 !border-[3px] !border-indigo-500/30 hover:!bg-indigo-400 transition-all z-50 cursor-crosshair shadow-lg" 
                style={{ left: 0, top: '50%', transform: 'translate(-50%, -50%)' }}
             />

             {/* Main Content */}
             <div className="p-5 relative z-10">
                <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-xl border border-white/5 shadow-inner ${IntegrationColor({ type, isBg: true })}`}>
                        <IntegrationIcon type={type} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                             <h3 className="text-white font-bold text-base truncate tracking-tight">{data.label || 'Integration Node'}</h3>
                             <MoreHorizontal size={16} className="text-slate-600 hover:text-white cursor-pointer transition-colors" />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <p className={`text-[10px] uppercase tracking-widest font-bold ${IntegrationColor({ type })}`}>
                                {type.replace('Node', '').toUpperCase()} ENGINE
                            </p>
                            {Object.keys(config).length > 0 && (
                                <div className="px-1.5 py-0.5 rounded-md bg-white/10 border border-white/10 flex items-center gap-1" title="Smart Configuration Active">
                                    <Sparkles size={8} className="text-indigo-400" />
                                    <span className="text-[8px] font-bold text-indigo-300 uppercase">Smart Config</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Specific Data Display (ENHANCED FOR INLINE EDITING) */}
                <div className="space-y-3 bg-white/5 rounded-xl p-3 border border-white/5 mb-4">
                    
                    {/* Project Specifics */}
                    {type === 'projectNode' && (
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-medium">Lattice Mode</span>
                                <span className="text-indigo-400 font-bold uppercase tracking-widest">{config.mode || 'ESTABLISHED'}</span>
                            </div>
                            <div className="p-2 rounded bg-indigo-500/10 border border-indigo-500/20">
                                <div className="text-[9px] text-indigo-300 font-medium uppercase tracking-wider mb-1">Project Name</div>
                                <div className="text-xs text-white font-bold truncate">{config.projectName || 'PENDING_INITIALIZATION'}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className={`px-2 py-1.5 rounded border text-[9px] font-black uppercase text-center flex items-center justify-center gap-1 ${config.projectName ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                                    {config.projectName ? 'INITIALIZED' : 'LOCKED'}
                                </div>
                                <button 
                                    className="px-2 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[9px] font-black uppercase tracking-wider transition-all shadow-lg shadow-indigo-900/40 hover:scale-105 active:scale-95 flex items-center justify-center gap-1"
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        navigate('/projects', { state: { openProjectId: config.projectId } });
                                    }}
                                >
                                    <Folder size={10} /> LAUNCH
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Invoice Specifics */}
                    {type === 'invoiceNode' && (
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-medium">Contract Value</span>
                                <input 
                                    type="number"
                                    value={config.amount || 0}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        data.config = { ...config, amount: val };
                                    }}
                                    className="bg-black/40 border border-emerald-500/20 rounded px-2 py-0.5 w-24 text-emerald-400 font-mono font-bold text-right outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-medium">Client</span>
                                <span className="text-white font-bold truncate max-w-[120px]">{config.client || 'Unassigned'}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                                <div className="px-2 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-400 uppercase text-center flex items-center justify-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    {config.status || 'DRAFT'}
                                </div>
                                <button 
                                    className="px-2 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider transition-all shadow-lg shadow-emerald-900/40 hover:scale-105 active:scale-95 flex items-center justify-center gap-1"
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        navigate('/invoices', { 
                                            state: { 
                                                projectId: config.projectId, 
                                                projectName: config.projectName,
                                                clientId: config.clientId,
                                                clientName: config.clientName,
                                                autofill: true
                                            } 
                                        });
                                    }}
                                >
                                    <FileText size={10} /> VIEW
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Quote Specifics */}
                    {type === 'quoteNode' && (
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-medium">Est. Value</span>
                                <span className="text-indigo-400 font-mono font-bold">${config.value || '0.00'}</span>
                            </div>
                            <div className="p-2 rounded bg-indigo-500/10 border border-indigo-500/20">
                                <div className="text-[9px] text-indigo-300 font-medium uppercase tracking-wider mb-1">Target Project</div>
                                <div className="text-xs text-white font-bold truncate">{config.projectName || 'New Project'}</div>
                            </div>
                            <button 
                                className="w-full py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[9px] font-black uppercase tracking-wider transition-all shadow-lg shadow-indigo-900/40 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    navigate('/quotes/builder', { 
                                        state: { 
                                            projectId: config.projectId, 
                                            projectName: config.projectName,
                                            clientId: config.clientId,
                                            clientName: config.clientName
                                        } 
                                    });
                                }}
                            >
                                <Sparkles size={10} /> BUILD QUOTE
                            </button>
                        </div>
                    )}

                    {/* Diary Specifics */}
                    {type === 'diaryNode' && (
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-medium">Log Type</span>
                                <span className="text-cyan-400 font-bold uppercase">{config.logType || 'General'}</span>
                            </div>
                            <div className="p-2 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-2">
                                <Calendar size={12} className="text-cyan-400" />
                                <span className="text-[10px] text-cyan-100 font-medium">Auto-Entry Enabled</span>
                            </div>
                            <button 
                                className="w-full py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-[9px] font-black uppercase tracking-wider transition-all shadow-lg shadow-cyan-900/40 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    navigate('/diary', { 
                                        state: { 
                                            projectId: config.projectId,
                                            projectName: config.projectName,
                                            clientId: config.clientId,
                                            clientName: config.clientName
                                        } 
                                    });
                                }}
                            >
                                <BookOpen size={10} /> OPEN DIARY
                            </button>
                        </div>
                    )}

                    {/* Safety Specifics */}
                    {type === 'safetyNode' && (
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-medium">Lattice Protocol</span>
                                <span className="text-rose-400 font-bold truncate max-w-[100px]">{config.template || 'UNSET'}</span>
                            </div>
                            
                            {/* Document Suggestions */}
                            <div className="space-y-1.5 p-2 bg-rose-500/5 border border-rose-500/10 rounded-lg">
                                <p className="text-[8px] font-black text-rose-300 uppercase tracking-widest mb-1 flex items-center gap-1">
                                    <Sparkles size={8} /> Recommended for Phase
                                </p>
                                {['SWMS_Core', 'PreStart_Daily', 'Incident_Protocol'].map(doc => (
                                    <div key={doc} className="flex justify-between items-center text-[9px]">
                                        <span className="text-slate-400 font-mono">{doc}</span>
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500/30" />
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-1">
                                <button 
                                    className="px-2 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[9px] font-black uppercase tracking-wider transition-all shadow-lg shadow-rose-900/40 hover:scale-105 active:scale-95 flex items-center justify-center gap-1"
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        navigate('/safety', { 
                                            state: { 
                                                autoInitialize: true, 
                                                template: config.template,
                                                projectId: config.projectId,
                                                projectName: config.projectName
                                            } 
                                        });
                                    }}
                                >
                                    <Zap size={10} fill="currentColor" /> GENERATE
                                </button>
                                <button 
                                    className="px-2 py-1.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[9px] font-black uppercase tracking-wider hover:bg-slate-700 transition-all"
                                    onClick={(e) => { e.stopPropagation(); window.location.href = '/safety'; }}
                                >
                                    <ShieldCheck size={10} /> VAULT
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Resource Specifics */}
                    {type === 'resourceNode' && (
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-medium">Asset</span>
                                <span className="text-amber-400 font-bold truncate max-w-[100px]">{config.resourceType || 'General'}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-medium">Quantity</span>
                                <span className="text-white font-mono font-bold">x{config.quantity || 1}</span>
                            </div>
                            <button 
                                className="w-full py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider transition-all shadow-lg shadow-amber-900/40 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                                onClick={(e) => { e.stopPropagation(); window.location.href = '/resources'; }}
                            >
                                <Truck size={10} /> MANAGE FLEET
                            </button>
                        </div>
                    )}

                    {/* Forensic Specifics */}
                    {type === 'forensicNode' && (
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-medium">Audit Scope</span>
                                <span className="text-violet-400 font-bold truncate max-w-[100px]">{config.category || 'General'}</span>
                            </div>
                            <div className="px-2 py-1 rounded bg-violet-500/10 border border-violet-500/20 text-[8px] font-black text-violet-400 uppercase text-center animate-pulse">
                                Deep Scan Active ({config.sensitivity || 'Std'})
                            </div>
                            <button 
                                className="w-full py-1.5 rounded bg-violet-600 hover:bg-violet-500 text-white text-[9px] font-black uppercase tracking-wider transition-all shadow-lg shadow-violet-900/40 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                                onClick={(e) => { e.stopPropagation(); window.location.href = '/reports'; }}
                            >
                                <AlertTriangle size={10} /> RUN AUDIT
                            </button>
                        </div>
                    )}

                    {/* Delay Specifics (INLINE EDIT) */}
                    {type === 'delayNode' && (
                        <>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-medium">Wait Time</span>
                                <div className="flex items-center gap-1">
                                    <input 
                                        type="number"
                                        value={config.duration || 0}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            data.config = { ...config, duration: val };
                                        }}
                                        className="bg-black/40 border border-orange-500/20 rounded px-2 py-0.5 w-16 text-orange-400 font-mono font-bold text-right outline-none focus:border-orange-500"
                                    />
                                    <span className="text-[8px] text-slate-500">HRS</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <Clock size={12} className="text-orange-400 animate-spin-slow" />
                                <span className="text-[9px] text-orange-300 font-bold uppercase tracking-wide">
                                    {config.type || 'Standard'} Hold
                                </span>
                            </div>
                        </>
                    )}

                    {/* WORMHOLE SPECIFICS */}
                    {type === 'wormholeNode' && (
                        <div className="flex flex-col gap-3 relative overflow-hidden p-1">
                            {/* Portal Animation Background */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                                <div className="w-24 h-24 rounded-full border-2 border-fuchsia-500 border-dashed animate-spin-slow"></div>
                                <div className="absolute w-16 h-16 rounded-full border border-fuchsia-400 animate-ping opacity-20"></div>
                            </div>
                            
                            <div className="flex justify-between items-center text-xs relative z-10">
                                <span className="text-slate-400 font-medium">Target Zone</span>
                                <span className="text-fuchsia-400 font-black font-mono uppercase tracking-tight shadow-fuchsia-500/20 drop-shadow-sm">
                                    {config.targetWorkflow || 'UNLINKED'}
                                </span>
                            </div>
                            
                            <div className="relative z-10 grid grid-cols-2 gap-2">
                                <div className="px-2 py-1.5 rounded bg-black/40 border border-fuchsia-500/30 text-[9px] font-mono text-fuchsia-300 text-center">
                                    ID: {config.targetId ? config.targetId.slice(0,6) : 'NULL'}
                                </div>
                                <button 
                                    className="px-2 py-1.5 rounded bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-[9px] font-black uppercase tracking-wider transition-all shadow-lg shadow-fuchsia-900/40 hover:scale-105 active:scale-95 flex items-center justify-center gap-1"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if(config.targetId) window.location.href = `/workflow/${config.targetId}`;
                                    }}
                                >
                                    <Zap size={10} fill="currentColor" /> WARP
                                </button>
                            </div>

                            <div className="px-2 py-1 rounded bg-fuchsia-500/10 border border-fuchsia-500/20 text-[8px] font-black text-fuchsia-300 uppercase text-center animate-pulse">
                                Cross-Project Tunnel Active
                            </div>
                        </div>
                    )}

                    {/* MAP SPECIFICS */}
                    {type === 'mapNode' && (
                        <div className="flex flex-col gap-3 relative">
                            {/* Radar Scan Effect */}
                            <div className="absolute top-0 right-0 w-16 h-16 opacity-20 pointer-events-none overflow-hidden rounded-full border border-blue-400/30 bg-blue-900/20">
                                <div className="w-full h-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_270deg,#3b82f6_360deg)] animate-spin-slow rounded-full opacity-50"></div>
                            </div>

                            <div className="flex justify-between items-center text-xs pr-10">
                                <span className="text-slate-400 font-medium">Geofence Anchor</span>
                            </div>
                            <div className="text-blue-400 font-bold truncate text-sm">{config.locationName || 'Site Center'}</div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center gap-2 px-2 py-1.5 bg-black/40 rounded border border-blue-500/20">
                                    <MapPin size={12} className="text-blue-400" /> 
                                    <span className="text-[10px] font-mono text-slate-300">{config.radius || '50'}m</span>
                                </div>
                                <div className="flex items-center gap-2 px-2 py-1.5 bg-black/40 rounded border border-blue-500/20">
                                    <span className="text-[10px] font-mono text-slate-400">LAT: {config.lat ? parseFloat(config.lat).toFixed(4) : '---'}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CLIENT SPECIFICS */}
                    {type === 'clientNode' && (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3 bg-black/20 p-2 rounded-xl border border-indigo-500/10">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border border-white/20 shadow-lg shrink-0">
                                    <span className="text-xs font-black text-white">
                                        {config.clientName ? config.clientName.substring(0,2).toUpperCase() : 'CL'}
                                    </span>
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-xs font-bold text-white uppercase truncate">{config.clientName || 'Select Client'}</span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className={`text-[8px] px-1.5 rounded-full font-black uppercase ${config.tier === 'VIP' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-700 text-slate-400'}`}>
                                            {config.tier || 'Standard'}
                                        </span>
                                        <span className="text-[8px] text-slate-500 font-mono">ID: #{config.clientId || '000'}</span>
                                    </div>
                                </div>
                            </div>
                            <button className="w-full py-1.5 rounded bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-[9px] font-bold text-indigo-300 uppercase transition-colors flex items-center justify-center gap-2">
                                <User size={10} /> View Client Profile
                            </button>
                        </div>
                    )}

                    {/* VARIATION SPECIFICS */}
                    {type === 'variationNode' && (
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-medium">Net Variation</span>
                                <span className={`font-mono font-black text-sm px-2 py-0.5 rounded border ${
                                    (config.variationType === 'Credit' || !config.variationType) 
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                    : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                }`}>
                                    {config.variationType === 'Debit' ? '-' : '+'}${config.variationAmount || '0.00'}
                                </span>
                            </div>
                            
                            <div className="space-y-1">
                                <div className="flex justify-between text-[9px] uppercase font-bold text-slate-500">
                                    <span>Type</span>
                                    <span>{config.variationType || 'Credit'}</span>
                                </div>
                                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                                    <div className={`h-full w-full ${
                                        config.variationType === 'Debit' ? 'bg-rose-500' : 'bg-emerald-500'
                                    }`} style={{ width: '100%' }}></div>
                                </div>
                            </div>

                            <div className="px-2 py-1 rounded bg-slate-900 border border-white/5 text-[8px] font-medium text-slate-400 truncate italic">
                                "{config.reason || 'No description provided'}"
                            </div>
                        </div>
                    )}

                    {/* Propagation Visual (TIMELINE) */}
                    {config.calculatedStart !== undefined && (
                        <div className="pt-2 border-t border-white/5 mt-2 flex justify-between items-center">
                            <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Calculated Arrival</span>
                            <span className="text-[10px] font-mono font-bold text-white">T+{config.calculatedStart}H</span>
                        </div>
                    )}

                    {/* Generic Fallback */}
                    {(!['invoiceNode', 'safetyNode', 'resourceNode', 'forensicNode', 'delayNode', 'wormholeNode', 'mapNode', 'clientNode', 'variationNode'].includes(type) || data.description) && (
                        <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                            {data.description || 'No specific configuration set. Logic will proceed to next node.'}
                        </p>
                    )}
                </div>

                {/* Status Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                            status === 'completed' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 
                            status === 'in-progress' ? 'bg-amber-500 animate-pulse' : 'bg-slate-600'
                        }`} />
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{status}</span>
                    </div>
                    
                    <button 
                        onClick={handleAction}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider group/btn"
                    >
                        Launch <ExternalLink size={10} className="group-hover/btn:scale-110 transition-transform" />
                    </button>
                </div>

                {/* SIMULATION RESULT OVERLAY */}
                {simResult && (simResult.issues.length > 0 || simResult.suggestions.length > 0) && (
                    <div className="mt-4 pt-3 border-t border-white/10 animate-fade-in">
                        <div className="flex items-center gap-2 mb-2">
                            <Activity size={12} className="text-blue-400" />
                            <span className="text-[8px] font-black text-white uppercase tracking-widest">Diagnostic_Feedback</span>
                        </div>
                        
                        <div className="space-y-2">
                            {simResult.issues.map((issue, idx) => (
                                <div key={idx} className={`p-2 rounded-lg border text-[9px] font-bold flex gap-2 ${
                                    issue.level === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                }`}>
                                    <AlertTriangle size={12} className="shrink-0" />
                                    <span>{issue.message}</span>
                                </div>
                            ))}
                            {simResult.suggestions.map((sug, idx) => (
                                <div key={idx} className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[9px] font-bold flex gap-2">
                                    <Sparkles size={12} className="shrink-0" />
                                    <span>{sug.message}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
             </div>

             <Handle 
                type="source" 
                position={Position.Right} 
                className="!bg-slate-900 !w-4 !h-4 !border-[3px] !border-indigo-500/30 hover:!bg-indigo-400 transition-all z-50 cursor-crosshair shadow-lg" 
                style={{ right: 0, top: '50%', transform: 'translate(50%, -50%)' }}
             />
        </motion.div>
    );
});