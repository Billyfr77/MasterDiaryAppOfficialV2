/*
 * PinnacleCopilot.jsx
 * The Global AI Super-Feature for MasterDiaryOS
 */
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Minimize, Maximize, BrainCircuit, MessageSquare, ChevronRight } from 'lucide-react';
import { api } from '../utils/api';
import { useLocation } from 'react-router-dom';

const PinnacleCopilot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "I am Pinnacle AI. How can I assist your operations today?" }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isOpen, isMinimized]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setTyping(true);

    try {
      // Gather context from current page
      const context = {
        path: location.pathname,
        timestamp: new Date().toISOString()
      };

      const res = await api.post('/ai/chat', { 
        message: userMsg, 
        context 
      });

      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Connection to Neural Core failed. Please check API configuration." }]);
    } finally {
      setTyping(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[9999] group flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20 group-hover:opacity-40"></div>
        <div className="relative w-14 h-14 bg-stone-900 border-2 border-indigo-500/50 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all hover:border-indigo-400 text-indigo-400 hover:text-white backdrop-blur-md">
          <BrainCircuit size={24} />
        </div>
      </button>
    );
  }

  if (isMinimized) {
      return (
        <div className="fixed bottom-6 right-6 z-[9999] w-72 bg-stone-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex items-center justify-between p-3 animate-slide-up cursor-pointer hover:border-indigo-500/50" onClick={() => setIsMinimized(false)}>
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400">
                    <Sparkles size={16} />
                </div>
                <div className="text-sm font-bold text-white">Pinnacle AI</div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="text-gray-500 hover:text-white"><X size={16} /></button>
        </div>
      );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] w-[400px] h-[600px] bg-stone-950/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-slide-up-fade ring-1 ring-white/5">
      {/* Header */}
      <div className="h-16 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border-b border-white/10 flex items-center justify-between px-5">
        <div className="flex items-center gap-3">
            <div className="relative">
                <div className="w-2 h-2 bg-emerald-500 rounded-full absolute -right-0.5 -top-0.5 border border-black animate-pulse"></div>
                <BrainCircuit size={24} className="text-indigo-400" />
            </div>
            <div>
                <h3 className="text-sm font-black text-white tracking-wide">PINNACLE CORE</h3>
                <div className="text-[10px] text-indigo-300/60 font-mono uppercase tracking-widest">v2.5.0 Online</div>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => setIsMinimized(true)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"><Minimize size={16}/></button>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors"><X size={16}/></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar" ref={scrollRef}>
        {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mr-2 flex-shrink-0">
                        <Sparkles size={14} className="text-indigo-400" />
                    </div>
                )}
                <div className={`max-w-[85%] p-3.5 text-sm leading-relaxed rounded-2xl ${
                    msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-none shadow-lg shadow-indigo-900/20' 
                        : 'bg-stone-900 border border-white/10 text-gray-300 rounded-tl-none'
                }`}>
                    {msg.content}
                </div>
            </div>
        ))}
        {typing && (
            <div className="flex justify-start items-center gap-2 pl-10">
                <div className="w-2 h-2 bg-indigo-500/50 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-500/50 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-indigo-500/50 rounded-full animate-bounce delay-150"></div>
            </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-stone-900/50 border-t border-white/5">
        <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-20 group-hover:opacity-40 transition-opacity blur"></div>
            <div className="relative flex items-center bg-stone-950 rounded-xl border border-white/10">
                <input 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Command the system..."
                    className="flex-1 bg-transparent border-none px-4 py-3.5 text-sm text-white focus:outline-none placeholder-gray-600"
                    autoFocus
                />
                <button 
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="p-2 mr-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send size={16} />
                </button>
            </div>
        </div>
        <div className="text-[9px] text-center mt-2 text-gray-600 font-mono">
            SECURE CONNECTION • GEN-AI ENABLED
        </div>
      </div>
    </div>
  );
};

export default PinnacleCopilot;
