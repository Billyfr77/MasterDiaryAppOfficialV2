import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitFork, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default memo(({ data, selected }) => {
  // Styles
  const borderColor = selected ? 'border-orange-500' : 'border-orange-500/30';
  const shadow = selected ? 'shadow-[0_0_50px_rgba(249,115,22,0.6)]' : 'shadow-xl shadow-black/50';
  const bgGradient = 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950';

  return (
    <div className="relative w-40 h-40 flex items-center justify-center group">
      {/* Diamond Shape Container */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0, rotate: 45 }}
        animate={{ scale: 1, opacity: 1, rotate: 45 }}
        className={`
          absolute inset-0 rounded-2xl border-2 backdrop-blur-2xl transition-all duration-300
          ${borderColor} ${bgGradient} ${shadow}
        `}
      >
         {/* Inner Glow for status */}
         <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none" />
         
         {/* Tech Lines */}
         <div className="absolute inset-0 border border-white/5 rounded-2xl scale-90" />
      </motion.div>

      {/* Input Handle (Left) */}
      <Handle 
        type="target" 
        position={Position.Left} 
        id="input"
        className="!bg-slate-900 !w-5 !h-5 !-left-2.5 !border-[3px] !border-orange-500 hover:!bg-orange-400 hover:!scale-110 transition-all z-50 cursor-crosshair shadow-[0_0_15px_rgba(249,115,22,0.6)]" 
      />

      {/* Content (Counter-Rotated) */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center p-2 pointer-events-none">
        <div className="p-2.5 rounded-full bg-slate-950 border border-orange-500/30 mb-2 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
            <GitFork size={24} />
        </div>
        <p className="text-[10px] font-bold text-orange-200 uppercase tracking-widest mb-1 opacity-70">Decision</p>
        <p className="text-sm font-bold text-white leading-tight max-w-[100px] drop-shadow-md">
            {data.label || 'Condition?'}
        </p>
      </div>

      {/* Output Handles */}
      
      {/* TRUE / YES (Top) */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <span className="text-[10px] font-black text-green-400 uppercase mb-1 bg-slate-900 px-2 py-0.5 rounded border border-green-500/30 shadow-lg tracking-wider">Yes</span>
        <Handle 
            type="source" 
            position={Position.Top} 
            id="true"
            className="!bg-green-500 !w-5 !h-5 !relative !top-0 !left-0 !transform-none !border-2 !border-slate-950 hover:!scale-110 transition-all cursor-crosshair shadow-[0_0_15px_rgba(34,197,94,0.6)]" 
        />
      </div>

      {/* FALSE / NO (Bottom) */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex flex-col-reverse items-center">
        <span className="text-[10px] font-black text-red-400 uppercase mt-1 bg-slate-900 px-2 py-0.5 rounded border border-red-500/30 shadow-lg tracking-wider">No</span>
        <Handle 
            type="source" 
            position={Position.Bottom} 
            id="false"
            className="!bg-red-500 !w-5 !h-5 !relative !bottom-0 !left-0 !transform-none !border-2 !border-slate-950 hover:!scale-110 transition-all cursor-crosshair shadow-[0_0_15px_rgba(239,68,68,0.6)]" 
        />
      </div>

    </div>
  );
});
