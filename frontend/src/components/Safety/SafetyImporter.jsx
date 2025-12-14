import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { api } from '../../utils/api';

const SafetyImporter = ({ onImportComplete }) => {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setAnalyzing(true);
    
    // In a real app, use FormData to send file
    // const formData = new FormData();
    // formData.append('document', file);
    
    // Simulating API call since we stubbed the backend
    try {
      // Mock delay
      await new Promise(r => setTimeout(r, 2000));
      
      const res = await api.post('/safety/import', { fileName: file.name });
      setResult(res.data);
      if (onImportComplete) onImportComplete(res.data);
    } catch (e) {
      console.error("Import failed", e);
      alert("Import failed: " + e.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="bg-stone-900 border border-white/10 rounded-xl p-6 shadow-2xl">
      <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
        <FileText className="text-indigo-500" /> Import Safety Docs
      </h2>

      {!result ? (
        <div className="space-y-6">
          <div className="border-2 border-dashed border-white/10 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:border-indigo-500/50 hover:bg-white/5 transition-all">
            <Upload size={40} className="text-gray-500 mb-4" />
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
              {file ? file.name : "Drop PDF or Word Doc here"}
            </p>
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx"
            />
            <button className="px-4 py-2 bg-stone-800 text-white text-xs font-bold rounded-lg border border-white/10 mt-2">
              Browse Files
            </button>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg flex gap-3">
            <AlertTriangle className="text-blue-400 flex-shrink-0" size={20} />
            <div className="text-xs text-blue-200">
              <span className="font-bold block mb-1">AI Analysis Enabled</span>
              Our system will attempt to extract hazards, controls, and PPE requirements automatically using OCR + NLP. Please review accuracy before assigning.
            </div>
          </div>

          <button 
            onClick={handleUpload}
            disabled={!file || analyzing}
            className={`w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${!file ? 'bg-stone-800 text-gray-500' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'}`}
          >
            {analyzing ? <Loader2 className="animate-spin" /> : <Upload size={16} />}
            {analyzing ? "Analyzing Document..." : "Start Import"}
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex items-center gap-3 text-emerald-400 bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
            <CheckCircle2 size={24} />
            <div>
              <div className="font-bold text-sm">Analysis Complete</div>
              <div className="text-xs opacity-80">Document structure extracted successfully.</div>
            </div>
          </div>

          <div className="bg-black/30 p-4 rounded-xl border border-white/10 max-h-60 overflow-y-auto custom-scrollbar">
            <pre className="text-[10px] font-mono text-gray-300 whitespace-pre-wrap">
              {JSON.stringify(result.extractedData, null, 2)}
            </pre>
          </div>

          <div className="flex gap-3">
            <button onClick={() => { setFile(null); setResult(null); }} className="flex-1 py-3 bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold rounded-xl transition-colors">
              Discard
            </button>
            <button className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg transition-colors">
              Save as Template
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SafetyImporter;
