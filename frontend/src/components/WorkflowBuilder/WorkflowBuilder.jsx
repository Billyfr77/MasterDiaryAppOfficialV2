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
import { Save, Play, Plus, Trash2, Layout, Calendar, List, MoreVertical, Loader2, ArrowLeft, Sparkles, Wand2, HelpCircle, Clipboard, GitFork, Bell, Zap, User, MessageSquare, CheckSquare, FolderOpen, FileText, ArrowRight, X, BrainCircuit, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WorkflowSidebar from './WorkflowSidebar';
import CustomNode from './CustomNode';
import AppIntegrationNode from './AppIntegrationNode';
import DecisionNode from './DecisionNode';
import CustomEdge from './CustomEdge';
import PropertiesPanel from './PropertiesPanel';
import TimelineView from './TimelineView';
import ListView from './ListView';
import WorkflowHelp from './WorkflowHelp';
import ContextMenu from './ContextMenu';
import ConnectionLine from './ConnectionLine';
import WorkflowCopilot from './WorkflowCopilot';
import { api } from '../../utils/api';
import { useNotification } from '../../context/NotificationContext';
import { useDiaryTheme } from '../PaintDiary/ThemeContext';
import PowerHeader from '../ui/PowerHeader';
import AestheticPicker from '../PaintDiary/AestheticPicker';

const nodeTypes = {
  milestone: CustomNode,
  approval: CustomNode,
  notification: CustomNode,
  default: CustomNode,
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
  variationNode: AppIntegrationNode
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
  const [showAIModal, setShowAIModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [savedWorkflows, setSavedWorkflows] = useState([]);
  const [showHelp, setShowHelp] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

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
  const LOCAL_TEMPLATES_DATA = {
    'construction_residential': {
        nodes: [
            { id: '1', type: 'milestone', position: { x: 250, y: 0 }, data: { label: 'Start Build', status: 'completed' } },
            { id: '2', type: 'default', position: { x: 250, y: 100 }, data: { label: 'Site Prep & Foundation', status: 'pending' } },
            { id: '3', type: 'decision', position: { x: 250, y: 200 }, data: { label: 'Inspection Pass?', status: 'pending' } },
            { id: '4', type: 'default', position: { x: 100, y: 300 }, data: { label: 'Framing & Lockup', status: 'pending' } },
            { id: '5', type: 'default', position: { x: 400, y: 300 }, data: { label: 'Rectify Defects', status: 'pending' } },
            { id: '6', type: 'milestone', position: { x: 250, y: 450 }, data: { label: 'Practical Completion', status: 'pending' } }
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2', type: 'custom', animated: true },
            { id: 'e2-3', source: '2', target: '3', type: 'custom', animated: true },
            { id: 'e3-4', source: '3', target: '4', label: 'Yes', type: 'custom' },
            { id: 'e3-5', source: '3', target: '5', label: 'No', type: 'custom' },
            { id: 'e5-2', source: '5', target: '2', type: 'custom', animated: true },
            { id: 'e4-6', source: '4', target: '6', type: 'custom', animated: true }
        ]
    },
    'hazmat_asbestos': {
        nodes: [
            { id: '1', type: 'default', position: { x: 250, y: 0 }, data: { label: 'Notify Regulator (5 Days)', status: 'pending' } },
            { id: '2', type: 'default', position: { x: 250, y: 100 }, data: { label: 'Setup Exclusion Zone', status: 'pending' } },
            { id: '3', type: 'default', position: { x: 250, y: 200 }, data: { label: 'Removal Operations', status: 'pending' } },
            { id: '4', type: 'decision', position: { x: 250, y: 300 }, data: { label: 'Air Monitoring Clear?', status: 'pending' } },
            { id: '5', type: 'milestone', position: { x: 250, y: 450 }, data: { label: 'Clearance Certificate', status: 'pending' } }
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2', type: 'custom' },
            { id: 'e2-3', source: '2', target: '3', type: 'custom' },
            { id: 'e3-4', source: '3', target: '4', type: 'custom' },
            { id: 'e4-5', source: '4', target: '5', label: 'Yes', type: 'custom' },
            { id: 'e4-3', source: '4', target: '3', label: 'No (Re-clean)', type: 'custom' }
        ]
    },
    'renovation_kitchen': {
        nodes: [
            { id: '1', type: 'default', position: { x: 250, y: 0 }, data: { label: 'Disconnect Services', status: 'pending' } },
            { id: '2', type: 'default', position: { x: 250, y: 100 }, data: { label: 'Demo & Strip-out', status: 'pending' } },
            { id: '3', type: 'default', position: { x: 100, y: 200 }, data: { label: 'Rough-in Plumbing', status: 'pending' } },
            { id: '4', type: 'default', position: { x: 400, y: 200 }, data: { label: 'Rough-in Electrical', status: 'pending' } },
            { id: '5', type: 'default', position: { x: 250, y: 300 }, data: { label: 'Cabinetry Install', status: 'pending' } },
            { id: '6', type: 'milestone', position: { x: 250, y: 400 }, data: { label: 'Handover', status: 'pending' } }
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2', type: 'custom' },
            { id: 'e2-3', source: '2', target: '3', type: 'custom' },
            { id: 'e2-4', source: '2', target: '4', type: 'custom' },
            { id: 'e3-5', source: '3', target: '5', type: 'custom' },
            { id: 'e4-5', source: '4', target: '5', type: 'custom' },
            { id: 'e5-6', source: '5', target: '6', type: 'custom' }
        ]
    },
    'generic': {
        nodes: [
            { id: '1', type: 'default', position: { x: 250, y: 0 }, data: { label: 'Start Project', status: 'pending' } },
            { id: '2', type: 'default', position: { x: 250, y: 100 }, data: { label: 'Execution Phase', status: 'pending' } },
            { id: '3', type: 'milestone', position: { x: 250, y: 200 }, data: { label: 'Completion', status: 'pending' } }
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2', type: 'custom' },
            { id: 'e2-3', source: '2', target: '3', type: 'custom' }
        ]
    }
  };

  const aiTemplates = [
    { category: 'Construction', items: [
        { type: 'construction_residential', label: 'Residential New Build' },
        { type: 'construction_commercial', label: 'Commercial Fitout' },
        { type: 'renovation_kitchen', label: 'Kitchen Renovation' }
    ]},
    { category: 'Demolition & Hazards', items: [
        { type: 'demolition_structural', label: 'Structural Demolition' },
        { type: 'hazmat_asbestos', label: 'Asbestos Removal (Class A/B)' },
        { type: 'waste_management', label: 'Waste Management Plan' }
    ]},
    { category: 'Site Management', items: [
        { type: 'safety_incident', label: 'Incident Response' },
        { type: 'procurement', label: 'Material Procurement' },
        { type: 'qa_inspection', label: 'QA / Defect Inspection' }
    ]},
    { category: 'Admin & HR', items: [
        { type: 'onboarding', label: 'Staff Onboarding' },
        { type: 'software_dev', label: 'Software Dev Cycle' }
    ]}
  ];

  const generateAiTemplate = async (type = 'custom') => {
      setAiLoading(true);
      
      const NODE_SCHEMA_INSTRUCTION = `
      CRITICAL: You are the architect of a "MasterDiaryOS" executable workflow.
      You MUST use the following specific node types and configurations to create intelligent, functional automation.
      
      AVAILABLE NODE TYPES:
      1. 'invoiceNode': Billing. Config: { amount: "5000", client: "Client" }
      2. 'safetyNode': Compliance. Config: { template: "High Risk SWMS", riskLevel: "High" }
      3. 'resourceNode': Allocation. Config: { resourceType: "Excavator", quantity: "1" }
      4. 'diaryNode': Logs. Config: { logType: "Delay" }
      5. 'quoteNode': Estimation. Config: { status: "Approved" }
      6. 'forensicNode': RISK AUDIT. Config: { category: "Financial Risk", sensitivity: "High" }
      7. 'delayNode': TEMPORAL LOGIC. Config: { duration: "24", type: "Standard" }
      8. 'decision': Logic branching.
      9. 'approval': Human sign-off.
      10. 'milestone': Key event.

      Return JSON with 'nodes' and 'edges'. Node data MUST include 'config' properties.
      `;

      const finalPrompt = type === 'custom' 
          ? `${aiPrompt}\n\n${NODE_SCHEMA_INSTRUCTION}`
          : `Generate a robust construction workflow for: ${type.replace(/_/g, ' ')}.\n\n${NODE_SCHEMA_INSTRUCTION}`;

      if (!finalPrompt) {
          alert("Please provide a description or select a template.");
          setAiLoading(false);
          return;
      }

      try {
          const res = await api.post('/ai/workflow', { prompt: finalPrompt });
          const { nodes, edges } = res.data;

          if (nodes && edges) {
              setNodes(nodes);
              setEdges(edges);
              setShowAIModal(false);
              addNotification('success', 'AI Architect Complete', 'Workflow successfully generated and integrated.');
              // Auto-fit view after AI generation
              setTimeout(() => {
                  if (reactFlowInstance) {
                      reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
                  }
              }, 100);
          } else {
              throw new Error("AI did not return a valid workflow structure.");
          }
      } catch (err) {
          console.error("AI Workflow Generation Error:", err);
          addNotification('error', 'AI Generation Failed', err.response?.data?.error || err.message);
      } finally {
          setAiLoading(false);
      }
  }
  
  // Selection & Properties
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [staffList, setStaffList] = useState([]);

  // Context Menu
  const [menu, setMenu] = useState(null);

  // Quick Add / Connect
  const connectingNodeId = useRef(null);
  const [quickAddMenu, setQuickAddMenu] = useState(null);
  
  const navigate = useNavigate();

  // --- STATS MEMO ---
  const stats = useMemo(() => [
    { label: 'Active Nodes', value: nodes.length, color: 'text-indigo-400' },
    { label: 'Connections', value: edges.length, color: 'text-emerald-400' },
    { label: 'Smart Configs', value: nodes.filter(n => n.data.config && Object.keys(n.data.config).length > 0).length, color: 'text-amber-400' },
    { label: 'Risk Points', value: nodes.filter(n => n.data.simulationError).length, color: 'text-rose-400' }
  ], [nodes, edges]);

  // --- MASTERPIECE STATES ---
  const [forensicLens, setForensicLens] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

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
              setEdges(eds => eds.map(e => e.id === edge.id ? { ...e, data: { ...e.data, isActive: true } } : e));
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
            const targetNode = nodes.find(n => n.id === edge.target);
            const isBlocked = sourceNode && sourceNode.data.status !== 'completed';
            const isActive = sourceNode && sourceNode.data.status === 'in-progress';
            
            return { 
                ...edge, 
                type: 'custom', // Enforce CustomEdge
                data: { isBlocked, isActive }
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
            type: 'default',
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
                  // Propagate temporal data (Cumulative Duration)
                  const sourceDuration = parseInt(source.data.config?.duration || 0);
                  const currentTargetStart = target.data.config?.calculatedStart || 0;
                  
                  if (currentTargetStart !== sourceDuration) {
                      target.data.config = { ...target.data.config, calculatedStart: sourceDuration };
                      changed = true;
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
      addNotification('info', 'Analytical Pulse Initiated', 'Performing deep logic scan and temporal trajectory audit...');

      // Reset states
      setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, simulationError: false, isSimulating: false } })));
      setEdges(eds => eds.map(e => ({ ...e, animated: true, data: { ...e.data, isActive: false } })));

      const startNodes = nodes.filter(n => 
          n.type === 'trigger' || n.type === 'input' || !edges.some(e => e.target === n.id)
      );

      // --- MASTERCLASS ANALYTICS PASS ---
      const analyzeLattice = () => {
          const bottlenecks = [];
          const orphans = nodes.filter(n => !edges.some(e => e.source === n.id) && n.type !== 'output');
          const unassigned = nodes.filter(n => !n.data.assignee && !['trigger', 'decision', 'delayNode'].includes(n.type));
          
          if (orphans.length > 0) bottlenecks.push(`${orphans.length} orphaned modules detected.`);
          if (unassigned.length > 0) bottlenecks.push(`Unassigned critical paths may stall execution.`);
          
          // Check for lone logic gates
          nodes.filter(n => n.type === 'decision').forEach(n => {
              const outputs = edges.filter(e => e.source === n.id);
              if (outputs.length < 2) bottlenecks.push(`Logic Gate "${n.data.label}" lacks binary divergence.`);
          });

          if (bottlenecks.length > 0) {
              addNotification('warning', 'Analytical Insight', bottlenecks[0]);
          }
      };

      analyzeLattice();

      if (startNodes.length === 0) {
          addNotification('error', 'Circuit Failure', 'No architectural entry point detected.');
          setIsSimulating(false);
          return;
      }

      const traverse = async (nodeId, visited = new Set()) => {
          if (visited.has(nodeId)) return;
          visited.add(nodeId);

          const node = nodes.find(n => n.id === nodeId);
          if (!node) return;

          setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, isSimulating: true } } : n));
          await new Promise(resolve => setTimeout(resolve, 800));

          let hasError = false;
          let errorMessage = '';

          // CORE VALIDATION
          if (node.type === 'invoiceNode' && !node.data.config?.amount) {
              hasError = true; errorMessage = 'Financial Sync Failure: Null amount.';
          } else if (node.type === 'safetyNode' && !node.data.config?.template) {
              hasError = true; errorMessage = 'Compliance Breach: No SWMS template.';
          } else if (node.type === 'decision') {
              const hasYes = edges.some(e => e.source === node.id && e.sourceHandle === 'true');
              const hasNo = edges.some(e => e.source === node.id && e.sourceHandle === 'false');
              if (!hasYes || !hasNo) {
                  hasError = true; errorMessage = 'Logic Gate Loophole: Binary path missing.';
              }
          }

          if (hasError) {
              setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, simulationError: true, isSimulating: false } } : n));
              addNotification('error', 'Critical Short Circuit', errorMessage);
              return;
          }

          setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, isSimulating: false } } : n));
          
          const outgoingEdges = edges.filter(e => e.source === nodeId);
          if (outgoingEdges.length === 0 && node.type !== 'output') {
              addNotification('info', 'Process Dead-End', `Node "${node.data.label}" terminates the flow unexpectedly.`);
          }

          for (const edge of outgoingEdges) {
              setEdges(eds => eds.map(e => e.id === edge.id ? { ...e, data: { ...e.data, isActive: true } } : e));
              await new Promise(resolve => setTimeout(resolve, 400));
              await traverse(edge.target, visited);
          }
      };

      for (const startNode of startNodes) {
          await traverse(startNode.id);
      }

      setIsSimulating(false);
      addNotification('success', 'Masterclass Audit Complete', 'Operational circuit integrity verified at Level 4.');
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
      { type: 'default', label: 'Task', icon: Clipboard, color: 'text-blue-400' },
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

             {/* AI Button */}
             <button 
                onClick={() => setShowAIModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-lg border border-indigo-500/20 transition-all"
              >
                <Sparkles size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">AI Suggest</span>
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
          {viewMode === 'graph' && (
                              <ReactFlow
                                nodes={nodes.map(n => ({ ...n, data: { ...n.data, forensicActive: forensicLens } }))}
                                edges={edges}
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
                                className="bg-slate-950"
                                defaultEdgeOptions={{ type: 'custom', animated: true, style: { strokeWidth: 2, stroke: '#64748b' } }}
                                minZoom={0.1}
                                maxZoom={4}
                                snapToGrid={true}
                                snapGrid={[25, 25]}
                              >              {/* MASTERPIECE CYBER GRID */}
              <Background 
                color={forensicLens ? "#4c1d95" : "#1e1b4b"} 
                gap={25} 
                size={1} 
                className="opacity-20"
              />
              <Background 
                variant="lines" 
                color={forensicLens ? "#5b21b6" : "#312e81"} 
                gap={150} 
                size={1} 
                className="opacity-10"
              />
              
              <Controls className="bg-slate-900 border-white/10 fill-slate-300 text-slate-300 [&>button:hover]:bg-slate-800" />
              <MiniMap 
                className="!bg-slate-900 !border-white/10 rounded-2xl overflow-hidden shadow-2xl" 
                nodeColor={(n) => {
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
            isOpen={copilotOpen} 
            onClose={() => setCopilotOpen(false)}
            onCommand={(cmd) => addNotification('info', 'Command Received', `Co-pilot is analyzing: ${cmd}`)}
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
             <TimelineView nodes={nodes} onNodeClick={onNodeClick} />
          )}

          {viewMode === 'list' && (
             <ListView nodes={nodes} onNodeClick={onNodeClick} />
          )}
          {/* Help Modal */}
          <AnimatePresence>
            {showHelp && <WorkflowHelp onClose={() => setShowHelp(false)} />}
          </AnimatePresence>
        </div>
      </div>

      {/* --- MASTERPIECE GLOBAL OVERLAYS --- */}
      {/* Moving Properties Panel here ensures it is never clipped by relative parents */}
      <AnimatePresence>
        {selectedNode && (
          <div className="fixed inset-0 z-[110] pointer-events-auto">
              <PropertiesPanel 
                selectedNode={selectedNode} 
                updateNodeData={updateNodeData} 
                closePanel={() => setSelectedNodeId(null)}
                onDeleteNode={onDeleteNode}
                staffList={staffList}
                onResumeNode={resumeNode}
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