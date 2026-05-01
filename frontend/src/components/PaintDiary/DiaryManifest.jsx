import React, { useState, useEffect } from 'react';
import { 
    FileText, Download, Upload, Camera, Save, 
    DollarSign, User, Wrench, Package, ArrowLeft, 
    Sparkles, Loader2, Edit2, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../utils/api';

const ManifestRow = ({ item, onUpdate, currency = '$' }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [localQty, setLocalQty] = useState(item.quantity);
    const [localName, setLocalName] = useState(item.name);

    const handleSave = () => {
        // Use originalId if it exists (for billableItems), otherwise fall back to id
        onUpdate(item.originalId || item.id, { quantity: parseFloat(localQty), name: localName });
        setIsEditing(false);
    };

    return (
        <div className="flex items-center gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors group">
            <div className={`p-2 rounded-lg ${
                item.type === 'staff' ? 'bg-emerald-500/10 text-emerald-400' : 
                item.type === 'equipment' ? 'bg-amber-500/10 text-amber-400' : 
                'bg-cyan-500/10 text-cyan-400'
            }`}>
                {item.type === 'staff' ? <User size={16} /> : 
                 item.type === 'equipment' ? <Wrench size={16} /> : <Package size={16} />}
            </div>
            
            <div className="flex-1">
                {isEditing ? (
                    <input 
                        className="bg-black/40 border border-white/10 rounded px-2 py-1 text-sm text-white w-full"
                        value={localName}
                        onChange={e => setLocalName(e.target.value)}
                    />
                ) : (
                    <div className="font-bold text-gray-200 text-sm">{item.name}</div>
                )}
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">{item.type}</div>
            </div>

            <div className="w-24 text-right">
                {isEditing ? (
                    <input 
                        type="number"
                        className="bg-black/40 border border-white/10 rounded px-2 py-1 text-sm text-white w-full text-right"
                        value={localQty}
                        onChange={e => setLocalQty(e.target.value)}
                    />
                ) : (
                    <div className="font-mono text-white text-sm">{item.duration || item.quantity} <span className="text-gray-600 text-[10px]">{item.type === 'material' ? 'units' : 'hrs'}</span></div>
                )}
            </div>

            <div className="w-24 text-right font-mono text-gray-400 text-sm">
                {currency}{(item.costRate || 0).toFixed(2)}
            </div>

            <div className="w-24 text-right font-mono text-emerald-400 font-bold text-sm">
                {currency}{(item.calculatedRevenue || (parseFloat(item.quantity || 0) * parseFloat(item.chargeRate || 0))).toFixed(2)}
            </div>

            <div className="w-8">
                {isEditing ? (
                    <button onClick={handleSave} className="p-1 hover:bg-emerald-500/20 text-emerald-400 rounded"><Check size={14} /></button>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="p-1 hover:bg-white/10 text-gray-500 hover:text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"><Edit2 size={14} /></button>
                )}
            </div>
        </div>
    );
};

const DiaryManifest = ({ items, onUpdateItem, onImportItems, project, date, jobRef, onClose }) => {
    const [uploading, setUploading] = useState(false);
    
    // --- EXCEL EXPORT ---
    const handleExport = async () => {
        try {
            const res = await api.post('/manifest/export-excel', {
                diaryData: { items },
                projectName: project?.name,
                date: date?.toLocaleDateString(),
                jobRef
            }, { responseType: 'blob' }); // Important for file download

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Manifest_${project?.name}_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
        } catch (e) {
            console.error("Export failed", e);
            alert("Export failed");
        }
    };

    // --- PHOTO TRANSCRIPTION ---
    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const res = await api.post('/manifest/transcribe', { image: reader.result });
                if (res.data.items) {
                    // We need to pass these back to parent to add to state
                    // This is a "simulated" add since we are in a view component
                    // ideally we pass a callback "onImportItems"
                    alert(`Found ${res.data.items.length} items! (Integration pending parent callback)`);
                    console.log("Transcribed:", res.data);
                }
            } catch (err) {
                console.error(err);
                alert("Transcription failed.");
            } finally {
                setUploading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const totalCost = items.reduce((sum, i) => sum + (i.calculatedCost || (parseFloat(i.quantity||0) * parseFloat(i.costRate||0))), 0);
    const totalRev = items.reduce((sum, i) => sum + (i.calculatedRevenue || (parseFloat(i.quantity||0) * parseFloat(i.chargeRate||0))), 0);

    return (
        <div className="fixed inset-0 z-[200] bg-[#0a0a0c] flex flex-col animate-fade-in">
            {/* Header */}
            <div className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-black/20 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-all">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                            <FileText className="text-indigo-400" /> Site Manifest
                        </h1>
                        <p className="text-xs text-gray-500 font-bold tracking-wider">
                            {project?.name || 'Unknown Project'} • {date?.toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <label className="flex items-center gap-2 px-4 py-2 bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer transition-all">
                        {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                        {uploading ? 'Scanning...' : 'Scan Logbook'}
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                    </label>
                    <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all">
                        <Download size={16} /> Export Excel
                    </button>
                </div>
            </div>

            {/* Document Body */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-4xl mx-auto bg-stone-900 border border-white/5 rounded-2xl shadow-2xl overflow-hidden">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-3 border-b border-white/5">
                        <div className="p-6 border-r border-white/5">
                            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Cost</div>
                            <div className="text-2xl font-mono font-black text-white">${totalCost.toLocaleString()}</div>
                        </div>
                        <div className="p-6 border-r border-white/5">
                            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Revenue</div>
                            <div className="text-2xl font-mono font-black text-emerald-400">${totalRev.toLocaleString()}</div>
                        </div>
                        <div className="p-6 bg-indigo-900/10">
                            <div className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Margin</div>
                            <div className="text-2xl font-mono font-black text-indigo-400">{((parseFloat(totalRev) - parseFloat(totalCost)) / (parseFloat(totalRev) || 1) * 100).toFixed(1)}%</div>
                        </div>
                    </div>

                    {/* List */}
                    <div className="bg-black/20">
                        {items.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                <Sparkles size={40} className="mx-auto mb-4 opacity-20" />
                                <p className="text-sm font-bold uppercase tracking-widest">No Items Logged</p>
                                <p className="text-xs mt-2">Scan a logbook or switch to Canvas to add items.</p>
                            </div>
                        ) : (
                            items.map(item => (
                                <ManifestRow key={item.id} item={item} onUpdate={onUpdateItem} />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiaryManifest;
