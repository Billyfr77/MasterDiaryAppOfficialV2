import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Save, PenTool, Printer, MapPin, 
  Calendar, Clock, Shield, AlertTriangle, FileText, CheckCircle2, Download 
} from 'lucide-react';
import { RiskMatrix, PPEGrid, SWMSEditor } from './SafetyComponents';
import { SAFETY_TEMPLATES } from './SafetyTemplates';

const SafetyFormViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // details, risks, signatures
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    type: 'SWMS',
    projectId: '',
    status: 'DRAFT',
    latitude: null,
    longitude: null,
    data: {
      steps: [], // For SWMS
      ppe: {},
      location: '',
      date: new Date().toISOString().split('T')[0]
    },
    signatures: []
  });

  const [projects, setProjects] = useState([]);
  const [signaturePadOpen, setSignaturePadOpen] = useState(false);
  const [signerName, setSignerName] = useState('');
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    fetchProjects();
    if (!isNew) fetchForm();
  }, [id]);

  const fetchProjects = async () => {
    try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5003/api/projects', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const projectData = Array.isArray(res.data) ? res.data : (res.data.data || []);
        setProjects(projectData);
    } catch (err) { console.error("Failed to load projects", err); }
  };

  const fetchForm = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5003/api/safety/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Data Migration for Old SWMS
      let loadedData = res.data.data || {};
      if (res.data.type === 'SWMS' && !loadedData.steps) {
          loadedData.steps = [
              { id: 1, activity: loadedData.activity || '', hazards: loadedData.hazards || '', controls: loadedData.controls || '', risk: null }
          ];
      }

      setFormData({ ...res.data, data: loadedData });
    } catch (error) {
      console.error('Error fetching form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDataChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      data: { ...prev.data, [key]: value }
    }));
  };

  const applyTemplate = (tmplId) => {
      if (!tmplId) return;
      const tmpl = SAFETY_TEMPLATES.find(t => t.id === tmplId);
      if(tmpl) {
          if(confirm('Overwrite current form with template data?')) {
              setFormData(prev => ({
                  ...prev,
                  title: isNew && !prev.title ? tmpl.title : prev.title, // Only overwrite title if empty or user wants
                  type: tmpl.type,
                  data: { ...prev.data, ...tmpl.data }
              }));
          }
      }
  };

  const captureLocation = () => {
      if(!navigator.geolocation) return alert("Geolocation not supported");
      navigator.geolocation.getCurrentPosition(
          (pos) => {
              setFormData(prev => ({
                  ...prev,
                  latitude: pos.coords.latitude,
                  longitude: pos.coords.longitude
              }));
              // Reverse geocode could go here if we wanted address
              alert("Location Tagged! Form will appear on Map.");
          },
          (err) => alert("Failed to get location: " + err.message)
      );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      const payload = { ...formData };
      if (!payload.projectId && projects.length > 0) payload.projectId = projects[0].id;

      if (isNew) {
        const res = await axios.post('http://localhost:5003/api/safety', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        navigate(`/safety/${res.data.id}`);
      } else {
        await axios.put(`http://localhost:5003/api/safety/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Saved successfully!');
      }
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Failed to save. Check console.');
    } finally {
      setSaving(false);
    }
  };

  // --- Signature Logic ---
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const saveSignature = async () => {
    if (!signerName) return alert("Please enter your name");
    const canvas = canvasRef.current;
    const signatureData = canvas.toDataURL();
    
    try {
        const token = localStorage.getItem('token');
        await axios.post(`http://localhost:5003/api/safety/${id}/sign`, {
            signatureData,
            signerName: signerName,
            signerRole: 'Worker' 
        }, { headers: { Authorization: `Bearer ${token}` } });
        
        setSignaturePadOpen(false);
        setSignerName('');
        fetchForm();
    } catch (err) { console.error("Sign Error", err); }
  };

  if (loading) return <div className="flex items-center justify-center h-screen text-white">Loading Safety Document...</div>;

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white font-sans overflow-hidden">
      {/* --- TOP BAR --- */}
      <div className="h-16 border-b border-gray-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/safety')} className="p-2 hover:bg-gray-100 dark:hover:bg-stone-800 rounded-full transition-colors">
                <ArrowLeft size={20} className="text-gray-500" />
            </button>
            <div>
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${formData.type === 'SWMS' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-orange-100 text-orange-700'}`}>
                        {formData.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{formData.status}</span>
                </div>
                <input 
                    className="bg-transparent text-lg font-bold outline-none placeholder-gray-500 w-[300px] md:w-[500px]" 
                    value={formData.title}
                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Document Title..."
                />
            </div>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={() => window.print()} className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                <Printer size={16} /> Print PDF
            </button>
            <button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all">
                <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
        </div>
      </div>

      {/* --- MAIN LAYOUT --- */}
      <div className="flex flex-1 overflow-hidden">
          {/* SIDEBAR TABS */}
          <div className="w-64 bg-white dark:bg-stone-950 border-r border-gray-200 dark:border-stone-800 flex flex-col pt-6 gap-1 px-3">
              {[
                  { id: 'details', label: 'Document Details', icon: FileText },
                  { id: 'risks', label: 'Risk Assessment', icon: Shield },
                  { id: 'signatures', label: 'Sign-Off Register', icon: PenTool },
              ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-stone-900'}`}
                  >
                      <tab.icon size={18} /> {tab.label}
                  </button>
              ))}
          </div>

          {/* CONTENT AREA */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gray-50 dark:bg-black/50">
              <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">
                  
                  {/* --- TAB: DETAILS --- */}
                  {activeTab === 'details' && (
                      <div className="space-y-6">
                          <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-gray-200 dark:border-stone-800 shadow-sm">
                              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><MapPin size={18} className="text-indigo-500"/> Project & Location</h3>
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Project</label>
                                      <select 
                                          value={formData.projectId} 
                                          onChange={(e) => setFormData(prev => ({...prev, projectId: e.target.value}))}
                                          className="w-full bg-gray-50 dark:bg-stone-800 border border-gray-200 dark:border-stone-700 rounded-xl p-3 outline-none"
                                      >
                                          <option value="">Select Project...</option>
                                          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                      </select>
                                  </div>
                                  <div>
                                      <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Site Location / Area</label>
                                      <input 
                                          value={formData.data.location || ''} 
                                          onChange={(e) => handleDataChange('location', e.target.value)}
                                          className="w-full bg-gray-50 dark:bg-stone-800 border border-gray-200 dark:border-stone-700 rounded-xl p-3 outline-none"
                                          placeholder="e.g. Level 3, North Wing"
                                      />
                                  </div>
                                  <div>
                                      <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Date</label>
                                      <input 
                                          type="date"
                                          value={formData.data.date || ''} 
                                          onChange={(e) => handleDataChange('date', e.target.value)}
                                          className="w-full bg-gray-50 dark:bg-stone-800 border border-gray-200 dark:border-stone-700 rounded-xl p-3 outline-none"
                                      />
                                  </div>
                              </div>
                          </div>

                          <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-gray-200 dark:border-stone-800 shadow-sm">
                              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Shield size={18} className="text-emerald-500"/> Mandatory PPE</h3>
                              <PPEGrid value={formData.data.ppe} onChange={val => handleDataChange('ppe', val)} />
                          </div>
                      </div>
                  )}

                  {/* --- TAB: RISKS (SWMS) --- */}
                  {activeTab === 'risks' && formData.type === 'SWMS' && (
                      <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-gray-200 dark:border-stone-800 shadow-sm">
                          <div className="flex justify-between items-center mb-6">
                              <h3 className="text-lg font-bold">Job Steps & Hazard Analysis</h3>
                              <div className="text-xs text-gray-500 bg-gray-100 dark:bg-stone-800 px-3 py-1 rounded-full">Interactive Matrix Enabled</div>
                          </div>
                          <SWMSEditor steps={formData.data.steps || []} onChange={steps => handleDataChange('steps', steps)} />
                      </div>
                  )}

                  {/* --- TAB: RISKS (GENERIC) --- */}
                  {activeTab === 'risks' && formData.type !== 'SWMS' && (
                      <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-gray-200 dark:border-stone-800 shadow-sm min-h-[400px]">
                          <textarea 
                              className="w-full h-full min-h-[300px] bg-transparent outline-none resize-none"
                              placeholder="Enter details..."
                              value={formData.data.details || ''}
                              onChange={e => handleDataChange('details', e.target.value)}
                          />
                      </div>
                  )}

                  {/* --- TAB: SIGNATURES --- */}
                  {activeTab === 'signatures' && (
                      <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {formData.signatures?.map((sig, idx) => (
                                  <div key={idx} className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-gray-200 dark:border-stone-800 flex flex-col items-center text-center shadow-sm">
                                      <img src={sig.signature} alt="Sig" className="h-16 object-contain mb-2" />
                                      <div className="font-bold text-gray-900 dark:text-white">{sig.name}</div>
                                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">{sig.role}</div>
                                      <div className="text-[10px] text-gray-400 mt-1">{new Date(sig.timestamp).toLocaleString()}</div>
                                  </div>
                              ))}
                              
                              <button 
                                  onClick={() => setSignaturePadOpen(true)}
                                  className="border-2 border-dashed border-gray-300 dark:border-stone-700 rounded-2xl flex flex-col items-center justify-center p-6 text-gray-400 hover:text-indigo-500 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all min-h-[160px]"
                              >
                                  <PenTool size={32} className="mb-2" />
                                  <span className="font-bold">Add Signature</span>
                              </button>
                          </div>
                      </div>
                  )}
              </div>
          </div>
      </div>

      {/* --- PRINT ONLY VIEW --- */}
      <div className="hidden print:block bg-white text-black p-8">
          <div className="text-center border-b-2 border-black pb-4 mb-6">
              <h1 className="text-3xl font-black uppercase">{formData.title}</h1>
              <div className="flex justify-center gap-6 mt-2 text-sm font-bold uppercase tracking-widest">
                  <span>{formData.type.replace('_', ' ')}</span>
                  <span>•</span>
                  <span>{formData.status}</span>
                  <span>•</span>
                  <span>{new Date(formData.data.date).toLocaleDateString()}</span>
              </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
              <div>
                  <h3 className="font-bold uppercase mb-1">Project Details</h3>
                  <div className="border border-black p-3">
                      <div className="grid grid-cols-[100px_1fr] gap-1">
                          <span className="font-bold">Project:</span>
                          <span>{projects.find(p => p.id === formData.projectId)?.name || 'N/A'}</span>
                          <span className="font-bold">Location:</span>
                          <span>{formData.data.location || 'Site Wide'}</span>
                      </div>
                  </div>
              </div>
              <div>
                  <h3 className="font-bold uppercase mb-1">PPE Requirements</h3>
                  <div className="border border-black p-3 flex flex-wrap gap-2">
                      {Object.entries(formData.data.ppe || {}).filter(([k,v]) => v).map(([k,v]) => (
                          <span key={k} className="px-2 py-1 bg-black text-white text-xs font-bold uppercase rounded">{k}</span>
                      ))}
                      {Object.values(formData.data.ppe || {}).every(v => !v) && <span>Standard Site PPE</span>}
                  </div>
              </div>
          </div>

          {formData.type === 'SWMS' && (
              <div className="mb-8">
                  <h3 className="font-bold uppercase mb-2">Safe Work Method Statement</h3>
                  <table className="w-full text-xs border border-black collapse">
                      <thead>
                          <tr className="bg-gray-200">
                              <th className="border border-black p-2 text-left w-10">#</th>
                              <th className="border border-black p-2 text-left">Activity / Step</th>
                              <th className="border border-black p-2 text-left">Hazards</th>
                              <th className="border border-black p-2 text-center w-16">Risk</th>
                              <th className="border border-black p-2 text-left">Control Measures</th>
                              <th className="border border-black p-2 text-center w-16">Res.</th>
                          </tr>
                      </thead>
                      <tbody>
                          {(formData.data.steps || []).map((step, idx) => (
                              <tr key={idx}>
                                  <td className="border border-black p-2 align-top">{idx + 1}</td>
                                  <td className="border border-black p-2 align-top whitespace-pre-wrap">{step.activity}</td>
                                  <td className="border border-black p-2 align-top whitespace-pre-wrap">{step.hazards}</td>
                                  <td className="border border-black p-2 align-top text-center font-bold">{step.risk?.label?.charAt(0) || '-'}</td>
                                  <td className="border border-black p-2 align-top whitespace-pre-wrap">{step.controls}</td>
                                  <td className="border border-black p-2 align-top text-center font-bold">{step.residualRisk?.label?.charAt(0) || '-'}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          )}

          {formData.type !== 'SWMS' && (
              <div className="mb-8 border border-black p-4 min-h-[300px] whitespace-pre-wrap text-sm">
                  {formData.data.details}
              </div>
          )}

          <div className="break-inside-avoid">
              <h3 className="font-bold uppercase mb-2 border-b border-black">Sign-Off Register</h3>
              <div className="grid grid-cols-3 gap-4">
                  {formData.signatures?.map((sig, idx) => (
                      <div key={idx} className="border border-black p-2 flex flex-col items-center">
                          <img src={sig.signature} className="h-12 object-contain" />
                          <div className="text-xs font-bold mt-1">{sig.name}</div>
                          <div className="text-[10px] uppercase">{sig.role}</div>
                          <div className="text-[10px]">{new Date(sig.timestamp).toLocaleDateString()}</div>
                      </div>
                  ))}
              </div>
          </div>
      </div>

      <style>{`
        @media print {
          @page { margin: 10mm; size: A4; }
          body { background: white; color: black; }
          /* Hide main app UI */
          .flex.flex-col.h-screen > .h-16, 
          .flex.flex-1.overflow-hidden,
          .fixed { display: none !important; }
          /* Show print view */
          .print\\:block { display: block !important; }
          /* Reset scroll */
          .overflow-hidden { overflow: visible !important; }
          .h-screen { height: auto !important; }
        }
      `}</style>

      {/* --- SIGNATURE MODAL --- */}
      {signaturePadOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-stone-900 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-white/10">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Sign Document</h3>
                
                <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                    <input 
                        className="w-full bg-gray-50 dark:bg-stone-800 border border-gray-200 dark:border-stone-700 rounded-lg p-2 outline-none"
                        placeholder="Type name..."
                        value={signerName}
                        onChange={e => setSignerName(e.target.value)}
                    />
                </div>

                <div className="bg-white rounded-xl border-2 border-gray-200 dark:border-stone-700 overflow-hidden touch-none mb-6 relative">
                    <canvas 
                        ref={canvasRef}
                        width={400}
                        height={200}
                        className="w-full h-[200px] cursor-crosshair bg-white"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={() => setIsDrawing(false)}
                        onMouseLeave={() => setIsDrawing(false)}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={() => setIsDrawing(false)}
                    />
                    <div className="absolute bottom-2 right-2 text-[10px] text-gray-300 pointer-events-none">Sign Above</div>
                </div>

                <div className="flex justify-between items-center">
                    <button onClick={() => {
                        const ctx = canvasRef.current.getContext('2d');
                        ctx.clearRect(0, 0, 400, 200);
                    }} className="text-sm font-bold text-gray-500 hover:text-rose-500 underline">Clear</button>
                    
                    <div className="flex gap-2">
                        <button onClick={() => setSignaturePadOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-white">Cancel</button>
                        <button onClick={saveSignature} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg">Accept & Sign</button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default SafetyFormViewer;