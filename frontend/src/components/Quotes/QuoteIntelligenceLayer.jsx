/*
 * MasterDiaryOS - Quote Intelligence Layer V1 (Estimation Engine)
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 * 
 * Specialized for high-fidelity quoting, margin analysis, and risk assessment.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Sparkles, AlertTriangle, ArrowRight, Target, 
    CheckCircle2, Info, Loader2, BarChart3, ListChecks,
    TrendingUp, ShieldAlert, Cpu, FileDown, Save, FileText,
    DollarSign, Percent, Layers, PieChart, Clock
} from 'lucide-react';
import { api } from '../../utils/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const QuoteIntelligenceLayer = ({ nodes, edges, financials, active, onToggleHeatmap }) => {
    const [intel, setIntel] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('margin'); // margin | coverage | risks | time
    const [heatmapActive, setHeatmapActive] = useState(false);

    // Live Analysis of the Quote Graph
    const analysis = useMemo(() => {
        if (!nodes || nodes.length === 0) return null;

        const materials = nodes.filter(n => n.type === 'quoteMaterial' || n.type === 'material');
        const labour = nodes.filter(n => n.type === 'quoteLabour' || n.type === 'staff');
        const areas = nodes.filter(n => n.type === 'areaNode');
        
        // 1. Coverage Risks (Items without parent Area)
        const missingCoverage = materials.filter(m => !edges.some(e => e.target === m.id && nodes.find(n => n.id === e.source)?.type === 'areaNode'));
        
        // 2. Orphaned Areas (Areas without children)
        const orphanedAreas = areas.filter(a => !edges.some(e => e.source === a.id));

        // 3. Zero Rate Risks
        const zeroRateItems = [...materials, ...labour].filter(n => (parseFloat(n.data?.rate) || 0) === 0);

        // 4. High Cost Items
        const highCostItems = [...materials, ...labour].filter(n => {
            const cost = (n.data?.quantity || 1) * (n.data?.rate || 0);
            return cost > 1000; 
        });

        // 5. Time Estimation
        const totalManHours = labour.reduce((sum, n) => {
            // If linked to area, calculate based on prodRate
            const parentLink = edges.find(e => e.target === n.id);
            const parentAreaNode = parentLink ? nodes.find(pn => pn.id === parentLink.source) : null;
            
            if (parentAreaNode) {
                const area = (parentAreaNode.data?.width || 0) * (parentAreaNode.data?.length || 0);
                const prodRate = n.data?.prodRate || 2; // m2/hr
                return sum + (area / prodRate);
            } else {
                return sum + (parseFloat(n.data?.duration) || 8);
            }
        }, 0);

        const estimatedDays = Math.ceil(totalManHours / 8); // Assuming 8hr days, 1 person

        const totalCost = financials.subtotal || 0;
        const totalRevenue = financials.total || 0;
        const margin = totalRevenue - totalCost;
        const marginPct = totalRevenue > 0 ? (margin / totalRevenue) * 100 : 0;

        return {
            materialCount: materials.length,
            labourCount: labour.length,
            areaCount: areas.length,
            missingCoverageCount: missingCoverage.length,
            orphanedAreaCount: orphanedAreas.length,
            zeroRateCount: zeroRateItems.length,
            highCostCount: highCostItems.length,
            marginPct: marginPct.toFixed(1),
            totalRevenue: totalRevenue,
            totalCost: totalCost,
            totalManHours: totalManHours.toFixed(1),
            estimatedDays: estimatedDays,
            risks: [
                ...missingCoverage.map(m => ({ type: 'Missing Link', severity: 'medium', description: `${m.data?.label || 'Material'} has no Area source.`, id: m.id })),
                ...orphanedAreas.map(a => ({ type: 'Empty Area', severity: 'low', description: `${a.data?.label || 'Area'} has no items linked.`, id: a.id })),
                ...zeroRateItems.map(z => ({ type: 'Zero Rate', severity: 'high', description: `${z.data?.label || 'Item'} has $0 cost.`, id: z.id })),
                ...highCostItems.map(h => ({ type: 'High Value', severity: 'low', description: `${h.data?.label || 'Item'} exceeds $1k cost base.`, id: h.id }))
            ]
        };
    }, [nodes, edges, financials]);

    const handleToggleHeatmap = () => {
        const newState = !heatmapActive;
        setHeatmapActive(newState);
        if (onToggleHeatmap) onToggleHeatmap(newState);
    };

    if (!active) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-6 animate-in fade-in duration-700 pb-10"
        >
            {/* TAB SWITCHER */}
            <div className="flex justify-center">
                <div className="flex bg-black/60 backdrop-blur-xl border border-white/10 p-1.5 rounded-3xl gap-1">
                    {[
                        { id: 'margin', label: 'Margin Analysis', icon: PieChart },
                        { id: 'coverage', label: 'Coverage Map', icon: Layers },
                        { id: 'time', label: 'Time & Prelims', icon: Clock },
                        { id: 'risks', label: 'Risk Audit', icon: ShieldAlert }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                activeTab === tab.id 
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' 
                                : 'text-gray-500 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'margin' && (
                    <motion.div 
                        key="margin"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* MARGIN DIAL */}
                            <div className="p-8 bg-gradient-to-br from-indigo-950/40 to-black border border-indigo-500/30 rounded-[3rem] shadow-xl relative overflow-hidden flex flex-col justify-center items-center text-center">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1),transparent_70%)]" />
                                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-2">Net Margin</div>
                                <div className="text-6xl font-black text-white tracking-tighter mb-2">{analysis?.marginPct}%</div>
                                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${parseFloat(analysis?.marginPct) > 15 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                    {parseFloat(analysis?.marginPct) > 15 ? 'Healthy' : 'Optimization Needed'}
                                </div>
                            </div>

                            {/* COST STRUCTURE */}
                            <div className="md:col-span-2 p-8 bg-black/40 border border-white/5 rounded-[3rem] flex flex-col justify-center">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-indigo-600/20 rounded-lg text-indigo-400">
                                        <BarChart3 size={16} />
                                    </div>
                                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">FINANCIAL STRUCTURE</span>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <span className="text-xs font-bold text-gray-400 uppercase">Revenue</span>
                                        <span className="text-xl font-mono font-black text-white">${analysis?.totalRevenue.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <span className="text-xs font-bold text-gray-400 uppercase">Cost Base</span>
                                        <span className="text-xl font-mono font-black text-rose-400">${analysis?.totalCost.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* VISUAL TOGGLES */}
                        <div className="flex justify-center mt-4">
                            <button 
                                onClick={handleToggleHeatmap}
                                className={`px-8 py-4 rounded-2xl border transition-all flex items-center gap-3 ${heatmapActive ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}
                            >
                                <Target size={18} className={heatmapActive ? 'animate-pulse' : ''} />
                                <span className="text-xs font-black uppercase tracking-widest">{heatmapActive ? 'Disable Margin Heatmap' : 'Enable Margin Heatmap'}</span>
                            </button>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'coverage' && (
                    <motion.div 
                        key="coverage"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="p-8 bg-[#0a0a0c] border border-white/5 rounded-[3rem] shadow-xl"
                    >
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em]">Spatial Logic</h4>
                                <div className="p-6 bg-cyan-900/10 border border-cyan-500/20 rounded-[2rem]">
                                    <div className="text-4xl font-black text-white mb-1">{analysis?.areaCount}</div>
                                    <div className="text-xs font-bold text-cyan-500 uppercase">Active Areas</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem]">
                                        <div className="text-2xl font-black text-white mb-1">{analysis?.missingCoverageCount}</div>
                                        <div className="text-[10px] font-bold text-rose-400 uppercase">Unlinked Items</div>
                                    </div>
                                    <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem]">
                                        <div className="text-2xl font-black text-white mb-1">{analysis?.orphanedAreaCount}</div>
                                        <div className="text-[10px] font-bold text-amber-400 uppercase">Empty Areas</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col justify-center gap-4">
                                <div className="text-sm text-gray-400 font-medium leading-relaxed">
                                    "Your quote graph currently has <span className="text-white font-bold">{analysis?.missingCoverageCount} unlinked items</span> and <span className="text-white font-bold">{analysis?.orphanedAreaCount} empty areas</span>. Ensure all spatial nodes are driving costs."
                                </div>
                                <div className="h-px bg-white/10 w-full" />
                                <div className="text-xs font-bold text-indigo-400 flex items-center gap-2">
                                    <Sparkles size={14} /> AI Recommendation:
                                </div>
                                <p className="text-xs text-gray-500">Connect 'Area Nodes' to 'Materials' for auto-calc. Populate empty areas or remove them to clean the blueprint.</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'time' && (
                    <motion.div 
                        key="time"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="p-8 bg-[#0a0a0c] border border-white/5 rounded-[3rem] shadow-xl"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 border border-emerald-500/30">
                                <Clock size={16} />
                            </div>
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em]">DURATION FORECAST</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-6 bg-black/40 border border-white/5 rounded-[2rem] flex flex-col justify-center text-center">
                                <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">Total Man-Hours</div>
                                <div className="text-5xl font-black text-white tracking-tighter">{analysis?.totalManHours}</div>
                                <div className="text-[9px] font-bold text-gray-600 uppercase mt-2">Calculated from Labour Nodes</div>
                            </div>
                            <div className="p-6 bg-emerald-900/10 border border-emerald-500/20 rounded-[2rem] flex flex-col justify-center text-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent_60%)]" />
                                <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-2">Est. Project Duration</div>
                                <div className="text-5xl font-black text-emerald-400 tracking-tighter">{analysis?.estimatedDays}<span className="text-lg ml-1 text-emerald-600">DAYS</span></div>
                                <div className="text-[9px] font-bold text-emerald-600/60 uppercase mt-2">Based on 1-Man Crew (8hr/day)</div>
                            </div>
                        </div>
                        
                        <div className="mt-6 p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="text-xs font-bold text-white mb-1 flex items-center gap-2"><Info size={14} className="text-indigo-400"/> Preliminaries Check</div>
                            <p className="text-[10px] text-gray-400 leading-relaxed">
                                Ensure you have accounted for <strong>{analysis?.estimatedDays} days</strong> of site overheads (Toilet hire, Fencing, Supervision).
                            </p>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'risks' && (
                    <motion.div 
                        key="risks"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                    >
                        <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-[0.4em] mb-4 text-center">Detected Quote Risks</h4>
                        {analysis?.risks.length > 0 ? (
                            analysis.risks.map((risk, idx) => (
                                <div key={idx} className="p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-rose-500/30 transition-all flex items-start gap-4">
                                    <div className={`p-2.5 rounded-xl ${risk.severity === 'high' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                        <AlertTriangle size={16} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[9px] font-black text-white uppercase tracking-widest">{risk.type}</span>
                                            <span className="text-[8px] font-bold text-gray-500 uppercase border border-white/10 px-1.5 rounded">{risk.severity}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 font-medium">{risk.description}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center border border-dashed border-white/10 rounded-3xl">
                                <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-3" />
                                <div className="text-sm font-bold text-white">No Critical Risks Detected</div>
                                <div className="text-[10px] text-gray-500 uppercase mt-1">Estimation Logic Valid</div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FOOTER */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-6 bg-black/40 border border-white/5 rounded-[2rem] px-10">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest italic">Engine: nee.intelligenceLayer.v1</span>
                    </div>
                </div>
                <div className="text-[10px] font-mono text-gray-600 flex items-center gap-2 italic">
                    <Cpu size={12} className="animate-spin-slow" />
                    Powered by MasterDiaryOS
                </div>
            </div>
        </motion.div>
    );
};

export default QuoteIntelligenceLayer;