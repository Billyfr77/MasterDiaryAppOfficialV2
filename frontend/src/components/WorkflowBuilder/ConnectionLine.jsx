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
      {/* Glow Effect */}
      <path
        fill="none"
        stroke="#6366f1"
        strokeWidth={6}
        className="opacity-20 blur-sm"
        d={edgePath}
      />
      {/* Main Line */}
      <path
        fill="none"
        stroke="#818cf8"
        strokeWidth={2}
        className="animated"
        d={edgePath}
        style={{
             strokeDasharray: '5, 5',
             animation: 'dashdraw 0.5s linear infinite'
        }}
      />
      {/* Target Cursor Magnet */}
      <circle cx={toX} cy={toY} r={6} fill="#6366f1" stroke="#fff" strokeWidth={2} className="animate-pulse" />
    </g>
  );
};
