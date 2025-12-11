/*
 * MasterDiaryApp Official - Construction SaaS Platform
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 */
import React, { useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import { Settings, Plus, Edit, Trash2, Sparkles, Volume2, VolumeX, CheckCircle, XCircle, Building2, Globe, FileText, CreditCard, Save } from 'lucide-react'

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

const EnhancedSettings = () => {
  const { settings, loading, updateSetting, loadSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'advanced'
  
  // Local state for the "Company Profile" form
  const [profileForm, setProfileForm] = useState({
    companyName: settings.companyName || '',
    companyAddress: settings.companyAddress || '',
    companyEmail: settings.companyEmail || '',
    companyPhone: settings.companyPhone || '',
    taxId: settings.taxId || '',
    currency: settings.currency || 'USD',
    defaultTaxRate: settings.defaultTaxRate || '0',
    bankName: settings.bankName || '',
    bankAccount: settings.bankAccount || '',
    bankSortCode: settings.bankSortCode || ''
  });

  // Effect to sync local form with loaded settings
  React.useEffect(() => {
    setProfileForm({
      companyName: settings.companyName || '',
      companyAddress: settings.companyAddress || '',
      companyEmail: settings.companyEmail || '',
      companyPhone: settings.companyPhone || '',
      taxId: settings.taxId || '',
      currency: settings.currency || 'USD',
      defaultTaxRate: settings.defaultTaxRate || '0',
      bankName: settings.bankName || '',
      bankAccount: settings.bankAccount || '',
      bankSortCode: settings.bankSortCode || ''
    });
  }, [settings]);

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
    loadSettings();
  };

  if (loading) return <div className="p-10 text-center text-white">Loading Settings...</div>;

  return (
    <div className="min-h-screen bg-transparent text-white relative font-sans p-8 overflow-hidden animate-fade-in pb-24">
      <Particles show={showConfetti} />

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
            onClick={() => setActiveTab('advanced')}
            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${activeTab === 'advanced' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
        >
            <Globe size={20} /> Advanced Config
        </button>
      </div>

      <div className="max-w-[1600px] mx-auto">
        
        {/* TAB: COMPANY PROFILE */}
        {(activeTab === 'profile' || activeTab === 'financials') && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up">
                <div className="bg-stone-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        {activeTab === 'profile' ? <Building2 className="text-indigo-400"/> : <CreditCard className="text-emerald-400"/>}
                        {activeTab === 'profile' ? 'Business Details' : 'Financial Configuration'}
                    </h3>
                    
                    <form onSubmit={handleProfileSave} className="space-y-6">
                        {activeTab === 'profile' && (
                            <>
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
                        <Plus size={20} className="text-indigo-400"/> Add Custom Parameter
                    </h3>
                    <form onSubmit={handleRawSubmit} className="flex flex-col gap-4">
                        <input
                            placeholder="Parameter Name (e.g. enable_feature_x)"
                            value={rawForm.parameter}
                            onChange={(e) => setRawForm({ ...rawForm, parameter: e.target.value })}
                            required
                            className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
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
                        <button type="submit" className="mt-2 py-3 bg-stone-700 hover:bg-stone-600 text-white rounded-xl font-bold transition-all"> 
                            Add / Update
                        </button>
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
