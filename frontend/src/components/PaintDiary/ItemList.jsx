import React, { useState, useEffect } from 'react';
import { 
    Edit2, Trash2, Box, User, Wrench, Package, Clock, DollarSign, ChevronDown, ChevronUp, Layers, 
    AlertTriangle, Zap, CheckCircle2, Plus, Minus, FileText, ArrowRight, Calculator
} from 'lucide-react';
import { useDiaryTheme } from './ThemeContext';

const ItemList = ({ items, onUpdate, onRemove, overtimeThreshold = 8 }) => {
    const [expandedId, setExpandedId] = useState(null);
    const { theme } = useDiaryTheme();

    if (!items || items.length === 0) return null;

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const getAccentColor = (type) => {
        if (type === 'staff') return theme.primary === 'emerald' ? 'emerald' : theme.primary;
        if (type === 'equipment') return 'amber';
        return 'indigo';
    };

    const getTypeTheme = (type) => {
        const color = getAccentColor(type);
        return {
            bg: `from-${color}-600/20 via-${color}-900/10 to-black`,
            border: `border-${color}-500/30`,
            icon: `text-${color}-400`,
            iconBg: `bg-${color}-500/20`,
            accent: `text-${color}-200`
        };
    };

    const getTypeIcon = (type) => {
        if (type === 'staff') return <User size={18} />;
        if (type === 'equipment') return <Wrench size={18} />;
        return <Package size={18} />;
    };

    // Helper to calc duration and OT breakdown for reactive updates
    const handleTimeUpdate = (id, startTime, finishTime, currentItem) => {
        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${finishTime}`);
        let diff = (end - start) / (1000 * 60 * 60);
        if (diff < 0) diff += 24; 
        
        const hours = parseFloat(diff.toFixed(2));
        onUpdate(id, { startTime, finishTime, quantity: hours, duration: hours });
    };

    return (
        <div className={`mt-8 bg-[#0a0a0c] border ${theme.border} rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden`}>
            <div className={`absolute inset-0 bg-gradient-to-b from-${theme.primary}-900/10 to-transparent pointer-events-none`} />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
                <h3 className="text-2xl font-black text-white flex items-center gap-4 tracking-tighter uppercase">
                    <div className={`p-2.5 bg-${theme.primary}-500/20 rounded-xl border ${theme.border}`}>
                        <Layers size={24} className={theme.text} />
                    </div>
                    Diary Manifest <span className={`${theme.text} opacity-30 text-lg ml-2`}>{items.length}</span>
                </h3>
                
                <div className="flex gap-2">
                   {/* Potential for bulk actions here */}
                </div>
            </div>

            <div className="space-y-4 relative z-10">
                {items.map((item, index) => {
                    const itemTheme = getTypeTheme(item.type);
                    const accentColor = getAccentColor(item.type);
                    const isExpanded = expandedId === item.id;
                    const revenue = (parseFloat(item.chargeRate) || 0) * (parseFloat(item.quantity) || 0);
                    const cost = (parseFloat(item.costRate) || 0) * (parseFloat(item.quantity) || 0);
                    const margin = revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0;

                    // Overtime Calc
                    let otBreakdown = { reg: 0, ot1: 0, ot2: 0 };
                    if (item.type === 'staff' && item.quantity > overtimeThreshold) {
                        const qty = parseFloat(item.quantity);
                        const reg = Math.min(qty, overtimeThreshold);
                        const remainder = Math.max(0, qty - overtimeThreshold);
                        const ot1 = Math.min(remainder, 2);
                        const ot2 = Math.max(0, remainder - 2);
                        otBreakdown = { reg, ot1, ot2 };
                    }

                    return (
                        <div 
                            key={item.id || index} 
                            className={`
                                relative rounded-3xl transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] border backdrop-blur-3xl overflow-hidden group/item
                                ${isExpanded ? `bg-gradient-to-br ${itemTheme.bg} ${itemTheme.border} shadow-[0_20px_50px_rgba(0,0,0,0.5)] scale-[1.01] z-20` : `bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10`}
                            `}
                        >
                            {/* Header Row */}
                            <div 
                                className="flex items-center p-6 cursor-pointer relative z-10"
                                onClick={() => toggleExpand(item.id)}
                            >
                                <div className={`p-4 rounded-2xl mr-6 shadow-2xl ${itemTheme.iconBg} ${itemTheme.icon} ring-1 ring-white/10 transition-transform group-hover/item:scale-110 duration-500`}>
                                    {getTypeIcon(item.type)}
                                </div>
                                
                                <div className="flex-1 min-w-0 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                                    <div className="lg:col-span-4">
                                        <div className={`text-lg font-black text-white truncate tracking-tight uppercase group-hover/item:text-${accentColor}-400 transition-colors`}>{item.name}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${itemTheme.accent} opacity-60`}>{item.type}</span>
                                            {item.startTime && (
                                                <span className="text-[9px] font-mono font-bold text-white/40 border-l border-white/10 pl-2">
                                                    {item.startTime} - {item.finishTime}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="lg:col-span-3 flex items-center gap-4">
                                        <div className="bg-black/40 px-4 py-2 rounded-xl border border-white/5 flex items-center gap-3 shadow-inner">
                                            <Clock size={14} className={`${itemTheme.icon} opacity-50`} />
                                            <span className="text-sm font-mono font-black text-white">
                                                {item.type === 'staff' || item.type === 'equipment' ? 
                                                    `${item.quantity}H` : 
                                                    `${item.quantity} UNITS`}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-5 flex items-center justify-end gap-10">
                                        <div className="text-right">
                                            <div className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Financial Yield</div>
                                            <div className="flex items-center gap-3 justify-end">
                                                <div className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${margin > 20 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                                    {margin.toFixed(0)}%
                                                </div>
                                                <div className="text-xl font-mono font-black text-white tracking-tighter">
                                                    ${revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 ml-10">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); toggleExpand(item.id); }}
                                        className={`p-3 rounded-xl transition-all duration-500 border ${isExpanded ? `bg-white/10 border-white/20 text-white rotate-180` : 'bg-black/20 border-white/5 text-white/30 hover:text-white hover:border-white/20'}`}
                                    >
                                        <ChevronDown size={20} />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); if(confirm('Remove this line item?')) onRemove(item.id); }}
                                        className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500/40 hover:text-rose-400 hover:bg-rose-500/20 transition-all active:scale-90"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Expanded Edit Panel - FULLY EDITABLE */}
                            {isExpanded && (
                                <div className="p-8 bg-black/40 border-t border-white/10 grid grid-cols-1 md:grid-cols-4 gap-8 animate-in slide-in-from-top-4 duration-500 relative z-10">
                                    
                                    {/* Primary Details */}
                                    <div className="md:col-span-2 space-y-6">
                                        <div>
                                            <label className="text-[10px] font-black text-white/40 uppercase mb-3 block tracking-widest flex items-center gap-2"><Edit2 size={12}/> Item Identity</label>
                                            <input 
                                                type="text" 
                                                value={item.name} 
                                                onChange={(e) => onUpdate(item.id, { name: e.target.value })} 
                                                className={`w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold text-lg focus:border-${accentColor}-500 outline-none transition-all shadow-inner focus:bg-white/10`}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black text-white/40 uppercase mb-3 block tracking-widest flex items-center gap-2"><Clock size={12}/> Start</label>
                                                <input 
                                                    type="time" 
                                                    value={item.startTime || '07:00'} 
                                                    onChange={(e) => handleTimeUpdate(item.id, e.target.value, item.finishTime || '15:00', item)} 
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-mono font-bold text-lg focus:border-indigo-500 outline-none text-center"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-white/40 uppercase mb-3 block tracking-widest flex items-center gap-2"><Clock size={12}/> Finish</label>
                                                <input 
                                                    type="time" 
                                                    value={item.finishTime || '15:00'} 
                                                    onChange={(e) => handleTimeUpdate(item.id, item.startTime || '07:00', e.target.value, item)} 
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-mono font-bold text-lg focus:border-indigo-500 outline-none text-center"
                                                />
                                            </div>
                                        </div>

                                        {/* LIVE OVERTIME MONITOR */}
                                        {item.type === 'staff' && item.quantity > overtimeThreshold && (
                                            <div className="bg-black/40 border border-amber-500/20 rounded-2xl p-4 animate-in fade-in zoom-in-95">
                                                <div className="flex justify-between items-end mb-3">
                                                    <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                                                        <Zap size={12} className="animate-pulse" /> Live Overtime Monitor
                                                    </div>
                                                    <div className="text-[10px] font-mono text-white/40">
                                                        Threshold: {overtimeThreshold}h
                                                    </div>
                                                </div>
                                                
                                                <div className="flex h-3 rounded-full overflow-hidden bg-black/60 mb-3 border border-white/5">
                                                    <div style={{ width: `${(otBreakdown.reg / item.quantity) * 100}%` }} className="bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                                    <div style={{ width: `${(otBreakdown.ot1 / item.quantity) * 100}%` }} className="bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                                                    <div style={{ width: `${(otBreakdown.ot2 / item.quantity) * 100}%` }} className="bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                                                </div>

                                                <div className="grid grid-cols-3 gap-2 text-[9px] font-bold uppercase tracking-wider mb-3">
                                                    <div className="text-emerald-500 flex flex-col">
                                                        <span>Base ({otBreakdown.reg}h)</span>
                                                        <span className="opacity-50 text-[8px]">${(otBreakdown.reg * item.costRate).toFixed(0)}</span>
                                                    </div>
                                                    {otBreakdown.ot1 > 0 && (
                                                        <div className="text-amber-500 flex flex-col text-center">
                                                            <span>1.5x ({otBreakdown.ot1}h)</span>
                                                            <span className="opacity-50 text-[8px]">${(otBreakdown.ot1 * item.costRate * 1.5).toFixed(0)}</span>
                                                        </div>
                                                    )}
                                                    {otBreakdown.ot2 > 0 && (
                                                        <div className="text-rose-500 flex flex-col text-right">
                                                            <span>2.0x ({otBreakdown.ot2}h)</span>
                                                            <span className="opacity-50 text-[8px]">${(otBreakdown.ot2 * item.costRate * 2.0).toFixed(0)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                                                    <span className="text-[9px] font-black text-white/30 uppercase">Penalty Impact</span>
                                                    <span className="text-xs font-mono font-bold text-amber-400">
                                                        +${((otBreakdown.ot1 * item.costRate * 0.5) + (otBreakdown.ot2 * item.costRate * 1.0)).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Financial Controls */}
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[10px] font-black text-white/40 uppercase mb-3 block tracking-widest flex items-center gap-2"><Calculator size={12}/> Quantity / H</label>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => onUpdate(item.id, { quantity: Math.max(0, (item.quantity || 0) - 0.5), duration: Math.max(0, (item.quantity || 0) - 0.5) })} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 text-white/50 hover:text-white"><Minus size={16}/></button>
                                                <input 
                                                    type="number" 
                                                    value={item.quantity} 
                                                    onChange={(e) => onUpdate(item.id, { quantity: parseFloat(e.target.value) || 0, duration: parseFloat(e.target.value) || 0 })} 
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 text-white font-mono font-black text-xl text-center focus:border-indigo-500 outline-none"
                                                />
                                                <button onClick={() => onUpdate(item.id, { quantity: (item.quantity || 0) + 0.5, duration: (item.quantity || 0) + 0.5 })} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 text-white/50 hover:text-white"><Plus size={16}/></button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[9px] font-black text-white/30 uppercase">Pay Rate</span>
                                                    <span className="text-xs font-mono font-bold text-white">${item.costRate}</span>
                                                </div>
                                                <input 
                                                    type="range" min="0" max="200" step="1"
                                                    value={item.costRate} 
                                                    onChange={(e) => onUpdate(item.id, { costRate: parseFloat(e.target.value) })}
                                                    className="w-full accent-indigo-500"
                                                />
                                            </div>
                                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[9px] font-black text-emerald-500/50 uppercase tracking-widest">Charge Rate</span>
                                                    <span className="text-xs font-mono font-bold text-emerald-400">${item.chargeRate}</span>
                                                </div>
                                                <input 
                                                    type="range" min="0" max="300" step="1"
                                                    value={item.chargeRate} 
                                                    onChange={(e) => onUpdate(item.id, { chargeRate: parseFloat(e.target.value) })}
                                                    className={`w-full accent-${accentColor}-500`}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Staff/Meta Section */}
                                    <div className="space-y-6">
                                        {item.type === 'staff' && (
                                            <div className="bg-indigo-500/5 p-5 rounded-[2rem] border border-indigo-500/20 shadow-inner">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Zap size={14} className="text-indigo-400" />
                                                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">Active Allowances</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {item.availableAllowances?.map((al, idx) => {
                                                        const isActive = item.activeAllowances?.find(a => a.name === al.name);
                                                        return (
                                                            <button 
                                                                key={idx}
                                                                onClick={() => {
                                                                    const newAl = isActive ? 
                                                                        item.activeAllowances.filter(a => a.name !== al.name) : 
                                                                        [...(item.activeAllowances || []), al];
                                                                    onUpdate(item.id, { activeAllowances: newAl });
                                                                }}
                                                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all border ${isActive ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-black/40 border-white/10 text-white/30 hover:text-white'}`}
                                                            >
                                                                {al.name}
                                                            </button>
                                                        );
                                                    })}
                                                    {(!item.availableAllowances || item.availableAllowances.length === 0) && (
                                                        <span className="text-[10px] font-bold text-white/20 uppercase">None Available</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <label className="text-[10px] font-black text-white/40 uppercase mb-3 block tracking-widest flex items-center gap-2"><FileText size={12}/> Internal Log</label>
                                            <textarea 
                                                value={item.note || ''} 
                                                onChange={(e) => onUpdate(item.id, { note: e.target.value })} 
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:border-indigo-500 outline-none resize-none h-32 focus:bg-white/10 transition-all"
                                                placeholder="Add context or site notes..."
                                            />
                                        </div>
                                    </div>

                                    {/* Live Save Badge */}
                                    <div className="md:col-span-4 border-t border-white/5 pt-6 flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">
                                            <CheckCircle2 size={12} className="text-emerald-500 opacity-50" /> Live Sync Active
                                        </div>
                                        <div className="flex gap-4">
                                            <button 
                                                onClick={() => setExpandedId(null)}
                                                className={`px-8 py-3 ${theme.button} text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-xl active:scale-95`}
                                            >
                                                Done Editing
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ItemList;