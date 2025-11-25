/*
 * MasterDiaryApp Official - Construction SaaS Platform
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 * 
 * VISUAL OVERHAUL: "Vibrant Solid 3D" & "Input on Drop"
 */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
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
  Position 
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { 
  User, Wrench, Package, Plus, Save, Search, Trash2,
  Crown, List, GripVertical, CheckCircle2, X, Sparkles, MapPin, Eye, EyeOff, UploadCloud
} from 'lucide-react'
import { api } from '../utils/api'
import CountUp from 'react-countup'
import MapBackground from './MapBackground'
import GeoreferenceModal from './GeoreferenceModal'

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

// ================================
// CONFIGURATION MODAL (Input on Drop)
// ================================

const ConfigModal = ({ isOpen, onClose, onConfirm, item }) => {
  const [value, setValue] = useState(1)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100)
      setValue(1)
    }
  }, [isOpen])

  if (!isOpen || !item) return null

  const isTimeBased = item.type === 'staff' || item.type === 'equipment'
  const label = isTimeBased ? 'Hours Worked' : 'Units'
  const unit = isTimeBased ? 'hrs' : 'units'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-stone-900 border border-white/10 rounded-2xl p-6 w-80 shadow-2xl transform transition-all scale-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-black text-white uppercase tracking-wide">Add {item.type}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20} /></button>
        </div>
        
        <div className="mb-6">
          <div className="text-sm font-bold text-gray-300 mb-2">{item.name}</div>
          <label className="block text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
            {label}
          </label>
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="number"
              min="0.1"
              step="0.5"
              value={value}
              onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
              onKeyDown={(e) => e.key === 'Enter' && onConfirm(value)}
              className="flex-1 bg-black/30 border-2 border-indigo-500/50 rounded-xl px-4 py-2 text-xl font-mono font-bold text-white focus:border-indigo-500 focus:outline-none text-center"
            />
            <span className="text-sm font-bold text-gray-500">{unit}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-xl font-bold text-gray-400 hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onConfirm(value)}
            className="flex-1 px-4 py-2 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/30 transition-all"
          >
            Add Item
          </button>
        </div>
      </div>
    </div>
  )
}

// ================================
// VISUAL NODE COMPONENT (Solid & Amazing)
// ================================

const GlassNode = ({ data, selected }) => {
  const { label, subLabel, quantity, type, onDelete } = data
  
  let containerClass = "bg-gradient-to-br from-indigo-600 to-violet-700 border-2 border-indigo-300 shadow-[0_10px_30px_-5px_rgba(79,70,229,0.6)]"
  let iconBg = "bg-white/20"
  let badgeClass = "bg-black/20 text-indigo-100 border border-white/20"
  let glowClass = "shadow-indigo-500/80"

  if (type === 'staff') {
    containerClass = "bg-gradient-to-br from-emerald-500 to-teal-700 border-2 border-emerald-200 shadow-[0_10px_30px_-5px_rgba(16,185,129,0.6)]"
    badgeClass = "bg-black/20 text-emerald-100 border border-white/20"
    glowClass = "shadow-emerald-500/80"
  } else if (type === 'equipment') {
    containerClass = "bg-gradient-to-br from-orange-500 to-amber-600 border-2 border-orange-200 shadow-[0_10px_30px_-5px_rgba(249,115,22,0.6)]"
    badgeClass = "bg-black/20 text-orange-100 border border-white/20"
    glowClass = "shadow-orange-500/80"
  }

  const getIcon = () => {
    switch (type) {
      case 'staff': return <User size={22} className="text-white" strokeWidth={2.5} />
      case 'equipment': return <Wrench size={22} className="text-white" strokeWidth={2.5} />
      default: return <Package size={22} className="text-white" strokeWidth={2.5} />
    }
  }

  return (
    <div className={`
      relative min-w-[280px] rounded-[2rem] transition-all duration-300 group
      ${containerClass}
      ${selected ? `scale-110 -translate-y-2 z-50 ring-4 ring-white/60 ${glowClass}` : 'hover:scale-105 hover:-translate-y-1 hover:shadow-2xl'}
    `}>
      <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-b from-white/30 via-white/5 to-transparent pointer-events-none" />
      <Handle type="target" position={Position.Top} className="!w-4 !h-4 !bg-white !border-4 !border-slate-900 transition-transform hover:scale-150" />
      
      <div className="relative p-5">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-2xl ${iconBg} backdrop-blur-sm border border-white/30 shadow-inner`}>
            {getIcon()}
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete?.() }}
            className="p-2 rounded-full bg-black/10 text-white/70 hover:bg-red-500 hover:text-white hover:shadow-lg transition-all backdrop-blur-md"
          >
            <X size={18} strokeWidth={3} />
          </button>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase ${badgeClass}`}>
              {type}
            </span>
            {selected && <span className="flex items-center gap-1 text-[10px] font-bold text-white animate-pulse"><Sparkles size={10}/> ACTIVE</span>}
          </div>
          <div className="text-2xl font-black leading-none text-white drop-shadow-md tracking-tight">
            {label}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/20">
          <div className="flex flex-col">
            <span className="text-[9px] text-white/80 font-bold uppercase tracking-wider">Quantity</span>
            <span className="text-xl font-mono font-bold text-white drop-shadow-sm">{quantity}</span>
          </div>
          <div className={`px-3 py-1.5 rounded-xl ${badgeClass} backdrop-blur-md`}>
            <div className="text-xs font-bold text-white/90 truncate max-w-[120px]">
              {subLabel}
            </div>
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-4 !h-4 !bg-white !border-4 !border-slate-900 transition-transform hover:scale-150" />
    </div>
  )
}

// ================================
// SIDEBAR DRAGGABLE ITEM (Matching Solids)
// ================================

const DraggableItem = ({ item }) => {
  const onDragStart = (event) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(item))
    event.dataTransfer.effectAllowed = 'move'
  }

  let wrapperClass = "bg-gradient-to-r from-indigo-600 to-violet-700 border-indigo-400/50 shadow-indigo-900/30"
  let hoverClass = "hover:from-indigo-500 hover:to-violet-600 hover:shadow-indigo-600/50 hover:-translate-y-1"
  let badgeClass = "bg-indigo-900/40 text-indigo-200 border-indigo-400/30"
  
  if (item.type === 'staff') {
    wrapperClass = "bg-gradient-to-r from-emerald-600 to-teal-700 border-emerald-400/50 shadow-emerald-900/30"
    hoverClass = "hover:from-emerald-500 hover:to-teal-600 hover:shadow-emerald-600/50 hover:-translate-y-1"
    badgeClass = "bg-emerald-900/40 text-emerald-200 border-emerald-400/30"
  } else if (item.type === 'equipment') {
    wrapperClass = "bg-gradient-to-r from-orange-500 to-amber-600 border-orange-400/50 shadow-orange-900/30"
    hoverClass = "hover:from-orange-400 hover:to-amber-500 hover:shadow-orange-600/50 hover:-translate-y-1"
    badgeClass = "bg-orange-900/40 text-orange-200 border-orange-400/30"
  }

  const getIcon = () => {
    if (item.type === 'staff') return <User size={18} className="text-white" strokeWidth={3} />
    if (item.type === 'equipment') return <Wrench size={18} className="text-white" strokeWidth={3} />
    return <Package size={18} className="text-white" strokeWidth={3} />
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={`
        group relative flex items-center gap-4 p-4 rounded-2xl border-t border-l border-white/20
        cursor-grab active:cursor-grabbing transition-all duration-300
        shadow-lg ${wrapperClass} ${hoverClass}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-2xl pointer-events-none" />
      
      <div className="relative p-2.5 rounded-xl bg-black/20 shadow-inner ring-1 ring-white/10 group-hover:scale-110 transition-transform">
        {getIcon()}
      </div>
      
      <div className="relative flex-1 min-w-0">
        <div className="text-sm font-black text-white truncate drop-shadow-md tracking-tight">{item.name}</div>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeClass}`}>
            {item.type === 'staff' ? `$${item.chargeRate}/hr` : item.type === 'equipment' ? `$${item.costRate}/day` : `$${item.pricePerUnit}/unit`}
          </span>
        </div>
      </div>

      <div className="relative opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 rounded-lg p-1 backdrop-blur-sm">
        <GripVertical size={14} className="text-white" />
      </div>
    </div>
  )
}

// ================================
// LIST ITEM COMPONENT
// ================================

const QuoteItem = ({ item, onUpdate, onRemove, formatCurrency }) => {
  const [isEditing, setIsEditing] = useState(false)

  const getRate = () => {
    if (item.type === 'staff') return item.material.chargeRate
    if (item.type === 'equipment') return item.material.costRate
    return item.material.pricePerUnit
  }

  let themeClass = "bg-indigo-900/20 border-indigo-500/30 hover:bg-indigo-900/40"
  let barColor = "bg-indigo-500"
  
  if (item.type === 'staff') {
    themeClass = "bg-emerald-900/20 border-emerald-500/30 hover:bg-emerald-900/40"
    barColor = "bg-emerald-500"
  } else if (item.type === 'equipment') {
    themeClass = "bg-amber-900/20 border-amber-500/30 hover:bg-amber-900/40"
    barColor = "bg-orange-500"
  }

  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 group hover:shadow-md ${themeClass}`}>
      <div className="flex items-center gap-3 overflow-hidden">
        <div className={`w-1.5 h-10 rounded-full ${barColor} shadow-[0_0_12px_currentColor]`} />
        <div className="space-y-1">
          <div className="bg-stone-900/80 border border-white/10 px-2 py-0.5 rounded-lg">
            <div className="text-sm font-bold text-white truncate w-32 lg:w-48">{item.material.name}</div>
          </div>
          <div className="inline-block bg-stone-900/50 border border-white/5 px-2 py-0.5 rounded-md">
            <div className="text-[10px] text-gray-300 font-mono">{formatCurrency(getRate())} / unit</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end gap-1">
          <span className="text-[9px] text-gray-400 font-bold uppercase bg-stone-900/50 px-1 rounded">QTY</span>
          {isEditing ? (
            <input
              type="number"
              className="w-14 bg-stone-800 border border-indigo-500 text-white text-xs px-2 py-1 rounded-lg text-right focus:outline-none shadow-[0_0_10px_rgba(99,102,241,0.3)]"
              defaultValue={item.quantity}
              onBlur={(e) => {
                const val = parseFloat(e.target.value)
                if (val > 0) onUpdate(item.tempId, { quantity: val })
                setIsEditing(false)
              }}
              onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
              autoFocus
            />
          ) : (
            <div 
              onClick={() => setIsEditing(true)}
              className="bg-stone-900/80 border border-white/10 px-3 py-1 rounded-lg hover:border-indigo-500 cursor-pointer transition-colors hover:scale-105"
            >
              <div className="text-sm font-mono font-bold text-white">
                {item.quantity}
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end w-24 gap-1">
          <span className="text-[9px] text-gray-400 font-bold uppercase bg-stone-900/50 px-1 rounded">Total</span>
          <div className="bg-stone-900/80 border border-white/10 px-2 py-1 rounded-lg w-full text-right">
            <div className="text-sm font-bold text-emerald-400">{formatCurrency(getRate() * item.quantity)}</div>
          </div>
        </div>
        <button onClick={() => onRemove(item.tempId)} className="p-2 bg-stone-800 hover:bg-red-900/80 border border-white/10 hover:border-red-500/50 rounded-xl text-gray-400 hover:text-white transition-all opacity-0 group-hover:opacity-100">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}

// ================================
// MAIN COMPONENT
// ================================

const initialNodes = []
const initialEdges = []

const QuoteBuilderContent = () => {
  const nodeTypes = useMemo(() => ({ glass: GlassNode }), [])
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [materials, setMaterials] = useState([])
  const [staff, setStaff] = useState([])
  const [equipment, setEquipment] = useState([])
  const [projects, setProjects] = useState([])
  const [quoteItems, setQuoteItems] = useState([])
  const [selectedProject, setSelectedProject] = useState('')
  const [marginPct, setMarginPct] = useState(20)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [dropSuccess, setDropSuccess] = useState(false)
  const [pendingNode, setPendingNode] = useState(null)
  
  // Map State
  const [showMap, setShowMap] = useState(false)
  const [projectLocation, setProjectLocation] = useState(null)
  const [showGeoModal, setShowGeoModal] = useState(false)
  const [sitePlan, setSitePlan] = useState(null) // { imageUrl, bounds, opacity }

  // AI State
  const [aiAnalysis, setAiAnalysis] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const canvasRef = useRef(null)
  const { screenToFlowPosition } = useReactFlow()

  const handleSitePlanSave = (planData) => {
    setSitePlan(planData);
    // Auto-enable map if not already
    setShowMap(true);
    // If we have bounds, center map roughly there (optional enhancement later)
    if (planData.bounds) {
       const centerLat = (planData.bounds.north + planData.bounds.south) / 2;
       const centerLng = (planData.bounds.east + planData.bounds.west) / 2;
       setProjectLocation({ lat: centerLat, lng: centerLng });
    }
  }

  // AI Analysis Handler
  const handleAnalyze = async () => {
    if (quoteItems.length === 0) return alert('Add items to the quote first!')
    setIsAnalyzing(true)
    try {
      const res = await api.post('/ai/analyze-quote', {
        items: quoteItems.map(i => ({ name: i.material.name, type: i.type, quantity: i.quantity })),
        location: projectLocation,
        projectName: selectedProject ? projects.find(p => p.id === selectedProject)?.name : 'Draft Quote'
      })
      setAiAnalysis(res.data.analysis)
    } catch (err) {
      console.error(err)
      alert('AI Analysis failed. Make sure Backend is running with Gemini API Key.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [n, s, e, p] = await Promise.all([
          api.get('/nodes'), api.get('/staff'), api.get('/equipment'), api.get('/projects')
        ])
        setMaterials(n.data.data || n.data || [])
        setStaff((s.data.data || s.data || []).map(x => ({...x, type: 'staff', payRate: x.payRateBase, chargeRate: x.chargeOutBase})))
        setEquipment((e.data.data || e.data || []).map(x => ({...x, type: 'equipment', costRate: x.costRateBase})))
        setProjects(p.data.data || p.data || [])
      } catch (err) { console.error(err) }
    }
    fetchData()
  }, [])

  const filtered = (items) => items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
  
  const deleteNode = useCallback((id) => {
    setNodes((nds) => nds.filter(n => n.id !== id))
    setQuoteItems((items) => items.filter(i => i.tempId !== id))
  }, [setNodes])

  const updateItem = useCallback((tempId, updates) => {
    setQuoteItems(prev => prev.map(i => i.tempId === tempId ? { ...i, ...updates } : i))
    setNodes(nds => nds.map(n => n.id === tempId ? { ...n, data: { ...n.data, ...updates } } : n))
  }, [setNodes])

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges])

  // Drag & Drop
  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
  }, [])

  const onDragLeave = () => setIsDragOver(false)

  const onDrop = useCallback((event) => {
    event.preventDefault()
    setIsDragOver(false)
    const type = event.dataTransfer.getData('application/reactflow')
    if (!type) return

    const item = JSON.parse(type)
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY })
    
    // Open modal instead of direct add
    setPendingNode({ item, position })
  }, [screenToFlowPosition])

  const handleAddNode = (quantity) => {
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
    setQuoteItems(prev => [...prev, { nodeId: item.id, tempId: nodeId, quantity: quantity, material: item, type: item.type || 'material' }])
    
    setDropSuccess(true)
    setTimeout(() => setDropSuccess(false), 600)
    setPendingNode(null)
  }

  // Calculations
  const { totalCost, totalRevenue, margin } = useMemo(() => {
    let c = 0, r = 0
    quoteItems.forEach(i => {
      const qty = i.quantity
      if (i.type === 'staff') {
        c += qty * i.material.payRate
        r += qty * i.material.chargeRate
      } else if (i.type === 'equipment') {
        c += qty * i.material.costRate
        r += (qty * i.material.costRate) * (1 + marginPct / 100)
      } else {
        c += qty * i.material.pricePerUnit
        r += (qty * i.material.pricePerUnit) * (1 + marginPct / 100)
      }
    })
    return { totalCost: c, totalRevenue: r, margin: r - c }
  }, [quoteItems, marginPct])

  const handleSave = async () => {
    if (!selectedProject) return alert('Select a project first!')
    
    try {
      // If map location is set, update project location first
      if (projectLocation) {
        await api.put(`/projects/${selectedProject}`, {
          latitude: projectLocation.lat,
          longitude: projectLocation.lng
        })
      }
      
      // Save logic (currently simulation, but now acknowledges map)
      alert('Quote & Location Saved Successfully! (Simulation)')
    } catch (err) {
      console.error('Error saving quote/location:', err)
      alert('Error saving location data.')
    }
  }

  return (
    <div className="h-[calc(100vh-80px)] bg-transparent flex flex-col font-sans overflow-hidden text-white relative">
      <GeoreferenceModal 
         isOpen={showGeoModal} 
         onClose={() => setShowGeoModal(false)}
         onSave={handleSitePlanSave}
      />

      {/* Map Background Layer */}
      {showMap && (
        <div className="absolute inset-0 z-0 animate-fade-in">
            <MapBackground 
              activeLocation={projectLocation} 
              onLocationSelect={setProjectLocation} 
              overlayImage={sitePlan}
            />
        </div>
      )}

      {/* Main Content Overlay */}
      <div className={`absolute inset-0 z-10 flex flex-col transition-all duration-500 ${showMap ? 'bg-stone-900/40 backdrop-blur-sm' : ''}`}>
      
      <ConfigModal 
        isOpen={!!pendingNode} 
        item={pendingNode?.item} 
        onClose={() => setPendingNode(null)} 
        onConfirm={handleAddNode} 
      />

      {/* --- TOP NAVIGATION BAR --- */}
      <div className={`h-16 px-6 border-b border-white/10 ${showMap ? 'bg-stone-900/60' : 'bg-stone-900/80'} backdrop-blur-md z-30 flex justify-between items-center shadow-lg transition-colors`}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)] ring-1 ring-white/20">
            <Crown className="text-white" size={20} />
          </div>
          <div>
            <div className="bg-stone-900/80 px-2 py-0.5 rounded border border-white/10 inline-block mb-0.5">
              <h1 className="text-sm font-black text-white tracking-tight">QUOTE BUILDER</h1>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-stone-900/60 px-2 py-0.5 rounded border border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
              Live Editor
            </div>
          </div>
        </div>

        {/* Center Stats HUD */}
        <div className={`hidden md:flex items-center gap-4 ${showMap ? 'bg-stone-900/80' : 'bg-stone-900/90'} p-2 rounded-2xl border border-white/10 shadow-2xl transition-colors`}>
          <div className="flex items-center gap-2 px-3">
             <div className="flex flex-col">
               <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Cost</div>
               <div className="text-sm font-mono font-bold text-red-400 drop-shadow-sm"><CountUp end={totalCost} prefix="$" separator="," /></div>
             </div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex items-center gap-2 px-3">
             <div className="flex flex-col">
               <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Revenue</div>
               <div className="text-sm font-mono font-bold text-emerald-400 drop-shadow-sm"><CountUp end={totalRevenue} prefix="$" separator="," /></div>
             </div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          
          {/* Margin Simulation Control */}
          <div className="flex items-center gap-4 px-4 py-1 bg-indigo-950/40 border border-indigo-500/30 rounded-xl relative group">
            {marginPct !== 20 && (
              <div className="absolute -top-3 -right-2 bg-amber-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-lg animate-bounce">
                SIMULATION
              </div>
            )}
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-1 w-24">
                <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-wider">Target Margin</span>
                <span className="text-[9px] font-mono font-bold text-white">{marginPct}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={marginPct} 
                onChange={(e) => setMarginPct(Number(e.target.value))}
                className="w-24 h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
              />
            </div>
            <div className="flex flex-col items-end min-w-[60px]">
               <div className="text-sm font-mono font-bold text-indigo-100 drop-shadow-md"><CountUp end={margin} prefix="$" separator="," /></div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
           
           {/* Site Plan Upload */}
           <button
             onClick={() => setShowGeoModal(true)}
             className="p-2 rounded-lg border border-white/10 bg-stone-800 text-emerald-400 hover:bg-stone-700 hover:text-emerald-300 transition-all shadow-lg"
             title="Upload Site Plan"
           >
             <UploadCloud size={20} />
           </button>

           {/* Map Toggle Button */}
           <button
             onClick={() => setShowMap(!showMap)}
             className={`
               p-2 rounded-lg border transition-all shadow-lg flex items-center gap-2
               ${showMap 
                 ? 'bg-indigo-600 border-indigo-400 text-white shadow-indigo-500/50' 
                 : 'bg-stone-800 border-white/10 text-gray-400 hover:text-white'
               }
             `}
             title={showMap ? "Hide Map" : "Show Map"}
           >
             {showMap ? <EyeOff size={20} /> : <MapPin size={20} />}
           </button>

          <select 
            value={selectedProject} 
            onChange={e => setSelectedProject(e.target.value)}
            className="bg-stone-900 border border-white/10 text-sm text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner"
          >
            <option value="">Select Project...</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          
          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className={`
              px-4 py-2 rounded-lg text-sm font-bold border transition-all flex items-center gap-2
              ${isAnalyzing ? 'bg-indigo-900/50 text-indigo-300 border-indigo-500/20' : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-white/20 hover:shadow-[0_0_15px_rgba(168,85,247,0.5)]'}
            `}
          >
            <Sparkles size={16} className={isAnalyzing ? 'animate-spin' : ''} />
            {isAnalyzing ? 'Analyzing...' : 'AI Insights'}
          </button>

          <button 
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-[0_0_20px_rgba(99,102,241,0.4)] border border-indigo-400/50 transition-all flex items-center gap-2 active:scale-95"
          >
            <Save size={16} /> <span className="hidden sm:inline">Save Quote</span>
          </button>
        </div>
      </div>
      
      {/* AI Analysis Modal */}
      {aiAnalysis && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-stone-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border-b border-white/10 flex justify-between items-start">
               <div>
                 <div className="flex items-center gap-2 text-purple-400 mb-1">
                   <Sparkles size={18} />
                   <span className="text-xs font-bold uppercase tracking-widest">Gemini Intelligence</span>
                 </div>
                 <h2 className="text-xl font-bold text-white">Project Analysis</h2>
               </div>
               <button onClick={() => setAiAnalysis(null)} className="text-gray-400 hover:text-white"><X size={20}/></button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="flex items-center gap-4">
                 <div className="bg-stone-800 p-3 rounded-xl border border-white/5">
                   <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Estimated Duration</div>
                   <div className="text-2xl font-black text-white">{aiAnalysis.estimatedDuration}</div>
                 </div>
                 <div className="flex-1 bg-stone-800 p-3 rounded-xl border border-white/5">
                   <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Weather Insight</div>
                   <div className="text-sm text-gray-300 leading-snug">{aiAnalysis.weatherNote}</div>
                 </div>
              </div>
              
              <div>
                <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-3">Identified Risks</h3>
                <div className="space-y-2">
                  {aiAnalysis.risks?.map((risk, i) => (
                    <div key={i} className="flex gap-3 bg-red-950/20 border border-red-500/20 p-3 rounded-xl">
                      <div className="text-red-500 font-bold">{i+1}.</div>
                      <div className="text-sm text-gray-300">{risk}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                 <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-3">Efficiency Opportunity</h3>
                 <div className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-xl text-sm text-gray-300 italic">
                   "{aiAnalysis.efficiencyTip}"
                 </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-white/10 bg-stone-900/50">
               <button onClick={() => setAiAnalysis(null)} className="w-full py-3 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-colors">
                 Acknowledge
               </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* --- LEFT SIDEBAR (Vibrant) --- */}
        <div className="w-80 bg-stone-900/95 border-r border-white/5 flex flex-col z-20 shadow-2xl">
          <div className="p-4 border-b border-white/5 bg-stone-900/50">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
              <input 
                type="text" 
                placeholder="Search items..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-stone-800 border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white focus:border-indigo-500 focus:bg-stone-900 outline-none transition-all placeholder-gray-500"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] bg-emerald-950/40 px-2 py-1 rounded border border-emerald-500/20">Staffing</h3>
                <span className="text-[10px] font-bold bg-emerald-950/60 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(16,185,129,0.1)]">{filtered(staff).length}</span>
              </div>
              <div className="space-y-2">{filtered(staff).map(x => <DraggableItem key={x.id} item={x} />)}</div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] bg-amber-950/40 px-2 py-1 rounded border border-amber-500/20">Equipment</h3>
                <span className="text-[10px] font-bold bg-amber-950/60 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(245,158,11,0.1)]">{filtered(equipment).length}</span>
              </div>
              <div className="space-y-2">{filtered(equipment).map(x => <DraggableItem key={x.id} item={x} />)}</div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] bg-indigo-950/40 px-2 py-1 rounded border border-indigo-500/20">Materials</h3>
                <span className="text-[10px] font-bold bg-indigo-950/60 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(99,102,241,0.1)]">{filtered(materials).length}</span>
              </div>
              <div className="space-y-2">{filtered(materials).map(x => <DraggableItem key={x.id} item={x} />)}</div>
            </div>
          </div>
        </div>

        {/* --- CENTER (Canvas / Drop Zone) --- */}
        <div className="flex-1 flex flex-col relative bg-transparent">
          
          {/* Blueprint Grid Background */}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[size:40px_40px] bg-[linear-gradient(to_right,#4f46e5_1px,transparent_1px),linear-gradient(to_bottom,#4f46e5_1px,transparent_1px)]" />
          
          {/* Prominent Drop Box Backing */}
          <div className="flex-1 p-6 relative overflow-hidden flex flex-col">
            <div 
              ref={canvasRef}
              className={`
                flex-1 rounded-3xl relative overflow-hidden transition-all duration-500 ease-out
                ${isDragOver 
                  ? 'border-4 border-indigo-500 bg-indigo-900/20 shadow-[0_0_100px_rgba(99,102,241,0.3)] scale-[0.99]' 
                  : 'border-2 border-white/5 bg-stone-900/40 shadow-2xl'}
                backdrop-blur-sm
              `}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              {/* Empty State Prompt */}
              {quoteItems.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none z-10 animate-fade-in">
                  <div className={`
                    w-32 h-32 rounded-full flex items-center justify-center mb-6 transition-all duration-500 border-2
                    ${isDragOver ? 'bg-indigo-500/20 border-indigo-500/50 scale-110 animate-pulse shadow-[0_0_50px_rgba(99,102,241,0.4)]' : 'bg-stone-900/50 border-white/10'}
                  `}>
                    <Plus size={48} className={`transition-colors duration-300 ${isDragOver ? 'text-indigo-400' : 'text-white/20'}`} />
                  </div>
                  <div className="bg-stone-900/80 px-6 py-3 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl">
                    <h2 className="text-2xl font-black text-white tracking-tight mb-1 drop-shadow-lg">
                      {isDragOver ? 'DROP TO ADD' : 'BUILD YOUR QUOTE'}
                    </h2>
                    <p className="text-white/50 font-medium text-sm uppercase tracking-widest">Drag resources from the left</p>
                  </div>
                </div>
              )}

              {/* Drop Success Flash Overlay */}
              <div className={`absolute inset-0 bg-emerald-500/10 pointer-events-none transition-opacity duration-500 z-50 ${dropSuccess ? 'opacity-100' : 'opacity-0'}`} />

              {/* React Flow Canvas */}
              <div style={{ width: '100%', height: '100%' }}>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  nodeTypes={nodeTypes}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  snapToGrid={true}
                  snapGrid={[20, 20]}
                  fitView
                  proOptions={{ hideAttribution: true }}
                >
                  <Background color="#6366f1" gap={40} size={1} className="opacity-[0.05]" />
                  <Controls className="!bg-stone-900 !border-white/10 !text-white !rounded-lg overflow-hidden shadow-xl !p-1" />
                  <MiniMap 
                    className="!bg-stone-900 !border-white/10 !rounded-lg shadow-xl !m-4" 
                    nodeColor={n => n.type==='staff'?'#10b981':n.type==='equipment'?'#f59e0b':'#6366f1'}
                    maskColor="rgba(0,0,0,0.6)"
                  />
                </ReactFlow>
              </div>
            </div>
          </div>

          {/* --- BOTTOM SHEET (Quote Details) --- */}
          <div className="h-72 bg-stone-900 border-t border-white/10 flex flex-col z-20 shadow-[0_-10px_50px_rgba(0,0,0,0.5)]">
            <div className="px-6 py-3 border-b border-white/5 flex justify-between items-center bg-stone-900/95 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-500/20 p-1.5 rounded-lg border border-indigo-500/30">
                  <List size={16} className="text-indigo-400" /> 
                </div>
                <h3 className="text-xs font-black text-gray-300 uppercase tracking-widest">Line Items ({quoteItems.length})</h3>
              </div>
              <div className="flex items-center gap-2 bg-stone-900/80 px-3 py-1.5 rounded-lg border border-white/5">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total</span>
                <span className="text-sm font-mono font-bold text-white">{formatCurrency(totalRevenue)}</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-stone-950/50">
              {quoteItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 text-sm italic">
                  <List size={24} className="mb-2 opacity-20" />
                  <div className="bg-stone-900/80 px-4 py-2 rounded-lg border border-white/5 text-white/50">
                    Drag items to the canvas to generate line items.
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {quoteItems.map(item => (
                    <QuoteItem 
                      key={item.tempId} 
                      item={item} 
                      onUpdate={updateItem} 
                      onRemove={deleteNode} 
                      formatCurrency={formatCurrency}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
  )
}

const QuoteBuilder = () => (
  <ReactFlowProvider>
    <QuoteBuilderContent />
  </ReactFlowProvider>
)

export default QuoteBuilder