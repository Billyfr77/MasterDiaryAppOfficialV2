import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { useSettings } from '../../context/SettingsContext';

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useDiaryEngine = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { settings } = useSettings();
  
  const materialMarkup = parseFloat(settings.defaultMaterialMarkup) || 1.2;
  const allowanceMarkup = parseFloat(settings.defaultAllowanceMarkup) || 1.2;

  const [selectedDate, setSelectedDate] = useState(() => {
      try {
          const saved = localStorage.getItem('masterdiary-draft-date');
          return saved ? new Date(saved) : new Date();
      } catch { return new Date(); }
  });

  const [currentEntry, setCurrentEntry] = useState(() => {
      try {
          const saved = localStorage.getItem('masterdiary-draft-entry');
          if (saved) return JSON.parse(saved);
      } catch (e) { console.error("Draft parse error", e); }
      return { 
          id: generateId(), 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
          items: [], 
          extraNodes: [],
          edges: [],
          photos: [], 
          voiceNotes: [], 
          location: null, 
          note: '' 
      };
  });

  // Persist State
  useEffect(() => {
      if (selectedDate) localStorage.setItem('masterdiary-draft-date', selectedDate.toISOString());
  }, [selectedDate]);

  useEffect(() => {
      localStorage.setItem('masterdiary-draft-entry', JSON.stringify(currentEntry));
  }, [currentEntry]);
  
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [selectedJobId, setSelectedJobId] = useState(null)
  const [projectJobs, setProjectJobs] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [diaryDbId, setDiaryDbId] = useState(() => {
      return localStorage.getItem('masterdiary-draft-dbid') || null;
  });

  useEffect(() => {
      if (diaryDbId) localStorage.setItem('masterdiary-draft-dbid', diaryDbId);
      else localStorage.removeItem('masterdiary-draft-dbid');
  }, [diaryDbId]);

  const [staff, setStaff] = useState([])
  const [equipment, setEquipment] = useState([])
  const [materials, setMaterials] = useState([])
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  const [cost, setCost] = useState(0)
  const [revenue, setRevenue] = useState(0)
  const [profit, setProfit] = useState(0)
  const [productivityScore, setProductivityScore] = useState(0)
  
  // Overtime Settings
  const [overtimeThreshold, setOvertimeThreshold] = useState(8);
  const [overtimeMultiplier, setOvertimeMultiplier] = useState(1.5);

  // AI & Extra
  const [chatMessages, setChatMessages] = useState([])
  const [chatTyping, setChatTyping] = useState(false)
  const [smartLogLoading, setSmartLogLoading] = useState(false)

  // --- CALCULATIONS ---
  useEffect(() => {
      let totalCost = 0;
      let totalRevenue = 0;

      (currentEntry.items || []).forEach(item => {
          const qty = parseFloat(item.quantity) || 0;
          
          if (item.type === 'staff') {
              const baseRate = parseFloat(item.costRate) || 0;
              const chargeRate = parseFloat(item.chargeRate) || 0;
              
              // --- NIGHT WORKS DETECTION ---
              // If shift starts after 6 PM (18:00) or before 6 AM (06:00), apply night rate
              const startHr = parseInt((item.startTime || '07:00').split(':')[0]);
              const isNight = startHr >= 18 || startHr < 6;

              let lineCost = 0;
              let lineRevenue = 0;

              if (isNight) {
                  const nightCostRate = item.payRateNight || (baseRate * 2.0);
                  const nightChargeRate = item.chargeOutNight || (chargeRate * 2.0);
                  lineCost = qty * nightCostRate;
                  lineRevenue = qty * nightChargeRate;
              } else {
                  // Standard Multi-Tier OT Logic
                  const regHrs = Math.min(qty, overtimeThreshold);
                  const ot1Hrs = Math.min(Math.max(0, qty - overtimeThreshold), 2);
                  const ot2Hrs = Math.max(0, qty - (overtimeThreshold + 2));

                  const r2_c = item.payRateOT1 || (baseRate * 1.5);
                  const r2_r = item.chargeOutOT1 || (chargeRate * 1.5);
                  const r3_c = item.payRateOT2 || (baseRate * 2.0);
                  const r3_r = item.chargeOutOT2 || (chargeRate * 2.0);

                  lineCost = (regHrs * baseRate) + (ot1Hrs * r2_c) + (ot2Hrs * r3_c);
                  lineRevenue = (regHrs * chargeRate) + (ot1Hrs * r2_r) + (ot2Hrs * r3_r);
              }

              // --- ALLOWANCES CALCULATION ---
              if (item.activeAllowances?.length > 0) {
                  item.activeAllowances.forEach(al => {
                      const alRate = parseFloat(al.rate) || 0;
                      if (al.type === 'hourly') {
                          lineCost += qty * alRate;
                          lineRevenue += qty * alRate * allowanceMarkup; 
                      } else {
                          // Daily
                          lineCost += alRate;
                          lineRevenue += alRate * allowanceMarkup;
                      }
                  });
              }

              totalCost += lineCost;
              totalRevenue += lineRevenue;
          } else if (item.type === 'material') {
              const cRate = parseFloat(item.costRate) || 0;
              const rRate = item.chargeRate !== undefined ? parseFloat(item.chargeRate) : (cRate * materialMarkup);
              totalCost += qty * cRate;
              totalRevenue += qty * rRate;
          } else {
              const cRate = parseFloat(item.costRate) || 0;
              const rRate = parseFloat(item.chargeRate) || 0;
              totalCost += qty * cRate;
              totalRevenue += qty * rRate;
          }
      });

      setCost(totalCost);
      setRevenue(totalRevenue);
      setProfit(totalRevenue - totalCost);
      
      const efficiency = totalRevenue > 0 ? (totalRevenue - totalCost) / totalRevenue : 0;
      setProductivityScore(Math.round(Math.min(100, Math.max(0, efficiency * 100))));

  }, [currentEntry, overtimeThreshold, overtimeMultiplier]);

  // --- DATA LOADING ---
  const fetchData = useCallback(async () => {
    try {
      const [projectsRes, staffRes, equipRes, nodesRes] = await Promise.all([
          api.get('/projects'), 
          api.get('/staff?limit=1000'), 
          api.get('/equipment?limit=1000'), 
          api.get('/nodes?limit=1000')
      ]);
      setProjects(projectsRes.data.data || projectsRes.data || []);
      setStaff(staffRes.data.data || staffRes.data || []);
      setEquipment(equipRes.data.data || equipRes.data || []);
      setMaterials(nodesRes.data.data || nodesRes.data || []);

      if (location.state?.projectId) {
          const pre = (projectsRes.data.data || projectsRes.data).find(p => p.id === location.state.projectId);
          if (pre) setSelectedProject(pre);
      }
    } catch (err) { console.error(err); }
  }, [location.state]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Sync Client & Fetch Jobs when Project Changes
  useEffect(() => {
    if (selectedProject) {
       if (selectedProject.clientId) {
          setSelectedClient({ id: selectedProject.clientId, name: selectedProject.clientDetails?.name || selectedProject.client || '' });
       }
       api.get(`/jobs?projectId=${selectedProject.id}`).then(res => setProjectJobs(res.data.data || res.data || []));
    } else {
        setProjectJobs([]);
        setSelectedJobId(null);
    }
  }, [selectedProject]);

  // --- HELPER TO RESOLVE ITEMS ---
  const resolveItems = useCallback((items) => {
    if (!items || !Array.isArray(items)) return [];
    return items.map(item => {
      let resolved = { ...item };
      const lookupId = item.nodeId || item.dataId;
      const type = item.type || item.nodeType;

      if (type === 'staff') {
        const staffItem = staff.find(s => String(s.id) === String(lookupId));
        if (staffItem) { 
            resolved.name = staffItem.name; 
            resolved.costRate = staffItem.payRateBase; 
            resolved.chargeRate = staffItem.chargeOutBase;
            resolved.payRateOT1 = staffItem.payRateOT1;
            resolved.payRateOT2 = staffItem.payRateOT2;
            resolved.payRateNight = staffItem.payRateNight;
            resolved.chargeOutOT1 = staffItem.chargeOutOT1;
            resolved.chargeOutOT2 = staffItem.chargeOutOT2;
            resolved.chargeOutNight = staffItem.chargeOutNight;
            resolved.availableAllowances = staffItem.allowances || [];
        }
      } else if (type === 'equipment') {
        const equipItem = equipment.find(e => String(e.id) === String(lookupId));
        if (equipItem) { 
            resolved.name = equipItem.name; 
            resolved.costRate = equipItem.costRateBase; 
            resolved.chargeRate = equipItem.chargeOutBase; 
        }
      } else if (type === 'material') {
        const matItem = materials.find(m => String(m.id) === String(lookupId));
        if (matItem) { 
            resolved.name = matItem.name; 
            resolved.costRate = matItem.pricePerUnit; 
            resolved.chargeRate = matItem.pricePerUnit * materialMarkup; 
        }
      }
      return resolved;
    });
  }, [staff, equipment, materials]);

  const handleSmartLog = async (prompt) => {
      setSmartLogLoading(true);
      try {
          const res = await api.post('/ai/parse-diary', { prompt });
          const { nodes: aiNodes = [], edges: aiEdges = [], note = "" } = res.data;
          
          if (aiNodes.length > 0) {
              const newItems = [];
              const newExtraNodes = [];
              const newEdges = [];

              // Column-based organization logic
              const chronosNodes = aiNodes.filter(n => n.type === 'chronos');
              
              aiNodes.forEach((node, idx) => {
                  const xPos = node.type === 'chronos' ? 100 : 600;
                  const yPos = idx * 200;

                  if (node.type === 'diaryNode') {
                      const resolved = resolveItems([{ ...node, type: node.nodeType }])[0];
                      const itemId = node.id || generateId();
                      newItems.push({
                          id: itemId,
                          dataId: node.nodeId || node.id,
                          type: node.nodeType || 'material',
                          name: resolved.name || node.label,
                          costRate: resolved.costRate || 0,
                          chargeRate: resolved.chargeRate || 0,
                          quantity: node.quantity || 1,
                          duration: node.quantity || 1,
                          startTime: node.startTime || "07:00",
                          finishTime: node.finishTime || "15:00",
                          note: node.note || '',
                          position: node.position || { x: xPos, y: yPos }
                      });

                      // Auto-link to first chronos if no edges
                      if (aiEdges.length === 0 && chronosNodes.length > 0) {
                          newEdges.push({
                              id: `e-auto-${chronosNodes[0].id}-${itemId}`,
                              source: chronosNodes[0].id,
                              target: itemId,
                              animated: true,
                              type: 'neon'
                          });
                      }
                  } else {
                      const extraId = node.id || generateId();
                      newExtraNodes.push({
                          id: extraId,
                          type: node.type,
                          position: node.position || { x: xPos, y: yPos },
                          data: {
                              ...node,
                              label: node.label,
                              startTime: node.startTime || "07:00",
                              duration: node.duration || 1,
                              onDelete: () => handleRemoveItem(extraId)
                          }
                      });
                  }
              });

              setCurrentEntry(prev => ({
                  ...prev, 
                  items: [...prev.items, ...newItems], 
                  extraNodes: [...prev.extraNodes, ...newExtraNodes],
                  edges: [...prev.edges, ...aiEdges, ...newEdges],
                  note: note || prev.note 
              }));
              setIsSaved(false);
          }
      } catch (err) { console.error(err); }
      finally { setSmartLogLoading(false); }
  };

  const handleUpdateItem = useCallback((id, ups) => {
      setCurrentEntry(prev => {
          const isItem = prev.items.find(i => i.id === id);
          if (isItem) {
              const updates = { ...ups };
              // Sync Duration -> Quantity for Time-Based Items (Staff/Equipment)
              if (updates.duration !== undefined && (isItem.type === 'staff' || isItem.type === 'equipment')) {
                  updates.quantity = updates.duration;
              }
              return { ...prev, items: prev.items.map(i => i.id === id ? { ...i, ...updates } : i) };
          }
          return { 
              ...prev, 
              extraNodes: prev.extraNodes.map(n => {
                  if (n.id === id) {
                      // Extract position to apply to root, keep everything in data too
                      const { position, ...rest } = ups;
                      const updatedNode = { ...n };
                      if (position) updatedNode.position = position;
                      updatedNode.data = { ...n.data, ...ups };
                      return updatedNode;
                  }
                  return n;
              }) 
          };
      });
      setIsSaved(false);
  }, []);

  const handleUpdateEdges = useCallback((newEdges) => {
      setCurrentEntry(prev => ({ ...prev, edges: newEdges }));
      setIsSaved(false);
  }, []);

  const handleRemoveItem = useCallback((id) => {
      setCurrentEntry(prev => ({
          ...prev,
          items: prev.items.filter(i => i.id !== id),
          extraNodes: prev.extraNodes.filter(n => n.id !== id),
          edges: prev.edges.filter(e => e.source !== id && e.target !== id)
      }));
      setIsSaved(false);
  }, []);

  const handleSmartChat = async (message) => {
      if (!message.trim()) return;
      
      const userMsg = { id: generateId(), role: 'user', content: message };
      setChatMessages(prev => [...prev, userMsg]);
      setChatTyping(true);

      try {
          const res = await api.post('/ai/chat-smart', {
              message,
              context: {
                  canvasItems: currentEntry.items,
                  canvasContext: currentEntry.note
              }
          });

          const aiMsg = { 
              id: generateId(), 
              role: 'assistant', 
              content: res.data.reply,
              suggestedNodes: res.data.suggestedNodes || [],
              suggestedTemplates: res.data.suggestedTemplates || []
          };
          setChatMessages(prev => [...prev, aiMsg]);
      } catch (err) {
          console.error("Chat Error:", err);
          setChatMessages(prev => [...prev, { id: generateId(), role: 'assistant', content: "Sorry, I'm having trouble connecting to my neural network." }]);
      } finally {
          setChatTyping(false);
      }
  };

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const data = { 
          date: selectedDate.toISOString().split('T')[0], 
          projectId: selectedProject?.id, 
          jobId: selectedJobId,
          clientId: selectedClient?.id, 
          canvasData: [currentEntry], 
          totalCost: cost, 
          totalRevenue: revenue 
      }
      if (diaryDbId) await api.put(`/paint-diaries/${diaryDbId}`, data);
      else { 
          const res = await api.post('/paint-diaries', data); 
          setDiaryDbId(res.data.id); 
      }
      setIsSaved(true);
    } catch (e) { console.error(e); }
    finally { setIsSaving(false); }
  };

  const loadDiary = useCallback((diary) => {
      if (!diary) return;
      setSelectedDate(new Date(diary.date));
      setSelectedProject(projects.find(p => p.id === diary.projectId) || null);
      setSelectedJobId(diary.jobId || null);
      setDiaryDbId(diary.id);
      
      const entry = diary.canvasData?.[0] || { 
          id: generateId(), 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
          items: [], extraNodes: [], edges: [] 
      };
      setCurrentEntry(entry);
      setIsSaved(true);
  }, [projects]);

  const handleDeleteDiary = async (id) => {
      if (!confirm("Are you sure you want to permanently delete this diary entry?")) return;
      try {
          await api.delete(`/paint-diaries/${id}`);
          if (diaryDbId === id) {
              createNewDiary();
          }
          return true;
      } catch (err) {
          console.error("Failed to delete diary:", err);
          alert("Failed to delete diary.");
          return false;
      }
  };

  const createNewDiary = useCallback(() => {
      localStorage.removeItem('masterdiary-draft-entry');
      localStorage.removeItem('masterdiary-draft-date');
      setSelectedDate(new Date());
      setCurrentEntry({ 
          id: generateId(), 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
          items: [], extraNodes: [], edges: [], photos: [], voiceNotes: [], location: null, note: '' 
      });
      setDiaryDbId(null);
      setIsSaved(false);
      setCost(0); setRevenue(0); setProfit(0);
  }, []);

  return {
    selectedDate, setSelectedDate, currentEntry, setCurrentEntry, projects, selectedProject, setSelectedProject, projectJobs, selectedJobId, setSelectedJobId,
    selectedClient, setSelectedClient, staff, equipment, materials, isSaved, setIsSaved, isSaving, cost, revenue, profit, productivityScore,
    chatMessages, chatTyping, smartLogLoading, setSmartLogLoading, handleUpdateItem, handleRemoveItem, handleUpdateEdges,
    handleSave, handleSmartLog, handleSmartChat, fetchData, generateId, createNewDiary, loadDiary, handleDeleteDiary
  };
};