import React, { useState } from 'react';
import { Sparkles, Send, Loader2, Mic, X } from 'lucide-react';
import { api } from '../utils/api';

const MapCommandBar = ({ map, onAssetsGenerated }) => {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(true);

    if (!isOpen) return (
        <button 
            onClick={() => setIsOpen(true)}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl border border-white/20 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 hover:scale-105 transition-all z-50 animate-bounce-in"
        >
            <Sparkles className="text-purple-400" size={18} />
            <span className="font-bold text-xs uppercase tracking-widest">Genesis Mode</span>
        </button>
    );

    const handleExecute = async (e) => {
        e.preventDefault();
        if (!prompt || !map) return;

        setLoading(true);
        try {
            const center = map.getCenter();
            const payload = {
                prompt,
                center: { lat: center.lat(), lng: center.lng() }
            };

            const res = await api.post('/ai/map-elements', payload);
            
            if (res.data.assets) {
                onAssetsGenerated(res.data.assets);
                setPrompt(''); // Clear prompt on success
            }
        } catch (err) {
            console.error("AI Command Failed:", err);
            alert("Command failed. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-50 animate-slide-up">
            <div className="bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-2 flex items-center gap-2 ring-1 ring-white/10 focus-within:ring-purple-500/50 transition-all">
                <div className="p-3 bg-purple-500/10 rounded-xl">
                    {loading ? <Loader2 className="text-purple-400 animate-spin" size={20} /> : <Sparkles className="text-purple-400" size={20} />}
                </div>
                
                <input 
                    autoFocus
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleExecute(e)}
                    placeholder="Command the AI (e.g. 'Create a site compound with office, storage, and parking')..."
                    className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm font-medium h-10"
                    disabled={loading}
                />

                <div className="flex gap-2">
                    <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                        <Mic size={18} />
                    </button>
                    <button 
                        onClick={handleExecute}
                        disabled={loading || !prompt}
                        className="p-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
            
            <button 
                onClick={() => setIsOpen(false)}
                className="absolute -top-3 -right-3 bg-red-500 text-white p-1 rounded-full shadow-lg hover:scale-110 transition-transform"
            >
                <X size={12} />
            </button>
        </div>
    );
};

export default MapCommandBar;
