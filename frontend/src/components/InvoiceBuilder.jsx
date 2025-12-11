import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../utils/api';
import { useSettings } from '../context/SettingsContext';
import { FileText, Save, Plus, Trash2, Download, DollarSign, Calendar, Percent, CreditCard, Building2, User } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ClientSelector from './Clients/ClientSelector';

const InvoiceBuilder = () => {
  const location = useLocation();
  const { settings } = useSettings();
  
  // --- STATE ---
  const [invoice, setInvoice] = useState({
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    status: 'draft',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    
    // Client
    clientId: null,
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    clientPhone: '',
    
    // Business (Sender) - Default from Settings Context
    senderName: settings.companyName || 'My Construction Co', 
    senderAddress: settings.companyAddress || '',
    senderEmail: settings.companyEmail || '',
    senderPhone: settings.companyPhone || '',
    
    // Items
    items: [],
    
    // Financials
    taxRate: parseFloat(settings.defaultTaxRate) || 0,
    discount: 0,
    discountType: 'percent', // 'percent' or 'fixed'
    currency: settings.currency || 'USD',
    
    notes: '',
    terms: `Payment is due within 14 days. \nBank: ${settings.bankName || ''} \nAcc: ${settings.bankAccount || ''}`,
    projectId: null
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' or 'preview'

  // --- PRE-LOAD LOGIC ---
  useEffect(() => {
    // Refresh local state if settings load later than initial render
    if (!invoice.senderName && settings.companyName) {
        setInvoice(prev => ({
            ...prev,
            senderName: settings.companyName,
            senderAddress: settings.companyAddress,
            senderEmail: settings.companyEmail,
            senderPhone: settings.companyPhone,
            taxRate: parseFloat(settings.defaultTaxRate) || prev.taxRate,
            currency: settings.currency || prev.currency,
            terms: prev.terms.includes('Bank:') ? prev.terms : `Payment is due within 14 days. \nBank: ${settings.bankName || ''} \nAcc: ${settings.bankAccount || ''}`
        }));
    }

    const loadData = async () => {
      // 2. Load Client (if ID provided)
      let currentClientId = location.state?.clientId;

      
      // Fallback: Check project if no client ID directly
      if (!currentClientId && location.state?.projectId) {
          try {
              const projRes = await api.get(`/projects/${location.state.projectId}`);
              if (projRes.data?.clientId) currentClientId = projRes.data.clientId;
              else if (projRes.data?.client) setInvoice(prev => ({ ...prev, clientName: projRes.data.client })); // Name only fallback
          } catch (e) { console.error(e); }
      }

      if (currentClientId) {
          try {
              const clientRes = await api.get(`/clients/${currentClientId}`);
              const c = clientRes.data;
              setInvoice(prev => ({
                  ...prev,
                  clientId: c.id,
                  clientName: c.name,
                  clientEmail: c.email || '',
                  clientPhone: c.phone || '',
                  clientAddress: c.address || ''
              }));
          } catch (e) { console.error("Failed to load client", e); }
      }

      // 3. Apply Direct Overrides from Navigation (Critical for "Pre-filled" request)
      if (location.state?.clientAddress) {
          setInvoice(prev => ({ ...prev, clientAddress: location.state.clientAddress }));
      }
      if (location.state?.clientEmail) {
          setInvoice(prev => ({ ...prev, clientEmail: location.state.clientEmail }));
      }

      // 3. Load Items (from Diary or Quote)
      if (location.state?.diaryItems) {
        const newItems = location.state.diaryItems.map(item => {
          const qty = parseFloat(item.duration || item.quantity || 1);
          // Calculate effective rate from revenue if available (preserves Diary markup logic)
          let rate = 0;
          if (item.revenue && qty > 0) {
              rate = item.revenue / qty;
          } else if (item.data) {
              // Fallback to base rates if revenue missing
              rate = parseFloat(item.data.chargeOutBase || item.data.chargeRate || item.data.pricePerUnit || 0);
          } else {
              rate = parseFloat(item.chargeRate || 0);
          }

          return {
            description: item.name,
            quantity: qty,
            rate: rate,
            amount: qty * rate
          };
        });
        setInvoice(prev => ({ ...prev, items: newItems }));
      } else if (location.state?.quoteItems) {
        const newItems = location.state.quoteItems.map(item => {
          let rate = 0;
          if (item.type === 'staff') rate = parseFloat(item.material.chargeRate);
          else if (item.type === 'equipment') rate = parseFloat(item.material.costRate); 
          else rate = parseFloat(item.material.pricePerUnit);

          const qty = parseFloat(item.quantity || 1);
          return {
            description: item.material.name,
            quantity: qty,
            rate: rate,
            amount: qty * rate
          };
        });
        setInvoice(prev => ({ ...prev, items: newItems }));
      }
    };

    loadData();
  }, [location.state]);

  // --- HANDLERS ---
  const handleAddItem = () => {
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, rate: 0, amount: 0 }]
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...invoice.items];
    newItems[index][field] = value;
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = (parseFloat(newItems[index].quantity) || 0) * (parseFloat(newItems[index].rate) || 0);
    }
    setInvoice(prev => ({ ...prev, items: newItems }));
  };

  const handleRemoveItem = (index) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotals = () => {
    const subtotal = invoice.items.reduce((acc, item) => acc + (item.amount || 0), 0);
    
    let discountAmount = 0;
    if (invoice.discountType === 'percent') {
        discountAmount = subtotal * (invoice.discount / 100);
    } else {
        discountAmount = parseFloat(invoice.discount) || 0;
    }

    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (invoice.taxRate / 100);
    const total = taxableAmount + taxAmount;

    return { subtotal, discountAmount, taxAmount, total };
  };

  const { subtotal, discountAmount, taxAmount, total } = calculateTotals();

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await api.post('/invoices', {
        ...invoice,
        totalAmount: total
      });
      setInvoice(prev => ({ ...prev, id: res.data.id }));
      alert('Invoice saved successfully!');
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Failed to save invoice.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const { subtotal, discountAmount, taxAmount, total } = calculateTotals();
    
    // -- STYLING CONFIG --
    const primaryColor = [79, 70, 229]; // Indigo
    const grayColor = [100, 116, 139];
    
    // -- HEADER --
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont(undefined, 'bold');
    doc.text('INVOICE', 20, 25);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`#${invoice.invoiceNumber}`, 180, 20, { align: 'right' });
    doc.text(`Status: ${invoice.status.toUpperCase()}`, 180, 28, { align: 'right' });

    // -- SENDER & RECIPIENT --
    doc.setTextColor(0, 0, 0);
    const startY = 55;
    
    // From
    doc.setFontSize(10);
    doc.setTextColor(...grayColor);
    doc.text('FROM', 20, startY);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text(invoice.senderName, 20, startY + 6);
    doc.setFont(undefined, 'normal');
    if (invoice.senderAddress) doc.text(invoice.senderAddress, 20, startY + 12);
    if (invoice.senderEmail) doc.text(invoice.senderEmail, 20, startY + 18);

    // To
    doc.setTextColor(...grayColor);
    doc.text('BILL TO', 110, startY);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text(invoice.clientName || 'Valued Client', 110, startY + 6);
    doc.setFont(undefined, 'normal');
    const addressLines = doc.splitTextToSize(invoice.clientAddress || '', 80);
    doc.text(addressLines, 110, startY + 12);
    if (invoice.clientEmail) doc.text(invoice.clientEmail, 110, startY + 12 + (addressLines.length * 5));

    // Dates
    doc.text(`Issue Date: ${invoice.issueDate}`, 180, startY, { align: 'right' });
    doc.text(`Due Date: ${invoice.dueDate}`, 180, startY + 6, { align: 'right' });

    // -- TABLE --
    const tableColumn = ["Description", "Quantity", "Rate", "Amount"];
    const tableRows = invoice.items.map(item => [
      item.description,
      item.quantity,
      `$${item.rate.toFixed(2)}`,
      `$${item.amount.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: startY + 40,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: 255 },
      styles: { fontSize: 10, cellPadding: 4 },
    });
    
    // -- TOTALS --
    let finalY = doc.lastAutoTable.finalY + 10;
    
    const drawTotalLine = (label, value, isBold = false) => {
        doc.setFont(undefined, isBold ? 'bold' : 'normal');
        doc.text(label, 140, finalY);
        doc.text(`$${value.toFixed(2)}`, 190, finalY, { align: 'right' });
        finalY += 6;
    };

    drawTotalLine('Subtotal:', subtotal);
    if (discountAmount > 0) drawTotalLine(`Discount (${invoice.discount}${invoice.discountType === 'percent' ? '%' : ''}):`, -discountAmount);
    if (taxAmount > 0) drawTotalLine(`Tax (${invoice.taxRate}%):`, taxAmount);
    finalY += 2;
    doc.setLineWidth(0.5);
    doc.line(135, finalY - 5, 195, finalY - 5);
    doc.setFontSize(12);
    drawTotalLine('TOTAL:', total, true);

    // -- FOOTER --
    finalY += 20;
    if (invoice.notes) {
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('Notes:', 20, finalY);
        doc.setFont(undefined, 'normal');
        doc.text(invoice.notes, 20, finalY + 6);
        finalY += 20;
    }

    doc.setFontSize(8);
    doc.setTextColor(...grayColor);
    doc.text(invoice.terms, 105, 280, { align: 'center' });

    doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
  };

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8 font-sans animate-fade-in text-slate-800 dark:text-slate-100">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight dark:text-white flex items-center gap-3">
              <FileText size={32} className="text-indigo-600 dark:text-indigo-400" /> 
              Invoice Editor
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Create professional invoices in seconds.</p>
          </div>
          <div className="flex gap-3">
             <button onClick={handleExportPDF} className="flex items-center gap-2 px-5 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl font-bold transition-all">
                <Download size={18} /> Export PDF
             </button>
             <button onClick={handleSave} disabled={loading} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5">
                <Save size={18} /> {loading ? 'Saving...' : 'Save Invoice'}
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: EDITOR */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Document Details */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2"><CreditCard size={18} className="text-slate-400"/> Invoice Details</h3>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${invoice.status === 'draft' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-600'}`}>
                        {invoice.status}
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Invoice #</label>
                        <input type="text" value={invoice.invoiceNumber} onChange={(e) => setInvoice({...invoice, invoiceNumber: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Issue Date</label>
                        <input type="date" value={invoice.issueDate} onChange={(e) => setInvoice({...invoice, issueDate: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Due Date</label>
                        <input type="date" value={invoice.dueDate} onChange={(e) => setInvoice({...invoice, dueDate: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                </div>
            </div>

            {/* 2. Parties (From/To) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="grid grid-cols-2 gap-8">
                    {/* FROM */}
                    <div>
                        <h3 className="font-bold text-sm text-slate-400 uppercase mb-3 flex items-center gap-2"><Building2 size={16}/> From (Business)</h3>
                        <div className="space-y-2">
                            <input type="text" placeholder="Your Business Name" value={invoice.senderName} onChange={(e) => setInvoice({...invoice, senderName: e.target.value})} className="w-full font-bold bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 focus:border-indigo-500 outline-none py-1 placeholder-slate-400" />
                            <textarea placeholder="Address" rows="2" value={invoice.senderAddress} onChange={(e) => setInvoice({...invoice, senderAddress: e.target.value})} className="w-full text-sm bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 focus:border-indigo-500 outline-none py-1 resize-none placeholder-slate-400" />
                            <input type="email" placeholder="Email" value={invoice.senderEmail} onChange={(e) => setInvoice({...invoice, senderEmail: e.target.value})} className="w-full text-sm bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 focus:border-indigo-500 outline-none py-1 placeholder-slate-400" />
                        </div>
                    </div>

                    {/* TO */}
                    <div>
                        <h3 className="font-bold text-sm text-slate-400 uppercase mb-3 flex items-center gap-2"><User size={16}/> Bill To (Client)</h3>
                        <div className="space-y-2">
                            <ClientSelector 
                                selectedClient={invoice.clientId ? { id: invoice.clientId, name: invoice.clientName } : null}
                                onSelect={(c) => setInvoice(prev => ({ 
                                    ...prev, 
                                    clientId: c?.id || null, 
                                    clientName: c?.name || '', 
                                    clientEmail: c?.email || '', 
                                    clientPhone: c?.phone || '', 
                                    clientAddress: c?.address || '' 
                                }))}
                                className="mb-2"
                            />
                            {!invoice.clientId && <input type="text" placeholder="Client Name" value={invoice.clientName} onChange={(e) => setInvoice({...invoice, clientName: e.target.value})} className="w-full font-bold bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 focus:border-indigo-500 outline-none py-1 placeholder-slate-400" />}
                            
                            <textarea placeholder="Client Address" rows="2" value={invoice.clientAddress} onChange={(e) => setInvoice({...invoice, clientAddress: e.target.value})} className="w-full text-sm bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 focus:border-indigo-500 outline-none py-1 resize-none placeholder-slate-400" />
                            <input type="email" placeholder="Client Email" value={invoice.clientEmail} onChange={(e) => setInvoice({...invoice, clientEmail: e.target.value})} className="w-full text-sm bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 focus:border-indigo-500 outline-none py-1 placeholder-slate-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Items */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Line Items</h3>
                    <button onClick={handleAddItem} className="text-xs font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1 uppercase tracking-wider"><Plus size={14}/> Add Item</button>
                </div>
                
                <div className="space-y-3">
                    {/* Header Row */}
                    <div className="grid grid-cols-12 gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
                        <div className="col-span-6">Description</div>
                        <div className="col-span-2 text-center">Qty</div>
                        <div className="col-span-2 text-right">Rate</div>
                        <div className="col-span-2 text-right">Amount</div>
                    </div>

                    {invoice.items.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-4 items-center bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group transition-all">
                            <div className="col-span-6 flex items-center gap-2">
                                <button onClick={() => handleRemoveItem(index)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                                <input type="text" value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} className="w-full bg-transparent outline-none font-medium text-slate-700 dark:text-slate-200" placeholder="Item description" />
                            </div>
                            <div className="col-span-2">
                                <input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className="w-full bg-transparent outline-none text-center text-slate-600 dark:text-slate-300" placeholder="0" />
                            </div>
                            <div className="col-span-2 text-right">
                                <input type="number" value={item.rate} onChange={(e) => handleItemChange(index, 'rate', e.target.value)} className="w-full bg-transparent outline-none text-right text-slate-600 dark:text-slate-300" placeholder="0.00" />
                            </div>
                            <div className="col-span-2 text-right font-bold text-slate-800 dark:text-white">
                                ${item.amount.toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 4. Notes & Terms */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Notes to Client</label>
                        <textarea value={invoice.notes} onChange={(e) => setInvoice({...invoice, notes: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-24" placeholder="Thanks for your business..." />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Terms & Conditions</label>
                        <textarea value={invoice.terms} onChange={(e) => setInvoice({...invoice, terms: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-24" />
                    </div>
                </div>
            </div>

          </div>

          {/* RIGHT COLUMN: SUMMARY & ACTIONS */}
          <div className="space-y-6">
             <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-800 sticky top-6">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><DollarSign size={20} className="text-emerald-500"/> Payment Summary</h3>
                
                <div className="space-y-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Subtotal</span>
                        <span className="font-bold">${subtotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Discount</span>
                        <div className="flex items-center gap-2">
                            <input type="number" value={invoice.discount} onChange={(e) => setInvoice({...invoice, discount: parseFloat(e.target.value) || 0})} className="w-16 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-right text-xs outline-none" />
                            <select value={invoice.discountType} onChange={(e) => setInvoice({...invoice, discountType: e.target.value})} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1 py-1 text-xs outline-none cursor-pointer">
                                <option value="percent">%</option>
                                <option value="fixed">$</option>
                            </select>
                        </div>
                    </div>
                    {discountAmount > 0 && <div className="flex justify-end text-xs text-red-400">-${discountAmount.toFixed(2)}</div>}

                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Tax Rate (%)</span>
                        <input type="number" value={invoice.taxRate} onChange={(e) => setInvoice({...invoice, taxRate: parseFloat(e.target.value) || 0})} className="w-20 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-right outline-none" />
                    </div>
                    {taxAmount > 0 && <div className="flex justify-end text-xs text-slate-400">+${taxAmount.toFixed(2)}</div>}
                </div>

                <div className="flex justify-between items-end mb-6">
                    <span className="font-black text-slate-400 uppercase text-sm">Total Due</span>
                    <span className="font-black text-4xl text-slate-800 dark:text-white">${total.toFixed(2)}</span>
                </div>

                <button onClick={handleExportPDF} className="w-full py-4 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white rounded-xl font-bold shadow-xl transition-all flex items-center justify-center gap-2 group mb-3">
                    <Download size={20} className="group-hover:scale-110 transition-transform" /> Download Invoice
                </button>
                
                <button 
                    onClick={async () => {
                        if (!invoice.clientEmail) return alert("Please enter a client email address.");
                        const { total } = calculateTotals();
                        setLoading(true); // Reuse loading state or make new one
                        try {
                            await api.post('/mail/send', {
                                to: invoice.clientEmail,
                                subject: `Invoice #${invoice.invoiceNumber} from ${invoice.senderName}`,
                                html: `
                                    <div style="font-family: sans-serif; padding: 20px;">
                                        <h1 style="color: #4F46E5;">Invoice #${invoice.invoiceNumber}</h1>
                                        <p>Dear ${invoice.clientName || 'Valued Client'},</p>
                                        <p>This is a notification that an invoice for <b>$${total.toFixed(2)}</b> has been generated.</p>
                                        <p><b>Due Date:</b> ${invoice.dueDate}</p>
                                        <div style="margin: 20px 0; padding: 15px; background: #f3f4f6; border-radius: 8px;">
                                            <strong>Amount Due: $${total.toFixed(2)}</strong>
                                        </div>
                                        <p>Please contact us for payment details or view the attached documentation.</p>
                                        <br/>
                                        <p>Regards,</p>
                                        <p><strong>${invoice.senderName}</strong></p>
                                    </div>
                                `
                            });
                            alert("Invoice sent successfully via email!");
                        } catch (e) {
                            console.error(e);
                            alert("Failed to send email.");
                        } finally {
                            setLoading(false);
                        }
                    }}
                    disabled={loading}
                    className="w-full py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl font-bold shadow-sm transition-all flex items-center justify-center gap-2 group"
                >
                    {/* Send Icon (import manually or use Download for now if Import fails in replace, but I will try to add it) */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg> 
                    {loading ? 'Sending...' : 'Send via Email'}
                </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InvoiceBuilder;