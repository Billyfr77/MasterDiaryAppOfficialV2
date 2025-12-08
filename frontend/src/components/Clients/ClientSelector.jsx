import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Briefcase, Plus, X, Loader2 } from 'lucide-react';
import { api } from '../../utils/api';

const ClientSelector = ({ onSelect, selectedClient, className = '' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedClient) {
      setQuery(selectedClient.name);
    }
  }, [selectedClient]);

  const handleSearch = async (val) => {
    setQuery(val);
    if (val.length < 2) {
        setResults([]);
        return;
    }
    
    setLoading(true);
    setIsOpen(true);
    try {
        const res = await api.get(`/clients/search?query=${val}`);
        setResults(res.data);
    } catch (err) {
        console.error("Client search error", err);
    } finally {
        setLoading(false);
    }
  };

  const handleSelect = (client) => {
      onSelect(client);
      setQuery(client.name);
      setIsOpen(false);
  };

  const clearSelection = (e) => {
      e.stopPropagation();
      onSelect(null);
      setQuery('');
      setResults([]);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
                type="text" 
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => query.length >= 2 && setIsOpen(true)}
                placeholder="Search clients..."
                className="w-full bg-slate-900 border border-white/10 rounded-xl py-2 pl-9 pr-8 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500 animate-spin" size={16} />}
            {!loading && selectedClient && (
                <button onClick={clearSelection} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                    <X size={16} />
                </button>
            )}
        </div>

        {isOpen && results.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-white/10 rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                {results.map(client => (
                    <button 
                        key={client.id}
                        onClick={() => handleSelect(client)}
                        className="w-full text-left p-3 hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors group"
                    >
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-200 group-hover:text-white">{client.name}</span>
                            {client.company && <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{client.company}</span>}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex gap-2">
                             {client.email && <span>{client.email}</span>}
                             {client.phone && <span>• {client.phone}</span>}
                        </div>
                    </button>
                ))}
            </div>
        )}
        
        {isOpen && results.length === 0 && query.length >= 2 && !loading && (
             <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-white/10 rounded-xl shadow-xl p-4 text-center text-slate-500 text-sm">
                 No clients found.
             </div>
        )}
    </div>
  );
};

export default ClientSelector;
