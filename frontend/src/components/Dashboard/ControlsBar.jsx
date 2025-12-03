import React from 'react';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';

const ControlsBar = ({ searchTerm, setSearchTerm, sortBy, setSortBy, sortOrder, setSortOrder }) => {
  return (
    <div className="flex flex-wrap gap-4 mb-6 items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search across all entities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-stone-900/60 backdrop-blur-md border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder-gray-500 shadow-sm"
        />
      </div>

      {/* Sort */}
      <div className="relative">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="appearance-none px-4 py-3 pr-8 bg-stone-900/60 backdrop-blur-md border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer shadow-sm min-w-[160px]"
        >
          <option value="name" className="bg-stone-900">Sort by Name</option>
          <option value="createdAt" className="bg-stone-900">Sort by Date</option>
          <option value="value" className="bg-stone-900">Sort by Value</option>
          <option value="status" className="bg-stone-900">Sort by Status</option>
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <ChevronDown size={14} />
        </div>
      </div>

      {/* Sort Order */}
      <button
        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        className="px-4 py-3 bg-stone-900/60 backdrop-blur-md border border-white/10 rounded-xl text-white text-sm hover:bg-stone-800/80 transition-colors flex items-center gap-2 shadow-sm"
      >
        {sortOrder === 'asc' ? <ChevronUp size={16} className="text-indigo-400" /> : <ChevronDown size={16} className="text-indigo-400" />}
        <span className="hidden sm:inline font-medium">{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
      </button>
    </div>
  );
};

export default ControlsBar;
