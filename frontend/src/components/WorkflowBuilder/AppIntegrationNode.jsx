import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
    CreditCard, ShieldCheck, Truck, BookOpen, FileText, 
    ArrowRight, MoreHorizontal, User, AlertTriangle, 
    DollarSign, HardHat, Calendar, ExternalLink, Zap, Sparkles, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

const IntegrationIcon = ({ type }) => {
    switch (type) {
        case 'invoiceNode': return <CreditCard size={18} className="text-emerald-400" />;
        case 'safetyNode': return <ShieldCheck size={18} className="text-rose-400" />;
        case 'resourceNode': return <Truck size={18} className="text-amber-400" />;
        case 'diaryNode': return <BookOpen size={18} className="text-cyan-400" />;
        case 'quoteNode': return <FileText size={18} className="text-indigo-400" />;
        case 'forensicNode': return <AlertTriangle size={18} className="text-violet-400" />;
        case 'delayNode': return <Clock size={18} className="text-orange-400" />;
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
        default: return 'text-slate-400';
    }
};

export default memo(({ data, type, selected }) => {
    const status = data.status || 'pending';
    const config = data.config || {};
    const forensicActive = data.forensicActive || false;

    let baseClasses = "relative min-w-[320px] rounded-2xl border backdrop-blur-2xl transition-all duration-300 group hover:-translate-y-1 hover:shadow-2xl";
    
    // Status Logic
    let borderColor = IntegrationColor({ type, isBorder: true });
    let bgGradient = 'bg-gradient-to-b from-slate-900/95 to-black';
    let shadow = selected ? `shadow-[0_0_40px_rgba(99,102,241,0.3)]` : 'shadow-lg shadow-black/50';
    
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

                {/* Specific Data Display */}
                <div className="space-y-3 bg-white/5 rounded-xl p-3 border border-white/5 mb-4">
                    
                    {/* Invoice Specifics */}
                    {type === 'invoiceNode' && (
                        <>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-medium">Amount</span>
                                <span className="text-emerald-400 font-mono font-bold">${config.amount || '0.00'}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-medium">Client</span>
                                <span className="text-slate-200 font-bold truncate max-w-[120px]">{config.client || 'Unassigned'}</span>
                            </div>
                        </>
                    )}

                    {/* Safety Specifics */}
                    {type === 'safetyNode' && (
                        <>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-medium">Template</span>
                                <span className="text-slate-200 font-bold truncate max-w-[140px]">{config.template || 'Standard SWMS'}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-black uppercase border border-rose-500/30">
                                    Risk Level: {config.riskLevel || 'High'}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Resource Specifics */}
                    {type === 'resourceNode' && (
                         <>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-medium">Resource</span>
                                <span className="text-slate-200 font-bold">{config.resourceType || 'General Staff'}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-medium">Quantity</span>
                                <span className="text-amber-400 font-mono font-bold">x{config.quantity || '1'}</span>
                            </div>
                        </>
                    )}

                    {/* Forensic Specifics */}
                    {type === 'forensicNode' && (
                        <>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-medium">Audit Category</span>
                                <span className="text-violet-400 font-bold">{config.category || 'Financial Risk'}</span>
                            </div>
                            <div className="px-2 py-1 rounded bg-violet-500/10 border border-violet-500/20 text-[9px] font-black text-violet-300 uppercase mt-1">
                                Sensitivity: {config.sensitivity || 'High'}
                            </div>
                        </>
                    )}

                    {/* Delay Specifics */}
                    {type === 'delayNode' && (
                        <>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-medium">Duration</span>
                                <span className="text-orange-400 font-mono font-bold">{config.duration || '24'} Hours</span>
                            </div>
                            <div className="text-[9px] text-slate-500 uppercase font-bold mt-1 italic">
                                Logic Hold Type: {config.type || 'Standard'}
                            </div>
                        </>
                    )}

                    {/* Generic Fallback or Description */}
                    {(!['invoiceNode', 'safetyNode', 'resourceNode', 'forensicNode', 'delayNode'].includes(type) || data.description) && (
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