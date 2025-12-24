import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, X, Bot, User, Loader2, Zap, Command, BrainCircuit } from 'lucide-react';

export default function WorkflowCopilot({ onCommand, isOpen, onClose }) {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Neural Co-pilot Online. I am ready to architect your operational logic. What shall we build?" }
    ]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            // In a masterpiece, this would call a specialized endpoint
            // For now, we simulate the "Smart Command" feedback
            setTimeout(() => {
                setMessages(prev => [...prev, { 
                    role: 'assistant', 
                    content: `Executing Neural Command: "${userMsg}". I've updated the topological circuit to optimize for high-risk compliance.` 
                }]);
                onCommand && onCommand(userMsg);
                setLoading(false);
            }, 1500);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Command Error: Link to Reasoning Core severed." }]);
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ y: 100, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 100, opacity: 0, scale: 0.95 }}
                    className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[500px] z-[100]"
                >
                    <div className="bg-slate-950/90 backdrop-blur-3xl border border-indigo-500/30 rounded-[2.5rem] shadow-[0_20px_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col h-[450px]">
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 bg-indigo-600/10 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                                    <BrainCircuit size={18} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Neural Co-pilot</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Grok-4-Reasoning Active</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Chat area */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            {messages.map((m, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, x: m.role === 'user' ? 10 : -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                                        m.role === 'user' 
                                        ? 'bg-indigo-600 text-white font-bold rounded-tr-none' 
                                        : 'bg-white/5 border border-white/10 text-slate-300 rounded-tl-none'
                                    }`}>
                                        {m.content}
                                    </div>
                                </motion.div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none flex items-center gap-3">
                                        <Loader2 size={14} className="animate-spin text-indigo-400" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Architecting...</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-6 border-t border-white/5 bg-black/40">
                            <div className="relative flex items-center gap-3">
                                <div className="absolute left-4 text-indigo-500">
                                    <Command size={16} />
                                </div>
                                <input 
                                    type="text" 
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                                    placeholder="Execute neural command..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-16 py-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all font-medium"
                                />
                                <button 
                                    onClick={handleSend}
                                    disabled={loading || !input.trim()}
                                    className="absolute right-2 p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
