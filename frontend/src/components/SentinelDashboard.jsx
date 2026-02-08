import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, DollarSign, ArrowRight, CheckCircle, X, Activity, History, Radar, TrendingUp, AlertTriangle } from 'lucide-react';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const SentinelDashboard = () => {
    const [alerts, setAlerts] = useState([]);
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState({ totalRecovered: 0, pendingRevenue: 0, leaksDetected: 0 });
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [alertsRes, historyRes, statsRes] = await Promise.all([
                api.get('/sentinel/alerts'),
                api.get('/sentinel/history'),
                api.get('/sentinel/stats')
            ]);
            setAlerts(Array.isArray(alertsRes.data) ? alertsRes.data : []);
            setHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
            setStats(statsRes.data || { totalRecovered: 0, pendingRevenue: 0 });
        } catch (e) {
            console.error("Sentinel Offline:", e);
        } finally {
            setLoading(false);
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
        // Optimistic update
        setAlerts(prev => prev.filter(a => a.id !== alertId));
        // TODO: Call backend dismiss endpoint if strictly needed, or just rely on read status later
    };

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
                                <button onClick={() => setIsOpen(false)} className="p-2 text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all">
                                    <X size={24} />
                                </button>
                            </div>

                            {/* STATS BAR */}
                            <div className="grid grid-cols-3 divide-x divide-white/5 bg-black/20 border-b border-white/5">
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
                                <div className="p-6 flex flex-col items-center justify-center text-center">
                                    <span className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">AI Accuracy</span>
                                    <div className="text-3xl font-black text-indigo-400 flex items-center gap-1">
                                        <Activity size={20} className="text-indigo-600" />
                                        98%
                                    </div>
                                </div>
                            </div>

                            {/* TABS & CONTENT */}
                            <div className="flex-1 flex flex-col overflow-hidden bg-stone-950">
                                <div className="flex border-b border-white/5">
                                    <button 
                                        onClick={() => setActiveTab('active')}
                                        className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'active' ? 'bg-rose-500/10 text-rose-400 border-b-2 border-rose-500' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                                    >
                                        Active Threats ({alerts.length})
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('history')}
                                        className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-emerald-500/10 text-emerald-400 border-b-2 border-emerald-500' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                                    >
                                        Recovery Log
                                    </button>
                                </div>

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
                                                        <div className="bg-black/30 p-3 rounded-lg border border-white/5 mb-4 text-sm text-gray-300 font-mono">
                                                            Detected via Diary Analysis: "{alert.data?.projectName || 'Project Unknown'}"
                                                        </div>
                                                        <div className="flex gap-3">
                                                            <button 
                                                                onClick={() => handleClaim(alert.id)}
                                                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold uppercase tracking-wider text-xs shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all"
                                                            >
                                                                <DollarSign size={16} /> Recover Revenue (${alert.data?.totalPotentialRevenue || '0'})
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
                                            history.map(item => (
                                                <div key={item.id} className="bg-stone-900 border border-white/5 p-4 rounded-xl flex items-center justify-between opacity-75 hover:opacity-100 transition-opacity">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                                                            <CheckCircle size={20} className="text-emerald-500" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-white">{item.message}</div>
                                                            <div className="text-xs text-gray-500">{new Date(item.updatedAt).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-emerald-400 font-bold font-mono">
                                                        +${item.data?.totalPotentialRevenue || '0'}
                                                    </div>
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