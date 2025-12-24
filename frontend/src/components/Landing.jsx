/*
 * MasterDiaryApp Official - The Ultimate Landing Experience
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 * 
 * THE AI-NATIVE CONSTRUCTION OPERATING SYSTEM
 */
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion'
import CountUp from 'react-countup'
import { 
  Terminal, Cpu, Zap, Shield, Rocket, ChevronRight, 
  Play, MousePointer2, Activity, Code2, Database, 
  Wifi, Lock, Layout, Star, Trophy, Users, CheckCircle2, 
  ArrowRight, Sparkles, Command, Box, X, Hammer, Briefcase, Wrench,
  Globe, Layers, PenTool, CreditCard, GitBranch, FileText, Palette, AlertTriangle, Settings,
  User, Timer, Package, Ruler, BarChart3, ClipboardCheck, Crown, Landmark, Map as MapIcon, Truck,
  List, Loader2, Wand2, Calendar, Maximize, Plus, TrendingUp, BrainCircuit, GraduationCap
} from 'lucide-react'

// --- ASSETS & CONFIG ---
const COLORS = {
    purple: "#7c3aed",
    blue: "#06b6d4",
    arctic: "#22d3ee",
    gold: "#f59e0b",
    black: "#020408"
};

const GRADIENTS = {
    hero: "bg-gradient-to-b from-[#020408] via-[#050505] to-black",
    glass: "bg-white/5 backdrop-blur-xl border border-white/10",
    primary: "bg-gradient-to-r from-indigo-600 to-violet-600",
    text: "bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400"
};

// --- MICRO-COMPONENTS ---

const GridBackground = () => (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Deep Perspective Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        
        {/* Arctic Aurora Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-[radial-gradient(circle,rgba(124,58,237,0.1)_0%,transparent_70%)] blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[radial-gradient(circle,rgba(34,211,238,0.08)_0%,transparent_70%)] blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
    </div>
);

const Nav = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <nav className={`fixed top-0 w-full z-50 px-6 py-4 transition-all duration-500 ${scrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/5' : 'bg-transparent'}`}>
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                        <Terminal size={20} className="text-white" />
                    </div>
                    <span className="font-black text-xl tracking-tighter text-white uppercase">MasterDiary<span className="text-indigo-500">OS</span></span>
                </div>
                <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                    {['Neural Engine', 'Estimation', 'Diary', 'Pricing'].map(item => (
                        <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="hover:text-white transition-colors">{item}</a>
                    ))}
                </div>
                <div className="flex gap-4">
                    <button onClick={() => navigate('/login')} className="px-5 py-2.5 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Login</button>
                    <button onClick={() => navigate('/login')} className="px-6 py-2.5 text-xs font-black uppercase tracking-widest bg-white text-black rounded-xl hover:bg-indigo-500 hover:text-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-95">
                        Deploy System
                    </button>
                </div>
            </div>
        </nav>
    );
};

// --- SIMULATED QUOTE BUILDER (UPDATED FOR NEURAL ESTIMATION) ---

const DraggableResource = ({ name, type, icon: Icon, color }) => {
    const onDragStart = (e) => {
        e.dataTransfer.setData('resource', JSON.stringify({ name, type, color }));
    };
    return (
        <div 
            draggable 
            onDragStart={onDragStart}
            className={`p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3 cursor-grab active:cursor-grabbing hover:bg-white/10 transition-all group`}
        >
            <div className={`p-2 rounded-lg bg-black/40 ${color}`}>
                <Icon size={14} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-[10px] font-black text-white uppercase truncate">{name}</div>
                <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{type}</div>
            </div>
        </div>
    );
};

const InteractiveQuoteEngine = () => {
    const [nodes, setNodes] = useState([
        { id: 'prism', name: 'Estimation Prism', type: 'estimationPrism', x: 50, y: 50, width: 250, height: 250, color: 'border-indigo-500/50' }
    ]);
    const [resources, setResources] = useState([]);
    const [aiStatus, setAiStatus] = useState('Standby');
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    
    // Zoom & Pan State
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    
    const canvasRef = useRef(null);
    const contentRef = useRef(null);

    const onWheel = (e) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            setScale(prev => Math.min(Math.max(prev * delta, 0.5), 2));
        }
    };

    const onMouseDown = (e) => {
        if (e.button === 1 || (e.button === 0 && e.altKey)) { // Middle click or Alt+Left
            setIsDragging(true);
            setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
        }
    };

    const onMouseMove = (e) => {
        if (!canvasRef.current) return;
        
        if (isDragging) {
            setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
            return;
        }

        const rect = canvasRef.current.getBoundingClientRect();
        const x = Math.round(((e.clientX - rect.left - offset.x) / scale) / 20) * 20;
        const y = Math.round(((e.clientY - rect.top - offset.y) / scale) / 20) * 20;
        setMousePos({ x, y });
    };

    const onMouseUp = () => setIsDragging(false);

    const onDrop = (e) => {
        e.preventDefault();
        const data = JSON.parse(e.dataTransfer.getData('resource'));
        const rect = canvasRef.current.getBoundingClientRect();
        
        const x = Math.round(((e.clientX - rect.left - offset.x) / scale) / 20) * 20;
        const y = Math.round(((e.clientY - rect.top - offset.y) / scale) / 20) * 20;
        
        setAiStatus('Connecting Neural Link...');
        
        setTimeout(() => {
            const newRes = {
                id: Math.random().toString(36).substr(2, 9),
                ...data,
                x, y,
                quantity: Math.floor(Math.random() * 50) + 10,
                cost: Math.floor(Math.random() * 500) + 100,
                icon: data.type === 'staff' ? User : data.type === 'equipment' ? Wrench : Package
            };
            setResources(prev => [...prev, newRes]);
            setAiStatus('Calculating Yield...');
            setTimeout(() => setAiStatus('Monitoring'), 1500);
        }, 600);
    };

    const simulateBlueprint = () => {
        if (!prompt.trim()) return;
        setIsGenerating(true);
        setAiStatus('Parsing Natural Language...');
        
        setTimeout(() => {
            setAiStatus('Architecting Graph...');
            setTimeout(() => {
                // Generate a complex subgraph: Area -> Material -> Labour
                const newNodes = [
                    { id: `area-${Date.now()}`, name: 'Decking Zone', type: 'areaNode', x: 400, y: 100, width: 200, height: 200, color: 'border-cyan-500/50' }
                ];
                const newRes = [
                    { id: `mat-${Date.now()}`, name: 'Merbau Decking', type: 'quoteMaterial', x: 550, y: 250, color: 'text-indigo-400', quantity: 65, cost: 3200, icon: Package },
                    { id: `lab-${Date.now()}`, name: 'Carpenter Crew', type: 'quoteLabour', x: 550, y: 350, color: 'text-emerald-400', quantity: 16, cost: 1800, icon: User }
                ];
                setNodes(prev => [...prev, ...newNodes]);
                setResources(prev => [...prev, ...newRes]);
                setAiStatus('Neural Circuit Active');
                setIsGenerating(false);
                setPrompt('');
            }, 1500);
        }, 1000);
    };

    return (
        <div className="w-full py-32 relative overflow-hidden bg-black/40 border-y border-white/5" id="estimation">
            <div className="max-w-7xl mx-auto px-6 flex flex-col gap-12">
                <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6">Neural_Estimation_Engine</div>
                        <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">Generative <br/><span className="text-indigo-500">Estimation</span></h2>
                        <p className="text-gray-400 text-lg mt-6">Type "Build a deck" and watch the AI architect a fully calculated node graph. Or drag "Area Nodes" to drive automatic material yields.</p>
                        <div className="mt-4 flex gap-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">
                            <span className="flex items-center gap-2"><MousePointer2 size={12}/> Drag Area Nodes</span>
                            <span className="flex items-center gap-2"><Layout size={12}/> Connect Logic</span>
                        </div>
                    </div>
                    
                    <div className="w-full md:w-96 p-1 bg-white/5 border border-white/10 rounded-2xl flex relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                        <input 
                            type="text" 
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && simulateBlueprint()}
                            placeholder="e.g. 'Build a 50sqm timber deck...'" 
                            className="flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder-gray-600 relative z-10"
                        />
                        <button 
                            onClick={simulateBlueprint}
                            disabled={isGenerating}
                            className="bg-indigo-600 px-4 py-3 rounded-xl hover:bg-indigo-500 transition-all disabled:opacity-50 relative z-10 shadow-lg"
                        >
                            {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 h-[750px]">
                    {/* Library */}
                    <div className="bg-indigo-950/40 backdrop-blur-xl border border-indigo-500/20 rounded-[2rem] p-6 flex flex-col gap-6 shadow-2xl overflow-hidden relative group/sidebar">
                        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent opacity-50"></div>
                        <div className="flex justify-between items-center px-2 relative z-10">
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                <Box size={14} /> Resource Pool
                            </span>
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
                        </div>
                        <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar relative z-10">
                            <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">Power Nodes</div>
                            <DraggableResource name="Area Node" type="areaNode" icon={Ruler} color="text-cyan-400" />
                            <DraggableResource name="Estimation Prism" type="estimationPrism" icon={BrainCircuit} color="text-indigo-400" />
                            <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-1 mt-4">Resources</div>
                            <DraggableResource name="Material Yield" type="quoteMaterial" icon={Package} color="text-indigo-400" />
                            <DraggableResource name="Labour Estimator" type="quoteLabour" icon={User} color="text-emerald-400" />
                            <DraggableResource name="Profit Sink" type="profitNode" icon={DollarSign} color="text-amber-400" />
                        </div>
                        <div className="mt-auto p-5 bg-indigo-900/40 border border-indigo-500/30 rounded-2xl relative z-10 shadow-xl overflow-hidden">
                             <motion.div 
                                animate={{ x: ["-100%", "100%"] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                             />
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles size={14} className="text-indigo-400 animate-pulse" />
                                <span className="text-[10px] font-black text-indigo-300 uppercase">AI Neural Core</span>
                            </div>
                            <div className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></span>
                                {aiStatus}
                            </div>
                        </div>
                    </div>

                    {/* Canvas Area */}
                    <div className="flex flex-col gap-6 relative">
                        <div 
                            ref={canvasRef}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={onDrop}
                            onMouseMove={onMouseMove}
                            onMouseDown={onMouseDown}
                            onMouseUp={onMouseUp}
                            onWheel={onWheel}
                            className={`flex-1 relative bg-[#050507] rounded-[2.5rem] border border-indigo-500/20 overflow-hidden shadow-[0_0_100px_rgba(99,102,241,0.1)] group/canvas ${isDragging ? 'cursor-grabbing' : 'cursor-none'}`}
                        >
                            {/* Inner Scalable Content */}
                            <div 
                                ref={contentRef}
                                style={{ 
                                    transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                                    transformOrigin: '0 0',
                                    transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                                }}
                                className="absolute inset-0 w-full h-full pointer-events-none"
                            >
                                {/* Scanning Line when generating */}
                                {isGenerating && (
                                    <motion.div 
                                        initial={{ top: 0 }}
                                        animate={{ top: "100%" }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        className="absolute left-0 right-0 h-1 bg-indigo-500/50 shadow-[0_0_20px_#6366f1] z-40"
                                    />
                                )}

                                {/* Infinite Grid */}
                                <div className="absolute inset-[-2000px] bg-[linear-gradient(to_right,#6366f108_1px,transparent_1px),linear-gradient(to_bottom,#6366f108_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                                <div className="absolute inset-[-2000px] bg-[linear-gradient(to_right,#6366f110_1px,transparent_1px),linear-gradient(to_bottom,#6366f110_1px,transparent_1px)] bg-[size:100px_100px]"></div>
                                
                                {/* Power Nodes (Rooms/Prisms) */}
                                {nodes.map(z => (
                                    <motion.div 
                                        key={z.id} 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        style={{ left: z.x, top: z.y, width: z.width, height: z.height }} 
                                        className={`absolute border-2 border-dashed ${z.color} rounded-[2rem] bg-indigo-500/[0.03] flex flex-col p-6 shadow-[inset_0_0_30px_rgba(99,102,241,0.05)] overflow-hidden group/node`}
                                    >
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent -translate-x-full group-hover/node:translate-x-full transition-transform duration-1000"></div>
                                        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 flex justify-between items-center relative z-10">
                                            <span className="flex items-center gap-2">
                                                {z.type === 'estimationPrism' ? <BrainCircuit size={12} /> : <Ruler size={12}/>} 
                                                {z.name}
                                            </span>
                                            <div className="flex gap-1">
                                                <div className="w-1 h-1 rounded-full bg-indigo-500/30"></div>
                                                <div className="w-1 h-1 rounded-full bg-indigo-500/30"></div>
                                            </div>
                                        </div>
                                        {z.type === 'areaNode' && <div className="text-3xl font-black text-white/20 mt-auto">50m²</div>}
                                    </motion.div>
                                ))}

                                {/* Resource Nodes */}
                                <AnimatePresence>
                                    {resources.map(res => (
                                        <motion.div 
                                            key={res.id}
                                            initial={{ scale: 0, opacity: 0, y: 20, rotate: -5 }}
                                            animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
                                            style={{ left: res.x - 100, top: res.y - 40 }}
                                            className="absolute w-52 p-4 bg-indigo-950/90 backdrop-blur-2xl border border-indigo-500/40 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-30 group/res"
                                        >
                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg border-2 border-indigo-950">
                                                <Plus size={12} className="text-white" />
                                            </div>
                                            <div className="flex justify-between items-center mb-3">
                                                <div className={`p-2 rounded-lg bg-black/40 ${res.color}`}><res.icon size={16} /></div>
                                                <div className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[8px] font-black text-emerald-400 uppercase tracking-widest">Auto-Calc</div>
                                            </div>
                                            <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{res.type}</div>
                                            <div className="text-xs font-black text-white uppercase truncate group-hover/res:text-indigo-400 transition-colors">{res.name}</div>
                                            <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center">
                                                <span className="text-[8px] font-bold text-indigo-400 uppercase">Yield</span>
                                                <span className="text-[10px] font-mono font-bold text-emerald-400 animate-pulse">${res.cost.toLocaleString()}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {/* Connectors (Simulated Edges) */}
                                <svg className="absolute inset-0 w-full h-full">
                                    {resources.map((res, i) => {
                                        // Simple logic: Link all resources to the 'area' node if it exists, otherwise the prism
                                        const source = nodes.find(n => n.type === 'areaNode') || nodes[0];
                                        if (!source) return null;
                                        return (
                                            <motion.path 
                                                key={i} 
                                                initial={{ pathLength: 0, opacity: 0 }}
                                                animate={{ pathLength: 1, opacity: 0.3 }}
                                                d={`M ${source.x + source.width/2} ${source.y + source.height/2} Q ${source.x + source.width/2 + 100} ${res.y + 40} ${res.x} ${res.y}`}
                                                fill="none"
                                                stroke="url(#grad1)" 
                                                strokeWidth="2" 
                                                strokeDasharray="5 5" 
                                            />
                                        );
                                    })}
                                    <defs>
                                        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" style={{ stopColor: '#6366f1', stopOpacity: 1 }} />
                                            <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>

                            {/* Node Snapping Visual Cursor */}
                            {!isDragging && (
                                <motion.div 
                                    animate={{ 
                                        x: mousePos.x * scale + offset.x, 
                                        y: mousePos.y * scale + offset.y 
                                    }}
                                    transition={{ type: "spring", damping: 25, stiffness: 200, mass: 0.5 }}
                                    className="absolute w-10 h-10 border border-indigo-500/40 bg-indigo-500/5 rounded-lg z-50 pointer-events-none flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
                                >
                                    <div className="w-1 h-1 bg-indigo-500 rounded-full"></div>
                                    <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-indigo-500"></div>
                                    <div className="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-indigo-500"></div>
                                    <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l border-indigo-500"></div>
                                    <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-indigo-500"></div>
                                </motion.div>
                            )}

                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-indigo-600/10 border border-indigo-600/30 backdrop-blur-md rounded-full flex items-center gap-3 shadow-2xl z-50">
                                <Sparkles size={14} className="text-indigo-400 animate-spin-slow" />
                                <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Neural Yield Engine: Online</span>
                            </div>
                        </div>

                        {/* Bill of Materials (Bottom Manifest) */}
                        <div className="h-48 bg-indigo-950/60 backdrop-blur-xl border border-indigo-500/20 rounded-[2.5rem] shadow-[0_20px_80px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col relative group/manifest">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-transparent"></div>
                            <div className="p-5 border-b border-indigo-500/20 bg-indigo-950/40 flex justify-between items-center px-10 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-indigo-600/20 rounded-lg">
                                        <List size={16} className="text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Operational Manifest</h3>
                                        <span className="text-[8px] font-bold text-indigo-400/60 uppercase tracking-widest">{resources.length} Nodes Harvested</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <div className="text-[8px] font-black text-gray-500 uppercase mb-1">Contract Value</div>
                                        <div className="text-lg font-black text-emerald-400 font-mono tracking-tighter">
                                            $<CountUp end={resources.reduce((acc, r) => acc + r.cost, 0)} duration={2} separator="," />
                                        </div>
                                    </div>
                                    <button className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all">
                                        <Maximize size={16} className="text-gray-400" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative z-10">
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                    {resources.map(res => (
                                        <motion.div 
                                            key={res.id} 
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="p-3 bg-black/40 border border-white/5 rounded-xl flex flex-col gap-1 group/item hover:border-indigo-500/30 transition-all"
                                        >
                                            <span className="text-[8px] font-black text-gray-500 uppercase truncate">{res.name}</span>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-mono text-white">${res.cost}</span>
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></div>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {resources.length === 0 && (
                                        <div className="col-span-full text-center py-8">
                                            <div className="text-indigo-500/20 mb-2 flex justify-center"><Package size={32} /></div>
                                            <div className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Awaiting Estimation Data...</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- FEATURE GRID ---

const FeatureCard = ({ icon: Icon, title, desc, color }) => (
    <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/0 via-transparent to-transparent opacity-0 group-hover:opacity-10 transition-opacity"></div>
        <div className={`w-14 h-14 rounded-2xl bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center text-${color}-400 mb-6 group-hover:scale-110 transition-transform duration-500`}>
            <Icon size={28} />
        </div>
        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-3">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed font-medium">{desc}</p>
    </div>
);

const FeaturesGrid = () => (
    <section id="features" className="py-32 px-6 relative bg-[#020408]">
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
                <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6">Unified_Graph_Engine</div>
                    <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.8]">The Power <br/><span className="text-gray-600">Of Integration.</span></h2>
                </div>
                <p className="text-gray-400 max-w-sm text-sm font-medium border-l border-white/10 pl-6 leading-relaxed">MasterDiaryOS is built on a unified node-graph system. Whether you are quoting or painting a site diary, the logic remains consistent, professional, and AI-native.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FeatureCard icon={Crown} title="Neural Estimation" desc="Generative quoting. Convert text prompts into visual logic circuits with spatial awareness." color="indigo" />
                <FeatureCard icon={Palette} title="Neural Diary" desc="The Chronos System propagates time events across all resources. Track productivity with zero-context speed." color="emerald" />
                <FeatureCard icon={GraduationCap} title="Pinnacle Tutor" desc="An interactive AI guide that highlights the screen to teach you how to master the OS in real-time." color="orange" />
                <FeatureCard icon={Zap} title="Forensic Insights" desc="Live margin heatmaps and risk audits. Detect zero-rate items and orphaned areas before you quote." color="violet" />
                <FeatureCard icon={MapIcon} title="GeoSpatial Site Plan" desc="Layer site plans onto real maps. AI-generated compounds and resource positioning for elite project management." color="blue" />
                <FeatureCard icon={Calendar} title="Intelligent Scheduling" desc="Unified fleet and staff scheduler. Real-time availability sync across all project nodes." color="cyan" />
                <FeatureCard icon={Landmark} title="Financial Harvest" desc="Harvest diary entries directly into branded invoices. Retention tracking and variation workflows built-in." color="rose" />
                <FeatureCard icon={BarChart3} title="Project Gantt 2.0" desc="High-performance Gantt with 'Time Warp' zoom. Adaptive grid rendering for Day/Week/Month views." color="amber" />
            </div>
        </div>
    </section>
);

// --- OS CAPABILITIES DEEP DIVE ---

const CapabilityCard = ({ title, desc, tag, icon: Icon }) => (
    <div className="p-8 rounded-[3rem] bg-indigo-950/20 border border-indigo-500/10 hover:border-indigo-500/30 transition-all group relative overflow-hidden">
        <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <Icon size={24} />
            </div>
            <span className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.3em] px-3 py-1 bg-indigo-500/5 rounded-full border border-indigo-500/10">{tag}</span>
        </div>
        <h4 className="text-xl font-black text-white uppercase tracking-tight mb-3">{title}</h4>
        <p className="text-gray-500 text-sm leading-relaxed font-medium">{desc}</p>
        <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-2 text-[9px] font-black text-indigo-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Protocol_Analysis_Complete</span>
            <ChevronRight size={12} />
        </div>
    </div>
);

const OSCapabilities = () => (
    <section className="py-40 px-6 bg-black relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
                <div className="space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-widest">System_Architecture</div>
                    <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.8]">Built for <br/><span className="text-indigo-500">Total Control.</span></h2>
                    <p className="text-gray-400 text-xl leading-relaxed max-w-xl">MasterDiaryOS isn't just a database—it's a living logic engine that automates the friction out of construction management.</p>
                </div>

                <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[4rem] blur-2xl opacity-20 animate-pulse"></div>
                    <div className="relative rounded-[3.5rem] border border-white/10 bg-stone-900/50 backdrop-blur-3xl p-10 shadow-2xl overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                                <div className="p-3 bg-indigo-600 rounded-xl text-white"><Cpu size={20}/></div>
                                <div>
                                    <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Chronos_Core</div>
                                    <div className="text-sm font-bold text-white">Dynamic Time Propagation Active</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                                <div className="p-3 bg-emerald-600 rounded-xl text-white"><Zap size={20}/></div>
                                <div>
                                    <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Neural_Yield</div>
                                    <div className="text-sm font-bold text-white">Area Node -> Material Auto-Calc</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                                <div className="p-3 bg-amber-600 rounded-xl text-white"><Layers size={20}/></div>
                                <div>
                                    <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Margin_Heatmap</div>
                                    <div className="text-sm font-bold text-white">Visual Risk Assessment</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <CapabilityCard 
                    icon={Timer} 
                    tag="Chronos_Engine"
                    title="Time Propagation" 
                    desc="Connecting a 'Break' or 'Delay' node to the Chronos Hub automatically subtracts time across every linked staff member and equipment node in real-time."
                />
                <CapabilityCard 
                    icon={Ruler} 
                    tag="Neural_Yield"
                    title="Living Estimation" 
                    desc="Link 'Area Nodes' to 'Materials' and the graph will calculate quantities based on coverage. Update dimensions, and the whole quote recalculates."
                />
                <CapabilityCard 
                    icon={GitBranch} 
                    tag="Neural_Flow"
                    title="The Zapier of Construction" 
                    desc="Build visual automation graphs. When a diary is approved, the system can automatically harvest costs, generate an invoice, and notify the client."
                />
                <CapabilityCard 
                    icon={Landmark} 
                    tag="Financial_Harvest"
                    title="Revenue Clustering" 
                    desc="Our proprietary algorithm harvests billable nodes from site diaries and clusters them into professional, branded invoices with zero manual entry."
                />
                <CapabilityCard 
                    icon={BrainCircuit} 
                    tag="Pinnacle_Core"
                    title="Insights Layer" 
                    desc="A dedicated forensic audit layer. It detects orphaned areas, zero-rate items, and margin leaks before you hit save."
                />
                <CapabilityCard 
                    icon={Shield} 
                    tag="Compliance_Lock"
                    title="AI Safety Verification" 
                    desc="AI analyzes SWMS and risk assessments against site requirements to provide a verification badge, ensuring compliance before work begins."
                />
            </div>
        </div>
    </section>
);

// --- LEGAL ARCHITECTURE & COMPLIANCE ---

const LegalCard = ({ title, desc, icon: Icon }) => (
    <div className="flex gap-6 p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/20 transition-all group">
        <div className="shrink-0 w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <Icon size={20} />
        </div>
        <div>
            <h4 className="text-sm font-black text-white uppercase tracking-widest mb-2">{title}</h4>
            <p className="text-gray-500 text-xs font-medium leading-relaxed">{desc}</p>
        </div>
    </div>
);

const LegalArchitecture = () => (
    <section className="py-32 px-6 border-y border-white/5 bg-stone-950/20" id="security">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
                <div className="lg:col-span-1 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-400 uppercase tracking-widest">Liability_Framework</div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter leading-none text-white">The Human <br/><span className="text-indigo-500">In The Loop.</span></h2>
                    <p className="text-gray-500 text-sm leading-relaxed">MasterDiaryOS is built on a "Co-Pilot" philosophy. Our legal architecture ensures that AI generates the foundation, but the professional retains the authority.</p>
                    <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-4 items-start">
                        <AlertTriangle className="text-amber-500 shrink-0" size={18} />
                        <p className="text-[10px] font-bold text-amber-200/70 uppercase leading-relaxed">Notice: All AI-generated blueprints, SWMS, and diaries require "Master Architect" sign-off prior to operational deployment.</p>
                    </div>
                </div>
                
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <LegalCard 
                        icon={Shield} 
                        title="Professional Indemnity" 
                        desc="System logs track every manual modification and approval, providing a robust audit trail for professional liability and insurance compliance."
                    />
                    <LegalCard 
                        icon={CheckCircle2} 
                        title="Human Approval Layer" 
                        desc="All critical safety and financial nodes are locked behind a mandatory human-verification gate, ensuring zero autonomous errors in high-risk zones."
                    />
                    <LegalCard 
                        icon={Lock} 
                        title="Regulatory Alignment" 
                        desc="Built to align with ISO 31000 risk management standards. AI outputs are cross-referenced with local regulatory datasets for compliance."
                    />
                    <LegalCard 
                        icon={FileText} 
                        title="Audit-Ready Manifests" 
                        desc="Generate comprehensive reports of all AI-human interactions. Perfect for legal defense and site-wide safety investigations."
                    />
                </div>
            </div>
        </div>
    </section>
);

// --- PRICING PREVIEW ---

const PriceTier = ({ title, price, features, recommended }) => (
    <div className={`p-10 rounded-[3rem] flex flex-col gap-8 transition-all ${recommended ? 'bg-indigo-600 scale-105 shadow-2xl shadow-indigo-500/20' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}>
        <div>
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-2">{title}</h4>
            <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">${price}</span>
                <span className="text-xs text-gray-400">/mo</span>
            </div>
        </div>
        <ul className="space-y-4 flex-1">
            {features.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-medium text-gray-300">
                    <CheckCircle2 size={16} className={recommended ? 'text-white' : 'text-indigo-500'} />
                    {f}
                </li>
            ))}
        </ul>
        <button className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${recommended ? 'bg-white text-indigo-600 hover:scale-105' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}>
            Deploy {title}
        </button>
    </div>
);

const PricingPreview = () => (
    <section className="py-32 px-6" id="pricing">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20 space-y-4">
                <h2 className="text-5xl font-black uppercase tracking-tighter">Enterprise Grade. <br/><span className="text-indigo-500">SME Accessibility.</span></h2>
                <p className="text-gray-500">Choose the deployment tier that fits your fleet.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <PriceTier title="Field" price="20" features={['AI Site Diary', 'Basic Invoicing', 'Unified Client CRM', 'Mobile App Access']} />
                <PriceTier title="Tactical" price="70" recommended features={['AI Quote Builder', 'Safety Document Engine', 'Visual Map Builder', 'Resource Scheduling']} />
                <PriceTier title="Command" price="200" features={['AI Workflow Automator', 'Intelligent Reporting', 'Priority Neural Core', 'Dedicated Support']} />
            </div>
        </div>
    </section>
);

// --- MAIN LANDING PAGE ---

// --- INNOVATION: PROJECT TELEMETRY HUD ---

const ProjectHUD = () => (
    <div className="fixed inset-0 pointer-events-none z-[60] hidden xl:block">
        {/* Top Left: System Status */}
        <div className="absolute top-10 left-10 w-64 p-4 bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl animate-fade-in">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">OS_Core_Status</span>
            </div>
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-[8px] font-bold text-gray-500 uppercase">Neural Load</span>
                    <span className="text-[9px] font-mono text-white">12.4%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div animate={{ width: ["10%", "30%", "15%"] }} transition={{ duration: 5, repeat: Infinity }} className="h-full bg-indigo-500" />
                </div>
            </div>
        </div>

        {/* Top Right: Active Environment */}
        <div className="absolute top-10 right-10 w-64 p-4 bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl animate-fade-in text-right">
            <div className="flex items-center justify-end gap-3 mb-1">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Live_Environment</span>
                <Cpu size={14} className="text-indigo-500" />
            </div>
            <div className="text-xs font-black text-white uppercase tracking-widest">Master_Architect_v2.5</div>
            <div className="text-[8px] font-bold text-gray-600 uppercase mt-1">Region: US-CENTRAL-ALPHA</div>
        </div>

        {/* Bottom Left: Logic Feed */}
        <div className="absolute bottom-10 left-10 w-72 p-6 bg-black/60 backdrop-blur-2xl border border-indigo-500/20 rounded-[2rem] animate-fade-in shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
                <Terminal size={16} className="text-indigo-500" />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">AI_Mission_Control</span>
            </div>
            <div className="space-y-3 font-mono">
                <div className="text-[9px] text-gray-500">
                    <span className="text-indigo-500">&gt;</span> Analyzing_Operational_Lattice...
                </div>
                <div className="text-[9px] text-emerald-500/80">
                    <span className="text-indigo-500">&gt;</span> Optimization_Engine_Stable
                </div>
                <div className="text-[9px] text-gray-500">
                    <span className="text-indigo-500">&gt;</span> Data_Harvest_Protocol: Standby
                </div>
            </div>
        </div>

        {/* Bottom Right: Profit Pulse */}
        <div className="absolute bottom-10 right-10 p-6 bg-indigo-600/10 backdrop-blur-2xl border border-indigo-500/20 rounded-[2rem] animate-fade-in text-right shadow-2xl">
            <div className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2">Global_Fleet_ROI</div>
            <div className="text-3xl font-black text-white font-mono tracking-tighter">
                +<CountUp end={35} duration={3} />%
            </div>
            <div className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest mt-1">Efficiency Boost Active</div>
        </div>
    </div>
);

// --- INNOVATION: NEURAL SPINE (VERTICAL DATA FLOW) ---

const NeuralSpine = () => {
    const { scrollYProgress } = useScroll();
    const height = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
    
    return (
        <div className="fixed left-1/2 -translate-x-1/2 top-0 bottom-0 w-px z-0 hidden lg:block opacity-20">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/0 via-indigo-500 to-indigo-500/0"></div>
            {/* Glowing data packets traveling down */}
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{ 
                        top: ["-10%", "110%"],
                        opacity: [0, 1, 0]
                    }}
                    transition={{ 
                        duration: 8, 
                        repeat: Infinity, 
                        delay: i * 2,
                        ease: "linear"
                    }}
                    className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-400 rounded-full blur-[2px] shadow-[0_0_15px_#6366f1]"
                />
            ))}
            <motion.div 
                style={{ scaleY: height, originY: 0 }}
                className="absolute inset-0 bg-indigo-400 w-px shadow-[0_0_20px_#6366f1]"
            />
        </div>
    );
};

// --- LEGACY VS LOGIC COMPARISON (REMASTERED) ---

const LegacyVsLogic = () => (
    <section className="py-40 px-6 bg-[#020408] relative overflow-hidden">
        {/* Background visual depth */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-32 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Architectural_Audit</div>
                <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none text-white">The Death Of <br/><span className="text-gray-600 italic">Static Software.</span></h2>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto font-medium">Traditional apps are built on 20-year-old form logic. We built a living neural engine.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
                {/* Connecting "VS" indicator */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden lg:flex w-24 h-24 items-center justify-center">
                    <div className="absolute inset-0 bg-black rounded-full border border-white/10 shadow-[0_0_50px_rgba(0,0,0,1)]"></div>
                    <div className="absolute inset-2 border border-dashed border-white/20 rounded-full animate-spin-slow"></div>
                    <span className="relative text-xs font-black text-indigo-500 tracking-[0.3em] uppercase">Versus</span>
                </div>

                {/* LEGACY CORE (The Chaos - Neon Crimson) */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-b from-rose-600/30 to-transparent rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div className="relative p-10 md:p-14 rounded-[3rem] bg-[#050002] border border-rose-500/20 h-full overflow-hidden transition-all duration-500 group-hover:border-rose-500/40">
                        <div className="flex items-center gap-3 mb-12">
                            <div className="w-12 h-12 rounded-2xl bg-rose-950/40 border border-rose-500/40 flex items-center justify-center text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                                <AlertTriangle size={24} />
                            </div>
                            <span className="text-[11px] font-black text-rose-500 uppercase tracking-[0.4em] drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]">Fragmented_Legacy</span>
                        </div>
                        
                        <div className="space-y-12">
                            {[
                                { t: "Linear Form Logic", d: "Data is trapped in rigid, disconnected rows. No spatial intelligence or cross-module awareness." },
                                { t: "Manual Data Entry", d: "The 'Double-Entry' tax. Hours lost translating site notes into office spreadsheets. High liability risk." },
                                { t: "Bolted-On Chatbots", d: "Generic AI wrappers that don't understand construction physics or project dependencies." }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-8 opacity-40 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500">
                                    <X className="text-rose-500 shrink-0 mt-1" size={20} />
                                    <div>
                                        <h4 className="text-base font-black text-white uppercase mb-2 tracking-tight">{item.t}</h4>
                                        <p className="text-sm text-gray-400 font-medium leading-relaxed">{item.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Neon Crimson Glows */}
                        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-rose-600/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-rose-600/10 transition-colors"></div>
                    </div>
                </div>

                {/* MASTERDIARY CORE (The Neural Engine - Neon Indigo) */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-b from-indigo-500/40 to-purple-600/40 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <div className="relative p-10 md:p-14 rounded-[3rem] bg-indigo-950/20 border border-indigo-500/30 h-full overflow-hidden shadow-[0_0_80px_rgba(99,102,241,0.1)] transition-all duration-500 group-hover:border-indigo-400">
                        <div className="flex items-center gap-3 mb-12">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-600 border border-indigo-400 flex items-center justify-center text-white shadow-[0_0_30px_rgba(99,102,241,0.6)]">
                                <Cpu size={24} />
                            </div>
                            <span className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em] drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]">Neural_Operating_System</span>
                        </div>
                        
                        <div className="space-y-12">
                            {[
                                { t: "Universal Graph Architecture", d: "One visual brain powers every module. Changes in a quote instantly propagate to the diary and invoice." },
                                { t: "Continuous Grok Evolution", d: "Every Grok and Gemini update instantly scales your firm's logic. Our AI gets smarter while you sleep." },
                                { t: "Zero-Context Reasoning", d: "Sub-second operational analysis. High-fidelity intelligence that understands site physics and profit." }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-8 group/item">
                                    <div className="shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center mt-0.5">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#10b981]"></div>
                                    </div>
                                    <div>
                                        <h4 className="text-base font-black text-white uppercase mb-2 tracking-tight group-hover/item:text-indigo-400 transition-colors">{item.t}</h4>
                                        <p className="text-sm text-gray-300 font-medium leading-relaxed">{item.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Background "Pulse" pattern */}
                        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-indigo-500/20 transition-colors"></div>
                        <motion.div 
                            animate={{ x: ["-100%", "250%"] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    </section>
);

// --- GLOBAL OPERATIONAL PULSE ---

const GlobalPulse = () => (
    <section className="py-40 px-6 bg-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center grayscale brightness-50"></div>
            <div className="absolute inset-0 bg-black/60"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-10">Live_Global_Sync</div>
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-white mb-8">The Global <br/><span className="text-indigo-500 italic">Command Network.</span></h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-20 font-medium">Join the elite firms running their entire operations on the MasterDiary Neural Lattice.</p>
            
            <div className="relative aspect-[21/9] rounded-[3rem] border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden shadow-2xl text-white">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-full h-full opacity-30">
                        {[...Array(12)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: [1, 2], opacity: [1, 0] }}
                                transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                                style={{ 
                                    left: `${Math.random() * 80 + 10}%`, 
                                    top: `${Math.random() * 70 + 15}%` 
                                }}
                                className="absolute w-4 h-4 bg-indigo-500 rounded-full"
                            />
                        ))}
                    </div>
                </div>
                
                <div className="absolute bottom-10 left-10 right-10 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { l: "Active Deployments", v: "1,240+" },
                        { l: "Daily Node Syncs", v: "842K" },
                        { l: "Total Managed Value", v: "$4.2B" },
                        { l: "Uptime Protocol", v: "99.99%" }
                    ].map((s, i) => (
                        <div key={i} className="text-left p-6 bg-black/60 border border-white/5 rounded-2xl backdrop-blur-md">
                            <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">{s.l}</div>
                            <div className="text-2xl font-black text-white">{s.v}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </section>
);

// --- FINAL CTA: THE COMMAND BRIEFING ---

const CommandBriefing = () => {
    const navigate = useNavigate();
    return (
        <section className="py-40 px-6 relative overflow-hidden bg-[#050507] border-t border-white/5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1),transparent_70%)]"></div>
            <div className="max-w-4xl mx-auto text-center relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-black text-amber-400 uppercase tracking-widest mb-10">Limited_Tactical_Access</div>
                <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter mb-10 leading-[0.8] text-white">Request A <br/><span className="text-indigo-500">Command Briefing.</span></h2>
                <p className="text-gray-400 text-xl mb-16 font-medium">Initialize your firm's transformation. Our elite specialists will architect your migration to the neural operating system.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 text-left">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Operational Theater</label>
                        <input type="text" placeholder="e.g. Australia / Global" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-indigo-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Fleet Size (Staff)</label>
                        <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer">
                            <option className="bg-stone-900">1 - 10 Personnel</option>
                            <option className="bg-stone-900">11 - 50 Personnel</option>
                            <option className="bg-stone-900">50 - 200 Personnel</option>
                            <option className="bg-stone-900">Enterprise (200+)</option>
                        </select>
                    </div>
                </div>

                <button onClick={() => navigate('/login')} className="group relative px-16 py-8 bg-white text-black rounded-3xl font-black uppercase tracking-[0.3em] text-sm shadow-[0_0_60px_rgba(99,102,241,0.3)] hover:scale-105 active:scale-95 transition-all overflow-hidden w-full md:w-auto">
                    <span className="relative z-10">Initialize Deployment</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </button>
                
                <div className="mt-12 flex items-center justify-center gap-6 text-[9px] font-black text-gray-600 uppercase tracking-widest">
                    <span className="flex items-center gap-2"><Shield size={12}/> Secure End-to-End</span>
                    <span className="flex items-center gap-2"><Lock size={12}/> Human-in-the-Loop</span>
                    <span className="flex items-center gap-2"><Globe size={12}/> Global Cloud Mesh</span>
                </div>
            </div>
        </section>
    );
};

// --- SYSTEM LOG MARQUEE ---

const SystemLog = () => (
    <div className="bg-[#020408] border-t border-white/5 py-4 overflow-hidden relative">
        <div className="flex whitespace-nowrap animate-scroll gap-20">
            {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-20 items-center">
                    {[
                        "OPTIMIZING FOUNDATION LOGIC...", 
                        "SYNCING MATERIAL BLUEPRINT 0x882A...", 
                        "CHRONOS CORE: STABLE", 
                        "HARVESTING BILLABLE NODES...", 
                        "AI SWMS VERIFICATION COMPLETE", 
                        "NEURAL LATTICE EXPANSION ACTIVE",
                        "GENERATING COMMAND BRIEFING PROTOCOL..."
                    ].map((log, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]"></div>
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em]">{log}</span>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    </div>
);

const Landing = () => {
    const navigate = useNavigate();
    return (
        <div className={`min-h-screen ${GRADIENTS.hero} text-white font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden relative`}>
            <GridBackground />
            <NeuralSpine />
            <ProjectHUD />
            <Nav />

            {/* HERO SECTION */}
            <section className="relative pt-40 pb-20 px-6 min-h-screen flex flex-col items-center">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center relative z-10 max-w-6xl mx-auto w-full"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em] mb-10 hover:bg-white/10 transition-colors cursor-default backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                        MasterDiaryOS v2.7 Enterprise Edition
                    </div>
                    
                    <h1 className="text-7xl md:text-9xl lg:text-[10rem] font-black tracking-tighter mb-8 leading-[0.8] uppercase">
                        <span className="block bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-600">Generative</span>
                        <span className="block italic bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">Construct.</span>
                    </h1>
                    
                    <p className="text-xl md:text-2xl text-gray-400 mb-16 max-w-3xl mx-auto leading-relaxed font-medium">
                        The world’s first <span className="text-white font-bold">Neural Estimation & Diary Engine</span>. 
                        Where geometric logic drives material yield and AI architects your entire project.
                    </p>

                    <div className="flex flex-wrap justify-center gap-6 mb-32">
                        <button onClick={() => navigate('/login')} className="group relative px-12 py-6 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-[0_0_50px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all overflow-hidden">
                            <span className="relative z-10">Deploy System</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </button>
                    </div>

                    {/* SERIOUSLY IMPRESSIVE HERO ELEMENT - HOLOGRAPHIC NEURAL ARCHITECTURE */}
                    <div className="relative max-w-6xl mx-auto mt-24 perspective-2000">
                        <motion.div 
                            initial={{ opacity: 0, rotateX: 20 }}
                            animate={{ opacity: 1, rotateX: 0 }}
                            transition={{ duration: 1.5 }}
                            className="relative aspect-video rounded-[4rem] border border-indigo-500/20 bg-[#0a0a0c]/80 backdrop-blur-3xl shadow-[0_0_150px_rgba(99,102,241,0.15)] overflow-hidden group/hero"
                        >
                            {/* Deep Space & Grid */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1)_0%,transparent_70%)]"></div>
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
                            
                            {/* The Neural Lattice (SVG Art) */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <motion.div 
                                    animate={{ 
                                        rotateY: [0, 360],
                                        rotateX: [0, 10, 0, -10, 0]
                                    }}
                                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                                    className="relative w-[500px] h-[500px] preserve-3d"
                                >
                                    <svg viewBox="0 0 200 200" className="w-full h-full opacity-40">
                                        <defs>
                                            <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#6366f1" />
                                                <stop offset="100%" stopColor="#a855f7" />
                                            </linearGradient>
                                        </defs>
                                        {/* Complex wireframe paths */}
                                        <motion.path 
                                            d="M100 20 L180 60 L180 140 L100 180 L20 140 L20 60 Z" 
                                            fill="none" stroke="url(#glow)" strokeWidth="0.5"
                                            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                                            transition={{ duration: 3, repeat: Infinity }}
                                        />
                                        <path d="M100 20 L100 180 M20 60 L180 60 M20 140 L180 140" stroke="rgba(99,102,241,0.2)" strokeWidth="0.25" />
                                        <circle cx="100" cy="100" r="40" fill="none" stroke="url(#glow)" strokeWidth="0.5" strokeDasharray="2 2" />
                                        <motion.circle 
                                            cx="100" cy="100" r="5" fill="#6366f1"
                                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />
                                    </svg>
                                    
                                    {/* Orbital Data Points */}
                                    {[...Array(8)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="absolute top-1/2 left-1/2 w-2 h-2 bg-indigo-500 rounded-full blur-[2px]"
                                            animate={{
                                                rotate: [i * 45, i * 45 + 360],
                                                x: [150 * Math.cos(i * 45), 150 * Math.cos(i * 45)],
                                                y: [100 * Math.sin(i * 45), 100 * Math.sin(i * 45)],
                                                scale: [1, 1.5, 1],
                                                opacity: [0.3, 0.8, 0.3]
                                            }}
                                            transition={{ duration: 10 + i, repeat: Infinity, ease: "linear" }}
                                        />
                                    ))}
                                </motion.div>
                            </div>

                            {/* High-Tech Overlays - CONSTRUCTION RELEVANT */}
                            <div className="absolute inset-0 p-12 flex flex-col justify-between pointer-events-none">
                                <div className="flex justify-between items-start">
                                    <motion.div 
                                        animate={{ opacity: [0.4, 1, 0.4] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                        className="space-y-2"
                                    >
                                        <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Project_Alpha: Foundation_Phase</div>
                                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Blueprint_ID: 0x882A_RESIDENTIAL</div>
                                    </motion.div>
                                    <div className="flex gap-4">
                                        <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md">
                                            <div className="text-[8px] font-black text-emerald-400 uppercase mb-1">Material_Yield</div>
                                            <div className="h-1 w-20 bg-white/10 rounded-full overflow-hidden">
                                                <motion.div animate={{ width: ["10%", "95%", "80%"] }} transition={{ duration: 6, repeat: Infinity }} className="h-full bg-emerald-500" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-end">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-4 p-4 bg-black/60 border border-white/5 rounded-2xl backdrop-blur-md">
                                            <div className="w-10 h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center text-indigo-400"><Wrench size={18} /></div>
                                            <div>
                                                <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Asset_Manager</div>
                                                <div className="text-xs font-bold text-white uppercase">Excavator_3.5T_Deployed</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 p-4 bg-black/60 border border-white/5 rounded-2xl backdrop-blur-md">
                                            <div className="w-10 h-10 bg-emerald-600/20 rounded-lg flex items-center justify-center text-emerald-400"><Users size={18} /></div>
                                            <div>
                                                <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Labor_Sync</div>
                                                <div className="text-xs font-bold text-white uppercase">6x_Crew_On_Site</div>
                                            </div>
                                        </div>
                                    </div>
                                    <motion.div 
                                        animate={{ scale: [0.98, 1, 0.98] }}
                                        transition={{ duration: 4, repeat: Infinity }}
                                        className="p-8 bg-indigo-600/10 border border-indigo-500/20 rounded-[2.5rem] backdrop-blur-xl shadow-2xl"
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></div>
                                            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Project_Net_Revenue</span>
                                        </div>
                                        <div className="text-4xl font-black text-white font-mono tracking-tighter">$<CountUp end={1245780} duration={4} separator="," /></div>
                                        <div className="mt-4 flex items-center gap-4 text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                                            <span>+12.5% Profitability</span>
                                            <TrendingUp size={12} />
                                        </div>
                                    </motion.div>
                                </div>
                            </div>

                            {/* Horizontal Scanning Line */}
                            <motion.div 
                                animate={{ top: ["-10%", "110%"] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                className="absolute left-0 right-0 h-[2px] bg-indigo-500/30 shadow-[0_0_20px_#6366f1] z-10"
                            />
                        </motion.div>
                    </div>
                </motion.div>
            </section>

            {/* INTERACTIVE PLAYGROUND */}
            <InteractiveQuoteEngine />

            {/* LEGACY VS LOGIC */}
            <LegacyVsLogic />

            {/* FEATURES */}
            <FeaturesGrid />

            {/* OS CAPABILITIES DEEP DIVE */}
            <OSCapabilities />

            {/* GLOBAL OPERATIONAL PULSE */}
            <GlobalPulse />

            {/* LEGAL & COMPLIANCE */}
            <LegalArchitecture />

            {/* FINAL CTA: THE COMMAND BRIEFING */}
            <CommandBriefing />

            {/* FOOTER */}
            <footer className="bg-[#020408] py-20 border-t border-white/5 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <Terminal size={24} className="text-indigo-600" />
                            <span className="font-black text-2xl tracking-tighter text-white uppercase">MasterDiary<span className="text-indigo-500">OS</span></span>
                        </div>
                        <p className="text-gray-500 max-w-sm font-medium">The world’s most advanced AI-Native construction operating system. Built for elite firms who demand precision.</p>
                    </div>
                    <div>
                        <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-6">Platform</h5>
                        <ul className="space-y-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Architecture</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Intelligence</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Security</a></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-6">Connect</h5>
                        <ul className="space-y-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Twitter</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">LinkedIn</a></li>
                            <li><a href="#" className="hover:text-indigo-400 transition-colors">Status</a></li>
                        </ul>
                    </div>
                </div>

                <SystemLog />

                <div className="max-w-7xl mx-auto py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-gray-600 uppercase tracking-widest">
                    <span>© 2025 MASTERDIARYAPP. ALL RIGHTS RESERVED.</span>
                    <span>DESIGNED FOR ELITE PERFORMANCE.</span>
                </div>
            </footer>

            <style>{`
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-scroll {
                    animation: scroll 40s linear infinite;
                }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                @keyframes animate-spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .group-hover\:animate-spin-slow {
                    animation: animate-spin-slow 8s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default Landing;