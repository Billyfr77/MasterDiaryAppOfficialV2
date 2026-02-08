import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Play, CheckCircle, Lock, Trophy, BrainCircuit, 
    Zap, Star, Award, ChevronRight, X, Sparkles, 
    Target, Layout, Globe, Briefcase, PenTool, 
    DollarSign, ClipboardCheck, GitBranch, Shield, 
    Smartphone, FileText, Activity, Loader2, Crown,
    ExternalLink, Share2, Printer
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { useDiaryTheme } from '../PaintDiary/ThemeContext';

// --- DATA STRUCTURE WITH LINKS ---
const ACADEMY_DATA = [
    {
        id: 1,
        title: "The Awakening",
        tagline: "Stop Working. Start Architecting.",
        videoUrl: "vY5ext7OSss",
        xp: 100,
        icon: Globe,
        description: "An introduction to the MasterDiaryOS philosophy. Learn how to transition from project management to digital architecture.",
        objectives: [
            { text: "Set up company DNA", link: "/settings" },
            { text: "Tour the Pulse Dashboard", link: "/pulse" }
        ],
        requiredFor: [2, 3, 8],
        category: "Core"
    },
    {
        id: 2,
        title: "GeoCore Map",
        tagline: "Your Project’s Physical Footprint.",
        videoUrl: "7VDVuSq1wTQ",
        xp: 150,
        icon: Target,
        description: "Master the visual mapping engine. Learn how to establish boundaries and geofences for your sites.",
        objectives: [
            { text: "Create your first map zone", link: "/map-builder" },
            { text: "Toggle 3D Satellite mode", link: "/map-builder" }
        ],
        requiredFor: [5],
        category: "Visuals"
    },
    {
        id: 3,
        title: "Neural Quoting",
        tagline: "Estimate at the Speed of Thought.",
        videoUrl: "p1JESN0mH8o",
        xp: 200,
        icon: Layout,
        description: "Moving from lists to node graphs. Learn how to architect financial logic that updates in real-time.",
        objectives: [
            { text: "Build a multi-node quote", link: "/quotes/builder" },
            { text: "Run the Estimation Prism", link: "/quotes" }
        ],
        requiredFor: [5, 7],
        category: "Finance"
    },
    {
        id: 4,
        title: "The Paint Diary",
        tagline: "History Written in Light.",
        videoUrl: "uVOzYkQU4yY",
        xp: 200,
        icon: PenTool,
        description: "Redefining site tracking. Learn how to use the Chronos Engine and recursive time inheritance.",
        objectives: [
            { text: "Link crew to Chronos", link: "/diary" },
            { text: "Add a weather delay impact", link: "/diary" }
        ],
        requiredFor: [5, 9],
        category: "Ops"
    },
    {
        id: 5,
        title: "Invoice Harvest",
        tagline: "The Invoice That Writes Itself.",
        videoUrl: "placeholder_5",
        xp: 150,
        icon: DollarSign,
        description: "Turn site truth into capital. Learn how to harvest diaries and quotes into professional invoices.",
        objectives: [
            { text: "Run a 'Diary Harvest'", link: "/invoices" },
            { text: "Generate a branded PDF invoice", link: "/invoices" }
        ],
        requiredFor: [10],
        category: "Finance"
    },
    {
        id: 6,
        title: "The Iron Shield",
        tagline: "Compliance on Autopilot.",
        videoUrl: "placeholder_6",
        xp: 150,
        icon: Shield,
        description: "AI-driven safety. Learn how the Safety Co-pilot generates compliant documents in seconds.",
        objectives: [
            { text: "Generate a SWMS with AI", link: "/safety" },
            { text: "Plot an Interactive Risk Matrix", link: "/safety" }
        ],
        requiredFor: [7],
        category: "Compliance"
    },
    {
        id: 7,
        title: "Master Architect",
        tagline: "Automation at the Speed of Thought.",
        videoUrl: "placeholder_7",
        xp: 300,
        icon: GitBranch,
        description: "The neural network of your business. Master the Workflow Builder and Level 5 Autonomy.",
        objectives: [
            { text: "Architect a self-healing workflow", link: "/workflows" },
            { text: "Deploy a library template", link: "/workflows" }
        ],
        requiredFor: [10],
        category: "Core"
    },
    {
        id: 8,
        title: "Back to Basics",
        tagline: "The Resource DNA.",
        videoUrl: "placeholder_8",
        xp: 100,
        icon: Briefcase,
        description: "Mastering the registries. Learn the small details of staff, equipment, and client management.",
        objectives: [
            { text: "Define staff skill DNA", link: "/staff" },
            { text: "Log equipment service history", link: "/equipment" }
        ],
        requiredFor: [9],
        category: "Core"
    },
    {
        id: 9,
        title: "Resource Command",
        tagline: "Command Your Fleet, Conquer the Timeline.",
        videoUrl: "placeholder_9",
        xp: 200,
        icon: Activity,
        description: "Visual logistics at scale. Learn how to use the Chronos Grid and the Neural Optimizer.",
        objectives: [
            { text: "Resolve a scheduling conflict", link: "/resources" },
            { text: "Apply a 'Ghost Move'", link: "/resources" }
        ],
        requiredFor: [10],
        category: "Ops"
    },
    {
        id: 10,
        title: "Neural HQ",
        tagline: "The Partner Who Never Sleeps.",
        videoUrl: "placeholder_10",
        xp: 250,
        icon: BrainCircuit,
        description: "The finale of the core series. Master the Sovereign Oracle and the Intelligence Flywheel.",
        objectives: [
            { text: "Consult the War Room Oracle", link: "/hq" },
            { text: "Review Neural Interventions", link: "/hq" }
        ],
        requiredFor: [11],
        category: "Core"
    },
    {
        id: 11,
        title: "Death of Excel",
        tagline: "Spreadsheets are your biggest liability.",
        videoUrl: "placeholder_11",
        xp: 150,
        icon: Zap,
        description: "The competitive edge. Learn why node-based technology is the only future for construction.",
        objectives: [
            { text: "Identify an Excel liability", link: "/" },
            { text: "Verify node-to-AI translation", link: "/quotes" }
        ],
        requiredFor: [],
        category: "Legacy"
    },
    {
        id: 12,
        title: "Field Protocol",
        tagline: "The Site in Your Pocket.",
        videoUrl: "placeholder_12",
        xp: 150,
        icon: Smartphone,
        description: "Bridging the office and the site. Master the mobile diary and photo-evidence trails.",
        objectives: [
            { text: "Capture a PhotoPlane on mobile", link: "/diary" },
            { text: "Use Neural Voice Command", link: "/diary" }
        ],
        requiredFor: [],
        category: "Field"
    },
    {
        id: 13,
        title: "Forensic Intelligence",
        tagline: "Win the Argument Before It Starts.",
        videoUrl: "placeholder_13",
        xp: 200,
        icon: ClipboardCheck,
        description: "The unshakeable digital paper trail. Master Forensic Mode and the Audit Ultra Log.",
        objectives: [
            { text: "Activate the Forensic Lens", link: "/audit" },
            { text: "Export an Audit Evidence Chain", link: "/audit" }
        ],
        requiredFor: [],
        category: "Compliance"
    }
];

// --- CONFETTI COMPONENT ---
const Confetti = () => {
    const particles = Array.from({ length: 50 });
    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
            {particles.map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ 
                        opacity: 1, 
                        x: window.innerWidth / 2, 
                        y: window.innerHeight / 2,
                        scale: 0 
                    }}
                    animate={{ 
                        opacity: 0, 
                        x: window.innerWidth / 2 + (Math.random() - 0.5) * 1500, 
                        y: window.innerHeight / 2 + (Math.random() - 0.5) * 1500,
                        rotate: Math.random() * 720,
                        scale: Math.random() * 2 
                    }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className={`absolute w-3 h-3 rounded-sm ${['bg-indigo-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-white'][Math.floor(Math.random() * 5)]}`}
                />
            ))}
        </div>
    );
};

// --- CERTIFICATE COMPONENT ---
const MasterCertificate = ({ username = "Architect", date = new Date().toLocaleDateString(), onClose }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center p-4 backdrop-blur-xl"
        >
            <div className="relative bg-[#0a0a0c] border-4 border-amber-500/50 w-full max-w-4xl aspect-[1.414/1] p-12 flex flex-col items-center text-center shadow-[0_0_100px_rgba(245,158,11,0.3)] overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
                <div className="absolute inset-0 border-[20px] border-double border-amber-900/20 pointer-events-none" />
                
                {/* Header */}
                <div className="mb-12 relative z-10">
                    <Crown size={64} className="text-amber-500 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]" />
                    <h1 className="text-6xl font-black text-white uppercase tracking-[0.2em] mb-2 font-serif">Certificate</h1>
                    <h2 className="text-2xl font-bold text-amber-500 uppercase tracking-[0.5em]">of Mastery</h2>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-center relative z-10">
                    <p className="text-gray-400 text-lg uppercase tracking-widest mb-4">This certifies that</p>
                    <div className="text-5xl font-black text-white font-script mb-8 italic border-b border-white/10 pb-4 px-12">{username}</div>
                    <p className="text-gray-300 max-w-2xl mx-auto leading-relaxed">
                        Has successfully completed the <strong className="text-amber-400">MasterDiaryOS Architect's Protocol</strong>. 
                        They have demonstrated proficiency in Neural Logic, Recursive Workflows, and Forensic Intelligence.
                    </p>
                </div>

                {/* Footer */}
                <div className="w-full flex justify-between items-end mt-12 relative z-10">
                    <div className="text-left">
                        <div className="h-px w-48 bg-white/20 mb-2" />
                        <p className="text-xs text-gray-500 uppercase tracking-widest">Sovereign Oracle</p>
                        <p className="text-[10px] text-gray-600">AI Verification ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                        <div className="h-px w-48 bg-white/20 mb-2" />
                        <p className="text-xs text-gray-500 uppercase tracking-widest">{date}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="absolute bottom-4 right-4 flex gap-2 print:hidden">
                    <button onClick={() => window.print()} className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors">
                        <Printer size={20} />
                    </button>
                    <button onClick={onClose} className="p-3 bg-white/10 hover:bg-red-500/20 text-white hover:text-red-400 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const EpisodeNode = ({ episode, isLocked, isCompleted, onClick, theme }) => {
    const Icon = episode.icon;
    const hasVideo = episode.videoUrl && !episode.videoUrl.startsWith('placeholder');
    const thumbnailUrl = hasVideo 
        ? `https://img.youtube.com/vi/${episode.videoUrl}/mqdefault.jpg`
        : null;
    
    return (
        <motion.div 
            whileHover={!isLocked ? { scale: 1.05, y: -5 } : {}}
            whileTap={!isLocked ? { scale: 0.95 } : {}}
            onClick={() => !isLocked && onClick(episode)}
            className={`relative rounded-[2rem] border-2 transition-all cursor-pointer group flex flex-col w-64 overflow-hidden
                ${isCompleted ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 
                  isLocked ? 'bg-black/20 border-white/5 opacity-40 grayscale cursor-not-allowed' : 
                  'bg-white/5 border-white/10 hover:border-indigo-500/50 hover:bg-white/10 shadow-2xl'}
            `}
        >
            {/* Cinematic Thumbnail */}
            <div className="relative h-32 w-full overflow-hidden bg-slate-900">
                {thumbnailUrl ? (
                    <img 
                        src={thumbnailUrl} 
                        alt={episode.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-20">
                        <Icon size={40} />
                    </div>
                )}
                {/* Overlay Glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                {/* Play Icon / Locked Icon Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`p-3 rounded-full backdrop-blur-md border border-white/20 ${isLocked ? 'bg-black/40' : 'bg-white/10 group-hover:bg-indigo-600 group-hover:scale-110 transition-all duration-300'}`}>
                        {isLocked ? <Lock size={20} className="text-gray-500" /> : <Play size={20} className="text-white fill-current" />}
                    </div>
                </div>
            </div>

            <div className="p-5 text-center flex flex-col items-center gap-2">
                <h3 className="text-sm font-black uppercase tracking-widest text-white mb-1">{episode.title}</h3>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter line-clamp-1">{episode.tagline}</p>
            </div>

            {isCompleted && (
                <div className="absolute top-2 right-2 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg z-10">
                    <CheckCircle size={14} />
                </div>
            )}

            {!isLocked && !isCompleted && (
                <div className="absolute top-2 left-2 bg-indigo-600 text-white px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg z-10">
                    +{episode.xp} XP
                </div>
            )}
        </motion.div>
    );
};

const Academy = () => {
    const navigate = useNavigate();
    const { addNotification } = useNotification();
    const { theme } = useDiaryTheme();
    const [completedEpisodes, setCompletedEpisodes] = useState(() => {
        const saved = localStorage.getItem('academy_progress');
        return saved ? JSON.parse(saved) : [];
    });
    const [selectedEpisode, setSelectedEpisode] = useState(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [showCertificate, setShowCertificate] = useState(false);
    const [showLevelUp, setShowLevelUp] = useState(null); // Level number

    useEffect(() => {
        localStorage.setItem('academy_progress', JSON.stringify(completedEpisodes));
    }, [completedEpisodes]);

    const userXP = useMemo(() => {
        return ACADEMY_DATA
            .filter(ep => completedEpisodes.includes(ep.id))
            .reduce((sum, ep) => sum + ep.xp, 0);
    }, [completedEpisodes]);

    const userLevel = Math.floor(userXP / 300) + 1;
    const progressToNextLevel = (userXP % 300) / 300 * 100;
    const isMasterArchitect = completedEpisodes.length === ACADEMY_DATA.length;

    // Track level changes for notifications
    const prevLevelRef = useRef(userLevel);
    useEffect(() => {
        if (userLevel > prevLevelRef.current) {
            setShowLevelUp(userLevel);
            setShowConfetti(true);
            setTimeout(() => { setShowConfetti(false); setShowLevelUp(null); }, 4000);
        }
        prevLevelRef.current = userLevel;
    }, [userLevel]);

    const handleEpisodeComplete = (id) => {
        if (!completedEpisodes.includes(id)) {
            setCompletedEpisodes(prev => [...prev, id]);
            addNotification('success', 'Protocol Secured', `+${ACADEMY_DATA.find(e => e.id === id).xp} Neural XP Earned!`);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
        }
    };

    const isEpisodeLocked = (episode) => {
        if (episode.id === 1) return false;
        const parents = ACADEMY_DATA.filter(ep => ep.requiredFor.includes(episode.id));
        if (parents.length === 0) return false; 
        return !parents.some(p => completedEpisodes.includes(p.id));
    };

    const categories = ["Core", "Visuals", "Finance", "Ops", "Compliance", "Legacy", "Field"];

    return (
        <div className="min-h-screen bg-transparent p-8 font-sans relative" style={{ transform: 'translate3d(0,0,0)', backfaceVisibility: 'hidden', isolation: 'isolate' }}>
            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white; color: black; }
                }
            `}</style>

            {showConfetti && <Confetti />}
            {showCertificate && <MasterCertificate onClose={() => setShowCertificate(false)} />}

            {/* LEVEL UP OVERLAY */}
            <AnimatePresence>
                {showLevelUp && (
                    <motion.div 
                        initial={{ scale: 0.5, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        exit={{ scale: 1.5, opacity: 0 }}
                        className="fixed inset-0 z-[500] flex items-center justify-center pointer-events-none"
                    >
                        <div className="bg-indigo-600/90 backdrop-blur-xl p-12 rounded-[3rem] text-center shadow-[0_0_100px_rgba(99,102,241,0.6)] border-4 border-white/20">
                            <Trophy size={80} className="text-yellow-300 mx-auto mb-6 animate-bounce" />
                            <h2 className="text-6xl font-black text-white uppercase tracking-tighter italic mb-2">Level Up!</h2>
                            <p className="text-2xl text-indigo-200 font-bold uppercase tracking-widest">You are now Level {showLevelUp}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header / XP Bar */}
            <div className="max-w-7xl mx-auto mb-16 flex flex-col md:flex-row justify-between items-end gap-8 no-print">
                <div>
                    <h1 className="text-6xl font-black text-white uppercase tracking-tighter italic mb-4">Neural Academy</h1>
                    <div className="flex items-center gap-4">
                        <div className="px-4 py-1 bg-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-xl">
                            Architect's Protocol V1
                        </div>
                        <span className="text-gray-500 font-bold text-xs uppercase tracking-[0.3em]">Status: Evolutionary</span>
                    </div>
                </div>

                <div className="w-full md:w-96 bg-black/40 border border-white/10 rounded-[2.5rem] p-6 shadow-2xl backdrop-blur-xl">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
                                <Crown size={20} />
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Level {userLevel}</div>
                                <div className="text-lg font-black text-white uppercase tracking-tight">
                                    {userLevel >= 10 ? 'Master Architect' : userLevel >= 5 ? 'Senior Architect' : 'Novice Architect'}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Total XP</div>
                            <div className="text-2xl font-black text-white font-mono">{userXP}</div>
                        </div>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progressToNextLevel}%` }}
                            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 shadow-[0_0_15px_#6366f1]"
                        />
                    </div>
                    
                    {isMasterArchitect && (
                        <button 
                            onClick={() => setShowCertificate(true)}
                            className="w-full mt-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-[10px] tracking-widest rounded-xl transition-all shadow-lg animate-pulse"
                        >
                            View Master Certificate
                        </button>
                    )}
                </div>
            </div>

            {/* Knowledge Lattice (Tech Tree) */}
            <div className="max-w-7xl mx-auto no-print">
                {categories.map(cat => (
                    <div key={cat} className="mb-16">
                        <div className="flex items-center gap-4 mb-8 px-4">
                            <h2 className="text-xs font-black text-indigo-400 uppercase tracking-[0.4em]">{cat} Protocols</h2>
                            <div className="h-px bg-white/5 flex-1" />
                        </div>
                        <div className="flex flex-wrap gap-8 justify-center md:justify-start">
                            {ACADEMY_DATA.filter(ep => ep.category === cat).map(ep => (
                                <EpisodeNode 
                                    key={ep.id}
                                    episode={ep}
                                    isLocked={isEpisodeLocked(ep)}
                                    isCompleted={completedEpisodes.includes(ep.id)}
                                    onClick={setSelectedEpisode}
                                    theme={theme}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Cinematic Briefing Room (Video Modal) */}
            <AnimatePresence>
                {selectedEpisode && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4 md:p-12 no-print"
                    >
                        <div className="max-w-6xl w-full flex flex-col gap-8 h-full overflow-y-auto custom-scrollbar pr-4">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-6">
                                    <div className="p-4 bg-indigo-600 rounded-[1.5rem] text-white shadow-2xl">
                                        <selectedEpisode.icon size={32} />
                                    </div>
                                    <div>
                                        <div className="text-indigo-400 font-black uppercase text-[10px] tracking-[0.4em] mb-1">Briefing_Protocol_{selectedEpisode.id}</div>
                                        <h2 className="text-4xl font-black text-white uppercase tracking-tight">{selectedEpisode.title}</h2>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedEpisode(null)}
                                    className="p-4 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all shadow-2xl"
                                >
                                    <X size={32} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                                {/* Video Player */}
                                <div className="xl:col-span-2 space-y-6">
                                    <div className="aspect-video bg-black rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl relative group">
                                        <iframe 
                                            className="w-full h-full"
                                            src={`https://www.youtube.com/embed/${selectedEpisode.videoUrl}?autoplay=1`}
                                            title="YouTube video player"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </div>
                                    <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10">
                                        <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Sparkles size={16} /> Strategy Summary
                                        </h3>
                                        <p className="text-lg text-gray-300 leading-relaxed font-medium">
                                            {selectedEpisode.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Objectives & Actions */}
                                <div className="space-y-8">
                                    <div className="p-8 bg-indigo-600/10 border border-indigo-500/20 rounded-[2.5rem] shadow-2xl">
                                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                            <Target size={18} /> Mission Objectives
                                        </h3>
                                        <div className="space-y-4">
                                            {selectedEpisode.objectives.map((obj, i) => (
                                                <button 
                                                    key={i} 
                                                    onClick={() => navigate(obj.link)}
                                                    className="w-full flex items-center gap-4 group text-left p-3 hover:bg-white/5 rounded-xl transition-all"
                                                >
                                                    <div className="w-8 h-8 rounded-full border-2 border-indigo-500/30 flex items-center justify-center text-indigo-500 group-hover:border-indigo-500 transition-colors shrink-0">
                                                        <ExternalLink size={14} />
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors block">{obj.text}</span>
                                                        <span className="text-[10px] text-indigo-500/60 uppercase font-black tracking-wider">Execute Protocol</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button 
                                            onClick={() => {
                                                handleEpisodeComplete(selectedEpisode.id);
                                                setSelectedEpisode(null);
                                            }}
                                            className={`flex-1 py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] transition-all shadow-3xl flex items-center justify-center gap-4
                                                ${completedEpisodes.includes(selectedEpisode.id) ? 'bg-emerald-600 text-white cursor-default' : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95'}
                                            `}
                                        >
                                            {completedEpisodes.includes(selectedEpisode.id) ? (
                                                <><CheckCircle size={20} /> Objective Secured</>
                                            ) : (
                                                <><Award size={20} /> Complete Mission (+{selectedEpisode.xp} XP)</>
                                            )}
                                        </button>
                                        
                                        <button 
                                            onClick={() => navigate(selectedEpisode.objectives[0].link, { state: { trainingMode: true } })}
                                            className="px-8 py-6 rounded-[2rem] bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 group"
                                        >
                                            <Zap size={20} className="group-hover:text-amber-300" />
                                            <span>Enter Playground</span>
                                        </button>
                                    </div>

                                    <div className="text-center p-4">
                                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                                            Mastering this protocol will unlock {selectedEpisode.requiredFor.length} downstream nodes.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Academy;
