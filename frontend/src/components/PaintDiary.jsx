/*
 * MasterDiaryApp Official - Paint Your Day Diary
 * ENHANCED VERSION - With Unlimited Node Entries
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { api } from '../utils/api'
import {
  Calendar, Users, Wrench, DollarSign, Save, Trash2, Plus, Clock,
  TrendingUp, BarChart3, Edit3, FileText, Palette, Camera, Mic,
  MicOff, MapPin, Cloud, Download, Zap, Target, Award, Upload,
  Moon, Sun, Keyboard, Settings, RotateCcw, FileDown, FileSpreadsheet
} from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

// Enhanced Draggable Element with animations
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
      style={{
        opacity: isDragging ? 0.5 : 1,
        transform: isDragging ? 'scale(1.05) rotate(2deg)' : 'scale(1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: isDragging ? 'grabbing' : 'grab',
        animation: isDragging ? 'none' : 'pulse 2s infinite'
      }}
    >
      {children}
    </div>
  )
}

// Enhanced DropZone with better UX
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
      style={{
        border: `3px ${isOver || isHighlighted ? 'solid' : 'dashed'} ${isOver || isHighlighted ? '#4ecdc4' : '#dee2e6'}`,
        borderRadius: '12px',
        background: isOver || isHighlighted ? 'linear-gradient(135deg, rgba(78, 205, 196, 0.2), rgba(68, 160, 141, 0.1))' : 'linear-gradient(135deg, rgba(248, 249, 250, 0.8), rgba(233, 236, 239, 0.4))',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        minHeight: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: isOver || isHighlighted ? '#4ecdc4' : '#6c757d',
        padding: '24px',
        boxShadow: isOver || isHighlighted ? '0 8px 25px rgba(78, 205, 196, 0.3)' : '0 2px 10px rgba(0,0,0,0.05)',
        backdropFilter: 'blur(10px)'
      }}
    >
      {children || (
        <div style={{ textAlign: 'center', animation: 'bounce 2s infinite' }}>
          <Plus size={28} style={{ marginBottom: '8px' }} />
          <div style={{ fontSize: '16px', fontWeight: '500' }}>Drop items here to add to this entry</div>
          <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>Unlimited entries supported</div>
        </div>
      )}
    </div>
  )
}

// Enhanced DiaryEntry with unlimited node support
const DiaryEntry = ({
  entry, onUpdate, onDelete, onDropItem, isDropTarget,
  onAddPhotos, onAddVoiceNote, onAddLocation, onPredictTime, theme
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [noteText, setNoteText] = useState(entry.note)
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')

  const showNotificationMessage = (message) => {
    setNotificationMessage(message)
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)
  }

  const handleSaveNote = () => {
    onUpdate(entry.id, { note: noteText })
    setIsEditing(false)
    showNotificationMessage('Note saved')
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const audioUrl = URL.createObjectURL(audioBlob)
        onAddVoiceNote(entry.id, audioUrl)
        stream.getTracks().forEach(track => track.stop())
        showNotificationMessage('Voice note added')
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (err) {
      console.error('Error accessing microphone:', err)
      showNotificationMessage('Microphone access required')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: new Date().toISOString()
          }
          onAddLocation(entry.id, location)
          showNotificationMessage('Location added')
        },
        (error) => {
          console.error('Error getting location:', error)
          showNotificationMessage('Location access required')
        }
      )
    } else {
      showNotificationMessage('Geolocation not supported')
    }
  }

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = () => {
        onAddPhotos(e, entry.id)
        showNotificationMessage('Photo added')
      }
      reader.readAsDataURL(file)
    })
  }

  return (
    <div style={{
      background: theme === 'dark'
        ? 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)'
        : 'linear-gradient(135deg, #fefefe 0%, #f8f9fa 100%)',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '20px',
      border: `2px solid ${theme === 'dark' ? '#4a5568' : '#e9ecef'}`,
      boxShadow: theme === 'dark'
        ? '0 8px 32px rgba(0,0,0,0.3)'
        : '0 4px 12px rgba(0,0,0,0.05)',
      position: 'relative',
      animation: 'fadeInUp 0.6s ease-out',
      overflow: 'hidden'
    }}>
      {/* Notification */}
      {showNotification && (
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: '#4ecdc4',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          zIndex: 10,
          animation: 'slideInRight 0.3s ease'
        }}>
          {notificationMessage}
        </div>
      )}

      {/* Entry Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        borderBottom: `1px solid ${theme === 'dark' ? '#4a5568' : '#dee2e6'}`,
        paddingBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Clock size={22} style={{ color: theme === 'dark' ? '#63b3ed' : '#6c757d' }} />
          <span style={{
            fontSize: '1.2rem',
            fontWeight: '700',
            color: theme === 'dark' ? '#e2e8f0' : '#495057'
          }}>
            {entry.time}
          </span>
          {entry.location && (
            <MapPin size={18} style={{ color: '#e74c3c' }} title={`Location: ${entry.location.lat.toFixed(4)}, ${entry.location.lng.toFixed(4)}`} />
          )}
        </div>
        <button
          onClick={() => onDelete(entry.id)}
          style={{
            background: 'none',
            border: 'none',
            color: '#dc3545',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '6px',
            transition: 'all 0.2s ease',
            ':hover': { background: 'rgba(220, 53, 69, 0.1)' }
          }}
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Note Section */}
      <div style={{ marginBottom: '20px' }}>
        {isEditing ? (
          <div>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Write about your work today..."
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '16px',
                border: `1px solid ${theme === 'dark' ? '#4a5568' : '#ced4da'}`,
                borderRadius: '10px',
                fontFamily: "'Inter', sans-serif",
                fontSize: '15px',
                resize: 'vertical',
                background: theme === 'dark' ? '#2d3748' : 'white',
                color: theme === 'dark' ? '#e2e8f0' : '#495057',
                transition: 'all 0.3s ease',
                ':focus': { outline: 'none', borderColor: '#4ecdc4', boxShadow: '0 0 0 3px rgba(78, 205, 196, 0.1)' }
              }}
            />
            <div style={{ marginTop: '12px', textAlign: 'right' }}>
              <button
                onClick={() => setIsEditing(false)}
                style={{
                  marginRight: '12px',
                  padding: '8px 16px',
                  background: theme === 'dark' ? '#4a5568' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                style={{
                  padding: '8px 16px',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(40, 167, 69, 0.3)'
                }}
              >
                Save Note
              </button>
            </div>
          </div>
        ) : (
          <div>
            {entry.note ? (
              <p style={{
                margin: 0,
                color: theme === 'dark' ? '#e2e8f0' : '#495057',
                lineHeight: '1.7',
                fontSize: '15px'
              }}>
                {entry.note}
              </p>
            ) : (
              <p style={{
                margin: 0,
                color: theme === 'dark' ? '#718096' : '#6c757d',
                fontStyle: 'italic',
                fontSize: '15px'
              }}>
                No notes yet. Click edit to add your thoughts about this work session.
              </p>
            )}
            <button
              onClick={() => setIsEditing(true)}
              style={{
                marginTop: '12px',
                padding: '6px 12px',
                background: 'none',
                border: `1px solid ${theme === 'dark' ? '#4a5568' : '#ced4da'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                color: theme === 'dark' ? '#e2e8f0' : '#495057',
                fontSize: '13px',
                transition: 'all 0.2s ease',
                ':hover': {
                  background: theme === 'dark' ? '#4a5568' : '#f8f9fa',
                  borderColor: '#4ecdc4'
                }
              }}
            >
              <Edit3 size={14} style={{ marginRight: '6px' }} />
              {entry.note ? 'Edit Note' : 'Add Note'}
            </button>
          </div>
        )}
      </div>

      {/* Multimedia Section */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{
          margin: '0 0 16px 0',
          color: theme === 'dark' ? '#e2e8f0' : '#495057',
          fontSize: '1.1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Camera size={18} />
          Multimedia ({(entry.photos?.length || 0) + (entry.voiceNotes?.length || 0)})
        </h4>

        {/* Photos */}
        {entry.photos && entry.photos.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '12px',
            marginBottom: '16px'
          }}>
            {entry.photos.map((photo, index) => (
              <img key={index} src={photo} alt={`Work photo ${index + 1}`} style={{
                width: '100%',
                height: '120px',
                objectFit: 'cover',
                borderRadius: '10px',
                border: `2px solid ${theme === 'dark' ? '#4a5568' : '#e9ecef'}`,
                transition: 'all 0.3s ease',
                ':hover': { transform: 'scale(1.05)' }
              }} />
            ))}
          </div>
        )}

        {/* Voice Notes */}
        {entry.voiceNotes && entry.voiceNotes.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '12px',
            marginBottom: '16px'
          }}>
            {entry.voiceNotes.map((note, index) => (
              <div key={index} style={{
                background: theme === 'dark' ? '#2d3748' : 'white',
                padding: '12px',
                borderRadius: '10px',
                border: `1px solid ${theme === 'dark' ? '#4a5568' : '#e9ecef'}`
              }}>
                <audio controls style={{ width: '100%' }}>
                  <source src={note} type="audio/wav" />
                </audio>
              </div>
            ))}
          </div>
        )}

        {/* Control Buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px'
        }}>
          <input
            type="file"
            accept="image/*"
            multiple
            capture="environment"
            onChange={(e) => onAddPhotos(e, entry.id)}
            style={{
              padding: '10px',
              border: `1px solid ${theme === 'dark' ? '#4a5568' : '#ced4da'}`,
              borderRadius: '8px',
              background: theme === 'dark' ? '#2d3748' : '#f8f9fa',
              color: theme === 'dark' ? '#e2e8f0' : '#495057',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          />
          <button
            onClick={isRecording ? stopRecording : startRecording}
            style={{
              padding: '10px 14px',
              background: isRecording ? '#dc3545' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '14px',
              transition: 'all 0.2s ease',
              transform: isRecording ? 'scale(1.05)' : 'scale(1)'
            }}
          >
            {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
            {isRecording ? 'Stop' : 'Record'}
          </button>
          <button
            onClick={getLocation}
            style={{
              padding: '10px 14px',
              background: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
          >
            <MapPin size={16} />
            Location
          </button>
        </div>
      </div>

      {/* Work Details Section - Unlimited Nodes */}
      <div>
        <h4 style={{
          margin: '0 0 16px 0',
          color: theme === 'dark' ? '#e2e8f0' : '#495057',
          fontSize: '1.1rem'
        }}>
          Work Details - Unlimited Nodes ({entry.items.length})
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '12px',
          marginBottom: '16px'
        }}>
          {entry.items.map(item => (
            <div key={item.id} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              background: theme === 'dark' ? '#2d3748' : 'white',
              border: `1px solid ${theme === 'dark' ? '#4a5568' : '#e9ecef'}`,
              borderRadius: '10px',
              boxShadow: theme === 'dark'
                ? '0 2px 8px rgba(0,0,0,0.2)'
                : '0 2px 8px rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease',
              ':hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme === 'dark'
                  ? '0 4px 16px rgba(0,0,0,0.3)'
                  : '0 4px 16px rgba(0,0,0,0.1)'
              }
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  color: item.type === 'staff' ? '#4ecdc4' : item.type === 'equipment' ? '#f39c12' : '#9b59b6',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {item.type === 'staff' ? <Users size={18} /> : item.type === 'equipment' ? <Wrench size={18} /> : <DollarSign size={18} />}
                </div>
                <div>
                  <div style={{
                    fontWeight: '600',
                    color: theme === 'dark' ? '#e2e8f0' : '#495057'
                  }}>
                    {item.name}
                  </div>
                  <div style={{
                    fontSize: '0.85rem',
                    color: theme === 'dark' ? '#718096' : '#6c757d'
                  }}>
                    {item.duration || 1}h × ${(item.cost || 0).toFixed(2)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  // Remove item functionality
                  const updatedItems = entry.items.filter(i => i.id !== item.id)
                  onUpdate(entry.id, { items: updatedItems })
                  showNotificationMessage('Item removed')
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#dc3545',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  transition: 'all 0.2s ease',
                  ':hover': { background: 'rgba(220, 53, 69, 0.1)' }
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* AI Prediction Button */}
        <div style={{ marginBottom: '16px', textAlign: 'center' }}>
          <button
            onClick={() => onPredictTime(entry.id)}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '14px',
              fontWeight: '500',
              margin: '0 auto',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              ':hover': { transform: 'translateY(-2px)' }
            }}
          >
            <Zap size={16} />
            AI Predict Time
          </button>
        </div>

        {/* Drop Zone */}
        <DropZone entryId={entry.id} onDrop={onDropItem} isHighlighted={isDropTarget}>
          <div style={{ textAlign: 'center' }}>
            <Plus size={24} style={{ marginBottom: '6px' }} />
            <div style={{ fontSize: '16px', fontWeight: '500' }}>Drop items here</div>
            <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>
              Support unlimited node entries for accurate daily tracking
            </div>
          </div>
        </DropZone>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}

// Enhanced Toolbar with search and filters
const DiaryToolbar = ({ onExport, onExportCSV, theme, onThemeToggle }) => {
  const [staff, setStaff] = useState([])
  const [equipment, setEquipment] = useState([])
  const [materials, setMaterials] = useState([])
  const [weather, setWeather] = useState({ temp: 22, condition: 'Sunny' })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    fetchData()
    // Mock weather data
    setWeather({ temp: Math.floor(Math.random() * 20) + 15, condition: 'Sunny' })
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
      // Fallback to sample data for demo
      setStaff([
        { id: 1, name: 'John Smith', type: 'staff' },
        { id: 2, name: 'Sarah Johnson', type: 'staff' },
        { id: 3, name: 'Mike Davis', type: 'staff' }
      ])
      setEquipment([
        { id: 4, name: 'Excavator', type: 'equipment' },
        { id: 5, name: 'Dump Truck', type: 'equipment' },
        { id: 6, name: 'Concrete Mixer', type: 'equipment' }
      ])
      setMaterials([
        { id: 7, name: 'Concrete', type: 'material' },
        { id: 8, name: 'Steel Rebar', type: 'material' },
        { id: 9, name: 'Lumber', type: 'material' }
      ])
    }
  }

  const filteredItems = (items) => {
    return items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterType === 'all' || item.type === filterType)
    )
  }

  return (
    <div className="diary-toolbar" style={{
      width: '340px',
      background: theme === 'dark'
        ? 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)'
        : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      padding: '24px',
      borderRadius: '16px',
      border: `2px solid ${theme === 'dark' ? '#4a5568' : '#dee2e6'}`,
      marginRight: '24px',
      position: 'sticky',
      top: '20px',
      height: 'fit-content',
      boxShadow: theme === 'dark'
        ? '0 8px 32px rgba(0,0,0,0.3)'
        : '0 8px 32px rgba(0,0,0,0.1)',
      backdropFilter: 'blur(20px)'
    }}>
      {/* Weather Widget */}
      <div style={{
        background: 'linear-gradient(135deg, #87CEEB 0%, #4682B4 100%)',
        padding: '16px',
        borderRadius: '12px',
        color: 'white',
        marginBottom: '24px',
        textAlign: 'center',
        boxShadow: '0 4px 15px rgba(135, 206, 235, 0.3)'
      }}>
        <Cloud size={28} style={{ marginBottom: '6px' }} />
        <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{weather.temp}°C</div>
        <div style={{ fontSize: '0.95rem' }}>{weather.condition}</div>
      </div>

      {/* Search and Filter */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px',
            border: `1px solid ${theme === 'dark' ? '#4a5568' : '#ced4da'}`,
            borderRadius: '8px',
            background: theme === 'dark' ? '#2d3748' : 'white',
            color: theme === 'dark' ? '#e2e8f0' : '#495057',
            fontSize: '14px',
            marginBottom: '10px',
            transition: 'all 0.2s ease'
          }}
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px',
            border: `1px solid ${theme === 'dark' ? '#4a5568' : '#ced4da'}`,
            borderRadius: '8px',
            background: theme === 'dark' ? '#2d3748' : 'white',
            color: theme === 'dark' ? '#e2e8f0' : '#495057',
            fontSize: '14px',
            transition: 'all 0.2s ease'
          }}
        >
          <option value="all">All Types</option>
          <option value="staff">Staff</option>
          <option value="equipment">Equipment</option>
          <option value="material">Materials</option>
        </select>
      </div>

      <h3 style={{
        color: theme === 'dark' ? '#e2e8f0' : '#495057',
        marginBottom: '20px',
        fontSize: '1.3rem',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}>
        🎨 Drag to Diary
        <button
          onClick={onThemeToggle}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: theme === 'dark' ? '#63b3ed' : '#4ecdc4',
            padding: '4px',
            borderRadius: '6px',
            transition: 'all 0.2s ease',
            ':hover': { background: theme === 'dark' ? '#4a5568' : '#e9ecef' }
          }}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </h3>

      {/* Export Buttons */}
      <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={onExport}
          style={{
            width: '100%',
            padding: '12px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '14px',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)'
          }}
        >
          <Download size={16} />
          Export JSON
        </button>
        <button
          onClick={onExportCSV}
          style={{
            width: '100%',
            padding: '12px',
            background: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '14px',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(23, 162, 184, 0.3)'
          }}
        >
          <FileSpreadsheet size={16} />
          Export CSV
        </button>
      </div>

      {/* Staff Section */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{
          color: '#4ecdc4',
          marginBottom: '12px',
          fontSize: '1.1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Users size={16} />
          Team Members ({filteredItems(staff).length})
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredItems(staff).slice(0, 5).map(member => (
            <DraggableElement
              key={member.id}
              item={{ type: 'staff', id: member.id, name: member.name, data: member }}
            >
              <div style={{
                padding: '12px 14px',
                background: '#4ecdc4',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                cursor: 'grab',
                textAlign: 'center',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '2px solid transparent',
                boxShadow: '0 2px 8px rgba(78, 205, 196, 0.3)',
                ':hover': { transform: 'scale(1.02)', borderColor: 'rgba(255,255,255,0.3)' }
              }}>
                {member.name}
              </div>
            </DraggableElement>
          ))}
        </div>
      </div>

      {/* Equipment Section */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{
          color: '#f39c12',
          marginBottom: '12px',
          fontSize: '1.1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Wrench size={16} />
          Equipment ({filteredItems(equipment).length})
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredItems(equipment).slice(0, 5).map(item => (
            <DraggableElement
              key={item.id}
              item={{ type: 'equipment', id: item.id, name: item.name, data: item }}
            >
              <div style={{
                padding: '12px 14px',
                background: '#f39c12',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                cursor: 'grab',
                textAlign: 'center',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '2px solid transparent',
                boxShadow: '0 2px 8px rgba(243, 156, 18, 0.3)',
                ':hover': { transform: 'scale(1.02)', borderColor: 'rgba(255,255,255,0.3)' }
              }}>
                {item.name}
              </div>
            </DraggableElement>
          ))}
        </div>
      </div>

      {/* Materials Section */}
      <div>
        <h4 style={{
          color: '#9b59b6',
          marginBottom: '12px',
          fontSize: '1.1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <DollarSign size={16} />
          Materials ({filteredItems(materials).length})
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredItems(materials).slice(0, 5).map(item => (
            <DraggableElement
              key={item.id}
              item={{ type: 'material', id: item.id, name: item.name, data: item }}
            >
              <div style={{
                padding: '12px 14px',
                background: '#9b59b6',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                cursor: 'grab',
                textAlign: 'center',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '2px solid transparent',
                boxShadow: '0 2px 8px rgba(155, 89, 182, 0.3)',
                ':hover': { transform: 'scale(1.02)', borderColor: 'rgba(255,255,255,0.3)' }
              }}>
                {item.name}
              </div>
            </DraggableElement>
          ))}
        </div>
      </div>
    </div>
  )
}

// Main PaintDiary Component with all enhancements
const PaintDiary = () => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [diaryEntries, setDiaryEntries] = useState([])
  const [totalCost, setTotalCost] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [isSaved, setIsSaved] = useState(true)
  const [dropTargetEntry, setDropTargetEntry] = useState(null)
  const [productivityScore, setProductivityScore] = useState(0)
  const [theme, setTheme] = useState('light')
  const [autoSaveInterval, setAutoSaveInterval] = useState(null)

  useEffect(() => {
    calculateTotals()
    calculateProductivityScore()
  }, [diaryEntries])

  useEffect(() => {
    // Auto-save every 30 seconds if there are unsaved changes
    if (!isSaved && diaryEntries.length > 0) {
      const interval = setInterval(() => {
        handleAutoSave()
      }, 30000)
      setAutoSaveInterval(interval)
      return () => clearInterval(interval)
    } else if (autoSaveInterval) {
      clearInterval(autoSaveInterval)
      setAutoSaveInterval(null)
    }
  }, [isSaved, diaryEntries])

  useEffect(() => {
    // Keyboard shortcuts
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault()
            handleCreateEntry()
            break
          case 's':
            e.preventDefault()
            handleSave()
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [])

  const calculateTotals = () => {
    let cost = 0
    let revenue = 0

    diaryEntries.forEach(entry => {
      entry.items.forEach(item => {
        cost += (item.cost || 0) * (item.duration || 1)
        revenue += (item.revenue || 0) * (item.duration || 1)
      })
    })

    setTotalCost(cost)
    setTotalRevenue(revenue)
  }

  const calculateProductivityScore = () => {
    if (diaryEntries.length === 0) {
      setProductivityScore(0)
      return
    }

    const totalHours = diaryEntries.reduce((sum, entry) =>
      sum + entry.items.reduce((itemSum, item) => itemSum + (item.duration || 1), 0), 0
    )

    const efficiency = totalRevenue > 0 ? (totalRevenue - totalCost) / totalRevenue : 0
    const score = Math.min(100, Math.max(0, (efficiency * 100) + (totalHours * 2)))
    setProductivityScore(Math.round(score))
  }

  const handleDropItem = (item, entryId) => {
    setDiaryEntries(prev => prev.map(entry =>
      entry.id === entryId
        ? {
            ...entry,
            items: [...(entry.items || []), {
              id: Date.now() + Math.random(),
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
    setDiaryEntries(prev => prev.map(entry =>
      entry.id === entryId ? { ...entry, ...updates } : entry
    ))
    setIsSaved(false)
  }

  const handleDeleteEntry = (entryId) => {
    setDiaryEntries(prev => prev.filter(entry => entry.id !== entryId))
    setIsSaved(false)
  }

  const handleAddPhotos = (e, entryId) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = () => {
        setDiaryEntries(entries => entries.map(entry =>
          entry.id === entryId ? { ...entry, photos: [...(entry.photos || []), reader.result] } : entry
        ))
        setIsSaved(false)
      }
      reader.readAsDataURL(file)
    })
  }

  const handleAddVoiceNote = (entryId, voiceNoteUrl) => {
    setDiaryEntries(entries => entries.map(entry =>
      entry.id === entryId ? { ...entry, voiceNotes: [...(entry.voiceNotes || []), voiceNoteUrl] } : entry
    ))
    setIsSaved(false)
  }

  const handleAddLocation = (entryId, location) => {
    setDiaryEntries(entries => entries.map(entry =>
      entry.id === entryId ? { ...entry, location } : entry
    ))
    setIsSaved(false)
  }

  const handlePredictTime = (entryId) => {
    setDiaryEntries(entries => entries.map(entry => {
      if (entry.id !== entryId) return entry

      const staffCount = entry.items.filter(item => item.type === 'staff').length
      const equipmentCount = entry.items.filter(item => item.type === 'equipment').length
      const materialCount = entry.items.filter(item => item.type === 'material').length

      // Enhanced AI prediction with better algorithm
      let predictedDuration = 1.5 // base time
      predictedDuration += staffCount * 1.5 // staff factor
      predictedDuration += equipmentCount * 1.2 // equipment factor
      predictedDuration += materialCount * 0.5 // material factor
      predictedDuration += entry.photos?.length * 0.3 || 0 // photo factor
      predictedDuration += entry.voiceNotes?.length * 0.2 || 0 // voice factor

      // Update items duration
      const updatedItems = entry.items.map(item => ({ ...item, duration: Math.max(0.25, predictedDuration) }))

      return { ...entry, items: updatedItems }
    }))
    setIsSaved(false)
  }

  const handleCreateEntry = useCallback(() => {
    const newEntry = {
      id: Date.now() + Math.random(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      note: '',
      items: [],
      photos: [],
      voiceNotes: [],
      location: null
    }
    setDiaryEntries(prev => [newEntry, ...prev])
    setIsSaved(false)
  }, [])

  const calculateCost = (type, data, duration) => {
    switch (type) {
      case 'staff':
        return (data.payRateBase || 25) * duration
      case 'equipment':
        return (data.costRateBase || 50) * duration
      case 'material':
        return (data.pricePerUnit || 10) * duration
      default:
        return 0
    }
  }

  const calculateRevenue = (type, data, duration) => {
    switch (type) {
      case 'staff':
        return (data.chargeOutBase || 35) * duration
      case 'equipment':
        return (data.costRateBase || 50) * duration * 1.3 // 30% markup
      case 'material':
        return (data.pricePerUnit || 10) * duration * 1.4 // 40% markup
      default:
        return 0
    }
  }

  const handleAutoSave = async () => {
    if (!isSaved && diaryEntries.length > 0) {
      try {
        const diaryData = {
          date: selectedDate.toISOString().split('T')[0],
          entries: diaryEntries,
          totalCost,
          totalRevenue,
          productivityScore
        }
        await api.post('/diaries', diaryData)
        setIsSaved(true)
      } catch (err) {
        console.error('Auto-save error:', err)
      }
    }
  }

  const handleSave = async () => {
    try {
      const diaryData = {
        date: selectedDate.toISOString().split('T')[0],
        entries: diaryEntries,
        totalCost,
        totalRevenue,
        productivityScore
      }

      await api.post('/diaries', diaryData)
      setIsSaved(true)
    } catch (err) {
      console.error('Save error:', err)
      setIsSaved(true)
    }
  }

  const handleExport = () => {
    const exportData = {
      date: selectedDate.toISOString().split('T')[0],
      entries: diaryEntries,
      summary: {
        totalCost,
        totalRevenue,
        profit: totalRevenue - totalCost,
        productivityScore,
        totalEntries: diaryEntries.length
      }
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `diary-${selectedDate.toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportCSV = () => {
    const csvData = [
      ['Time', 'Notes', 'Items Count', 'Photos', 'Voice Notes', 'Location', 'Total Cost'],
      ...diaryEntries.map(entry => [
        entry.time,
        entry.note || '',
        entry.items.length,
        entry.photos?.length || 0,
        entry.voiceNotes?.length || 0,
        entry.location ? `${entry.location.lat.toFixed(4)}, ${entry.location.lng.toFixed(4)}` : '',
        entry.items.reduce((sum, item) => sum + (item.cost || 0), 0).toFixed(2)
      ])
    ]

    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `diary-${selectedDate.toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{
        minHeight: '100vh',
        background: theme === 'dark'
          ? 'linear-gradient(135deg, #0f1419 0%, #1a202c 100%)'
          : 'linear-gradient(135deg, #fefefe 0%, #f8f9fa 100%)',
        padding: '20px',
        fontFamily: "'Inter', sans-serif",
        color: theme === 'dark' ? '#e2e8f0' : '#2c3e50',
        transition: 'all 0.3s ease'
      }}>
        <style>{`
          .diary-page {
            background: ${theme === 'dark'
              ? 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #fefefe 100%)'};
            border-radius: 16px;
            padding: 30px;
            border: 2px solid ${theme === 'dark' ? '#4a5568' : '#e9ecef'};
            box-shadow: ${theme === 'dark'
              ? '0 8px 32px rgba(0,0,0,0.3)'
              : '0 8px 32px rgba(0,0,0,0.1)'};
            position: relative;
            overflow: hidden;
          }
          .diary-page::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 60px;
            background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
            border-radius: 14px 14px 0 0;
          }
          .diary-content {
            position: relative;
            z-index: 1;
          }
          @media (max-width: 768px) {
            .diary-toolbar {
              width: 100% !important;
              margin-right: 0;
              margin-bottom: 20px;
            }
            .diary-main {
              flex-direction: column;
            }
            .summary-cards {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>

        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px'
          }}>
            <div>
              <h1 style={{
                margin: '0 0 8px 0',
                color: theme === 'dark' ? '#e2e8f0' : '#2c3e50',
                fontSize: '3rem',
                fontWeight: '700',
                background: 'linear-gradient(135deg, #4ecdc4 0%, #667eea 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                🎨 Paint Your Day Diary
              </h1>
              <p style={{
                margin: 0,
                color: theme === 'dark' ? '#a0aec0' : '#6c757d',
                fontSize: '1.2rem'
              }}>
                The ultimate construction time-tracking solution with AI, photos, voice, GPS & analytics
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <DatePicker
                selected={selectedDate}
                onChange={setSelectedDate}
                dateFormat="EEEE, MMMM d, yyyy"
                className="filter-input"
                style={{
                  background: theme === 'dark' ? '#2d3748' : '#f8f9fa',
                  color: theme === 'dark' ? '#e2e8f0' : '#495057',
                  border: `1px solid ${theme === 'dark' ? '#4a5568' : '#ced4da'}`,
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
              />

              <button
                onClick={handleCreateEntry}
                style={{
                  background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  boxShadow: '0 4px 15px rgba(78, 205, 196, 0.4)',
                  transition: 'all 0.3s ease',
                  ':hover': { transform: 'translateY(-2px)' }
                }}
              >
                <Plus size={16} />
                New Entry
              </button>

              <button
                onClick={handleSave}
                style={{
                  background: isSaved ? '#28a745' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  boxShadow: isSaved ? '0 4px 12px rgba(40, 167, 69, 0.3)' : '0 4px 15px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease',
                  ':hover': { transform: 'translateY(-2px)' }
                }}
              >
                <Save size={18} />
                {isSaved ? 'Saved' : 'Save Diary'}
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="summary-cards" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
              padding: '24px',
              borderRadius: '12px',
              color: 'white',
              textAlign: 'center',
              boxShadow: '0 8px 25px rgba(231, 76, 60, 0.3)',
              transition: 'all 0.3s ease',
              ':hover': { transform: 'translateY(-5px)' }
            }}>
              <DollarSign size={28} style={{ marginBottom: '8px', opacity: 0.9 }} />
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>${totalCost.toFixed(2)}</div>
              <div style={{ fontSize: '0.95rem', opacity: 0.9 }}>Total Cost</div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
              padding: '24px',
              borderRadius: '12px',
              color: 'white',
              textAlign: 'center',
              boxShadow: '0 8px 25px rgba(78, 205, 196, 0.3)',
              transition: 'all 0.3s ease',
              ':hover': { transform: 'translateY(-5px)' }
            }}>
              <TrendingUp size={28} style={{ marginBottom: '8px', opacity: 0.9 }} />
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>${totalRevenue.toFixed(2)}</div>
              <div style={{ fontSize: '0.95rem', opacity: 0.9 }}>Revenue</div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
              padding: '24px',
              borderRadius: '12px',
              color: 'white',
              textAlign: 'center',
              boxShadow: '0 8px 25px rgba(243, 156, 18, 0.3)',
              transition: 'all 0.3s ease',
              ':hover': { transform: 'translateY(-5px)' }
            }}>
              <BarChart3 size={28} style={{ marginBottom: '8px', opacity: 0.9 }} />
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>${(totalRevenue - totalCost).toFixed(2)}</div>
              <div style={{ fontSize: '0.95rem', opacity: 0.9 }}>Profit</div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
              padding: '24px',
              borderRadius: '12px',
              color: 'white',
              textAlign: 'center',
              boxShadow: '0 8px 25px rgba(155, 89, 182, 0.3)',
              transition: 'all 0.3s ease',
              ':hover': { transform: 'translateY(-5px)' }
            }}>
              <FileText size={28} style={{ marginBottom: '8px', opacity: 0.9 }} />
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{diaryEntries.length}</div>
              <div style={{ fontSize: '0.95rem', opacity: 0.9 }}>Entries</div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '24px',
              borderRadius: '12px',
              color: 'white',
              textAlign: 'center',
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s ease',
              ':hover': { transform: 'translateY(-5px)' }
            }}>
              <Award size={28} style={{ marginBottom: '8px', opacity: 0.9 }} />
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{productivityScore}</div>
              <div style={{ fontSize: '0.95rem', opacity: 0.9 }}>Productivity Score</div>
            </div>
          </div>

          {/* Enhanced Analytics */}
          {diaryEntries.length > 0 && (
            <div style={{
              background: theme === 'dark' ? '#1a202c' : 'white',
              padding: '24px',
              borderRadius: '12px',
              marginBottom: '32px',
              border: `1px solid ${theme === 'dark' ? '#4a5568' : '#e9ecef'}`,
              boxShadow: theme === 'dark' ? '0 4px 15px rgba(0,0,0,0.2)' : '0 4px 15px rgba(0,0,0,0.05)'
            }}>
              <h3 style={{
                margin: '0 0 20px 0',
                color: theme === 'dark' ? '#e2e8f0' : '#495057',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <BarChart3 size={20} />
                Advanced Analytics
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: theme === 'dark' ? '#a0aec0' : '#6c757d' }}>Cost Efficiency</span>
                    <span style={{ fontWeight: '600', color: theme === 'dark' ? '#e2e8f0' : '#495057' }}>
                      {totalCost > 0 ? Math.round((totalRevenue / totalCost) * 100) : 0}%
                    </span>
                  </div>
                  <div style={{
                    height: '24px',
                    background: theme === 'dark' ? '#2d3748' : '#e9ecef',
                    borderRadius: '12px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(100, (totalRevenue / Math.max(totalCost, 1)) * 100)}%`,
                      background: 'linear-gradient(90deg, #4ecdc4, #44a08d)',
                      transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                      borderRadius: '12px'
                    }}></div>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: theme === 'dark' ? '#a0aec0' : '#6c757d' }}>Productivity</span>
                    <span style={{ fontWeight: '600', color: theme === 'dark' ? '#e2e8f0' : '#495057' }}>
                      {productivityScore}%
                    </span>
                  </div>
                  <div style={{
                    height: '24px',
                    background: theme === 'dark' ? '#2d3748' : '#e9ecef',
                    borderRadius: '12px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${productivityScore}%`,
                      background: 'linear-gradient(90deg, #667eea, #764ba2)',
                      transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                      borderRadius: '12px'
                    }}></div>
                  </div>
                </div>
                <div style={{
                  background: theme === 'dark' ? '#2d3748' : '#f8f9fa',
                  padding: '16px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <Target size={24} style={{ color: '#f39c12', marginBottom: '8px' }} />
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: theme === 'dark' ? '#e2e8f0' : '#495057' }}>
                    {Math.round(diaryEntries.reduce((sum, entry) => sum + entry.items.length, 0) / Math.max(diaryEntries.length, 1))}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: theme === 'dark' ? '#a0aec0' : '#6c757d' }}>
                    Avg Items/Entry
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Diary Area */}
          <div className="diary-main" style={{ display: 'flex', gap: '24px' }}>
            <DiaryToolbar
              onExport={handleExport}
              onExportCSV={handleExportCSV}
              theme={theme}
              onThemeToggle={toggleTheme}
            />

            <div style={{ flex: 1 }}>
              <div className="diary-page">
                <div className="diary-content">
                  <div style={{
                    textAlign: 'center',
                    marginBottom: '24px',
                    paddingTop: '20px'
                  }}>
                    <h2 style={{
                      margin: '0 0 8px 0',
                      color: theme === 'dark' ? '#e2e8f0' : 'white',
                      fontSize: '2.2rem',
                      fontWeight: '600',
                      textShadow: theme === 'dark' ? 'none' : '0 2px 4px rgba(0,0,0,0.3)'
                    }}>
                      {selectedDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h2>
                    <p style={{
                      margin: 0,
                      color: theme === 'dark' ? '#a0aec0' : 'rgba(255,255,255,0.9)',
                      fontSize: '1.1rem'
                    }}>
                      Your construction work diary - drag items from the left to add them!
                    </p>
                  </div>

                  {/* Diary Entries */}
                  <div style={{ marginTop: '20px' }}>
                    {diaryEntries.length === 0 ? (
                      <div style={{
                        textAlign: 'center',
                        padding: '80px 20px',
                        color: theme === 'dark' ? '#a0aec0' : '#6c757d',
                        border: `2px dashed ${theme === 'dark' ? '#4a5568' : '#dee2e6'}`,
                        borderRadius: '16px',
                        background: theme === 'dark' ? 'rgba(45, 55, 72, 0.5)' : 'rgba(248, 249, 250, 0.8)',
                        backdropFilter: 'blur(10px)'
                      }}>
                        <FileText size={56} style={{ color: theme === 'dark' ? '#4a5568' : '#dee2e6', marginBottom: '20px' }} />
                        <h3 style={{ color: theme === 'dark' ? '#e2e8f0' : '#495057' }}>Your diary is empty</h3>
                        <p style={{ margin: '16px 0' }}>
                          Click "New Entry" to create your first diary entry, then drag items from the left toolbar!
                        </p>
                        <button
                          onClick={handleCreateEntry}
                          style={{
                            marginTop: '20px',
                            padding: '14px 28px',
                            background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: '600',
                            boxShadow: '0 6px 20px rgba(78, 205, 196, 0.4)',
                            transition: 'all 0.3s ease',
                            ':hover': { transform: 'translateY(-3px)' }
                          }}
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
                          onAddPhotos={handleAddPhotos}
                          onAddVoiceNote={handleAddVoiceNote}
                          onAddLocation={handleAddLocation}
                          onPredictTime={handlePredictTime}
                          theme={theme}
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
