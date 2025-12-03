/*
 * MasterDiaryApp Official - Paint Your Day Diary (Enhanced Version)
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 * 
 * ENHANCEMENTS: AI Copilot, Google Integrations, Map View, Infinite Canvas Polish
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import {
  Calendar, Users, Wrench, DollarSign, Save, Trash2, Plus, Clock,
  TrendingUp, BarChart3, Edit3, FileText, Palette, Camera, Mic,
  MicOff, MapPin, Cloud, Download, Zap, Target, Award, Upload,
  Moon, Sun, Keyboard, Settings, RotateCcw, FileDown, FileSpreadsheet,
  Package, Eye, List, Image as ImageIcon, File, Folder, X, Sparkles, Send, Minimize, Layout
} from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import TimelineCanvas from './TimelineCanvas'
import GoogleServicesSuggestions from './GoogleServicesSuggestions'
import MapBackground from './MapBackground'
import GeoreferenceModal from './GeoreferenceModal'

// ================================
// CONFIGURATION MODAL (Input on Drop)
// ================================

const ConfigModal = ({ isOpen, onClose, onConfirm, item }) => {
  const [qty, setQty] = useState(1)
  const [cost, setCost] = useState(0)
  const [charge, setCharge] = useState(0)
  const inputRef = React.useRef(null)

  useEffect(() => {
    if (isOpen && item) {
      setQty(1)
      setCost(item.payRateBase || item.costRateBase || item.pricePerUnit || item.rate || 0)
      const baseCost = item.payRateBase || item.costRateBase || item.pricePerUnit || item.rate || 0
      setCharge(item.chargeOutBase || item.chargeRate || (baseCost * 1.2))
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, item])

  // Calculate preview totals
  const financials = React.useMemo(() => {
    if (!item) return { totalCost: 0, totalRevenue: 0 }

    const tempItem = { ...item, duration: qty, quantity: qty, costRate: cost, chargeRate: charge }
    const overtimeThreshold = 8
    const overtimeMultiplier = 1.5
    
    let totalCost = 0
    let totalRevenue = 0

    if (item.type === 'staff') {
      const regularHours = Math.min(qty, overtimeThreshold)
      const overtimeHours = Math.max(0, qty - overtimeThreshold)
      totalCost = (regularHours * cost) + (overtimeHours * cost * overtimeMultiplier)
      totalRevenue = qty * charge
    } else {
      totalCost = qty * cost
      totalRevenue = qty * charge
    }
    
    return { totalCost, totalRevenue }
  }, [qty, cost, charge, item])

  if (!isOpen || !item) return null

  const isTimeBased = item.type === 'staff' || item.type === 'equipment'
  const label = isTimeBased ? 'Hours Worked' : 'Quantity'
  const unit = isTimeBased ? 'hrs' : 'units'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-stone-900 border border-white/10 rounded-3xl p-8 w-96 shadow-2xl transform transition-all scale-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <Plus size={24} className="text-indigo-500" />
            Add Item
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-6 space-y-4">
          <div className="p-4 bg-black/30 rounded-2xl border border-white/5">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{item.type}</div>
            <div className="text-lg font-bold text-white">{item.name}</div>
          </div>

          <div>
            <label className="block text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">
              {label}
            </label>
            <div className="flex items-center gap-3">
              <input
                ref={inputRef}
                type="number"
                min="0.1"
                step="0.5"
                value={qty}
                onChange={(e) => setQty(parseFloat(e.target.value) || 0)}
                onKeyDown={(e) => e.key === 'Enter' && onConfirm(qty, cost, charge)}
                className="flex-1 bg-black/30 border-2 border-indigo-500/50 rounded-xl px-4 py-3 text-2xl font-mono font-bold text-white focus:border-indigo-500 focus:outline-none text-center"
              />
              <span className="text-sm font-bold text-gray-500">{unit}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-red-400 uppercase tracking-wider mb-2">In-House Cost</label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm font-mono font-bold text-white focus:border-red-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Charge Out</label>
              <input
                type="number"
                value={charge}
                onChange={(e) => setCharge(parseFloat(e.target.value) || 0)}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm font-mono font-bold text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
             <div>
               <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Cost</div>
               <div className="text-lg font-black text-red-400">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(financials.totalCost)}</div>
             </div>
             <div className="text-right">
               <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Charge</div>
               <div className="text-lg font-black text-emerald-400">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(financials.totalRevenue)}</div>
             </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-400 hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onConfirm(qty, cost, charge)}
            className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5"
          >
            Confirm & Add
          </button>
        </div>
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
    <div className="absolute bottom-24 right-6 w-96 h-[500px] bg-stone-900/95 border border-white/20 rounded-2xl shadow-2xl flex flex-col z-50 backdrop-blur-xl animate-fade-in">
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white">Diary Copilot</h3>
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
            <p>I can help summarize your day, spot missing costs, or analyze productivity!</p>
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
            placeholder="Ask about today's log..."
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
// VISUAL NODE HELPERS
// ================================

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount || 0)
}

const calculateItemFinancials = (item, overtimeThreshold = 8, overtimeMultiplier = 1.5) => {
  const qty = item.duration || item.quantity || 0;
  const costRate = parseFloat(item.costRate) || 0;
  const chargeRate = parseFloat(item.chargeRate) || 0;

  let totalCost = 0;
  let totalRevenue = 0;

  if (item.type === 'staff') {
    const regularHours = Math.min(qty, overtimeThreshold);
    const overtimeHours = Math.max(0, qty - overtimeThreshold);
    totalCost = (regularHours * costRate) + (overtimeHours * costRate * overtimeMultiplier);
    totalRevenue = qty * chargeRate;
  } else {
    totalCost = qty * costRate;
    totalRevenue = qty * chargeRate;
  }

  return { totalCost, totalRevenue };
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// ================================
// WORK ITEM COMPONENT
// ================================

const WorkItem = ({ item, onUpdate, onRemove, formatCurrency, overtimeThreshold, overtimeMultiplier }) => {
  const [editingQty, setEditingQty] = useState(false)
  const [editingCost, setEditingCost] = useState(false)
  const [editingCharge, setEditingCharge] = useState(false)
  
  const [tempQty, setTempQty] = useState('')
  const [tempCost, setTempCost] = useState('')
  const [tempCharge, setTempCharge] = useState('')

  const { totalCost, totalRevenue } = calculateItemFinancials(item, overtimeThreshold, overtimeMultiplier);

  const handleQtySave = () => {
    const val = parseFloat(tempQty) || 0;
    onUpdate(item.id, { quantity: val, duration: val });
    setEditingQty(false);
  }

  const handleCostSave = () => {
    const val = parseFloat(tempCost) || 0;
    onUpdate(item.id, { costRate: val });
    setEditingCost(false);
  }

  const handleChargeSave = () => {
    const val = parseFloat(tempCharge) || 0;
    onUpdate(item.id, { chargeRate: val });
    setEditingCharge(false);
  }

  return (
    <div className="bg-stone-900/60 backdrop-blur-md rounded-xl p-4 border border-white/10 mb-3 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          {item.type === 'staff' && <Users size={16} className="text-emerald-400" />}
          {item.type === 'equipment' && <Wrench size={16} className="text-amber-400" />}
          {item.type === 'material' && <Package size={16} className="text-indigo-400" />}
          <span className="font-bold text-white truncate max-w-[150px]" title={item.name}>
            {item.name}
          </span>
        </div>
        <button
          onClick={() => onRemove(item.id)}
          className="text-rose-400 hover:bg-rose-500/10 p-1 rounded transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div>
          <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            {item.type === 'material' ? 'Qty' : 'Hours'}
          </label>
          {editingQty ? (
            <input
              type="number"
              value={tempQty}
              onChange={(e) => setTempQty(e.target.value)}
              onBlur={handleQtySave}
              onKeyDown={(e) => e.key === 'Enter' && handleQtySave()}
              className="w-full px-2 py-1 text-sm font-bold bg-black/40 border border-indigo-500 rounded text-white focus:outline-none"
              autoFocus
            />
          ) : (
            <div
              onClick={() => { setEditingQty(true); setTempQty(item.duration || item.quantity); }}
              className="px-2 py-1 text-sm font-bold border border-white/5 rounded hover:border-indigo-500/50 cursor-pointer text-white bg-black/20"
            >
              {item.duration || item.quantity} <span className="text-[10px] text-gray-500 font-normal">{item.type === 'material' ? 'u' : 'h'}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">In-House</label>
          {editingCost ? (
            <input
              type="number"
              value={tempCost}
              onChange={(e) => setTempCost(e.target.value)}
              onBlur={handleCostSave}
              onKeyDown={(e) => e.key === 'Enter' && handleCostSave()}
              className="w-full px-2 py-1 text-sm font-bold bg-black/40 border border-red-500/50 rounded text-white focus:outline-none"
              autoFocus
            />
          ) : (
            <div
              onClick={() => { setEditingCost(true); setTempCost(item.costRate); }}
              className="px-2 py-1 text-sm font-bold border border-white/5 rounded hover:border-red-500/50 cursor-pointer text-red-300 bg-black/20"
            >
              {formatCurrency(item.costRate)}
            </div>
          )}
        </div>

        <div>
          <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">Charge Out</label>
          {editingCharge ? (
            <input
              type="number"
              value={tempCharge}
              onChange={(e) => setTempCharge(e.target.value)}
              onBlur={handleChargeSave}
              onKeyDown={(e) => e.key === 'Enter' && handleChargeSave()}
              className="w-full px-2 py-1 text-sm font-bold bg-black/40 border border-emerald-500/50 rounded text-white focus:outline-none"
              autoFocus
            />
          ) : (
            <div
              onClick={() => { setEditingCharge(true); setTempCharge(item.chargeRate); }}
              className="px-2 py-1 text-sm font-bold border border-white/5 rounded hover:border-emerald-500/50 cursor-pointer text-emerald-300 bg-black/20"
            >
              {formatCurrency(item.chargeRate)}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/10">
         <div className="flex flex-col">
           <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Total Cost</span>
           <span className="text-sm font-black text-red-400">{formatCurrency(totalCost)}</span>
         </div>
         <div className="flex flex-col text-right">
           <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Total Charge</span>
           <span className="text-sm font-black text-emerald-400">{formatCurrency(totalRevenue)}</span>
         </div>
      </div>

      {item.type === 'staff' && (item.duration > overtimeThreshold) && (
        <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-400 font-medium bg-amber-500/10 px-2 py-1 rounded">
          <Clock size={10} />
          <span>Includes {(item.duration - overtimeThreshold).toFixed(1)}h Overtime</span>
        </div>
      )}
    </div>
  )
}

// ================================
// DRAGGABLE ELEMENT
// ================================
const DraggableElement = ({ item, children }) => {
  const onDragStart = (event) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(item));
    event.dataTransfer.effectAllowed = 'move';
  };
  return <div draggable onDragStart={onDragStart} className="transition-all duration-300 cursor-grab active:cursor-grabbing hover:scale-105 active:rotate-2">{children}</div>
}

// ================================
// TOOLBAR
// ================================
const ConstructionToolbar = ({ staff, equipment, materials, formatCurrency, searchTerm, setSearchTerm, filterType, setFilterType, weather }) => {
  const filteredItems = (items) => items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()) && (filterType === 'all' || item.type === filterType))
  
  return (
    <div className="h-fit sticky top-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2"><Palette size={16} className="text-indigo-500" /> Construction Tools</h3>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-stone-800 rounded-full border border-white/10"><Cloud size={14} className="text-blue-400" /><span className="text-xs font-bold text-gray-400">{weather.temp}°C</span></div>
      </div>

      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="flex-1 min-w-[140px]"><input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-3 py-2 text-sm border border-white/10 rounded-lg bg-black/20 text-white focus:outline-none focus:border-indigo-500 placeholder-gray-600 font-medium" /></div>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-2 text-sm border border-white/10 rounded-lg bg-black/20 text-white focus:outline-none cursor-pointer font-bold appearance-none"><option value="all" className="bg-stone-900">All</option><option value="staff" className="bg-stone-900">Staff</option><option value="equipment" className="bg-stone-900">Equipment</option><option value="material" className="bg-stone-900">Materials</option></select>
      </div>

      <div className="flex flex-col gap-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-4">
          {(filterType === 'all' || filterType === 'staff') && (<div><h4 className="text-[10px] font-black text-gray-500 mb-3 flex items-center gap-2 uppercase tracking-widest"><Users size={12} className="text-emerald-500" /> Team ({filteredItems(staff).length})</h4><div className="grid grid-cols-2 gap-2">{filteredItems(staff).map(member => (<DraggableElement key={member.id} item={{ type: 'staff', ...member }}><div className="bg-stone-800/50 border border-white/5 rounded-xl p-3 text-center cursor-grab hover:border-emerald-500/50 hover:bg-stone-800 transition-all group"><div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform"><Users size={16} className="text-emerald-500" /></div><div className="text-xs font-bold text-gray-200 mb-0.5 truncate">{member.name}</div><div className="text-[10px] text-gray-500 font-mono">{formatCurrency(member.rate || 0)}/hr</div></div></DraggableElement>))}</div></div>)}
          {(filterType === 'all' || filterType === 'equipment') && (<div><h4 className="text-[10px] font-black text-gray-500 mb-3 flex items-center gap-2 uppercase tracking-widest mt-2"><Wrench size={12} className="text-amber-500" /> Equipment ({filteredItems(equipment).length})</h4><div className="grid grid-cols-2 gap-2">{filteredItems(equipment).map(item => (<DraggableElement key={item.id} item={{ type: 'equipment', ...item }}><div className="bg-stone-800/50 border border-white/5 rounded-xl p-3 text-center cursor-grab hover:border-amber-500/50 hover:bg-stone-800 transition-all group"><div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform"><Wrench size={16} className="text-amber-500" /></div><div className="text-xs font-bold text-gray-200 mb-0.5 truncate">{item.name}</div><div className="text-[10px] text-gray-500 font-mono">{formatCurrency(item.rate || 0)}/day</div></div></DraggableElement>))}</div></div>)}
          {(filterType === 'all' || filterType === 'material') && (<div><h4 className="text-[10px] font-black text-gray-500 mb-3 flex items-center gap-2 uppercase tracking-widest mt-2"><Package size={12} className="text-indigo-500" /> Materials ({filteredItems(materials).length})</h4><div className="grid grid-cols-2 gap-2">{filteredItems(materials).map(item => (<DraggableElement key={item.id} item={{ type: 'material', ...item }}><div className="bg-stone-800/50 border border-white/5 rounded-xl p-3 text-center cursor-grab hover:border-indigo-500/50 hover:bg-stone-800 transition-all group"><div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform"><Package size={16} className="text-indigo-500" /></div><div className="text-xs font-bold text-gray-200 mb-0.5 truncate">{item.name}</div><div className="text-[10px] text-gray-500 font-mono">{formatCurrency(item.pricePerUnit || item.rate || 0)}</div></div></DraggableElement>))}</div></div>)}
        </div>
      </div>
    </div>
  )
}

// ================================
// MAIN PAINT DIARY COMPONENT
// ================================
const PaintDiary = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentEntry, setCurrentEntry] = useState({ id: generateId(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), items: [], photos: [], voiceNotes: [], location: null, note: '' })
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [viewMode, setViewMode] = useState('daily')
  const [allDiaries, setAllDiaries] = useState([])
  const [pendingItem, setPendingItem] = useState(null)

  const [staff, setStaff] = useState([])
  const [equipment, setEquipment] = useState([])
  const [materials, setMaterials] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [weather, setWeather] = useState({ temp: 22, condition: 'Sunny' })

  const [productivityScore, setProductivityScore] = useState(0);
  const [cost, setCost] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [profit, setProfit] = useState(0);
  
  // AI & Extra Features
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [chatTyping, setChatTyping] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showGeoModal, setShowGeoModal] = useState(false)
  const [sitePlan, setSitePlan] = useState(null)

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectsRes, staffRes, equipRes, nodesRes] = await Promise.all([api.get('/projects'), api.get('/staff'), api.get('/equipment'), api.get('/nodes')]);
        const loadedProjects = Array.isArray(projectsRes.data) ? projectsRes.data : (projectsRes.data?.data || []);
        setProjects(loadedProjects);
        setStaff(Array.isArray(staffRes.data) ? staffRes.data : (staffRes.data?.data || []));
        setEquipment(Array.isArray(equipRes.data) ? equipRes.data : (equipRes.data?.data || []));
        setMaterials(nodesRes.data.data || nodesRes.data || []);

        // Auto-select project from navigation state
        if (location.state?.projectId) {
            const preSelected = loadedProjects.find(p => p.id === location.state.projectId);
            if (preSelected) setSelectedProject(preSelected);
        }
      } catch (err) { console.error('Error loading data:', err); }
    };
    loadData();
    setWeather({ temp: Math.floor(Math.random() * 20) + 15, condition: 'Sunny' });
  }, []);

  useEffect(() => { if (viewMode === 'all') fetchAllDiaries(); }, [viewMode]);

  // Use Google Weather if available, else standard fallback
  const fetchRealWeather = async (lat, lon) => {
    try {
      const res = await api.get(`/google/weather?lat=${lat}&lon=${lon}`);
      setWeather({ temp: res.data.current.temperature_2m, condition: 'Cloudy' }); // Simple mapping
    } catch (e) { console.error('Weather fetch failed', e); }
  }

  // Recalculate totals
  useEffect(() => {
    const fetchCalculations = async () => {
      try {
        if (currentEntry.items.length === 0) { setCost(0); setRevenue(0); setProfit(0); setProductivityScore(0); return; }
        let c = 0, r = 0;
        currentEntry.items.forEach(i => {
           const { totalCost, totalRevenue } = calculateItemFinancials(i);
           c += totalCost; r += totalRevenue;
        });
        setCost(c); setRevenue(r); setProfit(r - c);
        setProductivityScore(currentEntry.items.some(i => i.type === 'staff' && i.duration > 0) ? Math.min(100, Math.floor((r/c)*50)) : 0);
      } catch (err) { console.error('Error fetching calculations:', err); }
    };
    fetchCalculations();
  }, [currentEntry.items]);

  const resolveItems = useCallback((items) => {
    if (!items || !Array.isArray(items)) return [];
    return items.map(item => {
      let resolved = { ...item };
      if (item.type === 'staff') {
        const staffItem = staff.find(s => s.id == item.dataId);
        if (staffItem) { resolved.name = staffItem.name; if (!resolved.costRate) resolved.costRate = staffItem.payRateBase; if (!resolved.chargeRate) resolved.chargeRate = staffItem.chargeOutBase; }
      } else if (item.type === 'equipment') {
        const equipItem = equipment.find(e => e.id == item.dataId);
        if (equipItem) { resolved.name = equipItem.name; if (!resolved.costRate) resolved.costRate = equipItem.costRateBase; if (!resolved.chargeRate) resolved.chargeRate = equipItem.chargeOutBase; }
      } else if (item.type === 'material') {
        const matItem = materials.find(m => m.id == item.dataId);
        if (matItem) { resolved.name = matItem.name; if (!resolved.costRate) resolved.costRate = matItem.pricePerUnit; if (!resolved.chargeRate) resolved.costRate = matItem.pricePerUnit * 1.2; }
      }
      return resolved;
    });
  }, [staff, equipment, materials]);

  const handleDropItem = useCallback((item, position) => { setPendingItem({ item, position }) }, [])
  const handleConfirmAddItem = (qty, cost, charge) => {
    if (!pendingItem) return
    const { item, position } = pendingItem
    setCurrentEntry(prev => ({ ...prev, items: [...prev.items, { id: generateId(), dataId: item.id, type: item.type, name: item.name, costRate: cost, chargeRate: charge, quantity: qty, duration: qty, position }] }))
    setIsSaved(false); setPendingItem(null)
  }
  const handleUpdateItem = useCallback((itemId, updates) => { setCurrentEntry(prev => ({ ...prev, items: prev.items.map(item => item.id === itemId ? { ...item, ...updates } : item) })); setIsSaved(false); }, [])
  const handleRemoveItem = useCallback((itemId) => { setCurrentEntry(prev => ({ ...prev, items: prev.items.filter(item => item.id !== itemId) })); setIsSaved(false); }, [])

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      const diaryData = { date: selectedDate.toISOString().split('T')[0], projectId: selectedProject?.id, canvasData: { entries: [currentEntry] }, productivityScore: productivityScore, totalCost: cost, totalRevenue: revenue, gpsData: currentEntry.location }
      if (isSaved) await api.put(`/paint-diaries/${currentEntry.id}`, diaryData);
      else { const response = await api.post('/paint-diaries', diaryData); setCurrentEntry(prev => ({ ...prev, id: response.data.id })); }
      setIsSaved(true); setIsSaving(false);
    } catch (error) { console.error('Save error:', error); setIsSaving(false); }
  }, [selectedDate, selectedProject, currentEntry, cost, revenue, isSaved, productivityScore])

  const fetchAllDiaries = useCallback(async () => { try { const response = await api.get('/paint-diaries'); setAllDiaries(response.data || []); } catch (err) { console.error('Error fetching all diaries:', err); } }, [])
  const handleDeleteDiary = useCallback(async (diaryId) => { if (confirm('Delete diary?')) { try { await api.delete(`/paint-diaries/${diaryId}`); setAllDiaries(allDiaries.filter(d => d.id !== diaryId)); } catch (err) { console.error(err); } } }, [allDiaries])
  const handleViewDiary = useCallback((diary) => {
    setSelectedDate(new Date(diary.date)); setSelectedProject(diary.Project || null);
    let entry = diary.canvasData?.[0] || { id: generateId(), time: new Date().toLocaleTimeString(), items: [], photos: [], voiceNotes: [], location: null, note: '' };
    entry.items = resolveItems(entry.items || []); setCurrentEntry(entry); setViewMode('daily'); setIsSaved(true);
  }, [resolveItems])

  const handleGetLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(
      (pos) => { 
        setCurrentEntry(prev => ({ ...prev, location: { latitude: pos.coords.latitude, longitude: pos.coords.longitude } })); 
        setIsSaved(false); 
        fetchRealWeather(pos.coords.latitude, pos.coords.longitude);
        alert('Location pinned!'); 
      },
      (err) => console.error(err)
    )
  }
  const handlePhotoUpload = (e) => { 
    const file = e.target.files[0]; 
    if (file) { 
      const reader = new FileReader(); 
      reader.onloadend = async () => { 
        const base64 = reader.result;
        // Analyze image with Google Vision
        try {
           const analysis = await api.post('/google/vision', { imageBase64: base64 });
           console.log('Vision Analysis:', analysis.data);
           // Could auto-tag here
        } catch (e) {}
        setCurrentEntry(prev => ({ ...prev, photos: [...(prev.photos || []), base64] })); 
        setIsSaved(false); 
      }; 
      reader.readAsDataURL(file); 
    } 
  }
  
  // AI Chat
  const handleAIChat = async (message) => {
    if (!message.trim()) return
    setChatMessages(prev => [...prev, { role: 'user', content: message }])
    setChatTyping(true)
    try {
       const res = await api.post('/ai/cloud-assist', { message: `Context: Diary for ${selectedProject?.name || 'Unknown Project'}. Items: ${currentEntry.items.length}. User asks: ${message}` })
       setChatMessages(prev => [...prev, { role: 'assistant', content: res.data.insight || "I've noted that." }])
    } catch (err) {
       setChatMessages(prev => [...prev, { role: 'assistant', content: "I'm offline right now." }])
    } finally { setChatTyping(false) }
  }

  if (viewMode === 'daily') {
    return (
      <div className="min-h-screen p-4 md:p-8 animate-fade-in font-sans bg-transparent relative">
        {pendingItem && <ConfigModal isOpen={!!pendingItem} item={pendingItem.item} onClose={() => setPendingItem(null)} onConfirm={handleConfirmAddItem} />}
        <GoogleServicesSuggestions isOpen={showSuggestions} onClose={() => setShowSuggestions(false)} />
        <GeoreferenceModal isOpen={showGeoModal} onClose={() => setShowGeoModal(false)} onSave={(data) => { setSitePlan(data); setShowMap(true); }} />

        {/* Map Background */}
        {showMap && <div className="absolute inset-0 z-0 animate-fade-in"><MapBackground activeLocation={currentEntry.location ? { lat: currentEntry.location.latitude, lng: currentEntry.location.longitude } : null} overlayImage={sitePlan} /></div>}

        <div className={`relative z-10 transition-colors duration-500 ${showMap ? 'bg-stone-900/60 backdrop-blur-sm rounded-3xl p-6' : ''}`}>
          {/* Header & Controls */}
          <div className="max-w-[1600px] mx-auto mb-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div><h1 className="text-4xl font-black mb-2 text-white tracking-tight drop-shadow-md flex items-center gap-3"><Palette size={32} className="text-indigo-500" /> Paint Your Day</h1><p className="text-gray-400 text-lg font-medium">Visual time tracking for construction professionals</p></div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative"><DatePicker selected={selectedDate} onChange={(date) => { setSelectedDate(date); setIsSaved(false); }} dateFormat="MMMM d, yyyy" className="px-4 py-2.5 bg-stone-900/60 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 focus:outline-none cursor-pointer font-bold" /><Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" /></div>
              <select value={selectedProject?.id || ''} onChange={(e) => setSelectedProject(projects.find(p => p.id === e.target.value) || null)} className="px-4 py-2.5 bg-stone-900/60 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 focus:outline-none cursor-pointer font-bold appearance-none min-w-[200px]"><option value="" className="bg-stone-900">Select Project...</option>{projects.map(p => (<option key={p.id} value={p.id} className="bg-stone-900">{p.name}</option>))}</select>
              <button onClick={() => setViewMode('all')} className="flex items-center gap-2 px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-white rounded-xl transition-all font-bold border border-white/10 shadow-lg"><List size={18} /><span className="hidden sm:inline">All Diaries</span></button>
            </div>
          </div>

          <div className="max-w-[1600px] mx-auto">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-rose-600 to-red-700 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden transform hover:-translate-y-1 transition-all"><div className="absolute top-0 right-0 p-4 opacity-20"><DollarSign size={64} /></div><div className="text-xs font-black uppercase tracking-widest mb-1 opacity-80">Cost</div><div className="text-4xl font-black tracking-tight">{formatCurrency(cost)}</div></div>
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden transform hover:-translate-y-1 transition-all"><div className="absolute top-0 right-0 p-4 opacity-20"><TrendingUp size={64} /></div><div className="text-xs font-black uppercase tracking-widest mb-1 opacity-80">Revenue</div><div className="text-4xl font-black tracking-tight">{formatCurrency(revenue)}</div></div>
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden transform hover:-translate-y-1 transition-all"><div className="absolute top-0 right-0 p-4 opacity-20"><Award size={64} /></div><div className="text-xs font-black uppercase tracking-widest mb-1 opacity-80">Profit</div><div className="text-4xl font-black tracking-tight">{formatCurrency(profit)}</div></div>
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden transform hover:-translate-y-1 transition-all"><div className="absolute top-0 right-0 p-4 opacity-20"><Target size={64} /></div><div className="text-xs font-black uppercase tracking-widest mb-1 opacity-80">Productivity</div><div className="text-4xl font-black tracking-tight">{productivityScore}%</div></div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
              <div className="lg:col-span-1"><div className="bg-stone-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-5 sticky top-4 shadow-xl"><ConstructionToolbar staff={staff} equipment={equipment} materials={materials} formatCurrency={formatCurrency} searchTerm={searchTerm} setSearchTerm={setSearchTerm} filterType={filterType} setFilterType={setFilterType} weather={weather} /></div></div>
              
              <div className="lg:col-span-3">
                <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                  <div className="flex items-center gap-3">
                    <button onClick={handleSave} disabled={isSaving} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold shadow-lg transition-all ${isSaved ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-500 hover:-translate-y-0.5'} ${isSaving ? 'opacity-75 cursor-wait' : ''}`}><Save size={20} />{isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save Entry'}</button>
                    <div className="flex items-center gap-2 p-1 bg-stone-900/60 rounded-xl border border-white/10">
                      <button onClick={handleGetLocation} className={`p-2.5 rounded-lg transition-all ${currentEntry.location ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-white/10'}`} title="Pin Location"><MapPin size={20} /></button>
                      <label className="p-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer transition-all"><Camera size={20} /><input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} /></label>
                      <button onClick={() => setShowMap(!showMap)} className={`p-2.5 rounded-lg transition-all ${showMap ? 'bg-indigo-500/20 text-indigo-400' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}><MapPin size={20} /></button>
                      <button onClick={() => setShowSuggestions(true)} className="p-2.5 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-white/10"><Zap size={20} /></button>
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-stone-900/40 rounded-xl border border-white/5 text-xs font-mono font-bold text-gray-400">ID: {String(currentEntry.id).slice(-6)} • {currentEntry.items.length} ITEMS</div>
                </div>

                <div className="bg-stone-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 min-h-[600px] shadow-2xl">
                  <div className="flex justify-between items-center mb-8"><h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3"><Clock size={24} className="text-indigo-500" /> Timeline Canvas</h2>{currentEntry.photos?.length > 0 && (<div className="flex items-center gap-2 text-xs font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20"><ImageIcon size={14} /><span>{currentEntry.photos.length} Photos</span></div>)}</div>
                  <div className="bg-black/20 rounded-2xl p-4 border border-white/5 mb-8"><TimelineCanvas items={currentEntry.items} onDrop={handleDropItem} onUpdateItem={handleUpdateItem} onRemoveItem={handleRemoveItem} formatCurrency={formatCurrency} /></div>
                  {currentEntry.items.length > 0 && (<div className="animate-fade-in"><h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><List size={20} className="text-gray-400" /> Item Details</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{currentEntry.items.map(item => (<WorkItem key={item.id} item={item} onUpdate={handleUpdateItem} onRemove={handleRemoveItem} formatCurrency={formatCurrency} overtimeThreshold={8} overtimeMultiplier={1.5} />))}</div></div>)}
                  {currentEntry.photos?.length > 0 && (<div className="mt-8 pt-6 border-t border-white/10"><h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Attached Evidence</h3><div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">{currentEntry.photos.map((photo, idx) => (<div key={idx} className="relative group flex-shrink-0"><img src={photo} alt={`Evidence ${idx}`} className="h-24 w-24 object-cover rounded-xl border border-white/10 group-hover:scale-105 transition-transform" /><div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center"><Eye size={20} className="text-white" /></div></div>))}</div></div>)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Chat Button */}
        <div className="absolute bottom-6 right-6 z-50">
          {!showChat && <button onClick={() => setShowChat(true)} className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 shadow-[0_0_30px_rgba(99,102,241,0.6)] flex items-center justify-center text-white hover:scale-110 transition-transform animate-bounce-slow"><Sparkles size={24} /></button>}
          <AIChat isOpen={showChat} onClose={() => setShowChat(false)} messages={chatMessages} onSendMessage={handleAIChat} isTyping={chatTyping} />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen p-6 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div><h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white flex items-center gap-3"><Calendar size={32} className="text-primary" /> All Saved Diaries</h1><p className="text-gray-600 dark:text-gray-400">View and manage all your construction diary entries</p></div>
            <button onClick={() => setViewMode('daily')} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-success to-emerald-600 text-white rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all font-semibold"><Plus size={20} /> New Entry</button>
          </div>
          {allDiaries.length === 0 ? (
            <div className="glass-card p-12 text-center"><div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6"><Calendar size={40} className="text-gray-400" /></div><h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">No saved diaries yet</h3><p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">Create your first construction diary entry to get started with visual time tracking</p><button onClick={() => setViewMode('daily')} className="px-8 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-semibold">Create First Entry</button></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{allDiaries.map(diary => (
              <div key={diary.id} className="glass-card p-6 cursor-pointer group" onClick={() => handleViewDiary(diary)}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">{new Date(diary.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1"><Folder size={14} />{diary.Project?.name || 'No Project'}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteDiary(diary.id) }} className="p-2 text-gray-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Cost</div>
                    <div className="text-lg font-bold text-gray-800 dark:text-white">{formatCurrency(diary.totalCost || 0)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Revenue</div>
                    <div className="text-lg font-bold text-emerald-400">{formatCurrency(diary.totalRevenue || 0)}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span className="flex items-center gap-1"><List size={14} />{diary.canvasData?.[0]?.items?.length || 0} items</span>
                  <span className="flex items-center gap-1"><Clock size={14} />{new Date(diary.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="w-full py-2 bg-indigo-600/10 text-indigo-400 rounded-lg font-medium text-center group-hover:bg-indigo-600 group-hover:text-white transition-colors flex items-center justify-center gap-2">
                  <Eye size={16} /> View Entry
                </div>
              </div>
            ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default PaintDiary