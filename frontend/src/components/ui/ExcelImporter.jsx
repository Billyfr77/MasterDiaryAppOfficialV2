import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, CheckCircle, X, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../utils/api';

const ExcelImporter = ({ isOpen, onClose, onImport, title = "Import Data" }) => {
    const [loading, setLoading] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/manifest/import-excel', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setPreviewData(res.data.data);
        } catch (err) {
            console.error(err);
            alert("Failed to parse Excel file. Ensure it matches the standard format.");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = () => {
        onImport(previewData);
        onClose();
        setPreviewData(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#0a0a0c] border border-white/10 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-stone-900/50">
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                            <FileSpreadsheet className="text-emerald-500" /> {title}
                        </h2>
                        <p className="text-xs text-gray-500 font-bold mt-1">Convert Spreadsheet to Neural Nodes</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400 transition-colors"><X size={20} /></button>
                </div>

                <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                    {!previewData ? (
                        <div 
                            onClick={() => fileInputRef.current.click()}
                            className="border-2 border-dashed border-white/10 rounded-2xl h-64 flex flex-col items-center justify-center hover:bg-white/5 hover:border-emerald-500/50 transition-all cursor-pointer group"
                        >
                            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".xlsx, .xls" className="hidden" />
                            <div className="p-4 bg-emerald-500/10 rounded-full text-emerald-500 mb-4 group-hover:scale-110 transition-transform">
                                {loading ? <Loader2 size={32} className="animate-spin" /> : <UploadCloud size={32} />}
                            </div>
                            <p className="text-sm font-bold text-white uppercase tracking-widest">Click to Upload Spreadsheet</p>
                            <p className="text-xs text-gray-500 mt-2">Supports standard .xlsx exports</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-2">
                                <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Preview: {previewData.length} Items Found</span>
                                <button onClick={() => setPreviewData(null)} className="text-xs text-gray-500 hover:text-white underline">Re-upload</button>
                            </div>
                            <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                                {previewData.slice(0, 5).map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 p-3 border-b border-white/5 last:border-0 text-sm">
                                        <div className="flex-1 font-bold text-gray-300">{item.name}</div>
                                        <div className="text-gray-500 w-24 text-right">{item.quantity} x ${item.rate}</div>
                                        <div className="w-20 text-xs font-black text-emerald-500/50 uppercase text-right">{item.type}</div>
                                    </div>
                                ))}
                                {previewData.length > 5 && (
                                    <div className="p-3 text-center text-xs text-gray-500 italic bg-black/20">
                                        + {previewData.length - 5} more items...
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {previewData && (
                    <div className="p-6 border-t border-white/5 bg-black/20 flex gap-3">
                        <button onClick={onClose} className="flex-1 py-4 text-gray-500 font-bold hover:text-white transition-colors uppercase text-xs tracking-widest">Cancel</button>
                        <button 
                            onClick={handleConfirm}
                            className="flex-[2] py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all"
                        >
                            <CheckCircle size={16} /> Import to Canvas
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ExcelImporter;
