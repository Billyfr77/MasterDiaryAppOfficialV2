import React, { createContext, useContext, useState, useEffect } from 'react';

const DiaryThemeContext = createContext();

export const DIARY_THEMES = {
    // --- CELESTIAL & COSMIC ---
    aurora: {
        name: 'Aurora Borealis',
        primary: 'emerald',
        bg: 'bg-gradient-to-br from-[#022c22] via-[#042f2e] to-[#0f172a]', // Deep Emerald to Slate
        border: 'border-emerald-400/30',
        text: 'text-emerald-300',
        glow: 'shadow-[0_0_90px_rgba(16,185,129,0.25)]',
        button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-900/50',
        accent: '#34d399'
    },
    supernova: {
        name: 'Supernova Blast',
        primary: 'orange',
        bg: 'bg-gradient-to-br from-[#2a0a0a] via-[#431407] to-[#1a0505]', // Deep Red/Orange
        border: 'border-orange-500/40',
        text: 'text-orange-300',
        glow: 'shadow-[0_0_100px_rgba(249,115,22,0.35)]',
        button: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 shadow-orange-900/50 border border-orange-400/20',
        accent: '#fb923c'
    },
    nebula: {
        name: 'Cosmic Nebula',
        primary: 'indigo',
        bg: 'bg-gradient-to-br from-[#1e1b4b] via-[#2e1065] to-[#0f172a]', // Indigo/Violet depth
        border: 'border-indigo-400/40',
        text: 'text-indigo-200',
        glow: 'shadow-[0_0_90px_rgba(99,102,241,0.3)]',
        button: 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-900/50',
        accent: '#818cf8'
    },
    galaxy: {
        name: 'Andromeda',
        primary: 'fuchsia',
        bg: 'bg-gradient-to-br from-[#2a0a2e] via-[#4a044e] to-[#0f0720]', // Deep Fuchsia/Purple
        border: 'border-fuchsia-400/40',
        text: 'text-fuchsia-300',
        glow: 'shadow-[0_0_90px_rgba(217,70,239,0.3)]',
        button: 'bg-gradient-to-r from-fuchsia-700 to-pink-600 hover:from-fuchsia-600 hover:to-pink-500 shadow-fuchsia-900/50',
        accent: '#e879f9'
    },
    starlight: {
        name: 'Starlight Void',
        primary: 'slate',
        bg: 'bg-gradient-to-b from-[#0f172a] via-[#020617] to-black', // Deep Space
        border: 'border-slate-600/40',
        text: 'text-slate-200',
        glow: 'shadow-[0_0_80px_rgba(148,163,184,0.15)]',
        button: 'bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 shadow-slate-900/40 border border-slate-500/30',
        accent: '#cbd5e1'
    },

    // --- CYBERPUNK & NEON ---
    cyber: {
        name: 'Neon Tokyo',
        primary: 'pink',
        bg: 'bg-gradient-to-br from-[#2a0518] via-[#1f0510] to-[#0a0a0c]', // Deep Pink/Black
        border: 'border-pink-500/50',
        text: 'text-pink-400',
        glow: 'shadow-[0_0_100px_rgba(236,72,153,0.4)]',
        button: 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 shadow-pink-900/60 border border-pink-400/30',
        accent: '#ec4899'
    },
    hacker: {
        name: 'Mainframe Breach',
        primary: 'green',
        bg: 'bg-gradient-to-br from-[#021805] via-[#022c22] to-black', // Matrix Green
        border: 'border-green-500/50',
        text: 'text-green-400',
        glow: 'shadow-[0_0_90px_rgba(34,197,94,0.35)]',
        button: 'bg-green-700 hover:bg-green-600 font-mono shadow-green-900/60 border border-green-500/30 tracking-wider',
        accent: '#22c55e'
    },
    synthwave: {
        name: 'Synthwave Sunset',
        primary: 'violet',
        bg: 'bg-gradient-to-br from-[#1e1a4b] via-[#2e1065] to-[#180828]', // Deep Purple/Blue
        border: 'border-violet-500/50',
        text: 'text-violet-300',
        glow: 'shadow-[0_0_90px_rgba(139,92,246,0.4)]',
        button: 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 shadow-violet-900/50',
        accent: '#a78bfa'
    },
    xenon: {
        name: 'Xenon Gas',
        primary: 'cyan',
        bg: 'bg-gradient-to-br from-[#082f49] via-[#0e7490] to-[#020617]', // Deep Cyan
        border: 'border-cyan-400/50',
        text: 'text-cyan-300',
        glow: 'shadow-[0_0_90px_rgba(34,211,238,0.35)]',
        button: 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-900/50 border border-cyan-400/30',
        accent: '#22d3ee'
    },
    acid: {
        name: 'Acid Rain',
        primary: 'lime',
        bg: 'bg-gradient-to-br from-[#1a2e05] via-[#142802] to-black', // Toxic Lime
        border: 'border-lime-400/50',
        text: 'text-lime-300',
        glow: 'shadow-[0_0_90px_rgba(163,230,53,0.35)]',
        button: 'bg-lime-700 hover:bg-lime-600 shadow-lime-900/50 border border-lime-400/30',
        accent: '#a3e635'
    },

    // --- LUXURY & ELEMENTAL ---
    midas: {
        name: 'Midas Touch',
        primary: 'amber',
        bg: 'bg-gradient-to-br from-[#291b00] via-[#451a03] to-[#0c0a00]', // Rich Gold/Bronze
        border: 'border-amber-500/40',
        text: 'text-amber-300',
        glow: 'shadow-[0_0_100px_rgba(245,158,11,0.3)]',
        button: 'bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 hover:from-amber-500 hover:via-yellow-500 hover:to-amber-600 shadow-amber-900/50 border border-amber-400/20',
        accent: '#fbbf24'
    },
    oceanic: {
        name: 'Deep Pacific',
        primary: 'blue',
        bg: 'bg-gradient-to-br from-[#0a102e] via-[#1e3a8a] to-[#020617]', // Deep Ocean
        border: 'border-blue-400/40',
        text: 'text-blue-300',
        glow: 'shadow-[0_0_90px_rgba(59,130,246,0.35)]',
        button: 'bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 shadow-blue-900/50',
        accent: '#60a5fa'
    },
    volcanic: {
        name: 'Molten Core',
        primary: 'red',
        bg: 'bg-gradient-to-br from-[#2b0808] via-[#450a0a] to-[#150303]', // Magma Red
        border: 'border-red-500/50',
        text: 'text-red-400',
        glow: 'shadow-[0_0_90px_rgba(239,68,68,0.4)]',
        button: 'bg-gradient-to-r from-red-700 to-orange-700 hover:from-red-600 hover:to-orange-600 shadow-red-900/50 border border-red-500/30',
        accent: '#ef4444'
    },
    glacier: {
        name: 'Arctic Ice',
        primary: 'sky',
        bg: 'bg-gradient-to-br from-[#0c2a38] via-[#075985] to-[#020617]', // Icy Blue
        border: 'border-sky-300/40',
        text: 'text-sky-200',
        glow: 'shadow-[0_0_90px_rgba(56,189,248,0.3)]',
        button: 'bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 shadow-sky-900/50',
        accent: '#7dd3fc'
    },
    jungle: {
        name: 'Amazonian',
        primary: 'emerald',
        bg: 'bg-gradient-to-br from-[#062402] via-[#064e3b] to-[#020d04]', // Deep Jungle
        border: 'border-green-500/40',
        text: 'text-green-300',
        glow: 'shadow-[0_0_90px_rgba(34,197,94,0.3)]',
        button: 'bg-gradient-to-r from-green-700 to-emerald-700 hover:from-green-600 hover:to-emerald-600 shadow-green-900/50',
        accent: '#4ade80'
    },

    // --- PASTEL & ETHEREAL ---
    dream: {
        name: 'Lucid Dream',
        primary: 'purple',
        bg: 'bg-gradient-to-br from-[#1a102e] via-[#24133d] to-[#120b21]', // Soft Purple Dark
        border: 'border-purple-300/30',
        text: 'text-purple-200',
        glow: 'shadow-[0_0_80px_rgba(192,132,252,0.25)]',
        button: 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 shadow-purple-900/40',
        accent: '#d8b4fe'
    },
    cottoncandy: {
        name: 'Vapor Wave',
        primary: 'pink',
        bg: 'bg-gradient-to-br from-[#26131b] via-[#381625] to-[#14080e]', // Soft Pink Dark
        border: 'border-pink-300/30',
        text: 'text-pink-200',
        glow: 'shadow-[0_0_80px_rgba(244,114,182,0.25)]',
        button: 'bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-400 hover:to-rose-300 shadow-pink-900/40',
        accent: '#f9a8d4'
    },
    mint: {
        name: 'Electric Mint',
        primary: 'teal',
        bg: 'bg-gradient-to-br from-[#042f2e] via-[#0f4d4a] to-[#021413]', // Mint Dark
        border: 'border-teal-300/30',
        text: 'text-teal-200',
        glow: 'shadow-[0_0_80px_rgba(94,234,212,0.25)]',
        button: 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 shadow-teal-900/40',
        accent: '#5eead4'
    },

    // --- EXOTIC & UNIQUE ---
    vampire: {
        name: 'Crimson Count',
        primary: 'rose',
        bg: 'bg-gradient-to-br from-[#210307] via-[#38060d] to-black', // Blood Red
        border: 'border-rose-600/40',
        text: 'text-rose-100',
        glow: 'shadow-[0_0_90px_rgba(225,29,72,0.35)]',
        button: 'bg-gradient-to-r from-rose-900 to-red-800 hover:from-rose-800 hover:to-red-700 shadow-rose-950/60 border border-rose-700/50',
        accent: '#e11d48'
    },
    wasp: {
        name: 'Hive Mind',
        primary: 'yellow',
        bg: 'bg-gradient-to-br from-[#1c1602] via-[#292204] to-black', // Wasp Yellow
        border: 'border-yellow-500/50',
        text: 'text-yellow-300',
        glow: 'shadow-[0_0_90px_rgba(234,179,8,0.35)]',
        button: 'bg-yellow-700 hover:bg-yellow-600 shadow-yellow-900/50 text-black font-black tracking-wider',
        accent: '#facc15'
    },
    ultraviolet: {
        name: 'Ultra Violet',
        primary: 'indigo',
        bg: 'bg-gradient-to-br from-[#120836] via-[#1e1b4b] to-[#08041c]', // Deep Indigo
        border: 'border-indigo-500/50',
        text: 'text-indigo-300',
        glow: 'shadow-[0_0_90px_rgba(79,70,229,0.35)]',
        button: 'bg-indigo-700 hover:bg-indigo-600 shadow-indigo-900/50 border border-indigo-500/30',
        accent: '#4f46e5'
    },
    obsidian: {
        name: 'Obsidian Monolith',
        primary: 'zinc',
        bg: 'bg-gradient-to-br from-[#09090b] via-[#18181b] to-black', // Pure Dark
        border: 'border-zinc-700/50',
        text: 'text-zinc-100',
        glow: 'shadow-[0_0_60px_rgba(255,255,255,0.08)]',
        button: 'bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 shadow-zinc-900/50',
        accent: '#e4e4e7'
    }
};

export const DiaryThemeProvider = ({ children }) => {
    const [activeTheme, setActiveTheme] = useState(() => {
        const saved = localStorage.getItem('diary-active-theme');
        return saved && DIARY_THEMES[saved] ? saved : 'aurora';
    });

    useEffect(() => {
        localStorage.setItem('diary-active-theme', activeTheme);
    }, [activeTheme]);

    // Safety check: if activeTheme is somehow invalid (e.g. hot reload), fallback to first key
    const theme = DIARY_THEMES[activeTheme] || DIARY_THEMES['aurora'] || Object.values(DIARY_THEMES)[0];

    return (
        <DiaryThemeContext.Provider value={{ activeTheme, setActiveTheme, theme, allThemes: DIARY_THEMES }}>
            {children}
        </DiaryThemeContext.Provider>
    );
};

export const useDiaryTheme = () => {
    const context = useContext(DiaryThemeContext);
    if (!context) throw new Error('useDiaryTheme must be used within a DiaryThemeProvider');
    return context;
};
