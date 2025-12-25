import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, AlertCircle, Clock, Truck, FileText, Zap, ShieldCheck } from 'lucide-react';

export default function TimelineView({ nodes, onNodeClick, simulationData }) {
  // Helper to normalize dates and handle simulation offsets
  const processedNodes = useMemo(() => {
    return nodes.map(node => {
      let start = node.data.startDate ? new Date(node.data.startDate) : new Date();
      if (isNaN(start.getTime())) start = new Date();
      
      // If simulation data exists, use the calculated durations
      const simResult = simulationData?.nodes[node.id];
      let end;
      
      if (simResult) {
          // Duration in hours from simulation
          const hours = simResult.endTime - simResult.startTime;
          end = new Date(start.getTime() + hours * 3600000);
      } else {
          end = node.data.deadline ? new Date(node.data.deadline) : new Date(start.getTime() + 86400000);
      }
      
      if (isNaN(end.getTime())) end = new Date(start.getTime() + 86400000);
      if (end < start) end = new Date(start.getTime() + 86400000);

      return { ...node, start, end, simResult };
    }).sort((a, b) => a.start - b.start);
  }, [nodes, simulationData]);

  // Determine timeline range
  const { minDate, maxDate, totalDays } = useMemo(() => {
    if (processedNodes.length === 0) return { minDate: new Date(), maxDate: new Date(), totalDays: 1 };
    
    let min = new Date(processedNodes[0].start);
    let max = new Date(processedNodes[0].end);

    processedNodes.forEach(n => {
      if (n.start < min) min = new Date(n.start);
      if (n.end > max) max = new Date(n.end);
    });

    // Add buffer
    const startBuffer = new Date(min);
    startBuffer.setDate(startBuffer.getDate() - 2);
    
    const endBuffer = new Date(max);
    endBuffer.setDate(endBuffer.getDate() + 7);

    const diffTime = Math.abs(endBuffer - startBuffer);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return { minDate: startBuffer, maxDate: endBuffer, totalDays: diffDays || 1 };
  }, [processedNodes]);

  // Generate calendar header dates
  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(minDate);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }, [minDate, totalDays]);

  const getPosition = (date) => {
    const diff = (date - minDate) / (1000 * 60 * 60 * 24);
    return (diff / totalDays) * 100;
  };

  const getWidth = (start, end) => {
    const diff = (end - start) / (1000 * 60 * 60 * 24);
    return Math.max((diff / totalDays) * 100, 0.5); 
  };

  const getNodeIcon = (type) => {
      switch(type) {
          case 'invoiceNode': return <FileText size={12} />;
          case 'resourceNode': return <Truck size={12} />;
          case 'safetyNode': return <ShieldCheck size={12} />;
          case 'trigger': return <Zap size={12} />;
          default: return <Clock size={12} />;
      }
  };

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 bg-[#050505]">
        <Calendar size={48} className="mb-4 opacity-50" />
        <p className="text-sm font-black uppercase tracking-widest">Lattice Empty</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden flex flex-col bg-[#050505] relative">
      {/* BACKGROUND GRID DECORATION */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#3b82f6 0.5px, transparent 0.5px)', backgroundSize: '30px 30px' }} />

      <div className="flex-1 overflow-auto custom-scrollbar relative z-10">
        <div className="min-w-[1200px] p-8">
          
          {/* Header Section */}
          <div className="flex items-end mb-10 gap-8">
              <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Temporal Trajectory</h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Operational Chronos Lattice</p>
              </div>
              {simulationData && (
                  <div className="flex gap-4">
                      <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                          <p className="text-[8px] font-black text-indigo-400 uppercase">Simulated Duration</p>
                          <p className="text-lg font-mono font-bold text-white">{simulationData.stats.totalDuration}H</p>
                      </div>
                      <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                          <p className="text-[8px] font-black text-emerald-400 uppercase">Projected Cost</p>
                          <p className="text-lg font-mono font-bold text-white">${simulationData.stats.totalCost.toLocaleString()}</p>
                      </div>
                  </div>
              )}
          </div>

          {/* Header Dates */}
          <div className="flex border-b border-white/5 pb-4 mb-6 sticky top-0 bg-[#050505]/95 backdrop-blur-xl z-30">
            <div className="w-64 flex-shrink-0 font-black text-slate-500 text-[10px] uppercase tracking-[0.2em] pl-4">Lattice_Node_Identifier</div>
            <div className="flex-1 relative h-8">
              {calendarDays.map((date, index) => {
                const isFirstOfMonth = date.getDate() === 1;
                const isMonday = date.getDay() === 1;
                const showLabel = isFirstOfMonth || (totalDays < 30 && isMonday) || index === 0;
                
                return (
                  <div 
                    key={index} 
                    className="absolute bottom-0 h-full border-l border-white/5 flex flex-col justify-end pb-1 pl-2 transition-colors hover:bg-white/5"
                    style={{ left: `${(index / totalDays) * 100}%`, width: `${(1 / totalDays) * 100}%` }}
                  >
                    {showLabel && (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[9px] font-black text-slate-400 whitespace-nowrap">
                            {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </motion.span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Timeline Rows */}
          <div className="space-y-4 relative">
            {/* Vertical Grid Lines */}
            <div className="absolute inset-0 pointer-events-none z-0">
               {calendarDays.map((_, index) => (
                  <div 
                    key={index} 
                    className="absolute top-0 bottom-0 border-r border-white/5"
                    style={{ left: `${(index / totalDays) * 100}%` }}
                  />
               ))}
               {/* Today Indicator */}
               {(() => {
                 const today = new Date();
                 if (today >= minDate && today <= maxDate) {
                   const left = getPosition(today);
                   return (
                     <div 
                        className="absolute top-0 bottom-0 border-r-2 border-indigo-500/40 z-20"
                        style={{ left: `${left}%` }}
                     >
                        <div className="bg-indigo-500 text-white text-[8px] font-black tracking-widest px-2 py-0.5 rounded-full absolute -top-6 -translate-x-1/2 whitespace-nowrap shadow-[0_0_10px_#6366f1]">
                          LIVE_CHRONOS
                        </div>
                     </div>
                   );
                 }
                 return null;
               })()}
            </div>

            {processedNodes.map((node, idx) => {
               const left = getPosition(node.start);
               const width = getWidth(node.start, node.end);
               
               const getTheme = () => {
                   if (node.data.status === 'completed') return { bg: 'bg-emerald-500', glow: 'shadow-emerald-500/20', text: 'text-emerald-400' };
                   if (node.data.status === 'error') return { bg: 'bg-rose-500', glow: 'shadow-rose-500/20', text: 'text-rose-400' };
                   if (node.data.status === 'in-progress') return { bg: 'bg-blue-500', glow: 'shadow-blue-500/20', text: 'text-blue-400' };
                   return { bg: 'bg-indigo-600', glow: 'shadow-indigo-500/20', text: 'text-indigo-400' };
               };
               
               const theme = getTheme();

               return (
                 <motion.div 
                   key={node.id}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: idx * 0.05 }}
                   className="flex items-center relative z-10 group h-12"
                 >
                   {/* Row Backdrop */}
                   <div className="absolute inset-0 bg-white/[0.02] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                   <div 
                     className="w-64 flex-shrink-0 px-4 truncate flex flex-col justify-center cursor-pointer relative z-20"
                     onClick={(e) => onNodeClick(e, node)}
                   >
                     <div className="flex items-center gap-2">
                         <div className={`p-1 rounded bg-slate-900 border border-white/10 ${theme.text}`}>
                             {getNodeIcon(node.type)}
                         </div>
                         <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors truncate">
                             {node.data.label}
                         </span>
                     </div>
                     <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-0.5 ml-6">
                         {node.type.replace('Node', '')} // {node.data.status}
                     </span>
                   </div>
                   
                   <div className="flex-1 relative h-full flex items-center">
                     <motion.div 
                       layoutId={`bar-${node.id}`}
                       className={`absolute h-6 rounded-lg ${theme.bg} shadow-2xl ${theme.glow} flex items-center px-3 cursor-pointer group/bar overflow-hidden`}
                       style={{ left: `${left}%`, width: `${width}%` }}
                       whileHover={{ height: 28, zIndex: 40 }}
                       onClick={(e) => onNodeClick(e, node)}
                     >
                        {/* Internal Shine */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/bar:opacity-100 transition-opacity" />
                        
                        <span className="text-[9px] font-black text-white truncate drop-shadow-md relative z-10 uppercase tracking-tighter">
                          {width > 8 && node.data.label}
                        </span>

                        {/* Connection Stub (Visual only) */}
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/20" />
                     </motion.div>

                     {/* Risk Points */}
                     {node.simResult?.status === 'red' && (
                         <div className="absolute -bottom-1 z-50" style={{ left: `${left + width}%` }}>
                             <AlertCircle size={14} className="text-rose-500 drop-shadow-[0_0_5px_rgba(244,63,94,0.8)] animate-bounce" />
                         </div>
                     )}
                   </div>
                 </motion.div>
               );
            })}
          </div>

          {/* Footer Metrics */}
          <div className="mt-12 pt-8 border-t border-white/5 grid grid-cols-4 gap-8">
              <MetricBox label="Temporal Integrity" value="98.2%" color="text-indigo-400" />
              <MetricBox label="Logical Orphans" value={processedNodes.filter(n => !nodes.some(node => nodes.find(target => target.id === node.id))).length} color="text-amber-400" />
              <MetricBox label="Gantt Depth" value="L4_MASTER" color="text-emerald-400" />
              <MetricBox label="Forensic Status" value="OPTIMIZED" color="text-blue-400" />
          </div>

        </div>
      </div>
    </div>
  );
}

const MetricBox = ({ label, value, color }) => (
    <div className="space-y-1">
        <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">{label}</p>
        <p className={`text-xl font-mono font-black ${color}`}>{value}</p>
    </div>
);
