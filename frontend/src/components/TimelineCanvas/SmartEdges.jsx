import React, { useMemo } from 'react';
import { BaseEdge, getBezierPath, getSmoothStepPath, EdgeLabelRenderer } from '@xyflow/react';

// --- UTILS ---
const getEdgeColor = (type) => {
    switch (type) {
        case 'staff': return '#10b981'; // Emerald
        case 'equipment': return '#f59e0b'; // Amber
        case 'material': return '#6366f1'; // Indigo
        case 'finance': return '#ec4899'; // Pink
        case 'chronos': return '#8b5cf6'; // Violet
        default: return '#64748b'; // Slate
    }
};

// 1. NEON PULSE EDGE (Buzzing with electric life)
export const NeonEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd, data }) => {
    const [edgePath] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
    const color = getEdgeColor(data?.type || 'default');

    return (
        <>
            {/* Holographic ghost tracks */}
            <BaseEdge path={edgePath} style={{ ...style, stroke: color, strokeWidth: 14, strokeOpacity: 0.05, filter: 'blur(10px)' }} />
            <BaseEdge path={edgePath} style={{ ...style, stroke: color, strokeWidth: 6, strokeOpacity: 0.1, filter: 'blur(3px)' }} />
            
            <BaseEdge path={edgePath} style={{ ...style, stroke: '#fff', strokeWidth: 1.5, strokeOpacity: 0.8 }} markerEnd={markerEnd} />
            
            <circle r="4" fill="#fff">
                <animateMotion dur="1.2s" repeatCount="indefinite" path={edgePath} />
                <animate attributeName="r" values="2;5;2" dur="1.2s" repeatCount="indefinite" />
            </circle>
        </>
    );
};

// 2. FLOW EDGE (Moving data stream)
export const FlowEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd, data }) => {
    const [edgePath] = getSmoothStepPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
    const color = getEdgeColor(data?.type || 'default');

    return (
        <>
            <BaseEdge path={edgePath} style={{ ...style, stroke: '#000', strokeWidth: 8, strokeOpacity: 0.4 }} />
            <BaseEdge path={edgePath} style={{ ...style, stroke: color, strokeWidth: 12, strokeOpacity: 0.05, filter: 'blur(4px)' }} />
            
            <BaseEdge 
                path={edgePath} 
                style={{ 
                    ...style, 
                    stroke: color, 
                    strokeWidth: 3, 
                    strokeDasharray: '12,12', 
                    animation: 'flowmove 0.8s linear infinite',
                    filter: `drop-shadow(0 0 8px ${color})`
                }} 
                markerEnd={markerEnd} 
            />
            <style>
                {`@keyframes flowmove { from { stroke-dashoffset: 24; } to { stroke-dashoffset: 0; } }`}
            </style>
        </>
    );
};

// 3. QUANTUM GRADIENT (High-end architectural link)
export const GradientEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd, data }) => {
    const [edgePath] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
    const gradientId = `gradient-${id}`;
    
    return (
        <>
            <defs>
                <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1={sourceX} y1={sourceY} x2={targetX} y2={targetY}>
                    <stop offset="0%" stopColor={getEdgeColor(data?.sourceType || 'material')} />
                    <stop offset="50%" stopColor="#fff" />
                    <stop offset="100%" stopColor={getEdgeColor(data?.targetType || 'material')} />
                </linearGradient>
            </defs>
            {/* Outer aura */}
            <BaseEdge path={edgePath} style={{ ...style, stroke: `url(#${gradientId})`, strokeWidth: 10, strokeOpacity: 0.1, filter: 'blur(6px)' }} />
            
            <BaseEdge path={edgePath} style={{ ...style, stroke: `url(#${gradientId})`, strokeWidth: 4, strokeLinecap: 'round', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.4))' }} markerEnd={markerEnd} />
            
            <circle r="3" fill="#fff" filter="blur(1px)">
                <animateMotion dur="3s" repeatCount="indefinite" path={edgePath} />
            </circle>
        </>
    );
};

// 4. ORBITAL BEAM (Labor & Energy)
export const OrbitEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd, data }) => {
    const [edgePath] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition });
    const color = getEdgeColor(data?.type || 'default');

    return (
        <>
            <BaseEdge path={edgePath} style={{ ...style, stroke: color, strokeWidth: 1, strokeOpacity: 0.2 }} />
            
            {/* Multi-particle stream */}
            {[...Array(4)].map((_, i) => (
                <circle key={i} r={1.5 + i * 0.5} fill={i === 0 ? "#fff" : color} opacity={0.8 - i * 0.1}>
                    <animateMotion dur={`${1.5 + i * 0.4}s`} repeatCount="indefinite" path={edgePath} begin={`${i * 0.3}s`} />
                    <animate attributeName="opacity" values="0;1;0" dur={`${1.5 + i * 0.4}s`} repeatCount="indefinite" />
                </circle>
            ))}
            
            <BaseEdge path={edgePath} style={{ ...style, stroke: color, strokeWidth: 2, strokeOpacity: 0.1 }} markerEnd={markerEnd} />
        </>
    );
};

export const SmartEdgeTypes = {
    neon: NeonEdge,
    flow: FlowEdge,
    gradient: GradientEdge,
    orbit: OrbitEdge
};