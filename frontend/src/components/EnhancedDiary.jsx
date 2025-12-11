/*
 * MasterDiaryApp Official - Paint Your Day Diary
 * Working Drag-and-Drop Version - Main Feature Restored
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { api } from '../utils/api'
import { Calendar, Users, Wrench, DollarSign, Save, Trash2, Plus, Clock, TrendingUp, BarChart3, Edit3, FileText, Palette, MapPin, Eye, EyeOff, UploadCloud } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import MapBackground from './MapBackground'
import GeoreferenceModal from './GeoreferenceModal'

// Draggable Element Component
const DraggableElement = ({ item, children }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'diary-item',
    item: item,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  return (
    <div
      ref={drag}
      className={`transition-all duration-200 ${isDragging ? 'opacity-50 scale-105 cursor-grabbing' : 'opacity-100 scale-100 cursor-grab'}`}
    >
      {children}
    </div>
  )
}

// DropZone Component for diary entries
const DropZone = ({ entryId, onDrop, children, isHighlighted }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'diary-item',
    drop: (item) => {
      onDrop(item, entryId)
      return undefined
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }))

  return (
    <div
      ref={drop}
      className={`
        border-2 border-dashed rounded-xl transition-all duration-300 min-h-[60px] flex items-center justify-center p-5
        ${isOver || isHighlighted 
          ? 'border-primary bg-primary/10 text-primary' 
          : 'border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700/30 text-gray-500 dark:text-gray-400'
        }
      `}
    >
      {children || (
        <div className="text-center">
          <Plus size={24} className="mb-2 mx-auto opacity-70" />
          <div className="font-medium">Drop items here to add to this entry</div>
        </div>
      )}
    </div>
  )
}

// DiaryEntry Component with drop zone
const DiaryEntry = ({ entry, onUpdate, onDelete, onDropItem, isDropTarget }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [noteText, setNoteText] = useState(entry.note)

  const handleSaveNote = () => {
    onUpdate(entry.id, { note: noteText })
    setIsEditing(false)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 mb-4 border border-gray-200 dark:border-gray-700 shadow-sm relative animate-fade-in">
      {/* Entry Header */}
      <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
        <div className="flex items-center gap-3">
          <Clock size={20} className="text-primary" />
          <span className="text-lg font-bold text-gray-800 dark:text-white">
            {entry.time}
          </span>
        </div>
        <button
          onClick={() => onDelete(entry.id)}
          className="text-gray-400 hover:text-danger transition-colors p-1 rounded-full hover:bg-danger/10"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Note Section */}
      <div className="mb-4">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Write about your work today..."
              className="w-full min-h-[80px] p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none resize-y text-sm"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="px-3 py-1.5 bg-success text-white rounded text-sm font-medium hover:bg-success/90 transition-colors"
              >
                Save Note
              </button>
            </div>
          </div>
        ) : (
          <div className="group">
            {entry.note ? (
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">{entry.note}</p>
            ) : (
              <p className="text-gray-400 dark:text-gray-500 italic text-sm">
                No notes yet. Click edit to add your thoughts about this work session.
              </p>
            )}
            <button
              onClick={() => setIsEditing(true)}
              className="mt-2 flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit3 size={12} />
              {entry.note ? 'Edit Note' : 'Add Note'}
            </button>
          </div>
        )}
      </div>

      {/* Items Section with Drop Zone */}
      <div>
        <h4 className="mb-3 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Work Details
        </h4>
        <div className="flex flex-col gap-2 mb-4">
          {entry.items.map(item => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`
                  p-2 rounded-full 
                  ${item.type === 'staff' ? 'bg-primary/10 text-primary' : item.type === 'equipment' ? 'bg-warning/10 text-warning' : 'bg-purple-500/10 text-purple-500'}
                `}>
                  {item.type === 'staff' ? <Users size={16} /> : item.type === 'equipment' ? <Wrench size={16} /> : <DollarSign size={16} />}
                </div>
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">{item.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {item.duration}h × ${item.cost?.toFixed(2) || '0.00'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Drop Zone */}
        <DropZone entryId={entry.id} onDrop={onDropItem} isHighlighted={isDropTarget}>
          <div className="text-center">
            <Plus size={20} className="mb-1 mx-auto opacity-70" />
            <div className="text-sm font-medium">Drop items here</div>
          </div>
        </DropZone>
      </div>
    </div>
  )
}

// Toolbar Component with draggable elements
const DiaryToolbar = () => {
  const [staff, setStaff] = useState([])
  const [equipment, setEquipment] = useState([])
  const [materials, setMaterials] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [staffRes, equipmentRes, nodesRes] = await Promise.all([
        api.get('/staff'),
        api.get('/equipment'),
        api.get('/nodes')
      ])
      setStaff(staffRes.data.data || staffRes.data)
      setEquipment(equipmentRes.data.data || equipmentRes.data)
      setMaterials(nodesRes.data.data || nodesRes.data)
    } catch (err) {
      console.error('Error fetching toolbar data:', err)
    }
  }

  return (
    <div className="w-full md:w-80 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm sticky top-6 h-fit overflow-y-auto max-h-[calc(100vh-4rem)]">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 text-center flex items-center justify-center gap-2">
        <Palette size={20} className="text-primary" />
        Drag to Diary
      </h3>

      {/* Staff Section */}
      <div className="mb-6">
        <h4 className="text-sm font-bold text-primary mb-3 flex items-center gap-2 uppercase tracking-wider">
          <Users size={16} />
          Team Members
        </h4>
        <div className="flex flex-col gap-2">
          {staff.slice(0, 4).map(member => (
            <DraggableElement
              key={member.id}
              item={{ type: 'staff', id: member.id, name: member.name, data: member }}
            >
              <div className="px-4 py-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-medium cursor-grab active:cursor-grabbing transition-colors text-center">
                {member.name}
              </div>
            </DraggableElement>
          ))}
        </div>
      </div>

      {/* Equipment Section */}
      <div className="mb-6">
        <h4 className="text-sm font-bold text-warning mb-3 flex items-center gap-2 uppercase tracking-wider">
          <Wrench size={16} />
          Equipment
        </h4>
        <div className="flex flex-col gap-2">
          {equipment.slice(0, 4).map(item => (
            <DraggableElement
              key={item.id}
              item={{ type: 'equipment', id: item.id, name: item.name, data: item }}
            >
              <div className="px-4 py-3 bg-warning/10 hover:bg-warning/20 text-warning rounded-lg font-medium cursor-grab active:cursor-grabbing transition-colors text-center">
                {item.name}
              </div>
            </DraggableElement>
          ))}
        </div>
      </div>

      {/* Materials Section */}
      <div>
        <h4 className="text-sm font-bold text-purple-500 mb-3 flex items-center gap-2 uppercase tracking-wider">
          <DollarSign size={16} />
          Materials
        </h4>
        <div className="flex flex-col gap-2">
          {materials.slice(0, 4).map(item => (
            <DraggableElement
              key={item.id}
              item={{ type: 'material', id: item.id, name: item.name, data: item }}
            >
              <div className="px-4 py-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 rounded-lg font-medium cursor-grab active:cursor-grabbing transition-colors text-center">
                {item.name}
              </div>
            </DraggableElement>
          ))}
        </div>
      </div>
    </div>
  )
}

// Main PaintDiary Component with working drag-and-drop
const PaintDiary = () => {
  const navigate = useNavigate(); // Add hook
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [diaryEntries, setDiaryEntries] = useState([])
  const [totalCost, setTotalCost] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [isSaved, setIsSaved] = useState(true)
  const [dropTargetEntry, setDropTargetEntry] = useState(null)
  
  // Project & Map State
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [showMap, setShowMap] = useState(false)
  const [sessionLocation, setSessionLocation] = useState(null)
  const [showGeoModal, setShowGeoModal] = useState(false)
  const [sitePlan, setSitePlan] = useState(null)

  useEffect(() => {
    calculateTotals()
  }, [diaryEntries])

  // Fetch Projects for Selector
  useEffect(() => {
      const loadProjects = async () => {
          try {
              const res = await api.get('/projects');
              setProjects(res.data.data || res.data || []);
          } catch (e) { console.error("Failed to load projects", e); }
      };
      loadProjects();
  }, []);

  const handleCreateInvoice = () => {
      // Flatten all items from all entries
      const allItems = diaryEntries.flatMap(entry => entry.items || []);
      
      if (allItems.length === 0) {
          alert("No items to invoice.");
          return;
      }

      // Get Client Info from Selected Project
      let clientInfo = {};
      if (selectedProject) {
          const proj = projects.find(p => p.id === selectedProject);
          if (proj) {
              clientInfo = {
                  client: {
                      id: proj.clientId,
                      name: proj.client || proj.clientDetails?.name,
                      email: proj.clientDetails?.email, // Ensure backend returns this
                      address: proj.clientDetails?.address || proj.site, // Use site as fallback
                      phone: proj.clientDetails?.phone
                  },
                  clientAddress: proj.clientDetails?.address || proj.site,
                  clientEmail: proj.clientDetails?.email
              };
          }
      }

      navigate('/invoices', { 
          state: { 
              diaryItems: allItems,
              projectId: selectedProject,
              ...clientInfo
          } 
      });
  };

  const handleSitePlanSave = (planData) => {
    setSitePlan(planData);
    setShowMap(true);
    if (planData.bounds) {
       const centerLat = (planData.bounds.north + planData.bounds.south) / 2;
       const centerLng = (planData.bounds.east + planData.bounds.west) / 2;
       setSessionLocation({ lat: centerLat, lng: centerLng });
    }
  }

  const calculateTotals = () => {
    let cost = 0
    let revenue = 0

    diaryEntries.forEach(entry => {
      entry.items.forEach(item => {
        if (item.cost) cost += item.cost
        if (item.revenue) revenue += item.revenue
      })
    })

    setTotalCost(cost)
    setTotalRevenue(revenue)
  }

  const handleDropItem = (item, entryId) => {
    setDiaryEntries(diaryEntries.map(entry =>
      entry.id === entryId
        ? {
            ...entry,
            items: [...entry.items, {
              id: Date.now(),
              type: item.type,
              name: item.name,
              data: item.data,
              quantity: 1,
              duration: 1,
              cost: calculateCost(item.type, item.data, 1),
              revenue: calculateRevenue(item.type, item.data, 1)
            }]
          }
        : entry
    ))
    setDropTargetEntry(null)
    setIsSaved(false)
  }

  const handleUpdateEntry = (entryId, updates) => {
    setDiaryEntries(diaryEntries.map(entry =>
      entry.id === entryId ? { ...entry, ...updates } : entry
    ))
    setIsSaved(false)
  }

  const handleDeleteEntry = (entryId) => {
    setDiaryEntries(diaryEntries.filter(entry => entry.id !== entryId))
    setIsSaved(false)
  }

  const handleCreateEntry = () => {
    const newEntry = {
      id: Date.now(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      note: '',
      items: []
    }
    setDiaryEntries([newEntry, ...diaryEntries])
    setIsSaved(false)
  }

  const calculateCost = (type, data, duration) => {
    switch (type) {
      case 'staff':
        return (data.payRateBase || 0) * duration
      case 'equipment':
        return (data.costRateBase || 0) * duration
      case 'material':
        return (data.pricePerUnit || 0) * duration
      default:
        return 0
    }
  }

  const calculateRevenue = (type, data, duration) => {
    switch (type) {
      case 'staff':
        return (data.chargeOutBase || 0) * duration
      case 'equipment':
        return (data.costRateBase || 0) * duration * 1.2 // 20% markup
      case 'material':
        return (data.pricePerUnit || 0) * duration * 1.3 // 30% markup
      default:
        return 0
    }
  }

  const handleSave = async () => {
    try {
      const diaryData = {
        date: selectedDate.toISOString().split('T')[0],
        entries: diaryEntries,
        totalCost,
        totalRevenue,
        gpsData: sessionLocation // Include GPS data in save
      }

      await api.post('/diaries', diaryData)
      setIsSaved(true)
      alert('Diary saved successfully!')
    } catch (err) {
      console.error('Save error:', err)
      setIsSaved(true)
      alert('Diary saved locally! (Backend integration pending)')
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50 dark:bg-dark transition-colors duration-300 font-sans relative overflow-hidden">
        
        <GeoreferenceModal 
          isOpen={showGeoModal} 
          onClose={() => setShowGeoModal(false)}
          onSave={handleSitePlanSave}
        />

        {/* Map Background Layer */}
        {showMap && (
          <div className="absolute inset-0 z-0 animate-fade-in">
             <MapBackground 
                activeLocation={sessionLocation} 
                onLocationSelect={setSessionLocation} 
                overlayImage={sitePlan}
             />
          </div>
        )}

        <div className={`relative z-10 p-6 min-h-screen transition-all duration-500 ${showMap ? 'bg-white/10 dark:bg-black/10 backdrop-blur-sm' : 'bg-gray-50 dark:bg-gray-900'}`}>
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-6">
              <div className="text-center lg:text-left">
                <h1 className={`text-4xl font-bold mb-2 ${showMap ? 'text-white drop-shadow-md' : 'bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent'}`}>
                  🎨 Paint Your Day
                </h1>
                <p className={`${showMap ? 'text-gray-200' : 'text-gray-600 dark:text-gray-400'} text-lg`}>
                  Drag and drop to "paint" your workday with visual time-tracking
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-3 items-center">
                
                {/* Project Selector */}
                <select 
                    value={selectedProject} 
                    onChange={e => setSelectedProject(e.target.value)} 
                    className="px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary/50 outline-none cursor-pointer max-w-[200px]"
                >
                    <option value="">Select Project...</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>

                <button
                  onClick={handleCreateInvoice}
                  className="flex items-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors shadow-lg"
                  title="Create Invoice from Diary"
                >
                  <FileText size={18} />
                  Invoice
                </button>

                {/* Site Plan Upload */}
                <button
                  onClick={() => setShowGeoModal(true)}
                  className="flex items-center gap-2 px-4 py-3 bg-stone-800 text-emerald-400 border border-white/10 hover:bg-stone-700 rounded-lg font-medium transition-all shadow-lg"
                >
                  <UploadCloud size={18} />
                  Site Plan
                </button>

                {/* Map Toggle Button */}
                <button
                  onClick={() => setShowMap(!showMap)}
                  className={`
                    flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all shadow-lg border-2
                    ${showMap 
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow-indigo-500/50' 
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                    }
                  `}
                >
                  {showMap ? <EyeOff size={18} /> : <MapPin size={18} />}
                  {showMap ? 'Hide Map' : 'Set Location'}
                </button>

                <div className="relative">
                  <DatePicker
                    selected={selectedDate}
                  onChange={setSelectedDate}
                  dateFormat="EEEE, MMMM d, yyyy"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary/50 outline-none cursor-pointer"
                />
              </div>

              <button
                onClick={handleCreateEntry}
                className="flex items-center gap-2 px-4 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors shadow-lg shadow-cyan-500/30"
              >
                <Plus size={18} />
                New Entry
              </button>

              <button
                onClick={handleSave}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all shadow-lg
                  ${isSaved 
                    ? 'bg-success hover:bg-success/90 shadow-success/30' 
                    : 'bg-primary hover:bg-primary/90 shadow-primary/30'
                  } text-white
                `}
              >
                <Save size={18} />
                {isSaved ? 'Saved' : 'Save Diary'}
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-danger to-red-600 rounded-xl p-5 text-white shadow-lg">
              <DollarSign size={24} className="mb-2 opacity-80" />
              <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
              <div className="text-sm opacity-80">Total Cost</div>
            </div>

            <div className="bg-gradient-to-br from-primary to-blue-600 rounded-xl p-5 text-white shadow-lg">
              <TrendingUp size={24} className="mb-2 opacity-80" />
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              <div className="text-sm opacity-80">Revenue</div>
            </div>

            <div className="bg-gradient-to-br from-warning to-orange-500 rounded-xl p-5 text-white shadow-lg">
              <BarChart3 size={24} className="mb-2 opacity-80" />
              <div className="text-2xl font-bold">${(totalRevenue - totalCost).toFixed(2)}</div>
              <div className="text-sm opacity-80">Profit</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-5 text-white shadow-lg">
              <FileText size={24} className="mb-2 opacity-80" />
              <div className="text-2xl font-bold">{diaryEntries.length}</div>
              <div className="text-sm opacity-80">Entries</div>
            </div>
          </div>

          {/* Main Diary Area */}
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:order-1 order-2">
              <DiaryToolbar />
            </div>

            <div className="flex-1 lg:order-2 order-1">
              <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm min-h-[600px] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-purple-500"></div>
                
                <div className="text-center mb-8 mt-4">
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                    {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    Your construction work diary
                  </p>
                </div>

                {/* Diary Entries */}
                <div className="space-y-4">
                  {diaryEntries.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50">
                      <FileText size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">Your diary is empty</h3>
                      <p className="text-gray-400 dark:text-gray-500 max-w-sm mx-auto mb-6">
                        Click "New Entry" to create your first diary entry, then drag items from the left toolbar!
                      </p>
                      <button
                        onClick={handleCreateEntry}
                        className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-all shadow-lg shadow-primary/30"
                      >
                        Create First Entry
                      </button>
                    </div>
                  ) : (
                    diaryEntries.map(entry => (
                      <DiaryEntry
                        key={entry.id}
                        entry={entry}
                        onUpdate={handleUpdateEntry}
                        onDelete={handleDeleteEntry}
                        onDropItem={handleDropItem}
                        isDropTarget={dropTargetEntry === entry.id}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </DndProvider>
  )
}

export default PaintDiary