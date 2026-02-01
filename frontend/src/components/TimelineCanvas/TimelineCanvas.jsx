import React, { useMemo, useCallback, useState } from 'react';
import { 
  ReactFlow, MiniMap, Controls, Background, ReactFlowProvider, addEdge, useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, FileText, ClipboardList } from 'lucide-react';
import { useTimelineEngine } from './TimelineEngine';
import { DiaryNode, WormholeNode, ZoneNode, ChronosNode, ImpactNode, DelayNode, PhotoNode, AllowanceNode, DimensionNode, NeuralPrismNode, ShapeNode, TaskNode, NotesNode } from './TimelineNodes';
import { SmartEdgeTypes } from './SmartEdges';
import { api } from '../../utils/api';
import { useNotification } from '../../context/NotificationContext';

// --- WEATHER SYSTEM COMPONENT (APEX EDITION - MULTI-NODE SUPPORT) ---
const WeatherSystem = React.memo(({ nodes }) => {
    const activeWeathers = useMemo(() => {
        if (!nodes) return [];
        const types = nodes
            .filter(n => n.type === 'delay' && n.data?.weatherType && n.data.weatherType !== 'none')
            .map(n => n.data.weatherType);
        return [...new Set(types)]; // Unique active weather states
    }, [nodes]);

    const particles = useMemo(() => {
        const pMap = {};
        activeWeathers.forEach(type => {
            const count = type === 'storm' ? 60 : type === 'snow' ? 80 : type === 'wind' ? 40 : 30;
            pMap[type] = [...Array(count)].map((_, i) => ({
                id: i,
                left: Math.random() * 100,
                top: Math.random() * 100,
                duration: 0.5 + Math.random() * 4,
                delay: -(Math.random() * 5),
                size: type === 'wind' ? (100 + Math.random() * 200) : (2 + Math.random() * 4),
                opacity: 0.1 + Math.random() * 0.3
            }));
        });
        return pMap;
    }, [activeWeathers]);

    if (activeWeathers.length === 0) return null;

    return (
        <div className="absolute inset-0 z-[10] pointer-events-none overflow-hidden rounded-[2.5rem]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.4)_100%)]" />
            
            <AnimatePresence>
                {activeWeathers.map(type => (
                    <motion.div 
                        key={type}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0"
                    >
                        {type === 'wind' && (
                            <div className="absolute inset-0">
                                {particles[type].map(p => (
                                    <div key={p.id} className="absolute bg-gradient-to-r from-transparent via-teal-400/20 to-transparent h-[2px] blur-[1px] animate-wind-ribbon" style={{
                                        left: `-50%`,
                                        top: `${p.left}%`,
                                        width: `${p.size}px`,
                                        willChange: 'transform',
                                        animationDuration: `${0.8 + (p.duration % 1.5)}s`,
                                        animationDelay: `${p.delay}s`
                                    }} />
                                ))}
                            </div>
                        )}

                        {type === 'flood' && (
                            <div className="absolute inset-0 flex flex-col justify-end">
                                {/* Back Wave */}
                                <div className="absolute bottom-0 left-[-50%] w-[200%] h-[35%] bg-cyan-600/20 animate-parallax-wave-slow blur-xl" />
                                {/* Front Wave */}
                                <div className="absolute bottom-0 left-[-50%] w-[200%] h-[25%] bg-gradient-to-t from-cyan-500/40 via-cyan-400/20 to-transparent animate-parallax-wave border-t-2 border-cyan-300/30 backdrop-blur-[2px]">
                                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/water-flea.png')] mix-blend-overlay animate-pulse" />
                                </div>
                            </div>
                        )}

                        {type === 'rain' && (
                            <div className="absolute inset-0">
                                {particles[type].map(p => (
                                    <div key={p.id} className="absolute bg-gradient-to-b from-transparent via-blue-400/30 to-transparent w-[1px] h-[120px] animate-rain-light" style={{
                                        left: `${p.left}%`,
                                        top: `${p.top - 20}%`,
                                        willChange: 'transform',
                                        animationDuration: `${0.6 + (p.duration % 0.3)}s`,
                                        animationDelay: `${p.delay}s`
                                    }} />
                                ))}
                            </div>
                        )}

                        {type === 'storm' && (
                            <div className="absolute inset-0">
                                <div className="absolute inset-0 bg-indigo-50/10 opacity-0 animate-lightning-strike z-50" />
                                {particles[type].map(p => (
                                    <div key={p.id} className="absolute bg-gradient-to-b from-transparent via-slate-200/50 to-transparent w-[2px] h-[180px] animate-rain-storm-light" style={{
                                        left: `${p.left}%`,
                                        top: `${p.top - 20}%`,
                                        transform: 'rotate(20deg)',
                                        willChange: 'transform',
                                        animationDuration: `${0.2 + (p.duration % 0.2)}s`,
                                        animationDelay: `${p.delay}s`
                                    }} />
                                ))}
                            </div>
                        )}

                        {type === 'snow' && (
                            <div className="absolute inset-0">
                                {particles[type].map(p => (
                                    <div key={p.id} className="absolute bg-white rounded-full blur-[1px] animate-snow-fall" style={{
                                        left: `${p.left}%`,
                                        top: `${p.top - 10}%`,
                                        width: `${p.size}px`,
                                        height: `${p.size}px`,
                                        opacity: p.opacity,
                                        willChange: 'transform',
                                        animationDuration: `${4 + (p.duration % 5)}s`,
                                        animationDelay: `${p.delay}s`
                                    }} />
                                ))}
                            </div>
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>

            <style>{`
                .animate-rain-light { animation: rain-light linear infinite; }
                .animate-rain-storm-light { animation: rain-storm-light linear infinite; }
                .animate-lightning-strike { animation: lightning-strike 8s linear infinite; }
                .animate-snow-fall { animation: snow-fall linear infinite; }
                .animate-wind-ribbon { animation: wind-ribbon linear infinite; }
                .animate-parallax-wave { animation: parallax-wave 12s ease-in-out infinite; }
                .animate-parallax-wave-slow { animation: parallax-wave 20s ease-in-out infinite reverse; }
                
                @keyframes wind-ribbon {
                    0% { transform: translateX(0) translateY(0); opacity: 0; }
                    20% { opacity: 1; }
                    50% { transform: translateX(100vw) translateY(20px); }
                    80% { opacity: 1; }
                    100% { transform: translateX(150vw) translateY(-10px); opacity: 0; }
                }
                
                @keyframes parallax-wave {
                    0%, 100% { transform: translateX(0) translateY(0) rotate(-1deg); }
                    50% { transform: translateX(-5%) translateY(10px) rotate(1deg); }
                }

                @keyframes rain-light { 0% { transform: translateY(0); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(120vh); opacity: 0; } }
                @keyframes rain-storm-light { 0% { transform: translateY(0) translateX(0) rotate(20deg); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(120vh) translateX(-15vh) rotate(20deg); opacity: 0; } }
                @keyframes lightning-strike { 0%, 94%, 100% { opacity: 0; } 95% { opacity: 1; } 95.5% { opacity: 0; } 96% { opacity: 0.4; } 98% { opacity: 0; } }
                @keyframes snow-fall { 0% { transform: translateY(0) translateX(0); opacity: 0; } 10% { opacity: 1; } 100% { transform: translateY(110vh) translateX(30px); opacity: 0; } }
            `}</style>
        </div>
    );
});

const TimelineCanvasContent = (props) => {
  const { items, extraNodes, edges: persistentEdges, quotedData, projectFinancials, onDrop, onUpdateItem, onRemoveItem, onNodeClick, isPulseActive, onUpdateEdges, history, onDeployFixes } = props;
  const { addNotification } = useNotification();
  const { fitView } = useReactFlow();
  
  const { 
    nodes, setNodes, onNodesChange, edges, setEdges, onEdgesChange,
    screenToFlowPosition, onNodeDragStop, onConnect: engineOnConnect 
  } = useTimelineEngine(items, onUpdateItem, onRemoveItem, onDrop, extraNodes, persistentEdges, onUpdateEdges, projectFinancials, history, onDeployFixes, quotedData);

  const nodeTypes = useMemo(() => ({ 
      diaryNode: DiaryNode, 
      wormhole: WormholeNode, 
      zone: ZoneNode,
      chronos: ChronosNode,
      impact: ImpactNode,
      delay: DelayNode,
      photoNode: PhotoNode,
      allowance: AllowanceNode,
      dimension: DimensionNode,
      neuralPrism: NeuralPrismNode,
      shapeNode: ShapeNode,
      taskNode: TaskNode,
      notesNode: NotesNode
  }), []);

  const edgeTypes = useMemo(() => SmartEdgeTypes, []);

  const getSmartEdgeParams = useCallback((sourceId) => {
      const sourceNode = nodes.find(n => n.id === sourceId);
      const type = sourceNode?.data?.type || sourceNode?.type || 'material';
      let edgeType = 'default';
      if (type === 'staff' || type === 'equipment') edgeType = 'orbit';
      else if (type === 'material') edgeType = 'gradient';
      else if (type === 'chronos') edgeType = 'neon';
      else if (type === 'finance') edgeType = 'flow';
      else if (type === 'allowance') edgeType = 'gold';
      else if (type === 'neuralPrism') edgeType = 'beam';
      return { type: edgeType, data: { type, sourceType: type } };
  }, [nodes]);

  const handleConnect = useCallback((params) => {
      const smartParams = getSmartEdgeParams(params.source);
      if (engineOnConnect) {
          engineOnConnect({ ...params, ...smartParams });
      } else {
          setEdges((eds) => addEdge({ ...params, ...smartParams, animated: true }, eds));
      }
  }, [engineOnConnect, getSmartEdgeParams, setEdges]);

  const confirmGhostNode = useCallback((node) => {
      setNodes(nds => nds.map(n => n.id === node.id ? { ...n, data: { ...n.data, isGhost: false } } : n));
      if (onDrop) {
          onDrop({ id: node.id, name: node.data.label, type: node.data.type || 'material', duration: 1, costRate: 0 }, node.position);
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
                  const position = { x: node.position.x + (i % 2 === 0 ? 300 : -300), y: node.position.y + 150 + (i * 50) };
                  newNodes.push({ id: ghostId, type: 'diaryNode', position, data: { label: sugg.label, type: sugg.type || 'material', isGhost: true, onDelete: () => setNodes(nds => nds.filter(n => n.id !== ghostId)) } });
                  newEdges.push({ id: `e-ghost-${node.id}-${ghostId}`, source: node.id, target: ghostId, type: 'neon', data: { type: 'ghost' }, animated: true });
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

  const [dropPing, setDropPing] = useState(null);

  const onDropHandler = useCallback((event) => {
      event.preventDefault();
      const typeData = event.dataTransfer.getData('application/reactflow');
      if (!typeData) return;
      try {
          const itemData = JSON.parse(typeData);
          setDropPing({ x: event.clientX, y: event.clientY });
          setTimeout(() => setDropPing(null), 1000);
          const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
          onDrop(itemData, position);
      } catch (e) {}
  }, [screenToFlowPosition, onDrop]);

  const restructureLayout = useCallback(() => {
      const chronos = nodes.filter(n => n.type === 'chronos');
      const newNodes = nodes.map(node => {
          let position = { ...node.position };
          if (node.type === 'chronos') {
              const idx = chronos.findIndex(n => n.id === node.id);
              position = { x: idx * 600, y: 0 };
          } else if (node.type === 'diaryNode') {
              const parentEdge = edges.find(e => e.target === node.id);
              if (parentEdge) {
                  const parentIdx = chronos.findIndex(n => n.id === parentEdge.source);
                  const siblings = edges.filter(e => e.source === parentEdge.source);
                  const sibIdx = siblings.findIndex(e => e.target === node.id);
                  position = { x: (parentIdx * 600) + (sibIdx % 2 === 0 ? 150 : -150), y: 400 + (Math.floor(sibIdx / 2) * 200) };
              }
          }
          return { ...node, position };
      });
      setNodes(newNodes);
      setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 100);
      addNotification('Canvas Restructured', 'success');
  }, [nodes, edges, setNodes, fitView, addNotification]);

  return (
    <div className="w-full h-full min-h-[600px] bg-[#050507] rounded-[2.5rem] overflow-hidden relative border border-white/5 shadow-inner group/canvas">
      <WeatherSystem nodes={nodes} />
      <div className="absolute top-6 left-6 z-40 flex gap-2">
          <button onClick={restructureLayout} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl backdrop-blur-md text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2 transition-all shadow-2xl active:scale-95">
              <Zap size={14} className="text-amber-400" /> Restructure
          </button>
      </div>
      <ReactFlow
        nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        onConnect={handleConnect} onDrop={onDropHandler} 
        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }} 
        onNodeDragStop={onNodeDragStop} onNodeClick={handleNodeClickInternal}
        fitView minZoom={0.05} maxZoom={4} snapToGrid={true} snapGrid={[20, 20]} proOptions={{ hideAttribution: true }}
      >
        <Background color="#6366f1" gap={40} size={1} className="opacity-[0.12] animate-pulse" />
        <Controls className="!bg-stone-900 !border-white/10 !text-white !rounded-xl shadow-2xl" />
        <MiniMap className="!bg-stone-900/80 !border-white/10 !rounded-3xl !backdrop-blur-xl border-t border-l border-white/10" nodeColor={n => n.type === 'chronos' ? '#8b5cf6' : n.type === 'diaryNode' ? '#10b981' : '#6366f1'} maskColor="rgba(0,0,0,0.6)" />
        {dropPing && <div className="fixed pointer-events-none z-[9999] w-20 h-20 border-2 border-indigo-500 rounded-full animate-ping-slow shadow-[0_0_20px_#6366f1]" style={{ left: dropPing.x - 40, top: dropPing.y - 40 }} />}
      </ReactFlow>
    </div>
  );
};

const TimelineCanvas = (props) => <ReactFlowProvider><TimelineCanvasContent {...props} /></ReactFlowProvider>;
export default TimelineCanvas;