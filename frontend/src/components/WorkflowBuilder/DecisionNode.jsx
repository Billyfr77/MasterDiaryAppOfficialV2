import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitFork, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default memo(({ data, selected }) => {
  // Styles
  const borderColor = selected ? 'border-orange-500' : 'border-orange-500/30';
  const shadow = selected ? 'shadow-[0_0_50px_rgba(249,115,22,0.4)]' : 'shadow-xl shadow-black/50';
  const bgGradient = 'bg-gradient-to-br from-slate-900 via-slate-900 to-black';

  return (
    <div className="relative w-48 h-48 flex items-center justify-center group">
      {/* Diamond Shape Container */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0, rotate: 45 }}
        animate={{ scale: 1, opacity: 1, rotate: 45 }}
        className={`
          absolute inset-0 rounded-3xl border backdrop-blur-xl transition-all duration-300
          ${borderColor} ${bgGradient} ${shadow}
        `}
      >
         {/* Inner Glow for status */}
         <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-500/10 to-transparent pointer-events-none" />
         
         {/* Tech Lines */}
         <div className="absolute inset-2 border border-white/5 rounded-2xl" />

         {/* MASTERPIECE: PULSE FLASH */}
         <AnimatePresence>
            {data.isSimulating && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 bg-white/20 z-30 rounded-3xl"
                />
            )}
         </AnimatePresence>

         {/* MASTERPIECE: ERROR FLASH */}
         <AnimatePresence>
            {data.simulationError && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0, 1, 0] }}
                    transition={{ duration: 0.4, repeat: Infinity }}
                    className="absolute inset-0 bg-red-500/30 z-30 rounded-3xl"
                />
            )}
         </AnimatePresence>
      </motion.div>

      {/* Input Handle (Left) */}
      <Handle 
        type="target" 
        position={Position.Left} 
        id="input"
        className="!bg-slate-900 !w-4 !h-4 !-left-2 !border-[3px] !border-orange-500 hover:!bg-orange-400 hover:!scale-125 transition-all z-50 cursor-crosshair shadow-[0_0_15px_rgba(249,115,22,0.6)]" 
      />

      {/* Content (Counter-Rotated) */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center p-4 pointer-events-none w-full">
        <div className="p-3 rounded-2xl bg-slate-900/80 border border-orange-500/30 mb-3 text-orange-400 shadow-lg shadow-orange-900/20 backdrop-blur-md">
            <GitFork size={24} />
        </div>
        <p className="text-[10px] font-black text-orange-500/80 uppercase tracking-[0.2em] mb-1">Logic Gate</p>
        <p className="text-sm font-bold text-white leading-tight max-w-[120px] drop-shadow-md">
            {data.label || 'Condition Check?'}
        </p>
      </div>

      {/* Output Handles */}
      
      {/* TRUE / YES (Top) */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex flex-col items-center group/yes">
        <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-md mb-2 transition-transform group-hover/yes:-translate-y-1">
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Yes</span>
        </div>
        <Handle 
            type="source" 
            position={Position.Top} 
            id="true"
            className="!bg-emerald-500 !w-4 !h-4 !relative !top-0 !left-0 !transform-none !border-[3px] !border-slate-900 hover:!scale-125 transition-all cursor-crosshair shadow-[0_0_15px_rgba(16,185,129,0.6)]" 
        />
      </div>

      {/* FALSE / NO (Bottom) */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex flex-col-reverse items-center group/no">
        <div className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 backdrop-blur-md mt-2 transition-transform group-hover/no:translate-y-1">
            <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">No</span>
        </div>
        <Handle 
            type="source" 
            position={Position.Bottom} 
            id="false"
            className="!bg-rose-500 !w-4 !h-4 !relative !bottom-0 !left-0 !transform-none !border-[3px] !border-slate-900 hover:!scale-125 transition-all cursor-crosshair shadow-[0_0_15px_rgba(243,63,94,0.6)]" 
        />
      </div>

    </div>
  );
});