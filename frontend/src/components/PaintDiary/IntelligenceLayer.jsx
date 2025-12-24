/*
 * MasterDiaryOS - Intelligence Layer V1 (Additive Intelligence)
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Sparkles, AlertTriangle, ArrowRight, Clock, Target, 
    CheckCircle2, Info, Loader2, BarChart3, ListChecks,
    TrendingUp, ShieldAlert, Cpu, FileDown, Save, Check, FileText,
    ClipboardList
} from 'lucide-react';
import { api } from '../../utils/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const IntelligenceLayer = ({ diaryData, active }) => {
    const [intel, setIntel] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(null); // 'executive' | 'risk' | 'velocity' | 'finance'
    const [error, setError] = useState(false);
    const [activeTab, setActiveTab] = useState('command'); // command | timeline | strategy | audit

    console.log("[IntelligenceLayer] Active:", active, "Data:", diaryData);

    const fetchIntelligence = async () => {
        if (!diaryData) {
            console.warn("[IntelligenceLayer] No diary data provided.");
            return;
        }
        setLoading(true);
        setError(false);
        try {
            console.log("[IntelligenceLayer] Fetching interpretative insights...");
            const res = await api.post('/ai/analyze-intelligence', { diaryData });
            console.log("[IntelligenceLayer] Insights Received:", res.data);
            setIntel(res.data);
        } catch (err) {
            console.error("[IntelligenceLayer] Fetch Failed:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (active && !intel && !loading) {
            fetchIntelligence();
        }
    }, [active, diaryData, intel, loading]);

    if (!active) return null;

    const { narrative, anomalies = [], next_actions = [], timeline = [], meta = {} } = intel || {};

    const REPORT_TYPES = {
        executive: { 
            name: 'Executive Briefing', 
            icon: BarChart3, 
            color: '#6366f1',
            subtitle: '// NEURAL STRATEGIC OVERVIEW'
        },
        risk: { 
            name: 'Risk & Anomaly Audit', 
            icon: ShieldAlert, 
            color: '#f43f5e',
            subtitle: '// FORENSIC EXCEPTION REPORT'
        },
        velocity: { 
            name: 'Production Velocity', 
            icon: TrendingUp, 
            color: '#10b981',
            subtitle: '// OPERATIONAL PERFORMANCE METRICS'
        },
        finance: { 
            name: 'Financial Forensics', 
            icon: Target, 
            color: '#f59e0b',
            subtitle: '// COST BURN & MARGIN RECOVERY'
        }
    };

    const generateIntelligencePDF = (type = 'executive', shouldDownload = true) => {
        const doc = new jsPDF();
        const cfg = REPORT_TYPES[type];
        const primaryColor = type === 'executive' ? [99, 102, 241] : 
                           type === 'risk' ? [244, 63, 94] : 
                           type === 'velocity' ? [16, 185, 129] : [245, 158, 11];
        
        const darkColor = [10, 10, 12];
        const grayColor = [100, 116, 139];

        // --- 1. PREMIUM SIDEBAR (BLUEPRINT STYLE) ---
        doc.setFillColor(...darkColor);
        doc.rect(0, 0, 60, 297, 'F');
        
        // Sidebar Content
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("MASTERDIARY", 10, 20);
        doc.setFontSize(18);
        doc.setTextColor(...primaryColor);
        doc.text("OPERATING OS", 10, 28);

        doc.setDrawColor(...primaryColor);
        doc.setLineWidth(0.5);
        doc.line(10, 35, 50, 35);

        // Sidebar Metrics
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text("REPORT_TYPE", 10, 50);
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text(cfg.name.toUpperCase(), 10, 56);

        doc.setTextColor(150, 150, 150);
        doc.setFontSize(8);
        doc.text("TIMESTAMP", 10, 70);
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.text(new Date().toLocaleDateString(), 10, 76);

        doc.setTextColor(150, 150, 150);
        doc.setFontSize(8);
        doc.text("ENGINE_CORE", 10, 90);
        doc.setTextColor(255, 255, 255);
        doc.text("INTEL_LAYER_V1.PRO", 10, 96);

        // Confidence Indicator
        doc.setFillColor(30, 30, 35);
        doc.roundedRect(8, 260, 44, 25, 3, 3, 'F');
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(7);
        doc.text("AI_CONFIDENCE", 12, 268);
        doc.setTextColor(...primaryColor);
        doc.setFontSize(12);
        doc.text(meta.confidence?.toUpperCase() || "HIGH", 12, 278);

        // --- 2. MAIN CONTENT AREA ---
        const startX = 70;
        
        // Header Text
        doc.setTextColor(...darkColor);
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.text(diaryData?.job_metadata?.projectName || 'Project Intelligence', startX, 25);
        
        doc.setFontSize(10);
        doc.setTextColor(...grayColor);
        doc.setFont("helvetica", "normal");
        doc.text(`Site Status: ${diaryData?.job_metadata?.projectStatus || 'Operational'}`, startX, 32);

        // A. STRATEGIC OUTLOOK
        doc.setDrawColor(230, 230, 235);
        doc.line(startX, 45, 200, 45);
        
        doc.setTextColor(...primaryColor);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("01 // STRATEGIC OUTLOOK", startX, 55);
        
        doc.setTextColor(...darkColor);
        doc.setFontSize(11);
        doc.setFont("helvetica", "italic");
        const outlookText = doc.splitTextToSize(intel?.strategic_outlook || "Analyzing temporal trajectory...", 125);
        doc.text(outlookText, startX, 65);

        // B. EXECUTIVE NARRATIVE
        let currentY = 85;
        doc.setTextColor(...primaryColor);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("02 // EXECUTIVE INTELLIGENCE NARRATIVE", startX, currentY);
        
        doc.setTextColor(...darkColor);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const narrativeText = doc.splitTextToSize(narrative || "No briefing available.", 125);
        doc.text(narrativeText, startX, currentY + 10);
        currentY += (narrativeText.length * 6) + 20;

        // C. ANOMALY MATRIX
        doc.setTextColor(...primaryColor);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("03 // ANOMALY & VARIANCE MATRIX", startX, currentY);
        
        autoTable(doc, {
            startY: currentY + 5,
            margin: { left: startX },
            tableWidth: 130,
            head: [['Anomaly', 'Impact', 'Priority']],
            body: anomalies.map(a => [a.type, a.description, a.severity.toUpperCase()]),
            headStyles: { fillColor: primaryColor, fontSize: 8, fontStyle: 'bold' },
            styles: { fontSize: 8, cellPadding: 4 },
            columnStyles: { 
                0: { fontStyle: 'bold', cellWidth: 25 },
                1: { cellWidth: 80 }
            }
        });

        currentY = doc.lastAutoTable.finalY + 15;

        // D. TACTICAL ROADMAP
        doc.setTextColor(...primaryColor);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("04 // TACTICAL DECISION ROADMAP", startX, currentY);
        
        doc.setTextColor(...darkColor);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        next_actions.forEach((action, i) => {
            doc.setFillColor(245, 245, 250);
            doc.rect(startX, currentY + 5 + (i * 12), 130, 10, 'F');
            doc.text(`> ${action}`, startX + 5, currentY + 11 + (i * 12));
        });

        if (shouldDownload) {
            doc.save(`Intelligence_${cfg.name.replace(/ /g,'_')}_${new Date().toISOString().split('T')[0]}.pdf`);
        }
        return doc.output('blob');
    };

    const handleSaveToVault = async (type) => {
        setSaving(type);
        try {
            const pdfBlob = generateIntelligencePDF(type, false);
            const formData = new FormData();
            formData.append('file', pdfBlob, `${REPORT_TYPES[type].name}.pdf`);

            // 1. Upload File
            const uploadRes = await api.post('/uploads', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // 2. Create Document Record
            await api.post('/reports/documents', {
                title: `${REPORT_TYPES[type].name}: ${diaryData?.job_metadata?.projectName || 'Site Report'}`,
                type: 'REPORT',
                content: narrative,
                tags: [type.toUpperCase(), 'AI_INSIGHT', diaryData?.job_metadata?.projectName],
                status: 'FINAL',
                relatedModel: 'Project',
                relatedId: diaryData?.job_metadata?.projectId,
                metadata: {
                    fileUrl: uploadRes.data.url,
                    filename: uploadRes.data.filename,
                    confidence: meta.confidence,
                    data_coverage: meta.data_coverage,
                    forensic_notes: meta.forensic_notes,
                    reportType: type
                }
            });

            setSaving(null);
            alert("Intelligence Report saved to Project Vault & Reports Hub.");
        } catch (err) {
            console.error("Save to Vault Failed", err);
            setSaving(null);
            alert("Failed to archive report.");
        }
    };

    const tabs = [
        { id: 'command', label: 'Command Overview', icon: ShieldAlert },
        { id: 'timeline', label: 'Temporal Track', icon: Clock },
        { id: 'strategy', label: 'Decision Queue', icon: Target },
        { id: 'audit', label: 'Forensic Audit', icon: Info }
    ];

    if (error) {
        return (
            <div className="w-full p-8 bg-rose-950/20 border border-rose-500/20 rounded-[3rem] text-center">
                <AlertTriangle className="mx-auto text-rose-500 mb-2" />
                <h3 className="text-white font-black uppercase tracking-widest">Intelligence Node Error</h3>
                <p className="text-rose-400/60 text-xs mt-1">Failed to establish link with Reasoning Core. Verify API connectivity.</p>
                <button onClick={fetchIntelligence} className="mt-4 px-6 py-2 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase">Retry Sync</button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="w-full p-12 bg-indigo-950/20 border border-indigo-500/20 rounded-[3rem] backdrop-blur-xl flex flex-col items-center justify-center gap-4 animate-pulse">
                <div className="p-4 bg-indigo-600/20 rounded-2xl text-indigo-400">
                    <Loader2 size={32} className="animate-spin" />
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-black text-white uppercase tracking-tighter">Initializing Intelligence Layer</h3>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Interpreting Operational Circuit...</p>
                </div>
            </div>
        );
    }

    if (!intel) {
        return (
            <button 
                onClick={fetchIntelligence}
                className="w-full p-12 bg-indigo-600/10 border border-indigo-500/20 rounded-[3rem] hover:bg-indigo-600/20 transition-all group flex flex-col items-center gap-4"
            >
                <div className="p-4 bg-indigo-600/20 rounded-2xl text-indigo-400 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                    <Cpu size={32} />
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-black text-white uppercase tracking-tighter">Establish Intelligence Node</h3>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Activate diary.intelligenceLayer.v1</p>
                </div>
            </button>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-6 animate-in fade-in duration-700"
        >
            {/* TAB SWITCHER */}
            <div className="flex justify-center">
                <div className="flex bg-black/60 backdrop-blur-xl border border-white/10 p-1.5 rounded-3xl gap-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                activeTab === tab.id 
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' 
                                : 'text-gray-500 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'command' && (
                    <motion.div 
                        key="command"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                    >
                        {/* 6.1 NARRATIVE BANNER */}
                        <div className="relative p-10 bg-gradient-to-br from-indigo-950/40 via-[#050507] to-black border border-indigo-500/30 rounded-[3rem] overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Sparkles size={120} className="text-indigo-400" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-indigo-600/20 rounded-lg text-indigo-400 border border-indigo-500/30">
                                        <BarChart3 size={16} />
                                    </div>
                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">INTEL_LAYER // DAILY EXECUTIVE BRIEFING</span>
                                </div>
                                <p className="text-xl md:text-2xl font-medium text-gray-200 leading-relaxed italic">
                                    "{narrative}"
                                </p>
                            </div>
                        </div>

                        {/* SIGNAL ROW (Anomalies) Preview */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {anomalies.slice(0, 4).map((signal, idx) => (
                                <div key={idx} className="p-6 bg-white/[0.03] border border-white/5 rounded-[2rem] hover:border-indigo-500/20 transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className={`p-2 rounded-lg ${signal.severity === 'high' ? 'bg-rose-500/20 text-rose-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                                            {signal.severity === 'high' ? <ShieldAlert size={14} /> : <Info size={14} />}
                                        </div>
                                        <div className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{signal.type}</div>
                                    </div>
                                    <div className="text-xs font-bold text-white truncate">{signal.description}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'timeline' && (
                    <motion.div 
                        key="timeline"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="p-8 bg-[#0a0a0c] border border-white/5 rounded-[3rem] shadow-xl min-h-[400px]"
                    >
                        <div className="flex items-center gap-3 mb-8 px-4">
                            <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400 border border-cyan-500/30">
                                <Clock size={16} />
                            </div>
                            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em]">RECONSTRUCTED OPERATIONAL TIMELINE</span>
                        </div>
                        <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-indigo-500/10 max-w-3xl mx-auto py-4">
                            {(timeline || []).map((event, idx) => (
                                <div key={idx} className="relative pl-12 group">
                                    <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-black border border-white/5 flex items-center justify-center group-hover:border-cyan-500/40 transition-colors">
                                        <div className="w-3 h-3 rounded-full bg-cyan-500/20 border border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.2)] group-hover:scale-125 transition-transform" />
                                    </div>
                                    <p className="text-base font-medium text-gray-400 group-hover:text-white transition-colors py-2">
                                        {typeof event === 'string' ? event : event?.description || JSON.stringify(event)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'strategy' && (
                    <motion.div 
                        key="strategy"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="p-8 bg-[#0a0a0c] border border-white/5 rounded-[3rem] shadow-xl min-h-[400px]"
                    >
                        <div className="flex items-center gap-3 mb-10 px-4">
                            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 border border-emerald-500/30">
                                <ListChecks size={16} />
                            </div>
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em]">STRATEGIC DECISION QUEUE</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(next_actions || []).map((action, idx) => (
                                <div key={idx} className="flex items-center gap-6 p-8 bg-gradient-to-r from-white/[0.02] to-transparent border border-white/5 rounded-3xl hover:border-emerald-500/30 hover:bg-white/[0.04] transition-all cursor-default group">
                                    <div className="w-8 h-8 rounded-xl border-2 border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/10 group-hover:border-emerald-500/40 transition-all">
                                        <CheckCircle2 size={16} className="text-emerald-500 opacity-20 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <span className="text-lg font-medium text-gray-300 group-hover:text-white transition-colors">
                                        {typeof action === 'string' ? action : action?.task || JSON.stringify(action)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'audit' && (
                    <motion.div 
                        key="audit"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-8 bg-black/40 border border-white/5 rounded-[2.5rem] space-y-6">
                                <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-[0.4em] mb-4">Anomalies & Variance</h4>
                                <div className="space-y-4">
                                    {anomalies.map((signal, idx) => (
                                        <div key={idx} className="p-5 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[8px] font-black text-gray-500 uppercase">{signal.type}</span>
                                                <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase ${
                                                    signal.severity === 'high' ? 'bg-rose-500 text-white' : 'bg-white/10 text-gray-400'
                                                }`}>{signal.severity}</span>
                                            </div>
                                            <div className="text-sm font-bold text-white mb-1">{signal.description}</div>
                                            <div className="text-[10px] font-mono text-indigo-400">Data Point: {signal.data_point}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="p-8 bg-black/40 border border-white/5 rounded-[2.5rem]">
                                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-6">Confidence Meta-Analysis</h4>
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest block">Reasoning Core Confidence</span>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <div key={i} className={`flex-1 h-1.5 rounded-full ${
                                                    meta.confidence === 'high' ? 'bg-emerald-500' :
                                                    meta.confidence === 'medium' && i < 4 ? 'bg-amber-500' :
                                                    i < 3 ? 'bg-rose-500' : 'bg-white/5'
                                                }`} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest block">Data Coverage</span>
                                        <p className="text-sm font-bold text-gray-300">{meta.data_coverage || 'Full operational circuit detected.'}</p>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                                        <FileText size={16} className="text-amber-400" />
                                        <div>
                                            <div className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Site Knowledge</div>
                                            <div className="text-xs font-bold text-white">{meta.notes_processed || 0} Observations Integrated</div>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-indigo-600/5 border border-indigo-500/10 rounded-3xl">
                                        <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest block mb-2">Forensic Reasoning Notes</span>
                                        <p className="text-xs text-gray-400 leading-relaxed italic">"{meta.forensic_notes || 'No secondary reasoning required.'}"</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/5 space-y-6">
                            <div className="text-center">
                                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-2">Neural Report Matrix</h4>
                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Select target intelligence for formal archiving</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(REPORT_TYPES).map(([id, cfg]) => (
                                    <div key={id} className="p-6 bg-[#0a0a0c] border border-white/5 rounded-3xl flex flex-col gap-4 hover:border-indigo-500/30 transition-all group">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 bg-white/5 rounded-2xl text-indigo-400 group-hover:bg-indigo-600/20 transition-all">
                                                    <cfg.icon size={20} style={{ color: cfg.color }} />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-black text-white uppercase">{cfg.name}</div>
                                                    <div className="text-[8px] font-bold text-gray-600 uppercase tracking-tighter">{cfg.subtitle}</div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-2 mt-2">
                                            <button 
                                                onClick={() => generateIntelligencePDF(id)}
                                                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-white/5"
                                            >
                                                <FileDown size={14} /> Download
                                            </button>
                                            <button 
                                                disabled={!!saving}
                                                onClick={() => handleSaveToVault(id)}
                                                className={`flex-1 py-3 ${saving === id ? 'bg-indigo-600 animate-pulse' : 'bg-indigo-600/20 hover:bg-indigo-600'} text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-indigo-500/20`}
                                            >
                                                {saving === id ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                                {saving === id ? 'Archiving...' : 'Save to Vault'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CONFIDENCE FOOTER */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-6 bg-black/40 border border-white/5 rounded-[2rem] px-10">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest italic">Core: diary.intelligenceLayer.v1</span>
                    </div>
                </div>
                <div className="text-[10px] font-mono text-gray-600 flex items-center gap-2 italic">
                    <Cpu size={12} className="animate-spin-slow" />
                    Powered by grok-4-1-fast-reasoning
                </div>
            </div>
        </motion.div>
    );
};

export default IntelligenceLayer;