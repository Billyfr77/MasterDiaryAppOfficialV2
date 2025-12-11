import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../utils/api';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, User, Wrench, 
  Search, Filter, Plus, GripVertical, AlertCircle, CheckCircle2, DollarSign, Edit, X, MapPin
} from 'lucide-react';
import { 
  format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, 
  isSameDay, isToday, parseISO, addWeeks, subWeeks, isWithinInterval 
} from 'date-fns';

// --- COMPONENTS ---

const DraggableResource = ({ resource, type }) => {
  const onDragStart = (e) => {
    e.dataTransfer.setData('resource', JSON.stringify({ ...resource, type }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div 
      draggable 
      onDragStart={onDragStart}
      className="bg-stone-800 p-3 rounded-xl border border-white/10 flex items-center gap-3 cursor-grab hover:bg-stone-700 hover:border-indigo-500/50 transition-all group shadow-md"
    >
      <div className={`p-2 rounded-lg ${type === 'staff' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
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

const EditAllocationModal = ({ allocation, onClose, onSave, onDelete }) => {
    const [formData, setFormData] = useState({
        startDate: allocation.startDate,
        endDate: allocation.endDate,
        notes: allocation.notes || ''
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-stone-900 border border-white/10 p-6 rounded-2xl w-96 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white">Edit Allocation</h3>
                    <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-white" /></button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date Range</label>
                        <div className="flex gap-2">
                            <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="bg-stone-800 border border-white/10 rounded-lg p-2 text-white text-sm flex-1 outline-none focus:border-indigo-500" />
                            <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="bg-stone-800 border border-white/10 rounded-lg p-2 text-white text-sm flex-1 outline-none focus:border-indigo-500" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Notes</label>
                        <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-stone-800 border border-white/10 rounded-lg p-2 text-white text-sm outline-none focus:border-indigo-500 h-24 resize-none" placeholder="Task details..." />
                    </div>
                </div>

                <div className="flex gap-2 mt-6">
                    <button onClick={() => onDelete(allocation.id)} className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg font-bold text-sm transition-colors">Delete</button>
                    <div className="flex-1"></div>
                    <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white text-sm font-bold">Cancel</button>
                    <button onClick={() => onSave(allocation.id, formData)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-sm transition-colors">Save Changes</button>
                </div>
            </div>
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
  const [dragOverCell, setDragOverCell] = useState(null); // { projectId, date }
  const [editingAllocation, setEditingAllocation] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);

  // --- DATA LOADING ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, sRes, eRes, aRes] = await Promise.all([
          api.get('/projects'),
          api.get('/staff'),
          api.get('/equipment'),
          api.get('/allocations')
        ]);
        
        setProjects(pRes.data.data || pRes.data);
        setStaff(sRes.data.data || sRes.data);
        setEquipment(eRes.data.data || eRes.data);
        setAllocations(aRes.data);
      } catch (err) {
        console.error("Failed to load resource data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- TIMELINE HELPERS ---
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({
    start: weekStart,
    end: endOfWeek(currentDate, { weekStartsOn: 1 })
  });

  // --- SMART LOGIC ---
  const conflicts = useMemo(() => {
      const conflictMap = {}; // key: resourceId-date, value: count
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
              if (s) cost += (parseFloat(s.payRateBase || 0) * 8); // Assume 8h day
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

  // --- ACTIONS ---
  const handleDrop = async (e, projectId, date) => {
    e.preventDefault();
    setDragOverCell(null);
    const resourceData = e.dataTransfer.getData('resource');
    if (!resourceData) return;
    
    const resource = JSON.parse(resourceData);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Check conflict immediately for feedback (optional, visual is better)
    
    const tempId = Date.now();
    const newAlloc = {
      id: tempId,
      resourceId: resource.id,
      resourceType: resource.type,
      projectId,
      startDate: dateStr,
      endDate: dateStr,
      status: 'scheduled',
      [resource.type === 'staff' ? 'staffResource' : 'equipmentResource']: resource 
    };
    
    setAllocations(prev => [...prev, newAlloc]);

    try {
      const res = await api.post('/allocations', {
        resourceType: resource.type,
        resourceId: resource.id,
        projectId,
        startDate: dateStr,
        endDate: dateStr
      });
      setAllocations(prev => prev.map(a => a.id === tempId ? { ...res.data, staffResource: resource.type === 'staff' ? resource : undefined, equipmentResource: resource.type === 'equipment' ? resource : undefined } : a));
    } catch (err) {
      setAllocations(prev => prev.filter(a => a.id !== tempId));
      alert("Failed to schedule resource.");
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

  if (loading) return <div className="h-screen bg-stone-950 flex items-center justify-center text-white font-mono animate-pulse">INITIALIZING COMMAND MATRIX...</div>;

  return (
    <div className="h-[calc(100vh-80px)] bg-stone-950 flex font-sans overflow-hidden text-gray-100 relative">
      {editingAllocation && (
          <EditAllocationModal 
            allocation={editingAllocation} 
            onClose={() => setEditingAllocation(null)} 
            onSave={handleUpdateAllocation}
            onDelete={handleDeleteAllocation}
          />
      )}

      {/* MOBILE BACKDROP */}
      {showSidebar && (
        <div 
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* SIDEBAR */}
      <div className={`
          fixed inset-y-0 left-0 z-50 w-80 bg-stone-900 border-r border-white/5 flex flex-col shadow-2xl transition-transform duration-300
          lg:relative lg:translate-x-0
          ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-5 border-b border-white/5 bg-stone-900/50">
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
              className="w-full bg-stone-950/50 border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-xs font-bold text-white focus:border-indigo-500 outline-none placeholder-gray-600 transition-all focus:bg-stone-950"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          {/* STAFF */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Personnel</h3>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono">{staff.length}</span>
            </div>
            <div className="space-y-2">
              {staff.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map(s => (
                <DraggableResource key={s.id} resource={s} type="staff" />
              ))}
            </div>
          </div>

          {/* EQUIPMENT */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Heavy Assets</h3>
              <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-mono">{equipment.length}</span>
            </div>
            <div className="space-y-2">
              {equipment.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase())).map(e => (
                <DraggableResource key={e.id} resource={e} type="equipment" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN: TIMELINE */}
      <div className="flex-1 flex flex-col bg-stone-950 relative w-full">
        
        {/* HEADER */}
        <div className="h-16 border-b border-white/5 bg-stone-900/30 backdrop-blur-md flex justify-between items-center px-4 md:px-6">
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={() => setShowSidebar(true)} className="lg:hidden p-2 rounded-lg bg-stone-800 text-indigo-400"><Filter size={20}/></button>
            
            <button onClick={() => setCurrentDate(subWeeks(currentDate, 1))} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"><ChevronLeft size={20}/></button>
            <div className="flex items-center gap-2 md:gap-3">
              <CalendarIcon size={18} className="text-indigo-500 hidden md:block" />
              <span className="text-sm md:text-xl font-black text-white tracking-tight">{format(weekStart, 'MMMM yyyy')}</span>
              <span className="text-[10px] md:text-sm font-medium text-gray-500 border-l border-white/10 pl-2 md:pl-3">Week of {format(weekStart, 'do')}</span>
            </div>
            <button onClick={() => setCurrentDate(addWeeks(currentDate, 1))} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"><ChevronRight size={20}/></button>
          </div>
          
          <div className="flex gap-4">
             <button onClick={() => setCurrentDate(new Date())} className="text-[10px] font-bold bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 px-3 py-1.5 rounded uppercase tracking-wider transition-all hidden md:block">Today</button>
          </div>
        </div>

        {/* CALENDAR GRID */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          <div className="min-w-[1200px]">
            {/* Header Row */}
            <div className="flex border-b border-white/10 sticky top-0 bg-stone-950 z-30 shadow-xl">
              <div className="w-72 flex-shrink-0 p-4 border-r border-white/10 bg-stone-900 font-black text-gray-500 uppercase text-[10px] tracking-[0.2em] flex items-center justify-between">
                  <span>Project Manifest</span>
                  <span>Weekly Budget</span>
              </div>
              {days.map(day => (
                <div key={day.toString()} className={`flex-1 min-w-[140px] p-3 text-center border-r border-white/5 ${isToday(day) ? 'bg-indigo-900/10' : 'bg-stone-900'}`}>
                  <div className={`text-[10px] font-bold uppercase mb-1 ${isToday(day) ? 'text-indigo-400' : 'text-gray-500'}`}>{format(day, 'EEE')}</div>
                  <div className={`text-2xl font-black ${isToday(day) ? 'text-white' : 'text-gray-300'}`}>{format(day, 'd')}</div>
                </div>
              ))}
            </div>

            {/* Project Rows */}
            {projects.map(project => (
              <div key={project.id} className="flex border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                <div className="w-72 flex-shrink-0 p-4 border-r border-white/10 sticky left-0 bg-stone-950 z-20 shadow-lg group-hover:bg-stone-900 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-white truncate text-sm max-w-[160px]">{project.name}</div>
                      <div className="text-xs font-mono text-emerald-500 font-bold">${getProjectTotalWeeklyCost(project.id).toLocaleString()}</div>
                  </div>
                  <div className="text-[10px] text-gray-500 truncate flex items-center gap-1.5 uppercase font-bold tracking-wider">
                    <div className={`w-1.5 h-1.5 rounded-full ${project.status === 'active' ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                    {project.client || 'Internal Project'}
                  </div>
                  {project.site && (
                      <div className="text-[9px] text-indigo-400 mt-1 truncate flex items-center gap-1">
                          <MapPin size={10} /> {project.site}
                      </div>
                  )}
                </div>
                
                {days.map(day => {
                  const dayStr = format(day, 'yyyy-MM-dd');
                  const allocs = allocations.filter(a => 
                    a.projectId === project.id && 
                    isWithinInterval(day, { start: parseISO(a.startDate), end: parseISO(a.endDate) })
                  );
                  const isOver = dragOverCell && dragOverCell.projectId === project.id && isSameDay(dragOverCell.date, day);
                  const dailyCost = getProjectDailyCost(project.id, day);

                  return (
                    <div 
                      key={day.toString()} 
                      className={`
                        flex-1 min-w-[140px] border-r border-white/5 p-1.5 relative transition-all min-h-[100px] flex flex-col gap-1.5
                        ${isOver ? 'bg-indigo-500/10 shadow-[inset_0_0_20px_rgba(99,102,241,0.2)]' : ''}
                      `}
                      onDragOver={(e) => { e.preventDefault(); setDragOverCell({ projectId: project.id, date: day }); }}
                      onDrop={(e) => handleDrop(e, project.id, day)}
                    >
                      {/* Daily Cost Indicator (Subtle) */}
                      {dailyCost > 0 && <div className="absolute top-1 right-1 text-[9px] font-mono text-white/10 group-hover:text-white/30 transition-colors">${dailyCost}</div>}

                      {allocs.map(alloc => {
                        const isStaff = alloc.resourceType === 'staff';
                        const resourceName = isStaff ? alloc.staffResource?.name : alloc.equipmentResource?.name;
                        const conflictKey = `${alloc.resourceId}-${dayStr}`;
                        const isConflict = conflicts[conflictKey] > 1;
                        
                        return (
                          <div 
                            key={alloc.id} 
                            onClick={() => setEditingAllocation(alloc)}
                            className={`
                              p-2 rounded-lg border text-xs font-bold shadow-lg flex items-center justify-between cursor-pointer hover:scale-[1.02] active:scale-95 transition-all
                              ${isConflict ? 'bg-red-500/20 border-red-500 text-red-200 animate-pulse' : 
                                isStaff 
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-500/40' 
                                  : 'bg-amber-500/10 border-amber-500/20 text-amber-300 hover:bg-amber-500/20 hover:border-amber-500/40'
                              }
                            `}
                          >
                            <span className="truncate">{resourceName}</span>
                            {isConflict && <AlertCircle size={12} className="text-red-500 flex-shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
            
            {projects.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                    <Wrench size={48} className="text-gray-600 mb-4" />
                    <div className="text-xl font-bold text-gray-500">No active projects detected.</div>
                    <div className="text-sm text-gray-600">Create a project to initialize the timeline.</div>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceCommand;
