import React, { useState, useEffect } from 'react';
import { Plus, Search, MapPin, Phone, Mail, FileText, Briefcase, Filter, ArrowRight, User, Trash2 } from 'lucide-react';
import { api } from '../../utils/api';
import ClientSelector from './ClientSelector';

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const res = await api.get('/clients');
            setClients(res.data);
        } catch (error) {
            console.error("Failed to load clients", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this client?")) return;
        try {
            await api.delete(`/clients/${id}`);
            fetchClients();
        } catch (err) {
            console.error("Delete failed", err);
            alert("Failed to delete client");
        }
    };

    const handleEdit = (client) => {
        setEditingClient(client);
        setShowForm(true);
    };

    const filteredClients = clients.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.company?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Client Database</h1>
                    <p className="text-slate-400 mt-1">Manage your customer relationships and details.</p>
                </div>
                <button 
                    onClick={() => { setEditingClient(null); setShowForm(true); }}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all hover:scale-105"
                >
                    <Plus size={20} />
                    Add Client
                </button>
            </div>

            {/* Search Bar */}
            <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 backdrop-blur-xl flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                        type="text"
                        placeholder="Search clients by name, company..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                </div>
            </div>

            {/* Client Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClients.map(client => (
                    <div key={client.id} className="group bg-slate-900/80 border border-white/10 hover:border-indigo-500/50 rounded-2xl p-6 transition-all hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <button onClick={() => handleEdit(client)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-indigo-400"><FileText size={16} /></button>
                            <button onClick={() => handleDelete(client.id)} className="p-2 bg-slate-800 hover:bg-red-900/50 rounded-lg text-red-400"><Trash2 size={16} /></button>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {client.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{client.name}</h3>
                                {client.company && (
                                    <div className="flex items-center gap-1.5 text-indigo-300 text-sm font-medium mt-1">
                                        <Briefcase size={14} />
                                        {client.company}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 space-y-3">
                            {client.email && (
                                <div className="flex items-center gap-3 text-slate-400 text-sm">
                                    <Mail size={16} className="text-slate-600" />
                                    {client.email}
                                </div>
                            )}
                            {client.phone && (
                                <div className="flex items-center gap-3 text-slate-400 text-sm">
                                    <Phone size={16} className="text-slate-600" />
                                    {client.phone}
                                </div>
                            )}
                            {client.address && (
                                <div className="flex items-center gap-3 text-slate-400 text-sm">
                                    <MapPin size={16} className="text-slate-600" />
                                    <span className="truncate">{client.address}</span>
                                </div>
                            )}
                        </div>
                        
                        <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center text-xs text-slate-500 font-mono">
                            <span>ID: {client.id.substring(0,8)}...</span>
                            <span className={`px-2 py-0.5 rounded ${client.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                                {client.status?.toUpperCase()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Form */}
            {showForm && (
                <ClientForm 
                    initialData={editingClient} 
                    onClose={() => { setShowForm(false); setEditingClient(null); }} 
                    onSuccess={() => { fetchClients(); setShowForm(false); setEditingClient(null); }} 
                />
            )}
        </div>
    );
};

const ClientForm = ({ initialData, onClose, onSuccess }) => {
    const [formData, setFormData] = useState(initialData || {
        name: '',
        company: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
        status: 'active'
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (initialData) {
                await api.put(`/clients/${initialData.id}`, formData);
            } else {
                await api.post('/clients', formData);
            }
            onSuccess();
        } catch (err) {
            console.error("Save failed", err);
            alert("Failed to save client");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in-up">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-800/50">
                    <h2 className="text-xl font-bold text-white">{initialData ? 'Edit Client' : 'New Client'}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><Plus size={24} className="rotate-45" /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:border-indigo-500 outline-none" placeholder="John Doe" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Company</label>
                            <input type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:border-indigo-500 outline-none" placeholder="Acme Corp" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:border-indigo-500 outline-none" placeholder="john@example.com" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Phone</label>
                            <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:border-indigo-500 outline-none" placeholder="+1 234 567 890" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Address</label>
                        <textarea rows={2} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:border-indigo-500 outline-none" placeholder="123 Main St..." />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Notes</label>
                        <textarea rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:border-indigo-500 outline-none" placeholder="Internal notes..." />
                    </div>

                     <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                        <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white focus:border-indigo-500 outline-none">
                            <option value="active">Active</option>
                            <option value="lead">Lead</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-lg flex items-center gap-2">
                            {loading ? 'Saving...' : 'Save Client'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Clients;
