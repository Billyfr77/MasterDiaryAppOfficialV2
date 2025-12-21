import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNodesState, useEdgesState, addEdge, useReactFlow } from '@xyflow/react';
import { api } from '../../utils/api';
import { PIXELS_PER_HOUR, START_HOUR } from './constants';

export const useTimelineEngine = (items, onUpdateItem, onRemoveItem, onDrop, extraNodes = [], persistentEdges = []) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [heatmapActive, setHeatmapActive] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const { screenToFlowPosition, getNodes } = useReactFlow();

  // Update Container Totals (Zones/Wormholes)
  const updateContainerTotals = useCallback(() => {
      setNodes(nds => nds.map(node => {
          if (node.type === 'zone' || node.type === 'wormhole' || node.type === 'chronos') {
              const children = nds.filter(i => (i.parentId === node.id || (node.type==='zone' && i.position.x >= node.position.x && i.position.x <= node.position.x + (node.data.width || 400))) && i.type === 'diaryNode');
              const total = children.reduce((sum, i) => sum + (i.data.totalCost || 0), 0);
              const manHours = children.filter(c => c.data.type === 'staff').reduce((sum, i) => sum + (i.data.duration || 0), 0);
              return { ...node, data: { ...node.data, zoneTotal: total, manHours } };
          }
          return node;
      }));
  }, [setNodes]);

  // Sync external items to nodes
  useEffect(() => {
    const newNodes = items.map(item => {
        let nodeStyle = item.type === 'photoPlane' ? { width: item.width || 800, height: 600, zIndex: -1 } : undefined;
        return {
            id: item.id,
            type: item.type === 'photoPlane' ? 'photoPlane' : 'diaryNode',
            position: item.position || { x: Math.random() * 400, y: Math.random() * 400 },
            parentId: item.parentId,
            extent: item.parentId ? 'parent' : undefined,
            style: nodeStyle,
            data: {
                id: item.id,
                label: item.name,
                duration: item.duration || 1,
                type: item.type,
                totalCost: (item.duration || 1) * (item.costRate || 0),
                onDelete: () => onRemoveItem(item.id),
                onUpdate: onUpdateItem
            }
        };
    });
    setNodes(nds => {
        const persistentTypes = ['wormhole', 'zone', 'chronos', 'neuralLens'];
        const persistentNodes = nds.filter(n => persistentTypes.includes(n.type) || n.id.startsWith('ghost-'));
        
        // Merge AI extraNodes if not already present
        const incomingExtras = extraNodes.filter(en => !persistentNodes.find(pn => pn.id === en.id));
        
        return [...persistentNodes, ...incomingExtras, ...newNodes];
    });
  }, [items, extraNodes, onRemoveItem, onUpdateItem, setNodes]);

  // Sync Edges
  useEffect(() => {
      if (persistentEdges.length > 0) {
          setEdges(eds => {
              const newEdges = persistentEdges.filter(pe => !eds.find(e => e.id === pe.id));
              return [...eds, ...newEdges];
          });
      }
  }, [persistentEdges, setEdges]);

  const onNodeDragStop = useCallback((event, node) => {
    // Basic update
    if (!node.parentId) {
        onUpdateItem(node.id, { position: node.position });
    } else {
        // Parent already tracked via React Flow
    }
    updateContainerTotals();
  }, [onUpdateItem, updateContainerTotals]);

  const onConnect = useCallback((params) => {
      const sourceNode = nodes.find(n => n.id === params.source);
      const targetNode = nodes.find(n => n.id === params.target);

      // --- CHRONO-SYNC LOGIC (Parent -> Child) ---
      if (sourceNode?.type === 'chronos' && targetNode?.type === 'diaryNode') {
          const { startTime, duration } = sourceNode.data;
          onUpdateItem(targetNode.id, { startTime, duration });
      } else if (targetNode?.type === 'chronos' && sourceNode?.type === 'diaryNode') {
          const { startTime, duration } = targetNode.data;
          onUpdateItem(sourceNode.id, { startTime, duration });
      }

      // --- CHRONO-MODIFIER LOGIC (Break -> Shift) ---
      // If a Chronos node (Break) connects to another Chronos node (Shift), subtract duration
      if (sourceNode?.type === 'chronos' && targetNode?.type === 'chronos') {
          const breakDuration = sourceNode.data.duration || 0;
          const shiftDuration = targetNode.data.duration || 8;
          const newDuration = Math.max(0, shiftDuration - breakDuration);
          
          onUpdateItem(targetNode.id, { duration: newDuration, status: 'adjusted' });

          // Propagate to children of the Shift
          const attachedEdges = edges.filter(e => e.source === targetNode.id || e.target === targetNode.id);
          attachedEdges.forEach(edge => {
              const childId = edge.source === targetNode.id ? edge.target : edge.source;
              const childNode = nodes.find(n => n.id === childId);
              if (childNode && childNode.type === 'diaryNode') {
                  onUpdateItem(childId, { duration: newDuration });
              }
          });
      }

      // --- IMPACT-SYNC LOGIC ---
      if (sourceNode?.type === 'impact' && targetNode?.type === 'diaryNode') {
          const { prodImpact = 1, costImpact = 1 } = sourceNode.data;
          const newDuration = (targetNode.data.duration || 1) * (1 / prodImpact);
          const newCost = (targetNode.data.costRate || 0) * costImpact;
          onUpdateItem(targetNode.id, { duration: newDuration, costRate: newCost });
      }

      // --- DELAY/IMPACT PROPAGATION LOGIC (Deep Update) ---
      // Delay or Impact connects to Chronos -> Updates Chronos AND all its attached Children
      if ((sourceNode?.type === 'delay' || sourceNode?.type === 'impact') && targetNode?.type === 'chronos') {
          const delayAmt = sourceNode.data.duration || 1; // Use duration as impact amount
          const currentDuration = targetNode.data.duration || 8;
          // Subtract delay from effective duration
          const newDuration = Math.max(0, currentDuration - delayAmt); 
          
          // Logic: Update Chronos
          onUpdateItem(targetNode.id, { duration: newDuration, status: 'impacted' });

          // Find all children connected to this Chronos
          const attachedEdges = edges.filter(e => e.source === targetNode.id || e.target === targetNode.id);
          attachedEdges.forEach(edge => {
              const childId = edge.source === targetNode.id ? edge.target : edge.source;
              const childNode = nodes.find(n => n.id === childId);
              if (childNode && childNode.type === 'diaryNode') {
                  // Propagate new duration to child
                  onUpdateItem(childId, { duration: newDuration });
              }
          });
      }

      setEdges((eds) => addEdge({ ...params, animated: true }, eds));
  }, [nodes, edges, setEdges, onUpdateItem]);

  return {
    nodes, setNodes, onNodesChange, edges, setEdges, onEdgesChange,
    heatmapActive, setHeatmapActive, showTime, setShowTime,
    screenToFlowPosition, onNodeDragStop, updateContainerTotals, onConnect
  };
};
