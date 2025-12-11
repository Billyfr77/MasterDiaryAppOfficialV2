/*
 * MasterDiaryApp Official - Visual Map Builder (GeoCore Ultra)
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 * 
 * MASTERPIECE EDITION:
 * - Google Places Autocomplete for Instant Site Location
 * - Auto-Zone Generation from Property Bounds
 * - Automated Place Photo Integration
 * - Distance Matrix Logistics (Travel Time Calculation)
 * - Cinematic Mode
 * - Directions Service (Route Visualization)
 * - Geocoding (Reverse Address Lookup)
 * - Precise Drag & Drop via Projection Helper
 * - Integrated Resource Allocator (Mini-Allocator)
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Polygon, DrawingManager, StreetViewPanorama, OverlayView, DirectionsRenderer } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import { 
  format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, 
  isSameDay, isToday, parseISO, addWeeks, subWeeks, isWithinInterval, startOfDay 
} from 'date-fns';
import { 
  Map as MapIcon, X, Building2, Briefcase, DollarSign, TrendingUp, 
  Calendar, FileText, Plus, ArrowRight, Navigation, 
  Locate, Layers, Globe, Camera, Zap, Trash2, Edit, 
  Image as ImageIcon, Users, Truck, Search, MoreHorizontal, ChevronRight, Activity,
  Share2, Eye, Lock, CheckCircle2, AlertTriangle, ClipboardCheck
} from 'lucide-react';
import { api } from '../utils/api';
import ClientSelector from './Clients/ClientSelector';

// --- CONFIGURATION ---
const LIBRARIES = ['drawing', 'geometry', 'places'];
const STORAGE_KEY_MAP_VIEW = 'master_diary_map_view';

const MIDNIGHT_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#cbd5e1" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#334155" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#334155" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#475569" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0f172a" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3b82f6" }] },
];

const HUB_COLORS = {
    'active': '#10b981',   // Emerald
    'pending': '#f59e0b',  // Amber
    'office': '#6366f1',   // Indigo
    'archive': '#64748b'   // Slate
};

// --- RICH MARKER (OverlayView) ---
const RichMarker = ({ position, type, onClick, label, isSelected, isZoneCenter, stats, zoom }) => {
    const getPixelPositionOffset = (width, height) => ({
        x: -(width / 2),
        y: isZoneCenter ? -(height / 1.2) : -(height / 2),
    });

    let Icon = Briefcase;
    let colorClass = "bg-indigo-600 shadow-indigo-500/40";
    
    if (type === 'staff') { Icon = Users; colorClass = "bg-emerald-500 shadow-emerald-500/40"; }
    else if (type === 'equipment') { Icon = Truck; colorClass = "bg-amber-500 shadow-amber-500/40"; }
    else if (type === 'office' || type === 'OfficeZone') { Icon = Building2; colorClass = "bg-purple-600 shadow-purple-500/40"; }
    else if (type === 'ProjectZone' || type === 'project') { Icon = Briefcase; colorClass = "bg-blue-600 shadow-blue-500/40"; }
    // Safety Types
    else if (type === 'safety-incident') { Icon = AlertTriangle; colorClass = "bg-red-600 shadow-red-500/40"; }
    else if (type === 'safety-swms' || type === 'safety-other') { Icon = ClipboardCheck; colorClass = "bg-orange-500 shadow-orange-500/40"; }

    // --- ZONE HUB VISUAL ---
    if (isZoneCenter) {

        const isZoomedIn = zoom >= 16;
        return (
            <OverlayView
                position={position}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                getPixelPositionOffset={getPixelPositionOffset}
            >
                <div 
                    className="group cursor-pointer flex flex-col items-center hover:z-[100]"
                    onClick={(e) => { e.stopPropagation(); onClick(); }}
                >
                    <div className={`relative mb-2 transition-transform duration-300 group-hover:-translate-y-2 ${isZoomedIn ? 'scale-110' : ''}`}>
                        <div className={`absolute inset-0 rounded-full animate-ping opacity-20 duration-1000 ${colorClass}`}></div>
                        <div className={`
                            relative rounded-2xl flex items-center justify-center text-white 
                            shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl border-2 border-white/20 
                            bg-gradient-to-br from-white/10 to-black/40 ${colorClass}
                            ${isZoomedIn ? 'w-20 h-20' : 'w-16 h-16'}
                            transition-all duration-300
                        `}>
                            <Icon size={isZoomedIn ? 40 : 32} strokeWidth={2} className="drop-shadow-lg" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-stone-950 flex items-center justify-center shadow-lg">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                        </div>
                    </div>

                    {isZoomedIn && stats ? (
                        <div className="flex flex-col gap-1 bg-stone-950/90 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-2xl min-w-[200px] animate-fade-in-up">
                            <div className="text-sm font-black text-white uppercase tracking-widest text-center leading-tight mb-2 border-b border-white/10 pb-2">
                                {label}
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                                <div className="bg-emerald-900/30 p-1.5 rounded border border-emerald-500/20">
                                    <div className="text-emerald-400 font-bold uppercase">Rev</div>
                                    <div className="text-white font-mono font-bold">${stats.revenue?.toLocaleString() || 0}</div>
                                </div>
                                <div className="bg-rose-900/30 p-1.5 rounded border border-rose-500/20">
                                    <div className="text-rose-400 font-bold uppercase">Cost</div>
                                    <div className="text-white font-mono font-bold">${stats.cost?.toLocaleString() || 0}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-white/5 rounded-lg px-2 py-1.5 w-full justify-center border border-white/5 mt-1">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                                    <Users size={12} /> <span className="font-mono">{stats.staffCount || 0}</span>
                                </div>
                                <div className="w-px h-3 bg-white/10"></div>
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400">
                                    <Truck size={12} /> <span className="font-mono">{stats.equipCount || 0}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-1 bg-stone-950/80 backdrop-blur-xl border border-white/10 p-2 rounded-xl shadow-2xl min-w-[140px] transition-all group-hover:scale-105 group-hover:border-indigo-500/50">
                            <div className="text-xs font-black text-white uppercase tracking-widest text-center leading-tight max-w-[160px] truncate px-1">
                                {label}
                            </div>
                        </div>
                    )}
                    <div className="w-0.5 h-8 bg-gradient-to-b from-indigo-500 to-transparent opacity-50"></div>
                    <div className="w-4 h-1 bg-indigo-500/50 blur-[2px] rounded-full"></div>
                </div>
            </OverlayView>
        );
    }

    // --- STANDARD ASSET MARKER ---
    return (
        <OverlayView
            position={position}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            getPixelPositionOffset={getPixelPositionOffset}
        >
            <div 
                className={`relative group cursor-pointer transition-all duration-300 ${isSelected ? 'scale-125 z-50' : 'hover:scale-110 z-30'}`}
                onClick={(e) => { e.stopPropagation(); onClick(); }}
            >
                <div className={`absolute inset-0 rounded-full animate-ping opacity-40 ${colorClass}`}></div>
                <div className={`relative w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-lg backdrop-blur-sm ${colorClass} border border-white/20`}>
                    <Icon size={16} strokeWidth={2.5} />
                </div>
                <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/90 backdrop-blur text-white text-[9px] font-bold px-3 py-1 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50 flex items-center gap-1`}>
                    {label}
                </div>
            </div>
        </OverlayView>
    );
};

// --- HELPER FOR PROJECTION ---
const ProjectionHelper = ({ setProjection }) => {
    return (
        <OverlayView
            position={{ lat: 0, lng: 0 }}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            onLoad={(overlay) => setProjection(overlay.getProjection())}
        >
            <div />
        </OverlayView>
    );
};

// --- PROJECT HUB DRAWER ---
const ProjectHubDrawer = ({ project, onClose, onDelete, onUpdate, allStaff, allEquipment, globalAllocations = [] }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview'); 
    const [clientMode, setClientMode] = useState(false); 
    const [loading, setLoading] = useState(true);
    
    // Timeline State
    const [currentDate, setCurrentDate] = useState(new Date());
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({
        start: weekStart,
        end: endOfWeek(currentDate, { weekStartsOn: 1 })
    });

    const isHQ = project.properties?.type === 'office' || project.properties?.type === 'OfficeZone';
    
    // Stats & Data
    const [stats, setStats] = useState({ revenue: 0, cost: 0, margin: 0 });
    const [logistics, setLogistics] = useState({ distance: '...', duration: '...' });
    const [diaries, setDiaries] = useState([]);
    const [allocations, setAllocations] = useState([]);
    const [safetyForms, setSafetyForms] = useState([]); // Added Safety
    const [isAllocating, setIsAllocating] = useState(false);
    const [newAlloc, setNewAlloc] = useState({ type: 'staff', id: '', start: '', end: '' });

    const loadProjectData = async () => {
        setLoading(true);
        // Clear previous state to prevent stale data
        setAllocations([]); 
        try {
            const [diaryRes, allocRes, safetyRes] = await Promise.all([
                api.get('/diaries'),
                api.get(`/allocations?projectId=${project.id}&t=${Date.now()}`), // Add timestamp to bust cache
                api.get(`/safety?projectId=${project.id}`)
            ]);

            const allDiaries = Array.isArray(diaryRes.data.data) ? diaryRes.data.data : [];
            const projectDiaries = allDiaries.filter(d => String(d.projectId) === String(project.id));
            
            const revenue = projectDiaries.reduce((sum, d) => sum + (parseFloat(d.totalRevenue) || 0), 0);
            const cost = projectDiaries.reduce((sum, d) => sum + (parseFloat(d.totalCost) || 0), 0);

            setStats({ revenue, cost, margin: revenue - cost });
            setDiaries(projectDiaries.slice(0, 10)); 
            setAllocations(allocRes.data || []);
            setSafetyForms(safetyRes.data || []);
        } catch (e) { console.error("Hub Data Error", e); }
        setLoading(false);
    };

    useEffect(() => {
        if (project?.id) loadProjectData();
    }, [project]);

    // Refresh data when switching to resources tab to ensure latest allocations
    useEffect(() => {
        if (activeTab === 'resources' && project?.id) {
            api.get(`/allocations?projectId=${project.id}&t=${Date.now()}`)
               .then(res => setAllocations(res.data || []))
               .catch(e => console.error("Resource refresh failed", e));
        }
    }, [activeTab, project]);

    const handleAllocate = async () => {
        if (!newAlloc.id || !newAlloc.start || !newAlloc.end) return alert("Please fill all fields");
        try {
            const res = await api.post('/allocations', {
                projectId: project.id,
                resourceType: newAlloc.type,
                resourceId: newAlloc.id,
                startDate: newAlloc.start,
                endDate: newAlloc.end,
                status: 'active'
            });
            setAllocations([...allocations, res.data]);
            setIsAllocating(false);
            setNewAlloc({ type: 'staff', id: '', start: '', end: '' });
            onUpdate(); // Refresh parent map to show new markers
        } catch(e) { alert("Allocation failed: " + e.message); }
    };

    const handleRemoveAllocation = async (id) => {
        if(!confirm("Release this resource?")) return;
        try {
            await api.delete(`/allocations/${id}`);
            setAllocations(allocations.filter(a => a.id !== id));
            onUpdate();
        } catch(e) { console.error(e); }
    };

    const formatMoney = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    // Helper to check availability
    const isResourceBusy = (id, type) => {
        const today = new Date().toISOString().split('T')[0];
        return globalAllocations.some(a => 
            String(a.resourceId) === String(id) && 
            a.resourceType === type && 
            a.startDate <= today && 
            a.endDate >= today &&
            String(a.projectId) !== String(project.id) // Don't count self
        );
    };

    // Timeline Helpers
    const getWeeklyAllocations = () => {
        return allocations.filter(alloc => {
            const start = parseISO(alloc.startDate);
            const end = parseISO(alloc.endDate);
            const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
            return (start <= weekEnd && end >= weekStart);
        });
    };

    const weeklyAllocations = getWeeklyAllocations();
    
    // Get unique resources active this week
    const activeResources = useMemo(() => {
        const resourceIds = new Set(weeklyAllocations.map(a => a.resourceId));
        return Array.from(resourceIds).map(id => {
            const s = allStaff.find(x => String(x.id) === String(id));
            if (s) return { ...s, type: 'staff' };
            const e = allEquipment.find(x => String(x.id) === String(id));
            if (e) return { ...e, type: 'equipment' };
            // Fallback from allocation if not found in list (shouldn't happen often with synced lists)
            const alloc = weeklyAllocations.find(a => String(a.resourceId) === String(id));
            if (alloc?.staffResource) return { ...alloc.staffResource, type: 'staff' };
            if (alloc?.equipmentResource) return { ...alloc.equipmentResource, type: 'equipment' };
            return { id, name: 'Unknown Resource', type: 'unknown' };
        });
    }, [weeklyAllocations, allStaff, allEquipment]);

    return (
        <div className={`absolute top-0 right-0 bottom-0 bg-stone-950 border-l border-white/10 shadow-2xl flex flex-col animate-slide-left z-50 font-sans transition-all duration-500 w-[600px]`}>
            <div className="relative h-48 bg-slate-900 overflow-hidden flex-shrink-0">
                {project.properties?.coverImage ? (
                    <img src={project.properties.coverImage} className="w-full h-full object-cover" alt="Cover" />
                ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${isHQ ? 'from-purple-900 to-slate-900' : 'from-indigo-900 to-slate-900'} flex items-center justify-center`}>
                        <Building2 size={60} className="text-white/10" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent pointer-events-none" />
                
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                    <button onClick={() => onDelete(project)} className="p-2 bg-rose-600/80 hover:bg-rose-500 rounded-full text-white backdrop-blur-md transition-all shadow-lg hover:scale-110" title="Delete Zone"><Trash2 size={16} /></button>
                    <button onClick={onClose} className="p-2 bg-black/40 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all"><X size={16} /></button>
                </div>

                <div className="absolute bottom-6 left-8 z-20 right-8">
                    <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isHQ ? 'text-purple-400' : 'text-indigo-400'}`}>
                        {isHQ ? 'Regional Headquarters' : 'Active Project Site'}
                    </div>
                    <h2 className="text-3xl font-black text-white leading-none mb-2 drop-shadow-xl">{project.name}</h2>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
                        <Navigation size={12} className={isHQ ? "text-purple-400" : "text-indigo-400"} /> {project.site || 'Geo-Tagged Zone'}
                    </div>
                </div>
            </div>

            <div className="flex border-b border-white/5 bg-stone-900/50 p-1 backdrop-blur-sm sticky top-0 z-10 flex-shrink-0">
                {['overview', 'resources', 'safety', 'diaries'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-wider transition-all border-b-2 ${activeTab === tab ? (isHQ ? 'border-purple-500 text-white bg-white/5' : 'border-indigo-500 text-white bg-white/5') : 'border-transparent text-gray-500 hover:text-gray-300'}`}>{tab}</button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8 bg-stone-950">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* ... existing overview content ... */}
                        {isHQ ? (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-stone-900 border border-white/5 p-5 rounded-3xl relative overflow-hidden">
                                    <div className="absolute -right-4 -bottom-4 text-purple-900/20"><Users size={80} /></div>
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Staff</span>
                                    <div className="text-3xl font-black text-white mt-1">{allStaff.length}</div>
                                </div>
                                <div className="bg-stone-900 border border-white/5 p-5 rounded-3xl relative overflow-hidden">
                                    <div className="absolute -right-4 -bottom-4 text-purple-900/20"><Truck size={80} /></div>
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Fleet</span>
                                    <div className="text-3xl font-black text-white mt-1">{allEquipment.length}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-stone-900 border border-white/5 p-5 rounded-3xl">
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Revenue</span>
                                    <div className="text-2xl font-black text-white mt-1">{formatMoney(stats.revenue)}</div>
                                </div>
                                <div className="bg-stone-900 border border-white/5 p-5 rounded-3xl">
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Cost</span>
                                    <div className="text-2xl font-black text-white mt-1">{formatMoney(stats.cost)}</div>
                                </div>
                            </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => navigate('/quotes/builder', { state: { projectId: project.id } })} className="p-4 bg-stone-900 hover:bg-stone-800 rounded-2xl border border-white/5 hover:border-indigo-500/50 transition-all flex flex-col items-center gap-2">
                                <FileText size={20} className="text-indigo-400" />
                                <span className="text-xs font-bold text-white">New Quote</span>
                            </button>
                            <button onClick={() => navigate('/diary', { state: { projectId: project.id } })} className="p-4 bg-stone-900 hover:bg-stone-800 rounded-2xl border border-white/5 hover:border-emerald-500/50 transition-all flex flex-col items-center gap-2">
                                <Calendar size={20} className="text-emerald-400" />
                                <span className="text-xs font-bold text-white">Log Diary</span>
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'safety' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-black text-white uppercase tracking-wider">Safety Documents</h3>
                            <button onClick={() => navigate('/safety/new', { state: { projectId: project.id } })} className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1">
                                <Plus size={14} /> New Form
                            </button>
                        </div>
                        <div className="space-y-3">
                            {safetyForms.map(form => (
                                <div key={form.id} onClick={() => navigate(`/safety/${form.id}`)} className="cursor-pointer p-3 bg-stone-900 hover:bg-stone-800 rounded-xl border border-white/5 flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${form.type === 'INCIDENT_REPORT' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                            {form.type === 'INCIDENT_REPORT' ? <AlertTriangle size={14}/> : <ClipboardCheck size={14}/>}
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-white">{form.title}</div>
                                            <div className="text-[10px] text-gray-500">{new Date(form.createdAt).toLocaleDateString()} • {form.status}</div>
                                        </div>
                                    </div>
                                    <ChevronRight size={14} className="text-gray-600 group-hover:text-white" />
                                </div>
                            ))}
                            {safetyForms.length === 0 && <div className="text-center text-gray-500 text-xs py-4">No safety forms recorded.</div>}
                        </div>
                    </div>
                )}

                {activeTab === 'resources' && (
                    <div className="space-y-6">
                        {/* HEADER & ASSIGN */}
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-black text-white uppercase tracking-wider">{isHQ ? 'HQ Resource Pool' : 'Site Allocations'}</h3>
                            <button onClick={() => setIsAllocating(!isAllocating)} className={`text-xs font-bold ${isHQ ? 'text-purple-400 hover:text-purple-300' : 'text-emerald-400 hover:text-emerald-300'} flex items-center gap-1`}>
                                <Plus size={14} /> {isAllocating ? 'Cancel' : 'Assign'}
                            </button>
                        </div>

                        {isAllocating && (
                            <div className={`bg-stone-900 p-4 rounded-xl border ${isHQ ? 'border-purple-500/30' : 'border-emerald-500/30'} space-y-3 animate-fade-in-up`}>
                                <div className="flex gap-2">
                                    <button onClick={() => setNewAlloc({...newAlloc, type: 'staff'})} className={`flex-1 py-1 text-xs font-bold rounded ${newAlloc.type === 'staff' ? 'bg-emerald-500 text-white' : 'bg-black/30 text-gray-500'}`}>Staff</button>
                                    <button onClick={() => setNewAlloc({...newAlloc, type: 'equipment'})} className={`flex-1 py-1 text-xs font-bold rounded ${newAlloc.type === 'equipment' ? 'bg-amber-500 text-white' : 'bg-black/30 text-gray-500'}`}>Equipment</button>
                                </div>
                                <select 
                                    className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-xs text-white outline-none"
                                    value={newAlloc.id}
                                    onChange={e => setNewAlloc({...newAlloc, id: e.target.value})}
                                >
                                    <option value="">Select Resource...</option>
                                    {newAlloc.type === 'staff' 
                                        ? allStaff.map(s => (
                                            <option key={s.id} value={s.id}>
                                                {s.name} {isResourceBusy(s.id, 'staff') ? '(Busy)' : ''}
                                            </option>
                                        ))
                                        : allEquipment.map(e => (
                                            <option key={e.id} value={e.id}>
                                                {e.name} {isResourceBusy(e.id, 'equipment') ? '(Busy)' : ''}
                                            </option>
                                        ))
                                    }
                                </select>
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="date" className="bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-white" value={newAlloc.start} onChange={e => setNewAlloc({...newAlloc, start: e.target.value})} />
                                    <input type="date" className="bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-white" value={newAlloc.end} onChange={e => setNewAlloc({...newAlloc, end: e.target.value})} />
                                </div>
                                <button onClick={handleAllocate} className={`w-full py-2 ${isHQ ? 'bg-purple-600 hover:bg-purple-500' : 'bg-emerald-600 hover:bg-emerald-500'} rounded text-xs font-bold text-white transition-colors`}>
                                    Confirm Assignment
                                </button>
                            </div>
                        )}

                        {/* TIMELINE VIEW */}
                        <div className="bg-stone-900 border border-white/5 rounded-xl overflow-hidden shadow-lg">
                            {/* Week Control */}
                            <div className="flex items-center justify-between p-3 border-b border-white/5 bg-stone-900/50 backdrop-blur">
                                <button onClick={() => setCurrentDate(subWeeks(currentDate, 1))} className="text-gray-400 hover:text-white"><ArrowRight className="rotate-180" size={14}/></button>
                                <div className="text-[10px] font-black text-white uppercase tracking-widest">
                                    Week of {format(weekStart, 'MMM do')}
                                </div>
                                <button onClick={() => setCurrentDate(addWeeks(currentDate, 1))} className="text-gray-400 hover:text-white"><ArrowRight size={14}/></button>
                            </div>

                            {/* Timeline Header */}
                            <div className="grid grid-cols-[100px_1fr] border-b border-white/5 bg-stone-950">
                                <div className="p-2 border-r border-white/5 text-[9px] font-bold text-gray-500 uppercase tracking-widest flex items-center justify-center">Asset</div>
                                <div className="grid grid-cols-7">
                                    {weekDays.map(day => (
                                        <div key={day.toISOString()} className={`p-2 text-center border-r border-white/5 last:border-0 ${isToday(day) ? 'bg-indigo-900/20 text-indigo-400' : 'text-gray-500'}`}>
                                            <div className="text-[8px] font-bold uppercase">{format(day, 'EEE')}</div>
                                            <div className="text-[10px] font-black">{format(day, 'd')}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Resources Rows */}
                            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                {activeResources.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500 text-xs">No active allocations for this week.</div>
                                ) : (
                                    activeResources.map(resource => (
                                        <div key={resource.id} className="grid grid-cols-[100px_1fr] border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                            <div className="p-2 border-r border-white/5 flex flex-col justify-center bg-stone-900 z-10">
                                                <div className="text-[10px] font-bold text-white truncate">{resource.name}</div>
                                                <div className={`text-[8px] uppercase tracking-wider font-bold ${resource.type === 'staff' ? 'text-emerald-500' : 'text-amber-500'}`}>{resource.type}</div>
                                            </div>
                                            <div className="grid grid-cols-7">
                                                {weekDays.map(day => {
                                                    const isAllocated = weeklyAllocations.some(a => 
                                                        String(a.resourceId) === String(resource.id) &&
                                                        isWithinInterval(day, { start: parseISO(a.startDate), end: parseISO(a.endDate) })
                                                    );
                                                    
                                                    // Find the allocation ID for removal context if needed (can add click handler)
                                                    const allocation = weeklyAllocations.find(a => 
                                                        String(a.resourceId) === String(resource.id) &&
                                                        isWithinInterval(day, { start: parseISO(a.startDate), end: parseISO(a.endDate) })
                                                    );

                                                    return (
                                                        <div key={day.toISOString()} className="border-r border-white/5 last:border-0 relative p-1 group/cell">
                                                            {isAllocated && (
                                                                <div className={`w-full h-full rounded ${resource.type === 'staff' ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-amber-500/20 border border-amber-500/30'} flex items-center justify-center relative group-hover/cell:opacity-80 transition-all`}>
                                                                    <div className={`w-1.5 h-1.5 rounded-full ${resource.type === 'staff' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                                                    
                                                                    {/* Delete Button (On Hover) */}
                                                                    <button 
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            if(allocation) handleRemoveAllocation(allocation.id);
                                                                        }}
                                                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/cell:opacity-100 transition-opacity shadow-lg scale-75 hover:scale-100"
                                                                        title="Remove Allocation"
                                                                    >
                                                                        <X size={10} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- HELPER ---
const getPolygonCenter = (coordinates) => {
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length === 0) return null;
    let valid = coordinates.map(c => {
         if (c && typeof c === 'object' && 'lat' in c && 'lng' in c) return c;
         if (Array.isArray(c) && c.length >= 2) return { lat: c[0], lng: c[1] };
         return null;
    }).filter(Boolean);
    if(valid.length === 0) return null;

    const lat = valid.reduce((sum, c) => sum + c.lat, 0) / valid.length;
    const lng = valid.reduce((sum, c) => sum + c.lng, 0) / valid.length;
    return { lat, lng };
};

// --- MAIN BUILDER ---
const VisualMapBuilder = ({ readOnly = false, initialProjectId = null }) => {
  const [map, setMap] = useState(null);
  const [mapProjection, setMapProjection] = useState(null);
  const mapContainerRef = useRef(null);
  const drawingManagerRef = useRef(null); // Ref for robust clearing
  const inputRef = useRef(null);

  const [drawingMode, setDrawingMode] = useState(null);
  const [mapTypeId, setMapTypeId] = useState('roadmap');
  const [tilt, setTilt] = useState(0); 
  const [heading, setHeading] = useState(0);

  const [assets, setAssets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [staff, setStaff] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [allocations, setAllocations] = useState([]); // Global allocations for map rendering
  const [safetyForms, setSafetyForms] = useState([]); // Global safety forms
  const [projectStats, setProjectStats] = useState([]);

  const [selectedHub, setSelectedHub] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [activeTab, setActiveTab] = useState('assets'); 
  const [filterText, setFilterText] = useState('');
  
  // Creation Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newZonePath, setNewZonePath] = useState(null);
  const [newHubData, setNewHubData] = useState({ name: '', type: 'project', site: '', client: '' }); 
  const [draggedProject, setDraggedProject] = useState(null);
  
  const [initialView] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MAP_VIEW);
      if (saved && !initialProjectId) return JSON.parse(saved);
    } catch (e) { }
    return { center: { lat: -33.8688, lng: 151.2093 }, zoom: 13 };
  });

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES
  });

  const fetchData = useCallback(async () => {
      try {
          console.log("Fetching Map Data...");
          const ts = Date.now();
          
          // 1. Critical Data: Projects & Assets
          let projectsData = [];
          try {
              const pRes = await api.get(`/projects?t=${ts}`);
              projectsData = pRes.data.data || pRes.data || [];
              setProjects(projectsData);
          } catch (e) { 
              console.error("Failed to load projects", e); 
          }

          try {
              const mRes = await api.get(`/map-assets?t=${ts}`);
              const rawAssets = mRes.data || [];
              const parsedAssets = rawAssets.map(a => {
                 let c = a.coordinates;
                 if (typeof c === 'string') {
                     try { c = JSON.parse(c); } catch(e) {}
                 }
                 return { ...a, coordinates: c };
              });
              setAssets(parsedAssets);
          } catch (e) { console.error("Failed to load assets", e); }

          // 2. Secondary Data (Fail gracefully)
          try {
              const sRes = await api.get(`/staff?t=${ts}`);
              setStaff(sRes.data.data || sRes.data || []);
          } catch (e) {}

          try {
              const eRes = await api.get(`/equipment?t=${ts}`);
              setEquipment(eRes.data.data || eRes.data || []);
          } catch (e) {}

          try {
              const aRes = await api.get(`/allocations?t=${ts}`);
              setAllocations(aRes.data || []);
          } catch (e) {}

          try {
              const safeRes = await api.get(`/safety?t=${ts}`); // Fetch all safety forms for pins
              setSafetyForms(safeRes.data || []);
          } catch (e) {
              console.error("Safety Load Error:", e.response?.data || e.message);
          }

          try {
              const statRes = await api.get(`/projects/map-stats?t=${ts}`);
              setProjectStats(statRes.data || []);
          } catch (e) {}

      } catch(err) { console.error("General Map Load Error", err); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e) => {
      e.preventDefault();
      const dataStr = e.dataTransfer.getData('application/geo-asset');
      if (!dataStr) return;
      const item = JSON.parse(dataStr);

      if (item.type === 'project-init') {
          setDraggedProject(item);
          if (inputRef.current) inputRef.current.focus();
          alert(`Initializing "${item.name}". Search location then click "Draw Zone".`);
      }
  };

// ... rest of search logic ...
  useEffect(() => {
      if (isLoaded && inputRef.current && window.google && !readOnly) {
          const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, { fields: ['geometry', 'name', 'photos', 'formatted_address'] });
          const geocoder = new window.google.maps.Geocoder();

          const handlePlaceSelect = () => {
              const place = autocomplete.getPlace();
              let location = null;
              let address = '';

              if (!place || !place.geometry) {
                  const query = inputRef.current.value;
                  if (query) {
                      geocoder.geocode({ address: query }, (results, status) => {
                          if (status === 'OK' && results[0]) {
                              location = results[0].geometry.location;
                              map.setCenter(location);
                              map.setZoom(18);
                              if(draggedProject) setNewHubData(prev => ({...prev, site: results[0].formatted_address }));
                          }
                      });
                  }
                  return;
              }

              location = place.geometry.location;
              address = place.formatted_address;
              map.setCenter(location);
              map.setZoom(18);
              
              if(place.photos && place.photos.length > 0) {
                  const url = place.photos[0].getUrl({ maxWidth: 800 });
                  setNewHubData(prev => ({...prev, coverImage: url }));
              }
              setNewHubData(prev => ({...prev, site: address }));
          };
          autocomplete.addListener('place_changed', handlePlaceSelect);
      }
  }, [isLoaded, map, draggedProject, readOnly]);

  // Force reset map cursor when exiting drawing mode
  useEffect(() => {
      if (drawingMode === null && map) {
          map.setOptions({ 
              draggable: true, 
              draggableCursor: null, // Reset to default hand
              clickableIcons: false 
          });
      }
  }, [drawingMode, map]);

  const onMapLoad = useCallback((mapInstance) => {
      setMap(mapInstance);
      mapInstance.setTilt(tilt);
      mapInstance.setHeading(heading);
  }, [tilt, heading]);

  const handlePolygonComplete = async (polygon) => {
      const path = polygon.getPath();
      const coords = [];
      for(let i=0; i<path.getLength(); i++) {
          coords.push({ lat: path.getAt(i).lat(), lng: path.getAt(i).lng() });
      }
      polygon.setMap(null); 
      setNewZonePath(coords);
      setDrawingMode(null);
      if (map) {
          map.setOptions({ 
              draggable: true, 
              draggableCursor: null, 
              clickableIcons: false 
          });
      }

      if (draggedProject) {
          setNewHubData(prev => ({ ...prev, name: draggedProject.name, type: 'project' }));
      } else {
          setNewHubData(prev => ({ ...prev, name: '', type: 'project' }));
      }
      setShowCreateModal(true);
  };

  const createHub = async () => {
      if (!newZonePath) return;
      try {
          let projectId = draggedProject?.id || null;
          
          if (!projectId && newHubData.type === 'project') {
              if (!newHubData.name) return alert("Project Name is required.");
              if (!newHubData.clientId) return alert("Please select a Client from the database.");

              const pRes = await api.post('/projects', {
                  name: newHubData.name,
                  status: 'active',
                  site: newHubData.site || 'Map Zone',
                  clientId: newHubData.clientId
              });
              const newProj = pRes.data.data || pRes.data;
              if (newProj && newProj.id) projectId = newProj.id;
          }

          const assetPayload = {
              type: newHubData.type === 'office' ? 'OfficeZone' : 'ProjectZone',
              name: newHubData.name,
              geometryType: 'POLYGON',
              coordinates: newZonePath,
              projectId: projectId,
              properties: { 
                  color: newHubData.type === 'office' ? HUB_COLORS.office : HUB_COLORS.active,
                  type: newHubData.type,
                  coverImage: newHubData.coverImage,
                  address: newHubData.site
              }
          };

          await api.post('/map-assets', assetPayload);
          await fetchData(); 

          setShowCreateModal(false);
          setNewHubData({ name: '', type: 'project', site: '', client: '', coverImage: null });
          setNewZonePath(null);
          setDraggedProject(null);
      } catch (e) { alert("Failed to create hub: " + e.message); }
  };

  const handleZoneClick = (zone) => {
      if (drawingMode) return; 
      const linkedProject = projects.find(p => String(p.id) === String(zone.projectId));
      const hub = {
          id: linkedProject?.id || zone.id, 
          assetId: zone.id, 
          name: linkedProject?.name || zone.name,
          site: linkedProject?.site || 'Map Zone',
          isProject: !!linkedProject,
          coordinates: zone.coordinates,
          properties: zone.properties || {}
      };
      setSelectedHub(hub);
      setSelectedAsset(null);
  };

  const deleteAsset = async (asset) => {
      if(!confirm("Delete this zone/asset? This action cannot be undone.")) return;
      try {
          const targetId = asset.assetId || asset.id;
          await api.delete(`/map-assets/${targetId}`);
          await fetchData();
          setSelectedAsset(null);
          setSelectedHub(null);
      } catch(e) { 
          console.error("Delete failed", e);
          alert("Failed to delete. Please try refreshing the page.");
      }
  };

  const handleHubUpdate = (updatedHub) => {
      setAssets(prev => prev.map(z => z.id === updatedHub.assetId ? { ...z, properties: updatedHub.properties } : z));
      setSelectedHub(updatedHub);
  };

  const getRenderableAssets = () => {
      const now = new Date().toISOString().split('T')[0];
      
      const staticAssets = assets.filter(a => a.geometryType === 'POLYGON');
      
      const dynamicMarkers = allocations.map(alloc => {
          if (alloc.startDate > now || alloc.endDate < now) return null;
          const zone = assets.find(z => String(z.projectId) === String(alloc.projectId));
          if (!zone) return null;
          
          const center = getPolygonCenter(zone.coordinates);
          if (!center) return null;
          
          // Jitter
          const jitterLat = (parseInt(alloc.id.slice(-4), 16) % 100 - 50) * 0.0001;
          const jitterLng = (parseInt(alloc.id.slice(-2), 16) % 100 - 50) * 0.0001;
          
          const label = (alloc.resourceType === 'staff' ? alloc.staffResource?.name : alloc.equipmentResource?.name) || 
              (alloc.resourceType === 'staff' 
                  ? staff.find(s => s.id === alloc.resourceId)?.name 
                  : equipment.find(e => e.id === alloc.resourceId)?.name);

          return {
              id: `alloc-${alloc.id}`,
              name: label || 'Resource',
              type: alloc.resourceType,
              coordinates: [{ lat: center.lat + jitterLat, lng: center.lng + jitterLng }],
              geometryType: 'POINT'
          };
      }).filter(Boolean);

      const safetyMarkers = safetyForms
        .filter(f => f.latitude && f.longitude)
        .map(f => ({
            id: `safety-${f.id}`,
            name: f.title,
            type: f.type === 'INCIDENT_REPORT' ? 'safety-incident' : 'safety-swms',
            coordinates: [{ lat: parseFloat(f.latitude), lng: parseFloat(f.longitude) }],
            geometryType: 'POINT'
        }));

      return [...staticAssets, ...dynamicMarkers, ...safetyMarkers];
  };

  if (!isLoaded) return <div className="h-screen bg-slate-950 flex items-center justify-center text-indigo-500 font-mono">INITIALIZING GEOCORE...</div>;

  const renderableAssets = getRenderableAssets();

  return (
    <div className="relative w-full h-[calc(100vh-64px)] bg-stone-950 overflow-hidden flex font-sans">
      
      {/* SIDEBAR */}
      {!readOnly && (
      <div className="w-80 bg-stone-900/95 border-r border-white/5 flex flex-col z-20 backdrop-blur-xl shadow-2xl relative">
          <div className="p-6 border-b border-white/5 bg-gradient-to-r from-indigo-900/20 to-transparent">
              <h1 className="text-xl font-black text-white tracking-tighter flex items-center gap-2">
                 <MapIcon className="text-indigo-500" /> GEOCORE <span className="text-indigo-500">ULTRA</span>
              </h1>
          </div>

          <div className="p-4 grid grid-cols-2 gap-3 border-b border-white/5">
              <button onClick={() => setDrawingMode(prev => prev === 'polygon' ? null : 'polygon')} className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${drawingMode==='polygon' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-stone-800 border-white/5 text-gray-400 hover:text-white'}`}>
                  <Layers size={20} /> <span className="text-[10px] font-bold uppercase">Draw Zone</span>
              </button>
              <button onClick={fetchData} className="col-span-1 p-2 rounded-xl border border-white/5 bg-stone-800 text-gray-400 hover:text-white flex flex-col items-center justify-center gap-1" title="Refresh Data">
                  <Activity size={16} /> <span className="text-[10px] font-bold uppercase">Refresh</span>
              </button>
          </div>

          <div className="flex border-b border-white/5">
              <button onClick={() => setActiveTab('assets')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-wider transition-colors ${activeTab==='assets' ? 'text-white border-b-2 border-indigo-500 bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}>Unmapped</button>
              <button onClick={() => setActiveTab('zones')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-wider transition-colors ${activeTab==='zones' ? 'text-white border-b-2 border-emerald-500 bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}>Zones</button>
          </div>

          <div className="p-4">
              <div className="relative">
                  <Search size={14} className="absolute left-3 top-3 text-gray-500" />
                  <input type="text" placeholder="Filter list..." value={filterText} onChange={e => setFilterText(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-indigo-500 outline-none" />
              </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {activeTab === 'assets' && (
                  <>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Projects (Drag to Map)</div>
                    {projects.filter(p => !assets.some(a => a.projectId && String(a.projectId) === String(p.id)) && p.name.toLowerCase().includes(filterText.toLowerCase())).map(p => (
                        <div key={p.id} draggable onDragStart={(e) => e.dataTransfer.setData('application/geo-asset', JSON.stringify({ ...p, type: 'project-init' }))} className="p-3 bg-stone-800 rounded-xl border border-white/5 hover:border-indigo-500/50 cursor-grab active:cursor-grabbing flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold text-xs"><Briefcase size={14}/></div>
                                <div><div className="text-xs font-bold text-white">{p.name}</div><div className="text-[10px] text-gray-500">Unmapped</div></div>
                            </div>
                            <MoreHorizontal size={14} className="text-gray-600 group-hover:text-white" />
                        </div>
                    ))}
                  </>
              )}
              {activeTab === 'zones' && (
                  assets.filter(a => a.geometryType === 'POLYGON').map(a => (
                      <div key={a.id} onClick={() => handleZoneClick(a)} className="p-3 bg-stone-800 rounded-xl border border-white/5 hover:bg-stone-700 cursor-pointer flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400"><Layers size={16}/></div>
                          <div className="flex-1 min-w-0"><div className="text-xs font-bold text-white truncate">{a.name}</div><div className="text-[10px] text-gray-500">Active Zone</div></div>
                          <ChevronRight size={14} className="text-gray-600" />
                      </div>
                  ))
              )}
          </div>
      </div>
      )}

      {/* MAP SURFACE */}
      <div 
        ref={mapContainerRef} 
        className="flex-1 relative" 
        onDragOver={handleDragOver} 
        onDrop={handleDrop} 
      >
          {!readOnly && (
          <input
              ref={inputRef}
              type="text"
              placeholder="Search location..."
              className="absolute top-4 left-1/2 -translate-x-1/2 w-96 px-6 py-3 bg-stone-900/90 backdrop-blur-md border border-white/10 rounded-full text-white font-bold shadow-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 z-[60] pointer-events-auto"
          />
          )}
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={initialView.center}
            zoom={initialView.zoom}
            mapId="90f87356969d889c"
            options={{ 
                styles: mapTypeId === 'roadmap' ? MIDNIGHT_STYLE : null, 
                disableDefaultUI: true, 
                streetViewControl: true, 
                mapTypeControl: false, 
                clickableIcons: false 
            }}
            onLoad={onMapLoad}
          >
              <ProjectionHelper setProjection={setMapProjection} />

              {/* Drawing Manager - Conditionally Rendered for Clean Reset */}
              {drawingMode === 'polygon' && (
                  <DrawingManager
                      key="drawing-manager-polygon"
                      onLoad={dm => { drawingManagerRef.current = dm; }}
                      drawingMode={window.google?.maps?.drawing?.OverlayType?.POLYGON || 'polygon'}
                      onPolygonComplete={handlePolygonComplete}
                      options={{ 
                          drawingControl: false, 
                          polygonOptions: { 
                              fillColor: '#10b981', 
                              fillOpacity: 0.3, 
                              strokeWeight: 2, 
                              strokeColor: '#fff', 
                              clickable: true, 
                              editable: true, 
                              zIndex: 10 
                          } 
                      }}
                  />
              )}

              {renderableAssets.map(asset => {
                  if (asset.geometryType === 'POLYGON') {
                      const center = getPolygonCenter(asset.coordinates);
                      const stats = projectStats.find(s => String(s.id) === String(asset.projectId));
                      return (
                          <React.Fragment key={asset.id}>
                              <Polygon paths={asset.coordinates} options={{ fillColor: asset.properties?.color || HUB_COLORS.active, fillOpacity: 0.2, strokeColor: asset.properties?.color || HUB_COLORS.active, strokeWeight: 2, zIndex: 1 }} onClick={(e) => { e.stop(); handleZoneClick(asset); }} />
                              {center && (
                                  <RichMarker position={center} type={asset.properties?.type || 'ProjectZone'} label={asset.name} isSelected={selectedHub?.assetId === asset.id} isZoneCenter={true} stats={stats} onClick={() => handleZoneClick(asset)} />
                              )}
                          </React.Fragment>
                      );
                  } else if (asset.geometryType === 'POINT') {
                      return <RichMarker key={asset.id} position={asset.coordinates[0]} type={asset.type} label={asset.name} isSelected={false} onClick={() => {}} />;
                  }
                  return null;
              })}
          </GoogleMap>
          
          {drawingMode && !readOnly && (
              <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-stone-900/90 backdrop-blur-md text-white px-6 py-3 rounded-full font-bold text-xs shadow-2xl animate-in fade-in slide-in-from-top-4 z-30 border border-white/20 flex items-center gap-4">
                  <span className="animate-pulse text-emerald-400">●</span> 
                  <span>CLICK MAP TO DRAW ZONE</span>
                  <div className="h-4 w-px bg-white/20"></div>
                  <button 
                    onClick={() => setDrawingMode(null)}
                    className="hover:text-rose-400 transition-colors uppercase tracking-wider font-black"
                  >
                    Cancel
                  </button>
              </div>
          )}
      </div>

      {/* CREATE HUB MODAL */}
      {showCreateModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
              <div className="bg-stone-900 border border-white/10 p-10 rounded-[2rem] w-[450px] shadow-2xl">
                  <h2 className="text-3xl font-black text-white mb-8 text-center">Initialize Zone</h2>
                  {newHubData.coverImage && <img src={newHubData.coverImage} className="w-full h-32 object-cover rounded-xl mb-6 border border-white/10" alt="Location" />}
                  <div className="space-y-6">
                      <div>
                          <label className="text-xs font-black text-gray-500 uppercase block mb-2 tracking-widest">Zone Type</label>
                          <div className="flex gap-2 bg-black/30 p-1 rounded-xl border border-white/10">
                              <button 
                                onClick={() => setNewHubData({...newHubData, type: 'project'})}
                                className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${newHubData.type === 'project' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                              >
                                Active Project
                              </button>
                              <button 
                                onClick={() => setNewHubData({...newHubData, type: 'office'})}
                                className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${newHubData.type === 'office' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                              >
                                Headquarters
                              </button>
                          </div>
                      </div>
                      <div>
                          <label className="text-xs font-black text-gray-500 uppercase block mb-2 tracking-widest">Zone Designation</label>
                          <input autoFocus className="w-full bg-black/30 border border-white/10 rounded-2xl p-4 text-lg text-white font-bold" placeholder="e.g. Site Alpha" value={newHubData.name} onChange={e => setNewHubData({...newHubData, name: e.target.value})} />
                      </div>
                      {newHubData.type === 'project' && (
                          <div>
                              <label className="text-xs font-black text-gray-500 uppercase block mb-2 tracking-widest">Client</label>
                              <ClientSelector 
                                  selectedClient={newHubData.clientId ? { id: newHubData.clientId, name: newHubData.clientName } : null}
                                  onSelect={(client) => setNewHubData({ ...newHubData, clientId: client?.id || '', clientName: client?.name || '' })}
                                  className="w-full"
                              />
                          </div>
                      )}
                      <div>
                          <label className="text-xs font-black text-gray-500 uppercase block mb-2 tracking-widest">Site Address</label>
                          <input className="w-full bg-black/30 border border-white/10 rounded-2xl p-4 text-sm text-white font-mono" placeholder="Required for Geo-Features" value={newHubData.site || ''} onChange={e => setNewHubData({...newHubData, site: e.target.value})} />
                      </div>
                  </div>
                  <div className="flex gap-3 mt-10">
                      <button onClick={() => { setShowCreateModal(false); setNewZonePath(null); }} className="flex-1 py-4 rounded-2xl font-bold text-gray-400 hover:bg-white/5 transition-colors">Cancel</button>
                      <button onClick={createHub} className="flex-1 py-4 rounded-2xl font-bold bg-white text-black hover:bg-gray-200">Confirm</button>
                  </div>
              </div>
          </div>
      )}

      {selectedHub && <ProjectHubDrawer project={selectedHub} map={map} onClose={() => setSelectedHub(null)} onDelete={deleteAsset} onUpdate={fetchData} allStaff={staff} allEquipment={equipment} globalAllocations={allocations} />}
    </div>
  );
};

export default VisualMapBuilder;