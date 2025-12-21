import React from 'react';
import { X, Calendar, User, FileText, CheckCircle2 } from 'lucide-react';

const QuoteSettingsModal = ({ isOpen, onClose, settings, setSettings, projects, selectedProject }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-stone-900 border border-white/20 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-zoom-in">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-indigo-900/50 to-purple-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg">
              <FileText size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-wider">Quote Settings</h3>
              <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Configure Document Details</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <User size={12} /> Client / Project
            </label>
            <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold">
              {projects.find(p => p.id === selectedProject)?.name || 'No Project Selected'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={12} /> Valid Until
              </label>
              <input
                type="date"
                value={settings.validUntil || ''}
                onChange={(e) => setSettings({ ...settings, validUntil: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 size={12} /> Status
              </label>
              <select
                value={settings.status || 'DRAFT'}
                onChange={(e) => setSettings({ ...settings, status: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
              >
                <option value="DRAFT">DRAFT</option>
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="EXPIRED">EXPIRED</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <FileText size={12} /> Terms & Conditions
            </label>
            <textarea
              value={settings.terms || ''}
              onChange={(e) => setSettings({ ...settings, terms: e.target.value })}
              placeholder="Enter payment terms, scope notes..."
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
            />
          </div>
        </div>

        <div className="p-6 bg-black/20 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-500/20"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuoteSettingsModal;
