/*
 * MasterDiaryApp Official - The Ultimate Landing Experience
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 * 
 * THE AI-NATIVE CONSTRUCTION OPERATING SYSTEM
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
  User, Timer, Package, Ruler, BarChart3, ClipboardCheck, Crown, Landmark, Map as MapIcon, Truck
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
                    {['Features', 'Intelligence', 'Security', 'Pricing'].map(item => (
                        <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-white transition-colors">{item}</a>
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

// --- SIMULATED QUOTE BUILDER (MIRRORED VERSION) ---

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
        { id: 'z1', name: 'Site Preparation', type: 'zone', x: 50, y: 50, width: 300, height: 400, color: 'border-indigo-500/30' }
    ]);
    const [resources, setResources] = useState([]);
    const [aiStatus, setAiStatus] = useState('Idle');
    const canvasRef = useRef(null);

    const onDrop = (e) => {
        e.preventDefault();
        const data = JSON.parse(e.dataTransfer.getData('resource'));
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        setAiStatus('Analyzing...');
        
        setTimeout(() => {
            const newRes = {
                id: Math.random().toString(36).substr(2, 9),
                ...data,
                x, y,
                icon: data.type === 'staff' ? User : data.type === 'equipment' ? Wrench : Package
            };
            setResources(prev => [...prev, newRes]);
            setAiStatus('Graph Updated');
            setTimeout(() => setAiStatus('Monitoring'), 2000);
        }, 800);
    };

    return (
        <div className="w-full py-32 relative overflow-hidden bg-black/40 border-y border-white/5" id="intelligence">
            <div className="max-w-7xl mx-auto px-6 flex flex-col gap-12">
                <div className="text-center max-w-3xl mx-auto space-y-4">
                    <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">The Operational <br/><span className="text-indigo-500">Masterpiece</span></h2>
                    <p className="text-gray-400 text-lg">Experience the high-fidelity node engine. Drag resources to build your graph.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 h-[700px]">
                    {/* Library */}
                    <div className="bg-stone-900/50 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 flex flex-col gap-6 shadow-2xl">
                        <div className="flex justify-between items-center px-2">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Resource Pool</span>
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        </div>
                        <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                            <DraggableResource name="Lead Fencer" type="staff" icon={Users} color="text-emerald-400" />
                            <DraggableResource name="Excavator 3.5T" type="equipment" icon={Truck} color="text-amber-400" />
                            <DraggableResource name="Treated Pine" type="material" icon={Package} color="text-indigo-400" />
                            <DraggableResource name="Concrete Mix" type="material" icon={Package} color="text-indigo-400" />
                            <DraggableResource name="Project Manager" type="staff" icon={Users} color="text-emerald-400" />
                            <DraggableResource name="Skid Steer" type="equipment" icon={Wrench} color="text-amber-400" />
                        </div>
                        <div className="mt-auto p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles size={14} className="text-indigo-400" />
                                <span className="text-[10px] font-black text-indigo-300 uppercase">AI Status</span>
                            </div>
                            <div className="text-xs font-bold text-white uppercase">{aiStatus}</div>
                        </div>
                    </div>

                    {/* Canvas Area */}
                    <div 
                        ref={canvasRef}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={onDrop}
                        className="relative bg-[#050507] rounded-[3rem] border border-white/10 overflow-hidden shadow-inner shadow-black group/canvas cursor-crosshair"
                    >
                        {/* Interactive UI Overlays */}
                        <div className="absolute top-8 left-8 flex gap-3 z-20">
                            <div className="px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-400">Mode: Virtual_Blueprint</div>
                            <div className="px-4 py-2 bg-indigo-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/40">Node_Connected</div>
                        </div>

                        {/* Infinite Grid */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                        
                        {/* Zones */}
                        {nodes.map(z => (
                            <div key={z.id} style={{ left: z.x, top: z.y, width: z.width, height: z.height }} className={`absolute border-2 border-dashed ${z.color} rounded-[2rem] bg-indigo-500/[0.02] flex flex-col p-6 animate-in fade-in duration-1000`}>
                                <div className="text-[10px] font-black text-indigo-400/50 uppercase tracking-widest mb-4">{z.name}</div>
                            </div>
                        ))}

                        {/* Resources */}
                        <AnimatePresence>
                            {resources.map(res => (
                                <motion.div 
                                    key={res.id}
                                    initial={{ scale: 0, opacity: 0, y: 20 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    style={{ left: res.x - 100, top: res.y - 40 }}
                                    className="absolute w-48 p-4 bg-stone-900/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-30 pointer-events-none group"
                                >
                                    <div className="flex justify-between items-center mb-3">
                                        <div className={`p-2 rounded-lg bg-black/40 ${res.color}`}><res.icon size={16} /></div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                    </div>
                                    <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{res.type}</div>
                                    <div className="text-xs font-black text-white uppercase truncate">{res.name}</div>
                                    <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center">
                                        <span className="text-[8px] font-bold text-indigo-400 uppercase">Live Estimate</span>
                                        <span className="text-[10px] font-mono font-bold text-white">$145.00</span>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Connectors (Dynamic SVGs) */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                            {resources.map((res, i) => (
                                <line 
                                    key={i} 
                                    x1={nodes[0].x + 150} y1={nodes[0].y + 200} 
                                    x2={res.x} y2={res.y} 
                                    stroke="white" strokeWidth="1" strokeDasharray="4 4" 
                                />
                            ))}
                        </svg>

                        {/* AI Verification Banner */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-amber-500/10 border border-amber-500/20 backdrop-blur-md rounded-full flex items-center gap-3 shadow-2xl">
                            <AlertTriangle size={14} className="text-amber-500" />
                            <span className="text-[10px] font-black text-amber-200 uppercase tracking-widest">Human Approval Required for Final Deployment</span>
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
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6">Unified_Modules</div>
                    <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.8]">One system. <br/><span className="text-gray-600">Infinite control.</span></h2>
                </div>
                <p className="text-gray-400 max-w-xs text-sm font-medium border-l border-white/10 pl-6">Every module is interconnected by a shared neural core, ensuring data flows perfectly from quote to invoice.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FeatureCard icon={Sparkles} title="AI Quote Builder" desc="Text prompt to full construction blueprint in seconds. Integrated cost modeling." color="indigo" />
                <FeatureCard icon={PenTool} title="AI Site Diary" desc="Visual workday painting with real-time productivity and profit tracking." color="emerald" />
                <FeatureCard icon={Shield} title="Safety Engine" desc="AI-generated SWMS and risk assessments with a custom form architect." color="orange" />
                <FeatureCard icon={GitBranch} title="Workflow Automator" desc="Visual logic builder that automates your admin tasks while you sleep." color="violet" />
                <FeatureCard icon={MapIcon} title="GeoCore Map" desc="Interactive site planning with zones, assets, and AI site compound generation." color="blue" />
                <FeatureCard icon={Users} title="Resource Logic" desc="Unified scheduling for staff and equipment with intelligent availability." color="cyan" />
                <FeatureCard icon={CreditCard} title="Branded Invoicing" desc="Harvest site diaries into professional invoices with a single click." color="rose" />
                <FeatureCard icon={BarChart3} title="Deep Intelligence" desc="Cross-module reporting that tells you exactly how your firm is performing." color="amber" />
            </div>
        </div>
    </section>
);

// --- WHO IT'S FOR ---

const TargetPersona = ({ title, desc, icon: Icon }) => (
    <div className="flex gap-6 p-8 rounded-3xl hover:bg-white/5 transition-all group">
        <div className="shrink-0 w-12 h-12 rounded-full bg-stone-900 border border-white/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <Icon size={20} />
        </div>
        <div>
            <h4 className="text-lg font-black text-white uppercase tracking-tight mb-2">{title}</h4>
            <p className="text-gray-500 text-sm font-medium">{desc}</p>
        </div>
    </div>
);

const WhoItsFor = () => (
    <section className="py-32 px-6 bg-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
                <h2 className="text-5xl font-black uppercase tracking-tighter leading-none">Built for the <br/><span className="text-indigo-500">Modern Builder.</span></h2>
                <p className="text-gray-400 text-lg">MasterDiaryOS scales with your ambition, from specialized SMEs to enterprise-level construction firms.</p>
                <div className="pt-8 grid grid-cols-1 gap-4">
                    <TargetPersona icon={Hammer} title="Trade Contractors" desc="Ditch the paperwork. Handle quotes and diaries from the site with zero friction." />
                    <TargetPersona icon={Briefcase} title="Project Managers" desc="Full visibility on every cost, every delay, and every dollar of profit in real-time." />
                    <TargetPersona icon={Ruler} title="Estimators" desc="Generate ultra-accurate, professional bids in minutes instead of hours." />
                </div>
            </div>
            <div className="relative rounded-[3rem] overflow-hidden border border-white/10 aspect-square group">
                <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" alt="Construction Site" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                <div className="absolute bottom-12 left-12 right-12">
                    <div className="p-8 bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl">
                        <div className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">Enterprise_Case_Study</div>
                        <p className="text-white font-bold text-xl italic leading-relaxed">"We saved 20+ hours of admin every week and boosted our bid-to-win ratio by 35% in the first quarter."</p>
                        <div className="mt-6 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-black">J</div>
                            <div>
                                <div className="text-sm font-bold text-white">James McAvoy</div>
                                <div className="text-[10px] font-black text-gray-500 uppercase">Director, Apex Civil</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

// --- TRUST & SECURITY ---

const TrustSection = () => (
    <section className="py-24 px-6 border-y border-white/5 bg-stone-900/20" id="security">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-12 md:gap-24 items-center">
            <div className="flex items-center gap-3 opacity-40 hover:opacity-100 transition-opacity cursor-default">
                <Shield className="text-emerald-500" size={24} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Bank-Grade Security</span>
            </div>
            <div className="flex items-center gap-3 opacity-40 hover:opacity-100 transition-opacity cursor-default">
                <CheckCircle2 className="text-indigo-500" size={24} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Human Approval Layer</span>
            </div>
            <div className="flex items-center gap-3 opacity-40 hover:opacity-100 transition-opacity cursor-default">
                <Lock className="text-blue-500" size={24} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">ISO 27001 Compliant</span>
            </div>
            <div className="flex items-center gap-3 opacity-40 hover:opacity-100 transition-opacity cursor-default">
                <Globe className="text-purple-500" size={24} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Global AWS Cluster</span>
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

const Landing = () => {
    const navigate = useNavigate();
    return (
        <div className={`min-h-screen ${GRADIENTS.hero} text-white font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden relative`}>
            <GridBackground />
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
                        MasterDiaryOS v2.5 Enterprise Edition
                    </div>
                    
                    <h1 className="text-7xl md:text-9xl lg:text-[10rem] font-black tracking-tighter mb-8 leading-[0.8] uppercase">
                        <span className="block bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-600">The Future</span>
                        <span className="block italic bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">Of Construct.</span>
                    </h1>
                    
                    <p className="text-xl md:text-2xl text-gray-400 mb-16 max-w-3xl mx-auto leading-relaxed font-medium">
                        The world’s first <span className="text-white font-bold">AI-Native Operating System</span> for construction. From rapid visual quoting to autonomous compliance.
                    </p>

                    <div className="flex flex-wrap justify-center gap-6 mb-32">
                        <button onClick={() => navigate('/login')} className="group relative px-12 py-6 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-[0_0_50px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all overflow-hidden">
                            <span className="relative z-10">Deploy System</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </button>
                        <button className="px-12 py-6 bg-white/5 border border-white/10 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-white/10 transition-all">
                            Watch Keynote
                        </button>
                    </div>

                    {/* HERO PREVIEW CARD */}
                    <div className="relative max-w-5xl mx-auto rounded-[3rem] border border-white/10 bg-black/40 backdrop-blur-xl p-4 md:p-8 shadow-2xl shadow-indigo-500/10 group overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                        <div className="relative aspect-video rounded-[2rem] overflow-hidden border border-white/5">
                            <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000" alt="Dashboard Preview" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <button className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all">
                                    <Play size={32} fill="black" />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* INTERACTIVE PLAYGROUND */}
            <InteractiveQuoteEngine />

            {/* FEATURES */}
            <FeaturesGrid />

            {/* WHO IT'S FOR */}
            <WhoItsFor />

            {/* TRUST */}
            <TrustSection />

            {/* PRICING */}
            <PricingPreview />

            {/* FINAL CTA */}
            <section className="py-40 px-6 relative overflow-hidden bg-indigo-600">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2),transparent_70%)]"></div>
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-10 leading-[0.8]">Ready to <br/>Construct?</h2>
                    <button onClick={() => navigate('/login')} className="px-12 py-6 bg-white text-indigo-600 rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all">
                        Initialize System Today
                    </button>
                </div>
            </section>

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
                <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-gray-600 uppercase tracking-widest">
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