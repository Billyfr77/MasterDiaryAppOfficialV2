/*
 * MasterDiaryApp Official - The Ultimate Landing Experience
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 * 
 * "The Carnival of Enterprise Intelligence"
 */
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion'
import { 
  Terminal, Cpu, Zap, Shield, Rocket, ChevronRight, 
  Play, MousePointer2, Activity, Code2, Database, 
  Wifi, Lock, Layout, Star, Trophy, Users, CheckCircle2, 
  ArrowRight, Sparkles, Command, Box, X, Hammer, Briefcase, Wrench,
  Globe, Layers, PenTool, CreditCard, GitBranch, FileText, Palette, AlertTriangle, Settings,
  User, Timer, Package
} from 'lucide-react'

// --- ASSETS & CONFIG ---
const GRADIENTS = {
    hero: "bg-gradient-to-b from-[#0f1115] via-[#0a0a0c] to-black",
    glass: "bg-white/5 backdrop-blur-xl border border-white/10",
    primary: "bg-gradient-to-r from-indigo-600 to-violet-600",
    text: "bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400"
};

// --- MICRO-COMPONENTS ---

const GridBackground = () => (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-indigo-500/10 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[100px] rounded-full mix-blend-screen"></div>
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
        <nav className={`fixed top-0 w-full z-50 px-6 py-4 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/5' : 'bg-transparent'}`}>
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                        <Terminal size={20} className="text-white" />
                    </div>
                    <span className="font-black text-xl tracking-tighter text-white">MasterDiary<span className="text-indigo-500">OS</span></span>
                </div>
                <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-400">
                    {['Features', 'Solutions', 'Pricing', 'Docs'].map(item => (
                        <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-white transition-colors">{item}</a>
                    ))}
                </div>
                <div className="flex gap-4">
                    <button onClick={() => navigate('/login')} className="px-5 py-2.5 text-sm font-bold text-gray-300 hover:text-white transition-colors">Login</button>
                    <button onClick={() => navigate('/login')} className="px-6 py-2.5 text-sm font-bold bg-white text-black rounded-xl hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95">
                        Get Started
                    </button>
                </div>
            </div>
        </nav>
    );
};

// --- HERO SECTION COMPONENTS ---

const SimulatedTerminal = () => {
    const [lines, setLines] = useState([
        { text: "Initializing MasterDiaryOS Kernel...", color: "text-gray-500" },
        { text: "Loading Modules: [Quote, Diary, Safety, Map]...", color: "text-indigo-400" },
        { text: "Connection Established: Neural Core v4.0", color: "text-emerald-500" },
        { text: "System Ready. Waiting for input...", color: "text-white animate-pulse" }
    ]);

    useEffect(() => {
        const sequence = [
            { text: "Analyzing project scope: 'Highrise Tower A'", delay: 2000, color: "text-blue-400" },
            { text: "Detected 450 required safety checks.", delay: 3000, color: "text-amber-400" },
            { text: "Optimizing schedule... Saved 14 days.", delay: 4500, color: "text-emerald-400 font-bold" },
            { text: "Generating Invoice #INV-2025-001...", delay: 6000, color: "text-purple-400" },
            { text: ">>> PROCESS COMPLETE", delay: 7000, color: "text-white bg-indigo-500/20 px-2 py-1 rounded w-fit" }
        ];

        let timeouts = [];
        sequence.forEach(({ text, delay, color }) => {
            timeouts.push(setTimeout(() => {
                setLines(prev => {
                    const newLines = [...prev, { text, color }];
                    return newLines.slice(-6); // Keep last 6 lines
                });
            }, delay));
        });

        return () => timeouts.forEach(clearTimeout);
    }, []);

    return (
        <div className="font-mono text-xs md:text-sm space-y-2 p-4 h-full flex flex-col justify-end">
            {lines.map((line, i) => (
                <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    className={line.color}
                >
                    <span className="opacity-50 mr-2">$</span>{line.text}
                </motion.div>
            ))}
        </div>
    );
};

const HeroShowcase = () => {
    return (
        <div className="relative w-full max-w-5xl mx-auto h-[500px] md:h-[600px] perspective-1000 mt-20 group">
            {/* Main Holographic Interface */}
            <motion.div 
                initial={{ rotateX: 20, opacity: 0, y: 100 }}
                animate={{ rotateX: 10, opacity: 1, y: 0 }}
                transition={{ duration: 1, type: "spring" }}
                className="w-full h-full bg-[#0f1115]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative transform-style-3d group-hover:rotate-x-0 transition-transform duration-1000"
            >
                {/* Header */}
                <div className="h-12 border-b border-white/10 flex items-center px-4 gap-2 bg-white/5">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                    </div>
                    <div className="flex-1 text-center text-xs font-bold text-gray-500 uppercase tracking-widest">MasterDiaryOS Dashboard</div>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-12 h-[calc(100%-48px)]">
                    {/* Sidebar */}
                    <div className="col-span-2 border-r border-white/10 p-4 space-y-4 hidden md:block bg-black/20">
                        {[Activity, Layout, Users, FileText, Settings].map((Icon, i) => (
                            <div key={i} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer">
                                <Icon size={20} />
                            </div>
                        ))}
                    </div>

                    {/* Main Content Area */}
                    <div className="col-span-12 md:col-span-7 p-6 space-y-6 relative overflow-hidden">
                        {/* Live Graph Simulation */}
                        <div className="h-48 rounded-xl border border-white/10 bg-gradient-to-br from-indigo-900/20 to-transparent p-4 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                            <div className="text-xs font-bold text-indigo-300 mb-2 uppercase">Project Velocity</div>
                            <div className="flex items-end gap-1 h-32">
                                {[40, 65, 50, 80, 55, 90, 70, 85, 60, 95].map((h, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h}%` }}
                                        transition={{ duration: 1, delay: i * 0.1, repeat: Infinity, repeatType: "reverse", repeatDelay: 2 }}
                                        className="flex-1 bg-indigo-500/50 rounded-t-sm hover:bg-indigo-400 transition-colors"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Node Graph Preview */}
                        <div className="flex gap-4">
                            <div className="flex-1 h-32 rounded-xl border border-white/10 bg-stone-900/50 p-4 relative overflow-hidden">
                                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                                <motion.div 
                                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-emerald-500/20 rounded-full border border-emerald-500 flex items-center justify-center"
                                >
                                    <Zap size={24} className="text-emerald-400" />
                                </motion.div>
                            </div>
                            <div className="flex-1 h-32 rounded-xl border border-white/10 bg-stone-900/50 p-4 flex flex-col justify-center items-center">
                                <div className="text-3xl font-black text-white">$1.2M</div>
                                <div className="text-xs text-gray-500 uppercase font-bold">Active Pipeline</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel / Terminal */}
                    <div className="col-span-12 md:col-span-3 border-l border-white/10 bg-black/40">
                        <SimulatedTerminal />
                    </div>
                </div>

                {/* Floating Elements (3D Effect) */}
                <motion.div 
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -right-10 top-20 bg-stone-900 border border-white/20 p-4 rounded-xl shadow-2xl z-20 flex items-center gap-3 w-64"
                >
                    <div className="p-2 bg-emerald-500/20 rounded-lg"><CheckCircle2 className="text-emerald-400" size={20} /></div>
                    <div>
                        <div className="text-xs font-bold text-gray-400 uppercase">Quote Approved</div>
                        <div className="text-sm font-black text-white">Skyline Renovation</div>
                    </div>
                </motion.div>

                <motion.div 
                    animate={{ y: [0, 20, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute -left-10 bottom-20 bg-stone-900 border border-white/20 p-4 rounded-xl shadow-2xl z-20 flex items-center gap-3 w-64"
                >
                    <div className="p-2 bg-amber-500/20 rounded-lg"><AlertTriangle className="text-amber-400" size={20} /></div>
                    <div>
                        <div className="text-xs font-bold text-gray-400 uppercase">Safety Alert</div>
                        <div className="text-sm font-black text-white">High Wind Detected</div>
                    </div>
                </motion.div>
            </motion.div>
            
            {/* Glow backing */}
            <div className="absolute inset-0 bg-indigo-600/20 blur-[100px] -z-10 rounded-full transform translate-y-20"></div>
        </div>
    );
};

// --- INTERACTIVE QUOTE SIMULATOR (PLAYGROUND) ---

const DraggableItemMock = ({ name, type, icon: Icon, colorClass }) => {
    const onDragStart = (e) => {
        e.dataTransfer.setData('playground-item', JSON.stringify({ name, type, colorClass }));
    };
    return (
        <div 
            draggable 
            onDragStart={onDragStart}
            className={`p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-3 cursor-grab active:cursor-grabbing hover:bg-white/5 transition-all group`}
        >
            <div className={`p-2 rounded-lg bg-black/20 ${colorClass}`}>
                <Icon size={18} />
            </div>
            <div className="flex-1">
                <div className="text-sm font-bold text-white uppercase tracking-tight">{name}</div>
                <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{type}</div>
            </div>
            <MousePointer2 size={14} className="text-gray-600 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all" />
        </div>
    );
};

const InteractiveQuoteSim = () => {
    const [nodes, setNodes] = useState([
        { id: '1', name: 'Project Start', type: 'Chronos', x: 100, y: 100, color: 'text-violet-400', icon: Timer }
    ]);
    const [connections, setConnections] = useState([]);
    const canvasRef = useRef(null);

    const onDrop = (e) => {
        e.preventDefault();
        const data = JSON.parse(e.dataTransfer.getData('playground-item'));
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const newNode = {
            id: Math.random().toString(36).substr(2, 9),
            ...data,
            x, y,
            icon: data.type === 'staff' ? User : data.type === 'equipment' ? Wrench : Package
        };
        
        setNodes(prev => [...prev, newNode]);
        // Auto-connect to first chronos for visual flair
        if (nodes.length > 0) {
            setConnections(prev => [...prev, { source: '1', target: newNode.id, type: data.type }]);
        }
    };

    return (
        <div className="w-full py-24 relative overflow-hidden bg-black/20">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-12 items-center">
                <div className="space-y-8">
                    <div>
                        <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">The Playground</h2>
                        <p className="text-gray-400 leading-relaxed">
                            Experience the <span className="text-white font-bold">Operational Art</span>. Drag resources from the library onto the canvas to see the Masterpiece Engine in action.
                        </p>
                    </div>
                    
                    <div className="space-y-3 bg-stone-900/40 p-6 rounded-[2rem] border border-white/5 backdrop-blur-xl">
                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4 px-2">Resource Library</div>
                        <DraggableItemMock name="Senior Foreman" type="staff" icon={User} colorClass="text-emerald-400" />
                        <DraggableItemMock name="Excavator 5T" type="equipment" icon={Wrench} colorClass="text-amber-400" />
                        <DraggableItemMock name="Premix Concrete" type="material" icon={Package} colorClass="text-indigo-400" />
                    </div>

                    <div className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-4">
                        <Sparkles className="text-indigo-400" />
                        <div className="text-xs font-bold text-gray-300">AI is actively monitoring this simulation...</div>
                    </div>
                </div>

                {/* SIMULATED CANVAS */}
                <div 
                    ref={canvasRef}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={onDrop}
                    className="h-[600px] bg-[#050507] rounded-[3rem] border border-white/10 relative overflow-hidden shadow-2xl group/canvas"
                >
                    {/* Grid Background */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05),transparent_70%)]"></div>

                    {/* SVG Connections */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        {connections.map((conn, i) => {
                            const source = nodes.find(n => n.id === conn.source);
                            const target = nodes.find(n => n.id === conn.target);
                            if (!source || !target) return null;
                            
                            const color = conn.type === 'staff' ? '#10b981' : conn.type === 'equipment' ? '#f59e0b' : '#6366f1';
                            
                            return (
                                <g key={i}>
                                    <motion.path 
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: 0.3 }}
                                        transition={{ duration: 1 }}
                                        d={`M ${source.x + 100} ${source.y + 40} Q ${(source.x + target.x) / 2} ${(source.y + target.y) / 2 + 50} ${target.x + 100} ${target.y + 40}`}
                                        stroke={color}
                                        strokeWidth="2"
                                        fill="transparent"
                                    />
                                    <circle r="3" fill="#fff">
                                        <animateMotion dur="2s" repeatCount="indefinite" path={`M ${source.x + 100} ${source.y + 40} Q ${(source.x + target.x) / 2} ${(source.y + target.y) / 2 + 50} ${target.x + 100} ${target.y + 40}`} />
                                    </circle>
                                </g>
                            );
                        })}
                    </svg>

                    {/* Nodes */}
                    <AnimatePresence>
                        {nodes.map((node) => (
                            <motion.div
                                key={node.id}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                style={{ left: node.x, top: node.y }}
                                className="absolute w-[200px] p-1 bg-gradient-to-br from-indigo-600/20 to-black backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl z-10 pointer-events-none"
                            >
                                <div className="p-4 flex flex-col gap-3">
                                    <div className="flex justify-between items-center">
                                        <div className={`p-2 rounded-lg bg-white/5 ${node.colorClass || 'text-violet-400'}`}>
                                            <node.icon size={16} />
                                        </div>
                                        <Zap size={12} className="text-indigo-500 animate-pulse" />
                                    </div>
                                    <div>
                                        <div className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{node.type}</div>
                                        <div className="text-xs font-black text-white uppercase truncate">{node.name}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* HUD */}
                    <div className="absolute top-6 left-6 flex gap-2">
                        <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md">Live_Sim</div>
                        <div className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] backdrop-blur-md">Operational_Masterpiece</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- DEEP FEATURE SHOWCASE ---

const FeatureSection = ({ title, subtitle, desc, icon: Icon, color, alignment = 'left', children }) => (
    <div className="py-32 relative overflow-hidden border-b border-white/5">
        <div className={`max-w-7xl mx-auto px-6 flex flex-col ${alignment === 'right' ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-20 items-center`}>
            <motion.div 
                initial={{ opacity: 0, x: alignment === 'left' ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex-1 space-y-8"
            >
                <div className="space-y-4">
                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-${color}-500/10 border border-${color}-500/30 text-xs font-bold text-${color}-400 uppercase tracking-widest`}>
                        <Icon size={14} /> {subtitle}
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9]">{title}</h2>
                </div>
                <p className="text-xl text-gray-400 leading-relaxed max-w-xl">
                    {desc}
                </p>
                <div className="flex gap-6">
                    <button className="flex items-center gap-2 text-white font-black uppercase tracking-widest text-xs hover:gap-4 transition-all">
                        Learn More <ArrowRight size={16} className="text-indigo-500" />
                    </button>
                </div>
            </motion.div>
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="flex-1 w-full"
            >
                {children}
            </motion.div>
        </div>
    </div>
);

const DeepFeatureShowcase = () => {
    return (
        <section id="features" className="bg-[#0a0a0c]">
            {/* Visual Quote Builder */}
            <FeatureSection 
                title="Visual Blueprint Engine"
                subtitle="Quote Builder v2.0"
                desc="Replace fragmented spreadsheets with a high-fidelity operational map. Drag and drop Staff, Equipment, and Materials to build a living estimate that updates in real-time."
                icon={Layout}
                color="indigo"
            >
                <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-black aspect-video group">
                    <img src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                    <div className="absolute bottom-10 left-10 right-10">
                        <div className="flex gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20"><MousePointer2 size={24} className="text-white" /></div>
                            <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/40 border border-white/20"><Sparkles size={24} className="text-white" /></div>
                        </div>
                        <h4 className="text-2xl font-black text-white uppercase tracking-tight">Infinite Canvas Technology</h4>
                        <p className="text-gray-400 text-sm mt-2">Zero boundaries. Maximum precision. Fully connected logic.</p>
                    </div>
                </div>
            </FeatureSection>

            {/* Smart Site Diary */}
            <FeatureSection 
                title="Paint Your Workday"
                subtitle="Smart Site Diary"
                desc="Log time visually with our unique 'Paint' interface. AI parses your natural language descriptions into structured data clusters automatically."
                icon={Palette}
                color="emerald"
                alignment="right"
            >
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-64 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 p-8 flex flex-col justify-between">
                        <Activity className="text-emerald-400" size={32} />
                        <div>
                            <div className="text-2xl font-black text-white">100%</div>
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Data Accuracy</div>
                        </div>
                    </div>
                    <div className="h-64 rounded-[2rem] bg-white/5 border border-white/10 p-8 flex flex-col justify-between overflow-hidden relative">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1),transparent_70%)]"></div>
                        <Users className="text-emerald-400" size={32} />
                        <div>
                            <div className="text-2xl font-black text-white">Auto-Group</div>
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Resource Clusters</div>
                        </div>
                    </div>
                </div>
            </FeatureSection>

            {/* Impact Anchors & Chronos */}
            <FeatureSection 
                title="Contextual Intelligence"
                subtitle="Impact Anchors & Chronos"
                desc="Automatically account for site delays, weather impacts, and operational friction. Our new node types dynamically adjust project financials based on real-world conditions."
                icon={Zap}
                color="amber"
            >
                <div className="space-y-4">
                    {[
                        { label: "Heavy Rain Impact", val: "+1.5x Duration", color: "text-rose-400" },
                        { label: "Site Access Delay", val: "+4.0h Stoppage", color: "text-amber-400" },
                        { label: "Night Shift Multiplier", val: "+25% Charge Out", color: "text-emerald-400" }
                    ].map((item, i) => (
                        <div key={i} className="p-6 rounded-2xl bg-black border border-white/5 flex justify-between items-center hover:border-white/20 transition-all">
                            <span className="font-bold text-gray-300">{item.label}</span>
                            <span className={`font-mono font-black ${item.color}`}>{item.val}</span>
                        </div>
                    ))}
                </div>
            </FeatureSection>
        </section>
    );
};

// --- TESTIMONIALS ---
const InfiniteTestimonials = () => {
    const testimonials = [
        { name: "Sarah Jenkins", role: "Project Director", text: "MasterDiaryOS has completely transformed our project visibility. The visual quoting is a game-changer.", company: "BuildCorp" },
        { name: "Mark Thompson", role: "Senior Estimator", text: "I can't imagine going back to spreadsheets. The precision and speed are unmatched.", company: "Metro Infra" },
        { name: "Elena Rodriguez", role: "Operations Manager", text: "The AI suggestions saved us 15% on our last major tender. It's like having a senior consultant in your pocket.", company: "Skyline Developments" }
    ];

    return (
        <section className="py-24 bg-black/40 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
                <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">The Voice of the Industry</h2>
                <div className="w-20 h-1 bg-indigo-600 mx-auto"></div>
            </div>
            <div className="flex gap-8 animate-scroll whitespace-nowrap">
                {[...testimonials, ...testimonials].map((t, i) => (
                    <div key={i} className="inline-block w-[400px] p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center font-black text-xl">
                                {t.name[0]}
                            </div>
                            <div>
                                <div className="text-white font-bold">{t.name}</div>
                                <div className="text-gray-500 text-xs uppercase tracking-widest">{t.role}</div>
                            </div>
                        </div>
                        <p className="text-gray-400 italic mb-6 break-words whitespace-normal">"{t.text}"</p>
                        <div className="text-indigo-400 text-xs font-black uppercase tracking-widest">{t.company}</div>
                    </div>
                ))}
            </div>
        </section>
    );
};

// --- CTA SECTION ---
const CTA = () => {
    const navigate = useNavigate();
    return (
        <section className="py-32 relative overflow-hidden bg-indigo-600">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2),transparent_70%)]"></div>
            <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
                <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-8 leading-none">
                    Ready to build <br /> the future?
                </h2>
                <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto font-medium opacity-90">
                    Join the elite firms using MasterDiaryOS to dominate the construction landscape. Deploy your system today.
                </p>
                <div className="flex flex-wrap justify-center gap-6">
                    <button onClick={() => navigate('/login')} className="px-10 py-5 bg-white text-indigo-600 rounded-full font-black uppercase tracking-[0.2em] text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all">
                        Get Started Now
                    </button>
                    <button className="px-10 py-5 bg-transparent border-2 border-white text-white rounded-full font-black uppercase tracking-[0.2em] text-sm hover:bg-white/10 transition-all">
                        Contact Sales
                    </button>
                </div>
            </div>
        </section>
    );
};

// --- MAIN LANDING PAGE ---

const Landing = () => {
    const navigate = useNavigate();
    return (
        <div className={`min-h-screen ${GRADIENTS.hero} text-white font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden`}>
            <GridBackground />
            <Nav />

            {/* HERO */}
            <section className="relative pt-32 pb-20 px-6 min-h-[90vh] flex flex-col items-center">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center relative z-10 max-w-5xl mx-auto w-full"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-indigo-300 uppercase tracking-widest mb-8 hover:bg-white/10 transition-colors cursor-default backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                        MasterDiaryOS v2.5 Enterprise Edition
                    </div>
                    
                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-8 leading-none">
                        <span className="block bg-clip-text text-transparent bg-gradient-to-b from-white via-gray-200 to-gray-500 uppercase">Construct.</span>
                        <span className="block bg-clip-text text-transparent bg-gradient-to-b from-indigo-400 via-purple-400 to-gray-500 uppercase italic">Masterpiece.</span>
                    </h1>
                    
                    <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                        The elite operating system for construction management. Powered by <span className="text-white font-bold underline decoration-indigo-500 decoration-2">Zero-Context AI</span> and high-fidelity operational graphing.
                    </p>

                    <div className="flex flex-wrap justify-center gap-6 mb-20">
                        <button onClick={() => navigate('/login')} className="px-10 py-5 bg-white text-black rounded-full font-black uppercase tracking-[0.2em] text-sm shadow-[0_0_50px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all">
                            Deploy System
                        </button>
                        <button className="px-10 py-5 bg-white/5 border border-white/10 rounded-full font-black uppercase tracking-[0.2em] text-sm hover:bg-white/10 transition-all">
                            Watch Keynote
                        </button>
                    </div>

                    <HeroShowcase />
                </motion.div>
            </section>

            {/* INTERACTIVE PLAYGROUND */}
            <InteractiveQuoteSim />

            {/* DEEP SHOWCASE */}
            <DeepFeatureShowcase />

            {/* LOGOS / SOCIAL PROOF */}
            <section className="py-20 border-y border-white/5 bg-black/40 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 text-center mb-12">
                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em]">Global_Architecture_Registry</div>
                </div>
                <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {['ACME Corp', 'BuildTech', 'Global Construct', 'Structura', 'MegaWorks'].map(logo => (
                        <div key={logo} className="text-2xl font-black font-mono tracking-tighter">{logo}</div>
                    ))}
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section id="testimonials">
                <InfiniteTestimonials />
            </section>

            {/* CTA */}
            <CTA />

            {/* FOOTER */}
            <footer className="bg-black py-20 border-t border-white/10 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Terminal size={24} className="text-indigo-600" />
                            <span className="font-black text-2xl tracking-tighter">MasterDiary<span className="text-indigo-500">OS</span></span>
                        </div>
                        <p className="text-gray-500 text-sm">© 2025 Billy Fraser. All systems operational.</p>
                    </div>
                    <div className="flex gap-8 text-sm font-bold text-gray-500">
                        <a href="#" className="hover:text-white transition-colors uppercase tracking-widest">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors uppercase tracking-widest">Terms</a>
                        <a href="#" className="hover:text-white transition-colors uppercase tracking-widest">Security</a>
                        <a href="#" className="hover:text-white transition-colors uppercase tracking-widest">Contact</a>
                    </div>
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
                .perspective-1000 {
                    perspective: 1000px;
                }
                .transform-style-3d {
                    transform-style: preserve-3d;
                }
                @keyframes shimmer {
                    from { background-position: 200% center; }
                    to { background-position: -200% center; }
                }
                .animate-shimmer {
                    animation: shimmer 8s linear infinite;
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default Landing;