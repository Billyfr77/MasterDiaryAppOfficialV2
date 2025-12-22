import React, { useMemo, useCallback, useState } from 'react';
import { 
  ReactFlow, MiniMap, Controls, Background, ReactFlowProvider, addEdge, useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Zap } from 'lucide-react';
import { useTimelineEngine } from './TimelineEngine';
import { DiaryNode, WormholeNode, ZoneNode, ChronosNode, ImpactNode, DelayNode, PhotoNode, AllowanceNode } from './TimelineNodes';
import { SmartEdgeTypes } from './SmartEdges';
import { api } from '../../utils/api';
import { useNotification } from '../../context/NotificationContext';

const TimelineCanvasContent = (props) => {
  const { items, extraNodes, edges: persistentEdges, onDrop, onUpdateItem, onRemoveItem, onNodeClick, isPulseActive, onUpdateEdges } = props;
  const { addNotification } = useNotification();
  const { fitView } = useReactFlow();
  
  // Use engine rename to avoid name collisions
  const { 
    nodes, setNodes, onNodesChange, edges, setEdges, onEdgesChange,
    screenToFlowPosition, onNodeDragStop, onConnect: engineOnConnect 
  } = useTimelineEngine(items, onUpdateItem, onRemoveItem, onDrop, extraNodes, persistentEdges, onUpdateEdges);

  const nodeTypes = useMemo(() => ({ 
      diaryNode: DiaryNode, 
      wormhole: WormholeNode, 
      zone: ZoneNode,
      chronos: ChronosNode,
      impact: ImpactNode,
      photoNode: PhotoNode,
      allowance: AllowanceNode
  }), []);

  const edgeTypes = useMemo(() => SmartEdgeTypes, []);

  // Determine edge type based on source/target node data
  const getSmartEdgeParams = useCallback((sourceId) => {
      const sourceNode = nodes.find(n => n.id === sourceId);
      const type = sourceNode?.data?.type || sourceNode?.type || 'material';
      
      let edgeType = 'default';
      if (type === 'staff' || type === 'equipment') edgeType = 'orbit';
      else if (type === 'material') edgeType = 'gradient';
      else if (type === 'chronos') edgeType = 'neon';
      else if (type === 'finance') edgeType = 'flow';
      else if (type === 'allowance') edgeType = 'gold';

      return { type: edgeType, data: { type, sourceType: type } };
  }, [nodes]);

  // COMBINED ONCONNECT HANDLER (Resolves redeclaration error)
  const handleConnect = useCallback((params) => {
      const smartParams = getSmartEdgeParams(params.source);
      // Pass to engine first for logic (e.g. Chrono-Sync)
      if (engineOnConnect) {
          engineOnConnect({ ...params, ...smartParams });
      } else {
          // Fallback if engine version isn't ready
          setEdges((eds) => addEdge({ ...params, ...smartParams, animated: true }, eds));
      }
  }, [engineOnConnect, getSmartEdgeParams, setEdges]);

  // --- GHOST SUGGESTIONS ---
  const confirmGhostNode = useCallback((node) => {
      setNodes(nds => nds.map(n => n.id === node.id ? { ...n, data: { ...n.data, isGhost: false } } : n));
      if (onDrop) {
          const itemData = {
              id: node.id,
              name: node.data.label,
              type: node.data.type || 'material',
              duration: 1,
              costRate: 0 
          };
          onDrop(itemData, node.position);
          addNotification('Suggestion confirmed', 'success');
      }
  }, [setNodes, onDrop, addNotification]);

  const fetchGhostSuggestions = useCallback(async (node) => {
      if (!node) return;
      try {
          const res = await api.post('/ai/node-suggestions', { selectedNode: node, existingNodes: nodes });
          if (res.data?.suggestions) {
              const newNodes = [];
              const newEdges = [];
              res.data.suggestions.forEach((sugg, i) => {
                  const ghostId = `ghost-${Date.now()}-${i}`;
                  const position = { 
                      x: node.position.x + (i % 2 === 0 ? 300 : -300), 
                      y: node.position.y + 150 + (i * 50) 
                  };
                  newNodes.push({
                      id: ghostId, type: 'diaryNode', position,
                      data: { label: sugg.label, type: sugg.type || 'material', isGhost: true, onDelete: () => setNodes(nds => nds.filter(n => n.id !== ghostId)) }
                  });
                  newEdges.push({
                      id: `e-ghost-${node.id}-${ghostId}`, source: node.id, target: ghostId,
                      type: 'neon', data: { type: 'ghost' }, animated: true
                  });
              });
              setNodes(prev => [...prev, ...newNodes]);
              setEdges(prev => [...prev, ...newEdges]);
          }
      } catch (err) { console.error("Ghost Node Error:", err); }
  }, [nodes, setNodes, setEdges]);

  const handleNodeClickInternal = useCallback((event, node) => {
      if (onNodeClick) onNodeClick(event, node);
      if (isPulseActive) {
          if (node.data?.isGhost) confirmGhostNode(node);
          else fetchGhostSuggestions(node);
      }
  }, [onNodeClick, isPulseActive, confirmGhostNode, fetchGhostSuggestions]);

  const [dropPing, setDropPing] = useState(null); // { x, y }

  const onDropHandler = useCallback((event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;
      try {
          const itemData = JSON.parse(type);
          
          // Trigger Visual Ping at screen coordinates
          setDropPing({ x: event.clientX, y: event.clientY });
          setTimeout(() => setDropPing(null), 1000);

          const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
          onDrop(itemData, position);
      } catch (e) {}
  }, [screenToFlowPosition, onDrop]);

  // --- MASTERPIECE RESTRUCTURE ENGINE ---
  const restructureLayout = useCallback(() => {
      const currentNodes = [...nodes];
      const chronos = currentNodes.filter(n => n.type === 'chronos');
      const resources = currentNodes.filter(n => n.type === 'diaryNode');
      
      const newNodes = currentNodes.map(node => {
          let position = { ...node.position };
          
          if (node.type === 'chronos') {
              const idx = chronos.findIndex(n => n.id === node.id);
              position = { x: idx * 600, y: 0 };
          } else if (node.type === 'diaryNode') {
              // Find which chronos it belongs to via edges
              const parentEdge = edges.find(e => e.target === node.id);
              if (parentEdge) {
                  const parentIdx = chronos.findIndex(n => n.id === parentEdge.source);
                  const siblings = edges.filter(e => e.source === parentEdge.source);
                  const sibIdx = siblings.findIndex(e => e.target === node.id);
                  
                  position = { 
                      x: (parentIdx * 600) + (sibIdx % 2 === 0 ? 150 : -150), 
                      y: 400 + (Math.floor(sibIdx / 2) * 200) 
                  };
              }
          }
          return { ...node, position };
      });

      setNodes(newNodes);
      setTimeout(() => { fitView({ padding: 0.2, duration: 800 }); }, 100);
      addNotification('Canvas Restructured', 'success');
  }, [nodes, edges, setNodes, fitView, addNotification]);

  return (
    <div className="w-full h-full min-h-[600px] bg-[#050507] rounded-[2.5rem] overflow-hidden relative border border-white/5 shadow-inner group/canvas">
      <style>{`
        @keyframes ping-slow {
          0% { transform: scale(0.2); opacity: 0.8; }
          100% { transform: scale(3); opacity: 0; }
        }
        .animate-ping-slow {
          animation: ping-slow 1s cubic-bezier(0, 0, 0.2, 1) forwards;
        }
      `}</style>
      
      {/* AMBIENT ENERGY PARTICLES */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
          {[...Array(6)].map((_, i) => (
              <div 
                key={i}
                className="absolute w-1 h-1 bg-indigo-500 rounded-full blur-[1px] animate-float-slow"
                style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${i * 2}s`,
                    animationDuration: `${15 + i * 5}s`
                }}
              />
          ))}
      </div>

      {/* MASTERPIECE CONTROLS */}
      <div className="absolute top-6 left-6 z-40 flex gap-2">
          <button 
            onClick={restructureLayout}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl backdrop-blur-md text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2 transition-all shadow-2xl active:scale-95"
          >
              <Zap size={14} className="text-amber-400" /> Restructure
          </button>
      </div>

      <ReactFlow
        nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onDrop={onDropHandler} 
        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }} 
        onNodeDragStop={onNodeDragStop}
        onNodeClick={handleNodeClickInternal}
        fitView
        minZoom={0.05} 
        maxZoom={4}
        snapToGrid={true}
        snapGrid={[20, 20]}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#6366f1" gap={40} size={1} className="opacity-[0.12] animate-pulse" />
        <Background color="#8b5cf6" gap={200} size={2} className="opacity-[0.05]" />
        <Controls className="!bg-stone-900 !border-white/10 !text-white !rounded-xl shadow-2xl" />
        <MiniMap 
            className="!bg-stone-900/80 !border-white/10 !rounded-3xl !backdrop-blur-xl border-t border-l border-white/10" 
            nodeColor={n => n.type === 'chronos' ? '#8b5cf6' : n.type === 'diaryNode' ? '#10b981' : '#6366f1'}
            maskColor="rgba(0,0,0,0.6)"
        />

        {/* Tactile Drop Ping (Screen Space) */}
        {dropPing && (
            <div 
                className="fixed pointer-events-none z-[9999] w-20 h-20 border-2 border-indigo-500 rounded-full animate-ping-slow shadow-[0_0_20px_#6366f1]"
                style={{ 
                    left: dropPing.x - 40, 
                    top: dropPing.y - 40 
                }}
            />
        )}
      </ReactFlow>
      
      {/* HUD OVERLAY - Visual Flair */}
      <div className="absolute top-6 right-6 pointer-events-none">
          <div className="bg-indigo-500/10 border border-indigo-500/30 px-4 py-2 rounded-2xl backdrop-blur-md animate-pulse">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]" />
                  Infinite Canvas Active
              </span>
          </div>
      </div>
    </div>
  );
};

const TimelineCanvas = (props) => <ReactFlowProvider><TimelineCanvasContent {...props} /></ReactFlowProvider>;
export default TimelineCanvas;