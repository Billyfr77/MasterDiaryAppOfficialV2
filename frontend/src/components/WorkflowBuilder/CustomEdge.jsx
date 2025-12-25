import React from 'react';
import { BaseEdge, getSmoothStepPath, EdgeLabelRenderer } from '@xyflow/react';
import { motion } from 'framer-motion';

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  sourceHandleId
}) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

    const isBlocked = data?.isBlocked;
    const isActive = data?.isActive;
    const theme = data?.theme || 'indigo';
  
    // --- NEXT-LEVEL ELECTRIC THEME ENGINE ---
    const themeMap = {
        indigo: { stroke: '#818cf8', glow: '#6366f1', particle: '#c7d2fe', arc: '#4f46e5' },
        emerald: { stroke: '#34d399', glow: '#10b981', particle: '#a7f3d0', arc: '#059669' },
        solar: { stroke: '#fbbf24', glow: '#f59e0b', particle: '#fef3c7', arc: '#d97706' },
        rose: { stroke: '#fb7185', glow: '#f43f5e', particle: '#fecdd3', arc: '#e11d48' },
        violet: { stroke: '#a78bfa', glow: '#8b5cf6', particle: '#ddd6fe', arc: '#7c3aed' },
        cyan: { stroke: '#22d3ee', glow: '#06b6d4', particle: '#cffafe', arc: '#0891b2' },
        amber: { stroke: '#fbbf24', glow: '#d97706', particle: '#fef3c7', arc: '#b45309' },
        slate: { stroke: '#94a3b8', glow: '#64748b', particle: '#f1f5f9', arc: '#475569' }
    };
  
    const activeTheme = themeMap[theme] || themeMap.indigo;
  
    let mainColor = activeTheme.stroke;
    let glowColor = activeTheme.glow;
    
    if (sourceHandleId === 'true') { mainColor = '#10b981'; glowColor = '#34d399'; }
    if (sourceHandleId === 'false') { mainColor = '#f43f5e'; glowColor = '#fb7185'; }
    if (isBlocked) { mainColor = '#ef4444'; glowColor = '#f87171'; }
  
      return (
        <>
          <defs>
            {/* OPTIMIZED GLOW FILTER */}
            <filter id={`neural-glow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
    
                {/* 1. ATMOSPHERIC AMBIENCE (Static) */}
                <path
                  d={edgePath}
                  fill="none"
                  stroke={glowColor}
                  strokeWidth={isActive ? 16 : 8}
                  style={{ opacity: 0.1, filter: 'blur(10px)' }}
                />
          
                {/* 2. BUZZY ELECTRICAL ARC (Fast flicker) */}
                <path
                  d={edgePath}
                  fill="none"
                  stroke={mainColor}
                  strokeWidth="0.5"
                  strokeDasharray="2, 6"
                  opacity="0.3"
                >
                  <animate attributeName="stroke-dashoffset" from="20" to="0" dur="0.4s" repeatCount="indefinite" />
                </path>
          
                {/* 3. THE NEON CORE */}
                <BaseEdge 
                  path={edgePath} 
                  style={{ 
                      stroke: mainColor, 
                      strokeWidth: isActive ? 3 : 1.2, 
                      filter: isActive ? `url(#neural-glow-${id})` : 'none',
                      strokeOpacity: 0.8
                  }} 
                />          
          {/* 4. STREAMLINED PARTICLE STORM */}
          {!isBlocked && (
            <>
              {/* Stream A: Efficiency Packets */}
              {[0, 1].map((d, i) => (
                <circle key={`a-${i}`} r={isActive ? 2 : 1} fill={activeTheme.particle}>
                  <animateMotion dur={isActive ? "1.2s" : "5s"} begin={`${d}s`} repeatCount="indefinite" path={edgePath} />
                  <animate attributeName="opacity" values="0;1;0" dur={isActive ? "1.2s" : "5s"} begin={`${d}s`} repeatCount="indefinite" />
                </circle>
              ))}
    
              {/* 5. VIBRANT SURGE (Active only) */}
              {isActive && (
                <path
                    d={edgePath}
                    fill="none"
                    stroke={activeTheme.particle}
                    strokeWidth="1.5"
                    strokeDasharray="40, 160"
                    opacity="0.6"
                >
                    <animate 
                        attributeName="stroke-dashoffset" 
                        from="200" 
                        to="0" 
                        dur="0.8s" 
                        repeatCount="indefinite" 
                    />
                </path>
              )}
            </>
          )}      {/* Logic Labels (Holographic Badges) */}
      {(sourceHandleId === 'true' || sourceHandleId === 'false') && (
          <EdgeLabelRenderer>
            <div
                style={{
                    position: 'absolute',
                    transform: `translate(-50%, -50%) translate(${sourceX + (targetX - sourceX) * 0.25}px,${sourceY + (targetY - sourceY) * 0.25}px)`,
                    fontSize: 10,
                    pointerEvents: 'none',
                }}
                className="nodrag nopan"
            >
                <div className={`
                    px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest backdrop-blur-md border shadow-lg
                    ${sourceHandleId === 'true' 
                        ? 'bg-emerald-900/40 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10' 
                        : 'bg-rose-900/40 text-rose-400 border-rose-500/30 shadow-rose-500/10'}
                `}>
                    {sourceHandleId === 'true' ? 'PASS' : 'FAIL'}
                </div>
            </div>
         </EdgeLabelRenderer>
      )}

      {/* Blocked Indicator (Lock Icon) */}
      {isBlocked && (
         <EdgeLabelRenderer>
            <div
                style={{
                    position: 'absolute',
                    transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                    fontSize: 12,
                    pointerEvents: 'all',
                }}
                className="nodrag nopan"
            >
                <div className="bg-slate-950 border border-red-500 rounded-full p-1.5 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] cursor-help animate-pulse">
                    🔒
                </div>
            </div>
         </EdgeLabelRenderer>
      )}
    </>
  );
}