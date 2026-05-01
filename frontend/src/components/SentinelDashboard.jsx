import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, DollarSign, ArrowRight, CheckCircle, X, Activity, History, Radar, TrendingUp, AlertTriangle, Trash2, Cpu, Database, Network } from 'lucide-react';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const SentinelDashboard = () => {
    const [alerts, setAlerts] = useState([]);
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState({ totalRecovered: 0, pendingRevenue: 0, leaksDetected: 0 });
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [loading, setLoading] = useState(true);
    const [scanning, setScanning] = useState(false);
    const [deepScanning, setDeepScanning] = useState(false);
    const [latestDiaryId, setLatestDiaryId] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'
    const [telemetry, setTelemetry] = useState([]);
    const telemetryEndRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
        fetchProjects();
        const interval = setInterval(fetchData, 30000); // Poll every 30s
        
        const handleOpenEvent = () => setIsOpen(true);
        window.addEventListener('sentinel:open', handleOpenEvent);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('sentinel:open', handleOpenEvent);
        };
    }, []);

    useEffect(() => {
        if (telemetryEndRef.current) {
            telemetryEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [telemetry]);

    const addTelemetry = (msg, type = 'info') => {
        setTelemetry(prev => [...prev.slice(-15), { id: Date.now(), msg, type, time: new Date().toLocaleTimeString() }]);
    };

    const fetchProjects = async () => {
        try {
            const res = await api.get('/projects');
            // Support paginated or direct array response
            const projs = Array.isArray(res.data) ? res.data : (res.data.rows || []);
            setProjects(projs);
            if (projs.length > 0) setSelectedProjectId(projs[0].id);
        } catch (e) { console.error("Project fetch failed", e); }
    };

    const fetchData = async () => {
        try {
            const [alertsRes, historyRes, statsRes, diariesRes] = await Promise.all([
                api.get('/sentinel/alerts'),
                api.get('/sentinel/history'),
                api.get('/sentinel/stats'),
                api.get('/paint-diaries?limit=1')
            ]);
            setAlerts(Array.isArray(alertsRes.data) ? alertsRes.data : []);
            setHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
            setStats(statsRes.data || { totalRecovered: 0, pendingRevenue: 0 });
            if (diariesRes.data && diariesRes.data.length > 0) {
                setLatestDiaryId(diariesRes.data[0].id);
            }
        } catch (e) {
            console.error("Sentinel Offline:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleForceScan = async () => {
        if (!latestDiaryId) return alert("No diary found to scan.");
        setScanning(true);
        setTelemetry([]);
        addTelemetry("INITIATING FORENSIC SCAN...", "warn");
        addTelemetry(`Target: Diary Node [${latestDiaryId.split('-')[0]}]`);
        addTelemetry("Bypassing Standard Logic. Engaging Neural Grok Core.");
        
        try {
            const res = await api.post('/sentinel/scan', { diaryId: latestDiaryId });
            if (res.data && res.data.totalPotentialRevenue) {
                addTelemetry("LEAKAGE DETECTED.", "success");
                addTelemetry(`Value Identified: $${res.data.totalPotentialRevenue.toLocaleString()}`, "success");
                fetchData(); // Refresh alerts
            } else {
                addTelemetry("Scan Complete: Sector Secure. No leakage found.");
            }
        } catch (e) {
            addTelemetry("Scan Failed: " + (e.response?.data?.error || e.message), "error");
        } finally {
            setScanning(false);
            setTimeout(() => setTelemetry([]), 8000);
        }
    };

    const handleDeepScan = async () => {
        if (!selectedProjectId) return alert("Select a project for Deep Scan.");
        setDeepScanning(true);
        setTelemetry([]);
        addTelemetry("INITIATING PROJECT-WIDE DEEP SCAN...", "warn");
        addTelemetry(`Target Project: ${projects.find(p => p.id === selectedProjectId)?.name || selectedProjectId}`);
        addTelemetry("Deploying multi-agent swarm to cross-reference all historical diaries vs approved quotes.");
        
        try {
            const res = await api.post('/sentinel/deep-scan', { projectId: selectedProjectId });
            addTelemetry("DEEP SCAN COMPLETE.", "success");
            if (res.data?.result?.totalRevenueUnlocked > 0) {
                addTelemetry(`MASSIVE LEAKAGE DETECTED: $${res.data.result.totalRevenueUnlocked.toLocaleString()}`, "success");
                addTelemetry(`Diaries Scanned: ${res.data.result.diariesScanned} | Anomalies Found: ${res.data.result.newLeakageFound}`);
            } else {
                addTelemetry(`Diaries Scanned: ${res.data.result?.diariesScanned || 0}. No historical leakage found.`);
            }
            fetchData();
        } catch (e) {
            addTelemetry("Deep Scan Failed: " + (e.response?.data?.error || e.message), "error");
        } finally {
            setDeepScanning(false);
            setTimeout(() => setTelemetry([]), 15000);
        }
    };

    const handleClaim = async (alertId) => {
        try {
            const res = await api.post('/sentinel/create-variation', { alertId });
            setIsOpen(false);
            // Navigate to Invoice Builder with pre-filled state
            navigate(res.data.redirect, { state: { invoiceData: res.data.variation, mode: 'variation' } });
        } catch (e) {
            alert("Failed to initialize variation.");
        }
    };

    const handleDismiss = async (alertId) => {
        try {
            await api.delete(`/sentinel/alerts/${alertId}`);
            setAlerts(prev => prev.filter(a => a.id !== alertId));
        } catch (e) {
            console.error("Dismiss failed", e);
        }
    };

    const handleDeleteHistory = async (id) => {
        try {
            await api.delete(`/sentinel/alerts/${id}`);
            setHistory(prev => prev.filter(h => h.id !== id));
        } catch (e) { console.error(e); }
    };

    const handleClearLog = async () => {
        if (!confirm("Clear all items from the recovery log? This is irreversible.")) return;
        try {
            await api.delete('/sentinel/history/clear');
            setHistory([]);
            addNotification('Log Cleared', 'success');
        } catch (e) { console.error(e); }
    };

    // Group history by month
    const groupedHistory = history.reduce((acc, item) => {
        const month = new Date(item.updatedAt).toLocaleString('default', { month: 'long', year: 'numeric' });
        if (!acc[month]) acc[month] = [];
        acc[month].push(item);
        return acc;
    }, {});

    // --- ANIMATION VARIANTS ---
    const badgeVariants = {
        idle: { scale: 1 },
        alert: { scale: [1, 1.1, 1], transition: { repeat: Infinity, duration: 2 } }
    };

    return (
        <>
            {/* PERSISTENT BADGE */}
            <motion.div 
                className="fixed bottom-6 left-6 z-50 cursor-pointer group"
                variants={badgeVariants}
                animate={alerts.length > 0 ? "alert" : "idle"}
                onClick={() => setIsOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl backdrop-blur-xl border transition-all shadow-2xl ${
                    alerts.length > 0 
                    ? 'bg-rose-950/90 border-rose-500/50 shadow-rose-900/20' 
                    : 'bg-stone-900/90 border-emerald-500/30 shadow-emerald-900/10'
                }`}>
                    <div className="relative">
                        <div className={`p-2 rounded-xl ${alerts.length > 0 ? 'bg-rose-600' : 'bg-emerald-600/20'}`}>
                            {alerts.length > 0 ? <ShieldAlert size={20} className="text-white" /> : <Radar size={20} className="text-emerald-400" />}
                        </div>
                        {alerts.length > 0 && (
                            <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-rose-600 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-rose-600">
                                {alerts.length}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sentinel Engine</span>
                        <span className={`text-xs font-bold ${alerts.length > 0 ? 'text-white' : 'text-emerald-400'}`}>
                            {alerts.length > 0 ? `${alerts.length} Threats Detected` : 'Sector Secure'}
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* COMMAND CENTER MODAL */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-4xl bg-[#0a0a0c] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                        >
                            {/* HEADER */}
                            <div className="p-6 border-b border-white/10 bg-stone-900/50 flex justify-between items-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-rose-500/5 pointer-events-none" />
                                <div className="relative z-10 flex items-center gap-4">
                                    <div className="p-3 bg-stone-800 rounded-xl border border-white/5">
                                        <Radar size={24} className="text-emerald-400 animate-spin-slow" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Sentinel Command</h2>
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            System Online • Monitoring Active
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-3 py-1 mr-4">
                                        <select 
                                            value={selectedProjectId}
                                            onChange={(e) => setSelectedProjectId(e.target.value)}
                                            className="bg-transparent text-[10px] font-black uppercase text-gray-400 border-none focus:ring-0 cursor-pointer"
                                        >
                                            {projects.map(p => (
                                                <option key={p.id} value={p.id} className="bg-stone-900 text-white">{p.name || 'Untitled Project'}</option>
                                            ))}
                                        </select>
                                        <button 
                                            onClick={handleDeepScan}
                                            disabled={deepScanning || !selectedProjectId}
                                            className="flex items-center gap-2 px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg transition-all text-[9px] font-black uppercase tracking-widest border border-emerald-500/30"
                                        >
                                            {deepScanning ? <Activity size={10} className="animate-spin" /> : <Radar size={10} />}
                                            {deepScanning ? 'Auditing...' : 'Deep Scan'}
                                        </button>
                                    </div>
                                    <button 
                                        onClick={handleForceScan} 
                                        disabled={scanning || !latestDiaryId}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-900/20 flex items-center gap-2"
                                    >
                                        {scanning ? <Activity size={14} className="animate-spin" /> : <Radar size={14} />}
                                        {scanning ? 'Scanning...' : 'Manual Scan'}
                                    </button>
                                    <button onClick={() => setIsOpen(false)} className="p-2 text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all">
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* STATS BAR */}
                            <div className="grid grid-cols-2 divide-x divide-white/5 bg-black/20 border-b border-white/5">
                                <div className="p-6 flex flex-col items-center justify-center text-center">
                                    <span className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Total Recovered</span>
                                    <div className="text-3xl font-black text-emerald-400 flex items-center gap-1">
                                        <DollarSign size={20} className="text-emerald-600" />
                                        {(stats?.totalRecovered || 0).toLocaleString()}
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col items-center justify-center text-center">
                                    <span className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Pending Actions</span>
                                    <div className="text-3xl font-black text-rose-400 flex items-center gap-1">
                                        <AlertTriangle size={20} className="text-rose-600" />
                                        {alerts.length}
                                    </div>
                                </div>
                            </div>

                            {/* TABS & CONTENT */}
                            <div className="flex-1 flex flex-col overflow-hidden bg-stone-950">
                                <div className="flex border-b border-white/5 justify-between items-center bg-black/40 pr-4">
                                    <div className="flex">
                                        <button 
                                            onClick={() => setActiveTab('active')}
                                            className={`px-8 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'active' ? 'bg-rose-500/10 text-rose-400 border-b-2 border-rose-500' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                                        >
                                            Active Threats ({alerts.length})
                                        </button>
                                        <button 
                                            onClick={() => setActiveTab('history')}
                                            className={`px-8 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-emerald-500/10 text-emerald-400 border-b-2 border-emerald-500' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                                        >
                                            Recovery Log ({history.length})
                                        </button>
                                    </div>
                                    {activeTab === 'history' && history.length > 0 && (
                                        <button onClick={handleClearLog} className="flex items-center gap-2 text-[10px] font-black text-gray-500 hover:text-rose-400 transition-colors uppercase tracking-widest">
                                            <Trash2 size={12} /> Clear Stream
                                        </button>
                                    )}
                                </div>

                                {/* LIVE TELEMETRY DISPLAY */}
                                <AnimatePresence>
                                    {(scanning || deepScanning || telemetry.length > 0) && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="bg-black/80 border-b border-indigo-500/20 max-h-48 overflow-y-auto custom-scrollbar font-mono text-[10px]"
                                        >
                                            <div className="p-4 space-y-1">
                                                {telemetry.map((t) => (
                                                    <div key={t.id} className="flex gap-3 items-start">
                                                        <span className="text-gray-600 shrink-0">[{t.time}]</span>
                                                        <span className={`
                                                            ${t.type === 'warn' ? 'text-amber-400' : ''}
                                                            ${t.type === 'success' ? 'text-emerald-400' : ''}
                                                            ${t.type === 'error' ? 'text-rose-400 font-bold' : ''}
                                                            ${t.type === 'info' ? 'text-indigo-300' : ''}
                                                        `}>
                                                            {t.msg}
                                                        </span>
                                                    </div>
                                                ))}
                                                <div ref={telemetryEndRef} />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4">
                                    {activeTab === 'active' ? (
                                        alerts.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                                                <ShieldAlert size={64} className="mb-4 text-emerald-500" />
                                                <p className="text-lg font-bold uppercase tracking-widest">No Active Threats</p>
                                                <p className="text-xs">Your revenue streams are secure.</p>
                                            </div>
                                        ) : (
                                            alerts.map(alert => (
                                                <motion.div 
                                                    key={alert.id}
                                                    layout
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="bg-stone-900 border border-rose-500/30 p-5 rounded-2xl flex gap-6 group hover:border-rose-500/60 transition-all shadow-lg shadow-rose-900/5 relative overflow-hidden"
                                                >
                                                    <div className="absolute top-0 right-0 p-2 bg-rose-500/10 rounded-bl-2xl text-[10px] font-black text-rose-400 uppercase tracking-widest">
                                                        Revenue Leakage
                                                    </div>
                                                    <div className="p-4 bg-rose-500/10 rounded-xl flex items-center justify-center h-fit">
                                                        <ShieldAlert size={32} className="text-rose-500 animate-pulse" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between mb-2">
                                                            <div className="text-xs font-bold text-gray-500 uppercase">{new Date(alert.createdAt).toLocaleDateString()} • {new Date(alert.createdAt).toLocaleTimeString()}</div>
                                                        </div>
                                                        <h3 className="text-lg font-bold text-white mb-2">{alert.message}</h3>
                                                        <div className="bg-black/30 p-4 rounded-xl border border-white/5 mb-4 space-y-3 shadow-inner">
                                                            <div className="flex justify-between items-start">
                                                                <div className="text-sm text-gray-300 font-medium">
                                                                    Detected via Forensic Analysis: <span className="text-white font-bold">"{alert.data?.projectName || 'Project Unknown'}"</span>
                                                                </div>
                                                                {alert.data?.accuracyScore && (
                                                                    <div className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                                                                        {alert.data.accuracyScore}% ACCURACY
                                                                    </div>
                                                                )}
                                                            </div>
                                                            
                                                            {/* DETECTED ITEMS LIST */}
                                                            <div className="space-y-2">
                                                                {alert.data?.detectedItems?.map((item, idx) => (
                                                                    <div key={idx} className="bg-white/5 p-3 rounded-lg border border-white/5 flex flex-col gap-2">
                                                                        <div className="flex justify-between items-center">
                                                                            <span className="text-xs font-bold text-white">{item.description}</span>
                                                                            <span className="text-xs font-black text-rose-400 font-mono">+${item.estimatedCost?.toLocaleString()}</span>
                                                                        </div>
                                                                        <div className="text-[10px] text-gray-500 italic">" {item.reason} "</div>
                                                                        
                                                                        {/* FINANCIAL BREAKDOWN */}
                                                                        {item.breakdown && (
                                                                            <div className="flex gap-4 pt-1 border-t border-white/5 mt-1">
                                                                                <div className="flex flex-col">
                                                                                    <span className="text-[9px] text-gray-600 font-black uppercase">Labor</span>
                                                                                    <span className="text-[10px] text-gray-400 font-bold font-mono">${item.breakdown.labor}</span>
                                                                                </div>
                                                                                <div className="flex flex-col">
                                                                                    <span className="text-[9px] text-gray-600 font-black uppercase">Material</span>
                                                                                    <span className="text-[10px] text-gray-400 font-bold font-mono">${item.breakdown.materials}</span>
                                                                                </div>
                                                                                {item.isoCitation && (
                                                                                    <div className="ml-auto flex items-center gap-1.5 px-2 bg-indigo-500/10 border border-indigo-500/20 rounded-md">
                                                                                        <Radar size={10} className="text-indigo-400" />
                                                                                        <span className="text-[9px] font-black text-indigo-400 uppercase">{item.isoCitation}</span>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            
                                                            {alert.data?.summary && (
                                                                <div className="text-xs text-indigo-300 bg-indigo-950/20 p-3 rounded-lg border border-indigo-500/10 italic">
                                                                    <span className="font-black uppercase text-[9px] block mb-1 tracking-widest text-indigo-400 opacity-60">Sentinel Intelligence Report</span>
                                                                    {alert.data.summary}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-3">
                                                            <button 
                                                                onClick={() => handleClaim(alert.id)}
                                                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all"
                                                            >
                                                                <DollarSign size={16} /> Recover Revenue (${(alert.data?.totalPotentialRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })})
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDismiss(alert.id)}
                                                                className="px-6 bg-stone-800 hover:bg-stone-700 text-gray-400 hover:text-white rounded-xl font-bold uppercase tracking-wider text-xs transition-all"
                                                            >
                                                                Dismiss
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))
                                        )
                                    ) : (
                                        history.length === 0 ? (
                                            <div className="text-center text-gray-500 py-20">No recovery history found.</div>
                                        ) : (
                                            Object.entries(groupedHistory).map(([month, items]) => (
                                                <div key={month} className="space-y-3">
                                                    <div className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] sticky top-0 bg-stone-950 py-2 z-10">{month}</div>
                                                    {items.map(item => (
                                                        <div key={item.id} className="bg-stone-900 border border-white/5 p-4 rounded-xl flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                                                            <div className="flex items-center gap-4">
                                                                <div className="p-2 bg-emerald-500/10 rounded-lg">
                                                                    <CheckCircle size={20} className="text-emerald-500" />
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-bold text-white">{item.message}</div>
                                                                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{new Date(item.updatedAt).toLocaleDateString()}</div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-6">
                                                                <div className="text-emerald-400 font-bold font-mono">
                                                                    +${item.data?.totalPotentialRevenue || '0'}
                                                                </div>
                                                                <button onClick={() => handleDeleteHistory(item.id)} className="p-2 text-gray-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ))
                                        )
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default SentinelDashboard;