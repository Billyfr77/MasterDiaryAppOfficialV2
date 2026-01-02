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
import { useDiaryTheme } from './PaintDiary/ThemeContext';

// --- DRAGGABLE COMPONENTS ---

const DraggableResource = ({ resource, type, theme }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'resource',
    item: { ...resource, resourceType: type, isNew: true },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const primary = theme?.primary || 'indigo';

  return (
    <div 
      ref={drag}
      className={`
        relative overflow-hidden p-3 rounded-2xl border border-white/5 bg-black/40 backdrop-blur-xl flex items-center gap-4 cursor-grab 
        hover:border-${primary}-500/50 transition-all duration-500 group shadow-lg active:scale-95
        ${isDragging ? 'opacity-50 grayscale' : 'opacity-100'}
      `}
    >
      <div className={`absolute inset-0 bg-gradient-to-r from-${primary}-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      
      <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center bg-${primary}-500/10 border border-${primary}-500/20 shadow-[0_0_15px_rgba(var(--${primary}-500-rgb),0.15)] group-hover:shadow-[0_0_25px_rgba(var(--${primary}-500-rgb),0.3)] transition-all`}>
        {type === 'staff' ? <User size={18} className={`text-${primary}-400`} /> : <Wrench size={18} className={`text-${primary}-400`} />}
      </div>
      
      <div className="flex-1 min-w-0 relative z-10">
        <div className="text-xs font-black text-white tracking-wide truncate group-hover:text-${primary}-200 transition-colors">{resource.name}</div>
        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider truncate flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${type === 'staff' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {resource.role || resource.category}
        </div>
      </div>
      
      <GripVertical size={14} className="text-white/20 opacity-0 group-hover:opacity-100 transition-opacity relative z-10" />
    </div>
  );
};

const DraggableAllocation = ({ allocation, isConflict, onClick, theme }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'resource', 
        item: { ...allocation, isNew: false },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    const isStaff = allocation.resourceType === 'staff';
    const resourceName = isStaff ? allocation.staffResource?.name : allocation.equipmentResource?.name;
    const primary = theme?.primary || 'indigo';
    
    // Base Glass Style
    let styleClass = isStaff 
        ? `bg-${primary}-500/10 border-${primary}-500/20 text-${primary}-200 hover:bg-${primary}-500/20` 
        : 'bg-amber-500/10 border-amber-500/20 text-amber-200 hover:bg-amber-500/20';

    // Status Overrides
    if (allocation.category === 'sick') styleClass = 'bg-rose-500/10 border-rose-500/30 text-rose-300';
    if (allocation.category === 'leave') styleClass = 'bg-blue-500/10 border-blue-500/30 text-blue-300';
    if (allocation.category === 'training') styleClass = 'bg-violet-500/10 border-violet-500/30 text-violet-300';
    
    // Conflict State (Critical)
    if (isConflict) styleClass = 'bg-rose-900/40 border-rose-500 text-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-pulse';
    
    // --- GHOST HOLOGRAPHIC STYLE (THE FIX) ---
    if (allocation.isGhost) {
        styleClass = `
            bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.03),rgba(255,255,255,0.03)_10px,transparent_10px,transparent_20px)]
            border-dashed border-white/40 text-white/70 animate-pulse cursor-pointer hover:bg-white/10 hover:border-white transition-all
        `;
    }

    return (
        <div 
            ref={drag}
            onClick={onClick}
            className={`
                relative p-2 rounded-lg border text-[10px] font-black uppercase tracking-wide shadow-sm flex items-center justify-between cursor-pointer 
                hover:scale-[1.02] hover:shadow-lg active:scale-95 transition-all duration-300 backdrop-blur-md overflow-hidden
                ${styleClass} ${isDragging ? 'opacity-30 blur-sm' : 'opacity-100'} group
            `}
        >
            {allocation.isGhost && <div className="absolute inset-0 bg-white/5 animate-pulse pointer-events-none" />}
            
            <div className="flex items-center gap-2 truncate z-10">
                {allocation.isGhost && <Sparkles size={10} className="text-white animate-spin-slow" />}
                <span className="truncate">{resourceName}</span>
            </div>

            <div className="flex items-center gap-1 z-10">
                {allocation.category && allocation.category !== 'project' && <span className="text-[8px] opacity-60 ml-1 bg-black/20 px-1.5 py-0.5 rounded">{allocation.category}</span>}
                {isConflict && (
                    <div className="flex items-center gap-1">
                        <AlertCircle size={12} className="text-rose-500 flex-shrink-0" />
                        <button className="opacity-0 group-hover:opacity-100 text-[8px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-black tracking-tighter hover:bg-rose-400 transition-all shadow-lg scale-90 hover:scale-100">
                            FIX
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- DROP ZONE COMPONENT ---
const DayCell = ({ day, projectId, allocations, conflicts, onDrop, onEdit, theme }) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'resource',
        drop: (item) => onDrop(item, projectId, day),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const dayStr = format(day, 'yyyy-MM-dd');
    const isHR = projectId === 'HR';
    const primary = theme?.primary || 'indigo';

    return (
        <div 
            ref={drop}
            className={`
                flex-1 min-w-[140px] border-r border-white/5 p-1.5 relative transition-all min-h-[100px] flex flex-col gap-1.5
                ${isOver ? (isHR ? 'bg-red-500/10 shadow-[inset_0_0_30px_rgba(239,68,68,0.3)]' : `bg-${primary}-500/10 shadow-[inset_0_0_30px_rgba(var(--${primary}-500-rgb),0.2)]`) : ''}
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
                        theme={theme}
                    />
                );
            })}
        </div>
    );
};

// ... EditAllocationModal ...
const EditAllocationModal = ({ allocation, onClose, onSave, onDelete, theme }) => {
    const [formData, setFormData] = useState({
        startDate: allocation.startDate,
        endDate: allocation.endDate,
        startTime: allocation.startTime || '',
        endTime: allocation.endTime || '',
        notes: allocation.notes || '',
        category: allocation.category || 'project'
    });
    
    const primary = theme?.primary || 'indigo';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in" onClick={onClose}>
            <div className={`w-96 bg-[#0a0a0c] border border-${primary}-500/30 rounded-[2rem] overflow-hidden shadow-2xl shadow-${primary}-900/20`} onClick={e => e.stopPropagation()}>
                <div className={`p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-${primary}-900/40 to-transparent`}>
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

                <div className="p-6 border-t border-white/10 flex gap-2 bg-black/20">
                    <button onClick={() => onDelete(allocation.id)} className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl font-bold text-sm transition-colors border border-red-500/20">Delete</button>
                    <div className="flex-1"></div>
                    <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white text-sm font-bold">Cancel</button>
                    <button onClick={() => onSave(allocation.id, formData)} className={`px-6 py-2 bg-${primary}-600 hover:bg-${primary}-500 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-${primary}-500/20`}>Save</button>
                </div>
            </div>
        </div>
    );
};

const ResourceCommand = () => {
  const { theme } = useDiaryTheme(); // Consume Theme
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
  
  // --- NEURAL OPTIMIZER STATE ---
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [ghostAllocations, setGhostAllocations] = useState([]); // Suggestions from AI

  // --- CHRONOS GRID STATE ---
  const [zoomLevel, setZoomLevel] = useState(140); // Base cell width
  const [isHeatmapActive, setIsHeatmapActive] = useState(false);

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

  // --- NEURAL OPTIMIZATION HANDLER ---
  const handleNeuralOptimize = async () => {
      if (!navigator.onLine) {
          alert("Neural Optimizer requires internet connection.");
          return;
      }
      setIsOptimizing(true);
      try {
          const res = await api.post('/ai/optimize-fleet', {
              weekStart: format(weekStart, 'yyyy-MM-dd'),
              allocations,
              staff,
              projects: visibleProjects
          });
          
          console.log("Neural Opt Response:", res.data); // Debug AI output

          if (res.data.suggestedMoves) {
              // Convert suggestions to ghost allocations
              const ghosts = res.data.suggestedMoves.map(move => {
                  // AI returns string IDs, local might be int. Use loose eq.
                  const original = allocations.find(a => a.id == move.allocationId); 
                  if (!original) return null;
                  return {
                      ...original,
                      id: `ghost-${original.id}`,
                      startDate: move.newDate,
                      endDate: move.newDate, // AI suggests single day moves usually
                      projectId: move.newProjectId || original.projectId,
                      isGhost: true,
                      reason: move.reason
                  };
              }).filter(Boolean);
              
              if (ghosts.length === 0 && res.data.suggestedMoves.length > 0) {
                  console.warn("AI returned moves but ID matching failed.", res.data.suggestedMoves);
              }
              
              setGhostAllocations(ghosts);
              alert(`Neural Optimization Complete: ${res.data.analysis || 'Suggestions ready.'} Click ghost items to confirm.`);
          }
      } catch (err) {
          console.error(err);
          alert("Optimization Failed: Neural Core busy.");
      } finally {
          setIsOptimizing(false);
      }
  };

  const confirmGhost = async (ghost) => {
      // Apply the move
      const originalId = ghost.id.replace('ghost-', '');
      const original = allocations.find(a => a.id == originalId); // weak match for string/int
      if (!original) return;

      const updatedAlloc = {
          ...original,
          startDate: ghost.startDate,
          endDate: ghost.endDate,
          projectId: ghost.projectId
      };

      setAllocations(prev => prev.map(a => a.id == originalId ? updatedAlloc : a));
      setGhostAllocations(prev => prev.filter(g => g.id !== ghost.id));

      try {
          await api.put(`/allocations/${originalId}`, {
              startDate: ghost.startDate,
              endDate: ghost.endDate,
              projectId: ghost.projectId
          });
      } catch (e) { console.error("Failed to apply ghost move", e); }
  };

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
    <div className={`h-[calc(100vh-80px)] bg-${theme.bg ? theme.bg : '#050507'} flex font-sans overflow-hidden text-gray-100 relative`}>
        {/* Dynamic Background matching app */}
        <div className={`absolute inset-0 bg-gradient-to-b from-${theme.primary}-900/10 to-transparent pointer-events-none`}></div>

      {editingAllocation && (
          <EditAllocationModal 
            allocation={editingAllocation} 
            onClose={() => setEditingAllocation(null)} 
            onSave={handleUpdateAllocation}
            onDelete={handleDeleteAllocation}
            theme={theme}
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
          <div className={`fixed top-16 left-1/2 -translate-x-1/2 z-[999] bg-${theme.primary}-950/95 backdrop-blur-2xl border border-${theme.primary}-500/20 rounded-2xl shadow-2xl w-80 max-h-[80vh] flex flex-col animate-fade-in-up`}>
              <div className={`p-4 border-b border-white/5 flex justify-between items-center bg-${theme.primary}-900/20 rounded-t-2xl`}>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2"><Eye size={16}/> View Context</h3>
                  <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-white"><X size={16}/></button>
              </div>
              <div className="p-2 border-b border-white/5 flex gap-2">
                  <button onClick={() => { setSelectedProjectIds([]); setSelectedResourceIds([]); }} className="flex-1 py-1.5 text-[10px] font-bold bg-white/5 hover:bg-white/10 rounded text-gray-400 hover:text-white">Reset All</button>
                  <button onClick={() => setSelectedProjectIds(projects.map(p => p.id))} className={`flex-1 py-1.5 text-[10px] font-bold bg-${theme.primary}-500/10 hover:bg-${theme.primary}-500/20 text-${theme.primary}-400 rounded`}>Select All Projects</button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                  <div className="mb-4">
                      <div className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-2 px-2">Projects</div>
                      {projects.map(p => (
                          <div key={p.id} onClick={() => toggleProjectSelection(p.id)} className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg cursor-pointer">
                              <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedProjectIds.length === 0 || selectedProjectIds.includes(p.id) ? `bg-${theme.primary}-600 border-${theme.primary}-600` : 'border-gray-600'}`}>
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

      {/* SIDEBAR - Grandeur Upgrade */}
      <div className={`
          fixed inset-y-0 left-0 z-50 w-80 backdrop-blur-2xl flex flex-col shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
          lg:relative lg:translate-x-0 lg:z-0 border-r border-${theme.primary}-500/20 bg-${theme.primary}-950/20
          ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className={`p-6 border-b border-${theme.primary}-500/20 bg-gradient-to-b from-${theme.primary}-900/40 to-transparent`}>
          <div className="flex justify-between items-center mb-6">
             <h2 className={`text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 drop-shadow-md`}>
                <Filter size={14} className={`text-${theme.primary}-400`}/> Resource Bay
             </h2>
             <button onClick={() => setShowSidebar(false)} className="lg:hidden text-gray-400 hover:text-white"><X size={18}/></button>
          </div>
          <div className="relative group">
            <Search className={`absolute left-3 top-2.5 text-gray-500 group-focus-within:text-${theme.primary}-400 transition-colors`} size={16} />
            <input 
              type="text" 
              placeholder="Search assets..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className={`w-full bg-black/30 border border-white/10 rounded-2xl pl-10 pr-3 py-3 text-xs font-bold text-white focus:border-${theme.primary}-500 outline-none placeholder-gray-600 transition-all shadow-inner`}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          {/* STAFF */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-3 px-2">
              <h3 className={`text-[10px] font-black text-${theme.primary}-400/80 uppercase tracking-widest`}>Personnel</h3>
              <span className={`text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-lg font-mono border border-emerald-500/20`}>{visibleStaff.length}</span>
            </div>
            <div className="space-y-2">
              {visibleStaff.map(s => (
                <DraggableResource key={s.id} resource={s} type="staff" theme={theme} />
              ))}
            </div>
          </div>

          {/* EQUIPMENT */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <div className="flex justify-between items-center mb-3 px-2 border-t border-white/5 pt-4">
              <h3 className={`text-[10px] font-black text-${theme.primary}-400/80 uppercase tracking-widest`}>Heavy Assets</h3>
              <span className={`text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-lg font-mono border border-amber-500/20`}>{visibleEquipment.length}</span>
            </div>
            <div className="space-y-2">
              {visibleEquipment.map(e => (
                <DraggableResource key={e.id} resource={e} type="equipment" theme={theme} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN: TIMELINE */}
      <div className="flex-1 flex flex-col relative w-full overflow-hidden">
        
        {/* HEADER */}
        <div className={`h-16 border-b border-white/5 bg-${theme.primary}-950/10 backdrop-blur-md flex justify-between items-center px-4 md:px-6 sticky top-0 z-40`}>
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={() => setShowSidebar(true)} className={`lg:hidden p-2 rounded-lg bg-white/5 text-${theme.primary}-400`}><Filter size={20}/></button>
            
            <button onClick={() => setShowFilters(!showFilters)} className={`p-2 rounded-xl border border-white/5 hover:bg-white/10 transition-all flex items-center gap-2 ${selectedProjectIds.length > 0 ? `bg-${theme.primary}-600 text-white shadow-lg` : 'bg-black/20 text-gray-400'}`}>
                <Eye size={18} />
                <span className="text-xs font-bold hidden md:block">{selectedProjectIds.length > 0 ? `${selectedProjectIds.length} Projects` : 'All Projects'}</span>
            </button>

            <div className="h-8 w-px bg-white/10 mx-2"></div>

            <button onClick={() => setCurrentDate(subWeeks(currentDate, 1))} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"><ChevronLeft size={20}/></button>
            <div className="flex items-center gap-2 md:gap-3">
              <CalendarIcon size={18} className={`text-${theme.primary}-500 hidden md:block`} />
              <span className="text-sm md:text-xl font-black text-white tracking-tight">{format(weekStart, 'MMMM yyyy')}</span>
              <span className="text-[10px] md:text-sm font-medium text-gray-500 border-l border-white/10 pl-2 md:pl-3">Week of {format(weekStart, 'do')}</span>
            </div>
            <button onClick={() => setCurrentDate(addWeeks(currentDate, 1))} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"><ChevronRight size={20}/></button>
          </div>
          
          <div className="flex gap-4 items-center">
             {/* ZOOM SLIDER */}
             <div className="hidden xl:flex items-center gap-2 mr-4 bg-black/20 p-2 rounded-xl border border-white/5">
                 <span className="text-[9px] font-black uppercase text-gray-500">Scale</span>
                 <input 
                    type="range" min="60" max="300" step="10" 
                    value={zoomLevel} onChange={(e) => setZoomLevel(parseInt(e.target.value))}
                    className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-white"
                 />
             </div>

             {/* HEATMAP TOGGLE */}
             <button onClick={() => setIsHeatmapActive(!isHeatmapActive)} className={`p-2 rounded-xl border border-white/5 transition-all ${isHeatmapActive ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' : 'bg-black/20 text-gray-500'}`} title="Capacity Heatmap">
                 <Eye size={18} />
             </button>

             <button 
                onClick={handleNeuralOptimize}
                disabled={isOptimizing}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all shadow-lg ${isOptimizing ? 'bg-indigo-600 text-white animate-pulse' : 'bg-black/20 border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/20 hover:text-white'}`}
             >
                <Layers size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">{isOptimizing ? 'Optimizing...' : 'Neural Optimizer'}</span>
             </button>
             <button onClick={() => setCurrentDate(new Date())} className={`text-[10px] font-bold bg-${theme.primary}-500/10 text-${theme.primary}-400 hover:bg-${theme.primary}-500/20 px-4 py-2 rounded-xl uppercase tracking-wider transition-all hidden md:block border border-${theme.primary}-500/20`}>Today</button>
          </div>
        </div>

        {/* CALENDAR GRID */}
        <div className="flex-1 overflow-auto custom-scrollbar bg-black/20">
          <div className="min-w-full" style={{ width: Math.max(1200, days.length * zoomLevel + 300) }}>
            {/* Header Row */}
            <div className={`flex border-b border-white/5 sticky top-0 z-30 shadow-2xl`}>
              <div className={`w-72 flex-shrink-0 p-4 border-r border-white/10 font-black text-white uppercase text-[10px] tracking-[0.2em] flex items-center justify-between sticky left-0 z-40 bg-[#0a0a0c] backdrop-blur-xl border-b border-${theme.primary}-500/20`}>
                  <div className="flex items-center gap-2">
                      <div className={`w-1 h-4 bg-${theme.primary}-500 rounded-full`} />
                      <span>Project Manifest</span>
                  </div>
                  <span className={`text-${theme.primary}-400 opacity-60`}>Weekly Budget</span>
              </div>
              {days.map(day => (
                <div key={day.toString()} style={{ width: zoomLevel, minWidth: zoomLevel }} className={`flex-none p-3 text-center border-r border-white/5 bg-[#0a0a0c]/90 backdrop-blur-xl border-b border-${theme.primary}-500/10 ${isToday(day) ? `bg-${theme.primary}-900/20` : ''}`}>
                  <div className={`text-[9px] font-black uppercase mb-1 tracking-widest ${isToday(day) ? `text-${theme.primary}-400` : 'text-slate-500'}`}>{format(day, 'EEE')}</div>
                  <div className={`text-xl font-black ${isToday(day) ? 'text-white' : 'text-slate-400'}`}>{format(day, 'd')}</div>
                </div>
              ))}
            </div>

            {/* HR / Leave Row */}
            <div className="flex border-b border-white/5 bg-rose-950/5 hover:bg-rose-950/10 transition-colors group">
                <div className="w-72 flex-shrink-0 p-4 border-r border-white/10 sticky left-0 bg-[#0a0a0c]/95 backdrop-blur-xl z-20 shadow-lg relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 shadow-[0_0_15px_#f43f5e]" />
                    <div className="flex justify-between items-start mb-2 relative z-10">
                        <div className="font-black text-rose-200 truncate text-sm tracking-wide">INTERNAL OPS</div>
                        <div className="p-1 bg-rose-500/20 rounded text-rose-400"><Layers size={12} /></div>
                    </div>
                    <div className="text-[9px] text-rose-400/60 font-bold tracking-widest uppercase flex items-center gap-2">
                        HR_LEAVE_TRAINING
                    </div>
                </div>
                
                {days.map(day => {
                    const allocs = allocations.filter(a => 
                        !a.projectId && 
                        isWithinInterval(day, { start: parseISO(a.startDate), end: parseISO(a.endDate) })
                    );
                    
                    return (
                        <div key={day.toString()} style={{ width: zoomLevel, minWidth: zoomLevel }} className="flex-none">
                            <DayCell 
                                day={day} 
                                projectId="HR" 
                                allocations={allocs} 
                                conflicts={conflicts} 
                                onDrop={handleDrop} 
                                onEdit={setEditingAllocation} 
                                theme={theme}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Project Rows */}
            {visibleProjects.map(project => (
              <div key={project.id} className="flex border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                <div className={`w-72 flex-shrink-0 p-4 border-r border-white/10 sticky left-0 bg-[#0a0a0c]/95 backdrop-blur-xl z-20 shadow-xl relative overflow-hidden group/card`}>
                  <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-500 ${project.status === 'active' ? `bg-${theme.primary}-500 shadow-[0_0_20px_rgba(var(--${theme.primary}-500-rgb),0.5)]` : 'bg-slate-700'}`} />
                  
                  <div className="flex justify-between items-start mb-3 relative z-10">
                      <div>
                          <div className="font-black text-white truncate text-sm tracking-tight mb-1 group-hover/card:text-indigo-200 transition-colors">{project.name}</div>
                          <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                            {project.client || 'INTERNAL'}
                          </div>
                      </div>
                      <div className={`text-[10px] font-mono font-black ${project.status === 'active' ? 'text-emerald-400' : 'text-slate-600'}`}>
                          ${getProjectTotalWeeklyCost(project.id).toLocaleString()}
                      </div>
                  </div>

                  <div className="relative z-10 flex justify-between items-end">
                      {project.site ? (
                          <div className={`text-[9px] text-${theme.primary}-400/80 font-bold flex items-center gap-1 bg-${theme.primary}-500/10 px-2 py-1 rounded-md border border-${theme.primary}-500/20`}>
                              <MapPin size={10} /> {project.site}
                          </div>
                      ) : <div />}
                      
                      {/* Micro Budget Bar */}
                      <div className="w-20">
                          <div className="flex justify-between text-[8px] font-black text-slate-600 mb-1"><span>LOAD</span><span>{Math.min(100, Math.round(getProjectTotalWeeklyCost(project.id) / 5000 * 100))}%</span></div>
                          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${getProjectTotalWeeklyCost(project.id) > 5000 ? 'bg-rose-500' : `bg-${theme.primary}-500`}`} 
                                style={{ width: `${Math.min(100, getProjectTotalWeeklyCost(project.id) / 5000 * 100)}%` }} 
                              />
                          </div>
                      </div>
                  </div>
                </div>
                
                {days.map(day => {
                  const allocs = allocations.filter(a => 
                    a.projectId === project.id && 
                    isWithinInterval(day, { start: parseISO(a.startDate), end: parseISO(a.endDate) })
                  );
                  
                  // Add Ghosts
                  const ghosts = ghostAllocations.filter(g => 
                      g.projectId === project.id &&
                      isWithinInterval(day, { start: parseISO(g.startDate), end: parseISO(g.endDate) })
                  );

                  // Heatmap Logic
                  const totalCount = allocs.length + ghosts.length;
                  let heatColor = '';
                  if (isHeatmapActive && totalCount > 0) {
                      if (totalCount > 3) heatColor = 'bg-rose-500/10 shadow-[inset_0_0_20px_rgba(244,63,94,0.2)]';
                      else if (totalCount > 1) heatColor = 'bg-amber-500/10 shadow-[inset_0_0_20px_rgba(245,158,11,0.2)]';
                      else heatColor = 'bg-emerald-500/5 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]';
                  }

                  return (
                      <div key={day.toString()} style={{ width: zoomLevel, minWidth: zoomLevel }} className={`flex-none border-r border-white/5 transition-colors duration-500 ${heatColor}`}>
                          <DayCell 
                              day={day} 
                              projectId={project.id} 
                              allocations={[...allocs, ...ghosts]} // Merge real and ghost
                              conflicts={conflicts} 
                              onDrop={handleDrop} 
                              onEdit={(a) => a.isGhost ? confirmGhost(a) : setEditingAllocation(a)} 
                              theme={theme}
                          />
                      </div>
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