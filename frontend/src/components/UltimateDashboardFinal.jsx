/*
 * MasterDiaryApp Official - Master Dashboard (Enterprise Edition)
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 * 
 * Aggregates Quotes, Diary, Projects, and Financials into a single executive view.
 */

import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { 
  TrendingUp, TrendingDown, DollarSign, Calendar, Users, 
  Activity, ArrowUpRight, ArrowDownRight, Clock, Target,
  Briefcase, CheckCircle, AlertTriangle, MoreHorizontal,
  MapPin, FileText, Zap
} from 'lucide-react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const MasterDashboard = () => {
  const [stats, setStats] = useState({
    revenue: 0,
    cost: 0,
    profit: 0,
    activeProjects: 0,
    pendingQuotes: 0,
    diaryEntriesThisWeek: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [projectHealth, setProjectHealth] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, quotesRes, diariesRes] = await Promise.all([
          api.get('/projects'),
          api.get('/quotes'),
          api.get('/paint-diaries')
        ]);

        const projects = Array.isArray(projectsRes.data) ? projectsRes.data : projectsRes.data.data || [];
        const quotes = Array.isArray(quotesRes.data.data) ? quotesRes.data.data : [];
        const diaries = Array.isArray(diariesRes.data) ? diariesRes.data : [];

        // Calculate Totals
        const totalRevenue = diaries.reduce((acc, d) => acc + (parseFloat(d.totalRevenue) || 0), 0);
        const totalCost = diaries.reduce((acc, d) => acc + (parseFloat(d.totalCost) || 0), 0);
        const profit = totalRevenue - totalCost;

        // Recent Activity Feed
        const activities = [
          ...quotes.map(q => ({ type: 'quote', date: q.createdAt, title: `Quote created: ${q.name}`, value: q.totalRevenue })),
          ...diaries.map(d => ({ type: 'diary', date: d.date, title: `Diary entry: ${d.Project?.name || 'Unknown'}`, value: d.totalRevenue }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

        setStats({
          revenue: totalRevenue,
          cost: totalCost,
          profit: profit,
          activeProjects: projects.filter(p => p.status === 'active').length,
          pendingQuotes: quotes.length,
          diaryEntriesThisWeek: diaries.length // Simplified for demo
        });

        setRecentActivity(activities);
        setProjectHealth(projects.slice(0, 4)); // Mock health data for top 4 projects
        setLoading(false);
      } catch (err) {
        console.error("Dashboard Load Error:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen p-6 animate-fade-in font-sans text-gray-100">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Executive Overview</h1>
          <p className="text-gray-400 font-medium">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-stone-800 rounded-xl text-sm font-bold text-gray-300 hover:text-white border border-white/5 transition-colors">
            Custom Range
          </button>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-colors">
            Generate Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard 
          title="Total Revenue" 
          value={formatCurrency(stats.revenue)} 
          trend="+12.5%" 
          trendUp={true} 
          icon={DollarSign} 
          color="emerald"
        />
        <KPICard 
          title="Net Profit" 
          value={formatCurrency(stats.profit)} 
          trend="+8.2%" 
          trendUp={true} 
          icon={TrendingUp} 
          color="indigo"
        />
        <KPICard 
          title="Active Projects" 
          value={stats.activeProjects} 
          trend="On Track" 
          trendUp={true} 
          icon={Briefcase} 
          color="blue"
        />
        <KPICard 
          title="Pending Quotes" 
          value={stats.pendingQuotes} 
          trend="Needs Action" 
          trendUp={false} 
          icon={FileText} 
          color="amber"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Chart Section (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Revenue Chart */}
          <div className="bg-stone-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-white">Financial Performance</h3>
              <div className="flex gap-2">
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-400"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Revenue</span>
                <span className="flex items-center gap-1 text-xs font-bold text-rose-400"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Cost</span>
              </div>
            </div>
            <div className="h-64 w-full">
               <Line 
                 data={{
                   labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                   datasets: [
                     {
                       label: 'Revenue',
                       data: [12000, 19000, 3000, 5000, 2000, 3000, 15000], // Mock data
                       borderColor: '#10b981',
                       backgroundColor: 'rgba(16, 185, 129, 0.1)',
                       tension: 0.4,
                       fill: true
                     },
                     {
                       label: 'Cost',
                       data: [8000, 12000, 2000, 4000, 1500, 2500, 10000], // Mock data
                       borderColor: '#f43f5e',
                       backgroundColor: 'rgba(244, 63, 94, 0.1)',
                       tension: 0.4,
                       fill: true
                     }
                   ]
                 }}
                 options={{
                   responsive: true,
                   maintainAspectRatio: false,
                   plugins: { legend: { display: false } },
                   scales: { 
                     y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' } },
                     x: { grid: { display: false }, ticks: { color: '#9ca3af' } }
                   }
                 }}
               />
            </div>
          </div>

          {/* Active Projects List */}
          <div className="bg-stone-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl">
            <h3 className="font-bold text-lg text-white mb-4">Active Projects Status</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-xs text-gray-500 uppercase font-black border-b border-white/5">
                  <tr>
                    <th className="pb-3 pl-2">Project Name</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Progress</th>
                    <th className="pb-3 text-right">Budget</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {projectHealth.map((p, i) => (
                    <tr key={i} className="group hover:bg-white/5 transition-colors">
                      <td className="py-4 pl-2 font-bold text-white">{p.name}</td>
                      <td className="py-4">
                        <span className="px-2 py-1 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-gray-400 font-mono">75%</span>
                          <div className="w-16 h-1.5 bg-stone-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 w-3/4"></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-right font-mono text-gray-300">$120k</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Sidebar (1/3 width) */}
        <div className="space-y-8">
          
          {/* Live Activity Feed */}
          <div className="bg-stone-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl max-h-[500px] overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
              <h3 className="font-bold text-lg text-white">Live Activity</h3>
            </div>
            
            <div className="space-y-6 relative">
              <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-white/5"></div>
              {recentActivity.map((activity, i) => (
                <div key={i} className="relative flex gap-4">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-stone-900
                    ${activity.type === 'quote' ? 'bg-indigo-500 text-white' : 'bg-emerald-500 text-white'}
                  `}>
                    {activity.type === 'quote' ? <FileText size={16} /> : <CheckCircle size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{activity.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{new Date(activity.date).toLocaleString()}</p>
                    {activity.value && <p className="text-xs font-mono font-bold text-gray-300 mt-1">{formatCurrency(activity.value)}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 shadow-lg text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap size={120} />
            </div>
            <h3 className="font-black text-xl mb-1 relative z-10">Quick Actions</h3>
            <p className="text-indigo-200 text-sm mb-6 relative z-10">Jump start your workflow</p>
            
            <div className="grid grid-cols-2 gap-3 relative z-10">
              <button className="p-3 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm transition-all text-left group">
                <FileText size={20} className="mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold block">New Quote</span>
              </button>
              <button className="p-3 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm transition-all text-left group">
                <Clock size={20} className="mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold block">Log Time</span>
              </button>
              <button className="p-3 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm transition-all text-left group">
                <Users size={20} className="mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold block">Add Staff</span>
              </button>
              <button className="p-3 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm transition-all text-left group">
                <MapPin size={20} className="mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold block">Map View</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const KPICard = ({ title, value, trend, trendUp, icon: Icon, color }) => {
  const colors = {
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    indigo: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  };

  return (
    <div className="bg-stone-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-lg hover:-translate-y-1 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon size={24} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold ${trendUp ? 'text-emerald-400' : 'text-rose-400'}`}>
          {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-3xl font-black text-white tracking-tight">{value}</h3>
      </div>
    </div>
  );
};

export default MasterDashboard;
