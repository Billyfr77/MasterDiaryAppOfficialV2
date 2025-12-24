import React, { useState, useEffect } from 'react';
import { X, Clock, DollarSign, FileText, Calendar, ArrowRight, TrendingUp, Calculator, User, Wrench, Package, AlertTriangle, Zap, CheckCircle2, ChevronUp, ChevronDown, Plus, Minus, ClipboardList } from 'lucide-react';

const ItemDetailsModal = ({ isOpen, onClose, onConfirm, item, overtimeThreshold = 8 }) => {
    const [quantity, setQuantity] = useState(1);
    const [plannedHours, setPlannedHours] = useState(8);
    const [name, setName] = useState("");
    const [startTime, setStartTime] = useState("07:00");
    const [finishTime, setFinishTime] = useState("15:00");
    const [notes, setNotes] = useState("");
    const [activeAllowances, setActiveAllowances] = useState([]);
    
    // Costings
    const [costRate, setCostRate] = useState(0);
    const [chargeRate, setChargeRate] = useState(0);
    
    const [showCostings, setShowCostings] = useState(false);

    useEffect(() => {
        if (item) {
            if (item.type === 'photoNode') {
                handleConfirm(); // Auto-confirm for photos if needed, or handle differently
                return;
            }
            setQuantity(item.quantity || (item.type === 'staff' ? 8 : 1));
            setPlannedHours(item.plannedHours || 8);
            setName(item.name || item.label || "");
            setCostRate(item.costRate || 0);
            setChargeRate(item.chargeRate || (item.costRate * 1.2) || 0);
            if (item.startTime) setStartTime(item.startTime);
            if (item.finishTime) setFinishTime(item.finishTime);
            setActiveAllowances(item.activeAllowances || []);
        }
    }, [item]);

    // Auto-calc hours from time & Overtime Logic
    const [breakdown, setBreakdown] = useState({ reg: 0, ot1: 0, ot2: 0 });
    
    useEffect(() => {
        if (item?.type === 'staff' || item?.type === 'equipment' || item?.type === 'chronos') {
            const start = new Date(`2000-01-01T${startTime}`);
            const end = new Date(`2000-01-01T${finishTime}`);
            let diff = (end - start) / (1000 * 60 * 60);
            if (diff < 0) diff += 24; // Handle overnight
            
            const hours = parseFloat(diff.toFixed(2));
            setQuantity(hours);

            // OT Calc for display
            if (item.type === 'staff') {
                const reg = Math.min(hours, overtimeThreshold);
                const remainder = Math.max(0, hours - overtimeThreshold);
                const ot1 = Math.min(remainder, 2); // First 2 hours OT
                const ot2 = Math.max(0, remainder - 2); // Rest is Double Time
                setBreakdown({ reg, ot1, ot2 });
            }
        }
    }, [startTime, finishTime, item, overtimeThreshold]);

    if (!isOpen || !item) return null;

    const handleConfirm = () => {
        onConfirm({
            ...item,
            name,
            label: name,
            quantity: parseFloat(quantity),
            duration: parseFloat(quantity), 
            plannedHours: parseFloat(plannedHours),
            startTime,
            finishTime,
            note: notes,
            activeAllowances,
            costRate: parseFloat(costRate),
            chargeRate: parseFloat(chargeRate)
        });
        onClose();
    };

    const isTimeBased = item.type === 'staff' || item.type === 'equipment' || item.type === 'chronos';
    const isTask = item.type === 'taskNode';
    const isMaterial = item.type === 'material';

    // Theme Logic
    const theme = item.type === 'staff' ? { color: 'emerald', icon: <User /> } :
                 item.type === 'equipment' ? { color: 'amber', icon: <Wrench /> } :
                 item.type === 'chronos' ? { color: 'cyan', icon: <Clock /> } :
                 item.type === 'delay' ? { color: 'rose', icon: <AlertTriangle /> } :
                 item.type === 'taskNode' ? { color: 'indigo', icon: <ClipboardList /> } :
                 { color: 'indigo', icon: <Package /> };

    const colorClasses = {
        emerald: 'from-emerald-600/20 to-teal-900/20 border-emerald-500/30 text-emerald-400',
        amber: 'from-amber-600/20 to-orange-900/20 border-amber-500/30 text-amber-400',
        cyan: 'from-cyan-600/20 to-blue-900/20 border-cyan-500/30 text-cyan-400',
        rose: 'from-rose-600/20 to-red-900/20 border-rose-500/30 text-rose-400',
        indigo: 'from-indigo-600/20 to-violet-900/20 border-indigo-500/30 text-indigo-400',
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-in fade-in duration-200">
            <div className="bg-[#0a0a0c] border border-white/10 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300 group">
                {/* Ambient Glow */}
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-${theme.color}-500/20 blur-[100px] pointer-events-none`} />

                {/* Header */}
                <div className="relative p-8 pb-4 flex justify-between items-start z-10">
                    <div className="flex items-center gap-4 flex-1">
                        <div className={`p-4 rounded-2xl bg-gradient-to-br ${colorClasses[theme.color]} shadow-lg`}>
                            {React.cloneElement(theme.icon, { size: 24, strokeWidth: 2.5 })}
                        </div>
                        <div className="flex-1">
                            <div className={`text-[10px] font-black uppercase tracking-[0.2em] text-${theme.color}-500 mb-1`}>
                                {isTask ? 'Configure Task' : 'New Entry'}
                            </div>
                            <input 
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full bg-transparent text-2xl font-black text-white uppercase tracking-tight leading-none outline-none focus:text-indigo-400 transition-colors"
                                placeholder="Item Name"
                            />
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/5 ml-4">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>
                
                <div className="p-8 pt-2 space-y-6 relative z-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    
                    {/* --- DYNAMIC INPUT SECTION --- */}
                    {isTask ? (
                        <div className="space-y-4">
                            <div className="bg-black/40 border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center h-32 relative overflow-hidden group/input focus-within:border-indigo-500/50">
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-2">Planned Target (Hrs)</label>
                                <input 
                                    type="number" 
                                    value={plannedHours} 
                                    onChange={e => setPlannedHours(parseFloat(e.target.value))} 
                                    className="w-full bg-transparent text-white font-mono text-5xl font-black text-center outline-none z-10"
                                />
                                <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-focus-within/input:opacity-100 transition-opacity pointer-events-none" />
                            </div>
                            <p className="text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest">Set the estimated time required for this task</p>
                        </div>
                    ) : isTimeBased ? (
                        <div className="space-y-4">
                            {/* Time Visualizer Bar */}
                            <div className="h-12 bg-black/40 rounded-xl border border-white/5 flex items-center px-4 relative overflow-hidden">
                                {/* Day Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-orange-500/10 to-blue-900/20 opacity-30" />
                                
                                {/* Active Time Segment */}
                                <div className="relative flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full bg-gradient-to-r from-${theme.color}-600 to-${theme.color}-400 shadow-[0_0_20px_rgba(var(--${theme.color}-500),0.5)]`} 
                                        style={{ width: '100%' }} // Simplified for demo, could be calculated based on % of day
                                    />
                                </div>
                                <div className="ml-4 font-mono font-black text-xl text-white flex items-center gap-1">
                                    {quantity}<span className="text-xs text-gray-500 align-top mt-1">H</span>
                                </div>
                            </div>

                            {/* Time Inputs */}
                            <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                                <div className="bg-white/5 border border-white/5 rounded-2xl p-3 text-center hover:border-white/20 transition-all group/input focus-within:border-indigo-500 focus-within:bg-white/10">
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 block group-focus-within/input:text-indigo-400">Start Time</label>
                                    <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-transparent text-white font-mono font-bold text-xl text-center outline-none" />
                                </div>
                                
                                <ArrowRight size={20} className="text-white/20" />
                                
                                <div className="bg-white/5 border border-white/5 rounded-2xl p-3 text-center hover:border-white/20 transition-all group/input focus-within:border-indigo-500 focus-within:bg-white/10">
                                    <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 block group-focus-within/input:text-indigo-400">Finish Time</label>
                                    <input type="time" value={finishTime} onChange={e => setFinishTime(e.target.value)} className="w-full bg-transparent text-white font-mono font-bold text-xl text-center outline-none" />
                                </div>
                            </div>

                            {/* OVERTIME BREAKDOWN - AUTO CALCULATED */}
                            {item.type === 'staff' && quantity > overtimeThreshold && (
                                <div className="bg-stone-900/80 p-4 rounded-2xl border border-white/5 animate-in slide-in-from-top-2">
                                    <div className="flex justify-between items-end mb-3">
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <Zap size={12} className="text-amber-400" /> Overtime Detected
                                        </div>
                                        <div className="text-xs font-mono text-gray-500">
                                            Threshold: {overtimeThreshold}h
                                        </div>
                                    </div>
                                    
                                    <div className="flex h-3 rounded-full overflow-hidden bg-black mb-2">
                                        <div style={{ width: `${(breakdown.reg / quantity) * 100}%` }} className="bg-emerald-500" title={`Regular: ${breakdown.reg}h`} />
                                        <div style={{ width: `${(breakdown.ot1 / quantity) * 100}%` }} className="bg-amber-500" title={`1.5x: ${breakdown.ot1}h`} />
                                        <div style={{ width: `${(breakdown.ot2 / quantity) * 100}%` }} className="bg-rose-500" title={`2.0x: ${breakdown.ot2}h`} />
                                    </div>

                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                                        <span className="text-emerald-500">{breakdown.reg}h Normal</span>
                                        {breakdown.ot1 > 0 && <span className="text-amber-500">{breakdown.ot1}h (1.5x)</span>}
                                        {breakdown.ot2 > 0 && <span className="text-rose-500">{breakdown.ot2}h (2.0x)</span>}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                             {/* Massive Quantity Input */}
                            <div className="flex items-center gap-4">
                                <button onClick={() => setQuantity(Math.max(0.5, quantity - 0.5))} className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all active:scale-95">
                                    <Minus size={24} />
                                </button>
                                <div className="flex-1 bg-black/40 border border-white/10 rounded-3xl p-4 flex flex-col items-center justify-center h-24 relative overflow-hidden group/input focus-within:border-indigo-500/50">
                                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Quantity / Units</label>
                                    <input 
                                        type="number" 
                                        value={quantity} 
                                        onChange={e => setQuantity(parseFloat(e.target.value))} 
                                        className="w-full bg-transparent text-white font-mono text-4xl font-black text-center outline-none z-10"
                                    />
                                    <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-focus-within/input:opacity-100 transition-opacity pointer-events-none" />
                                </div>
                                <button onClick={() => setQuantity(quantity + 0.5)} className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-all active:scale-95">
                                    <Plus size={24} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Financials Toggle */}
                    {item.type !== 'chronos' && item.type !== 'delay' && (
                        <div className="bg-black/20 rounded-2xl border border-white/5 overflow-hidden">
                            <button 
                                onClick={() => setShowCostings(!showCostings)}
                                className="w-full p-4 flex justify-between items-center hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-1.5 rounded-lg ${showCostings ? 'bg-indigo-500 text-white' : 'bg-white/5 text-gray-500'}`}>
                                        <DollarSign size={16} />
                                    </div>
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Financials</span>
                                </div>
                                {showCostings ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                            </button>
                            
                            {showCostings && (
                                <div className="p-4 pt-0 grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                        <label className="text-[9px] font-bold text-gray-500 uppercase mb-1 block">Unit Cost</label>
                                        <div className="flex items-center gap-1 text-white font-mono text-sm">
                                            <span className="text-gray-600">$</span>
                                            <input type="number" value={costRate} onChange={e => setCostRate(e.target.value)} className="bg-transparent outline-none w-full font-bold" />
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                        <label className="text-[9px] font-bold text-gray-500 uppercase mb-1 block">Charge Rate</label>
                                        <div className="flex items-center gap-1 text-emerald-400 font-mono text-sm">
                                            <span className="text-emerald-700">$</span>
                                            <input type="number" value={chargeRate} onChange={e => setChargeRate(e.target.value)} className="bg-transparent outline-none w-full font-bold" />
                                        </div>
                                    </div>
                                    <div className="col-span-2 flex justify-between items-center px-2">
                                        <span className="text-[10px] font-bold text-gray-600 uppercase">Projected Margin</span>
                                        <span className={`text-xs font-mono font-black ${chargeRate > costRate ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {costRate > 0 ? Math.round(((chargeRate - costRate) / costRate) * 100) : 0}%
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Allowances Selection */}
                    {item.type === 'staff' && item.availableAllowances?.length > 0 && (
                        <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                            <h4 className="text-[10px] font-black text-amber-500 uppercase flex items-center gap-2 mb-3 tracking-widest">
                                <Plus size={12} /> Allowances
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {item.availableAllowances.map((al, idx) => {
                                    const isActive = activeAllowances.find(a => a.name === al.name);
                                    return (
                                        <button 
                                            key={idx} 
                                            onClick={() => {
                                                if (isActive) setActiveAllowances(activeAllowances.filter(a => a.name !== al.name));
                                                else setActiveAllowances([...activeAllowances, al]);
                                            }}
                                            className={`px-3 py-2 rounded-xl border text-[10px] font-bold uppercase transition-all flex items-center gap-2 ${
                                                isActive ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20 hover:text-white'
                                            }`}
                                        >
                                            {al.name}
                                            <span className="opacity-50 border-l border-current pl-2 ml-1">${al.rate}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    <div className="bg-black/20 rounded-2xl border border-white/5 p-1">
                        <textarea 
                            value={notes} 
                            onChange={e => setNotes(e.target.value)} 
                            className="w-full bg-transparent border-none rounded-xl px-4 py-3 text-white text-sm focus:ring-0 outline-none resize-none h-20 placeholder-gray-700 font-medium"
                            placeholder="Add specific details or notes..."
                        />
                    </div>

                    <button 
                        onClick={handleConfirm}
                        className={`w-full py-4 bg-gradient-to-r ${colorClasses[theme.color].split(' ')[0]} to-${theme.color}-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg shadow-${theme.color}-900/40 transition-all transform active:scale-95 flex items-center justify-center gap-3 border border-white/10 hover:brightness-110`}
                    >
                        <CheckCircle2 size={20} />
                        Confirm Entry
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ItemDetailsModal;