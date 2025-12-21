import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { useSettings } from '../../context/SettingsContext';

export const useInvoiceEngine = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { settings } = useSettings();
  
  // Initialize viewMode based on incoming state
  const initialViewMode = location.state?.invoice || location.state?.quoteItems ? 'edit' : 'list';
  const [viewMode, setViewMode] = useState(initialViewMode); 
  
  const [invoicesList, setInvoicesList] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectJobs, setProjectJobs] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [activeTab, setActiveTab] = useState('all'); 

  const [invoice, setInvoice] = useState(() => getInitialInvoiceState(settings, location.state));
  const [saving, setSaving] = useState(false);
  
  // Harvest State
  const [showHarvest, setShowHarvest] = useState(false);
  const [harvestableDiaries, setHarvestableDiaries] = useState([]);
  const [selectedDiaryIds, setSelectedDiaryIds] = useState(new Set());
  const [harvestLoading, setHarvestLoading] = useState(false);
  const [consolidateItems, setConsolidateItems] = useState(true);

  function getInitialInvoiceState(s, state = null) {
      // If editing existing invoice
      if (state?.invoice) {
          return { ...state.invoice, items: state.invoice.invoiceData?.items || state.invoice.items || [] };
      }

      // If creating from Quote or Diary
      let initialItems = [];
      let initialProject = state?.projectId || null;
      let initialClient = state?.clientId || null;
      let initialClientName = state?.clientName || '';
      let initialClientAddress = state?.clientAddress || '';

      if (state?.quoteItems) {
          initialItems = state.quoteItems.map(i => ({
              description: i.material?.name || i.description || 'Item',
              quantity: i.quantity || 1,
              rate: i.customRate !== undefined ? i.customRate : (i.rate || 0),
              amount: (i.quantity || 1) * (i.customRate !== undefined ? i.customRate : (i.rate || 0)),
              unit: i.unit || 'ea',
              category: i.type || 'General'
          }));
      } else if (state?.diaryItems) {
          initialItems = state.diaryItems.map(i => ({
              description: i.description || i.name || 'Diary Item',
              quantity: i.quantity || 1,
              rate: i.rate || i.price || 0,
              amount: (i.quantity || 1) * (i.rate || i.price || 0),
              unit: i.unit || 'ea',
              category: i.category || 'General'
          }));
      }

      return {
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        status: 'draft',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        clientId: initialClient, 
        clientName: initialClientName, 
        clientEmail: state?.clientEmail || '', 
        clientAddress: initialClientAddress,
        senderName: s.companyName || 'My Construction Co', 
        senderAddress: s.companyAddress || '',
        senderEmail: s.companyEmail || '',
        senderPhone: s.companyPhone || '',
        senderLogo: s.companyLogo || null, 
        senderABN: s.companyABN || '',
        bankName: s.bankName || '',
        bankAccount: s.bankAccount || '',
        bankBSB: s.bankBSB || '',
        items: initialItems,
        taxRate: parseFloat(s.defaultTaxRate) || 0,
        discountType: 'percent', // 'percent' or 'fixed'
        discountValue: 0,
        currency: s.currency || 'USD',
        notes: '', 
        terms: '', 
        projectId: initialProject || null, 
        jobId: null, 
        accentColor: '#4f46e5',
        theme: 'modern' // 'modern', 'classic', 'minimal'
      };
  }

  const calculateTotals = useCallback(() => {
    const subtotal = (invoice.items || []).reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0);
    
    let discountAmount = 0;
    if (invoice.discountType === 'percent') {
        discountAmount = subtotal * (parseFloat(invoice.discountValue || 0) / 100);
    } else {
        discountAmount = parseFloat(invoice.discountValue || 0);
    }
    
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxAmount = taxableAmount * (parseFloat(invoice.taxRate) / 100);
    
    return { 
        subtotal, 
        discountAmount, 
        taxableAmount, 
        taxAmount, 
        total: taxableAmount + taxAmount 
    };
  }, [invoice]);

  const fetchData = useCallback(async () => {
      setListLoading(true);
      try {
          const [invRes, projRes] = await Promise.all([api.get('/invoices'), api.get('/projects')]);
          setInvoicesList(invRes.data);
          setProjects(projRes.data.data || projRes.data || []);
      } catch (err) { console.error(err); }
      finally { setListLoading(false); }
  }, []);

  const handleHarvest = async () => {
      if (!invoice.projectId) return alert("Select project first");
      setHarvestLoading(true);
      try {
          // Fetch uninvoiced diaries
          let url = `/invoices/uninvoiced-diaries?projectId=${invoice.projectId}`;
          if (invoice.jobId) url += `&jobId=${invoice.jobId}`; 
          const res = await api.get(url);
          setHarvestableDiaries(res.data);
          setShowHarvest(true);
      } catch (e) { console.error(e); }
      finally { setHarvestLoading(false); }
  };

  const importHarvest = () => {
      const selected = harvestableDiaries.filter(d => selectedDiaryIds.has(d.id));
      let newItems = [...invoice.items];
      
      selected.forEach(d => {
          const jobRef = d.job?.jobNumber ? `[#${d.job.jobNumber}] ` : '';

          // 1. Try Canvas Data
          if (d.canvasData && d.canvasData.length > 0) {
              d.canvasData.forEach(entry => {
                  (entry.items || []).forEach(i => {
                      const qty = i.duration || i.quantity || 1;
                      const rate = i.chargeRate || 0;
                      newItems.push({ 
                          description: `${jobRef}${new Date(d.date).toLocaleDateString()}: ${i.name}`, 
                          quantity: qty, 
                          rate, 
                          amount: qty * rate, 
                          unit: i.type === 'staff' ? 'hrs' : 'ea',
                          category: i.type === 'staff' ? 'Labour' : 'Materials' 
                      });
                  });
              });
          } 
          // 2. Fallback to Total Revenue
          else if (d.totalRevenue > 0) {
              newItems.push({
                  description: `${jobRef}Site Diary: ${new Date(d.date).toLocaleDateString()} - ${d.job?.serviceType || 'General Work'}`,
                  quantity: 1,
                  rate: d.totalRevenue,
                  amount: d.totalRevenue,
                  unit: 'day',
                  category: 'Service'
              });
          }
      });
      
      setInvoice(prev => ({ ...prev, items: newItems, diaryIds: Array.from(selectedDiaryIds) }));
      setShowHarvest(false);
  };

  const handleBulkAction = async (actionType) => {
      if (selectedIds.size === 0) return alert("No invoices selected");
      if (!confirm(`Are you sure you want to ${actionType} selected invoices?`)) return;

      try {
          const ids = Array.from(selectedIds);
          if (actionType === 'delete') {
              // Not implemented in backend bulk yet
              alert("Bulk delete coming soon. Please delete individually.");
          } else {
              // Map action to status
              let status = actionType; 
              await api.put('/invoices/bulk-status', { ids, status });
              fetchData();
              setSelectedIds(new Set());
          }
      } catch (err) {
          console.error(err);
          alert("Bulk action failed");
      }
  };

  const handleLogoUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => {
          setInvoice(prev => ({ ...prev, senderLogo: reader.result }));
      };
      reader.readAsDataURL(file);
  };

  const handleSave = async (silent = false) => {
    setSaving(true);
    try {
      const totals = calculateTotals();
      const payload = { 
          ...invoice, 
          totalAmount: totals.total, 
          invoiceData: { ...invoice, ...totals },
          diaryIds: invoice.diaryIds || [] 
      };
      
      let res = invoice.id ? await api.put(`/invoices/${invoice.id}`, payload) : await api.post('/invoices', payload);
      
      if (res.data) {
          setInvoice(prev => ({ ...prev, id: res.data.id }));
          if (!silent) alert('Saved successfully!');
          fetchData(); 
      }
    } catch (error) { 
        console.error(error);
        alert("Failed to save invoice.");
    } finally { 
        setSaving(false); 
    }
  };

  return {
    viewMode, setViewMode, invoicesList, projects, projectJobs, setProjectJobs, listLoading, searchTerm, setSearchTerm,
    selectedIds, setSelectedIds, activeTab, setActiveTab, invoice, setInvoice, saving, showHarvest, setShowHarvest, 
    harvestableDiaries, selectedDiaryIds, setSelectedDiaryIds, harvestLoading, consolidateItems, setConsolidateItems,
    calculateTotals, fetchData, handleSave, handleHarvest, importHarvest, getInitialInvoiceState, settings, handleBulkAction, handleLogoUpload
  };
};
