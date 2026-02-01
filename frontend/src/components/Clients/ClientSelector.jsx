import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Briefcase, Plus, X, Loader2, Save, ArrowLeft } from 'lucide-react';
import { api } from '../../utils/api';

const ClientSelector = ({ onSelect, selectedClient, className = '' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // Create Mode State
  const [isCreating, setIsCreating] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', company: '', email: '', phone: '' });
  const [createLoading, setCreateLoading] = useState(false);

  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsCreating(false); // Reset create mode on close
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
    setIsCreating(false); // Reset create mode if typing
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

  const handleCreateClient = async (e) => {
      e.preventDefault();
      if (!newClient.name) return;

      setCreateLoading(true);
      try {
          const res = await api.post('/clients', newClient);
          onSelect(res.data);
          setQuery(res.data.name);
          setIsOpen(false);
          setIsCreating(false);
          setNewClient({ name: '', company: '', email: '', phone: '' });
      } catch (err) {
          console.error("Failed to create client", err);
          alert("Failed to create client");
      } finally {
          setCreateLoading(false);
      }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
                type="text" 
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => {
                    setIsOpen(true);
                    if (query.length >= 2) handleSearch(query);
                }}
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

        {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-white/10 rounded-xl shadow-xl max-h-80 overflow-y-auto custom-scrollbar animate-fade-in">
                {isCreating ? (
                    <div className="p-4 space-y-3 bg-slate-800/50">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-xs font-black text-white uppercase tracking-wider">New Client</h4>
                            <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-white"><ArrowLeft size={14}/></button>
                        </div>
                        <input 
                            type="text" placeholder="Name *" 
                            value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})}
                            className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                            autoFocus
                        />
                        <input 
                            type="text" placeholder="Company" 
                            value={newClient.company} onChange={e => setNewClient({...newClient, company: e.target.value})}
                            className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <input 
                                type="email" placeholder="Email" 
                                value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})}
                                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                            />
                            <input 
                                type="text" placeholder="Phone" 
                                value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})}
                                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                            />
                        </div>
                        <button 
                            onClick={handleCreateClient}
                            disabled={createLoading || !newClient.name}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {createLoading ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>} Save Client
                        </button>
                    </div>
                ) : (
                    <>
                        {results.length > 0 ? (
                            results.map(client => (
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
                            ))
                        ) : (
                            query.length >= 2 && !loading && (
                                <div className="p-4 text-center text-slate-500 text-sm border-b border-white/5">
                                    No clients found.
                                </div>
                            )
                        )}
                        
                        {/* Always visible 'Create' button at the bottom */}
                        <button 
                            onClick={() => { setIsCreating(true); setNewClient(prev => ({...prev, name: query})); }}
                            className="w-full p-3 bg-indigo-600/10 hover:bg-indigo-600 hover:text-white text-indigo-400 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                        >
                            <Plus size={14} /> Create New Client
                        </button>
                    </>
                )}
            </div>
        )}
    </div>
  );
};

export default ClientSelector;
