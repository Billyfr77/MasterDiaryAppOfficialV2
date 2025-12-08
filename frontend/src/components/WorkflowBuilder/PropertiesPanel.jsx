import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, User, AlignLeft, AlertCircle, CheckCircle, Tag, Zap, Trash2, Mail, CreditCard, ArrowRight, ListChecks, Layers, Settings, Plus, MinusCircle } from 'lucide-react';

export default function PropertiesPanel({ selectedNode, updateNodeData, closePanel, onDeleteNode, staffList = [] }) {
  if (!selectedNode) return null;

  const { data, id, type } = selectedNode;
  const [activeTab, setActiveTab] = useState('general'); // general, checklist, automation

  // Safe Date Helper
  const safeDateValue = (dateStr) => {
    try {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  };

  const handleChange = (field, value) => {
    updateNodeData(id, { ...data, [field]: value });
  };

  const handleAutomationChange = (field, value) => {
      const currentAutomation = data.automation || {};
      updateNodeData(id, { 
          ...data, 
          automation: { ...currentAutomation, [field]: value } 
      });
  };

  // Checklist Logic
  const [newItem, setNewItem] = useState('');
  
  const addChecklistItem = () => {
      if (!newItem.trim()) return;
      const currentList = data.checklist || [];
      const updatedList = [...currentList, { id: Date.now(), text: newItem, completed: false }];
      handleChange('checklist', updatedList);
      setNewItem('');
  };

  const removeChecklistItem = (itemId) => {
      const currentList = data.checklist || [];
      const updatedList = currentList.filter(i => i.id !== itemId);
      handleChange('checklist', updatedList);
  };

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="w-[400px] h-[calc(100vh-80px)] border-l border-white/10 bg-slate-900/95 backdrop-blur-2xl absolute right-0 top-0 z-50 flex flex-col shadow-[-10px_0_40px_rgba(0,0,0,0.5)]"
    >
      {/* Header */}
      <div className="h-20 border-b border-white/10 flex items-center justify-between px-6 bg-gradient-to-r from-slate-900 via-slate-900 to-transparent">
        <div>
          <h2 className="text-white font-bold text-lg tracking-tight flex items-center gap-2">
            <span className={`w-2 h-6 rounded-full inline-block ${type === 'decision' ? 'bg-orange-500' : 'bg-indigo-500'}`} />
            {type === 'decision' ? 'Logic Node' : 'Task Node'}
          </h2>
          <span className="text-slate-500 text-[10px] font-mono uppercase tracking-widest pl-4">ID: {id.slice(-6)}</span>
        </div>
        <button 
          onClick={closePanel}
          className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center px-2 pt-2 border-b border-white/5 bg-slate-900/50">
          <button 
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all ${activeTab === 'general' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            <Layers size={14} /> General
          </button>
          {type !== 'decision' && (
            <button 
                onClick={() => setActiveTab('checklist')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all ${activeTab === 'checklist' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
                <ListChecks size={14} /> QA/QC
            </button>
          )}
          <button 
            onClick={() => setActiveTab('automation')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all ${activeTab === 'automation' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            <Settings size={14} /> Logic
          </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-slate-900/30">
        
        {/* --- GENERAL TAB --- */}
        {activeTab === 'general' && (
            <div className="space-y-6 animate-fade-in">
                {/* Core Info */}
                <div className="space-y-4">
                    <label className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 mb-2 ${type === 'decision' ? 'text-orange-400' : 'text-indigo-400'}`}>
                        Core Information
                    </label>
                    <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 uppercase font-bold pl-1">
                            {type === 'decision' ? 'Condition Question' : 'Task Label'}
                        </label>
                        <input
                            type="text"
                            value={data.label || ''}
                            onChange={(e) => handleChange('label', e.target.value)}
                            className="w-full bg-slate-800/50 border border-white/5 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-slate-800 transition-all placeholder:text-slate-600 font-medium"
                            placeholder="e.g. Site Inspection"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 uppercase font-bold pl-1">Description</label>
                        <textarea
                            value={data.description || ''}
                            onChange={(e) => handleChange('description', e.target.value)}
                            rows={3}
                            className="w-full bg-slate-800/50 border border-white/5 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-slate-800 transition-all resize-none placeholder:text-slate-600 text-sm"
                            placeholder="Detailed instructions for this step..."
                        />
                    </div>
                </div>

                {/* Status & Assignment */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 uppercase font-bold pl-1 flex items-center gap-1"><AlertCircle size={10} /> Status</label>
                        <select
                            value={data.status || 'pending'}
                            onChange={(e) => handleChange('status', e.target.value)}
                            className="w-full bg-slate-800/50 border border-white/5 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                        >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="error">Blocked</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 uppercase font-bold pl-1 flex items-center gap-1"><User size={10} /> Assignee</label>
                        <select
                            value={data.assignee || ''}
                            onChange={(e) => handleChange('assignee', e.target.value)}
                            className="w-full bg-slate-800/50 border border-white/5 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                        >
                            <option value="">Unassigned</option>
                            {Array.isArray(staffList) && staffList.map(staff => (
                                <option key={staff.id} value={staff.name}>{staff.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Timeline */}
                {type !== 'decision' && (
                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                            Timeline & Deadlines
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] text-slate-500 uppercase font-bold pl-1">Start Date</label>
                                <input
                                    type="date"
                                    value={safeDateValue(data.startDate)}
                                    onChange={(e) => handleChange('startDate', e.target.value)}
                                    className="w-full bg-slate-800/50 border border-white/5 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 [color-scheme:dark]"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-slate-500 uppercase font-bold pl-1">Deadline</label>
                                <input
                                    type="date"
                                    value={safeDateValue(data.deadline)}
                                    onChange={(e) => handleChange('deadline', e.target.value)}
                                    className="w-full bg-slate-800/50 border border-white/5 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 [color-scheme:dark]"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* --- CHECKLIST TAB --- */}
        {activeTab === 'checklist' && (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                    <h3 className="text-indigo-400 font-bold text-sm mb-1 flex items-center gap-2">
                        <ListChecks size={16} /> Quality Assurance
                    </h3>
                    <p className="text-slate-400 text-xs">Define mandatory steps before this task can be marked complete.</p>
                </div>

                <div className="space-y-3">
                    {/* Add Item */}
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addChecklistItem()}
                            placeholder="Add compliance check..."
                            className="flex-1 bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                        <button 
                            onClick={addChecklistItem}
                            className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    {/* List */}
                    <div className="space-y-2">
                        {(data.checklist || []).length === 0 && (
                            <div className="text-center py-8 text-slate-600 italic text-sm">No items yet. Add one above!</div>
                        )}
                        {(data.checklist || []).map((item) => (
                            <div key={item.id} className="flex items-center justify-between bg-slate-800/50 border border-white/5 p-3 rounded-lg group">
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${item.completed ? 'bg-green-500 border-green-500' : 'border-slate-500'}`}>
                                        {item.completed && <CheckCircle size={10} className="text-white" />}
                                    </div>
                                    <span className={`text-sm ${item.completed ? 'text-slate-500 line-through' : 'text-slate-300'}`}>{item.text}</span>
                                </div>
                                <button 
                                    onClick={() => removeChecklistItem(item.id)}
                                    className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <MinusCircle size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* --- AUTOMATION TAB --- */}
        {activeTab === 'automation' && (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                    <h3 className="text-yellow-400 font-bold text-sm mb-1 flex items-center gap-2">
                        <Zap size={16} /> Smart Triggers
                    </h3>
                    <p className="text-slate-400 text-xs">Configure what happens when this node is active or completed.</p>
                </div>

                <div className="space-y-4">
                    <div className="bg-slate-800/50 border border-white/5 rounded-xl p-4 space-y-4">
                        {/* Email Toggle */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                    <Mail size={16} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-slate-200">Email Notification</span>
                                    <span className="text-[10px] text-slate-500">Alert assignee on ready</span>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={data.automation?.sendEmail || false}
                                    onChange={(e) => handleAutomationChange('sendEmail', e.target.checked)}
                                />
                                <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>

                        {/* Resource Allocation Toggle */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                                    <User size={16} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-slate-200">Allocate Resource</span>
                                    <span className="text-[10px] text-slate-500">Auto-schedule staff</span>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={data.automation?.allocateResource || false}
                                    onChange={(e) => handleAutomationChange('allocateResource', e.target.checked)}
                                />
                                <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                            </label>
                        </div>

                        {/* Invoice Toggle */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                    <CreditCard size={16} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-slate-200">Generate Invoice</span>
                                    <span className="text-[10px] text-slate-500">Draft on completion</span>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={data.automation?.createInvoice || false}
                                    onChange={(e) => handleAutomationChange('createInvoice', e.target.checked)}
                                />
                                <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                            </label>
                        </div>

                        {/* Quote Status Input */}
                        <div className="space-y-2 pt-2 border-t border-white/5">
                            <label className="text-[10px] text-slate-500 uppercase font-bold pl-1 flex items-center gap-1">
                                Update Quote Status
                            </label>
                            <div className="relative">
                                <ArrowRight size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input 
                                    type="text" 
                                    placeholder="e.g. Approved"
                                    value={data.automation?.updateQuoteStatus || ''}
                                    onChange={(e) => handleAutomationChange('updateQuoteStatus', e.target.value)}
                                    className="w-full bg-slate-900/50 border border-white/5 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Footer Actions */}
        <div className="pt-6 pb-20 space-y-3 mt-auto border-t border-white/5">
          <button 
            onClick={() => handleChange('status', 'completed')}
            className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 group"
          >
            <CheckCircle size={18} className="group-hover:scale-110 transition-transform" />
            Mark as Complete
          </button>
          
          {onDeleteNode && (
            <button 
                onClick={() => onDeleteNode(id)}
                className="w-full py-3 bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-white/5 hover:border-red-500/50 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
                <Trash2 size={18} />
                Delete Node
            </button>
          )}
        </div>

      </div>
    </motion.div>
  );
}
