/*
 * MasterDiaryOS - Onboarding Wizard (Neural Initialization)
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Terminal, CheckCircle2, ArrowRight, Building, User, MapPin, Cpu, Loader2, Sparkles, BrainCircuit } from 'lucide-react';
import { api } from '../../utils/api';

const Step = ({ children, isActive }) => (
    <AnimatePresence mode="wait">
        {isActive && (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full max-w-lg"
            >
                {children}
            </motion.div>
        )}
    </AnimatePresence>
);

const OnboardingWizard = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [orgName, setOrgName] = useState('');
    const [orgDescription, setOrgDescription] = useState('');
    const [role, setRole] = useState('');
    const [projectName, setProjectName] = useState('');
    const [projectAddress, setProjectAddress] = useState('');

    const handleNext = () => setStep(prev => prev + 1);

    const handleComplete = async () => {
        setLoading(true);
        try {
            // 1. Update Settings / Org Profile
            await api.post('/settings/upsert', { parameter: 'companyName', value: orgName });
            await api.post('/settings/upsert', { parameter: 'companyDescription', value: orgDescription });
            await api.post('/settings/upsert', { parameter: 'userRole', value: role });
            
            // 2. Create First Project
            if (projectName) {
                await api.post('/projects', {
                    name: projectName,
                    site: projectAddress || 'TBD',
                    status: 'active',
                    client: 'Internal'
                });
            }

            // 3. Fake "Neural Sync" delay for effect
            await new Promise(r => setTimeout(r, 1500));
            
            navigate('/dashboard');
        } catch (err) {
            console.error("Onboarding Failed", err);
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020408] text-white flex flex-col items-center justify-center relative overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
            
            {/* PROGRESS BAR */}
            <div className="absolute top-10 w-64 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                    animate={{ width: `${((step + 1) / 5) * 100}%` }}
                    className="h-full bg-indigo-500 shadow-[0_0_100px_#6366f1]"
                />
            </div>

            {/* MAIN CONTENT */}
            <div className="z-10 w-full max-w-2xl px-6 flex flex-col items-center">
                
                {/* STEP 0: WELCOME */}
                <Step isActive={step === 0}>
                    <div className="text-center space-y-8">
                        <div className="w-20 h-20 bg-indigo-600/20 rounded-[2rem] border border-indigo-500/30 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(99,102,241,0.2)] animate-pulse-slow">
                            <Cpu size={40} className="text-indigo-400" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">System Initialization</div>
                            <h1 className="text-5xl font-black uppercase tracking-tighter mb-4 leading-none">Neural Core <br/><span className="text-gray-600">Online.</span></h1>
                            <p className="text-gray-400 text-lg font-medium leading-relaxed">Welcome to MasterDiaryOS. I am Pinnacle, your AI Architect. Let's calibrate your operating environment.</p>
                        </div>
                        <button onClick={handleNext} className="group relative px-10 py-4 bg-white text-black rounded-xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform flex items-center gap-3 mx-auto">
                            Begin Protocol <ArrowRight size={16} />
                        </button>
                    </div>
                </Step>

                {/* STEP 1: IDENTITY */}
                <Step isActive={step === 1}>
                    <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400"><Building size={24} /></div>
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tight">Firm Identity</h2>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Establish Command Node</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Organization Name</label>
                                <input 
                                    autoFocus
                                    value={orgName}
                                    onChange={e => setOrgName(e.target.value)}
                                    placeholder="e.g. Apex Constructions" 
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-emerald-500 outline-none transition-all placeholder-gray-700 text-lg font-bold" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Your Role</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Director', 'Project Manager', 'Site Supervisor', 'Estimator'].map(r => (
                                        <button 
                                            key={r}
                                            onClick={() => setRole(r)}
                                            className={`p-4 rounded-xl border text-xs font-bold uppercase tracking-wider text-left transition-all ${role === r ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg' : 'bg-black/20 border-white/5 text-gray-500 hover:bg-white/5'}`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="mt-10 flex justify-end">
                            <button onClick={handleNext} disabled={!orgName || !role} className="px-8 py-3 bg-white text-black rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 disabled:opacity-50 transition-all flex items-center gap-2">
                                Next Step <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </Step>

                {/* STEP 2: BRAIN CALIBRATION */}
                <Step isActive={step === 2}>
                    <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400"><BrainCircuit size={24} /></div>
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tight">Brain Calibration</h2>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Educate your AI Partner</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Company Bio / Description</label>
                                <textarea 
                                    autoFocus
                                    rows="5"
                                    value={orgDescription}
                                    onChange={e => setOrgDescription(e.target.value)}
                                    placeholder="e.g. We are a medium-sized civil engineering firm specializing in underground services and pipeline restoration across Victoria. We pride ourselves on speed and safety..." 
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-indigo-500 outline-none transition-all placeholder-gray-700 text-sm font-medium leading-relaxed resize-none" 
                                />
                                <p className="px-2 text-[10px] text-gray-500 leading-relaxed italic">
                                    This description is the foundation of the AI's intelligence. It uses this information to provide tailored advice specifically for your industry niche.
                                </p>
                            </div>
                        </div>
                        <div className="mt-10 flex justify-end">
                            <button onClick={handleNext} disabled={!orgDescription} className="px-8 py-3 bg-white text-black rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 disabled:opacity-50 transition-all flex items-center gap-2">
                                Calibrate Brain <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </Step>

                {/* STEP 3: PROJECT ZERO */}
                <Step isActive={step === 3}>
                    <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400"><MapPin size={24} /></div>
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tight">Project Zero</h2>
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Initialize First Operation</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Project Name</label>
                                <input 
                                    autoFocus
                                    value={projectName}
                                    onChange={e => setProjectName(e.target.value)}
                                    placeholder="e.g. 120 Collins Street Fitout" 
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-amber-500 outline-none transition-all placeholder-gray-700 text-lg font-bold" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Site Address (Optional)</label>
                                <input 
                                    value={projectAddress}
                                    onChange={e => setProjectAddress(e.target.value)}
                                    placeholder="Enter location for geospatial sync..." 
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-amber-500 outline-none transition-all placeholder-gray-700 font-medium" 
                                />
                            </div>
                        </div>
                        <div className="mt-10 flex justify-end">
                            <button onClick={handleNext} disabled={!projectName} className="px-8 py-3 bg-white text-black rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 disabled:opacity-50 transition-all flex items-center gap-2">
                                Initialize <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </Step>

                {/* STEP 4: SYNC */}
                <Step isActive={step === 4}>
                    <div className="text-center space-y-8 max-w-md mx-auto">
                        <div className="relative w-32 h-32 mx-auto">
                            <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping"></div>
                            <div className="relative w-full h-full bg-black border-2 border-indigo-500 rounded-full flex items-center justify-center overflow-hidden">
                                {loading ? (
                                    <Loader2 size={40} className="text-indigo-400 animate-spin" />
                                ) : (
                                    <Sparkles size={40} className="text-indigo-400" />
                                )}
                            </div>
                        </div>
                        
                        <div>
                            <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Syncing Neural Lattice</h2>
                            <p className="text-gray-500 font-medium text-sm">Configuring {orgName} workspace...<br/>Generating geospatial anchors for {projectName}...</p>
                        </div>

                        {!loading && (
                            <button onClick={handleComplete} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-[0_0_40px_rgba(99,102,241,0.4)] transition-all flex items-center justify-center gap-3">
                                <Terminal size={16} /> Enter Command
                            </button>
                        )}
                        {loading && (
                            <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest animate-pulse">
                                Processing...
                            </div>
                        )}
                    </div>
                </Step>

            </div>
        </div>
    );
};

const ChevronRight = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);

export default OnboardingWizard;
