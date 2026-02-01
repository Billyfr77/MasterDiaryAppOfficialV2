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
    Sun, Flame, Rocket, Eye, Cpu as NeuralIcon, RotateCcw, HelpCircle, CheckCircle, Map as MapIcon
} from 'lucide-react';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

export default function ExecutiveHQ() {
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [projects, setProjects] = useState([]);
    const [oracleSignals, setOracleSignals] = useState([]);
    const [meshStats, setMeshStats] = useState({ personnel: 0, nodes: 0, empireValue: 0, activeProjects: 0, totalPaid: 0, netMargin: '0%' });
    const [intelligence, setIntelligence] = useState(null);
    const [systemHealth, setSystemHealth] = useState({ database: 'up', ai_core: 'up', neural_mesh: 'up' });
    const [morningBrief, setMorningBrief] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState(null);
    const [latency, setLatency] = useState(0);
    const [viewMode, setViewMode] = useState('MESH'); 
    const [showArchives, setShowArchives] = useState(false);
    const [selectedNexusId, setSelectedNexusId] = useState(null);
    const [isMaximized, setIsMaximized] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [commandInput, setCommandInput] = useState('');
    const [warRoomInput, setWarRoomInput] = useState('');
    const [warRoomMessages, setWarRoomMessages] = useState([
        { role: 'oracle', content: "Sovereign Intelligence Oracle Online. Galactic mesh is stabilized. Awaiting high-level strategic directives." }
    ]);
    
    const chatEndRef = useRef(null);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [warRoomMessages]);

    // --- INFINITE SPACE NAVIGATION ---
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const isDragging = useRef(false);
    const lastPos = useRef({ x: 0, y: 0 });
    
    // Ref for the viewport div to attach non-passive listener
    const viewportRef = useRef(null);
    // Ref to track viewMode inside the event listener without re-binding
    const viewModeRef = useRef(viewMode);

    useEffect(() => {
        viewModeRef.current = viewMode;
    }, [viewMode]);

    const [terminalLines, setTerminalLines] = useState([
        "> SOVEREIGN_SINGULARITY_OS_V15.5 INITIALIZED",
        "> INSTITUTIONAL_DNA_SYNC: SUCCESSFUL",
        "> LATTICE_GRAVITY: STABLE",
        "> STANDING_BY_FOR_MISSION_DIRECTIVE..."
    ]);

    // ... (fetchMesh logic remains here, skipping for brevity in replacement if not touched)

    useEffect(() => {
        // Attach non-passive wheel listener for zoom
        const viewport = viewportRef.current;
        if (!viewport) return;

        const onWheel = (e) => {
            if (viewModeRef.current !== 'MESH') return;
            e.preventDefault();
            e.stopPropagation();
            const delta = e.deltaY * -0.001;
            setZoom(prev => Math.min(Math.max(0.1, prev + delta), 3.0));
        };

        viewport.addEventListener('wheel', onWheel, { passive: false });

        return () => {
            viewport.removeEventListener('wheel', onWheel);
        };
    }, [loading]); // Re-run when loading finishes and ref is available

    // FORCE LAYOUT RECALCULATION ON MOUNT
    React.useLayoutEffect(() => {
        window.dispatchEvent(new Event('resize'));
    }, []);

    const fetchMesh = async () => {
        const startTime = Date.now();
        setIsSyncing(true);
        try {
            const [pRes, oRes, hRes, bRes] = await Promise.all([
                api.get('/projects'),
                api.get('/intelligence/oracle-stream'),
                api.get('/health').catch(() => ({ data: { services: { database: 'down', ai_core: 'down', neural_mesh: 'down' } } })),
                api.get('/intelligence/morning-brief').catch(() => ({ data: { briefing: null } }))
            ]);
            const pData = pRes.data.data || pRes.data || [];
            setProjects(pData);
            setOracleSignals(oRes.data.signals || []);
            if (oRes.data.stats) setMeshStats(oRes.data.stats);
            if (oRes.data.intelligence) setIntelligence(oRes.data.intelligence);
            if (hRes.data.services) setSystemHealth(hRes.data.services);
            if (bRes.data.briefing) setMorningBrief(bRes.data.briefing);
            setLatency(Date.now() - startTime);
            setLastSync(new Date().toLocaleTimeString());
        } catch (e) { 
            console.error(e);
            setTerminalLines(prev => [...prev, "> MESH_HANDSHAKE_TIMEOUT: RETRYING..."].slice(-12));
        }
        setIsSyncing(false);
        setLoading(false);
    };

    useEffect(() => {
        fetchMesh();
        const interval = setInterval(fetchMesh, 60000);
        
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsMaximized(false);
                setPan({ x: 0, y: 0 });
                setZoom(1);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            clearInterval(interval);
            window.removeEventListener('keydown', handleKeyDown);
        };
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

    // handleWheel removed here as it's now an effect

    const handleCommandSubmit = async (e) => {
        if (e.key === 'Enter' && commandInput.trim()) {
            const raw = commandInput.trim();
            const cmd = raw.toUpperCase();
            setTerminalLines(prev => [...prev, `> ${raw}`, `ANALYZING_INTENT...`].slice(-15));
            setCommandInput('');
            
            // --- 1. SYSTEM COMMANDS ---
            if (['SYNC', 'REFRESH'].includes(cmd)) { fetchMesh(); return; }
            if (cmd === 'CENTER') { setPan({ x: 0, y: 0 }); setZoom(1); return; }
            if (cmd === 'ORACLE') { setViewMode('WAR_ROOM'); return; }
            if (['MAXIMIZE', 'MAX'].includes(cmd)) { setIsMaximized(true); return; }
            
            // --- 2. PROJECT TARGETING ---
            const foundProject = projects.find(p => p.name.toUpperCase().includes(cmd) || p.id.toUpperCase().includes(cmd));
            if (foundProject) {
                setTerminalLines(prev => [...prev, `> TARGET_LATTICE_LOCKED: ${foundProject.name}`].slice(-15));
                setSelectedNexusId(foundProject.id);
                return;
            }

            // --- 3. NATURAL LANGUAGE DELEGATION (WAR ROOM) ---
            // If it's not a command or project, it's a question for the Partner
            setTerminalLines(prev => [...prev, `> DELEGATING_TO_ORACLE...`].slice(-15));
            
            // Transition to War Room
            setViewMode('WAR_ROOM');
            
            // Add to messages and trigger AI
            const userMsg = raw;
            setWarRoomMessages(prev => [...prev, { role: 'user', content: userMsg }]);
            
            try {
                const res = await api.post('/ai/chat-workflow', { 
                    message: userMsg, 
                    context: { 
                        projects, 
                        intelligence,
                        type: 'EXECUTIVE' 
                    } 
                });
                setWarRoomMessages(prev => [...prev, { role: 'oracle', content: res.data.reply }]);
                setTerminalLines(prev => [...prev, `DIRECTIVE_EXECUTION: SOVEREIGN_SUCCESS.`].slice(-15));
            } catch (err) {
                console.error("Auto-Oracle Error:", err);
                setTerminalLines(prev => [...prev, `ORACLE_LINK_FAILURE`].slice(-15));
            }
        }
    };

    const handleWarRoomSend = async () => {
        if (!warRoomInput.trim()) return;
        const msg = warRoomInput;
        setWarRoomInput('');
        setWarRoomMessages(prev => [...prev, { role: 'user', content: msg }]);
        try {
            const res = await api.post('/ai/chat-workflow', { 
                message: msg, 
                context: { 
                    projects, 
                    intelligence, // INJECT FULL BUSINESS INTELLIGENCE
                    type: 'EXECUTIVE' 
                } 
            });
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

    // --- RESPONSIVE ORBITAL ENGINE ---
    const orbitalScale = useMemo(() => {
        const width = window.innerWidth;
        if (width < 1024) return 0.5; // Half size for mobile/small tablets
        if (width < 1440) return 0.8;
        return 1.0;
    }, []);

    const galacticLattice = useMemo(() => {
        // Filter based on Archive Mode
        const visibleProjects = projects.filter(p => 
            showArchives 
                ? (p.status === 'completed' || p.status === 'archived') 
                : (p.status !== 'completed' && p.status !== 'archived')
        );

        // Sort projects by value (largest first) to align by importance
        const sortedProjects = [...visibleProjects].sort((a, b) => {
            const valA = parseFloat(a.financials?.contractValue || a.value || 0);
            const valB = parseFloat(b.financials?.contractValue || b.value || 0);
            return valB - valA;
        });

        return sortedProjects.map((p, i) => {
            const lane = (i % 5) + 1;
            const radius = (220 + (lane * 160)) * orbitalScale; // Balanced radius
            const baseSpeed = 0.004 / lane; // Significantly slower, majestic orbit
            return { ...p, radius, speed: baseSpeed, angleOffset: (i * (360 / (visibleProjects.length || 1))) * (Math.PI / 180), lane, hue: (i * 72) % 360 };
        });
    }, [projects, orbitalScale, showArchives]);

    const selectedNexus = useMemo(() => projects.find(p => p.id === selectedNexusId), [projects, selectedNexusId]);

    // Generate Starfield (Fixed Hook Placement)
    const starfield = useMemo(() => Array.from({ length: 100 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: Math.random() * 2 + 1 + 'px',
        height: Math.random() * 2 + 1 + 'px',
        duration: `${Math.random() * 3 + 2}s`,
        opacity: Math.random()
    })), []);

    if (loading) return (
        <div className="h-screen w-screen bg-[#010102] flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0%,transparent_70%)] animate-pulse" />
            <Loader2 size={120} className="text-indigo-500 animate-spin opacity-30" />
            <div className="absolute font-black text-white/5 text-[15vw] uppercase tracking-[0.5em] select-none">SOVEREIGN</div>
        </div>
    );

    return (
        <div className="min-h-screen w-screen max-w-[100vw] overflow-x-hidden bg-[#010102] text-[#e2e8f0] font-mono custom-scrollbar flex flex-col p-4 gap-4 relative select-none" 
             onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
            
            <style>{`
                .cosmic-nebula {
                    background: 
                        radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
                        radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.15) 0%, transparent 50%),
                        radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 60%),
                        radial-gradient(circle at 10% 90%, rgba(59, 130, 246, 0.1) 0%, transparent 40%);
                    filter: blur(100px); animation: nebula-pulse 60s ease-in-out infinite alternate;
                }
                @keyframes nebula-pulse { 0% { transform: scale(1) rotate(0deg); opacity: 0.8; } 100% { transform: scale(1.4) rotate(20deg); opacity: 1; } }
                .sun-corona {
                    position: absolute; width: 200%; height: 200%; top: -50%; left: -50%;
                    background: radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 60%);
                    animation: pulse-corona 4s ease-in-out infinite alternate;
                }
                @keyframes pulse-corona { 0% { transform: scale(1); opacity: 0.5; } 100% { transform: scale(1.1); opacity: 0.8; } }
                .accretion-disk {
                    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                    width: 400px; height: 400px; border-radius: 50%;
                    border: 2px dashed rgba(99, 102, 241, 0.3);
                    box-shadow: 0 0 50px rgba(99, 102, 241, 0.2);
                    animation: spin-disk 60s linear infinite;
                }
                @keyframes spin-disk { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }
                .orbital-path { border: 1px solid rgba(255,255,255,0.05); border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none; box-shadow: 0 0 20px rgba(255,255,255,0.02); }
                .glass-obsidian { 
                    backdrop-filter: blur(100px); background: rgba(0,0,0,0.6); 
                    border: 1px solid rgba(255,255,255,0.08); 
                    box-shadow: 0 0 80px rgba(0,0,0,0.8), inset 0 0 40px rgba(255,255,255,0.03);
                }
                .galaxy-viewport { perspective: 5000px; cursor: move; min-height: 600px; }
                .transform-style-3d { transform-style: preserve-3d; }
                .star { position: absolute; background: white; border-radius: 50%; animation: twinkle var(--duration) ease-in-out infinite alternate; }
                @keyframes twinkle { 0% { opacity: 0.2; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1.2); } }
            `}</style>

            <div className="fixed inset-0 cosmic-nebula pointer-events-none z-0" />
            
            {/* Dynamic Starfield */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {starfield.map((star) => (
                    <div 
                        key={star.id} 
                        className="star" 
                        style={{
                            left: star.left,
                            top: star.top,
                            width: star.width,
                            height: star.height,
                            '--duration': star.duration,
                            opacity: star.opacity
                        }}
                    />
                ))}
            </div>

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

                        {/* Sovereign Sitrep (Morning Brief) */}
                        {morningBrief && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                className="hidden xl:flex flex-1 max-w-2xl bg-indigo-500/5 border border-indigo-500/20 rounded-[2.5rem] p-6 items-center gap-6 shadow-inner mx-10 relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="p-4 bg-indigo-600 rounded-2xl shadow-lg relative z-10 animate-pulse-slow">
                                    <BrainCircuit size={24} className="text-white" />
                                </div>
                                <div className="relative z-10">
                                    <div className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-1">Sovereign_Sitrep</div>
                                    <p className="text-[11px] font-bold text-gray-300 leading-relaxed italic line-clamp-2">
                                        "{morningBrief}"
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        <div className="flex gap-8 items-center">
                            {/* System Health Indicators */}
                            <div className="flex gap-4 px-8 py-4 bg-black/40 border border-white/5 rounded-3xl backdrop-blur-xl">
                                <HealthIndicator label="DB" status={systemHealth.database} icon={Database} />
                                <HealthIndicator label="AI" status={systemHealth.ai_core} icon={Cpu} />
                                <HealthIndicator label="MESH" status={systemHealth.neural_mesh} icon={Activity} />
                            </div>
                            <BridgeStat label="Neural_Bus" value={`${latency}ms`} color="indigo" icon={Zap} />
                            <BridgeStat label="Integrity" value="99.8%" color="emerald" icon={ShieldCheck} />
                            <div className="flex gap-2">
                                <button onClick={() => { setPan({ x: 0, y: 0 }); setZoom(1); }} className="p-10 bg-white/5 hover:bg-white/10 rounded-[3.5rem] border border-white/10 transition-all group shadow-2xl" title="Reset Camera">
                                    <RotateCcw size={32} className="text-indigo-400 group-hover:rotate-[-180deg] transition-transform duration-700" />
                                </button>
                                <button onClick={() => setIsMaximized(true)} className="p-10 bg-white/5 hover:bg-white/10 rounded-[3.5rem] border border-white/10 transition-all group shadow-2xl"><Maximize2 size={40} className="text-gray-400 group-hover:text-white" /></button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- SECTION 2: THE SOVEREIGN GALAXY VIEWPORT --- */}
            <div 
                ref={viewportRef}
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
                                    <div className="sun-corona pointer-events-none" />
                                    <div className="accretion-disk pointer-events-none" />
                                    
                                    {/* Electron Particles */}
                                    {[0, 120, 240].map((deg, i) => (
                                        <motion.div
                                            key={i}
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "linear" }}
                                            className="absolute top-1/2 left-1/2 w-[320px] h-[320px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                            style={{ rotate: deg }}
                                        >
                                            <div className="w-3 h-3 bg-indigo-400 rounded-full shadow-[0_0_15px_#6366f1] absolute top-0 left-1/2 -translate-x-1/2" />
                                        </motion.div>
                                    ))}

                                    <div className="relative z-20 w-96 h-96 flex items-center justify-center">
                                        {/* Pure Energy Core - No Background Box */}
                                        <motion.div 
                                            animate={{ scale: [1, 1.05, 1], filter: ["brightness(1)", "brightness(1.3)", "brightness(1)"] }}
                                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                            className="relative flex items-center justify-center w-full h-full"
                                        >
                                            <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full animate-pulse-slow" />
                                            {settings.companyLogo ? (
                                                <img 
                                                    src={settings.companyLogo} 
                                                    className={`w-64 h-64 object-contain drop-shadow-[0_0_80px_rgba(99,102,241,0.8)] ${showArchives ? 'grayscale contrast-150' : ''}`} 
                                                    alt="Corp Logo" 
                                                />
                                            ) : (
                                                <Globe size={160} className="text-white drop-shadow-[0_0_60px_rgba(255,255,255,0.5)] animate-pulse" />
                                            )}
                                        </motion.div>
                                    </div>
                                    
                                    {galacticLattice.length === 0 && (
                                        <div className="absolute top-[400px] left-1/2 -translate-x-1/2 w-[400px] text-center">
                                            <p className="text-indigo-400/40 font-black uppercase tracking-[0.4em] animate-pulse">
                                                {showArchives ? 'No Archived Systems Found...' : 'Awaiting Project Manifestation...'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                {galacticLattice.map((p) => (
                                    <ProjectPlanet 
                                        key={p.id} 
                                        project={p} 
                                        isSelected={selectedNexusId === p.id} 
                                        onSelect={() => setSelectedNexusId(p.id)} 
                                        zoom={zoom} 
                                        orbitalScale={orbitalScale}
                                        intelligence={intelligence}
                                        isArchived={showArchives}
                                    />
                                ))}
                            </motion.div>
                        )}
                        {/* FLIGHT_PLAN, YIELD, WAR_ROOM Restoration... */}
                        {viewMode === 'FLIGHT_PLAN' && (
                            <motion.div 
                                key="flight" 
                                initial={{ opacity: 0, x: 200 }} 
                                animate={{ opacity: 1, x: 0 }} 
                                exit={{ opacity: 0, x: -200 }} 
                                className="absolute inset-0 p-32 overflow-y-auto custom-scrollbar bg-[#010102] z-50"
                            >
                                <h2 className="text-7xl font-black uppercase tracking-[0.6em] mb-24 text-indigo-400 flex items-center gap-10 italic drop-shadow-[0_0_30px_rgba(99,102,241,0.4)]"><Navigation size={80} /> Orbit Trajectories</h2>
                                <div className="space-y-20 max-w-6xl mx-auto">
                                    {projects?.map((p, i) => {
                                        const seed = p.id.charCodeAt(0) + (p.id.charCodeAt(p.id.length-1) || 0);
                                        const velocity = (0.8 + (seed % 50) / 100).toFixed(2);
                                        const success = 70 + (seed % 30);
                                        const progress = 30 + (seed % 60);
                                        
                                        return (
                                        <div key={p.id} className="space-y-10 group/trajectory cursor-pointer">
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <span className="text-4xl font-black uppercase tracking-[0.5em] text-white group-hover/trajectory:text-indigo-400 transition-all italic">{p.name}</span>
                                                    <div className="flex items-center gap-6 mt-6"><div className="w-4 h-4 rounded-full bg-indigo-500 animate-ping shadow-[0_0_20px_#6366f1]" /><span className="text-[14px] font-bold text-slate-600 uppercase tracking-[0.8em]">PHASE_DELTA_{('0' + (i+1)).slice(-2)}_SYNCHRONIZED</span></div>
                                                </div>
                                                <div className="flex gap-24 text-right">
                                                    <div><p className="text-[12px] font-black text-slate-600 uppercase tracking-widest">Velocity</p><p className="text-5xl font-mono font-black text-white italic">{velocity}X</p></div>
                                                    <div><p className="text-[12px] font-black text-slate-600 uppercase tracking-widest">Success</p><p className="text-5xl font-mono font-black text-emerald-400 italic">{success}%</p></div>
                                                </div>
                                            </div>
                                            <div className="relative h-32 bg-white/[0.02] border border-white/5 rounded-[4rem] flex items-center px-24 overflow-hidden group-hover/trajectory:bg-white/[0.04] transition-all shadow-3xl">
                                                <div className="h-[4px] bg-slate-900 w-full relative">
                                                    <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 3 }} className="h-full bg-indigo-500 shadow-[0_0_60px_rgba(99,102,241,1)] relative">
                                                        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2"><div className="p-5 bg-white rounded-full shadow-[0_0_40px_white]"><Navigation size={40} className="rotate-90 text-indigo-600 fill-indigo-600" /></div></div>
                                                    </motion.div>
                                                </div>
                                                <div className="absolute right-24 text-slate-800 animate-pulse"><Target size={64} /></div>
                                            </div>
                                        </div>
                                    )})}
                                </div>
                            </motion.div>
                        )}
                        {viewMode === 'YIELD' && (
                            <motion.div 
                                key="yield" 
                                initial={{ opacity: 0, rotateX: 45 }} 
                                animate={{ opacity: 1, rotateX: 0 }} 
                                exit={{ opacity: 0, rotateX: -45 }} 
                                className="absolute inset-0 p-32 overflow-y-auto custom-scrollbar bg-[#010102] z-50"
                            >
                                <h2 className="text-7xl font-black uppercase tracking-[0.6em] mb-24 text-emerald-400 flex items-center gap-10 italic drop-shadow-[0_0_30px_rgba(16,185,129,0.4)]"><TrendingUp size={80} /> Yield Surface</h2>
                                <div className="grid grid-cols-1 gap-12">
                                    {projects?.map((p, i) => {
                                        const seed = p.id.charCodeAt(0) + (p.id.charCodeAt(p.id.length-1) || 0);
                                        const weighting = (5 + (seed % 20)).toFixed(1);
                                        const yieldVal = (50 + (seed % 200));
                                        const confidence = (85 + (seed % 14)).toFixed(1);
                                        const isPositive = seed % 10 > 2;

                                        return (
                                        <div key={p.id} className="p-20 bg-white/[0.01] border border-white/5 rounded-[6rem] flex items-center justify-between group hover:bg-emerald-500/5 hover:border-emerald-500/30 transition-all duration-1000 relative overflow-hidden shadow-3xl glass-obsidian">
                                            <div className="absolute left-0 top-0 bottom-0 w-4 bg-emerald-500/20 group-hover:bg-emerald-500 transition-all duration-1000 shadow-[0_0_50px_#10b981]" />
                                            <div className="flex items-center gap-20 relative z-10">
                                                <div className="w-40 h-40 rounded-[4.5rem] bg-black/60 border border-white/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:shadow-[0_0_80px_rgba(16,185,129,0.4)] transition-all duration-1000"><DollarSign size={72} /></div>
                                                <div><div className="text-5xl font-black text-white uppercase tracking-[0.3em] italic leading-tight">{p.name}</div><div className="text-[15px] text-slate-500 font-bold uppercase tracking-[0.8em] mt-6 flex items-center gap-5"><div className="w-3 h-3 rounded-full bg-emerald-500" /> CONFIDENCE_INDEX: {confidence}%</div></div>
                                            </div>
                                            <div className="flex gap-40 text-right relative z-10">
                                                <div><span className="text-[14px] font-black text-slate-600 uppercase tracking-[0.8em] block mb-6">Weighting</span><span className="text-7xl font-mono font-black text-white tracking-tighter italic">{weighting}%</span></div>
                                                <div><span className="text-[14px] font-black text-slate-600 uppercase tracking-[0.8em] block mb-6">Yield_Delta</span><span className={`text-7xl font-mono font-black tracking-tighter terminal-glow italic ${isPositive ? 'text-emerald-400' : 'text-rose-500'}`}>{isPositive ? '+' : '-'}${yieldVal}k</span></div>
                                            </div>
                                        </div>
                                    )})}
                                </div>
                            </motion.div>
                        )}
                        {viewMode === 'WAR_ROOM' && (
                            <motion.div 
                                key="war" 
                                initial={{ opacity: 0, scale: 0.98 }} 
                                animate={{ opacity: 1, scale: 1 }} 
                                exit={{ opacity: 0, scale: 1.02 }} 
                                className="absolute inset-0 p-12 flex flex-col gap-6 bg-[#010102] z-50"
                            >
                                <div className="flex justify-between items-center px-10">
                                    <h2 className="text-4xl font-black uppercase tracking-[0.4em] text-indigo-400 italic">Oracle War Room</h2>
                                    <button onClick={() => setWarRoomMessages([{ role: 'oracle', content: "Sovereign Intelligence Oracle Online. Galactic mesh is stabilized." }])} className="px-6 py-2 bg-white/5 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded-xl border border-white/5 transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                                        <RotateCcw size={14} /> Clear Log
                                    </button>
                                </div>

                                <div className="flex-1 bg-black/60 border border-white/10 rounded-[3rem] p-10 overflow-y-auto custom-scrollbar flex flex-col gap-8 shadow-inner glass-obsidian">
                                    {warRoomMessages.map((m, i) => (
                                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] p-8 rounded-[2.5rem] text-sm leading-relaxed shadow-2xl border transition-all ${
                                                m.role === 'user' 
                                                ? 'bg-indigo-600 border-indigo-400 text-white font-bold rounded-br-none' 
                                                : 'bg-white/[0.03] border-white/10 text-indigo-100 rounded-bl-none'
                                            }`}>
                                                {m.role === 'oracle' && (
                                                    <div className="flex items-center gap-3 mb-4 text-indigo-400 font-black uppercase text-[9px] tracking-[0.4em] border-b border-indigo-500/20 pb-3">
                                                        <Sparkles size={14}/> Advice from your Partner
                                                    </div>
                                                )}
                                                <div className="whitespace-pre-wrap">{m.content}</div>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={chatEndRef} />
                                </div>

                                <div className="relative px-4 pb-4 shrink-0 group">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[3rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                    <div className="relative flex items-center bg-stone-900/80 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl focus-within:border-indigo-500/50 transition-all">
                                        <div className="pl-8 text-indigo-500">
                                            <MessageSquare size={24} />
                                        </div>
                                        <input 
                                            type="text" 
                                            value={warRoomInput} 
                                            onChange={e => setWarRoomInput(e.target.value)} 
                                            onKeyDown={e => e.key === 'Enter' && handleWarRoomSend()} 
                                            placeholder="Ask a simple question about your business..." 
                                            className="flex-1 bg-transparent border-none outline-none px-6 py-10 text-lg text-white font-medium placeholder:text-slate-700 tracking-wide" 
                                        />
                                        <button 
                                            onClick={handleWarRoomSend} 
                                            disabled={!warRoomInput.trim()}
                                            className="mr-6 p-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-all shadow-lg disabled:opacity-20 disabled:scale-95 active:scale-90"
                                        >
                                            <Send size={24}/>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* VIEW HUD (Floating) */}
                {!isMaximized && (
                    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-black/80 p-4 rounded-[3.5rem] border border-white/10 shadow-3xl backdrop-blur-[100px]">
                        {/* Archive Toggle Switch */}
                        <button 
                            onClick={() => setShowArchives(!showArchives)}
                            className={`p-6 rounded-full border transition-all flex items-center gap-3 group ${showArchives ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20'}`}
                            title={showArchives ? "Return to Active Systems" : "View Legacy Archives"}
                        >
                            <Clock size={24} className={showArchives ? "text-amber-400" : "text-indigo-400"} />
                        </button>
                        <div className="h-10 w-px bg-white/10 mx-2" />

                        <div className="flex gap-2">
                            {['MESH', 'FLIGHT_PLAN', 'YIELD', 'WAR_ROOM'].map(id => (
                                <button key={id} onClick={() => setViewMode(id)} className={`flex items-center gap-6 px-12 py-6 rounded-[2.5rem] text-[13px] font-black uppercase tracking-[0.5em] transition-all duration-700 ${viewMode === id ? 'bg-indigo-600 text-white shadow-[0_0_80px_rgba(99,102,241,0.6)] scale-110' : 'text-slate-600 hover:text-white hover:bg-white/5'}`}>
                                    {id}
                                </button>
                            ))}
                        </div>
                        <div className="h-10 w-px bg-white/10 mx-2" />
                        <button 
                            onClick={() => setShowHelp(true)}
                            className="p-6 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-full border border-indigo-500/20 transition-all flex items-center gap-3 group"
                        >
                            <HelpCircle size={24} />
                            <span className="max-w-0 overflow-hidden group-hover:max-w-[150px] transition-all duration-500 whitespace-nowrap text-[10px] font-black uppercase tracking-widest">How this helps</span>
                        </button>
                    </div>
                )}

                {/* HELP OVERLAY */}
                <AnimatePresence>
                    {showHelp && (
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-2xl p-24 flex items-center justify-center"
                            onClick={() => setShowHelp(false)}
                        >
                            <motion.div 
                                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                                className="bg-stone-900 border border-white/10 rounded-[4rem] p-20 max-w-4xl shadow-2xl relative"
                                onClick={e => e.stopPropagation()}
                            >
                                <button onClick={() => setShowHelp(false)} className="absolute top-10 right-10 p-4 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-all"><X size={32}/></button>
                                
                                <div className="flex items-center gap-6 mb-12">
                                    <div className="p-5 bg-indigo-600 rounded-3xl text-white shadow-xl"><BrainCircuit size={48} /></div>
                                    <h2 className="text-5xl font-black text-white uppercase tracking-tighter">Your AI Partner</h2>
                                </div>

                                <div className="grid grid-cols-2 gap-12">
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-bold text-indigo-400 flex items-center gap-3"><Globe size={24}/> The Neural Mesh</h3>
                                        <p className="text-lg text-gray-400 leading-relaxed">Each project orbits your core logo. If a project glows red, it needs your attention. Green means it is profitable and on track.</p>
                                    </div>
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-bold text-indigo-400 flex items-center gap-3"><MessageSquare size={24}/> The War Room</h3>
                                        <p className="text-lg text-gray-400 leading-relaxed">Talk to the Oracle like a real business partner. Ask things like "How much did I spend yesterday?" or "Which client is best?" in plain English.</p>
                                    </div>
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-bold text-indigo-400 flex items-center gap-3"><Target size={24}/> Actionable Planning</h3>
                                        <p className="text-lg text-gray-400 leading-relaxed">Use the input bar at the bottom to give direct instructions. You don't need complex menus—just type what you want to achieve.</p>
                                    </div>
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-bold text-indigo-400 flex items-center gap-3"><CheckCircle size={24}/> Simple Decisions</h3>
                                        <p className="text-lg text-gray-400 leading-relaxed">The AI simplifies complex data into a few clear options. It ensures you are always on the right path without getting overwhelmed.</p>
                                    </div>
                                </div>

                                <button onClick={() => setShowHelp(false)} className="mt-16 w-full py-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] shadow-xl transition-all">I understand, let's go</button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* --- SECTION 3: COMMAND DECK --- */}
            <AnimatePresence>
                {!isMaximized && (
                    <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="z-20 h-64 flex gap-6 shrink-0 mx-4 mb-4">
                        {/* Friendly Activity Feed -> STRATEGIC INTERVENTION FEED */}
                        <div className="flex-[1.8] bg-indigo-950/20 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 flex flex-col gap-4 shadow-2xl overflow-hidden relative group">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-75"></div>
                                    <Activity size={18} className="text-indigo-400 relative z-10" />
                                </div>
                                <h3 className="text-xs font-bold text-white uppercase tracking-widest opacity-60">Neural Interventions</h3>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                                {oracleSignals.length > 0 ? oracleSignals.slice(0, 5).map((s, i) => (
                                    <div key={i} className="flex items-start gap-3 animate-fade-in group/signal cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-all">
                                        <div className={`mt-1 w-1.5 h-1.5 rounded-full ${s.severity === 'high' ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 'bg-emerald-500'}`} />
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">{s.signal}</p>
                                            <p className="text-[11px] font-medium text-indigo-100/90 leading-tight">{s.desc}</p>
                                        </div>
                                        {s.severity === 'high' && <button onClick={() => handleExecuteProtocol(s)} className="ml-auto opacity-0 group-hover/signal:opacity-100 text-[8px] font-bold bg-rose-500/20 text-rose-400 px-2 py-1 rounded hover:bg-rose-500 hover:text-white transition-all">RESOLVE</button>}
                                    </div>
                                )) : (
                                    terminalLines.slice(-5).map((l, i) => (
                                        <div key={i} className="flex items-center gap-3 animate-fade-in">
                                            <div className="w-1 h-1 rounded-full bg-indigo-500/40" />
                                            <p className="text-[10px] font-medium text-indigo-200/70">{l.replace('>', '').replace('_', ' ')}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Main Content Area: Portfolio or Nexus Details */}
                        <div className="flex-[6] relative group">
                            <AnimatePresence mode="wait">
                                {selectedNexus ? (
                                    <motion.div 
                                        key="detail" 
                                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                        className="absolute inset-0 bg-indigo-900/20 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 flex items-center justify-between shadow-2xl overflow-hidden"
                                    >
                                        <div className="flex items-center gap-10 relative z-10">
                                            <div className="w-24 h-24 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl relative overflow-hidden">
                                                <Briefcase size={32} className="relative z-10" />
                                                <div className="absolute inset-0 bg-white/10 animate-shimmer" />
                                            </div>
                                            <div>
                                                <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">{selectedNexus.name}</h2>
                                                <div className="flex items-center gap-4 mt-3">
                                                    <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-2">
                                                        <Unlock size={10} /> SECURED
                                                    </div>
                                                    <span className="text-slate-500 text-[8px] font-black uppercase tracking-widest">ACTIVE_CHANNEL</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-10 items-center relative z-10">
                                            <div className="grid grid-cols-3 gap-10 text-right">
                                                <NexusMetric label="Burn Rate" value="$142/h" color="text-rose-400" />
                                                <NexusMetric label="Profit" value="+$42k" color="text-emerald-400" />
                                                <NexusMetric label="Drift" value="+2.5D" color="text-amber-400" />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <button 
                                                    onClick={() => navigate('/projects', { state: { openProjectId: selectedNexus.id } })}
                                                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center gap-2 shadow-xl transition-all active:scale-95"
                                                >
                                                    <Rocket size={14} /> LAUNCH
                                                </button>
                                                <button onClick={() => setSelectedNexusId(null)} className="p-3 bg-white/5 hover:bg-rose-600/20 text-slate-500 hover:text-rose-400 rounded-full border border-white/10 transition-all flex items-center justify-center">
                                                    <X size={20}/>
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="portfolio" 
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="absolute inset-0 bg-stone-900/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 flex items-center justify-between shadow-2xl overflow-hidden"
                                    >
                                        <div className="flex items-center gap-10 relative z-10">
                                            <div className="p-6 bg-indigo-500/10 rounded-[1.5rem] border border-indigo-500/30 relative shadow-inner">
                                                <NeuralIcon size={48} className="text-indigo-400 animate-pulse" />
                                            </div>
                                            <div>
                                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">Portfolio Hub</h3>
                                                <p className="text-indigo-400 text-[9px] font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                                                    <PulseIcon size={12} className="animate-pulse" /> Live_Sync_Active
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-3 gap-x-12 gap-y-6 relative z-10">
                                            <PortfolioMetric icon={DollarSign} label="Paid Capital" value={`$${(meshStats.totalPaid/1000000).toFixed(2)}M`} color="text-emerald-400" />
                                            <PortfolioMetric icon={TrendingUp} label="Net Margin" value={meshStats.netMargin} color="text-indigo-400" />
                                            <PortfolioMetric icon={Users} label="Contention" value={`${Math.round((intelligence?.mesh?.resourceContentionIndex || 0) * 100)}%`} color="text-rose-400" />
                                            <PortfolioMetric icon={Activity} label="Velocity Drift" value={intelligence?.mesh?.velocityDrift || '0.00'} color={parseFloat(intelligence?.mesh?.velocityDrift) > 0 ? 'text-rose-500' : 'text-emerald-400'} />
                                            <PortfolioMetric icon={Target} label="Lattice Accuracy" value={intelligence?.oracle?.bidSuccessProbability || '0%'} color="text-cyan-400" />
                                            <PortfolioMetric icon={ShieldCheck} label="Mesh Integrity" value={`${Math.round((intelligence?.mesh?.integrity || 0) * 100)}%`} color="text-indigo-400" />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Interactive Guiding Partner Input */}
                        <div className="flex-[3.5] bg-indigo-950/20 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-4 flex flex-col justify-center relative shadow-2xl focus-within:border-indigo-500/50 transition-all">
                            <div className="absolute top-[-15px] left-12 px-6 py-1.5 bg-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-xl flex items-center gap-2">
                                <BrainCircuit size={12} /> AI Guiding Partner
                            </div>
                            
                            <div className="flex items-center gap-4 px-8">
                                <Search size={20} className="text-indigo-500/40" />
                                <input 
                                    type="text" 
                                    value={commandInput} 
                                    onChange={e => setCommandInput(e.target.value)} 
                                    onKeyDown={handleCommandSubmit} 
                                    placeholder="Ask your partner..." 
                                    className="flex-1 bg-transparent border-none outline-none text-xl text-white font-medium placeholder:text-stone-700 transition-all py-4" 
                                />
                                <button 
                                    onClick={() => handleCommandSubmit({ key: 'Enter' })}
                                    className="p-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-xl transition-all active:scale-95 group"
                                >
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// --- COSMIC COMPONENTS ---
const ProjectPlanet = ({ project, isSelected, onSelect, zoom, orbitalScale, intelligence, isArchived }) => {
    const [angle, setAngle] = useState(project.angleOffset);
    const [isHovered, setIsHovered] = useState(false);
    
    // Derived Intelligence for this project
    const projectInsight = useMemo(() => {
        return intelligence?.patterns?.find(p => p.projectId === project.id || project.name.includes(p.taskType));
    }, [intelligence, project]);

    const isProfitable = project.financials?.profit > 0;
    
    // VISUAL LOGIC: Archive Mode vs Active Mode
    let planetColor, glowColor;
    if (isArchived) {
        // Archive Mode: Pure Green (Success) or Pure Red (Failure)
        planetColor = isProfitable ? '#10b981' : '#f43f5e'; // Emerald-500 vs Rose-500
        glowColor = isProfitable ? 'rgba(16, 185, 129, 0.6)' : 'rgba(244, 63, 94, 0.6)';
    } else {
        // Active Mode: Gold (Profitable) vs Red-Orange (Risk)
        planetColor = isProfitable ? '#FFD700' : '#FF4500';
        glowColor = isProfitable ? 'rgba(255, 215, 0, 0.4)' : 'rgba(255, 69, 0, 0.4)';
    }

    useEffect(() => {
        let animFrame;
        const tick = () => { setAngle(prev => prev + project.speed); animFrame = requestAnimationFrame(tick); };
        tick();
        return () => cancelAnimationFrame(animFrame);
    }, [project.speed]);

    const x = Math.cos(angle) * project.radius;
    const y = Math.sin(angle) * project.radius;
    const z = Math.sin(angle * 2) * 50;

    return (
        <motion.div 
            style={{ 
                position: 'absolute', 
                left: `calc(50% + ${x}px)`, 
                top: `calc(50% + ${y}px)`, 
                zIndex: Math.round(z) + 2000 
            }}
            animate={{ transform: `translate(-50%, -50%) translateZ(${z}px)` }}
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`group crystalline-node cursor-pointer`}
        >
            {/* Comet Trail */}
            <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-40 blur-xl"
                style={{ 
                    width: project.radius * 2.2, // Slightly larger than orbit
                    height: project.radius * 2.2, 
                    background: `conic-gradient(from ${angle + Math.PI}rad, transparent 0deg, transparent 300deg, ${planetColor} 360deg)`,
                    borderRadius: '50%',
                    maskImage: 'radial-gradient(transparent 65%, black 70%)'
                }}
            />

            {/* Neural Tether (Line to Sun) */}
            <motion.div 
                animate={{ opacity: [0.1, 0.4, 0.1], width: [project.radius, project.radius + 10, project.radius] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 left-1/2 origin-left pointer-events-none"
                style={{ 
                    height: '1px', 
                    background: `linear-gradient(to right, transparent, ${planetColor})`,
                    transform: `rotate(${angle + Math.PI}rad) translateX(${orbitalScale * 100}px)`
                }}
            />

            {/* Smart Insight Badge (Hovering above planet) */}
            <AnimatePresence>
                {projectInsight && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: -60 }}
                        className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap z-50 pointer-events-none"
                    >
                        <div className="bg-black/80 backdrop-blur-md border border-white/20 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-2xl">
                            <Sparkles size={12} className={isProfitable ? 'text-amber-400' : 'text-rose-500'} />
                            <span className="text-[8px] font-black uppercase tracking-widest text-white">
                                {projectInsight.fix?.split('(')[0] || 'Insight Detected'}
                            </span>
                        </div>
                        <div className="w-px h-8 bg-white/20 mx-auto" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* HOVER INFO CARD */}
            <AnimatePresence>
                {isHovered && !isSelected && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8, y: 20 }} 
                        animate={{ opacity: 1, scale: 1, y: -140 }} 
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="absolute left-1/2 -translate-x-1/2 z-[100] w-64 bg-stone-900/90 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-[0_0_50px_rgba(0,0,0,0.8)] pointer-events-none"
                    >
                        <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1 line-clamp-1">{project.name}</h4>
                        <div className="text-[10px] text-gray-400 font-bold mb-3 flex items-center gap-1"><Users size={10} /> {project.client || 'Unknown Client'}</div>
                        <div className="grid grid-cols-2 gap-2 border-t border-white/10 pt-3">
                            <div>
                                <div className="text-[8px] text-gray-500 uppercase font-black">Value</div>
                                <div className="text-sm font-mono font-bold text-emerald-400">${(project.financials?.contractValue || project.value || 0).toLocaleString()}</div>
                            </div>
                            <div>
                                <div className="text-[8px] text-gray-500 uppercase font-black">Status</div>
                                <div className={`text-xs font-bold uppercase ${project.status === 'active' ? 'text-indigo-400' : 'text-gray-400'}`}>{project.status}</div>
                            </div>
                        </div>
                        {project.site && <div className="mt-2 pt-2 border-t border-white/10 text-[9px] text-gray-500 font-bold flex items-center gap-1"><MapIcon size={10} /> {project.site}</div>}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col items-center gap-6 relative z-10">
                {/* Neon Planet Core */}
                <div 
                    className={`relative w-20 h-24 rounded-[3rem] transition-all duration-1000 flex items-center justify-center border-2`}
                    style={{ 
                        backgroundColor: isSelected ? planetColor : 'rgba(0,0,0,0.6)',
                        borderColor: isSelected ? '#fff' : planetColor,
                        boxShadow: `0 0 40px ${glowColor}, inset 0 0 20px ${glowColor}`
                    }}
                >
                    <Activity size={32} className={isSelected ? 'text-black' : 'text-white'} />
                    
                    {/* Atmospheric Ring */}
                    <div 
                        className="absolute inset-[-10px] border border-white/5 rounded-[4rem] animate-spin-slow" 
                        style={{ borderTopColor: planetColor, borderRightColor: planetColor }}
                    />
                    
                    {/* Status Pulse */}
                    {isSelected && (
                        <motion.div 
                            animate={{ scale: [1, 1.4], opacity: [0.5, 0] }} 
                            transition={{ duration: 1.5, repeat: Infinity }} 
                            className="absolute inset-[-20px] border-2 rounded-[5rem]"
                            style={{ borderColor: planetColor }}
                        />
                    )}
                </div>

                <div className="space-y-2 text-center max-w-[150px]">
                    <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] leading-tight line-clamp-2 italic drop-shadow-2xl ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                        {project.name}
                    </h3>
                    <div className="flex items-center justify-center gap-2">
                        <span className={`text-[8px] font-mono font-bold ${isProfitable ? (isArchived ? 'text-emerald-400' : 'text-amber-400') : 'text-rose-500'}`}>
                            {isProfitable ? (isArchived ? 'LEGACY_SUCCESS' : 'YIELD_POSITIVE') : 'RISK_DETECTED'}
                        </span>
                    </div>
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
    <div className="flex flex-col gap-2 group/port">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-white/5 ${color} group-hover/port:scale-110 transition-transform shadow-xl`}><Icon size={16} /></div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{label}</span>
        </div>
        <span className={`text-3xl font-black text-white tracking-tighter italic leading-none ml-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]`}>{value}</span>
    </div>
);

const NexusMetric = ({ label, value, color }) => (
    <div className="flex flex-col gap-2 group/metric">
        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover/metric:text-indigo-400 transition-colors">{label}</span>
        <span className={`text-2xl font-mono font-black ${color} drop-shadow-[0_0_20px_currentColor] tracking-tighter italic leading-none`}>{value}</span>
    </div>
);

const HealthIndicator = ({ label, status, icon: Icon }) => (
    <div className="flex flex-col items-center gap-1 group/health">
        <div className={`p-2 rounded-lg transition-all duration-500 ${status === 'up' || status === 'nominal' ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-rose-500/20 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.3)] animate-pulse'}`}>
            <Icon size={14} />
        </div>
        <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
);