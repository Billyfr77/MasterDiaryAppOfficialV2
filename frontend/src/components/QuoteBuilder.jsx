/*
 * MasterDiaryApp Official - Construction SaaS Platform
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { 
  ReactFlow, 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState, 
  addEdge, 
  useReactFlow, 
  ReactFlowProvider,
  Handle, 
  Position,
  NodeResizer
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { 
  User, Wrench, Package, Plus, Save, Search, Trash2,
  Crown, List, GripVertical, CheckCircle2, X, Sparkles, MapPin, Eye, EyeOff, UploadCloud,
  Settings, FileText, Download, Calendar, FileType, Ruler, PenTool, MessageSquare, Send, Calculator, Maximize, Minimize,
  Layout, Focus, Image as ImageIcon, Zap, DollarSign, Wand2, ArrowRight, Loader2, Folder
} from 'lucide-react'
import { useNotification } from '../context/NotificationContext'
import { api } from '../utils/api'
import CountUp from 'react-countup'
import MapBackground from './MapBackground'
import GeoreferenceModal from './GeoreferenceModal'
import GoogleServicesSuggestions from './GoogleServicesSuggestions'
import { generateQuotePDF } from '../utils/pdfGenerator'
import ClientSelector from './Clients/ClientSelector'
import { syncManager } from '../utils/syncManager'
import PowerHeader from './ui/PowerHeader'
import QuoteSettingsModal from './Quotes/QuoteSettingsModal'
import ConfigModal from './ConfigModal'
import { DiaryNode, ChronosNode, ZoneNode, ImpactNode, DelayNode, DimensionNode } from './TimelineCanvas/TimelineNodes';
import { SmartEdgeTypes } from './TimelineCanvas/SmartEdges'
import ResourceSidebar from './ResourceSidebar'

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount || 0)
}

const MATERIAL_COVERAGE = {
  'flooring': { coverage: 15, unit: 'sq ft/box', waste: 1.1, type: 'floor' },
  'carpet': { coverage: 12, unit: 'sq ft/roll', waste: 1.15, type: 'floor' },
  'tile': { coverage: 10, unit: 'sq ft/box', waste: 1.1, type: 'floor' },
  'concrete': { coverage: 80, unit: 'sq ft/yd (4in)', waste: 1.05, type: 'floor' },
  'paint': { coverage: 350, unit: 'sq ft/gal', waste: 1.1, type: 'wall' },
  'drywall': { coverage: 32, unit: 'sq ft/sheet', waste: 1.15, type: 'wall' },
  'plaster': { coverage: 50, unit: 'sq ft/bag', waste: 1.1, type: 'wall' },
  'insulation': { coverage: 40, unit: 'sq ft/roll', waste: 1.05, type: 'wall' },
  'skirting': { unit: 'linear ft', waste: 1.1, type: 'linear' },
  'cornice': { unit: 'linear ft', waste: 1.1, type: 'linear' },
  'framing': { unit: 'linear ft', waste: 1.15, type: 'linear' } 
}

const QuoteCopilot = ({ isOpen, onClose, messages, onSendMessage, isTyping, onAction, onGenerateBlueprint }) => {
  const [input, setInput] = useState('')
  const scrollRef = useRef(null)
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight }, [messages])
  if (!isOpen) return null
  return (
    <div className="fixed bottom-24 right-6 w-96 h-[600px] max-h-[70vh] bg-stone-900/95 border border-white/20 rounded-2xl shadow-2xl flex flex-col z-[100] backdrop-blur-xl animate-fade-in">
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-t-2xl">
        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"><Crown size={20} className="text-white" /></div><div><h3 className="text-sm font-black text-white uppercase tracking-wider">Senior Estimator</h3><div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span><span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Online</span></div></div></div>
        <button onClick={onClose} className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"><X size={18} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[90%] p-3 rounded-2xl text-sm mb-1 ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-stone-800 text-gray-200 border border-white/10 rounded-tl-sm'}`}>{msg.content}</div>
            {msg.actions?.map((action, i) => (
                <button key={i} onClick={() => onAction(action)} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold transition-all mt-2">
                    <Plus size={12} /> {action.type === 'add_node' ? `Add ${action.quantity}x ${action.label}` : 'Action'}
                </button>
            ))}
          </div>
        ))}
        {isTyping && <div className="flex justify-start"><div className="bg-stone-800 p-3 rounded-2xl flex gap-1"><span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" /><span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-75" /><span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-150" /></div></div>}
      </div>
      <div className="p-4 border-t border-white/10 bg-stone-900/50 rounded-b-2xl backdrop-blur-md space-y-2">
        <div className="relative flex items-center gap-2">
          <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (onSendMessage(input), setInput(''))} placeholder="Describe scope..." className="flex-1 bg-black/30 border border-white/10 rounded-xl pl-4 pr-4 py-3 text-sm text-white focus:border-indigo-500 outline-none placeholder-gray-600" />
          <button onClick={() => { onSendMessage(input); setInput('') }} disabled={!input.trim()} className="p-3 bg-indigo-600 rounded-xl text-white hover:bg-indigo-500 disabled:opacity-50 transition-all"><ArrowRight size={18} /></button>
        </div>
        <button onClick={() => { if(input.trim()) { onGenerateBlueprint(input); setInput(''); } }} className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"><Wand2 size={14} /> Generate Full Blueprint</button>
      </div>
    </div>
  )
}

const QuoteItem = ({ item, onUpdate, onRemove, formatCurrency }) => {
  const [isEditing, setIsEditing] = useState(false)
  const rate = item.customRate !== undefined ? item.customRate : (item.type === 'staff' ? item.material.chargeRate : item.type === 'equipment' ? item.material.costRate : item.material.pricePerUnit);
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 group hover:shadow-md ${item.type === 'staff' ? 'bg-emerald-900/20 border-emerald-500/30' : item.type === 'equipment' ? 'bg-amber-900/20 border-amber-500/30' : 'bg-indigo-900/20 border-indigo-500/30'}`}>
      <div className="flex items-center gap-3 overflow-hidden">
          <div className={`w-1 h-10 rounded-full ${item.type === 'staff' ? 'bg-emerald-500' : item.type === 'equipment' ? 'bg-orange-500' : 'bg-indigo-500'}`} />
          <div className="space-y-1">
              <div className="text-sm font-bold text-white truncate max-w-[150px]">{item.material.name}</div>
              <div onClick={() => setIsEditing(true)} className="text-[10px] text-gray-400 font-mono cursor-pointer hover:text-white">
                  {isEditing ? (
                      <input type="number" className="w-20 bg-stone-800 border border-indigo-500 text-white text-[10px] px-1 rounded outline-none" defaultValue={rate} onBlur={(e) => { const val = parseFloat(e.target.value); onUpdate(item.tempId, { customRate: val }); setIsEditing(false) }} autoFocus />
                  ) : `${formatCurrency(rate)} / unit`}
              </div>
          </div>
      </div>
      <div className="flex items-center gap-4">
          <div className="text-right">
              <span className="text-[9px] text-gray-500 font-bold uppercase block">Qty</span>
              {isEditing ? (
                  <input type="number" className="w-14 bg-stone-800 border border-indigo-500 text-white text-xs px-2 py-1 rounded-lg text-right outline-none" defaultValue={item.quantity} onBlur={(e) => { const val = parseFloat(e.target.value); if (val > 0) onUpdate(item.tempId, { quantity: val }); }} />
              ) : <div onClick={() => setIsEditing(true)} className="text-sm font-mono font-bold text-white cursor-pointer">{item.quantity.toFixed(2)}</div>}
          </div>
          <div className="text-right min-w-[80px]">
              <span className="text-[9px] text-gray-500 font-bold uppercase block">Total</span>
              <div className="text-sm font-bold text-emerald-400">{formatCurrency(rate * item.quantity)}</div>
          </div>
          <button onClick={() => onRemove(item.tempId)} className="p-2 text-gray-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
      </div>
    </div>
  )
}

const LoadQuoteModal = ({ isOpen, onClose, onLoad, quotes, isLoading }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="w-[600px] max-h-[80vh] bg-stone-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col">
                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Load Previous Quote</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={18} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {isLoading ? <div className="flex justify-center py-8"><Loader2 className="animate-spin text-indigo-500" /></div> :
                     quotes.map(q => (
                        <div key={q.id} onClick={() => onLoad(q)} className="p-3 bg-stone-800 hover:bg-stone-700 border border-white/5 rounded-xl cursor-pointer transition-all group">
                            <div className="flex justify-between items-start mb-1">
                                <div className="font-bold text-white text-sm">{q.name || 'Untitled'}</div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${q.status==='approved'?'bg-emerald-500/10 text-emerald-400 border-emerald-500/20':'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>{q.status}</span>
                            </div>
                            <div className="flex justify-between items-end text-xs text-gray-400">
                                <div><div>Project: {q.project?.name || 'N/A'}</div><div>Last Updated: {new Date(q.updatedAt).toLocaleDateString()}</div></div>
                                <div className="font-mono text-indigo-400">{formatCurrency(q.totalRevenue)}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const QuoteBuilderContent = () => {
  const navigate = useNavigate(); const location = useLocation(); const { id } = useParams(); const { addNotification } = useNotification();
  const [isSaving, setIsSaving] = useState(false); const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false); const [dataLoading, setDataLoading] = useState(true);
  const nodeTypes = useMemo(() => ({ glass: DiaryNode, dimension: DimensionNode, zone: ZoneNode, chronos: ChronosNode, impact: ImpactNode, delay: DelayNode }), [])
  const edgeTypes = useMemo(() => SmartEdgeTypes, [])
  const [nodes, setNodes, onNodesChange] = useNodesState([]); const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [materials, setMaterials] = useState([]); const [staff, setStaff] = useState([]); const [equipment, setEquipment] = useState([]);
  const [projects, setProjects] = useState([]); const [quoteItems, setQuoteItems] = useState([]); const [selectedProject, setSelectedProject] = useState(location.state?.projectId || '');
  const [marginPct, setMarginPct] = useState(20); const [searchTerm, setSearchTerm] = useState(''); const [isDragOver, setIsDragOver] = useState(false);
  const [pendingNode, setPendingNode] = useState(null); const [showSettings, setShowSettings] = useState(false);
  const [quoteSettings, setQuoteSettings] = useState({ clientName: '', clientAddress: '', clientId: null, validUntil: '', terms: '', status: 'DRAFT' })
  const [showMap, setShowMap] = useState(false); const [projectLocation, setProjectLocation] = useState(null); const [showGeoModal, setShowGeoModal] = useState(false);
  const [sitePlan, setSitePlan] = useState(null); const [quoteScope, setQuoteScope] = useState(''); const [isGeneratingScope, setIsGeneratingScope] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false); const [existingQuotes, setExistingQuotes] = useState([]); const [quotesLoading, setQuotesLoading] = useState(false);
  const [showChat, setShowChat] = useState(false); const [chatMessages, setChatMessages] = useState([]); const [chatTyping, setChatTyping] = useState(false);
  const [isPulseActive, setIsPulseActive] = useState(false); const [showSidebar, setShowSidebar] = useState(true);
  const canvasRef = useRef(null); const { screenToFlowPosition, getNodes, fitView } = useReactFlow();

  const handleAiSuggest = () => { handleAIChat("Review this quote. Suggest missing items. Return specific add_node actions."); };
  const getSmartEdgeParams = useCallback((sourceId) => { const sourceNode = nodes.find(n => n.id === sourceId); const type = sourceNode?.data?.type || 'material'; let edgeType = 'default'; if (type === 'staff' || type === 'equipment') edgeType = 'orbit'; else if (type === 'material') edgeType = 'gradient'; return { type: edgeType, data: { type, sourceType: type } }; }, [nodes]);
  const onConnect = useCallback((params) => { const smartParams = getSmartEdgeParams(params.source); setEdges((eds) => addEdge({ ...params, ...smartParams, animated: true }, eds)); }, [setEdges, getSmartEdgeParams]);
  const updateItem = useCallback((tempId, updates) => { setQuoteItems(items => items.map(item => item.tempId === tempId ? { ...item, ...updates } : item)); }, [setQuoteItems]);
  const handleGenerateScope = async () => { if (quoteItems.length === 0) return; setIsGeneratingScope(true); try { const project = projects.find(p => p.id === selectedProject); const res = await api.post('/ai/generate-scope', { items: quoteItems.map(i => ({ name: i.material.name, qty: i.quantity, type: i.type })), projectName: project?.name }); setQuoteScope(res.data.scope); addNotification('success', 'Scope Generated'); } catch (err) { console.error(err); } finally { setIsGeneratingScope(false); } };
  const openLoadModal = async () => { setShowLoadModal(true); setQuotesLoading(true); try { const res = await api.get('/quotes?limit=50'); setExistingQuotes(res.data.data || []); } catch (err) { console.error(err); } finally { setQuotesLoading(false); } };
  const handleLoadQuote = (quote) => { navigate(`/quotes/${quote.id}`); setShowLoadModal(false); };
  const deleteNode = useCallback((id) => { setNodes((nds) => nds.filter(n => n.id !== id)); setQuoteItems((items) => items.filter(i => i.tempId !== id)); }, [setNodes]);
  const handleAIChat = async (message) => { if (!message.trim()) return; setChatMessages(prev => [...prev, { role: 'user', content: message }]); setChatTyping(true); try { const context = { project: projects.find(p => p.id === selectedProject) || {}, items: quoteItems.map(i => ({ name: i.material.name, qty: i.quantity, type: i.type })), settings: quoteSettings }; const res = await api.post('/ai/chat-quote', { message, context }); setChatMessages(prev => [...prev, { role: 'assistant', content: res.data.reply, actions: res.data.suggestedActions }]); } catch (err) { console.error(err); } finally { setChatTyping(false); } };
  const onTapAdd = (item) => { const position = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 }); setPendingNode({ item, position, suggestedQuantity: 1 }); };
  const handleAddNode = (quantity, cost, charge) => { if (!pendingNode) return; const { item, position } = pendingNode; const nodeId = `${item.type}-${Date.now()}`; setNodes(nds => nds.concat({ id: nodeId, type: 'glass', position, data: { label: item.name, subLabel: item.type, quantity, type: item.type, onDelete: () => deleteNode(nodeId) } })); setQuoteItems(prev => [...prev, { nodeId: item.id, tempId: nodeId, quantity, material: item, type: item.type, customRate: charge > 0 ? charge : undefined }]); setPendingNode(null); };
  
  const handleNewQuote = () => {
      if(quoteItems.length > 0 && !confirm("Discard current quote?")) return;
      setNodes([]);
      setEdges([]);
      setQuoteItems([]);
      setSelectedProject('');
      setQuoteSettings({ clientName: '', clientAddress: '', clientId: null, validUntil: '', terms: '', status: 'DRAFT' });
  };

  const addDimensionNode = () => { const id = `dim-${Date.now()}`; setNodes(nds => nds.concat({ id, type: 'dimension', position: screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 }), style: { width: 200, height: 200 }, data: { label: 'New Room', width: 200, height: 200, onDelete: () => deleteNode(id), onResize: (e, params) => { setNodes(curr => curr.map(cn => cn.id === id ? { ...cn, style: { ...cn.style, width: params.width, height: params.height }, data: { ...cn.data, width: params.width, height: params.height } } : cn)); } } })); };
  const addZoneNode = () => { const id = `zone-${Date.now()}`; setNodes(nds => nds.concat({ id, type: 'zone', position: screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 }), style: { width: 400, height: 400, zIndex: -1 }, data: { label: 'New Zone', onDelete: () => deleteNode(id) } })); };
  
  const restructureLayout = useCallback(() => { const zones = nodes.filter(n => n.type === 'zone'); const newNodes = nodes.map((node, i) => { if (node.type === 'zone') return { ...node, position: { x: i * 800, y: 0 } }; return node; }); setNodes(newNodes); setTimeout(() => fitView({ padding: 0.2 }), 100); }, [nodes, fitView]);
  const handleSave = async () => { if (!selectedProject) return; setIsSaving(true); try { const payload = { projectId: selectedProject, clientId: quoteSettings.clientId, marginPct, totalCost: financials.subtotal, totalRevenue: financials.total, nodes, edges, staff: quoteItems.filter(i=>i.type==='staff'), equipment: quoteItems.filter(i=>i.type==='equipment') }; if (id) await api.put(`/quotes/${id}`, payload); else { const res = await api.post('/quotes', payload); navigate(`/quotes/${res.data.id}`); } addNotification('success', 'Quote Saved'); } catch (err) { console.error(err); } finally { setIsSaving(false); } };

  const [dropLocation, setDropLocation] = useState(null);

  // --- RESTORED DnD HANDLERS ---
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    if (!isDragOver) setIsDragOver(true);
  }, [isDragOver]);

  const onDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(false);
    let type = event.dataTransfer.getData('application/reactflow');
    if (!type) type = event.dataTransfer.getData('text/plain');
    if (!type) return;
    try {
        const item = JSON.parse(type);
        const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
        
        // Visual Feedback
        setDropLocation({ x: event.clientX, y: event.clientY });
        setTimeout(() => setDropLocation(null), 800);

        setPendingNode({ item, position, suggestedQuantity: 1 });
    } catch (e) {
        console.error("Drop Parse Error:", e);
    }
  }, [screenToFlowPosition]);

  // --- IMPROVED BLUEPRINT GENERATION ---
  const handleGenerateBlueprint = async (prompt) => {
      if (!prompt || !prompt.trim()) {
          addNotification('warning', 'Input Required', 'Please describe what you want to build.');
          return;
      }
      setIsGeneratingBlueprint(true);
      setChatMessages(prev => [...prev, { role: 'user', content: `Generate Blueprint: ${prompt}` }]);
      
      try {
          const startTime = Date.now();
          const res = await api.post('/ai/quote', { prompt });
          const { nodes: aiNodes, edges: aiEdges } = res.data;
          
          const elapsed = Date.now() - startTime;
          if (elapsed < 1500) await new Promise(r => setTimeout(r, 1500 - elapsed));

          if (aiNodes && aiNodes.length > 0) {
              addNotification('success', 'Blueprint Generated', 'AI has constructed the visual quote.');
              const newNodes = [];
              const newItems = [];
              aiNodes.forEach(rawNode => {
                  let n = rawNode;
                  if (!n.data) n = { id: rawNode.id || `ai-${Math.random()}`, type: 'glass', position: rawNode.position || {x:0, y:0}, data: rawNode };
                  if (!n.data) return;
                  const nodeId = n.id;
                  newNodes.push({
                      id: nodeId,
                      type: n.type === 'dimension' ? 'dimension' : 'glass',
                      position: n.position || { x: 0, y: 0 },
                      data: { ...n.data, onDelete: () => deleteNode(nodeId) },
                      style: n.type === 'dimension' ? { width: 200, height: 200 } : undefined
                  });
                  if (n.type !== 'dimension') {
                      newItems.push({
                          nodeId: n.data.nodeId || n.id,
                          tempId: nodeId,
                          quantity: n.data.quantity || 1,
                          material: { name: n.data.label, price: n.data.cost || 0 },
                          type: 'material',
                          customRate: n.data.cost
                      });
                  }
              });
              setNodes(prev => [...prev, ...newNodes]);
              if (aiEdges) setEdges(prev => [...prev, ...aiEdges]);
              setQuoteItems(prev => [...prev, ...newItems]);
              setChatMessages(prev => [...prev, { role: 'assistant', content: "Blueprint generated. Please review." }]);
              setTimeout(() => fitView({ padding: 0.2 }), 500);
          } else {
              setChatMessages(prev => [...prev, { role: 'assistant', content: "I couldn't generate a valid layout. Please try again." }]);
          }
      } catch (err) {
          console.error(err);
          setChatMessages(prev => [...prev, { role: 'assistant', content: "Error generating blueprint." }]);
          addNotification('error', 'Generation Error', 'Failed to generate blueprint.');
      } finally {
          setIsGeneratingBlueprint(false);
          setChatTyping(false);
      }
  };

  const handleCopilotAction = (action) => {
      if (action.type === 'add_node') {
          let item = { id: `ai-${Date.now()}`, name: action.label, pricePerUnit: action.cost || 0, type: action.category || 'material' };
          setPendingNode({ item, position: screenToFlowPosition({ x: window.innerWidth/2, y: window.innerHeight/2 }), suggestedQuantity: action.quantity || 1 });
      }
  };

  // --- GHOST NODE LOGIC ---
  const confirmGhostNode = useCallback((node) => {
      setNodes(nds => nds.map(n => n.id === node.id ? { ...n, data: { ...n.data, isGhost: false, subLabel: 'Confirmed Item' } } : n));
      const newItem = { nodeId: node.id, tempId: node.id, quantity: node.data.quantity || 1, material: { name: node.data.label, price: 0 }, type: node.data.type || 'material', isEstimated: true };
      setQuoteItems(prev => [...prev, newItem]);
      addNotification('Item confirmed', 'success');
  }, [setNodes, setQuoteItems, addNotification]);

  const fetchGhostSuggestions = useCallback(async (node) => {
      if (!node) return;
      try {
          const res = await api.post('/ai/node-suggestions', { selectedNode: node, existingNodes: nodes });
          if (res.data?.suggestions) { /* Add suggestions logic here if needed */ }
      } catch (err) { console.error(err); }
  }, [nodes]);

  const handleNodeClick = useCallback((event, node) => {
      if (!isPulseActive) return;
      if (node.data?.isGhost) { confirmGhostNode(node); } 
      else { fetchGhostSuggestions(node); }
  }, [isPulseActive, confirmGhostNode, fetchGhostSuggestions]);

  useEffect(() => { const fetchData = async () => { setDataLoading(true); try { const [n, s, e, p] = await Promise.all([api.get('/nodes'), api.get('/staff'), api.get('/equipment'), api.get('/projects')]); setMaterials(n.data.data || n.data || []); setStaff((s.data.data || s.data || []).map(x => ({...x, type: 'staff', chargeRate: x.chargeOutBase}))); setEquipment((e.data.data || e.data || []).map(x => ({...x, type: 'equipment', costRate: x.costRateBase}))); setProjects(p.data.data || p.data || []); } finally { setDataLoading(false); } }; fetchData(); }, []);

  const financials = useMemo(() => { const mats = quoteItems.filter(i => i.type === 'material').reduce((acc, i) => acc + (i.quantity * (i.customRate || i.material?.pricePerUnit || 0)), 0); const stf = quoteItems.filter(i => i.type === 'staff').reduce((acc, i) => acc + (i.quantity * (i.customRate || i.material?.chargeRate || 0)), 0); const eqp = quoteItems.filter(i => i.type === 'equipment').reduce((acc, i) => acc + (i.quantity * (i.customRate || i.material?.costRate || 0)), 0); const subtotal = mats + stf + eqp; const total = subtotal * (1 + marginPct / 100); return { materials: mats, staff: stf, equipment: eqp, subtotal, total }; }, [quoteItems, marginPct]);
  const stats = [ { label: 'Materials', value: formatCurrency(financials.materials), color: 'text-indigo-400' }, { label: 'Labor', value: formatCurrency(financials.staff), color: 'text-emerald-400' }, { label: 'Equipment', value: formatCurrency(financials.equipment), color: 'text-amber-400' }, { label: 'Total', value: formatCurrency(financials.total), color: 'text-white' } ];

  return (
    <div className="h-[calc(100vh-80px)] bg-transparent flex flex-col font-sans overflow-hidden text-white relative">
      <GeoreferenceModal isOpen={showGeoModal} onClose={() => setShowGeoModal(false)} onSave={(data) => { setSitePlan(data); setShowMap(true); }} />
      <QuoteSettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} settings={quoteSettings} setSettings={setQuoteSettings} projects={projects} selectedProject={selectedProject} />
      <LoadQuoteModal isOpen={showLoadModal} onClose={() => setShowLoadModal(false)} onLoad={handleLoadQuote} quotes={existingQuotes} isLoading={quotesLoading} />
      {showMap && <div className="absolute inset-0 z-0"><MapBackground activeLocation={projectLocation} overlayImage={sitePlan} /></div>}

      {/* DROP RIPPLE EFFECT */}
      {dropLocation && (
          <div 
              className="fixed w-32 h-32 rounded-full border-4 border-emerald-400 bg-emerald-400/20 animate-ping pointer-events-none z-[100]"
              style={{ left: dropLocation.x - 64, top: dropLocation.y - 64 }}
          />
      )}

      <div className={`absolute inset-0 z-10 flex flex-col transition-all duration-500 ${showMap ? 'bg-stone-900/40 backdrop-blur-sm' : ''}`}>
        
        <ConfigModal isOpen={!!pendingNode} item={pendingNode?.item} suggestedQuantity={pendingNode?.suggestedQuantity} onClose={() => setPendingNode(null)} onConfirm={handleAddNode} />
        
        {(isGeneratingBlueprint || dataLoading) && (
          <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in">
             <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                <Loader2 size={48} className="text-indigo-500 animate-spin relative z-10" />
             </div>
             <h2 className="mt-6 text-xl font-black text-white uppercase tracking-wider">{isGeneratingBlueprint ? 'Constructing Blueprint...' : 'Loading Resources...'}</h2>
             <p className="text-gray-400 text-sm mt-2 font-medium">{isGeneratingBlueprint ? 'AI is analyzing requirements and drafting layout' : 'Syncing with project database'}</p>
          </div>
        )}

        {/* TOP: FULL WIDTH HEADER */}
        <div className="w-full pt-4 px-4 relative z-20">
            <PowerHeader title="Quote Builder" icon={Crown} stats={stats} isPulseActive={isPulseActive} onPulseToggle={() => setIsPulseActive(!isPulseActive)} onAiSuggest={handleAiSuggest}>
                <div className="flex bg-black/40 rounded-xl p-1 border border-white/10 mr-2">
                    <button onClick={restructureLayout} className="p-2.5 rounded-lg text-amber-400 hover:bg-amber-600/50 transition-colors" title="Restructure"><Zap size={18} /></button>
                    <button onClick={addDimensionNode} className="p-2.5 rounded-lg text-blue-400 hover:bg-blue-600/50 transition-colors" title="Add Room"><Ruler size={18} /></button>
                    <button onClick={addZoneNode} className="p-2.5 rounded-lg text-purple-400 hover:bg-purple-600/50 transition-colors" title="Add Zone"><Layout size={18} /></button>
                    <button onClick={() => setShowGeoModal(true)} className="p-2.5 rounded-lg text-emerald-400 hover:bg-emerald-600/50 transition-colors" title="Upload Plan"><UploadCloud size={18} /></button>
                    <button onClick={() => setShowMap(!showMap)} className={`p-2.5 rounded-lg ${showMap ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}><MapPin size={18} /></button>
                </div>
                <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} className="px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white font-bold min-w-[180px] text-sm cursor-pointer"><option value="">Select Project...</option>{projects.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}</select>
                <button onClick={openLoadModal} className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-gray-300 border border-white/10 rounded-xl font-bold text-xs flex items-center gap-2"><Folder size={16} /> Load</button>
                <button onClick={handleNewQuote} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-xl font-bold text-xs flex items-center gap-2"><Plus size={16} /> New</button>
                <button onClick={handleGenerateScope} disabled={isGeneratingScope} className="px-4 py-2.5 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-xl font-bold text-xs flex items-center gap-2">{isGeneratingScope ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />} Scope</button>
                <button onClick={handleSave} disabled={isSaving} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase text-xs shadow-xl">{isSaving ? 'Saving...' : 'Save'}</button>
                <button onClick={() => setShowSettings(true)} className="p-2.5 bg-stone-800 text-gray-400 hover:text-white rounded-xl border border-white/10 transition-all"><Settings size={18} /></button>
            </PowerHeader>
        </div>

        {/* MIDDLE: SIDEBAR + CANVAS */}
        <div className="flex-1 flex overflow-hidden relative mt-4 px-4 pb-4 gap-4">
            <ResourceSidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} materials={materials} staff={staff} equipment={equipment} onSearch={setSearchTerm} onTapAdd={onTapAdd} />
            <div className="flex-1 flex flex-col relative bg-transparent overflow-hidden">
              <div className="absolute inset-0 opacity-20 pointer-events-none bg-[size:40px_40px] bg-[linear-gradient(to_right,#6366f1_1px,transparent_1px),linear-gradient(to_bottom,#6366f1_1px,transparent_1px)]" />
              <div ref={canvasRef} className={`flex-1 rounded-3xl relative overflow-hidden border-2 border-white/5 bg-stone-900/40 backdrop-blur-sm shadow-2xl transition-all duration-500 ${isDragOver ? 'border-indigo-500/50 bg-indigo-900/20' : ''}`} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
                <div style={{ width: '100%', height: '100%' }}>
                  <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onNodeClick={handleNodeClick} snapToGrid={true} snapGrid={[20, 20]} fitView minZoom={0.05} maxZoom={2} proOptions={{ hideAttribution: true }}>
                    <Background color="#6366f1" gap={40} size={1} className="opacity-[0.05]" /><Controls className="!bg-stone-900 !border-white/10 !text-white" /><MiniMap className="!bg-stone-900 !border-white/10" nodeColor={n => n.type==='dimension'?'#3b82f6':n.type==='zone'?'#a855f7':'#6366f1'} />
                  </ReactFlow>
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none"><div className="bg-amber-500/10 backdrop-blur-md border border-amber-500/30 px-6 py-2 rounded-full flex items-center gap-3 shadow-xl"><span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span><span className="text-[10px] font-black text-amber-200 uppercase tracking-widest">Human Review Required</span></div></div>
                </div>
              </div>
            </div>
        </div>

        {/* BOTTOM: FULL WIDTH ITEM LIST */}
        <div className="h-80 bg-slate-950/95 backdrop-blur-xl border border-indigo-500/20 shadow-[0_-10px_40px_rgba(99,102,241,0.15)] flex flex-col z-30 mx-4 mb-4 rounded-2xl">
            <div className="p-4 border-b border-indigo-500/20 bg-indigo-950/20 flex justify-between items-center px-8 rounded-t-2xl">
              <div className="flex items-center gap-6"><h3 className="text-sm font-black text-indigo-100 uppercase tracking-wider flex items-center gap-2"><List size={16} className="text-indigo-400" /> Bill of Materials</h3><div className="flex gap-4 text-xs font-bold text-indigo-300/70 uppercase tracking-widest"><span>Items: <span className="text-white">{quoteItems.length}</span></span><span>Total: <span className="text-emerald-400">{formatCurrency(financials.total)}</span></span></div></div>
              <button className="p-2 hover:bg-indigo-500/20 rounded-lg text-indigo-300 hover:text-white transition-colors"><Maximize size={14} /></button>
            </div>
            <div className="flex-1 overflow-hidden flex">
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">{quoteItems.map(item => <QuoteItem key={item.tempId} item={item} onUpdate={updateItem} onRemove={deleteNode} formatCurrency={formatCurrency} />)}</div></div>
                <div className="w-72 bg-indigo-950/10 border-l border-indigo-500/20 p-8 flex flex-col justify-center space-y-5 rounded-br-2xl">
                    <div className="space-y-1"><div className="flex justify-between items-center"><span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Net Materials</span><span className="text-sm font-mono text-white font-bold">{formatCurrency(financials.materials)}</span></div><div className="flex justify-between items-center"><span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Net Labor</span><span className="text-sm font-mono text-white font-bold">{formatCurrency(financials.staff)}</span></div></div>
                    <div className="h-px bg-indigo-500/20 w-full" /><div className="flex justify-between items-center"><span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Applied Margin</span><span className="text-sm font-mono text-indigo-400 font-bold">{marginPct}%</span></div>
                    <div className="pt-2"><div className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1">Grand Total</div><div className="text-3xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">{formatCurrency(financials.total)}</div></div>
                </div>
            </div>
        </div>
        <div className="absolute bottom-24 right-6 z-50">
          {!showChat && <button onClick={() => setShowChat(true)} className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 shadow-[0_0_30px_rgba(99,102,241,0.6)] flex items-center justify-center text-white hover:scale-110 transition-transform"><Sparkles size={24} /></button>}
          <QuoteCopilot isOpen={showChat} onClose={() => setShowChat(false)} messages={chatMessages} onSendMessage={handleAIChat} isTyping={chatTyping} onAction={handleCopilotAction} onGenerateBlueprint={handleGenerateBlueprint} />
        </div>
      </div>
    </div>
  )
}
const QuoteBuilder = () => <ReactFlowProvider><QuoteBuilderContent /></ReactFlowProvider>
export default QuoteBuilder