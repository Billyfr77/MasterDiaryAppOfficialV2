import React, { useState, useEffect } from 'react';
import { X, Calculator, Plus, Package } from 'lucide-react';

const ConfigModal = ({ isOpen, item, suggestedQuantity, onClose, onConfirm }) => {
  const [quantity, setQuantity] = useState(1);
  const [customCharge, setCustomCharge] = useState(0);

  useEffect(() => {
    if (item) {
      setQuantity(suggestedQuantity || 1);
      const baseRate = item.type === 'staff' ? item.chargeRate : 
                      item.type === 'equipment' ? item.costRate : 
                      item.pricePerUnit;
      setCustomCharge(baseRate || 0);
    }
  }, [item, suggestedQuantity, isOpen]);

  if (!isOpen || !item) return null;

  const handleConfirm = () => {
    onConfirm(Number(quantity), 0, Number(customCharge));
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-stone-900 border border-white/20 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-zoom-in">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-emerald-900/50 to-teal-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg">
              <Package size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-wider">Configure Item</h3>
              <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">{item.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Calculator size={12} /> Quantity
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              Rate ($)
            </label>
            <input
              type="number"
              value={customCharge}
              onChange={(e) => setCustomCharge(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="p-6 bg-black/20 border-t border-white/10">
          <button
            onClick={handleConfirm}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Add to Quote
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigModal;
