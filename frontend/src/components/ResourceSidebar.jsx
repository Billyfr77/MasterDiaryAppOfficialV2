import React, { useState } from 'react';
import { Search, User, Wrench, Package, X, GripVertical, Box, Zap, Clock, Activity, AlertTriangle, Ruler, Image as ImageIcon, Layout, Circle, Award, DollarSign } from 'lucide-react';

const ResourceCard = ({ item, onClick, onDragStart, themeColor }) => {
  let wrapperClass = `bg-gradient-to-r from-${themeColor}-900/10 to-transparent border-${themeColor}-500/20 hover:border-${themeColor}-400 hover:bg-${themeColor}-900/30 hover:shadow-lg hover:shadow-${themeColor}-500/10`;
  let iconClass = `bg-${themeColor}-500/20 text-${themeColor}-400`;
  let icon = <Package size={16} />;

  if (item.type === 'staff') {
    wrapperClass = `bg-gradient-to-r from-emerald-900/10 to-transparent border-emerald-500/20 hover:border-emerald-400 hover:bg-emerald-900/30 hover:shadow-lg hover:shadow-emerald-500/10`;
    iconClass = "bg-emerald-500/20 text-emerald-400";
    icon = <User size={16} />;
  } else if (item.type === 'equipment') {
    wrapperClass = `bg-gradient-to-r from-amber-900/10 to-transparent border-amber-500/20 hover:border-amber-400 hover:bg-amber-900/30 hover:shadow-lg hover:shadow-amber-500/10`;
    iconClass = "bg-amber-500/20 text-amber-400";
    icon = <Wrench size={16} />;
  } else if (['zone', 'taskNode', 'neuralPrism', 'chronos', 'wormhole', 'delay', 'impact', 'dimension', 'shapeNode', 'photoNode', 'allowance', 'areaNode', 'quoteMaterial', 'quoteLabour', 'profitNode', 'estimationPrism'].includes(item.type)) {
    wrapperClass = `bg-gradient-to-r from-purple-900/10 to-transparent border-purple-500/20 hover:border-purple-400 hover:bg-purple-900/30 hover:shadow-lg hover:shadow-purple-500/10`;
    iconClass = "bg-purple-500/20 text-purple-400";
    if (item.type === 'zone') icon = <Box size={16} />;
    else if (item.type === 'taskNode') icon = <Layout size={16} />;
    else if (item.type === 'neuralPrism') icon = <Zap size={16} />;
    else if (item.type === 'chronos') icon = <Clock size={16} />;
    else if (item.type === 'wormhole') icon = <Circle size={16} />;
    else if (item.type === 'delay') icon = <Clock size={16} />;
    else if (item.type === 'impact') icon = <Activity size={16} />;
    else if (item.type === 'dimension') icon = <Ruler size={16} />;
    else if (item.type === 'areaNode') icon = <Ruler size={16} className="text-cyan-400" />;
    else if (item.type === 'quoteMaterial') icon = <Package size={16} className="text-indigo-400" />;
    else if (item.type === 'quoteLabour') icon = <User size={16} className="text-emerald-400" />;
    else if (item.type === 'profitNode') icon = <DollarSign size={16} className="text-amber-400" />;
    else if (item.type === 'estimationPrism') icon = <Zap size={16} className="text-indigo-400" />;
    else if (item.type === 'shapeNode') icon = <Box size={16} />;
    else if (item.type === 'photoNode') icon = <ImageIcon size={16} />;
    else if (item.type === 'allowance') icon = <Award size={16} />;
  }

  const handleDragStart = (e) => {
      if (onDragStart) onDragStart(e, item);
      else {
          const safeItem = {
              id: item.id,
              name: item.name,
              type: item.type,
              pricePerUnit: item.pricePerUnit || 0,
              chargeRate: item.chargeRate || item.chargeOutBase || 0,
              costRate: item.costRate || item.costRateBase || 0,
              category: item.category || 'General'
          };
          const jsonItem = JSON.stringify(safeItem);
          e.dataTransfer.setData('application/reactflow', jsonItem);
          e.dataTransfer.setData('text/plain', jsonItem);
          e.dataTransfer.effectAllowed = 'copy';
      }
  };

  return (
    <div 
        draggable 
        onDragStart={handleDragStart} 
        onClick={() => onClick && onClick(item)}
        className={`group relative flex items-center gap-3 p-3 rounded-xl border cursor-grab active:cursor-grabbing transition-all duration-300 hover:scale-[1.02] ${wrapperClass}`}
    >
      <div className={`p-2 rounded-lg ${iconClass} group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-gray-200 truncate group-hover:text-white transition-colors">{item.name}</div>
        <div className="text-[10px] text-gray-500 font-mono mt-0.5">
            {item.type === 'staff' ? `$${item.chargeRate || item.chargeOutBase || 0}/hr` : 
             item.type === 'equipment' ? `$${item.costRate || item.costRateBase || 0}/day` : 
             item.type === 'material' ? `$${item.pricePerUnit || 0}/unit` :
             'System Node'}
        </div>
      </div>
      <GripVertical size={14} className={`text-${themeColor}-500 opacity-0 group-hover:opacity-100 transition-opacity`} />
    </div>
  );
};

const ResourceSidebar = ({ materials = [], staff = [], equipment = [], onSearch, onTapAdd, isOpen, onClose, theme = 'indigo', mode = 'diary' }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [localSearch, setLocalSearch] = useState('');

  const themeColor = theme; 

  const handleSearch = (e) => {
      setLocalSearch(e.target.value);
      if (onSearch) onSearch(e.target.value);
  };

  const filterItems = (items) => items.filter(i => i.name.toLowerCase().includes(localSearch.toLowerCase()));

  const specialNodes = mode === 'quote' ? [
      { id: 'prism-est', name: 'Estimation Prism', type: 'estimationPrism', category: 'logic' },
      { id: 'area-proto', name: 'Area Node', type: 'areaNode', category: 'logic' },
      { id: 'qmat-proto', name: 'Material Yield', type: 'quoteMaterial', category: 'logic' },
      { id: 'qlab-proto', name: 'Labour Estimator', type: 'quoteLabour', category: 'logic' },
      { id: 'profit-proto', name: 'Profit Node', type: 'profitNode', category: 'logic' },
      { id: 'zone-proto', name: 'Zone Container', type: 'zone', category: 'logic' },
      { id: 'dim-proto', name: 'Dimension', type: 'dimension', category: 'logic' },
      { id: 'shape-proto', name: 'Shape', type: 'shapeNode', category: 'logic' },
      { id: 'photo-proto', name: 'Photo Plane', type: 'photoNode', category: 'logic' },
  ] : [
      { id: 'prism-proto', name: 'Neural Prism', type: 'neuralPrism', category: 'logic' },
      { id: 'zone-proto', name: 'Zone Container', type: 'zone', category: 'logic' },
      { id: 'task-proto', name: 'Task Unit', type: 'taskNode', category: 'logic' },
      { id: 'chronos-proto', name: 'Chronos Hub', type: 'chronos', category: 'logic' },
      { id: 'delay-proto', name: 'Delay Event', type: 'delay', category: 'logic' },
      { id: 'impact-proto', name: 'Impact Node', type: 'impact', category: 'logic' },
      { id: 'allowance-proto', name: 'Allowance', type: 'allowance', category: 'logic' },
      { id: 'wormhole-proto', name: 'Wormhole', type: 'wormhole', category: 'logic' },
      { id: 'dim-proto', name: 'Dimension', type: 'dimension', category: 'logic' },
      { id: 'shape-proto', name: 'Shape', type: 'shapeNode', category: 'logic' },
      { id: 'photo-proto', name: 'Photo Plane', type: 'photoNode', category: 'logic' },
  ];

  return (
    <div className={`
        fixed inset-y-0 left-0 z-50 w-80 backdrop-blur-2xl flex flex-col shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
        lg:relative lg:translate-x-0 lg:z-0 lg:w-full lg:h-full animate-in slide-in-from-left duration-700
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        bg-${themeColor}-950/30 border-r lg:border-none border-${themeColor}-500/20
    `}>
      {/* Header with Rich Gradient */}
      <div className={`p-6 border-b border-${themeColor}-500/20 bg-gradient-to-b from-${themeColor}-900/40 to-transparent`}>
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3 drop-shadow-md">
                <div className={`p-1.5 rounded-lg bg-${themeColor}-500/20 text-${themeColor}-400`}><Package size={16} /></div>
                Library
            </h3>
            <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-white transition-colors"><X size={18} /></button>
        </div>
        
        {/* Search */}
        <div className="relative group mb-6">
            <Search className={`absolute left-4 top-3 text-gray-500 group-focus-within:text-${themeColor}-400 transition-colors duration-300`} size={16} />
            <input 
                type="text" 
                placeholder="Search resources..." 
                value={localSearch} 
                onChange={handleSearch} 
                className={`w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-xs font-bold text-white focus:border-${themeColor}-500 outline-none transition-all placeholder-gray-600 shadow-inner`} 
            />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-black/40 rounded-xl border border-white/5">
            {['all', 'nodes', 'mat', 'lab', 'eqp'].map(tab => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-300 ${activeTab === tab ? `bg-${themeColor}-600 text-white shadow-lg shadow-${themeColor}-900/50 scale-105` : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                >
                    {tab === 'mat' ? 'Mat' : tab === 'lab' ? 'Lab' : tab === 'eqp' ? 'Eqp' : tab === 'nodes' ? 'Nodes' : 'All'}
                </button>
            ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {(activeTab === 'all' || activeTab === 'nodes') && (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className={`text-[9px] font-black text-purple-400 uppercase tracking-[0.3em] px-2 opacity-80`}>System Nodes</div>
                {filterItems(specialNodes).map(item => (
                    <ResourceCard key={item.id} item={item} onClick={onTapAdd} themeColor={themeColor} />
                ))}
            </div>
        )}

        {(activeTab === 'all' || activeTab === 'mat') && (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className={`text-[9px] font-black text-${themeColor}-400 uppercase tracking-[0.3em] px-2 opacity-80`}>Materials</div>
                {filterItems(materials).map(item => (
                    <ResourceCard key={item.id} item={{...item, type: 'material'}} onClick={onTapAdd} themeColor={themeColor} />
                ))}
            </div>
        )}

        {(activeTab === 'all' || activeTab === 'lab') && (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                <div className={`text-[9px] font-black text-emerald-400 uppercase tracking-[0.3em] px-2 opacity-80 border-t border-white/5 pt-4`}>Staff</div>
                {filterItems(staff).map(item => (
                    <ResourceCard key={item.id} item={{...item, type: 'staff'}} onClick={onTapAdd} themeColor={themeColor} />
                ))}
            </div>
        )}

        {(activeTab === 'all' || activeTab === 'eqp') && (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                <div className={`text-[9px] font-black text-amber-400 uppercase tracking-[0.3em] px-2 opacity-80 border-t border-white/5 pt-4`}>Equipment</div>
                {filterItems(equipment).map(item => (
                    <ResourceCard key={item.id} item={{...item, type: 'equipment'}} onClick={onTapAdd} themeColor={themeColor} />
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default ResourceSidebar;