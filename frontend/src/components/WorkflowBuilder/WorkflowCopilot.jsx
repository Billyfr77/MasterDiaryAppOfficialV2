import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, X, Bot, User, Loader2, Zap, Command, BrainCircuit, Activity, AlertTriangle, TrendingUp, FileText, Download, BarChart3, ShieldCheck, Layout, GitMerge, ArrowRight, Target, DollarSign, Clock, Mic } from 'lucide-react';
import { api } from '../../utils/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function WorkflowCopilot({ nodes, edges, simulationData, meshContext, forensicLens, isSimulating, aiTemplates = [], onApplyTemplate, onCommand, isOpen, onClose }) {
    const [mode, setMode] = useState('CHAT'); // 'CHAT' | 'REPORT' | 'TEMPLATES' | 'PRISM'
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [voiceTranscript, setVoiceTranscript] = useState('');
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Neural Co-pilot Online. I have synced with the current lattice. Run a 'Simulate' or activate 'Forensic' mode for deep telemetry analysis." }
    ]);
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const scrollRef = useRef(null);

    // Auto-analysis when simulation completes
    useEffect(() => {
        if (simulationData && !isSimulating && messages.length < 3) {
            if (!navigator.onLine) return; // Skip proactive analysis offline
            const proactiveAnalysis = async () => {
                setLoading(true);
                try {
                    const res = await api.post('/ai/chat-workflow', { 
                        message: "Provide an executive summary of the latest simulation telemetry.",
                        context: { nodes, edges, simulationData, forensicLens }
                    });
                    setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
                } catch (e) { console.error(e); }
                setLoading(false);
            };
            proactiveAnalysis();
        }
    }, [simulationData, isSimulating]);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const startVoiceInput = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Voice input not supported in this browser.");
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
            setVoiceTranscript('');
        };
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event) => {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    const final = event.results[i][0].transcript;
                    setInput(prev => prev + (prev ? ' ' : '') + final);
                    setVoiceTranscript('');
                } else {
                    interim += event.results[i][0].transcript;
                    setVoiceTranscript(interim);
                }
            }
        };
        recognition.start();
    };

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        if (!navigator.onLine) {
            setMessages(prev => [...prev, { role: 'user', content: input }]);
            setMessages(prev => [...prev, { role: 'assistant', content: "Neural Core offline. Please check connection." }]);
            setInput('');
            return;
        }

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const res = await api.post('/ai/chat-workflow', { 
                message: userMsg,
                context: { nodes, edges, simulationData, meshContext, forensicLens }
            });
            
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: res.data.reply 
            }]);
            
            onCommand && onCommand(res.data);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Neural link timeout. The lattice is too complex for current bandwidth." }]);
        } finally {
            setLoading(false);
        }
    };
    
    // ... rest of the component
    // I will replace the CHAT mode input area below


    const generateReport = async (reportType) => {
        if (!navigator.onLine) {
            alert("Cannot generate reports offline.");
            return;
        }
        setLoading(true);
        setReportData(null);
        try {
            const res = await api.post('/ai/generate-workflow-report', {
                reportType,
                context: { nodes, edges, simulationData }
            });
            setReportData(res.data);
        } catch (e) {
            console.error("Report Error:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = () => {
        if (!reportData) return;

        const doc = new jsPDF();
        const primaryColor = [99, 102, 241]; // Indigo-500

        // Header
        doc.setFillColor(10, 10, 12);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text("MASTER DIARY OS // INTELLIGENCE BRIEF", 15, 20);
        
        doc.setFontSize(10);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(`REPORT_TYPE: ${reportData.reportTitle.toUpperCase()}`, 15, 30);
        doc.setTextColor(150, 150, 150);
        doc.text(`GENERATED: ${new Date().toLocaleString()}`, 140, 30);

        // Metrics Table
        if (reportData.metrics) {
            autoTable(doc, {
                startY: 50,
                head: [['Key Performance Indicator', 'Quantum Value']],
                body: reportData.metrics.map(m => [m.label, m.value]),
                theme: 'striped',
                headStyles: { fillColor: primaryColor }
            });
        }

        // Sections
        let currentY = doc.lastAutoTable.finalY + 20;
        reportData.sections.forEach(section => {
            if (currentY > 250) {
                doc.addPage();
                currentY = 20;
            }
            doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(section.title.toUpperCase(), 15, currentY);
            
            currentY += 8;
            doc.setTextColor(40, 40, 40);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const lines = doc.splitTextToSize(section.content, 180);
            doc.text(lines, 15, currentY);
            currentY += (lines.length * 5) + 15;
        });

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("Architectural Control Level 4 // Secure Neural Data // Proprietary & Confidential", 105, 285, { align: 'center' });

        doc.save(`MDOS_Intelligence_${new Date().getTime()}.pdf`);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: 100, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 100, opacity: 0, scale: 0.95 }}
                    className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[700px] z-[100]"
                >
                    <style>{`
                        @keyframes scan {
                            0% { transform: translateY(0); opacity: 0; }
                            50% { opacity: 1; }
                            100% { transform: translateY(600px); opacity: 0; }
                        }
                        .animate-scan {
                            animation: scan 3s linear infinite;
                        }
                    `}</style>
                    <div className="bg-[#050505]/95 backdrop-blur-3xl border border-indigo-500/30 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col h-[650px] relative">
                        {/* NEURAL FLOW ANIMATION */}
                        <AnimatePresence>
                            {loading && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 pointer-events-none z-0"
                                >
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0,transparent_70%)] animate-pulse" />
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent animate-scan" />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Header */}
                        <div className="p-6 border-b border-white/5 bg-indigo-600/10 flex justify-between items-center relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                                    <BrainCircuit size={18} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Neural Strategist</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">
                                            {loading ? 'Processing_Intelligence' : 'Lattice_Synced_V4'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Mode Switcher */}
                            <div className="flex bg-black/40 rounded-full p-1 border border-white/10">
                                <button 
                                    onClick={() => setMode('CHAT')}
                                    className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${mode === 'CHAT' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}
                                >
                                    Chat
                                </button>
                                <button 
                                    onClick={() => setMode('PRISM')}
                                    className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1 ${mode === 'PRISM' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}
                                >
                                    <Sparkles size={8} /> Prism
                                </button>
                                <button 
                                    onClick={() => setMode('REPORT')}
                                    className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${mode === 'REPORT' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}
                                >
                                    Reports
                                </button>
                                <button 
                                    onClick={() => setMode('TEMPLATES')}
                                    className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${mode === 'TEMPLATES' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}
                                >
                                    Templates
                                </button>
                            </div>

                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Telemetry Bar */}
                        <div className="px-6 py-3 bg-black/40 border-b border-white/5 grid grid-cols-3 gap-4">
                            <div className="flex items-center gap-2">
                                <Activity size={12} className="text-blue-400" />
                                <span className="text-[9px] font-black text-slate-500 uppercase">Nodes: {nodes.length}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <AlertTriangle size={12} className={forensicLens ? "text-violet-400 animate-pulse" : "text-slate-700"} />
                                <span className={`text-[9px] font-black uppercase ${forensicLens ? "text-violet-400" : "text-slate-700"}`}>Forensic: {forensicLens ? "ON" : "OFF"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <TrendingUp size={12} className={simulationData ? "text-emerald-400" : "text-slate-700"} />
                                <span className={`text-[9px] font-black uppercase ${simulationData ? "text-emerald-400" : "text-slate-700"}`}>Sim: {simulationData ? "READY" : "NULL"}</span>
                            </div>
                        </div>

                        {/* CONTENT AREA */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            {mode === 'CHAT' ? (
                                <>
                                    {messages.map((m, i) => (
                                        <motion.div 
                                            key={i}
                                            initial={{ opacity: 0, x: m.role === 'user' ? 10 : -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                                                m.role === 'user' 
                                                ? 'bg-indigo-600 text-white font-bold rounded-tr-none border border-white/10 shadow-lg' 
                                                : 'bg-white/5 border border-white/10 text-slate-300 rounded-tl-none'
                                            }`}>
                                                {m.content}
                                            </div>
                                        </motion.div>
                                    ))}
                                    {loading && (
                                        <div className="flex justify-start">
                                            <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl rounded-tl-none flex items-center gap-3">
                                                <Loader2 size={14} className="animate-spin text-indigo-400" />
                                                <span className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">Pinnacle is architecting...</span>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : mode === 'PRISM' ? (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {/* 1. Header: Job State Overview */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="p-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/5 border border-indigo-500/30 rounded-2xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Activity size={14} className="text-indigo-400" />
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Lattice Health</span>
                                            </div>
                                            <div className="text-2xl font-black text-white">
                                                {simulationData?.stats?.structuralIntegrity ? Math.round(simulationData.stats.structuralIntegrity) : 0}%
                                            </div>
                                            <div className="h-1 w-full bg-slate-800 rounded-full mt-2 overflow-hidden">
                                                <div className="h-full bg-indigo-500" style={{ width: `${simulationData?.stats?.structuralIntegrity || 0}%` }}></div>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-gradient-to-br from-emerald-500/20 to-teal-500/5 border border-emerald-500/30 rounded-2xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <DollarSign size={14} className="text-emerald-400" />
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Margin (Proj)</span>
                                            </div>
                                            <div className="text-2xl font-black text-white">
                                                {simulationData?.stats?.margin?.riskAdjusted ? `$${(simulationData.stats.margin.riskAdjusted / 1000).toFixed(1)}k` : '$0.0k'}
                                            </div>
                                            <div className="text-[9px] font-bold text-emerald-400/70 mt-1 uppercase">
                                                {simulationData?.stats?.margin?.status || 'N/A'}
                                            </div>
                                        </div>

                                        <div className="p-4 bg-gradient-to-br from-amber-500/20 to-orange-500/5 border border-amber-500/30 rounded-2xl">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Clock size={14} className="text-amber-400" />
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Time Drift</span>
                                            </div>
                                            <div className="text-2xl font-black text-white">
                                                +{simulationData?.stats?.drift?.time || 0}H
                                            </div>
                                            <div className="text-[9px] font-bold text-amber-400/70 mt-1 uppercase">
                                                Variance Detected
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. Causal Path Panel */}
                                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                            <GitMerge size={14} className="text-indigo-400" /> Neural Causal Chain
                                        </h4>
                                        {simulationData?.stats?.causalChain?.length > 0 ? (
                                            <div className="flex flex-col gap-2">
                                                {simulationData.stats.causalChain.map((node, i) => (
                                                    <div key={node.id} className="relative pl-6 pb-2 border-l-2 border-indigo-500/20 last:border-0">
                                                        <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-slate-900 shadow-[0_0_10px_#6366f1]"></div>
                                                        <div className="p-3 bg-black/40 rounded-xl border border-white/5 flex justify-between items-center group hover:border-indigo-500/50 transition-colors">
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{node.type.replace('Node', '')}</span>
                                                                <span className="text-xs font-bold text-white">{node.data.label}</span>
                                                            </div>
                                                            {i < simulationData.stats.causalChain.length - 1 && (
                                                                <ArrowRight size={14} className="text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-slate-600 text-xs italic">
                                                No causal anomalies detected in current simulation.
                                            </div>
                                        )}
                                    </div>

                                    {/* 3. Drift Dashboard */}
                                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                            <TrendingUp size={14} className="text-rose-400" /> Drift Analytics
                                        </h4>
                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex justify-between text-xs font-bold mb-1">
                                                    <span className="text-slate-400">Cost Variance</span>
                                                    <span className="text-rose-400">+${simulationData?.stats?.drift?.cost || 0}</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-rose-500" style={{ width: '35%' }}></div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-xs font-bold mb-1">
                                                    <span className="text-slate-400">Labor Impact</span>
                                                    <span className="text-amber-400">${simulationData?.stats?.drift?.labor || 0}</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-amber-500" style={{ width: '45%' }}></div>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-xs font-bold mb-1">
                                                    <span className="text-slate-400">Material Waste</span>
                                                    <span className="text-blue-400">${simulationData?.stats?.drift?.material || 0}</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500" style={{ width: '20%' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 4. Level 5 Autonomous Engine */}
                                    <div className="p-5 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-indigo-600/10 border border-indigo-500/30 rounded-2xl relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-indigo-500/5 group-hover:bg-indigo-500/10 transition-colors"></div>
                                        <div className="relative z-10 flex flex-col gap-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
                                                        <Bot size={14} /> Level 5 Autonomy
                                                    </span>
                                                    <span className="text-xs font-medium text-slate-300 max-w-[280px] leading-relaxed">
                                                        The Neural Engine has detected <span className="text-white font-bold">{simulationData?.stats?.drift?.time > 0 || simulationData?.stats?.drift?.cost > 0 ? 'Variance' : 'Stability'}</span>. 
                                                        Grant authorization to execute self-healing protocols.
                                                    </span>
                                                </div>
                                                <div className="px-2 py-1 rounded bg-indigo-500 text-[9px] font-black text-white uppercase tracking-widest shadow-[0_0_15px_#6366f1] animate-pulse">
                                                    Human_In_Loop
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <button 
                                                    onClick={() => {
                                                        // LEVEL 5: TIME COMPRESSION PROTOCOL
                                                        // Injects 'Overtime' Resource Nodes to reduce duration
                                                        const newNodes = [];
                                                        const newEdges = [];
                                                        
                                                        // Find bottlenecks (nodes on critical path with long duration)
                                                        const criticalNodes = simulationData?.stats?.path || [];
                                                        const targetNodeId = criticalNodes[Math.floor(criticalNodes.length / 2)]; 

                                                        if (targetNodeId) {
                                                            const otNodeId = `auto_ot_${Date.now()}`;
                                                            newNodes.push({
                                                                id: otNodeId,
                                                                type: 'resourceNode',
                                                                position: { x: 600, y: 300 }, // Simplified placement
                                                                data: { 
                                                                    label: 'Autonomous Overtime Crew', 
                                                                    config: { resourceType: 'Overtime Crew', quantity: 2 },
                                                                    description: 'Injected by NPE to compress schedule drift.'
                                                                }
                                                            });
                                                            newEdges.push({
                                                                id: `e_${otNodeId}`,
                                                                source: otNodeId,
                                                                target: targetNodeId,
                                                                type: 'custom',
                                                                animated: true,
                                                                style: { stroke: '#6366f1', strokeDasharray: '5,5' }
                                                            });

                                                            onCommand({ 
                                                                suggestedActions: [
                                                                    { type: 'add_nodes_edges', nodes: newNodes, edges: newEdges },
                                                                    { type: 'apply_fix', nodeId: targetNodeId, updates: { config: { duration: 2 } } } // Reduce target duration
                                                                ] 
                                                            });
                                                            setMessages(prev => [...prev, { role: 'assistant', content: "PROTOCOL EXECUTED: Injected Overtime Crew and compressed critical path duration. Time drift neutralized." }]);
                                                        }
                                                    }}
                                                    className="px-4 py-3 bg-slate-900 border border-indigo-500/30 hover:border-indigo-500 rounded-xl text-[10px] font-black uppercase tracking-wider text-left group/btn transition-all"
                                                >
                                                    <div className="flex items-center gap-2 mb-1 text-indigo-400 group-hover/btn:text-white">
                                                        <Clock size={12} /> Auto-Compress Time
                                                    </div>
                                                    <span className="text-[9px] text-slate-500">Inject Overtime Resources</span>
                                                </button>

                                                <button 
                                                    onClick={() => {
                                                        // LEVEL 5: MARGIN RECOVERY PROTOCOL
                                                        // Injects 'Variation' Node to recover costs
                                                        const varNodeId = `auto_var_${Date.now()}`;
                                                        const driftCost = simulationData?.stats?.drift?.cost || 5000;
                                                        
                                                        const newNode = {
                                                            id: varNodeId,
                                                            type: 'variationNode',
                                                            position: { x: 200, y: 300 },
                                                            data: { 
                                                                label: 'NPE Margin Recovery', 
                                                                config: { 
                                                                    variationAmount: driftCost, 
                                                                    variationType: 'Credit', 
                                                                    reason: 'Automated Cost Recovery for Drift' 
                                                                }
                                                            }
                                                        };
                                                        
                                                        onCommand({ suggestedActions: [{ type: 'add_nodes_edges', nodes: [newNode], edges: [] }] });
                                                        setMessages(prev => [...prev, { role: 'assistant', content: `PROTOCOL EXECUTED: Generated Variation Event ($${driftCost}) to offset detected cost overrun.` }]);
                                                    }}
                                                    className="px-4 py-3 bg-slate-900 border border-emerald-500/30 hover:border-emerald-500 rounded-xl text-[10px] font-black uppercase tracking-wider text-left group/btn transition-all"
                                                >
                                                    <div className="flex items-center gap-2 mb-1 text-emerald-400 group-hover/btn:text-white">
                                                        <DollarSign size={12} /> Auto-Balance Margin
                                                    </div>
                                                    <span className="text-[9px] text-slate-500">Raise Variation Event</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : mode === 'REPORT' ? (
                                <div className="space-y-6">
                                    {!reportData ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            <ReportCard 
                                                title="Executive Brief" 
                                                desc="Strategic high-level summary of the entire logical circuit."
                                                icon={ShieldCheck}
                                                onClick={() => generateReport('executive')}
                                            />
                                            <ReportCard 
                                                title="Financial Audit" 
                                                desc="Deep dive into projected costs, billing milestones and margin leaks."
                                                icon={BarChart3}
                                                onClick={() => generateReport('financial')}
                                            />
                                            <ReportCard 
                                                title="Risk Trajectory" 
                                                desc="Bottleneck analysis and critical failure prediction modeling."
                                                icon={AlertTriangle}
                                                onClick={() => generateReport('risk')}
                                            />
                                            <ReportCard 
                                                title="Operations Flow" 
                                                desc="Lattice efficiency and resource allocation performance."
                                                icon={Activity}
                                                onClick={() => generateReport('operations')}
                                            />
                                        </div>
                                    ) : (
                                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                                            <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-6">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="text-xl font-black text-white uppercase tracking-tight">{reportData.reportTitle}</h4>
                                                    <button onClick={() => setReportData(null)} className="text-slate-500 hover:text-white">
                                                        <X size={16} />
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    {reportData.metrics?.map((m, i) => (
                                                        <div key={i} className="p-3 bg-black/40 rounded-xl border border-white/5">
                                                            <p className="text-[8px] font-black text-slate-500 uppercase mb-1">{m.label}</p>
                                                            <p className="text-sm font-mono font-bold text-indigo-400">{m.value}</p>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="space-y-4">
                                                    {reportData.sections?.map((s, i) => (
                                                        <div key={i} className="space-y-1">
                                                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{s.title}</p>
                                                            <p className="text-xs text-slate-400 leading-relaxed">{s.content}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <button 
                                                onClick={handleDownloadPDF}
                                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl shadow-indigo-900/40 flex items-center justify-center gap-3"
                                            >
                                                <Download size={18} /> Download Intelligence Brief (PDF)
                                            </button>
                                        </motion.div>
                                    )}
                                    
                                    {loading && (
                                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                                            <Loader2 size={32} className="animate-spin text-indigo-500" />
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Compiling Neural Data...</p>
                                        </div>
                                    )}
                                </div>
                            ) : mode === 'TEMPLATES' ? (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="p-6 bg-indigo-600/10 border border-indigo-500/20 rounded-[2rem] relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <Layout size={60} className="text-white" />
                                        </div>
                                        <h3 className="text-indigo-400 font-black text-xs uppercase tracking-[0.3em] mb-2 flex items-center gap-2 relative z-10">
                                            <Sparkles size={16} /> Architectural Library
                                        </h3>
                                        <p className="text-slate-400 text-[10px] font-medium leading-relaxed relative z-10">Select a pre-engineered lattice to immediately deploy complex operational logic to your canvas.</p>
                                    </div>

                                    <div className="space-y-10 pb-10">
                                        {aiTemplates?.map((cat) => (
                                            <div key={cat.category} className="space-y-4">
                                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
                                                    {cat.category}
                                                    <div className="h-px bg-white/5 flex-1" />
                                                </h4>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {cat.items?.map((item) => (
                                                        <button
                                                            key={item.type}
                                                            onClick={() => {
                                                                onApplyTemplate(item.type);
                                                                onClose();
                                                            }}
                                                            className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-indigo-600/20 hover:border-indigo-500/50 transition-all text-left group active:scale-95"
                                                        >
                                                            <span className="block text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">{item.label}</span>
                                                            <span className="block text-[8px] text-slate-600 uppercase mt-1 font-mono">{item.type.replace(/_/g, '_')}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        {/* Input (Only in Chat mode) */}
                        {mode === 'CHAT' && (
                            <div className="p-6 border-t border-white/5 bg-black/40">
                                <div className="relative flex flex-col gap-2">
                                    {isListening && voiceTranscript && (
                                        <div className="text-[10px] text-indigo-400 font-black uppercase animate-pulse mb-1">
                                            Transcribing: {voiceTranscript}
                                        </div>
                                    )}
                                    <div className="relative flex items-center gap-3">
                                        <div className="absolute left-4 text-indigo-500">
                                            <Command size={16} />
                                        </div>
                                        <input 
                                            type="text" 
                                            value={input}
                                            onChange={e => setInput(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                                            placeholder={isListening ? "Listening..." : "Discuss lattice strategy..."}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-24 py-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all font-medium"
                                        />
                                        <div className="absolute right-2 flex items-center gap-2">
                                            <button 
                                                onClick={startVoiceInput}
                                                className={`p-2 rounded-xl transition-all ${isListening ? 'text-rose-500 animate-pulse bg-rose-500/10' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                                            >
                                                <Mic size={16} />
                                            </button>
                                            <button 
                                                onClick={handleSend}
                                                disabled={loading || !input.trim()}
                                                className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                            >
                                                <Send size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

const ReportCard = ({ title, desc, icon: Icon, onClick }) => (
    <button 
        onClick={onClick}
        className="p-5 bg-white/5 border border-white/10 rounded-3xl hover:bg-indigo-600/10 hover:border-indigo-500/50 transition-all text-left group"
    >
        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 w-fit mb-3 group-hover:scale-110 transition-transform">
            <Icon size={20} />
        </div>
        <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">{title}</h4>
        <p className="text-[10px] text-slate-500 leading-relaxed">{desc}</p>
    </button>
);
