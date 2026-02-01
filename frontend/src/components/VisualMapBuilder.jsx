/*
 * MasterDiaryApp Official - Visual Map Builder (GeoCore Ultra)
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 * 
 * MASTERPIECE EDITION:
 * - Google Places Autocomplete for Instant Site Location
 * - Auto-Zone Generation from Property Bounds
 * - Thermal Vision & Heatmaps
 * - Protocol Sovereign (Voice Commands)
 * - Cinematic Drone Mode
 * - Directions Service & Directions Renderer
 * - Integrated Resource Allocator (Mini-Allocator)
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Polygon, DrawingManager, StreetViewPanorama, OverlayView, DirectionsRenderer, TrafficLayer, Marker, HeatmapLayer, Polyline } from '@react-google-maps/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, 
  isSameDay, isToday, parseISO, addWeeks, subWeeks, isWithinInterval, startOfDay 
} from 'date-fns';
import { 
  Map as MapIcon, X, Building2, Briefcase, DollarSign, TrendingUp, 
  Calendar, FileText, Plus, ArrowRight, Navigation, 
  Locate, Layers, Globe, Camera, Zap, Trash2, Edit, 
  Image as ImageIcon, Users, Truck, Search, MoreHorizontal, ChevronRight, Activity,
  Share2, Eye, Lock, CheckCircle2, AlertTriangle, ClipboardCheck, Upload, Sparkles, ExternalLink, Wrench, Maximize2, Minimize2,
  Flame, Plane, Loader2, Mic, MicOff
} from 'lucide-react';
import { api } from '../utils/api';
import ClientSelector from './Clients/ClientSelector';
import PowerHeader from './ui/PowerHeader';
import { useDiaryTheme } from './PaintDiary/ThemeContext';

// --- CONFIGURATION ---
const LIBRARIES = ['drawing', 'geometry', 'places', 'visualization'];
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

// --- RICH MARKER ---
const RichMarker = React.memo(({ position, type, onClick, label, isSelected, isZoneCenter, stats, zoom, properties, liteMode }) => {
    const getPixelPositionOffset = (width, height) => ({
        x: -(width / 2),
        y: isZoneCenter ? -(height / 1.2) : -(height / 2),
    });

    const isAI = properties?.aiGenerated;
    let Icon = Briefcase;
    let colorClass = "bg-indigo-600 shadow-indigo-500/40";
    
    const t = type?.toLowerCase();
    if (t === 'staff') { Icon = Users; colorClass = "bg-emerald-500 shadow-emerald-500/40"; }
    else if (t === 'equipment') { Icon = Truck; colorClass = "bg-amber-500 shadow-amber-500/40"; }
    else if (t === 'office' || t === 'officezone') { Icon = Building2; colorClass = "bg-purple-600 shadow-purple-500/40"; }
    else if (t === 'projectzone' || t === 'project') { Icon = Briefcase; colorClass = "bg-blue-600 shadow-blue-500/40"; }
    else if (t === 'crane') { Icon = Wrench; colorClass = "bg-orange-500 shadow-orange-500/40"; }
    else if (t === 'waste' || t === 'bin') { Icon = Trash2; colorClass = "bg-zinc-600 shadow-zinc-500/40"; }
    else if (t === 'access') { Icon = Navigation; colorClass = "bg-cyan-500 shadow-cyan-500/40"; }
    else if (t === 'danger' || t === 'hazard') { Icon = AlertTriangle; colorClass = "bg-red-600 shadow-red-500/40"; }
    else if (t === 'logistics') { Icon = Zap; colorClass = "bg-yellow-500 shadow-yellow-500/40"; } // Re-using Zap for speed, or ShoppingCart if imported

    // DYNAMIC SCALING LOGIC
    const scale = zoom <= 10 ? 0.4 : zoom <= 13 ? 0.6 : zoom <= 15 ? 0.8 : 1.0;
    const hideExtra = zoom < 14;

    if (isZoneCenter) {
        const isZoomedIn = zoom >= 16;
        return (
            <OverlayView position={position} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET} getPixelPositionOffset={getPixelPositionOffset}>
                <div 
                    className={`group cursor-pointer flex flex-col items-center hover:z-[100] ${liteMode ? 'transition-none' : ''}`}
                    onClick={(e) => { e.stopPropagation(); onClick(); }}
                    style={{ transform: `scale(${scale})`, transformOrigin: 'bottom center' }}
                >
                    <div className={`relative mb-2 ${!liteMode ? 'transition-all duration-500 group-hover:-translate-y-2' : ''} ${isZoomedIn ? 'scale-110' : 'scale-100'}`}>
                        {/* Clean High-Tech Glow */}
                        {!liteMode && isSelected && <div className="absolute -inset-4 rounded-full bg-indigo-500/20 blur-xl animate-pulse"></div>}
                        
                        {/* Main Glassmorphic Hub - Neural Glass Edition */}
                        <div className={`
                            relative rounded-[1.5rem] flex items-center justify-center text-white 
                            shadow-2xl backdrop-blur-xl border border-white/20 
                            bg-gradient-to-br from-white/10 to-black/40 ${colorClass}
                            ${isZoomedIn ? 'w-20 h-20' : 'w-16 h-16'}
                            ${!liteMode ? 'transition-all duration-500 group-hover:border-white/40' : ''}
                        `}>
                            <Icon size={isZoomedIn ? 40 : 32} strokeWidth={1.5} className="drop-shadow-lg" />
                        </div>

                        {/* Status Dot */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-stone-950 rounded-full border border-white/10 flex items-center justify-center shadow-lg">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]"></div>
                        </div>
                    </div>

                    {!hideExtra && (
                        <div className={`flex flex-col items-center gap-1 bg-stone-950/80 backdrop-blur-md border border-white/10 p-2 rounded-xl shadow-2xl min-w-[140px] ${!liteMode ? 'transition-all group-hover:border-indigo-500/50 group-hover:bg-stone-900/90' : ''}`}>
                            <div className="text-[9px] font-black text-white uppercase tracking-[0.15em] text-center truncate px-1">{label}</div>
                        </div>
                    )}
                    
                    {/* Perspective Depth Stem - Only when zoomed in */}
                    {isZoomedIn && !liteMode && <div className="w-0.5 h-8 bg-gradient-to-b from-indigo-500/30 to-transparent"></div>}
                </div>
            </OverlayView>
        );
    }

    return (
        <OverlayView position={position} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET} getPixelPositionOffset={getPixelPositionOffset}>
            <div 
                className={`relative group cursor-pointer ${!liteMode ? 'transition-all duration-500' : ''} ${isSelected ? 'scale-150 z-50' : 'hover:scale-125 z-30'}`} 
                onClick={(e) => { e.stopPropagation(); onClick(); }}
                style={{ transform: `scale(${scale})` }}
            >
                {!hideExtra && !liteMode && <div className={`absolute inset-0 rounded-full animate-ping opacity-40 duration-[1500ms] ${colorClass}`}></div>}
                <div className={`relative w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-2xl backdrop-blur-md ${colorClass} border border-white/20 ${!liteMode ? 'group-hover:border-white/50 transition-all' : ''}`}>
                    <Icon size={16} strokeWidth={2} />
                </div>
                {!hideExtra && (
                    <div className={`absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/95 backdrop-blur-xl text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 ${!liteMode ? 'transition-all' : ''} pointer-events-none shadow-2xl z-50`}>
                        {label}
                    </div>
                )}
            </div>
        </OverlayView>
    );
});

// --- PROJECTION HELPER ---
const ProjectionHelper = ({ setProjection }) => (
    <OverlayView position={{ lat: 0, lng: 0 }} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET} onLoad={(overlay) => setProjection(overlay.getProjection())}><div /></OverlayView>
);

// --- STREET VIEW PANEL ---
const StreetViewPanel = ({ position, assets, onPositionChange }) => {
    const ref = useRef(null);
    const [pano, setPano] = useState(null);
    useEffect(() => {
        if (ref.current && !pano && window.google) {
            const sv = new window.google.maps.StreetViewPanorama(ref.current, { position: position, visible: true, disableDefaultUI: true, enableCloseButton: false, addressControl: false, showRoadLabels: true });
            sv.addListener('position_changed', () => {
                const pos = sv.getPosition();
                const pov = sv.getPov(); 
                if(onPositionChange) onPositionChange({ position: pos, pov: pov });
            });
            setPano(sv);
        }
    }, [ref, pano, position, onPositionChange]); 
    return <div ref={ref} className="w-full h-full bg-black" />;
};

// --- PROJECT HUB DRAWER ---
const ProjectHubDrawer = ({ project, onClose, onDelete, onUpdate, allStaff, allEquipment, globalAllocations = [] }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview'); 
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: endOfWeek(currentDate, { weekStartsOn: 1 }) });
    const isHQ = project.properties?.type === 'office' || project.properties?.type === 'OfficeZone';
    
    const [financials, setFinancials] = useState({ livePrice: 0, contractValue: 0, variationsValue: 0, totalDiaryRevenue: 0, totalCost: 0, profit: 0, isProfitable: false });
    const [diaries, setDiaries] = useState([]);
    const [quotes, setQuotes] = useState([]); 
    const [documents, setDocuments] = useState([]); 
    const [allocations, setAllocations] = useState([]);
    const [safetyForms, setSafetyForms] = useState([]); 
    const [isAllocating, setIsAllocating] = useState(false);
    const [newAlloc, setNewAlloc] = useState({ type: 'staff', id: '', start: '', end: '', category: 'project' });
    const [uploadingCover, setUploadingCover] = useState(false);

    const loadProjectData = useCallback(async () => {
        setLoading(true);
        try {
            const [projectRes, allocRes, safetyRes, docRes] = await Promise.all([
                api.get(`/projects/${project.id}`),
                api.get(`/allocations?projectId=${project.id}&t=${Date.now()}`), 
                api.get(`/safety?projectId=${project.id}`),
                api.get(`/documents?projectId=${project.id}`)
            ]);
            const fullProject = projectRes.data;
            if (fullProject?.financials) setFinancials(fullProject.financials);
            setDiaries(fullProject.Diaries || fullProject.diaries || []); 
            setQuotes(fullProject.quotes || fullProject.Quotes || []);
            setDocuments(docRes.data || []); 
            setAllocations(allocRes.data || []);
            setSafetyForms(safetyRes.data || []);
        } catch (e) { console.error("Hub Data Error", e); }
        setLoading(false);
    }, [project.id]);

    useEffect(() => { if (project?.id) loadProjectData(); }, [project.id, loadProjectData]);

    const handleAllocate = async () => {
        if (!newAlloc.id || !newAlloc.start || !newAlloc.end) return alert("Please fill all fields");
        try {
            const res = await api.post('/allocations', {
                projectId: project.id, resourceType: newAlloc.type, resourceId: newAlloc.id,
                startDate: newAlloc.start, endDate: newAlloc.end, category: newAlloc.category || 'project', status: 'active'
            });
            setAllocations([...allocations, res.data]);
            setIsAllocating(false);
            setNewAlloc({ type: 'staff', id: '', start: '', end: '', category: 'project' });
            onUpdate();
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

    const handleCoverUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingCover(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await api.post('/uploads', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            const newUrl = res.data.url;
            await api.put(`/map-assets/${project.assetId}`, { properties: { ...project.properties, coverImage: newUrl } });
            onUpdate(); 
        } catch(err) { alert("Upload Failed"); } finally { setUploadingCover(false); }
    };

    const activeResources = useMemo(() => {
        const resourceIds = new Set(allocations.map(a => a.resourceId));
        return Array.from(resourceIds).map(id => {
            const s = allStaff.find(x => String(x.id) === String(id));
            if (s) return { ...s, type: 'staff' };
            const e = allEquipment.find(x => String(x.id) === String(id));
            if (e) return { ...e, type: 'equipment' };
            return { id, name: 'Unknown Resource', type: 'unknown' };
        });
    }, [allocations, allStaff, allEquipment]);

    const handleDocUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            const upRes = await api.post('/uploads', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            await api.post('/documents', { title: file.name, relatedId: project.id, relatedModel: 'Project', metadata: { url: upRes.data.url } });
            loadProjectData();
        } catch(err) { alert("Upload failed"); }
    };

    return (
        <div className="absolute top-0 right-0 bottom-0 bg-stone-950 border-l border-white/10 shadow-2xl flex flex-col animate-slide-left z-50 transition-all duration-500 w-[600px]">
            <div className="relative h-48 bg-slate-900 overflow-hidden flex-shrink-0 group">
                {project.properties?.coverImage ? (
                    <img src={project.properties.coverImage} className="w-full h-full object-cover" alt="Cover" />
                ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${isHQ ? 'from-purple-900 to-slate-900' : 'from-indigo-900 to-slate-900'} flex items-center justify-center`}><Building2 size={60} className="text-white/10" /></div>
                )}
                <div className="absolute top-4 right-4 z-20 flex gap-2">
                    <label className="p-2 bg-black/40 hover:bg-white/20 rounded-full text-white cursor-pointer"><input type="file" className="hidden" onChange={handleCoverUpload} disabled={uploadingCover} /><ImageIcon size={16} /></label>
                    <button onClick={() => onDelete(project)} className="p-2 bg-rose-600/80 hover:bg-rose-500 rounded-full text-white"><Trash2 size={16} /></button>
                    <button onClick={onClose} className="p-2 bg-black/40 hover:bg-white/20 rounded-full text-white"><X size={16} /></button>
                </div>
                <div className="absolute bottom-6 left-8 z-20 right-8"><h2 className="text-3xl font-black text-white">{project.name}</h2></div>
            </div>
            
            <div className="flex border-b border-white/5 bg-stone-900/50 p-1 sticky top-0 z-10">
                {['overview', 'resources', 'safety', 'diaries', 'documents'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-wider transition-all border-b-2 ${activeTab === tab ? 'border-indigo-500 text-white bg-white/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>{tab}</button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8 bg-stone-950">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5 relative overflow-hidden">
                                <h4 className="text-indigo-400 font-bold mb-1 text-xs uppercase tracking-wider">Live Value</h4>
                                <div className="text-3xl font-black text-white">${(financials.livePrice || 0).toLocaleString()}</div>
                            </div>
                            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 relative overflow-hidden">
                                <h4 className="text-rose-400 font-bold mb-1 text-xs uppercase tracking-wider">In-House Costs</h4>
                                <div className="text-3xl font-black text-white">${(financials.totalCost || 0).toLocaleString()}</div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center"><h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Active Quotes</h3><button onClick={() => navigate('/quotes/builder', { state: { projectId: project.id } })} className="text-[10px] font-bold text-indigo-400 hover:text-white"><Plus size={12}/> New Quote</button></div>
                            {quotes.map(q => <div key={q.id} className="p-3 bg-stone-900 rounded-xl border border-white/5 flex justify-between items-center group cursor-pointer hover:bg-stone-800" onClick={() => navigate('/quotes/builder', { state: { projectId: project.id, quoteId: q.id } })}><div className="text-xs font-bold text-white">{q.name}</div><div className={`text-[10px] font-bold uppercase ${q.status === 'approved' ? 'text-emerald-400' : 'text-amber-400'}`}>{q.status}</div></div>)}
                        </div>
                    </div>
                )}
                {activeTab === 'resources' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center"><h3 className="text-sm font-black text-white uppercase tracking-wider">{isHQ ? 'HQ Resource Pool' : 'Site Allocations'}</h3><button onClick={() => setIsAllocating(!isAllocating)} className="text-xs font-bold text-emerald-400 flex items-center gap-1"><Plus size={14} /> Assign</button></div>
                        {isAllocating && (
                            <div className="bg-stone-900 p-4 rounded-xl border border-emerald-500/30 space-y-3">
                                <div className="flex gap-2"><button onClick={() => setNewAlloc({...newAlloc, type:'staff'})} className={`flex-1 py-1 text-xs font-bold rounded ${newAlloc.type==='staff'?'bg-emerald-500':'bg-black/30'}`}>Staff</button><button onClick={() => setNewAlloc({...newAlloc, type:'equipment'})} className={`flex-1 py-1 text-xs font-bold rounded ${newAlloc.type==='equipment'?'bg-amber-500':'bg-black/30'}`}>Equipment</button></div>
                                <select className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-xs text-white" value={newAlloc.id} onChange={e => setNewAlloc({...newAlloc, id: e.target.value})}><option value="">Select Resource...</option>{newAlloc.type==='staff' ? allStaff.map(s => <option key={s.id} value={s.id}>{s.name}</option>) : allEquipment.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select>
                                <div className="grid grid-cols-2 gap-2"><input type="date" className="bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-white" value={newAlloc.start} onChange={e => setNewAlloc({...newAlloc, start: e.target.value})} /><input type="date" className="bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-white" value={newAlloc.end} onChange={e => setNewAlloc({...newAlloc, end: e.target.value})} /></div>
                                <button onClick={handleAllocate} className="w-full py-2 bg-emerald-600 text-xs font-bold text-white rounded">Confirm Assignment</button>
                            </div>
                        )}
                        <div className="bg-stone-900 border border-white/5 rounded-xl overflow-hidden shadow-lg p-4">
                            {activeResources.map(resource => <div key={resource.id} className="p-3 border-b border-white/5 flex justify-between items-center"><div className="text-xs font-bold text-white">{resource.name}</div><button onClick={() => { const a = allocations.find(x => x.resourceId === resource.id); if(a) handleRemoveAllocation(a.id); }} className="text-rose-500 hover:text-rose-400"><X size={14}/></button></div>)}
                        </div>
                    </div>
                )}
                {activeTab === 'documents' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center"><h3 className="text-sm font-black text-white uppercase tracking-wider">Associated Documents</h3><label className="text-xs font-bold text-indigo-400 hover:text-white cursor-pointer flex items-center gap-1"><Plus size={14}/> Upload<input type="file" className="hidden" onChange={handleDocUpload} /></label></div>
                        {documents.map(doc => <div key={doc.id} className="p-3 bg-stone-900 rounded-xl border border-white/5 flex items-center gap-3 group"><div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><FileText size={16}/></div><div className="flex-1 text-sm font-bold text-white">{doc.title}</div>{doc.metadata?.url && <a href={doc.metadata.url} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-white"><ExternalLink size={16}/></a>}</div>)}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- HELPERS ---
const getPolygonCenter = (coordinates) => {
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length === 0) return null;
    let valid = coordinates.map(c => { if (c && typeof c === 'object' && 'lat' in c && 'lng' in c) return c; if (Array.isArray(c) && c.length >= 2) return { lat: c[0], lng: c[1] }; return null; }).filter(Boolean);
    if(valid.length === 0) return null;
    const lat = valid.reduce((sum, c) => sum + c.lat, 0) / valid.length;
    const lng = valid.reduce((sum, c) => sum + c.lng, 0) / valid.length;
    return { lat, lng };
};

const SmartContextMenu = ({ position, x, y, onClose, onAction }) => (
    <div className="fixed z-[100] bg-stone-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 min-w-[200px]" style={{ top: y, left: x }} onMouseLeave={onClose}>
        <button onClick={() => onAction('analyze')} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 rounded-xl text-left transition-colors group">
            <div className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-400 group-hover:text-white"><Activity size={14} /></div>
            <div className="text-xs font-bold text-gray-200 group-hover:text-white">Analyze Terrain</div>
        </button>
    </div>
);

// --- MAIN BUILDER ---
const VisualMapBuilder = ({ readOnly = false, initialProjectId = null }) => {
  const { theme, liteMode } = useDiaryTheme();
  const location = useLocation();
  const activeProjectId = initialProjectId || location.state?.projectId;

  const { isLoaded } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, libraries: LIBRARIES });

  const [map, setMap] = useState(null);
  const [mapProjection, setMapProjection] = useState(null);
  const mapContainerRef = useRef(null);
  const inputRef = useRef(null);

  const [drawingMode, setDrawingMode] = useState(null);
  const [mapTypeId, setMapTypeId] = useState('satellite');
  const [tilt, setTilt] = useState(45);
  const [heading, setHeading] = useState(0);
  const [showTraffic, setShowTraffic] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [isDroneMode, setIsDroneMode] = useState(false);
  const [streetViewMode, setStreetViewMode] = useState('hidden'); 
  const [streetViewPos, setStreetViewPos] = useState(null);
  const [streetViewPov, setStreetViewPov] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [zoom, setZoom] = useState(13); // NEW: Track zoom level

  const [assets, setAssets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [staff, setStaff] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [allocations, setAllocations] = useState([]); 
  const [safetyForms, setSafetyForms] = useState([]); 
  const [projectStats, setProjectStats] = useState([]);

  const [selectedHub, setSelectedHub] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null); 
  const [showGenesis, setShowGenesis] = useState(false);
  const [logisticsMarkers, setLogisticsMarkers] = useState([]); // Discoveries
  const [isScanning, setIsScanning] = useState(false); // Scan Animation
  const [aiRoute, setAiRoute] = useState(null); // NEW: Visual Route
  const [ghostMoves, setGhostMoves] = useState([]); // NEW: Proposed Moves
  const [genesisInput, setGenesisInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genesisLog, setGenesisLog] = useState([{ role: 'system', content: 'Genesis Protocol v9.0 Online.' }]);
  const [contextMenu, setContextMenu] = useState(null);
  const [newZonePath, setNewZonePath] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newHubData, setNewHubData] = useState({ name: '', type: 'project', site: '', client: '' });

  const chatEndRef = useRef(null); // NEW: Auto-scroll anchor

  const scrollToBottom = () => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
      if (genesisLog.length) scrollToBottom();
  }, [genesisLog, isGenerating]);

  const heatmapRef = useRef(null); // NEW: Manual heatmap control

  const initialView = useMemo(() => {
    try { 
        const saved = localStorage.getItem(STORAGE_KEY_MAP_VIEW); 
        if (saved && !activeProjectId) return JSON.parse(saved); 
    } catch (e) { }
    return { center: { lat: -33.8688, lng: 151.2093 }, zoom: 13 };
  }, [activeProjectId]);

  const deleteAsset = async (asset) => {
      if(!confirm("Delete this asset from map?")) return;
      try {
          await api.delete(`/map-assets/${asset.id}`);
          fetchData();
          setSelectedAsset(null);
          setSelectedHub(null);
      } catch(err) { console.error("Delete failed", err); }
  };

  const deployProposal = async (proposal) => {
      try {
          // PRO-FEATURE: Actually update the resource location in DB
          const endpoint = proposal.type === 'staff' ? `/staff/${proposal.originalId}` : `/equipment/${proposal.originalId}`;
          await api.put(endpoint, { lastLocation: proposal.location });
          
          setGenesisLog(prev => [...prev, { 
              role: 'system', 
              content: `🚀 Deployment Successful: ${proposal.name} has been reassigned to the new coordinates.` 
          }]);
          
          setGhostMoves(prev => prev.filter(gm => gm.id !== proposal.id));
          setSelectedAsset(null);
          fetchData();
      } catch (err) {
          alert("Deployment failed: Link to resource lost.");
      }
  };

  const fetchData = useCallback(async () => {
      try {
          const ts = Date.now();
          const [pRes, mRes, sRes, eRes, aRes, safeRes, statRes] = await Promise.all([
              api.get(`/projects?t=${ts}`), api.get(`/map-assets?t=${ts}`), api.get(`/staff?t=${ts}`), api.get(`/equipment?t=${ts}`), api.get(`/allocations?t=${ts}`), api.get(`/safety?t=${ts}`), api.get(`/projects/map-stats?t=${ts}`)
          ]);
          setProjects(pRes.data.data || pRes.data || []);
          setAssets((mRes.data || []).map(a => ({ ...a, coordinates: typeof a.coordinates === 'string' ? JSON.parse(a.coordinates) : a.coordinates })));
          setStaff(sRes.data.data || sRes.data || []);
          setEquipment(eRes.data.data || eRes.data || []);
          setAllocations(aRes.data || []);
          setSafetyForms(safeRes.data || []);
          setProjectStats(statRes.data || []);
      } catch(err) { console.error(err); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
      if (isLoaded && inputRef.current && window.google && !readOnly) {
          const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, { fields: ['geometry', 'name', 'photos', 'formatted_address'] });
          autocomplete.addListener('place_changed', () => {
              const place = autocomplete.getPlace();
              if (place.geometry && map) { map.setCenter(place.geometry.location); map.setZoom(18); }
          });
      }
  }, [isLoaded, map, readOnly]);

  useEffect(() => {
      let interval;
      if (isDroneMode && map) interval = setInterval(() => setHeading(prev => (prev + 0.2) % 360), 50);
      return () => clearInterval(interval);
  }, [isDroneMode, map]);

  useEffect(() => {
      if (!('webkitSpeechRecognition' in window)) return;
      const rec = new window.webkitSpeechRecognition();
      rec.onresult = (e) => {
          const cmd = e.results[0][0].transcript.toLowerCase();
          setGenesisLog(p => [...p, { role: 'user', content: `🎙️ "${cmd}"` }]);
          if (cmd.includes('drone')) setIsDroneMode(v => !v);
          if (cmd.includes('thermal')) setShowHeatmap(v => !v);
          if (cmd.includes('satellite')) setMapTypeId('satellite');
          if (cmd.includes('reset')) { setIsDroneMode(false); setTilt(0); }
          setIsListening(false);
      };
      if (isListening) rec.start();
      return () => rec.stop();
  }, [isListening]);

  const handleGenesisCommand = async () => {
      if (!genesisInput.trim()) return;
      const p = genesisInput; 
      setGenesisInput(''); 
      setGenesisLog(prev => [...prev, { role: 'user', content: p }]); 
      setIsGenerating(true);

      let realWorldIntel = { nearbyLogistics: [], transitIntelligence: [] };

      try {
          if (window.google && map) {
              setIsScanning(true);
              
              const placesPromise = new Promise((resolve) => {
                  const service = new window.google.maps.places.PlacesService(map);
                  const timer = setTimeout(() => resolve([]), 3000);
                  service.nearbySearch({
                      location: map.getCenter(),
                      radius: '5000',
                      type: ['hardware_store']
                  }, (results, status) => {
                      clearTimeout(timer);
                      if (status === 'OK') resolve(results?.slice(0, 5) || []);
                      else resolve([]);
                  });
              });

              const matrixPromise = new Promise((resolve) => {
                  const matrix = new window.google.maps.DistanceMatrixService();
                  const timer = setTimeout(() => resolve(null), 3000);
                  const hqAsset = assets.find(a => a.properties?.type === 'office' || a.properties?.type === 'OfficeZone');
                  const activeProj = assets.filter(a => a.properties?.type === 'ProjectZone').slice(0, 2);
                  
                  if (!hqAsset || activeProj.length === 0) return resolve(null);
                  
                  matrix.getDistanceMatrix({
                      origins: [getPolygonCenter(hqAsset.coordinates)],
                      destinations: activeProj.map(ap => getPolygonCenter(ap.coordinates)),
                      travelMode: 'DRIVING'
                  }, (res, status) => {
                      clearTimeout(timer);
                      if (status === 'OK') resolve(res);
                      else resolve(null);
                  });
              });

              const [placesData, transitData] = await Promise.all([placesPromise, matrixPromise]);

              if (placesData.length) {
                  const findings = placesData.map(place => ({
                      id: place.place_id,
                      name: place.name,
                      location: place.geometry.location.toJSON(),
                      type: 'logistics',
                      address: place.vicinity
                  }));
                  realWorldIntel.nearbyLogistics = findings;
                  setLogisticsMarkers(findings);
              }

              if (transitData?.rows?.[0]) {
                  realWorldIntel.transitIntelligence = transitData.rows[0].elements.map((el, idx) => ({
                      travelTime: el.duration?.text,
                      distance: el.distance?.text
                  }));
              }
              
              setTimeout(() => setIsScanning(false), 1000);
          }
      } catch (spatialErr) {
          console.warn("Spatial Enrichment failed", spatialErr);
      }

      const situationReport = {
          center: map?.getCenter()?.toJSON(),
          zoom: zoom,
          realWorldIntel,
          activeProjects: assets.filter(a => a.geometryType === 'POLYGON').length,
          fleetCount: equipment.length,
          hqLocation: hqLocation, // Send HQ for routing
          targetLocation: selectedAsset?.location || (selectedAsset?.coordinates ? selectedAsset.coordinates[0] : null) // Send target for routing
      };

      try {
          const res = await api.post('/ai/chat-map', { 
              message: p, 
              context: situationReport 
          });
          
          setGenesisLog(prev => [...prev, { role: 'system', content: res.data.reply }]);
          
          if (res.data.suggestedActions && res.data.suggestedActions.length > 0) {
              for (const action of res.data.suggestedActions) {
                  if (action.type === 'draw_route') {
                      if (action.polyline) {
                          // MODERN ROUTES API (Encoded Polyline)
                          const path = window.google.maps.geometry.encoding.decodePath(action.polyline);
                          setAiRoute({ routes: [{ overview_path: path, bounds: map?.getBounds() }] }); 
                      } else if (action.origin && action.destination) {
                          const ds = new window.google.maps.DirectionsService();
                          ds.route({
                              origin: action.origin,
                              destination: action.destination,
                              travelMode: 'DRIVING'
                          }, (result, status) => {
                              if (status === 'OK') setAiRoute(result);
                              else setGenesisLog(prev => [...prev, { 
                                  role: 'system', 
                                  content: `⚠️ [ROUTING ERROR]: ${status}.` 
                              }]);
                          });
                      }
                  }

                  if (action.type === 'propose_ghost_move' && action.location) {
                      const target = assets.find(a => String(a.id) === String(action.targetId)) || 
                                     staff.find(s => String(s.id) === String(action.targetId)) ||
                                     equipment.find(e => String(e.id) === String(action.targetId));
                      if (target) {
                          setGhostMoves(prev => [...prev, {
                              id: `ghost-${target.id}-${Date.now()}`,
                              originalId: target.id,
                              name: target.name,
                              type: target.type || 'fleet',
                              location: action.location,
                              reason: action.reason
                          }]);
                      }
                  }

                  if (action.location && action.type === 'focus_asset') {
                      map?.panTo(action.location);
                      map?.setZoom(18);
                  }

                  if (action.targetId) {
                      const targetAsset = assets.find(a => String(a.id) === String(action.targetId));
                      if (targetAsset) {
                          if (targetAsset.geometryType === 'POLYGON') setSelectedHub(targetAsset);
                          else setSelectedAsset(targetAsset);
                      }
                  }
              }
          }
      } catch (err) { 
          setGenesisLog(prev => [...prev, { role: 'system', content: "Satellite link interrupted." }]);
      } finally { 
          setIsGenerating(false); 
      }
  };

  const handlePolygonComplete = async (polygon) => {
      const path = polygon.getPath(); const coords = [];
      for(let i=0; i<path.getLength(); i++) { coords.push({ lat: path.getAt(i).lat(), lng: path.getAt(i).lng() }); }
      polygon.setMap(null); setNewZonePath(coords); setDrawingMode(null); setShowCreateModal(true);
  };

  const createHub = async () => {
      if (!newZonePath) return;
      try {
          let finalProjectId = newHubData.existingProjectId;
          let finalName = newHubData.name;

          // 1. Establish New Project Mode
          if (newHubData.type === 'project' && newHubData.mode === 'new') {
              const center = getPolygonCenter(newZonePath);
              const projRes = await api.post('/projects', {
                  name: finalName,
                  status: 'active',
                  site: 'Geolocated Site',
                  latitude: center?.lat,
                  longitude: center?.lng
              });
              finalProjectId = projRes.data.id;
          }
          // 2. Link Existing Project Mode
          else if (newHubData.type === 'project' && newHubData.existingProjectId) {
               // Update Project Coordinates
               const center = getPolygonCenter(newZonePath);
               if (center) {
                   await api.put(`/projects/${finalProjectId}`, {
                       latitude: center.lat,
                       longitude: center.lng
                   });
               }
          }

          const assetPayload = { 
              type: newHubData.type === 'office' ? 'OfficeZone' : 'ProjectZone', 
              name: finalName, 
              geometryType: 'POLYGON', 
              coordinates: newZonePath, 
              projectId: finalProjectId,
              properties: { 
                  color: newHubData.type === 'office' ? HUB_COLORS.office : HUB_COLORS.active, 
                  type: newHubData.type 
              } 
          };
          await api.post('/map-assets', assetPayload); 
          fetchData(); 
          setShowCreateModal(false); 
          setNewZonePath(null);
          setNewHubData({ name: '', type: 'project', site: '', client: '', mode: 'existing' });
      } catch (e) { alert(e.message); }
  };

  const heatmapData = useMemo(() => {
      if (!isLoaded || !window.google || !window.google.maps || !window.google.maps.LatLng) return [];
      const points = [
          ...staff.map(s => s.lastLocation ? new window.google.maps.LatLng(s.lastLocation.lat, s.lastLocation.lng) : null),
          ...equipment.map(e => e.lastLocation ? new window.google.maps.LatLng(e.lastLocation.lat, e.lastLocation.lng) : null),
          ...assets.filter(a => a.geometryType === 'POLYGON').map(a => {
              const center = getPolygonCenter(a.coordinates);
              return center ? new window.google.maps.LatLng(center.lat, center.lng) : null;
          })
      ].filter(Boolean);
      return points;
  }, [staff, equipment, assets, isLoaded]);

  useEffect(() => {
      if (heatmapRef.current) {
          heatmapRef.current.setMap(showHeatmap ? map : null);
          if (!showHeatmap) {
              heatmapRef.current.setData([]);
          } else if (heatmapData.length > 0) {
              heatmapRef.current.setData(heatmapData);
          }
      }
  }, [showHeatmap, map, heatmapData]);

  useEffect(() => {
      if (map) {
          map.setMapTypeId(mapTypeId);
      }
  }, [map, mapTypeId]);

  const onMapLoad = useCallback((m) => { 
      setMap(m); 
      m.setTilt(liteMode ? 0 : tilt); // FORCE 0 TILT IN LITE MODE
      m.setHeading(heading); 
  }, [tilt, heading, liteMode]);

  const initialViewConst = useMemo(() => initialView, [initialView]);

  const handleStatItemClick = (item, type) => {
      let location = null;
      if (type === 'zone') {
          location = getPolygonCenter(item.coordinates);
          setSelectedHub(item);
          setSelectedAsset(null);
      } else if (type === 'fleet' || type === 'staff') {
          location = item.lastLocation || (item.coordinates ? item.coordinates[0] : null);
          setSelectedAsset(item);
          setSelectedHub(null);
      }

      if (location && map) {
          map.panTo(location);
          map.setZoom(17);
      }
  };

  if (!isLoaded) return <div className="h-screen bg-stone-950 flex items-center justify-center text-indigo-500 font-mono italic animate-pulse">GEOSPATIAL CORE LOADING...</div>;

  const headerStats = [
      { 
          label: 'Active Zones', 
          value: assets.filter(a => a.geometryType === 'POLYGON').length, 
          color: 'text-indigo-400',
          type: 'zone',
          data: assets.filter(a => a.geometryType === 'POLYGON')
      },
      { 
          label: 'Total Fleet', 
          value: equipment.length, 
          color: 'text-amber-400',
          type: 'fleet',
          data: equipment.map(e => ({ ...e, name: e.name || e.model }))
      },
      { 
          label: 'Personnel', 
          value: staff.length, 
          color: 'text-emerald-400',
          type: 'staff',
          data: staff
      }
  ];

  return (
    <div className="fixed inset-0 top-[64px] z-0 bg-stone-950 overflow-hidden flex flex-col font-sans">
      <PowerHeader 
          title="GeoCore Ultra" 
          icon={Globe} 
          theme={theme?.primary || 'indigo'} 
          variant="map" 
          stats={headerStats} 
          onStatItemClick={handleStatItemClick}
      >
          <div className="relative group mr-2">
              <Search className="absolute left-3 top-2.5 text-gray-500" size={14} />
              <input ref={inputRef} type="text" placeholder="Search coordinates..." className="w-64 bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-white focus:border-indigo-500 outline-none transition-all focus:w-80" />
          </div>
          <button onClick={() => setIsListening(!isListening)} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-2 transition-all ${isListening ? 'bg-red-600 text-white animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-white/5 text-gray-400 hover:text-white'}`}>{isListening ? <Mic size={14} /> : <MicOff size={14} />} Voice</button>
          <button onClick={() => setShowGenesis(!showGenesis)} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-2 transition-all ${showGenesis ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-gray-400 hover:text-white'}`}><Sparkles size={14} /> Genesis</button>
          <button onClick={() => setMapTypeId(prev => prev === 'roadmap' ? 'satellite' : 'roadmap')} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-2 transition-all ${mapTypeId === 'satellite' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-gray-400 hover:text-white'}`}><Globe size={14} /> Satellite</button>
          <button onClick={() => setTilt(prev => prev === 0 ? 45 : 0)} disabled={liteMode} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-2 transition-all ${tilt === 45 ? 'bg-amber-600 text-white shadow-lg' : 'bg-white/5 text-gray-400 hover:text-white'} ${liteMode ? 'opacity-50 cursor-not-allowed' : ''}`}><Layers size={14} /> 3D</button>
          <button onClick={() => setShowHeatmap(!showHeatmap)} disabled={liteMode} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-2 transition-all ${showHeatmap ? 'bg-rose-600 text-white shadow-lg' : 'bg-white/5 text-gray-400 hover:text-white'} ${liteMode ? 'opacity-50 cursor-not-allowed' : ''}`}><Flame size={14} /> Thermal</button>
          <button onClick={() => setIsDroneMode(!isDroneMode)} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-2 transition-all ${isDroneMode ? 'bg-emerald-600 text-white shadow-lg animate-pulse' : 'bg-white/5 text-gray-400 hover:text-white'}`}><Plane size={14} /> Drone</button>
          <button onClick={() => setDrawingMode(prev => prev === 'polygon' ? null : 'polygon')} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-2 transition-all ${drawingMode === 'polygon' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-gray-400 hover:text-white'}`}><Edit size={14} /> Draw</button>
      </PowerHeader>

      <div className="flex-1 flex relative overflow-hidden">
          <div ref={mapContainerRef} className="flex-1 relative flex h-full min-h-0">
              <GoogleMap 
                  mapContainerStyle={{ width: '100%', height: '100%' }} 
                  center={initialViewConst.center} 
                  zoom={zoom} 
                  mapId="90f87356969d889c" 
                  mapTypeId={mapTypeId} 
                  options={{ disableDefaultUI: true, tilt: liteMode ? 0 : tilt, heading }} 
                  onLoad={onMapLoad}
                  onZoomChanged={() => map && setZoom(map.getZoom())}
              >
                  {isLoaded && !liteMode && (
                      <HeatmapLayer 
                          onLoad={(h) => {
                              heatmapRef.current = h;
                              h.setMap(showHeatmap ? map : null);
                          }}
                          data={showHeatmap ? heatmapData : []} 
                          options={{ 
                              radius: 50, 
                              opacity: 0.9,
                              gradient: ['rgba(0, 255, 255, 0)', 'rgba(0, 255, 255, 1)', 'rgba(0, 191, 255, 1)', 'rgba(0, 127, 255, 1)', 'rgba(0, 63, 255, 1)', 'rgba(0, 0, 255, 1)', 'rgba(0, 0, 223, 1)', 'rgba(0, 0, 191, 1)', 'rgba(0, 0, 159, 1)', 'rgba(0, 0, 127, 1)', 'rgba(63, 0, 91, 1)', 'rgba(127, 0, 63, 1)', 'rgba(191, 0, 31, 1)', 'rgba(255, 0, 0, 1)'] 
                          }} 
                      />
                  )}
                  {assets.map(a => {
                      const isPolygon = a.geometryType === 'POLYGON';
                      const center = isPolygon ? getPolygonCenter(a.coordinates) : a.coordinates[0];
                      if (!center) return null;

                      return (
                          <React.Fragment key={a.id}>
                              {isPolygon && (
                                  <Polygon 
                                      paths={a.coordinates} 
                                      options={{ 
                                          fillColor: a.properties?.color || '#10b981', 
                                          fillOpacity: 0.1, 
                                          strokeColor: a.properties?.color || '#10b981', 
                                          strokeWeight: 2 
                                      }} 
                                      onClick={() => { setSelectedHub(a); setSelectedAsset(null); }} 
                                  />
                              )}
                              <RichMarker 
                                  position={center} 
                                  type={a.type} 
                                  label={a.name} 
                                  isSelected={selectedAsset?.id === a.id || selectedHub?.id === a.id} 
                                  isZoneCenter={isPolygon}
                                  onClick={() => { 
                                      if (isPolygon) {
                                          setSelectedHub(a); 
                                          setSelectedAsset(null); 
                                      } else {
                                          setSelectedAsset(a); 
                                          setSelectedHub(null); 
                                      }
                                  }} 
                                  zoom={zoom} 
                                  properties={a.properties} 
                                  liteMode={liteMode}
                              />
                          </React.Fragment>
                      );
                  })}

                  {/* DISCOVERED LOGISTICS MARKERS */}
                  {logisticsMarkers.map(m => (
                      <RichMarker 
                          key={m.id}
                          position={m.location}
                          type="logistics"
                          label={m.name}
                          isSelected={selectedAsset?.id === m.id}
                          onClick={() => setSelectedAsset({ ...m, properties: { address: m.address } })}
                          zoom={zoom}
                          liteMode={liteMode}
                      />
                  ))}

                  {/* AI NEURAL ROUTES */}
                  {aiRoute && (
                      <DirectionsRenderer 
                          directions={aiRoute} 
                          options={{ 
                              polylineOptions: { strokeColor: '#6366f1', strokeWeight: 5, strokeOpacity: 0.8 },
                              suppressMarkers: false 
                          }} 
                      />
                  )}

                  {/* AI GHOST MOVES (PROPOSED LOCATIONS) */}
                  {ghostMoves.map(gm => (
                      <RichMarker 
                          key={gm.id}
                          position={gm.location}
                          type={gm.type}
                          label={`PROPOSED: ${gm.name}`}
                          isSelected={selectedAsset?.id === gm.id}
                          onClick={() => setSelectedAsset({ ...gm, isGhost: true })}
                          zoom={zoom}
                          properties={{ aiGenerated: true }}
                          liteMode={liteMode}
                      />
                  ))}

                  {drawingMode === 'polygon' && <DrawingManager drawingMode={window.google.maps.drawing.OverlayType.POLYGON} onPolygonComplete={handlePolygonComplete} options={{ drawingControl: false, polygonOptions: { fillColor: '#10b981', fillOpacity: 0.3, strokeWeight: 2, strokeColor: '#fff', editable: true } }} />}
                  <ProjectionHelper setProjection={setMapProjection} />
              </GoogleMap>

              {/* AI LAYER CONTROLS */}
              {(aiRoute || ghostMoves.length > 0 || logisticsMarkers.length > 0) && (
                  <div className="absolute top-24 right-6 z-40 flex flex-col gap-2">
                      <button 
                          onClick={() => { setAiRoute(null); setGhostMoves([]); setLogisticsMarkers([]); }}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase shadow-2xl transition-all flex items-center gap-2"
                      >
                          <Zap size={14} className="fill-white" /> Purge AI Layers
                      </button>
                  </div>
              )}

              {/* NEURAL SCAN RADAR OVERLAY */}
              {isScanning && (
                  <div className="absolute inset-0 pointer-events-none z-40 flex items-center justify-center">
                      <div className="w-[500px] h-[500px] border-4 border-indigo-500/30 rounded-full animate-ping-slow"></div>
                      <div className="absolute w-[300px] h-[300px] border-2 border-indigo-400/20 rounded-full animate-ping"></div>
                      <div className="absolute bg-indigo-500/10 backdrop-blur-sm px-6 py-3 rounded-full border border-indigo-500/30 text-indigo-400 font-black tracking-[0.3em] uppercase text-xs animate-pulse">
                          Neural Logistics Scan in Progress...
                      </div>
                  </div>
              )}
              {showGenesis && (
                  <div className="absolute top-24 left-6 z-[70] w-[420px] bg-stone-950/90 backdrop-blur-3xl border border-indigo-500/30 rounded-[2.5rem] flex flex-col shadow-[0_0_100px_rgba(99,102,241,0.2)] overflow-hidden animate-slide-right">
                      {/* Neural Command Header */}
                      <div className="p-6 border-b border-white/10 bg-gradient-to-r from-indigo-600/20 to-transparent flex justify-between items-center">
                          <div className="flex items-center gap-3">
                              <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/50">
                                  <Sparkles size={18} className="text-white" />
                              </div>
                              <div>
                                  <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Genesis Neural Link</h3>
                                  <div className="flex items-center gap-1.5">
                                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                      <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest">Sovereign Protocol Online</span>
                                  </div>
                              </div>
                          </div>
                          <button onClick={() => setGenesisLog([{ role: 'system', content: 'Neural Handshake Reset. System Ready.' }])} className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors">
                              <Trash2 size={14} />
                          </button>
                      </div>

                      {/* Unified Intelligence Stream */}
                      <div className="h-80 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                          {genesisLog.map((log, i) => (
                              <div key={i} className={`flex ${log.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-[85%] p-4 rounded-[1.5rem] text-xs leading-relaxed shadow-xl border ${
                                      log.role === 'user' 
                                      ? 'bg-indigo-600 text-white rounded-tr-none border-white/10' 
                                      : 'bg-white/5 text-indigo-100 rounded-tl-none border-white/5'
                                  }`}>
                                      {log.content}
                                  </div>
                              </div>
                          ))}
                          {isGenerating && (
                              <div className="flex justify-start animate-pulse">
                                  <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-2">
                                      <Loader2 size={12} className="animate-spin text-indigo-400" />
                                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Synthesizing...</span>
                                  </div>
                              </div>
                          )}
                          <div ref={chatEndRef} />
                      </div>

                      {/* Tactical Action Chips */}
                      <div className="px-6 py-2 flex flex-wrap gap-2 overflow-x-auto no-scrollbar">
                          {[
                              { label: 'Scan Logistics', cmd: 'Scan for local hardware stores' },
                              { label: 'Optimize Fleet', cmd: 'Analyze fleet positions and suggest optimizations' },
                              { label: 'Route to Alpha', cmd: 'Draw a route from HQ to Site Alpha' },
                              { label: 'Show Hazards', cmd: 'Highlight any active hazards on map' }
                          ].map((chip, idx) => (
                              <button 
                                  key={idx}
                                  onClick={() => { setGenesisInput(chip.cmd); }}
                                  className="whitespace-nowrap px-3 py-1.5 bg-white/5 hover:bg-indigo-600/30 border border-white/10 hover:border-indigo-500/50 rounded-full text-[9px] font-black text-indigo-300 uppercase transition-all"
                              >
                                  {chip.label}
                              </button>
                          ))}
                      </div>

                      {/* Neural Input Interface */}
                      <div className="p-6 pt-2">
                          <div className="relative group">
                              <input 
                                  type="text" 
                                  value={genesisInput} 
                                  onChange={e => setGenesisInput(e.target.value)} 
                                  onKeyDown={e => e.key === 'Enter' && handleGenesisCommand()} 
                                  className="w-full bg-white/5 border border-white/10 group-hover:border-indigo-500/50 rounded-2xl py-4 pl-5 pr-14 text-sm text-white outline-none focus:border-indigo-500 transition-all shadow-inner placeholder:text-gray-600 font-bold" 
                                  placeholder="Issue command to Geocore..." 
                              />
                              <button 
                                  onClick={handleGenesisCommand} 
                                  className="absolute right-2 top-2 p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all shadow-lg hover:shadow-indigo-500/50"
                              >
                                  <ArrowRight size={18} />
                              </button>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      </div>
      {/* --- ESTABLISHMENT MODAL --- */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-900 border border-white/10 rounded-2xl shadow-2xl w-[500px] overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-indigo-900/20 to-transparent">
              <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                <MapIcon size={20} className="text-indigo-400" /> Establish Territory
              </h3>
              <button onClick={() => { setShowCreateModal(false); setNewZonePath(null); }} className="text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Type Selection */}
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setNewHubData({ ...newHubData, type: 'project' })}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${newHubData.type === 'project' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-stone-800 border-white/5 text-gray-400 hover:bg-stone-700'}`}
                >
                  <Briefcase size={24} />
                  <span className="text-xs font-black uppercase tracking-wider">Project Zone</span>
                </button>
                <button 
                  onClick={() => setNewHubData({ ...newHubData, type: 'office' })}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${newHubData.type === 'office' ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20' : 'bg-stone-800 border-white/5 text-gray-400 hover:bg-stone-700'}`}
                >
                  <Building2 size={24} />
                  <span className="text-xs font-black uppercase tracking-wider">Office / HQ</span>
                </button>
              </div>

              {/* Logic Switch: Link Existing vs Create New */}
              {newHubData.type === 'project' && (
                  <div className="bg-black/30 p-1 rounded-lg flex text-xs font-bold mb-2">
                      <button 
                          onClick={() => setNewHubData({ ...newHubData, mode: 'existing' })}
                          className={`flex-1 py-2 rounded-md transition-all ${newHubData.mode !== 'new' ? 'bg-stone-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
                      >
                          Link Unmapped Project
                      </button>
                      <button 
                          onClick={() => setNewHubData({ ...newHubData, mode: 'new' })}
                          className={`flex-1 py-2 rounded-md transition-all ${newHubData.mode === 'new' ? 'bg-indigo-600 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
                      >
                          Establish New Project
                      </button>
                  </div>
              )}

              <div className="space-y-4">
                {newHubData.type === 'project' && newHubData.mode !== 'new' ? (
                    <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Select Unmapped Project</label>
                        <select 
                            value={newHubData.existingProjectId || ''}
                            onChange={(e) => {
                                const selected = projects.find(p => p.id === e.target.value);
                                setNewHubData({ 
                                    ...newHubData, 
                                    existingProjectId: e.target.value,
                                    name: selected ? selected.name : '' 
                                });
                            }}
                            className="w-full bg-stone-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none"
                        >
                            <option value="">Select a project...</option>
                            {/* Filter projects that don't have map assets */}
                            {projects.filter(p => !assets.some(a => a.projectId === p.id)).map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.client || 'No Client'})</option>
                            ))}
                        </select>
                    </div>
                ) : (
                    <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Zone / Project Name</label>
                        <input 
                          type="text" 
                          value={newHubData.name} 
                          onChange={(e) => setNewHubData({ ...newHubData, name: e.target.value })} 
                          placeholder="e.g. Riverside Complex" 
                          className="w-full bg-stone-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none" 
                          autoFocus
                        />
                    </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
                <button onClick={() => { setShowCreateModal(false); setNewZonePath(null); }} className="px-6 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all">Cancel</button>
                <button 
                    onClick={createHub} 
                    disabled={!newHubData.name}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {newHubData.mode === 'new' ? 'Establish Project' : 'Confirm Zone'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {selectedAsset && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-stone-900/90 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-6 animate-slide-up z-50">
              <div className="flex flex-col">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">
                      {selectedAsset.isGhost ? 'AI Logistics Proposal' : selectedAsset.type === 'logistics' ? 'Discovered Logistic Hub' : 'Selected Asset'}
                  </span>
                  <span className="text-sm font-bold text-white uppercase tracking-tight">{selectedAsset.name}</span>
                  {selectedAsset.reason && <span className="text-[9px] text-gray-400 mt-1 max-w-[200px] leading-tight italic">"{selectedAsset.reason}"</span>}
              </div>
              <div className="flex gap-2">
                  <button onClick={() => setSelectedAsset(null)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl text-xs font-bold transition-all">Cancel</button>
                  
                  {selectedAsset.isGhost ? (
                      <>
                          <button 
                              onClick={() => { setGhostMoves(prev => prev.filter(gm => gm.id !== selectedAsset.id)); setSelectedAsset(null); }} 
                              className="px-4 py-2 bg-white/10 hover:bg-rose-600/20 text-rose-400 rounded-xl text-xs font-bold transition-all border border-rose-500/20"
                          >
                              Reject Proposal
                          </button>
                          <button 
                              onClick={() => deployProposal(selectedAsset)} 
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-2"
                          >
                              <Zap size={14} className="fill-white" /> Deploy Resource
                          </button>
                      </>
                  ) : selectedAsset.type === 'logistics' ? (
                      <button onClick={() => setLogisticsMarkers([])} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all">Dismiss All Findings</button>
                  ) : (
                      <button onClick={() => deleteAsset(selectedAsset)} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-2"><Trash2 size={14} /> Delete</button>
                  )}
              </div>
          </div>
      )}
      {selectedHub && <ProjectHubDrawer project={selectedHub} onClose={() => setSelectedHub(null)} onDelete={deleteAsset} onUpdate={fetchData} allStaff={staff} allEquipment={equipment} globalAllocations={allocations} />}
    </div>
  );
};

export default VisualMapBuilder;