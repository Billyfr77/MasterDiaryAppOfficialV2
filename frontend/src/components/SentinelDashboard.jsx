import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, DollarSign, ArrowRight, CheckCircle, X, Activity } from 'lucide-react';
import { api } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const SentinelDashboard = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchAlerts = async () => {
        try {
            const res = await api.get('/sentinel/alerts');
            setAlerts(res.data);
        } catch (e) {
            console.error("Sentinel Offline:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async (alertId) => {
        try {
            const res = await api.post('/sentinel/create-variation', { alertId });
            // Navigate to Invoice Builder with pre-filled state
            navigate(res.data.redirect, { state: { invoiceData: res.data.variation, mode: 'variation' } });
        } catch (e) {
            alert("Failed to initialize variation.");
        }
    };

    const handleDismiss = async (alertId) => {
        // Implement dismiss logic (mark read)
        setAlerts(prev => prev.filter(a => a.id !== alertId));
    };

    if (loading && alerts.length === 0) return null; // Invisible if loading empty

    return (
        <div className="fixed bottom-24 left-6 z-40 max-w-sm w-full space-y-4 pointer-events-none">
            <AnimatePresence>
                {alerts.map((alert) => (
                    <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-stone-900/90 backdrop-blur-xl border border-rose-500/30 p-5 rounded-2xl shadow-2xl pointer-events-auto relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="flex items-start gap-4 relative z-10">
                            <div className="p-3 bg-rose-600 rounded-xl shadow-lg animate-pulse-slow">
                                <ShieldAlert size={20} className="text-white" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="text-xs font-black text-rose-400 uppercase tracking-widest">Revenue Leakage Detected</h4>
                                    <button onClick={() => handleDismiss(alert.id)} className="text-gray-500 hover:text-white"><X size={14} /></button>
                                </div>
                                <p className="text-sm font-bold text-white mb-2 leading-tight">{alert.message}</p>
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => handleClaim(alert.id)}
                                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-black uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all"
                                    >
                                        <DollarSign size={14} /> Claim Variation
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default SentinelDashboard;
