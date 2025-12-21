import React, { useState } from 'react';
import { Search, User, Wrench, Package, X, GripVertical } from 'lucide-react';

const ResourceCard = ({ item, onClick, onDragStart }) => {
  let wrapperClass = "bg-gradient-to-r from-indigo-600/20 to-indigo-900/20 border-indigo-500/30 hover:border-indigo-400";
  let iconClass = "bg-indigo-500/20 text-indigo-400";
  let icon = <Package size={16} />;

  if (item.type === 'staff') {
    wrapperClass = "bg-gradient-to-r from-emerald-600/20 to-emerald-900/20 border-emerald-500/30 hover:border-emerald-400";
    iconClass = "bg-emerald-500/20 text-emerald-400";
    icon = <User size={16} />;
  } else if (item.type === 'equipment') {
    wrapperClass = "bg-gradient-to-r from-amber-600/20 to-amber-900/20 border-amber-500/30 hover:border-amber-400";
    iconClass = "bg-amber-500/20 text-amber-400";
    icon = <Wrench size={16} />;
  }

  const handleDragStart = (e) => {
      if (onDragStart) onDragStart(e, item);
      else {
          e.dataTransfer.setData('application/reactflow', JSON.stringify(item));
          e.dataTransfer.effectAllowed = 'move';
      }
  };

  return (
    <div 
        draggable 
        onDragStart={handleDragStart} 
        onClick={() => onClick && onClick(item)}
        className={`group relative flex items-center gap-3 p-3 rounded-xl border cursor-grab active:cursor-grabbing transition-all hover:translate-x-1 hover:shadow-lg ${wrapperClass}`}
    >
      <div className={`p-2 rounded-lg ${iconClass} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-gray-200 truncate group-hover:text-white transition-colors">{item.name}</div>
        <div className="text-[10px] text-gray-500 font-mono mt-0.5">
            {item.type === 'staff' ? `$${item.chargeRate || item.chargeOutBase || 0}/hr` : 
             item.type === 'equipment' ? `$${item.costRate || item.costRateBase || 0}/day` : 
             `$${item.pricePerUnit || 0}/unit`}
        </div>
      </div>
      <GripVertical size={14} className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

const ResourceSidebar = ({ materials = [], staff = [], equipment = [], onSearch, onTapAdd, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('all'); // all, materials, staff, equipment
  const [localSearch, setLocalSearch] = useState('');

  const handleSearch = (e) => {
      setLocalSearch(e.target.value);
      if (onSearch) onSearch(e.target.value);
  };

  const filterItems = (items) => items.filter(i => i.name.toLowerCase().includes(localSearch.toLowerCase()));

  return (
    <div className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-[#0a0a0c]/95 backdrop-blur-xl border-r border-white/5 flex flex-col shadow-2xl transition-transform duration-300 
        lg:relative lg:translate-x-0 lg:z-0 lg:w-72
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      {/* Header */}
      <div className="p-5 border-b border-white/5">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Package size={16} className="text-indigo-500" /> Resources
            </h3>
            <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-white"><X size={18} /></button>
        </div>
        
        {/* Search */}
        <div className="relative group">
            <Search className="absolute left-3 top-2.5 text-gray-500 group-focus-within:text-indigo-500 transition-colors" size={14} />
            <input 
                type="text" 
                placeholder="Search database..." 
                value={localSearch} 
                onChange={handleSearch} 
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-white focus:border-indigo-500 outline-none transition-all placeholder-gray-600" 
            />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 p-1 bg-black/40 rounded-lg">
            {['all', 'mat', 'lab', 'eqp'].map(tab => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                >
                    {tab === 'mat' ? 'Mat' : tab === 'lab' ? 'Lab' : tab === 'eqp' ? 'Eqp' : 'All'}
                </button>
            ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {(activeTab === 'all' || activeTab === 'mat') && (
            <div className="space-y-3">
                <div className="text-[10px] font-black text-indigo-500/80 uppercase tracking-widest px-1">Materials</div>
                {filterItems(materials).map(item => (
                    <ResourceCard key={item.id} item={{...item, type: 'material'}} onClick={onTapAdd} />
                ))}
            </div>
        )}

        {(activeTab === 'all' || activeTab === 'lab') && (
            <div className="space-y-3">
                <div className="text-[10px] font-black text-emerald-500/80 uppercase tracking-widest px-1 border-t border-white/5 pt-4">Staff</div>
                {filterItems(staff).map(item => (
                    <ResourceCard key={item.id} item={{...item, type: 'staff'}} onClick={onTapAdd} />
                ))}
            </div>
        )}

        {(activeTab === 'all' || activeTab === 'eqp') && (
            <div className="space-y-3">
                <div className="text-[10px] font-black text-amber-500/80 uppercase tracking-widest px-1 border-t border-white/5 pt-4">Equipment</div>
                {filterItems(equipment).map(item => (
                    <ResourceCard key={item.id} item={{...item, type: 'equipment'}} onClick={onTapAdd} />
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default ResourceSidebar;
