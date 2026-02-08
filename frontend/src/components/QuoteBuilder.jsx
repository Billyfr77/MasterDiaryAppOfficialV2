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
import { motion, AnimatePresence } from 'framer-motion'
import '@xyflow/react/dist/style.css'
import { 
  User, Wrench, Package, Plus, Save, Search, Trash2,
  Crown, List, GripVertical, CheckCircle2, X, Sparkles, MapPin, Eye, EyeOff, UploadCloud,
  Settings, FileText, Download, Calendar, FileType, Ruler, PenTool, MessageSquare, Send, Calculator, Maximize, Minimize,
  Layout, Focus, Image as ImageIcon, Zap, DollarSign, Wand2, ArrowRight, Loader2, Folder, Palette, GraduationCap, Cpu, BrainCircuit, Mic
} from 'lucide-react'
import { useNotification } from '../context/NotificationContext'
import { useUI } from '../context/UIContext'
import { api } from '../utils/api'
import CountUp from 'react-countup'
import MapBackground from './MapBackground'
import GeoreferenceModal from './GeoreferenceModal'
import GoogleServicesSuggestions from './GoogleServicesSuggestions'
import { generateQuotePDF } from '../utils/pdfGenerator'
import ClientSelector from './Clients/ClientSelector'
import { syncManager } from '../utils/syncManager'
import PowerHeader from './ui/PowerHeader'
import VideoBeacon from './ui/VideoBeacon'
import { useDiaryTheme } from './PaintDiary/ThemeContext'
import QuoteSettingsModal from './Quotes/QuoteSettingsModal'
import ConfigModal from './ConfigModal'
import ConflictResolver from './ui/ConflictResolver'
import { AreaNode, QuoteMaterialNode, QuoteLabourNode, ProfitNode, EstimationPrismNode, MaterialYieldNode, LabourEstimatorNode } from './Quotes/QuoteNodes';
import { DiaryNode, ChronosNode, ZoneNode, ImpactNode, DelayNode, DimensionNode, PhotoNode, ShapeNode, TaskNode, NeuralPrismNode, WormholeNode, AllowanceNode } from './TimelineCanvas/TimelineNodes';
import { SmartEdgeTypes } from './TimelineCanvas/SmartEdges'
import ResourceSidebar from './ResourceSidebar'
import AestheticPicker from './PaintDiary/AestheticPicker'
import QuoteIntelligenceLayer from './Quotes/QuoteIntelligenceLayer'
import PremiumLoader from './ui/PremiumLoader'

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount || 0)
}

const getSmartDefaults = (name) => {
    const n = (name || '').toLowerCase();
    // --- MASONRY ---
    if (n.includes('brick')) return { coverage: 50, unit: 'Bricks/m²', waste: 5, type: 'wall' };
    if (n.includes('block') || n.includes('cmu')) return { coverage: 12.5, unit: 'Blocks/m²', waste: 5, type: 'wall' };
    // --- CONCRETE ---
    if (n.includes('concrete') || n.includes('slab')) return { coverage: 0.1, unit: 'm³/m² (100mm)', waste: 5, type: 'floor' };
    if (n.includes('rio') || n.includes('mesh')) return { coverage: 1, unit: 'Sheets/m²', waste: 10, type: 'floor' };
    // --- PAINT & FINISH ---
    if (n.includes('paint') || n.includes('primer') || n.includes('sealer')) return { coverage: 12, unit: 'm²/L', waste: 10, type: 'wall' };
    if (n.includes('plaster') || n.includes('gyprock') || n.includes('board')) return { coverage: 3, unit: 'm²/Sheet', waste: 15, type: 'wall' };
    if (n.includes('tile')) return { coverage: 1.44, unit: 'm²/Box', waste: 10, type: 'floor' };
    // --- TIMBER ---
    if (n.includes('stud') || n.includes('framing')) return { coverage: 2.5, unit: 'Lm/m²', waste: 15, type: 'wall' };
    if (n.includes('decking')) return { coverage: 11, unit: 'Lm/m²', waste: 10, type: 'floor' };
    if (n.includes('flooring')) return { coverage: 2, unit: 'm²/Pack', waste: 5, type: 'floor' };
    // --- DEFAULT ---
    return { coverage: 10, unit: 'Units/m²', waste: 10, type: 'wall' };
};

const QuoteCopilot = ({ isOpen, onClose, messages, onSendMessage, isTyping, onAction, onGenerateBlueprint }) => {
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [voiceTranscript, setVoiceTranscript] = useState('')
  const scrollRef = useRef(null)
  
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight }, [messages])

  const startVoiceInput = () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
          alert("Voice input not supported in this browser.");
          return;
      }
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
          setIsListening(true);
          setVoiceTranscript('');
      };
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                  const final = event.results[i][0].transcript;
                  setInput(prev => prev + (prev ? ' ' : '') + final);
                  setVoiceTranscript('');
              } else {
                  interim += event.results[i][0].transcript;
                  setVoiceTranscript(interim);
              }
          }
      };
      recognition.start();
  };

  if (!isOpen) return null
  
  const hints = [
      "Analyze this quote for missing items",
      "Suggest a complete setup for a timber deck",
      "Add site preparation and safety costs",
      "Optimize my labor estimation"
  ];

  return (
    <div className="fixed bottom-24 right-6 w-96 h-[600px] max-h-[70vh] bg-stone-900/95 border border-white/20 rounded-2xl shadow-2xl flex flex-col z-[100] backdrop-blur-xl animate-fade-in">
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-indigo-900/50 to-purple-900/50 rounded-t-2xl">
        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"><Crown size={20} className="text-white" /></div><div><h3 className="text-sm font-black text-white uppercase tracking-wider">Senior Estimator</h3><div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span><span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Online</span></div></div></div>
        <button onClick={onClose} className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"><X size={18} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" ref={scrollRef}>
        {messages.length === 0 && (
            <div className="flex flex-col gap-2 mt-4 opacity-0 animate-slide-up" style={{ animationFillMode: 'forwards' }}>
                <div className="text-center text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Quick Actions</div>
                {hints.map((hint, i) => (
                    <button 
                        key={i} 
                        onClick={() => onSendMessage(hint)}
                        className="text-left px-4 py-3 bg-white/5 hover:bg-indigo-500/20 border border-white/5 hover:border-indigo-500/30 rounded-xl text-xs text-gray-300 hover:text-white transition-all"
                    >
                        {hint}
                    </button>
                ))}
            </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[90%] p-3 rounded-2xl text-sm mb-1 ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-stone-800 text-gray-200 border border-white/10 rounded-tl-sm'}`}>{msg.content}</div>
            {msg.actions?.map((action, i) => (
                <button key={i} onClick={() => onAction(action)} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold transition-all mt-2">
                    <Plus size={12} /> {action.type === 'add_node' ? `Add ${action.quantity}x ${action.label}` : action.type === 'add_complex_node' ? action.label : 'Action'}
                </button>
            ))}
          </div>
        ))}
        {isTyping && <div className="flex justify-start"><div className="bg-stone-800 p-3 rounded-2xl flex gap-1"><span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" /><span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-75" /><span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-150" /></div></div>}
      </div>
      <div className="p-4 border-t border-white/10 bg-stone-900/50 rounded-b-2xl backdrop-blur-md space-y-2">
        <div className="relative flex flex-col gap-2">
          {isListening && voiceTranscript && (
              <div className="text-[10px] text-indigo-400 font-bold uppercase animate-pulse mb-1">
                  Transcribing: {voiceTranscript}
              </div>
          )}
          <div className="relative flex items-center gap-2">
            <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (onSendMessage(input), setInput(''))} placeholder={isListening ? "Listening..." : "Describe scope..."} className="flex-1 bg-black/30 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-sm text-white focus:border-indigo-500 outline-none placeholder-gray-600" />
            <button onClick={startVoiceInput} className={`absolute right-14 p-1.5 rounded-lg transition-colors ${isListening ? 'text-rose-500 animate-pulse' : 'text-gray-400 hover:text-white'}`}>
               <Mic size={18} />
            </button>
            <button onClick={() => { onSendMessage(input); setInput('') }} disabled={!input.trim()} className="p-3 bg-indigo-600 rounded-xl text-white hover:bg-indigo-500 disabled:opacity-50 transition-all"><ArrowRight size={18} /></button>
          </div>
        </div>
        <button onClick={() => { if(input.trim()) { onGenerateBlueprint(input); setInput(''); } }} className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"><Wand2 size={14} /> Generate Full Blueprint</button>
      </div>
    </div>
  )
}

const QuoteItem = ({ item, onUpdate, onRemove, formatCurrency }) => {
  const [isEditing, setIsEditing] = useState(false)
  const rate = useMemo(() => {
      if (item.customRate !== undefined) return parseFloat(item.customRate) || 0;
      if (item.material) {
          return parseFloat(item.material.chargeRate || item.material.costRate || item.material.pricePerUnit || item.material.price || 0);
      }
      return 0;
  }, [item]);

  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 group hover:shadow-md ${item.type === 'staff' ? 'bg-emerald-900/10 border-emerald-500/20' : item.type === 'equipment' ? 'bg-amber-900/10 border-amber-500/20' : 'bg-indigo-900/10 border-indigo-500/20'}`}>
      <div className="flex items-center gap-3 overflow-hidden">
          <div className={`w-1 h-10 rounded-full ${item.type === 'staff' ? 'bg-emerald-500' : item.type === 'equipment' ? 'bg-orange-500' : 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]'}`} />
          <div className="space-y-1">
              <div className="text-sm font-bold text-white truncate max-w-[150px]">{item.material.name}</div>
              <div onClick={() => setIsEditing(true)} className="text-[10px] text-indigo-300/60 font-mono cursor-pointer hover:text-indigo-200">
                  {isEditing ? (
                      <input type="number" className="w-20 bg-slate-900 border border-indigo-500 text-white text-[10px] px-1 rounded outline-none" defaultValue={rate} onBlur={(e) => { const val = parseFloat(e.target.value); onUpdate(item.tempId, { customRate: val }); setIsEditing(false) }} autoFocus />
                  ) : `${formatCurrency(rate)} / unit`}
              </div>
          </div>
      </div>
      <div className="flex items-center gap-4">
          <div className="text-right">
              <span className="text-[9px] text-indigo-500 font-black uppercase block tracking-tighter">Qty</span>
              {isEditing ? (
                  <input type="number" className="w-14 bg-slate-900 border border-indigo-500 text-white text-xs px-2 py-1 rounded-lg text-right outline-none" defaultValue={item.quantity} onBlur={(e) => { const val = parseFloat(e.target.value); if (!isNaN(val)) onUpdate(item.tempId, { quantity: val }); setIsEditing(false); }} />
              ) : <div onClick={() => setIsEditing(true)} className="text-sm font-mono font-bold text-white cursor-pointer hover:text-indigo-400">{(parseFloat(item.quantity) || 0).toFixed(2)}</div>}
          </div>
          <div className="text-right min-w-[80px]">
              <span className="text-[9px] text-indigo-500 font-black uppercase block tracking-tighter">Total</span>
              <div className="text-sm font-bold text-emerald-400">{formatCurrency(rate * item.quantity)}</div>
          </div>
          <button onClick={() => onRemove(item.tempId)} className="p-2 text-indigo-900 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
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
  const { startOnboarding } = useUI();
  const { theme, allThemes, setActiveTheme, activeTheme } = useDiaryTheme();
  const [isSaving, setIsSaving] = useState(false); const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false); const [dataLoading, setDataLoading] = useState(true);
  const nodeTypes = useMemo(() => ({ 
      glass: DiaryNode, 
      staff: DiaryNode,
      equipment: DiaryNode,
      material: DiaryNode,
      areaNode: AreaNode,
      quoteMaterial: QuoteMaterialNode,
      quoteLabour: QuoteLabourNode,
      materialYield: MaterialYieldNode,
      labourEstimator: LabourEstimatorNode,
      profitNode: ProfitNode,
      estimationPrism: EstimationPrismNode,
      dimension: DimensionNode, 
      zone: ZoneNode, 
      chronos: ChronosNode, 
      impact: ImpactNode, 
      delay: DelayNode, 
      photoNode: PhotoNode, 
      shapeNode: ShapeNode,
      taskNode: TaskNode,
      neuralPrism: NeuralPrismNode,
      wormhole: WormholeNode,
      allowance: AllowanceNode
  }), [])
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
  const [showAestheticPicker, setShowAestheticPicker] = useState(false);
  const [showChat, setShowChat] = useState(false); const [chatMessages, setChatMessages] = useState([]); const [chatTyping, setChatTyping] = useState(false);
  const [isPulseActive, setIsPulseActive] = useState(false); const [showSidebar, setShowSidebar] = useState(true);
  const canvasRef = useRef(null); const { screenToFlowPosition, getNodes, fitView } = useReactFlow();
  const [dropLocation, setDropLocation] = useState(null);
  const [showInsights, setShowInsights] = useState(false);
  const [heatmapMode, setHeatmapMode] = useState(false);
  const [connectMenu, setConnectMenu] = useState(null); // { x, y, sourceId, sourceType }
  const [historicalDeltas, setHistoricalDeltas] = useState({});
  const [showIntelligence, setShowIntelligence] = useState(false);
  const [conflictState, setConflictState] = useState({ isOpen: false, serverData: null });

  const updateItemNodeData = useCallback((nodeId, updates) => {
      setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, ...updates } } : n));
  }, [setNodes]);

  const allBillableItems = useMemo(() => {
      // 1. Manual BOM Items (Direct from library or added via sidebar)
      const manual = quoteItems.map(i => ({ ...i, isDynamic: false }));
      
      // 2. Dynamic Node Items (Canvas Power Nodes & Direct Staff/Equip nodes)
      const dynamic = nodes
          .filter(n => ['quoteMaterial', 'quoteLabour', 'staff', 'equipment', 'glass'].includes(n.type))
          .map(n => {
              const isMatNode = n.type === 'quoteMaterial';
              const isLabourNode = n.type === 'quoteLabour';
              const isGeneric = n.type === 'glass' || n.type === 'staff' || n.type === 'equipment';
              
              const area = parseFloat(n.data?.inheritedArea) || 0;
              let qty = 1;
              
              if (isMatNode) {
                  const coverage = parseFloat(n.data?.coverage) || 10;
                  const waste = parseFloat(n.data?.waste) || 10;
                  qty = area > 0 ? (area / coverage) * (1 + waste / 100) : (parseFloat(n.data?.quantity) || 1);
              }
              else if (isLabourNode) {
                  const prod = parseFloat(n.data?.prodRate) || 2;
                  qty = area > 0 ? (area / prod) : (parseFloat(n.data?.duration || n.data?.quantity) || 8);
              }
              else if (isGeneric) {
                  qty = parseFloat(n.data?.duration || n.data?.quantity || 1);
              }
              
              // CRITICAL: Ensure rate is always a number
              const rate = parseFloat(n.data?.rate) || 0;
              
              if (isNaN(qty)) qty = 0;
              
              return {
                  nodeId: n.data?.nodeId || n.id,
                  tempId: n.id,
                  quantity: qty,
                  material: { 
                      name: n.data?.label || n.data?.name || (isMatNode ? 'Material' : isLabourNode ? 'Labour' : 'Item'), 
                      pricePerUnit: rate,
                      chargeRate: rate,
                      costRate: rate
                  },
                  type: (isLabourNode || n.data?.type === 'staff' || n.type === 'staff') ? 'staff' : (n.data?.type === 'equipment' || n.type === 'equipment' ? 'equipment' : 'material'),
                  customRate: rate,
                  isDynamic: true
              };
          });
      
      // Filter out duplicates (if a node is already in quoteItems BOM)
      const dynamicUnique = dynamic.filter(d => !manual.some(m => m.tempId === d.tempId));
      
      return [...manual, ...dynamicUnique];
  }, [quoteItems, nodes]);

  const financials = useMemo(() => {
      let mats = 0, stf = 0, eqp = 0;

      allBillableItems.forEach(item => {
          const qty = parseFloat(item.quantity) || 0;
          const rate = parseFloat(item.customRate) || 0;
          const val = qty * rate;
          if (item.type === 'staff') stf += val;
          else if (item.type === 'equipment') eqp += val;
          else mats += val;
      });

      // Profit Node Adjustment
      const profitNode = nodes.find(n => n.type === 'profitNode');
      const markup = parseFloat(profitNode ? (profitNode.data?.markup || 0) : marginPct) || 0;
      const overhead = parseFloat(profitNode ? (profitNode.data?.overhead || 0) : 0) || 0;
      const contingency = parseFloat(profitNode ? (profitNode.data?.contingency || 0) : 0) || 0;

      const subtotal = mats + stf + eqp;
      const total = subtotal * (1 + markup / 100) * (1 + overhead / 100) * (1 + contingency / 100);

      return { 
          materials: mats, 
          staff: stf, 
          equipment: eqp, 
          subtotal: isNaN(subtotal) ? 0 : subtotal, 
          total: isNaN(total) ? 0 : total 
      };
  }, [allBillableItems, nodes, marginPct]);

  // --- PERSISTENCE LAYER ---
  useEffect(() => {
      const savedState = localStorage.getItem('quote_builder_state');
      if (savedState) {
          try {
              const { nodes: sNodes, edges: sEdges, items: sItems, project: sProject, settings: sSettings } = JSON.parse(savedState);
              // Only restore if we are NOT loading a specific ID from URL (unless it matches)
              if (!id || (sSettings?.id === id)) {
                  if (sNodes) setNodes(sNodes);
                  if (sEdges) setEdges(sEdges);
                  if (sItems) setQuoteItems(sItems);
                  if (sProject) setSelectedProject(sProject);
                  if (sSettings) setQuoteSettings(sSettings);
                  addNotification('info', 'Session Restored', 'Your previous work has been recovered.');
              }
          } catch (e) {
              console.error("Failed to restore state:", e);
          }
      }
  }, []);

  useEffect(() => {
      const stateToSave = {
          nodes, edges, items: quoteItems, project: selectedProject, settings: { ...quoteSettings, id }
      };
      localStorage.setItem('quote_builder_state', JSON.stringify(stateToSave));
  }, [nodes, edges, quoteItems, selectedProject, quoteSettings, id]);

  // --- PROTOCOL GAMMA: FETCH LEARNING DATA ---
  useEffect(() => {
      const fetchLearningData = async () => {
          // OFFLINE CHECK
          if (!navigator.onLine) {
              const mockPacket = {
                  oracle: { bidSuccessProbability: 'OFFLINE', idealMarginPoint: '--', marketVolatilityIndex: 1.0, revenueOptimization: 'N/A' },
                  parallelScenarios: [{ id: 'S1', name: 'Offline Mode', margin: '20%', risk: 'Low' }],
                  patterns: [],
                  globalAccuracy: 0.00
              };
              setHistoricalDeltas(mockPacket);
              addNotification('warning', 'Oracle Offline', 'Using cached simulation data.');
              return;
          }

          if (quoteItems.length === 0) return;

          try {
              // Context for the Oracle
              const context = {
                  project: projects.find(p => p.id === selectedProject) || { name: "New Project", type: "General" },
                  itemCount: quoteItems.length,
                  totalValue: financials.total
              };

              // The Sovereign Oracle Intelligence Packet (Live from Neural Core)
              const res = await api.post('/ai/oracle-sync', { context });
              const oracleData = res.data;

              if (oracleData) {
                  setHistoricalDeltas(oracleData);
                  // Silent update: Notification removed to reduce noise.
              }
          } catch (e) { 
              console.error("Oracle Sync Error:", e);
              // Fallback for offline mode/demo
              const mockPacket = {
                  oracle: { bidSuccessProbability: '84%', idealMarginPoint: '26.4%', marketVolatilityIndex: 1.12, revenueOptimization: '+$42,000' },
                  parallelScenarios: [{ id: 'S1', name: 'Speed Strategy', margin: '18%', risk: 'High' }, { id: 'S2', name: 'Max Profit', margin: '28%', risk: 'Low' }, { id: 'S3', name: 'Safe Path', margin: '22%', risk: 'Min' }],
                  patterns: [{ taskType: 'Prep', delta: 1.18, cause: 'Substrate Underestimation', sentiment: 'Frustrated', fix: 'Increase buffer by 8%' }],
                  globalAccuracy: 0.94
              };
              setHistoricalDeltas(mockPacket);
          }
      };
      
      // Only fetch if we have a valid session or on initial load
      if (allThemes) fetchLearningData();
  }, [selectedProject, quoteItems.length > 0]); // Re-run when project context changes or quote becomes active

  // --- NEURAL YIELD ENGINE (Multi-Stage Propagation) ---
  useEffect(() => {
      // 1. Identify all AreaNodes and their values
      const areaMap = new Map();
      nodes.filter(n => n.type === 'areaNode').forEach(an => {
          const width = parseFloat(an.data?.width) || 0;
          const length = parseFloat(an.data?.length) || 0;
          areaMap.set(an.id, width * length);
      });

      let hasChanges = false;
      let newNodes = [...nodes];
      const yieldMap = new Map(); // Stores calculated qty from Yield Nodes

      // 2. Pass: Update Yield Nodes (QuoteMaterial/QuoteLabour) & Calculate Outputs
      newNodes = newNodes.map(node => {
          if (node.type === 'quoteMaterial' || node.type === 'quoteLabour') {
              const incomingEdge = edges.find(e => e.target === node.id && areaMap.has(e.source));
              const parentArea = incomingEdge ? areaMap.get(incomingEdge.source) : 0;
              
              // Calculate Output for Propagation
              let outputQty = 0;
              if (parentArea > 0) {
                  if (node.type === 'quoteMaterial') {
                      const cov = parseFloat(node.data.coverage) || 10;
                      const waste = parseFloat(node.data.waste) || 0;
                      outputQty = (parentArea / cov) * (1 + waste/100);
                  } else { // Labour
                      const prod = parseFloat(node.data.prodRate) || 2;
                      outputQty = parentArea / prod;
                  }
              } else {
                  // If not linked to area, use manual quantity as output
                  outputQty = parseFloat(node.data.quantity) || (node.type === 'quoteLabour' ? parseFloat(node.data.duration) : 1) || 1;
              }
              yieldMap.set(node.id, outputQty);

              if (node.data.inheritedArea !== parentArea) {
                  hasChanges = true;
                  return { ...node, data: { ...node.data, inheritedArea: parentArea } };
              }
          }
          return node;
      });

      // 3. Pass: Update Downstream Items (Material/Staff/Glass) connected to Yield Nodes
      const itemsToUpdate = [];
      newNodes = newNodes.map(node => {
          const incomingYieldEdge = edges.find(e => e.target === node.id && yieldMap.has(e.source));
          if (incomingYieldEdge) {
              const sourceQty = yieldMap.get(incomingYieldEdge.source);
              const isTimeBased = node.data.type === 'staff' || node.data.type === 'equipment';
              const currentVal = parseFloat(isTimeBased ? (node.data.duration || 0) : (node.data.quantity || 0));
              
              if (Math.abs(currentVal - sourceQty) > 0.01) {
                  hasChanges = true;
                  const updateData = isTimeBased ? { duration: sourceQty } : { quantity: sourceQty };
                  itemsToUpdate.push({ id: node.id, ...updateData });
                  return { ...node, data: { ...node.data, ...updateData } };
              }
          }
          return node;
      });

      if (hasChanges) {
          setNodes(newNodes);
          // Sync BOM if generic items were updated
          if (itemsToUpdate.length > 0) {
              setTimeout(() => {
                  setQuoteItems(items => items.map(i => {
                      const update = itemsToUpdate.find(u => u.id === i.tempId);
                      if (update) {
                          return { ...i, quantity: update.duration || update.quantity }; // QuoteItems use 'quantity' for all
                      }
                      return i;
                  }));
              }, 0);
          }
      }
  }, [nodes, edges, setNodes, setQuoteItems]);

  const handleAiSuggest = () => { handleAIChat("Review this quote. Suggest missing items. Return specific add_node actions."); };
  
  // --- SMART CONNECTION LOGIC ---
  const isValidConnection = useCallback((connection) => {
      const source = nodes.find(n => n.id === connection.source);
      const target = nodes.find(n => n.id === connection.target);
      if (!source || !target) return false;

      // Logic: Areas drive Materials/Labour
      if (source.type === 'areaNode') {
          return ['quoteMaterial', 'quoteLabour'].includes(target.type);
      }
      // Logic: Zones organize everything
      if (source.type === 'zone') {
          return ['quoteMaterial', 'quoteLabour', 'areaNode', 'taskNode'].includes(target.type);
      }
      
      // Default: Allow loose connections for other types (e.g. Logic nodes)
      return true;
  }, [nodes]);

  const getSmartEdgeParams = useCallback((sourceId) => { const sourceNode = nodes.find(n => n.id === sourceId); const type = sourceNode?.data?.type || 'material'; let edgeType = 'default'; if (type === 'staff' || type === 'equipment') edgeType = 'orbit'; else if (type === 'material') edgeType = 'gradient'; return { type: edgeType, data: { type, sourceType: type } }; }, [nodes]);
  const onConnect = useCallback((params) => { 
      if (!isValidConnection(params)) {
          addNotification('warning', 'Invalid Link', 'Connect Areas to Materials/Labor to enable auto-calculation.');
          return;
      }
      const smartParams = getSmartEdgeParams(params.source); 
      setEdges((eds) => addEdge({ ...params, ...smartParams, animated: true }, eds)); 
  }, [setEdges, getSmartEdgeParams, isValidConnection, addNotification]);

  const getCompatibleNodes = (sourceType) => {
      // Suggest logical next steps
      if (sourceType === 'areaNode') return [
          { id: 'quoteMaterial', label: 'Material', icon: <Package size={14}/> },
          { id: 'quoteLabour', label: 'Labour', icon: <User size={14}/> }
      ];
      if (sourceType === 'zone') return [
          { id: 'areaNode', label: 'Area', icon: <Ruler size={14}/> },
          { id: 'taskNode', label: 'Task', icon: <List size={14}/> }
      ];
      // Default set
      return [
          { id: 'quoteMaterial', label: 'Material', icon: <Package size={14}/> },
          { id: 'quoteLabour', label: 'Labour', icon: <User size={14}/> },
          { id: 'areaNode', label: 'Area', icon: <Ruler size={14}/> },
          { id: 'zone', label: 'Zone', icon: <Layout size={14}/> }
      ];
  };

  const onConnectEnd = useCallback((event, connectionState) => {
      if (!connectionState.isValid && connectionState.fromNodeId) {
          // Dropped on pane
          const { clientX, clientY } = event;
          const sourceNode = nodes.find(n => n.id === connectionState.fromNodeId);
          if (sourceNode) {
              setConnectMenu({
                  x: clientX,
                  y: clientY,
                  sourceId: sourceNode.id,
                  sourceType: sourceNode.type
              });
          }
      }
  }, [nodes]);

  const handleConnectMenuSelect = (targetType) => {
      if (!connectMenu) return;
      const position = screenToFlowPosition({ x: connectMenu.x, y: connectMenu.y });
      const nodeId = `${targetType}-${Date.now()}`;
      
      // Define default data for auto-created nodes
      const nodeData = {
          label: `New ${targetType}`,
          type: targetType,
          onDelete: () => deleteNode(nodeId),
          onUpdate: updateItemNodeData,
          ...(targetType === 'quoteMaterial' ? { rate: 0, coverage: 10 } : {}),
          ...(targetType === 'quoteLabour' ? { rate: 50, prodRate: 2 } : {}),
          ...(targetType === 'areaNode' ? { width: 5, length: 5, type: 'floor' } : {})
      };

      const newNode = {
          id: nodeId,
          type: targetType,
          position,
          data: nodeData,
          style: targetType === 'areaNode' ? { width: 300, height: 300, zIndex: -1 } : undefined
      };

      setNodes(prev => [...prev, newNode]);
      
      // Auto-link
      const smartParams = getSmartEdgeParams(connectMenu.sourceId);
      setEdges(prev => addEdge({ 
          id: `e-${connectMenu.sourceId}-${nodeId}`, 
          source: connectMenu.sourceId, 
          target: nodeId, 
          animated: true, 
          ...smartParams 
      }, prev));

      setConnectMenu(null);
  };

  const updateItem = useCallback((tempId, updates) => { setQuoteItems(items => items.map(item => item.tempId === tempId ? { ...item, ...updates } : item)); }, [setQuoteItems]);
  const handleGenerateScope = async () => { 
      if (quoteItems.length === 0) return; 
      if (!navigator.onLine) {
          addNotification('warning', 'Offline Mode', 'Cannot generate scope without internet.');
          return;
      }
      setIsGeneratingScope(true); 
      try { 
          const project = projects.find(p => p.id === selectedProject); 
          const res = await api.post('/ai/generate-scope', { items: quoteItems.map(i => ({ name: i.material.name, qty: i.quantity, type: i.type })), projectName: project?.name }); 
          setQuoteScope(res.data.scope); 
          addNotification('success', 'Scope Generated'); 
      } catch (err) { 
          console.error(err); 
      } finally { 
          setIsGeneratingScope(false); 
      } 
  };
  const openLoadModal = async () => { setShowLoadModal(true); setQuotesLoading(true); try { const res = await api.get('/quotes?limit=50'); setExistingQuotes(res.data.data || []); } catch (err) { console.error(err); } finally { setQuotesLoading(false); } };
  const handleLoadQuote = (quote) => { navigate(`/quotes/${quote.id}`); setShowLoadModal(false); };
  const deleteNode = useCallback((id) => { setNodes((nds) => nds.filter(n => n.id !== id)); setQuoteItems((items) => items.filter(i => i.tempId !== id)); }, [setNodes]);
  
  const handleAIChat = async (message) => {
      if (!message.trim()) return;
      
      if (!navigator.onLine) {
          setChatMessages(prev => [...prev, { role: 'user', content: message }]);
          setChatMessages(prev => [...prev, { role: 'assistant', content: "I am offline. Please connect to the internet to access my reasoning core." }]);
          return;
      }

      setChatMessages(prev => [...prev, { role: 'user', content: message }]);
      setChatTyping(true);
      try {
          // Prepare Rich Context for "World's Best" Estimation
          const graphSummary = nodes.map(n => {
              let value = 0;
              if (n.data.quoteTotal) value = n.data.quoteTotal;
              else if (n.data.rate && n.data.quantity) value = n.data.rate * n.data.quantity;
              
              return {
                  id: n.id,
                  type: n.type,
                  label: n.data.label || n.type,
                  data: n.data, // Include full data (dimensions, rates, coverage)
                  value: value
              };
          });

          const context = { 
              project: projects.find(p => p.id === selectedProject) || {}, 
              items: quoteItems.map(i => ({ id: i.tempId, name: i.material.name, qty: i.quantity, type: i.type })), 
              nodes: graphSummary, 
              edges,
              settings: quoteSettings,
              financials // Pass the calculated totals
          };
          
          const res = await api.post('/ai/chat-quote', { 
              message, 
              context: { ...context, historicalContext: historicalDeltas } 
          });
          setChatMessages(prev => [...prev, { role: 'assistant', content: res.data.reply, actions: res.data.suggestedActions, nodes: res.data.suggestedNodes }]);
      } catch (err) {
          console.error(err);
      } finally {
          setChatTyping(false);
      }
  };
  const onTapAdd = (item) => { const position = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 }); setPendingNode({ item, position, suggestedQuantity: 1 }); };
  const handleAddNode = (quantity, cost, charge, customName) => { 
      if (!pendingNode) return; 
      const { item, position } = pendingNode; 
      const nodeId = `${item.type}-${Date.now()}`; 
      const finalName = customName || item.name;
      
      const isZone = item.type === 'zone' || item.type === 'wormhole';
      const isDimension = item.type === 'dimension' || item.type === 'areaNode';
      
      const newNode = { 
          id: nodeId, 
          type: item.type || 'glass', 
          position, 
          data: { 
              label: finalName, 
              subLabel: item.type, 
              quantity: (item.type === 'staff' || item.type === 'equipment') ? 1 : quantity,
              duration: (item.type === 'staff' || item.type === 'equipment') ? quantity : 0, 
              type: item.type, 
              onDelete: () => deleteNode(nodeId),
              onUpdate: updateItemNodeData,
              // Default props for special nodes
              ...(item.type === 'taskNode' ? { plannedHours: 8, status: 'pending' } : {}),
              ...(item.type === 'zone' ? { zoneTotal: 0, nodeCount: 0 } : {}),
              ...(item.type === 'areaNode' ? { width: 10, length: 10, depth: 0 } : {}),
              ...(item.type === 'quoteMaterial' ? { rate: charge || item.pricePerUnit || 0, ...getSmartDefaults(finalName) } : {}),
              ...(item.type === 'quoteLabour' ? { rate: charge || item.chargeOutBase || 0, prodRate: 2 } : {}),
              ...(item.type === 'profitNode' ? { markup: marginPct, overhead: 10, contingency: 5, quoteTotal: 0 } : {}),
              ...(item.type === 'estimationPrism' ? { status: 'analyzing', quoteTotal: 0, profitMargin: '0%', riskLevel: 'low' } : {})
          },
          style: (isZone || isDimension) ? { width: isZone ? 400 : (item.type === 'areaNode' ? 300 : 200), height: isZone ? 400 : (item.type === 'areaNode' ? 300 : 200), zIndex: -1 } : undefined
      };

      setNodes(nds => nds.concat(newNode)); 
      
      // Only add to BOM if it's a billable item (not a pure logic node or an NEE dynamic node)
      const isLogicNode = ['zone', 'wormhole', 'dimension', 'neuralPrism', 'chronos', 'shapeNode', 'photoNode', 'areaNode', 'quoteMaterial', 'quoteLabour', 'profitNode', 'estimationPrism'].includes(item.type);
      if (!isLogicNode) {
          setQuoteItems(prev => [...prev, { nodeId: item.id, tempId: nodeId, quantity, material: { ...item, name: finalName }, type: item.type, customRate: charge > 0 ? charge : undefined }]); 
      }
      
      setPendingNode(null); 
  };

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
  const handleSaveQuote = async (force = false) => { 
      if (!selectedProject) return; 
      setIsSaving(true); 
      
      if (!navigator.onLine) {
          // OFFLINE SAVE (BASIC)
          try {
              const payload = { 
                  projectId: selectedProject, 
                  clientId: quoteSettings.clientId, 
                  marginPct, 
                  totalCost: financials.subtotal, 
                  totalRevenue: financials.total, 
                  nodes, 
                  edges, 
                  staff: quoteItems.filter(i=>i.type==='staff'), 
                  equipment: quoteItems.filter(i=>i.type==='equipment'),
                  version: nodes[0]?.data?.version || 0,
                  name: `Draft Quote ${new Date().toLocaleTimeString()}`
              };
              await syncManager.save('quotes', payload);
              addNotification('success', 'Saved Offline', 'Quote buffered to local storage. Will sync when online.');
          } catch (e) {
              console.error(e);
              addNotification('error', 'Offline Save Failed');
          } finally {
              setIsSaving(false);
          }
          return;
      }

      try { 
          const payload = { 
              projectId: selectedProject || null, 
              clientId: quoteSettings.clientId || null, 
              marginPct, 
              totalCost: financials.subtotal, 
              totalRevenue: financials.total, 
              nodes, 
              edges, 
              staff: quoteItems.filter(i=>i.type==='staff'), 
              equipment: quoteItems.filter(i=>i.type==='equipment'),
              version: force ? conflictState.serverData?.version : (nodes[0]?.data?.version || 0)
          }; 
          
          if (id) await api.put(`/quotes/${id}`, payload); 
          else { 
              const res = await api.post('/quotes', payload); 
              navigate(`/quotes/builder/${res.data.id}`); 
          } 
          
          addNotification('success', 'Quote Saved'); 
          setConflictState({ isOpen: false, serverData: null });
          localStorage.removeItem('quote_builder_state'); // Clear persistence on successful save
      } catch (err) { 
          if (err.response?.status === 409) {
              setConflictState({ isOpen: true, serverData: err.response.data.currentRecord });
          } else {
              console.error(err); 
              addNotification('error', 'Save Failed');
          }
      } finally { 
          setIsSaving(false); 
      } 
  };

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
        setDropLocation({ x: event.clientX, y: event.clientY });
        setTimeout(() => setDropLocation(null), 800);
        setPendingNode({ item, position, suggestedQuantity: 1 });
    } catch (e) {
        console.error("Drop Parse Error:", e);
    }
  }, [screenToFlowPosition]);

  const handleGenerateBlueprint = async (prompt) => {
      if (!prompt || !prompt.trim()) { addNotification('warning', 'Input Required', 'Please describe what you want to build.'); return; }
      
      if (!navigator.onLine) {
          setChatMessages(prev => [...prev, { role: 'user', content: `Generate Blueprint: ${prompt}` }]);
          setChatMessages(prev => [...prev, { role: 'assistant', content: "Blueprint generation requires Neural Link. Please reconnect." }]);
          return;
      }

      setIsGeneratingBlueprint(true);
      setChatMessages(prev => [...prev, { role: 'user', content: `Generate Blueprint: ${prompt}` }]);
      try {
          const startTime = Date.now();
          const res = await api.post('/ai/quote', { prompt, historicalContext: historicalDeltas });
          const { nodes: aiNodes, edges: aiEdges } = res.data;
          const elapsed = Date.now() - startTime;
          if (elapsed < 1500) await new Promise(r => setTimeout(r, 1500 - elapsed));
          if (aiNodes && aiNodes.length > 0) {
              addNotification('success', 'Blueprint Generated', 'AI has constructed the visual quote.');
              const newNodes = [];
              const newItems = [];
              const newEdges = [];
              
              // Map types
              aiNodes.forEach(rawNode => {
                  let n = rawNode;
                  if (!n.data) n = { id: rawNode.id || `ai-${Math.random()}`, type: rawNode.type || 'glass', position: rawNode.position || {x:0, y:0}, data: rawNode };
                  if (!n.data) return;
                  
                  const nodeId = n.id;
                  const rawType = n.type || n.data.type;
                  const isZone = rawType === 'zone';
                  const isDimension = rawType === 'dimension';
                  const isContainer = isZone || isDimension;
                  
                  // Item Category (staff/equip/material)
                  const itemCategory = n.data.nodeType || n.data.category || 'material';
                  
                  // CRITICAL: Ensure AI nodes have a persistent ID for backend mapping
                  const aiNodeId = n.data.nodeId || n.id || `ai-gen-${Math.random().toString(36).substr(2, 9)}`;

                  newNodes.push({
                      id: nodeId,
                      type: isZone ? 'zone' : isDimension ? 'dimension' : 'glass',
                      position: n.position || { x: Math.random() * 500, y: Math.random() * 500 },
                      data: {
                          ...getSmartDefaults(n.data.label || n.data.name),
                          ...n.data, 
                          nodeId: aiNodeId, // Explicitly set for backend matching
                          isNew: true,      // Explicitly flag as new for backend creation
                          duration: (itemCategory === 'staff' || itemCategory === 'equipment') ? (n.data.quantity || 1) : 0, 
                          label: n.data.label || 'New Item',
                          type: itemCategory, // Correctly map for DiaryNode coloring
                          onUpdate: (targetId, ups) => {
                              setNodes(nds => nds.map(node => node.id === targetId ? { ...node, data: { ...node.data, ...ups } } : node));
                              if (!isContainer) {
                                  setQuoteItems(items => items.map(i => i.tempId === targetId ? { ...i, ...ups } : i));
                              }
                          },
                          onDelete: () => deleteNode(nodeId) 
                      },
                      style: isContainer ? { width: isZone ? 400 : 200, height: isZone ? 400 : 200, zIndex: -1 } : undefined
                  });

                  if (!isContainer) {
                      newItems.push({
                          nodeId: aiNodeId, // Use the same ID as above
                          tempId: nodeId,
                          quantity: n.data.quantity || 1,
                          material: { name: n.data.label || n.label, price: n.data.cost || 0 },
                          type: itemCategory,
                          customRate: n.data.cost
                      });
                  }
              });

              // SMART LINKING: If no edges provided, link items to closest/relevant zone/room
              if (aiEdges && aiEdges.length > 0) {
                  setEdges(prev => [...prev, ...aiEdges]);
              } else {
                  const containers = newNodes.filter(n => n.type === 'zone' || n.type === 'dimension');
                  if (containers.length > 0) {
                      newNodes.filter(n => n.type === 'glass').forEach((itemNode, idx) => {
                          // Round-robin link to containers if no logic available
                          const parent = containers[idx % containers.length];
                          const edgeType = itemNode.data.type === 'staff' || itemNode.data.type === 'equipment' ? 'orbit' : 'gradient';
                          newEdges.push({
                              id: `e-auto-${parent.id}-${itemNode.id}`,
                              source: parent.id,
                              target: itemNode.id,
                              animated: true,
                              type: edgeType // Smart edge type
                          });
                      });
                      setEdges(prev => [...prev, ...newEdges]);
                  }
              }

              setNodes(prev => [...prev, ...newNodes]);
              setQuoteItems(prev => [...prev, ...newItems]);
              setChatMessages(prev => [...prev, { role: 'assistant', content: "Blueprint generated. Items have been auto-structured by phase/zone for clarity." }]);
              setTimeout(() => fitView({ padding: 0.2 }), 500);
          }
      } catch (err) {
          console.error(err);
          setChatMessages(prev => [...prev, { role: 'assistant', content: "Error generating blueprint." }]);
      } finally {
          setIsGeneratingBlueprint(false);
          setChatTyping(false);
      }
  };

  const handleCopilotAction = (action) => {
      if (action.type === 'add_node') {
          let item = { id: `ai-${Date.now()}`, name: action.label, pricePerUnit: action.cost || 0, type: action.category || 'material' };
          setPendingNode({ item, position: screenToFlowPosition({ x: window.innerWidth/2, y: window.innerHeight/2 }), suggestedQuantity: action.quantity || 1 });
      } else if (action.type === 'add_complex_node') {
          const center = screenToFlowPosition({ x: window.innerWidth/2, y: window.innerHeight/2 });
          const newNodes = [];
          const newEdges = [];
          
          // First pass: Create nodes
          action.nodes.forEach((n, idx) => {
              const nodeId = `${n.id}-${Date.now()}`;
              n._realId = nodeId; // Temp mapping
              
              // Smart positioning (Area top left, Materials/Labour grouped)
              let position = { x: center.x, y: center.y };
              if (n.type === 'areaNode') position = { x: center.x, y: center.y };
              else if (n.type === 'quoteMaterial') position = { x: center.x + 350, y: center.y + (idx * 150) };
              else if (n.type === 'quoteLabour') position = { x: center.x + 350, y: center.y + (idx * 150) + 100 };
              else position = { x: center.x + (idx * 50), y: center.y + (idx * 50) };

              newNodes.push({
                  id: nodeId,
                  type: n.type,
                  position,
                  data: { 
                      ...n.data, 
                      label: n.label,
                      // Ensure required props for Power Nodes
                      onDelete: () => deleteNode(nodeId),
                      onUpdate: updateItemNodeData,
                      ...(n.type === 'areaNode' ? { width: n.data.width || 10, length: n.data.length || 10 } : {}),
                      ...(n.type === 'quoteMaterial' ? { rate: n.data.rate || 0, coverage: n.data.coverage || 10 } : {})
                  },
                  style: n.type === 'areaNode' ? { width: 300, height: 300, zIndex: -1 } : undefined
              });
          });

          // Second pass: Create edges
          action.nodes.forEach(n => {
              if (n.targetId) {
                  const targetNode = action.nodes.find(t => t.id === n.targetId);
                  if (targetNode) {
                      newEdges.push({
                          id: `e-${targetNode._realId}-${n._realId}`,
                          source: targetNode._realId,
                          target: n._realId,
                          animated: true,
                          type: 'gradient'
                      });
                  }
              }
          });

          setNodes(prev => [...prev, ...newNodes]);
          setEdges(prev => [...prev, ...newEdges]);
          addNotification('success', 'Blueprint Expanded', `Added ${action.label}`);
      }
  };

  const confirmGhostNode = useCallback((node) => {
      setNodes(nds => nds.map(n => n.id === node.id ? { ...n, data: { ...n.data, isGhost: false, subLabel: 'Confirmed Item' } } : n));
      const newItem = { nodeId: node.id, tempId: node.id, quantity: node.data.quantity || 1, material: { name: node.data.label, price: 0 }, type: node.data.type || 'material', isEstimated: true };
      setQuoteItems(prev => [...prev, newItem]);
      addNotification('Item confirmed', 'success');
  }, [setNodes, setQuoteItems, addNotification]);

  const fetchGhostSuggestions = useCallback(async (node) => {
      if (!node) return;
      if (!navigator.onLine) {
          addNotification('info', 'Offline', 'AI suggestions unavailable.');
          return;
      }
      try {
          const res = await api.post('/ai/node-suggestions', { selectedNode: node, existingNodes: nodes });
          if (res.data?.suggestions) {
              const suggestions = res.data.suggestions;
              const newNodes = [];
              const newEdges = [];
              const center = node.position;
              const radius = 250;
              
              suggestions.forEach((s, i) => {
                  const angle = (i / suggestions.length) * 2 * Math.PI;
                  const x = center.x + Math.cos(angle) * radius;
                  const y = center.y + Math.sin(angle) * radius;
                  const id = `ghost-${Date.now()}-${i}`;
                  
                  newNodes.push({
                      id,
                      type: 'glass', // Default to glass for items
                      position: { x, y },
                      data: {
                          label: s.label,
                          type: s.type || 'material',
                          isGhost: true,
                          subLabel: 'AI Suggestion',
                          reason: s.reason,
                          onDelete: () => deleteNode(id)
                      },
                      style: { opacity: 0.7, filter: 'grayscale(0.5)' }
                  });
                  
                  newEdges.push({
                      id: `e-ghost-${node.id}-${id}`,
                      source: node.id,
                      target: id,
                      animated: true,
                      style: { stroke: '#6366f1', strokeDasharray: '5,5', opacity: 0.5 },
                      type: 'default'
                  });
              });
              
              setNodes(prev => [...prev, ...newNodes]);
              setEdges(prev => [...prev, ...newEdges]);
              addNotification('info', 'AI Suggestions', `Generated ${suggestions.length} suggestions.`);
          }
      } catch (err) { console.error(err); }
  }, [nodes, setNodes, setEdges, addNotification]);

  const handleNodeClick = useCallback((event, node) => {
      if (!isPulseActive) return;
      if (node.data?.isGhost) confirmGhostNode(node);
      else fetchGhostSuggestions(node);
  }, [isPulseActive, confirmGhostNode, fetchGhostSuggestions]);

  useEffect(() => { 
      const fetchData = async () => { 
          setDataLoading(true); 
          try { 
              const [n, s, e, p] = await Promise.all([
                  api.get('/nodes').catch(err => ({ data: [] })), 
                  api.get('/staff').catch(err => ({ data: [] })), 
                  api.get('/equipment').catch(err => ({ data: [] })), 
                  api.get('/projects').catch(err => ({ data: [] }))
              ]); 
              
              const materialsList = n.data.data || [];
              const staffList = (s.data.data || []).map(x => ({...x, type: 'staff', chargeRate: x.chargeOutBase}));
              const equipmentList = (e.data.data || []).map(x => ({...x, type: 'equipment', costRate: x.costRateBase}));
              
              setMaterials(materialsList); 
              setStaff(staffList); 
              setEquipment(equipmentList); 
              setProjects(p.data.data || []); 

              // --- LOAD SPECIFIC QUOTE BY ID ---
              if (id) {
                  const quoteRes = await api.get(`/quotes/${id}`);
                  const q = quoteRes.data;
                  if (q) {
                      setMarginPct(q.marginPct || 20);
                      setSelectedProject(q.projectId);
                      setQuoteSettings({
                          clientName: q.clientDetails?.name || '',
                          clientAddress: q.clientDetails?.address || '',
                          clientId: q.clientId,
                          status: q.status
                      });

                      const savedItems = (q.items || q.quoteItems || []);
                      setQuoteItems(savedItems);

                      // CLONE NODE SAFETY & DATA RESTORATION LOGIC
                      const savedNodes = (q.nodes || []).map(node => {
                          const exists = [...materialsList, ...staffList, ...equipmentList].some(item => item.id === node.data?.nodeId || item.id === node.id);
                          
                          // Link back to BOM items for value synchronization
                          const linkedItem = savedItems.find(i => i.tempId === node.id || i.nodeId === node.id || (node.data?.nodeId && i.nodeId === node.data.nodeId));

                          // 1. Safety Clone for 'glass' nodes
                          if (!exists && node.type === 'glass') {
                              return { ...node, data: { ...node.data, isClone: true, subLabel: 'Archived Node', onUpdate: updateItemNodeData, onDelete: () => deleteNode(node.id) } };
                          }

                          // 2. Data Restoration for Power Nodes (Materials/Labour)
                          if (['quoteMaterial', 'quoteLabour', 'glass', 'staff', 'equipment', 'material'].includes(node.type)) {
                              // CRITICAL: Determine correct rate and quantity from multiple potential sources
                              const savedRate = node.data?.rate !== undefined ? node.data.rate : 
                                               (node.data?.chargeRate !== undefined ? node.data.chargeRate : 
                                               (linkedItem?.customRate || linkedItem?.material?.price || linkedItem?.material?.pricePerUnit || linkedItem?.material?.chargeRate || 0));
                              
                              const savedQty = node.data?.quantity !== undefined ? node.data.quantity : 
                                              (node.data?.duration !== undefined ? node.data.duration : 
                                              (linkedItem?.quantity || 1));

                              const restoredData = {
                                  ...node.data,
                                  label: node.data?.label || node.data?.name || linkedItem?.material?.name || 'Restored Item',
                                  rate: parseFloat(savedRate) || 0,
                                  quantity: parseFloat(savedQty) || 0,
                                  coverage: parseFloat(node.data?.coverage) || 10,
                                  waste: parseFloat(node.data?.waste) || 10,
                                  prodRate: parseFloat(node.data?.prodRate) || 2,
                                  onUpdate: updateItemNodeData,
                                  onDelete: () => deleteNode(node.id)
                              };
                              return { ...node, data: restoredData };
                          }

                          return { ...node, data: { ...node.data, onUpdate: updateItemNodeData, onDelete: () => deleteNode(node.id) } };
                      });

                      setNodes(savedNodes);
                      setEdges(q.edges || []);
                  }
              }
          } catch (error) {
              console.error("Critical resource load failure:", error);
          } finally { 
              setDataLoading(false); 
          } 
      }; 
      fetchData(); 
  }, [id]);

  useEffect(() => {
      if (selectedProject && projects.length > 0) {
          const proj = projects.find(p => p.id === selectedProject);
          if (proj) {
              const client = proj.clientDetails || {};
              setQuoteSettings(prev => ({
                  ...prev,
                  clientId: client.id || null, // Reset if no client linked
                  clientName: client.name || proj.client || '',
                  clientAddress: client.address || ''
              }));
          }
      }
  }, [selectedProject, projects]);

  const handlePrintToInvoice = () => {
      if (quoteItems.length === 0) {
          alert("Add items to the quote before invoicing.");
          return;
      }
      navigate('/invoices', { 
          state: { 
              diaryItems: quoteItems.map(i => ({
                  id: i.tempId,
                  name: i.material.name,
                  quantity: i.quantity,
                  costRate: i.material.price || 0,
                  chargeRate: i.customRate || i.material.price || 0,
                  type: i.type
              })),
              projectId: selectedProject,
              clientId: quoteSettings.clientId,
              clientName: quoteSettings.clientName,
              date: new Date()
          } 
      });
  };

  // AI COPILOT CONTEXT BRIDGE
  useEffect(() => {
      window.current_quote_state = { nodes, edges, financials, selectedProject, quoteSettings };
      return () => { delete window.current_quote_state; };
  }, [nodes, edges, financials, selectedProject, quoteSettings]);

  const handleHeatmapToggle = (active) => {
      setHeatmapMode(active);
      setNodes(nds => nds.map(n => {
          if (!active) return { ...n, style: { ...n.style, opacity: 1, filter: 'none' } };
          
          // Heatmap Logic: High Cost = Bright, Low Cost = Dim
          const cost = (n.data?.quantity || 1) * (n.data?.rate || 0);
          const isHighValue = cost > 1000;
          const isZero = cost === 0;
          
          return {
              ...n,
              style: {
                  ...n.style,
                  opacity: isHighValue ? 1 : 0.4,
                  filter: isHighValue ? 'drop-shadow(0 0 20px rgba(244, 63, 94, 0.6))' : 'grayscale(100%)',
                  transition: 'all 0.5s ease'
              }
          };
      }));
  };

  const stats = [ { label: 'Materials', value: formatCurrency(financials.materials), color: 'text-indigo-400' }, { label: 'Labor', value: formatCurrency(financials.staff), color: 'text-emerald-400' }, { label: 'Equipment', value: formatCurrency(financials.equipment), color: 'text-amber-400' }, { label: 'Total', value: formatCurrency(financials.total), color: 'text-white' } ];

  return (
    <div className="h-screen w-full flex flex-col bg-[#050507] text-white overflow-hidden relative font-sans">
        <AestheticPicker isOpen={showAestheticPicker} onClose={() => setShowAestheticPicker(false)} />
        <GeoreferenceModal isOpen={showGeoModal} onClose={() => setShowGeoModal(false)} onConfirm={(loc) => { setProjectLocation(loc); setShowGeoModal(false); }} />
      <QuoteSettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} settings={quoteSettings} setSettings={setQuoteSettings} projects={projects} selectedProject={selectedProject} />
      <LoadQuoteModal isOpen={showLoadModal} onClose={() => setShowLoadModal(false)} onLoad={handleLoadQuote} quotes={existingQuotes} isLoading={quotesLoading} />
      <ConflictResolver 
        isOpen={conflictState.isOpen} 
        serverData={conflictState.serverData} 
        onCancel={() => setConflictState({ isOpen: false, serverData: null })}
        onResolve={(choice) => {
            if (choice === 'OVERWRITE') handleSaveQuote(true);
            else window.location.reload();
        }}
      />
      {showMap && <div className="absolute inset-0 z-0"><MapBackground activeLocation={projectLocation} overlayImage={sitePlan} /></div>}
      
      {dropLocation && (
          <div className="fixed w-32 h-32 rounded-full border-4 border-emerald-400 bg-emerald-400/20 animate-ping pointer-events-none z-[100]" style={{ left: dropLocation.x - 64, top: dropLocation.y - 64 }} />
      )}

      <div className={`relative z-10 flex flex-col h-screen overflow-hidden transition-all duration-500 ${showMap ? 'bg-stone-900/40 backdrop-blur-sm' : ''}`} style={{ transform: 'translate3d(0,0,0)', backfaceVisibility: 'hidden', isolation: 'isolate' }}>
        <ConfigModal isOpen={!!pendingNode} item={pendingNode?.item} suggestedQuantity={pendingNode?.suggestedQuantity} onClose={() => setPendingNode(null)} onConfirm={handleAddNode} />
        
        {(isGeneratingBlueprint || dataLoading) && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center animate-fade-in">
             <div className="relative">
                <div className={`absolute inset-0 bg-${theme.primary}-500 rounded-full blur-xl opacity-20 animate-pulse`}></div>
                <Loader2 size={48} className={`text-${theme.primary}-500 animate-spin relative z-10`} />
             </div>
             <h2 className="mt-6 text-xl font-black text-white uppercase tracking-wider">{isGeneratingBlueprint ? 'Constructing Blueprint...' : 'Loading Resources...'}</h2>
             <p className="text-gray-400 text-sm mt-2 font-medium">{isGeneratingBlueprint ? 'AI is analyzing requirements and drafting layout' : 'Syncing with project database'}</p>
          </div>
        )}

        {/* FIXED HEADER */}
        <div className="w-full px-4 pt-4 mb-4 shrink-0 relative z-[60]" style={{ transform: 'translateZ(0)' }}>
        <PowerHeader 
            title="Quote Builder" 
            icon={Crown} 
            stats={stats} 
            isPulseActive={isPulseActive} 
            onPulseToggle={() => setIsPulseActive(!isPulseActive)} 
            onAiSuggest={handleAiSuggest} 
            theme={theme.primary}
        >
            <div className="flex bg-black/40 rounded-xl p-1 border border-white/10 mr-2">
                <button onClick={() => setShowSidebar(!showSidebar)} className={`px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all ${showSidebar ? `bg-${theme.primary}-600 text-white shadow-lg` : 'text-gray-500 hover:text-white'}`}><List size={16} /></button>
                <button onClick={() => setShowChat(!showChat)} className={`px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all ${showChat ? `bg-${theme.primary}-600 text-white shadow-lg` : 'text-gray-500 hover:text-white'}`}><MessageSquare size={16} /></button>
            </div>

            {/* Aesthetic Switcher */}
            <button 
                onClick={() => setShowAestheticPicker(true)}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-xl font-bold transition-all text-xs uppercase tracking-widest flex items-center gap-2 mr-2"
            >
                <Palette size={16} /> Aesthetic
            </button>

            <div className="h-8 w-px bg-white/10 mx-2"></div>

            <button onClick={() => startOnboarding('quote')} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-xl font-bold transition-all text-xs uppercase tracking-widest flex items-center gap-2 mr-2"><GraduationCap size={16} /> Training</button>

            <button onClick={handleNewQuote} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-xl font-bold transition-all text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg"><Plus size={16} /> New</button>
            <button onClick={openLoadModal} className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-xl font-bold transition-all text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg"><Folder size={16} /> Load</button>
            
            <select value={selectedProject || ''} onChange={(e) => setSelectedProject(e.target.value)} className={`px-4 py-2.5 bg-black/40 border border-white/10 text-white rounded-xl font-bold min-w-[180px] hover:border-${theme.primary}-500 transition-all cursor-pointer text-xs outline-none`}>
                <option value="">Select Project...</option>
                {projects.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
            </select>

            <button onClick={() => setShowMap(!showMap)} className={`px-4 py-2.5 bg-${theme.primary}-600/20 hover:bg-${theme.primary}-600/30 border border-${theme.primary}-500/20 text-${theme.primary}-400 rounded-xl font-bold transition-all text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-${theme.primary}-900/20`}><MapPin size={16} /> Induce Map</button>
            <button 
                onClick={() => setShowIntelligence(!showIntelligence)} 
                className={`px-4 py-2.5 ${showIntelligence ? 'bg-indigo-600 text-white shadow-[0_0_20px_#6366f1]' : 'bg-white/5 text-gray-300'} border border-white/5 rounded-xl font-bold transition-all text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg`}
            >
                <Cpu size={16} className={showIntelligence ? 'animate-spin-slow' : ''} /> Neural Intel
            </button>
            <button onClick={() => setShowInsights(!showInsights)} className={`px-4 py-2.5 ${showInsights ? `bg-${theme.primary}-600 text-white` : 'bg-white/5 text-gray-300'} border border-white/5 rounded-xl font-bold transition-all text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg`}><Zap size={16} /> Insights</button>
            <button onClick={() => {
                if (allBillableItems.length === 0) {
                    alert("Add items to the quote before invoicing.");
                    return;
                }
                navigate('/invoices', { 
                    state: { 
                        diaryItems: allBillableItems.map(i => ({
                            id: i.tempId,
                            name: i.material.name,
                            quantity: i.quantity,
                            costRate: i.material.pricePerUnit || 0,
                            chargeRate: i.customRate || i.material.pricePerUnit || 0,
                            type: i.type
                        })),
                        projectId: selectedProject,
                        clientId: quoteSettings.clientId,
                        clientName: quoteSettings.clientName,
                        date: new Date()
                    } 
                });
            }} className={`px-4 py-2.5 bg-${theme.primary}-600/20 hover:bg-${theme.primary}-600/30 border border-${theme.primary}-500/20 text-${theme.primary}-400 rounded-xl font-bold transition-all text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-${theme.primary}-900/20`}><Calculator size={16} /> Invoice</button>
            <button onClick={handleSaveQuote} disabled={isSaving} className={`px-6 py-2.5 ${theme.button} text-white rounded-xl font-black uppercase tracking-widest shadow-xl transition-all disabled:opacity-50 text-xs`}>{isSaving ? 'Saving...' : 'Save Blueprint'}</button>
        </PowerHeader>
        </div>

        {/* SCROLLABLE CONTENT AREA */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 space-y-6 pb-24">
            {/* NEURAL INTELLIGENCE OVERLAY (The Loop Visualized) */}
            <AnimatePresence>
                {showIntelligence && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="w-full bg-indigo-600/10 border border-indigo-500/30 rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Cpu size={120} className="text-white" />
                        </div>
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-500 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                                    <BrainCircuit size={24} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-widest">Sovereign Intelligence Oracle</h3>
                                    <div className="text-indigo-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
                                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shadow-[0_0_10px_#22d3ee]" />
                                        Terminal State // Omniscient Learning Active
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex gap-6">
                                <div className="text-right">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bid Success Prob.</span>
                                    <div className="text-2xl font-black text-cyan-400 font-mono">{historicalDeltas.oracle?.bidSuccessProbability || '0%'}</div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ideal Margin Point</span>
                                    <div className="text-2xl font-black text-amber-400 font-mono">{historicalDeltas.oracle?.idealMarginPoint || '0%'}</div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Portfolio Accuracy</span>
                                    <div className="text-2xl font-black text-emerald-400 font-mono">{((historicalDeltas.globalAccuracy || 0) * 100).toFixed(0)}%</div>
                                </div>
                            </div>
                        </div>

                        {/* PARALLEL SCENARIOS & ORACLE INSIGHTS */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                            {/* Parallel Scenarios Sidebar */}
                            <div className="space-y-3 bg-black/40 border border-white/5 p-5 rounded-[2rem] relative overflow-hidden group/scenarios">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/scenarios:opacity-10 transition-opacity"><Layout size={60} className="text-white" /></div>
                                <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
                                    <Zap size={14} /> Parallel Scenarios
                                </h4>
                                {historicalDeltas.parallelScenarios?.map((s, i) => (
                                    <button key={i} className="w-full p-3 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center group/item hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all relative z-10">
                                        <div className="flex flex-col text-left">
                                            <span className="text-xs font-bold text-white group-hover/item:text-cyan-300">{s.name}</span>
                                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">Margin: {s.margin}</span>
                                        </div>
                                        <div className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase ${s.risk === 'High' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                            {s.risk}_RISK
                                        </div>
                                    </button>
                                ))}
                                <div className="pt-4 border-t border-white/5 mt-2">
                                    <p className="text-[8px] font-black text-slate-600 uppercase leading-relaxed">
                                        The Oracle has simulated 10,000 project trajectories. Scenario S2 is the mathematical path of least resistance.
                                    </p>
                                </div>
                            </div>

                            {/* Task Pattern Grid */}
                            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                                {historicalDeltas.patterns?.map((p, i) => (
                                    <div key={i} className="p-5 bg-black/40 border border-white/5 rounded-3xl space-y-3 hover:border-indigo-500/30 transition-all group/card relative overflow-hidden">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-black text-white uppercase">{p.taskType}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${p.sentiment === 'High Morale' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                                {p.sentiment}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-end border-b border-white/5 pb-2">
                                            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Drift Pattern</span>
                                            <span className={`text-sm font-mono font-bold ${p.delta > 1.0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                                {p.delta > 1.0 ? '+' : ''}{((p.delta - 1) * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Causal Inference</span>
                                            <span className="text-[10px] font-bold text-slate-300 italic">"{p.cause}"</span>
                                        </div>
                                        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center gap-2 group-hover/card:bg-indigo-500 group-hover/card:text-white transition-all">
                                            <Wand2 size={14} className="shrink-0" />
                                            <span className="text-[9px] font-black uppercase tracking-tighter leading-tight">Fix: {p.fix}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* INTELLIGENCE LAYER OVERLAY */}
            <div className="w-full">
                <QuoteIntelligenceLayer 
                    active={showInsights} 
                    nodes={nodes} 
                    edges={edges} 
                    financials={financials} 
                    onToggleHeatmap={handleHeatmapToggle}
                />
            </div>

            <div className="w-full grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 min-h-[700px]">
                {/* LEFT CONTROL PANEL */}
                <div className="flex flex-col gap-4 h-[700px]">
                    {/* PROJECT & MARGIN CONTROLS */}
                    <div className={`${theme.bg} backdrop-blur-xl border ${theme.border} rounded-[2rem] p-6 shadow-xl relative overflow-hidden group`}>
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Crown size={40} className="text-white" /></div>
                        <div className="space-y-5 relative z-10">
                             <div>
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-2"><Layout size={10} /> Target Project</label>
                                <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold text-white outline-none focus:border-indigo-500 focus:bg-black/60 transition-all cursor-pointer">
                                    <option value="" className="text-gray-500">Select Project...</option>
                                    {projects.map(p => <option key={p.id} value={p.id} className="text-white bg-slate-900">{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1.5">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><DollarSign size={10} /> Profit Margin</label>
                                    <span className="text-[10px] font-mono font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">{marginPct}%</span>
                                </div>
                                <div className="relative flex items-center h-4">
                                    <input type="range" min="0" max="100" value={marginPct} onChange={(e) => setMarginPct(parseInt(e.target.value))} className="w-full h-1.5 bg-white/10 rounded-full appearance-none accent-indigo-500 cursor-pointer hover:accent-indigo-400 transition-all z-10" />
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-indigo-600 rounded-full pointer-events-none" style={{ width: `${marginPct}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RESOURCE LIBRARY */}
                    <div className={`${theme.bg} backdrop-blur-xl border ${theme.border} rounded-[2rem] overflow-hidden ${theme.glow} flex-1 relative`}>
                        <ResourceSidebar 
                            materials={materials} 
                            staff={staff} 
                            equipment={equipment} 
                            onSearch={setSearchTerm} 
                            onTapAdd={onTapAdd}
                            isOpen={showSidebar}
                            onClose={() => setShowSidebar(false)}
                            theme={theme.primary}
                            mode="quote"
                        />
                    </div>
                </div>

                {/* CANVAS AREA */}
                <div className={`${theme.bg} backdrop-blur-xl border ${theme.border} rounded-[2rem] p-1 relative shadow-2xl overflow-hidden flex flex-col h-[700px]`}>
                    {/* Background Grid */}
                    <div 
                        className="absolute inset-0 pointer-events-none opacity-20" 
                        style={{ backgroundImage: `linear-gradient(to right, ${theme.accent} 1px, transparent 1px), linear-gradient(to bottom, ${theme.accent} 1px, transparent 1px)`, backgroundSize: '40px 40px' }}
                    ></div>
                    
                    <div ref={canvasRef} className={`flex-1 relative rounded-[1.8rem] overflow-hidden bg-black/20 border border-white/5 transition-all duration-500 ${isDragOver ? `bg-${theme.primary}-900/10` : ''}`} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
                    <div style={{ width: '100%', height: '100%' }}>
                        <ReactFlow 
                            nodes={nodes} 
                            edges={edges} 
                            nodeTypes={nodeTypes} 
                            edgeTypes={edgeTypes} 
                            onNodesChange={onNodesChange} 
                            onEdgesChange={onEdgesChange} 
                            onConnect={onConnect} 
                            onConnectEnd={onConnectEnd} // Added Handler
                            onNodeClick={handleNodeClick} 
                            snapToGrid={true} 
                            snapGrid={[20, 20]} 
                            fitView minZoom={0.05} maxZoom={2} 
                            proOptions={{ hideAttribution: true }}
                        >
                        <Background color={theme.accent} gap={40} size={1} className="opacity-[0.1]" />
                        <Controls className="!bg-slate-900 !border-white/10 !text-white" />
                        <MiniMap className="!bg-slate-900/80 !border-white/10" nodeColor={n => n.type==='dimension'?'#3b82f6':n.type==='zone'?'#a855f7':theme.accent} />
                        </ReactFlow>
                        
                        {/* SMART CONNECT MENU */}
                        {connectMenu && (
                            <div 
                                className="fixed z-[9999] bg-stone-900 border border-white/10 rounded-xl shadow-2xl p-2 flex flex-col gap-1 min-w-[160px] animate-in zoom-in-95 duration-200"
                                style={{ left: connectMenu.x, top: connectMenu.y }}
                            >
                                <div className="text-[10px] font-black text-gray-500 uppercase px-2 py-1 tracking-widest border-b border-white/5 mb-1">Create & Link</div>
                                {getCompatibleNodes(connectMenu.sourceType).map(type => (
                                    <button 
                                        key={type.id}
                                        onClick={() => handleConnectMenuSelect(type.id)}
                                        className="text-left px-3 py-2.5 hover:bg-white/10 rounded-lg text-xs font-bold text-white flex items-center gap-3 transition-colors"
                                    >
                                        <div className="p-1 rounded bg-white/5 text-indigo-400">{type.icon}</div> {type.label}
                                    </button>
                                ))}
                                <button onClick={() => setConnectMenu(null)} className="mt-1 pt-2 border-t border-white/5 text-center text-[10px] text-gray-500 hover:text-white uppercase font-bold tracking-wider">Cancel</button>
                            </div>
                        )}

                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none"><div className="bg-amber-500/10 backdrop-blur-md border border-amber-500/30 px-6 py-2 rounded-full flex items-center gap-3 shadow-xl"><span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span><span className="text-[10px] font-black text-amber-200 uppercase tracking-widest">Human Review Required</span></div></div>
                    </div>
                    </div>
                </div>
            </div>

            {/* BILL OF MATERIALS - BOTTOM */}
            <div className="w-full">
                <div className={`${theme.bg} backdrop-blur-xl border ${theme.border} rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-80 relative`}>
                    <div className={`p-4 border-b ${theme.border} bg-black/20 flex justify-between items-center px-8`}>
                    <div className="flex items-center gap-6"><h3 className={`text-sm font-black ${theme.text} uppercase tracking-wider flex items-center gap-2`}><List size={16} /> Bill of Materials</h3><div className={`flex gap-4 text-xs font-bold ${theme.text} opacity-70 uppercase tracking-widest`}><span>Items: <span className="text-white">{allBillableItems.length}</span></span><span>Total: <span className="text-emerald-400">{formatCurrency(financials.total)}</span></span></div></div>
                    <button className={`p-2 hover:bg-white/10 rounded-lg ${theme.text} hover:text-white transition-colors`}><Maximize size={14} /></button>
                    </div>
                    <div className="flex-1 overflow-hidden flex">
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">{allBillableItems.map(item => <QuoteItem key={item.tempId} item={item} onUpdate={item.isDynamic ? (id, updates) => updateItemNodeData(id, updates) : updateItem} onRemove={item.isDynamic ? deleteNode : deleteNode} formatCurrency={formatCurrency} />)}</div></div>
                        <div className={`w-72 bg-black/10 border-l ${theme.border} p-8 flex flex-col justify-center space-y-5`}>
                            <div className="space-y-1"><div className="flex justify-between items-center"><span className={`text-[10px] font-black ${theme.text} uppercase tracking-widest`}>Net Materials</span><span className="text-sm font-mono text-white font-bold">{formatCurrency(financials.materials)}</span></div><div className="flex justify-between items-center"><span className={`text-[10px] font-black ${theme.text} uppercase tracking-widest`}>Net Labor</span><span className="text-sm font-mono text-white font-bold">{formatCurrency(financials.staff)}</span></div></div>
                            <div className={`h-px ${theme.border} w-full`} /><div className="flex justify-between items-center"><span className={`text-[10px] font-black ${theme.text} uppercase tracking-widest`}>Applied Margin</span><span className={`text-sm font-mono ${theme.text} font-bold`}>{marginPct}%</span></div>
                            <div className="pt-2"><div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Grand Total</div><div className="text-3xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">{formatCurrency(financials.total)}</div></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="absolute bottom-[340px] right-6 z-50">
          {!showChat && <button onClick={() => setShowChat(true)} className={`w-14 h-14 rounded-full ${theme.button} flex items-center justify-center text-white hover:scale-110 transition-transform`}><Sparkles size={24} /></button>}
          <QuoteCopilot isOpen={showChat} onClose={() => setShowChat(false)} messages={chatMessages} onSendMessage={handleAIChat} isTyping={chatTyping} onAction={handleCopilotAction} onGenerateBlueprint={handleGenerateBlueprint} />
        </div>

        {/* HELP BEACON - Moved to bottom-left to avoid covering totals */}
        <VideoBeacon videoId="p1JESN0mH8o" title="Master the Neural Quoter" position="bottom-8 left-8" />
      </div>
    </div>
  )
}
const QuoteBuilder = () => <ReactFlowProvider><QuoteBuilderContent /></ReactFlowProvider>
export default QuoteBuilder