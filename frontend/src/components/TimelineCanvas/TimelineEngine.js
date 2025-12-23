import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNodesState, useEdgesState, addEdge, useReactFlow } from '@xyflow/react';
import { api } from '../../utils/api';

export const useTimelineEngine = (items, onUpdateItem, onRemoveItem, onDrop, extraNodes = [], persistentEdges = [], onUpdateEdges, projectFinancials) => {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState([]);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(persistentEdges || []);
  const [heatmapActive, setHeatmapActive] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const { screenToFlowPosition, getNodes } = useReactFlow();

  const edgesRef = useRef(edges);
  const itemsRef = useRef(items);
  const extraNodesRef = useRef(extraNodes);
  const deletedIds = useRef(new Set()); 
  
  useEffect(() => { edgesRef.current = edges; }, [edges]);
  useEffect(() => { itemsRef.current = items; }, [items]);
  useEffect(() => { extraNodesRef.current = extraNodes; }, [extraNodes]);

  const onNodesChange = useCallback((changes) => {
      onNodesChangeInternal(changes);
      changes.forEach(change => {
          if (change.type === 'position' && change.dragging === false) {
              const node = getNodes().find(n => n.id === change.id);
              if (node) onUpdateItem(node.id, { position: node.position });
          }
          if (change.type === 'remove') {
              deletedIds.current.add(change.id);
              onRemoveItem(change.id);
          }
      });
  }, [onNodesChangeInternal, onUpdateItem, onRemoveItem, getNodes]);

  const onEdgesChange = useCallback((changes) => {
      onEdgesChangeInternal(changes);
  }, [onEdgesChangeInternal]);

  // Sync external edges
  useEffect(() => {
      if (persistentEdges && persistentEdges.length > 0) {
          setEdges(eds => {
              const localIds = new Set(eds.map(e => e.id));
              const isDifferent = persistentEdges.length !== eds.length || persistentEdges.some(pe => !localIds.has(pe.id));
              if (isDifferent) return persistentEdges;
              return eds;
          });
      } else if (persistentEdges && persistentEdges.length === 0 && edges.length > 0) {
          setEdges([]);
      }
  }, [persistentEdges, setEdges]);

  useEffect(() => {
      if (onUpdateEdges) onUpdateEdges(edges);
  }, [edges, onUpdateEdges]);

  // --- RECURSIVE HARVESTER (Pure logic) ---
  const harvestBranch = useCallback((startId, currentEdges, currentItems, currentExtras, visited = new Set()) => {
      if (visited.has(startId)) return { workers: [], resources: [], extras: [], delays: [], breaks: [] };
      visited.add(startId);

      const connectedEdges = currentEdges.filter(e => e.source === startId || e.target === startId);
      let workers = [], resources = [], extras = [], delays = [], breaks = [];

      connectedEdges.forEach(edge => {
          const neighborId = edge.source === startId ? edge.target : edge.source;
          if (visited.has(neighborId)) return;

          const item = currentItems.find(i => i.id === neighborId);
          if (item) {
              const richItem = { ...item, inHouseCost: parseFloat(item.costRate) || 0, outHouseCharge: parseFloat(item.chargeRate) || 0 };
              if (item.type === 'staff') workers.push(richItem);
              else resources.push(richItem);
          } else {
              const extra = currentExtras.find(e => e.id === neighborId);
              if (extra) {
                  const isBreak = extra.type === 'chronos' && !extra.data?.startTime;
                  if (extra.type === 'delay') delays.push(extra);
                  else if (isBreak) breaks.push(extra);
                  else extras.push({ id: extra.id, type: extra.type, label: extra.data?.label || extra.type });
              }
          }

          const sub = harvestBranch(neighborId, currentEdges, currentItems, currentExtras, visited);
          workers = [...workers, ...sub.workers];
          resources = [...resources, ...sub.resources];
          extras = [...extras, ...sub.extras];
          delays = [...delays, ...sub.delays];
          breaks = [...breaks, ...sub.breaks];
      });

      return { workers, resources, extras, delays, breaks };
  }, []);

  // --- SINGLE SOURCE OF TRUTH MAPPING ENGINE ---
  useEffect(() => {
      const currentItems = items;
      const currentExtras = extraNodes;
      const currentEdges = edges;

      // 1. Initial State Calculation
      const reachableFromHub = new Set();
      const hubStateMap = new Map();
      const hubs = currentExtras.filter(n => n.type === 'chronos' && n.data?.startTime && n.data?.finishTime);

      hubs.forEach(hub => {
          const branch = harvestBranch(hub.id, currentEdges, currentItems, currentExtras);
          const [h1, m1] = (hub.data.startTime || '07:00').split(':').map(Number);
          const [h2, m2] = (hub.data.finishTime || '15:00').split(':').map(Number);
          const baseShift = Math.max(0, (h2 + m2/60) - (h1 + m1/60));
          const totalDelay = branch.delays.reduce((sum, d) => sum + (parseFloat(d.data?.duration) || 0), 0);
          const totalBreak = branch.breaks.reduce((sum, b) => sum + (parseFloat(b.data?.duration) || 0), 0);
          const finalDuration = Math.max(0, baseShift - totalDelay - totalBreak);

          hubStateMap.set(hub.id, { ...branch, finalDuration });
          branch.workers.forEach(w => reachableFromHub.add(w.id));
          branch.resources.forEach(r => reachableFromHub.add(r.id));
          branch.extras.forEach(e => reachableFromHub.add(e.id));
      });

      // 2. Map Items to Final Visual Nodes
      const processedItems = currentItems.map(item => {
          let duration = item.duration;
          let isChronosLinked = false;
          let activeAllowances = [];

          // 2a. Allowance Scanner
          if (item.type === 'staff') {
              const connectedAllowanceIds = currentEdges
                  .filter(e => e.source === item.id || e.target === item.id)
                  .map(e => e.source === item.id ? e.target : e.source);
              
              const connectedAllowances = currentExtras.filter(n => n.type === 'allowance' && connectedAllowanceIds.includes(n.id));
              
              activeAllowances = connectedAllowances.map(a => ({
                  id: a.id,
                  name: a.data?.name || 'Allowance',
                  rate: parseFloat(a.data?.rate) || 0,
                  type: a.data?.allowanceType || 'hourly' // 'hourly' or 'daily'
              }));

              // Sync to persistent state if changed
              const prevAllowances = JSON.stringify(item.activeAllowances || []);
              const newAllowances = JSON.stringify(activeAllowances);
              
              if (prevAllowances !== newAllowances) {
                  setTimeout(() => onUpdateItem(item.id, { activeAllowances }), 0);
              }
          }

          if (reachableFromHub.has(item.id) && !item.isOverridden) {
              const state = Array.from(hubStateMap.values()).find(s => s.workers.some(w => w.id === item.id) || s.resources.some(r => r.id === item.id));
              if (state && (item.type === 'staff' || item.type === 'equipment')) {
                  duration = state.finalDuration;
                  isChronosLinked = true;
                  // Push back to persistent state if mismatch (DEFERRED)
                  if (Math.abs(parseFloat(item.duration) - duration) > 0.01) {
                      const orig = item.isChronosLinked ? item.originalDuration : item.duration;
                      setTimeout(() => onUpdateItem(item.id, { duration, isChronosLinked: true, originalDuration: orig }), 0);
                  }
              }
          } else if (item.isChronosLinked) {
              // Disconnected Reset (DEFERRED)
              setTimeout(() => onUpdateItem(item.id, { isChronosLinked: false, duration: item.originalDuration || item.duration }), 0);
          }

          return {
              id: item.id, type: 'diaryNode', position: item.position || { x: 0, y: 0 },
              data: { ...item, duration, isChronosLinked, activeAllowances, label: item.name, onDelete: () => onRemoveItem(item.id), onUpdate: (id, ups) => onUpdateItem(id, ups) }
          };
      });

      // 3. Map Extras to Final Visual Nodes
      const processedExtras = currentExtras.map(node => {
          let duration = node.data?.duration;
          let hubData = node.data?.hubData;
          let status = node.data?.status || 'normal';

          if (hubStateMap.has(node.id)) {
              const state = hubStateMap.get(node.id);
              duration = state.finalDuration;
              hubData = { workers: state.workers, resources: state.resources, extras: state.extras };
              status = (state.delays.length || state.breaks.length) ? 'impacted' : 'normal';
              if (Math.abs((parseFloat(node.data?.duration) || 0) - duration) > 0.01) {
                  setTimeout(() => onUpdateItem(node.id, { duration }), 0);
              }
          }

          // Neural Prism Logic
          if (node.type === 'neuralPrism') {
              const hubId = Array.from(hubStateMap.keys()).find(hid => currentEdges.some(e => (e.source === node.id && e.target === hid) || (e.target === node.id && e.source === hid)));
              if (hubId) {
                  const s = hubStateMap.get(hubId);
                  hubData = { workers: s.workers, resources: s.resources, duration: s.finalDuration };
              }
          }

          return {
              ...node, data: { ...node.data, duration, hubData, status, projectFinancials, onDelete: () => onRemoveItem(node.id), onUpdate: (id, ups) => onUpdateItem(id, ups) }
          };
      });

      // 4. Batch Atomic setNodes (Safe lookup)
      setNodes(nds => {
          const nodeMap = new Map();
          nds.forEach(n => { if (n) nodeMap.set(n.id, n); });
          const combined = [...processedExtras, ...processedItems].filter(n => n && !deletedIds.current.has(n.id));
          
          return combined.map(newNode => {
              const existing = nodeMap.get(newNode.id);
              if (existing) {
                  const pos = existing.dragging || existing.selected ? existing.position : newNode.position;
                  return { ...existing, ...newNode, position: pos, data: { ...existing.data, ...newNode.data } };
              }
              return newNode;
          });
      });

  }, [items, extraNodes, edges, projectFinancials, harvestBranch, onUpdateItem, onRemoveItem]);

  // Decoupled AI Logic (Fixed Infinite Loop)
  useEffect(() => {
      const prisms = nodes.filter(n => n.type === 'neuralPrism' && n.data?.hubData);
      
      prisms.forEach(prism => {
          const prismId = prism.id;
          const { hubData, projectFinancials: financials, lastAnalyzedHash, status } = prism.data;
          
          // Generate simple hash of current hubData to check for changes
          const currentHash = JSON.stringify({ w: hubData.workers?.length, r: hubData.resources?.length, d: hubData.duration });
          
          // Only analyze if hash changed or never analyzed
          if (status !== 'analyzing' && currentHash !== lastAnalyzedHash) {
              
              clearTimeout(window[`prism_${prismId}`]);
              
              // Immediate: Mark analyzing
              onUpdateItem(prismId, { status: 'analyzing', lastAnalyzedHash: currentHash });

              window[`prism_${prismId}`] = setTimeout(async () => {
                  try {
                      const res = await api.post('/ai/analyze-prism', { 
                          context: { 
                              workers: hubData.workers, 
                              tasks: hubData.resources, 
                              duration: hubData.duration, 
                              projectFinancials: financials 
                          } 
                      });
                      
                      if (res.data) {
                          onUpdateItem(prismId, { ...res.data, status: 'ready' });
                      }
                  } catch (e) {
                      console.error("AI Analysis Failed", e);
                      onUpdateItem(prismId, { status: 'disconnected' });
                  }
              }, 3500);
          }
      });
  }, [nodes, onUpdateItem]);

  const onNodeDragStop = useCallback((event, node) => {
    if (!node.parentId) onUpdateItem(node.id, { position: node.position });
  }, [onUpdateItem]);

  const onConnect = useCallback((params) => { setEdges((eds) => addEdge({ ...params, animated: true }, eds)); }, [setEdges]);

  return { nodes, setNodes, onNodesChange, edges, setEdges, onEdgesChange, heatmapActive, setHeatmapActive, showTime, setShowTime, screenToFlowPosition, onNodeDragStop, onConnect };
};