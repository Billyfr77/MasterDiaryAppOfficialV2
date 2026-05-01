/*
 * MasterDiaryApp Official - Construction SaaS Platform
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 */
import React, { useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import { api } from '../utils/api'
import { Settings, Plus, Edit, Trash2, Sparkles, Volume2, VolumeX, CheckCircle, XCircle, Building2, Globe, FileText, CreditCard, Save, BrainCircuit } from 'lucide-react'

// Sub-components for UI flair
const Confetti = ({ show }) => {
  if (!show) return null
  const particles = Array.from({ length: 50 }, (_, i) => (
    <div key={i} className="fixed w-2.5 h-2.5 z-[9999] animate-[confetti_2s_ease-in-out_forwards]" style={{ left: `${Math.random() * 100}%`, top: '-10px', backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)` }} />
  ))
  return <div>{particles}</div>
}

const Particles = ({ show }) => {
  if (!show) return null
  const particles = Array.from({ length: 20 }, (_, i) => (
    <div key={i} className="absolute w-1 h-1 rounded-full bg-primary animate-[particle_1s_ease-out_forwards] z-10" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }} />
  ))
  return <div className="absolute inset-0 pointer-events-none">{particles}</div>
}

// --- IMAGE CROPPER COMPONENT (Native Canvas) ---
const ImageCropper = ({ imageSrc, onCancel, onSave }) => {
    const [crop, setCrop] = useState({ x: 10, y: 10, width: 200, height: 200 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [dragType, setDragType] = useState(null); // 'move' or 'resize'
    const imgRef = React.useRef(null);
    const containerRef = React.useRef(null);

    const handleMouseDown = (e, type) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        setDragType(type);
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        
        if (dragType === 'move') {
            setCrop(prev => ({
                ...prev,
                x: Math.max(0, Math.min(imgRef.current.width - prev.width, prev.x + deltaX)),
                y: Math.max(0, Math.min(imgRef.current.height - prev.height, prev.y + deltaY))
            }));
        } else if (dragType === 'resize') {
            setCrop(prev => ({
                ...prev,
                width: Math.max(50, prev.width + deltaX),
                height: Math.max(50, prev.height + deltaY)
            }));
        }
        
        setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setDragType(null);
    };

    const handleSaveClick = () => {
        if (!imgRef.current) return;
        const canvas = document.createElement('canvas');
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');
        
        // Draw only the cropped region
        // We use the natural dimensions scale factor
        const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

        ctx.drawImage(
            imgRef.current,
            crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY,
            0, 0, crop.width, crop.height
        );

        canvas.toBlob(blob => {
            onSave(blob);
        }, 'image/png');
    };

    React.useEffect(() => {
        if(isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragStart, dragType]); // Dependencies for event listeners

    return (
        <div className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-md flex items-center justify-center p-8 animate-fade-in">
            <div className="bg-stone-900 border border-white/10 rounded-3xl p-6 shadow-2xl max-w-4xl w-full flex flex-col h-[80vh]">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-2"><Sparkles size={20} className="text-indigo-400"/> Crop Logo</h3>
                    <div className="flex gap-2">
                        <button onClick={onCancel} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-gray-400 transition-all">Cancel</button>
                        <button onClick={handleSaveClick} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white shadow-lg transition-all">Save Crop</button>
                    </div>
                </div>
                <div className="flex-1 relative bg-black/50 rounded-2xl overflow-hidden flex items-center justify-center border border-white/5 select-none" ref={containerRef}>
                    <div className="relative inline-block">
                        <img ref={imgRef} src={imageSrc} alt="Crop Source" className="max-h-[60vh] object-contain pointer-events-none" />
                        
                        {/* Crop Overlay */}
                        <div 
                            className="absolute border-2 border-indigo-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] cursor-move"
                            style={{ left: crop.x, top: crop.y, width: crop.width, height: crop.height }}
                            onMouseDown={(e) => handleMouseDown(e, 'move')}
                        >
                            {/* Grid Lines */}
                            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-30">
                                <div className="border-r border-white/50 h-full col-start-1"></div>
                                <div className="border-r border-white/50 h-full col-start-2"></div>
                                <div className="border-b border-white/50 w-full row-start-1 col-span-3"></div>
                                <div className="border-b border-white/50 w-full row-start-2 col-span-3"></div>
                            </div>
                            
                            {/* Resize Handle */}
                            <div 
                                className="absolute bottom-0 right-0 w-6 h-6 bg-indigo-500 cursor-se-resize flex items-center justify-center text-white"
                                onMouseDown={(e) => handleMouseDown(e, 'resize')}
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 22L12 22M22 22L22 12M22 22L2 2"/></svg>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-4 text-center text-gray-500 text-xs font-bold uppercase tracking-widest">
                    Drag box to move • Drag blue corner to resize
                </div>
            </div>
        </div>
    );
};

const EnhancedSettings = () => {
  const { settings, loading, updateSetting, loadSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'advanced'
  
  // Cropper State
  const [showCropper, setShowCropper] = useState(false);
  const [cropperImage, setCropperImage] = useState(null);
  
  // Local state for the "Company Profile" form
  const [profileForm, setProfileForm] = useState({
    companyName: settings.companyName || '',
    companyDescription: settings.companyDescription || '',
    companyAddress: settings.companyAddress || '',
    companyEmail: settings.companyEmail || '',
    companyPhone: settings.companyPhone || '',
    taxId: settings.taxId || '',
    currency: settings.currency || 'USD',
    defaultTaxRate: settings.defaultTaxRate || '0',
    bankName: settings.bankName || '',
    bankAccount: settings.bankAccount || '',
    bankSortCode: settings.bankSortCode || '',
    aiPersona: settings.aiPersona || 'foreman',
    aiVerbosity: settings.aiVerbosity || 'concise',
    companyLogo: settings.companyLogo || ''
  });

  // Effect to sync local form with loaded settings
  React.useEffect(() => {
    setProfileForm({
      companyName: settings.companyName || '',
      companyDescription: settings.companyDescription || '',
      companyAddress: settings.companyAddress || '',
      companyEmail: settings.companyEmail || '',
      companyPhone: settings.companyPhone || '',
      taxId: settings.taxId || '',
      currency: settings.currency || 'USD',
      defaultTaxRate: settings.defaultTaxRate || '0',
      bankName: settings.bankName || '',
      bankAccount: settings.bankAccount || '',
      bankSortCode: settings.bankSortCode || '',
      aiPersona: settings.aiPersona || 'foreman',
      aiVerbosity: settings.aiVerbosity || 'concise',
      companyLogo: settings.companyLogo || ''
    });
  }, [settings]);

  const handleLogoUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = () => {
          setCropperImage(reader.result);
          setShowCropper(true);
      };
      reader.readAsDataURL(file);
      e.target.value = null; // Reset input
  };

  const handleCropSave = async (blob) => {
      const formData = new FormData();
      formData.append('image', blob, 'logo-crop.png');
      
      try {
          const res = await api.post('/uploads', formData);
          
          const fileUrl = res.data.url;
          setProfileForm(prev => ({ ...prev, companyLogo: fileUrl }));
          await updateSetting('companyLogo', fileUrl, 'Company Logo');
          setShowCropper(false);
          setCropperImage(null);
      } catch (err) {
          console.error("Logo upload error:", err);
          alert("Failed to upload logo.");
      }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
        // Save each field individually (or batch if API supported batch, but loop is fine for < 10 items)
        for (const [key, value] of Object.entries(profileForm)) {
            if (value !== settings[key]) {
                await updateSetting(key, value, 'Company Profile Setting');
            }
        }
        alert('Company Profile Updated!');
    } catch (err) {
        console.error(err);
        alert('Failed to save profile.');
    }
  };

  // --- RAW/ADVANCED EDITOR STATE ---
  const [rawForm, setRawForm] = useState({ parameter: '', value: '', notes: '' });
  const [isEditingRaw, setIsEditingRaw] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleRawSubmit = async (e) => {
    e.preventDefault();
    await updateSetting(rawForm.parameter, rawForm.value, rawForm.notes);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
    setRawForm({ parameter: '', value: '', notes: '' });
    setIsEditingRaw(false); // Reset edit mode
    loadSettings();
  };

  if (loading) return <div className="p-10 text-center text-white">Loading Settings...</div>;

  return (
    <div className="min-h-screen bg-transparent text-white relative font-sans p-8 overflow-hidden animate-fade-in pb-24">
      <Particles show={showConfetti} />
      {showCropper && cropperImage && <ImageCropper imageSrc={cropperImage} onCancel={() => { setShowCropper(false); setCropperImage(null); }} onSave={handleCropSave} />}

      {/* Header */}
      <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/10 relative max-w-[1600px] mx-auto">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-pulse opacity-50"></div>
        <div className="p-3 bg-indigo-600/20 rounded-2xl border border-indigo-500/30">
          <Settings size={32} className="text-indigo-400" />
        </div>
        <div>
          <h2 className="m-0 text-white font-black text-4xl tracking-tight drop-shadow-lg">Global Settings</h2>
          <p className="text-gray-400 font-medium mt-1">Manage company details, defaults, and system parameters.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 max-w-[1600px] mx-auto">
        <button 
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
        >
            <Building2 size={20} /> Company Profile
        </button>
        <button 
            onClick={() => setActiveTab('financials')}
            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'financials' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
        >
            <CreditCard size={20} /> Financial Defaults
        </button>
        <button 
            onClick={() => setActiveTab('ai')}
            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'ai' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
        >
            <BrainCircuit size={20} /> AI & Intelligence
        </button>
        <button 
            onClick={() => setActiveTab('advanced')}
            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'advanced' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
        >
            <Globe size={20} /> Advanced Config
        </button>
      </div>

      <div className="max-w-[1600px] mx-auto">
        
        {/* TAB: COMPANY PROFILE / FINANCIALS / AI */}
        {(activeTab === 'profile' || activeTab === 'financials' || activeTab === 'ai') && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up">
                <div className="bg-stone-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        {activeTab === 'profile' ? <Building2 className="text-indigo-400"/> : activeTab === 'financials' ? <CreditCard className="text-emerald-400"/> : <Sparkles className="text-purple-400"/>}
                        {activeTab === 'profile' ? 'Business Details' : activeTab === 'financials' ? 'Financial Configuration' : 'Pinnacle AI Brain'}
                    </h3>
                    
                    <form onSubmit={handleProfileSave} className="space-y-6">
                        {activeTab === 'profile' && (
                            <>
                                <div className="flex items-center gap-6 mb-6">
                                    <div className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-white/20 bg-black/20 hover:border-indigo-500 transition-colors flex items-center justify-center">
                                        {profileForm.companyLogo ? (
                                            <img src={profileForm.companyLogo} alt="Company Logo" className="w-full h-full object-contain p-2" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-500">
                                                <Building2 size={24} />
                                            </div>
                                        )}
                                        <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                            <span className="text-[10px] font-bold uppercase text-white">Change</span>
                                            <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                                        </label>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Company Logo</h4>
                                        <p className="text-xs text-gray-500 mt-1">Displayed on Invoices & Reports</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Company Name</label>
                                    <input 
                                        value={profileForm.companyName} 
                                        onChange={e => setProfileForm({...profileForm, companyName: e.target.value})}
                                        className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                        placeholder="Acme Construction Ltd."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Company Bio / Description (For AI Intelligence)</label>
                                    <textarea 
                                        value={profileForm.companyDescription} 
                                        onChange={e => setProfileForm({...profileForm, companyDescription: e.target.value})}
                                        className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none h-32 resize-none"
                                        placeholder="e.g. We are a boutique home builder specializing in sustainable timber decks and luxury outdoor living spaces in the Sydney region..."
                                    />
                                    <p className="text-[10px] text-gray-500 mt-2 italic">The AI uses this bio to understand your specific niche, locations, and expertise.</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Address</label>
                                    <textarea 
                                        value={profileForm.companyAddress} 
                                        onChange={e => setProfileForm({...profileForm, companyAddress: e.target.value})}
                                        className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none h-24 resize-none"
                                        placeholder="123 Builder Lane..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email</label>
                                        <input 
                                            value={profileForm.companyEmail} 
                                            onChange={e => setProfileForm({...profileForm, companyEmail: e.target.value})}
                                            className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Phone</label>
                                        <input 
                                            value={profileForm.companyPhone} 
                                            onChange={e => setProfileForm({...profileForm, companyPhone: e.target.value})}
                                            className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'ai' && (
                            <>
                                <div className="p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl mb-6">
                                    <h4 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <BrainCircuit size={16} /> Autonomous Persona
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button 
                                            type="button"
                                            onClick={() => setProfileForm({...profileForm, aiPersona: 'foreman'})}
                                            className={`p-4 rounded-xl border transition-all text-left ${profileForm.aiPersona === 'foreman' ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-black/20 border-white/10 text-gray-500 hover:border-white/30'}`}
                                        >
                                            <div className="font-bold text-sm mb-1">Site Foreman</div>
                                            <div className="text-[10px] opacity-70">Simple, clear, direct language. Perfect for site workers.</div>
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setProfileForm({...profileForm, aiPersona: 'executive'})}
                                            className={`p-4 rounded-xl border transition-all text-left ${profileForm.aiPersona === 'executive' ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-black/20 border-white/10 text-gray-500 hover:border-white/30'}`}
                                        >
                                            <div className="font-bold text-sm mb-1">Executive Analyst</div>
                                            <div className="text-[10px] opacity-70">Detailed, professional, data-heavy analysis.</div>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">AI Output Verbosity</label>
                                    <select 
                                        value={profileForm.aiVerbosity} 
                                        onChange={e => setProfileForm({...profileForm, aiVerbosity: e.target.value})}
                                        className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none cursor-pointer appearance-none"
                                    >
                                        <option value="concise" className="bg-stone-900">Concise (Fast & Direct)</option>
                                        <option value="balanced" className="bg-stone-900">Balanced (Recommended)</option>
                                        <option value="detailed" className="bg-stone-900">Detailed (Comprehensive)</option>
                                    </select>
                                </div>

                                <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                                    <p className="text-[10px] text-amber-200/70 leading-relaxed font-medium">
                                        <strong>Note:</strong> Higher verbosity increases response time and token consumption. The "Concise" setting is optimized for the Billion-Dollar Feature suite.
                                    </p>
                                </div>
                            </>
                        )}

                        {activeTab === 'financials' && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Currency Code</label>
                                        <input 
                                            value={profileForm.currency} 
                                            onChange={e => setProfileForm({...profileForm, currency: e.target.value})}
                                            className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none font-mono"
                                            placeholder="USD"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Default Tax Rate (%)</label>
                                        <input 
                                            type="number"
                                            value={profileForm.defaultTaxRate} 
                                            onChange={e => setProfileForm({...profileForm, defaultTaxRate: e.target.value})}
                                            className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tax ID / VAT Number</label>
                                    <input 
                                        value={profileForm.taxId} 
                                        onChange={e => setProfileForm({...profileForm, taxId: e.target.value})}
                                        className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                    />
                                </div>
                                <div className="pt-4 border-t border-white/10">
                                    <h4 className="text-sm font-bold text-emerald-400 mb-4">Bank Details (For Invoices)</h4>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bank Name</label>
                                            <input 
                                                value={profileForm.bankName} 
                                                onChange={e => setProfileForm({...profileForm, bankName: e.target.value})}
                                                className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Account Number</label>
                                                <input 
                                                    value={profileForm.bankAccount} 
                                                    onChange={e => setProfileForm({...profileForm, bankAccount: e.target.value})}
                                                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none font-mono"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Sort Code / Routing</label>
                                                <input 
                                                    value={profileForm.bankSortCode} 
                                                    onChange={e => setProfileForm({...profileForm, bankSortCode: e.target.value})}
                                                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none font-mono"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2">
                            <Save size={20} /> Save Changes
                        </button>
                    </form>
                </div>
                
                {/* Preview Card */}
                <div className="flex flex-col gap-6">
                    <div className="bg-white text-gray-900 rounded-xl p-8 shadow-2xl relative overflow-hidden min-h-[400px]">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <FileText size={120} />
                        </div>
                        <h4 className="text-gray-400 uppercase tracking-widest text-xs font-bold mb-8">Invoice Header Preview</h4>
                        
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-black text-indigo-900 mb-1">{profileForm.companyName || 'Your Company Name'}</h1>
                                <p className="text-sm text-gray-500 whitespace-pre-line">{profileForm.companyAddress || '123 Business Rd\nCity, Country'}</p>
                                <div className="mt-4 text-sm space-y-1 text-gray-600">
                                    <p><strong>Email:</strong> {profileForm.companyEmail || 'info@example.com'}</p>
                                    <p><strong>Phone:</strong> {profileForm.companyPhone || '555-0123'}</p>
                                    <p><strong>Tax ID:</strong> {profileForm.taxId || '---'}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h2 className="text-4xl font-black text-gray-200">INVOICE</h2>
                                <p className="text-gray-400 font-mono mt-1">#INV-001</p>
                            </div>
                        </div>

                        {activeTab === 'financials' && (
                            <div className="mt-12 pt-6 border-t border-gray-100">
                                <h5 className="font-bold text-sm mb-2 text-indigo-900">Payment Information</h5>
                                <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 space-y-1 font-mono">
                                    <p>Bank: {profileForm.bankName || '---'}</p>
                                    <p>Account: {profileForm.bankAccount || '---'}</p>
                                    <p>Routing: {profileForm.bankSortCode || '---'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* TAB: ADVANCED */}
        {activeTab === 'advanced' && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8">
                 {/* Raw Form */}
                <div className="bg-stone-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl h-fit">
                    <h3 className="mb-6 text-white font-bold text-xl flex items-center gap-2">
                        <Plus size={20} className="text-indigo-400"/> {isEditingRaw ? 'Edit Parameter' : 'Add Custom Parameter'}
                    </h3>
                    <form onSubmit={handleRawSubmit} className="flex flex-col gap-4">
                        <input
                            placeholder="Parameter Name (e.g. enable_feature_x)"
                            value={rawForm.parameter}
                            onChange={(e) => setRawForm({ ...rawForm, parameter: e.target.value })}
                            required
                            disabled={isEditingRaw} // Prevent changing the key during edit
                            className={`w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none ${isEditingRaw ? 'opacity-50 cursor-not-allowed' : ''}`}
                        />
                        <input
                            placeholder="Value"
                            value={rawForm.value}
                            onChange={(e) => setRawForm({ ...rawForm, value: e.target.value })}
                            required
                            className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none font-mono"
                        />
                        <input
                            placeholder="Notes..."
                            value={rawForm.notes}
                            onChange={(e) => setRawForm({ ...rawForm, notes: e.target.value })}
                            className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                        />
                        <div className="flex gap-2">
                            {isEditingRaw && (
                                <button type="button" onClick={() => { setIsEditingRaw(false); setRawForm({ parameter: '', value: '', notes: '' }); }} className="mt-2 py-3 px-6 bg-stone-800 hover:bg-stone-700 text-white rounded-xl font-bold transition-all">
                                    Cancel
                                </button>
                            )}
                            <button type="submit" className="mt-2 py-3 bg-stone-700 hover:bg-stone-600 text-white rounded-xl font-bold transition-all flex-1"> 
                                {isEditingRaw ? 'Update Parameter' : 'Add Parameter'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* List */}
                <div className="bg-stone-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
                     <div className="grid gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {Object.entries(settings).map(([key, val]) => (
                            <div key={key} className="bg-black/20 border border-white/5 rounded-2xl p-4 flex justify-between items-center group hover:bg-black/40 transition-colors">
                                <div>
                                    <div className="font-bold text-indigo-300 font-mono text-sm">{key}</div>
                                    <div className="text-gray-300 text-sm mt-1">{val}</div>
                                </div>
                                <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white/10 rounded-lg transition-all" onClick={() => {
                                    setRawForm({ parameter: key, value: val, notes: '' });
                                    setIsEditingRaw(true);
                                }}>
                                    <Edit size={16} />
                                </button>
                            </div>
                        ))}
                     </div>
                </div>
            </div>
        )}

      </div>
      <Confetti show={showConfetti} />
    </div>
  )
}

export default EnhancedSettings
