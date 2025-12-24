import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
    CreditCard, ShieldCheck, Truck, BookOpen, FileText, 
    ArrowRight, MoreHorizontal, User, AlertTriangle, 
    DollarSign, HardHat, Calendar, ExternalLink, Zap, Sparkles, Clock, MapPin, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
        case 'variationNode': return <TrendingUp size={18} className="text-emerald-500" />;
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
            case 'variationNode': return 'border-emerald-600/50';
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
            case 'variationNode': return 'bg-emerald-600/10';
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
        case 'variationNode': return 'text-emerald-500';
        default: return 'text-slate-400';
    }
};

export default memo(({ data, type, selected }) => {
    const status = data.status || 'pending';
    const config = data.config || {};
    const forensicActive = data.forensicActive || false;

    // --- MASTERPIECE: NEURAL HEALTH (INTEGRATION SPECIFIC) ---
    const getHealth = () => {
        if (status === 'error' || data.simulationError) return 'broken';
        if (type === 'invoiceNode' && !config.amount) return 'incomplete';
        if (type === 'safetyNode' && !config.template) return 'incomplete';
        if (type === 'resourceNode' && !config.resourceType) return 'incomplete';
        if (!data.label || data.label.includes('Integration Node')) return 'warning';
        return 'optimized';
    };
    const health = getHealth();

    let baseClasses = "relative min-w-[320px] rounded-2xl border backdrop-blur-2xl transition-all duration-500 group hover:-translate-y-1 hover:shadow-2xl";
    
    // Status Logic
    let borderColor = IntegrationColor({ type, isBorder: true });
    let bgGradient = 'bg-gradient-to-b from-slate-900/95 to-black';
    
    // --- DYNAMIC HEALTH GLOWS ---
    const healthShadows = {
        optimized: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]',
        warning: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]',
        incomplete: 'shadow-[0_0_20px_rgba(59,130,246,0.2)]',
        broken: 'shadow-[0_0_30px_rgba(239,68,68,0.4)]'
    };
    let shadow = selected ? `shadow-[0_0_40px_rgba(99,102,241,0.3)]` : healthShadows[health];
    
    if (selected) {
        borderColor = 'border-white/40';
        bgGradient = 'bg-slate-900';
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
            quoteNode: '/quotes/builder'
        };
        if (urlMap[type]) window.open(urlMap[type], '_blank');
    };

    return (
        <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className={`${baseClasses} ${borderColor} ${bgGradient} ${shadow}`}
        >
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
                {/* Header Stripe */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${IntegrationColor({ type }).replace('text-', 'bg-')}`} />

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
                className="!bg-slate-900 !w-4 !h-4 !-left-2 !border-[3px] !border-white/20 hover:!bg-indigo-400 transition-all z-50 cursor-crosshair shadow-lg" 
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
                    
                    {/* Invoice Specifics */}
                    {type === 'invoiceNode' && (
                        <>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-medium">Amount</span>
                                <input 
                                    type="number"
                                    value={config.amount || 0}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        data.config = { ...config, amount: val };
                                        // Note: In memoized nodes we rely on the parent to update state via props
                                        // but for speed we can sometimes use local state or direct ref access if needed.
                                        // Here we assume the parent handles the re-render.
                                    }}
                                    className="bg-black/40 border border-emerald-500/20 rounded px-2 py-0.5 w-20 text-emerald-400 font-mono font-bold text-right outline-none focus:border-emerald-500"
                                />
                            </div>
                            <div className="flex justify-between items-center text-xs pt-1">
                                <span className="text-slate-400 font-medium">Client</span>
                                <span className="text-slate-200 font-bold truncate max-w-[120px]">{config.client || 'Unassigned'}</span>
                            </div>
                        </>
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
                                        className="bg-black/40 border border-orange-500/20 rounded px-2 py-0.5 w-16 text-orange-400 font-mono font-bold text-right outline-none focus:border-orange-500"
                                    />
                                    <span className="text-[8px] text-slate-500">HRS</span>
                                </div>
                            </div>
                            <div className="text-[9px] text-slate-500 uppercase font-bold mt-1 italic">
                                Logic Hold Type: {config.type || 'Standard'}
                            </div>
                        </>
                    )}

                    {/* WORMHOLE SPECIFICS */}
                    {type === 'wormholeNode' && (
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-medium">Target Logic</span>
                                <span className="text-fuchsia-400 font-bold uppercase tracking-tighter">{config.targetWorkflow || 'NOT_LINKED'}</span>
                            </div>
                            <div className="px-2 py-1 rounded bg-fuchsia-500/10 border border-fuchsia-500/20 text-[8px] font-black text-fuchsia-300 uppercase text-center animate-pulse">
                                Cross-Project Tunnel Active
                            </div>
                        </div>
                    )}

                    {/* MAP SPECIFICS */}
                    {type === 'mapNode' && (
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-medium">Geofence</span>
                                <span className="text-blue-400 font-bold truncate max-w-[120px]">{config.locationName || 'Site Center'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[9px] text-slate-500">
                                <MapPin size={10} /> {config.radius || '50'}m Activation Zone
                            </div>
                        </div>
                    )}

                    {/* CLIENT SPECIFICS */}
                    {type === 'clientNode' && (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                                    <User size={14} className="text-indigo-400" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-white uppercase">{config.clientName || 'Select Client'}</span>
                                    <span className="text-[8px] text-slate-500 font-black uppercase">{config.tier || 'Standard Tier'}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* VARIATION SPECIFICS */}
                    {type === 'variationNode' && (
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-medium">V-Amount</span>
                                <span className="text-emerald-400 font-mono font-bold">+${config.variationAmount || '0.00'}</span>
                            </div>
                            <div className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black text-emerald-400 uppercase text-center">
                                Financial Trust: Syncing
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
             </div>

             <Handle 
                type="source" 
                position={Position.Right} 
                className="!bg-slate-900 !w-4 !h-4 !-right-2 !border-[3px] !border-white/20 hover:!bg-indigo-400 transition-all z-50 cursor-crosshair shadow-lg" 
             />
        </motion.div>
    );
});