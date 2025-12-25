import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { 
  ReactFlow, 
  ReactFlowProvider, 
  addEdge, 
  useNodesState, 
  useEdgesState, 
  Controls, 
  Background,
  MiniMap,
  Panel,
  useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Play, Plus, Trash2, Layout, Calendar, List, MoreVertical, Loader2, ArrowLeft, Sparkles, Wand2, HelpCircle, Clipboard, GitFork, Bell, Zap, User, MessageSquare, CheckSquare, FolderOpen, FileText, ArrowRight, X, BrainCircuit, AlertTriangle, MapPin, TrendingUp, Activity, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WorkflowSidebar from './WorkflowSidebar';
import CustomNode from './CustomNode';
import AppIntegrationNode from './AppIntegrationNode';
import DecisionNode from './DecisionNode';
import CustomEdge from './CustomEdge';
import PropertiesPanel from './PropertiesPanel';
import TimelineView from './TimelineView';
import ListView from './ListView';
import LatticePlayer from './LatticePlayer';
import WorkflowHelp from './WorkflowHelp';
import ContextMenu from './ContextMenu';
import ConnectionLine from './ConnectionLine';
import WorkflowCopilot from './WorkflowCopilot';
import { runFullSimulation } from './WorkflowSimulationEngine';
import { api } from '../../utils/api';
import { useNotification } from '../../context/NotificationContext';
import { useDiaryTheme } from '../PaintDiary/ThemeContext';
import PowerHeader from '../ui/PowerHeader';
import AestheticPicker from '../PaintDiary/AestheticPicker';
import { WORKFLOW_TEMPLATES } from './WorkflowTemplates';

const nodeTypes = {
  milestone: CustomNode,
  approval: CustomNode,
  notification: CustomNode,
  taskNode: CustomNode,
  default: CustomNode, // Alias for backward compatibility and to prevent white box glitch
  input: CustomNode,
  output: CustomNode,
  decision: DecisionNode,
  trigger: CustomNode,
  action: CustomNode,
  quoteAction: CustomNode,
  diaryAction: CustomNode,
  resourceAction: CustomNode,
  invoiceNode: AppIntegrationNode,
  safetyNode: AppIntegrationNode,
  resourceNode: AppIntegrationNode,
  diaryNode: AppIntegrationNode,
  quoteNode: AppIntegrationNode,
  forensicNode: AppIntegrationNode,
  delayNode: AppIntegrationNode,
  wormholeNode: AppIntegrationNode,
  mapNode: AppIntegrationNode,
  clientNode: AppIntegrationNode,
  variationNode: AppIntegrationNode,
  projectNode: AppIntegrationNode
};

const edgeTypes = {
  custom: CustomEdge,
};

const getId = () => `node_${new Date().getTime()}`;

const WorkflowBuilderContent = () => {
  const { addNotification } = useNotification();
  const { theme, allThemes, setActiveTheme, activeTheme } = useDiaryTheme();
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [viewMode, setViewMode] = useState('graph');
  const [loading, setLoading] = useState(false);
  const [workflowName, setWorkflowName] = useState('New Workflow');
  const [workflowId, setWorkflowId] = useState(null);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [savedWorkflows, setSavedWorkflows] = useState([]);
  const [showHelp, setShowHelp] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('indigo'); 
  const [meshContext, setMeshContext] = useState({});

  // --- FETCH MESH CONTEXT (FOR PROTOCOL OMNI) ---
  useEffect(() => {
      const fetchMesh = async () => {
          try {
              // Hits our new real-time LearningEngine
              const res = await api.post('/ai/analyze-intelligence', { diaryData: { global: true } });
              setMeshContext(res.data);
          } catch (e) { console.error("Mesh Sync Failure", e); }
      };
      fetchMesh();
  }, []);

  // Selection & Properties
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [staffList, setStaffList] = useState([]);

  // Context Menu
  const [menu, setMenu] = useState(null);

  // Quick Add / Connect
  const connectingNodeId = useRef(null);
  const [quickAddMenu, setQuickAddMenu] = useState(null);

  // Masterpiece States
  const [forensicLens, setForensicLens] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // --- NEURAL TIME MACHINE STATE ---
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isUndoing, setIsUndoing] = useState(false);
  const [ghostNodes, setGhostNodes] = useState(null);
  const [ghostSuggestions, setGhostSuggestions] = useState([]);

  // --- PREDICTIVE GHOSTING ENGINE ---
  useEffect(() => {
      if (!selectedNodeId || isSimulating) {
          setGhostSuggestions([]);
          return;
      }

      const node = nodes.find(n => n.id === selectedNodeId);
      if (!node) return;

      // Logic mapping for suggestions
      const logicMap = {
          projectNode: [
              { type: 'safetyNode', label: 'Safety Pack', offset: { x: 400, y: 0 } },
              { type: 'taskNode', label: 'Site Prep', offset: { x: 0, y: 200 } }
          ],
          taskNode: [
              { type: 'approval', label: 'QC Sign-off', offset: { x: 400, y: 0 } },
              { type: 'invoiceNode', label: 'Progress Claim', offset: { x: 0, y: 200 } }
          ],
          safetyNode: [
              { type: 'taskNode', label: 'Main Works', offset: { x: 0, y: 200 } },
              { type: 'approval', label: 'HSE Audit', offset: { x: 400, y: 0 } }
          ],
          trigger: [
              { type: 'projectNode', label: 'Init Project', offset: { x: 400, y: 0 } },
              { type: 'diaryNode', label: 'Start Log', offset: { x: 0, y: 200 } }
          ],
          decision: [
              { type: 'action', label: 'True Path', offset: { x: 400, y: -100 } },
              { type: 'delayNode', label: 'False Path', offset: { x: 400, y: 100 } }
          ]
      };

      const suggestions = (logicMap[node.type] || [
          { type: 'taskNode', label: 'Next Phase', offset: { x: 400, y: 0 } },
          { type: 'milestone', label: 'Milestone', offset: { x: 0, y: 200 } }
      ]).map((s, i) => ({
          ...s,
          id: `suggest-${node.id}-${i}`,
          position: { x: node.position.x + s.offset.x, y: node.position.y + s.offset.y },
          sourceId: node.id
      }));

      setGhostSuggestions(suggestions);
  }, [selectedNodeId, nodes]);

  const manifestGhost = (suggestion) => {
      const newNodeId = getId();
      const newNode = {
          id: newNodeId,
          type: suggestion.type,
          position: suggestion.position,
          data: { label: suggestion.label, status: 'pending' }
      };
      setNodes(nds => [...nds, newNode]);
      setEdges(eds => [...eds, { id: `e-${suggestion.sourceId}-${newNodeId}`, source: suggestion.sourceId, target: newNodeId, type: 'custom' }]);
      addNotification('success', 'Node Manifested', `AI suggested ${suggestion.label} integrated.`);
      setSelectedNodeId(newNodeId);
  };

  // Capture Snapshots
  useEffect(() => {
      if (isUndoing) return;
      const timeout = setTimeout(() => {
          const snapshot = JSON.stringify({ nodes, edges });
          setHistory(prev => {
              const newHistory = prev.slice(0, historyIndex + 1);
              if (newHistory[newHistory.length - 1] === snapshot) return prev;
              return [...newHistory, snapshot].slice(-100); // Increased buffer
          });
          setHistoryIndex(prev => prev + 1);
      }, 500);
      return () => clearTimeout(timeout);
  }, [nodes, edges]);

  const undo = () => {
      if (historyIndex <= 0) return;
      if (historyIndex === history.length - 1) setGhostNodes([...nodes]); // Set ghost on first rewind
      setIsUndoing(true);
      const prevIndex = historyIndex - 1;
      const { nodes: hNodes, edges: hEdges } = JSON.parse(history[prevIndex]);
      setNodes(hNodes);
      setEdges(hEdges);
      setHistoryIndex(prevIndex);
      setTimeout(() => setIsUndoing(false), 100);
  };

  const redo = () => {
      if (historyIndex >= history.length - 1) return;
      setIsUndoing(true);
      const nextIndex = historyIndex + 1;
      const { nodes: hNodes, edges: hEdges } = JSON.parse(history[nextIndex]);
      setNodes(hNodes);
      setEdges(hEdges);
      setHistoryIndex(nextIndex);
      if (nextIndex === history.length - 1) setGhostNodes(null);
      setTimeout(() => setIsUndoing(false), 100);
  };

  const jumpToHistory = (index) => {
      if (index < history.length - 1 && !ghostNodes) setGhostNodes([...nodes]);
      if (index === history.length - 1) setGhostNodes(null);
      
      setIsUndoing(true);
      const { nodes: hNodes, edges: hEdges } = JSON.parse(history[index]);
      setNodes(hNodes);
      setEdges(hEdges);
      setHistoryIndex(index);
      setTimeout(() => setIsUndoing(false), 100);
  };

  const clearHistoryGhost = () => {
      setGhostNodes(null);
      if (history.length > 0) {
          const { nodes: hNodes, edges: hEdges } = JSON.parse(history[history.length - 1]);
          setNodes(hNodes);
          setEdges(hEdges);
          setHistoryIndex(history.length - 1);
      }
  };

  // --- BRANCHING (SCENARIOS) ---
  const createBranch = () => {
      const branchName = prompt("Enter Scenario Name:", `${workflowName} - Branch Alpha`);
      if (!branchName) return;
      setWorkflowId(null); // Force new save
      setWorkflowName(branchName);
      addNotification('success', 'Logic Branch Created', `Scenario "${branchName}" is now the active workspace.`);
  };

  // --- SIMULATION STATE ---
  const [simulationMode, setSimulationMode] = useState(false);
  const [simulationData, setSimulationData] = useState(null);
  const [showSimPanel, setShowSimPanel] = useState(false);

  // --- PERSISTENCE: LOAD DRAFT ---
  useEffect(() => {
      const savedData = localStorage.getItem('workflow_draft');
      if (savedData) {
          try {
              const { nodes, edges, name, id } = JSON.parse(savedData);
              if (nodes && nodes.length > 0) setNodes(nodes);
              if (edges) setEdges(edges);
              if (name) setWorkflowName(name);
              if (id) setWorkflowId(id);
          } catch (e) { console.error("Failed to load workflow draft", e); }
      }
  }, []);

  // --- PERSISTENCE: AUTO-SAVE ---
  useEffect(() => {
      const timeout = setTimeout(() => {
          if (nodes.length > 0) {
              localStorage.setItem('workflow_draft', JSON.stringify({
                  nodes, edges, name: workflowName, id: workflowId
              }));
          }
      }, 1000);
      return () => clearTimeout(timeout);
  }, [nodes, edges, workflowName, workflowId]);

  // --- LOCAL TEMPLATE LIBRARY (Offline AI) ---
  const LOCAL_TEMPLATES_DATA = WORKFLOW_TEMPLATES;

  const aiTemplates = [
    { category: 'Residential', items: [
        { type: 'res_new_build', label: 'Luxury Master Build' },
        { type: 'renovation_kitchen', label: 'Billion-Dollar Kitchen' },
        { type: 'pool_construction', label: 'Sub-surface Pool' },
        { type: 'roof_replacement', label: 'Structural Roof Arc' },
        { type: 'mega_infrastructure', label: 'Mega Infrastructure Foundation' }
    ]},
    { category: 'Commercial', items: [
        { type: 'comm_fitout', label: 'Executive Tenancy' },
        { type: 'comm_highrise_concrete', label: 'Vertical Core Cycle' },
        { type: 'tender_preparation', label: 'Genesis Tender' }
    ]},
    { category: 'Civil & Infrastructure', items: [
        { type: 'road_infrastructure', label: 'Regional Remediation' },
        { type: 'civil_pipeline', label: 'Water Link Lattice' },
        { type: 'emergency_repair', label: 'Grid Restoration' }
    ]},
    { category: 'Hazardous & Decon', items: [
        { type: 'hazmat_asbestos', label: 'Biohazard Cleanup' },
        { type: 'structural_decon', label: 'Structural Extraction' },
        { type: 'waste_management', label: 'Autonomous Logistics' }
    ]},
    { category: 'Enterprise Ops', items: [
        { type: 'safety_incident', label: 'Forensic Investigation' },
        { type: 'major_procurement', label: 'Strategic Supply' },
        { type: 'qa_defect_loop', label: 'Defect Remediation' },
        { type: 'employee_onboarding', label: 'Personnel Integration' },
        { type: 'site_demobilization', label: 'Terminal Lattice Close' }
    ] }
  ];

  const handleApplyTemplate = (type) => {
      const template = WORKFLOW_TEMPLATES[type];
      if (template) {
          setNodes(JSON.parse(JSON.stringify(template.nodes)));
          setEdges(JSON.parse(JSON.stringify(template.edges)));
          addNotification('success', 'Lattice Integrated', 'Architectural template successfully deployed.');
          setTimeout(() => {
              if (reactFlowInstance) reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
          }, 100);
      }
  };

  const navigate = useNavigate();

  // --- STATS MEMO ---
  const stats = useMemo(() => [
    { label: 'Active Nodes', value: nodes.length, color: 'text-indigo-400' },
    { label: 'Connections', value: edges.length, color: 'text-emerald-400' },
    { label: 'Smart Configs', value: nodes.filter(n => n.data.config && Object.keys(n.data.config).length > 0).length, color: 'text-amber-400' },
    { label: 'Risk Points', value: nodes.filter(n => n.data.simulationError).length, color: 'text-rose-400' }
  ], [nodes, edges]);

  // --- MASTER ARCHITECT KEYBOARD SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const key = e.key.toLowerCase();
      if (key === 's') { e.preventDefault(); saveWorkflow(); }
      if (key === 'p') { e.preventDefault(); runWorkflow(); }
      if (key === 'f') { e.preventDefault(); setForensicLens(prev => !prev); }
      if (key === 'c') { e.preventDefault(); setCopilotOpen(prev => !prev); }
      if (key === 'delete' || key === 'backspace') {
          if (selectedNodeId) onDeleteNode(selectedNodeId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, isSimulating, forensicLens, copilotOpen]);

  // --- LIVE CIRCUIT SIMULATOR ENGINE ---
  const simulateLogicFlow = useCallback(async () => {
      if (nodes.length === 0) return;
      
      setIsSimulating(true);
      addNotification('info', 'Simulator Initialized', 'Injecting neural pulse into circuit...');

      // Reset all nodes/edges from previous simulation states
      setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, simulationError: false, isSimulating: false } })));
      setEdges(eds => eds.map(e => ({ ...e, animated: true, data: { ...e.data, isActive: false } })));

      // Helper to find start nodes (triggers or nodes with no incoming edges)
      const startNodes = nodes.filter(n => 
          n.type === 'trigger' || n.type === 'input' || !edges.some(e => e.target === n.id)
      );

      if (startNodes.length === 0 && nodes.length > 0) {
          addNotification('error', 'Circuit Error', 'No entry point detected in the logic graph.');
          setIsSimulating(false);
          return;
      }

      // Recursive traversal with delay for visual effect
      const traverse = async (nodeId, visited = new Set()) => {
          if (visited.has(nodeId)) return; // Prevent infinite loops in simulation
          visited.add(nodeId);

          const node = nodes.find(n => n.id === nodeId);
          if (!node) return;

          // 1. Mark node as active in simulation
          setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, isSimulating: true } } : n));
          await new Promise(resolve => setTimeout(resolve, 800));

          // 2. Validate Node Configuration
          let hasError = false;
          let errorMessage = '';

          if (node.type === 'invoiceNode' && !node.data.config?.amount) {
              hasError = true;
              errorMessage = 'Invoice node missing contract value.';
          } else if (node.type === 'decision') {
              const hasYes = edges.some(e => e.source === node.id && e.sourceHandle === 'true');
              const hasNo = edges.some(e => e.source === node.id && e.sourceHandle === 'false');
              if (!hasYes || !hasNo) {
                  hasError = true;
                  errorMessage = 'Logic Gate missing binary exit paths.';
              }
          }

          if (hasError) {
              setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, simulationError: true, isSimulating: false } } : n));
              addNotification('error', 'Short Circuit Detected', errorMessage);
              return; // Stop this branch
          }

          // 3. Mark node as complete and pulse outgoing edges
          setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, isSimulating: false } } : n));
          
          const outgoingEdges = edges.filter(e => e.source === nodeId);
          for (const edge of outgoingEdges) {
              setEdges(eds => eds.map(e => e.id === edge.id ? { ...e, data: { ...(e.data || {}), isActive: true } } : e));
              await new Promise(resolve => setTimeout(resolve, 400));
              await traverse(edge.target, visited);
          }
      };

      for (const startNode of startNodes) {
          await traverse(startNode.id);
      }

      setIsSimulating(false);
      addNotification('success', 'Simulation Complete', 'Operational lattice integrity verified.');
  }, [nodes, edges, addNotification, setNodes, setEdges]);

  // Load Staff for assignment
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await api.get('/staff');
        // Ensure staffList is always an array
        const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
        setStaffList(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load staff", err);
        setStaffList([
          { id: '1', name: 'John Doe' },
          { id: '2', name: 'Jane Smith' },
          { id: '3', name: 'Mike Johnson' }
        ]);
      }
    };
    fetchStaff();
  }, []);

  // Fetch Workflows for Load Modal
  const fetchWorkflows = async () => {
      try {
          const res = await api.get('/workflows');
          setSavedWorkflows(Array.isArray(res.data) ? res.data : []);
          setShowLoadModal(true);
      } catch (err) {
          console.error("Failed to load workflows", err);
          addNotification('error', 'Load Error', 'Could not fetch saved workflows.');
      }
  };

  // Initial Fetch for Wormhole Logic
  useEffect(() => {
      const initFetch = async () => {
          try {
              const res = await api.get('/workflows');
              setSavedWorkflows(Array.isArray(res.data) ? res.data : []);
          } catch (e) { console.error("Background workflow fetch failed", e); }
      };
      initFetch();
  }, []);

  const loadWorkflow = (wf) => {
      setWorkflowName(wf.title);
      setWorkflowId(wf.id);
      setNodes(wf.nodes || []);
      setEdges(wf.edges || []);
      setShowLoadModal(false);
      addNotification('info', 'Workflow Loaded', `Active canvas: ${wf.title}`);
  };

  const deleteWorkflow = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete workflow "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/workflows/${id}`);
      addNotification('success', 'Workflow Deleted', `"${title}" removed from library.`);
      fetchWorkflows(); // Re-fetch to update the list
      // If the deleted workflow was the currently loaded one, clear it
      if (workflowId === id) {
        setWorkflowId(null);
        setWorkflowName('New Workflow');
        setNodes([]);
        setEdges([]);
      }
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      addNotification('error', 'Delete Failed', 'Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  // Blocked Status Logic (Enhanced for CustomEdge)
  useEffect(() => {
      setNodes((nds) => {
          return nds.map(node => {
              const incomingEdges = edges.filter(e => e.target === node.id);
              let isBlocked = false;
              
              incomingEdges.forEach(edge => {
                  const sourceNode = nds.find(n => n.id === edge.source);
                  if (sourceNode && sourceNode.data.status !== 'completed') {
                      isBlocked = true;
                  }
              });

              if (node.data.status === 'error' && !isBlocked) {
                   return { ...node, data: { ...node.data, status: 'pending' } };
              }
              if (node.data.status !== 'completed' && node.data.status !== 'error' && isBlocked) {
                   return { ...node, data: { ...node.data, status: 'error' } };
              }
              return node;
          });
      });

      // Update Edges to reflect status (for animation)
      setEdges((eds) => 
        eds.map(edge => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const isBlocked = sourceNode && sourceNode.data.status !== 'completed';
            const isActive = sourceNode && sourceNode.data.status === 'in-progress';
            
            return { 
                ...edge, 
                type: 'custom',
                data: { ...(edge.data || {}), isBlocked, isActive }
            };
        })
      );

  }, [nodes.map(n => n.data.status).join(',')]); 

  const onConnect = useCallback((params) => {
      // 1. Smart Validation
      if (params.source === params.target) {
          addNotification('warning', 'Invalid Connection', 'Cannot connect a node to itself.');
          return;
      }

      // 2. Decision Node Logic Auto-Labeling
      // We need to check the source handle ID to determine if it's a "Yes" or "No" path
      let label = '';
      let style = { strokeWidth: 2 };
      
      // If connecting from a Decision Node handle
      if (params.sourceHandle === 'true') {
          label = 'YES';
          style = { stroke: '#22c55e', strokeWidth: 2 }; 
      } else if (params.sourceHandle === 'false') {
          label = 'NO';
          style = { stroke: '#ef4444', strokeWidth: 2 };
      }

      // 3. Create Smart Edge
      const newEdge = {
          ...params,
          type: 'custom',
          animated: true,
          label,
          style,
          data: { 
              sourceHandleId: params.sourceHandle, // Store for CustomEdge visualization
              isBlocked: false,
              isActive: false
          }
      };

      setEdges((eds) => addEdge(newEdge, eds));
      
      // 4. Feedback
      const connectionType = label ? `Logic Path (${label})` : 'Standard Link';
      addNotification('success', 'Smart Link Created', `${connectionType} established.`);
  }, [addNotification]);

  const onConnectStart = useCallback((_, { nodeId }) => {
    connectingNodeId.current = nodeId;
  }, []);

  const onConnectEnd = useCallback(
    (event) => {
      if (!connectingNodeId.current) return;

      const targetIsPane = event.target.classList.contains('react-flow__pane');

      if (targetIsPane && reactFlowInstance) {
        const { clientX, clientY } = 'changedTouches' in event ? event.changedTouches[0] : event;
        const position = reactFlowInstance.screenToFlowPosition({
            x: clientX,
            y: clientY,
        });
        
        // --- MASTERPIECE: BOUNDARY CHECK FOR POPUP ---
        const menuWidth = 220;
        const menuHeight = 250;
        const x = Math.min(clientX, window.innerWidth - menuWidth / 2 - 20);
        const y = Math.min(clientY, window.innerHeight - menuHeight / 2 - 20);

        setQuickAddMenu({
            x: Math.max(menuWidth / 2 + 20, x),
            y: Math.max(menuHeight / 2 + 20, y),
            flowPosition: position,
            sourceId: connectingNodeId.current
        });
      }
      connectingNodeId.current = null;
    },
    [reactFlowInstance],
  );

  const handleQuickAdd = (type, label) => {
      if (!quickAddMenu) return;

      const newNode = {
        id: getId(),
        type,
        position: quickAddMenu.flowPosition,
        data: { label, status: 'pending' },
      };

      setNodes((nds) => nds.concat(newNode));
      setEdges((eds) =>
        eds.concat({ id: `e${quickAddMenu.sourceId}-${newNode.id}`, source: quickAddMenu.sourceId, target: newNode.id, type: 'custom' })
      );
      
      setQuickAddMenu(null);
      setSelectedNodeId(newNode.id);
      addNotification('success', 'Node Added', `${label} node created.`);
  };

  const handleTapAddNode = (type, label) => {
      if (!reactFlowInstance) return;
      const position = reactFlowInstance.screenToFlowPosition({
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
      });
      
      const newNode = {
        id: getId(),
        type,
        position,
        data: { label, status: 'pending' },
      };

      setNodes((nds) => nds.concat(newNode));
      if (window.innerWidth < 1024) setShowSidebar(false);
      addNotification('success', 'Node Added', `${label} node placed on canvas.`);
  };

  const onPaneContextMenu = useCallback(
    (event) => {
      event.preventDefault();
      setMenu({
        x: event.clientX,
        y: event.clientY,
      });
    },
    [setMenu],
  );

  const handleContextAddNode = (type, label) => {
      if (!menu || !reactFlowInstance) return;
      
      const position = reactFlowInstance.screenToFlowPosition({
        x: menu.x,
        y: menu.y,
      });

      const newNode = {
        id: getId(),
        type,
        position,
        data: { label, status: 'pending' },
      };

      setNodes((nds) => nds.concat(newNode));
      setMenu(null);
      addNotification('success', 'Node Added', `${label} node created.`);
  }

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('application/reactflow-label');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      if (reactFlowInstance) {
          const position = reactFlowInstance.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          });
          
          const newNode = {
            id: getId(),
            type,
            position,
            data: { label: `${label}`, status: 'pending' },
          };
    
          setNodes((nds) => nds.concat(newNode));
          setSelectedNodeId(newNode.id);
          addNotification('success', 'Node Dropped', `${label} node placed.`);
      }
    },
    [reactFlowInstance],
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNodeId(node.id);
    setQuickAddMenu(null); // Close menu if clicking a node
    setMenu(null);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setQuickAddMenu(null);
    setMenu(null);
  }, []);

  // Double Click to add node
  const onPaneDoubleClick = useCallback((event) => {
      if(reactFlowInstance) {
          const position = reactFlowInstance.screenToFlowPosition({
              x: event.clientX,
              y: event.clientY,
          });
           const newNode = {
            id: getId(),
            type: 'taskNode',
            position,
            data: { label: `New Node`, status: 'pending' },
          };
          setNodes((nds) => nds.concat(newNode));
          setSelectedNodeId(newNode.id);
          addNotification('success', 'Quick Node', 'Standard task node created.');
      }
  }, [reactFlowInstance]);

  const updateNodeData = (id, newData) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...newData } };
        }
        return node;
      })
    );
  };

  // --- ULTIMATE: RECURSIVE DATA PROPAGATION ENGINE ---
  useEffect(() => {
      if (isSimulating) return; // Don't propagate during active simulation to avoid loops

      setNodes(nds => {
          const newNodes = [...nds];
          let changed = false;

          // Process each node and propagate data to its targets
          edges.forEach(edge => {
              const source = newNodes.find(n => n.id === edge.source);
              const target = newNodes.find(n => n.id === edge.target);

              if (source && target) {
                  // 1. Propagate Temporal Data (Cumulative Duration)
                  const sourceDuration = parseInt(source.data.config?.duration || 0);
                  const currentTargetStart = target.data.config?.calculatedStart || 0;
                  
                  if (currentTargetStart !== sourceDuration) {
                      target.data.config = { ...target.data.config, calculatedStart: sourceDuration };
                      changed = true;
                  }

                  // 2. Propagate Project Context (Smart Linking)
                  if (source.type === 'projectNode' && source.data.config?.projectId) {
                      const pid = source.data.config.projectId;
                      const pname = source.data.config.projectName;
                      // Target supports project context?
                      if (['invoiceNode', 'diaryNode', 'quoteNode', 'resourceNode', 'safetyNode', 'variationNode'].includes(target.type)) {
                          if (target.data.config?.projectId !== pid) {
                              target.data.config = { ...target.data.config, projectId: pid, projectName: pname };
                              // Also set client if target is invoice/quote and source has no client override? 
                              // Actually project usually implies client.
                              changed = true;
                          }
                      }
                  }

                  // 3. Propagate Client Context
                  if (source.type === 'clientNode' && source.data.config?.clientId) {
                      const cid = source.data.config.clientId;
                      const cname = source.data.config.clientName;
                      if (['invoiceNode', 'quoteNode', 'projectNode'].includes(target.type)) {
                          if (target.data.config?.clientId !== cid) {
                              target.data.config = { ...target.data.config, clientId: cid, client: cname };
                              changed = true;
                          }
                      }
                  }

                  // Propagate status (Auto-block if source not done)
                  if (source.data.status !== 'completed' && target.data.status !== 'error') {
                      // Optionally auto-set to blocked/error if needed
                  }
              }
          });

          return changed ? [...newNodes] : nds;
      });
  }, [edges, nodes.map(n => JSON.stringify(n.data.config)).join(',')]);

  const onDeleteNode = (id) => {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
      setSelectedNodeId(null);
      addNotification('warning', 'Node Deleted', 'Item removed from workflow.');
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  const saveWorkflow = async (silent = false) => {
    setLoading(true);
    try {
      const workflowData = {
        title: workflowName,
        nodes,
        edges,
        status: 'active'
      };

      let res;
      let newId = workflowId;

      if (workflowId) {
        res = await api.put(`/workflows/${workflowId}`, workflowData);
      } else {
        res = await api.post('/workflows', workflowData);
        newId = res.data.id || res.data._id;
        setWorkflowId(newId);
      }
      
      if (!silent) {
          alert('Workflow saved successfully!'); // Keep alert for direct feedback or remove if notify is enough
          addNotification('success', 'Workflow Saved', `"${workflowName}" is secure.`);
      }
      return newId;
    } catch (error) {
      console.error('Failed to save workflow:', error);
      addNotification('error', 'Save Failed', 'Could not save workflow. Check connection.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const runWorkflow = async () => {
      if (nodes.length === 0) return;
      
      await saveWorkflow(true);
      setIsSimulating(true);
      setSimulationData(null); // Clear old results
      addNotification('info', 'Neural Pulse Injection', 'Commencing deep circuit validation and temporal projection...');

      // Reset states
      setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, simulationError: false, isSimulating: false, simulationResult: null } })));
      setEdges(eds => eds.map(e => ({ ...e, animated: true, data: { ...e.data, isActive: false } })));

      const startNodes = nodes.filter(n => 
          n.type === 'trigger' || n.type === 'input' || !edges.some(e => e.target === n.id)
      );

      // --- ADVANCED ANALYTICS AGGREGATOR ---
      const results = {
          nodes: {},
          stats: {
              totalDuration: 0,
              totalCost: 0,
              riskPercentage: 0,
              bottlenecks: 0,
              path: []
          }
      };

      if (startNodes.length === 0) {
          addNotification('error', 'Circuit Failure', 'No architectural entry point detected.');
          setIsSimulating(false);
          return;
      }

      const traverse = async (nodeId, currentTime = 0, currentCost = 0, visited = new Set()) => {
          if (visited.has(nodeId)) return;
          visited.add(nodeId);

          const node = nodes.find(n => n.id === nodeId);
          if (!node) return;

          // Activate node visually
          setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, isSimulating: true } } : n));
          results.stats.path.push(nodeId);
          
          await new Promise(resolve => setTimeout(resolve, 600));

          let duration = parseInt(node.data.config?.duration || (node.type === 'delayNode' ? 24 : 4));
          let cost = parseInt(node.data.config?.amount || node.data.config?.value || 0);
          
          let nodeIssues = [];
          let nodeSuggestions = [];

          // DEEP LOGIC VALIDATION
          if (node.type === 'invoiceNode' && !node.data.config?.amount) {
              nodeIssues.push({ level: 'error', message: 'Financial sink detected: No amount set.' });
              results.stats.bottlenecks++;
          }
          if (node.type === 'safetyNode' && !node.data.config?.template) {
              nodeIssues.push({ level: 'warning', message: 'Compliance risk: SWMS template missing.' });
          }
          if (node.type === 'decision') {
              const hasTrue = edges.some(e => e.source === node.id && e.sourceHandle === 'true');
              const hasFalse = edges.some(e => e.source === node.id && e.sourceHandle === 'false');
              if (!hasTrue || !hasFalse) {
                  nodeIssues.push({ level: 'error', message: 'Logic Loophole: Binary paths incomplete.' });
              }
          }

          const nodeResult = {
              startTime: currentTime,
              endTime: currentTime + duration,
              costImpact: cost,
              status: nodeIssues.some(i => i.level === 'error') ? 'red' : (nodeIssues.length > 0 ? 'yellow' : 'green'),
              issues: nodeIssues,
              suggestions: nodeSuggestions
          };

          results.nodes[nodeId] = nodeResult;
          results.stats.totalDuration = Math.max(results.stats.totalDuration, nodeResult.endTime);
          results.stats.totalCost += cost;

          // Visual status update
          setNodes(nds => nds.map(n => n.id === nodeId ? { 
              ...n, 
              data: { 
                  ...n.data, 
                  isSimulating: false,
                  simulationError: nodeResult.status === 'red',
                  simulationResult: nodeResult
              } 
          } : n));

          const outgoingEdges = edges.filter(e => e.source === nodeId);
          for (const edge of outgoingEdges) {
              // Mark edge as active
              setEdges(eds => eds.map(e => e.id === edge.id ? { ...e, animated: true, data: { ...(e.data || {}), isActive: true } } : e));
              await new Promise(resolve => setTimeout(resolve, 300));
              await traverse(edge.target, currentTime + duration, currentCost + cost, visited);
          }
      };

      // RUN TEMPORAL SCAN
      for (const startNode of startNodes) {
          await traverse(startNode.id);
      }

      // FINAL SCORE CALCULATION
      const errorCount = Object.values(results.nodes).filter(n => n.status === 'red').length;
      results.stats.riskPercentage = Math.round((errorCount / nodes.length) * 100) || 0;

      setSimulationData(results);
      setIsSimulating(false);
      
      if (errorCount > 0) {
          addNotification('warning', 'Lattice Integrity Compromised', `Found ${errorCount} logic faults. Consult Neural Co-pilot for patches.`);
      } else {
          addNotification('success', 'Masterpiece Lattice Verified', 'Simulation successful. Operational trajectory optimal.');
      }
  };

  // Poll for updates if any node is in-progress
  useEffect(() => {
      const hasActiveNodes = nodes.some(n => n.data.status === 'in-progress');
      if (!hasActiveNodes || !workflowId) return;

      const interval = setInterval(async () => {
          try {
              const res = await api.get(`/workflows/${workflowId}`);
              // Only update if changed to avoid jitter
              setNodes(prev => {
                  const newNodes = res.data.nodes;
                  if (JSON.stringify(prev) !== JSON.stringify(newNodes)) {
                      return newNodes;
                  }
                  return prev;
              });
          } catch (err) {
              console.error("Polling error", err);
          }
      }, 2000);

      return () => clearInterval(interval);
  }, [workflowId, nodes]); // Dependency on nodes triggers re-eval when status changes

  // Quick Add Menu Items
  const quickAddItems = [
      { type: 'taskNode', label: 'Task', icon: Clipboard, color: 'text-blue-400' },
      { type: 'trigger', label: 'Trigger', icon: Zap, color: 'text-amber-400' },
      { type: 'action', label: 'Action', icon: Play, color: 'text-indigo-400' },
      { type: 'decision', label: 'Logic', icon: GitFork, color: 'text-orange-400' },
      { type: 'invoiceNode', label: 'Invoice', icon: FileText, color: 'text-emerald-400' },
      { type: 'safetyNode', label: 'Safety', icon: CheckSquare, color: 'text-rose-400' },
      { type: 'resourceNode', label: 'Resource', icon: User, color: 'text-amber-400' },
      { type: 'diaryNode', label: 'Diary', icon: Calendar, color: 'text-cyan-400' },
      { type: 'wormholeNode', label: 'Wormhole', icon: Zap, color: 'text-fuchsia-400' },
      { type: 'mapNode', label: 'Geofence', icon: MapPin, color: 'text-blue-400' },
      { type: 'clientNode', label: 'Client Hub', icon: User, color: 'text-indigo-400' },
      { type: 'variationNode', label: 'Variation', icon: TrendingUp, color: 'text-emerald-500' },
  ];

  const resumeNode = (id) => {
      setNodes((nds) => 
        nds.map((node) => {
            if (node.id === id) {
                return { ...node, data: { ...node.data, status: 'pending' } };
            }
            return node;
        })
      );
  };

  // --- ADVANCED SIMULATION HANDLER ---
  const startAdvancedSimulation = async () => {
      if (nodes.length === 0) return;
      
      setLoading(true);
      addNotification('info', 'Simulation Initialized', 'Gathering telemetry from workflow circuit...');
      
      setTimeout(() => {
          const results = runFullSimulation(nodes, edges);
          setSimulationData(results);
          setSimulationMode(true);
          setShowSimPanel(true);
          
          // Apply visual overlays to nodes
          setNodes(nds => nds.map(n => ({
              ...n,
              data: {
                  ...n.data,
                  simulationResult: results.nodes[n.id]
              }
          })));

          // Highlight Critical Path Edges
          setEdges(eds => eds.map(e => ({
              ...e,
              animated: true,
              style: results.stats.path.includes(e.source) && results.stats.path.includes(e.target)
                  ? { stroke: '#3b82f6', strokeWidth: 4, filter: 'drop-shadow(0 0 8px #3b82f6)' }
                  : { stroke: '#1e293b', strokeWidth: 2, opacity: 0.3 }
          })));

          addNotification('success', 'Simulation Complete', 'Predictive diagnostic report generated.');
          setLoading(false);
      }, 1200);
  };

  const closeSimulation = () => {
      setSimulationMode(false);
      setSimulationData(null);
      setShowSimPanel(false);
      setNodes(nds => nds.map(n => ({
          ...n,
          data: {
              ...n.data,
              simulationResult: null
          }
      })));
      setEdges(eds => eds.map(e => ({
          ...e,
          style: { strokeWidth: 2, stroke: '#64748b' },
          opacity: 1
      })));
  };

  // --- COPILOT GRAPH MODIFICATION HANDLER ---
  const handleCopilotCommand = (cmdData) => {
      if (!cmdData) return;

      const { suggestedActions } = cmdData;
      if (!suggestedActions || !Array.isArray(suggestedActions)) return;

      suggestedActions.forEach(action => {
          switch (action.type) {
              case 'replace_graph':
                  if (action.nodes) setNodes(action.nodes);
                  if (action.edges) setEdges(action.edges);
                  if (action.name) setWorkflowName(action.name);
                  addNotification('success', 'Neural Lattice Generated', 'Pinnacle AI has architected a new workflow circuit.');
                  break;
              case 'add_nodes_edges':
                  if (action.nodes) setNodes(nds => [...nds, ...action.nodes]);
                  if (action.edges) setEdges(eds => [...eds, ...action.edges]);
                  addNotification('success', 'Neural Lattice Updated', 'Copilot has integrated new logic modules.');
                  break;
              case 'apply_fix':
                  if (action.nodeId && action.updates) {
                      setNodes(nds => nds.map(n => n.id === action.nodeId ? { ...n, data: { ...n.data, ...action.updates } } : n));
                      addNotification('success', 'Logic Repaired', `Copilot has patched node: ${action.nodeId}`);
                  }
                  break;
              case 'clear_graph':
                  setNodes([]);
                  setEdges([]);
                  addNotification('warning', 'Lattice Deconstructed', 'Canvas cleared via neural command.');
                  break;
              case 'set_workflow_name':
                  if (action.name) setWorkflowName(action.name);
                  break;
              default:
                  console.warn("Unknown copilot action:", action.type);
          }
      });

      // Auto-fit after AI changes
      setTimeout(() => {
          if (reactFlowInstance) reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
      }, 200);
  };

  return (
    <div className="flex h-[calc(100vh-80px)] w-full overflow-hidden bg-slate-950 text-slate-200 relative">
      {/* LOADING OVERLAY */}
      {aiLoading && (
        <div className="absolute inset-0 z-[999] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in">
           <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
              <Loader2 size={48} className="text-indigo-500 animate-spin relative z-10" />
           </div>
           <h2 className="mt-6 text-xl font-black text-white uppercase tracking-wider">Architecting Workflow...</h2>
           <p className="text-gray-400 text-sm mt-2 font-medium">Pinnacle AI is designing your automation logic</p>
        </div>
      )}

      <style>{`
        @keyframes dashdraw {
          from { stroke-dashoffset: 10; }
          to { stroke-dashoffset: 0; }
        }
        .react-flow__handle-connecting {
            box-shadow: 0 0 0 6px rgba(99, 102, 241, 0.4);
            background-color: #6366f1 !important;
            border-color: white !important;
            transition: all 0.2s;
        }
        .react-flow__handle-valid {
             background-color: #22c55e !important;
             box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.4);
        }
        .react-flow__node, .react-flow__node-default, .react-flow__node-taskNode {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            outline: none !important;
        }
        .react-flow__node.selected {
            box-shadow: none !important;
        }
      `}</style>
      
      {/* MOBILE BACKDROP */}
      {showSidebar && (
        <div 
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
            onClick={() => setShowSidebar(false)}
        />
      )}

      {/* RESPONSIVE SIDEBAR WRAPPER */}
      <div className={`
          fixed inset-y-0 left-0 z-50 h-full shadow-2xl transition-transform duration-300
          lg:relative lg:translate-x-0 lg:z-auto
          ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
      `}>
          <WorkflowSidebar onNodeClick={handleTapAddNode} setShowSidebar={setShowSidebar} />
          {/* Mobile Close Button */}
          <button 
            onClick={() => setShowSidebar(false)} 
            className="absolute top-4 right-4 p-2 bg-slate-800 text-slate-400 rounded-full lg:hidden hover:text-white hover:bg-slate-700 z-50 shadow-lg border border-white/10"
          >
            <X size={16} />
          </button>
      </div>
      
      <div className="flex-1 flex flex-col relative w-full">
        {/* Header Toolbar */}
        <div className="h-16 border-b border-white/5 bg-slate-900/50 backdrop-blur flex items-center justify-between px-4 md:px-6 z-10">
          <div className="flex items-center gap-3 md:gap-4">
             {/* Mobile Sidebar Toggle */}
             <button onClick={() => setShowSidebar(true)} className="lg:hidden p-2 rounded-lg bg-slate-800 text-indigo-400 hover:text-white transition-colors">
               <List size={20} />
             </button>

             <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
               <ArrowLeft size={20} />
             </button>
            <div className="flex flex-col">
              <input 
                type="text" 
                value={workflowName} 
                onChange={(e) => setWorkflowName(e.target.value)}
                className="bg-transparent text-xl font-bold text-white focus:outline-none focus:ring-0 rounded px-0 transition-all placeholder:text-slate-600"
                placeholder="Workflow Name"
              />
              <span className="text-xs text-slate-500 font-medium font-mono">
                {nodes.length} nodes • {edges.length} edges
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
             {/* Pulse Simulation Button */}
             <button 
                onClick={runWorkflow}
                disabled={isSimulating}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg border transition-all ${isSimulating ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400 animate-pulse' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white hover:shadow-[0_0_20px_#10b981]'}`}
                title="Inject Neural Pulse (Simulate Flow)"
              >
                <Zap size={16} fill={isSimulating ? "currentColor" : "none"} />
                <span className="text-xs font-black uppercase tracking-[0.2em]">{isSimulating ? 'PULSING...' : 'PULSE'}</span>
              </button>

             {/* Simulation Toggle Button */}
             <button 
                onClick={simulationMode ? closeSimulation : startAdvancedSimulation}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg border transition-all ${simulationMode ? 'bg-amber-600/20 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white'}`}
                title="Run Advanced Simulation"
              >
                <Activity size={16} />
                <span className="text-xs font-black uppercase tracking-[0.2em]">{simulationMode ? 'EXIT SIM' : 'SIMULATE'}</span>
              </button>

             {/* MASTERPIECE: CO-PILOT TOGGLE */}
             <button 
                onClick={() => setCopilotOpen(!copilotOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${copilotOpen ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_15px_#6366f1]' : 'bg-slate-800/50 border-white/10 text-slate-400 hover:text-white'}`}
                title="Neural Co-pilot"
              >
                <BrainCircuit size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Co-pilot</span>
              </button>

             {/* TIME MACHINE CONTROLS */}
             <div className="h-8 w-px bg-white/10 mx-1 hidden xl:block" />
             <div className="hidden xl:flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                <button onClick={undo} disabled={historyIndex <= 0} className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white disabled:opacity-20 transition-all"><ArrowLeft size={14} /></button>
                
                <div className="flex flex-col items-center px-3 min-w-[100px]">
                    <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Temporal_Scrub</span>
                    <input 
                        type="range" min="0" max={Math.max(0, history.length - 1)} value={historyIndex} 
                        onChange={(e) => jumpToHistory(parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
                    />
                </div>

                <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white disabled:opacity-20 transition-all"><ArrowRight size={14} /></button>
                
                {ghostNodes && (
                    <button 
                        onClick={clearHistoryGhost}
                        className="ml-2 px-2 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-md text-[8px] font-black uppercase tracking-widest animate-pulse"
                    >
                        Reset Timeline
                    </button>
                )}
             </div>

             <button 
                onClick={createBranch}
                className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-400 hover:text-indigo-400 transition-all"
                title="Branch Scenario"
             >
                <GitFork size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Branch</span>
             </button>

             {/* MASTERPIECE: FORENSIC LENS TOGGLE */}
             <button 
                onClick={() => {
                    setForensicLens(!forensicLens);
                    addNotification(forensicLens ? 'info' : 'warning', forensicLens ? 'Standard View' : 'Forensic Mode Active', forensicLens ? 'Neural filters deactivated.' : 'Financial risk analysis initialized.');
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${forensicLens ? 'bg-violet-600 border-violet-400 text-white shadow-[0_0_15px_#8b5cf6]' : 'bg-slate-800/50 border-white/10 text-slate-400 hover:text-white'}`}
                title="Forensic Risk Lens"
              >
                <AlertTriangle size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Forensic</span>
              </button>

             {/* Help Button */}
             <button 
                onClick={() => setShowHelp(true)}
                className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
                title="Help Guide"
              >
                <HelpCircle size={20} />
              </button>

            {/* ARCHITECTURAL LAYOUT ENGINE */}
            <div className="relative group">
                <button 
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-lg font-bold text-sm transition-all border border-indigo-500/30 shadow-lg shadow-indigo-500/10"
                    title="Change Lattice Geometry"
                >
                    <Wand2 size={16} />
                    Lattice Geometry
                </button>
                
                {/* Dropdown Menu - EXPANDED TO 8 MODES */}
                <div className="absolute top-full right-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_40px_80px_rgba(0,0,0,0.8)] p-3 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all z-[100]">
                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-3 py-2 border-b border-white/5 mb-2 flex justify-between items-center">
                        <span>Select Architecture</span>
                        <Sparkles size={10} className="text-amber-400" />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-1 max-h-[450px] overflow-y-auto custom-scrollbar pr-1">
                        {[
                            { id: 'vertical', label: 'Layered Flow', theme: 'indigo', icon: Layout, desc: 'Vertical logical hierarchy' },
                            { id: 'horizontal', label: 'Neural Pipeline', theme: 'cyan', icon: ArrowRight, desc: 'Horizontal project trajectory' },
                            { id: 'radial', label: 'Command Ring', theme: 'violet', icon: Target, desc: 'Circular node distribution' },
                            { id: 'organic', label: 'Balanced Matrix', theme: 'amber', icon: GitFork, desc: 'Symmetric cluster pattern' },
                            { id: 'star', label: 'Nexus Star', theme: 'solar', icon: Sparkles, desc: 'Centralized core with limbs' },
                            { id: 'grid', label: 'Executive Grid', theme: 'emerald', icon: CheckSquare, desc: 'High-density matrix' },
                            { id: 'tree', label: 'Decision Tree', theme: 'rose', icon: GitFork, desc: 'Binary branching architecture' },
                            { id: 'relay', label: 'Dual Relay', theme: 'indigo', icon: Activity, desc: 'Parallel execution tracks' }
                        ].map((mode) => (
                            <button
                                key={mode.id}
                                onClick={() => {
                                    setCurrentTheme(mode.theme);
                                    const applyLayout = (nds, eds, type) => {
                                        const nodeWidth = 350;
                                        const nodeHeight = 250;
                                        const gap = 180;
                                        const levels = {};
                                        const visited = new Set();
                                        
                                        const assignLevel = (nodeId, level) => {
                                            if (visited.has(nodeId)) {
                                                levels[nodeId] = Math.max(levels[nodeId] || 0, level);
                                                return;
                                            }
                                            visited.add(nodeId);
                                            levels[nodeId] = level;
                                            eds.filter(e => e.source === nodeId).forEach(e => assignLevel(e.target, level + 1));
                                        };
                                        nds.filter(n => !eds.some(e => e.target === n.id)).forEach(n => assignLevel(n.id, 0));
                                        nds.forEach(n => { if (levels[n.id] === undefined) levels[n.id] = 0; });

                                        const levelGroups = {};
                                        Object.entries(levels).forEach(([id, lvl]) => {
                                            if (!levelGroups[lvl]) levelGroups[lvl] = [];
                                            levelGroups[lvl].push(id);
                                        });

                                        const newNodes = nds.map(node => {
                                            const level = levels[node.id];
                                            const index = levelGroups[level].indexOf(node.id);
                                            const total = levelGroups[level].length;
                                            let pos = { x: 0, y: 0 };

                                            switch (type) {
                                                case 'horizontal':
                                                    pos = { x: level * (nodeWidth + gap), y: (index - (total - 1) / 2) * (nodeHeight + gap / 2) };
                                                    break;
                                                case 'radial':
                                                    const angle = (index / total) * 2 * Math.PI + (level * 0.5);
                                                    const radius = level * 700 + 400;
                                                    pos = { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
                                                    break;
                                                case 'star':
                                                    const starAngle = (index / total) * 2 * Math.PI;
                                                    const starRadius = level === 0 ? 0 : 800;
                                                    pos = { x: Math.cos(starAngle) * starRadius, y: Math.sin(starAngle) * starRadius + (level * 300) };
                                                    break;
                                                case 'grid':
                                                    const cols = Math.ceil(Math.sqrt(nds.length));
                                                    const idx = nds.findIndex(n => n.id === node.id);
                                                    pos = { x: (idx % cols) * (nodeWidth + gap / 2), y: Math.floor(idx / cols) * (nodeHeight + gap / 2) };
                                                    break;
                                                case 'organic':
                                                    pos = { x: (index * (nodeWidth + gap)) - (level * 150), y: (level * (nodeHeight + gap)) + (index % 2 * 80) };
                                                    break;
                                                case 'relay':
                                                    pos = { x: (index % 2 === 0 ? -400 : 400), y: level * (nodeHeight + 100) };
                                                    break;
                                                case 'tree':
                                                    const treeWidth = Math.pow(2, level) * 200;
                                                    pos = { x: (index - (total - 1) / 2) * (treeWidth / total + 200), y: level * (nodeHeight + gap) };
                                                    break;
                                                default: // Vertical
                                                    pos = { x: (index - (total - 1) / 2) * (nodeWidth + gap / 2), y: level * (nodeHeight + gap) };
                                            }

                                            return {
                                                ...node,
                                                position: pos
                                            };
                                        });

                                        setNodes(newNodes);
                                        addNotification('success', 'Architecture Recalibrated', `${mode.label} logic applied.`);
                                        setTimeout(() => reactFlowInstance?.fitView({ duration: 1200, padding: 0.2 }), 100);
                                    };
                                    applyLayout(nodes, edges, mode.id);
                                }}
                                className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-2xl transition-all group/item text-left relative overflow-hidden"
                            >
                                <div className={`p-2.5 rounded-xl bg-white/5 group-hover/item:scale-110 transition-transform`}>
                                    <mode.icon size={18} className={`text-slate-400 group-hover/item:text-${mode.theme}-400`} />
                                </div>
                                <div>
                                    <div className="text-xs font-black text-slate-200 uppercase tracking-tight group-hover/item:text-white">{mode.label}</div>
                                    <div className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">{mode.desc}</div>
                                </div>
                                {currentTheme === mode.theme && (
                                    <div className={`absolute left-0 w-1 h-8 bg-${mode.theme}-500 rounded-full`} />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex bg-slate-800/50 rounded-lg p-1 mr-2 border border-white/5">
              <button 
                onClick={() => setViewMode('graph')}
                className={`p-2 rounded-md transition-all ${viewMode === 'graph' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                title="Graph View"
              >
                <Layout size={16} />
              </button>
              <button 
                onClick={() => setViewMode('timeline')}
                className={`p-2 rounded-md transition-all ${viewMode === 'timeline' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                title="Timeline View"
              >
                <Calendar size={16} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                title="List View"
              >
                <List size={16} />
              </button>
              <button 
                onClick={() => setViewMode('player')}
                className={`p-2 rounded-md transition-all ${viewMode === 'player' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                title="Lattice Player Mode (Field)"
              >
                <Play size={16} />
              </button>
            </div>

            <button 
              onClick={() => {
                  if (nodes.length > 0 && !window.confirm("Discard current workflow?")) return;
                  setWorkflowId(null);
                  setWorkflowName('New Workflow');
                  setNodes([]);
                  setEdges([]);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-sm transition-all border border-white/5"
            >
              <Plus size={16} />
              New
            </button>

            <button 
              onClick={fetchWorkflows}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-sm transition-all border border-white/5"
            >
              <FolderOpen size={16} />
              Load
            </button>

            <button 
              onClick={saveWorkflow}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-slate-200 rounded-lg font-bold text-sm transition-all shadow-lg shadow-white/10"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div 
            className="flex-1 w-full h-full relative" 
            ref={reactFlowWrapper}
            onDrop={onDrop}
            onDragOver={onDragOver}
        >
          {/* SIMULATION MODE BANNER */}
          <AnimatePresence>
              {simulationMode && (
                  <motion.div 
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] px-6 py-2 bg-amber-600/20 backdrop-blur-md border border-amber-500/50 rounded-full flex items-center gap-3 shadow-[0_0_30px_rgba(245,158,11,0.2)]"
                  >
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></div>
                      <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Simulation_Protocol_Active</span>
                      <button onClick={closeSimulation} className="ml-2 p-1 hover:bg-white/10 rounded-full transition-colors">
                          <X size={12} className="text-white" />
                      </button>
                  </motion.div>
              )}
          </AnimatePresence>

          {viewMode === 'graph' && (
                              <ReactFlow
                                nodes={[
                                    ...nodes.map(n => ({ ...n, data: { ...n.data, forensicActive: forensicLens, theme: currentTheme } })),
                                    ...(ghostNodes ? ghostNodes.map(n => ({ ...n, id: `ghost-${n.id}`, data: { ...n.data, isGhost: true, theme: currentTheme }, draggable: false, selectable: false, style: { opacity: 0.2, filter: 'grayscale(1) blur(1px)', pointerEvents: 'none' } })) : []),
                                    ...ghostSuggestions.map(s => ({
                                        id: s.id,
                                        type: s.type,
                                        position: s.position,
                                        data: { label: s.label, isSuggestion: true, onManifest: () => manifestGhost(s) },
                                        draggable: false,
                                        selectable: false
                                    }))
                                ]}
                                edges={edges.map(e => ({ ...e, data: { ...e.data, theme: currentTheme } }))}
                                onNodesChange={onNodesChange}
                                onEdgesChange={onEdgesChange}
                                onConnect={onConnect}
                                onConnectStart={onConnectStart}
                                onConnectEnd={onConnectEnd}
                                onInit={setReactFlowInstance}
                                onNodeClick={onNodeClick}
                                onPaneClick={onPaneClick}
                                onPaneContextMenu={onPaneContextMenu}
                                onDoubleClick={onPaneDoubleClick}
                                nodeTypes={nodeTypes}
                                edgeTypes={edgeTypes}
                                connectionLineComponent={ConnectionLine}
                                fitView
                                fitViewOptions={{ padding: 0.2 }}
                                nodeOrigin={[0.5, 0.5]}
                                className="bg-slate-950"
                                defaultEdgeOptions={{ type: 'custom', animated: true, style: { strokeWidth: 2, stroke: '#64748b' } }}
                                minZoom={0.1}
                                maxZoom={4}
                                snapToGrid={true}
                                snapGrid={[25, 25]}
                              >              {/* MASTERPIECE REACTIVE GRID */}
              <Background 
                color={forensicLens ? "#8b5cf6" : simulationMode ? "#f59e0b" : "#1e1b4b"} 
                gap={25} 
                size={1} 
                className={`transition-colors duration-1000 ${forensicLens || simulationMode ? 'opacity-40' : 'opacity-20'}`}
              />
              <Background 
                variant="lines" 
                color={forensicLens ? "#7c3aed" : simulationMode ? "#d97706" : "#312e81"} 
                gap={150} 
                size={1} 
                className={`transition-colors duration-1000 ${forensicLens || simulationMode ? 'opacity-20' : 'opacity-10'}`}
              />

              {/* HEATMAP RISK OVERLAYS (LOCALIZED) */}
              {simulationMode && nodes.filter(n => n.data.simulationError).map(n => (
                  <div 
                    key={`risk-glow-${n.id}`}
                    style={{ 
                        position: 'absolute', 
                        left: n.position.x - 100, 
                        top: n.position.y - 100, 
                        width: 500, 
                        height: 400,
                        background: 'radial-gradient(circle, rgba(244,63,94,0.15) 0%, transparent 70%)',
                        pointerEvents: 'none',
                        zIndex: -1,
                        borderRadius: '50%',
                        filter: 'blur(40px)'
                    }}
                    className="animate-pulse"
                  />
              ))}
              
              <Controls className="bg-slate-900 border-white/10 fill-slate-300 text-slate-300 [&>button:hover]:bg-slate-800" />
              <MiniMap 
                className="!bg-slate-900 !border-white/10 rounded-2xl overflow-hidden shadow-2xl" 
                nodeColor={(n) => {
                  if (simulationMode && n.data.simulationResult) {
                      const s = n.data.simulationResult.status;
                      if (s === 'red') return '#f43f5e';
                      if (s === 'yellow') return '#fbbf24';
                      if (s === 'blue') return '#3b82f6';
                      if (s === 'grey') return '#334155';
                      return '#10b981';
                  }
                  if (forensicLens) return '#8b5cf6';
                  if (n.type === 'input') return '#10b981';
                  if (n.type === 'output') return '#ef4444';
                  if (n.type === 'milestone') return '#eab308';
                  return '#3b82f6';
                }}
                maskColor="rgba(2, 6, 23, 0.8)"
              />
            </ReactFlow>
          )}

          {/* MASTERPIECE CO-PILOT INTERFACE */}
          <WorkflowCopilot 
            nodes={nodes}
            edges={edges}
            simulationData={simulationData}
            meshContext={meshContext}
            forensicLens={forensicLens}
            isSimulating={isSimulating}
            aiTemplates={aiTemplates}
            onApplyTemplate={handleApplyTemplate}
            isOpen={copilotOpen} 
            onClose={() => setCopilotOpen(false)}
            onCommand={handleCopilotCommand}
          />

          {/* Quick Add Menu Popover (Connections) */}
          <AnimatePresence>
              {quickAddMenu && (
                  <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      style={{ left: quickAddMenu.x, top: quickAddMenu.y }}
                      className="fixed z-[1000] bg-slate-950 border border-white/10 p-2 rounded-2xl shadow-2xl flex flex-col gap-1 -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                  >
                      <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest px-2 py-1">Quick Add</div>
                      <div className="grid grid-cols-2 gap-1">
                          {quickAddItems.map(item => (
                              <button 
                                key={item.label}
                                onClick={() => handleQuickAdd(item.type, item.label)}
                                className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-xl transition-colors group text-left"
                              >
                                  <item.icon size={14} className={item.color} />
                                  <span className="text-xs text-slate-300 font-medium group-hover:text-white">{item.label}</span>
                              </button>
                          ))}
                      </div>
                  </motion.div>
              )}
          </AnimatePresence>

          {/* Right Click Context Menu */}
          <AnimatePresence>
              {menu && <ContextMenu x={menu.x} y={menu.y} onClose={() => setMenu(null)} onAddNode={handleContextAddNode} />}
          </AnimatePresence>

          {viewMode === 'timeline' && (
             <TimelineView nodes={nodes} onNodeClick={onNodeClick} simulationData={simulationData} />
          )}

          {viewMode === 'list' && (
             <ListView nodes={nodes} onNodeClick={onNodeClick} />
          )}

          {viewMode === 'player' && (
             <LatticePlayer nodes={nodes} edges={edges} updateNodeData={updateNodeData} />
          )}

          {/* Help Modal */}
          <AnimatePresence>
            {showHelp && <WorkflowHelp onClose={() => setShowHelp(false)} />}
          </AnimatePresence>

          {/* SIMULATION INSIGHTS PANEL */}
          <AnimatePresence>
              {showSimPanel && simulationData && (
                  <motion.div
                      initial={{ x: 400, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 400, opacity: 0 }}
                      className="absolute right-4 top-20 bottom-4 w-80 bg-slate-950/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl z-[90] flex flex-col overflow-hidden"
                  >
                      <div className="p-6 border-b border-white/5 bg-gradient-to-r from-blue-600/10 to-transparent">
                          <div className="flex justify-between items-center mb-4">
                              <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                                  <Activity size={16} className="text-blue-400" /> SIM_REPORTS
                              </h3>
                              <button onClick={() => setShowSimPanel(false)} className="p-1.5 hover:bg-white/5 rounded-full text-slate-500">
                                  <X size={16} />
                              </button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                              <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                                  <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Total Time</p>
                                  <p className="text-lg font-mono font-black text-blue-400">{simulationData.stats.totalDuration}H</p>
                              </div>
                              <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                                  <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Sim Cost</p>
                                  <p className="text-lg font-mono font-black text-emerald-400">${simulationData.stats.totalCost.toLocaleString()}</p>
                              </div>
                          </div>
                      </div>

                      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                          <div>
                              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                  <Sparkles size={12} className="text-amber-400" /> Neural Insights
                              </h4>
                              <div className="space-y-3">
                                  {simulationData.insights.map((insight, i) => (
                                      <div key={i} className={`p-3 rounded-xl border flex gap-3 ${
                                          insight.type === 'critical' ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' :
                                          insight.type === 'temporal' ? 'bg-blue-500/10 border-blue-500/20 text-blue-300' :
                                          'bg-amber-500/10 border-amber-500/20 text-amber-300'
                                      }`}>
                                          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                                          <p className="text-[10px] font-bold leading-relaxed">{insight.message}</p>
                                      </div>
                                  ))}
                              </div>
                          </div>

                          {simulationData.stats.bottlenecks.length > 0 && (
                              <div>
                                  <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-4">Critical Bottlenecks</h4>
                                  <div className="space-y-2">
                                      {simulationData.stats.bottlenecks.map((b, i) => (
                                          <div key={i} className="p-3 bg-rose-600/5 border border-rose-500/20 rounded-xl text-[10px] font-mono text-rose-400">
                                              {b}
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          )}
                      </div>

                      <div className="p-4 bg-black/40 border-t border-white/5">
                          <button 
                            onClick={closeSimulation}
                            className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest transition-all"
                          >
                              Deactivate Simulation
                          </button>
                      </div>
                  </motion.div>
              )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- MASTERPIECE GLOBAL OVERLAYS --- */}
      {/* Moving Properties Panel here ensures it is never clipped by relative parents */}
      <AnimatePresence>
        {selectedNode && (
          <div className="fixed inset-0 z-[110] pointer-events-none">
              <PropertiesPanel 
                selectedNode={selectedNode} 
                updateNodeData={updateNodeData} 
                closePanel={() => setSelectedNodeId(null)}
                onDeleteNode={onDeleteNode}
                staffList={staffList}
                workflows={savedWorkflows}
                onResumeNode={resumeNode}
                addNotification={addNotification}
                simulationData={simulationData}
              />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function WorkflowBuilder() {
  return (
    <ReactFlowProvider>
      <WorkflowBuilderContent />
    </ReactFlowProvider>
  );
}