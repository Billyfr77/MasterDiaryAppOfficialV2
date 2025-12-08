/*
 * MasterDiaryApp Official - Pinnacle Intelligent Reports
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 * 
 * The Ultimate Data Hub: Search, Filter, and Export anything in the system.
 * ENHANCED: Slide-over Inspector, Range Sliders, & Document Control.
 */

import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { 
  Search, Filter, Calendar, FileText, Download, Sliders, 
  ChevronDown, X, Layers, Briefcase, Zap, Clock, Shield,
  DollarSign, Users, Eye, ArrowRight, Tag, AlertTriangle,
  Plus, Printer, Share2, MoreVertical, XCircle
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const PinnacleIntelligentReports = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // --- STATE ---
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchMeta, setSearchMeta] = useState({ total: 0, queryTime: '0ms' });
  
  // UI State
  const [selectedItem, setSelectedItem] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // Advanced Filters
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    dateRange: 'all',
    minVal: 0,
    maxVal: 50000, 
    tags: []
  });

  // --- INITIAL LOAD & DEBOUNCED SEARCH ---
  useEffect(() => {
    // Check for a documentId in URL params to auto-open inspector
    const docId = searchParams.get('documentId');
    if (docId) {
        const fetchAndSelectDoc = async () => {
            try {
                const res = await api.get(`/reports/search?query=${docId}&type=DOCUMENT`);
                if (res.data.data.length > 0) {
                    setSelectedItem(res.data.data[0]);
                    setIsInspectorOpen(true);
                }
            } catch (error) {
                console.error('Failed to auto-select document:', error);
            }
        };
        fetchAndSelectDoc();
    }

    const timer = setTimeout(() => {
      if (query.length > 1 || filters.type || filters.status !== '' || filters.dateRange !== 'all' || filters.minVal > 0 || filters.maxVal < 50000) {
         executeSearch();
      } else if (!query && !filters.type && !filters.status) {
         executeSearch(); 
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query, filters, searchParams]);

  const executeSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append('query', query);
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);
      if (filters.dateRange !== 'all') params.append('dateRange', filters.dateRange);
      if (filters.minVal > 0) params.append('minVal', filters.minVal);
      if (filters.maxVal < 50000) params.append('maxVal', filters.maxVal);
      
      const res = await api.get(`/reports/search?${params.toString()}`);
      setResults(res.data.data);
      setSearchMeta(res.data.meta);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  };

  // --- ACTIONS ---
  const resetFilters = () => {
      setFilters({ type: '', status: '', dateRange: 'all', minVal: 0, maxVal: 50000, tags: [] });
      setQuery('');
      setSearchParams({}); // Clear URL params too
  };

  const handleItemClick = (item) => {
      setSelectedItem(item);
      setIsInspectorOpen(true);
  };

  const handleCloseInspector = () => {
      setIsInspectorOpen(false);
      setTimeout(() => setSelectedItem(null), 300);
      setSearchParams({}); // Clear documentId from URL when closing inspector
  };

  const handleOpenFull = (item) => {
      if (!item) return;
      if (item.type === 'DIARY') navigate('/diary', { state: { diaryId: item.id, date: item.date } });
      else if (item.type === 'INVOICE') navigate(`/invoices`, { state: { invoiceId: item.id } });
      else if (item.type === 'QUOTE') navigate(`/quotes/builder/${item.id}`);
      else if (item.type === 'DOCUMENT') navigate(`/reports/edit/${item.id}`);
      else navigate(item.link);
  };

  const handleCreateNewDocument = () => {
      navigate('/reports/new');
  };

  const handleExportView = () => {
    const doc = new jsPDF();
    const tableColumn = ["Type", "Title", "Subtitle", "Value", "Date"];
    const tableRows = [];

    results.forEach(item => {
        const itemValue = item.value ? `$${parseFloat(item.value).toLocaleString()}` : 'N/A';
        tableRows.push([
            item.type,
            item.title,
            item.subtitle,
            itemValue,
            new Date(item.date).toLocaleDateString()
        ]);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3, textColor: [30, 41, 59] }, // Slate-800 for text
        columnStyles: {
            0: { cellWidth: 20 }, // Type
            1: { cellWidth: 60 }, // Title
            2: { cellWidth: 50 }, // Subtitle
            3: { cellWidth: 25, halign: 'right' }, // Value
            4: { cellWidth: 25, halign: 'right' }, // Date
        }
    });

    const filename = `Report_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  const getTypeIcon = (type) => {
      switch (type) {
          case 'PROJECT': return <Briefcase size={20} className="text-blue-400" />;
          case 'INVOICE': return <FileText size={20} className="text-emerald-400" />;
          case 'DOCUMENT': return <Layers size={20} className="text-purple-400" />;
          case 'DIARY': return <Clock size={20} className="text-amber-400" />;
          case 'QUOTE': return <DollarSign size={20} className="text-emerald-400" />;
          case 'CLIENT': return <Users size={20} className="text-blue-400" />;
          case 'RESOURCE': return <Zap size={20} className="text-amber-400" />;
          default: return <Zap size={20} className="text-gray-400" />;
      }
  };

  // --- RENDERERS ---

  const renderFiltersPanel = () => (
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showFilters ? 'max-h-96 opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'}`}>
          <div className="bg-stone-900/40 border-t border-white/5 p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
              
              {/* Status */}
              <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-3">Status</label>
                  <select 
                      value={filters.status} 
                      onChange={(e) => setFilters({...filters, status: e.target.value})}
                      className="w-full bg-stone-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 outline-none transition-colors"
                  >
                      <option value="">Any Status</option>
                      <option value="active">Active / Open</option>
                      <option value="draft">Draft / Pending</option>
                      <option value="completed">Completed / Paid</option>
                      <option value="archived">Archived</option>
                      <option value="sent">Sent</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                      <option value="rejected">Rejected</option>
                      <option value="cancelled">Cancelled</option>
                  </select>
              </div>

              {/* Date Range */}
              <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-3">Timeframe</label>
                  <select 
                      value={filters.dateRange} 
                      onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                      className="w-full bg-stone-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 outline-none transition-colors"
                  >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">Last 7 Days</option>
                      <option value="month">Last 30 Days</option>
                      <option value="quarter">Last 90 Days</option>
                      <option value="year">This Year</option>
                  </select>
              </div>

              {/* Enhanced Value Range Slider */}
              <div className="md:col-span-2 px-2">
                  <div className="flex justify-between mb-3">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase">Value Range</label>
                      <span className="text-[10px] font-mono font-bold text-indigo-400">
                          ${filters.minVal.toLocaleString()} - ${filters.maxVal >= 50000 ? '50k+' : filters.maxVal.toLocaleString()}
                      </span>
                  </div>
                  <div className="relative h-2 bg-stone-800 rounded-full mt-2">
                      {/* Range Track */}
                      <div 
                          className="absolute h-full bg-indigo-500 rounded-full opacity-50"
                          style={{ 
                              left: `${(filters.minVal / 50000) * 100}%`, 
                              right: `${100 - (filters.maxVal / 50000) * 100}%` 
                          }}
                      />
                      {/* Min Thumb */}
                      <input 
                          type="range" 
                          min="0" max="50000" step="1000"
                          value={filters.minVal}
                          onChange={(e) => {
                              const val = Math.min(Number(e.target.value), filters.maxVal - 1000);
                              setFilters({...filters, minVal: val});
                          }}
                          className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      {/* Max Thumb */}
                      <input 
                          type="range" 
                          min="0" max="50000" step="1000"
                          value={filters.maxVal}
                          onChange={(e) => {
                              const val = Math.max(Number(e.target.value), filters.minVal + 1000);
                              setFilters({...filters, maxVal: val});
                          }}
                          className="absolute w-full h-full opacity-0 cursor-pointer z-20"
                      />
                      
                      {/* Visual Thumbs */}
                      <div 
                          className="absolute w-4 h-4 bg-white rounded-full shadow-lg -mt-1 pointer-events-none transition-all"
                          style={{ left: `${(filters.minVal / 50000) * 100}%`, transform: 'translateX(-50%)' }}
                      />
                      <div 
                          className="absolute w-4 h-4 bg-white rounded-full shadow-lg -mt-1 pointer-events-none transition-all"
                          style={{ left: `${(filters.maxVal / 50000) * 100}%`, transform: 'translateX(-50%)' }}
                      />
                  </div>
              </div>
          </div>
      </div>
  );

  const renderPreviewContent = () => {
      if (!selectedItem) return (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-50">
              <Layers size={64} className="mb-4" />
              <p className="text-lg font-bold">Select an item to preview</p>
          </div>
      );

      return (
          <div className="animate-fade-in space-y-6 flex flex-col h-full">
              {/* Header */}
              <div className="flex items-start gap-4 pb-6 border-b border-white/10">
                  <div className="p-4 rounded-2xl bg-stone-800 border border-white/10 shrink-0">
                      {getTypeIcon(selectedItem.type)}
                  </div>
                  <div className="min-w-0">
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1 block">{selectedItem.type} Record</span>
                      <h2 className="text-2xl font-black text-white leading-tight mb-2 line-clamp-2" title={selectedItem.title}>{selectedItem.title}</h2>
                      <div className="flex flex-wrap gap-2">
                          <StatusBadge status={selectedItem.status} />
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-white/10 text-gray-300 border border-white/5 whitespace-nowrap">
                              {selectedItem.subType}
                          </span>
                          <span className="text-sm text-gray-400 truncate">{selectedItem.subtitle}</span>
                      </div>
                  </div>
              </div>

              {/* Value Card */}
              {selectedItem.value && (
                  <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex justify-between items-center shadow-lg">
                      <div>
                          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Total Value</div>
                          <div className="text-3xl font-mono font-black text-white tracking-tight">${parseFloat(selectedItem.value).toLocaleString()}</div>
                      </div>
                      <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
                          <DollarSign size={24} />
                      </div>
                  </div>
              )}

              {/* Details Grid */}
              <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <FileText size={16} className="text-gray-500"/> Details
                  </h3>
                  <div className="bg-stone-800/50 rounded-2xl p-4 border border-white/5 space-y-3">
                      <DetailRow label="System ID" value={selectedItem.id} copyable />
                      <DetailRow label="Date Created" value={new Date(selectedItem.date).toLocaleString()} />
                      <DetailRow label="Primary Reference" value={selectedItem.subtitle} />
                      {selectedItem.relatedModel && <DetailRow label="Related To" value={`${selectedItem.relatedModel} (ID: ${selectedItem.relatedId?.substring(0,8)}...)`} />}
                  </div>
              </div>

              {/* Tags */}
              {selectedItem.tags && selectedItem.tags.length > 0 && (
                  <div className="space-y-3">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <Tag size={16} className="text-gray-500"/> Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                          {selectedItem.tags.map((tag, i) => (
                              <span key={i} className="px-3 py-1.5 rounded-lg bg-stone-800 text-xs font-bold text-gray-300 border border-white/5 hover:border-indigo-500/50 transition-colors cursor-default">
                                # {tag}
                              </span>
                          ))}
                      </div>
                  </div>
              )}
              
              {/* DOCUMENT CONTENT PREVIEW (For Document Type) */}
              {selectedItem.type === 'DOCUMENT' && selectedItem.content && (
                 <div className="space-y-3">
                     <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                         <FileText size={16} className="text-gray-500"/> Content Preview
                     </h3>
                     <div className="bg-stone-800/50 rounded-2xl p-4 border border-white/5 text-sm text-gray-300 max-h-48 overflow-y-auto custom-scrollbar">
                         <p>{selectedItem.content}</p>
                     </div>
                 </div>
              )}

              {/* Actions */}
              <div className="pt-6 mt-auto">
                 <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4">
                      <Zap size={16} className="text-amber-400"/> Quick Actions
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                      <button className="p-3 bg-stone-800 hover:bg-stone-700 rounded-xl border border-white/5 flex flex-col items-center gap-2 transition-all group">
                          <Printer size={20} className="text-gray-400 group-hover:text-white" />
                          <span className="text-xs font-bold text-gray-400 group-hover:text-white">Print</span>
                      </button>
                      <button className="p-3 bg-stone-800 hover:bg-stone-700 rounded-xl border border-white/5 flex flex-col items-center gap-2 transition-all group">
                          <Share2 size={20} className="text-gray-400 group-hover:text-white" />
                          <span className="text-xs font-bold text-gray-400 group-hover:text-white">Share</span>
                      </button>
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="min-h-screen p-4 md:p-8 font-sans text-gray-100 bg-transparent animate-fade-in pb-20 relative overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6 z-10 relative">
        <div>
           <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 tracking-tight flex items-center gap-3 animate-gradient-x">
             <Layers size={36} className="text-indigo-400" />
             INTELLIGENT REPORTS
           </h1>
           <p className="text-gray-400 font-medium text-lg mt-2">Centralized Data Control Hub</p>
        </div>
        <div className="flex gap-3">
            <button onClick={resetFilters} className="px-4 py-2.5 text-gray-400 hover:text-white font-bold text-xs uppercase tracking-wider transition-colors">
                Reset
            </button>
            <div className="h-8 w-px bg-white/10 my-auto"></div>
            <button onClick={handleCreateNewDocument} className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 border border-white/10 rounded-xl hover:border-indigo-500/50 transition-all font-bold text-sm shadow-lg hover:-translate-y-0.5">
                <Plus size={16} className="text-emerald-400" /> New Record
            </button>
            <button onClick={handleExportView} className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 border border-white/10 rounded-xl hover:border-indigo-500/50 transition-all font-bold text-sm shadow-lg hover:-translate-y-0.5">
                <Download size={16} /> Export
            </button>
        </div>
      </div>

      <div className="flex gap-6 h-[calc(100vh-200px)] relative">
          
          {/* MAIN CONTENT AREA */}
          <div className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ${isInspectorOpen ? 'lg:mr-[420px]' : ''}`}>
              
              {/* FILTER BAR CONTAINER */}
              <div className="bg-stone-900/80 backdrop-blur-xl border border-white/10 rounded-3xl mb-6 shadow-2xl overflow-hidden transition-all relative z-10">
                  <div className="p-4 flex flex-col md:flex-row gap-4">
                      <div className="flex-1 relative group">
                          <Search className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
                          <input 
                            type="text" 
                            placeholder="Search projects, quotes, invoices, clients..." 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-indigo-500 focus:bg-black/30 outline-none text-lg font-medium transition-all"
                            autoFocus
                          />
                      </div>
                      <div className="flex gap-3">
                        <div className="relative">
                          <select 
                            value={filters.type} 
                            onChange={(e) => setFilters({...filters, type: e.target.value})}
                            className="h-full bg-black/20 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-white focus:border-indigo-500 outline-none cursor-pointer appearance-none font-bold text-sm min-w-[150px] transition-all hover:bg-black/30"
                          >
                              <option value="" className="bg-stone-900">All Types</option>
                              <option value="PROJECT" className="bg-stone-900">Projects</option>
                              <option value="QUOTE" className="bg-stone-900">Quotes</option>
                              <option value="INVOICE" className="bg-stone-900">Invoices</option>
                              <option value="DIARY" className="bg-stone-900">Diaries</option>
                              <option value="CLIENT" className="bg-stone-900">Clients</option>
                              <option value="RESOURCE" className="bg-stone-900">Resources</option>
                              <option value="DOCUMENT" className="bg-stone-900">Documents</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
                        </div>
                        <button 
                          onClick={() => setShowFilters(!showFilters)}
                          className={`px-4 py-3 rounded-xl border transition-all flex items-center gap-2 font-bold shadow-lg ${showFilters ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-black/20 border-white/10 text-gray-400 hover:text-white hover:bg-black/30'}`}
                          title="Toggle Advanced Filters"
                        >
                            <Sliders size={18} />
                        </button>
                      </div>
                  </div>
                  
                  {/* EXPANDABLE FILTERS */}
                  {renderFiltersPanel()}
                  
                  {/* Quick Filter Badges */}
                  {!showFilters && (
                    <div className="px-4 pb-4 flex flex-wrap gap-2 animate-fade-in">
                        <FilterBadge label="Active Projects" onClick={() => { setFilters({...filters, type: 'PROJECT', status: 'active'}); }} active={filters.type === 'PROJECT' && filters.status === 'active'} />
                        <FilterBadge label="Recent Quotes" onClick={() => { setFilters({...filters, type: 'QUOTE', dateRange: 'month'}); }} active={filters.type === 'QUOTE' && filters.dateRange === 'month'} />
                        <FilterBadge label="High Value > $10k" onClick={() => { setFilters({...filters, minVal: 10000}); }} active={filters.minVal === 10000} />
                        {filters.status && <div className="px-3 py-1 rounded-lg text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-2 cursor-pointer hover:bg-indigo-500/30 transition-colors" onClick={() => setFilters({...filters, status: ''})}>Status: {filters.status} <X size={12} /></div>}
                    </div>
                  )}
              </div>

              {/* RESULTS LIST */}
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 pb-20">
                  <div className="flex justify-between items-center px-2 mb-2 sticky top-0 bg-transparent z-10 py-2 backdrop-blur-sm rounded-xl">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{searchMeta.total} Records Found ({searchMeta.queryTime})</span>
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
                         <Shield size={10} className="text-emerald-500" /> Secure Database
                      </span>
                  </div>

                  {loading ? (
                      <div className="py-20 flex flex-col items-center justify-center space-y-4">
                          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm font-mono text-indigo-400 animate-pulse">Querying Database...</span>
                      </div>
                  ) : results.length > 0 ? (
                      results.map((item) => (
                          <div 
                            key={`${item.type}-${item.id}`}
                            onClick={() => handleItemClick(item)}
                            className={`
                                group border rounded-2xl p-4 flex items-center justify-between transition-all cursor-pointer shadow-md hover:shadow-xl
                                ${selectedItem?.id === item.id 
                                    ? 'bg-gradient-to-r from-indigo-900/40 to-stone-900/80 border-indigo-500/50 shadow-indigo-500/10 scale-[1.01]' 
                                    : 'bg-stone-900/60 border-white/5 hover:bg-stone-800 hover:border-indigo-500/30'}
                            `}
                          >
                              <div className="flex items-center gap-5 overflow-hidden">
                                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center border shrink-0 transition-all shadow-inner ${selectedItem?.id === item.id ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-black/30 border-white/5 text-gray-400 group-hover:text-white group-hover:bg-stone-700'}`}>
                                      {getTypeIcon(item.type)}
                                  </div>
                                  <div className="min-w-0">
                                      <h3 className={`font-bold text-lg truncate transition-colors ${selectedItem?.id === item.id ? 'text-indigo-300' : 'text-white group-hover:text-indigo-300'}`}>{item.title}</h3>
                                      <p className="text-xs text-gray-500 font-medium truncate flex items-center gap-2">
                                          <span className="uppercase tracking-wider opacity-70">{item.type}</span>
                                          <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                          {item.subtitle}
                                      </p>
                                  </div>
                              </div>

                              <div className="flex items-center gap-4 sm:gap-8 shrink-0">
                                  {item.value && (
                                      <div className="text-right hidden sm:block">
                                          <div className="text-[10px] font-bold text-gray-600 uppercase">Value</div>
                                          <div className="text-sm font-mono font-bold text-gray-300 group-hover:text-emerald-400 transition-colors">${parseFloat(item.value).toLocaleString()}</div>
                                      </div>
                                  )}
                                  <div className="text-right min-w-[80px]">
                                      <div className="text-[10px] font-bold text-gray-600 uppercase">Updated</div>
                                      <div className="text-sm font-medium text-gray-400">{new Date(item.date).toLocaleDateString()}</div>
                                  </div>
                                  <div className={`p-2 rounded-full transition-all ${selectedItem?.id === item.id ? 'bg-indigo-500 text-white' : 'bg-white/5 text-gray-600 group-hover:bg-white/10 group-hover:text-white'}`}>
                                      <ChevronDown className={`transition-transform duration-300 ${selectedItem?.id === item.id ? '-rotate-90' : 'rotate-90'}`} size={16} />
                                  </div>
                              </div>
                          </div>
                      ))
                  ) : (
                      <div className="py-24 text-center text-gray-500 flex flex-col items-center bg-stone-900/30 rounded-3xl border border-white/5 border-dashed">
                          <Search size={64} className="mb-6 opacity-10" />
                          <h3 className="text-lg font-bold text-gray-400 mb-2">No Records Found</h3>
                          <p className="text-sm opacity-60">Try adjusting your filters or search query.</p>
                          <button onClick={resetFilters} className="mt-6 px-6 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-sm font-bold transition-colors">Clear Filters</button>
                      </div>
                  )}
              </div>
          </div>

          {/* RIGHT: Slide-over Inspector (Drawer) */}
          <div 
             className={`
                fixed inset-y-0 right-0 w-full lg:w-[450px] bg-stone-900/95 backdrop-blur-2xl border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-50 transform transition-transform duration-500 ease-out
                ${isInspectorOpen ? 'translate-x-0' : 'translate-x-full'}
             `}
          >
              {selectedItem ? (
                  <div className="h-full flex flex-col">
                      {/* Header */}
                      <div className="p-6 border-b border-white/10 flex justify-between items-start bg-gradient-to-b from-white/5 to-transparent">
                          <div className="flex gap-4">
                              <div className="p-3 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/30 text-white mt-1">
                                  {getTypeIcon(selectedItem.type)}
                              </div>
                              <div>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1 block">{selectedItem.type} Record</span>
                                  <h2 className="text-2xl font-black text-white leading-tight mb-2 line-clamp-2">{selectedItem.title}</h2>
                                  <div className="flex flex-wrap gap-2">
                                      <StatusBadge status={selectedItem.status} />
                                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-white/10 text-gray-300 border border-white/5 whitespace-nowrap">
                                          {selectedItem.subType}
                                      </span>
                                  </div>
                              </div>
                          </div>
                          <button onClick={handleCloseInspector} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                              <X size={24} />
                          </button>
                      </div>

                      {/* Content Scroll */}
                      <div className="flex-1 overflow-y-auto p-6 space-y-6">
                          
                          {/* Value Card */}
                          {selectedItem.value && (
                              <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex justify-between items-center shadow-lg">
                                  <div>
                                      <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Total Value</div>
                                      <div className="text-3xl font-mono font-black text-white tracking-tight">${parseFloat(selectedItem.value).toLocaleString()}</div>
                                  </div>
                                  <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
                                      <DollarSign size={24} />
                                  </div>
                              </div>
                          )}

                          {/* Details Grid */}
                          <div className="space-y-4">
                              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                  <FileText size={16} className="text-gray-500"/> Details
                              </h3>
                              <div className="bg-stone-800/50 rounded-2xl p-4 border border-white/5 space-y-3">
                                  <DetailRow label="System ID" value={selectedItem.id} copyable />
                                  <DetailRow label="Date Created" value={new Date(selectedItem.date).toLocaleString()} />
                                  <DetailRow label="Primary Reference" value={selectedItem.subtitle} />
                                  {selectedItem.relatedModel && <DetailRow label="Related To" value={`${selectedItem.relatedModel} (ID: ${selectedItem.relatedId?.substring(0,8)}...)`} />}
                              </div>
                          </div>

                          {/* Tags */}
                          {selectedItem.tags && selectedItem.tags.length > 0 && (
                              <div className="space-y-3">
                                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                      <Tag size={16} className="text-gray-500"/> Tags
                                  </h3>
                                  <div className="flex flex-wrap gap-2">
                                      {selectedItem.tags.map((tag, i) => (
                                          <span key={i} className="px-3 py-1.5 rounded-lg bg-stone-800 text-xs font-bold text-gray-300 border border-white/5 hover:border-indigo-500/50 transition-colors cursor-default">
                                            # {tag}
                                          </span>
                                      ))}
                                  </div>
                              </div>
                          )}
                          
                          {/* DOCUMENT CONTENT PREVIEW (For Document Type) */}
                          {selectedItem.type === 'DOCUMENT' && selectedItem.content && (
                             <div className="space-y-3">
                                 <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                     <FileText size={16} className="text-gray-500"/> Content Preview
                                 </h3>
                                 <div className="bg-stone-800/50 rounded-2xl p-4 border border-white/5 text-sm text-gray-300 max-h-48 overflow-y-auto custom-scrollbar">
                                     <p>{selectedItem.content}</p>
                                 </div>
                             </div>
                          )}

                          {/* Actions */}
                          <div className="pt-6">
                             <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4">
                                  <Zap size={16} className="text-amber-400"/> Quick Actions
                              </h3>
                              <div className="grid grid-cols-2 gap-3">
                                  <button className="p-3 bg-stone-800 hover:bg-stone-700 rounded-xl border border-white/5 flex flex-col items-center gap-2 transition-all group">
                                      <Printer size={20} className="text-gray-400 group-hover:text-white" />
                                      <span className="text-xs font-bold text-gray-400 group-hover:text-white">Print</span>
                                  </button>
                                  <button className="p-3 bg-stone-800 hover:bg-stone-700 rounded-xl border border-white/5 flex flex-col items-center gap-2 transition-all group">
                                      <Share2 size={20} className="text-gray-400 group-hover:text-white" />
                                      <span className="text-xs font-bold text-gray-400 group-hover:text-white">Share</span>
                                  </button>
                              </div>
                          </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="p-6 border-t border-white/10 bg-stone-900 z-10">
                          <button 
                              onClick={() => handleOpenFull(selectedItem)}
                              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-black shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 group active:scale-95 text-lg tracking-wide"
                          >
                              OPEN FULL RECORD <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                          </button>
                      </div>
                  </div>
              ) : (
                  <div className="h-full flex items-center justify-center">
                      <div className="w-10 h-10 border-4 border-white/10 border-t-white rounded-full animate-spin"></div>
                  </div>
              )}
          </div>
          
          {/* Backdrop for Mobile */}
          {isInspectorOpen && (
              <div 
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
                  onClick={handleCloseInspector}
              />
          )}

      </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const FilterBadge = ({ label, active, onClick }) => (
    <button 
        onClick={onClick}
        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide border transition-all ${active ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-stone-800 border-white/10 text-gray-400 hover:text-white hover:border-white/30'}`}
    >
        {label}
    </button>
);

const DetailRow = ({ label, value, copyable }) => (
    <div className="flex justify-between items-center py-3 border-b border-white/5 last:border-0 group">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</span>
        <span className={`text-sm font-medium text-gray-200 text-right ${copyable ? 'font-mono' : ''}`}>{value || '-'}</span>
    </div>
);

const StatusBadge = ({ status }) => {
    let color = 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    const s = status?.toLowerCase() || '';
    
    if (['active', 'paid', 'approved', 'final', 'completed', 'sent'].includes(s)) color = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    else if (['draft', 'pending', 'in progress'].includes(s)) color = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    else if (['overdue', 'rejected', 'cancelled'].includes(s)) color = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    else if (['archived'].includes(s)) color = 'bg-stone-500/10 text-stone-400 border-stone-500/20';

    return (
        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${color}`}>
            {status || 'Unknown'}
        </span>
    );
};

export default PinnacleIntelligentReports;
