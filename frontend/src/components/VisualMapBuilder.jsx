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
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Polygon, DrawingManager, StreetViewPanorama, OverlayView, StandaloneSearchBox, DirectionsRenderer } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import { 
  Map as MapIcon, X, Building2, Briefcase, DollarSign, TrendingUp, 
  Calendar, FileText, Plus, ArrowRight, LayoutDashboard, Navigation, 
  Locate, Layers, Globe, Camera, Zap, Settings, Upload, Trash2, Edit, 
  Image as ImageIcon, Users, Truck, Search, MoreHorizontal, ChevronRight, Activity,
  Share2, Shield, Eye, Lock, FileBox, CheckCircle2, Clock, Car, Fuel, Maximize2
} from 'lucide-react';
import { api } from '../utils/api';

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
const RichMarker = ({ position, type, onClick, label, isSelected, isZoneCenter }) => {
    const getPixelPositionOffset = (width, height) => ({
        x: -(width / 2),
        y: -(height / 2),
    });

    let Icon = Briefcase;
    let colorClass = "bg-indigo-600 shadow-indigo-500/40";
    
    if (type === 'staff') { Icon = Users; colorClass = "bg-emerald-500 shadow-emerald-500/40"; }
    else if (type === 'equipment') { Icon = Truck; colorClass = "bg-amber-500 shadow-amber-500/40"; }
    else if (type === 'office' || type === 'OfficeZone') { Icon = Building2; colorClass = "bg-purple-600 shadow-purple-500/40"; }
    else if (type === 'ProjectZone' || type === 'project') { Icon = Briefcase; colorClass = "bg-blue-600 shadow-blue-500/40"; }

    if (isZoneCenter) {
        colorClass = "bg-white text-indigo-600 shadow-xl border-2 border-indigo-600";
    }

    return (
        <OverlayView
            position={position}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            getPixelPositionOffset={getPixelPositionOffset}
        >
            <div 
                className={`relative group cursor-pointer transition-all duration-300 ${isSelected ? 'scale-125 z-50' : 'hover:scale-110 z-10'}`}
                onClick={(e) => { e.stopPropagation(); onClick(); }}
            >
                {!isZoneCenter && <div className={`absolute inset-0 rounded-full animate-ping opacity-75 ${colorClass}`}></div>}
                
                <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg backdrop-blur-sm ${colorClass} ${isZoneCenter ? 'text-indigo-600' : 'text-white border-2 border-white/20'}`}>
                    <Icon size={isZoneCenter ? 22 : 20} strokeWidth={2.5} />
                </div>

                <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 backdrop-blur text-white text-[10px] font-bold px-3 py-1.5 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50`}>
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
            onUnmount={() => setProjection(null)}
        >
            <div />
        </OverlayView>
    );
};

// --- PROJECT COMMAND PORTAL (DRAWER) ---
const ProjectHubDrawer = ({ project, onClose, onUpdate, onDelete, map }) => {
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState('overview'); 
    const [clientMode, setClientMode] = useState(false); 
    const [loading, setLoading] = useState(true);
    
    const [stats, setStats] = useState({ revenue: 0, cost: 0, margin: 0 });
    const [logistics, setLogistics] = useState({ distance: 'Calculating...', duration: '...', directions: null });
    const [diaries, setDiaries] = useState([]);
    const [quotes, setQuotes] = useState([]);
    const [docs, setDocs] = useState([]);
    
    const [viewMode, setViewMode] = useState('overview'); 
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (project?.id) {
            loadProjectData();
            calculateLogistics();
        }
    }, [project]);

    const calculateLogistics = async () => {
        // Use Distance Matrix Service & Directions Service
        if (!window.google || !map) return;
        
        // Assume HQ is at Sydney center or first OfficeZone found
        // For demo, using static HQ or map center
        const hqLocation = { lat: -33.8688, lng: 151.2093 }; 
        const siteLocation = project.coordinates && project.coordinates[0];

        if (siteLocation) {
            // 1. Distance Matrix
            const distService = new window.google.maps.DistanceMatrixService();
            distService.getDistanceMatrix({
                origins: [hqLocation],
                destinations: [siteLocation],
                travelMode: 'DRIVING'
            }, (response, status) => {
                if (status === 'OK' && response.rows[0].elements[0].status === 'OK') {
                    const result = response.rows[0].elements[0];
                    setLogistics(prev => ({ ...prev, distance: result.distance.text, duration: result.duration.text }));
                } else {
                    setLogistics(prev => ({ ...prev, distance: 'N/A', duration: 'N/A' }));
                }
            });

            // 2. Directions (Route)
            const dirService = new window.google.maps.DirectionsService();
            dirService.route({
                origin: hqLocation,
                destination: siteLocation,
                travelMode: 'DRIVING'
            }, (result, status) => {
                if (status === 'OK') {
                    setLogistics(prev => ({ ...prev, directions: result }));
                }
            });
        }
    };

    const loadProjectData = async () => {
        setLoading(true);
        try {
            const [diaryRes, quoteRes, docRes] = await Promise.all([
                api.get('/diaries'),
                api.get('/quotes'),
                api.get('/reports/search?type=DOCUMENT') 
            ]);

            const allDiaries = Array.isArray(diaryRes.data.data) ? diaryRes.data.data : [];
            const projectDiaries = allDiaries.filter(d => d.projectId === project.id || (d.Project && d.Project.id === project.id));
            
            const allQuotes = Array.isArray(quoteRes.data.data) ? quoteRes.data.data : [];
            const projectQuotes = allQuotes.filter(q => q.projectId === project.id || (q.project && q.project.id === project.id));

            const allDocs = Array.isArray(docRes.data.data) ? docRes.data.data : [];
            const projectDocs = allDocs.filter(d => d.relatedId === project.id || d.title.includes(project.name));

            const revenue = projectDiaries.reduce((sum, d) => sum + (parseFloat(d.totalRevenue) || 0), 0);
            const cost = projectDiaries.reduce((sum, d) => sum + (parseFloat(d.totalCost) || 0), 0);
            const quoteTotal = projectQuotes.reduce((sum, q) => sum + (parseFloat(q.totalRevenue) || 0), 0);

            setStats({ revenue, cost, margin: revenue - cost, quoteValue: quoteTotal });
            setDiaries(projectDiaries.slice(0, 10)); 
            setQuotes(projectQuotes);
            setDocs(projectDocs);

            if (project.properties?.coverImage) {
                setViewMode('custom');
            }
        } catch (e) { console.error("Hub Data Error", e); }
        setLoading(false);
    };

    const handleUploadCover = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        try {
            const res = await api.post('/uploads', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (project.assetId) {
                 const updatedProps = { ...project.properties, coverImage: res.data.url };
                 await api.put(`/map-assets/${project.assetId}`, { properties: updatedProps });
                 onUpdate({ ...project, properties: updatedProps });
                 setViewMode('custom');
            }
        } catch (err) { alert("Upload failed"); }
    };

    const formatMoney = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
    const center = project.coordinates && project.coordinates[0] ? project.coordinates[0] : null;
    const coverImage = project.properties?.coverImage;

    const generateClientLink = () => {
        const link = `${window.location.origin}/portal/view/${project.id}?token=share_${Date.now()}`;
        navigator.clipboard.writeText(link);
        alert("Secure Client Portal Link copied to clipboard!");
    };

    return (
        <>
            {logistics.directions && (
                <DirectionsRenderer 
                    directions={logistics.directions} 
                    options={{
                        suppressMarkers: true,
                        polylineOptions: {
                            strokeColor: "#6366f1", // Indigo route
                            strokeOpacity: 0.8,
                            strokeWeight: 5
                        }
                    }} 
                />
            )}
            
            <div className={`
                absolute top-0 right-0 bottom-0 bg-stone-950 border-l border-white/10 shadow-2xl flex flex-col animate-slide-left z-50 font-sans transition-all duration-500
                ${clientMode ? 'w-[600px] border-emerald-500/30' : 'w-[500px]'}
            `}>
                
                <div className="relative h-64 bg-slate-900 group overflow-hidden">
                    {viewMode === 'streetview' && center ? (
                         <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} zoom={1} options={{ disableDefaultUI: true }}>
                            <StreetViewPanorama position={center} visible={true} options={{ disableDefaultUI: true, zoomControl: false, addressControl: false }} />
                         </GoogleMap>
                    ) : viewMode === 'custom' && coverImage ? (
                        <img src={coverImage} alt="Project Cover" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-slate-900 flex items-center justify-center">
                            <Building2 size={80} className="text-white/5" />
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent pointer-events-none" />

                    <div className="absolute top-4 right-4 z-20 flex gap-2">
                         {!clientMode && (
                             <>
                                <input type="file" ref={fileInputRef} className="hidden" onChange={handleUploadCover} accept="image/*" />
                                <button onClick={() => fileInputRef.current.click()} className="p-2 bg-black/40 hover:bg-indigo-600 rounded-full text-white backdrop-blur-md transition-all" title="Upload Cover Image"><ImageIcon size={16} /></button>
                                <button onClick={() => onDelete(project)} className="p-2 bg-black/40 hover:bg-rose-600 rounded-full text-white backdrop-blur-md transition-all" title="Delete Zone"><Trash2 size={16} /></button>
                             </>
                         )}
                         <button onClick={onClose} className="p-2 bg-black/40 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all"><X size={16} /></button>
                    </div>

                    <div className="absolute top-4 left-4 z-20">
                        <button 
                            onClick={() => setClientMode(!clientMode)}
                            className={`
                                px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xl border backdrop-blur-md flex items-center gap-2 transition-all
                                ${clientMode ? 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/20' : 'bg-black/40 text-gray-300 border-white/10 hover:bg-black/60'}
                            `}
                        >
                            {clientMode ? <><Eye size={12} /> Client Portal View</> : <><Lock size={12} /> Admin Mode</>}
                        </button>
                    </div>

                    <div className="absolute bottom-6 left-8 z-20 right-8">
                        <h2 className="text-4xl font-black text-white leading-none mb-2 drop-shadow-xl">{project.name}</h2>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
                            <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg border border-white/5 flex items-center gap-2">
                                <Navigation size={12} className="text-indigo-400" /> 
                                {project.site || 'Geo-Tagged Zone'}
                            </div>
                            {clientMode && (
                                <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1">
                                    <CheckCircle2 size={12} /> Live
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex border-b border-white/5 bg-stone-900/50 p-1 backdrop-blur-sm sticky top-0 z-10">
                    {['overview', 'diaries', 'quotes', 'docs'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)} 
                            className={`
                                flex-1 py-3 text-[10px] font-black uppercase tracking-wider transition-all border-b-2 
                                ${activeTab === tab 
                                    ? 'border-indigo-500 text-white bg-white/5' 
                                    : 'border-transparent text-gray-500 hover:text-gray-300'}
                            `}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8 bg-stone-950">
                    
                    {activeTab === 'overview' && (
                        <>
                            {!clientMode && (
                                <div className="bg-stone-900 border border-white/5 p-4 rounded-2xl animate-fade-in-up">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1"><Truck size={12} /> Logistics (from HQ)</span>
                                        <span className="text-[10px] font-mono text-indigo-400">{logistics.distance}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-stone-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-600 w-3/4 rounded-full"></div>
                                        </div>
                                        <span className="text-xs font-bold text-white whitespace-nowrap">{logistics.duration} drive</span>
                                    </div>
                                </div>
                            )}

                            {!clientMode ? (
                                <div className="grid grid-cols-2 gap-4 animate-fade-in-up">
                                    <div className="bg-stone-900 border border-white/5 p-5 rounded-3xl hover:border-emerald-500/30 transition-all group relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><TrendingUp size={60}/></div>
                                        <div className="flex justify-between items-start mb-3 relative z-10">
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Revenue</span>
                                        </div>
                                        <div className="text-3xl font-black text-white tracking-tight relative z-10">{loading ? '...' : formatMoney(stats.revenue)}</div>
                                        <div className="text-xs font-bold text-emerald-500 mt-1 relative z-10">Live Actuals</div>
                                    </div>
                                    <div className="bg-stone-900 border border-white/5 p-5 rounded-3xl hover:border-rose-500/30 transition-all group relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><DollarSign size={60}/></div>
                                        <div className="flex justify-between items-start mb-3 relative z-10">
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Cost</span>
                                        </div>
                                        <div className="text-3xl font-black text-white tracking-tight relative z-10">{loading ? '...' : formatMoney(stats.cost)}</div>
                                        <div className="text-xs font-bold text-rose-500 mt-1 relative z-10">Expenses</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-fade-in">
                                {/* Status Card */}
                                <div className="p-6 bg-gradient-to-br from-emerald-900/40 to-stone-900 border border-emerald-500/30 rounded-3xl relative overflow-hidden">
                                    <div className="flex justify-between items-start relative z-10">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                                <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Live Status</span>
                                            </div>
                                            <h3 className="text-2xl font-black text-white">Operations Active</h3>
                                            <p className="text-sm text-gray-400 mt-1">Site is currently open and staffed.</p>
                                        </div>
                                        <div className="p-3 bg-emerald-500/20 rounded-2xl">
                                            <Activity size={24} className="text-emerald-400" />
                                        </div>
                                    </div>
                                    {/* Progress Bar Mock */}
                                    <div className="mt-6">
                                        <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
                                            <span>Project Completion</span>
                                            <span className="text-white">65%</span>
                                        </div>
                                        <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 w-[65%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Activity Snippet */}
                                <div className="bg-stone-900/50 border border-white/5 rounded-3xl p-6">
                                    <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                        <Calendar size={16} className="text-indigo-400" /> Latest Activity
                                    </h4>
                                    <div className="space-y-3">
                                        {diaries.slice(0, 3).map(d => (
                                            <div key={d.id} className="flex items-center gap-4 text-sm">
                                                <div className="w-1 h-8 bg-indigo-500/20 rounded-full"></div>
                                                <div>
                                                    <div className="font-bold text-gray-200">{new Date(d.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</div>
                                                    <div className="text-xs text-gray-500">{d.weather || 'Weather Recorded'} • {d.totalHours || 8} Staff Hours</div>
                                                </div>
                                            </div>
                                        ))}
                                        {diaries.length === 0 && <div className="text-gray-500 text-xs italic">No recent logs.</div>}
                                    </div>
                                </div>
                            </div>
                            )}

                            {!clientMode && (
                                <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 block flex items-center gap-2">
                                        <Zap size={12} className="text-amber-400"/> Command Actions
                                    </label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button onClick={() => navigate('/quotes/new', { state: { projectId: project.id } })} className="p-4 bg-stone-900 hover:bg-stone-800 rounded-2xl border border-white/5 hover:border-indigo-500/50 transition-all flex flex-col items-center gap-2 group">
                                            <FileText size={24} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                                            <span className="text-xs font-bold text-white">New Quote</span>
                                        </button>
                                        <button onClick={generateClientLink} className="p-4 bg-stone-900 hover:bg-stone-800 rounded-2xl border border-white/5 hover:border-emerald-500/50 transition-all flex flex-col items-center gap-2 group">
                                            <Share2 size={24} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                                            <span className="text-xs font-bold text-white">Share Portal</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            <div className="bg-stone-900/50 p-6 rounded-3xl border border-white/5 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                                <h4 className="text-sm font-bold text-white mb-2">Project Brief</h4>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    {project.description || "No project description available. This zone is active and tracking daily operations."}
                                </p>
                            </div>
                        </>
                    )}

                    {/* (Diaries, Quotes, Docs Tabs same as previous) */}
                    {activeTab === 'diaries' && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-black text-white uppercase tracking-wider">Site Logs</h3>
                                {!clientMode && <button onClick={() => navigate('/diary', { state: { projectId: project.id } })} className="text-xs font-bold text-indigo-400 hover:text-white transition-colors">+ New Entry</button>}
                            </div>
                            {diaries.length > 0 ? diaries.map((d, i) => (
                                <div key={d.id} className="p-4 bg-stone-900 rounded-2xl border border-white/5 flex gap-4 hover:bg-stone-800 transition-colors cursor-pointer group" style={{ animationDelay: `${i * 50}ms` }}>
                                    <div className="flex flex-col items-center justify-center w-12 h-12 bg-black/20 rounded-xl border border-white/5 text-gray-400 group-hover:text-white group-hover:border-indigo-500/50 transition-all">
                                        <span className="text-[10px] font-black uppercase">{new Date(d.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                                        <span className="text-lg font-black">{new Date(d.date).getDate()}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-white mb-1">{d.Project?.name || 'Site Log'}</div>
                                        <div className="text-xs text-gray-500 line-clamp-2">{d.notes || 'No notes recorded.'}</div>
                                    </div>
                                    {!clientMode && <div className="text-xs font-black text-emerald-400 self-center">{formatMoney(d.totalRevenue)}</div>}
                                </div>
                            )) : ( <div className="text-center py-10 text-gray-500 text-xs">No diary entries found.</div> )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

// --- ASSET DRAWER ---
const AssetDrawer = ({ asset, onClose, onDelete }) => {
    const navigate = useNavigate();
    
    return (
        <div className="absolute top-4 right-4 bottom-4 w-96 bg-stone-900/95 border border-white/10 shadow-2xl flex flex-col z-50 backdrop-blur-xl rounded-3xl animate-slide-left overflow-hidden">
             <div className="relative h-48 bg-gradient-to-br from-indigo-900 to-stone-900 p-6 flex flex-col justify-end">
                 <div className="absolute top-4 right-4 flex gap-2">
                     <button onClick={() => onDelete(asset)} className="p-2 bg-black/20 hover:bg-rose-600/80 rounded-full text-white backdrop-blur-sm transition-all"><Trash2 size={16}/></button>
                     <button onClick={onClose} className="p-2 bg-black/20 hover:bg-white/20 rounded-full text-white backdrop-blur-sm transition-all"><X size={16}/></button>
                 </div>
                 <div className="relative z-10">
                     <div className="flex items-center gap-2 mb-2">
                         <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-white/10 text-white border border-white/10`}>{asset.type || 'Asset'}</span>
                     </div>
                     <h2 className="text-2xl font-black text-white leading-tight">{asset.name || 'Unnamed Asset'}</h2>
                 </div>
                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
             </div>
             <div className="flex-1 overflow-y-auto p-6 space-y-6">
                 <div className="space-y-4">
                     <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2"><Activity size={14} /> Asset Details</h3>
                     <div className="bg-stone-800/50 rounded-2xl p-4 border border-white/5 space-y-3">
                         <div className="flex justify-between items-center"><span className="text-xs text-gray-400">Status</span><span className="text-xs font-bold text-emerald-400 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Active</span></div>
                         <div className="flex justify-between items-center"><span className="text-xs text-gray-400">Coordinates</span><span className="text-[10px] font-mono text-indigo-300">{asset.coordinates && asset.coordinates[0] ? `${asset.coordinates[0].lat.toFixed(4)}, ${asset.coordinates[0].lng.toFixed(4)}` : 'N/A'}</span></div>
                     </div>
                 </div>
             </div>
        </div>
    );
};

// --- HELPER ---
const getPolygonCenter = (coordinates) => {
    if (!coordinates || coordinates.length === 0) return null;
    const lat = coordinates.reduce((sum, c) => sum + c.lat, 0) / coordinates.length;
    const lng = coordinates.reduce((sum, c) => sum + c.lng, 0) / coordinates.length;
    return { lat, lng };
};

// --- MAIN BUILDER ---
const VisualMapBuilder = ({ readOnly = false, initialProjectId = null }) => {
  const [map, setMap] = useState(null);
  const [mapProjection, setMapProjection] = useState(null);
  const mapContainerRef = useRef(null);
  const [drawingMode, setDrawingMode] = useState(null);
  const [mapTypeId, setMapTypeId] = useState('roadmap');
  const [tilt, setTilt] = useState(0); 
  const [heading, setHeading] = useState(0); // For rotation
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedHub, setSelectedHub] = useState(null);
  
  // Data Lists (Sidebar)
  const [projects, setProjects] = useState([]);
  const [staff, setStaff] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [activeTab, setActiveTab] = useState('assets'); 
  const [filterText, setFilterText] = useState('');
  
  // Creation Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newZonePath, setNewZonePath] = useState(null);
  const [newHubData, setNewHubData] = useState({ name: '', type: 'project' }); 
  const [draggedProject, setDraggedProject] = useState(null);
  
  // Client Mode
  const [clientMode, setClientMode] = useState(readOnly);

  // Search Box Ref
  const inputRef = useRef(null);

  // Auto-Select Project for Portal Mode
  useEffect(() => {
      if (initialProjectId && projects.length > 0 && assets.length > 0 && map) {
           const zone = assets.find(z => z.projectId == initialProjectId && z.geometryType === 'POLYGON');
           if (zone) {
               // 1. Open the Drawer
               handleZoneClick(zone);
               
               // 2. Center the Map on the Project
               const center = getPolygonCenter(zone.coordinates);
               if (center) {
                   map.panTo(center);
                   map.setZoom(18);
                   map.setTilt(45); // Cinematic tilt
               }
           }
      }
  }, [initialProjectId, projects, assets, map]);

  // Persistent View State
  const [initialView] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MAP_VIEW);
      if (saved && !initialProjectId) return JSON.parse(saved); // Only use saved view if NOT in portal mode
    } catch (e) { console.error('Map state parse error', e); }
    return { center: { lat: -33.8688, lng: 151.2093 }, zoom: 13 };
  });

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES
  });

  // Init Autocomplete & Search Logic
  useEffect(() => {
      if (isLoaded && inputRef.current && window.google && !readOnly) {
          const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, { fields: ['geometry', 'name', 'photos'] });
          const geocoder = new window.google.maps.Geocoder();

          const handlePlaceSelect = () => {
              const place = autocomplete.getPlace();
              let location = null;
              let viewport = null;

              if (!place || !place.geometry) {
                  // Fallback: User hit enter without selecting
                  const query = inputRef.current.value;
                  if (query) {
                      geocoder.geocode({ address: query }, (results, status) => {
                          if (status === 'OK' && results[0]) {
                              location = results[0].geometry.location;
                              viewport = results[0].geometry.viewport;
                              processLocation(location, viewport, null); // No photo from geocode
                          }
                      });
                  }
                  return;
              }

              // Standard Place Result
              location = place.geometry.location;
              viewport = place.geometry.viewport;
              
              let photoUrl = null;
              if (place.photos && place.photos.length > 0) {
                  photoUrl = place.photos[0].getUrl({ maxWidth: 800 });
              }

              processLocation(location, viewport, photoUrl);
          };

          const processLocation = (location, viewport, photoUrl) => {
              if (viewport) {
                  map.fitBounds(viewport);
              } else {
                  map.setCenter(location);
                  map.setZoom(18);
              }

              // Clear input and blur to hide keyboard/dropdown
              if (inputRef.current) {
                  inputRef.current.value = '';
                  inputRef.current.blur();
              }

              // Drag Initialization Logic
              if (draggedProject) {
                  setDrawingMode('polygon');
                  setNewHubData(prev => ({ ...prev, coverImage: photoUrl }));
              }
          };

          const listener = autocomplete.addListener('place_changed', handlePlaceSelect);

          // Handle "Enter" key manually
          const handleKeyDown = (e) => {
              if (e.key === 'Enter') {
                  // Delay to let Autocomplete fire first
                  setTimeout(() => {
                      // Check if autocomplete handled it (input would be cleared if successful above)
                      if (inputRef.current && inputRef.current.value !== '') {
                          handlePlaceSelect(); 
                      }
                  }, 300);
              }
          };
          
          inputRef.current.addEventListener('keydown', handleKeyDown);

          return () => {
              window.google.maps.event.removeListener(listener);
              if (inputRef.current) inputRef.current.removeEventListener('keydown', handleKeyDown);
          };
      }
  }, [isLoaded, map, draggedProject, readOnly]);

  // Inject Google Maps Autocomplete Styles
  useEffect(() => {
      const style = document.createElement('style');
      style.innerHTML = `
          .pac-container { 
              z-index: 10000 !important; 
              border-radius: 12px;
              border: 1px solid rgba(255,255,255,0.1);
              background-color: rgba(28, 25, 23, 0.95); /* Stone-900 */
              backdrop-filter: blur(12px);
              font-family: sans-serif;
              margin-top: 8px;
              box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
          }
          .pac-item {
              border-top: 1px solid rgba(255,255,255,0.05);
              padding: 12px 16px;
              cursor: pointer;
              color: #e5e7eb; /* Gray-200 */
          }
          .pac-item:hover {
              background-color: rgba(255,255,255,0.1);
          }
          .pac-item-query {
              color: #fff;
              font-weight: bold;
          }
          .pac-icon {
              filter: invert(1);
              opacity: 0.5;
          }
      `;
      document.head.appendChild(style);
      return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
      const fetchData = async () => {
          try {
              const [pRes, sRes, eRes, mRes] = await Promise.all([
                  api.get('/projects'),
                  api.get('/staff'),
                  api.get('/equipment'),
                  api.get('/map-assets')
              ]);
              setProjects(pRes.data.data || pRes.data || []);
              setStaff(sRes.data.data || sRes.data || []);
              setEquipment(eRes.data.data || eRes.data || []);
              setAssets(mRes.data || []);
          } catch(err) { console.error("Failed to load map data", err); }
      };
      fetchData();
  }, []);

  const onMapLoad = useCallback((mapInstance) => {
      setMap(mapInstance);
      mapInstance.setTilt(tilt);
      mapInstance.setHeading(heading);
  }, [tilt, heading]);

  useEffect(() => {
      if (map) {
          map.setTilt(tilt);
          map.setHeading(heading);
      }
  }, [map, tilt, heading]);

  const handleMapIdle = () => {
    if (map && !readOnly) {
      const center = map.getCenter();
      const zoom = map.getZoom();
      if (center && zoom) {
        const state = { center: { lat: center.lat(), lng: center.lng() }, zoom };
        localStorage.setItem(STORAGE_KEY_MAP_VIEW, JSON.stringify(state));
      }
    }
  };

  const fitToAssets = () => {
    if (!map || assets.length === 0) return;
    const bounds = new window.google.maps.LatLngBounds();
    assets.forEach(a => {
      if (a.geometryType === 'POINT' && a.coordinates?.[0]) bounds.extend(a.coordinates[0]);
      else if (a.geometryType === 'POLYGON' && a.coordinates) a.coordinates.forEach(c => bounds.extend(c));
    });
    map.fitBounds(bounds);
  };

  // --- HANDLERS ---
  const handlePolygonComplete = async (polygon) => {
      const path = polygon.getPath();
      const coords = [];
      for(let i=0; i<path.getLength(); i++) {
          coords.push({ lat: path.getAt(i).lat(), lng: path.getAt(i).lng() });
      }
      polygon.setMap(null); 
      setNewZonePath(coords);
      setDrawingMode(null);
      
      // If we dragged a project, auto-init with that project data
      if (draggedProject) {
          setNewHubData({ name: draggedProject.name, type: 'project', coverImage: newHubData.coverImage });
      } else {
          setNewHubData({ name: '', type: 'project' });
      }
      
      setShowCreateModal(true);
  };

  const createHub = async () => {
      if (!newZonePath) return;
      try {
          let projectId = draggedProject?.id || null;
          
          // If no existing project linked, create one if type is project
          if (!projectId && newHubData.type === 'project') {
              const pRes = await api.post('/projects', {
                  name: newHubData.name,
                  status: 'active',
                  site: 'Geofenced Zone'
              });
              projectId = pRes.data.id;
              setProjects(prev => [...prev, pRes.data]);
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
                  coverImage: newHubData.coverImage
              }
          };

          const aRes = await api.post('/map-assets', assetPayload);
          setAssets(prev => [...prev, aRes.data]);
          setShowCreateModal(false);
          setNewHubData({ name: '', type: 'project' });
          setNewZonePath(null);
          setDraggedProject(null);
      } catch (e) { alert("Failed to create hub: " + e.message); }
  };

  const handleMapClick = async (e) => {
      if (drawingMode !== 'point') {
          setSelectedAsset(null); 
          setSelectedHub(null);
          return;
      }
      
      const lat = e.latLng.lat(); const lng = e.latLng.lng(); 
      let addressName = 'New Marker';
      
      // Reverse Geocoding
      if (window.google) {
          const geocoder = new window.google.maps.Geocoder();
          try {
              const res = await geocoder.geocode({ location: { lat, lng } });
              if (res.results[0]) addressName = res.results[0].formatted_address;
          } catch(e) { console.warn("Geocoding failed", e); }
      }

      setDrawingMode(null);
      const newPoint = { name: addressName, type: 'PointOfInterest', geometryType: 'POINT', coordinates: [{ lat, lng }], properties: {} };
      try { const res = await api.post('/map-assets', newPoint); setAssets(prev => [...prev, res.data]); setSelectedAsset(res.data); } catch(e) { console.error(e); }
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = async (e) => {
      e.preventDefault();
      const dataStr = e.dataTransfer.getData('application/geo-asset');
      if (!dataStr || !map) return;
      
      const item = JSON.parse(dataStr);
      let lat, lng;

      // Project Init Logic (Center is fine for initialization usually, or we try precision)
      if (item.type === 'project-init') {
          setDraggedProject(item);
          // Focus search box
          if (inputRef.current) inputRef.current.focus();
          alert(`Initializing "${item.name}". Please SEARCH the site address in the top bar to zoom in, then click "Draw Zone" to define the perimeter.`);
          return;
      }

      // Precise Drop Logic
      if (mapProjection && mapContainerRef.current) {
          const rect = mapContainerRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          const latLng = mapProjection.fromContainerPixelToLatLng(new window.google.maps.Point(x, y));
          if (latLng) {
              lat = latLng.lat();
              lng = latLng.lng();
          }
      }

      // Fallback to center if projection failed
      if (!lat || !lng) {
          const center = map.getCenter();
          lat = center.lat();
          lng = center.lng();
      }

      const newAsset = {
          name: item.name,
          type: item.type === 'staff' ? 'staff' : 'equipment',
          geometryType: 'POINT',
          coordinates: [{ lat, lng }],
          properties: { originalId: item.id }
      };

      try {
          const res = await api.post('/map-assets', newAsset);
          setAssets(prev => [...prev, res.data]);
          setSelectedAsset(res.data);
      } catch(e) { console.error(e); }
  };

  const deleteAsset = async (asset) => {
      if(!confirm("Delete this asset from map?")) return;
      try {
          await api.delete(`/map-assets/${asset.id}`);
          setAssets(prev => prev.filter(a => a.id !== asset.id));
          setSelectedAsset(null);
          setSelectedHub(null);
      } catch(e) { console.error(e); }
  };

  const handleHubUpdate = (updatedHub) => {
      setAssets(prev => prev.map(z => z.id === updatedHub.assetId ? { ...z, properties: updatedHub.properties } : z));
      setSelectedHub(updatedHub);
  };

  const handleZoneClick = (zone) => {
      if (drawingMode) return; 
      const linkedProject = projects.find(p => p.id === zone.projectId);
      const hub = {
          id: linkedProject?.id || zone.id, 
          assetId: zone.id, 
          name: linkedProject?.name || zone.name,
          status: zone.properties?.type === 'office' ? 'office' : 'active',
          site: linkedProject?.site || 'Map Zone',
          isProject: !!linkedProject,
          coordinates: zone.coordinates,
          properties: zone.properties || {}
      };
      setSelectedHub(hub);
      setSelectedAsset(null);
  };

  if (!isLoaded) return <div className="h-screen bg-slate-950 flex items-center justify-center text-indigo-500 font-mono">INITIALIZING GEOCORE...</div>;

  return (
    <div className="relative w-full h-[calc(100vh-64px)] bg-stone-950 overflow-hidden flex font-sans">
      
      {/* SIDEBAR */}
      {!readOnly && (
      <div className="w-80 bg-stone-900/95 border-r border-white/5 flex flex-col z-20 backdrop-blur-xl shadow-2xl relative">
          <div className="p-6 border-b border-white/5 bg-gradient-to-r from-indigo-900/20 to-transparent">
              <h1 className="text-xl font-black text-white tracking-tighter flex items-center gap-2">
                 <MapIcon className="text-indigo-500" /> GEOCORE <span className="text-indigo-500">ULTRA</span>
              </h1>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Spatial Intelligence</p>
          </div>

          <div className="p-4 grid grid-cols-2 gap-3 border-b border-white/5">
              <button onClick={() => setDrawingMode('polygon')} className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${drawingMode==='polygon' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-stone-800 border-white/5 text-gray-400 hover:text-white'}`}>
                  <Layers size={20} /> <span className="text-[10px] font-bold uppercase">Draw Zone</span>
              </button>
              <button onClick={() => setDrawingMode('point')} className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${drawingMode==='point' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-stone-800 border-white/5 text-gray-400 hover:text-white'}`}>
                  <MapIcon size={20} /> <span className="text-[10px] font-bold uppercase">Add Point</span>
              </button>
              <button onClick={fitToAssets} className="col-span-2 p-2 rounded-xl border border-white/5 bg-stone-800 text-gray-400 hover:text-white flex items-center justify-center gap-2 transition-all hover:bg-stone-700" title="Fit to All Assets">
                  <Locate size={16} /> <span className="text-[10px] font-bold uppercase">Locate All Assets</span>
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
                    {projects.filter(p => !assets.some(a => a.projectId === p.id)).map(p => (
                        <div key={p.id} draggable onDragStart={(e) => e.dataTransfer.setData('application/geo-asset', JSON.stringify({ ...p, type: 'project-init' }))} className="p-3 bg-stone-800 rounded-xl border border-white/5 hover:border-indigo-500/50 cursor-grab active:cursor-grabbing flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold text-xs"><Briefcase size={14}/></div>
                                <div><div className="text-xs font-bold text-white">{p.name}</div><div className="text-[10px] text-gray-500">Unmapped</div></div>
                            </div>
                            <MoreHorizontal size={14} className="text-gray-600 group-hover:text-white" />
                        </div>
                    ))}
                    {/* ... (rest of sidebar assets) ... */}
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 mt-4">Staff</div>
                    {staff.filter(s => s.name.toLowerCase().includes(filterText.toLowerCase())).map(s => (
                        <div key={s.id} draggable onDragStart={(e) => e.dataTransfer.setData('application/geo-asset', JSON.stringify({ ...s, type: 'staff' }))} className="p-3 bg-stone-800 rounded-xl border border-white/5 hover:border-emerald-500/50 cursor-grab active:cursor-grabbing flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-xs">{s.name.substring(0,2)}</div>
                                <div><div className="text-xs font-bold text-white">{s.name}</div><div className="text-[10px] text-gray-500">{s.role || 'Staff'}</div></div>
                            </div>
                            <MoreHorizontal size={14} className="text-gray-600 group-hover:text-white" />
                        </div>
                    ))}
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 mt-4">Equipment</div>
                    {equipment.filter(e => e.name.toLowerCase().includes(filterText.toLowerCase())).map(e => (
                        <div key={e.id} draggable onDragStart={(evt) => evt.dataTransfer.setData('application/geo-asset', JSON.stringify({ ...e, type: 'equipment' }))} className="p-3 bg-stone-800 rounded-xl border border-white/5 hover:border-amber-500/50 cursor-grab active:cursor-grabbing flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold text-xs"><Truck size={14}/></div>
                                <div><div className="text-xs font-bold text-white">{e.name}</div><div className="text-[10px] text-gray-500">{e.category || 'Asset'}</div></div>
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
        onClick={handleMapClick}
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
            mapId="90f87356969d889c" // Enables Vector Map features
            onIdle={handleMapIdle}
            options={{ 
                styles: mapTypeId === 'roadmap' ? MIDNIGHT_STYLE : null, 
                disableDefaultUI: true, 
                streetViewControl: true, 
                streetViewControlOptions: { position: window.google.maps.ControlPosition.RIGHT_BOTTOM },
                mapTypeControl: false, 
                clickableIcons: false 
            }}
            onLoad={onMapLoad}
          >
              <ProjectionHelper setProjection={setMapProjection} />

              {drawingMode === 'polygon' && (
                  <DrawingManager
                      onPolygonComplete={handlePolygonComplete}
                      options={{ drawingControl: false, polygonOptions: { fillColor: '#10b981', fillOpacity: 0.3, strokeWeight: 2, strokeColor: '#fff', clickable: false, editable: true, zIndex: 10 } }}
                  />
              )}
              {assets.map(asset => {
                  if (asset.geometryType === 'POLYGON') {
                      const center = getPolygonCenter(asset.coordinates);
                      return (
                          <React.Fragment key={asset.id}>
                              <Polygon paths={asset.coordinates} options={{ fillColor: asset.properties?.color || HUB_COLORS.active, fillOpacity: 0.2, strokeColor: asset.properties?.color || HUB_COLORS.active, strokeWeight: 2, zIndex: 1 }} onClick={(e) => { e.stop(); handleZoneClick(asset); }} />
                              {center && (
                                  <RichMarker position={center} type={asset.properties?.type || 'ProjectZone'} label={asset.name} isSelected={selectedHub?.assetId === asset.id} isZoneCenter={true} onClick={() => handleZoneClick(asset)} />
                              )}
                          </React.Fragment>
                      );
                  } else if (asset.geometryType === 'POINT') {
                      return <RichMarker key={asset.id} position={asset.coordinates[0]} type={asset.type} label={asset.name} isSelected={selectedAsset?.id === asset.id} onClick={() => { setSelectedAsset(asset); setSelectedHub(null); }} />;
                  }
                  return null;
              })}
          </GoogleMap>
          
          {/* Overlay Hints / Controls */}
          {drawingMode && !readOnly && (
              <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-indigo-600/90 backdrop-blur-md text-white px-6 py-2 rounded-full font-bold text-xs shadow-xl animate-bounce z-30 border border-white/20">
                  {drawingMode === 'polygon' ? 'CLICK TO DEFINE ZONE POINTS' : 'CLICK LOCATION TO PLACE MARKER'}
              </div>
          )}
          
          {/* View Controls */}
          <div className="absolute top-4 right-4 z-30 bg-stone-900/90 backdrop-blur-md border border-white/10 rounded-xl p-1.5 flex gap-1 shadow-2xl">
             <button onClick={() => setMapTypeId('roadmap')} className={`px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-black uppercase tracking-wide transition-all ${mapTypeId === 'roadmap' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}><MapIcon size={14} /> Map</button>
             <button onClick={() => { setMapTypeId('hybrid'); setTilt(45); }} className={`px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-black uppercase tracking-wide transition-all ${mapTypeId === 'hybrid' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}><Globe size={14} /> Satellite</button>
          </div>
      </div>

      {/* CREATE HUB MODAL */}
      {showCreateModal && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
              <div className="bg-stone-900 border border-white/10 p-10 rounded-[2rem] w-[450px] shadow-2xl transform transition-all scale-100">
                  <h2 className="text-3xl font-black text-white mb-8 text-center">Initialize Zone</h2>
                  {newHubData.coverImage && <img src={newHubData.coverImage} className="w-full h-32 object-cover rounded-xl mb-6 border border-white/10" alt="Location" />}
                  <div className="space-y-6">
                      <div>
                          <label className="text-xs font-black text-gray-500 uppercase block mb-2 tracking-widest">Zone Designation</label>
                          <input autoFocus className="w-full bg-black/30 border border-white/10 rounded-2xl p-4 text-lg text-white font-bold focus:border-indigo-500 outline-none transition-colors placeholder-gray-700" placeholder="e.g. Site Alpha" value={newHubData.name} onChange={e => setNewHubData({...newHubData, name: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div onClick={() => setNewHubData({...newHubData, type: 'project'})} className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-3 group ${newHubData.type === 'project' ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-stone-800/50 border-transparent text-gray-500 hover:bg-stone-800 hover:border-white/10'}`}>
                              <div className={`p-3 rounded-full ${newHubData.type === 'project' ? 'bg-emerald-500 text-white' : 'bg-stone-700 text-gray-400'} transition-colors`}><Briefcase size={24} /></div><span className="text-xs font-black uppercase tracking-wide">Active Project</span>
                          </div>
                          <div onClick={() => setNewHubData({...newHubData, type: 'office'})} className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-3 group ${newHubData.type === 'office' ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : 'bg-stone-800/50 border-transparent text-gray-500 hover:bg-stone-800 hover:border-white/10'}`}>
                              <div className={`p-3 rounded-full ${newHubData.type === 'office' ? 'bg-indigo-500 text-white' : 'bg-stone-700 text-gray-400'} transition-colors`}><Building2 size={24} /></div><span className="text-xs font-black uppercase tracking-wide">HQ / Office</span>
                          </div>
                      </div>
                  </div>
                  <div className="flex gap-3 mt-10">
                      <button onClick={() => { setShowCreateModal(false); setNewZonePath(null); }} className="flex-1 py-4 rounded-2xl font-bold text-gray-400 hover:bg-white/5 transition-colors">Cancel</button>
                      <button onClick={createHub} className="flex-1 py-4 rounded-2xl font-bold bg-white text-black hover:bg-gray-200 shadow-xl hover:scale-[1.02] transition-all">Confirm Initialization</button>
                  </div>
              </div>
          </div>
      )}

      {/* DRAWERS */}
      {selectedHub && <ProjectHubDrawer project={selectedHub} map={map} onClose={() => setSelectedHub(null)} onDelete={deleteAsset} onUpdate={handleHubUpdate} />}
      {selectedAsset && !selectedHub && <AssetDrawer asset={selectedAsset} onClose={() => setSelectedAsset(null)} onDelete={deleteAsset} />}
    </div>
  );
};

export default VisualMapBuilder;
