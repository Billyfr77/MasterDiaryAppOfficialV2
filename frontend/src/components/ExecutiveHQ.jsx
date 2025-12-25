import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Zap, Activity, Target, ShieldCheck, TrendingUp, 
    Globe, Layers, Database, Clock, Briefcase, 
    MessageSquare, Send, Terminal, Radio as RadioIcon, Navigation, 
    CpuIcon, Scan, Share2, Hexagon, Crosshair, X, 
    Move, Boxes, Atom, Orbit, Shield, Zap as ZapIcon,
    Loader2, ArrowRight, BrainCircuit, BarChart3, Binary,
    Star, Sparkles, Gauge, ChevronRight, Link2, Server, Cpu, DollarSign,
    Wind, Waves, Maximize2, Minimize2, Search, Compass, MousePointer2,
    Lock, Unlock, Cpu as CpuIcon2, Activity as PulseIcon, Users, AlertCircle,
    Sun, Flame, Rocket
} from 'lucide-react';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

export default function ExecutiveHQ() {
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [projects, setProjects] = useState([]);
    const [oracleSignals, setOracleSignals] = useState([]);
    const [meshStats, setMeshStats] = useState({ personnel: 0, nodes: 0, empireValue: 0, activeProjects: 0 });
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState(null);
    const [latency, setLatency] = useState(0);
    const [viewMode, setViewMode] = useState('MESH'); 
    const [selectedNexusId, setSelectedNexusId] = useState(null);
    const [isMaximized, setIsMaximized] = useState(false);
    const [commandInput, setCommandInput] = useState('');
    const [warRoomInput, setWarRoomInput] = useState('');
    const [warRoomMessages, setWarRoomMessages] = useState([
        { role: 'oracle', content: "Sovereign Intelligence Oracle Online. The Galactic Core is synchronized. Awaiting strategic directives." }
    ]);
    
    // --- INFINITE SPACE NAVIGATION ---
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const isDragging = useRef(false);
    const lastPos = useRef({ x: 0, y: 0 });

    const [terminalLines, setTerminalLines] = useState([
        "> SOVEREIGN_SINGULARITY_OS_V15.0 INITIALIZED",
        "> NEURAL_NEBULA_GENERATED: STABLE",
        "> GRAVITATIONAL_LOCK: ESTABLISHED",
        "> EMPIRE_COMMAND_READY..."
    ]);

    const fetchMesh = async () => {
        const startTime = Date.now();
        setIsSyncing(true);
        try {
            const [pRes, oRes] = await Promise.all([
                api.get('/projects'),
                api.get('/intelligence/oracle-stream')
            ]);
            setProjects(pRes.data.data || pRes.data || []);
            setOracleSignals(oRes.data.signals || []);
            if (oRes.data.stats) setMeshStats(oRes.data.stats);
            setLatency(Date.now() - startTime);
            setLastSync(new Date().toLocaleTimeString());
        } catch (e) { console.error(e); }
        setIsSyncing(false);
        setLoading(false);
    };

    useEffect(() => {
        fetchMesh();
        const interval = setInterval(fetchMesh, 20000);
        return () => clearInterval(interval);
    }, []);

    // --- COSMIC NAVIGATION ---
    const handleMouseDown = (e) => {
        if (viewMode !== 'MESH') return;
        isDragging.current = true;
        lastPos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
        const { clientX, clientY, innerWidth, innerHeight } = e;
        const mx = (clientX / window.innerWidth - 0.5) * 60;
        const my = (clientY / window.innerHeight - 0.5) * 60;
        setMousePos({ x: mx, y: my });

        if (isDragging.current) {
            const dx = clientX - lastPos.current.x;
            const dy = clientY - lastPos.current.y;
            setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            lastPos.current = { x: clientX, y: clientY };
        }
    };

    const handleMouseUp = () => { isDragging.current = false; };

    const handleWheel = (e) => {
        if (viewMode !== 'MESH') return;
        const delta = e.deltaY * -0.001;
        setZoom(prev => Math.min(Math.max(0.1, prev + delta), 3.0));
    };

    const handleCommandSubmit = (e) => {
        if (e.key === 'Enter' && commandInput.trim()) {
            const cmd = commandInput.toUpperCase();
            setTerminalLines(prev => [...prev, `> ${cmd}`, `SYSTEM_HANDSHAKE_INITIATED...`].slice(-15));
            setCommandInput('');
            if (cmd === 'SYNC') fetchMesh();
            if (cmd === 'CENTER') { setPan({ x: 0, y: 0 }); setZoom(1); }
            setTimeout(() => setTerminalLines(prev => [...prev, `STATUS: SOVEREIGN.`].slice(-15)), 800);
        }
    };

    const handleWarRoomSend = async () => {
        if (!warRoomInput.trim()) return;
        const msg = warRoomInput;
        setWarRoomInput('');
        setWarRoomMessages(prev => [...prev, { role: 'user', content: msg }]);
        try {
            const res = await api.post('/ai/chat-workflow', { message: msg, context: { projects, type: 'EXECUTIVE' } });
            setWarRoomMessages(prev => [...prev, { role: 'oracle', content: res.data.reply }]);
        } catch (e) { console.error(e); }
    };

    const handleExecuteProtocol = async (signal) => {
        setTerminalLines(prev => [...prev, `> INITIATING_DIRECTIVE: ${signal.signal}`].slice(-10));
        try {
            const res = await api.post('/intelligence/execute-protocol', { signalId: signal.id, directive: signal.desc });
            setTerminalLines(prev => [...prev, `> ${res.data.message}`].slice(-10));
            fetchMesh();
        } catch (e) { setTerminalLines(prev => [...prev, `> LINK_FAILURE`].slice(-10)); }
    };

    // --- ORBITAL PHYSICS ENGINE ---
    const galacticLattice = useMemo(() => {
        return projects.map((p, i) => {
            const lane = (i % 5) + 1;
            const radius = 500 + (lane * 350);
            const baseSpeed = 0.03 / lane;
            return { ...p, radius, speed: baseSpeed, angleOffset: (i * (360 / (projects.length || 1))) * (Math.PI / 180), lane, hue: (i * 72) % 360 };
        });
    }, [projects]);

    const selectedNexus = useMemo(() => projects.find(p => p.id === selectedNexusId), [projects, selectedNexusId]);

    if (loading) return (
        <div className="h-screen w-screen bg-[#010102] flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0%,transparent_70%)] animate-pulse" />
            <Loader2 size={120} className="text-indigo-500 animate-spin opacity-30" />
            <div className="absolute font-black text-white/5 text-[15vw] uppercase tracking-[0.5em] select-none">SOVEREIGN</div>
        </div>
    );

    return (
        <div className="h-screen w-screen bg-[#010102] text-[#e2e8f0] font-mono overflow-hidden flex flex-col p-4 gap-4 relative select-none" 
             onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onWheel={handleWheel}>
            
            <style>{`
                .cosmic-nebula {
                    background: 
                        radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 60%);
                    filter: blur(80px); animation: nebula-pulse 40s ease-in-out infinite alternate;
                }
                @keyframes nebula-pulse { from { transform: scale(1) rotate(0deg); } to { transform: scale(1.3) rotate(15deg); } }
                .sovereign-sun-core {
                    background: radial-gradient(circle at center, #fff 0%, #fff 5%, #6366f1 20%, #4338ca 40%, transparent 75%);
                    filter: drop-shadow(0 0 150px #6366f1);
                }
                .sun-corona {
                    position: absolute; width: 300%; height: 300%;
                    background: conic-gradient(from 0deg, transparent, rgba(99,102,241,0.2), transparent, rgba(168,85,247,0.2), transparent);
                    animation: rotate-corona 15s linear infinite;
                }
                @keyframes rotate-corona { to { transform: rotate(360deg); } }
                .orbital-path { border: 1px solid rgba(255,255,255,0.03); border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none; }
                .glass-obsidian { 
                    backdrop-filter: blur(80px); background: rgba(0,0,0,0.6); 
                    border: 1px solid rgba(255,255,255,0.05); 
                    box-shadow: 0 0 50px rgba(0,0,0,0.9), inset 0 0 20px rgba(255,255,255,0.02);
                }
                .galaxy-viewport { perspective: 5000px; cursor: move; }
                .sync-flicker { animation: flicker 0.2s ease-in-out; }
                @keyframes flicker { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; filter: brightness(2); } }
            `}</style>

            <div className="fixed inset-0 cosmic-nebula pointer-events-none z-0" />

            {/* --- SECTION 1: GLOBAL BRIDGE --- */}
            <AnimatePresence>
                {!isMaximized && (
                    <motion.div initial={{ y: -150 }} animate={{ y: 0 }} exit={{ y: -150 }} className="z-50 flex justify-between items-center p-8 rounded-[3.5rem] glass-obsidian shrink-0 mx-4 mt-2">
                        <div className="flex items-center gap-16">
                            <motion.div whileHover={{ scale: 1.1, rotate: 180 }} className="p-7 bg-indigo-600 rounded-[3rem] shadow-[0_0_100px_rgba(99,102,241,0.5)] cursor-pointer" onClick={() => navigate('/pulse')}><Globe size={56} className="text-white" /></motion.div>
                            <div>
                                <h1 className="text-7xl font-black uppercase tracking-tighter italic leading-none terminal-glow bg-clip-text text-transparent bg-gradient-to-r from-white via-white/80 to-white/20">Executive HQ</h1>
                                <div className="flex items-center gap-10 mt-6">
                                    <div className="flex items-center gap-4 px-6 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                        <div className={`w-3 h-3 rounded-full bg-emerald-500 ${isSyncing ? 'animate-ping' : 'animate-pulse'}`} />
                                        <span className="text-[12px] text-emerald-400 font-black uppercase tracking-[0.6em]">GALAXY_SYNC_OK</span>
                                    </div>
                                    <span className="text-slate-500 text-[12px] font-black uppercase tracking-[0.6em] border-l border-white/10 pl-10 flex items-center gap-4">
                                        <Server size={16} className="text-indigo-500" /> DB_LATTICE: {lastSync || 'CALIBRATING...'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-8 items-center">
                            <BridgeStat label="Neural_Bus" value={`${latency}ms`} color="indigo" icon={Zap} />
                            <BridgeStat label="Integrity" value="99.8%" color="emerald" icon={ShieldCheck} />
                            <button onClick={() => setIsMaximized(true)} className="p-10 bg-white/5 hover:bg-white/10 rounded-[3.5rem] border border-white/10 transition-all group shadow-2xl"><Maximize2 size={40} className="text-gray-400 group-hover:text-white" /></button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- SECTION 2: THE SOVEREIGN GALAXY VIEWPORT --- */}
            <div 
                className={`flex-1 relative galaxy-viewport overflow-hidden bg-black/40 border border-white/5 rounded-[6rem] shadow-inner maximize-transition ${isMaximized ? 'fixed inset-6 z-[60] !m-0 rounded-[4rem]' : 'mx-4'}`}
                onMouseDown={handleMouseDown}
            >
                <motion.div 
                    className="absolute inset-0 transform-style-3d h-full w-full"
                    animate={{ x: pan.x, y: pan.y, scale: zoom, rotateY: mousePos.x * 0.25, rotateX: -mousePos.y * 0.25 }}
                    transition={{ type: 'spring', damping: 40, stiffness: 80 }}
                >
                    <AnimatePresence mode="wait">
                        {viewMode === 'MESH' && (
                            <motion.div key="mesh" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 transform-style-3d h-full w-full">
                                {[500, 850, 1200, 1550, 1900].map(r => (<div key={r} className="orbital-path" style={{ width: r*2, height: r*2 }} />))}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 transform-style-3d">
                                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="w-[500px] h-[500px] rounded-full sovereign-sun-core relative flex items-center justify-center overflow-hidden">
                                        <div className="sun-corona" /><div className="relative z-20 w-80 h-80 bg-black rounded-full border border-white/10 flex items-center justify-center shadow-[inset_0_0_100px_rgba(99,102,241,0.8)] overflow-hidden">
                                            {settings.companyLogo ? <img src={settings.companyLogo} className="w-56 h-56 object-contain filter brightness-200 contrast-150" /> : <Globe size={140} className="text-white animate-pulse" />}
                                        </div>
                                    </motion.div>
                                </div>
                                {galacticLattice.map((p) => (<ProjectPlanet key={p.id} project={p} isSelected={selectedNexusId === p.id} onSelect={() => setSelectedNexusId(p.id)} zoom={zoom} />))}
                            </motion.div>
                        )}

                        {viewMode === 'FLIGHT_PLAN' && (
                            <motion.div key="flight" initial={{ opacity: 0, x: 200 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -200 }} className="absolute inset-0 p-32 overflow-y-auto custom-scrollbar">
                                <h2 className="text-7xl font-black uppercase tracking-[0.6em] mb-24 text-indigo-400 flex items-center gap-10 italic drop-shadow-[0_0_30px_rgba(99,102,241,0.4)]"><Navigation size={80} /> Orbit Trajectories</h2>
                                <div className="space-y-20 max-w-6xl mx-auto">
                                    {projects.map(p => (
                                        <div key={p.id} className="space-y-10 group/trajectory cursor-pointer">
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <span className="text-4xl font-black uppercase tracking-[0.5em] text-white group-hover/trajectory:text-indigo-400 transition-all italic">{p.name}</span>
                                                    <div className="flex items-center gap-6 mt-6"><div className="w-4 h-4 rounded-full bg-indigo-500 animate-ping shadow-[0_0_20px_#6366f1]" /><span className="text-[14px] font-bold text-slate-600 uppercase tracking-[0.8em]">PHASE_DELTA_09_SYNCHRONIZED</span></div>
                                                </div>
                                                <div className="flex gap-24 text-right">
                                                    <div><p className="text-[12px] font-black text-slate-600 uppercase tracking-widest">Velocity</p><p className="text-5xl font-mono font-black text-white italic">1.02X</p></div>
                                                    <div><p className="text-[12px] font-black text-slate-600 uppercase tracking-widest">Success</p><p className="text-5xl font-mono font-black text-emerald-400 italic">92%</p></div>
                                                </div>
                                            </div>
                                            <div className="relative h-32 bg-white/[0.02] border border-white/5 rounded-[4rem] flex items-center px-24 overflow-hidden group-hover/trajectory:bg-white/[0.04] transition-all shadow-3xl">
                                                <div className="h-[4px] bg-slate-900 w-full relative">
                                                    <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} transition={{ duration: 3 }} className="h-full bg-indigo-500 shadow-[0_0_60px_rgba(99,102,241,1)] relative">
                                                        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2"><div className="p-5 bg-white rounded-full shadow-[0_0_40px_white]"><Navigation size={40} className="rotate-90 text-indigo-600 fill-indigo-600" /></div></div>
                                                    </motion.div>
                                                </div>
                                                <div className="absolute right-24 text-slate-800 animate-pulse"><Target size={64} /></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {viewMode === 'YIELD' && (
                            <motion.div key="yield" initial={{ opacity: 0, rotateX: 45 }} animate={{ opacity: 1, rotateX: 0 }} exit={{ opacity: 0, rotateX: -45 }} className="absolute inset-0 p-32 overflow-y-auto custom-scrollbar">
                                <h2 className="text-7xl font-black uppercase tracking-[0.6em] mb-24 text-emerald-400 flex items-center gap-10 italic drop-shadow-[0_0_30px_rgba(16,185,129,0.4)]"><TrendingUp size={80} /> Yield Surface</h2>
                                <div className="grid grid-cols-1 gap-12">
                                    {projects.map(p => (
                                        <div key={p.id} className="p-20 bg-white/[0.01] border border-white/5 rounded-[6rem] flex items-center justify-between group hover:bg-emerald-500/5 hover:border-emerald-500/30 transition-all duration-1000 relative overflow-hidden shadow-3xl glass-obsidian">
                                            <div className="absolute left-0 top-0 bottom-0 w-4 bg-emerald-500/20 group-hover:bg-emerald-500 transition-all duration-1000 shadow-[0_0_50px_#10b981]" />
                                            <div className="flex items-center gap-20 relative z-10">
                                                <div className="w-40 h-40 rounded-[4.5rem] bg-black/60 border border-white/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:shadow-[0_0_80px_rgba(16,185,129,0.4)] transition-all duration-1000"><DollarSign size={72} /></div>
                                                <div><div className="text-5xl font-black text-white uppercase tracking-[0.3em] italic leading-tight">{p.name}</div><div className="text-[15px] text-slate-500 font-bold uppercase tracking-[0.8em] mt-6 flex items-center gap-5"><div className="w-3 h-3 rounded-full bg-emerald-500" /> CONFIDENCE_INDEX: 98.2%</div></div>
                                            </div>
                                            <div className="flex gap-40 text-right relative z-10">
                                                <div><span className="text-[14px] font-black text-slate-600 uppercase tracking-[0.8em] block mb-6">Weighting</span><span className="text-7xl font-mono font-black text-white tracking-tighter italic">12.4%</span></div>
                                                <div><span className="text-[14px] font-black text-slate-600 uppercase tracking-[0.8em] block mb-6">Yield_Delta</span><span className="text-7xl font-mono font-black text-emerald-400 tracking-tighter terminal-glow italic">+$142k</span></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {viewMode === 'WAR_ROOM' && (
                            <motion.div key="war" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="absolute inset-0 p-24 flex flex-col gap-12">
                                <div className="flex-1 bg-black/40 border border-white/5 rounded-[6rem] p-20 overflow-y-auto custom-scrollbar flex flex-col gap-16 shadow-inner glass-obsidian">
                                    {warRoomMessages.map((m, i) => (
                                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] p-16 rounded-[5rem] text-2xl leading-relaxed shadow-3xl ${m.role === 'user' ? 'bg-indigo-600 text-white font-bold rounded-br-none' : 'bg-white/[0.03] border border-white/10 text-indigo-200 rounded-bl-none'}`}>
                                                {m.role === 'oracle' && (<div className="flex items-center gap-6 mb-10 text-indigo-400 font-black uppercase text-[14px] tracking-[0.8em] border-b border-indigo-500/20 pb-8"><RadioIcon size={32}/> Sovereign_Oracle_Directive</div>)}
                                                {m.content}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="relative p-8 shrink-0 group">
                                    <input type="text" value={warRoomInput} onChange={e => setWarRoomInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleWarRoomSend()} placeholder="INPUT_GLOBAL_DIRECTIVE_ENCRYPTED..." className="w-full bg-white/[0.03] border border-white/10 rounded-[6rem] pl-24 pr-48 py-16 text-4xl text-white focus:outline-none focus:border-indigo-500 transition-all font-black placeholder:text-slate-900 tracking-widest shadow-3xl" />
                                    <button onClick={handleWarRoomSend} className="absolute right-20 top-1/2 -translate-y-1/2 p-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[4rem] transition-all shadow-[0_0_80px_rgba(99,102,241,0.6)] active:scale-95"><Send size={64}/></button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* VIEW HUD (Floating) */}
                {!isMaximized && (
                    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 flex bg-black/80 p-4 rounded-[3.5rem] border border-white/10 shadow-3xl backdrop-blur-[100px]">
                        {['MESH', 'FLIGHT_PLAN', 'YIELD', 'WAR_ROOM'].map(id => (
                            <button key={id} onClick={() => setViewMode(id)} className={`flex items-center gap-6 px-16 py-6 rounded-[2.5rem] text-[13px] font-black uppercase tracking-[0.5em] transition-all duration-700 ${viewMode === id ? 'bg-indigo-600 text-white shadow-[0_0_80px_rgba(99,102,241,0.6)] scale-110' : 'text-slate-600 hover:text-white hover:bg-white/5'}`}>
                                {id}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* --- SECTION 3: COMMAND DECK --- */}
            <AnimatePresence>
                {!isMaximized && (
                    <motion.div initial={{ opacity: 0, y: 200 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 200 }} className="z-20 h-80 flex gap-10 shrink-0 mx-4 mb-2">
                        <div className="flex-[2.5] bg-[#020204] border border-white/5 rounded-[5rem] p-16 flex flex-col gap-10 shadow-3xl relative overflow-hidden glass-obsidian">
                            <div className="flex-1 overflow-y-auto custom-scrollbar text-[15px] font-mono space-y-5 text-indigo-400/80 relative z-10">
                                {terminalLines.map((l, i) => (<motion.p initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} key={i} className={l.startsWith('>') ? 'text-white font-black' : 'opacity-60 italic'}>{l}</motion.p>))}
                            </div>
                            <div className="flex items-center gap-12 border-t border-white/10 pt-12 relative z-10">
                                <span className="text-indigo-500 text-5xl font-black animate-pulse">&gt;</span>
                                <input type="text" value={commandInput} onChange={e => setCommandInput(e.target.value)} onKeyDown={handleCommandSubmit} placeholder="INPUT_MISSION_DIRECTIVE..." className="flex-1 bg-transparent border-none outline-none text-4xl text-white font-black uppercase tracking-[0.6em] placeholder:text-slate-900 focus:placeholder:text-slate-800 transition-all" />
                            </div>
                        </div>

                        <div className="flex-[4.5] relative">
                            <AnimatePresence mode="wait">
                                {selectedNexus ? (
                                    <motion.div key="detail" initial={{ opacity: 0, scale: 0.9, y: 100 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 100 }} className="absolute inset-0 bg-white/[0.03] border border-white/10 rounded-[6rem] p-16 backdrop-blur-[120px] flex items-center justify-between shadow-[0_0_150px_rgba(0,0,0,0.9)] glass-obsidian overflow-hidden">
                                        <div className="flex items-center gap-20 relative z-10">
                                            <div className="w-56 h-52 rounded-[5rem] bg-indigo-600 flex items-center justify-center text-white shadow-[0_0_120px_rgba(99,102,241,0.6)] relative overflow-hidden group/icon">
                                                <Briefcase size={100} className="relative z-10 group-hover/icon:scale-110 transition-transform duration-700" />
                                                <div className="absolute inset-0 bg-white/10 animate-shimmer" />
                                            </div>
                                            <div>
                                                <h2 className="text-8xl font-black text-white uppercase tracking-tighter italic leading-none drop-shadow-3xl">{selectedNexus.name}</h2>
                                                <div className="flex items-center gap-12 mt-12">
                                                    <div className="px-10 py-4 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-[2.5rem] text-[16px] font-black uppercase tracking-[0.6em] animate-pulse flex items-center gap-6 shadow-2xl shadow-emerald-900/40"><Unlock size={20} /> DNA_ACCESS_SECURED</div>
                                                    <span className="text-slate-500 text-[16px] font-black uppercase tracking-[0.8em]">CHANNEL_ALPHA_STABLE</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-24 items-center relative z-10">
                                            <div className="grid grid-cols-3 gap-28 text-right">
                                                <NexusMetric label="CapEx_Burn" value="$142/hr" color="text-rose-400" />
                                                <NexusMetric label="Net_Yield" value="+$42k" color="text-emerald-400" />
                                                <NexusMetric label="Temp_Drift" value="+2.5D" color="text-amber-400" />
                                            </div>
                                            <button onClick={() => setSelectedNexusId(null)} className="p-10 bg-white/5 hover:bg-rose-600/20 text-slate-500 hover:text-rose-400 rounded-full border border-white/10 transition-all active:scale-90 shadow-3xl"><X size={56}/></button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div key="portfolio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/40 border border-white/5 rounded-[6rem] flex items-center justify-between p-24 glass-obsidian">
                                        <div className="flex items-center gap-20">
                                            <div className="p-12 bg-indigo-500/10 rounded-[5rem] border border-indigo-500/30 relative shadow-inner">
                                                <CpuIcon2 size={120} className="text-indigo-400 animate-pulse" />
                                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="absolute inset-[-30px] border border-white/5 rounded-full" />
                                            </div>
                                            <div>
                                                <h3 className="text-7xl font-black text-white uppercase tracking-tighter italic leading-none">Portfolio_Hub</h3>
                                                <p className="text-indigo-400 text-[16px] font-bold uppercase tracking-[0.8em] mt-8 flex items-center gap-6"><PulseIcon size={24} className="animate-pulse" /> Global_Handshake_Active</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-20">
                                            <PortfolioMetric icon={DollarSign} label="Empire Value" value={`$${(meshStats.empireValue/1000000).toFixed(1)}M`} color="text-emerald-400" />
                                            <PortfolioMetric icon={Users} label="Personnel" value={meshStats.personnel} color="text-indigo-400" />
                                            <PortfolioMetric icon={Rocket} label="Lattice Nodes" value={meshStats.nodes} color="text-cyan-400" />
                                            <PortfolioMetric icon={Shield} label="Security Index" value="99.8%" color="text-emerald-500" />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// --- COSMIC COMPONENTS ---
const ProjectPlanet = ({ project, isSelected, onSelect, zoom }) => {
    const [angle, setAngle] = useState(project.angleOffset);
    useEffect(() => {
        let animFrame;
        const tick = () => { setAngle(prev => prev + project.speed); animFrame = requestAnimationFrame(tick); };
        tick();
        return () => cancelAnimationFrame(animFrame);
    }, [project.speed]);

    const x = Math.cos(angle) * project.radius;
    const y = Math.sin(angle) * project.radius;
    const z = Math.sin(angle * 2) * 100;

    return (
        <motion.div 
            style={{ position: 'absolute', left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`, translateZ: z, zIndex: Math.round(z) + 2000 }}
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            className={`group crystalline-node p-12 rounded-[5rem] border transition-all duration-1000 cursor-pointer glass-obsidian ${isSelected ? 'border-indigo-500 shadow-[0_0_150px_rgba(99,102,241,0.6)] bg-indigo-600/10 scale-110' : 'hover:border-white/20'}`}
        >
            <div className="flex flex-col items-center gap-10 relative z-10">
                <div className={`p-10 rounded-[3rem] transition-all duration-1000 relative ${isSelected ? 'bg-indigo-600 shadow-3xl' : 'bg-black/60 shadow-inner'}`}>
                    <Activity size={56} className="text-white" />
                    {isSelected && <motion.div animate={{ scale: [1, 1.5], opacity: [0.5, 0] }} transition={{ duration: 1, repeat: Infinity }} className="absolute inset-[-15px] border-4 border-indigo-500 rounded-[4rem]" />}
                </div>
                <div className="space-y-4 text-center">
                    <h3 className={`text-[12px] font-black uppercase tracking-[0.4em] leading-tight line-clamp-2 italic drop-shadow-3xl ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>{project.name}</h3>
                    {zoom > 0.8 && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 justify-center">{Array.from({ length: 12 }).map((_, i) => (<motion.div key={i} animate={{ height: [4, 14, 4] }} transition={{ duration: 0.5+Math.random(), repeat: Infinity }} className="w-1 rounded-full bg-indigo-500/30" />))}</motion.div>)}
                </div>
            </div>
        </motion.div>
    );
};

const BridgeStat = ({ label, value, color, icon: Icon }) => (
    <div className="flex items-center gap-10 px-12 py-8 bg-black/40 border border-white/5 rounded-[3.5rem] group/stat hover:border-indigo-500/30 transition-all backdrop-blur-3xl shadow-3xl">
        <div className={`p-6 rounded-[2.5rem] bg-white/5 text-${color}-400 group-hover/stat:scale-125 transition-transform duration-1000 shadow-2xl`}><Icon size={40} /></div>
        <div className="flex flex-col">
            <span className="text-[13px] font-black text-slate-600 uppercase tracking-[0.6em] mb-2">{label}</span>
            <span className="text-4xl font-black text-white italic tracking-tighter leading-none">{value}</span>
        </div>
    </div>
);

const PortfolioMetric = ({ icon: Icon, label, value, color }) => (
    <div className="flex flex-col gap-5 group/port">
        <div className="flex items-center gap-6">
            <div className={`p-4 rounded-3xl bg-white/5 ${color} group-hover/port:scale-110 transition-transform shadow-xl`}><Icon size={32} /></div>
            <span className="text-[13px] font-black text-slate-600 uppercase tracking-[0.8em]">{label}</span>
        </div>
        <span className={`text-6xl font-black text-white tracking-tighter italic leading-none ml-20 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]`}>{value}</span>
    </div>
);

const NexusMetric = ({ label, value, color }) => (
    <div className="flex flex-col gap-6 group/metric">
        <span className="text-[14px] font-black text-slate-600 uppercase tracking-[0.8em] group-hover/metric:text-indigo-400 transition-colors">{label}</span>
        <span className={`text-7xl font-mono font-black ${color} drop-shadow-[0_0_40px_currentColor] tracking-tighter italic leading-none`}>{value}</span>
    </div>
);