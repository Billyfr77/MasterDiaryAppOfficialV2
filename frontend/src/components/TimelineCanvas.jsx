/*
 * TimelineCanvas.jsx - Graph/Node Based Diary (Replacement for Grid/Clock)
 * Now uses React Flow for infinite free-form placement
 */
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  ReactFlow, 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState, 
  addEdge, 
  useReactFlow,
  Handle, 
  Position 
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { User, Wrench, Package, X, Sparkles } from 'lucide-react';

// Reuse GlassNode style from QuoteBuilder but slightly modified for Diary context
const DiaryNode = ({ data, selected }) => {
  const { label, duration, type, onDelete, onUpdate } = data;
  const [editingDuration, setEditingDuration] = useState(false);
  const [tempDuration, setTempDuration] = useState(duration);

  useEffect(() => {
    setTempDuration(duration);
  }, [duration]);

  const handleDurationSave = () => {
    const val = parseFloat(tempDuration) || 0;
    if (val !== duration) {
      onUpdate(data.id, { duration: val });
    }
    setEditingDuration(false);
  };
  
  let containerClass = "bg-gradient-to-br from-indigo-600 to-violet-700 border-2 border-indigo-300 shadow-[0_10px_30px_-5px_rgba(79,70,229,0.6)]";
  let iconBg = "bg-white/20";
  let badgeClass = "bg-black/20 text-indigo-100 border border-white/20";
  let glowClass = "shadow-indigo-500/80";

  if (type === 'staff') {
    containerClass = "bg-gradient-to-br from-emerald-500 to-teal-700 border-2 border-emerald-200 shadow-[0_10px_30px_-5px_rgba(16,185,129,0.6)]";
    badgeClass = "bg-black/20 text-emerald-100 border border-white/20";
    glowClass = "shadow-emerald-500/80";
  } else if (type === 'equipment') {
    containerClass = "bg-gradient-to-br from-orange-500 to-amber-600 border-2 border-orange-200 shadow-[0_10px_30px_-5px_rgba(249,115,22,0.6)]";
    badgeClass = "bg-black/20 text-orange-100 border border-white/20";
    glowClass = "shadow-orange-500/80";
  }

  const getIcon = () => {
    switch (type) {
      case 'staff': return <User size={22} className="text-white" strokeWidth={2.5} />;
      case 'equipment': return <Wrench size={22} className="text-white" strokeWidth={2.5} />;
      default: return <Package size={22} className="text-white" strokeWidth={2.5} />;
    }
  };

  return (
    <div className={`
      relative min-w-[200px] rounded-[1.5rem] transition-all duration-300 group
      ${containerClass}
      ${selected ? `scale-110 -translate-y-2 z-50 ring-4 ring-white/60 ${glowClass}` : 'hover:scale-105 hover:-translate-y-1 hover:shadow-2xl'}
    `}>
      <div className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-b from-white/30 via-white/5 to-transparent pointer-events-none" />
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-white !border-2 !border-slate-900" />
      
      <div className="relative p-4">
        <div className="flex justify-between items-start mb-3">
          <div className={`p-2 rounded-xl ${iconBg} backdrop-blur-sm border border-white/30 shadow-inner`}>
            {getIcon()}
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 rounded-full bg-black/10 text-white/70 hover:bg-red-500 hover:text-white transition-all backdrop-blur-md"
          >
            <X size={14} strokeWidth={3} />
          </button>
        </div>
        
        <div className="mb-3">
          <div className="text-lg font-black leading-none text-white drop-shadow-md tracking-tight mb-1">
            {label}
          </div>
          <div className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${badgeClass}`}>
            {type}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/20">
          <div className="flex flex-col">
            <span className="text-[9px] text-white/80 font-bold uppercase tracking-wider">
              {type === 'material' ? 'Qty' : 'Duration'}
            </span>
            {editingDuration ? (
              <input
                type="number"
                value={tempDuration}
                onChange={(e) => setTempDuration(parseFloat(e.target.value) || 0)}
                onBlur={handleDurationSave}
                onKeyDown={(e) => e.key === 'Enter' && handleDurationSave()}
                className="w-20 px-2 py-1 text-sm font-bold bg-black/40 border border-indigo-500 rounded text-white focus:outline-none"
                autoFocus
              />
            ) : (
              <span
                onClick={() => setEditingDuration(true)}
                className="text-sm font-mono font-bold text-white drop-shadow-sm cursor-pointer hover:underline"
              >
                {duration} {type === 'material' ? 'u' : 'h'}
              </span>
            )}
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-white !border-2 !border-slate-900" />
    </div>
  );
};

const TimelineCanvasContent = ({ items, onDrop, onUpdateItem, onRemoveItem }) => {
  const nodeTypes = useMemo(() => ({ diaryNode: DiaryNode }), []);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition } = useReactFlow();

  // Sync external items to nodes
  useEffect(() => {
    const newNodes = items.map(item => ({
      id: item.id,
      type: 'diaryNode',
      position: item.position || { x: Math.random() * 400, y: Math.random() * 400 }, // Default random if no pos
      data: {
        id: item.id,
        label: item.name,
        duration: item.duration || item.quantity || 1,
        type: item.type,
        onDelete: () => onRemoveItem(item.id),
        onUpdate: onUpdateItem
      }
    }));
    setNodes(newNodes);
  }, [items, onRemoveItem, setNodes]);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  // Handle Drop
  const onDropHandler = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      
      // Check if it's valid JSON
      try {
        if (!type) return;
        const itemData = JSON.parse(type);
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        onDrop(itemData, position);
      } catch (e) {
        console.error("Drop error", e);
      }
    },
    [screenToFlowPosition, onDrop],
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onNodeDragStop = useCallback((event, node) => {
    // Update position in parent state
    onUpdateItem(node.id, { position: node.position });
  }, [onUpdateItem]);

  return (
    <div className="w-full h-[50vh] min-h-[400px] md:h-[600px] bg-stone-950/50 rounded-2xl overflow-hidden relative">
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[size:40px_40px] bg-[linear-gradient(to_right,#4f46e5_1px,transparent_1px),linear-gradient(to_bottom,#4f46e5_1px,transparent_1px)]" />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDropHandler}
        onDragOver={onDragOver}
        onNodeDragStop={onNodeDragStop}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#6366f1" gap={40} size={1} className="opacity-[0.05]" />
        <Controls className="!bg-stone-900 !border-white/10 !text-white !rounded-lg overflow-hidden shadow-xl !p-1" />
        <MiniMap 
          className="!bg-stone-900 !border-white/10 !rounded-lg shadow-xl !m-4" 
          nodeColor={n => n.type==='diaryNode' ? (n.data.type==='staff'?'#10b981':n.data.type==='equipment'?'#f59e0b':'#6366f1') : '#eee'}
          maskColor="rgba(0,0,0,0.6)"
        />
      </ReactFlow>
    </div>
  );
};

import { ReactFlowProvider } from '@xyflow/react';

const TimelineCanvas = (props) => (
  <ReactFlowProvider>
    <TimelineCanvasContent {...props} />
  </ReactFlowProvider>
);

export default TimelineCanvas;