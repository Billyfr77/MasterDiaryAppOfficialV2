import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useDrag, useDrop, useDragLayer } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { useNavigate } from 'react-router-dom';
import { 
    Plus, Truck, User, DollarSign, Calendar, FileText, Settings, Trash2, 
    CheckCircle, Clock, Search, Filter, ChevronLeft, ChevronRight, MoreVertical, 
    X, Edit, AlertCircle, Briefcase, Layout, Layers, Clock3, CheckSquare, 
    FileCheck, Eye
} from 'lucide-react';
import { api } from '../utils/api';
import ClientSelector from './Clients/ClientSelector';
import { format, addDays, subDays, isSameDay, parseISO, startOfToday, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

const ItemTypes = {
    JOB: 'job',
};

// --- UTILS ---
const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

// --- COMPONENT: Job Card ---
const JobCard = ({ job, onClick, isSelected, onSelect }) => { 
    const [{ isDragging }, drag, preview] = useDrag(() => ({
        type: ItemTypes.JOB,
        item: { id: job.id, isSelected, job }, 
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    useEffect(() => {
        preview(getEmptyImage(), { captureDraggingState: true });
    }, [preview]);

    const statusColors = {
        pending: 'border-l-4 border-l-amber-500',
        scheduled: 'border-l-4 border-l-blue-500',
        completed: 'border-l-4 border-l-emerald-500',
        invoiced: 'border-l-4 border-l-purple-500 opacity-75',
    };

    return (
        <div
            ref={drag}
            onClick={(e) => onSelect(job.id, e.ctrlKey || e.metaKey)}
            className={`group relative p-3 bg-stone-800 rounded-lg shadow-sm hover:shadow-md cursor-move hover:bg-stone-750 transition-all mb-2 
                ${statusColors[job.status] || 'border-l-4 border-l-gray-500'} 
                ${isDragging ? 'opacity-20' : 'opacity-100'} 
                ${isSelected ? 'ring-2 ring-indigo-500 bg-stone-700' : ''}
            `}
        >
            <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 bg-black/20 px-1.5 py-0.5 rounded">
                        {job.jobNumber}
                    </span>
                    {job.pricingType === 'hourly' && (
                        <span className="text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Clock3 size={10} /> {job.hours}h
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">{formatCurrency(job.cost)}</span>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onClick(job); }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-opacity"
                    >
                        <Edit size={12} />
                    </button>
                </div>
            </div>
            
            <h4 className="text-sm font-bold text-white mb-0.5 line-clamp-1">{job.clientName || 'Unknown Client'}</h4>
            
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
                <FileText size={10} className="text-indigo-400" />
                <span className="truncate">{job.serviceType}</span>
            </div>

            {job.wasteType && (
                <div className="flex flex-wrap gap-1 mb-1">
                    <span className="text-[9px] text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        {job.wasteType}
                    </span>
                </div>
            )}
            
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                    <Calendar size={10} />
                    {format(new Date(job.date), 'MMM d')}
                </div>
                {job.status === 'completed' && <CheckCircle size={12} className="text-emerald-500" />}
            </div>
        </div>
    );
};

// --- COMPONENT: Resource Column ---
const ResourceColumn = ({ resource, jobs, moveJob, onEditJob, selectedJobIds, onSelectJob }) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: ItemTypes.JOB,
        drop: (item) => moveJob(item.id, resource.id, item.isSelected),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const totalValue = jobs.reduce((sum, j) => sum + (parseFloat(j.cost) || 0), 0);

    return (
        <div
            ref={drop}
            className={`flex-shrink-0 w-80 bg-stone-900/60 backdrop-blur-sm rounded-xl border flex flex-col h-full transition-colors ${isOver ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-white/5'}`}
        >
            <div className="p-3 border-b border-white/5 flex items-center justify-between bg-stone-900/80 rounded-t-xl sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    {resource.type === 'equipment' ? 
                        <div className="p-1.5 bg-emerald-500/10 rounded text-emerald-400"><Truck size={16} /></div> : 
                        <div className="p-1.5 bg-blue-500/10 rounded text-blue-400"><User size={16} /></div>
                    }
                    <div>
                        <h3 className="text-sm font-bold text-white leading-tight">{resource.name}</h3>
                        <div className="text-[10px] text-gray-500">{jobs.length} Jobs • {formatCurrency(totalValue)}</div>
                    </div>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-1">
                {jobs.map(job => (
                    <JobCard 
                        key={job.id} 
                        job={job} 
                        onClick={onEditJob} 
                        isSelected={selectedJobIds.has(job.id)}
                        onSelect={onSelectJob}
                    />
                ))}
                {jobs.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-2 opacity-50">
                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-700 flex items-center justify-center">
                            <Plus size={20} />
                        </div>
                        <span className="text-xs">Drop jobs here</span>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- COMPONENT: Backlog Column ---
const BacklogColumn = ({ jobs, moveJob, onEditJob, selectedJobIds, onSelectJob }) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: ItemTypes.JOB,
        drop: (item) => moveJob(item.id, 'unassigned', item.isSelected),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    return (
        <div ref={drop} className={`flex-1 flex flex-col h-full bg-stone-900/40 border-r border-white/10 ${isOver ? 'bg-indigo-500/5' : ''}`}>
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-stone-900/80 backdrop-blur-md">
                <div>
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Briefcase size={18} className="text-amber-400" />
                        Unassigned Jobs
                    </h3>
                    <span className="text-xs text-gray-500">{jobs.length} pending allocation</span>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                <div className="space-y-2">
                    {jobs.map(job => (
                        <JobCard 
                            key={job.id} 
                            job={job} 
                            onClick={onEditJob} 
                            isSelected={selectedJobIds.has(job.id)}
                            onSelect={onSelectJob}
                        />
                    ))}
                    {jobs.length === 0 && (
                        <div className="text-center py-10 text-gray-500 text-sm">No unassigned jobs found.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- CUSTOM DRAG LAYER ---
const CustomDragLayer = () => {
    const { itemType, isDragging, item, currentOffset } = useDragLayer((monitor) => ({
        item: monitor.getItem(),
        itemType: monitor.getItemType(),
        currentOffset: monitor.getSourceClientOffset(),
        isDragging: monitor.isDragging(),
    }));

    if (!isDragging || itemType !== ItemTypes.JOB) return null;

    const { job, isSelected } = item;
    const style = currentOffset ? { transform: `translate(${currentOffset.x}px, ${currentOffset.y}px)` } : {};

    const statusColors = {
        pending: 'border-l-4 border-l-amber-500',
        scheduled: 'border-l-4 border-l-blue-500',
        completed: 'border-l-4 border-l-emerald-500',
        invoiced: 'border-l-4 border-l-purple-500 opacity-75',
    };

    return (
        <div style={{ position: 'fixed', pointerEvents: 'none', zIndex: 100, left: 0, top: 0, width: '100%', height: '100%' }}>
            <div style={style}>
                <div className={`group relative p-3 bg-stone-800 rounded-lg shadow-md mb-2 w-72 ${statusColors[job.status] || 'border-l-4 border-l-gray-500'} ${isSelected ? 'ring-2 ring-indigo-500 bg-stone-700' : ''}`}>
                    <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-400 bg-black/20 px-1.5 py-0.5 rounded">{job.jobNumber}</span>
                            {job.pricingType === 'hourly' && <span className="text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded flex items-center gap-1"><Clock3 size={10} /> {job.hours}h</span>}
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">{formatCurrency(job.cost)}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white mb-0.5 line-clamp-1">{job.clientName || 'Unknown Client'}</h4>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5"><FileText size={10} className="text-indigo-400" /><span className="truncate">{job.serviceType}</span></div>
                    {job.wasteType && <div className="flex flex-wrap gap-1 mb-1"><span className="text-[9px] text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">{job.wasteType}</span></div>}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                        <div className="flex items-center gap-1 text-[10px] text-gray-500"><Calendar size={10} />{format(new Date(job.date), 'MMM d')}</div>
                        {job.status === 'completed' && <CheckCircle size={12} className="text-emerald-500" />}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MODAL: Job Editor ---
const JobModal = ({ isOpen, onClose, onSave, onDelete, job, services, wasteTypes, categories }) => {
    const [formData, setFormData] = useState({ 
        clientName: '', 
        clientId: null, 
        jobNumber: '', 
        serviceType: '', 
        wasteType: '', 
        cost: 0, 
        date: format(new Date(), 'yyyy-MM-dd'), 
        status: 'pending', 
        notes: '', 
        pricingType: 'flat', 
        hours: 0, 
        rate: 0 
    });

    useEffect(() => { 
        if (job) { 
            setFormData({ 
                ...job, 
                date: job.date ? format(new Date(job.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'), 
                pricingType: job.pricingType || 'flat', 
                hours: job.hours || 0, 
                rate: job.rate || 0 
            }); 
        } else { 
            setFormData({ 
                clientName: '', 
                clientId: null, 
                jobNumber: `JB-${Math.floor(Math.random()*10000)}`, 
                serviceType: '', 
                wasteType: '', 
                cost: 0, 
                date: format(new Date(), 'yyyy-MM-dd'), 
                status: 'pending', 
                notes: '', 
                pricingType: 'flat', 
                hours: 0, 
                rate: 0 
            }); 
        } 
    }, [job, isOpen]);

    const handleServiceChange = (e) => { 
        const type = e.target.value; 
        const service = services.find(s => s.name === type); 
        if (service) { 
            const isHourly = service.pricingType === 'hourly'; 
            setFormData(prev => ({ 
                ...prev, 
                serviceType: type, 
                pricingType: service.pricingType || 'flat', 
                rate: isHourly ? service.cost : 0, 
                hours: isHourly ? 1 : 0, 
                cost: isHourly ? service.cost : service.cost 
            })); 
        } else { 
            setFormData(prev => ({ ...prev, serviceType: type })); 
        } 
    };

    useEffect(() => { 
        if (formData.pricingType === 'hourly') { 
            const total = (parseFloat(formData.hours) || 0) * (parseFloat(formData.rate) || 0); 
            setFormData(prev => ({ ...prev, cost: total })); 
        } 
    }, [formData.hours, formData.rate, formData.pricingType]);

    const handleSave = () => { 
        if (!formData.clientName) return alert("Client is required"); 
        if (!formData.jobNumber) return alert("Job Number is required"); 
        onSave(formData); 
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-stone-900 border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-black text-white">{job ? 'Edit Job' : 'New Job'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20}/></button>
                </div>
                
                <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Client</label>
                            <ClientSelector 
                                onSelect={(c) => setFormData({ ...formData, clientName: c.name, clientId: c.id })} 
                                selectedClient={formData.clientId ? { id: formData.clientId, name: formData.clientName } : null} 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Job Number</label>
                            <input type="text" className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none" value={formData.jobNumber} onChange={e => setFormData({ ...formData, jobNumber: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Due Date</label>
                            <input type="date" className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Service Type</label>
                            <select className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none appearance-none" value={formData.serviceType} onChange={handleServiceChange}>
                                <option value="">Select Service...</option>
                                {categories.map(cat => (
                                    <optgroup key={cat} label={cat}>
                                        {services.filter(s => s.category === cat).map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                    </optgroup>
                                ))}
                            </select>
                        </div>
                        
                        {/* PRICING SECTION */}
                        <div className="col-span-2 bg-black/20 p-4 rounded-xl border border-white/5">
                            <h4 className="text-xs font-bold text-indigo-400 uppercase mb-3 flex items-center gap-2"><DollarSign size={14}/> Pricing & Rates</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Model</label>
                                    <select className="w-full bg-stone-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" value={formData.pricingType} onChange={e => setFormData({...formData, pricingType: e.target.value})}>
                                        <option value="flat">Flat Rate</option>
                                        <option value="hourly">Hourly</option>
                                    </select>
                                </div>
                                {formData.pricingType === 'hourly' ? (
                                    <>
                                        <div><label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Hourly Rate ($)</label><input type="number" className="w-full bg-stone-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" value={formData.rate} onChange={e => setFormData({...formData, rate: e.target.value})} /></div>
                                        <div><label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Hours</label><input type="number" className="w-full bg-stone-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" value={formData.hours} onChange={e => setFormData({...formData, hours: e.target.value})} /></div>
                                        <div><label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Total Cost</label><div className="px-3 py-2 text-sm text-emerald-400 font-bold bg-black/20 rounded-lg border border-white/5">{formatCurrency(formData.cost)}</div></div>
                                    </>
                                ) : (
                                    <div className="col-span-1">
                                        <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Total Cost ($)</label>
                                        <input type="number" className="w-full bg-stone-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Waste Type</label>
                            <select className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none appearance-none" value={formData.wasteType} onChange={e => setFormData({ ...formData, wasteType: e.target.value })}>
                                <option value="">None</option>
                                {wasteTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Status</label>
                            <select className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none appearance-none" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                <option value="pending">Pending</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="completed">Completed</option>
                                <option value="invoiced">Invoiced</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Notes</label>
                            <textarea className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none resize-none h-24" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="Driver instructions..." />
                        </div>
                    </div>
                </div>
                
                <div className="p-6 border-t border-white/10 flex justify-between items-center bg-stone-900/95 rounded-b-2xl">
                    {job ? (
                        <button onClick={() => onDelete(job.id)} className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl text-sm font-bold transition-colors">
                            Delete Job
                        </button>
                    ) : <div/>}
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-6 py-2 bg-white/5 text-gray-300 hover:bg-white/10 rounded-xl text-sm font-bold transition-colors">Cancel</button>
                        <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg transition-colors">Save Job</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT: Invoice Preview ---
const InvoicePreviewModal = ({ isOpen, onClose, jobs, currentDate, onInvoice }) => {
    if (!isOpen) return null;
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const weekLabel = `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`;
    const invoiceableJobs = jobs.filter(j => j.status !== 'invoiced' && j.resourceId !== 'unassigned' && isWithinInterval(parseISO(j.date), { start: weekStart, end: weekEnd }));
    const clientGroups = invoiceableJobs.reduce((acc, job) => {
        const key = job.clientId || job.clientName || 'Unknown';
        if (!acc[key]) acc[key] = { name: job.clientName || 'Unknown Client', id: job.clientId, jobs: [], total: 0 };
        acc[key].jobs.push(job);
        acc[key].total += (parseFloat(job.cost) || 0);
        return acc;
    }, {});
    const sortedGroups = Object.values(clientGroups).sort((a, b) => b.total - a.total);
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-fade-in">
            <div className="bg-stone-900 border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <div><h2 className="text-xl font-black text-white flex items-center gap-2"><FileCheck size={24} className="text-emerald-500" /> Smart Billing Run</h2><p className="text-xs text-gray-400 mt-1">Review jobs for week of {weekLabel}</p></div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20}/></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {invoiceableJobs.length === 0 ? <div className="text-center py-12 text-gray-500"><CheckCircle size={48} className="mx-auto mb-4 text-stone-700" /><p>No uninvoiced completed jobs found for this week.</p></div> : <div className="space-y-4">{sortedGroups.map(group => (<div key={group.id || group.name} className="bg-stone-800/50 border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:border-indigo-500/30 transition-all"><div className="flex-1"><h3 className="font-bold text-white text-lg">{group.name}</h3><div className="text-xs text-gray-400 flex gap-2 mt-1"><span className="bg-black/30 px-2 py-0.5 rounded">{group.jobs.length} Jobs</span><span className="text-indigo-400">Total: {formatCurrency(group.total)}</span></div></div><button onClick={() => onInvoice(group.jobs)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold shadow-lg flex items-center gap-2"><DollarSign size={16} /> Generate Invoice</button></div>))}</div>}
                </div>
            </div>
        </div>
    );
};

// --- COMPONENT: Service Manager ---
const ServiceManager = ({ onClose, services, setServices, categories, setCategories }) => {
    const [activeTab, setActiveTab] = useState('services');
    const [newService, setNewService] = useState({ name: '', cost: 0, category: 'General', pricingType: 'flat' });
    const [editingService, setEditingService] = useState(null);
    const [newCategory, setNewCategory] = useState('');
    const [editingCategory, setEditingCategory] = useState(null);

    const handleAddService = () => { if (!newService.name) return; setServices([...services, { ...newService, id: Date.now() }]); setNewService({ name: '', cost: 0, category: categories[0] || 'General', pricingType: 'flat' }); };
    const handleUpdateService = () => { if (!editingService || !editingService.name) return; setServices(services.map(s => s.id === editingService.id ? editingService : s)); setEditingService(null); };
    const handleDeleteService = (id) => { if(confirm('Delete this service?')) setServices(services.filter(s => s.id !== id)); };
    const handleAddCategory = () => { if (!newCategory || categories.includes(newCategory)) return; setCategories([...categories, newCategory]); setNewCategory(''); };
    const handleUpdateCategory = (oldCat, newCat) => { if (!newCat || categories.includes(newCat)) return; setCategories(categories.map(c => c === oldCat ? newCat : c)); setServices(services.map(s => s.category === oldCat ? { ...s, category: newCat } : s)); setEditingCategory(null); };
    const handleDeleteCategory = (cat) => { if(confirm(`Delete category "${cat}"? Services in this category will become "Uncategorized".`)) { setCategories(categories.filter(c => c !== cat)); setServices(services.map(s => s.category === cat ? { ...s, category: 'Uncategorized' } : s)); } };

    const renderServiceForm = (service, setService, isEditing = false) => (
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 items-end">
            <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Name</label><input className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm text-white" value={service.name} onChange={e => setService({...service, name: e.target.value})} placeholder="Service Name" /></div>
            <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Pricing</label><select className="w-full bg-black/30 border border-white/10 rounded px-2 py-2 text-sm text-white" value={service.pricingType || 'flat'} onChange={e => setService({...service, pricingType: e.target.value})}><option value="flat">Flat Rate</option><option value="hourly">Hourly</option></select></div>
            <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">{service.pricingType === 'hourly' ? '$/Hour' : 'Cost'}</label><input type="number" className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm text-white" value={service.cost} onChange={e => setService({...service, cost: parseFloat(e.target.value)})} placeholder="0.00" /></div>
            <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Category</label><select className="w-full bg-black/30 border border-white/10 rounded px-2 py-2 text-sm text-white" value={service.category} onChange={e => setService({...service, category: e.target.value})}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            {isEditing ? (<div className="flex gap-1"><button onClick={() => setEditingService(null)} className="p-2 bg-gray-600 rounded text-white"><X size={14}/></button><button onClick={handleUpdateService} className="p-2 bg-emerald-600 rounded text-white"><CheckCircle size={14}/></button></div>) : (<button onClick={handleAddService} className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded"><Plus size={18}/></button>)}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"><div className="bg-stone-900 border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[85vh]"><div className="p-6 border-b border-white/10 flex justify-between items-center"><h2 className="text-xl font-bold text-white flex items-center gap-2"><Settings size={20} className="text-indigo-400" /> Service Library</h2><button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20}/></button></div><div className="flex border-b border-white/10"><button onClick={() => setActiveTab('services')} className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'services' ? 'text-white border-b-2 border-indigo-500 bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}>Services</button><button onClick={() => setActiveTab('categories')} className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'categories' ? 'text-white border-b-2 border-indigo-500 bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}>Categories</button></div><div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-stone-900/50">{activeTab === 'services' ? (<div className="space-y-6"><div className="p-4 bg-stone-800/50 rounded-xl border border-white/5 space-y-3">{renderServiceForm(editingService || newService, editingService ? setEditingService : setNewService, !!editingService)}</div><table className="w-full text-sm text-left"><thead className="text-xs text-gray-500 uppercase border-b border-white/5"><tr><th className="pb-2">Name</th><th className="pb-2">Category</th><th className="pb-2">Type</th><th className="pb-2">Cost/Rate</th><th className="pb-2 text-right">Actions</th></tr></thead><tbody>{services.map(s => (<tr key={s.id} className="group hover:bg-white/5 border-b border-white/5 last:border-0"><td className="py-2 text-white font-medium">{s.name}</td><td className="py-2 text-gray-400">{s.category}</td><td className="py-2 text-gray-400">{s.pricingType}</td><td className="py-2 text-emerald-400 font-mono">{formatCurrency(s.cost)}</td><td className="py-2 text-right"><div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => setEditingService(s)} className="p-1 hover:bg-white/10 rounded"><Edit size={14}/></button><button onClick={() => handleDeleteService(s.id)} className="p-1 hover:bg-red-500/20 text-red-400 rounded"><Trash2 size={14}/></button></div></td></tr>))}</tbody></table></div>) : (<div className="space-y-4"><div className="flex gap-2"><input className="flex-1 bg-black/30 border border-white/10 rounded px-3 py-2 text-sm text-white" value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="New Category" /><button onClick={handleAddCategory} className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded"><Plus size={18}/></button></div><div className="grid grid-cols-2 gap-2">{categories.map(c => (<div key={c} className="flex items-center justify-between p-3 bg-stone-800 rounded-lg border border-white/5 group">{editingCategory === c ? (<div className="flex gap-1 flex-1"><input className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-white" defaultValue={c} onBlur={(e) => handleUpdateCategory(c, e.target.value)} autoFocus /></div>) : (<span className="text-sm font-medium text-white">{c}</span>)}<div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => setEditingCategory(c)} className="p-1 hover:bg-white/10 rounded"><Edit size={14}/></button><button onClick={() => handleDeleteCategory(c)} className="p-1 hover:bg-red-500/20 text-red-400 rounded"><Trash2 size={14}/></button></div></div>))}</div></div>)}</div></div></div>
    );
};

// --- MAIN BOARD COMPONENT ---
const JobBoard = () => {
    const navigate = useNavigate();
    
    // --- STATE ---
    const [currentDate, setCurrentDate] = useState(new Date());
    const [config, setConfig] = useState({ resourceType: 'equipment' });
    const [resources, setResources] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [projects, setProjects] = useState([]); // NEW: Projects State
    const [selectedJobIds, setSelectedJobIds] = useState(new Set());
    
    // FILTERS
    const [selectedResourceIds, setSelectedResourceIds] = useState([]); 
    const [selectedProjectIds, setSelectedProjectIds] = useState([]); // NEW: Project Filter
    const [showResourceFilter, setShowResourceFilter] = useState(false);
    const [showProjectFilter, setShowProjectFilter] = useState(false); // NEW: Project Filter UI
    
    // Configurable Categories & Services
    const [categories, setCategories] = useState(['Waste', 'Bin', 'Special', 'Transport', 'Labor']);
    const [services, setServices] = useState([
        { id: 1, name: 'General Waste', category: 'Waste', cost: 150, pricingType: 'flat' },
        { id: 2, name: 'Recycling', category: 'Waste', cost: 100, pricingType: 'flat' },
        { id: 3, name: 'Skip Bin 4m', category: 'Bin', cost: 250, pricingType: 'flat' },
        { id: 4, name: 'Hazardous', category: 'Special', cost: 500, pricingType: 'flat' },
        { id: 5, name: 'Labour Hire', category: 'Labor', cost: 80, pricingType: 'hourly' }
    ]);
    const wasteTypes = ['General', 'Green', 'Concrete', 'Mixed', 'Brick', 'Soil'];

    const [isServiceManagerOpen, setIsServiceManagerOpen] = useState(false);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState(null); 
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
        const savedServices = localStorage.getItem('job_board_services');
        if (savedServices) setServices(JSON.parse(savedServices));
        
        const savedCategories = localStorage.getItem('job_board_categories');
        if (savedCategories) setCategories(JSON.parse(savedCategories));
        
        const savedView = localStorage.getItem('job_board_view_context');
        if (savedView) {
            try {
                const { pIds, rIds } = JSON.parse(savedView);
                if (pIds) setSelectedProjectIds(pIds);
                if (rIds) setSelectedResourceIds(rIds);
            } catch(e) {}
        }
    }, [config.resourceType]);

    useEffect(() => {
        localStorage.setItem('job_board_services', JSON.stringify(services));
        localStorage.setItem('job_board_categories', JSON.stringify(categories));
    }, [services, categories]);

    useEffect(() => {
        localStorage.setItem('job_board_view_context', JSON.stringify({
            pIds: selectedProjectIds,
            rIds: selectedResourceIds
        }));
    }, [selectedProjectIds, selectedResourceIds]);

    const loadData = async () => {
        try {
            const endpoint = config.resourceType === 'equipment' ? '/equipment' : '/staff';
            const resRes = await api.get(endpoint);
            const resData = Array.isArray(resRes.data) ? resRes.data : (resRes.data.data || []);
            setResources(resData.map(r => ({ ...r, type: config.resourceType })));
            
            const jobsRes = await api.get('/jobs');
            setJobs(jobsRes.data);

            const projectsRes = await api.get('/projects');
            setProjects(projectsRes.data.data || projectsRes.data || []);
        } catch (e) { console.error("Load Error", e); }
    };

    // --- ACTIONS ---
    const moveJob = async (draggedId, targetResourceId, isSelectedDragging) => {
        let idsToMove = [draggedId];
        if (isSelectedDragging && selectedJobIds.has(draggedId)) {
            idsToMove = Array.from(selectedJobIds);
        }

        // Optimistic Update
        const updated = jobs.map(j => {
            if (idsToMove.includes(j.id)) {
                const status = targetResourceId === 'unassigned' ? 'pending' : (j.status === 'pending' ? 'scheduled' : j.status);
                const newDate = targetResourceId !== 'unassigned' ? new Date(currentDate).toISOString() : j.date;
                return { ...j, resourceId: targetResourceId, status, date: newDate };
            }
            return j;
        });
        setJobs(updated);
        setSelectedJobIds(new Set());

        try {
            await Promise.all(idsToMove.map(id => {
                const job = updated.find(j => j.id === id);
                return api.put(`/jobs/${id}`, job);
            }));
        } catch (e) {
            console.error("Move failed", e);
            loadData(); // Revert
        }
    };

    const handleSelectJob = (id, multi) => { if (multi) { const newSet = new Set(selectedJobIds); if (newSet.has(id)) newSet.delete(id); else newSet.add(id); setSelectedJobIds(newSet); } else { if (selectedJobIds.has(id) && selectedJobIds.size === 1) { setSelectedJobIds(new Set()); } else { setSelectedJobIds(new Set([id])); } } };
    
    const handleSaveJob = async (jobData) => { 
        try {
            if (editingJob && editingJob !== 'new') { 
                const res = await api.put(`/jobs/${jobData.id}`, jobData);
                setJobs(jobs.map(j => j.id === jobData.id ? res.data : j));
            } else { 
                const newJob = { ...jobData, resourceId: 'unassigned' }; 
                const res = await api.post('/jobs', newJob);
                setJobs([...jobs, res.data]);
            } 
            setEditingJob(null); 
        } catch(e) {
            alert("Failed to save job");
        }
    };

    const handleDeleteJob = async (id) => { 
        if (confirm("Delete this job?")) { 
            try {
                await api.delete(`/jobs/${id}`);
                setJobs(jobs.filter(j => j.id !== id)); 
                setEditingJob(null); 
            } catch(e) {
                alert("Failed to delete job");
            }
        } 
    };

    const handleGenerateInvoice = async (jobsToInvoice) => { 
        const items = jobsToInvoice.map(j => ({ 
            ...j, 
            description: j.pricingType === 'hourly' ? `${j.jobNumber} - ${j.serviceType} (${j.hours} hrs @ $${j.rate}/hr)` : `${j.jobNumber} - ${j.serviceType}`, 
            quantity: j.pricingType === 'hourly' ? j.hours : 1, 
            unitPrice: j.pricingType === 'hourly' ? j.rate : j.cost 
        })); 
        
        navigate('/invoices', { state: { jobItems: items, clientId: jobsToInvoice[0].clientId } }); 
        
        try {
            const ids = jobsToInvoice.map(j => j.id);
            await Promise.all(ids.map(id => api.put(`/jobs/${id}`, { status: 'invoiced' })));
            setJobs(jobs.map(j => ids.includes(j.id) ? { ...j, status: 'invoiced' } : j));
        } catch(e) {
            console.error("Failed to update status", e);
        }
        
        setIsInvoiceModalOpen(false); 
        setSelectedJobIds(new Set()); 
    };

    // --- FILTERING ---
    const filteredJobs = useMemo(() => {
        return jobs.filter(j => {
            const isUnassigned = String(j.resourceId) === 'unassigned';
            const matchesDate = isSameDay(parseISO(j.date), currentDate);
            
            // PROJECT FILTER (New Logic)
            if (selectedProjectIds.length > 0) {
                // If project filter is active, jobs must belong to one of the selected projects
                // Note: job.clientId matches project.clientId usually, but job might link to Project via ID?
                // The Job model currently doesn't store projectId explicitly in the schema I see, it stores clientName/clientId.
                // However, "Allocation" links to Project. "Job" links to Client.
                // The user asked to filter "Job Board" by "Project". 
                // If Job doesn't have projectId, I might need to filter by Client matching the Project's Client?
                // Or maybe I should assume Job has projectId? 
                // I'll check the JobModal... it has Client Selector.
                // It does NOT have Project Selector. 
                // CRITICAL: Job Board operates on CLIENTS currently. 
                // BUT the user asked to filter by PROJECT.
                // I will filter by matching the Job's Client to the Selected Project's Client.
                // Or if jobs have projectId (which they might in the DB even if not in the UI), I'll check that.
                
                // Strategy: Check if job.projectId exists. If not, check if job.clientId matches a selected project's clientId.
                const matchesProject = selectedProjectIds.some(pid => {
                    const p = projects.find(proj => String(proj.id) === String(pid));
                    // Strict match if job has projectId
                    if (j.projectId) return String(j.projectId) === String(pid);
                    // Fallback: Match by Client ID
                    return p && String(p.clientId) === String(j.clientId);
                });
                if (!matchesProject) return false;
            }

            if (!isUnassigned && !matchesDate) return false;
            if (searchTerm) { const search = searchTerm.toLowerCase(); return ( j.clientName?.toLowerCase().includes(search) || j.jobNumber?.toLowerCase().includes(search) || j.serviceType?.toLowerCase().includes(search) ); }
            return true;
        });
    }, [jobs, currentDate, searchTerm, selectedProjectIds, projects]);

    const unassignedJobs = filteredJobs.filter(j => String(j.resourceId) === 'unassigned');
    const scheduledJobs = filteredJobs.filter(j => String(j.resourceId) !== 'unassigned');

    const visibleResources = useMemo(() => {
        if (selectedResourceIds.length === 0) return resources;
        return resources.filter(r => selectedResourceIds.includes(r.id));
    }, [resources, selectedResourceIds]);

    const toggleResourceFilter = (id) => {
        if (selectedResourceIds.includes(id)) {
            setSelectedResourceIds(selectedResourceIds.filter(rid => rid !== id));
        } else {
            setSelectedResourceIds([...selectedResourceIds, id]);
        }
    };

    const toggleProjectFilter = (id) => {
        if (selectedProjectIds.includes(id)) {
            setSelectedProjectIds(selectedProjectIds.filter(pid => pid !== id));
        } else {
            setSelectedProjectIds([...selectedProjectIds, id]);
        }
    };

    return (
        <div className="h-[calc(100vh-80px)] flex flex-col bg-stone-950 text-white animate-fade-in">
            {/* --- TOP BAR --- */}
            <div className="h-16 px-6 border-b border-white/5 flex items-center justify-between bg-stone-900/50 backdrop-blur-md z-20">
                <div className="flex items-center gap-6">
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                        <Layout className="text-indigo-500" /> Job Board
                    </h1>
                    
                    <div className="flex items-center bg-black/20 rounded-lg p-1 border border-white/5">
                        <button onClick={() => setCurrentDate(subDays(currentDate, 1))} className="p-1 hover:bg-white/10 rounded-md text-gray-400 hover:text-white"><ChevronLeft size={18}/></button>
                        <div className="px-4 font-mono font-bold text-sm min-w-[120px] text-center">
                            {isSameDay(currentDate, new Date()) ? 'Today' : format(currentDate, 'MMM d, yyyy')}
                        </div>
                        <button onClick={() => setCurrentDate(addDays(currentDate, 1))} className="p-1 hover:bg-white/10 rounded-md text-gray-400 hover:text-white"><ChevronRight size={18}/></button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input type="text" placeholder="Search jobs..." className="bg-stone-800 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none w-48" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>

                    {/* PROJECT FILTER */}
                    <div className="relative">
                        <button onClick={() => setShowProjectFilter(!showProjectFilter)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-white/5 transition-all ${selectedProjectIds.length > 0 ? 'bg-amber-600 text-white' : 'bg-stone-800 hover:bg-stone-700'}`}>
                            <Briefcase size={16} /> 
                            {selectedProjectIds.length > 0 ? `Projects (${selectedProjectIds.length})` : 'All Projects'}
                        </button>
                        {showProjectFilter && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowProjectFilter(false)}/>
                                <div className="absolute top-full right-0 mt-2 w-64 bg-stone-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                                    <div className="p-3 border-b border-white/5 text-xs font-bold text-gray-500 uppercase flex justify-between">
                                        <span>Filter Projects</span>
                                        <button onClick={() => setSelectedProjectIds([])} className="text-indigo-400 hover:text-indigo-300">Reset</button>
                                    </div>
                                    <div className="max-h-60 overflow-y-auto custom-scrollbar p-2">
                                        {projects.map(p => (
                                            <div key={p.id} onClick={() => toggleProjectFilter(p.id)} className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg cursor-pointer">
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedProjectIds.length === 0 || selectedProjectIds.includes(p.id) ? 'bg-amber-600 border-amber-600' : 'border-gray-600'}`}>
                                                    {(selectedProjectIds.length === 0 || selectedProjectIds.includes(p.id)) && <CheckSquare size={12} className="text-white" />}
                                                </div>
                                                <span className={`text-sm ${selectedProjectIds.length === 0 || selectedProjectIds.includes(p.id) ? 'text-white' : 'text-gray-500'}`}>{p.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* RESOURCE FILTER */}
                    <div className="relative">
                        <button onClick={() => setShowResourceFilter(!showResourceFilter)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-white/5 transition-all ${selectedResourceIds.length > 0 ? 'bg-indigo-600 text-white' : 'bg-stone-800 hover:bg-stone-700'}`}>
                            <Filter size={16} /> 
                            {selectedResourceIds.length > 0 ? `Staff/Equip (${selectedResourceIds.length})` : 'All Resources'}
                        </button>
                        {showResourceFilter && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowResourceFilter(false)}/>
                                <div className="absolute top-full right-0 mt-2 w-64 bg-stone-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                                    <div className="p-3 border-b border-white/5 text-xs font-bold text-gray-500 uppercase flex justify-between">
                                        <span>Select Visible</span>
                                        <button onClick={() => setSelectedResourceIds([])} className="text-indigo-400 hover:text-indigo-300">Reset</button>
                                    </div>
                                    <div className="max-h-60 overflow-y-auto custom-scrollbar p-2">
                                        {resources.map(r => (
                                            <div key={r.id} onClick={() => toggleResourceFilter(r.id)} className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg cursor-pointer">
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedResourceIds.length === 0 || selectedResourceIds.includes(r.id) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-600'}`}>
                                                    {(selectedResourceIds.length === 0 || selectedResourceIds.includes(r.id)) && <CheckSquare size={12} className="text-white" />}
                                                </div>
                                                <span className={`text-sm ${selectedResourceIds.length === 0 || selectedResourceIds.includes(r.id) ? 'text-white' : 'text-gray-500'}`}>{r.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <button onClick={() => setIsServiceManagerOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 rounded-xl text-xs font-bold border border-white/5 transition-all"><Settings size={16} /> Services</button>
                    <button onClick={() => setConfig({ resourceType: config.resourceType === 'equipment' ? 'staff' : 'equipment' })} className="flex items-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 rounded-xl text-xs font-bold border border-white/5 transition-all">{config.resourceType === 'equipment' ? <Truck size={16} /> : <User size={16} />}{config.resourceType === 'equipment' ? 'View Staff' : 'View Fleet'}</button>
                    <button onClick={() => setIsInvoiceModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-xl text-xs font-bold border border-emerald-500/20 transition-all"><DollarSign size={16} /> Invoice</button>
                    <button onClick={() => setEditingJob('new')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all"><Plus size={16} /> Add Job</button>
                </div>
            </div>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="flex-1 flex overflow-hidden">
                {/* LEFT: BACKLOG SIDEBAR */}
                <div className="w-80 flex-shrink-0 z-10 shadow-2xl">
                    <BacklogColumn jobs={unassignedJobs} moveJob={moveJob} onEditJob={setEditingJob} selectedJobIds={selectedJobIds} onSelectJob={handleSelectJob} />
                </div>

                {/* RIGHT: SCHEDULE BOARD */}
                <div className="flex-1 overflow-x-auto overflow-y-hidden bg-stone-950/50 p-4">
                    <div className="flex gap-4 h-full">
                        {visibleResources.map(res => (
                            <ResourceColumn 
                                key={res.id} 
                                resource={res} 
                                jobs={scheduledJobs.filter(j => String(j.resourceId) === String(res.id))} 
                                moveJob={moveJob} 
                                onEditJob={setEditingJob}
                                selectedJobIds={selectedJobIds}
                                onSelectJob={handleSelectJob}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* --- MODALS --- */}
            {isServiceManagerOpen && ( <ServiceManager services={services} setServices={setServices} categories={categories} setCategories={setCategories} onClose={() => setIsServiceManagerOpen(false)} /> )}
            {isInvoiceModalOpen && ( <InvoicePreviewModal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} jobs={jobs} currentDate={currentDate} onInvoice={handleGenerateInvoice} /> )}
            {editingJob && ( <JobModal isOpen={!!editingJob} job={editingJob === 'new' ? null : editingJob} onClose={() => setEditingJob(null)} onSave={handleSaveJob} onDelete={handleDeleteJob} services={services} categories={categories} wasteTypes={wasteTypes} /> )}
            <CustomDragLayer />
        </div>
    );
};

export default JobBoard;