import React, { useState, useEffect } from 'react';
import { 
  X, MapPin, Download, Edit, Folder, Cloud, Wind, Search, Upload, FileText, 
  ExternalLink, Sparkles, Loader2, Plus, Layers, Users, DollarSign, TrendingUp, Wrench, Calendar, CheckCircle2, ChevronRight 
} from 'lucide-react';
import { api } from '../../utils/api';
import { getStatusColor } from './utils';
import { useNavigate } from 'react-router-dom';

const ProjectDetailsModal = ({ project, onClose, onEdit }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [documents, setDocuments] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [showAddJob, setShowAddJob] = useState(false);
  const [jobFormData, setJobFormData] = useState({ jobNumber: '', serviceType: '', date: new Date().toISOString().split('T')[0] });
  const [uploading, setUploading] = useState(false);
  const [docSearchTerm, setDocSearchTerm] = useState('');
  const [analyzingDoc, setAnalyzingDoc] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    if (project?.id) {
        fetchJobs();
        // Fetch full project to get documents and associations
        api.get(`/projects/${project.id}`).then(res => {
            setDocuments(res.data.documents || []);
        }).catch(e => console.error(e));

        if (project.latitude && project.longitude) {
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${project.latitude}&longitude=${project.longitude}&current_weather=true`)
                .then(res => res.json())
                .then(data => setWeatherData(data.current_weather))
                .catch(e => console.error(e));
        }
    }
  }, [project?.id]);

  if (!project) return null;

  const fetchJobs = async () => {
      try {
          const res = await api.get(`/jobs?projectId=${project.id}`);
          setJobs(res.data.data || res.data || []);
      } catch (e) { console.error(e); }
  };

  const handleCreateJob = async (e) => {
      e.preventDefault();
      try {
          // Sync with Project's Client
          const payload = { 
              ...jobFormData, 
              projectId: project.id, 
              clientId: project.clientId,
              clientName: project.client || project.clientDetails?.name || 'Internal'
          };
          const res = await api.post('/jobs', payload);
          setJobs([res.data, ...jobs]);
          setShowAddJob(false);
          setJobFormData({ jobNumber: '', serviceType: '', date: new Date().toISOString().split('T')[0] });
      } catch (e) { alert("Failed to create job reference."); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('projectId', project.id);
    try {
        const res = await api.post('/uploads', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setDocuments([res.data, ...documents]);
    } catch (err) { alert('Upload failed.'); }
    finally { setUploading(false); }
  };

  const handleAnalyzeDocument = async (docId) => {
      setAnalyzingDoc(docId);
      try {
          const res = await api.post('/ai/analyze-document', { docId });
          setAnalysisResult(res.data.analysis);
      } catch (e) { alert(`Analysis Failed.`); }
      finally { setAnalyzingDoc(null); }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-stone-900 border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up p-8 rounded-3xl" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight mb-2">{project?.name}</h2>
            <div className="flex items-center gap-2 text-gray-400">
              <MapPin size={16} className="text-indigo-500" />
              {project?.site}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-white/10">
            {['overview', 'documents', 'jobs'].map(tab => (
                <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)} 
                    className={`pb-3 px-2 text-sm font-bold capitalize transition-all ${activeTab === tab ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400 hover:text-white'}`}
                >
                    {tab}
                </button>
            ))}
        </div>

        {/* --- OVERVIEW TAB --- */}
        {activeTab === 'overview' && (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5">
                        <h4 className="text-indigo-400 font-bold mb-1 text-xs uppercase">Live Value</h4>
                        <div className="text-2xl font-black text-white tracking-tight">${(project.financials?.livePrice || 0).toLocaleString()}</div>
                    </div>
                    <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-5">
                        <h4 className="text-violet-400 font-bold mb-1 text-xs uppercase">Charge Out</h4>
                        <div className="text-2xl font-black text-white tracking-tight">${(project.financials?.totalDiaryRevenue || 0).toLocaleString()}</div>
                    </div>
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5">
                        <h4 className="text-rose-400 font-bold mb-1 text-xs uppercase">Costs</h4>
                        <div className="text-2xl font-black text-white tracking-tight">${(project.financials?.totalCost || 0).toLocaleString()}</div>
                    </div>
                    <div className={`bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 ${!project.financials?.isProfitable ? 'bg-red-500/10 border-red-500/20' : ''}`}>
                        <h4 className={`font-bold mb-1 text-xs uppercase ${project.financials?.isProfitable ? 'text-emerald-400' : 'text-red-400'}`}>Profit</h4>
                        <div className={`text-2xl font-black ${project.financials?.isProfitable ? 'text-emerald-400' : 'text-red-400'}`}>${(project.financials?.profit || 0).toLocaleString()}</div>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-stone-800/50 border border-white/5 rounded-2xl p-6">
                        <div className="space-y-4 text-gray-200 text-sm">
                            <p className="flex justify-between border-b border-white/5 pb-2"><span className="text-gray-400">Status</span><span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getStatusColor(project.status)}`}>{project.status || 'Active'}</span></p>
                            <p className="flex justify-between border-b border-white/5 pb-2"><span className="text-gray-400">Created</span><span className="font-mono font-bold">{new Date(project.createdAt).toLocaleDateString()}</span></p>
                            <p className="flex justify-between"><span className="text-gray-400">Manager</span><span className="font-bold">{project.createdBy?.username || 'Unknown'}</span></p>
                        </div>
                    </div>
                    {weatherData && (
                        <div className="bg-sky-500/5 border border-sky-500/20 rounded-2xl p-6 flex justify-between items-center">
                            <div><h4 className="text-sky-400 font-bold mb-1 uppercase text-xs">Site Conditions</h4><div className="text-3xl font-black text-white">{weatherData.temperature}°C</div></div>
                            <div className="bg-black/20 p-3 rounded-xl text-center"><Wind size={16} className="mx-auto mb-1 text-sky-300"/><div className="text-xs font-bold text-white">{weatherData.windspeed} km/h</div></div>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* --- JOBS TAB (SUB-PROJECTS) --- */}
        {activeTab === 'jobs' && (
            <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Sub-Job references</h3>
                    <button 
                        onClick={() => setShowAddJob(!showAddJob)} 
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                    >
                        {showAddJob ? <X size={14}/> : <Plus size={14}/>} {showAddJob ? 'Cancel' : 'Add Sub-Job'}
                    </button>
                </div>

                {showAddJob && (
                    <form onSubmit={handleCreateJob} className="bg-black/30 border border-white/10 rounded-3xl p-6 space-y-4 mb-8 animate-fade-in">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Internal Job #</label>
                                <input type="text" required value={jobFormData.jobNumber} onChange={e => setJobFormData({...jobFormData, jobNumber: e.target.value})} className="w-full bg-stone-900 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-indigo-500 outline-none" placeholder="e.g. JB-101" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Work Type / Service</label>
                                <input type="text" value={jobFormData.serviceType} onChange={e => setJobFormData({...jobFormData, serviceType: e.target.value})} className="w-full bg-stone-900 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-indigo-500 outline-none" placeholder="e.g. Groundworks" />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg">Register Sub-Job</button>
                        </div>
                    </form>
                )}

                <div className="grid grid-cols-1 gap-3">
                    {jobs.map(job => (
                        <div key={job.id} className="bg-stone-800/50 border border-white/5 p-4 rounded-2xl flex items-center justify-between hover:border-indigo-500/30 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl font-mono font-bold">#{job.jobNumber}</div>
                                <div>
                                    <div className="font-bold text-white text-sm">{job.serviceType || 'General Service'}</div>
                                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{new Date(job.createdAt).toLocaleDateString()}</div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors" title="Create Invoice for this Job">
                                    <FileText size={16} />
                                </button>
                                <ChevronRight size={14} className="text-gray-600 mt-2" />
                            </div>
                        </div>
                    ))}
                    {jobs.length === 0 && !showAddJob && (
                        <div className="text-center py-20 bg-black/10 rounded-3xl border border-dashed border-white/5 font-bold text-gray-600 uppercase tracking-widest text-xs">
                            No active sub-jobs for this project.
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* --- DOCUMENTS TAB --- */}
        {activeTab === 'documents' && ( activeTab === 'documents' && (
            <div className="space-y-6">
                <div className="relative mb-6">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input type="text" placeholder="Search documents..." value={docSearchTerm} onChange={(e) => setDocSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-2xl text-white outline-none focus:border-indigo-500" />
                </div>
                <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center bg-stone-800/30 hover:bg-stone-800/50 transition-colors">
                    <input type="file" id="file-upload" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                        {uploading ? <Loader2 size={32} className="animate-spin text-indigo-500" /> : <Upload size={32} className="text-gray-400 mb-2" />}
                        <span className="text-white font-bold">Click to Upload Document</span>
                    </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {documents.filter(doc => doc.title.toLowerCase().includes(docSearchTerm.toLowerCase())).map((doc, idx) => (
                        <div key={idx} className="bg-stone-800 p-3 rounded-xl border border-white/5 flex justify-between items-center group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/10 rounded-lg"><FileText className="text-indigo-400" size={16} /></div>
                                <div><div className="font-bold text-white text-sm truncate max-w-[150px]">{doc.title}</div><div className="text-[10px] text-gray-500">{new Date(doc.createdAt).toLocaleDateString()}</div></div>
                            </div>
                            <div className="flex gap-2">
                                <a href={doc.metadata?.url || '#'} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/10 rounded-lg text-gray-400"><ExternalLink size={16} /></a>
                                <button onClick={() => handleAnalyzeDocument(doc.id)} className="p-2 hover:bg-purple-500/20 rounded-lg text-purple-400" title="Analyze with AI">
                                    <Sparkles size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ))}

        {analysisResult && <div className="mt-6 p-4 bg-stone-900 border border-purple-500/30 rounded-xl text-xs text-gray-300 whitespace-pre-wrap animate-fade-in shadow-2xl">{analysisResult}</div>}

        <div className="flex gap-3 justify-end pt-6 border-t border-white/10 mt-6">
            <button onClick={() => onEdit(project)} className="px-6 py-3 bg-amber-500/10 text-amber-500 rounded-xl font-bold text-sm border border-amber-500/20">Edit Project</button>
            <button onClick={onClose} className="px-5 py-2.5 bg-white/5 text-gray-300 rounded-xl font-bold text-sm border border-white/5">Close</button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsModal;
