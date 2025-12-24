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

  let strokeColor = '#475569'; // Slate 600 (Idle)
  let glowColor = 'rgba(99, 102, 241, 0)'; // No glow by default
  
  // Logic Coloring
  if (sourceHandleId === 'true') { strokeColor = '#10b981'; glowColor = 'rgba(16, 185, 129, 0.3)'; }
  if (sourceHandleId === 'false') { strokeColor = '#ef4444'; glowColor = 'rgba(239, 68, 68, 0.3)'; }

  // State Overrides
  if (isActive) { strokeColor = '#818cf8'; glowColor = 'rgba(99, 102, 241, 0.5)'; }
  if (isBlocked) { strokeColor = '#ef4444'; glowColor = 'rgba(239, 68, 68, 0.5)'; }

  return (
    <>
      {/* Background Glow (Hover area + Visual pop) */}
      <BaseEdge 
        path={edgePath} 
        style={{ stroke: glowColor, strokeWidth: isActive ? 12 : 8, transition: 'stroke-width 0.3s', filter: 'blur(4px)' }} 
      />

      {/* Main Path */}
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{ ...style, stroke: strokeColor, strokeWidth: isActive ? 3 : 2, transition: 'stroke 0.3s' }} 
      />
      
      {/* Data Packet Animation (Active Flow) */}
      {(isActive && !isBlocked) && (
        <circle r="4" fill="#ffffff">
          <animateMotion dur="1.5s" repeatCount="indefinite" path={edgePath}>
             <mpath />
          </animateMotion>
          <animate attributeName="fill" values="#ffffff;#818cf8;#ffffff" dur="1.5s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Idle Pulse Packet (Subtle) */}
      {(!isActive && !isBlocked) && (
        <circle r="2" fill={strokeColor}>
          <animateMotion dur="4s" repeatCount="indefinite" path={edgePath} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
          <animate attributeName="opacity" values="0;1;0" dur="4s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Logic Labels (Holographic Badges) */}
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