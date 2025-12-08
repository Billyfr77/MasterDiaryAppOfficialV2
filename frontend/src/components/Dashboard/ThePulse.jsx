import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api.js';
import { 
  Activity, TrendingUp, AlertTriangle, CheckCircle2, Clock, 
  ArrowRight, Plus, DollarSign, Users, Package 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const ThePulse = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    revenueToday: 0,
    activeProjects: 0,
    openTasks: 0,
    resourceConflicts: 0
  });
  const [activityFeed, setActivityFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Parallel fetching for speed
        const [projects, invoices, workflows, allocations] = await Promise.all([
          api.get('/projects'),
          api.get('/invoices'),
          api.get('/workflows'),
          api.get('/allocations')
        ]);

        const projectData = projects.data.data || projects.data;
        const invoiceData = invoices.data || [];
        const workflowData = workflows.data || [];
        const allocationData = allocations.data || [];

        // Calc Stats
        const today = new Date().toISOString().split('T')[0];
        const revToday = invoiceData
          .filter(inv => inv.createdAt.startsWith(today))
          .reduce((sum, inv) => sum + parseFloat(inv.totalAmount || 0), 0);

        const tasks = workflowData.reduce((acc, wf) => {
            return acc + (wf.nodes?.filter(n => n.data.status === 'in-progress').length || 0);
        }, 0);

        // Simple conflict check (duplicate resource/day)
        const conflictMap = {};
        let conflicts = 0;
        allocationData.forEach(a => {
            const key = `${a.resourceId}-${a.startDate}`;
            if (conflictMap[key]) conflicts++;
            conflictMap[key] = true;
        });

        setStats({
          revenueToday: revToday,
          activeProjects: projectData.filter(p => p.status === 'active').length,
          openTasks: tasks,
          resourceConflicts: conflicts
        });

        // Mock Activity Feed (Real implementation would pull from a Logs/Notifications table)
        setActivityFeed([
            { id: 1, type: 'alert', message: `${conflicts} Resource conflicts detected`, time: 'Now' },
            { id: 2, type: 'success', message: 'Quote #402 approved by Client', time: '2h ago' },
            { id: 3, type: 'info', message: 'Project "Skyline" status updated to Active', time: '4h ago' },
            { id: 4, type: 'neutral', message: 'New stock arrived: 50x Drywall Sheets', time: 'Yesterday' }
        ]);

      } catch (err) {
        console.error("Pulse Load Error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-stone-950 text-indigo-500 animate-pulse font-mono">CONNECTING TO PULSE...</div>;

  return (
    <div className="min-h-screen bg-stone-950 text-gray-100 p-8 font-sans animate-fade-in">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-10">
            <div>
                <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tight flex items-center gap-4">
                    <Activity size={48} className="text-indigo-500" /> THE PULSE
                </h1>
                <p className="text-gray-500 mt-2 font-medium text-lg">Live Operational Intelligence</p>
            </div>
            <div className="flex gap-3">
                <button onClick={() => navigate('/projects')} className="px-6 py-3 bg-stone-900 border border-white/10 hover:border-indigo-500/50 rounded-xl font-bold transition-all flex items-center gap-2">
                    <Plus size={18} /> New Project
                </button>
                <button onClick={() => navigate('/invoices')} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-900/30 transition-all flex items-center gap-2">
                    <DollarSign size={18} /> New Invoice
                </button>
            </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <KpiCard 
                label="Revenue (24h)" 
                value={`$${stats.revenueToday.toLocaleString()}`} 
                trend="+12%" 
                icon={TrendingUp} 
                color="emerald" 
            />
            <KpiCard 
                label="Active Projects" 
                value={stats.activeProjects} 
                trend="Stable" 
                icon={Activity} 
                color="indigo" 
            />
            <KpiCard 
                label="Pending Tasks" 
                value={stats.openTasks} 
                trend="High Load" 
                icon={Clock} 
                color="amber" 
            />
            <KpiCard 
                label="Critical Alerts" 
                value={stats.resourceConflicts} 
                trend={stats.resourceConflicts > 0 ? "Action Req" : "Clear"} 
                icon={AlertTriangle} 
                color="rose" 
                isAlert={stats.resourceConflicts > 0}
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Activity Feed */}
            <div className="lg:col-span-2 bg-stone-900/50 backdrop-blur-md rounded-3xl border border-white/5 p-8">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Activity size={20} className="text-cyan-400" /> Live Feed
                </h3>
                <div className="space-y-6 relative">
                    {/* Timeline Line */}
                    <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-white/5"></div>

                    {activityFeed.map((item, idx) => (
                        <div key={item.id} className="flex gap-6 relative z-10 group">
                            <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center border-4 border-stone-950 shrink-0
                                ${item.type === 'alert' ? 'bg-rose-500 text-white' : 
                                  item.type === 'success' ? 'bg-emerald-500 text-white' : 
                                  'bg-stone-800 text-gray-400 border-stone-700'}
                            `}>
                                {item.type === 'alert' ? <AlertTriangle size={16} /> : 
                                 item.type === 'success' ? <CheckCircle2 size={16} /> : 
                                 <Clock size={16} />}
                            </div>
                            <div className="bg-stone-900 border border-white/5 p-4 rounded-xl flex-1 group-hover:border-white/10 transition-colors">
                                <p className="text-gray-200 font-medium">{item.message}</p>
                                <span className="text-xs text-gray-500 font-mono mt-1 block">{item.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Links / Status */}
            <div className="space-y-6">
                <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-white/10 rounded-3xl p-6">
                    <h3 className="font-bold text-white mb-4">System Status</h3>
                    <div className="space-y-4">
                        <StatusItem label="Database" status="online" />
                        <StatusItem label="AI Engine" status="online" />
                        <StatusItem label="Xero Sync" status="syncing" />
                    </div>
                </div>

                <div className="bg-stone-900/50 border border-white/5 rounded-3xl p-6">
                    <h3 className="font-bold text-white mb-4">Shortcuts</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <ShortcutBtn icon={Users} label="Staff" onClick={() => navigate('/staff')} />
                        <ShortcutBtn icon={Package} label="Stock" onClick={() => navigate('/nodes')} />
                        <ShortcutBtn icon={Clock} label="Diary" onClick={() => navigate('/diary')} />
                        <ShortcutBtn icon={CheckCircle2} label="Tasks" onClick={() => navigate('/workflows')} />
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

// --- SUB COMPONENTS ---

const KpiCard = ({ label, value, trend, icon: Icon, color, isAlert }) => (
    <div className={`p-6 rounded-3xl border transition-all hover:-translate-y-1 ${isAlert ? 'bg-rose-900/20 border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.2)]' : 'bg-stone-900/60 border-white/5 hover:border-white/10'}`}>
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${isAlert ? 'bg-rose-500 text-white' : `bg-${color}-500/10 text-${color}-400`}`}>
                <Icon size={24} />
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${isAlert ? 'bg-rose-500/20 text-rose-300' : 'bg-white/5 text-gray-400'}`}>
                {trend}
            </span>
        </div>
        <div className="text-3xl font-black text-white tracking-tight mb-1">{value}</div>
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</div>
    </div>
);

const StatusItem = ({ label, status }) => (
    <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-amber-500 animate-pulse'}`} />
            <span className="text-xs uppercase font-bold text-gray-500">{status}</span>
        </div>
    </div>
);

const ShortcutBtn = ({ icon: Icon, label, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center p-4 bg-stone-950 border border-white/5 rounded-xl hover:bg-stone-800 hover:border-indigo-500/50 transition-all group">
        <Icon size={20} className="text-gray-400 group-hover:text-indigo-400 mb-2 transition-colors" />
        <span className="text-xs font-bold text-gray-300 group-hover:text-white">{label}</span>
    </button>
);

export default ThePulse;
