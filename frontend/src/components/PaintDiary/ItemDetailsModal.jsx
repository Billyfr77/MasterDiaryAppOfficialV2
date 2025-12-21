import React, { useState, useEffect } from 'react';
import { X, Clock, DollarSign, FileText, Calendar, ArrowRight, TrendingUp, Calculator } from 'lucide-react';

const ItemDetailsModal = ({ isOpen, onClose, onConfirm, item }) => {
    const [quantity, setQuantity] = useState(1);
    const [startTime, setStartTime] = useState("07:00");
    const [finishTime, setFinishTime] = useState("15:00");
    const [notes, setNotes] = useState("");
    
    // Costings
    const [costRate, setCostRate] = useState(0);
    const [chargeRate, setChargeRate] = useState(0);
    
    const [showCostings, setShowCostings] = useState(false);

    useEffect(() => {
        if (item) {
            setQuantity(item.quantity || (item.type === 'staff' ? 8 : 1));
            setCostRate(item.costRate || 0);
            setChargeRate(item.chargeRate || (item.costRate * 1.2) || 0);
            if (item.startTime) setStartTime(item.startTime);
            if (item.finishTime) setFinishTime(item.finishTime);
        }
    }, [item]);

    // Auto-calc hours from time
    useEffect(() => {
        if (item?.type === 'staff' || item?.type === 'equipment') {
            const start = new Date(`2000-01-01T${startTime}`);
            const end = new Date(`2000-01-01T${finishTime}`);
            if (end > start) {
                const diff = (end - start) / (1000 * 60 * 60);
                setQuantity(parseFloat(diff.toFixed(2)));
            }
        }
    }, [startTime, finishTime, item]);

    if (!isOpen || !item) return null;

    const handleConfirm = () => {
        onConfirm({
            ...item,
            quantity: parseFloat(quantity),
            duration: parseFloat(quantity), 
            startTime,
            finishTime,
            note: notes,
            costRate: parseFloat(costRate),
            chargeRate: parseFloat(chargeRate)
        });
        onClose();
    };

    const isTimeBased = item.type === 'staff' || item.type === 'equipment';

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-[#0f1115] border border-white/10 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-scale-in relative">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                            {item.name}
                        </h3>
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${
                            item.type === 'staff' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' :
                            item.type === 'equipment' ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' :
                            'border-blue-500/30 text-blue-400 bg-blue-500/10'
                        }`}>
                            {item.type}
                        </span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} className="text-gray-400" /></button>
                </div>
                
                <div className="p-6 space-y-6">
                    {/* Time / Quantity Section */}
                    {isTimeBased ? (
                        <div className="bg-stone-900/50 p-4 rounded-2xl border border-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-xs font-black text-gray-500 uppercase flex items-center gap-2"><Clock size={14} /> Time Log</h4>
                                <div className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">{quantity} hrs</div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Start</label>
                                    <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-center focus:border-indigo-500 outline-none" />
                                </div>
                                <ArrowRight size={16} className="text-gray-600 mt-4" />
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Finish</label>
                                    <input type="time" value={finishTime} onChange={e => setFinishTime(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-center focus:border-indigo-500 outline-none" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-stone-900/50 p-4 rounded-2xl border border-white/5">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2"><Calculator size={14} /> Quantity</label>
                            <input 
                                type="number" 
                                value={quantity} 
                                onChange={e => setQuantity(e.target.value)} 
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-xl font-bold focus:border-indigo-500 outline-none text-center"
                            />
                        </div>
                    )}

                    {/* Costings Toggle */}
                    <div className="bg-stone-900/50 p-4 rounded-2xl border border-white/5">
                        <div 
                            className="flex justify-between items-center cursor-pointer"
                            onClick={() => setShowCostings(!showCostings)}
                        >
                            <h4 className="text-xs font-black text-gray-500 uppercase flex items-center gap-2"><DollarSign size={14} /> Financials</h4>
                            <div className="text-[10px] font-bold text-indigo-400 uppercase">{showCostings ? 'Hide' : 'Edit'}</div>
                        </div>
                        
                        {showCostings && (
                            <div className="grid grid-cols-2 gap-4 mt-4 animate-fade-in">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">In-House Cost</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
                                        <input type="number" value={costRate} onChange={e => setCostRate(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl pl-6 pr-3 py-2 text-white font-mono text-sm focus:border-red-500/50 outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Charge Out</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
                                        <input type="number" value={chargeRate} onChange={e => setChargeRate(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl pl-6 pr-3 py-2 text-white font-mono text-sm focus:border-emerald-500/50 outline-none" />
                                    </div>
                                </div>
                                <div className="col-span-2 pt-2 border-t border-white/5 flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-500">Margin</span>
                                    <span className={`text-sm font-mono font-black ${chargeRate > costRate ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {costRate > 0 ? Math.round(((chargeRate - costRate) / costRate) * 100) : 0}%
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-2"><FileText size={14} /> Notes</label>
                        <textarea 
                            value={notes} 
                            onChange={e => setNotes(e.target.value)} 
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-indigo-500 outline-none resize-none h-20"
                            placeholder="Add specific details..."
                        />
                    </div>

                    <button 
                        onClick={handleConfirm}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-indigo-900/20 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                    >
                        <TrendingUp size={18} /> Confirm Entry
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ItemDetailsModal;