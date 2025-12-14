import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, AlertTriangle, FileText, Settings, Download, PenTool } from 'lucide-react';
import { api } from '../../utils/api';
import SafetyFormViewer from './SafetyFormViewer';
import SafetyFormBuilder from './SafetyFormBuilder';
import SafetyImporter from './SafetyImporter';

const SafetyDashboard = () => {
  const [activeTab, setActiveTab] = useState('register'); // register, builder, import
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState(null);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const res = await api.get('/safety');
      // If the backend returns wrapped objects or arrays, handle it.
      // The controller might return { ...form, _warning } if includes fail.
      setForms(res.data || []);
    } catch (error) {
      console.error("Failed to fetch safety forms", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async (structure) => {
      try {
          await api.post('/safety/templates', {
              name: 'New Custom Template',
              type: 'SWMS',
              structure
          });
          alert("Template Saved!");
          setActiveTab('register');
      } catch(e) { alert("Failed to save template"); }
  };

  if (selectedForm) {
    return <SafetyFormViewer formId={selectedForm} onClose={() => setSelectedForm(null)} />;
  }

  return (
    <div className="h-full flex flex-col bg-stone-950 text-white font-sans">
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex justify-between items-center bg-stone-900/50 backdrop-blur-md sticky top-0 z-20">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
            <AlertTriangle className="text-orange-500" /> Safety Command Center
          </h1>
          <p className="text-xs text-gray-500 font-bold tracking-widest mt-1">COMPLIANCE & RISK MANAGEMENT</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setActiveTab('import')}
            className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'import' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-stone-800 text-gray-400 hover:text-white'}`}
          >
            <Download size={16} /> Import
          </button>
          <button 
            onClick={() => setActiveTab('builder')}
            className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'builder' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-stone-800 text-gray-400 hover:text-white'}`}
          >
            <PenTool size={16} /> Template Builder
          </button>
          <button 
            onClick={() => setActiveTab('register')}
            className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'register' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-stone-800 text-gray-400 hover:text-white'}`}
          >
            <FileText size={16} /> Register
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'register' && (
            <div className="h-full flex flex-col p-6 overflow-y-auto custom-scrollbar">
                {/* Search Bar */}
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-3 text-gray-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search forms, permits, or incidents..." 
                            className="w-full bg-stone-900 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-white focus:border-orange-500 outline-none transition-colors"
                        />
                    </div>
                    <button className="p-3 bg-stone-900 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-colors">
                        <Filter size={18} />
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-500 font-mono animate-pulse">LOADING SECURE REGISTRY...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {forms.map(form => (
                            <div 
                                key={form.id} 
                                onClick={() => setSelectedForm(form.id)}
                                className="group bg-stone-900 border border-white/5 hover:border-orange-500/50 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden"
                            >
                                <div className={`absolute top-0 right-0 p-2 rounded-bl-xl text-[10px] font-black uppercase tracking-widest ${
                                    form.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' : 
                                    form.status === 'DRAFT' ? 'bg-gray-500/20 text-gray-400' : 'bg-orange-500/20 text-orange-400'
                                }`}>
                                    {form.status}
                                </div>
                                
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                        form.type === 'INCIDENT_REPORT' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                                    }`}>
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">{form.type.replace('_', ' ')}</div>
                                        <div className="font-bold text-white truncate max-w-[200px]">{form.title}</div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-600 font-bold">Project</span>
                                        <span className="text-gray-400 text-right truncate max-w-[150px]">{form.project?.name || 'Unassigned'}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-600 font-bold">Created</span>
                                        <span className="text-gray-400">{new Date(form.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {form._warning && (
                                        <div className="text-[10px] text-red-400 mt-2 bg-red-500/10 p-1 rounded text-center font-mono">
                                            ⚠️ Sync Warning
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {activeTab === 'builder' && (
            <div className="h-full p-6 overflow-y-auto custom-scrollbar">
                <SafetyFormBuilder onSave={handleCreateTemplate} />
            </div>
        )}

        {activeTab === 'import' && (
            <div className="h-full p-6 overflow-y-auto custom-scrollbar flex justify-center">
                <div className="w-full max-w-2xl">
                    <SafetyImporter onImportComplete={() => setActiveTab('builder')} />
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default SafetyDashboard;
