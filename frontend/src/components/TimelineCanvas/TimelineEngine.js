import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNodesState, useEdgesState, addEdge, useReactFlow } from '@xyflow/react';
import { api } from '../../utils/api';
import { PIXELS_PER_HOUR, START_HOUR } from './constants';

export const useTimelineEngine = (items, onUpdateItem, onRemoveItem, onDrop, extraNodes = [], persistentEdges = [], onUpdateEdges) => {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState([]);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(persistentEdges || []);
  const [heatmapActive, setHeatmapActive] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const { screenToFlowPosition, getNodes } = useReactFlow();

  const onNodesChange = useCallback((changes) => {
      onNodesChangeInternal(changes);
      // If position changed, we need to notify the parent for persistence
      changes.forEach(change => {
          if (change.type === 'position' && change.dragging === false) {
              const node = getNodes().find(n => n.id === change.id);
              if (node) {
                  onUpdateItem(node.id, { position: node.position });
              }
          }
      });
  }, [onNodesChangeInternal, onUpdateItem, getNodes]);

  const onEdgesChange = useCallback((changes) => {
      onEdgesChangeInternal(changes);
  }, [onEdgesChangeInternal]);

  // Handle external edge sync (e.g. loading a new diary or restoring draft)
  useEffect(() => {
      if (persistentEdges && persistentEdges.length > 0) {
          setEdges(eds => {
              const localIds = new Set(eds.map(e => e.id));
              const externalIds = new Set(persistentEdges.map(e => e.id));
              const isDifferent = persistentEdges.length !== eds.length || 
                                 persistentEdges.some(pe => !localIds.has(pe.id));
              if (isDifferent) return persistentEdges;
              return eds;
          });
      } else if (persistentEdges && persistentEdges.length === 0 && edges.length > 0) {
          setEdges([]);
      }
  }, [persistentEdges, setEdges]);

  // Notify parent of edge changes for persistence
  useEffect(() => {
      if (onUpdateEdges) {
          // Check if parent state actually needs update to prevent loops
          onUpdateEdges(edges);
      }
  }, [edges, onUpdateEdges]);

  // Update Container Totals (Zones/Wormholes/Allowances)
  const updateContainerTotals = useCallback(() => {
      setNodes(nds => {
          const currentEdges = edges; // Use latest edges
          return nds.map(node => {
              // Standard Container Logic (Parent/Child)
              if (node.type === 'zone' || node.type === 'wormhole' || node.type === 'chronos') {
                  const children = nds.filter(i => (i.parentId === node.id || (node.type==='zone' && i.position.x >= node.position.x && i.position.x <= node.position.x + (node.data.width || 400))) && i.type === 'diaryNode');
                  const total = children.reduce((sum, i) => sum + (i.data.totalCost || 0), 0);
                  const manHours = children.filter(c => c.data.type === 'staff').reduce((sum, i) => sum + (i.data.duration || 0), 0);
                  return { ...node, data: { ...node.data, zoneTotal: total, manHours } };
              }
              
              // Smart Node logic (Edge-based)
              if (node.type === 'allowance') {
                  const connectedIds = currentEdges
                      .filter(e => e.source === node.id || e.target === node.id)
                      .map(e => e.source === node.id ? e.target : e.source);
                  
                  const connectedStaff = items.filter(i => connectedIds.includes(i.id) && i.type === 'staff');
                  const allowanceTotal = connectedStaff.reduce((sum, s) => {
                      const rate = parseFloat(node.data.rate) || 0;
                      return sum + (node.data.type === 'daily' ? rate : rate * (s.quantity || 0));
                  }, 0);
                  return { ...node, data: { ...node.data, allowanceTotal } };
              }
              return node;
          });
      });
  }, [setNodes, edges, items]);

  const onNodeDragStop = useCallback((event, node) => {
    // Basic update
    if (!node.parentId) {
        onUpdateItem(node.id, { position: node.position });
    } else {
        // Parent already tracked via React Flow
    }
    updateContainerTotals();
  }, [onUpdateItem, updateContainerTotals]);

  // --- RECURSIVE PROPAGATION ENGINE ---
  const propagateDownstream = useCallback((sourceId, updates, visited = new Set()) => {
      // Prevent infinite loops
      if (visited.has(sourceId)) return;
      visited.add(sourceId);

      // Find all immediate children
      const childrenEdges = edges.filter(e => e.source === sourceId || e.target === sourceId);
      
      childrenEdges.forEach(edge => {
          const childId = edge.source === sourceId ? edge.target : edge.source;
          
          // Avoid processing already visited nodes
          if (visited.has(childId)) return;

          const childNode = getNodes().find(n => n.id === childId);
          
          if (childNode && childNode.type === 'diaryNode') {
              onUpdateItem(childId, { ...updates, isChronosLinked: true });
              // Recursively propagate to this child's children
              propagateDownstream(childId, updates, visited);
          }
      });
  }, [edges, getNodes, onUpdateItem]);

  const handleNodeUpdate = useCallback((id, updates) => {
      onUpdateItem(id, updates);
      
      // If this is a time-giving node, propagate the changes live
      const node = getNodes().find(n => n.id === id);
      if (node && (node.type === 'chronos' || (node.type === 'diaryNode' && node.data.isChronosLinked))) {
          // We only propagate time-related fields
          const timeUpdates = {};
          if (updates.startTime) timeUpdates.startTime = updates.startTime;
          if (updates.finishTime) timeUpdates.finishTime = updates.finishTime;
          if (updates.duration !== undefined) timeUpdates.duration = updates.duration;
          
          if (Object.keys(timeUpdates).length > 0) {
              propagateDownstream(id, timeUpdates);
          }
      }
  }, [onUpdateItem, getNodes, propagateDownstream]);

  const onConnect = useCallback((params) => {
      const sourceNode = nodes.find(n => n.id === params.source);
      const targetNode = nodes.find(n => n.id === params.target);

      // --- ALLOWANCE-SYNC LOGIC ---
      if ((sourceNode?.type === 'allowance' && targetNode?.type === 'diaryNode') || (targetNode?.type === 'allowance' && sourceNode?.type === 'diaryNode')) {
          const allowanceNode = sourceNode.type === 'allowance' ? sourceNode : targetNode;
          const diaryNode = sourceNode.type === 'allowance' ? targetNode : sourceNode;

          if (diaryNode.data.type === 'staff') {
              const allowanceData = { 
                  id: allowanceNode.id, 
                  name: allowanceNode.data.label, 
                  rate: allowanceNode.data.rate, 
                  type: allowanceNode.data.type 
              };
              
              const currentItem = items.find(i => i.id === diaryNode.id);
              if (currentItem) {
                  const currentAllowances = currentItem.activeAllowances || [];
                  const exists = currentAllowances.find(a => a.id === allowanceData.id || a.name === allowanceData.name);
                  
                  if (!exists) {
                      onUpdateItem(diaryNode.id, { activeAllowances: [...currentAllowances, allowanceData] });
                  }
              }
          }
      }

      // --- CHRONO-SYNC LOGIC (Parent -> Child & Recursive) ---
      if (sourceNode?.type === 'chronos' && targetNode?.type === 'diaryNode') {
          const { startTime, finishTime, duration } = sourceNode.data;
          const updates = { startTime, finishTime, duration, isChronosLinked: true };
          handleNodeUpdate(targetNode.id, updates);
      } else if (targetNode?.type === 'chronos' && sourceNode?.type === 'diaryNode') {
          const { startTime, finishTime, duration } = targetNode.data;
          const updates = { startTime, finishTime, duration, isChronosLinked: true };
          handleNodeUpdate(sourceNode.id, updates);
      }

      // --- SIBLING SYNC LOGIC (Chain Inheritance) ---
      // Only propagate if source is already part of a Chronos chain
      if (sourceNode?.type === 'diaryNode' && targetNode?.type === 'diaryNode') {
          // Case A: Source -> Target (Source has the time)
          if (sourceNode.data.isChronosLinked && sourceNode.data.startTime && sourceNode.data.finishTime) {
               const updates = { 
                   startTime: sourceNode.data.startTime, 
                   finishTime: sourceNode.data.finishTime, 
                   duration: sourceNode.data.duration,
                   isChronosLinked: true 
               };
               handleNodeUpdate(targetNode.id, updates);
          }
          // Case B: Target -> Source (Target has the time)
          else if (targetNode.data.isChronosLinked && targetNode.data.startTime && targetNode.data.finishTime) {
               const updates = { 
                   startTime: targetNode.data.startTime, 
                   finishTime: targetNode.data.finishTime, 
                   duration: targetNode.data.duration,
                   isChronosLinked: true 
               };
               handleNodeUpdate(sourceNode.id, updates);
          }
      }

      // --- CHRONO-MODIFIER LOGIC (Break -> Shift) ---
      // If a Chronos node (Break) connects to another Chronos node (Shift), subtract duration
      if (sourceNode?.type === 'chronos' && targetNode?.type === 'chronos') {
          const breakDuration = sourceNode.data.duration || 0;
          const shiftDuration = targetNode.data.duration || 8;
          const newDuration = Math.max(0, shiftDuration - breakDuration);
          
          handleNodeUpdate(targetNode.id, { duration: newDuration, status: 'adjusted' });
      }

      // --- IMPACT-SYNC LOGIC ---
      if (sourceNode?.type === 'impact' && targetNode?.type === 'diaryNode') {
          const { prodImpact = 1, costImpact = 1 } = sourceNode.data;
          const newDuration = (targetNode.data.duration || 1) * (1 / prodImpact);
          const newCost = (targetNode.data.costRate || 0) * costImpact;
          handleNodeUpdate(targetNode.id, { duration: newDuration, costRate: newCost });
      }

      // --- DELAY/IMPACT PROPAGATION LOGIC (Deep Update & Bidirectional) ---
      const isDelayOrImpact = (n) => n?.type === 'delay' || n?.type === 'impact';
      const isChronos = (n) => n?.type === 'chronos';

      if ((isDelayOrImpact(sourceNode) && isChronos(targetNode)) || (isDelayOrImpact(targetNode) && isChronos(sourceNode))) {
          const impactNode = isDelayOrImpact(sourceNode) ? sourceNode : targetNode;
          const chronosNode = isChronos(sourceNode) ? sourceNode : targetNode;
          
          const delayAmt = impactNode.data.duration || 1; 
          const baseDuration = 8; // Default shift length if not set
          const currentDuration = chronosNode.data.duration || baseDuration;
          
          // Calculate new effective duration (subtract delay)
          const newDuration = Math.max(0, currentDuration - delayAmt);
          
          // 1. Update Chronos Node
          handleNodeUpdate(chronosNode.id, { duration: newDuration, status: 'impacted' });
      }

      setEdges((eds) => addEdge({ ...params, animated: true }, eds));
  }, [nodes, edges, setEdges, onUpdateItem, items, propagateDownstream, getNodes, handleNodeUpdate]);

  // Sync external items to nodes
  useEffect(() => {
    const persistentTypes = ['wormhole', 'zone', 'chronos', 'neuralLens', 'photoNode', 'photoPlane', 'delay', 'impact', 'dimension', 'allowance'];

    const mappedItems = items.map(item => {
        let nodeStyle = item.type === 'photoPlane' ? { width: item.width || 800, height: 600, zIndex: -1 } : undefined;
        return {
            id: item.id,
            type: item.type === 'photoPlane' ? 'photoPlane' : 'diaryNode',
            position: item.position || { x: Math.random() * 400, y: Math.random() * 400 },
            parentId: item.parentId,
            extent: item.parentId ? 'parent' : undefined,
            style: nodeStyle,
            data: {
                ...item,
                id: item.id,
                label: item.name,
                onDelete: () => onRemoveItem(item.id),
                onUpdate: handleNodeUpdate
            }
        };
    });

    const mappedExtras = extraNodes.map(node => ({
        ...node,
        data: {
            ...node.data,
            onDelete: () => onRemoveItem(node.id),
            onUpdate: handleNodeUpdate
        }
    }));

    setNodes(nds => {
        const persistentNodes = nds.filter(n => persistentTypes.includes(n.type) && !items.find(it => it.id === n.id) && !extraNodes.find(ex => ex.id === n.id));
        return [...persistentNodes, ...mappedExtras, ...mappedItems];
    });
  }, [items, extraNodes, onRemoveItem, handleNodeUpdate, setNodes]);

  return {
    nodes, setNodes, onNodesChange, edges, setEdges, onEdgesChange,
    heatmapActive, setHeatmapActive, showTime, setShowTime,
    screenToFlowPosition, onNodeDragStop, updateContainerTotals, onConnect
  };
};