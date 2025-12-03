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
  Layout, Focus, Image as ImageIcon, Zap, DollarSign
} from 'lucide-react'
import { api } from '../utils/api'
import CountUp from 'react-countup'
import MapBackground from './MapBackground'
import GeoreferenceModal from './GeoreferenceModal'
import GoogleServicesSuggestions from './GoogleServicesSuggestions'
import { generateQuotePDF } from '../utils/pdfGenerator'

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

// Simple material coverage database (Mock)
const MATERIAL_COVERAGE = {
  'paint': { coverage: 350, unit: 'sq ft/gal', waste: 1.1 }, // 350 sqft per gal
  'drywall': { coverage: 32, unit: 'sq ft/sheet', waste: 1.15 }, // 4x8 sheet
  'flooring': { coverage: 15, unit: 'sq ft/box', waste: 1.1 },
  'insulation': { coverage: 40, unit: 'sq ft/roll', waste: 1.05 },
  'concrete': { coverage: 80, unit: 'sq ft/yd (4in)', waste: 1.05 }, // approx for 4 inch slab
}

// ================================
// CONFIGURATION MODAL (Input on Drop)
// ================================

const ConfigModal = ({ isOpen, onClose, onConfirm, item, suggestedQuantity }) => {
  const [value, setValue] = useState(suggestedQuantity || 1)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setValue(suggestedQuantity || 1)
      if (inputRef.current) setTimeout(() => inputRef.current.focus(), 100)
    }
  }, [isOpen, suggestedQuantity])

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
          {suggestedQuantity && (
            <div className="mt-2 text-xs text-emerald-400 font-bold flex items-center gap-1">
              <Sparkles size={10} /> AI Suggested based on dimensions
            </div>
          )}
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
// QUOTE SETTINGS MODAL
// ================================

const QuoteSettingsModal = ({ isOpen, onClose, settings, setSettings, projects, selectedProject }) => {
  if (!isOpen) return null

  useEffect(() => {
    if (selectedProject && !settings.clientName) {
      const proj = projects.find(p => p.id === selectedProject)
      if (proj && proj.client) {
        setSettings(s => ({ ...s, clientName: proj.client }))
      }
    }
  }, [selectedProject, projects, isOpen])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-stone-900 border border-white/10 rounded-2xl p-6 w-[500px] shadow-2xl transform transition-all scale-100">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Settings className="text-indigo-500" size={24} />
            <h3 className="text-xl font-black text-white uppercase tracking-wide">Quote Settings</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Client Name</label>
            <input 
              type="text" 
              value={settings.clientName} 
              onChange={e => setSettings({...settings, clientName: e.target.value})}
              className="w-full bg-stone-800 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-indigo-500 outline-none"
              placeholder="Enter client name..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Valid Until</label>
              <input 
                type="date" 
                value={settings.validUntil} 
                onChange={e => setSettings({...settings, validUntil: e.target.value})}
                className="w-full bg-stone-800 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
               <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</label>
               <select
                 value={settings.status}
                 onChange={e => setSettings({...settings, status: e.target.value})}
                 className="w-full bg-stone-800 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-indigo-500 outline-none"
               >
                 <option value="DRAFT">Draft</option>
                 <option value="SENT">Sent</option>
                 <option value="APPROVED">Approved</option>
                 <option value="REJECTED">Rejected</option>
               </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Terms & Conditions</label>
            <textarea 
              value={settings.terms} 
              onChange={e => setSettings({...settings, terms: e.target.value})}
              className="w-full bg-stone-800 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-indigo-500 outline-none h-32 text-sm"
              placeholder="Enter standard terms..."
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/30 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

// ================================
// NODES: Dimension (Visual Takeoff)
// ================================

const DimensionNode = ({ data, selected }) => {
  const { width = 100, height = 100, label, onDelete, onResize } = data
  const area = ((width / 20) * (height / 20)).toFixed(1) // Assuming 20px = 1 unit (ft/m)

  return (
    <div className={`
       relative rounded-lg border-2 border-dashed border-blue-400/50 bg-blue-500/10 backdrop-blur-sm group
       ${selected ? 'ring-2 ring-blue-400' : ''}
    `} style={{ width: '100%', height: '100%', minWidth: 50, minHeight: 50 }}>
      <NodeResizer 
        minWidth={50} 
        minHeight={50} 
        isVisible={selected} 
        lineClassName="border-blue-400" 
        handleClassName="h-3 w-3 bg-blue-500 border-2 border-white rounded"
      />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
         <span className="text-xs font-bold text-blue-200 uppercase tracking-widest">{label || 'Room'}</span>
         <span className="text-xl font-black text-white drop-shadow-md">{area} <span className="text-xs font-normal opacity-70">sq ft</span></span>
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); onDelete?.() }}
        className="absolute -top-3 -right-3 p-1.5 rounded-full bg-red-500 text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-auto"
      >
        <X size={12} strokeWidth={3} />
      </button>

      {/* Target handle for dropping materials onto this dimension */}
      <Handle type="target" position={Position.Top} className="!w-full !h-full !opacity-0 !bg-transparent !border-none !rounded-none" />
    </div>
  )
}

// ================================
// NODES: Zone (Grouping)
// ================================

const ZoneNode = ({ data, selected }) => {
  const { label, onDelete, width, height } = data
  
  return (
    <div className={`
      relative rounded-3xl border-2 border-white/10 bg-white/5 group transition-all duration-300
      ${selected ? 'border-indigo-500/50 bg-indigo-500/5 ring-2 ring-indigo-500/20' : ''}
    `} style={{ width: '100%', height: '100%', minWidth: 100, minHeight: 100 }}>
       <NodeResizer 
        minWidth={100} 
        minHeight={100} 
        isVisible={selected} 
        lineClassName="border-indigo-400/30" 
        handleClassName="h-2 w-2 bg-indigo-500/50 border border-white/50 rounded-full"
      />
      <div className="absolute top-4 left-4 pointer-events-none">
        <span className="text-xs font-black text-white/20 uppercase tracking-[0.2em]">{label || 'ZONE'}</span>
      </div>
      
       <button 
        onClick={(e) => { e.stopPropagation(); onDelete?.() }}
        className="absolute -top-2 -right-2 p-1 rounded-full bg-stone-800 text-gray-500 hover:text-white border border-white/10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-auto"
      >
        <X size={10} strokeWidth={3} />
      </button>
    </div>
  )
}

// ================================
// NODES: Standard Item (Solid)
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
// SIDEBAR DRAGGABLE ITEM
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
            <div className="text-sm font-bold text-white truncate flex-1 min-w-[80px]">{item.material.name}</div>
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
        <div className="flex flex-col items-end w-20 sm:w-24 gap-1">
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
// AI CHAT COMPONENT
// ================================

const AIChat = ({ isOpen, onClose, messages, onSendMessage, isTyping }) => {
  const [input, setInput] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  if (!isOpen) return null

  return (
    <div className="absolute bottom-20 right-6 w-96 h-[500px] bg-stone-900/95 border border-white/20 rounded-2xl shadow-2xl flex flex-col z-50 backdrop-blur-xl animate-fade-in">
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white">AI Copilot</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Online</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white"><Minimize size={18} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="text-center text-gray-500 text-sm mt-10">
            <Sparkles size={40} className="mx-auto mb-4 opacity-20" />
            <p>Ask me to estimate materials, check risks, or optimize your quote!</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-stone-800 text-gray-200 border border-white/10 rounded-tl-none'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
             <div className="bg-stone-800 p-3 rounded-2xl rounded-tl-none border border-white/10 flex gap-1">
               <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
               <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-75" />
               <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-150" />
             </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/10 bg-stone-900/50 rounded-b-2xl">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (onSendMessage(input), setInput(''))}
            placeholder="Ask about materials, costs..."
            className="w-full bg-stone-800 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
          />
          <button 
            onClick={() => { onSendMessage(input); setInput('') }}
            disabled={!input.trim()}
            className="absolute right-2 top-2 p-1.5 bg-indigo-600 rounded-lg text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send size={16} />
          </button>
        </div>
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
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const nodeTypes = useMemo(() => ({ glass: GlassNode, dimension: DimensionNode, zone: ZoneNode }), [])
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
  const [quoteSettings, setQuoteSettings] = useState({ clientName: '', validUntil: '', terms: '', status: 'DRAFT' })
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showFinancials, setShowFinancials] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)

  // Feature State
  const [showMap, setShowMap] = useState(false)
  const [projectLocation, setProjectLocation] = useState(null)
  const [showGeoModal, setShowGeoModal] = useState(false)
  const [sitePlan, setSitePlan] = useState(null)
  const [showStreetView, setShowStreetView] = useState(false)

  // Chat State
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [chatTyping, setChatTyping] = useState(false)

  const canvasRef = useRef(null)
  const { screenToFlowPosition, getNodes, fitView } = useReactFlow()

  // --- FETCH DATA ---
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

  // --- LOAD EXISTING QUOTE ---
  useEffect(() => {
    if (!id || materials.length === 0) return

    const loadQuote = async () => {
      try {
        const res = await api.get(`/quotes/${id}`)
        const quote = res.data

        setSelectedProject(quote.projectId)
        setMarginPct(quote.marginPct)
        setQuoteSettings({
           clientName: quote.clientName || '', // assuming these might be saved
           validUntil: quote.validUntil || '',
           terms: quote.terms || '',
           status: quote.status || 'DRAFT'
        })

        const loadedItems = []
        const loadedNodes = []

        // Helper to process items
        const processItem = (item, type, list) => {
           const refItem = list.find(x => x.id === (item.nodeId || item.staffId || item.equipmentId))
           if (!refItem) return

           const tempId = `${type}-${refItem.id}-${Date.now()}-${Math.random()}`
           
           // Visual Node
           loadedNodes.push({
              id: tempId,
              type: 'glass',
              position: { x: Math.random() * 800, y: Math.random() * 600 }, // Random position as coordinates aren't saved yet
              data: {
                 label: refItem.name,
                 subLabel: type,
                 quantity: item.quantity || item.hours,
                 type: type,
                 onDelete: () => deleteNode(tempId)
              }
           })

           // Data Item
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

      } catch (err) {
        console.error('Error loading quote:', err)
        alert('Failed to load quote details.')
      }
    }
    loadQuote()
  }, [id, materials, staff, equipment])

  // --- AI ACTIONS ---
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
      setChatMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }])
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to the server." }])
    } finally {
      setChatTyping(false)
    }
  }

  // --- DRAWING ACTIONS ---
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
        }
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
       style: { width: 400, height: 400, zIndex: -1 }, // Behind other nodes
       data: {
          label: `Zone ${nodes.filter(n => n.type === 'zone').length + 1}`,
          onDelete: () => deleteNode(id)
       }
    }
    setNodes(nds => nds.concat(newNode))
  }

  // --- DRAG & DROP & AUTO-CALC ---
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

    const droppedOnNode = getNodes().find(n => 
       n.type === 'dimension' && 
       position.x >= n.position.x && position.x <= n.position.x + (n.style?.width || 200) &&
       position.y >= n.position.y && position.y <= n.position.y + (n.style?.height || 200)
    )

    let suggestedQty = null
    if (droppedOnNode) {
       const width = droppedOnNode.data.width || 200
       const height = droppedOnNode.data.height || 200
       const areaSqFt = (width / 20) * (height / 20) 
       
       const coverageKey = Object.keys(MATERIAL_COVERAGE).find(k => item.name.toLowerCase().includes(k))
       if (coverageKey) {
         const info = MATERIAL_COVERAGE[coverageKey]
         suggestedQty = Math.ceil((areaSqFt * info.waste) / info.coverage)
       } else {
         suggestedQty = Math.ceil(areaSqFt) 
       }
    }
    
    setPendingNode({ item, position, suggestedQuantity: suggestedQty })
  }, [screenToFlowPosition, getNodes])

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

  // --- HELPERS ---
  const deleteNode = useCallback((id) => {
    setNodes((nds) => nds.filter(n => n.id !== id))
    setQuoteItems((items) => items.filter(i => i.tempId !== id))
  }, [setNodes])

  const updateItem = useCallback((tempId, updates) => {
    setQuoteItems(prev => prev.map(i => i.tempId === tempId ? { ...i, ...updates } : i))
    setNodes(nds => nds.map(n => n.id === tempId ? { ...n, data: { ...n.data, ...updates } } : n))
  }, [setNodes])

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges])

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
      if (projectLocation) await api.put(`/projects/${selectedProject}`, { latitude: projectLocation.lat, longitude: projectLocation.lng })

      const metadataNode = { nodeId: 'METADATA', quantity: 0, type: 'metadata', ...quoteSettings }
      
      const nodesData = [
          ...quoteItems.filter(i => i.type !== 'staff' && i.type !== 'equipment').map(i => ({ 
              nodeId: i.nodeId, 
              quantity: i.quantity,
              pricePerUnit: i.material.pricePerUnit // Explicit price
          })), 
          metadataNode
      ]
      
      const staffData = quoteItems.filter(i => i.type === 'staff').map(i => ({ 
          staffId: i.nodeId, 
          hours: i.quantity,
          chargeRate: i.material.chargeRate // Explicit rate
      }))
      
      const equipmentData = quoteItems.filter(i => i.type === 'equipment').map(i => ({ 
          equipmentId: i.nodeId, 
          hours: i.quantity,
          costRate: i.material.costRate // Explicit rate
      }))

      await api.post('/quotes', {
        name: `Quote for ${projects.find(p => p.id === selectedProject)?.name} - ${new Date().toLocaleDateString()}`,
        projectId: selectedProject, marginPct, nodes: nodesData, staff: staffData, equipment: equipmentData
      })
      alert('Quote Saved Successfully!')
    } catch (err) { console.error('Error saving quote:', err); alert('Error saving quote data.') }
  }

  // --- RENDER ---
  return (
    <div className="h-[calc(100vh-80px)] bg-transparent flex flex-col font-sans overflow-hidden text-white relative">
      <GeoreferenceModal isOpen={showGeoModal} onClose={() => setShowGeoModal(false)} onSave={(data) => { setSitePlan(data); setShowMap(true); if(data.bounds) setProjectLocation({ lat: (data.bounds.north+data.bounds.south)/2, lng: (data.bounds.east+data.bounds.west)/2 }); }} />
      <QuoteSettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} settings={quoteSettings} setSettings={setQuoteSettings} projects={projects} selectedProject={selectedProject} />
      <GoogleServicesSuggestions isOpen={showSuggestions} onClose={() => setShowSuggestions(false)} />
      
      {showMap && <div className="absolute inset-0 z-0 animate-fade-in"><MapBackground activeLocation={projectLocation} onLocationSelect={setProjectLocation} overlayImage={sitePlan} /></div>}

      <div className={`absolute inset-0 z-10 flex flex-col transition-all duration-500 ${showMap ? 'bg-stone-900/40 backdrop-blur-sm' : ''}`}>
        <ConfigModal isOpen={!!pendingNode} item={pendingNode?.item} suggestedQuantity={pendingNode?.suggestedQuantity} onClose={() => setPendingNode(null)} onConfirm={handleAddNode} />
        
        {showStreetView && projectLocation && (
           <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-10 animate-fade-in" onClick={() => setShowStreetView(false)}>
             <div className="relative bg-white p-2 rounded-xl shadow-2xl max-w-4xl w-full">
               <img 
                 src={`https://maps.googleapis.com/maps/api/streetview?size=800x400&location=${projectLocation.lat},${projectLocation.lng}&fov=90&heading=235&pitch=10&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`} 
                 alt="Street View" 
                 className="w-full h-auto rounded-lg"
               />
               <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded text-white text-xs font-bold uppercase tracking-wider">Site Preview</div>
             </div>
           </div>
        )}

        {/* --- TOP BAR --- */}
        <div className={`h-auto py-3 px-4 md:px-6 border-b border-white/10 ${showMap ? 'bg-stone-900/60' : 'bg-stone-900/80'} backdrop-blur-md z-30 flex flex-wrap justify-between items-center shadow-lg transition-colors gap-2`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.4)] ring-1 ring-white/20">
              <Crown className="text-white" size={16} />
            </div>
            <div>
              <div className="bg-stone-900/80 px-1.5 py-0.5 rounded border border-white/10 inline-block mb-0.5">
                <h1 className="text-xs font-black text-white tracking-tight">QUOTE BUILDER</h1>
              </div>
              <div className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-gray-400 bg-stone-900/60 px-1.5 py-0.5 rounded border border-white/5">
                <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
                Enterprise Edition
              </div>
            </div>
          </div>

          {/* Revenue/Margin Display - Conditionally visible */}
          {showFinancials && (
            <div className={`flex items-center gap-4 ${showMap ? 'bg-stone-900/80' : 'bg-stone-900/90'} p-2 rounded-xl border border-white/10 shadow-2xl transition-colors`}>
               <div className="px-2"><div className="text-[9px] font-bold text-gray-400 uppercase">Revenue</div><div className="text-sm font-mono font-bold text-emerald-400"><CountUp end={totalRevenue} prefix="$" separator="," /></div></div>
               <div className="w-px h-6 bg-white/10" />
               <div className="px-2 flex items-center gap-1.5"><span className="text-[9px] font-bold text-indigo-300">Margin {marginPct}%</span><input type="range" min="0" max="100" value={marginPct} onChange={(e) => setMarginPct(Number(e.target.value))} className="w-16 h-1 bg-stone-800 rounded-lg accent-indigo-500" /></div>
            </div>
          )}
          
          {/* Toggle for financials on small screens */}
          <button onClick={() => setShowFinancials(!showFinancials)} className="md:hidden p-2 rounded-lg border border-white/10 bg-stone-800 text-gray-400 hover:text-white" title="Toggle Financials">
            <DollarSign size={20} />
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            {/* TOOLBAR */}
            <button onClick={() => setShowSidebar(!showSidebar)} className="lg:hidden p-2 rounded-lg border border-white/10 bg-stone-800 text-gray-400 hover:text-white" title="Toggle Sidebar"><List size={20} /></button>
            <button onClick={addDimensionNode} className="p-2 rounded-lg border border-white/10 bg-stone-800 text-blue-400 hover:text-white hover:bg-blue-600/50 transition-colors" title="Add Room/Area"><Ruler size={20} /></button>
            <button onClick={addZoneNode} className="p-2 rounded-lg border border-white/10 bg-stone-800 text-purple-400 hover:text-white hover:bg-purple-600/50 transition-colors" title="Add Zone"><Layout size={20} /></button>
            <button onClick={() => setShowGeoModal(true)} className="p-2 rounded-lg border border-white/10 bg-stone-800 text-emerald-400 hover:text-white transition-colors" title="Upload Site Plan"><UploadCloud size={20} /></button>
            
            <div className="h-8 w-px bg-white/10 mx-1"></div>
            
            <button onClick={() => setShowMap(!showMap)} className={`p-2 rounded-lg border transition-all ${showMap ? 'bg-indigo-600 text-white' : 'bg-stone-800 text-gray-400'}`} title="Map Toggle">{showMap ? <EyeOff size={20} /> : <MapPin size={20} />}</button>
            {projectLocation && <button onClick={() => setShowStreetView(true)} className="p-2 rounded-lg border border-white/10 bg-stone-800 text-yellow-400 hover:text-white transition-colors" title="Street View"><ImageIcon size={20} /></button>}
            
            <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} className="bg-stone-900 border border-white/10 text-sm text-white rounded-lg px-3 py-2 outline-none shadow-inner w-40"><option value="">Project...</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
            
            <button onClick={() => fitView()} className="p-2 rounded-lg border border-white/10 bg-stone-800 text-gray-300 hover:text-white" title="Fit View"><Focus size={20} /></button>
            <button onClick={() => setShowSettings(true)} className="p-2 rounded-lg border border-white/10 bg-stone-800 text-gray-300 hover:text-white" title="Settings"><Settings size={20} /></button>
            <button onClick={() => setShowSuggestions(true)} className="p-2 rounded-lg border border-white/10 bg-stone-800 text-amber-400 hover:text-white hover:bg-amber-500/20" title="Google Integrations"><Zap size={20} /></button>
            
            <button onClick={() => navigate('/invoices', { state: { quoteItems: quoteItems, projectId: selectedProject } })} className="p-2 rounded-lg border border-white/10 bg-stone-800 text-purple-400 hover:text-white transition-colors" title="Convert to Invoice"><FileText size={20} /></button>
            <button onClick={() => generateQuotePDF({ id: 'DRAFT', name: 'Quote', items: quoteItems.map(i => ({ name: i.material.name, type: i.type, quantity: i.quantity, rate: i.type==='staff'?i.material.chargeRate:i.type==='equipment'?i.material.costRate:i.material.pricePerUnit })), totalRevenue, marginPct }, projects.find(p=>p.id===selectedProject), quoteSettings)} className="p-2 rounded-lg border border-white/10 bg-stone-800 text-gray-300 hover:text-white"><Download size={20} /></button>
            <button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-lg border border-indigo-400/50 flex items-center gap-2 active:scale-95"><Save size={16} /> Save</button>
          </div>
        </div>

        {/* --- MAIN AREA --- */}
        <div className="flex-1 flex overflow-hidden">
          {/* SIDEBAR */}
          <div className={`flex-shrink-0 ${showSidebar ? 'w-64 md:w-80' : 'w-0 -ml-64 md:-ml-80'} lg:w-80 bg-stone-900/95 border-r border-white/5 flex flex-col z-20 shadow-2xl transition-all duration-300 overflow-hidden`}>
            <div className="p-4 border-b border-white/5 bg-stone-900/50">
              <div className="relative"><Search className="absolute left-3 top-2.5 text-gray-500" size={16} /><input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-stone-800 border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white focus:border-indigo-500 outline-none" /></div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              <div className="space-y-2">{materials.filter(i=>i.name.toLowerCase().includes(searchTerm.toLowerCase())).map(x => <DraggableItem key={x.id} item={x} />)}</div>
              <div className="border-t border-white/10 my-2 pt-2"><div className="text-[10px] uppercase font-bold text-gray-500 mb-2">Staff</div>{staff.filter(i=>i.name.toLowerCase().includes(searchTerm.toLowerCase())).map(x => <DraggableItem key={x.id} item={x} />)}</div>
              <div className="border-t border-white/10 my-2 pt-2"><div className="text-[10px] uppercase font-bold text-gray-500 mb-2">Equipment</div>{equipment.filter(i=>i.name.toLowerCase().includes(searchTerm.toLowerCase())).map(x => <DraggableItem key={x.id} item={x} />)}</div>
            </div>
          </div>

          {/* CANVAS */}
          <div className="flex-1 flex flex-col relative bg-transparent">
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[size:40px_40px] bg-[linear-gradient(to_right,#4f46e5_1px,transparent_1px),linear-gradient(to_bottom,#4f46e5_1px,transparent_1px)]" />
            <div ref={canvasRef} className={`flex-1 rounded-3xl relative overflow-hidden m-6 transition-all duration-500 ${isDragOver ? 'border-4 border-indigo-500 bg-indigo-900/20' : 'border-2 border-white/5 bg-stone-900/40 shadow-2xl'} backdrop-blur-sm`} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
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
                   minZoom={0.05} // Infinite zoom out
                   maxZoom={2}
                   // No translateExtent prop means it's infinite by default
                   proOptions={{ hideAttribution: true }}
                >
                  <Background color="#6366f1" gap={40} size={1} className="opacity-[0.05]" />
                  <Controls className="!bg-stone-900 !border-white/10 !text-white !rounded-lg" />
                  <MiniMap className="!bg-stone-900 !border-white/10 !rounded-lg" nodeColor={n => n.type==='dimension'?'#3b82f6':n.type==='zone'?'#a855f7':'#6366f1'} />
                </ReactFlow>
              </div>
            </div>

            {/* BOTTOM SHEET */}
            <div className="h-64 bg-stone-900 border-t border-white/10 flex flex-col z-20 shadow-2xl">
              <div className="px-6 py-2 border-b border-white/5 flex justify-between items-center bg-stone-900/95"><h3 className="text-xs font-black text-gray-300 uppercase">Items ({quoteItems.length})</h3></div>
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-stone-950/50 space-y-2">{quoteItems.map(item => <QuoteItem key={item.tempId} item={item} onUpdate={updateItem} onRemove={deleteNode} formatCurrency={formatCurrency} />)}</div>
            </div>
          </div>
        </div>

        {/* --- AI CHAT FLOATING BUTTON & WINDOW --- */}
        <div className="absolute bottom-24 right-6 z-50">
          {!showChat && (
            <button 
              onClick={() => setShowChat(true)}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 shadow-[0_0_30px_rgba(99,102,241,0.6)] flex items-center justify-center text-white hover:scale-110 transition-transform animate-bounce-slow"
            >
              <Sparkles size={24} />
            </button>
          )}
          <AIChat isOpen={showChat} onClose={() => setShowChat(false)} messages={chatMessages} onSendMessage={handleAIChat} isTyping={chatTyping} />
        </div>

      </div>
    </div>
  )
}

const QuoteBuilder = () => <ReactFlowProvider><QuoteBuilderContent /></ReactFlowProvider>

export default QuoteBuilder