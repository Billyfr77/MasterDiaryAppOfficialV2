import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Save, PenTool, Printer, MapPin, 
  Calendar, Shield, AlertTriangle, FileText, Download, Wrench, Edit3, Eye, CheckCircle2, Trash2
} from 'lucide-react';
import { RiskMatrix, PPEGrid, SWMSEditor } from './SafetyComponents';
import { SAFETY_TEMPLATES } from './SafetyTemplates';
import SafetyFormBuilder from './SafetyFormBuilder';

const SafetyFormViewer = ({ formId, onClose }) => {
  // Handle both route params and direct prop usage (for Dashboard modal)
  const params = useParams();
  const id = formId || params.id;
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // details, risks, signatures
  const [isBuilderMode, setIsBuilderMode] = useState(false);
  const [isEditing, setIsEditing] = useState(isNew); // Default to Edit if new, View if existing
  
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
      date: new Date().toISOString().split('T')[0],
      fileUrl: null, // For imported docs
      mimetype: null
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
    if (!isNew && id) fetchForm();
  }, [id]);

  const fetchProjects = async () => {
    try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/projects', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const projectData = Array.isArray(res.data) ? res.data : (res.data.data || []);
        setProjects(projectData);
    } catch (err) { console.error("Failed to load projects", err); }
  };

  const fetchForm = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/safety/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Data Migration / Normalization
      let loadedData = res.data.data || {};
      
      // Ensure imported file data is at top level of data object if nested
      if(res.data.type === 'IMPORTED_DOC' && !loadedData.fileUrl && res.data.data?.fileUrl) {
          loadedData = res.data.data;
      }

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

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      // Normalize projectId (send null if empty string)
      const payload = { ...formData };
      if (payload.projectId === '') payload.projectId = null;

      let savedId = id;

      if (isNew) {
        const res = await axios.post('/api/safety', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        savedId = res.data.id;
        // If loaded via modal, we might need to notify parent, but for now we just switch mode
        if(onClose) {
             // If creating new from dashboard, close modal and maybe refresh? 
             // Ideally we stay open in view mode.
             // But existing behavior was navigate.
        } else {
             navigate(`/safety/${savedId}`);
        }
      } else {
        await axios.put(`/api/safety/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Saved successfully!');
      }
      setIsEditing(false); // Switch back to view mode after save
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Failed to save. Check console.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
      if (!window.confirm("Are you sure you want to delete this document? This cannot be undone.")) return;
      
      setDeleting(true);
      try {
          const token = localStorage.getItem('token');
          await axios.delete(`/api/safety/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          alert("Document deleted.");
          if (onClose) onClose();
          else navigate('/safety');
      } catch (error) {
          console.error("Delete failed", error);
          alert("Failed to delete document.");
      } finally {
          setDeleting(false);
      }
  };

  const handleClose = () => {
      if (onClose) onClose();
      else navigate('/safety');
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
        await axios.post(`/api/safety/${id}/sign`, {
            signatureData,
            signerName: signerName,
            signerRole: 'Worker' 
        }, { headers: { Authorization: `Bearer ${token}` } });
        
        setSignaturePadOpen(false);
        setSignerName('');
        fetchForm(); // Refresh to see signature
    } catch (err) { console.error("Sign Error", err); }
  };

  // --- RENDERERS ---

  const renderFileViewer = () => {
      const { fileUrl, mimetype } = formData.data;
      if (!fileUrl) return <div className="p-10 text-center text-gray-500">No file attached.</div>;

      const isImage = mimetype?.startsWith('image/') || fileUrl.match(/\.(jpeg|jpg|gif|png)$/i);
      const isPdf = mimetype === 'application/pdf' || fileUrl.toLowerCase().endsWith('.pdf');

      return (
          <div className="bg-stone-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl min-h-[500px] flex flex-col">
              <div className="p-4 bg-black/50 border-b border-white/5 flex justify-between items-center">
                  <span className="font-bold text-white flex items-center gap-2"><FileText size={16}/> Attached Document</span>
                  <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-indigo-400 hover:text-white flex items-center gap-1">
                      <Download size={12} /> Download Original
                  </a>
              </div>
              <div className="flex-1 bg-stone-800 flex items-center justify-center relative">
                  {isImage ? (
                      <img src={fileUrl} alt="Document" className="max-w-full max-h-[80vh] object-contain" />
                  ) : isPdf ? (
                      <iframe src={fileUrl} className="w-full h-[80vh]" title="PDF Viewer" />
                  ) : (
                      <div className="text-center p-10">
                          <FileText size={64} className="mx-auto text-gray-600 mb-4" />
                          <p className="text-gray-400 mb-4">This file type cannot be previewed directly.</p>
                          <a href={fileUrl} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold">Download File</a>
                      </div>
                  )}
              </div>
          </div>
      );
  };

  const renderViewMode = () => {
      if (formData.type === 'IMPORTED_DOC') {
          return renderFileViewer();
      }

      // Standard Form View (Portal Style)
      return (
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-gray-200 dark:border-white/5 animate-fade-in-up min-h-[calc(100vh-100px)]">
              {/* Header Banner - Screen Only */}
              <div className="print:hidden bg-stone-100 dark:bg-black/40 p-8 border-b border-gray-200 dark:border-white/5 text-center">
                  <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-2">{formData.title}</h1>
                  <div className="flex flex-wrap justify-center gap-4 text-sm font-bold uppercase tracking-widest text-gray-500">
                      <span className="flex items-center gap-2"><Shield size={14} className="text-indigo-500" /> {formData.type.replace('_', ' ')}</span>
                      <span className="w-px h-4 bg-gray-300 dark:bg-white/10" />
                      <span className="flex items-center gap-2"><MapPin size={14} className="text-orange-500" /> {projects.find(p => p.id === formData.projectId)?.name || 'Unassigned Project'}</span>
                      <span className="w-px h-4 bg-gray-300 dark:bg-white/10" />
                      <span className="flex items-center gap-2"><Calendar size={14} className="text-emerald-500" /> {new Date(formData.data.date).toLocaleDateString()}</span>
                  </div>
              </div>

              {/* Document Body (Visible on Screen + Print) */}
              <div className="p-8 space-y-8 print:p-0 print:space-y-4">
                  {/* --- PRINT ONLY HEADER (Professional Table) --- */}
                  <div className="hidden print:block border-2 border-black mb-6">
                      <div className="grid grid-cols-[150px_1fr_150px] border-b-2 border-black">
                          <div className="p-4 border-r-2 border-black flex items-center justify-center font-bold bg-gray-100 text-lg">
                              SAFETY
                          </div>
                          <div className="p-4 text-center">
                              <h1 className="text-xl font-black uppercase tracking-wide">{formData.title}</h1>
                              <div className="text-xs mt-1 font-bold uppercase">{formData.type.replace('_', ' ')}</div>
                          </div>
                          <div className="p-2 border-l-2 border-black text-[10px] space-y-1 font-mono">
                              <div className="flex justify-between"><span>Ver:</span> <span>{formData.version || '1.0'}</span></div>
                              <div className="flex justify-between"><span>Date:</span> <span>{new Date(formData.data.date).toLocaleDateString()}</span></div>
                              <div className="flex justify-between"><span>Status:</span> <span>{formData.status}</span></div>
                          </div>
                      </div>
                      <div className="grid grid-cols-2 text-xs">
                          <div className="p-2 border-r border-black border-b"><strong>Project:</strong> {projects.find(p => p.id === formData.projectId)?.name || 'N/A'}</div>
                          <div className="p-2 border-b"><strong>Location:</strong> {formData.data.location || 'Site Wide'}</div>
                      </div>
                  </div>

                  {/* Details Section (Screen) */}
                  {(formData.data.location || formData.locationDetails) && (
                       <div className="bg-gray-50 dark:bg-stone-800/50 p-6 rounded-xl border border-gray-100 dark:border-white/5 print:hidden">
                           <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Location & Scope</h3>
                           <p className="text-lg font-medium text-gray-800 dark:text-gray-200">{formData.data.location || formData.locationDetails}</p>
                       </div>
                  )}

                  {/* Dynamic Fields (AI/Builder) */}
                  {formData.data.fields && (
                      <div className="space-y-6 print:space-y-4">
                          {formData.data.fields.map((field, idx) => (
                              <div key={idx} className="border-b border-gray-100 dark:border-white/5 pb-6 last:border-0 print:border-none print:pb-2 print:break-inside-avoid">
                                  {field.type === 'header' ? (
                                      <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-4 mb-2 print:text-black print:text-lg print:border-b-2 print:border-black print:uppercase">{field.label}
                                          <button onClick={() => {
                                               const newFields = [...formData.data.fields];
                                               const newLabel = prompt("Edit Header:", field.label);
                                               if (newLabel) { newFields[idx].label = newLabel; handleDataChange('fields', newFields); }
                                          }} className="text-gray-400 hover:text-indigo-500"><Edit3 size={12}/></button>
                                      </h2>
                                  ) : field.type === 'paragraph' ? (
                                      <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 print:text-black print:text-sm print:text-justify print:leading-relaxed whitespace-pre-wrap">
                                          {field.label && <strong className="block mb-1 text-black">{field.label}</strong>}
                                          {field.value}
                                      </div>
                                  ) : field.type === 'hazard' ? (
                                      <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-500/20 rounded-xl p-4 print:border-black print:bg-white print:p-2 print:mb-2">
                                          <div className="flex items-center gap-2 mb-2 text-orange-600 dark:text-orange-400 font-bold text-xs uppercase print:text-black print:border-b print:border-gray-400 print:pb-1 print:mb-1">
                                              <AlertTriangle size={14} className="print:hidden"/> HAZARD CONTROL
                                          </div>
                                          <div className="font-bold text-lg mb-1 print:text-sm">{field.label}</div>
                                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-3 print:hidden">Risk Level: High</div>
                                          <div className="w-full bg-white dark:bg-stone-900 border border-orange-200 dark:border-orange-500/20 rounded-lg p-3 text-sm print:border-none print:p-0 print:text-xs">
                                              <strong className="block text-xs uppercase text-gray-500 mb-1 print:text-black">Control Measures:</strong>
                                              {field.value}
                                          </div>
                                      </div>
                                  ) : (
                                      <div className="grid grid-cols-[200px_1fr] gap-4 print:grid-cols-[150px_1fr] print:gap-2 print:border-b print:border-gray-300 print:pb-1">
                                          <div className="font-bold text-gray-500 uppercase text-xs tracking-wider pt-1 print:text-black">{field.label}</div>
                                          <div>
                                              {Array.isArray(field.value) ? (
                                                  <div className="flex flex-wrap gap-2">
                                                      {field.value.map((v, i) => <span key={i} className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded print:bg-transparent print:text-black print:border print:border-black print:px-1">{v}</span>)}
                                                  </div>
                                              ) : (
                                                  <span className="font-medium text-gray-800 dark:text-gray-200 print:text-black print:text-sm">{field.value || '-'}</span>
                                              )}
                                          </div>
                                      </div>
                                  )}
                              </div>
                          ))}
                      </div>
                  )}

                  {/* SWMS View */}
                  {formData.type === 'SWMS' && formData.data.steps && (
                      <div>
                          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 print:hidden"><AlertTriangle size={20} className="text-orange-500"/> Risk Controls</h3>
                          
                          {/* Print Table Header */}
                          <h3 className="hidden print:block font-bold text-sm uppercase bg-black text-white p-1 mb-0 mt-4">Safe Work Method Statement (SWMS)</h3>
                          
                          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-white/10 print:border-2 print:border-black print:rounded-none">
                              <table className="w-full text-sm text-left print:text-xs print:collapse">
                                  <thead className="bg-gray-50 dark:bg-stone-800 text-gray-500 font-bold uppercase text-xs print:bg-gray-200 print:text-black">
                                      <tr>
                                          <th className="p-4 print:p-2 print:border print:border-black w-10">#</th>
                                          <th className="p-4 print:p-2 print:border print:border-black">Activity / Task</th>
                                          <th className="p-4 print:p-2 print:border print:border-black">Hazards & Risks</th>
                                          <th className="p-4 w-24 text-center print:p-2 print:border print:border-black">Risk</th>
                                          <th className="p-4 print:p-2 print:border print:border-black">Control Measures</th>
                                          <th className="p-4 w-24 text-center print:p-2 print:border print:border-black">Res.</th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100 dark:divide-white/5 print:divide-black">
                                      {formData.data.steps.map((step, i) => (
                                          <tr key={i} className="bg-white dark:bg-stone-900 print:break-inside-avoid">
                                              <td className="p-4 font-medium print:p-2 print:border print:border-black text-center">{i + 1}</td>
                                              <td className="p-4 font-medium print:p-2 print:border print:border-black align-top">{step.activity}</td>
                                              <td className="p-4 text-gray-600 dark:text-gray-400 print:text-black print:p-2 print:border print:border-black align-top">{step.hazards}</td>
                                              <td className="p-4 text-center print:p-2 print:border print:border-black align-top font-bold">{step.risk?.label?.charAt(0) || '-'}</td>
                                              <td className="p-4 text-gray-600 dark:text-gray-400 whitespace-pre-wrap print:text-black print:p-2 print:border print:border-black align-top">{step.controls}</td>
                                              <td className="p-4 text-center print:p-2 print:border print:border-black align-top font-bold">{step.residualRisk?.label?.charAt(0) || '-'}</td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                      </div>
                  )}
                  
                  {/* Signatures Display */}
                  {(formData.signatures?.length > 0 || true) && ( // Always show section for print
                      <div className="bg-gray-50 dark:bg-stone-800/30 p-6 rounded-xl print:bg-white print:p-0 print:mt-8 print:border-t-2 print:border-black print:pt-4 print:break-inside-avoid">
                          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 print:text-black print:text-sm print:mb-2">Declaration & Sign-Off</h3>
                          <p className="hidden print:block text-xs italic mb-4">By signing below, I acknowledge that I have read and understood the contents of this document.</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-3">
                              {formData.signatures?.map((sig, idx) => (
                                  <div key={idx} className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm flex flex-col items-center print:border-black print:h-24 print:justify-between print:rounded-none">
                                      <img src={sig.signature} alt="Signed" className="h-12 mb-2 object-contain filter dark:invert" />
                                      <div className="text-center w-full print:border-t print:border-gray-400 print:pt-1">
                                          <div className="font-bold text-sm print:text-xs">{sig.name}</div>
                                          <div className="text-[10px] text-gray-400 uppercase print:text-black">{sig.role} • {new Date(sig.timestamp).toLocaleDateString()}</div>
                                      </div>
                                  </div>
                              ))}
                              {/* Print Only Placeholders */}
                              <div className="hidden print:flex flex-col justify-end border border-black p-2 h-24">
                                  <div className="border-t border-gray-400 pt-1 text-[10px]">
                                      <div className="flex justify-between"><span>Name:</span> <span>________________</span></div>
                                      <div className="flex justify-between mt-1"><span>Sign:</span> <span>________________</span></div>
                                  </div>
                              </div>
                              <div className="hidden print:flex flex-col justify-end border border-black p-2 h-24">
                                  <div className="border-t border-gray-400 pt-1 text-[10px]">
                                      <div className="flex justify-between"><span>Name:</span> <span>________________</span></div>
                                      <div className="flex justify-between mt-1"><span>Sign:</span> <span>________________</span></div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  )}
              </div>
              
              {/* Print Footer */}
              <div className="hidden print:block fixed bottom-0 left-0 w-full text-[8px] text-gray-500 text-center border-t border-gray-300 p-1">
                  Generated by MasterDiaryApp | {new Date().toLocaleString()} | Page <span className="page-number"></span>
              </div>
          </div>
      );
  };

  const renderEditMode = () => (
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gray-50 dark:bg-black/50">
          <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">
              {/* --- TAB: DETAILS --- */}
              {activeTab === 'details' && (
                  <div className="space-y-6">
                      <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-gray-200 dark:border-stone-800 shadow-sm">
                          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><MapPin size={18} className="text-indigo-500"/> Project & Location</h3>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Project Assignment</label>
                                  <select 
                                      value={formData.projectId || ''} 
                                      onChange={(e) => setFormData(prev => ({...prev, projectId: e.target.value}))}
                                      className="w-full bg-gray-50 dark:bg-stone-800 border border-gray-200 dark:border-stone-700 rounded-xl p-3 outline-none focus:ring-2 ring-indigo-500"
                                  >
                                      <option value="">-- No Project Assigned --</option>
                                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                  </select>
                                  <p className="text-[10px] text-gray-400 mt-1">You can assign this document to a project later.</p>
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
              {activeTab === 'risks' && formData.type === 'SWMS' && !formData.data.fields && (
                  <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-gray-200 dark:border-stone-800 shadow-sm">
                      <div className="flex justify-between items-center mb-6">
                          <h3 className="text-lg font-bold">Job Steps & Hazard Analysis</h3>
                          <div className="text-xs text-gray-500 bg-gray-100 dark:bg-stone-800 px-3 py-1 rounded-full">Interactive Matrix Enabled</div>
                      </div>
                      <SWMSEditor steps={formData.data.steps || []} onChange={steps => handleDataChange('steps', steps)} />
                  </div>
              )}

              {/* --- TAB: DYNAMIC FIELDS (AI / PERMITS) --- */}
              {activeTab === 'risks' && formData.data.fields && (
                  <div className="bg-white dark:bg-stone-900 p-8 rounded-2xl border border-gray-200 dark:border-stone-800 shadow-sm space-y-6">
                      <div className="flex justify-between items-center border-b border-gray-200 dark:border-stone-800 pb-4 mb-2">
                           <h3 className="text-xl font-black uppercase tracking-tight">Form Controls</h3>
                           <button onClick={() => setIsBuilderMode(true)} className="text-xs font-bold text-indigo-500 uppercase bg-indigo-500/10 px-3 py-1.5 rounded hover:bg-indigo-500 hover:text-white transition-colors flex items-center gap-1">
                               <Wrench size={12} /> Edit Structure
                           </button>
                      </div>
                      
                      {formData.data.fields.map((field, idx) => (
                          <div key={idx} className="space-y-2">
                              {field.type === 'header' ? (
                                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mt-6 border-b border-gray-100 dark:border-stone-800 pb-2 flex items-center gap-2">
                                      {field.label}
                                      <button onClick={() => {
                                           const newFields = [...formData.data.fields];
                                           const newLabel = prompt("Edit Header:", field.label);
                                           if (newLabel) { newFields[idx].label = newLabel; handleDataChange('fields', newFields); }
                                      }} className="text-gray-400 hover:text-indigo-500"><Edit3 size={12}/></button>
                                  </h4>
                              ) : (
                                  <>
                                      <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                          {field.label} {field.required && <span className="text-red-500">*</span>}
                                      </label>
                                      {/* Simplified Input Renderer for brevity */}
                                      <input 
                                          className="w-full bg-gray-50 dark:bg-stone-800 border border-gray-200 dark:border-stone-700 rounded-xl p-3 outline-none focus:border-indigo-500 transition-colors"
                                          value={Array.isArray(field.value) ? field.value.join(', ') : field.value || ''}
                                          onChange={e => {
                                              const newFields = [...formData.data.fields];
                                              newFields[idx].value = e.target.value;
                                              handleDataChange('fields', newFields);
                                          }}
                                          placeholder={field.type === 'date' ? 'YYYY-MM-DD' : 'Enter value...'}
                                      />
                                  </>
                              )}
                          </div>
                      ))}
                  </div>
              )}

              {/* --- TAB: SIGNATURES --- */}
              {activeTab === 'signatures' && (
                  <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {formData.signatures?.map((sig, idx) => (
                              <div key={idx} className="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-gray-200 dark:border-stone-800 flex flex-col items-center text-center shadow-sm">
                                  <img src={sig.signature} alt="Sig" className="h-16 object-contain mb-2 filter dark:invert" />
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
  );

  if (loading) return <div className="flex items-center justify-center h-screen text-white"><span className="animate-pulse">Loading Document Portal...</span></div>;

  if (isBuilderMode) {
      return (
          <div className="h-screen bg-stone-950 flex flex-col">
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-stone-900">
                  <div className="flex items-center gap-3">
                      <button onClick={() => setIsBuilderMode(false)} className="hover:bg-white/10 p-2 rounded-full"><ArrowLeft className="text-gray-400" /></button>
                      <h2 className="text-lg font-bold text-white">Editing Template Structure</h2>
                  </div>
                  <div className="text-xs text-gray-500 font-mono">BUILDER MODE ACTIVE</div>
              </div>
              <div className="flex-1 overflow-hidden p-6">
                  <SafetyFormBuilder 
                      initialData={formData.data.fields || []} 
                      onSave={(newFields) => {
                          handleDataChange('fields', newFields);
                          setIsBuilderMode(false);
                      }} 
                  />
              </div>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white font-sans overflow-hidden">
      {/* --- TOP BAR --- */}
      <div className="h-16 border-b border-gray-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
            <button onClick={handleClose} className="p-2 hover:bg-gray-100 dark:hover:bg-stone-800 rounded-full transition-colors">
                <ArrowLeft size={20} className="text-gray-500" />
            </button>
            <div>
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${formData.type === 'SWMS' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-orange-100 text-orange-700'}`}>
                        {formData.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{formData.status}</span>
                </div>
                {isEditing ? (
                    <input 
                        className="bg-transparent text-lg font-bold outline-none placeholder-gray-500 w-[300px] md:w-[500px]"
                        value={formData.title}
                        onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Document Title..."
                    />
                ) : (
                    <h1 className="text-lg font-bold truncate max-w-[500px]">{formData.title}</h1>
                )}
            </div>
        </div>
        <div className="flex items-center gap-3">
            {!isEditing && (
                <>
                    <button onClick={() => window.print()} className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <Printer size={16} /> Print
                    </button>
                    <button onClick={() => setIsEditing(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all">
                        <Edit3 size={16} /> Edit Document
                    </button>
                    <button onClick={handleDelete} disabled={deleting} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors" title="Delete Document">
                        <Trash2 size={16} />
                    </button>
                </>
            )}
            {isEditing && (
                <>
                    <button onClick={() => setIsEditing(false)} className="text-sm font-bold text-gray-500 hover:text-white px-4">Cancel</button>
                    <button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all">
                        <Save size={16} /> {saving ? 'Saving...' : 'Save & Close'}
                    </button>
                </>
            )}
        </div>
      </div>

      {/* --- MAIN LAYOUT --- */}
      <div className="flex flex-1 overflow-hidden">
          {/* SIDEBAR TABS (Only in Edit Mode or if viewing complex doc) */}
          {(isEditing || formData.type !== 'IMPORTED_DOC') && (
              <div className="w-64 bg-white dark:bg-stone-950 border-r border-gray-200 dark:border-stone-800 flex flex-col pt-6 gap-1 px-3">
                  {[ 
                      { id: 'details', label: 'Document Details', icon: FileText },
                      { id: 'risks', label: 'Content / Risks', icon: Shield },
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
          )}

          {/* CONTENT AREA */}
          <div className="flex-1 overflow-y-auto relative bg-gray-100 dark:bg-stone-950 p-8 custom-scrollbar">
               {isEditing ? renderEditMode() : (
                   <div className="w-full max-w-4xl mx-auto min-h-full">
                       {renderViewMode()}
                   </div>
               )}
          </div>
      </div>

      <style>{`
        @media print {
          @page { margin: 10mm; size: A4; }
          body { background: white !important; color: black !important; -webkit-print-color-adjust: exact; }
          .hidden.print\\:block { display: block !important; }
          /* Hide main app UI */
          .flex.flex-col.h-screen > .h-16, 
          .flex.flex-1.overflow-hidden,
          .fixed.z-\\[100\],
          button, 
          .no-print { display: none !important; }
          
          /* Typography improvements */
          h1, h2, h3, h4 { font-family: 'Arial', sans-serif; }
          p, td, div { font-family: 'Times New Roman', serif; }
          
          /* Table Styles */
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid black !important; }
          
          /* Reset scroll */
          .overflow-hidden { overflow: visible !important; }
          .h-screen { height: auto !important; }
        }
      `}</style>

      {/* --- SIGNATURE MODAL --- */}
      {signaturePadOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
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
