import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, Calendar, User, AlignLeft, AlertCircle, CheckCircle, Tag, 
    Zap, Trash2, Mail, CreditCard, ArrowRight, ListChecks, 
    Layers, Settings, Plus, MinusCircle, Sparkles, ShieldCheck,
    Truck, BookOpen, FileText, Clock, AlertTriangle, Cpu,
    Wand2, HardHat, DollarSign, Activity, ClipboardList, GitFork, Play, Bell, TrendingUp
} from 'lucide-react';

export default function PropertiesPanel({ selectedNode, updateNodeData, closePanel, onDeleteNode, staffList = [] }) {
  if (!selectedNode) return null;

  const { data, id, type } = selectedNode;
  const [activeTab, setActiveTab] = useState('general'); // general, checklist, automation, forensic

  // --- STATE FOR CHECKLIST ---
  const [newItem, setNewItem] = useState('');

  // --- HELPERS ---
  const safeDateValue = (dateStr) => {
    try {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    } catch (e) { return ''; }
  };

  const handleChange = (field, value) => {
    updateNodeData(id, { ...data, [field]: value });
  };

  const handleConfigChange = (field, value) => {
      const currentConfig = data.config || {};
      updateNodeData(id, { 
          ...data, 
          config: { ...currentConfig, [field]: value } 
      });
  };

  const handleAutomationChange = (field, value) => {
      const currentAutomation = data.automation || {};
      updateNodeData(id, { 
          ...data, 
          automation: { ...currentAutomation, [field]: value } 
      });
  };

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

  const toggleChecklistItem = (itemId) => {
      const currentList = data.checklist || [];
      const updatedList = currentList.map(item => 
          item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      handleChange('checklist', updatedList);
  };

  // --- UI CONFIG PER NODE TYPE ---
  const NODE_PROFILES = {
      default: { label: 'Operational Task', color: 'bg-blue-500', icon: ClipboardList },
      trigger: { label: 'Neural Trigger', color: 'bg-amber-500', icon: Zap },
      decision: { label: 'Logic Gate', color: 'bg-orange-500', icon: GitFork },
      action: { label: 'System Action', color: 'bg-indigo-500', icon: Play },
      invoiceNode: { label: 'Invoice Engine', color: 'bg-emerald-500', icon: CreditCard },
      safetyNode: { label: 'Compliance Lock', color: 'bg-rose-500', icon: ShieldCheck },
      resourceNode: { label: 'Resource Sync', color: 'bg-amber-600', icon: Truck },
      diaryNode: { label: 'Diary Logger', color: 'bg-cyan-500', icon: BookOpen },
      quoteNode: { label: 'Estimation Link', color: 'bg-indigo-400', icon: FileText },
      forensicNode: { label: 'Forensic Audit', color: 'bg-violet-500', icon: AlertTriangle },
      delayNode: { label: 'Temporal Delay', color: 'bg-orange-400', icon: Clock },
      milestone: { label: 'Project Milestone', color: 'bg-yellow-400', icon: Bell },
      approval: { label: 'Human Approval', color: 'bg-purple-500', icon: User }
  };

  const profile = NODE_PROFILES[type] || NODE_PROFILES.default;

  return (
    <motion.div
      initial={{ x: 450, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 450, opacity: 0 }}
      transition={{ type: "spring", stiffness: 350, damping: 35 }}
      className="w-full sm:w-[450px] h-[calc(100vh-80px)] border-l border-white/10 bg-slate-950/90 backdrop-blur-3xl absolute right-0 top-0 z-50 flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.8)]"
    >
      {/* --- PREMUM HEADER --- */}
      <div className="relative p-8 border-b border-white/5 overflow-hidden">
          {/* Animated Background Glow */}
          <div className={`absolute top-0 right-0 w-32 h-32 ${profile.color} opacity-10 blur-[60px] animate-pulse`} />
          
          <div className="flex justify-between items-start relative z-10">
              <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${profile.color.replace('bg-', 'bg-')}/20 border border-white/10 text-white shadow-inner`}>
                      <profile.icon size={24} />
                  </div>
                  <div>
                      <h2 className="text-white font-black text-xl tracking-tight uppercase leading-tight">
                          {profile.label}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                          <span className="text-slate-500 text-[9px] font-mono tracking-widest bg-white/5 px-2 py-0.5 rounded uppercase">NODE_ID: {id.slice(-8)}</span>
                          {Object.keys(data.config || {}).length > 0 && (
                              <span className="text-indigo-400 text-[9px] font-bold tracking-widest flex items-center gap-1 uppercase">
                                  <Sparkles size={8} /> Smart_Engine_Active
                              </span>
                          )}
                      </div>
                  </div>
              </div>
              <button 
                onClick={closePanel}
                className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all group"
              >
                <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
          </div>
      </div>

      {/* --- TABS --- */}
      <div className="flex items-center px-4 pt-2 border-b border-white/5 bg-black/40">
          {[
              { id: 'general', label: 'Identity', icon: Layers },
              { id: 'config', label: 'Action', icon: Cpu, hide: !['invoiceNode', 'safetyNode', 'resourceNode', 'diaryNode', 'quoteNode', 'forensicNode', 'delayNode', 'trigger', 'action'].includes(type) },
              { id: 'checklist', label: 'Checks', icon: ListChecks, hide: type === 'decision' },
              { id: 'automation', label: 'Logic', icon: Settings }
          ].map(tab => !tab.hide && (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 border-b-2 transition-all duration-300 ${activeTab === tab.id ? 'border-indigo-500 text-white bg-white/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
              >
                <tab.icon size={14} className={activeTab === tab.id ? 'text-indigo-400' : ''} /> 
                {tab.label}
              </button>
          ))}
      </div>

      {/* --- SCROLLABLE CONTENT --- */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-gradient-to-b from-slate-900/50 to-black/50">
        
        {/* --- 1. IDENTITY TAB (Universal) --- */}
        {activeTab === 'general' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Tag size={12} className="text-indigo-500" /> Label Description
                        </label>
                        <input
                            type="text"
                            value={data.label || ''}
                            onChange={(e) => handleChange('label', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all font-bold tracking-tight text-lg"
                            placeholder="e.g. Core Foundation Pour"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <AlignLeft size={12} className="text-indigo-500" /> Operational Context
                        </label>
                        <textarea
                            value={data.description || ''}
                            onChange={(e) => handleChange('description', e.target.value)}
                            rows={4}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-slate-300 focus:outline-none focus:border-indigo-500 focus:bg-white/10 transition-all resize-none text-sm leading-relaxed"
                            placeholder="Enter instructions, notes, or AI-generated context..."
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Activity size={12} className="text-indigo-500" /> Phase Status
                        </label>
                        <select
                            value={data.status || 'pending'}
                            onChange={(e) => handleChange('status', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-xs font-bold text-white focus:outline-none focus:border-indigo-500 cursor-pointer appearance-none uppercase tracking-widest"
                        >
                            <option value="pending">STANDBY</option>
                            <option value="in-progress">ACTIVE_EXECUTING</option>
                            <option value="completed">TASK_COMPLETE</option>
                            <option value="error">BLOCKED_RISK</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <User size={12} className="text-indigo-500" /> Lead Architect
                        </label>
                        <select
                            value={data.assignee || ''}
                            onChange={(e) => handleChange('assignee', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-xs font-bold text-white focus:outline-none focus:border-indigo-500 cursor-pointer appearance-none uppercase tracking-widest"
                        >
                            <option value="">UNASSIGNED</option>
                            {staffList.map(staff => (
                                <option key={staff.id} value={staff.name}>{staff.name.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="pt-6 border-t border-white/5 space-y-6">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Temporal Bounds</h4>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Start Protocol</label>
                            <input
                                type="date"
                                value={safeDateValue(data.startDate)}
                                onChange={(e) => handleChange('startDate', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-xs font-mono font-bold text-indigo-300 focus:outline-none [color-scheme:dark]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Deadline Cutoff</label>
                            <input
                                type="date"
                                value={safeDateValue(data.deadline)}
                                onChange={(e) => handleChange('deadline', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-xs font-mono font-bold text-rose-400 focus:outline-none [color-scheme:dark]"
                            />
                        </div>
                    </div>
                </div>
            </motion.div>
        )}

        {/* --- 2. CONFIG TAB (Unique per Power Node) --- */}
        {activeTab === 'config' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 animate-in slide-in-from-right duration-500">
                <div className="relative p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-[2rem] overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                        <Cpu size={16} className="text-indigo-400 animate-spin-slow" /> Engine Configuration
                    </h3>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                        Configure the functional behavior of this {type.replace('Node', '')} integration within the neural lattice.
                    </p>
                </div>

                {/* INVOICE ENGINE */}
                {type === 'invoiceNode' && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Contract Value ($)</label>
                            <div className="relative">
                                <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                                <input 
                                    type="number" 
                                    value={data.config?.amount || ''} 
                                    onChange={(e) => handleConfigChange('amount', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-xl font-mono font-bold text-white focus:border-emerald-500 outline-none"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Client Target</label>
                            <input 
                                type="text" 
                                value={data.config?.client || ''} 
                                onChange={(e) => handleConfigChange('client', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:border-emerald-500 outline-none"
                                placeholder="Search client directory..."
                            />
                        </div>
                    </div>
                )}

                {/* SAFETY LOCK */}
                {type === 'safetyNode' && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mandatory SWMS Template</label>
                            <select 
                                value={data.config?.template || ''} 
                                onChange={(e) => handleConfigChange('template', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:border-rose-500 outline-none appearance-none"
                            >
                                <option value="">Select Compliance Pack...</option>
                                <option value="High Risk SWMS">High Risk SWMS - 0x88</option>
                                <option value="Site Induction">Site Induction - V2</option>
                                <option value="Incident Report">Forensic Incident Audit</option>
                                <option value="Daily Pre-Start">Daily Strategic Pre-Start</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Risk Sensitivity Level</label>
                            <div className="grid grid-cols-4 gap-2">
                                {['Low', 'Medium', 'High', 'Critical'].map(level => (
                                    <button 
                                        key={level}
                                        onClick={() => handleConfigChange('riskLevel', level)}
                                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${data.config?.riskLevel === level ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/40' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* RESOURCE SYNC */}
                {type === 'resourceNode' && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Resource Allocation Type</label>
                            <select 
                                value={data.config?.resourceType || ''} 
                                onChange={(e) => handleConfigChange('resourceType', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:border-amber-500 outline-none appearance-none"
                            >
                                <option value="">Select Asset Group...</option>
                                <option value="General Staff">General Fleet Personnel</option>
                                <option value="Excavator">Excavator - 3.5T Core</option>
                                <option value="Scaffold">Modular Scaffolding - Tier 1</option>
                                <option value="Electrical Tools">Electrical Precision Group</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Asset Quantity</label>
                            <input 
                                type="number" 
                                value={data.config?.quantity || '1'} 
                                onChange={(e) => handleConfigChange('quantity', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-lg font-mono font-bold text-white focus:border-amber-500 outline-none"
                                min="1"
                            />
                        </div>
                    </div>
                )}

                {/* FORENSIC AUDIT */}
                {type === 'forensicNode' && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Audit Neural Category</label>
                            <select 
                                value={data.config?.category || ''} 
                                onChange={(e) => handleConfigChange('category', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:border-violet-500 outline-none appearance-none"
                            >
                                <option value="Financial Risk">Financial Margin Erosion</option>
                                <option value="Compliance Gap">Regulatory Compliance Gap</option>
                                <option value="Safety Anomaly">Safety Behavior Anomaly</option>
                                <option value="Timeline Drift">Temporal Timeline Drift</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Scan Sensitivity</label>
                            <div className="grid grid-cols-2 gap-3">
                                {['Low', 'Medium', 'High', 'Forensic'].map(s => (
                                    <button 
                                        key={s}
                                        onClick={() => handleConfigChange('sensitivity', s)}
                                        className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all ${data.config?.sensitivity === s ? 'bg-violet-600 border-violet-400 text-white shadow-xl shadow-violet-900/40' : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'}`}
                                    >
                                        {s}_MODE
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* DELAY ENGINE */}
                {type === 'delayNode' && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Wait Duration (Neural Hours)</label>
                            <div className="relative">
                                <Clock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400" />
                                <input 
                                    type="number" 
                                    value={data.config?.duration || ''} 
                                    onChange={(e) => handleConfigChange('duration', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-xl font-mono font-bold text-white focus:border-orange-500 outline-none"
                                    placeholder="24"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Logic Hold Type</label>
                            <select 
                                value={data.config?.type || ''} 
                                onChange={(e) => handleConfigChange('type', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:border-orange-500 outline-none appearance-none"
                            >
                                <option value="Standard">Standard Propagation Wait</option>
                                <option value="Weather">Weather Intelligence Hold</option>
                                <option value="Approval">External Sign-off Gateway</option>
                                <option value="Curing">Material Curing Process</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* WORMHOLE HUB */}
                {type === 'wormholeNode' && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Project/Logic Link</label>
                            <input 
                                type="text" 
                                value={data.config?.targetWorkflow || ''} 
                                onChange={(e) => handleConfigChange('targetWorkflow', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:border-fuchsia-500 outline-none"
                                placeholder="E.G. RESIDENTIAL_SITE_B"
                            />
                        </div>
                        <div className="p-4 bg-fuchsia-500/5 border border-fuchsia-500/10 rounded-2xl">
                            <p className="text-[9px] text-fuchsia-200/60 uppercase font-black leading-relaxed">
                                HUB LINK: This node acts as a neural bridge, triggering logic across separate project instances.
                            </p>
                        </div>
                    </div>
                )}

                {/* GEOFENCE MAP SYNC */}
                {type === 'mapNode' && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Site Anchor Name</label>
                            <input 
                                type="text" 
                                value={data.config?.locationName || ''} 
                                onChange={(e) => handleConfigChange('locationName', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:border-blue-500 outline-none"
                                placeholder="E.G. EXCLUSION_ZONE_ALPHA"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Activation Radius (M)</label>
                            <input 
                                type="number" 
                                value={data.config?.radius || '50'} 
                                onChange={(e) => handleConfigChange('radius', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>
                )}

                {/* CLIENT HUB */}
                {type === 'clientNode' && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Client CRM Identity</label>
                            <input 
                                type="text" 
                                value={data.config?.clientName || ''} 
                                onChange={(e) => handleConfigChange('clientName', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:border-indigo-500 outline-none"
                                placeholder="Search Client Hub..."
                            />
                        </div>
                    </div>
                )}

                {/* VARIATION TRACKER */}
                {type === 'variationNode' && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Variation Value ($)</label>
                            <div className="relative">
                                <TrendingUp size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                                <input 
                                    type="number" 
                                    value={data.config?.variationAmount || ''} 
                                    onChange={(e) => handleConfigChange('variationAmount', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-xl font-mono font-bold text-white focus:border-emerald-500 outline-none"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* ACTION NODE */}
                {type === 'action' && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Activity size={12} className="text-indigo-400" /> System Action Core
                            </label>
                            <select 
                                value={data.actionType || ''} 
                                onChange={(e) => handleChange('actionType', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:border-indigo-500 outline-none appearance-none uppercase tracking-widest"
                            >
                                <option value="">SELECT_CORE_PROTOCOL</option>
                                <option value="create_project">ARCHITECT_NEW_PROJECT</option>
                                <option value="create_quote">INITIATE_NEE_ESTIMATION</option>
                                <option value="create_invoice">GENERATE_FINANCIAL_DEMAND</option>
                                <option value="assign_staff">SYNC_FLEET_ASSIGNMENT</option>
                                <option value="send_email">BROADCAST_PROTO_NOTIFICATION</option>
                                <option value="log_audit">COMMIT_FORENSIC_LOG</option>
                            </select>
                        </div>

                        <AnimatePresence mode="wait">
                            {data.actionType === 'assign_staff' && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-slate-600 tracking-widest pl-1">Personnel Directory</label>
                                    <select
                                        value={data.staffId || ''}
                                        onChange={(e) => handleChange('staffId', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold text-white focus:border-indigo-500 outline-none"
                                    >
                                        <option value="">SELECT_STAFF_RECORD</option>
                                        {staffList.map(staff => (
                                            <option key={staff.id} value={staff.id}>{staff.name.toUpperCase()}</option>
                                        ))}
                                    </select>
                                </motion.div>
                            )}

                            {data.actionType === 'send_email' && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-slate-600 tracking-widest pl-1">Network Recipient</label>
                                    <input 
                                        type="text" 
                                        value={data.recipient || ''} 
                                        onChange={(e) => handleChange('recipient', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-mono text-indigo-300 focus:border-indigo-500 outline-none" 
                                        placeholder="user@neural-network.io"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* TRIGGER NODE */}
                {type === 'trigger' && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Zap size={12} className="text-amber-400" /> Neural Event Listener
                            </label>
                            <select 
                                value={data.event || ''} 
                                onChange={(e) => handleChange('event', e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white focus:border-amber-500 outline-none appearance-none uppercase tracking-widest"
                            >
                                <option value="">MONITORING_STANDBY</option>
                                <option value="quote.approved">ON_QUOTE_APPROVAL_SIGNAL</option>
                                <option value="job.completed">ON_FORENSIC_JOB_COMPLETE</option>
                                <option value="project.created">ON_PROJECT_INITIATION</option>
                                <option value="safety.incident">ON_SAFETY_EXCEPTION_RAISED</option>
                            </select>
                        </div>
                        <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                            <p className="text-[9px] text-amber-200/60 uppercase font-black leading-relaxed">
                                NOTICE: This circuit will automatically transition to ACTIVE mode when the selected network signal is detected.
                            </p>
                        </div>
                    </div>
                )}
            </motion.div>
        )}

        {/* --- 3. CHECKLIST TAB (QA/QC) --- */}
        {activeTab === 'checklist' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-[2rem] p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
                        <ListChecks size={80} className="text-white" />
                    </div>
                    <h3 className="text-indigo-400 font-black text-xs uppercase tracking-[0.3em] mb-2 flex items-center gap-2 relative z-10">
                        <HardHat size={16} /> Quality Protocol
                    </h3>
                    <p className="text-slate-400 text-[10px] font-medium leading-relaxed relative z-10">Define the mandatory compliance steps required to satisfy this operational node.</p>
                </div>

                <div className="space-y-4">
                    {/* Add Item */}
                    <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
                        <input 
                            type="text" 
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addChecklistItem()}
                            placeholder="Add compliance directive..."
                            className="flex-1 bg-transparent px-5 py-3 text-sm text-white focus:outline-none placeholder:text-slate-600 font-bold tracking-tight"
                        />
                        <button 
                            onClick={addChecklistItem}
                            className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg active:scale-95"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    {/* List */}
                    <div className="space-y-3 pt-4">
                        {(data.checklist || []).length === 0 && (
                            <div className="text-center py-12 border border-dashed border-white/5 rounded-[2rem]">
                                <div className="text-slate-700 mb-2 flex justify-center"><ListChecks size={32} /></div>
                                <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Protocol Library Empty</div>
                            </div>
                        )}
                        {(data.checklist || []).map((item) => (
                            <motion.div 
                                key={item.id} 
                                layout
                                className={`flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer group ${item.completed ? 'bg-emerald-500/10 border-emerald-500/20 shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                                onClick={() => toggleChecklistItem(item.id)}
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${item.completed ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'border-slate-700'}`}>
                                        {item.completed && <CheckCircle size={14} className="text-white" />}
                                    </div>
                                    <span className={`text-sm font-bold tracking-tight ${item.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{item.text}</span>
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); removeChecklistItem(item.id); }}
                                    className="p-2 text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <MinusCircle size={18} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        )}

        {/* --- 4. AUTOMATION TAB (Smart Logic) --- */}
        {activeTab === 'automation' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-[2rem] p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
                        <Zap size={80} className="text-white" />
                    </div>
                    <h3 className="text-yellow-400 font-black text-xs uppercase tracking-[0.3em] mb-2 flex items-center gap-2 relative z-10">
                        <Wand2 size={16} /> Neural Automation
                    </h3>
                    <p className="text-slate-400 text-[10px] font-medium leading-relaxed relative z-10">Configure secondary system responses that fire upon node state transitions.</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-8 shadow-2xl">
                    {/* Notification Sync Toggle */}
                    <div className="flex items-center justify-between group cursor-pointer" onClick={() => handleAutomationChange('sendEmail', !data.automation?.sendEmail)}>
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl transition-all ${data.automation?.sendEmail ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700'}`}>
                                <Mail size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-sm font-black uppercase tracking-widest ${data.automation?.sendEmail ? 'text-white' : 'text-slate-400 transition-colors group-hover:text-slate-300'}`}>Email Broadcast</span>
                                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">Auto-alert assigned lead</span>
                            </div>
                        </div>
                        <div className={`w-12 h-6 rounded-full relative transition-all duration-500 ${data.automation?.sendEmail ? 'bg-indigo-600' : 'bg-slate-800'}`}>
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-500 ${data.automation?.sendEmail ? 'left-7' : 'left-1'}`} />
                        </div>
                    </div>

                    {/* Fleet Scheduler Sync */}
                    <div className="flex items-center justify-between group cursor-pointer" onClick={() => handleAutomationChange('allocateResource', !data.automation?.allocateResource)}>
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl transition-all ${data.automation?.allocateResource ? 'bg-amber-600 text-white shadow-[0_0_20px_rgba(217,119,6,0.4)]' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700'}`}>
                                <Truck size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-sm font-black uppercase tracking-widest ${data.automation?.allocateResource ? 'text-white' : 'text-slate-400 transition-colors group-hover:text-slate-300'}`}>Fleet Synchronization</span>
                                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">Auto-schedule machinery</span>
                            </div>
                        </div>
                        <div className={`w-12 h-6 rounded-full relative transition-all duration-500 ${data.automation?.allocateResource ? 'bg-amber-600' : 'bg-slate-800'}`}>
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-500 ${data.automation?.allocateResource ? 'left-7' : 'left-1'}`} />
                        </div>
                    </div>

                    {/* Financial Trigger Sync */}
                    <div className="flex items-center justify-between group cursor-pointer" onClick={() => handleAutomationChange('createInvoice', !data.automation?.createInvoice)}>
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl transition-all ${data.automation?.createInvoice ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700'}`}>
                                <CreditCard size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-sm font-black uppercase tracking-widest ${data.automation?.createInvoice ? 'text-white' : 'text-slate-400 transition-colors group-hover:text-slate-300'}`}>Harvest Signal</span>
                                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">Auto-draft claim on completion</span>
                            </div>
                        </div>
                        <div className={`w-12 h-6 rounded-full relative transition-all duration-500 ${data.automation?.createInvoice ? 'bg-emerald-600' : 'bg-slate-800'}`}>
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-500 ${data.automation?.createInvoice ? 'left-7' : 'left-1'}`} />
                        </div>
                    </div>

                    {/* External App Sync Input */}
                    <div className="space-y-3 pt-4 border-t border-white/5">
                        <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest flex items-center gap-2 pl-1">
                            <Sparkles size={12} className="text-indigo-400" /> Neural State Integration
                        </label>
                        <div className="relative">
                            <ArrowRight size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                            <input 
                                type="text" 
                                placeholder="SYNC_STATE_E.G._APPROVED"
                                value={data.automation?.updateQuoteStatus || ''}
                                onChange={(e) => handleAutomationChange('updateQuoteStatus', e.target.value)}
                                className="w-full bg-slate-950 border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-xs font-mono font-bold text-indigo-300 focus:border-indigo-500 outline-none uppercase tracking-widest"
                            />
                        </div>
                    </div>
                </div>
            </motion.div>
        )}
      </div>

      {/* --- MASTER ARCHITECT FOOTER ACTIONS --- */}
      <div className="p-8 border-t border-white/10 bg-slate-950/80 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleChange('status', 'completed')}
                className="py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-3 group active:scale-95"
              >
                <CheckCircle size={18} className="group-hover:scale-110 transition-transform" />
                EXECUTE_COMPLETE
              </button>
              
              {onDeleteNode && (
                <button 
                    onClick={() => onDeleteNode(id)}
                    className="py-4 bg-white/5 hover:bg-rose-600/20 text-slate-500 hover:text-rose-400 border border-white/10 hover:border-rose-500/50 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                    <Trash2 size={18} />
                    DECONSTRUCT_NODE
                </button>
              )}
          </div>
          
          <div className="text-center">
              <p className="text-[8px] font-black text-slate-700 uppercase tracking-[0.4em] flex items-center justify-center gap-2">
                  <ShieldCheck size={10} /> Secure Architectural Control Level 4
              </p>
          </div>
      </div>

    </motion.div>
  );
}