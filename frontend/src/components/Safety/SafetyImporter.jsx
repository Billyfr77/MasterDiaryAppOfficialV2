import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, Loader2, Folder } from 'lucide-react';
import { api } from '../../utils/api';

const SafetyImporter = ({ onImportComplete }) => {
  const [file, setFile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
      fetchProjects();
  }, []);

  const fetchProjects = async () => {
      try {
          const res = await api.get('/projects');
          setProjects(res.data.data || res.data || []);
      } catch (e) { console.error("Failed to load projects", e); }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setAnalyzing(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name);
    if (selectedProjectId) {
        formData.append('projectId', selectedProjectId);
    }
    
    try {
      // Real API Call
      const res = await api.post('/safety/import', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
      });

      setResult(res.data);
      if (onImportComplete) {
          // Optional: Delay slightly so user sees success
          setTimeout(() => onImportComplete(res.data), 1500);
      }
    } catch (e) {
      console.error("Import failed", e);
      alert("Import failed: " + (e.response?.data?.error || e.message));
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="bg-stone-900 border border-white/10 rounded-xl p-6 shadow-2xl">
      <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
        <FileText className="text-blue-500" /> Import Safety Docs
      </h2>

      {!result ? (
        <div className="space-y-6">
          {/* Project Selector */}
          <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Assign to Project (Optional)</label>
              <div className="relative">
                  <Folder className="absolute left-3 top-3 text-gray-500" size={16} />
                  <select 
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm outline-none focus:border-blue-500 appearance-none cursor-pointer"
                  >
                      <option value="">No Project (General)</option>
                      {projects.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                  </select>
              </div>
          </div>

          <div className="border-2 border-dashed border-white/10 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:border-blue-500/50 hover:bg-white/5 transition-all relative">
            <Upload size={40} className="text-gray-500 mb-4" />
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
              {file ? file.name : "Drop PDF or Word Doc here"}
            </p>
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
            />
            <button className="px-4 py-2 bg-stone-800 text-white text-xs font-bold rounded-lg border border-white/10 mt-2 pointer-events-none">
              Browse Files
            </button>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg flex gap-3">
            <AlertTriangle className="text-blue-400 flex-shrink-0" size={20} />
            <div className="text-xs text-blue-200">
              <span className="font-bold block mb-1">Secure Upload</span>
              Documents will be securely stored and linked to the selected project. Supported formats: PDF, Word, Excel, Images.
            </div>
          </div>

          <button 
            onClick={handleUpload}
            disabled={!file || analyzing}
            className={`w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${!file ? 'bg-stone-800 text-gray-500' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'}`}
          >
            {analyzing ? <Loader2 className="animate-spin" /> : <Upload size={16} />}
            {analyzing ? "Uploading..." : "Upload Document"}
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex items-center gap-3 text-emerald-400 bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
            <CheckCircle2 size={24} />
            <div>
              <div className="font-bold text-sm">Import Successful</div>
              <div className="text-xs opacity-80">Document saved to register.</div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => { setFile(null); setResult(null); }} className="flex-1 py-3 bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold rounded-xl transition-colors">
              Import Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SafetyImporter;