/*
 * MasterDiaryApp Official - Masterpiece Login System v3.0 (The Singularity)
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 * 
 * "THE SINGULARITY"
 * Features:
 * - 3D Holographic Tilt (Mouse-reactive)
 * - Quantum Particle Field (Canvas)
 * - Typewriter Data Stream
 * - Magnetic UI Elements
 * - Aurora Borealis Backgrounds
 */

import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { 
    LogIn, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle, 
    Hexagon, Activity, ShieldCheck, Globe, Zap, Cpu, Layers,
    Scan, Wifi, Fingerprint
} from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';

// --- ADVANCED VISUAL FX ---

const ParticleField = ({ mouseX, mouseY }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 1.5 + 0.2;
                this.baseX = this.x;
                this.baseY = this.y;
                this.density = (Math.random() * 30) + 1;
                this.color = Math.random() > 0.5 ? '99, 102, 241' : '168, 85, 247'; // Indigo vs Purple
            }

            draw() {
                ctx.fillStyle = `rgba(${this.color}, 0.5)`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }

            update(mX, mY) {
                const dx = mX - this.x;
                const dy = mY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const maxDistance = 150; // Interaction radius
                const force = (maxDistance - distance) / maxDistance;
                const directionX = forceDirectionX * force * this.density;
                const directionY = forceDirectionY * force * this.density;

                if (distance < maxDistance) {
                    this.x -= directionX;
                    this.y -= directionY;
                } else {
                    if (this.x !== this.baseX) {
                        const dx = this.x - this.baseX;
                        this.x -= dx / 10;
                    }
                    if (this.y !== this.baseY) {
                        const dy = this.y - this.baseY;
                        this.y -= dy / 10;
                    }
                }
            }
        }

        const init = () => {
            particles = [];
            for (let i = 0; i < 120; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Mouse Parallax Logic
            // We use a slight offset based on the mouse position relative to center
            const mX = mouseX.get() || -1000;
            const mY = mouseY.get() || -1000;

            particles.forEach(particle => {
                particle.update(mX, mY);
                particle.draw();
            });
            
            // Connect particles
            particles.forEach((a, i) => {
                particles.slice(i + 1).forEach(b => {
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 120) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(99, 102, 241, ${0.12 - distance / 1000})`;
                        ctx.lineWidth = 0.3;
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                });
            });
            animationFrameId = requestAnimationFrame(animate);
        };

        init();
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, [mouseX, mouseY]);

    return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-60" />;
};

const TypewriterText = ({ text, delay = 0 }) => {
    const [displayedText, setDisplayedText] = useState('');
    
    useEffect(() => {
        const timeout = setTimeout(() => {
            let currentIndex = 0;
            const interval = setInterval(() => {
                if (currentIndex <= text.length) {
                    setDisplayedText(text.slice(0, currentIndex));
                    currentIndex++;
                } else {
                    clearInterval(interval);
                }
            }, 30); // Typing speed
            return () => clearInterval(interval);
        }, delay * 1000);
        return () => clearTimeout(timeout);
    }, [text, delay]);

    return (
        <span className="font-mono text-indigo-300/80">
            {displayedText}
            <span className="animate-pulse">_</span>
        </span>
    );
};

const FeatureItem = ({ icon: Icon, title, desc, delay }) => (
    <motion.div 
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay, duration: 0.6, ease: "easeOut" }}
        className="group relative flex items-start gap-5 p-5 rounded-3xl backdrop-blur-md transition-all duration-500 cursor-default hover:bg-white/[0.03]"
    >
        {/* Hover Gradient Border */}
        <div className="absolute inset-0 rounded-3xl border border-white/5 group-hover:border-indigo-500/30 transition-colors duration-500" />
        
        <div className="p-3.5 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl text-indigo-400 group-hover:text-white group-hover:scale-110 transition-all duration-300 ring-1 ring-white/10 group-hover:ring-indigo-500/50 shadow-lg shadow-indigo-500/5 group-hover:shadow-indigo-500/20">
            <Icon size={24} strokeWidth={1.5} />
        </div>
        <div>
            <h3 className="text-white font-bold text-base mb-1 group-hover:text-indigo-300 transition-colors tracking-wide">{title}</h3>
            <p className="text-gray-500 text-xs leading-relaxed group-hover:text-gray-400 transition-colors">{desc}</p>
        </div>
    </motion.div>
);

const FloatingInput = ({ icon: Icon, type, placeholder, value, onChange, required, delay }) => (
    <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay, duration: 0.4 }}
        className="relative group"
    >
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
            <Icon className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors duration-300" />
        </div>
        <input
            type={type}
            className="block w-full pl-14 pr-12 py-4.5 bg-[#0F0F11] border border-white/5 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 focus:bg-[#131316] transition-all duration-300 text-sm font-medium tracking-wide shadow-inner"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
        />
        {/* Status Indicator */}
        <div className="absolute inset-y-0 right-4 flex items-center">
            <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${value.length > 0 ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-gray-700'}`} />
        </div>
    </motion.div>
);

// --- MAIN LOGIN COMPONENT ---

const Login = ({ onLogin }) => {
    const navigate = useNavigate();
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '', username: '' });
    const [status, setStatus] = useState({ error: '', success: '', loading: false });

    // Mouse Physics
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseX = useSpring(x, { stiffness: 50, damping: 20 }); // For Particle Field
    const mouseY = useSpring(y, { stiffness: 50, damping: 20 });

    // Card Tilt Physics
    const rotateX = useTransform(y, [0, window.innerHeight], [5, -5]);
    const rotateY = useTransform(x, [0, window.innerWidth], [-5, 5]);

    useEffect(() => {
        const handleMouseMove = (e) => {
            x.set(e.clientX);
            y.set(e.clientY);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [x, y]);

    // Auto-login check
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            onLogin(token);
            navigate('/dashboard');
        }
    }, [navigate, onLogin]);

    const handleInputChange = (e, field) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ error: '', success: '', loading: true });

        try {
            const endpoint = isRegister ? '/auth/register' : '/auth/login';
            const payload = isRegister 
                ? { ...formData, role: 'manager' } 
                : { email: formData.email, password: formData.password };

            const response = await api.post(endpoint, payload);

            if (isRegister) {
                setStatus({ error: '', success: 'Identity verified. Access grid initialized.', loading: false });
                setTimeout(() => {
                    setIsRegister(false);
                    setFormData({ email: '', password: '', username: '' });
                    setStatus(prev => ({ ...prev, success: '' }));
                }, 2000);
            } else {
                localStorage.setItem('token', response.data.accessToken);
                onLogin(response.data.accessToken);
            }
        } catch (err) {
            setStatus({ 
                error: err.response?.data?.error || 'Authentication Protocol Failed.', 
                success: '', 
                loading: false 
            });
        }
    };

    return (
        <div className="min-h-screen bg-[#030305] flex font-sans overflow-hidden selection:bg-indigo-500/30 selection:text-white relative perspective-1000">
            
            {/* AMBIENT BACKGROUND LIGHTING (AURORA) */}
            <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse-slow" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse-slow delay-1000" />
            
            {/* CANVAS INTERACTIVE LAYER */}
            <ParticleField mouseX={mouseX} mouseY={mouseY} />

            {/* GRID OVERLAY */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
            
            {/* LEFT: BRAND & VISUALS */}
            <div className="hidden lg:flex w-[55%] relative items-center justify-center p-16 z-10">
                <div className="relative z-20 max-w-xl w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        {/* Logo Mark */}
                        <div className="inline-flex items-center gap-3 mb-10 px-5 py-2.5 rounded-full bg-white/[0.02] border border-white/5 backdrop-blur-md shadow-2xl">
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-500 blur-[8px] opacity-50 animate-pulse"></div>
                                <Hexagon className="text-indigo-400 fill-indigo-500/20 relative z-10" size={24} />
                            </div>
                            <span className="text-xs font-bold tracking-[0.2em] text-indigo-200 uppercase">System v2.5 Online</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-ping" />
                        </div>
                        
                        <h1 className="text-8xl font-black text-white mb-8 leading-tight tracking-tighter">
                            MasterDiary<span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 via-purple-400 to-indigo-400 animate-gradient-x">OS</span>
                        </h1>
                        
                        <div className="h-px w-32 bg-gradient-to-r from-indigo-500 to-transparent mb-8" />

                        <div className="text-xl text-gray-400 mb-16 leading-relaxed max-w-md h-24">
                            <TypewriterText 
                                text="Orchestrating logistics, forensics, and finance from a single neural interface." 
                                delay={1}
                            />
                        </div>

                        <div className="grid gap-4">
                            <FeatureItem 
                                icon={Globe} 
                                title="GeoCore Ultra" 
                                desc="Satellite-linked site mapping with autonomous zone detection."
                                delay={0.2}
                            />
                            <FeatureItem 
                                icon={Cpu} 
                                title="Neural Forecasting" 
                                desc="Predictive resource allocation powered by Grok 4.1 AI."
                                delay={0.4}
                            />
                            <FeatureItem 
                                icon={Layers} 
                                title="Quantum Reporting" 
                                desc="Real-time financial telemetry and automated compliance."
                                delay={0.6}
                            />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* RIGHT: AUTH FORM */}
            <div className="w-full lg:w-[45%] flex items-center justify-center p-6 lg:p-12 relative z-20">
                {/* 3D TILT CONTAINER */}
                <motion.div 
                    style={{ rotateX, rotateY, perspective: 1000 }}
                    className="w-full max-w-[460px] relative"
                >
                    {/* Floating Glow Behind */}
                    <div className="absolute -inset-10 bg-indigo-500/20 rounded-full blur-[80px] opacity-40 animate-pulse-slow pointer-events-none" />

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative bg-[#0a0a0c]/90 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden"
                    >
                        {/* Decorative Top Line */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />

                        {/* Header */}
                        <div className="mb-10 relative">
                            <div className="lg:hidden flex justify-center mb-6">
                                <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-500/30">
                                    <Hexagon className="text-white fill-white/20" size={32} />
                                </div>
                            </div>
                            <h2 className="text-3xl font-black text-white mb-2 tracking-tight text-center lg:text-left flex items-center gap-3">
                                {isRegister ? 'Initialize Access' : 'Welcome Back'}
                                <span className="flex h-2 w-2 relative">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                </span>
                            </h2>
                            <p className="text-indigo-200/50 text-sm font-medium text-center lg:text-left">
                                {isRegister ? 'Join the elite network of builders.' : 'Authenticate your command clearance.'}
                            </p>
                        </div>

                        {/* Alerts */}
                        <AnimatePresence mode="wait">
                            {status.error && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10, height: 0 }} 
                                    animate={{ opacity: 1, y: 0, height: 'auto' }} 
                                    exit={{ opacity: 0, y: -10, height: 0 }}
                                    className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3 text-rose-200 text-xs font-medium backdrop-blur-md"
                                >
                                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                    <span>{status.error}</span>
                                </motion.div>
                            )}
                            {status.success && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10, height: 0 }} 
                                    animate={{ opacity: 1, y: 0, height: 'auto' }} 
                                    exit={{ opacity: 0, y: -10, height: 0 }}
                                    className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3 text-emerald-200 text-xs font-medium backdrop-blur-md"
                                >
                                    <CheckCircle size={16} className="mt-0.5 shrink-0" />
                                    <span>{status.success}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                            <AnimatePresence>
                                {isRegister && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <FloatingInput 
                                            icon={User} 
                                            type="text" 
                                            placeholder="Officer Name" 
                                            value={formData.username}
                                            onChange={(e) => handleInputChange(e, 'username')}
                                            required={isRegister}
                                            delay={0}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <FloatingInput 
                                icon={Mail} 
                                type="email" 
                                placeholder="Email Identity" 
                                value={formData.email}
                                onChange={(e) => handleInputChange(e, 'email')}
                                required 
                                delay={0.1}
                            />

                            <FloatingInput 
                                icon={Lock} 
                                type="password" 
                                placeholder="Secure Passcode" 
                                value={formData.password}
                                onChange={(e) => handleInputChange(e, 'password')}
                                required 
                                delay={0.2}
                            />

                            <motion.button
                                whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(99, 102, 241, 0.4)" }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={status.loading}
                                className="w-full py-4.5 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/20 to-indigo-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                <span className="relative flex items-center gap-2 z-10">
                                    {status.loading ? (
                                        <Activity className="animate-spin text-indigo-600" size={18} />
                                    ) : (
                                        <>
                                            {isRegister ? (
                                                <> <Wifi size={18} /> ESTABLISH UPLINK </>
                                            ) : (
                                                <> <Fingerprint size={18} /> AUTHENTICATE </>
                                            )} 
                                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </span>
                            </motion.button>
                        </form>

                        {/* Footer Toggle */}
                        <div className="mt-8 pt-6 border-t border-white/5 flex justify-center relative z-10">
                            <button
                                onClick={() => {
                                    setIsRegister(!isRegister);
                                    setStatus({ error: '', success: '', loading: false });
                                }}
                                className="text-xs text-gray-500 hover:text-white transition-colors font-medium flex items-center gap-2 group"
                            >
                                {isRegister ? 'Already verified?' : 'Need security clearance?'}
                                <span className="text-indigo-400 group-hover:text-indigo-300 font-bold flex items-center gap-1">
                                    {isRegister ? 'Log In' : 'Request Access'}
                                    <Scan size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </span>
                            </button>
                        </div>

                        {/* Background Cyber-Details */}
                        <div className="absolute bottom-4 right-4 pointer-events-none opacity-20">
                            <Cpu size={120} className="text-white/5 rotate-12" />
                        </div>
                    </motion.div>
                    
                    {/* Security Badge */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                        className="mt-8 flex items-center justify-center gap-2 opacity-40 hover:opacity-100 transition-opacity duration-500"
                    >
                        <ShieldCheck size={12} className="text-emerald-500" />
                        <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">
                            Secured by Sovereign™ Encrypt v4.0
                        </span>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
