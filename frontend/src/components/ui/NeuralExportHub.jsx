import React, { useState, useEffect } from 'react';
import { 
    Download, Calendar, Filter, FileText, 
    Sparkles, Loader2, X, Briefcase, User, 
    ArrowRight, CheckCircle, Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../utils/api';

const NeuralExportHub = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState([]);
    const [clients, setClients] = useState([]);
    const [filters, setFilters] = useState({
        projectId: '',
        clientId: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        if (isOpen) {
            // Fetch projects and clients for filtering
            api.get('/projects').then(res => setProjects(res.data.data || res.data || []));
            api.get('/clients').then(res => setClients(res.data || []));
        }
    }, [isOpen]);

    const handleExport = async () => {
        setLoading(true);
        try {
            const res = await api.post('/manifest/global-export', filters, { responseType: 'blob' });
            
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Neural_Lattice_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            
            setLoading(false);
            onClose();
        } catch (e) {
            console.error("Export Error", e);
            alert("Neural Export Failed. Check connection.");
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#0a0a0c] border border-white/10 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden relative"
            >
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                
                {/* Header */}
                <div className="p-10 border-b border-white/5 relative z-10">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4">
                                <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/20">
                                    <Database size={32} />
                                </div>
                                NEURAL EXPORT
                            </h2>
                            <p className="text-gray-500 text-sm mt-3 font-bold uppercase tracking-[0.3em] flex items-center gap-2">
                                <Sparkles size={14} className="text-indigo-400" /> High-Fidelity Data Extraction
                            </p>
                        </div>
                        <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl text-gray-500 hover:text-white transition-all">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="p-10 space-y-8 relative z-10">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                <Briefcase size={12} /> Project Filter
                            </label>
                            <select 
                                value={filters.projectId}
                                onChange={e => setFilters({...filters, projectId: e.target.value})}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-indigo-500 outline-none transition-all cursor-pointer"
                            >
                                <option value="">All Projects</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                <User size={12} /> Client Filter
                            </label>
                            <select 
                                value={filters.clientId}
                                onChange={e => setFilters({...filters, clientId: e.target.value})}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-indigo-500 outline-none transition-all cursor-pointer"
                            >
                                <option value="">All Clients</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                            <Calendar size={12} /> Temporal Range
                        </label>
                        <div className="grid grid-cols-2 gap-6 items-center">
                            <input 
                                type="date" 
                                value={filters.startDate}
                                onChange={e => setFilters({...filters, startDate: e.target.value})}
                                className="bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-indigo-500 outline-none transition-all"
                            />
                            <div className="flex items-center gap-4">
                                <ArrowRight size={16} className="text-gray-700" />
                                <input 
                                    type="date" 
                                    value={filters.endDate}
                                    onChange={e => setFilters({...filters, endDate: e.target.value})}
                                    className="bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-indigo-500 outline-none transition-all w-full"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/5 rounded-3xl p-6 flex items-start gap-4">
                        <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 mt-1">
                            <CheckCircle size={18} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-gray-200 uppercase tracking-wide">Ready for Synthesis</h4>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                This will generate an interactive multi-sheet workbook including an Executive Dashboard, 
                                a filterable Financial Lattice, and a Pro-forma Invoice generator.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer / Actions */}
                <div className="p-10 border-t border-white/5 bg-black/40 flex gap-4">
                    <button 
                        onClick={onClose}
                        className="flex-1 py-5 text-gray-500 font-black text-xs uppercase tracking-[0.2em] hover:text-white transition-all"
                    >
                        Abort
                    </button>
                    <button 
                        onClick={handleExport}
                        disabled={loading}
                        className="flex-[2] py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-900/20 flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
                        {loading ? 'Synthesizing...' : 'Generate High-Fidelity Export'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default NeuralExportHub;
