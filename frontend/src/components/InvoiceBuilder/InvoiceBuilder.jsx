import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { 
  FileText, Save, Plus, Trash2, Download, DollarSign, 
  ArrowLeft, Search, Filter, MoreVertical, CheckCircle, 
  Send, AlertTriangle, Printer, Image as ImageIcon, Eye,
  ChevronRight, Info, Loader2, Layers, Folder, X, Building2, User, CreditCard, CheckSquare, Mail, Check, Archive, UploadCloud, Percent, GripVertical
} from 'lucide-react';
import { useInvoiceEngine } from './InvoiceEngine';
import { generatePDF } from './InvoicePDF';
import ClientSelector from '../Clients/ClientSelector';
import { api } from '../../utils/api';
import PremiumLoader from '../ui/PremiumLoader';
import VideoBeacon from '../ui/VideoBeacon';

// --- AUTO SCROLL HOOK ---
const useWindowAutoScroll = () => {
    useEffect(() => {
        const handleDragOver = (e) => {
            const threshold = 100; // px from edge
            const speed = 20;      // px per event
            
            if (e.clientY < threshold) {
                window.scrollBy({ top: -speed, behavior: 'auto' });
            } else if (window.innerHeight - e.clientY < threshold) {
                window.scrollBy({ top: speed, behavior: 'auto' });
            }
        };

        window.addEventListener('dragover', handleDragOver);
        return () => window.removeEventListener('dragover', handleDragOver);
    }, []);
};

const DraggableInvoiceRow = ({ item, index, moveItem, onUpdate, onRemove }) => {
    const ref = useRef(null);
    const [{ handlerId }, drop] = useDrop({
        accept: 'invoice-item',
        collect(monitor) { return { handlerId: monitor.getHandlerId() }; },
        hover(draggedItem, monitor) {
            if (!ref.current) return;
            const dragIndex = draggedItem.index;
            const hoverIndex = index;
            if (dragIndex === hoverIndex) return;
            moveItem(dragIndex, hoverIndex);
            draggedItem.index = hoverIndex;
        },
    });
    const [{ isDragging }, drag] = useDrag({
        type: 'invoice-item',
        item: () => ({ id: item.id || index, index }),
        collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    });
    drag(drop(ref));

    return (
        <div ref={ref} className={`group flex items-center gap-4 bg-black/20 hover:bg-black/40 border border-white/5 p-2 rounded-2xl transition-colors mb-2 ${isDragging ? 'opacity-0' : 'opacity-100'}`} data-handler-id={handlerId}>
            <div className="cursor-grab text-gray-600 hover:text-white p-2"><GripVertical size={16} /></div>
            <div className="flex-1">
                <input type="text" value={item.description} onChange={(e) => onUpdate(index, 'description', e.target.value)} className="w-full bg-transparent border-none outline-none text-sm font-medium px-2 placeholder-gray-700" placeholder="Description" />
            </div>
            <div className="w-20 text-right">
                <input type="number" value={item.quantity} onChange={(e) => onUpdate(index, 'quantity', e.target.value)} className="w-full bg-transparent border-none outline-none text-xs font-mono text-gray-400 text-right" placeholder="Qty" />
            </div>
            <div className="w-16 text-center">
                <input type="text" value={item.unit} onChange={(e) => onUpdate(index, 'unit', e.target.value)} className="w-full bg-transparent border-none outline-none text-xs font-mono text-gray-500 text-center" placeholder="Unit" />
            </div>
            <div className="w-24 text-right">
                <input type="number" value={item.rate} onChange={(e) => onUpdate(index, 'rate', e.target.value)} className="w-full bg-transparent border-none outline-none text-xs font-mono text-gray-400 text-right" placeholder="Rate" />
            </div>
            <div className="w-32 text-right font-black font-mono text-emerald-400 px-4">${parseFloat(item.amount || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
            <button onClick={() => onRemove(index)} className="p-2 text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"><X size={14} /></button>
        </div>
    );
};

const InvoiceBuilder = () => {
  useWindowAutoScroll(); // Enable drag-to-scroll
  const {
    viewMode, setViewMode, invoicesList, projects, projectJobs, setProjectJobs, listLoading, searchTerm, setSearchTerm,
    selectedIds, setSelectedIds, activeTab, setActiveTab, invoice, setInvoice, saving, showHarvest, setShowHarvest, 
    harvestableDiaries, selectedDiaryIds, setSelectedDiaryIds, harvestLoading, consolidateItems, setConsolidateItems,
    calculateTotals, fetchData, handleSave, handleHarvest, importHarvest, getInitialInvoiceState, settings, handleBulkAction, handleLogoUpload
  } = useInvoiceEngine();

  const moveItem = useCallback((dragIndex, hoverIndex) => {
      setInvoice((prev) => {
          const updatedItems = [...prev.items];
          const [draggedItem] = updatedItems.splice(dragIndex, 1);
          updatedItems.splice(hoverIndex, 0, draggedItem);
          return { ...prev, items: updatedItems };
      });
  }, []);

  const handleUpdateRow = (index, field, value) => {
      const items = [...invoice.items];
      items[index][field] = value;
      if (field === 'quantity' || field === 'rate') {
          items[index].amount = (parseFloat(items[index].quantity) || 0) * (parseFloat(items[index].rate) || 0);
      }
      setInvoice(prev => ({ ...prev, items }));
  };

  const handleRemoveRow = (index) => {
      const items = [...invoice.items];
      items.splice(index, 1);
      setInvoice(prev => ({ ...prev, items }));
  };

  useEffect(() => { if (viewMode === 'list') fetchData(); }, [viewMode, fetchData]);

  const handleProjectChange = async (projectId) => {
      const p = projects.find(x => x.id === projectId);
      if (!p) return;
      
      const clientName = p.clientDetails?.name || p.client || '';
      
      setInvoice(prev => ({ 
          ...prev, 
          projectId: p.id, 
          clientName: clientName || prev.clientName 
      }));
      
      try {
          const res = await api.get(`/jobs?projectId=${p.id}`);
          setProjectJobs(res.data.data || res.data || []);
      } catch (e) {}
  };

  const toggleSelection = (id) => {
      const newSet = new Set(selectedIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setSelectedIds(newSet);
  };

  const toggleAll = () => {
      if (selectedIds.size === filteredList.length) setSelectedIds(new Set());
      else setSelectedIds(new Set(filteredList.map(i => i.id)));
  };

  const filteredList = invoicesList.filter(inv => {
      const matchesSearch = (inv.invoiceNumber || '').toLowerCase().includes((searchTerm || '').toLowerCase()) || 
                            (inv.clientName || '').toLowerCase().includes((searchTerm || '').toLowerCase());
      const matchesTab = activeTab === 'all' || inv.status === activeTab.toLowerCase();
      return matchesSearch && matchesTab;
  });

  const totals = calculateTotals();

  const handleLoadInvoice = (inv) => {
      let items = [];
      let invoiceData = inv.invoiceData || {};

      // Handle stringified JSON if necessary
      if (typeof invoiceData === 'string') {
          try { invoiceData = JSON.parse(invoiceData); } catch (e) { console.error("Failed to parse invoiceData", e); }
      }

      // 1. Try invoiceData.items
      if (invoiceData && Array.isArray(invoiceData.items)) {
          items = invoiceData.items;
      }
      
      // 2. Fallback to top-level items
      if (items.length === 0 && Array.isArray(inv.items) && inv.items.length > 0) {
          items = inv.items;
      }

      setInvoice({ ...inv, invoiceData, items });
      setViewMode('edit');
  };

  if (viewMode === 'list') {
      if (listLoading) return <PremiumLoader text="SYNCING FINANCIAL LEDGER..." />;

      return (
          <div className="min-h-screen p-8 bg-stone-950 text-white font-sans" style={{ isolation: 'isolate' }}>
              <div className="max-w-[1600px] mx-auto">
                  <div className="flex justify-between items-center mb-8">
                      <div><h1 className="text-4xl font-black flex items-center gap-3 tracking-tight"><FileText size={40} className="text-indigo-500" /> INVOICE COMMAND</h1></div>
                      <button onClick={() => { setInvoice(getInitialInvoiceState(settings)); setViewMode('edit'); }} className="flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 transition-all rounded-[1.5rem] font-black shadow-lg shadow-indigo-900/20"><Plus size={20} /> NEW INVOICE</button>
                  </div>

                  {/* TABS */}
                  <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                      {['ALL', 'DRAFT', 'APPROVED', 'SENT', 'PAID'].map(tab => (
                          <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab.toLowerCase())}
                            className={`px-6 py-2 rounded-full text-xs font-black tracking-widest transition-all ${activeTab === tab.toLowerCase() ? 'bg-white text-black shadow-xl' : 'bg-stone-900 text-gray-500 hover:bg-stone-800 hover:text-gray-300'}`}
                          >
                              {tab}
                          </button>
                      ))}
                  </div>

                  <div className="bg-stone-900/60 p-6 mb-6 rounded-3xl border border-white/5 flex items-center gap-4 shadow-inner">
                      <Search className="text-gray-500" size={20} />
                      <input type="text" placeholder="Search invoices by number or client..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-transparent border-none outline-none text-lg w-full placeholder-gray-600 font-medium" />
                  </div>

                  {/* BULK ACTION BAR */}
                  {selectedIds.size > 0 && (
                      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-indigo-900/90 backdrop-blur-xl border border-indigo-500/30 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-6 z-50 animate-slide-up">
                          <span className="font-black text-indigo-200">{selectedIds.size} Selected</span>
                          <div className="h-6 w-px bg-indigo-500/30"></div>
                          <button onClick={() => handleBulkAction('approved')} className="flex items-center gap-2 hover:text-emerald-400 transition-colors font-bold text-xs uppercase"><CheckCircle size={18} /> Approve</button>
                          <button onClick={() => handleBulkAction('sent')} className="flex items-center gap-2 hover:text-blue-400 transition-colors font-bold text-xs uppercase"><Send size={18} /> Mark Sent</button>
                          <button onClick={() => handleBulkAction('paid')} className="flex items-center gap-2 hover:text-amber-400 transition-colors font-bold text-xs uppercase"><DollarSign size={18} /> Mark Paid</button>
                          <div className="h-6 w-px bg-indigo-500/30"></div>
                          <button onClick={() => handleBulkAction('delete')} className="flex items-center gap-2 hover:text-red-400 transition-colors font-bold text-xs uppercase"><Trash2 size={18} /> Delete</button>
                      </div>
                  )}

                  <div className="bg-stone-900/40 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
                      <table className="w-full text-left border-collapse">
                          <thead className="bg-black/20 text-gray-500 uppercase font-black text-[10px] tracking-widest">
                              <tr>
                                  <th className="px-6 py-5 w-10"><input type="checkbox" onChange={toggleAll} checked={selectedIds.size === filteredList.length && filteredList.length > 0} className="rounded bg-stone-800 border-white/10 accent-indigo-500 w-4 h-4 cursor-pointer" /></th>
                                  <th className="px-6 py-5">Status</th>
                                  <th className="px-6 py-5">Invoice #</th>
                                  <th className="px-6 py-5">Client</th>
                                  <th className="px-6 py-5">Date</th>
                                  <th className="px-6 py-5 text-right">Amount</th>
                                  <th className="px-6 py-5"></th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                              {filteredList.map(inv => (
                                  <tr key={inv.id} className={`hover:bg-white/5 transition-all group ${selectedIds.has(inv.id) ? 'bg-indigo-900/10' : ''}`}>
                                      <td className="px-6 py-6"><input type="checkbox" checked={selectedIds.has(inv.id)} onChange={() => toggleSelection(inv.id)} className="rounded bg-stone-800 border-white/10 accent-indigo-500 w-4 h-4 cursor-pointer" /></td>
                                      <td className="px-6 py-6">
                                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                                              ${inv.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 
                                                inv.status === 'sent' ? 'bg-blue-500/20 text-blue-400' : 
                                                inv.status === 'approved' ? 'bg-purple-500/20 text-purple-400' : 
                                                'bg-white/10 text-gray-400'}`}>
                                              {inv.status}
                                          </span>
                                      </td>
                                      <td className="px-6 py-6 font-mono font-bold text-white group-hover:text-indigo-400 transition-colors cursor-pointer" onClick={() => handleLoadInvoice(inv)}>{inv.invoiceNumber}</td>
                                      <td className="px-6 py-6 font-medium text-gray-300">{inv.Client?.name || inv.clientName || '-'}</td>
                                      <td className="px-6 py-6 text-gray-500 font-mono text-xs">{new Date(inv.createdAt).toLocaleDateString()}</td>
                                      <td className="px-6 py-6 text-right font-black font-mono text-lg text-white">${parseFloat(inv.totalAmount).toLocaleString()}</td>
                                      <td className="px-6 py-6 text-right"><button onClick={() => handleLoadInvoice(inv)} className="p-2 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-all"><ChevronRight size={18} /></button></td>
                                  </tr>
                              ))}
                              {filteredList.length === 0 && (
                                  <tr><td colSpan="7" className="p-10 text-center text-gray-500 font-bold">No invoices found.</td></tr>
                              )}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#050507] p-4 md:p-10 text-white font-sans" style={{ transform: 'translate3d(0,0,0)', backfaceVisibility: 'hidden', isolation: 'isolate' }}>
      <div className="max-w-[1800px] mx-auto">
        <div className="flex justify-between items-center mb-10 gap-6">
          <div className="flex items-center gap-6">
            <button onClick={() => setViewMode('list')} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 text-gray-400 hover:text-white transition-all"><ArrowLeft size={24} /></button>
            <div><h1 className="text-3xl font-black uppercase tracking-tight">{invoice.id ? 'Edit' : 'Draft'} Invoice</h1><p className="text-gray-500 font-mono text-sm tracking-widest">{invoice.invoiceNumber}</p></div>
          </div>
          <div className="flex gap-4">
             <button onClick={() => { 
                 const proj = projects.find(p => p.id === invoice.projectId);
                 const extendedInvoice = { 
                     ...invoice, 
                     projectName: proj?.name || invoice.projectName,
                     clientAddress: proj?.clientDetails?.address || invoice.clientAddress
                 };
                 console.log("Printing high-fidelity invoice..."); 
                 generatePDF(extendedInvoice, totals); 
             }} className="flex items-center gap-2 px-6 py-3 bg-stone-800 hover:bg-stone-700 text-gray-300 rounded-xl font-bold text-xs uppercase transition-all"><Printer size={16} /> Print / Download</button>
             <button onClick={() => handleSave(false)} disabled={saving} className="flex items-center gap-3 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase shadow-xl hover:shadow-indigo-500/20 transition-all transform hover:-translate-y-0.5"><Save size={18} /> {saving ? 'Saving...' : 'Save Invoice'}</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_550px] gap-10">
          <div className="space-y-10">
            {/* Project & Client Card */}
            <div className="bg-stone-900/40 border border-white/5 rounded-[2.5rem] p-10 shadow-xl">
                <h3 className="text-xs font-black text-gray-500 uppercase mb-8 flex items-center gap-3 tracking-widest"><Folder size={16} className="text-indigo-500" /> Project Context</h3>
                <div className="space-y-6">
                    <div className="relative">
                        <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block">Linked Project</label>
                        <select value={invoice.projectId || ''} onChange={(e) => handleProjectChange(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-sm focus:border-indigo-500 outline-none transition-all font-bold appearance-none text-white">
                            <option value="">-- Select Project --</option>
                            {projects.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                        </select>
                        <ChevronRight className="absolute right-4 top-10 text-gray-600 pointer-events-none rotate-90" size={16} />
                    </div>
                    
                    {invoice.projectId && (
                        <div className="grid grid-cols-2 gap-6 animate-fade-in">
                             <div className="relative">
                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block">Job Reference (Optional)</label>
                                <select value={invoice.jobId || ''} onChange={(e) => setInvoice(prev => ({ ...prev, jobId: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-sm focus:border-indigo-500 outline-none transition-all font-bold appearance-none text-gray-300">
                                    <option value="">-- General / All --</option>
                                    {projectJobs.map(j => (<option key={j.id} value={j.id}>#{j.jobNumber} - {j.serviceType}</option>))}
                                </select>
                             </div>
                             <div>
                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block">Client</label>
                                <div className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-sm font-bold text-gray-400">{invoice.clientName || 'Auto-Detected'}</div>
                             </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Branding & Payment */}
            <div className="bg-stone-900/40 border border-white/5 rounded-[2.5rem] p-10 shadow-xl">
                <h3 className="text-xs font-black text-gray-500 uppercase mb-8 flex items-center gap-3 tracking-widest"><Building2 size={16} className="text-purple-500" /> Branding & Payment</h3>
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block">Company Logo</label>
                        <div className="relative border-2 border-dashed border-white/10 rounded-2xl h-32 flex items-center justify-center bg-black/20 overflow-hidden">
                            {invoice.senderLogo ? (
                                <img src={invoice.senderLogo} alt="Logo" className="h-full w-full object-contain p-2" />
                            ) : (
                                <div className="text-center text-gray-600">
                                    <span className="text-[10px] font-bold uppercase">Update in Settings</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">ABN / Tax ID</label>
                            <input type="text" value={invoice.senderABN || ''} onChange={e => setInvoice(prev => ({...prev, senderABN: e.target.value}))} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none" placeholder="Tax ID" />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Bank Name</label>
                            <input type="text" value={invoice.bankName || ''} onChange={e => setInvoice(prev => ({...prev, bankName: e.target.value}))} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none" placeholder="Bank Name" />
                        </div>
                    </div>
                    <div className="col-span-2 grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Account Number</label>
                            <input type="text" value={invoice.bankAccount || ''} onChange={e => setInvoice(prev => ({...prev, bankAccount: e.target.value}))} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none" placeholder="Account No" />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">BSB / Sort Code</label>
                            <input type="text" value={invoice.bankBSB || ''} onChange={e => setInvoice(prev => ({...prev, bankBSB: e.target.value}))} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none" placeholder="BSB" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Line Items Card */}
            <div className="bg-stone-900/40 border border-white/5 rounded-[2.5rem] p-10 shadow-xl min-h-[400px] flex flex-col">
                <div className="flex justify-between items-center mb-10">
                    <h3 className="text-xs font-black text-gray-500 uppercase flex items-center gap-3 tracking-widest"><CreditCard size={16} className="text-emerald-500" /> Billable Items</h3>
                    <button onClick={handleHarvest} className="px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-black uppercase hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20">
                        <Layers size={14} /> Harvest Diaries
                    </button>
                </div>
                <div className="space-y-3 flex-1">
                    {(invoice.items || []).length === 0 && (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-600 border-2 border-dashed border-white/5 rounded-2xl">
                            <Info size={32} className="mb-2 opacity-50" />
                            <span className="text-xs font-bold uppercase">No Items Added</span>
                            <span className="text-[10px]">Harvest diaries or add manually</span>
                        </div>
                    )}
                    {(invoice.items || []).map((item, idx) => (
                        <DraggableInvoiceRow 
                            key={idx} // Using index as key for reorderable list of simple objects is acceptable here, or generate temp IDs
                            item={item} 
                            index={idx} 
                            moveItem={moveItem} 
                            onUpdate={handleUpdateRow} 
                            onRemove={handleRemoveRow} 
                        />
                    ))}
                </div>
                <button onClick={() => setInvoice(prev => ({ ...prev, items: [...prev.items, { description: '', quantity: 1, rate: 0, amount: 0 }] }))} className="mt-6 w-full py-3 border-2 border-dashed border-white/10 hover:border-white/20 rounded-xl text-xs font-bold text-gray-500 hover:text-white uppercase transition-all flex items-center justify-center gap-2">
                    <Plus size={14} /> Add Manual Line Item
                </button>

                {/* Adjustments: Discount & Tax */}
                <div className="grid grid-cols-2 gap-6 mt-8 border-t border-white/10 pt-6">
                    <div>
                        <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block">Discount</label>
                        <div className="flex gap-2">
                            <select value={invoice.discountType} onChange={e => setInvoice(prev => ({...prev, discountType: e.target.value}))} className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none">
                                <option value="percent">%</option>
                                <option value="fixed">$</option>
                            </select>
                            <input type="number" value={invoice.discountValue} onChange={e => setInvoice(prev => ({...prev, discountValue: e.target.value}))} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none" placeholder="0" />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block">Tax Rate (%)</label>
                        <input type="number" value={invoice.taxRate} onChange={e => setInvoice(prev => ({...prev, taxRate: e.target.value}))} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none" placeholder="10" />
                    </div>
                </div>

                <div className="mt-8">
                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-2 block">Notes & Terms</label>
                    <textarea value={invoice.notes} onChange={e => setInvoice(prev => ({...prev, notes: e.target.value}))} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none resize-y h-24" placeholder="Payment terms, special instructions..." />
                </div>
            </div>
          </div>

          {/* Live Preview Panel */}
          <div id="invoice-preview" className="sticky top-10 h-fit bg-white rounded-[2rem] shadow-2xl shadow-black/50 border-[12px] border-stone-900 p-10 text-black flex flex-col min-h-[800px] font-sans relative overflow-hidden group">
              <div className="absolute top-0 right-0 bg-gray-100 px-4 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest rounded-bl-xl print:hidden">Preview Mode</div>
              
              {/* Header */}
              <div className="flex justify-between items-start mb-12">
                  <div className="flex flex-col gap-4">
                      {invoice.senderLogo ? (
                          <img src={invoice.senderLogo} alt="Logo" className="h-16 w-auto object-contain self-start" />
                      ) : (
                          <div className="h-16 w-16 bg-gray-100 rounded-xl flex items-center justify-center text-gray-300 font-bold text-xs uppercase">Logo</div>
                      )}
                      <div>
                          <div className="text-xl font-bold text-gray-900 uppercase tracking-wide">{invoice.senderName}</div>
                          <div className="text-xs text-gray-500 whitespace-pre-wrap mt-1">{invoice.senderAddress}</div>
                          <div className="text-xs text-gray-500 mt-1">{invoice.senderEmail}</div>
                          <div className="text-xs text-gray-500">{invoice.senderPhone}</div>
                          {invoice.senderABN && <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">ABN: {invoice.senderABN}</div>}
                      </div>
                  </div>
                  <div className="text-right">
                      <h2 className="text-5xl font-black mb-2 tracking-tighter" style={{color: invoice.accentColor}}>INVOICE</h2>
                      <div className="font-mono text-xl font-bold">#{invoice.invoiceNumber}</div>
                      <div className="text-xs text-gray-500 font-bold mt-1">Date: {new Date(invoice.issueDate || Date.now()).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500 font-bold">Due: {new Date(invoice.dueDate || Date.now()).toLocaleDateString()}</div>
                  </div>
              </div>

              {/* Bill To */}
              <div className="mb-12 p-6 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-start">
                  <div>
                      <div className="font-black text-xs uppercase text-gray-400 mb-2 tracking-widest">Bill To</div>
                      <div className="text-2xl font-bold">{invoice.clientName || 'Select Client...'}</div>
                      <div className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{invoice.clientAddress}</div>
                      <div className="text-sm text-gray-500 mt-1">{invoice.clientEmail}</div>
                  </div>
                  <div className="text-right">
                      <div className="font-black text-xs uppercase text-gray-400 mb-2 tracking-widest">Project</div>
                      <div className="text-sm font-bold text-gray-800">{(projects || []).find(p => p.id === invoice.projectId)?.name || '-'}</div>
                      <div className="text-xs text-gray-500 mt-1">{(projects || []).find(p => p.id === invoice.projectId)?.site || ''}</div>
                  </div>
              </div>

              {/* Items */}
              <div className="flex-1">
                  <div className="flex justify-between text-[10px] uppercase font-black text-gray-400 border-b-2 border-gray-100 pb-2 mb-4 tracking-widest">
                      <span className="w-1/2">Description</span>
                      <span className="w-16 text-right">Qty</span>
                      <span className="w-16 text-center">Unit</span>
                      <span className="w-24 text-right">Rate</span>
                      <span className="w-24 text-right">Amount</span>
                  </div>
                  <div className="space-y-1">
                      {(invoice.items || []).map((item, i) => (
                          <div key={i} className="flex justify-between py-3 border-b border-dashed border-gray-100 text-sm font-medium">
                              <span className="w-1/2 truncate pr-4">{item.description || 'Item...'}</span>
                              <span className="w-16 text-right text-gray-500">{item.quantity}</span>
                              <span className="w-16 text-center text-gray-400 text-xs">{item.unit}</span>
                              <span className="w-24 text-right text-gray-500">${parseFloat(item.rate || 0).toFixed(2)}</span>
                              <span className="w-24 text-right font-bold" style={{color: '#10b981'}}>${parseFloat(item.amount || 0).toFixed(2)}</span>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Footer Totals */}
              <div className="mt-12 pt-6 border-t-4 border-black">
                  <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Subtotal</span>
                      <span className="font-mono font-bold">${totals.subtotal.toFixed(2)}</span>
                  </div>
                  
                  {totals.discountAmount > 0 && (
                      <div className="flex justify-between items-center mb-2" style={{color: '#ef4444'}}>
                          <span className="text-xs font-bold uppercase tracking-widest">Discount ({invoice.discountType === 'percent' ? `${invoice.discountValue}%` : 'Fixed'})</span>
                          <span className="font-mono font-bold">-${totals.discountAmount.toFixed(2)}</span>
                      </div>
                  )}

                  <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tax ({invoice.taxRate}%)</span>
                      <span className="font-mono font-bold">${totals.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-4xl font-black" style={{color: invoice.accentColor}}>
                      <span>TOTAL</span>
                      <span>${totals.total.toFixed(2)}</span>
                  </div>
              </div>

              {/* Notes & Banking */}
              <div className="mt-10 grid grid-cols-2 gap-8">
                  <div>
                      {invoice.notes && (
                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Notes</h4>
                              <p className="text-xs text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
                          </div>
                      )}
                  </div>
                  {(invoice.bankName || invoice.bankAccount) && (
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-right">
                          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Payment Details</h4>
                          <div className="text-xs text-gray-800 space-y-1">
                              <div className="font-bold">{invoice.bankName}</div>
                              <div>BSB: {invoice.bankBSB}</div>
                              <div className="font-mono">{invoice.bankAccount}</div>
                          </div>
                      </div>
                  )}
              </div>
          </div>
        </div>

        {/* HARVEST MODAL */}
        {showHarvest && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-[#0f1115] border border-white/10 w-full max-w-3xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[85vh] relative overflow-hidden">
                    {/* Modal Header */}
                    <div className="p-8 border-b border-white/5 flex justify-between items-center bg-stone-900/50">
                        <div>
                            <h3 className="text-2xl font-black text-white uppercase flex items-center gap-3 tracking-tight"><Layers className="text-emerald-500" /> Harvest Diaries</h3>
                            <p className="text-gray-500 text-xs font-bold mt-1">Select uninvoiced entries to merge</p>
                        </div>
                        <button onClick={() => setShowHarvest(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} className="text-gray-400" /></button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar bg-stone-950/30">
                        {harvestLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                                <Loader2 size={32} className="animate-spin mb-4 text-emerald-500" />
                                <span className="text-xs font-bold uppercase tracking-widest">Scanning Project...</span>
                            </div>
                        ) : harvestableDiaries.length === 0 ? (
                            <div className="text-center py-20 text-gray-500 font-bold">No uninvoiced diaries found for this project.</div>
                        ) : (
                            harvestableDiaries.map(d => (
                                <div 
                                    key={d.id} 
                                    onClick={() => { const s = new Set(selectedDiaryIds); if (s.has(d.id)) s.delete(d.id); else s.add(d.id); setSelectedDiaryIds(s); }} 
                                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${selectedDiaryIds.has(d.id) ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-stone-900/40 border-white/5 hover:border-white/20'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-6 h-6 rounded-md flex items-center justify-center border ${selectedDiaryIds.has(d.id) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-600 text-transparent'}`}>
                                            <Check size={14} strokeWidth={4} />
                                        </div>
                                        <div>
                                            <div className="font-black text-sm text-white group-hover:text-emerald-300 transition-colors">{new Date(d.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
                                            <div className="text-[10px] text-gray-500 font-mono mt-0.5">{d.job?.jobNumber ? `Job Ref: #${d.job.jobNumber}` : 'General Site Entry'}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-mono font-black text-emerald-400">${(parseFloat(d.totalRevenue) || 0).toLocaleString()}</div>
                                        <div className="text-[10px] text-gray-600 font-bold uppercase">{d.canvasData?.length || 0} Items</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-white/5 bg-stone-900/50 flex justify-between items-center">
                        <div className="text-xs font-bold text-gray-500 uppercase">{selectedDiaryIds.size} Entries Selected</div>
                        <button onClick={importHarvest} disabled={selectedDiaryIds.size === 0} className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center gap-3">
                            <Archive size={16} /> Merge & Import
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* HELP BEACON */}
        <VideoBeacon videoId="CaQTxeXrcDM" title="Master Invoice Harvest" />
      </div>
    </div>
  );
};

export default InvoiceBuilder;
