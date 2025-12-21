/*
 * MasterDiaryApp Official - Paint Your Day Diary
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 */
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { api } from '../utils/api'
import {
  Plus, Calendar, Save, Trash2, DollarSign, TrendingUp, BarChart3,
  FileText, Users, Wrench, Palette, Clock, Eye, EyeOff, MapPin, UploadCloud,
  Search, Package, Edit, Zap
} from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import MapBackground from './MapBackground'
import GeoreferenceModal from './GeoreferenceModal'
import PowerHeader from './ui/PowerHeader'
import { useNotification } from '../context/NotificationContext'

const DraggableElement = ({ item, children }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'diary-item',
    item: item,
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }))
  return (
    <div ref={drag} className={`transition-all duration-200 ${isDragging ? 'opacity-50 scale-105 cursor-grabbing' : 'opacity-100 scale-100 cursor-grab'}`}>
      {children}
    </div>
  )
}

const DropZone = ({ entryId, onDrop, children, isHighlighted }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'diary-item',
    drop: (item) => { onDrop(item, entryId); return undefined; },
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  }))
  return (
    <div ref={drop} className={`border-2 border-dashed rounded-xl transition-all duration-300 min-h-[60px] flex items-center justify-center p-5 ${isOver || isHighlighted ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : 'border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700/30 text-gray-500'}`}>
      {children || <div className="text-center"><Plus size={24} className="mb-2 mx-auto opacity-70" /><div className="font-medium">Drop items here</div></div>}
    </div>
  )
}

const DiaryEntry = ({ entry, onUpdate, onDelete, onDropItem, isDropTarget }) => {
  const [isEditing, setIsEditing] = useState(false); const [noteText, setNoteText] = useState(entry.note);
  const handleSaveNote = () => { onUpdate(entry.id, { note: noteText }); setIsEditing(false); }
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 mb-4 border border-gray-200 dark:border-gray-700 shadow-sm relative animate-fade-in">
      <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
        <div className="flex items-center gap-3"><Clock size={20} className="text-emerald-500" /><span className="text-lg font-bold text-gray-800 dark:text-white">{entry.time}</span></div>
        <button onClick={() => onDelete(entry.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-500/10"><Trash2 size={18} /></button>
      </div>
      <div className="mb-4">
        {isEditing ? (
          <div className="space-y-2">
            <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Write about your work..." className="w-full min-h-[80px] p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none text-sm" />
            <div className="flex justify-end gap-2"><button onClick={() => setIsEditing(false)} className="px-3 py-1.5 bg-gray-200 dark:bg-gray-600 text-gray-700 rounded text-sm font-medium transition-colors">Cancel</button><button onClick={handleSaveNote} className="px-3 py-1.5 bg-emerald-600 text-white rounded text-sm font-medium transition-colors">Save Note</button></div>
          </div>
        ) : (
          <div className="group">
            {entry.note ? <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">{entry.note}</p> : <p className="text-gray-400 italic text-sm">No notes yet.</p>}
            <button onClick={() => setIsEditing(true)} className="mt-2 flex items-center gap-1 text-xs text-emerald-500 hover:text-emerald-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity"><Edit size={12} />Edit Note</button>
          </div>
        )}
      </div>
      <div>
        <h4 className="mb-3 text-sm font-bold text-gray-500 uppercase tracking-wider">Work Details</h4>
        <div className="flex flex-col gap-2 mb-4">
          {entry.items.map(item => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${item.type === 'staff' ? 'bg-emerald-500/10 text-emerald-500' : item.type === 'equipment' ? 'bg-amber-500/10 text-amber-500' : item.type === 'chronos' ? 'bg-cyan-500/10 text-cyan-500' : item.type === 'delay' ? 'bg-rose-500/10 text-rose-500' : 'bg-purple-500/10 text-purple-500'}`}>
                  {item.type === 'staff' ? <Users size={16} /> : item.type === 'equipment' ? <Wrench size={16} /> : item.type === 'chronos' ? <Clock size={16} /> : item.type === 'delay' ? <TrendingUp size={16} className="rotate-180" /> : <DollarSign size={16} />}
                </div>
                <div><div className="font-medium text-gray-800 dark:text-white text-sm">{item.name}</div><div className="text-[10px] text-gray-500 uppercase font-bold">{item.type === 'chronos' || item.type === 'delay' ? 'Time Event' : `${item.duration}h @ ${item.cost}`}</div></div>
              </div>
            </div>
          ))}
        </div>
        <DropZone entryId={entry.id} onDrop={onDropItem} isHighlighted={isDropTarget} />
      </div>
    </div>
  )
}

const DiaryToolbar = () => {
  const [staff, setStaff] = useState([]); const [equipment, setEquipment] = useState([]); const [materials, setMaterials] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => { const fetchData = async () => { try { const [s, e, m] = await Promise.all([api.get('/staff'), api.get('/equipment'), api.get('/nodes')]); setStaff(s.data.data || s.data); setEquipment(e.data.data || e.data); setMaterials(m.data.data || m.data); } catch(err) { console.error(err); } }; fetchData(); }, []);
  const filter = (items) => items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const renderCard = (item, type) => {
      let wrapper = "bg-gradient-to-r from-indigo-600/20 to-indigo-900/20 border-indigo-500/30"; let iconC = "bg-indigo-500/20 text-indigo-400"; let icon = <Package size={16} />;
      if (type === 'staff') { wrapper = "bg-gradient-to-r from-emerald-600/20 to-emerald-900/20 border-emerald-500/30"; iconC = "bg-emerald-500/20 text-emerald-400"; icon = <Users size={16} />; }
      else if (type === 'equipment') { wrapper = "bg-gradient-to-r from-amber-600/20 to-amber-900/20 border-amber-500/30"; iconC = "bg-amber-500/20 text-amber-400"; icon = <Wrench size={16} />; }
      else if (type === 'chronos') { wrapper = "bg-gradient-to-r from-cyan-600/20 to-cyan-900/20 border-cyan-500/30"; iconC = "bg-cyan-500/20 text-cyan-400"; icon = <Clock size={16} />; }
      else if (type === 'delay') { wrapper = "bg-gradient-to-r from-rose-600/20 to-rose-900/20 border-rose-500/30"; iconC = "bg-rose-500/20 text-rose-400"; icon = <TrendingUp size={16} className="rotate-180" />; }
      return (
        <div className={`group relative flex items-center gap-3 p-3 rounded-xl border cursor-grab active:cursor-grabbing transition-all hover:translate-x-1 ${wrapper} mb-2`}>
          <div className={`p-2 rounded-lg ${iconC} group-hover:scale-110 transition-transform`}>{icon}</div>
          <div className="flex-1 min-w-0"><div className="text-xs font-bold text-white truncate">{item.name}</div><div className="text-[10px] text-gray-500 font-mono">{type === 'staff' ? `${item.chargeOutBase || 0}/hr` : type === 'equipment' ? `${item.costRateBase || 0}/day` : type==='chronos'?'Time':'Impact'}</div></div>
        </div>
      );
  };
  return (
    <div className="w-full lg:w-80 bg-[#0a0a0c]/95 backdrop-blur-xl border border-white/5 shadow-2xl sticky top-6 h-[calc(100vh-4rem)] flex flex-col rounded-2xl overflow-hidden">
      <div className="p-5 border-b border-white/5 bg-stone-900/50">
        <h3 className="text-sm font-black text-white uppercase flex items-center gap-2 mb-4"><Palette size={16} className="text-emerald-500" /> Resources</h3>
        <div className="relative group"><Search className="absolute left-3 top-2.5 text-gray-500" size={14} /><input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-emerald-500 outline-none" /></div>
        <div className="flex gap-1 mt-4 p-1 bg-black/40 rounded-lg">
            {['all', 'mat', 'lab', 'eqp', 'time'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${activeTab === tab ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>{tab}</button>
            ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {(activeTab === 'all' || activeTab === 'time') && (
            <div><div className="text-[10px] font-black text-cyan-500/80 uppercase tracking-widest px-1 mb-2">Time & Impact</div>
                <DraggableElement item={{ type: 'chronos', id: 'c1', name: 'Start Day', data: {} }}>{renderCard({ name: 'Start Day' }, 'chronos')}</DraggableElement>
                <DraggableElement item={{ type: 'chronos', id: 'c2', name: 'Lunch Break', data: {} }}>{renderCard({ name: 'Lunch Break' }, 'chronos')}</DraggableElement>
                <DraggableElement item={{ type: 'delay', id: 'd1', name: 'Weather Delay', data: {} }}>{renderCard({ name: 'Weather Delay' }, 'delay')}</DraggableElement>
                <DraggableElement item={{ type: 'delay', id: 'd2', name: 'Site Blocked', data: {} }}>{renderCard({ name: 'Site Blocked' }, 'delay')}</DraggableElement>
            </div>
        )}
        {(activeTab === 'all' || activeTab === 'lab') && (<div><div className="text-[10px] font-black text-emerald-500/80 uppercase px-1 mb-2">Staff</div>{filter(staff).map(m => (<DraggableElement key={m.id} item={{ type: 'staff', id: m.id, name: m.name, data: m }}>{renderCard(m, 'staff')}</DraggableElement>))}</div>)}
        {(activeTab === 'all' || activeTab === 'eqp') && (<div><div className="text-[10px] font-black text-amber-500/80 uppercase px-1 mb-2">Equipment</div>{filter(equipment).map(m => (<DraggableElement key={m.id} item={{ type: 'equipment', id: m.id, name: m.name, data: m }}>{renderCard(m, 'equipment')}</DraggableElement>))}</div>)}
        {(activeTab === 'all' || activeTab === 'mat') && (<div><div className="text-[10px] font-black text-indigo-500/80 uppercase px-1 mb-2">Materials</div>{filter(materials).map(m => (<DraggableElement key={m.id} item={{ type: 'material', id: m.id, name: m.name, data: m }}>{renderCard(m, 'material')}</DraggableElement>))}</div>)}
      </div>
    </div>
  )
}

const PaintDiary = () => {
  const navigate = useNavigate(); const { addNotification } = useNotification();
  const [selectedDate, setSelectedDate] = useState(new Date()); const [diaryEntries, setDiaryEntries] = useState([]);
  const [totalCost, setTotalCost] = useState(0); const [totalRevenue, setTotalRevenue] = useState(0);
  const [isSaved, setIsSaved] = useState(true); const [selectedProject, setSelectedProject] = useState('');
  const [showMap, setShowMap] = useState(false); const [sessionLocation, setSessionLocation] = useState(null);
  const [showGeoModal, setShowGeoModal] = useState(false); const [sitePlan, setSitePlan] = useState(null);
  const [projects, setProjects] = useState([]); const [isPulseActive, setIsPulseActive] = useState(false);
  const [dropTargetEntry, setDropTargetEntry] = useState(null); const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => { const load = async () => { try { const res = await api.get('/projects'); setProjects(res.data.data || res.data); } catch(e){} }; load(); }, []);
  useEffect(() => { let c=0, r=0; diaryEntries.forEach(e => e.items.forEach(i => { c+=i.cost||0; r+=i.revenue||0; })); setTotalCost(c); setTotalRevenue(r); }, [diaryEntries]);

  const handleDropItem = (item, entryId) => {
    setDiaryEntries(diaryEntries.map(e => e.id === entryId ? { ...e, items: [...e.items, { id: Date.now(), type: item.type, name: item.name, data: item.data, duration: 1, cost: item.type==='staff'?item.data.payRateBase:100, revenue: item.type==='staff'?item.data.chargeOutBase:0 }] } : e));
    setIsSaved(false);
  };
  const handleCreateEntry = () => { setDiaryEntries([{ id: Date.now(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: '', items: [] }, ...diaryEntries]); setIsSaved(false); }
  const handleSave = async () => { try { await api.post('/diaries', { date: selectedDate.toISOString().split('T')[0], entries: diaryEntries, totalCost, totalRevenue }); setIsSaved(true); addNotification('success', 'Diary Saved'); } catch(e){ setIsSaved(true); } }
  const handleCreateInvoice = () => navigate('/invoices', { state: { diaryItems: diaryEntries.flatMap(e => e.items), projectId: selectedProject } });
  const handleSitePlanSave = (d) => { setSitePlan(d); setShowMap(true); };

  const stats = [ { label: 'Cost', value: `$${totalCost.toFixed(0)}`, color: 'text-rose-400' }, { label: 'Revenue', value: `$${totalRevenue.toFixed(0)}`, color: 'text-emerald-400' }, { label: 'Profit', value: `$${(totalRevenue - totalCost).toFixed(0)}`, color: 'text-white' }, { label: 'Entries', value: diaryEntries.length, color: 'text-teal-400' } ];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-[calc(100vh-80px)] flex flex-col font-sans overflow-hidden text-white relative">
        <GeoreferenceModal isOpen={showGeoModal} onClose={() => setShowGeoModal(false)} onSave={handleSitePlanSave} />
        {showMap && <div className="absolute inset-0 z-0"><MapBackground activeLocation={sessionLocation} overlayImage={sitePlan} /></div>}
        <div className={`absolute inset-0 z-10 flex flex-col transition-all duration-500 ${showMap ? 'bg-stone-900/40 backdrop-blur-sm' : ''}`}>
          <div className="w-full pt-4 px-4 relative z-20"><PowerHeader title="Site Diary" icon={Palette} stats={stats} isPulseActive={isPulseActive} onPulseToggle={() => setIsPulseActive(!isPulseActive)} onAiSuggest={() => {}}>
            <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} className="px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white font-bold min-w-[180px] text-sm cursor-pointer"><option value="">Select Project...</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
            <button onClick={handleCreateEntry} className="px-4 py-2.5 bg-white/5 border border-white/5 text-white rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-white/10 transition-all"><Plus size={16} /> New Entry</button>
            <button onClick={handleCreateInvoice} className="px-4 py-2.5 bg-purple-600/20 text-purple-400 border border-purple-500/30 hover:bg-purple-600 hover:text-white rounded-xl font-bold transition-all text-xs uppercase tracking-wider flex items-center gap-2"><FileText size={16} /> Invoice</button>
            <button onClick={handleSave} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs shadow-xl">{isSaved ? 'Saved' : 'Save'}</button>
            <div className="bg-black/40 border border-white/10 rounded-xl px-2"><DatePicker selected={selectedDate} onChange={setSelectedDate} dateFormat="dd/MM/yyyy" className="bg-transparent border-none text-white font-bold text-xs w-24 py-2.5 text-center focus:outline-none" /></div>
          </PowerHeader></div>
          <div className="flex-1 flex overflow-hidden relative mt-4">
            {showSidebar && <div className={`fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${showSidebar ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setShowSidebar(false)} />}
            <DiaryToolbar />
            <div className="flex-1 flex flex-col relative bg-transparent overflow-hidden">
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[size:40px_40px] bg-[linear-gradient(to_right,#10b981_1px,transparent_1px),linear-gradient(to_bottom,#10b981_1px,transparent_1px)]" />
              <div className="flex-1 rounded-tl-3xl relative overflow-y-auto border-t-2 border-l-2 border-white/5 bg-stone-900/40 backdrop-blur-sm shadow-2xl custom-scrollbar p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                  {diaryEntries.length === 0 ? <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-[2.5rem] bg-black/20"><FileText size={64} className="mx-auto text-gray-700 mb-6 opacity-50" /><h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Workspace Empty</h3><p className="text-gray-500 font-medium mb-8">Click "New Entry" or drag resources to begin.</p></div> : 
                  diaryEntries.map(entry => (<DiaryEntry key={entry.id} entry={entry} onUpdate={(id, u) => setDiaryEntries(diaryEntries.map(e => e.id === id ? { ...e, ...u } : e))} onDelete={id => setDiaryEntries(diaryEntries.filter(e => e.id !== id))} onDropItem={handleDropItem} isDropTarget={dropTargetEntry === entry.id} />))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  )
}
export default PaintDiary