import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Shield, Search, Filter, Clock, User, 
    Database, Activity, ChevronRight, X, 
    Download, RefreshCcw, Eye, ArrowRight, 
    Lock, FileText, CheckCircle, Trash2, Cpu
} from 'lucide-react';
import { api } from '../utils/api';

const AuditUltraLog = () => {
    const [logs, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [selectedLog, setSelectedLog] = useState(null);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/reports/search?type=AUDIT&query=${searchTerm}`);
            setNotifications(res.data.data || []);
        } catch (e) {
            console.error("Failed to fetch audit stream", e);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLogs();
    }, [searchTerm]);

    const filteredLogs = useMemo(() => {
        if (filterType === 'ALL') return logs;
        return logs.filter(l => l.subType.includes(filterType));
    }, [logs, filterType]);

    const getActionColor = (action) => {
        if (action.includes('CREATE')) return 'text-emerald-400 bg-emerald-500/10';
        if (action.includes('UPDATE')) return 'text-indigo-400 bg-indigo-500/10';
        if (action.includes('DELETE')) return 'text-rose-400 bg-rose-500/10';
        return 'text-slate-400 bg-slate-500/10';
    };

    return (
        <div className="flex flex-col h-full bg-[#0a0a0c] text-white p-8 animate-fade-in font-sans">
            {/* Header */}
            <div className="flex justify-between items-end mb-10">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-600/20 rounded-lg border border-indigo-500/30">
                            <Shield size={24} className="text-indigo-400" />
                        </div>
                        <h1 className="text-4xl font-black uppercase tracking-widest italic">Audit Ultra Log</h1>
                    </div>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Sovereign Archive // Protocol Traceability Active
                    </p>
                </div>
                <div className="flex gap-4">
                    <button onClick={fetchLogs} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-gray-400">
                        <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button className="flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-900/40 transition-all">
                        <Download size={18} /> Export Archive
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
                <div className="lg:col-span-2 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search specific entity ID or action..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm focus:border-indigo-500 outline-none transition-all placeholder-gray-700 font-bold"
                    />
                </div>
                <select 
                    value={filterType}
                    onChange={e => setFilterType(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-gray-400 focus:border-indigo-500 outline-none appearance-none cursor-pointer"
                >
                    <option value="ALL">All Actions</option>
                    <option value="CREATE">Creation Only</option>
                    <option value="UPDATE">Updates Only</option>
                    <option value="DELETE">Deletions Only</option>
                </select>
                <div className="flex items-center justify-center bg-indigo-500/5 border border-indigo-500/10 rounded-2xl px-6 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                    {filteredLogs.length} Events Logged
                </div>
            </div>

            {/* Main Stream */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                {loading ? (
                    <div className="h-64 flex flex-col items-center justify-center opacity-30">
                        <Cpu size={48} className="animate-spin mb-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Reconstructing Timeline...</span>
                    </div>
                ) : (
                    filteredLogs.map(log => (
                        <motion.div 
                            key={log.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="group relative bg-white/[0.02] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.04] hover:border-indigo-500/30 transition-all cursor-pointer overflow-hidden shadow-xl"
                            onClick={() => setSelectedLog(log)}
                        >
                            <div className="flex items-center gap-6 relative z-10">
                                <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${getActionColor(log.subType)}`}>
                                    {log.subType}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-black text-gray-200 truncate uppercase tracking-tighter">{log.title}</h3>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{log.subtitle}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-mono text-indigo-400 font-black mb-1">{new Date(log.date).toLocaleTimeString()}</div>
                                    <div className="text-[8px] text-gray-600 font-bold uppercase">{new Date(log.date).toLocaleDateString()}</div>
                                </div>
                                <div className="p-2 text-gray-700 group-hover:text-white transition-colors">
                                    <ChevronRight size={20} />
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Detail Side-panel / Modal */}
            <AnimatePresence>
                {selectedLog && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
                        onClick={() => setSelectedLog(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="bg-stone-950 border border-white/10 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-gradient-to-b from-white/5 to-transparent">
                                <div>
                                    <h3 className="text-2xl font-black text-indigo-400 uppercase tracking-widest">{selectedLog.subType}</h3>
                                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Transaction Identity: {selectedLog.id.slice(0,12)}</p>
                                </div>
                                <button onClick={() => setSelectedLog(null)} className="p-3 hover:bg-white/10 rounded-full transition-all text-gray-500 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest block mb-2">Timestamp</span>
                                        <span className="text-sm font-mono font-bold text-white">{new Date(selectedLog.date).toLocaleString()}</span>
                                    </div>
                                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                                        <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest block mb-2">Actor</span>
                                        <span className="text-sm font-bold text-indigo-400">{selectedLog.subtitle.split('|')[0].replace('Actor: ','')}</span>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                                        <Database size={14} /> Structural State Data
                                    </h4>
                                    
                                    {selectedLog.subType === 'AI_REASONING_TRACE' && (
                                        <div className="mb-6 p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-3xl">
                                            <div className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <Cpu size={10} /> Neural Context Snapshot (What the AI saw)
                                            </div>
                                            <div className="text-[10px] text-indigo-200/60 font-mono leading-relaxed whitespace-pre-wrap italic">
                                                {selectedLog.details?.context_snapshot}
                                            </div>
                                        </div>
                                    )}

                                    <pre className="bg-black/60 border border-white/10 p-8 rounded-3xl text-xs font-mono text-emerald-400/80 overflow-x-auto">
                                        {JSON.stringify(selectedLog.details, null, 2)}
                                    </pre>
                                </div>
                            </div>
                            <div className="p-8 border-t border-white/5 bg-black/40 text-center">
                                <button onClick={() => setSelectedLog(null)} className="px-12 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all">Close Transaction View</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AuditUltraLog;