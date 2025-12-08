import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, AlertCircle } from 'lucide-react';

export default function TimelineView({ nodes, onNodeClick }) {
  // Helper to normalize dates
  const processedNodes = useMemo(() => {
    return nodes.map(node => {
      let start = node.data.startDate ? new Date(node.data.startDate) : new Date();
      if (isNaN(start.getTime())) start = new Date();
      
      let end = node.data.deadline ? new Date(node.data.deadline) : new Date(start.getTime() + 86400000);
      if (isNaN(end.getTime())) end = new Date(start.getTime() + 86400000);

      // Ensure end is after start
      if (end < start) end = new Date(start.getTime() + 86400000);

      return { ...node, start, end };
    }).sort((a, b) => a.start - b.start);
  }, [nodes]);

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
    min.setDate(min.getDate() - 2);
    max.setDate(max.getDate() + 5);

    const diffTime = Math.abs(max - min);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return { minDate: min, maxDate: max, totalDays: diffDays || 1 };
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
    const diff = Math.ceil((date - minDate) / (1000 * 60 * 60 * 24));
    return (diff / totalDays) * 100;
  };

  const getWidth = (start, end) => {
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return Math.max((diff / totalDays) * 100, 2); // Min width 2%
  };

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <Calendar size={48} className="mb-4 opacity-50" />
        <p>No nodes to display. Switch to Graph View to add tasks.</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden flex flex-col bg-slate-950">
      <div className="flex-1 overflow-auto custom-scrollbar relative">
        <div className="min-w-[1000px] p-6">
          
          {/* Header Dates */}
          <div className="flex border-b border-slate-800 pb-2 mb-4 sticky top-0 bg-slate-950/95 backdrop-blur z-10">
            <div className="w-48 flex-shrink-0 font-bold text-slate-400 text-sm pl-2">Task Name</div>
            <div className="flex-1 relative h-6">
              {calendarDays.map((date, index) => {
                // Show label every 7 days or if total days is small
                const showLabel = totalDays < 20 || index % 7 === 0;
                return (
                  <div 
                    key={index} 
                    className="absolute bottom-0 text-[10px] text-slate-500 border-l border-slate-800 pl-1 h-full flex items-end"
                    style={{ left: `${(index / totalDays) * 100}%` }}
                  >
                    {showLabel && date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Timeline Rows */}
          <div className="space-y-3 relative">
            {/* Grid Lines */}
            <div className="absolute inset-0 pointer-events-none z-0">
               {calendarDays.map((_, index) => (
                  <div 
                    key={index} 
                    className="absolute top-0 bottom-0 border-r border-slate-800/30"
                    style={{ left: `${(index / totalDays) * 100}%` }}
                  />
               ))}
               {/* Today Line */}
               {(() => {
                 const today = new Date();
                 if (today >= minDate && today <= maxDate) {
                   const left = getPosition(today);
                   return (
                     <div 
                        className="absolute top-0 bottom-0 border-r-2 border-red-500/50 z-20"
                        style={{ left: `${left}%` }}
                     >
                        <div className="bg-red-500 text-white text-[9px] font-bold px-1 rounded-sm absolute -top-4 -translate-x-1/2">
                          TODAY
                        </div>
                     </div>
                   );
                 }
                 return null;
               })()}
            </div>

            {processedNodes.map((node) => {
               const left = getPosition(node.start);
               const width = getWidth(node.start, node.end);
               const statusColor = node.data.status === 'completed' ? 'bg-green-500' :
                                   node.data.status === 'in-progress' ? 'bg-blue-500' :
                                   node.data.status === 'error' ? 'bg-red-500' : 'bg-slate-600';

               return (
                 <motion.div 
                   key={node.id}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="flex items-center relative z-10 group"
                 >
                   <div 
                     className="w-48 flex-shrink-0 pr-4 truncate text-sm font-medium text-slate-300 cursor-pointer hover:text-white transition-colors flex items-center gap-2"
                     onClick={(e) => onNodeClick(e, node)}
                   >
                     {node.data.label}
                     {node.data.status === 'error' && <AlertCircle size={12} className="text-red-400" />}
                   </div>
                   
                   <div className="flex-1 relative h-8 rounded-lg bg-slate-900/50">
                     <div 
                       className={`absolute top-1 bottom-1 rounded-md ${statusColor} shadow-lg opacity-80 hover:opacity-100 transition-all cursor-pointer flex items-center px-2`}
                       style={{ left: `${left}%`, width: `${width}%` }}
                       onClick={(e) => onNodeClick(e, node)}
                     >
                        <span className="text-[10px] font-bold text-white truncate sticky left-0">
                          {width > 5 && node.data.label}
                        </span>
                     </div>
                   </div>
                 </motion.div>
               );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
