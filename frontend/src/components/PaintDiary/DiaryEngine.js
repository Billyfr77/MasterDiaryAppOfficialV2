import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useDiaryEngine = () => {
  const location = useLocation()
  const navigate = useNavigate()
  
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentEntry, setCurrentEntry] = useState({ 
      id: generateId(), 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
      items: [], 
      extraNodes: [],
      edges: [],
      photos: [], 
      voiceNotes: [], 
      location: null, 
      note: '' 
  })
  
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [selectedJobId, setSelectedJobId] = useState(null)
  const [projectJobs, setProjectJobs] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [diaryDbId, setDiaryDbId] = useState(null)

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
          const cRate = parseFloat(item.costRate) || 0;
          const rRate = parseFloat(item.chargeRate) || 0;

          if (item.type === 'staff') {
              const regular = Math.min(qty, overtimeThreshold);
              const overtime = Math.max(0, qty - overtimeThreshold);
              
              totalCost += (regular * cRate) + (overtime * cRate * overtimeMultiplier);
              totalRevenue += (regular * rRate) + (overtime * rRate * overtimeMultiplier);
          } else {
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
            resolved.chargeRate = matItem.pricePerUnit * 1.2; 
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

              aiNodes.forEach(node => {
                  if (node.type === 'diaryNode') {
                      const resolved = resolveItems([{ ...node, type: node.nodeType }])[0];
                      newItems.push({
                          id: node.id || generateId(),
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
                          position: node.position || { x: Math.random() * 400, y: Math.random() * 400 }
                      });
                  } else {
                      newExtraNodes.push({
                          id: node.id || generateId(),
                          type: node.type,
                          position: node.position || { x: Math.random() * 400, y: Math.random() * 400 },
                          data: {
                              ...node,
                              label: node.label,
                              startTime: node.startTime || "07:00",
                              duration: node.duration || 1
                          }
                      });
                  }
              });

              setCurrentEntry(prev => ({
                  ...prev, 
                  items: [...prev.items, ...newItems], 
                  extraNodes: [...prev.extraNodes, ...newExtraNodes],
                  edges: [...prev.edges, ...aiEdges],
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
          if (isItem) return { ...prev, items: prev.items.map(i => i.id === id ? { ...i, ...ups } : i) };
          return { ...prev, extraNodes: prev.extraNodes.map(n => n.id === id ? { ...n, data: { ...n.data, ...ups } } : n) };
      });
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

  return {
    selectedDate, setSelectedDate, currentEntry, setCurrentEntry, projects, selectedProject, setSelectedProject, projectJobs, selectedJobId, setSelectedJobId,
    selectedClient, setSelectedClient, staff, equipment, materials, isSaved, setIsSaved, isSaving, cost, revenue, profit, productivityScore,
    chatMessages, chatTyping, smartLogLoading, setSmartLogLoading, handleUpdateItem, handleRemoveItem,
    handleSave, handleSmartLog, fetchData, generateId
  };
};