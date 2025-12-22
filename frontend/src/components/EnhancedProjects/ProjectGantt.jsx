import React, { useState, useMemo, useEffect, useRef } from 'react';
import { format, addDays, startOfDay, isSameDay, startOfToday, addMonths, startOfMonth, eachDayOfInterval } from 'date-fns';
import { 
  ChevronLeft, ChevronRight, Clock, Calendar, Search, 
  Filter, ZoomIn, ZoomOut, Maximize2, Target, 
  Briefcase, User, MapPin, AlertTriangle, ArrowRight, Sparkles
} from 'lucide-react';

const ProjectGantt = ({ projects, onViewProject, onUpdateProject }) => {
    console.log("ProjectGantt Render. onUpdateProject defined:", !!onUpdateProject);
    const [viewMode, setViewMode] = useState('month'); // 'day' | 'week' | 'month' | 'year'
    const [startDate, setStartDate] = useState(startOfMonth(new Date()));
    const [zoom, setZoom] = useState(100); // Percentage for "Time Warp"
    const [searchTerm, setSearchTerm] = useState('');
    
    const containerRef = useRef(null);

    // Filter projects for the Gantt view
    const filteredProjects = useMemo(() => {
        return projects.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.client && p.client.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [projects, searchTerm]);

    // Calculate time range based on projects and view mode
    const timeRange = useMemo(() => {
        let start = startDate;
        let end;
        
        if (viewMode === 'day') end = addDays(start, 14);
        else if (viewMode === 'week') end = addDays(start, 60);
        else if (viewMode === 'month') end = addMonths(start, 6);
        else end = addMonths(start, 24);

        return eachDayOfInterval({ start, end });
    }, [startDate, viewMode]);

    const handleToday = () => setStartDate(startOfToday());
    const handlePrev = () => {
        if (viewMode === 'day') setStartDate(addDays(startDate, -7));
        else setStartDate(addMonths(startDate, -1));
    };
    const handleNext = () => {
        if (viewMode === 'day') setStartDate(addDays(startDate, 7));
        else setStartDate(addMonths(startDate, 1));
    };

    // Responsive Column Width based on Zoom
    const colWidth = useMemo(() => {
        const base = viewMode === 'day' ? 100 : viewMode === 'week' ? 40 : 30;
        return (base * (zoom / 100));
    }, [viewMode, zoom]);

    const [isResizing, setIsResizing] = useState(null); // { id, type: 'start'|'end', initialX, initialDate }

    const handleResizeStart = (e, project, type) => {
        e.stopPropagation();
        setIsResizing({
            id: project.id,
            type,
            initialX: e.clientX,
            initialDate: type === 'start' ? new Date(project.startDate) : new Date(project.endDate || addDays(new Date(project.startDate), 7))
        });
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizing) return;
            
            const deltaX = e.clientX - isResizing.initialX;
            const daysDelta = Math.round(deltaX / colWidth);
            
            if (daysDelta === 0) return;

            // Optional: Add visual preview here if we had local state for project dates
        };

        const handleMouseUp = (e) => {
            if (isResizing) {
                const deltaX = e.clientX - isResizing.initialX;
                const daysDelta = Math.round(deltaX / colWidth);
                
                if (daysDelta !== 0 && onUpdateProject) {
                    const newDate = addDays(isResizing.initialDate, daysDelta);
                    const updates = {};
                    if (isResizing.type === 'start') updates.startDate = newDate.toISOString();
                    else updates.endDate = newDate.toISOString();
                    
                    onUpdateProject(isResizing.id, updates);
                }
                setIsResizing(null);
            }
        };

        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, colWidth, onUpdateProject]);

    const getProjectBarStyle = (project) => {
        if (!project.startDate) return { display: 'none' };
        
        const pStart = startOfDay(new Date(project.startDate));
        const pEnd = project.endDate ? startOfDay(new Date(project.endDate)) : addDays(pStart, 7);
        
        const ganttStart = timeRange[0];
        
        // Calculate offset in days from the beginning of our visible range
        const startDiff = Math.floor((pStart - ganttStart) / (1000 * 60 * 60 * 24));
        const duration = Math.max(1, Math.floor((pEnd - pStart) / (1000 * 60 * 60 * 24)));
        
        const left = startDiff * colWidth;
        const width = duration * colWidth;

        return {
            left: `${left}px`,
            width: `${width}px`,
            minWidth: '40px'
        };
    };

    return (
        <div className="flex flex-col h-full bg-[#0a0a0c] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl animate-fade-in">
            {/* GANTT TOOLBAR */}
            <div className="p-6 border-b border-white/5 bg-[#111114]/50 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex bg-black/40 rounded-xl p-1 border border-white/10">
                        {['day', 'week', 'month'].map(m => (
                            <button 
                                key={m}
                                onClick={() => setViewMode(m)}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === m ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                    
                    <div className="flex items-center gap-2 bg-black/40 rounded-xl p-1 border border-white/10">
                        <button onClick={handlePrev} className="p-2 hover:bg-white/5 rounded-lg text-gray-400"><ChevronLeft size={16} /></button>
                        <button onClick={handleToday} className="px-3 py-1 text-[10px] font-black uppercase tracking-tighter text-indigo-400 hover:text-indigo-300">Today</button>
                        <button onClick={handleNext} className="p-2 hover:bg-white/5 rounded-lg text-gray-400"><ChevronRight size={16} /></button>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Time Warp (Zoom) */}
                    <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-2xl border border-white/10">
                        <ZoomOut size={14} className="text-gray-500" />
                        <input 
                            type="range" min="50" max="200" value={zoom} 
                            onChange={(e) => setZoom(parseInt(e.target.value))}
                            className="w-24 accent-indigo-500"
                        />
                        <ZoomIn size={14} className="text-gray-500" />
                        <span className="text-[10px] font-mono font-bold text-indigo-400 w-8">{zoom}%</span>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                        <input 
                            type="text" placeholder="Search roadmap..." 
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            className="bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:border-indigo-500 outline-none w-48 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* GANTT WORKSPACE */}
            <div className="flex-1 overflow-hidden flex flex-col relative">
                {/* Timeline Header */}
                <div className="flex bg-[#161b22] border-b border-white/10 z-30 shadow-xl">
                    <div className="w-72 p-4 border-r border-white/10 font-black text-gray-400 uppercase text-[10px] tracking-widest flex items-center gap-2 bg-[#161b22] shrink-0">
                        <Briefcase size={14} className="text-indigo-500" /> Active Projects
                    </div>
                    <div className="flex-1 overflow-x-hidden">
                        <div className="flex min-w-max h-full">
                            {timeRange.map((date, idx) => {
                                const isStartOfMonth = date.getDate() === 1;
                                const isToday = isSameDay(date, new Date());
                                
                                return (
                                    <div 
                                        key={idx} 
                                        style={{ width: `${colWidth}px` }}
                                        className={`shrink-0 flex flex-col items-center justify-center border-r border-white/5 py-2 relative
                                            ${isStartOfMonth ? 'bg-white/5' : ''}
                                            ${isToday ? 'bg-indigo-500/10' : ''}
                                        `}
                                    >
                                        {isStartOfMonth && (
                                            <span className="absolute -top-0 left-2 text-[8px] font-black text-indigo-400 uppercase">
                                                {format(date, 'MMM')}
                                            </span>
                                        )}
                                        <span className={`text-[10px] font-mono font-bold ${isToday ? 'text-indigo-400' : 'text-gray-500'}`}>
                                            {format(date, 'd')}
                                        </span>
                                        <span className="text-[8px] text-gray-600 font-bold uppercase tracking-tighter">
                                            {format(date, 'EEE').charAt(0)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Gantt Body */}
                <div className="flex-1 overflow-y-auto overflow-x-auto custom-scrollbar relative bg-[#0a0a0c] group/body" ref={containerRef}>
                    {/* Immersive Background Visuals */}
                    <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:100px_100px]"></div>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#4f46e508_0%,transparent_100%)]"></div>
                    </div>

                    <div className="relative min-w-max min-h-full">
                        {/* Background Vertical Grid Lines */}
                        <div className="absolute inset-0 flex pointer-events-none h-full z-0">
                            <div className="w-72 border-r border-white/10 bg-[#0f1115]/50 h-full shrink-0" />
                            {timeRange.map((date, idx) => (
                                <div 
                                    key={idx} 
                                    style={{ width: `${colWidth}px` }}
                                    className={`shrink-0 border-r border-white/5 h-full ${isSameDay(date, new Date()) ? 'bg-indigo-500/5' : ''}`} 
                                />
                            ))}
                        </div>

                        {/* Project Rows */}
                        <div className="relative z-10">
                            {filteredProjects.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-600 w-[1000px]">
                                    <Sparkles size={48} className="mb-4 opacity-10" />
                                    <span className="text-sm font-black uppercase tracking-[0.2em] opacity-20">No matching projects in view</span>
                                </div>
                            ) : (
                                filteredProjects.map((project) => (
                                    <div key={project.id} className="flex h-20 items-center border-b border-white/5 hover:bg-white/[0.02] transition-colors group/row">
                                        {/* Project Sidebar Card */}
                                        <div className="w-72 p-4 border-r border-white/10 flex items-center gap-4 shrink-0 sticky left-0 bg-[#0a0a0c]/95 backdrop-blur-md z-20 group-hover/row:bg-[#1a1d24]/95 transition-all shadow-xl">
                                            <div 
                                                className={`w-1.5 h-12 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.3)]
                                                    ${project.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}
                                                `} 
                                            />
                                            <div className="overflow-hidden flex-1">
                                                <div className="font-black text-white text-xs truncate group-hover/row:text-indigo-400 transition-colors cursor-pointer" onClick={() => onViewProject(project)}>
                                                    {project.name}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[9px] text-gray-500 font-bold uppercase truncate">{project.client || 'No Client'}</span>
                                                    <div className="w-1 h-1 rounded-full bg-gray-700" />
                                                    <span className="text-[9px] text-indigo-500 font-mono font-bold">${(parseFloat(project.value) || 0).toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => onViewProject(project)}
                                                className="p-2 opacity-0 group-hover/row:opacity-100 transition-opacity bg-white/5 rounded-lg hover:bg-indigo-600 hover:text-white"
                                            >
                                                <ArrowRight size={14} />
                                            </button>
                                        </div>

                                        {/* Timeline Area */}
                                        <div className="flex-1 relative h-full flex items-center px-0">
                                            {project.startDate ? (
                                                <div 
                                                    className={`absolute h-10 rounded-2xl shadow-2xl flex items-center px-4 text-[10px] font-black text-white group/bar cursor-pointer border border-white/10 hover:border-white/30 transition-all hover:scale-[1.01]
                                                        ${project.status === 'active' ? 'bg-gradient-to-r from-indigo-600 to-violet-600 shadow-indigo-900/40' : 'bg-gradient-to-r from-stone-600 to-stone-800 shadow-black/40'}
                                                    `}
                                                    style={getProjectBarStyle(project)}
                                                    onClick={() => onViewProject(project)}
                                                >
                                                    {/* Resize Handles */}
                                                    <div 
                                                        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/20 rounded-l-2xl z-20"
                                                        onMouseDown={(e) => handleResizeStart(e, project, 'start')}
                                                    />
                                                    <div 
                                                        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/20 rounded-r-2xl z-20"
                                                        onMouseDown={(e) => handleResizeStart(e, project, 'end')}
                                                    />

                                                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                                                    <span className="truncate flex items-center gap-3 drop-shadow-lg">
                                                        <ActivityBar progress={project.productivityScore || 65} />
                                                        {project.name}
                                                    </span>
                                                    
                                                    {/* Conflict Indicator */}
                                                    {project.hasConflicts && (
                                                        <div className="absolute -right-2 -top-2 bg-rose-500 p-1.5 rounded-full shadow-lg animate-bounce">
                                                            <AlertTriangle size={10} />
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="ml-10 text-[9px] font-black text-gray-700 uppercase tracking-widest italic flex items-center gap-2">
                                                    <Clock size={10} /> No Timeline Defined
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* GANTT FOOTER STATS */}
            <div className="p-4 bg-black/40 border-t border-white/10 flex items-center justify-between px-10">
                <div className="flex gap-8">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Total Fleet Velocity</span>
                        <span className="text-sm font-black text-emerald-400">84.2%</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Resource Overlap</span>
                        <span className="text-sm font-black text-amber-400">Low Risk</span>
                    </div>
                </div>
                <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.3em] flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]" />
                    Pinnacle Engine 2.0 Active
                </div>
            </div>
        </div>
    );
};

// Sub-component for mini progress in the bar
const ActivityBar = ({ progress }) => (
    <div className="w-12 h-1.5 bg-black/30 rounded-full overflow-hidden flex-shrink-0">
        <div 
            className="h-full bg-emerald-400 shadow-[0_0_5px_#10b981]" 
            style={{ width: `${progress}%` }} 
        />
    </div>
);

export default ProjectGantt;
