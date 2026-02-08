import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, AlertTriangle, FileText, Settings, Download, PenTool, Sparkles, Loader2, X, Mic } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { api } from '../../utils/api'; 
import SafetyFormViewer from './SafetyFormViewer';
import SafetyFormBuilder from './SafetyFormBuilder';
import SafetyImporter from './SafetyImporter';
import { generateSafetyPDF } from './SafetyPDF';

const SafetyCopilot = ({ isOpen, onClose, onGenerate }) => {
    const [messages, setMessages] = useState([
        { role: 'ai', content: "Hello! I'm your Safety Copilot. Describe the work you're planning, and I'll tell you what safety documents you need." }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [isListening, setIsListening] = useState(false);
    const [voiceTranscript, setVoiceTranscript] = useState('');

    if (!isOpen) return null;

    const startVoiceInput = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Voice input not supported in this browser.");
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
            setVoiceTranscript('');
        };
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event) => {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    const final = event.results[i][0].transcript;
                    setInput(prev => prev + (prev ? ' ' : '') + final);
                    setVoiceTranscript('');
                } else {
                    interim += event.results[i][0].transcript;
                    setVoiceTranscript(interim);
                }
            }
        };
        recognition.start();
    };

    const handleSend = async () => {
        if (!input.trim()) return;
        
        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);
        setSuggestions([]); // Clear old suggestions

        try {
            const res = await api.post('/safety/ai-content', { prompt: userMsg.content, mode: 'consult' });
            const { reply, suggestedDocuments } = res.data.result;

            setMessages(prev => [...prev, { role: 'ai', content: reply }]);
            if (suggestedDocuments) {
                setSuggestions(suggestedDocuments);
            }
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'ai', content: "I'm having trouble connecting to the safety database. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateClick = (doc) => {
        // Trigger generation for this specific doc
        onGenerate(doc.title + " - " + doc.description, doc.type);
        // Optional: Remove from suggestions or mark as generating
        setSuggestions(prev => prev.filter(s => s !== doc));
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-stone-900 border border-white/10 w-full max-w-2xl h-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-stone-900/50">
                    <h2 className="text-xl font-black text-white flex items-center gap-2"><Sparkles className="text-purple-400" /> Safety Copilot</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20}/></button>
                </div>
                
                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/20">
                    <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg text-[10px] text-amber-200/80 text-center">
                        ⚠️ <strong>AI ASSISTANT:</strong> Content is generated automatically. You must verify compliance with local laws and site requirements before use.
                    </div>
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-xl text-sm leading-relaxed ${
                                msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-stone-800 text-gray-200 rounded-bl-none border border-white/5'
                            }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-stone-800 p-3 rounded-xl rounded-bl-none border border-white/5 flex gap-2 items-center text-gray-400 text-xs font-bold uppercase tracking-wider">
                                <Loader2 size={14} className="animate-spin" /> Analyzing Risks...
                            </div>
                        </div>
                    )}
                    
                    {/* Suggestions Area */}
                    {suggestions.length > 0 && (
                        <div className="mt-4 pl-2 border-l-2 border-purple-500 ml-2">
                            <div className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">Recommended Documents</div>
                            <div className="grid grid-cols-1 gap-2">
                                {suggestions.map((doc, i) => (
                                    <div key={i} className="bg-stone-800/80 p-3 rounded-lg border border-white/5 flex justify-between items-center group hover:border-purple-500/50 transition-colors">
                                        <div>
                                            <div className="font-bold text-white text-sm">{doc.title}</div>
                                            <div className="text-xs text-gray-500">{doc.description}</div>
                                        </div>
                                        <button 
                                            onClick={() => handleGenerateClick(doc)}
                                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-all shadow-lg"
                                        >
                                            <PenTool size={12} /> Create
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-white/10 bg-stone-900">
                    <div className="flex flex-col gap-2">
                        {isListening && voiceTranscript && (
                            <div className="text-[10px] text-purple-400 font-black uppercase animate-pulse mb-1">
                                Transcribing: {voiceTranscript}
                            </div>
                        )}
                        <div className="flex gap-2 relative items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder={isListening ? "Listening..." : "Describe your task (e.g., 'Confined space entry for pipe repair')..."}
                                className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none transition-colors pr-24"
                            />
                            <div className="absolute right-2 flex items-center gap-2">
                                <button
                                    onClick={startVoiceInput}
                                    className={`p-2 rounded-xl transition-all ${isListening ? 'text-rose-500 animate-pulse bg-rose-500/10' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                                >
                                    <Mic size={20} />
                                </button>
                                <button
                                    onClick={handleSend}
                                    disabled={loading || !input.trim()}
                                    className="p-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:scale-95"
                                >
                                    <Sparkles size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SafetyDashboard = () => {
  const [activeTab, setActiveTab] = useState('register'); // register, builder, import
  const [forms, setForms] = useState([]);
  const [projects, setProjects] = useState([]); // Store projects
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState(null);
  const [showCopilot, setShowCopilot] = useState(false);
  const location = useLocation();
  
  // State to pass AI-generated data to builder
  const [aiGeneratedData, setAIGeneratedData] = useState(null);

  useEffect(() => {
      if (location.state?.autoInitialize) {
          setActiveTab('builder');
      }
  }, [location.state]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [formsRes, projectsRes] = await Promise.all([
          api.get('/safety'),
          api.get('/projects')
      ]);
      setForms(formsRes.data || []);
      // Handle different response structures for projects
      const projData = Array.isArray(projectsRes.data) ? projectsRes.data : (projectsRes.data.data || []);
      setProjects(projData);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWithAI = async (prompt, type = 'PERMIT') => {
    try {
      // Check for project availability (Optional now)
      const defaultProjectId = projects.length > 0 ? projects[0].id : (forms[0]?.project?.id || null);
      
      // 1. Generate Structure
      const res = await api.post('/safety/ai-content', { prompt, mode: 'full_form' });
      const generatedFields = res.data.result.fields;

      if (!generatedFields) throw new Error("AI did not return valid fields.");

      // 2. Auto-Create Form Record
      const createRes = await api.post('/safety', {
          title: `AI: ${type} - ${new Date().toLocaleDateString()}`,
          type: type, 
          projectId: defaultProjectId, 
          status: 'DRAFT',
          data: {
              fields: generatedFields,
              date: new Date().toISOString().split('T')[0]
          }
      });

      // 3. Open Viewer
      setSelectedForm(createRes.data.id);
      setShowCopilot(false); // Close copilot on success
      
    } catch (err) {
      console.error("AI Generation Failed:", err);
      alert(`Could not generate safety document: ${err.response?.data?.message || err.message}`);
    }
  };


  const handleCreateTemplate = async (structure) => {
      try {
          await api.post('/safety/templates', {
              name: `Template ${new Date().toLocaleDateString()}`, // Unique name
              type: 'SWMS',
              structure
          });
          alert("Template Saved Successfully!");
          setActiveTab('register');
      } catch(e) { 
          console.error(e);
          alert("Failed to save template: " + (e.response?.data?.error || e.message)); 
      }
  };

  if (selectedForm) {
    return <SafetyFormViewer formId={selectedForm} onClose={() => setSelectedForm(null)} />;
  }

  return (
    <div className="h-full flex flex-col bg-stone-950 text-white font-sans">
      <SafetyCopilot 
        isOpen={showCopilot}
        onClose={() => setShowCopilot(false)}
        onGenerate={handleGenerateWithAI}
      />
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex justify-between items-center bg-stone-900/50 backdrop-blur-md sticky top-0 z-20">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
            <AlertTriangle className="text-orange-500" /> Safety Command Center
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-xs text-gray-500 font-bold tracking-widest">COMPLIANCE & RISK MANAGEMENT</p>
            <span className="text-[9px] bg-stone-800 text-gray-400 px-2 py-0.5 rounded border border-white/5">AI Assisted • Human Verification Required</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowCopilot(true)}
            className="px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 bg-purple-600 text-white shadow-lg shadow-purple-500/20 hover:bg-purple-500"
          >
            <Sparkles size={16} /> Safety Copilot
          </button>
          <button 
            onClick={() => setActiveTab('import')}
            className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'import' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-stone-800 text-gray-400 hover:text-white'}`}
          >
            <Download size={16} /> Import
          </button>
          <button 
            onClick={() => { setAIGeneratedData(null); setActiveTab('builder'); }} // Clear AI data when manually opening builder
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
                
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <button onClick={() => { setAIGeneratedData(null); setActiveTab('builder'); }} className="p-6 bg-indigo-600/10 border border-indigo-500/30 hover:bg-indigo-600/20 rounded-2xl flex items-center gap-4 transition-all group shadow-lg">
                        <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform"><Plus size={24} /></div>
                        <div className="text-left">
                            <div className="font-black text-white text-lg">Create New Form</div>
                            <div className="text-xs font-bold text-indigo-300 uppercase tracking-wide">Start from scratch or template</div>
                        </div>
                    </button>
                    <button onClick={() => setActiveTab('import')} className="p-6 bg-blue-600/10 border border-blue-500/30 hover:bg-blue-600/20 rounded-2xl flex items-center gap-4 transition-all group shadow-lg">
                        <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform"><Download size={24} /></div>
                        <div className="text-left">
                            <div className="font-black text-white text-lg">Import Document</div>
                            <div className="text-xs font-bold text-blue-300 uppercase tracking-wide">Upload PDF, Word, or Excel</div>
                        </div>
                    </button>
                </div>

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

                                {/* CARD ACTIONS */}
                                <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
                                    <button 
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            const fields = form.data?.fields || [];
                                            const formData = {
                                                ...form,
                                                projectName: form.project?.name || 'General Works',
                                                locationDetails: form.data?.location || 'Site Wide'
                                            };
                                            generateSafetyPDF(formData, fields);
                                        }}
                                        className="flex-1 py-2 bg-stone-800 hover:bg-stone-700 text-gray-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                    >
                                        <Download size={14} /> Download PDF
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {activeTab === 'builder' && (
            <div className="h-full p-6 overflow-y-auto custom-scrollbar">
                <SafetyFormBuilder initialData={aiGeneratedData} onSave={handleCreateTemplate} />
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
