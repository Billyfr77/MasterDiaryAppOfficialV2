import React, { useState, useRef, useCallback, useEffect } from 'react';
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
import { Save, Play, Plus, Trash2, Layout, Calendar, List, MoreVertical, Loader2, ArrowLeft, Sparkles, Wand2, HelpCircle, Clipboard, GitFork, Bell, Zap, User, MessageSquare, CheckSquare, FolderOpen, FileText, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WorkflowSidebar from './WorkflowSidebar';
import CustomNode from './CustomNode';
import DecisionNode from './DecisionNode';
import CustomEdge from './CustomEdge';
import PropertiesPanel from './PropertiesPanel';
import TimelineView from './TimelineView';
import ListView from './ListView';
import WorkflowHelp from './WorkflowHelp';
import ContextMenu from './ContextMenu';
import ConnectionLine from './ConnectionLine';
import { api } from '../../utils/api';

const nodeTypes = {
  milestone: CustomNode,
  approval: CustomNode,
  notification: CustomNode,
  default: CustomNode,
  input: CustomNode,
  output: CustomNode,
  decision: DecisionNode,
  quoteAction: CustomNode,
  diaryAction: CustomNode,
  resourceAction: CustomNode
};

const edgeTypes = {
  custom: CustomEdge,
};

const getId = () => `node_${new Date().getTime()}`;

const WorkflowBuilderContent = () => {
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
      
      // Simulate AI thinking time
      setTimeout(() => {
          let templateData = null;

          if (type !== 'custom' && LOCAL_TEMPLATES_DATA[type]) {
              // Direct template match
              templateData = LOCAL_TEMPLATES_DATA[type];
          } else {
              // Keyword Matching for "Custom" prompts
              const p = aiPrompt.toLowerCase();
              if (p.includes('kitchen') || p.includes('cabinet')) templateData = LOCAL_TEMPLATES_DATA['renovation_kitchen'];
              else if (p.includes('asbestos') || p.includes('hazard')) templateData = LOCAL_TEMPLATES_DATA['hazmat_asbestos'];
              else if (p.includes('house') || p.includes('build')) templateData = LOCAL_TEMPLATES_DATA['construction_residential'];
              else if (p.includes('demo')) templateData = LOCAL_TEMPLATES_DATA['hazmat_asbestos']; // Fallback for demo
              else templateData = LOCAL_TEMPLATES_DATA['generic'];
          }

          if (templateData) {
              // Clone to avoid reference issues
              setNodes(JSON.parse(JSON.stringify(templateData.nodes)));
              setEdges(JSON.parse(JSON.stringify(templateData.edges)));
              setShowAIModal(false);
          } else {
              // Fallback logic
              setNodes(JSON.parse(JSON.stringify(LOCAL_TEMPLATES_DATA['generic'].nodes)));
              setEdges(JSON.parse(JSON.stringify(LOCAL_TEMPLATES_DATA['generic'].edges)));
              setShowAIModal(false);
          }
          setAiLoading(false);
      }, 1500);
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
          alert("Could not fetch workflows.");
      }
  };

  const loadWorkflow = (wf) => {
      setWorkflowName(wf.title);
      setWorkflowId(wf.id);
      setNodes(wf.nodes || []);
      setEdges(wf.edges || []);
      setShowLoadModal(false);
  };

  const deleteWorkflow = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete workflow "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/workflows/${id}`);
      alert(`Workflow "${title}" deleted successfully.`);
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
      alert('Failed to delete workflow. Check console.');
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
      setEdges((eds) => addEdge({ ...params, type: 'custom', animated: true }, eds));
  }, []);

  const onConnectStart = useCallback((_, { nodeId }) => {
    connectingNodeId.current = nodeId;
  }, []);

  const onConnectEnd = useCallback(
    (event) => {
      if (!connectingNodeId.current) return;

      const targetIsPane = event.target.classList.contains('react-flow__pane');

      if (targetIsPane && reactFlowInstance) {
        // Remove the connection line by forcing a re-render or letting it fade (RF handles drag stop)
        const { clientX, clientY } = 'changedTouches' in event ? event.changedTouches[0] : event;
        const position = reactFlowInstance.screenToFlowPosition({
            x: clientX,
            y: clientY,
        });
        
        setQuickAddMenu({
            x: clientX,
            y: clientY,
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

  const onDeleteNode = (id) => {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
      setSelectedNodeId(null);
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  const saveWorkflow = async () => {
    setLoading(true);
    try {
      const workflowData = {
        title: workflowName,
        nodes,
        edges,
        status: 'active'
      };

      let res;
      if (workflowId) {
        res = await api.put(`/workflows/${workflowId}`, workflowData);
      } else {
        res = await api.post('/workflows', workflowData);
        setWorkflowId(res.data._id);
      }
      
      alert('Workflow saved successfully!');
    } catch (error) {
      console.error('Failed to save workflow:', error);
      alert('Failed to save workflow. Check console.');
    } finally {
      setLoading(false);
    }
  };

  const runWorkflow = async () => {
      if (!workflowId) {
          alert('Please save the workflow first.');
          return;
      }
      
      try {
          // 1. Save current state first
          await saveWorkflow();

          // 2. Trigger Run
          const res = await api.post(`/workflows/${workflowId}/run`);
          
          // 3. Update local state
          setNodes(res.data.nodes);
          setEdges(res.data.edges);
          alert('Workflow started!');
      } catch (err) {
          console.error("Run failed", err);
          alert("Failed to start workflow.");
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
      { type: 'default', label: 'Task', icon: Clipboard, color: 'text-blue-400' },
      { type: 'decision', label: 'Logic', icon: GitFork, color: 'text-orange-400' },
      { type: 'milestone', label: 'Milestone', icon: Bell, color: 'text-yellow-400' },
      { type: 'approval', label: 'Approval', icon: User, color: 'text-purple-400' },
  ];

  return (
    <div className="flex h-[calc(100vh-80px)] w-full overflow-hidden bg-slate-950 text-slate-200">
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
      <WorkflowSidebar />
      
      <div className="flex-1 flex flex-col relative">
        {/* Header Toolbar */}
        <div className="h-16 border-b border-white/5 bg-slate-900/50 backdrop-blur flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
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
             {/* Run Button */}
             <button 
                onClick={runWorkflow}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg border border-green-500/20 transition-all"
                title="Run Workflow"
              >
                <Play size={16} fill="currentColor" />
                <span className="text-xs font-bold uppercase tracking-wider">Run</span>
              </button>

             {/* AI Button */}
             <button 
                onClick={() => setShowAIModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-lg border border-indigo-500/20 transition-all"
              >
                <Sparkles size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">AI Suggest</span>
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
        <div className="flex-1 w-full h-full relative" ref={reactFlowWrapper}>
          {viewMode === 'graph' && (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onConnectStart={onConnectStart}
              onConnectEnd={onConnectEnd}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              onPaneContextMenu={onPaneContextMenu}
              onDoubleClick={onPaneDoubleClick}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              connectionLineComponent={ConnectionLine}
              fitView
              className="bg-slate-950"
              defaultEdgeOptions={{ type: 'custom', animated: true, style: { strokeWidth: 2, stroke: '#64748b' } }}
              minZoom={0.2}
              maxZoom={4}
            >
              <Background color="#334155" gap={20} size={1} />
              <Controls className="bg-slate-800 border-slate-700 fill-slate-300 text-slate-300 [&>button:hover]:bg-slate-700" />
              <MiniMap 
                className="!bg-slate-900 !border-slate-700 rounded-lg overflow-hidden shadow-xl" 
                nodeColor={(n) => {
                  if (n.type === 'input') return '#10b981';
                  if (n.type === 'output') return '#ef4444';
                  if (n.type === 'milestone') return '#eab308';
                  return '#3b82f6';
                }}
                maskColor="rgba(15, 23, 42, 0.6)"
              />
            </ReactFlow>
          )}

          {/* Quick Add Menu Popover (Connections) */}
          <AnimatePresence>
              {quickAddMenu && (
                  <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      style={{ left: quickAddMenu.x, top: quickAddMenu.y }}
                      className="absolute z-50 bg-slate-900/90 backdrop-blur-xl border border-white/10 p-2 rounded-xl shadow-2xl flex flex-col gap-1 -translate-x-1/2 -translate-y-1/2"
                  >
                      <div className="text-[10px] text-slate-500 uppercase font-bold px-2 py-1">Quick Add</div>
                      <div className="grid grid-cols-2 gap-1">
                          {quickAddItems.map(item => (
                              <button 
                                key={item.label}
                                onClick={() => handleQuickAdd(item.type, item.label)}
                                className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors group text-left"
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
          
          {/* Properties Panel Overlay */}
          <AnimatePresence>
            {selectedNode && (
              <PropertiesPanel 
                selectedNode={selectedNode} 
                updateNodeData={updateNodeData} 
                closePanel={() => setSelectedNodeId(null)}
                onDeleteNode={onDeleteNode}
                staffList={staffList}
                onResumeNode={resumeNode}
              />
            )}
          </AnimatePresence>

          {/* AI Modal */}
          <AnimatePresence>
            {showAIModal && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
                    >
                        <div className="p-6 border-b border-slate-800">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Sparkles className="text-indigo-400" /> AI Workflow Assistant
                            </h2>
                            <p className="text-slate-400 text-sm mt-1">Generate a workflow from a description or pick a template.</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Describe Workflow Goal</label>
                                <textarea 
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    placeholder="e.g. A detailed survey process for a 2-story residential house..."
                                    className="w-full h-24 bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="max-h-60 overflow-y-auto custom-scrollbar pr-2">
                                {aiTemplates.map((cat, idx) => (
                                    <div key={idx} className="mb-4 last:mb-0">
                                        <h3 className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-wider sticky top-0 bg-slate-900 py-1 z-10">{cat.category}</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            {cat.items.map(template => (
                                                <button 
                                                    key={template.type}
                                                    onClick={() => generateAiTemplate(template.type)}
                                                    className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-colors hover:border-indigo-500/50 group"
                                                >
                                                    <span className="text-slate-300 text-xs font-bold group-hover:text-white">{template.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end gap-2">
                            <button 
                                onClick={() => setShowAIModal(false)}
                                className="px-4 py-2 text-slate-400 hover:text-white text-sm"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => generateAiTemplate('custom')}
                                disabled={aiLoading}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-50"
                            >
                                {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                                Generate
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
          </AnimatePresence>

          {/* Load Modal */}
          <AnimatePresence>
            {showLoadModal && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
                    >
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <FolderOpen className="text-indigo-400" /> Saved Workflows
                            </h2>
                            <button onClick={() => setShowLoadModal(false)} className="text-slate-400 hover:text-white">Close</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {savedWorkflows.length === 0 ? (
                                <div className="text-center text-slate-500 py-10">No saved workflows found.</div>
                            ) : (
                                <div className="grid grid-cols-1 gap-3">
                                    {savedWorkflows.map(wf => (
                                        <div key={wf.id} className="flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800 border border-white/5 hover:border-indigo-500/30 rounded-xl transition-all group text-left">
                                            <button 
                                                onClick={() => loadWorkflow(wf)}
                                                className="flex-1 flex items-center justify-between pr-4"
                                            >
                                                <div>
                                                    <h3 className="text-white font-bold">{wf.title}</h3>
                                                    <p className="text-xs text-slate-500 mt-1">{new Date(wf.createdAt).toLocaleDateString()} • {wf.nodes?.length} nodes</p>
                                                </div>
                                                <ArrowRight size={16} className="text-slate-500 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Prevent loading workflow when deleting
                                                    deleteWorkflow(wf.id, wf.title);
                                                }}
                                                className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                                title="Delete Workflow"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
          </AnimatePresence>

          {/* Help Modal */}
          <AnimatePresence>
            {showHelp && <WorkflowHelp onClose={() => setShowHelp(false)} />}
          </AnimatePresence>
        </div>
      </div>
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