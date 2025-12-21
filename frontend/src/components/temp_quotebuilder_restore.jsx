/*
 * MasterDiaryApp Official - Construction SaaS Platform
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 * 
 * VISUAL OVERHAUL: "Vibrant Solid 3D" & "Input on Drop"
 * ENHANCED: Enterprise Quote Features + AI Copilot + Visual Takeoff + Infinite Canvas
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
import { SmartEdgeTypes } from './TimelineCanvas/SmartEdges' // Import Visual Edges
import ResourceSidebar from './ResourceSidebar'

// ================================
// UTILITIES
// ================================

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount || 0)
}

// SMART MATERIAL DATABASE
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

// ================================
// SMART ACTIONS MENU
// ================================
const SmartActionsMenu = ({ node, onAutoFit }) => {
    if (!node || node.type !== 'dimension') return null;
    return (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex gap-2 bg-stone-900 border border-white/20 p-1.5 rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 pointer-events-auto">
            <button onClick={(e) => { e.stopPropagation(); onAutoFit(node, 'basic'); }} className="flex items-center gap-1.5 px-2 py-1 hover:bg-white/10 rounded-lg text-[10px] font-bold text-white uppercase transition-colors" title="Add Paint & Floor">
                <Sparkles size={12} className="text-amber-400" /> Auto-Fit
            </button>
            <div className="w-px h-4 bg-white/10 my-auto" />
            <button onClick={(e) => { e.stopPropagation(); onAutoFit(node, 'paint'); }} className="p-1.5 hover:bg-white/10 rounded-lg text-indigo-400" title="Add Wall Paint"><PenTool size={12}/></button>
            <button onClick={(e) => { e.stopPropagation(); onAutoFit(node, 'floor'); }} className="p-1.5 hover:bg-white/10 rounded-lg text-emerald-400" title="Add Flooring"><Layout size={12}/></button>
        </div>
    );
};

// ================================
// SENIOR ESTIMATOR AI (SMART AI)
// ================================
const QuoteCopilot = ({ isOpen, onClose, messages, onSendMessage, isTyping, onAction, onGenerateBlueprint }) => {
  const [input, setInput] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  if (!isOpen) return null

  return (
    <div className="fixed bottom-24 right-6 w-96 h-[600px] max-h-[70vh] bg-stone-900/95 border border-white/20 rounded-2xl shadow-2xl flex flex-col z-[100] backdrop-blur-xl animate-fade-in origin-bottom-right">
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg ring-1 ring-white/20">
            <Crown size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Senior Estimator</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Online</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"><X size={18} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 space-y-4">
            <Wand2 size={40} className="opacity-20 animate-pulse" />
            <div className="max-w-[200px]">
                <p className="text-sm font-bold text-gray-400 mb-1">I can build full quotes for you.</p>
                <p className="text-xs">Try "Build a 20m timber fence" or "Full kitchen renovation estimates"</p>
            </div>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[90%] p-3 rounded-2xl text-sm mb-1 ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-stone-800 text-gray-200 border border-white/10 rounded-tl-sm'}`}>
              {msg.content}
            </div>
            {msg.actions && msg.actions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 max-w-[90%]">
                    {msg.actions.map((action, i) => (
                        <button 
                            key={i}
                            onClick={() => onAction(action)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold transition-all group"
                        >
                            <Plus size={12} className="group-hover:scale-110 transition-transform" />
                            {action.type === 'add_node' ? `Add ${action.quantity}x ${action.label}` : 'Action'}
                        </button>
                    ))}
                </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
             <div className="bg-stone-800 p-3 rounded-2xl rounded-tl-sm border border-white/10 flex gap-1">
               <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
               <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-75" />
               <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-150" />
             </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/10 bg-stone-900/50 rounded-b-2xl backdrop-blur-md space-y-2">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (onSendMessage(input), setInput(''))}
            placeholder="Describe scope or ask for advice..."
            className="flex-1 bg-black/30 border border-white/10 rounded-xl pl-4 pr-4 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none placeholder-gray-600"
          />
          <button 
            onClick={() => { onSendMessage(input); setInput('') }}
            disabled={!input.trim()}
            className="p-3 bg-indigo-600 rounded-xl text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20"
          >
            <ArrowRight size={18} />
          </button>
        </div>
        <button 
            onClick={() => { if(input.trim()) { onGenerateBlueprint(input); setInput(''); } else { alert("Please describe what to build first."); } }}
            className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
        >
            <Wand2 size={14} /> Generate Full Blueprint
        </button>
      </div>
    </div>
  )
}

// DimensionNode replaced by masterpiece library version


// ZoneNode replaced by masterpiece library version


// GlassNode replaced by masterpiece library version


// ConfigModal removed


// QuoteSettingsModal removed



const DraggableItem = ({ item, onClick }) => {
  const onDragStart = (event) => { event.dataTransfer.setData('application/reactflow', JSON.stringify(item)); event.dataTransfer.effectAllowed = 'move'; }
  let wrapperClass = "bg-gradient-to-r from-indigo-600 to-violet-700 border-indigo-400/50 shadow-indigo-900/30"; let badgeClass = "bg-indigo-900/40 text-indigo-200 border-indigo-400/30";
  if (item.type === 'staff') { wrapperClass = "bg-gradient-to-r from-emerald-600 to-teal-700 border-emerald-400/50 shadow-emerald-900/30"; badgeClass = "bg-emerald-900/40 text-emerald-200 border-emerald-400/30"; }
  else if (item.type === 'equipment') { wrapperClass = "bg-gradient-to-r from-orange-500 to-amber-600 border-orange-400/50 shadow-orange-900/30"; badgeClass = "bg-orange-900/40 text-orange-200 border-orange-400/30"; }
  const getIcon = () => { if (item.type === 'staff') return <User size={18} className="text-white" strokeWidth={3} />; if (item.type === 'equipment') return <Wrench size={18} className="text-white" strokeWidth={3} />; return <Package size={18} className="text-white" strokeWidth={3} /> }
  return (
    <div draggable onDragStart={onDragStart} onClick={onClick} className={`group relative flex items-center gap-4 p-4 rounded-2xl border-t border-l border-white/20 cursor-grab active:cursor-grabbing transition-all duration-300 shadow-lg ${wrapperClass} hover:brightness-110 active:scale-95`}>
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-2xl pointer-events-none" />
      <div className="relative p-2.5 rounded-xl bg-black/20 shadow-inner ring-1 ring-white/10 group-hover:scale-110 transition-transform">{getIcon()}</div>
      <div className="relative flex-1 min-w-0"><div className="text-sm font-black text-white truncate drop-shadow-md tracking-tight">{item.name}</div><div className="flex items-center gap-2 mt-1"><span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeClass}`}>{item.type === 'staff' ? `$${item.chargeRate}/hr` : item.type === 'equipment' ? `$${item.costRate}/day` : `$${item.pricePerUnit}/unit`}</span></div></div>
      <div className="relative opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 rounded-lg p-1 backdrop-blur-sm"><GripVertical size={14} className="text-white" /></div>
    </div>
  )
}

const QuoteItem = ({ item, onUpdate, onRemove, formatCurrency }) => {
  const [isEditing, setIsEditing] = useState(false)
  const rate = item.customRate !== undefined ? item.customRate : (item.type === 'staff' ? item.material.chargeRate : item.type === 'equipment' ? item.material.costRate : item.material.pricePerUnit);
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 group hover:shadow-md ${item.type === 'staff' ? 'bg-emerald-900/20 border-emerald-500/30' : item.type === 'equipment' ? 'bg-amber-900/20 border-amber-500/30' : 'bg-indigo-900/20 border-indigo-500/30'}`}>
      <div className="flex items-center gap-3 overflow-hidden">
          <div className={`w-1.5 h-10 rounded-full shadow-[0_0_12px_currentColor] ${item.type === 'staff' ? 'bg-emerald-500' : item.type === 'equipment' ? 'bg-orange-500' : 'bg-indigo-500'}`} />
          <div className="space-y-1">
              <div className="bg-stone-900/80 border border-white/10 px-2 py-0.5 rounded-lg"><div className="text-sm font-bold text-white truncate flex-1 min-w-[80px]">{item.material.name}</div></div>
              <div onClick={() => setIsEditing(true)} className="inline-block bg-stone-900/50 border border-white/5 px-2 py-0.5 rounded-md cursor-pointer hover:border-white/30">
                  {isEditing ? (
                      <input 
                          type="number" 
                          className="w-20 bg-stone-800 border border-indigo-500 text-white text-[10px] px-1 rounded outline-none" 
                          defaultValue={rate} 
                          onBlur={(e) => { const val = parseFloat(e.target.value); onUpdate(item.tempId, { customRate: val }); setIsEditing(false) }} 
                          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()} 
                          autoFocus 
                      />
                  ) : (
                      <div className="text-[10px] text-gray-300 font-mono">{formatCurrency(rate)} / unit</div>
                  )}
              </div>
          </div>
      </div>
      <div className="flex items-center gap-4">
          <div className="flex flex-col items-end gap-1">
              <span className="text-[9px] text-gray-400 font-bold uppercase bg-stone-900/50 px-1 rounded">QTY</span>
              {isEditing ? (
                  <input type="number" className="w-14 bg-stone-800 border border-indigo-500 text-white text-xs px-2 py-1 rounded-lg text-right focus:outline-none" defaultValue={item.quantity} onBlur={(e) => { const val = parseFloat(e.target.value); if (val > 0) onUpdate(item.tempId, { quantity: val }); }} onKeyDown={(e) => e.key === 'Enter' && e.target.blur()} />
              ) : (
                  <div onClick={() => setIsEditing(true)} className="bg-stone-900/80 border border-white/10 px-3 py-1 rounded-lg hover:border-indigo-500 cursor-pointer transition-colors"><div className="text-sm font-mono font-bold text-white">{item.quantity.toFixed(2)}</div></div>
              )}
          </div>
          <div className="flex flex-col items-end w-20 sm:w-24 gap-1">
              <span className="text-[9px] text-gray-400 font-bold uppercase bg-stone-900/50 px-1 rounded">Total</span>
              <div className="bg-stone-900/80 border border-white/10 px-2 py-1 rounded-lg w-full text-right"><div className="text-sm font-bold text-emerald-400">{formatCurrency(rate * item.quantity)}</div></div>
          </div>
          <button onClick={() => onRemove(item.tempId)} className="p-2 bg-stone-800 hover:bg-red-900/80 border border-white/10 hover:border-red-500/50 rounded-xl text-gray-400 hover:text-white transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
      </div>
    </div>
  )
}

const initialNodes = []
const initialEdges = []

// ================================
// LOAD QUOTE MODAL
// ================================
const LoadQuoteModal = ({ isOpen, onClose, onLoad, quotes, isLoading }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="w-[600px] max-h-[80vh] bg-stone-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-stone-900">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Load Previous Quote</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={18} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8"><Loader2 className="animate-spin text-indigo-500" /></div>
                    ) : quotes.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm">No quotes found.</div>
                    ) : (
                        quotes.map(q => (
                            <div key={q.id} onClick={() => onLoad(q)} className="p-3 bg-stone-800 hover:bg-stone-700 border border-white/5 hover:border-indigo-500/50 rounded-xl cursor-pointer transition-all group">
                                <div className="flex justify-between items-start mb-1">
                                    <div className="font-bold text-white text-sm">{q.name || 'Untitled Quote'}</div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${q.status==='approved'?'bg-emerald-500/10 text-emerald-400 border-emerald-500/20':'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>{q.status}</span>
                                </div>
                                <div className="flex justify-between items-end text-xs text-gray-400">
                                    <div>
                                        <div>Project: {q.project?.name || 'N/A'}</div>
                                        <div>Last Updated: {new Date(q.updatedAt).toLocaleDateString()}</div>
                                    </div>
                                    <div className="font-mono text-indigo-400">{formatCurrency(q.totalRevenue)}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const QuoteBuilderContent = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const { addNotification } = useNotification()
  const [isSaving, setIsSaving] = useState(false)
  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const nodeTypes = useMemo(() => ({ 
      glass: DiaryNode, 
      dimension: DimensionNode, 
      zone: ZoneNode,
      chronos: ChronosNode,
      impact: ImpactNode,
      delay: DelayNode
  }), [])
  const edgeTypes = useMemo(() => SmartEdgeTypes, []) // Register Smart Edges
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  
  // Data State
  const [materials, setMaterials] = useState([])
  const [staff, setStaff] = useState([])
  const [equipment, setEquipment] = useState([])
  const [projects, setProjects] = useState([])
  const [quoteItems, setQuoteItems] = useState([])
  const [selectedProject, setSelectedProject] = useState(location.state?.projectId || '')
  const [marginPct, setMarginPct] = useState(20)
  
  // UI State
  const [searchTerm, setSearchTerm] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [dropSuccess, setDropSuccess] = useState(false)
  const [pendingNode, setPendingNode] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [quoteSettings, setQuoteSettings] = useState({ clientName: '', clientAddress: '', clientId: null, validUntil: '', terms: '', status: 'DRAFT' })
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showFinancials, setShowFinancials] = useState(true)
  const [showSidebar, setShowSidebar] = useState(true)

  // Feature State
  const [showMap, setShowMap] = useState(false)
  const [projectLocation, setProjectLocation] = useState(null)
  const [showGeoModal, setShowGeoModal] = useState(false)
  const [sitePlan, setSitePlan] = useState(null)
  const [showStreetView, setShowStreetView] = useState(false)
  const [quoteScope, setQuoteScope] = useState('')
  const [isGeneratingScope, setIsGeneratingScope] = useState(false)
  
  // Load Quote State
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [existingQuotes, setExistingQuotes] = useState([]);
  const [quotesLoading, setQuotesLoading] = useState(false);

  // Chat State
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [chatTyping, setChatTyping] = useState(false)
  
  // Pulse & Power Header
  const [isPulseActive, setIsPulseActive] = useState(false);
  const handleAiSuggest = () => { 
      handleAIChat("Review this quote layout and items. Suggest missing systems, safety requirements, or optimizations. Return specific add_node actions if applicable."); 
  };

  const [visibleMaterials, setVisibleMaterials] = useState(20);
  const [visibleStaff, setVisibleStaff] = useState(10);
  const [visibleEquipment, setVisibleEquipment] = useState(10);

  const canvasRef = useRef(null)
  const { screenToFlowPosition, getNodes, fitView } = useReactFlow()

  // Helper to determine edge style
  const getSmartEdgeParams = useCallback((sourceId) => {
      const sourceNode = nodes.find(n => n.id === sourceId);
      const type = sourceNode?.data?.type || 'material';
      
      let edgeType = 'default';
      if (type === 'staff' || type === 'equipment') edgeType = 'orbit';
      else if (type === 'material') edgeType = 'gradient';
      
      return { type: edgeType, data: { type, sourceType: type } };
  }, [nodes]);

  // --- MISSING FUNCTIONS FIX ---
  const onConnect = useCallback((params) => {
      const smartParams = getSmartEdgeParams(params.source);
      setEdges((eds) => addEdge({ ...params, ...smartParams, animated: true }, eds));
  }, [setEdges, getSmartEdgeParams]);

  const updateItem = useCallback((tempId, updates) => {
      setQuoteItems(items => items.map(item => item.tempId === tempId ? { ...item, ...updates } : item));
  }, [setQuoteItems]);

  const handleGenerateScope = async () => {
      if (quoteItems.length === 0) return addNotification('warning', 'Empty Quote', 'Add items before generating scope.');
      setIsGeneratingScope(true);
      try {
          const project = projects.find(p => p.id === selectedProject);
          const res = await api.post('/ai/generate-scope', { 
              items: quoteItems.map(i => ({ name: i.material.name, qty: i.quantity, type: i.type })),
              projectName: project?.name
          });
          setQuoteScope(res.data.scope);
          addNotification('success', 'Scope Generated', 'Professional scope of works ready.');
          setChatMessages(prev => [...prev, { role: 'assistant', content: "I've generated a professional Scope of Works for you. You can review it in the Quote Settings or download it with the PDF." }]);
      } catch (err) {
          console.error(err);
          addNotification('error', 'Generation Error', 'Failed to generate scope.');
      } finally {
          setIsGeneratingScope(false);
      }
  };

  const openLoadModal = async () => {
      setShowLoadModal(true);
      setQuotesLoading(true);
      try {
          const res = await api.get('/quotes?limit=50'); // Fetch last 50 quotes
          setExistingQuotes(res.data.data || []);
      } catch (err) {
          console.error("Failed to load quotes:", err);
          addNotification('error', 'Load Error', 'Could not fetch existing quotes.');
      } finally {
          setQuotesLoading(false);
      }
  };

  const handleLoadQuote = (quote) => {
      if(quoteItems.length > 0 && !confirm("Overwrite current workspace?")) return;
      navigate(`/quotes/${quote.id}`);
      setShowLoadModal(false);
  };

  const handleSave = async () => {
      if (quoteItems.length === 0) return addNotification('warning', 'Empty Quote', 'Add items before saving.');
      if (!selectedProject) return addNotification('warning', 'Project Missing', 'Please select a project.');
      
      setIsSaving(true);
      try {
          const payload = {
              projectId: selectedProject,
              clientId: quoteSettings.clientId,
              clientName: quoteSettings.clientName,
              validUntil: quoteSettings.validUntil,
              terms: quoteSettings.terms,
              status: quoteSettings.status,
              marginPct,
              totalCost: financials.subtotal,
              totalRevenue: financials.total,
              items: quoteItems.map(i => ({
                  type: i.type,
                  quantity: i.quantity,
                  nodeId: i.type === 'material' ? i.nodeId : undefined,
                  staffId: i.type === 'staff' ? i.nodeId : undefined,
                  equipmentId: i.type === 'equipment' ? i.nodeId : undefined,
                  customRate: i.customRate, // Preserve overrides
                  notes: i.notes
              })),
              nodes: nodes.map(n => ({
                  id: n.id,
                  type: n.type,
                  position: n.position,
                  data: n.data
              })),
              edges: edges
          };

          if (id) {
              await api.put(`/quotes/${id}`, payload);
              addNotification('success', 'Quote Updated', 'Changes saved successfully.');
          } else {
              const res = await api.post('/quotes', payload);
              addNotification('success', 'Quote Created', 'New quote saved.');
              navigate(`/quotes/${res.data.id}`);
          }
          // Clear draft
          localStorage.removeItem(`quote_draft_${id || 'new'}`);
      } catch (err) {
          console.error("Save Error:", err);
          addNotification('error', 'Save Failed', 'Could not save quote to database.');
      } finally {
          setIsSaving(false);
      }
  };
  // -----------------------------

  const deleteNode = useCallback((id) => {
    setNodes((nds) => nds.filter(n => n.id !== id))
    setQuoteItems((items) => items.filter(i => i.tempId !== id))
  }, [setNodes])

  const handleAutoFit = useCallback((node, mode) => {
      const width = node.data.width || 200;
      const height = node.data.height || 200;
      const realWidth = width / 20;
      const realLength = height / 20;
      const ceilingHeight = 8;
      
      const floorArea = realWidth * realLength;
      const perimeter = (realWidth + realLength) * 2;
      const wallArea = perimeter * ceilingHeight;

      const itemsToAdd = [];

      const findItem = (key, type) => {
          const match = materials.find(m => m.name.toLowerCase().includes(key));
          if (match) return match;
          return { id: `auto-${key}-${Date.now()}`, name: `${key.charAt(0).toUpperCase() + key.slice(1)} (Standard)`, pricePerUnit: 10, type: 'material' };
      };

      if (mode === 'basic' || mode === 'paint') {
          const paint = findItem('paint', 'material');
          const coverage = MATERIAL_COVERAGE['paint'];
          const qty = Math.ceil((wallArea * coverage.waste) / coverage.coverage);
          itemsToAdd.push({ item: paint, qty, label: 'Wall Paint' });
      }

      if (mode === 'basic' || mode === 'floor') {
          const flooring = findItem('flooring', 'material');
          const coverage = MATERIAL_COVERAGE['flooring'];
          const qty = Math.ceil((floorArea * coverage.waste) / coverage.coverage);
          itemsToAdd.push({ item: flooring, qty, label: 'Flooring' });
      }

      const newNodes = [];
      const newQuoteItems = [];
      
      itemsToAdd.forEach((add, i) => {
          const nodeId = `${add.item.id}-${Date.now()}-${i}`;
          const position = { 
              x: node.position.x + (i * 50) + 20, 
              y: node.position.y + node.data.height + 20 
          };

          newNodes.push({
              id: nodeId,
              type: 'glass',
              position,
              data: { 
                  label: add.item.name, 
                  subLabel: add.label, 
                  quantity: add.qty, 
                  type: 'material',
                  onDelete: () => deleteNode(nodeId)
              }
          });
          
          newQuoteItems.push({
              nodeId: add.item.id,
              tempId: nodeId,
              quantity: add.qty,
              material: add.item,
              type: 'material'
          });
          
          setEdges(eds => addEdge({ id: `e-${node.id}-${nodeId}`, source: node.id, target: nodeId, animated: true, style: { stroke: '#6366f1' } }, eds));
      });

      setNodes(prev => [...prev, ...newNodes]);
      setQuoteItems(prev => [...prev, ...newQuoteItems]);
  }, [materials, deleteNode, setNodes, setEdges, setQuoteItems]);

  // --- GHOST NODE LOGIC ---
  const confirmGhostNode = useCallback((node) => {
      setNodes(nds => nds.map(n => n.id === node.id ? { ...n, data: { ...n.data, isGhost: false, subLabel: 'Confirmed Item' } } : n));
      const newItem = {
          nodeId: node.id,
          tempId: node.id,
          quantity: node.data.quantity || 1,
          material: { name: node.data.label, price: 0 },
          type: node.data.type || 'material',
          isEstimated: true
      };
      setQuoteItems(prev => [...prev, newItem]);
      addNotification('Item confirmed and added to quote', 'success');
  }, [setNodes, setQuoteItems, addNotification]);

  const fetchGhostSuggestions = useCallback(async (node) => {
      if (!node) return;
      try {
          const res = await api.post('/ai/node-suggestions', { selectedNode: node, existingNodes: nodes });
          if (res.data?.suggestions) {
              const newNodes = [];
              const newEdges = [];
              res.data.suggestions.forEach((sugg, i) => {
                  const ghostId = `ghost-${Date.now()}-${i}`;
                  const offset = (i + 1) * 100;
                  const position = { 
                      x: node.position.x + (i % 2 === 0 ? 300 : -300), 
                      y: node.position.y + offset
                  };
                  newNodes.push({
                      id: ghostId,
                      type: 'glass',
                      position,
                      data: {
                          label: sugg.label,
                          subLabel: 'AI Suggestion',
                          type: sugg.type || 'material',
                          quantity: 1,
                          isGhost: true,
                          onDelete: () => deleteNode(ghostId)
                      }
                  });
                  newEdges.push({
                      id: `e-ghost-${node.id}-${ghostId}`,
                      source: node.id,
                      target: ghostId,
                      type: 'neon',
                      animated: true,
                      style: { strokeDasharray: '5,5', opacity: 0.5 }
                  });
              });
              setNodes(prev => [...prev, ...newNodes]);
              setEdges(prev => [...prev, ...newEdges]);
          }
      } catch (err) { console.error("Ghost Node Error:", err); }
  }, [nodes, setNodes, setEdges, deleteNode]);

  const handleNodeClick = useCallback((event, node) => {
      if (!isPulseActive) return;
      if (node.data?.isGhost) { confirmGhostNode(node); } 
      else { fetchGhostSuggestions(node); }
  }, [isPulseActive, confirmGhostNode, fetchGhostSuggestions]);

  useEffect(() => {
      setNodes(nds => nds.map(n => {
          const newData = { ...n.data };
          let changed = false;
          if (!newData.onDelete) {
              newData.onDelete = () => deleteNode(n.id);
              changed = true;
          }
          if (n.type === 'dimension' && !newData.onAutoFit) {
              newData.onAutoFit = handleAutoFit;
              changed = true;
          }
          if ((n.type === 'dimension' || n.type === 'zone') && !newData.onResize) {
               newData.onResize = (e, params) => {
                   setNodes(curr => curr.map(cn => cn.id === n.id ? { 
                     ...cn, 
                     style: { ...cn.style, width: params.width, height: params.height },
                     data: { ...cn.data, width: params.width, height: params.height } 
                   } : cn));
               };
               changed = true;
          }
          return changed ? { ...n, data: newData } : n;
      }));
  }, [handleAutoFit, deleteNode, setNodes, nodes.length]);

  useEffect(() => {
      if (!id) { 
          const savedData = localStorage.getItem('quote_draft_new');
          if (savedData) {
              try {
                  const parsed = JSON.parse(savedData);
                  if (parsed.nodes && nodes.length === 0) {
                      setNodes(parsed.nodes);
                      if (parsed.edges) setEdges(parsed.edges);
                      if (parsed.items) setQuoteItems(parsed.items);
                      if (parsed.chat) setChatMessages(parsed.chat);
                      if (parsed.settings) setQuoteSettings(parsed.settings);
                      if (parsed.project) setSelectedProject(parsed.project);
                  }
              } catch (e) { console.error("Draft Load Error:", e); }
          }
      }
  }, [id]);

  useEffect(() => {
      const draftKey = `quote_draft_${id || 'new'}`;
      const timeout = setTimeout(() => {
          if (nodes.length > 0 || quoteItems.length > 0 || chatMessages.length > 0) {
              const payload = {
                  nodes, edges, items: quoteItems, chat: chatMessages, 
                  settings: quoteSettings, project: selectedProject, timestamp: Date.now()
              };
              localStorage.setItem(draftKey, JSON.stringify(payload));
          }
      }, 1000);
      return () => clearTimeout(timeout);
  }, [nodes, edges, quoteItems, chatMessages, quoteSettings, selectedProject, id]);

  useEffect(() => {
    if (selectedProject && projects.length > 0) {
       const proj = projects.find(p => p.id === selectedProject)
       if (proj) {
         setQuoteSettings(prev => ({
            ...prev,
            clientId: proj.clientId || prev.clientId, 
            clientName: proj.client || proj.clientDetails?.name || prev.clientName,
            clientAddress: proj.clientDetails?.address || prev.clientAddress
         }))
         if (proj.site && window.google) {
             const geocoder = new window.google.maps.Geocoder();
             geocoder.geocode({ address: proj.site }, (results, status) => {
                 if (status === 'OK' && results[0]) {
                     const loc = results[0].geometry.location;
                     setProjectLocation({ lat: loc.lat(), lng: loc.lng() });
                     setShowMap(true);
                 }
             });
         }
       }
    }
  }, [selectedProject, projects])

  useEffect(() => {
    const fetchData = async () => {
      setDataLoading(true)
      try {
        const [n, s, e, p] = await Promise.all([
          api.get('/nodes'), api.get('/staff'), api.get('/equipment'), api.get('/projects')
        ])
        setMaterials(n.data.data || n.data || [])
        setStaff((s.data.data || s.data || []).map(x => ({...x, type: 'staff', payRate: x.payRateBase, chargeRate: x.chargeOutBase})))
        setEquipment((e.data.data || e.data || []).map(x => ({...x, type: 'equipment', costRate: x.costRateBase})))
        setProjects(p.data.data || p.data || [])
      } catch (err) { 
          console.error(err);
          addNotification('error', 'Connection Error', 'Failed to load resources. Please refresh.');
      } finally {
          setDataLoading(false);
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (!id || (materials.length === 0 && staff.length === 0 && equipment.length === 0)) return
    const loadQuote = async () => {
      const draftKey = `quote_draft_${id}`;
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
          try {
             const parsed = JSON.parse(savedDraft);
             if (parsed.timestamp > (Date.now() - 24*60*60*1000)) { 
                 setNodes(parsed.nodes);
                 if (parsed.edges) setEdges(parsed.edges);
                 if (parsed.items) setQuoteItems(parsed.items);
                 if (parsed.chat) setChatMessages(parsed.chat);
                 if (parsed.settings) setQuoteSettings(parsed.settings);
                 if (parsed.project) setSelectedProject(parsed.project);
                 return;
             }
          } catch(e) { console.error("Draft parsing failed, falling back to DB", e); }
      }
      try {
        const res = await api.get(`/quotes/${id}`)
        const quote = res.data
        setSelectedProject(quote.projectId)
        setMarginPct(quote.marginPct)
        setQuoteSettings({
           clientName: quote.clientName || quote.clientDetails?.name || '', 
           clientAddress: quote.clientDetails?.address || '',
           clientId: quote.clientId || null,
           validUntil: quote.validUntil || '',
           terms: quote.terms || '',
           status: quote.status || 'DRAFT'
        })
        const loadedItems = []
        const loadedNodes = []
        const processItem = (item, type, list) => {
           const refItem = list.find(x => x.id === (item.nodeId || item.staffId || item.equipmentId))
           if (!refItem) return
           const tempId = `${type}-${refItem.id}-${Date.now()}-${Math.random()}`
           loadedNodes.push({
              id: tempId,
              type: 'glass',
              position: { x: Math.random() * 800, y: Math.random() * 600 }, 
              data: {
                 label: refItem.name,
                 subLabel: type,
                 quantity: item.quantity || item.hours,
                 type: type,
                 onDelete: () => deleteNode(tempId)
              }
           })
           loadedItems.push({
              nodeId: refItem.id,
              tempId: tempId,
              quantity: item.quantity || item.hours,
              material: refItem,
              type: type
           })
        }
        quote.nodes?.forEach(i => processItem(i, 'material', materials))
        quote.staff?.forEach(i => processItem(i, 'staff', staff))
        quote.equipment?.forEach(i => processItem(i, 'equipment', equipment))
        setNodes(loadedNodes)
        setQuoteItems(loadedItems)
        setTimeout(() => fitView({ padding: 0.2 }), 100)
      } catch (err) {
        console.error('Error loading quote:', err)
        alert('Failed to load quote details.')
      }
    }
    loadQuote()
  }, [id, materials, staff, equipment, fitView])

  const handleAIChat = async (message) => {
    if (!message.trim()) return
    setChatMessages(prev => [...prev, { role: 'user', content: message }])
    setChatTyping(true)
    try {
      const context = {
        project: projects.find(p => p.id === selectedProject) || {},
        items: quoteItems.map(i => ({ name: i.material.name, qty: i.quantity, type: i.type })),
        dimensions: nodes.filter(n => n.type === 'dimension').map(n => ({ 
           label: n.data.label, 
           area: ((n.data.width/20)*(n.data.height/20)).toFixed(1) + ' sqft' 
        })),
        settings: quoteSettings
      }
      const res = await api.post('/ai/chat-quote', { message, context })
      const { reply, suggestedActions } = res.data;
      setChatMessages(prev => [...prev, { role: 'assistant', content: reply, actions: suggestedActions }])
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to the server." }])
    } finally {
      setChatTyping(false)
    }
  }

  const handleGenerateBlueprint = async (prompt) => {
      setIsGeneratingBlueprint(true);
      setChatMessages(prev => [...prev, { role: 'user', content: `Generate Blueprint: ${prompt}` }]);
      try {
          const res = await api.post('/ai/quote', { prompt });
          const { nodes: aiNodes, edges: aiEdges } = res.data;
          if (aiNodes && aiNodes.length > 0) {
              addNotification('success', 'Blueprint Generated', 'AI has constructed the visual quote.');
              const newNodes = [];
              const newItems = [];
              const mapType = (t) => {
                  if (t === 'staff-resource') return 'staff';
                  if (t === 'equipment-resource') return 'equipment';
                  return 'material';
              };
              aiNodes.forEach(rawNode => {
                  let n = rawNode;
                  if (!n.data) {
                      n = {
                          id: rawNode.id || rawNode.nodeId || `ai-${Math.random().toString(36).substr(2, 9)}`,
                          type: rawNode.type || 'material',
                          position: rawNode.position || { x: 0, y: 0 },
                          data: rawNode
                      };
                  }
                  if (!n.data) return;
                  const frontendType = n.type === 'dimension' ? 'dimension' : 'glass';
                  const itemType = mapType(n.type);
                  let refItem = null;
                  const targetId = n.data.nodeId;
                  const targetName = n.data.label;
                  if (itemType === 'staff') {
                      refItem = staff.find(s => s.id === targetId) || (targetName ? staff.find(s => s.name === targetName) : null);
                  } else if (itemType === 'equipment') {
                      refItem = equipment.find(e => e.id === targetId) || (targetName ? equipment.find(e => e.name === targetName) : null);
                  } else if (n.type !== 'dimension') {
                      refItem = materials.find(m => m.id === targetId) || (targetName ? materials.find(m => m.name === targetName) : null);
                  }
                  if (!refItem && n.type !== 'dimension') {
                      refItem = {
                          id: `ai-${Date.now()}-${Math.random()}`,
                          name: n.data.label || 'Unknown Item',
                          pricePerUnit: n.data.cost || 0,
                          chargeRate: n.data.cost || 0,
                          costRate: n.data.cost || 0,
                          type: itemType
                      };
                  }
                  const nodeId = n.id; 
                  newNodes.push({
                      id: nodeId,
                      type: frontendType,
                      position: (n.position && typeof n.position.x === 'number') ? n.position : { x: 0, y: newNodes.length * 250 },
                      data: {
                          ...n.data,
                          type: itemType,
                          subLabel: itemType,
                          label: n.data.label,
                          quantity: n.data.quantity,
                          onDelete: () => deleteNode(nodeId)
                      },
                      style: n.type === 'dimension' ? { width: 200, height: 200 } : undefined
                  });
                  if (n.type !== 'dimension' && refItem) {
                      newItems.push({
                          nodeId: refItem.id,
                          tempId: nodeId,
                          quantity: n.data.quantity,
                          material: refItem,
                          type: itemType,
                          customRate: n.data.cost > 0 ? n.data.cost : undefined 
                      });
                  }
              });
              setNodes(prev => [...prev, ...newNodes]);
              
              // --- SMART EDGE MAPPING ---
              const enhancedEdges = aiEdges.map(e => {
                  let edgeType = 'default';
                  const source = newNodes.find(n => n.id === e.source);
                  if (source) {
                      const type = source.data.type;
                      if (type === 'staff' || type === 'equipment') edgeType = 'orbit';
                      else if (type === 'material') edgeType = 'gradient';
                  }
                  return { 
                      ...e, 
                      id: `e-${window.crypto.randomUUID()}`, 
                      type: edgeType,
                      animated: true 
                  };
              });
              setEdges(prev => [...prev, ...enhancedEdges]);
              // --------------------------

              setQuoteItems(prev => [...prev, ...newItems]);
              setChatMessages(prev => [
                  ...prev, 
                  { role: 'assistant', content: "Blueprint generated successfully! I've applied standard construction logic, waste factors, and productivity rates." },
                  { role: 'assistant', content: "⚠️ IMPORTANT: Please review all quantities and costs. While I use industry benchmarks, site-specific conditions may require adjustments. You have final responsibility for this quote." }
              ]);
              setTimeout(() => fitView({ padding: 0.2 }), 500);
          }
      } catch (err) {
          console.error(err);
          setChatMessages(prev => [...prev, { role: 'assistant', content: "I encountered an error generating the blueprint." }]);
          addNotification('error', 'Generation Error', 'Failed to generate blueprint.');
      } finally {
          setChatTyping(false);
          setIsGeneratingBlueprint(false);
      }
  };

  const handleCopilotAction = (action) => {
      if (action.type === 'add_node') {
          let item = null;
          if (action.category === 'staff') item = staff.find(s => s.name.toLowerCase().includes(action.label.toLowerCase()));
          else if (action.category === 'equipment') item = equipment.find(e => e.name.toLowerCase().includes(action.label.toLowerCase()));
          else item = materials.find(m => m.name.toLowerCase().includes(action.label.toLowerCase()));
          if (!item) {
              item = {
                  id: `ai-${Date.now()}`,
                  name: action.label,
                  pricePerUnit: action.cost || 0,
                  chargeRate: action.cost || 0,
                  costRate: action.cost || 0,
                  type: action.category
              };
          }
          setPendingNode({ 
              item, 
              position: screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 }), 
              suggestedQuantity: action.quantity || 1 
          });
      }
  };

  const onTapAdd = (item) => {
    const position = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
    let suggestedQty = null
    const coverageKey = Object.keys(MATERIAL_COVERAGE).find(k => item.name.toLowerCase().includes(k))
    if (coverageKey) {
       suggestedQty = Math.ceil((100 * MATERIAL_COVERAGE[coverageKey].waste) / MATERIAL_COVERAGE[coverageKey].coverage)
    } else {
       suggestedQty = 1
    }
    setPendingNode({ item, position, suggestedQuantity: suggestedQty })
    if (window.innerWidth < 1024) setShowSidebar(false)
  }

  const addDimensionNode = () => {
    const id = `dim-${Date.now()}`
    const newNode = {
      id,
      type: 'dimension',
      position: screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 }),
      style: { width: 200, height: 200 },
      data: { 
        label: `Room ${nodes.filter(n => n.type === 'dimension').length + 1}`,
        width: 200, 
        height: 200,
        onDelete: () => deleteNode(id),
        onResize: (e, params) => {
           setNodes(nds => nds.map(n => n.id === id ? { 
             ...n, 
             style: { ...n.style, width: params.width, height: params.height },
             data: { ...n.data, width: params.width, height: params.height } 
           } : n))
        },
        onAutoFit: handleAutoFit
      }
    }
    setNodes(nds => nds.concat(newNode))
  }

  const addZoneNode = () => {
    const id = `zone-${Date.now()}`
    const newNode = {
       id, 
       type: 'zone',
       position: screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 }),
       style: { width: 400, height: 400, zIndex: -1 },
       data: {
          label: `Zone ${nodes.filter(n => n.type === 'zone').length + 1}`,
          onDelete: () => deleteNode(id)
       }
    }
    setNodes(nds => nds.concat(newNode))
  }

  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
  }, [])

  const onDragLeave = () => setIsDragOver(false)

  // --- MASTERPIECE RESTRUCTURE ENGINE ---
  const restructureLayout = useCallback(() => {
      const zones = nodes.filter(n => n.type === 'zone');
      const dimensions = nodes.filter(n => n.type === 'dimension');
      const resources = nodes.filter(n => n.type === 'glass');
      
      const newNodes = nodes.map(node => {
          let position = { ...node.position };
          
          if (node.type === 'zone') {
              const idx = zones.findIndex(n => n.id === node.id);
              position = { x: idx * 800, y: 0 };
          } else if (node.type === 'dimension') {
              const idx = dimensions.findIndex(n => n.id === node.id);
              position = { x: idx * 400, y: -400 }; // Header row
          } else if (node.type === 'glass') {
              const parentEdge = edges.find(e => e.target === node.id);
              if (parentEdge) {
                  const siblings = edges.filter(e => e.source === parentEdge.source);
                  const sibIdx = siblings.findIndex(e => e.target === node.id);
                  const parentNode = nodes.find(n => n.id === parentEdge.source);
                  
                  if (parentNode) {
                      position = { 
                          x: parentNode.position.x + (sibIdx % 2 === 0 ? 200 : -200), 
                          y: parentNode.position.y + 350 + (Math.floor(sibIdx / 2) * 250) 
                      };
                  }
              }
          }
          return { ...node, position };
      });

      setNodes(newNodes);
      setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 100);
      addNotification('success', 'Layout Restructured', 'Operational graph organized.');
  }, [nodes, edges, setNodes, fitView, addNotification]);

  const onDrop = useCallback((event) => {
    event.preventDefault()
    setIsDragOver(false)
    const type = event.dataTransfer.getData('application/reactflow')
    if (!type) return
    const item = JSON.parse(type)
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY })
    const droppedOnNode = getNodes().find(n => 
       n.type === 'dimension' && 
       position.x >= n.position.x && position.x <= n.position.x + (n.style?.width || 200) &&
       position.y >= n.position.y && position.y <= n.position.y + (n.style?.height || 200)
    )
    let suggestedQty = null
    if (droppedOnNode) {
       const width = droppedOnNode.data.width || 200
       const height = droppedOnNode.data.height || 200
       const realWidth = width / 20;
       const realLength = height / 20;
       const floorArea = realWidth * realLength;
       const perimeter = (realWidth + realLength) * 2;
       const wallArea = perimeter * 8; 
       const coverageKey = Object.keys(MATERIAL_COVERAGE).find(k => item.name.toLowerCase().includes(k))
       if (coverageKey) {
         const info = MATERIAL_COVERAGE[coverageKey]
         let metric = floorArea; 
         if (info.type === 'wall') metric = wallArea;
         if (info.type === 'linear') metric = perimeter;
         const denom = info.coverage || 1; 
         suggestedQty = Math.ceil((metric * info.waste) / denom)
       } else {
         suggestedQty = Math.ceil(floorArea) 
       }
    }
    setPendingNode({ item, position, suggestedQuantity: suggestedQty })
  }, [screenToFlowPosition, getNodes])

  const handleAddNode = (quantity, cost, charge) => {
    if (!pendingNode) return
    const { item, position } = pendingNode
    const nodeId = `${item.type || 'material'}-${item.id}-${Date.now()}`
    const newNode = {
      id: nodeId,
      type: 'glass',
      position,
      data: { 
        label: item.name, 
        subLabel: item.category || item.role || 'Material',
        quantity: quantity, 
        type: item.type || 'material',
        onDelete: () => deleteNode(nodeId)
      }
    }
    setNodes(nds => nds.concat(newNode))
    const newItem = { 
        nodeId: item.id, 
        tempId: nodeId, 
        quantity: quantity, 
        material: item, 
        type: item.type || 'material',
        customRate: charge > 0 ? charge : undefined 
    }
    setQuoteItems(prev => [...prev, newItem])
    setDropSuccess(true)
    setTimeout(() => setDropSuccess(false), 600)
    setPendingNode(null)
  }

  const handleNewQuote = () => {
      if(quoteItems.length > 0 && !confirm("Discard current quote?")) return;
      setNodes([]);
      setEdges([]);
      setQuoteItems([]);
      setSelectedProject('');
      setQuoteSettings({ clientName: '', clientId: null, validUntil: '', terms: '', status: 'DRAFT' });
  };

  const financials = useMemo(() => {
      const materials = quoteItems.filter(i => i.type === 'material').reduce((acc, i) => acc + (i.quantity * (i.customRate || i.material?.price || 0)), 0);
      const staff = quoteItems.filter(i => i.type === 'staff').reduce((acc, i) => acc + (i.quantity * (i.customRate || i.material?.hourlyRate || 0)), 0);
      const equipment = quoteItems.filter(i => i.type === 'equipment').reduce((acc, i) => acc + (i.quantity * (i.customRate || i.material?.dailyRate || 0)), 0);
      const subtotal = materials + staff + equipment;
      const total = subtotal * (1 + marginPct / 100);
      return { materials, staff, equipment, subtotal, total };
  }, [quoteItems, marginPct]);

  const stats = [
      { label: 'Materials', value: formatCurrency(financials.materials), color: 'text-indigo-400' },
      { label: 'Labor', value: formatCurrency(financials.staff), color: 'text-emerald-400' },
      { label: 'Equipment', value: formatCurrency(financials.equipment), color: 'text-amber-400' },
      { label: 'Total', value: formatCurrency(financials.total), color: 'text-white' },
      { label: 'Margin', value: `${marginPct}%`, color: 'text-blue-400' }
  ];

  return (
    <div className="h-[calc(100vh-80px)] bg-transparent flex flex-col font-sans overflow-hidden text-white relative">
      <GeoreferenceModal isOpen={showGeoModal} onClose={() => setShowGeoModal(false)} onSave={(data) => { setSitePlan(data); setShowMap(true); if(data.bounds) setProjectLocation({ lat: (data.bounds.north+data.bounds.south)/2, lng: (data.bounds.east+data.bounds.west)/2 }); }} />
      <QuoteSettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} settings={quoteSettings} setSettings={setQuoteSettings} projects={projects} selectedProject={selectedProject} />
      <GoogleServicesSuggestions isOpen={showSuggestions} onClose={() => setShowSuggestions(false)} />
      <LoadQuoteModal isOpen={showLoadModal} onClose={() => setShowLoadModal(false)} onLoad={handleLoadQuote} quotes={existingQuotes} isLoading={quotesLoading} />
      
      {showMap && <div className="absolute inset-0 z-0 animate-fade-in"><MapBackground activeLocation={projectLocation} onLocationSelect={setProjectLocation} overlayImage={sitePlan} /></div>}

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

        <div className="max-w-[1800px] mx-auto w-full pt-4 px-4 relative z-20">
            <PowerHeader 
                title="Quote Builder" 
                icon={Crown}
                stats={stats}
                isPulseActive={isPulseActive}
                onPulseToggle={() => setIsPulseActive(!isPulseActive)}
                onAiSuggest={handleAiSuggest}
            >
                {/* Controls */}
                <div className="flex bg-black/40 rounded-xl p-1 border border-white/10 mr-2">
                    <button onClick={restructureLayout} className="p-2.5 rounded-lg text-amber-400 hover:text-white hover:bg-amber-600/50 transition-colors" title="Restructure Masterpiece"><Zap size={18} /></button>
                    <div className="w-px h-6 bg-white/10 mx-1 my-auto"></div>
                    <button onClick={addDimensionNode} className="p-2.5 rounded-lg text-blue-400 hover:text-white hover:bg-blue-600/50 transition-colors" title="Add Room"><Ruler size={18} /></button>
                    <button onClick={addZoneNode} className="p-2.5 rounded-lg text-purple-400 hover:text-white hover:bg-purple-600/50 transition-colors" title="Add Zone"><Layout size={18} /></button>
                    <button onClick={() => setShowGeoModal(true)} className="p-2.5 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-600/50 transition-colors" title="Upload Plan"><UploadCloud size={18} /></button>
                    <div className="w-px h-6 bg-white/10 mx-1 my-auto"></div>
                    <button onClick={() => setShowMap(!showMap)} className={`p-2.5 rounded-lg transition-colors ${showMap ? 'text-white bg-indigo-600' : 'text-gray-400 hover:text-white'}`} title="Map Toggle"><MapPin size={18} /></button>
                    <button onClick={() => fitView()} className="p-2.5 rounded-lg text-gray-400 hover:text-white transition-colors" title="Fit"><Focus size={18} /></button>
                </div>

                <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} className="px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white font-bold min-w-[180px] hover:border-indigo-500 transition-colors cursor-pointer text-sm"><option value="">Select Project...</option>{projects.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}</select>
                
                <button onClick={openLoadModal} className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-gray-300 border border-white/10 hover:text-white rounded-xl font-bold transition-all text-xs uppercase tracking-wider flex items-center gap-2"><Folder size={16} /> Load</button>
                <button onClick={handleNewQuote} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-xl font-bold transition-all text-xs uppercase tracking-wider flex items-center gap-2"><Plus size={16} /> New</button>
                <button onClick={handleGenerateScope} disabled={isGeneratingScope} className="px-4 py-2.5 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white rounded-xl font-bold transition-all text-xs uppercase tracking-wider flex items-center gap-2">
                    {isGeneratingScope ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />} 
                    Scope
                </button>
                <button onClick={() => navigate('/invoices', { state: { 
                    quoteItems: quoteItems, 
                    projectId: selectedProject, 
                    clientId: quoteSettings.clientId,
                    clientName: quoteSettings.clientName,
                    clientAddress: quoteSettings.clientAddress
                } })} className="px-4 py-2.5 bg-purple-600/20 text-purple-400 border border-purple-500/30 hover:bg-purple-600 hover:text-white rounded-xl font-bold transition-all text-xs uppercase tracking-wider flex items-center gap-2"><FileText size={16} /> Invoice</button>
                <button onClick={() => generateQuotePDF({ 
                    id: 'DRAFT', 
                    name: 'Quote', 
                    scope: quoteScope,
                    items: quoteItems.map(i => ({ 
                        name: i.material.name, 
                        type: i.type, 
                        quantity: i.quantity, 
                        rate: i.type==='staff'?i.material.chargeRate:i.type==='equipment'?i.material.costRate:i.material.pricePerUnit 
                    })), 
                    totalRevenue: financials.total, 
                    marginPct 
                }, projects.find(p=>p.id===selectedProject), quoteSettings)} className="p-2.5 bg-stone-800 text-gray-300 hover:text-white rounded-xl border border-white/10 transition-all"><Download size={18} /></button>
                <button onClick={handleSave} disabled={isSaving} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black uppercase tracking-widest shadow-xl transition-all disabled:opacity-50 text-xs">{isSaving ? 'Saving...' : 'Save'}</button>
                <button onClick={() => setShowSettings(true)} className="p-2.5 bg-stone-800 text-gray-400 hover:text-white rounded-xl border border-white/10 transition-all"><Settings size={18} /></button>
            </PowerHeader>
        </div>

        <div className="flex-1 flex overflow-hidden relative">
          <div 
            className={`fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${showSidebar ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setShowSidebar(false)}
          />

          <ResourceSidebar 
              isOpen={showSidebar} 
              onClose={() => setShowSidebar(false)}
              materials={materials}
              staff={staff}
              equipment={equipment}
              onSearch={setSearchTerm}
              onTapAdd={onTapAdd}
          />

          <div className="flex-1 flex flex-col relative bg-transparent overflow-hidden">
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[size:40px_40px] bg-[linear-gradient(to_right,#4f46e5_1px,transparent_1px),linear-gradient(to_bottom,#4f46e5_1px,transparent_1px)]" />
            <div ref={canvasRef} className={`flex-1 rounded-3xl relative overflow-hidden m-6 transition-all duration-500 ${isDragOver ? 'border-4 border-indigo-500 bg-indigo-900/20' : 'border-2 border-white/5 bg-stone-900/40 shadow-2xl'} backdrop-blur-sm`} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
              <div style={{ width: '100%', height: '100%' }}>
                <ReactFlow 
                   nodes={nodes} 
                   edges={edges} 
                   nodeTypes={nodeTypes} 
                   edgeTypes={edgeTypes}
                   onNodesChange={onNodesChange} 
                   onEdgesChange={onEdgesChange} 
                   onConnect={onConnect} 
                   onNodeClick={handleNodeClick}
                   snapToGrid={true} 
                   snapGrid={[20, 20]} 
                   fitView 
                   minZoom={0.05} // Infinite zoom out
                   maxZoom={2}
                   proOptions={{ hideAttribution: true }}
                >
                  <Background color="#6366f1" gap={40} size={1} className="opacity-[0.05]" />
                  <Controls className="!bg-stone-900 !border-white/10 !text-white !rounded-lg" />
                  <MiniMap className="!bg-stone-900 !border-white/10 !rounded-lg" nodeColor={n => n.type==='dimension'?'#3b82f6':n.type==='zone'?'#a855f7':'#6366f1'} />
                </ReactFlow>

                {/* AI DISCLAIMER BANNER */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                    <div className="bg-amber-500/10 backdrop-blur-md border border-amber-500/30 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-xl">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                        <span className="text-[10px] font-black text-amber-200 uppercase tracking-widest">Human Review Required</span>
                    </div>
                </div>
              </div>
            </div>

            <div className="h-64 bg-stone-900 border-t border-white/10 flex flex-col z-20 shadow-2xl">
              <div className="px-6 py-2 border-b border-white/5 flex justify-between items-center bg-stone-900/95">
                <h3 className="text-xs font-black text-gray-300 uppercase">Items ({quoteItems.length})</h3>
                <div className="text-[9px] text-amber-500/80 font-bold uppercase flex items-center gap-1.5">
                    <Sparkles size={10} /> AI Assisted Quantities - Verify Before Use
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-stone-950/50 space-y-2">{quoteItems.map(item => <QuoteItem key={item.tempId} item={item} onUpdate={updateItem} onRemove={deleteNode} formatCurrency={formatCurrency} />)}</div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-24 right-6 z-50">
          {!showChat && (
            <button 
              onClick={() => setShowChat(true)}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 shadow-[0_0_30px_rgba(99,102,241,0.6)] flex items-center justify-center text-white hover:scale-110 transition-transform animate-bounce-slow"
            >
              <Sparkles size={24} />
            </button>
          )}
          <QuoteCopilot 
            isOpen={showChat} 
            onClose={() => setShowChat(false)} 
            messages={chatMessages} 
            onSendMessage={handleAIChat} 
            isTyping={chatTyping} 
            onAction={handleCopilotAction}
            onGenerateBlueprint={handleGenerateBlueprint} 
          />
        </div>

      </div>
    </div>
  )
}

const QuoteBuilder = () => <ReactFlowProvider><QuoteBuilderContent /></ReactFlowProvider>

export default QuoteBuilder
