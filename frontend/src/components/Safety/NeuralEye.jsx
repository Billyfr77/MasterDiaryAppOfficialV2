import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Camera, Upload, ShieldAlert, Zap, 
    CheckCircle, X, Loader2, Radar, 
    AlertTriangle, FileText, ArrowRight
} from 'lucide-react';
import { api } from '../../utils/api';
import { useNavigate } from 'react-router-dom';

const NeuralEye = ({ onClose }) => {
    const navigate = useNavigate();
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const runAnalysis = async () => {
        if (!preview) return;
        setAnalyzing(true);
        try {
            const res = await api.post('/ai/analyze-vision', {
                image: preview,
                prompt: "Scan this site photo for hazards and progress."
            });
            setResult(res.data);
        } catch (e) {
            console.error("Neural Eye Link Failure", e);
            alert("Neural Link Severed. Ensure vision-beta is active.");
        } finally {
            setAnalyzing(false);
        }
    };

    const handleDraftAction = (type) => {
        // Trigger safety form creation with AI results
        navigate('/safety/new', { 
            state: { 
                prefill: {
                    title: `Visual Audit: ${result?.progress?.taskDetected || 'Site Scan'}`,
                    type: type,
                    aiContext: result
                } 
            } 
        });
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12"
        >
            <div className="relative w-full max-w-6xl h-full flex flex-col gap-6">
                
                {/* Header */}
                <div className="flex justify-between items-center bg-stone-900/50 p-6 rounded-[2rem] border border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-500/20">
                            <Radar size={28} className="text-white animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Neural Eye V1</h2>
                            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Multimodal Site Intelligence Active</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-4 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 transition-all">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden">
                    
                    {/* Left: Input / Preview */}
                    <div className="flex flex-col gap-6 overflow-hidden">
                        <div className={`flex-1 relative rounded-[3rem] border-4 border-dashed transition-all overflow-hidden flex items-center justify-center
                            ${preview ? 'border-indigo-500/50 bg-black' : 'border-white/10 bg-white/5 hover:border-white/20'}
                        `}>
                            {preview ? (
                                <img src={preview} alt="Site Scan" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center p-12">
                                    <div className="w-24 h-24 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-500/30">
                                        <Camera size={40} className="text-indigo-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Awaiting Visual Input</h3>
                                    <p className="text-gray-500 text-sm max-w-xs mx-auto mb-8 uppercase font-bold tracking-wider">Upload or capture a site photo for forensic safety analysis.</p>
                                    <button 
                                        onClick={() => fileInputRef.current.click()}
                                        className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl transition-all flex items-center gap-3 mx-auto"
                                    >
                                        <Upload size={20} /> Initialize Scan
                                    </button>
                                </div>
                            )}
                            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
                        </div>

                        {preview && !result && (
                            <button 
                                onClick={runAnalysis}
                                disabled={analyzing}
                                className="w-full py-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] shadow-2xl transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                            >
                                {analyzing ? (
                                    <><Loader2 className="animate-spin" /> Deep Scanning...</>
                                ) : (
                                    <><Zap fill="currentColor" /> Execute Forensic Audit</>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Right: Insights */}
                    <div className="bg-stone-900/40 rounded-[3rem] border border-white/5 p-10 overflow-y-auto custom-scrollbar">
                        {!result && !analyzing && (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                                <ShieldAlert size={64} className="mb-6" />
                                <p className="text-lg font-black uppercase tracking-widest">Awaiting Analysis Data</p>
                            </div>
                        )}

                        {analyzing && (
                            <div className="space-y-8 animate-pulse">
                                <div className="h-8 w-48 bg-white/5 rounded-full" />
                                <div className="space-y-4">
                                    <div className="h-24 w-full bg-white/5 rounded-3xl" />
                                    <div className="h-24 w-full bg-white/5 rounded-3xl" />
                                </div>
                            </div>
                        )}

                        {result && (
                            <div className="space-y-8 animate-fade-in-up">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                            <Radar size={16} /> Forensic Verdict
                                        </h3>
                                        {result.confidenceScore && (
                                            <div className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-[10px] font-black text-indigo-300 uppercase tracking-wider">
                                                AI Confidence: {result.confidenceScore}%
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xl text-white font-medium leading-relaxed">
                                        {result.analysis}
                                    </p>
                                    {result.isoCitation && (
                                        <div className="mt-3 text-[10px] text-gray-500 font-mono border-l-2 border-indigo-500 pl-3 uppercase tracking-wider">
                                            Compliance Ref: {result.isoCitation}
                                        </div>
                                    )}
                                </div>

                                {/* Hazard Grid */}
                                <div>
                                    <h3 className="text-sm font-black text-rose-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <AlertTriangle size={16} /> Detected Hazards ({result.hazards?.length})
                                    </h3>
                                    <div className="space-y-3">
                                        {result.hazards?.map((h, i) => (
                                            <div key={i} className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-4">
                                                <div className="p-2 bg-rose-500/20 rounded-lg text-rose-400">
                                                    <ShieldAlert size={18} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-black text-white text-xs uppercase">{h.type}</span>
                                                        <span className="px-2 py-0.5 bg-rose-500 text-[8px] font-black text-white rounded uppercase">{h.severity}</span>
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 mt-1">{h.description}</p>
                                                    <div className="text-[9px] text-emerald-400 font-bold mt-2 uppercase">Protocol: {h.mitigation}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Progress */}
                                <div>
                                    <h3 className="text-sm font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <CheckCircle size={16} /> Site Progress
                                    </h3>
                                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5 relative overflow-hidden">
                                        <div className="flex justify-between items-center mb-4 relative z-10">
                                            <div>
                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Task: {result.progress?.taskDetected}</span>
                                                {result.progress?.qualityCheck && (
                                                    <span className={`text-[10px] font-black uppercase tracking-widest mt-1 block ${result.progress.qualityCheck.includes('Pass') ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                        Quality Audit: {result.progress.qualityCheck}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-3xl font-black text-white font-mono">{result.progress?.completionEstimate}</span>
                                        </div>
                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden relative z-10">
                                            <div className="h-full bg-emerald-500 shadow-[0_0_15px_#10b981]" style={{ width: result.progress?.completionEstimate }} />
                                        </div>
                                        {/* Background Glow */}
                                        <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
                                    </div>
                                </div>

                                {/* Action Bridge */}
                                <div className="pt-6 border-t border-white/10">
                                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">Neural Recommendations</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {result.recommendedDocuments?.map((doc, i) => (
                                            <button 
                                                key={i}
                                                onClick={() => handleDraftAction(doc)}
                                                className="p-4 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 rounded-2xl text-left transition-all group"
                                            >
                                                <FileText size={20} className="text-indigo-400 mb-2" />
                                                <div className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Draft Protocol</div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-bold text-gray-300">{doc}</span>
                                                    <ArrowRight size={14} className="text-indigo-500 group-hover:translate-x-1 transition-transform" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default NeuralEye;
