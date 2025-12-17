import React, { useState, useEffect, useMemo } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { api } from '../utils/api';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, User, Wrench, 
  Search, Filter, Plus, GripVertical, AlertCircle, CheckCircle2, DollarSign, Edit, X, MapPin, Eye, CheckSquare, Layers
} from 'lucide-react';
import { 
  format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, 
  isSameDay, isToday, parseISO, addWeeks, subWeeks, isWithinInterval 
} from 'date-fns';
import Card from './ui/Card';

// --- DRAGGABLE COMPONENTS ---

const DraggableResource = ({ resource, type }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'resource',
    item: { ...resource, resourceType: type, isNew: true },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div 
      ref={drag}
      className={`
        p-3 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm flex items-center gap-3 cursor-grab 
        hover:bg-white/10 hover:border-indigo-500/50 transition-all group shadow-sm active:scale-95
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
    >
      <div className={`p-2 rounded-lg ${type === 'staff' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
        {type === 'staff' ? <User size={16} /> : <Wrench size={16} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-white truncate">{resource.name}</div>
        <div className="text-[10px] text-gray-400 truncate">{resource.role || resource.category}</div>
      </div>
      <GripVertical size={14} className="text-gray-600 group-hover:text-gray-400" />
    </div>
  );
};

const DraggableAllocation = ({ allocation, isConflict, onClick }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'resource', // Same type to allow dropping in the same zones
        item: { ...allocation, isNew: false }, // Pass full allocation data, flag as existing
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    const isStaff = allocation.resourceType === 'staff';
    const resourceName = isStaff ? allocation.staffResource?.name : allocation.equipmentResource?.name;
    
    let styleClass = isStaff 
        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-500/40' 
        : 'bg-amber-500/10 border-amber-500/20 text-amber-300 hover:bg-amber-500/20 hover:border-amber-500/40';

    if (allocation.category === 'sick') styleClass = 'bg-red-500/20 border-red-500/50 text-red-200';
    if (allocation.category === 'leave') styleClass = 'bg-blue-500/20 border-blue-500/50 text-blue-200';
    if (allocation.category === 'training') styleClass = 'bg-purple-500/20 border-purple-500/50 text-purple-200';
    if (isConflict) styleClass = 'bg-red-500/20 border-red-500 text-red-200 animate-pulse';

    return (
        <div 
            ref={drag}
            onClick={onClick}
            className={`
                p-2 rounded-lg border text-xs font-bold shadow-lg flex items-center justify-between cursor-pointer hover:scale-[1.02] active:scale-95 transition-all ${styleClass}
                ${isDragging ? 'opacity-50' : 'opacity-100'}
            `}
        >
            <span className="truncate">{resourceName}</span>
            <div className="flex items-center gap-1">
                {allocation.category && allocation.category !== 'project' && <span className="text-[9px] uppercase opacity-70 ml-1">{allocation.category}</span>}
                {isConflict && <AlertCircle size={12} className="text-red-500 flex-shrink-0" />}
            </div>
        </div>
    );
};

// --- DROP ZONE COMPONENT ---
const DayCell = ({ day, projectId, allocations, conflicts, onDrop, onEdit }) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'resource',
        drop: (item) => onDrop(item, projectId, day),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const dayStr = format(day, 'yyyy-MM-dd');
    const isHR = projectId === 'HR';

    return (
        <div 
            ref={drop}
            className={`
                flex-1 min-w-[140px] border-r border-white/5 p-1.5 relative transition-all min-h-[100px] flex flex-col gap-1.5
                ${isOver ? (isHR ? 'bg-red-500/10 shadow-[inset_0_0_20px_rgba(239,68,68,0.2)]' : 'bg-indigo-500/10 shadow-[inset_0_0_20px_rgba(99,102,241,0.2)]') : ''}
            `}
        >
            {allocations.map(alloc => {
                const conflictKey = `${alloc.resourceId}-${dayStr}`;
                const isConflict = conflicts[conflictKey] > 1;
                return (
                    <DraggableAllocation 
                        key={alloc.id} 
                        allocation={alloc} 
                        isConflict={isConflict} 
                        onClick={() => onEdit(alloc)} 
                    />
                );
            })}
        </div>
    );
};

// ... EditAllocationModal ...
const EditAllocationModal = ({ allocation, onClose, onSave, onDelete }) => {
    const [formData, setFormData] = useState({
        startDate: allocation.startDate,
        endDate: allocation.endDate,
        startTime: allocation.startTime || '',
        endTime: allocation.endTime || '',
        notes: allocation.notes || '',
        category: allocation.category || 'project'
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in" onClick={onClose}>
            <Card className="w-96 !p-0 bg-stone-900" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-lg font-black text-white uppercase tracking-wide">Edit Allocation</h3>
                    <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-white" /></button>
                </div>
                
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date & Time Range</label>
                        <div className="flex gap-2 mb-2">
                            <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="bg-black/30 border border-white/10 rounded-xl p-3 text-white text-sm flex-1 outline-none focus:border-indigo-500 transition-colors" />
                            <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="bg-black/30 border border-white/10 rounded-xl p-3 text-white text-sm flex-1 outline-none focus:border-indigo-500 transition-colors" />
                        </div>
                        <div className="flex gap-2 items-center">
                            <input type="time" value={formData.startTime || ''} onChange={e => setFormData({...formData, startTime: e.target.value})} className="bg-black/30 border border-white/10 rounded-xl p-3 text-white text-sm flex-1 outline-none focus:border-indigo-500 transition-colors" placeholder="Start Time" />
                            <span className="text-gray-500 font-bold">-</span>
                            <input type="time" value={formData.endTime || ''} onChange={e => setFormData({...formData, endTime: e.target.value})} className="bg-black/30 border border-white/10 rounded-xl p-3 text-white text-sm flex-1 outline-none focus:border-indigo-500 transition-colors" placeholder="End Time" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                        <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer">
                            <option value="project">Project Work</option>
                            <option value="sick">Sick Leave</option>
                            <option value="leave">Annual Leave</option>
                            <option value="training">Training</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notes</label>
                        <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-indigo-500 h-24 resize-none transition-colors" placeholder="Task details..." />
                    </div>
                </div>

                <div className="p-6 border-t border-white/10 flex gap-2">
                    <button onClick={() => onDelete(allocation.id)} className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl font-bold text-sm transition-colors border border-red-500/20">Delete</button>
                    <div className="flex-1"></div>
                    <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white text-sm font-bold">Cancel</button>
                    <button onClick={() => onSave(allocation.id, formData)} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-indigo-500/20">Save</button>
                </div>
            </Card>
        </div>
    );
};

const ResourceCommand = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [projects, setProjects] = useState([]);
  const [staff, setStaff] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingAllocation, setEditingAllocation] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  
  // VIEW CONTEXT / FILTERS
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProjectIds, setSelectedProjectIds] = useState([]);
  const [selectedResourceIds, setSelectedResourceIds] = useState([]);

  // --- DATA LOADING ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const results = await Promise.allSettled([
          api.get('/projects'),
          api.get('/staff'),
          api.get('/equipment'),
          api.get('/allocations')
        ]);
        
        const [pRes, sRes, eRes, aRes] = results;

        if (pRes.status === 'fulfilled') setProjects(pRes.value.data.data || pRes.value.data || []);
        if (sRes.status === 'fulfilled') setStaff(sRes.value.data.data || sRes.value.data || []);
        if (eRes.status === 'fulfilled') setEquipment(eRes.value.data.data || eRes.value.data || []);
        if (aRes.status === 'fulfilled') setAllocations(aRes.value.data || []);

        // Load Persistence
        const savedView = localStorage.getItem('resource_view_context');
        if (savedView) {
            const { pIds, rIds } = JSON.parse(savedView);
            if (pIds) setSelectedProjectIds(pIds);
            if (rIds) setSelectedResourceIds(rIds);
        }

      } catch (err) {
        console.error("Critical failure loading resources", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Persist View Context
  useEffect(() => {
      if (!loading) {
          localStorage.setItem('resource_view_context', JSON.stringify({
              pIds: selectedProjectIds,
              rIds: selectedResourceIds
          }));
      }
  }, [selectedProjectIds, selectedResourceIds, loading]);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({
    start: weekStart,
    end: endOfWeek(currentDate, { weekStartsOn: 1 })
  });

  const conflicts = useMemo(() => {
      const conflictMap = {}; 
      allocations.forEach(alloc => {
          const start = parseISO(alloc.startDate);
          const end = parseISO(alloc.endDate);
          const interval = eachDayOfInterval({ start, end });
          
          interval.forEach(day => {
              const key = `${alloc.resourceId}-${format(day, 'yyyy-MM-dd')}`;
              conflictMap[key] = (conflictMap[key] || 0) + 1;
          });
      });
      return conflictMap;
  }, [allocations]);

  const getProjectDailyCost = (projectId, date) => {
      let cost = 0;
      const allocs = allocations.filter(a => 
        a.projectId === projectId && 
        isWithinInterval(date, { start: parseISO(a.startDate), end: parseISO(a.endDate) })
      );

      allocs.forEach(a => {
          if (a.resourceType === 'staff') {
              const s = staff.find(x => x.id === a.resourceId);
              if (s) cost += (parseFloat(s.payRateBase || 0) * 8); 
          } else {
              const e = equipment.find(x => x.id === a.resourceId);
              if (e) cost += (parseFloat(e.costRateBase || 0) * 8);
          }
      });
      return cost;
  };

  const getProjectTotalWeeklyCost = (projectId) => {
      return days.reduce((sum, day) => sum + getProjectDailyCost(projectId, day), 0);
  };

  // --- DROP HANDLER (Dual Logic + Smart Split) ---
  const handleDrop = async (item, projectId, date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    let finalProjectId = projectId;
    let category = 'project';

    // Handle HR/Leave drops
    if (projectId === 'HR') {
        finalProjectId = null;
        const type = window.prompt("Leave Type? (sick, leave, training)", "sick");
        if (!type) return;
        category = type.toLowerCase();
    }

    // --- CASE 1: NEW RESOURCE (From Sidebar) ---
    if (item.isNew) {
        const tempId = Date.now();
        const newAlloc = {
            id: tempId,
            resourceId: item.id,
            resourceType: item.resourceType,
            projectId: finalProjectId,
            startDate: dateStr,
            endDate: dateStr,
            status: 'scheduled',
            category,
            [item.resourceType === 'staff' ? 'staffResource' : 'equipmentResource']: item
        };
        
        setAllocations(prev => [...prev, newAlloc]);

        try {
            const res = await api.post('/allocations', {
                resourceType: item.resourceType,
                resourceId: item.id,
                projectId: finalProjectId,
                startDate: dateStr,
                endDate: dateStr,
                category
            });
            setAllocations(prev => prev.map(a => a.id === tempId ? { ...a, ...res.data } : a));
        } catch (err) {
            setAllocations(prev => prev.filter(a => a.id !== tempId));
            alert(`Failed to schedule: ${err.response?.data?.error || err.message}`);
        }
        return;
    }

    // --- CASE 2: EXISTING ALLOCATION (Move/Split) ---
    const originalStart = item.startDate;
    const originalEnd = item.endDate;
    const isMultiDay = originalStart !== originalEnd;
    
    // If dropping on HR (Sick) and it's a multi-day block, we SPLIT instead of MOVE
    if (projectId === 'HR' && isMultiDay) {
        if (!confirm(`Mark ${dateStr} as ${category} and split the remaining schedule?`)) return;

        const targetDate = new Date(dateStr);
        const start = new Date(originalStart);
        const end = new Date(originalEnd);

        // 1. Create the Sick Entry
        try {
            const sickAlloc = {
                resourceType: item.resourceType,
                resourceId: item.resourceId,
                projectId: null,
                startDate: dateStr,
                endDate: dateStr,
                category
            };
            const res = await api.post('/allocations', sickAlloc);
            setAllocations(prev => [...prev, res.data]);
        } catch (e) {
            console.error("Failed to create sick leave", e);
            return;
        }

        // 2. Adjust Original Allocation(s)
        if (isSameDay(targetDate, start)) {
            // Case A: First day is sick -> Shorten start of original
            const newStart = addDays(start, 1);
            await api.put(`/allocations/${item.id}`, { startDate: format(newStart, 'yyyy-MM-dd') });
            setAllocations(prev => prev.map(a => a.id === item.id ? { ...a, startDate: format(newStart, 'yyyy-MM-dd') } : a));
        } 
        else if (isSameDay(targetDate, end)) {
            // Case B: Last day is sick -> Shorten end of original
            const newEnd = addDays(end, -1);
            await api.put(`/allocations/${item.id}`, { endDate: format(newEnd, 'yyyy-MM-dd') });
            setAllocations(prev => prev.map(a => a.id === item.id ? { ...a, endDate: format(newEnd, 'yyyy-MM-dd') } : a));
        } 
        else {
            // Case C: Middle day -> Split into two blocks
            // 1. Shorten original to end yesterday
            const part1End = addDays(targetDate, -1);
            await api.put(`/allocations/${item.id}`, { endDate: format(part1End, 'yyyy-MM-dd') });
            
            // 2. Create new allocation for tomorrow onwards
            const part2Start = addDays(targetDate, 1);
            const part2Alloc = {
                ...item,
                id: undefined, // Create new
                startDate: format(part2Start, 'yyyy-MM-dd'),
                endDate: originalEnd
            };
            const payload = {
                resourceType: item.resourceType,
                resourceId: item.resourceId,
                projectId: item.projectId,
                startDate: format(part2Start, 'yyyy-MM-dd'),
                endDate: originalEnd,
                category: item.category
            };
            
            const res = await api.post('/allocations', payload);
            
            setAllocations(prev => [
                ...prev.map(a => a.id === item.id ? { ...a, endDate: format(part1End, 'yyyy-MM-dd') } : a),
                res.data
            ]);
        }
        return;
    }

    // --- CASE 3: STANDARD MOVE (Single day or Project-to-Project) ---
    const updatedAlloc = { 
        ...item, 
        projectId: finalProjectId, 
        category,
        startDate: dateStr,
        endDate: dateStr
    };

    setAllocations(prev => prev.map(a => a.id === item.id ? updatedAlloc : a));

    try {
        const updatePayload = {
            projectId: finalProjectId,
            startDate: dateStr,
            endDate: dateStr,
            category,
            resourceId: item.resourceId,
            resourceType: item.resourceType
        };
        await api.put(`/allocations/${item.id}`, updatePayload);
    } catch (err) {
        console.error("Move Failed:", err.response?.data || err.message);
        alert(`Failed to move allocation: ${err.response?.data?.error || err.message}`);
        const res = await api.get('/allocations'); // Revert
        if (res.data) setAllocations(res.data);
    }
  };

  const handleUpdateAllocation = async (id, updates) => {
      try {
          const res = await api.put(`/allocations/${id}`, updates);
          setAllocations(prev => prev.map(a => a.id === id ? { ...a, ...res.data } : a));
          setEditingAllocation(null);
      } catch (err) {
          alert("Failed to update allocation");
      }
  };

  const handleDeleteAllocation = async (id) => {
      if (!window.confirm("Remove this allocation?")) return;
      try {
          await api.delete(`/allocations/${id}`);
          setAllocations(prev => prev.filter(a => a.id !== id));
          setEditingAllocation(null);
      } catch (err) {
          alert("Failed to remove allocation");
      }
  };

  const toggleProjectSelection = (id) => {
      setSelectedProjectIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleResourceSelection = (id) => {
      setSelectedResourceIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // --- FILTERED DATA ---
  const visibleProjects = useMemo(() => {
      if (selectedProjectIds.length === 0) return projects;
      return projects.filter(p => selectedProjectIds.includes(p.id));
  }, [projects, selectedProjectIds]);

  const visibleStaff = useMemo(() => {
      const list = staff.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
      if (selectedResourceIds.length === 0) return list;
      return list.filter(s => selectedResourceIds.includes(s.id));
  }, [staff, searchTerm, selectedResourceIds]);

  const visibleEquipment = useMemo(() => {
      const list = equipment.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()));
      if (selectedResourceIds.length === 0) return list;
      return list.filter(e => selectedResourceIds.includes(e.id));
  }, [equipment, searchTerm, selectedResourceIds]);

  if (loading) return <div className="h-screen bg-stone-950 flex items-center justify-center text-white font-mono animate-pulse">INITIALIZING COMMAND MATRIX...</div>;

  return (
    <div className="h-[calc(100vh-80px)] bg-transparent flex font-sans overflow-hidden text-gray-100 relative">
      {editingAllocation && (
          <EditAllocationModal 
            allocation={editingAllocation} 
            onClose={() => setEditingAllocation(null)} 
            onSave={handleUpdateAllocation}
            onDelete={handleDeleteAllocation}
          />
      )}

      {showSidebar && (
        <div 
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* FILTER POPUP */}
      {showFilters && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[999] bg-stone-900 border border-white/10 rounded-xl shadow-2xl w-80 max-h-[80vh] flex flex-col animate-fade-in-up">
              <div className="p-4 border-b border-white/5 flex justify-between items-center bg-stone-950/50 rounded-t-xl">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2"><Eye size={16}/> View Context</h3>
                  <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-white"><X size={16}/></button>
              </div>
              <div className="p-2 border-b border-white/5 flex gap-2">
                  <button onClick={() => { setSelectedProjectIds([]); setSelectedResourceIds([]); }} className="flex-1 py-1.5 text-[10px] font-bold bg-white/5 hover:bg-white/10 rounded text-gray-400 hover:text-white">Reset All</button>
                  <button onClick={() => setSelectedProjectIds(projects.map(p => p.id))} className="flex-1 py-1.5 text-[10px] font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded">Select All Projects</button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                  <div className="mb-4">
                      <div className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2 px-2">Projects</div>
                      {projects.map(p => (
                          <div key={p.id} onClick={() => toggleProjectSelection(p.id)} className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg cursor-pointer">
                              <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedProjectIds.length === 0 || selectedProjectIds.includes(p.id) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-600'}`}>
                                  {(selectedProjectIds.length === 0 || selectedProjectIds.includes(p.id)) && <CheckSquare size={12} className="text-white"/>}
                              </div>
                              <span className={`text-xs font-bold truncate ${selectedProjectIds.includes(p.id) ? 'text-white' : 'text-gray-500'}`}>{p.name}</span>
                          </div>
                      ))}
                  </div>
                  <div>
                      <div className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2 px-2">Key Resources</div>
                      {staff.map(s => (
                          <div key={s.id} onClick={() => toggleResourceSelection(s.id)} className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg cursor-pointer">
                              <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedResourceIds.length === 0 || selectedResourceIds.includes(s.id) ? 'bg-emerald-600 border-emerald-600' : 'border-gray-600'}`}>
                                  {(selectedResourceIds.length === 0 || selectedResourceIds.includes(s.id)) && <CheckSquare size={12} className="text-white"/>}
                              </div>
                              <span className="text-xs text-gray-400">{s.name}</span>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* SIDEBAR */}
      <div className={`
          fixed inset-y-0 left-0 z-50 w-80 bg-stone-900/95 border-r border-white/5 flex flex-col shadow-2xl transition-transform duration-300 backdrop-blur-xl
          lg:relative lg:translate-x-0
          ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-5 border-b border-white/5">
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 text-indigo-400">
                <Filter size={14} /> Resource Bay
             </h2>
             <button onClick={() => setShowSidebar(false)} className="lg:hidden text-gray-400 hover:text-white"><X size={18}/></button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search assets..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-xs font-bold text-white focus:border-indigo-500 outline-none placeholder-gray-600 transition-all focus:bg-stone-950"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          {/* STAFF */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Personnel</h3>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono border border-emerald-500/20">{visibleStaff.length}</span>
            </div>
            <div className="space-y-2">
              {visibleStaff.map(s => (
                <DraggableResource key={s.id} resource={s} type="staff" />
              ))}
            </div>
          </div>

          {/* EQUIPMENT */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Heavy Assets</h3>
              <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-mono border border-amber-500/20">{visibleEquipment.length}</span>
            </div>
            <div className="space-y-2">
              {visibleEquipment.map(e => (
                <DraggableResource key={e.id} resource={e} type="equipment" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN: TIMELINE */}
      <div className="flex-1 flex flex-col relative w-full overflow-hidden">
        
        {/* HEADER */}
        <div className="h-16 border-b border-white/5 bg-stone-900/60 backdrop-blur-md flex justify-between items-center px-4 md:px-6 sticky top-0 z-40">
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={() => setShowSidebar(true)} className="lg:hidden p-2 rounded-lg bg-stone-800 text-indigo-400"><Filter size={20}/></button>
            
            <button onClick={() => setShowFilters(!showFilters)} className={`p-2 rounded-lg border border-white/5 hover:bg-white/10 transition-all flex items-center gap-2 ${selectedProjectIds.length > 0 ? 'bg-indigo-600 text-white' : 'bg-stone-800 text-gray-400'}`}>
                <Eye size={18} />
                <span className="text-xs font-bold hidden md:block">{selectedProjectIds.length > 0 ? `${selectedProjectIds.length} Projects` : 'All Projects'}</span>
            </button>

            <div className="h-8 w-px bg-white/10 mx-2"></div>

            <button onClick={() => setCurrentDate(subWeeks(currentDate, 1))} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"><ChevronLeft size={20}/></button>
            <div className="flex items-center gap-2 md:gap-3">
              <CalendarIcon size={18} className="text-indigo-500 hidden md:block" />
              <span className="text-sm md:text-xl font-black text-white tracking-tight">{format(weekStart, 'MMMM yyyy')}</span>
              <span className="text-[10px] md:text-sm font-medium text-gray-500 border-l border-white/10 pl-2 md:pl-3">Week of {format(weekStart, 'do')}</span>
            </div>
            <button onClick={() => setCurrentDate(addWeeks(currentDate, 1))} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"><ChevronRight size={20}/></button>
          </div>
          
          <div className="flex gap-4">
             <button onClick={() => setCurrentDate(new Date())} className="text-[10px] font-bold bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg uppercase tracking-wider transition-all hidden md:block border border-indigo-500/20">Today</button>
          </div>
        </div>

        {/* CALENDAR GRID */}
        <div className="flex-1 overflow-auto custom-scrollbar bg-stone-950/50">
          <div className="min-w-[1200px]">
            {/* Header Row */}
            <div className="flex border-b border-white/5 sticky top-0 bg-stone-900/95 backdrop-blur-sm z-30 shadow-xl">
              <div className="w-72 flex-shrink-0 p-4 border-r border-white/5 font-black text-gray-500 uppercase text-[10px] tracking-[0.2em] flex items-center justify-between">
                  <span>Project Manifest</span>
                  <span>Weekly Budget</span>
              </div>
              {days.map(day => (
                <div key={day.toString()} className={`flex-1 min-w-[140px] p-3 text-center border-r border-white/5 ${isToday(day) ? 'bg-indigo-900/10' : ''}`}>
                  <div className={`text-[10px] font-bold uppercase mb-1 ${isToday(day) ? 'text-indigo-400' : 'text-gray-500'}`}>{format(day, 'EEE')}</div>
                  <div className={`text-2xl font-black ${isToday(day) ? 'text-white' : 'text-gray-300'}`}>{format(day, 'd')}</div>
                </div>
              ))}
            </div>

            {/* HR / Leave Row (Always visible unless explicitly filtered out? No, keep always visible for now as it's not a project) */}
            <div className="flex border-b border-white/5 hover:bg-white/[0.02] transition-colors group bg-red-500/5">
                <div className="w-72 flex-shrink-0 p-4 border-r border-white/10 sticky left-0 bg-stone-900/90 backdrop-blur-md z-20 shadow-lg border-l-4 border-l-red-500">
                    <div className="flex justify-between items-start mb-2">
                        <div className="font-bold text-red-200 truncate text-sm max-w-[160px]">HR / Leave</div>
                    </div>
                    <div className="text-[10px] text-red-400/60 truncate flex items-center gap-1.5 uppercase font-bold tracking-wider">
                        Internal
                    </div>
                </div>
                
                {days.map(day => {
                    const allocs = allocations.filter(a => 
                        !a.projectId && 
                        isWithinInterval(day, { start: parseISO(a.startDate), end: parseISO(a.endDate) })
                    );
                    
                    return (
                        <DayCell 
                            key={day.toString()} 
                            day={day} 
                            projectId="HR" 
                            allocations={allocs} 
                            conflicts={conflicts} 
                            onDrop={handleDrop} 
                            onEdit={setEditingAllocation} 
                        />
                    );
                })}
            </div>

            {/* Project Rows */}
            {visibleProjects.map(project => (
              <div key={project.id} className="flex border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                <div className={`w-72 flex-shrink-0 p-4 border-r border-white/10 sticky left-0 bg-stone-900/90 backdrop-blur-md z-20 shadow-lg border-l-4 ${project.status === 'active' ? 'border-l-emerald-500' : 'border-l-gray-600'}`}>
                  <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-white truncate text-sm max-w-[160px]">{project.name}</div>
                      <div className="text-xs font-mono text-emerald-500 font-bold">${getProjectTotalWeeklyCost(project.id).toLocaleString()}</div>
                  </div>
                  <div className="text-[10px] text-gray-500 truncate flex items-center gap-1.5 uppercase font-bold tracking-wider">
                    {project.client || 'Internal Project'}
                  </div>
                  {project.site && (
                      <div className="text-[9px] text-indigo-400 mt-1 truncate flex items-center gap-1">
                          <MapPin size={10} /> {project.site}
                      </div>
                  )}
                </div>
                
                {days.map(day => {
                  const allocs = allocations.filter(a => 
                    a.projectId === project.id && 
                    isWithinInterval(day, { start: parseISO(a.startDate), end: parseISO(a.endDate) })
                  );
                  
                  return (
                      <DayCell 
                          key={day.toString()} 
                          day={day} 
                          projectId={project.id} 
                          allocations={allocs} 
                          conflicts={conflicts} 
                          onDrop={handleDrop} 
                          onEdit={setEditingAllocation} 
                      />
                  );
                })}
              </div>
            ))}
            
            {visibleProjects.length === 0 && projects.length > 0 && (
                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                    <Eye size={48} className="text-gray-600 mb-4" />
                    <div className="text-xl font-bold text-gray-500">No projects selected.</div>
                    <div className="text-sm text-gray-600">Use the "View Context" button to select projects.</div>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceCommand;