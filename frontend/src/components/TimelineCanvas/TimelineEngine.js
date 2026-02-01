import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNodesState, useEdgesState, addEdge, useReactFlow } from '@xyflow/react';
import { api } from '../../utils/api';

export const useTimelineEngine = (items, onUpdateItem, onRemoveItem, onDrop, extraNodes = [], persistentEdges = [], onUpdateEdges, projectFinancials, history = [], onDeployFixes, quotedData) => {
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
      if (visited.has(startId)) return { workers: [], resources: [], extras: [], delays: [], breaks: [], notes: [] };
      visited.add(startId);

      const connectedEdges = currentEdges.filter(e => e.source === startId || e.target === startId);
      let workers = [], resources = [], extras = [], delays = [], breaks = [], notes = [];

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
                  else if (extra.type === 'notesNode') notes.push(extra);
                  else extras.push(extra); 
              }
          }

          const sub = harvestBranch(neighborId, currentEdges, currentItems, currentExtras, visited);
          workers = [...workers, ...sub.workers];
          resources = [...resources, ...sub.resources];
          extras = [...extras, ...sub.extras];
          delays = [...delays, ...sub.delays];
          breaks = [...breaks, ...sub.breaks];
          notes = [...notes, ...sub.notes];
      });

      return { workers, resources, extras, delays, breaks, notes };
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
          branch.delays.forEach(d => reachableFromHub.add(d.id));
          branch.breaks.forEach(b => reachableFromHub.add(b.id));
          branch.notes.forEach(n => reachableFromHub.add(n.id));
      });

      // --- CHAINED INHERITANCE (Advanced Team Mechanic) ---
      // If a resource node is NOT directly reachable but IS connected via a supervisor or task...
      let changed = true;
      const resourceHubAssignment = new Map(); // itemId -> hubId
      
      // Seed with direct connections from harvest
      hubs.forEach(hub => {
          const s = hubStateMap.get(hub.id);
          s.workers.forEach(w => resourceHubAssignment.set(w.id, hub.id));
          s.resources.forEach(r => resourceHubAssignment.set(r.id, hub.id));
          s.extras.forEach(e => resourceHubAssignment.set(e.id, hub.id));
          s.delays.forEach(d => resourceHubAssignment.set(d.id, hub.id));
          s.breaks.forEach(b => resourceHubAssignment.set(b.id, hub.id));
          s.notes.forEach(n => resourceHubAssignment.set(n.id, hub.id));
      });

      while (changed) {
          changed = false;
          // Traverse through all resource items (Staff/Equip)
          currentItems.forEach(item => {
              if (!resourceHubAssignment.has(item.id)) {
                  const neighborId = currentEdges
                      .filter(e => e.source === item.id || e.target === item.id)
                      .map(e => e.source === item.id ? e.target : e.source)
                      .find(nid => resourceHubAssignment.has(nid));
                  
                  if (neighborId) {
                      const hubId = resourceHubAssignment.get(neighborId);
                      resourceHubAssignment.set(item.id, hubId);
                      reachableFromHub.add(item.id);
                      changed = true;
                  }
              }
          });
          
          // Traverse through extra nodes (Tasks/Prisms can act as bridges)
          currentExtras.forEach(extra => {
              if (!resourceHubAssignment.has(extra.id)) {
                  const neighborId = currentEdges
                      .filter(e => e.source === extra.id || e.target === extra.id)
                      .map(e => e.source === extra.id ? e.target : e.source)
                      .find(nid => resourceHubAssignment.has(nid) || hubStateMap.has(nid));
                  
                  if (neighborId) {
                      const hubId = hubStateMap.has(neighborId) ? neighborId : resourceHubAssignment.get(neighborId);
                      resourceHubAssignment.set(extra.id, hubId);
                      reachableFromHub.add(extra.id);
                      changed = true;
                  }
              }
          });
      }

      // 2. Map Items to Final Visual Nodes
      const processedItems = currentItems.map(item => {
          let duration = item.duration;
          let isChronosLinked = false;
          let activeAllowances = [];

          // CLONE NODE SAFETY: Check if item is an orphan (missing from global library but has data)
          const isOrphan = !item.name && item.label;
          if (isOrphan) {
              console.warn(`[Safety] Orphan node ${item.id} detected. Activating Clone.`);
          }

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
                  type: a.data?.allowanceType || 'hourly' 
              }));

              const prevAllowances = JSON.stringify(item.activeAllowances || []);
              const newAllowances = JSON.stringify(activeAllowances);
              
              if (prevAllowances !== newAllowances) {
                  setTimeout(() => onUpdateItem(item.id, { activeAllowances }), 0);
              }
          }

          if (reachableFromHub.has(item.id) && !item.isOverridden) {
              const hubId = resourceHubAssignment.get(item.id);
              const state = hubId ? hubStateMap.get(hubId) : Array.from(hubStateMap.values()).find(s => s.workers.some(w => w.id === item.id) || s.resources.some(r => r.id === item.id));
              
              if (state && (item.type === 'staff' || item.type === 'equipment')) {
                  duration = state.finalDuration;
                  isChronosLinked = true;
                  if (Math.abs(parseFloat(item.duration) - duration) > 0.01) {
                      const orig = item.isChronosLinked ? item.originalDuration : item.duration;
                      setTimeout(() => onUpdateItem(item.id, { duration, isChronosLinked: true, originalDuration: orig }), 0);
                  }
              }
          } else if (item.isChronosLinked) {
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
          let zoneName = 'Unassigned';
          let timeDrift = '0h';
          let costDrift = '$0';

          if (hubStateMap.has(node.id)) {
              const state = hubStateMap.get(node.id);
              duration = state.finalDuration;
              hubData = { workers: state.workers, resources: state.resources, extras: state.extras, delays: state.delays, breaks: state.breaks };
              status = (state.delays.length || state.breaks.length) ? 'impacted' : 'normal';
              if (Math.abs((parseFloat(node.data?.duration) || 0) - duration) > 0.01) {
                  setTimeout(() => onUpdateItem(node.id, { duration }), 0);
              }
          }

          // Universal Hub Data Inheritance (Reverse Lookup)
          if (!hubData && !hubStateMap.has(node.id)) {
              const parentHubId = resourceHubAssignment.get(node.id) || Array.from(hubStateMap.keys()).find(hid => {
                  const s = hubStateMap.get(hid);
                  return s.extras.some(e => e.id === node.id) || 
                         s.workers.some(w => w.id === node.id) || 
                         s.resources.some(r => r.id === node.id);
              });
              
              if (parentHubId) {
                  const s = hubStateMap.get(parentHubId);
                  hubData = { 
                      workers: s.workers, 
                      resources: s.resources, 
                      extras: s.extras,
                      delays: s.delays,
                      breaks: s.breaks,
                      duration: s.finalDuration 
                  };
              }
          }

          // Neural Prism Logic - Enhanced Discovery
          if (node.type === 'neuralPrism') {
              // 1. Try recursive discovery first
              let parentHubId = resourceHubAssignment.get(node.id) || Array.from(hubStateMap.keys()).find(hid => {
                  const s = hubStateMap.get(hid);
                  return s.extras.some(e => e.id === node.id);
              });

              // 2. Fallback: Check for DIRECT connection to a Chronos Node
              if (!parentHubId) {
                  const directEdge = currentEdges.find(e => 
                      (e.source === node.id && hubStateMap.has(e.target)) || 
                      (e.target === node.id && hubStateMap.has(e.source))
                  );
                  if (directEdge) {
                      parentHubId = hubStateMap.has(directEdge.source) ? directEdge.source : directEdge.target;
                  }
              }

              if (parentHubId) {
                  const s = hubStateMap.get(parentHubId);
                  hubData = { 
                      workers: s.workers, 
                      resources: s.resources, 
                      extras: s.extras, 
                      delays: s.delays, 
                      breaks: s.breaks, 
                      duration: s.finalDuration 
                  };
                  
                  // Initialize status correctly
                  status = node.data?.status || 'analyzing';
                  if (status === 'disconnected') status = 'analyzing';
              } else {
                  status = 'disconnected';
                  hubData = null;
              }
          }

          // Zone Detection & Aggregation Logic
          if (node.type === 'taskNode' || node.type === 'diaryNode') {
              const zones = currentExtras.filter(n => n.type === 'zone' || n.type === 'wormhole');
              const parentZone = zones.find(z => {
                  const padding = 20;
                  return node.position.x >= z.position.x - padding &&
                         node.position.x <= z.position.x + (z.width || 400) + padding &&
                         node.position.y >= z.position.y - padding &&
                         node.position.y <= z.position.y + (z.height || 400) + padding;
              });
              if (parentZone) zoneName = parentZone.data?.label || 'Zone';
          }

          // Task Node Logic (Enhanced Cost & Progress Engine)
          if (node.type === 'taskNode') {
              const connectedItemIds = currentEdges
                  .filter(e => e.source === node.id || e.target === node.id)
                  .map(e => e.source === node.id ? e.target : e.source);
              
              const connectedItems = processedItems.filter(i => connectedItemIds.includes(i.id));
              
              // MERGE: Task uses both direct connections AND resources from its inherited hub
              let taskWorkers = [...(hubData?.workers || [])];
              let taskResources = [...(hubData?.resources || [])];

              // Add direct connections if they aren't already part of the hub
              connectedItems.forEach(ci => {
                  if (ci.data?.type === 'staff' && !taskWorkers.find(w => w.id === ci.id)) taskWorkers.push(ci.data);
                  if (ci.data?.type !== 'staff' && !taskResources.find(r => r.id === ci.id)) taskResources.push(ci.data);
              });

              // Check if Task is linked to Chronos (Active)
              const isLinkedToChronos = reachableFromHub.has(node.id) || !!hubData;
              status = isLinkedToChronos ? 'active' : 'pending';

              const totalActualHrs = taskWorkers.reduce((sum, s) => sum + (parseFloat(s.duration) || 0), 0);

              const totalActualCost = [...taskWorkers, ...taskResources].reduce((sum, i) => {
                  const qty = parseFloat(i.quantity) || 0;
                  const dur = parseFloat(i.duration) || 0;
                  const rate = parseFloat(i.costRate) || 0;
                  if (i.type === 'staff' || i.type === 'equipment') return sum + (dur * rate);
                  return sum + (qty * rate);
              }, 0);

              // Calculate Drift relative to Quoted Data (NEE Bridge)
              if (quotedData) {
                  const quotedLabor = (quotedData.staff || []).reduce((sum, s) => sum + (parseFloat(s.hours) || 0), 0);
                  const actualVsQuoted = totalActualHrs - quotedLabor;
                  timeDrift = `${actualVsQuoted > 0 ? '+' : ''}${actualVsQuoted}h`;
                  const costVariance = totalActualCost - (parseFloat(quotedData.totalCost) || 0);
                  costDrift = `${costVariance > 0 ? '+' : ''}$${Math.abs(costVariance).toLocaleString()}`;
              }

              // Update persistent state if values changed
              if (Math.abs((parseFloat(node.data?.actualHours) || 0) - totalActualHrs) > 0.01 || 
                  Math.abs((parseFloat(node.data?.actualCost) || 0) - totalActualCost) > 0.01 ||
                  node.data?.status !== status) {
                  setTimeout(() => onUpdateItem(node.id, { actualHours: totalActualHrs, actualCost: totalActualCost, status }), 0);
              }
              duration = totalActualHrs; 
          }

          // Zone Aggregation Engine
          let zoneTotal = node.data?.zoneTotal || 0;
          let nodeCount = node.data?.nodeCount || 0;
          let zoneDrift = node.data?.drift || '0h';

          if (node.type === 'zone' || node.type === 'wormhole') {
              const containedNodes = [...processedItems, ...currentExtras].filter(n => {
                  if (n.id === node.id) return false;
                  const padding = 10;
                  return n.position.x >= node.position.x - padding &&
                         n.position.x <= node.position.x + (node.width || 400) + padding &&
                         n.position.y >= node.position.y - padding &&
                         n.position.y <= node.position.y + (node.height || 400) + padding;
              });

              nodeCount = containedNodes.length;
              const totalCost = containedNodes.reduce((sum, n) => sum + (parseFloat(n.data?.actualCost) || parseFloat(n.data?.cost) || 0), 0);
              zoneTotal = totalCost;

              const totalDriftHrs = containedNodes.reduce((sum, n) => {
                  const d = n.data?.timeDrift || '0h';
                  return sum + (parseFloat(d.replace('h','')) || 0);
              }, 0);
              zoneDrift = `${totalDriftHrs > 0 ? '+' : ''}${totalDriftHrs}h`;

              if (Math.abs((node.data?.zoneTotal || 0) - zoneTotal) > 0.1 || node.data?.nodeCount !== nodeCount) {
                  setTimeout(() => onUpdateItem(node.id, { zoneTotal, nodeCount, drift: zoneDrift }), 0);
              }
          }

          return {
              ...node, data: { 
                  ...node.data, 
                  duration, hubData, status, zoneName, timeDrift, costDrift, zoneTotal, nodeCount,
                  projectFinancials, onDeployFixes,
                  onDelete: () => onRemoveItem(node.id), 
                  onUpdate: (id, ups) => onUpdateItem(id, ups) 
              }
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

  }, [items, extraNodes, edges, projectFinancials, harvestBranch, onUpdateItem, onRemoveItem, onDeployFixes, quotedData]);

  // Decoupled AI Logic (Fixed Infinite Loop & Note Sync)
  useEffect(() => {
      const prisms = nodes.filter(n => n.type === 'neuralPrism' && n.data?.hubData);
      
      // AI COPILOT CONTEXT BRIDGE
      window.current_diary_state = { nodes, edges, projectFinancials, quotedData };

      prisms.forEach(prism => {
          const prismId = prism.id;
          const { hubData, projectFinancials: financials, lastAnalyzedHash, status } = prism.data;
          
          // Stable Hash: Include IDs of all connected elements to detect topology changes
          const connectedIds = [
              ...(hubData.workers || []).map(w => w.id),
              ...(hubData.resources || []).map(r => r.id),
              ...(hubData.notes || []).map(n => n.id + (n.data?.text || '')) // Hash text changes too
          ].sort().join(',');

          const currentHash = JSON.stringify({ 
              topology: connectedIds,
              duration: hubData.duration,
              quote: quotedData?.totalRevenue // Only trigger if financial baseline changes
          });
          
          // Only analyze if hash changed 
          if (currentHash !== lastAnalyzedHash) {
              
              clearTimeout(window[`prism_${prismId}`]);
              
              // Immediate: Mark analyzing
              onUpdateItem(prismId, { status: 'analyzing', lastAnalyzedHash: currentHash });

              window[`prism_${prismId}`] = setTimeout(async () => {
                  try {
                      // Unified Topology for AI - STRIPPED for Cost Efficiency
                      const fullTopology = [
                          ...(hubData.workers || []).map(w => ({ id: w.id, name: w.name, role: w.role, duration: w.duration, nodeType: 'staff' })),
                          ...(hubData.resources || []).map(r => ({ id: r.id, name: r.name, type: r.type, quantity: r.quantity, nodeType: r.type || 'equipment' })),
                          ...(hubData.extras || []).map(e => ({ id: e.id, type: e.type, label: e.data?.label || e.label })),
                          ...(hubData.delays || []).map(d => ({ id: d.id, type: 'delay', label: d.data?.label, duration: d.data?.duration, weather: d.data?.weatherType })),
                          ...(hubData.breaks || []).map(b => ({ id: b.id, type: 'break', duration: b.data?.duration })),
                          ...(hubData.notes || []).map(n => ({ id: n.id, type: 'note', text: n.data?.text || n.text }))
                      ];

                      const res = await api.post('/ai/analyze-prism', { 
                          context: { 
                              topology: fullTopology,
                              duration: hubData.duration, 
                              projectFinancials: financials,
                              graphEdges: edges.length,
                              quotedData: quotedData,
                              site_notes: (hubData.notes || []).map(n => n.data?.text).filter(Boolean)
                          },
                          history 
                      });
                      
                      if (res.data) {
                          // Apply all AI-calculated fields and set status to ready
                          onUpdateItem(prismId, { 
                              ...res.data, 
                              status: 'ready' 
                          });
                      } else {
                          onUpdateItem(prismId, { status: 'disconnected' });
                      }
                  } catch (e) {
                      console.error("[Prism] Analysis Failed:", e);
                      onUpdateItem(prismId, { status: 'disconnected' });
                  }
              }, 2000); // Increased debounce to 2s
          }
      });
  }, [nodes, edges.length, history, onUpdateItem, quotedData]);

  const onNodeDragStop = useCallback((event, node) => {
    if (!node.parentId) onUpdateItem(node.id, { position: node.position });
  }, [onUpdateItem]);

  const onConnect = useCallback((params) => { 
    setEdges((eds) => {
        const newEdges = addEdge({ ...params, animated: true }, eds);
        if (onUpdateEdges) onUpdateEdges(newEdges);
        return newEdges;
    }); 
  }, [setEdges, onUpdateEdges]);

  return { nodes, setNodes, onNodesChange, edges, setEdges, onEdgesChange, heatmapActive, setHeatmapActive, showTime, setShowTime, screenToFlowPosition, onNodeDragStop, onConnect };
};
