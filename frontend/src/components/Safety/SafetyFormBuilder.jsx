import React, { useState, useCallback, useEffect, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Plus, Trash2, GripVertical, Type, CheckSquare, PenTool, Image, AlertTriangle, Sparkles, Loader2, X, List, Calendar, FileText, ChevronDown, Grid, Settings, MoveHorizontal, Copy, Wand2, Palette, Layout, Maximize2, Clock, Cloud, User, Hammer, Shield, Video, QrCode, Smartphone, File } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { api } from '../../utils/api'; 
import { RiskMatrix } from './SafetyComponents'; 
import { useData } from '../../context/DataContext'; 
import VideoBeacon from '../ui/VideoBeacon';
import { generateSafetyPDF } from './SafetyPDF'; 

const ItemTypes = {
  FIELD: 'field',
};

// ==========================================
// AI VERIFICATION BADGE
// ==========================================
const AIBadge = ({ onVerify }) => (
    <div className="absolute top-2 right-2 flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-2 py-1 z-30 backdrop-blur-md">
        <Sparkles size={10} className="text-amber-500" />
        <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wide">AI Generated</span>
        <button 
            onClick={(e) => { e.stopPropagation(); onVerify(); }} 
            className="ml-1 bg-amber-500 hover:bg-amber-400 text-black rounded-full p-0.5 transition-colors" 
            title="Mark as Verified"
        >
            <CheckSquare size={10} strokeWidth={3} />
        </button>
    </div>
);

// ==========================================
// FLOATING CONTEXT TOOLBAR
// ==========================================
const FloatingToolbar = ({ field, onUpdate, onDelete, onDuplicate, onAIPolish, isPolishing }) => {
  return (
    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-stone-900 text-white rounded-xl shadow-2xl flex items-center gap-1 p-1.5 border border-white/10 z-50 animate-in fade-in zoom-in-95 duration-200">
      <button 
        onClick={(e) => { e.stopPropagation(); onAIPolish(field); }}
        disabled={isPolishing}
        className="p-2 hover:bg-purple-600 rounded-lg transition-colors group relative"
        title="AI Magic Polish"
      >
        <Wand2 size={14} className={isPolishing ? "animate-spin" : "text-purple-400 group-hover:text-white"} />
      </button>
      <div className="w-px h-4 bg-white/20 mx-1" />
      <button 
        onClick={(e) => { e.stopPropagation(); onUpdate({ ...field, width: field.width === '100%' ? '50%' : '100%' }); }}
        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-300 hover:text-white"
      >
        {field.width === '100%' ? <Layout size={14} /> : <Maximize2 size={14} />}
      </button>
      <button onClick={(e) => { e.stopPropagation(); onDuplicate(field); }} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-300 hover:text-white">
        <Copy size={14} />
      </button>
      <div className="w-px h-4 bg-white/20 mx-1" />
      <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 hover:bg-red-500 rounded-lg transition-colors text-gray-300 hover:text-white">
        <Trash2 size={14} />
      </button>
    </div>
  );
};

// ==========================================
// AUTO-RESIZING TEXTAREA
// ==========================================
const AutoResizingTextarea = ({ className, value, onChange, placeholder, style, ...props }) => {
  const textareaRef = useRef(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value, style?.width]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`${className} overflow-hidden resize-none`}
      rows={1}
      style={style}
      {...props}
    />
  );
};

// ==========================================
// DRAGGABLE TOOLBOX ITEM
// ==========================================
const DraggableField = ({ type, label, icon: Icon, onAdd }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.FIELD,
    item: { type, label },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  }));

  return (
    <div
      ref={drag}
      onClick={() => onAdd(type)}
      className={`
        p-3 mb-2 bg-stone-800 border border-white/10 rounded-lg cursor-grab 
        hover:bg-stone-700 hover:border-indigo-500/50 flex items-center gap-3 
        transition-all group active:scale-95
        ${isDragging ? 'opacity-50' : ''}
      `}
    >
      <div className="p-1.5 bg-white/5 rounded group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
        <Icon size={16} />
      </div>
      <span className="text-xs font-bold text-gray-300 uppercase tracking-wider group-hover:text-white">{label}</span>
    </div>
  );
};

// ==========================================
// CANVAS FIELD (SMART RENDERER)
// ==========================================
const CanvasField = ({ field, index, moveField, onDelete, onSelect, onUpdate, isSelected, onDuplicate, onAIPolish, isPolishing, accentColor }) => {
  const ref = useRef(null);
  const [{ handlerId }, drop] = useDrop({
    accept: 'CANVAS_FIELD',
    collect(monitor) { return { handlerId: monitor.getHandlerId() }; },
    hover(item, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      moveField(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });
  const [{ isDragging }, drag] = useDrag({
    type: 'CANVAS_FIELD',
    item: () => ({ id: field.id, index }),
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });
  drag(drop(ref));

  // --- STICKY RESIZE LOGIC ---
  const handleResizeMouseDown = (e) => {
    e.stopPropagation(); e.preventDefault();
    const startX = e.clientX;
    const startWidth = ref.current.offsetWidth;
    const parentWidth = ref.current.parentElement.offsetWidth;
    
    const onMouseMove = (moveEvent) => {
        const delta = moveEvent.clientX - startX;
        const newWidthPx = startWidth + delta;
        const rawPercent = (newWidthPx / parentWidth) * 100;
        
        // Sticky Snap Points
        const snapPoints = [25, 33.33, 50, 66.66, 75, 100];
        const closest = snapPoints.reduce((prev, curr) => 
            Math.abs(curr - rawPercent) < 5 ? curr : prev
        , rawPercent);

        // Clamp
        const finalPercent = Math.max(20, Math.min(100, closest));
        
        onUpdate({ ...field, width: `${finalPercent}%` });
    };
    
    const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const getFontSize = () => {
      switch(field.fontSize) {
          case 'sm': return 'text-xs'; case 'lg': return 'text-lg'; case 'xl': return 'text-xl'; case '2xl': return 'text-2xl'; default: return 'text-sm';
      }
  };
  const getHeaderSize = () => {
      switch(field.fontSize) {
          case 'sm': return 'text-lg'; case 'lg': return 'text-3xl'; case 'xl': return 'text-4xl'; default: return 'text-2xl';
      }
  };

  // --- RENDERERS ---
  const renderContent = () => {
    switch(field.type) {
      case 'header':
        return (
          <AutoResizingTextarea
            value={field.label} onChange={(e) => onUpdate({ ...field, label: e.target.value })}
            className={`w-full bg-transparent border-b-2 border-transparent hover:border-gray-200 focus:border-[${accentColor}] font-black text-gray-900 placeholder-gray-300 outline-none transition-all px-1 ${getHeaderSize()}`}
            placeholder="Section Header"
            style={{ color: accentColor }}
          />
        );
      case 'paragraph':
        return (
          <AutoResizingTextarea 
            value={field.value || ''} onChange={(e) => onUpdate({ ...field, value: e.target.value })}
            className={`w-full bg-transparent border border-transparent hover:border-gray-200 focus:border-[${accentColor}] text-gray-700 leading-relaxed outline-none transition-all p-2 rounded ${getFontSize()}`}
            placeholder="Type document content here..."
          />
        );
      case 'date':
        return (
          <div className="w-full">
             <div className="flex justify-between items-center mb-1">
                <input value={field.label} onChange={(e) => onUpdate({ ...field, label: e.target.value })} className={`bg-transparent border-none font-bold text-gray-600 focus:ring-0 px-0 w-full ${getFontSize()}`} />
             </div>
             <div className="flex gap-2">
                <div className="flex-1 h-10 bg-gray-50 border border-gray-200 rounded-lg flex items-center px-3 text-gray-400 text-xs gap-2 shadow-sm">
                   <Calendar size={14} className={`text-[${accentColor}]`} />
                   <span>Select Date</span>
                </div>
                {field.showTime && (
                    <div className="w-24 h-10 bg-gray-50 border border-gray-200 rounded-lg flex items-center px-3 text-gray-400 text-xs gap-2 shadow-sm">
                       <Clock size={14} /> 00:00
                    </div>
                )}
                {field.showWeather && (
                    <div className="w-24 h-10 bg-gray-50 border border-gray-200 rounded-lg flex items-center px-3 text-gray-400 text-xs gap-2 shadow-sm">
                       <Cloud size={14} /> 24°C
                    </div>
                )}
             </div>
          </div>
        );
      case 'checkbox':
      case 'select':
      case 'radio':
        return (
          <div className="w-full">
            <input value={field.label} onChange={(e) => onUpdate({ ...field, label: e.target.value })} className={`w-full bg-transparent border-none font-bold text-gray-600 uppercase tracking-wider mb-2 focus:ring-0 px-0 ${getFontSize()}`} />
            {field.style === 'chips' ? (
                <div className="flex flex-wrap gap-2">
                  {(field.options || ['Option 1', 'Option 2']).map((opt, i) => (
                    <div key={i} className={`px-4 py-2 bg-gray-100 rounded-full border border-gray-200 text-xs font-bold text-gray-600 shadow-sm`}>{opt}</div>
                  ))}
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                  {(field.options || ['Option 1', 'Option 2']).map((opt, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-gray-50/50 rounded border border-transparent">
                      {field.type === 'checkbox' && <div className="w-4 h-4 border-2 border-gray-300 rounded" />}
                      {field.type === 'radio' && <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />}
                      <span className="text-sm text-gray-700">{opt}</span>
                    </div>
                  ))}
                  {field.type === 'select' && <div className="text-xs text-gray-400 italic pl-2 border-l-2 border-gray-200 ml-1">Dropdown Menu</div>}
                </div>
            )}
          </div>
        );
      case 'hazard':
        return (
          <div className="w-full bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row">
             <div className="p-4 flex-1 border-b md:border-b-0 md:border-r border-gray-100">
                <div className="flex items-center gap-2 mb-2 text-gray-800 font-black text-xs uppercase tracking-widest">
                   <AlertTriangle size={14} className="text-orange-500" /> HAZARD
                </div>
                <AutoResizingTextarea
                  value={field.label} 
                  onChange={(e) => onUpdate({ ...field, label: e.target.value })}
                  className="bg-transparent border-none text-gray-900 font-bold text-sm w-full p-0 focus:ring-0 placeholder-gray-300"
                  placeholder="Describe Hazard..."
                />
             </div>
             <div className="p-4 flex-[1.5]">
                <div className="flex items-center gap-2 mb-2 text-gray-800 font-black text-xs uppercase tracking-widest">
                   <Shield size={14} className="text-emerald-500" /> CONTROLS
                </div>
                <div className="h-8 bg-gray-50 border border-gray-200 border-dashed rounded flex items-center px-3 text-xs text-gray-400 italic">
                   List control measures...
                </div>
             </div>
             <div className="p-4 w-full md:w-32 bg-gray-50 flex flex-col justify-center items-center gap-2">
                <span className="text-[9px] font-bold text-gray-400 uppercase">Risk Level</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-emerald-400" title="Low"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400" title="Med"></div>
                    <div className="w-3 h-3 rounded-full bg-red-500" title="High"></div>
                </div>
             </div>
          </div>
        );
      case 'risk_matrix':
        return (
            <div className="w-full border border-gray-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4 flex justify-between items-center">
                    <input 
                      value={field.label} 
                      onChange={(e) => onUpdate({ ...field, label: e.target.value })}
                      className="bg-transparent border-none text-sm font-black text-gray-800 focus:ring-0 uppercase tracking-widest"
                    />
                    <div className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500 font-bold">INTERACTIVE</div>
                </div>
                <RiskMatrix value={field.value} onChange={(val) => onUpdate({ ...field, value: val })} />
            </div>
        );
      case 'video':
        return (
            <div className="w-full">
                <div className="flex justify-between mb-2">
                    <input value={field.label} onChange={(e) => onUpdate({ ...field, label: e.target.value })} className="bg-transparent border-none text-sm font-bold text-gray-700 focus:ring-0 px-0" />
                </div>
                <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group/video shadow-lg">
                    {field.videoUrl ? (
                        <iframe 
                            src={field.videoUrl.replace('watch?v=', 'embed/')} 
                            className="w-full h-full pointer-events-none" 
                            title="Video"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <Video size={48} className="mb-2 opacity-50" />
                            <span className="text-xs font-bold uppercase tracking-widest">Training Video Container</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-transparent" /> {/* Click shield */}
                </div>
            </div>
        );
      case 'photo':
        return (
          <div className="w-full">
             <div className="flex justify-between mb-2">
                <input value={field.label} onChange={(e) => onUpdate({ ...field, label: e.target.value })} className="bg-transparent border-none text-sm font-bold text-gray-700 focus:ring-0 px-0" />
             </div>
             {field.value ? (
                 <div className="relative group/img">
                    <img src={field.value} alt="Doc Asset" className="w-full max-h-[500px] object-contain rounded-lg border border-gray-200 shadow-sm" />
                    <button onClick={(e) => { e.stopPropagation(); onUpdate({ ...field, value: null }); }} className="absolute top-2 right-2 bg-black/50 hover:bg-red-500 text-white p-1.5 rounded-full backdrop-blur-md transition-all opacity-0 group-hover/img:opacity-100"><Trash2 size={16} /></button>
                 </div>
             ) : (
                 <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors group/upload">
                    <div className="p-3 bg-white rounded-full shadow-sm mb-2 group-hover/upload:scale-110 transition-transform"><Image size={24} className={`text-[${accentColor}]`} /></div>
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wide">Click to Upload Image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files[0]; if(file) { const reader = new FileReader(); reader.onloadend = () => onUpdate({ ...field, value: reader.result }); reader.readAsDataURL(file); }}} />
                 </label>
             )}
          </div>
        );
      default: 
        return (
          <div className="w-full">
            <div className="flex justify-between items-start">
              <AutoResizingTextarea
                value={field.label} onChange={(e) => onUpdate({ ...field, label: e.target.value })}
                className={`bg-transparent border-none font-bold text-gray-700 mb-1 focus:ring-0 px-0 w-full ${getFontSize()}`}
                placeholder="Label for input..."
              />
              {field.required && <span className="text-red-500 text-xs font-bold ml-2">*</span>}
            </div>
            {/* Blank input area */}
            <div className="min-h-[36px] bg-gray-50/50 border border-gray-200 rounded-lg flex items-center px-3 relative mt-1">
               {field.type === 'signature' && <PenTool size={14} className="text-gray-300" />}
            </div>
          </div>
        );
    }
  };

  return (
    <div
      ref={ref}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      style={{ width: field.width || '100%' }}
      className={`
        relative group mb-4 p-3 rounded-lg transition-all border-2 flex-shrink-0
        ${isSelected ? `border-[${accentColor || '#6366f1'}] bg-indigo-50/5 z-20 shadow-md` : 'border-transparent hover:border-gray-200 hover:bg-gray-50'}
        ${isDragging ? 'opacity-0' : 'opacity-100'}
        ${field.isAI && !field.verified ? 'ring-1 ring-amber-500/30' : ''}
      `}
      data-handler-id={handlerId}
    >
      {field.isAI && !field.verified && <AIBadge onVerify={() => onUpdate({ ...field, verified: true })} />}
      {isSelected && <FloatingToolbar field={field} onUpdate={onUpdate} onDelete={onDelete} onDuplicate={onDuplicate} onAIPolish={onAIPolish} isPolishing={isPolishing} />}
      <div className="absolute -left-8 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-gray-600 cursor-move opacity-0 group-hover:opacity-100 transition-opacity z-10"><GripVertical size={20} /></div>
      {renderContent()}
      
      {/* CORNER RESIZER (STICKY) */}
      {isSelected && (
          <div 
            onMouseDown={handleResizeMouseDown}
            className="absolute right-0 bottom-0 w-6 h-6 cursor-se-resize flex items-end justify-end p-1 z-20 group/resizer"
          >
              <div className={`w-2 h-2 border-r-2 border-b-2 border-[${accentColor || '#6366f1'}] opacity-50 group-hover/resizer:opacity-100`} />
          </div>
      )}
    </div>
  );
};

// ==========================================
// DOCUMENT CANVAS
// ==========================================
const FormCanvas = ({ fields, setFields, onSelect, onUpdate, selectedFieldId, onAdd, onDuplicate, onAIPolish, isPolishingField, accentColor, viewMode }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.FIELD,
    drop: (item) => onAdd(item.type),
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  }));

  const moveField = (dragIndex, hoverIndex) => {
    const dragField = fields[dragIndex];
    const newFields = [...fields];
    newFields.splice(dragIndex, 1);
    newFields.splice(hoverIndex, 0, dragField);
    setFields(newFields);
  };

  const canvasWidth = viewMode === 'mobile' ? '375px' : '210mm';
  // Use a minimum height of A4, but allow it to grow
  const minHeight = viewMode === 'mobile' ? '667px' : '297mm';

  // Helper to render page break lines
  const renderPageBreaks = () => {
    if (viewMode === 'mobile') return null;
    // We can't easily know total height in pixels here without ref measurement, 
    // but we can just render a background pattern or overlay for visual guidance.
    // Simpler approach: CSS background gradient for page breaks.
    return (
        <div 
            className="absolute inset-0 pointer-events-none z-0"
            style={{
                backgroundImage: `linear-gradient(to bottom, transparent calc(297mm - 1px), dashed 1px #e5e7eb)`,
                backgroundSize: '100% 297mm'
            }}
        />
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-stone-900/50 flex justify-center items-start transition-all custom-scrollbar">
      <div
        ref={drop}
        style={{ width: canvasWidth, minHeight: minHeight, height: 'auto' }}
        className={`
          relative bg-white text-black shadow-2xl transition-all origin-top duration-500
          ${isOver ? `ring-4 ring-[${accentColor || '#6366f1'}]/50` : ''}
          ${viewMode === 'mobile' ? 'rounded-[3rem] border-8 border-gray-800 p-6' : 'rounded-sm'}
        `}
      >
        {viewMode === 'mobile' && <div className="w-32 h-6 bg-black absolute top-0 left-1/2 -translate-x-1/2 rounded-b-xl z-20" />}
        
        {/* Page Break Visuals */}
        {renderPageBreaks()}

        {fields.length === 0 ? (
          <div className="h-[297mm] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 space-y-4 py-20">
            <div className="p-4 bg-gray-50 rounded-full"><Plus size={32} /></div>
            <div className="text-center"><p className="font-bold text-lg">Your Document is Empty</p><p className="text-sm">Drag items from the toolbox to start building</p></div>
          </div>
        ) : (
          <div className="flex flex-wrap content-start relative z-10 p-[20mm] min-h-full">
             <div className="w-full text-center border-b-2 border-black pb-4 mb-8 opacity-50 hover:opacity-100 transition-opacity">
                <h1 className="text-3xl font-black uppercase tracking-tight" style={{ color: accentColor || '#000' }}>Document Title</h1>
                <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mt-1">Project Name • {new Date().toLocaleDateString()}</div>
             </div>
             {fields.map((field, index) => (
              <CanvasField 
                key={field.id} index={index} field={field} moveField={moveField} 
                onDelete={() => setFields(fields.filter(f => f.id !== field.id))}
                onSelect={() => onSelect(field)}
                onUpdate={(updated) => { setFields(fields.map(f => f.id === updated.id ? updated : f)); onSelect(updated); }}
                onDuplicate={onDuplicate} onAIPolish={onAIPolish} isPolishing={isPolishingField === field.id}
                isSelected={selectedFieldId === field.id} accentColor={accentColor}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// PROPERTIES PANEL
// ==========================================
const PropertiesPanel = ({ field, onChange, accentColor, onAccentChange }) => {
  if (!field) return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6 text-center space-y-6">
      <div><Settings size={40} className="mb-4 opacity-20 mx-auto" /><p className="text-xs font-bold uppercase tracking-widest">Select an element to edit</p></div>
      <div className="w-full border-t border-white/5 pt-6">
          <label className="block text-xs font-bold text-indigo-400 uppercase mb-3">Document Branding</label>
          <div className="grid grid-cols-5 gap-2">
              {['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#000000'].map(color => (
                  <button key={color} onClick={() => onAccentChange(color)} className={`w-8 h-8 rounded-full border-2 transition-all ${accentColor === color ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`} style={{ backgroundColor: color }} />
              ))}
          </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="pb-4 border-b border-white/5"><h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Editing</h4><div className="text-lg font-bold text-white capitalize">{field.type} Element</div></div>
      <div>
        <label className="block text-xs font-bold text-indigo-400 uppercase mb-2">Label / Title</label>
        <textarea value={field.label} onChange={(e) => onChange({ ...field, label: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-indigo-500 outline-none font-medium h-20 resize-none" />
      </div>

      <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Width</label><select value={field.width || '100%'} onChange={(e) => onChange({ ...field, width: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white text-xs focus:border-indigo-500 outline-none appearance-none"><option value="25%">25% (1/4)</option><option value="33%">33% (1/3)</option><option value="50%">50% (1/2)</option><option value="66%">66% (2/3)</option><option value="75%">75% (3/4)</option><option value="100%">100% (Full)</option></select></div>
          <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Text Size</label><select value={field.fontSize || 'normal'} onChange={(e) => onChange({ ...field, fontSize: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white text-xs focus:border-indigo-500 outline-none appearance-none"><option value="sm">Small</option><option value="normal">Normal</option><option value="lg">Large</option><option value="xl">X-Large</option><option value="2xl">2X-Large</option></select></div>
      </div>

      {field.type === 'video' && (
          <div><label className="block text-xs font-bold text-indigo-400 uppercase mb-2">Video URL (YouTube/Vimeo)</label><input type="text" value={field.videoUrl || ''} onChange={(e) => onChange({ ...field, videoUrl: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-indigo-500 outline-none" placeholder="https://youtube.com/..." /></div>
      )}

      {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
          <>
          <div><label className="block text-xs font-bold text-indigo-400 uppercase mb-2">Visual Style</label><div className="flex gap-2 bg-black/30 p-1 rounded-lg"><button onClick={() => onChange({ ...field, style: 'default' })} className={`flex-1 py-1 text-xs rounded ${!field.style || field.style === 'default' ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}>List</button><button onClick={() => onChange({ ...field, style: 'chips' })} className={`flex-1 py-1 text-xs rounded ${field.style === 'chips' ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}>Chips</button></div></div>
          <div><label className="block text-xs font-bold text-indigo-400 uppercase mb-2">Options</label><textarea value={field.options?.join(', ') || ''} onChange={(e) => onChange({ ...field, options: e.target.value.split(',').map(s => s.trim()) })} className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-indigo-500 outline-none h-24 resize-none" placeholder="Option 1, Option 2..." /><p className="text-[10px] text-gray-500 mt-2">Separate options with commas</p></div>
          <div className="mt-4 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl"><h5 className="text-[10px] font-bold text-indigo-300 uppercase mb-2 flex items-center gap-1"><Sparkles size={10} /> Smart Data Source</h5><select className="w-full bg-black/30 border border-white/10 rounded p-2 text-xs text-white outline-none"><option>Custom (Use Options above)</option><option>Staff List</option><option>Equipment List</option><option>Projects</option></select></div>
          </>
      )}

      {field.type === 'date' && (
          <div className="space-y-2">
              <label className="block text-xs font-bold text-indigo-400 uppercase">Context Features</label>
              <div onClick={() => onChange({ ...field, showTime: !field.showTime })} className={`flex items-center gap-3 p-3 bg-black/30 rounded-lg border cursor-pointer transition-colors ${field.showTime ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/5'}`}><Clock size={16} className={field.showTime ? 'text-emerald-400' : 'text-gray-500'} /><span className="text-xs font-bold text-white">Include Time</span></div>
              <div onClick={() => onChange({ ...field, showWeather: !field.showWeather })} className={`flex items-center gap-3 p-3 bg-black/30 rounded-lg border cursor-pointer transition-colors ${field.showWeather ? 'border-blue-500 bg-blue-500/10' : 'border-white/5'}`}><Cloud size={16} className={field.showWeather ? 'text-blue-400' : 'text-gray-500'} /><span className="text-xs font-bold text-white">Include Weather</span></div>
          </div>
      )}
      
      {field.type !== 'header' && field.type !== 'paragraph' && field.type !== 'video' && (
      <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:border-indigo-500/50 transition-colors">
        <input type="checkbox" checked={field.required} onChange={(e) => onChange({ ...field, required: e.target.checked })} className="w-5 h-5 rounded border-none bg-stone-700 checked:bg-indigo-500 cursor-pointer" />
        <label className="text-sm font-bold text-gray-300 cursor-pointer select-none">Required Field</label>
      </div>
      )}
    </div>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================
const SafetyFormBuilder = ({ onSave, initialData = [] }) => {
  const { getSession, saveSession } = useData();
  const location = useLocation();
  const hasAutoInitialized = useRef(false);

  const parseInitialData = (data) => {
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.fields)) return data.fields;
      return [];
  };

  const [fields, setFields] = useState(() => {
      const parsed = parseInitialData(initialData);
      if (parsed.length > 0) return parsed;
      return getSession('safety_builder_draft', []);
  });

  useEffect(() => {
      if (!initialData || (Array.isArray(initialData) && initialData.length === 0)) {
          saveSession('safety_builder_draft', fields);
      }
  }, [fields, saveSession, initialData]);

  const [selectedField, setSelectedField] = useState(null);
  const [accentColor, setAccentColor] = useState('#000000'); 
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [polishingFieldId, setPolishingFieldId] = useState(null);
  const [viewMode, setViewMode] = useState('desktop'); 

  useEffect(() => { setFields(parseInitialData(initialData)); }, [initialData]);

  const handleFieldUpdate = (updatedField) => { setFields(fields.map(f => f.id === updatedField.id ? updatedField : f)); setSelectedField(updatedField); };
  const addField = (type) => { const newField = { id: window.crypto.randomUUID(), type, label: type === 'header' ? 'New Section' : type === 'paragraph' ? '' : `New ${type}`, value: type === 'paragraph' ? 'Enter text here...' : '', required: false, width: '100%', fontSize: type === 'header' ? '2xl' : 'normal', options: type === 'checkbox' || type === 'select' || type === 'radio' ? ['Option 1', 'Option 2'] : [] }; setFields((prev) => [...prev, newField]); };
  const duplicateField = (field) => { const newField = { ...field, id: window.crypto.randomUUID() }; setFields(prev => [...prev, newField]); };
  const handleAIPolish = async (field) => { if (!field.label && !field.value) return; setPolishingFieldId(field.id); try { const res = await api.post('/safety/ai-content', { prompt: `Polish and professionalize this text for a construction safety document: "${field.value || field.label}"`, mode: 'polish' }); const polishedText = res.data.result?.text || res.data.result || field.label; const updated = { ...field, isAI: true, verified: false }; if (field.type === 'paragraph') updated.value = polishedText; else updated.label = polishedText; handleFieldUpdate(updated); } catch (e) { console.error("Polish failed", e); } finally { setPolishingFieldId(null); } };
  const generateWithAI = async (promptOverride) => { 
      const finalPrompt = promptOverride || aiPrompt;
      if (!finalPrompt) return; 
      setAiLoading(true); 
      try { 
          const res = await api.post('/safety/ai-content', { prompt: finalPrompt, mode: 'full_form' }); 
          if (res.data.result && res.data.result.fields) { 
              const aiFields = res.data.result.fields.map(f => ({ ...f, id: window.crypto.randomUUID(), width: '100%', isAI: true, verified: false })); 
              setFields(aiFields); 
              setShowAIModal(false); 
          } else { 
              alert("AI Response format invalid."); 
          } 
      } catch (err) { 
          console.error("AI Error:", err); 
          alert("Failed to generate form."); 
      } finally { 
          setAiLoading(false); 
      } 
  };

  useEffect(() => {
      if (location.state?.autoInitialize && !hasAutoInitialized.current) {
          hasAutoInitialized.current = true;
          const { template, projectName } = location.state;
          const prompt = `Create a professional construction ${template || 'Safety Document'} for project: ${projectName || 'General Works'}. Include relevant hazards, controls, and sign-off sections.`;
          generateWithAI(prompt);
      }
  }, [location.state]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-full bg-stone-950 border border-white/10 rounded-2xl overflow-hidden relative shadow-2xl">
        <div className="w-72 bg-stone-900 border-r border-white/5 flex flex-col">
          <div className="p-6 border-b border-white/5"><h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2"><PenTool size={20} className="text-indigo-500" /> Form Builder</h2></div>
          <div className="p-6 overflow-y-auto flex-1">
             <button onClick={() => setShowAIModal(true)} className="w-full mb-4 p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.02] hover:shadow-indigo-500/25 group"><Sparkles size={18} className="group-hover:animate-spin-slow" /><span className="font-bold text-sm uppercase tracking-wide">AI Generator</span></button>
             <div className="mb-6 px-2 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-2">
                <AlertTriangle size={12} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-200/80 leading-tight">AI content requires human verification before use.</p>
             </div>
             <div className="space-y-6">
                <div><h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 pl-1">Structure</h3><div className="space-y-2"><DraggableField type="header" label="Header" icon={Type} onAdd={addField} /><DraggableField type="paragraph" label="Paragraph" icon={FileText} onAdd={addField} /></div></div>
                <div><h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 pl-1">Inputs</h3><div className="space-y-2"><DraggableField type="text" label="Text Input" icon={Type} onAdd={addField} /><DraggableField type="select" label="Dropdown" icon={List} onAdd={addField} /><DraggableField type="checkbox" label="Checkboxes" icon={CheckSquare} onAdd={addField} /><DraggableField type="date" label="Date" icon={Calendar} onAdd={addField} /></div></div>
                <div><h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 pl-1">Special</h3><div className="space-y-2"><DraggableField type="hazard" label="Hazard Card" icon={AlertTriangle} onAdd={addField} /><DraggableField type="risk_matrix" label="Risk Matrix" icon={Grid} onAdd={addField} /><DraggableField type="photo" label="Photo" icon={Image} onAdd={addField} /><DraggableField type="signature" label="Signature" icon={PenTool} onAdd={addField} /><DraggableField type="video" label="Training Video" icon={Video} onAdd={addField} /></div></div>
             </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col bg-stone-900/50">
            <div className="h-12 border-b border-white/5 flex items-center justify-center gap-4 bg-stone-900 px-4">
                <button onClick={() => setViewMode('desktop')} className={`p-2 rounded-lg transition-all ${viewMode === 'desktop' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-white'}`}><FileText size={16} /></button>
                <button onClick={() => setViewMode('mobile')} className={`p-2 rounded-lg transition-all ${viewMode === 'mobile' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-white'}`}><Smartphone size={16} /></button>
                <div className="w-px h-6 bg-white/10 mx-2" />
                <button onClick={() => alert("Scan this QR code to open form on mobile (Simulated)")} className="flex items-center gap-2 px-3 py-1.5 bg-stone-800 rounded-lg text-xs font-bold text-white hover:bg-stone-700 transition-colors border border-white/10"><QrCode size={14} /> Deploy to Mobile</button>
            </div>
            <FormCanvas fields={fields} setFields={setFields} onSelect={setSelectedField} onUpdate={handleFieldUpdate} selectedFieldId={selectedField?.id} onAdd={addField} onDuplicate={duplicateField} onAIPolish={handleAIPolish} isPolishingField={polishingFieldId} accentColor={accentColor} viewMode={viewMode} />
        </div>
        <div className="w-80 bg-stone-900 border-l border-white/5 flex flex-col">
          <div className="p-6 border-b border-white/5 flex flex-col gap-3 bg-stone-900/50">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Actions</h3>
            <div className="flex gap-2">
                <button onClick={() => onSave(fields)} className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all"><CheckSquare size={14} /> Save</button>
                <button onClick={() => generateSafetyPDF({ 
                    title: location.state?.template || 'Safety Record', 
                    projectName: location.state?.projectName || 'General Works',
                    locationDetails: location.state?.site || 'Site Alpha',
                    createdAt: new Date() 
                }, fields)} className="flex-1 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold rounded-lg border border-white/10 flex items-center justify-center gap-2 transition-all"><FileText size={14} /> PDF</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto"><PropertiesPanel field={selectedField} onChange={handleFieldUpdate} accentColor={accentColor} onAccentChange={setAccentColor} /></div>
        </div>
        {showAIModal && (<div className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in"><div className="bg-stone-900 border border-white/10 rounded-3xl p-8 w-full max-w-xl shadow-2xl relative overflow-hidden"><div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" /><div className="flex justify-between items-center mb-8"><div><h3 className="text-2xl font-black text-white mb-1">AI Document Architect</h3><p className="text-sm text-gray-400">Describe what you need, and I'll build the structure.</p></div><button onClick={() => setShowAIModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="text-gray-400" /></button></div><textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-2xl p-5 text-white text-base focus:border-indigo-500 outline-none h-40 mb-6 resize-none leading-relaxed" placeholder="e.g. 'Create a Hot Work Permit with sections for Fire Watch, PPE checks, and supervisor sign-off...'" autoFocus /><div className="flex justify-end gap-3"><button onClick={() => setShowAIModal(false)} className="px-6 py-3 text-gray-400 font-bold text-sm hover:text-white transition-colors">Cancel</button><button onClick={generateWithAI} disabled={aiLoading || !aiPrompt.trim()} className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all transform active:scale-95">{aiLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />} Generate Structure</button></div></div></div>)}
        
        {/* HELP BEACON */}
        <VideoBeacon videoId="hDcdw8MMa4M" title="Master Safety Co-pilot" />
      </div>
    </DndProvider>
  );
};

export default SafetyFormBuilder;