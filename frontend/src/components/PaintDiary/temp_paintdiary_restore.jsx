import React, { useState, useCallback, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { 
  Palette, Calendar, Plus, Sparkles, List, Save, FileText, MapPin, Camera, Clock, ImageIcon, Eye, Wand2, DollarSign, TrendingUp, Award, Target, Wrench, X, Loader2, User, Package, Box, BarChart3, Layout, ChevronDown, Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useDiaryEngine } from './DiaryEngine';
import TimelineCanvas from '../TimelineCanvas';
import ClientSelector from '../Clients/ClientSelector';
import ItemDetailsModal from './ItemDetailsModal';
import DiaryGantt from './DiaryGantt';
import ItemList from './ItemList';
import PowerHeader from '../ui/PowerHeader';

// --- DRAGGABLE ITEM COMPONENT ---
const DraggableItem = ({ item }) => {
    const onDragStart = (event) => {
        // NORMALIZE DATA FOR DRAG PAYLOAD
        const dragItem = { ...item };
        
        if (item.type === 'staff') {
            dragItem.costRate = item.payRateBase || 0;
            dragItem.chargeRate = item.chargeOutBase || 0;
        } else if (item.type === 'equipment') {
            dragItem.costRate = item.costRateBase || 0;
            dragItem.chargeRate = item.chargeOutBase || 0;
        } else if (item.type === 'material') {
            dragItem.costRate = item.pricePerUnit || 0;
            dragItem.chargeRate = (item.pricePerUnit || 0) * 1.2;
        }

        event.dataTransfer.setData('application/reactflow', JSON.stringify(dragItem));
        event.dataTransfer.effectAllowed = 'move';
    };

    let icon = <Box size={16} className="text-gray-400" />;
    let bg = "bg-stone-800";
    if (item.type === 'staff') { icon = <User size={16} className="text-emerald-400" />; bg = "hover:border-emerald-500/50"; }
    else if (item.type === 'equipment') { icon = <Wrench size={16} className="text-amber-400" />; bg = "hover:border-amber-500/50"; }
    else if (item.type === 'material') { icon = <Package size={16} className="text-blue-400" />; bg = "hover:border-blue-500/50"; }

    return (
        <div 
            draggable 
            onDragStart={onDragStart}
            className={`flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-stone-900/50 cursor-grab active:cursor-grabbing transition-all ${bg} hover:bg-stone-800`}
        >
            <div className="p-2 bg-black/20 rounded-lg">{icon}</div>
            <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white truncate">{item.name}</div>
                <div className="text-[10px] text-gray-500 font-mono">
                    {item.type === 'staff' ? `$${item.chargeOutBase || 0}/hr` : `$${item.pricePerUnit || item.costRateBase || 0}`}
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
                            onClick={() => { onConfirm(prompt); setPrompt(""); onClose(); }}
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

// --- DIARY LIST MODAL ---
const DiaryListModal = ({ isOpen, onClose, diaries, onSelect }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-stone-900 border border-white/10 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[80vh]">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-stone-950/50">
                    <div>
                        <h3 className="text-xl font-black text-white flex items-center gap-3">
                            <List className="text-indigo-400" /> Saved Diaries
                        </h3>
                        <p className="text-gray-500 text-xs mt-1 font-bold uppercase tracking-widest">Select an entry to load</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X size={20} className="text-gray-400" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {diaries.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">No saved diaries found.</div>
                    ) : (
                        diaries.map(diary => (
                            <div 
                                key={diary.id} 
                                onClick={() => { onSelect(diary); onClose(); }}
                                className="p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 cursor-pointer transition-all flex justify-between items-center group"
                            >
                                <div>
                                    <div className="font-bold text-white text-sm">{new Date(diary.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
                                    <div className="text-xs text-gray-500 flex gap-2 mt-1">
                                        <span className="flex items-center gap-1"><MapPin size={10}/> {diary.Project?.name || 'No Project'}</span>
                                        {diary.job && <span className="text-indigo-400">#{diary.job.jobNumber}</span>}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono font-bold text-emerald-400 text-sm">${parseFloat(diary.totalRevenue || 0).toLocaleString()}</div>
                                    <div className="text-[10px] text-gray-600 font-bold uppercase">{diary.canvasData?.[0]?.items?.length || 0} Items</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const PaintDiary = () => {
  const navigate = useNavigate();
  const {
    selectedDate, setSelectedDate, currentEntry, setCurrentEntry, projects, selectedProject, setSelectedProject, projectJobs, selectedJobId, setSelectedJobId,
    selectedClient, setSelectedClient, staff, equipment, materials, isSaved, setIsSaved, isSaving, cost, revenue, profit, productivityScore,
    handleUpdateItem, handleRemoveItem, handleSave, handleSmartLog, smartLogLoading, generateId, overtimeThreshold, overtimeMultiplier
  } = useDiaryEngine();

  const [showSmartLog, setShowSmartLog] = useState(false);
  const [resourceTab, setResourceTab] = useState('staff');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('canvas'); // 'canvas' | 'gantt'
  
  // Load/New Entry State
  const [showDiaryList, setShowDiaryList] = useState(false);
  const [diariesList, setDiariesList] = useState([]);

  // Pulse & AI State
  const [isPulseActive, setIsPulseActive] = useState(false);

  // Pending drop item
  const [pendingItem, setPendingItem] = useState(null);

  const handleDropItem = useCallback((item, position) => {
      setPendingItem({ ...item, position });
  }, []);

  const handleConfirmItem = (details) => {
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

  const handleNewEntry = () => {
      if (!isSaved && !confirm("Discard unsaved changes?")) return;
      setCurrentEntry({ id: generateId(), time: new Date().toLocaleTimeString(), items: [], photos: [], voiceNotes: [], location: null, note: '' });
      setSelectedDate(new Date());
      setSelectedProject(null);
      setSelectedJobId(null);
      setIsSaved(true);
  };

  const handleSelectDiary = (diary) => {
      if (!diary) return;
      // Load diary data into state
      setSelectedDate(new Date(diary.date));
      setSelectedProject(projects.find(p => p.id === diary.projectId) || null);
      setSelectedJobId(diary.jobId || null);
      // Assuming canvasData[0] is the main entry for now as per current structure
      const entry = diary.canvasData?.[0] || { id: generateId(), items: [] };
      setCurrentEntry(entry);
      setIsSaved(true);
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
        <ItemDetailsModal isOpen={!!pendingItem} item={pendingItem} onClose={() => setPendingItem(null)} onConfirm={handleConfirmItem} overtimeThreshold={overtimeThreshold} overtimeMultiplier={overtimeMultiplier} />
        <DiaryListModal isOpen={showDiaryList} onClose={() => setShowDiaryList(false)} diaries={diariesList} onSelect={handleSelectDiary} />

        {/* POWER HEADER */}
        <div className="max-w-[1800px] mx-auto mb-8">
            <PowerHeader 
                title="Paint Diary" 
                icon={Palette}
                stats={stats}
                isPulseActive={isPulseActive}
                onPulseToggle={() => setIsPulseActive(!isPulseActive)}
                onAiSuggest={handleAiSuggest}
            >
                {/* Controls */}
                <div className="flex bg-black/40 rounded-xl p-1 border border-white/10 mr-2">
                    <button onClick={() => setViewMode('canvas')} className={`px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all ${viewMode === 'canvas' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}><Layout size={16} /></button>
                    <button onClick={() => setViewMode('gantt')} className={`px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all ${viewMode === 'gantt' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}><BarChart3 size={16} /></button>
                </div>

                <div className="h-8 w-px bg-white/10 mx-2 hidden lg:block"></div>

                <button onClick={handleNewEntry} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-xl font-bold transition-all text-xs uppercase tracking-wider flex items-center gap-2"><Plus size={16} /> New</button>
                <button onClick={handleLoadEntries} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-xl font-bold transition-all text-xs uppercase tracking-wider flex items-center gap-2"><List size={16} /> Load</button>

                <button onClick={() => setShowSmartLog(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-xl font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-lg shadow-indigo-900/20 text-xs uppercase tracking-wider"><Sparkles size={16} /> AI Log</button>
                
                <DatePicker selected={selectedDate} onChange={(date) => { setSelectedDate(date); setIsSaved(false); }} className="px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white font-bold w-32 text-center cursor-pointer hover:border-indigo-500 transition-colors text-sm" />
                
                <select value={selectedProject?.id || ''} onChange={(e) => setSelectedProject(projects.find(x => x.id === e.target.value))} className="px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white font-bold min-w-[180px] hover:border-indigo-500 transition-colors cursor-pointer text-sm"><option value="">Select Project...</option>{projects.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}</select>
                
                {selectedProject && (
                    <select value={selectedJobId || ''} onChange={(e) => setSelectedJobId(e.target.value)} className="px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white font-bold min-w-[140px] animate-fade-in hover:border-indigo-500 transition-colors cursor-pointer text-sm"><option value="">-- No Job Ref --</option>{projectJobs.map(j => (<option key={j.id} value={j.id}>#{j.jobNumber} - {j.serviceType}</option>))}</select>
                )}
                
                <button onClick={handleSave} disabled={isSaving} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black uppercase tracking-widest shadow-xl transition-all disabled:opacity-50 text-xs">{isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save'}</button>
            </PowerHeader>
        </div>

        {/* MAIN WORKSPACE */}
        <div className="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 min-h-[700px]">
            {/* RESOURCE DOCK */}
            <div className="bg-stone-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 flex flex-col overflow-hidden shadow-2xl h-[700px] relative">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
                <div className="mb-6 relative z-10">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Resource Library</h3>
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm text-white focus:border-indigo-500 outline-none transition-all placeholder-gray-600" />
                    </div>
                </div>
                
                <div className="flex gap-1 mb-4 p-1 bg-black/40 rounded-xl relative z-10">
                    {['staff', 'equipment', 'material'].map(t => (
                        <button key={t} onClick={() => setResourceTab(t)} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${resourceTab === t ? 'bg-white/10 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}>{t}</button>
                    ))}
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1 relative z-10">
                    {filteredResources.map(item => (
                        <DraggableItem key={item.id} item={{...item, type: resourceTab}} />
                    ))}
                </div>
            </div>

            {/* CANVAS / GANTT AREA */}
            <div className="bg-stone-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-1 relative shadow-2xl overflow-hidden flex flex-col h-[700px]">
                {/* Background Grid for visual depth */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
                
                {viewMode === 'canvas' ? (
                    <div className="flex-1 relative rounded-[1.8rem] overflow-hidden bg-black/20">
                        <TimelineCanvas 
                            items={currentEntry.items} 
                            extraNodes={currentEntry.extraNodes}
                            edges={currentEntry.edges}
                            onDrop={handleDropItem} 
                            onUpdateItem={handleUpdateItem} 
                            onRemoveItem={handleRemoveItem} 
                            isPulseActive={isPulseActive} 
                        />
                    </div>
                ) : (
                    <div className="flex-1 relative rounded-[1.8rem] overflow-hidden bg-black/20 p-2">
                        <DiaryGantt items={currentEntry.items} />
                    </div>
                )}
            </div>
        </div>

        {/* ITEM LIST - BOTTOM */}
        <div className="max-w-[1800px] mx-auto mt-6 pb-10">
            <ItemList items={currentEntry.items} onUpdate={handleUpdateItem} onRemove={handleRemoveItem} />
        </div>
    </div>
  );
};

export default PaintDiary;
