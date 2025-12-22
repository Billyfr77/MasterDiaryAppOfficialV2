import React, { useState, useCallback, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { 
  Palette, Calendar, Plus, Sparkles, List, Save, FileText, MapPin, Camera, Clock, ImageIcon, Eye, Wand2, DollarSign, TrendingUp, Award, Target, Wrench, X, Loader2, User, Package, Box, BarChart3, Layout, ChevronDown, Search, Edit2, Trash2, CreditCard, Folder
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';

import { useDiaryEngine } from './DiaryEngine';
import { useDiaryTheme } from './ThemeContext';
import TimelineCanvas from '../TimelineCanvas';
import ClientSelector from '../Clients/ClientSelector';
import ItemDetailsModal from './ItemDetailsModal';
import ChronosManagerModal from './ChronosManagerModal';
import DiaryGantt from './DiaryGantt';
import ItemList from './ItemList';
import PowerHeader from '../ui/PowerHeader';
import AestheticPicker from './AestheticPicker';

// --- DRAGGABLE ITEM COMPONENT (ENHANCED) ---
const DraggableItem = ({ item }) => {
    const onDragStart = (event) => {
        const dragItem = { ...item };
        if (item.type === 'staff') { dragItem.costRate = item.payRateBase || 0; dragItem.chargeRate = item.chargeOutBase || 0; }
        else if (item.type === 'equipment') { dragItem.costRate = item.costRateBase || 0; dragItem.chargeRate = item.chargeOutBase || 0; }
        else if (item.type === 'material') { dragItem.costRate = item.pricePerUnit || 0; dragItem.chargeRate = (item.pricePerUnit || 0) * 1.2; }
        else if (item.type === 'chronos' || item.type === 'delay') { dragItem.costRate = 0; dragItem.chargeRate = 0; }
        event.dataTransfer.setData('application/reactflow', JSON.stringify(dragItem));
        event.dataTransfer.effectAllowed = 'move';
    };

    let wrapperClass = "bg-gradient-to-r from-indigo-600/20 to-indigo-900/20 border-indigo-500/30 hover:border-indigo-400";
    let iconClass = "bg-indigo-500/20 text-indigo-400";
    let icon = <Package size={16} />;

    if (item.type === 'staff') {
        wrapperClass = "bg-gradient-to-r from-emerald-600/20 to-emerald-900/20 border-emerald-500/30 hover:border-emerald-400";
        iconClass = "bg-emerald-500/20 text-emerald-400";
        icon = <User size={16} />;
    } else if (item.type === 'equipment') {
        wrapperClass = "bg-gradient-to-r from-amber-600/20 to-amber-900/20 border-amber-500/30 hover:border-amber-400";
        iconClass = "bg-amber-500/20 text-amber-400";
        icon = <Wrench size={16} />;
    } else if (item.type === 'chronos') {
        wrapperClass = "bg-gradient-to-r from-cyan-600/20 to-cyan-900/20 border-cyan-500/30 hover:border-cyan-400";
        iconClass = "bg-cyan-500/20 text-cyan-400";
        icon = <Clock size={16} />;
    } else if (item.type === 'delay') {
        wrapperClass = "bg-gradient-to-r from-rose-600/20 to-rose-900/20 border-rose-500/30 hover:border-rose-400";
        iconClass = "bg-rose-500/20 text-rose-400";
        icon = <TrendingUp size={16} className="rotate-180" />;
    } else if (item.type === 'allowance') {
        wrapperClass = "bg-gradient-to-r from-amber-500/20 to-yellow-900/20 border-amber-500/30 hover:border-amber-400";
        iconClass = "bg-amber-500/20 text-amber-400";
        icon = <Award size={16} />;
    }

    return (
        <div 
            draggable 
            onDragStart={onDragStart}
            className={`group relative flex items-center gap-3 p-3 rounded-xl border cursor-grab active:cursor-grabbing transition-all hover:translate-x-1 hover:shadow-lg ${wrapperClass}`}
        >
            <div className={`p-2 rounded-lg ${iconClass} group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-gray-200 truncate group-hover:text-white transition-colors">{item.name}</div>
                <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                    {item.type === 'staff' ? `$${item.chargeOutBase || 0}/hr` : 
                     item.type === 'equipment' ? `$${item.costRateBase || 0}/day` : 
                     item.type === 'chronos' ? 'Time Event' :
                     item.type === 'delay' ? 'Impact Event' :
                     `$${item.pricePerUnit || 0}`}
                </div>
            </div>
        </div>
    );
};

// --- AI AUTO LOG MODAL ---
const AIAutoLogModal = ({ isOpen, onClose, onConfirm, loading }) => {
    const [prompt, setPrompt] = useState("");
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-stone-900 border border-white/10 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-stone-950/50">
                    <div>
                        <h3 className="text-2xl font-black text-white flex items-center gap-3">
                            <Sparkles className="text-indigo-400" /> AI SMART LOG
                        </h3>
                        <p className="text-gray-500 text-sm mt-1 uppercase font-bold tracking-widest">Describe your day in plain text</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X size={24} className="text-gray-400" /></button>
                </div>
                <div className="p-8">
                    <textarea 
                        autoFocus
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        placeholder="e.g. 'Today 2 painters spent 8 hours on site using a scissor lift and 5 tubs of Dulux paint...'"
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-white text-lg focus:border-indigo-500 outline-none h-48 resize-none placeholder-gray-700 font-medium leading-relaxed"
                    />
                    <div className="mt-8 flex gap-4">
                        <button onClick={onClose} className="flex-1 py-4 text-gray-400 font-bold hover:bg-white/5 rounded-2xl transition-all">Cancel</button>
                        <button 
                            disabled={loading || !prompt.trim()}
                            onClick={() => { onConfirm(prompt); }}
                            className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-900/20 flex items-center justify-center gap-3 transition-all"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Wand2 size={20} />}
                            {loading ? 'Processing...' : 'Generate Canvas Nodes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- SAVE TEMPLATE MODAL ---
const SaveTemplateModal = ({ isOpen, onClose, onConfirm, loading }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-stone-900 border border-white/10 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-stone-950/50">
                    <div>
                        <h3 className="text-xl font-black text-white flex items-center gap-3">
                            <Box className="text-indigo-400" /> Save as Template
                        </h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X size={20} className="text-gray-400" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Template Name</label>
                        <input 
                            autoFocus
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Standard Crew Setup"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description (Optional)</label>
                        <textarea 
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="What does this template include?"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none h-24 resize-none"
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button onClick={onClose} className="flex-1 py-3 text-gray-400 font-bold hover:bg-white/5 rounded-xl transition-all">Cancel</button>
                        <button 
                            disabled={loading || !name.trim()}
                            onClick={() => onConfirm(name, description)}
                            className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Save Template
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- SMART ASSISTANT CHAT ---
const SmartAssistant = ({ messages, onSend, typing, onAddNode, onApplyTemplate }) => {
    const [input, setInput] = useState("");
    const scrollRef = useRef();

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, typing]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        onSend(input);
        setInput("");
    };

    return (
        <div className="flex flex-col h-full bg-black/20 rounded-2xl overflow-hidden border border-indigo-500/10">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.length === 0 && (
                    <div className="text-center py-10">
                        <Sparkles className="mx-auto text-indigo-500/40 mb-3" size={32} />
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Pinnacle AI Online</div>
                        <p className="text-[10px] text-gray-600 mt-2">Ask me to add staff, equipment, or suggest a template.</p>
                    </div>
                )}
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-xs font-medium leading-relaxed ${
                            msg.role === 'user' 
                            ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-900/20' 
                            : 'bg-white/5 border border-white/10 text-gray-300 rounded-tl-none'
                        }`}>
                            {msg.content}
                            
                            {/* Suggested Nodes */}
                            {msg.suggestedNodes?.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2 pt-3 border-t border-white/5">
                                    {msg.suggestedNodes.map((node, i) => (
                                        <button 
                                            key={i}
                                            onClick={() => onAddNode(node)}
                                            className="flex items-center gap-1.5 px-2 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg hover:bg-emerald-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-tighter"
                                        >
                                            <Plus size={10} /> {node.name}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Suggested Templates */}
                            {msg.suggestedTemplates?.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2 pt-3 border-t border-white/5">
                                    {msg.suggestedTemplates.map((tmpl, i) => (
                                        <button 
                                            key={i}
                                            onClick={() => onApplyTemplate(tmpl.id)}
                                            className="flex items-center gap-1.5 px-2 py-1.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-lg hover:bg-indigo-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-tighter"
                                        >
                                            <Box size={10} /> {tmpl.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {typing && (
                    <div className="flex justify-start animate-pulse">
                        <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tl-none flex gap-1">
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full opacity-60" />
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full opacity-30" />
                        </div>
                    </div>
                )}
            </div>
            <form onSubmit={handleSubmit} className="p-3 bg-black/40 border-t border-white/5 flex gap-2">
                <input 
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Command Pinnacle AI..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:border-indigo-500 outline-none transition-all placeholder-gray-600"
                />
                <button 
                    disabled={!input.trim()}
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg transition-all disabled:opacity-50 active:scale-95"
                >
                    <Target size={16} />
                </button>
            </form>
        </div>
    );
};

// --- DIARY LIST MODAL (INCREDIBLE UI UPGRADE) ---
const DiaryListModal = ({ isOpen, onClose, diaries, onSelect, onDelete }) => {
    const [search, setSearch] = useState('');
    const [filterProject, setFilterProject] = useState('all');

    if (!isOpen) return null;

    const filtered = diaries.filter(d => {
        const matchesSearch = d.Project?.name?.toLowerCase().includes(search.toLowerCase()) || 
                             new Date(d.date).toLocaleDateString().includes(search);
        const matchesProject = filterProject === 'all' || d.projectId === filterProject;
        return matchesSearch && matchesProject;
    });

    const uniqueProjects = Array.from(new Set(diaries.map(d => d.projectId).filter(Boolean)))
        .map(id => diaries.find(d => d.projectId === id)?.Project);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-fade-in">
            <div className="bg-[#0a0a0c] border border-white/10 w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-10 border-b border-white/5 flex justify-between items-start bg-gradient-to-b from-white/5 to-transparent">
                    <div>
                        <h3 className="text-4xl font-black text-white flex items-center gap-4 tracking-tighter">
                            <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-400 shadow-lg shadow-indigo-500/10">
                                <List size={32} />
                            </div>
                            DIARY VAULT
                        </h3>
                        <p className="text-gray-500 text-sm mt-2 font-bold uppercase tracking-[0.3em] flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            {diaries.length} PERSISTED JOURNALS FOUND
                        </p>
                    </div>
                    <button onClick={onClose} className="p-4 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/10 group">
                        <X size={24} className="text-gray-500 group-hover:text-white" />
                    </button>
                </div>

                {/* Filters Bar */}
                <div className="px-10 py-6 bg-white/[0.02] border-b border-white/5 flex flex-wrap gap-4 items-center">
                    <div className="relative flex-1 min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by date or project..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:border-indigo-500 outline-none transition-all placeholder-gray-700" 
                        />
                    </div>
                    <select 
                        value={filterProject}
                        onChange={e => setFilterProject(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-gray-400 focus:border-indigo-500 outline-none cursor-pointer"
                    >
                        <option value="all">All Projects</option>
                        {uniqueProjects.map(p => p && <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.03),transparent_50%)]">
                    {filtered.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center py-20 opacity-20">
                            <Box size={80} className="mb-6" />
                            <div className="text-2xl font-black uppercase tracking-widest">No Diaries Located</div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filtered.map(diary => {
                                const canvas = diary.canvasData?.[0] || {};
                                const staffCount = (canvas.items || []).filter(i => i.type === 'staff').length;
                                const equipCount = (canvas.items || []).filter(i => i.type === 'equipment').length;
                                const matCount = (canvas.items || []).filter(i => i.type === 'material').length;

                                return (
                                    <div 
                                        key={diary.id} 
                                        className="group relative bg-white/[0.03] border border-white/5 rounded-[2rem] p-6 hover:bg-white/[0.06] hover:border-indigo-500/30 transition-all duration-500 cursor-pointer overflow-hidden shadow-xl"
                                        onClick={() => { onSelect(diary); onClose(); }}
                                    >
                                        {/* Hover Glow */}
                                        <div className="absolute -inset-px bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                        
                                        <div className="flex justify-between items-start mb-6 relative z-10">
                                            <div>
                                                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">
                                                    {new Date(diary.date).toLocaleDateString(undefined, { weekday: 'long' })}
                                                </div>
                                                <div className="text-2xl font-black text-white tracking-tight">
                                                    {new Date(diary.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-mono font-black text-emerald-400">${parseFloat(diary.totalRevenue || 0).toLocaleString()}</div>
                                                <div className="text-[10px] font-black text-emerald-500/50 uppercase tracking-tighter">Gross Revenue</div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 relative z-10">
                                            <div className="flex items-center gap-3 p-3 bg-black/40 rounded-2xl border border-white/5 group-hover:border-white/10 transition-colors">
                                                <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400"><Folder size={16} /></div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider leading-none mb-1">Project</div>
                                                    <div className="text-sm font-black text-gray-200 truncate">{diary.Project?.name || 'Unassigned Workspace'}</div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="bg-black/20 rounded-2xl p-3 border border-white/5 flex flex-col items-center">
                                                    <User size={14} className="text-emerald-400 mb-1" />
                                                    <span className="text-xs font-black text-white">{staffCount}</span>
                                                    <span className="text-[8px] font-bold text-gray-600 uppercase">Staff</span>
                                                </div>
                                                <div className="bg-black/20 rounded-2xl p-3 border border-white/5 flex flex-col items-center">
                                                    <Wrench size={14} className="text-amber-400 mb-1" />
                                                    <span className="text-xs font-black text-white">{equipCount}</span>
                                                    <span className="text-[8px] font-bold text-gray-600 uppercase">Equip</span>
                                                </div>
                                                <div className="bg-black/20 rounded-2xl p-3 border border-white/5 flex flex-col items-center">
                                                    <Package size={14} className="text-cyan-400 mb-1" />
                                                    <span className="text-xs font-black text-white">{matCount}</span>
                                                    <span className="text-[8px] font-bold text-gray-600 uppercase">Mats</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Delete Button (Overlay) */}
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onDelete(diary.id); }}
                                            className="absolute bottom-6 right-6 p-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-2xl transition-all opacity-0 group-hover:opacity-100 border border-rose-500/20"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-white/5 bg-black/40 text-center">
                    <button 
                        onClick={onClose}
                        className="px-12 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all border border-white/10"
                    >
                        Close Vault
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- CONSTANTS ---
const DEFAULT_ALLOWANCES = [
    { id: 'a1', name: 'Height Allowance', rate: 2.50, allowanceType: 'hourly' },
    { id: 'a2', name: 'Dirt Money', rate: 1.85, allowanceType: 'hourly' },
    { id: 'a3', name: 'Meal Allowance', rate: 20.00, allowanceType: 'daily' },
    { id: 'a4', name: 'Confined Space', rate: 4.50, allowanceType: 'hourly' },
    { id: 'a5', name: 'First Aid', rate: 15.00, allowanceType: 'daily' }
];

const PaintDiary = () => {
  const navigate = useNavigate();
  const { theme, setActiveTheme, allThemes, activeTheme } = useDiaryTheme();
  const {
    selectedDate, setSelectedDate, currentEntry, setCurrentEntry, projects, selectedProject, setSelectedProject, projectJobs, selectedJobId, setSelectedJobId,
    selectedClient, setSelectedClient, staff, equipment, materials, isSaved, setIsSaved, isSaving, cost, revenue, profit, productivityScore,
    chatMessages, chatTyping, handleUpdateItem, handleRemoveItem, handleUpdateEdges, handleSave, handleSmartLog, handleSmartChat, smartLogLoading, generateId, overtimeThreshold, overtimeMultiplier, loadDiary, createNewDiary, handleDeleteDiary
  } = useDiaryEngine();

  const handlePrintToInvoice = () => {
      if (currentEntry.items.length === 0) {
          alert("Add items to the diary before invoicing.");
          return;
      }
      navigate('/invoices', { 
          state: { 
              diaryItems: currentEntry.items,
              projectId: selectedProject?.id,
              clientId: selectedClient?.id,
              clientName: selectedClient?.name,
              date: selectedDate
          } 
      });
  };

  const [showSmartLog, setShowSmartLog] = useState(false);
  const [showAestheticPicker, setShowAestheticPicker] = useState(false);
  const [resourceTab, setResourceTab] = useState('staff');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('canvas'); // 'canvas' | 'gantt'

  const handleAddSuggestedNode = (node) => {
      const position = { x: 400, y: 400 }; // Default center-ish
      handleConfirmItem({ ...node, position });
  };

  const handleApplySuggestedTemplate = async (tmplId) => {
      const template = templates.find(t => t.id === tmplId);
      if (template) {
          handleInstantiateTemplate(template, { x: 500, y: 100 });
      } else {
          // Fetch if not in current list
          try {
              const res = await api.get(`/diary-templates/${tmplId}`);
              handleInstantiateTemplate(res.data, { x: 500, y: 100 });
          } catch (e) { console.error(e); }
      }
  };
  
  // Templates State
  const [templates, setTemplates] = useState([]);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);

  const fetchTemplates = useCallback(async () => {
      try {
          const res = await api.get('/diary-templates');
          setTemplates(res.data);
      } catch (err) { console.error("Error fetching templates:", err); }
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const handleSaveTemplate = async (name, description) => {
      setTemplateLoading(true);
      try {
          // Prepare data: items, extraNodes, edges
          // Ensure all fields exist to satisfy backend validation
          const templateData = {
              items: currentEntry.items || [],
              extraNodes: currentEntry.extraNodes || [],
              edges: currentEntry.edges || []
          };
          
          await api.post('/diary-templates', {
              name,
              description,
              type: 'node-group',
              data: templateData,
              projectId: selectedProject?.id
          });
          
          await fetchTemplates();
          setShowSaveTemplate(false);
          alert("Template saved successfully!");
      } catch (err) {
          console.error("Error saving template:", err);
          alert("Failed to save template: " + (err.response?.data?.error || err.message));
      } finally {
          setTemplateLoading(false);
      }
  };

  const handleDeleteTemplate = async (id, e) => {
      e.stopPropagation();
      if (!confirm("Delete this template?")) return;
      try {
          await api.delete(`/diary-templates/${id}`);
          setTemplates(prev => prev.filter(t => t.id !== id));
      } catch (err) { console.error(err); }
  };

  // Custom Allowances
  const [customAllowances, setCustomAllowances] = useState(DEFAULT_ALLOWANCES);
  const [newAllowanceName, setNewAllowanceName] = useState('');
  const [newAllowanceRate, setNewAllowanceRate] = useState('');
  const [newAllowanceType, setNewAllowanceType] = useState('hourly');
  const [editingAllowanceId, setEditingAllowanceId] = useState(null);

  const handleAddAllowance = () => {
      if (!newAllowanceName || !newAllowanceRate) return;
      
      if (editingAllowanceId) {
          setCustomAllowances(prev => prev.map(a => a.id === editingAllowanceId ? {
              ...a,
              name: newAllowanceName,
              rate: parseFloat(newAllowanceRate),
              allowanceType: newAllowanceType
          } : a));
          setEditingAllowanceId(null);
      } else {
          const newAll = {
              id: `custom-${Date.now()}`,
              name: newAllowanceName,
              rate: parseFloat(newAllowanceRate),
              type: 'allowance',
              allowanceType: newAllowanceType // 'hourly' or 'daily'
          };
          setCustomAllowances([...customAllowances, newAll]);
      }
      setNewAllowanceName('');
      setNewAllowanceRate('');
      setNewAllowanceType('hourly');
  };

  const handleEditAllowance = (allowance) => {
      setNewAllowanceName(allowance.name);
      setNewAllowanceRate(allowance.rate);
      setNewAllowanceType(allowance.allowanceType);
      setEditingAllowanceId(allowance.id);
  };

  const handleDeleteAllowance = (id) => {
      setCustomAllowances(prev => prev.filter(a => a.id !== id));
      if (editingAllowanceId === id) {
          setEditingAllowanceId(null);
          setNewAllowanceName('');
          setNewAllowanceRate('');
      }
  };
  
  // Load/New Entry State
  const [showDiaryList, setShowDiaryList] = useState(false);
  const [diariesList, setDiariesList] = useState([]);

  // Pulse & AI State
  const [isPulseActive, setIsPulseActive] = useState(false);

  // Chronos Management
  const [selectedChronos, setSelectedChronos] = useState(null);
  const [connectedNodes, setConnectedNodes] = useState([]);

  // Pending drop item
  const [pendingItem, setPendingItem] = useState(null);

  const handleNodeClick = useCallback((event, node) => {
      if (node.type === 'chronos') {
          // Find connected items
          const connectedIds = currentEntry.edges
              .filter(e => e.source === node.id || e.target === node.id)
              .map(e => e.source === node.id ? e.target : e.source);
          
          const connected = currentEntry.items.filter(i => connectedIds.includes(i.id));
          // Also check extraNodes if they are attached
          const connectedExtras = currentEntry.extraNodes.filter(n => connectedIds.includes(n.id));
          
          // Map standard items to a node-like structure for the modal
          const mappedItems = connected.map(i => ({ id: i.id, type: 'diaryNode', data: { label: i.name, type: i.type, duration: i.duration } }));
          
          setSelectedChronos(node);
          setConnectedNodes([...mappedItems, ...connectedExtras]);
      }
  }, [currentEntry]);

  const handleInstantiateTemplate = useCallback((template, position) => {
      const { data } = template;
      if (!data) return;

      const { items = [], extraNodes = [], edges = [] } = data;
      
      // Calculate offset based on the first node found (to center drop)
      let firstNodePos = { x: 0, y: 0 };
      if (items.length > 0) firstNodePos = items[0].position || { x: 0, y: 0 };
      else if (extraNodes.length > 0) firstNodePos = extraNodes[0].position || { x: 0, y: 0 };

      const offsetX = position.x - firstNodePos.x;
      const offsetY = position.y - firstNodePos.y;

      // ID Mapping: Old ID -> New ID
      const idMap = {};

      // Process Items
      const newItems = items.map(item => {
          const newId = generateId();
          idMap[item.id] = newId;
          return {
              ...item,
              id: newId,
              position: { 
                  x: (item.position?.x || 0) + offsetX, 
                  y: (item.position?.y || 0) + offsetY 
              }
          };
      });

      // Process Extra Nodes
      const newExtraNodes = extraNodes.map(node => {
          const newId = generateId();
          idMap[node.id] = newId;
          return {
              ...node,
              id: newId,
              position: { 
                  x: (node.position?.x || 0) + offsetX, 
                  y: (node.position?.y || 0) + offsetY 
              },
              data: {
                  ...node.data,
                  onDelete: () => handleRemoveItem(newId) // Bind new delete handler
              }
          };
      });

      // Process Edges
      const newEdges = edges.map(edge => {
          const newSource = idMap[edge.source];
          const newTarget = idMap[edge.target];
          // Only create edge if both nodes exist in the new set
          if (newSource && newTarget) {
              return {
                  ...edge,
                  id: `e-${newSource}-${newTarget}-${Date.now()}`,
                  source: newSource,
                  target: newTarget
              };
          }
          return null;
      }).filter(Boolean);

      setCurrentEntry(prev => ({
          ...prev,
          items: [...prev.items, ...newItems],
          extraNodes: [...prev.extraNodes, ...newExtraNodes],
          edges: [...prev.edges, ...newEdges]
      }));
      setIsSaved(false);
  }, [generateId, setCurrentEntry, handleRemoveItem]);

  const handleDropItem = useCallback((item, position) => {
      if (item.type === 'template') {
          handleInstantiateTemplate(item, position);
      } else {
          setPendingItem({ ...item, position });
      }
  }, [handleInstantiateTemplate]);

  const handleConfirmItem = (details) => {
      const isExtraNode = ['chronos', 'delay', 'impact', 'wormhole', 'zone', 'photoNode'].includes(details.type);
      
      if (isExtraNode) {
          const newExtra = {
              id: generateId(),
              type: details.type,
              position: pendingItem.position,
              data: {
                  ...details,
                  label: details.name,
                  onDelete: () => handleRemoveItem(newExtra.id)
              }
          };
          setCurrentEntry(prev => ({ ...prev, extraNodes: [...prev.extraNodes, newExtra] }));
      } else {
          const newItem = { 
              id: generateId(), 
              dataId: details.id, 
              type: details.type, 
              name: details.name, 
              costRate: details.costRate,
              chargeRate: details.chargeRate,
              quantity: details.quantity, 
              duration: details.duration,
              startTime: details.startTime,
              note: details.note,
              position: pendingItem.position
          };
          setCurrentEntry(prev => ({ ...prev, items: [...prev.items, newItem] }));
      }
      
      setIsSaved(false);
      setPendingItem(null);
  };

  const handleAiSuggest = () => {
      setIsPulseActive(prev => !prev);
  };

  const handleLoadEntries = async () => {
      try {
          const res = await api.get('/paint-diaries');
          setDiariesList(res.data);
          setShowDiaryList(true);
      } catch (e) { console.error("Failed to load diaries", e); }
  };

  const internalHandleDeleteDiary = async (id) => {
      const success = await handleDeleteDiary(id);
      if (success) {
          // Refresh the list after successful delete
          const res = await api.get('/paint-diaries');
          setDiariesList(res.data);
      }
  };

  const handleNewEntry = () => {
      if (!isSaved && !confirm("Discard unsaved changes?")) return;
      createNewDiary();
  };

  const handleSelectDiary = (diary) => {
      loadDiary(diary);
  };

  const filteredResources = (resourceTab === 'staff' ? staff : resourceTab === 'equipment' ? equipment : materials).filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const stats = [
      { label: 'Daily Cost', value: `$${cost.toLocaleString()}`, color: 'text-rose-400' },
      { label: 'Revenue', value: `$${revenue.toLocaleString()}`, color: 'text-emerald-400' },
      { label: 'Profit', value: `$${profit.toLocaleString()}`, color: 'text-amber-400' },
      { label: 'Productivity', value: `${productivityScore}%`, color: 'text-blue-400' }
  ];

  return (
    <div className="min-h-screen p-4 md:p-8 animate-fade-in font-sans bg-[#050507] text-white">
        <AIAutoLogModal isOpen={showSmartLog} onClose={() => setShowSmartLog(false)} onConfirm={handleSmartLog} loading={smartLogLoading} />
        <SaveTemplateModal isOpen={showSaveTemplate} onClose={() => setShowSaveTemplate(false)} onConfirm={handleSaveTemplate} loading={templateLoading} />
        <AestheticPicker isOpen={showAestheticPicker} onClose={() => setShowAestheticPicker(false)} />
        <ItemDetailsModal isOpen={!!pendingItem} item={pendingItem} onClose={() => setPendingItem(null)} onConfirm={handleConfirmItem} overtimeThreshold={overtimeThreshold} overtimeMultiplier={overtimeMultiplier} />
        <DiaryListModal isOpen={showDiaryList} onClose={() => setShowDiaryList(false)} diaries={diariesList} onSelect={handleSelectDiary} onDelete={internalHandleDeleteDiary} />
        
        <ChronosManagerModal 
            isOpen={!!selectedChronos} 
            onClose={() => setSelectedChronos(null)} 
            chronosNode={selectedChronos}
            connectedNodes={connectedNodes}
            onUpdateNode={(id, ups) => handleUpdateItem(id, ups)}
            onUpdateItem={handleUpdateItem}
        />

        {/* POWER HEADER */}
        <div className="w-full px-4 mb-8">
            <PowerHeader 
                title="Paint Diary" 
                icon={Palette}
                stats={stats}
                isPulseActive={isPulseActive}
                onPulseToggle={() => setIsPulseActive(!isPulseActive)}
                onAiSuggest={handleAiSuggest}
                theme={theme.primary}
            >
                {/* Controls */}
                <div className="flex bg-black/40 rounded-xl p-1 border border-white/10 mr-2">
                    <button onClick={() => setViewMode('canvas')} className={`px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all ${viewMode === 'canvas' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}><Layout size={16} /></button>
                    <button onClick={() => setViewMode('gantt')} className={`px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all ${viewMode === 'gantt' ? `bg-${theme.primary}-600 text-white shadow-lg` : 'text-gray-500 hover:text-white'}`}><BarChart3 size={16} /></button>
                </div>

                {/* Aesthetic Switcher */}
                <button 
                    onClick={() => setShowAestheticPicker(true)}
                    className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-xl font-bold transition-all text-xs uppercase tracking-widest flex items-center gap-2"
                >
                    <Palette size={16} /> Aesthetic
                </button>

                <div className="h-8 w-px bg-white/10 mx-2 hidden lg:block"></div>

                <button onClick={handleNewEntry} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-xl font-bold transition-all text-xs uppercase tracking-wider flex items-center gap-2"><Plus size={16} /> New</button>
                <button onClick={handleLoadEntries} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-xl font-bold transition-all text-xs uppercase tracking-wider flex items-center gap-2"><List size={16} /> Load</button>
                <button onClick={() => setShowSaveTemplate(true)} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-xl font-bold transition-all text-xs uppercase tracking-wider flex items-center gap-2"><Box size={16} /> Template</button>
                <button onClick={handlePrintToInvoice} className={`px-4 py-2.5 bg-${theme.primary}-600/20 hover:bg-${theme.primary}-600/30 border border-${theme.primary}-500/20 text-${theme.primary}-400 rounded-xl font-bold transition-all text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-${theme.primary}-900/20`}><CreditCard size={16} /> Invoice</button>

                <button onClick={() => setShowSmartLog(true)} className={`flex items-center gap-2 px-4 py-2.5 bg-${theme.primary}-600/20 border border-${theme.primary}-500/30 text-${theme.primary}-400 rounded-xl font-bold hover:bg-${theme.primary}-600 hover:text-white transition-all shadow-lg shadow-${theme.primary}-900/20 text-xs uppercase tracking-wider`}><Sparkles size={16} /> AI Log</button>
                
                <DatePicker selected={selectedDate} onChange={(date) => { setSelectedDate(date); setIsSaved(false); }} className="px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white font-bold w-32 text-center cursor-pointer hover:border-indigo-500 transition-colors text-sm" />
                
                <select value={selectedProject?.id || ''} onChange={(e) => setSelectedProject(projects.find(x => x.id === e.target.value))} className="px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white font-bold min-w-[180px] hover:border-indigo-500 transition-colors cursor-pointer text-sm"><option value="">Select Project...</option>{projects.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}</select>
                
                {selectedProject && (
                    <select value={selectedJobId || ''} onChange={(e) => setSelectedJobId(e.target.value)} className="px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white font-bold min-w-[140px] animate-fade-in hover:border-indigo-500 transition-colors cursor-pointer text-sm"><option value="">-- No Job Ref --</option>{projectJobs.map(j => (<option key={j.id} value={j.id}>#{j.jobNumber} - {j.serviceType}</option>))}</select>
                )}
                
                <button onClick={handleSave} disabled={isSaving} className={`px-6 py-2.5 ${theme.button} text-white rounded-xl font-black uppercase tracking-widest shadow-xl transition-all disabled:opacity-50 text-xs`}>{isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save'}</button>
            </PowerHeader>
        </div>

        {/* MAIN WORKSPACE */}
        <div className="w-full px-4 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 min-h-[700px]">
            {/* RESOURCE DOCK */}
            <div className={`${theme.bg} backdrop-blur-xl border ${theme.border} rounded-[2rem] p-6 flex flex-col overflow-hidden ${theme.glow} h-[700px] relative`}>
                <div className={`absolute inset-0 bg-gradient-to-b from-${theme.primary}-500/5 to-transparent pointer-events-none`}></div>
                
                <div className="mb-6 relative z-10">
                    <h3 className={`text-xs font-black ${theme.text} uppercase tracking-widest mb-4 flex items-center gap-2`}><Package size={14}/> Resource Library</h3>
                    <div className="relative">
                        <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 text-${theme.primary}-500/50`} />
                        <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={`w-full bg-black/40 border ${theme.border} rounded-xl pl-9 pr-4 py-3 text-sm text-white focus:border-${theme.primary}-500 outline-none transition-all placeholder-${theme.primary}-700/50`} />
                    </div>
                </div>
                
                <div className="flex gap-1 mb-4 p-1 bg-black/40 rounded-xl relative z-10 border border-white/5 flex-wrap">
                    {['staff', 'equipment', 'material', 'time', 'allowance', 'templates', 'photos', 'ai'].map(t => (
                        <button key={t} onClick={() => setResourceTab(t)} className={`flex-1 min-w-[40px] py-2 rounded-lg text-[10px] font-black uppercase transition-all ${resourceTab === t ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : `text-${theme.primary}-500/60 hover:text-${theme.primary}-300`}`}>
                            {t === 'time' ? 'Time' : t === 'equipment' ? 'Eqp' : t === 'material' ? 'Mat' : t === 'photos' ? 'Img' : t === 'allowance' ? '$$$' : t === 'templates' ? 'Tmpl' : t === 'ai' ? 'AI' : 'Staff'}
                        </button>
                    ))}
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1 relative z-10">
                    {resourceTab === 'photos' ? (
                        <div className="space-y-4">
                            <label className="block w-full p-4 border-2 border-dashed border-emerald-500/20 rounded-2xl text-center cursor-pointer hover:bg-emerald-500/5 transition-all group">
                                <input type="file" multiple accept="image/*" className="hidden" onChange={async (e) => {
                                    const files = Array.from(e.target.files);
                                    for (const file of files) {
                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                            const photo = { id: generateId(), name: file.name, type: 'photoNode', url: event.target.result };
                                            setCurrentEntry(prev => ({ ...prev, photos: [...(prev.photos || []), photo] }));
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }} />
                                <Camera className="mx-auto text-emerald-500/40 group-hover:text-emerald-400 mb-2" size={24} />
                                <div className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest">Upload Evidence</div>
                            </label>
                            
                            {(currentEntry.photos || []).map(img => (
                                <div key={img.id} draggable onDragStart={(e) => {
                                    e.dataTransfer.setData('application/reactflow', JSON.stringify(img));
                                    e.dataTransfer.effectAllowed = 'move';
                                }} className="group relative aspect-video rounded-xl overflow-hidden border border-emerald-500/20 cursor-grab active:cursor-grabbing">
                                    <img src={img.url} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="text-[8px] font-black text-white uppercase tracking-[0.2em]">Drag to Canvas</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : resourceTab === 'templates' ? (
                        <>
                            <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-1 mb-2">Saved Templates</div>
                            {templates.length === 0 ? (
                                <div className="text-center py-8 text-gray-500 text-xs">
                                    No templates yet.<br/>Create a layout and click "Template" in the header.
                                </div>
                            ) : (
                                templates.map(t => (
                                    <div key={t.id} className="relative group">
                                        <div 
                                            draggable
                                            onDragStart={(e) => {
                                                const dragData = { type: 'template', ...t };
                                                e.dataTransfer.setData('application/reactflow', JSON.stringify(dragData));
                                                e.dataTransfer.effectAllowed = 'move';
                                            }}
                                            className="bg-indigo-900/20 border border-indigo-500/30 p-3 rounded-xl hover:border-indigo-400 transition-all cursor-grab active:cursor-grabbing group-hover:shadow-lg shadow-indigo-900/20"
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <Box size={14} className="text-indigo-400" />
                                                <span className="text-xs font-bold text-gray-200">{t.name}</span>
                                            </div>
                                            {t.description && <div className="text-[10px] text-gray-500 truncate">{t.description}</div>}
                                            <div className="text-[9px] text-indigo-500/60 font-mono mt-1 uppercase tracking-wider">
                                                {t.data?.items?.length || 0} Items • {t.data?.edges?.length || 0} Links
                                            </div>
                                        </div>
                                        <button 
                                            onClick={(e) => handleDeleteTemplate(t.id, e)}
                                            className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg text-rose-400 hover:bg-rose-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </>
                    ) : resourceTab === 'ai' ? (
                        <SmartAssistant 
                            messages={chatMessages} 
                            onSend={handleSmartChat} 
                            typing={chatTyping} 
                            onAddNode={handleAddSuggestedNode}
                            onApplyTemplate={handleApplySuggestedTemplate}
                        />
                    ) : resourceTab === 'time' ? (
                        <>
                            <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest px-1 mb-2 pt-2">Operational Events</div>
                            <DraggableItem item={{ id: 'c1', name: 'Standard Shift', type: 'chronos', duration: 8, startTime: '07:00', finishTime: '15:00' }} />
                            <DraggableItem item={{ id: 'c2', name: 'Lunch Break', type: 'chronos', duration: 0.5 }} />
                            <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest px-1 mb-2 mt-4">Site Impacts</div>
                            <DraggableItem item={{ id: 'd1', name: 'Weather Delay', type: 'delay', duration: 1, reason: 'Heavy Rain' }} />
                            <DraggableItem item={{ id: 'd2', name: 'Site Blocked', type: 'delay', duration: 1, reason: 'Access Issues' }} />
                            <DraggableItem item={{ id: 'i1', name: 'High Heat', type: 'impact', prodImpact: 0.7, costImpact: 1.1, condition: 'Restricted' }} />
                        </>
                    ) : resourceTab === 'allowance' ? (
                        <>
                             <div className="bg-amber-900/20 border border-amber-500/20 rounded-xl p-3 mb-4">
                                 <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">
                                     {editingAllowanceId ? 'Edit Allowance' : 'Create New Allowance'}
                                 </div>
                                 <div className="space-y-2">
                                     <input 
                                        type="text" 
                                        placeholder="Allowance Name (e.g. Danger Pay)" 
                                        value={newAllowanceName}
                                        onChange={e => setNewAllowanceName(e.target.value)}
                                        className="w-full bg-black/40 border border-amber-500/30 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 outline-none"
                                     />
                                     <div className="flex gap-2">
                                         <div className="relative flex-1">
                                             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 text-xs">$</span>
                                             <input 
                                                type="number" 
                                                placeholder="Rate" 
                                                value={newAllowanceRate}
                                                onChange={e => setNewAllowanceRate(e.target.value)}
                                                className="w-full bg-black/40 border border-amber-500/30 rounded-lg pl-6 pr-2 py-2 text-xs text-white focus:border-amber-500 outline-none"
                                             />
                                         </div>
                                         <select 
                                            value={newAllowanceType} 
                                            onChange={e => setNewAllowanceType(e.target.value)}
                                            className="bg-black/40 border border-amber-500/30 rounded-lg px-2 py-2 text-xs text-amber-400 focus:border-amber-500 outline-none"
                                         >
                                             <option value="hourly">/ Hr</option>
                                             <option value="daily">/ Day</option>
                                         </select>
                                     </div>
                                     <div className="flex gap-2">
                                         <button 
                                            onClick={handleAddAllowance}
                                            disabled={!newAllowanceName || !newAllowanceRate}
                                            className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                                         >
                                             {editingAllowanceId ? 'Update' : 'Add to Library'}
                                         </button>
                                         {editingAllowanceId && (
                                             <button 
                                                onClick={() => { setEditingAllowanceId(null); setNewAllowanceName(''); setNewAllowanceRate(''); }}
                                                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                                             >
                                                 <X size={14} />
                                             </button>
                                         )}
                                     </div>
                                 </div>
                             </div>

                             <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest px-1 mb-2">Allowance Library</div>
                             {customAllowances.map(item => (
                                 <div key={item.id} className="relative group">
                                     <DraggableItem item={{ ...item, type: 'allowance', rate: item.rate, allowanceType: item.allowanceType }} />
                                     <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 rounded-lg p-1 backdrop-blur-sm border border-white/10">
                                         <button onClick={() => handleEditAllowance(item)} className="p-1.5 hover:bg-white/20 rounded text-amber-400"><Edit2 size={12} /></button>
                                         <button onClick={() => handleDeleteAllowance(item.id)} className="p-1.5 hover:bg-rose-500/20 rounded text-rose-400"><Trash2 size={12} /></button>
                                     </div>
                                 </div>
                             ))}
                             {customAllowances.length === 0 && <div className="text-xs text-white/20 italic px-2 mb-4">No allowances available. Create one above.</div>}
                        </>
                    ) : (
                        filteredResources.map(item => (
                            <DraggableItem key={item.id} item={{...item, type: resourceTab}} />
                        ))
                    )}
                </div>
            </div>

            {/* CANVAS / GANTT AREA */}
            <div className={`${theme.bg} backdrop-blur-xl border ${theme.border} rounded-[2rem] p-1 relative shadow-2xl overflow-hidden flex flex-col h-[700px]`}>
                {/* Background Grid for visual depth */}
                <div className={`absolute inset-0 bg-[linear-gradient(to_right,#${theme.accent.replace('#','') }05_1px,transparent_1px),linear-gradient(to_bottom,#${theme.accent.replace('#','') }05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none`}></div>
                
                {viewMode === 'canvas' ? (
                    <div className={`flex-1 relative rounded-[1.8rem] overflow-hidden bg-black/20 border ${theme.border}`}>
                        <TimelineCanvas 
                            items={currentEntry.items} 
                            extraNodes={currentEntry.extraNodes}
                            edges={currentEntry.edges}
                            onDrop={handleDropItem} 
                            onUpdateItem={handleUpdateItem} 
                            onRemoveItem={handleRemoveItem} 
                            onNodeClick={handleNodeClick}
                            onUpdateEdges={handleUpdateEdges}
                            isPulseActive={isPulseActive} 
                        />
                    </div>
                ) : (
                    <div className={`flex-1 relative rounded-[1.8rem] overflow-hidden bg-black/20 p-2 border ${theme.border}`}>
                        <DiaryGantt items={currentEntry.items} />
                    </div>
                )}
            </div>
        </div>

        {/* ITEM LIST - BOTTOM */}
        <div className="w-full px-4 mt-6 pb-10">
            <ItemList items={currentEntry.items} onUpdate={handleUpdateItem} onRemove={handleRemoveItem} overtimeThreshold={overtimeThreshold} />
        </div>
    </div>
  );
};

export default PaintDiary;