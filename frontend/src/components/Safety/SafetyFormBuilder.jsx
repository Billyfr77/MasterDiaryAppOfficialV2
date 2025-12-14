import React, { useState, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Plus, Trash2, GripVertical, Type, CheckSquare, PenTool, Image, AlertTriangle } from 'lucide-react';

const ItemTypes = {
  FIELD: 'field',
};

// Draggable Field Component
const DraggableField = ({ type, label, icon: Icon, onAdd }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.FIELD,
    item: { type, label },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      onClick={() => onAdd(type)}
      className={`p-3 mb-2 bg-stone-800 border border-white/10 rounded-lg cursor-grab hover:bg-stone-700 hover:border-indigo-500/50 flex items-center gap-3 transition-all ${isDragging ? 'opacity-50' : ''}`}
    >
      <Icon size={16} className="text-indigo-400" />
      <span className="text-xs font-bold text-white uppercase tracking-wider">{label}</span>
    </div>
  );
};

// Droppable Form Canvas
const FormCanvas = ({ fields, setFields, onSelect }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.FIELD,
    drop: (item) => addField(item.type),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const addField = (type) => {
    const newField = {
      id: Date.now().toString(),
      type,
      label: `New ${type}`,
      required: false,
      options: type === 'checkbox' ? ['Option 1'] : []
    };
    setFields((prev) => [...prev, newField]);
  };

  const moveField = (dragIndex, hoverIndex) => {
    const dragField = fields[dragIndex];
    const newFields = [...fields];
    newFields.splice(dragIndex, 1);
    newFields.splice(hoverIndex, 0, dragField);
    setFields(newFields);
  };

  return (
    <div
      ref={drop}
      className={`flex-1 bg-stone-900 border-2 border-dashed rounded-xl p-6 min-h-[500px] transition-colors ${isOver ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10'}`}
    >
      {fields.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-gray-500">
          <p className="text-sm font-bold uppercase tracking-widest mb-2">Drag Fields Here</p>
          <p className="text-xs opacity-50">or click to add</p>
        </div>
      ) : (
        fields.map((field, index) => (
          <CanvasField 
            key={field.id} 
            index={index} 
            field={field} 
            moveField={moveField} 
            onDelete={() => setFields(fields.filter(f => f.id !== field.id))}
            onSelect={() => onSelect(field)}
          />
        ))
      )}
    </div>
  );
};

// Field Item on Canvas
const CanvasField = ({ field, index, moveField, onDelete, onSelect }) => {
  const ref = React.useRef(null);
  
  const [{ handlerId }, drop] = useDrop({
    accept: 'CANVAS_FIELD',
    collect(monitor) {
      return { handlerId: monitor.getHandlerId() };
    },
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

  return (
    <div
      ref={ref}
      onClick={onSelect}
      className={`relative group bg-stone-800 p-4 mb-3 rounded-lg border border-white/5 hover:border-indigo-500 cursor-pointer transition-all ${isDragging ? 'opacity-0' : 'opacity-100'}`}
      data-handler-id={handlerId}
    >
      <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-600 cursor-move p-2 hover:text-white">
        <GripVertical size={14} />
      </div>
      
      <div className="pl-8 pr-8">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{field.type}</div>
        <div className="text-sm font-bold text-white">{field.label}</div>
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

// Properties Panel
const PropertiesPanel = ({ field, onChange }) => {
  if (!field) return <div className="p-4 text-center text-gray-500 text-xs">Select a field to edit properties</div>;

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Label</label>
        <input 
          type="text" 
          value={field.label} 
          onChange={(e) => onChange({ ...field, label: e.target.value })}
          className="w-full bg-stone-950 border border-white/10 rounded p-2 text-white text-sm focus:border-indigo-500 outline-none"
        />
      </div>
      
      <div className="flex items-center gap-2">
        <input 
          type="checkbox" 
          checked={field.required}
          onChange={(e) => onChange({ ...field, required: e.target.checked })}
          className="rounded bg-stone-950 border-white/10"
        />
        <label className="text-xs font-bold text-gray-300">Required Field</label>
      </div>

      {field.type === 'hazard' && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded text-xs text-amber-200">
          This field will auto-suggest controls using AI based on input.
        </div>
      )}
    </div>
  );
};

// Main Builder Component
const SafetyFormBuilder = ({ onSave, initialData = [] }) => {
  const [fields, setFields] = useState(initialData);
  const [selectedField, setSelectedField] = useState(null);

  const handleFieldUpdate = (updatedField) => {
    setFields(fields.map(f => f.id === updatedField.id ? updatedField : f));
    setSelectedField(updatedField);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-[600px] bg-stone-950 border border-white/10 rounded-xl overflow-hidden">
        {/* Toolbox */}
        <div className="w-64 bg-stone-900 border-r border-white/5 p-4 flex flex-col">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Toolbox</h3>
          <DraggableField type="text" label="Text Input" icon={Type} onAdd={(t) => {}} />
          <DraggableField type="checkbox" label="Checkbox" icon={CheckSquare} onAdd={(t) => {}} />
          <DraggableField type="hazard" label="Hazard Row" icon={AlertTriangle} onAdd={(t) => {}} />
          <DraggableField type="signature" label="Signature" icon={PenTool} onAdd={(t) => {}} />
          <DraggableField type="photo" label="Photo Upload" icon={Image} onAdd={(t) => {}} />
        </div>

        {/* Canvas */}
        <div className="flex-1 p-8 bg-black/20 overflow-y-auto">
          <FormCanvas fields={fields} setFields={setFields} onSelect={setSelectedField} />
        </div>

        {/* Properties */}
        <div className="w-72 bg-stone-900 border-l border-white/5 flex flex-col">
          <div className="p-4 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Properties</h3>
            <button onClick={() => onSave(fields)} className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded transition-colors">
              Save Template
            </button>
          </div>
          <PropertiesPanel field={selectedField} onChange={handleFieldUpdate} />
        </div>
      </div>
    </DndProvider>
  );
};

export default SafetyFormBuilder;
