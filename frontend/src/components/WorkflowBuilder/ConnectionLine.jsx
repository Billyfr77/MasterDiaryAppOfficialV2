import React from 'react';
import { useConnection, getSmoothStepPath } from '@xyflow/react';

export default function ConnectionLine({ fromX, fromY, toX, toY, fromPosition, toPosition }) {
  const [edgePath] = getSmoothStepPath({
    sourceX: fromX,
    sourceY: fromY,
    sourcePosition: fromPosition,
    targetX: toX,
    targetY: toY,
    targetPosition: toPosition,
  });

  return (
    <g>
      {/* Outer Glow (Plasma Effect) */}
      <path
        fill="none"
        stroke="#6366f1"
        strokeWidth={8}
        className="opacity-10 blur-md animate-pulse"
        d={edgePath}
      />
      
      {/* Secondary Glow */}
      <path
        fill="none"
        stroke="#818cf8"
        strokeWidth={4}
        className="opacity-30 blur-sm"
        d={edgePath}
      />

      {/* Main Dashed Line (Animated) */}
      <path
        fill="none"
        stroke="#a5b4fc"
        strokeWidth={2.5}
        d={edgePath}
        style={{
             strokeDasharray: '8, 8',
             animation: 'dashdraw 0.4s linear infinite'
        }}
      />

      {/* Source Anchor */}
      <circle cx={fromX} cy={fromY} r={4} fill="#6366f1" stroke="#fff" strokeWidth={1.5} />

      {/* Target Cursor Magnet (Seeking UI) */}
      <g transform={`translate(${toX}, ${toY})`}>
          {/* Ripple rings */}
          <circle r={12} fill="none" stroke="#6366f1" strokeWidth={1} opacity={0.5}>
             <animate attributeName="r" from="8" to="20" dur="1.5s" repeatCount="indefinite" />
             <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <circle r={6} fill="#6366f1" stroke="#fff" strokeWidth={2} />
      </g>
    </g>
  );
};