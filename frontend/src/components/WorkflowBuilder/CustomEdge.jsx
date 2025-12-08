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

  let strokeColor = '#64748b'; // Slate 500
  
  // Logic Coloring based on source handle
  if (sourceHandleId === 'true') strokeColor = '#22c55e'; // Green 500
  if (sourceHandleId === 'false') strokeColor = '#ef4444'; // Red 500

  if (isActive) strokeColor = '#6366f1'; // Indigo 500 (Override for active flow)
  if (isBlocked) strokeColor = '#ef4444'; // Red 500 (Override for blockage)

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ ...style, stroke: strokeColor, strokeWidth: 2 }} />
      
      {/* Flow Animation Particle */}
      {isActive && !isBlocked && (
        <circle r="3" fill="#818cf8">
          <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
        </circle>
      )}

      {/* Logic Labels */}
      {(sourceHandleId === 'true' || sourceHandleId === 'false') && (
          <EdgeLabelRenderer>
            <div
                style={{
                    position: 'absolute',
                    transform: `translate(-50%, -50%) translate(${sourceX + (targetX - sourceX) * 0.2}px,${sourceY + (targetY - sourceY) * 0.2}px)`,
                    fontSize: 10,
                    pointerEvents: 'none',
                }}
                className="nodrag nopan"
            >
                <div className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${sourceHandleId === 'true' ? 'bg-green-900/50 text-green-400 border-green-500/30' : 'bg-red-900/50 text-red-400 border-red-500/30'}`}>
                    {sourceHandleId === 'true' ? 'YES' : 'NO'}
                </div>
            </div>
         </EdgeLabelRenderer>
      )}

      {/* Blocked Indicator */}
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
                <div className="bg-slate-900 border border-red-500/50 rounded-full p-1 text-red-500 shadow-lg cursor-help" title="Previous task not complete">
                    🔒
                </div>
            </div>
         </EdgeLabelRenderer>
      )}
    </>
  );
}