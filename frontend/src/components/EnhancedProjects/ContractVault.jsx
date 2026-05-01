import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Shield, Search, Upload, CheckCircle, AlertTriangle, Scale, Lock, Eye, DollarSign, Wrench, X } from 'lucide-react';
import { api } from '../../utils/api';

const ContractVault = ({ projectId }) => {
    const [contracts, setContracts] = useState([]);
    const [analyzing, setAnalyzing] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [contractText, setContractText] = useState(''); // Simple text paste for V1
    const [selectedContract, setSelectedContract] = useState(null);

    useEffect(() => {
        if (projectId) fetchContracts();
    }, [projectId]);

    const fetchContracts = async () => {
        try {
            const res = await api.get(`/contracts?projectId=${projectId}`);
            setContracts(res.data);
            if (res.data.length > 0) setSelectedContract(res.data[0]);
        } catch (e) { console.error(e); }
    };

    const handleAnalyze = async () => {
        if (!contractText) return;
        setAnalyzing(true);
        try {
            // Simulate "Scanning" delay for effect if API is fast
            await new Promise(r => setTimeout(r, 1500));
            
            const res = await api.post('/contracts', {
                projectId,
                title: `Contract Scan ${new Date().toLocaleDateString()}`,
                text: contractText,
                fileUrl: null // Placeholder
            });
            
            setContracts(prev => [res.data, ...prev]);
            setSelectedContract(res.data);
            setShowUpload(false);
            setContractText('');
        } catch (e) {
            alert("Analysis Failed: " + e.message);
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-black/20 rounded-3xl border border-white/5 overflow-hidden">
            {/* TOOLBAR */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-stone-900/50">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                        <Scale size={20} className="text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">Ironclad Vault</h2>
                        <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest">Legal Intelligence Layer</p>
                    </div>
                </div>
                <button 
                    onClick={() => setShowUpload(true)}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-900/20 flex items-center gap-2 transition-all"
                >
                    <Upload size={16} /> Ingest Contract
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* SIDEBAR LIST */}
                <div className="w-72 border-r border-white/5 bg-stone-900/30 p-4 flex flex-col gap-3 overflow-y-auto">
                    {(!Array.isArray(contracts) || contracts.length === 0) && <div className="text-center text-gray-500 py-10 text-xs uppercase">No Contracts Secured</div>}
                    {Array.isArray(contracts) && contracts.map(c => (
                        <div 
                            key={c.id} 
                            onClick={() => setSelectedContract(c)}
                            className={`p-4 rounded-xl cursor-pointer border transition-all ${
                                selectedContract?.id === c.id 
                                ? 'bg-indigo-500/10 border-indigo-500/50 shadow-lg' 
                                : 'bg-white/5 border-transparent hover:bg-white/10'
                            }`}
                        >
                            <div className="font-bold text-white text-sm mb-1">{c.title}</div>
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${c.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'}`} />
                                <span className="text-[10px] text-gray-400 uppercase tracking-wider">{c.status}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* MAIN VISUALIZATION */}
                <div className="flex-1 overflow-y-auto p-8 relative bg-[#050505]">
                    {/* BACKGROUND GRID */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                    
                    {selectedContract ? (
                        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
                            {/* STATUS HEADER */}
                            <div className="flex items-center justify-between">
                                <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Rules of Engagement</h1>
                                <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                    <Shield size={14} /> Active Enforcement
                                </div>
                            </div>

                            {/* KEY TERMS MATRIX */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Retention', value: `${selectedContract.intelligence?.retentionPercent || 0}%`, icon: Lock },
                                    { label: 'Defect Period', value: `${selectedContract.intelligence?.defectPeriod || 12} Mths`, icon: Wrench },
                                    { label: 'Payment Terms', value: selectedContract.intelligence?.paymentTerms || 'N/A', icon: DollarSign },
                                    { label: 'LDs / Day', value: `$${selectedContract.intelligence?.liquidatedDamages || '0'}`, icon: AlertTriangle, color: 'text-rose-400' },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-stone-900/80 backdrop-blur-xl border border-white/10 p-5 rounded-2xl">
                                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <stat.icon size={12} /> {stat.label}
                                        </div>
                                        <div className={`text-2xl font-black ${stat.color || 'text-white'} font-mono`}>{stat.value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* SCOPE & EXCLUSIONS */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-stone-900/50 border border-emerald-500/20 rounded-3xl p-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10"><CheckCircle size={100} /></div>
                                    <h3 className="text-sm font-black text-emerald-400 uppercase tracking-widest mb-6 relative z-10">In Scope (Core Works)</h3>
                                    <ul className="space-y-3 relative z-10">
                                        {Array.isArray(selectedContract.intelligence?.inclusions) && selectedContract.intelligence.inclusions.map((inc, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                                                <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                                                {inc}
                                            </li>
                                        ))}
                                        {(!selectedContract.intelligence?.inclusions || selectedContract.intelligence.inclusions.length === 0) && <li className="text-gray-600 italic">No explicit inclusions found.</li>}
                                    </ul>
                                </div>

                                <div className="bg-stone-900/50 border border-rose-500/20 rounded-3xl p-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10"><AlertTriangle size={100} /></div>
                                    <h3 className="text-sm font-black text-rose-400 uppercase tracking-widest mb-6 relative z-10">Exclusions (Variations)</h3>
                                    <ul className="space-y-3 relative z-10">
                                        {Array.isArray(selectedContract.intelligence?.exclusions) && selectedContract.intelligence.exclusions.map((exc, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                                                <X size={16} className="text-rose-500 mt-0.5 shrink-0" />
                                                {exc}
                                            </li>
                                        ))}
                                        {(!selectedContract.intelligence?.exclusions || selectedContract.intelligence.exclusions.length === 0) && <li className="text-gray-600 italic">No explicit exclusions found.</li>}
                                    </ul>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
                            <Shield size={64} className="mb-4" />
                            <p className="text-lg font-bold uppercase tracking-widest">Secure Vault Locked</p>
                            <p className="text-xs">Select or ingest a contract to view intelligence.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* UPLOAD MODAL */}
            <AnimatePresence>
                {showUpload && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-2xl bg-stone-900 border border-white/10 rounded-3xl p-8 relative overflow-hidden"
                        >
                            <button onClick={() => setShowUpload(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X /></button>
                            
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Ingest New Contract</h2>
                            <p className="text-sm text-gray-400 mb-8">Paste the raw text of your contract below. Our Neural Engine will extract the legal parameters.</p>

                            {analyzing ? (
                                <div className="py-20 text-center space-y-6">
                                    <div className="flex justify-center">
                                        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                    <div className="text-indigo-400 font-mono text-xs uppercase tracking-widest animate-pulse">
                                        Analyzing Clauses... Extracting Risk Profile...
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <textarea 
                                        className="w-full h-64 bg-black/30 border border-white/10 rounded-xl p-4 text-sm text-gray-300 font-mono outline-none focus:border-indigo-500 transition-colors resize-none"
                                        placeholder="Paste contract text here..."
                                        value={contractText}
                                        onChange={(e) => setContractText(e.target.value)}
                                    />
                                    <button 
                                        onClick={handleAnalyze}
                                        disabled={!contractText.trim()}
                                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold uppercase tracking-widest text-sm shadow-lg shadow-indigo-900/20 transition-all"
                                    >
                                        Initiate Neural Scan
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ContractVault;
