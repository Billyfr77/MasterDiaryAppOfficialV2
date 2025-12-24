/*
 * MasterDiaryOS - Neural Tutor (Onboarding Overlay)
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 * 
 * An AI-driven interactive guide that teaches users how to operate the OS.
 */
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Sparkles, ArrowRight, X, ChevronRight, ChevronLeft, 
    Target, Zap, BrainCircuit, Layout, MousePointer2 
} from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useLocation } from 'react-router-dom';

const MODULES = {
    quote: {
        title: "Neural Estimation Mastery",
        steps: [
            {
                id: 'intro',
                title: "Welcome to the Neural Quote Engine",
                text: "I am your AI Co-Pilot. I will teach you how to build high-fidelity, interconnected estimates that calculate themselves.",
                target: null
            },
            {
                id: 'prism',
                title: "The Estimation Prism",
                text: "This node is the 'Brain' of your quote. It continuously analyzes your graph for financial risks, margin health, and missing items.",
                target: '.react-flow__node-estimationPrism' // CSS Class for Prism Node
            },
            {
                id: 'sidebar',
                title: "Resource Dock",
                text: "Your supply chain lives here. Drag 'Area Nodes' (Spatial Logic) and 'Materials' onto the canvas to begin.",
                target: '.resource-sidebar' // Add this class to sidebar
            },
            {
                id: 'logic',
                title: "Neural Linking",
                text: "The magic happens when you connect nodes. Drag a line from an 'Area Node' to a 'Material'. The system will auto-calculate the quantity based on coverage rates.",
                target: '.react-flow__pane'
            },
            {
                id: 'insights',
                title: "Deep Intelligence",
                text: "Click 'Insights' to open the forensic layer. I'll audit your quote for zero-rate items, orphaned areas, and profit margins.",
                target: 'button:has(svg.lucide-zap)' // Heuristic selector for Insights button
            },
            {
                id: 'chat',
                title: "Generative Blueprinting",
                text: "Don't want to drag nodes? Just tell me what to build here. Try typing: 'Build a 50sqm timber deck'.",
                target: '.quote-copilot-trigger' // Add to chat button
            }
        ]
    },
    diary: {
        title: "Site Operations Command",
        steps: [
            {
                id: 'intro',
                title: "Neural Diary Operations",
                text: "This is your site's central nervous system. Let's map out your operational timeline.",
                target: null
            },
            {
                id: 'chronos',
                title: "Chronos Hubs",
                text: "These nodes represent time. A 'Chronos Hub' anchors all activity for a specific day or shift. Everything connects to this.",
                target: '.react-flow__node-chronos'
            },
            {
                id: 'staff',
                title: "Crew Allocation",
                text: "Drag staff from the dock and link them to a Chronos Hub. The engine automatically calculates start/finish times and overtime.",
                target: '.resource-sidebar'
            },
            {
                id: 'weather',
                title: "Atmospheric Engine",
                text: "I monitor site weather automatically. If it rains, I'll suggest adding a 'Delay Node' to explain lost time.",
                target: '.weather-widget' // If visible
            }
        ]
    }
};

const AIOnboardingOverlay = () => {
    const { onboarding, nextStep, prevStep, closeOnboarding } = useUI();
    const location = useLocation();
    const [spotlightStyle, setSpotlightStyle] = useState(null);
    const [tutorPosition, setTutorPosition] = useState({ x: 50, y: 50 }); // Percentage
    
    const activeModule = MODULES[onboarding.activeModule];
    const currentStep = activeModule?.steps[onboarding.stepIndex];

    // --- SPOTLIGHT TRACKING ---
    useEffect(() => {
        if (!onboarding.isVisible || !currentStep) return;

        if (!currentStep.target) {
            setSpotlightStyle(null);
            setTutorPosition({ x: 50, y: 50 });
            return;
        }

        const updatePosition = () => {
            const element = document.querySelector(currentStep.target);
            if (element) {
                const rect = element.getBoundingClientRect();
                setSpotlightStyle({
                    top: rect.top - 10,
                    left: rect.left - 10,
                    width: rect.width + 20,
                    height: rect.height + 20,
                    opacity: 1
                });

                // Position tutor near the element but safely on screen
                const isRight = rect.left < window.innerWidth / 2;
                setTutorPosition({
                    x: isRight ? ((rect.right + 400) / window.innerWidth) * 100 : ((rect.left - 400) / window.innerWidth) * 100,
                    y: (rect.top / window.innerHeight) * 100
                });
            } else {
                // Fallback if element not found yet
                setSpotlightStyle(null);
            }
        };

        updatePosition();
        // Poll for element existence (react rendering delay)
        const interval = setInterval(updatePosition, 500);
        window.addEventListener('resize', updatePosition);
        
        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', updatePosition);
        };
    }, [onboarding.isVisible, currentStep, onboarding.stepIndex]);

    if (!onboarding.isVisible || !activeModule) return null;

    const isLastStep = onboarding.stepIndex === activeModule.steps.length - 1;

    return (
        <div className="fixed inset-0 z-[9999] pointer-events-none font-sans">
            {/* DIMMED BACKGROUND MASK */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-all duration-500"
                style={{
                    // Use mask-image to punch a hole if spotlight is active
                    maskImage: spotlightStyle 
                        ? `radial-gradient(rect ${spotlightStyle.width}px ${spotlightStyle.height}px at ${spotlightStyle.left + spotlightStyle.width/2}px ${spotlightStyle.top + spotlightStyle.height/2}px, transparent, black)` 
                        : 'none',
                    WebkitMaskImage: spotlightStyle 
                        ? `radial-gradient(circle at ${spotlightStyle.left + spotlightStyle.width/2}px ${spotlightStyle.top + spotlightStyle.height/2}px, transparent ${Math.max(spotlightStyle.width, spotlightStyle.height)/1.5}px, black ${Math.max(spotlightStyle.width, spotlightStyle.height)/1.2}px)`
                        : 'none'
                }}
            />

            {/* SPOTLIGHT BORDER (The Glowing Box) */}
            <AnimatePresence>
                {spotlightStyle && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ 
                            top: spotlightStyle.top,
                            left: spotlightStyle.left,
                            width: spotlightStyle.width,
                            height: spotlightStyle.height,
                            opacity: 1,
                            scale: 1
                        }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="absolute border-2 border-indigo-500/80 rounded-xl shadow-[0_0_50px_rgba(99,102,241,0.4)] pointer-events-none"
                    >
                        {/* Animated Corners */}
                        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-indigo-400" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-indigo-400" />
                        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-indigo-400" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-indigo-400" />
                        
                        {/* Connecting Line to Tutor */}
                        <svg className="absolute w-screen h-screen pointer-events-none overflow-visible" style={{ top: 0, left: 0 }}>
                            {/* Simple line logic could go here if needed */}
                        </svg>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* THE NEURAL TUTOR (Floating Window) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ 
                        opacity: 1, 
                        y: 0, 
                        scale: 1,
                        // If we have a target, move card relative to it? 
                        // For now, center screen is safest, or bottom center.
                        // Or we can use the `tutorPosition` state if we want it dynamic.
                    }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="pointer-events-auto w-[500px] bg-[#0a0a0c]/95 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden backdrop-blur-2xl ring-1 ring-white/5"
                >
                    {/* Header */}
                    <div className="h-32 bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-transparent relative overflow-hidden flex items-center justify-center">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-black/50 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)] mb-3">
                                <Sparkles size={32} className="text-indigo-400 animate-pulse" />
                            </div>
                            <div className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em]">Neural Tutor Active</div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 text-center space-y-4">
                        <motion.div 
                            key={currentStep?.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            <h3 className="text-2xl font-black text-white tracking-tight uppercase">{currentStep?.title}</h3>
                            <p className="text-gray-400 text-sm font-medium leading-relaxed px-4">{currentStep?.text}</p>
                        </motion.div>

                        {/* Progress Dots */}
                        <div className="flex justify-center gap-2 py-4">
                            {activeModule.steps.map((_, idx) => (
                                <div 
                                    key={idx} 
                                    className={`h-1.5 rounded-full transition-all duration-500 ${idx === onboarding.stepIndex ? 'w-8 bg-indigo-500' : idx < onboarding.stepIndex ? 'w-1.5 bg-indigo-500/50' : 'w-1.5 bg-white/10'}`} 
                                />
                            ))}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 bg-white/[0.02] border-t border-white/5 flex justify-between items-center">
                        <button 
                            onClick={closeOnboarding}
                            className="text-gray-500 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors px-4"
                        >
                            End Session
                        </button>
                        <div className="flex gap-2">
                            {onboarding.stepIndex > 0 && (
                                <button 
                                    onClick={prevStep}
                                    className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-white transition-all"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                            )}
                            <button 
                                onClick={isLastStep ? closeOnboarding : nextStep}
                                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-900/20 transition-all flex items-center gap-2"
                            >
                                {isLastStep ? 'Complete' : 'Next'} <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AIOnboardingOverlay;
