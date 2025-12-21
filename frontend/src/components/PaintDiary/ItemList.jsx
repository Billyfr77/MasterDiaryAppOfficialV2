import React, { useState } from 'react';
import { Edit2, Trash2, Box, User, Wrench, Package, Clock, DollarSign, ChevronDown, ChevronUp, Layers } from 'lucide-react';

const ItemList = ({ items, onUpdate, onRemove }) => {
    const [expandedId, setExpandedId] = useState(null);

    if (!items || items.length === 0) return null;

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const getTheme = (type) => {
        if (type === 'staff') return {
            bg: "from-emerald-900/40 to-teal-900/40",
            border: "border-emerald-500/30",
            glow: "shadow-emerald-500/20",
            icon: "text-emerald-400",
            iconBg: "bg-emerald-500/20",
            accent: "text-emerald-200"
        };
        if (type === 'equipment') return {
            bg: "from-amber-900/40 to-orange-900/40",
            border: "border-amber-500/30",
            glow: "shadow-amber-500/20",
            icon: "text-amber-400",
            iconBg: "bg-amber-500/20",
            accent: "text-amber-200"
        };
        return {
            bg: "from-indigo-900/40 to-violet-900/40",
            border: "border-indigo-500/30",
            glow: "shadow-indigo-500/20",
            icon: "text-indigo-400",
            iconBg: "bg-indigo-500/20",
            accent: "text-indigo-200"
        };
    };

    const getTypeIcon = (type) => {
        if (type === 'staff') return <User size={18} />;
        if (type === 'equipment') return <Wrench size={18} />;
        return <Package size={18} />;
    };

    return (
        <div className="mt-8 bg-[#0a0a0c] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none" />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
                <h3 className="text-xl font-black text-white flex items-center gap-3 tracking-[0.2em] uppercase">
                    <Layers size={24} className="text-indigo-500" />
                    Diary Manifest <span className="text-white/30 text-sm">({items.length})</span>
                </h3>
            </div>

            <div className="space-y-4 relative z-10">
                {items.map((item, index) => {
                    const theme = getTheme(item.type);
                    const isExpanded = expandedId === item.id;

                    return (
                        <div 
                            key={item.id || index} 
                            className={`
                                relative rounded-2xl transition-all duration-500 ease-out border backdrop-blur-md overflow-hidden
                                ${isExpanded ? `bg-gradient-to-br ${theme.bg} ${theme.border} shadow-lg scale-[1.02] z-10` : `bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10`}
                            `}
                        >
                            {/* Header Row */}
                            <div 
                                className="flex items-center p-5 cursor-pointer relative z-10"
                                onClick={() => toggleExpand(item.id)}
                            >
                                <div className={`p-3 rounded-xl mr-5 shadow-inner ${theme.iconBg} ${theme.icon} ring-1 ring-white/10`}>
                                    {getTypeIcon(item.type)}
                                </div>
                                
                                <div className="flex-1 min-w-0 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                                    <div className="lg:col-span-4">
                                        <div className="text-base font-black text-white truncate tracking-tight">{item.name}</div>
                                        <div className={`text-[9px] font-black uppercase tracking-[0.2em] ${theme.accent} opacity-70`}>{item.type}</div>
                                    </div>
                                    
                                    <div className="lg:col-span-3 flex items-center gap-2">
                                        <div className="bg-black/30 px-3 py-1.5 rounded-lg border border-white/5 flex items-center gap-2">
                                            <Clock size={12} className="text-white/50" />
                                            <span className="text-xs font-mono font-bold text-white/90">
                                                {item.type === 'staff' || item.type === 'equipment' ? 
                                                    `${item.quantity}h` : 
                                                    `${item.quantity}x`}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="lg:col-span-5 flex items-center justify-end gap-6">
                                        <div className="text-right">
                                            <div className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Revenue</div>
                                            <div className="text-sm font-mono font-bold text-emerald-400">
                                                ${(item.chargeRate * item.quantity).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 ml-6">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); toggleExpand(item.id); }}
                                        className={`p-2 rounded-full transition-all duration-300 ${isExpanded ? `bg-white/10 text-white rotate-180` : 'text-white/30 hover:text-white'}`}
                                    >
                                        <ChevronDown size={18} />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
                                        className="p-2 hover:bg-red-500/20 rounded-full text-white/30 hover:text-red-400 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Expanded Edit Panel */}
                            {isExpanded && (
                                <div className="p-6 bg-black/20 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in relative z-10">
                                    <div>
                                        <label className="text-[9px] font-black text-white/40 uppercase mb-2 block tracking-widest">Quantity / Hours</label>
                                        <input 
                                            type="number" 
                                            value={item.quantity} 
                                            onChange={(e) => onUpdate(item.id, { quantity: parseFloat(e.target.value) || 0, duration: parseFloat(e.target.value) || 0 })} 
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-indigo-500 outline-none transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black text-white/40 uppercase mb-2 block tracking-widest">Cost Rate</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-xs">$</span>
                                            <input 
                                                type="number" 
                                                value={item.costRate} 
                                                onChange={(e) => onUpdate(item.id, { costRate: parseFloat(e.target.value) || 0 })} 
                                                className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white font-mono text-sm focus:border-white/30 outline-none transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black text-white/40 uppercase mb-2 block tracking-widest">Charge Rate</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-xs">$</span>
                                            <input 
                                                type="number" 
                                                value={item.chargeRate} 
                                                onChange={(e) => onUpdate(item.id, { chargeRate: parseFloat(e.target.value) || 0 })} 
                                                className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white font-mono text-sm focus:border-emerald-500/50 outline-none transition-colors"
                                            />
                                        </div>
                                    </div>
                                    {(item.type === 'staff' || item.type === 'equipment') && (
                                        <>
                                            <div>
                                                <label className="text-[9px] font-black text-white/40 uppercase mb-2 block tracking-widest">Start Time</label>
                                                <input 
                                                    type="time" 
                                                    value={item.startTime || ''} 
                                                    onChange={(e) => onUpdate(item.id, { startTime: e.target.value })} 
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-indigo-500 outline-none transition-colors text-center"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-black text-white/40 uppercase mb-2 block tracking-widest">Finish Time</label>
                                                <input 
                                                    type="time" 
                                                    value={item.finishTime || ''} 
                                                    onChange={(e) => onUpdate(item.id, { finishTime: e.target.value })} 
                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-indigo-500 outline-none transition-colors text-center"
                                                />
                                            </div>
                                        </>
                                    )}
                                    <div className="md:col-span-3">
                                        <label className="text-[9px] font-black text-white/40 uppercase mb-2 block tracking-widest">Notes</label>
                                        <textarea 
                                            value={item.note || ''} 
                                            onChange={(e) => onUpdate(item.id, { note: e.target.value })} 
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-indigo-500 outline-none resize-none h-24"
                                            placeholder="Add specific details about this task..."
                                        />
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