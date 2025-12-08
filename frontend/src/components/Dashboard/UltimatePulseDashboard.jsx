/*
 * MasterDiaryApp Official - Ultimate Pulse Dashboard (Enterprise Hub)
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 * 
 * THE ULTIMATE HUB: Financials, Operations, Live Ops, and Command Center.
 * DESIGN: "Vibrant Glassmorphism" with High-Fidelity Data Viz.
 * FEATURES: AI Neural Core, Predictive Forecasting, Resource Radar.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';
import { 
  Activity, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Clock, 
  ArrowRight, Plus, DollarSign, Users, Package, Zap, BarChart3, 
  Briefcase, Folder, MoreHorizontal, Target, Award, Calendar, FileText,
  Map as MapIcon, GitBranch, Layers, Truck, PenTool, Layout, Box, PieChart,
  BrainCircuit, Sparkles, ChevronRight, Filter
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
  Filler
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
  ArcElement,
  Filler
);

// --- UTILS ---
const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

// --- SMART INSIGHTS ENGINE ---
const generateSmartInsights = (stats, conflicts, quotes) => {
  const insights = [];
  
  if (conflicts > 0) {
    insights.push({ type: 'critical', message: `${conflicts} critical resource conflict${conflicts > 1 ? 's' : ''} detected. Immediate resolution required to prevent delays.`, icon: AlertTriangle, color: 'rose' });
  }
  
  if (stats.revenueToday > stats.revenueAverage * 1.2) {
    insights.push({ type: 'positive', message: `Revenue is trending 20% higher than average today. Great momentum!`, icon: TrendingUp, color: 'emerald' });
  }
  
  if (stats.pendingQuotes > 3) {
    insights.push({ type: 'warning', message: `${stats.pendingQuotes} high-value quotes are pending approval. Follow up to secure pipeline.`, icon: Clock, color: 'amber' });
  }

  if (stats.staffUtilization < 40) {
    insights.push({ type: 'info', message: `Staff utilization is low (${stats.staffUtilization}%). Consider assigning maintenance tasks or training.`, icon: Users, color: 'blue' });
  } else if (stats.staffUtilization > 90) {
    insights.push({ type: 'warning', message: `Staff utilization is critical (${stats.staffUtilization}%). Risk of burnout/overtime costs.`, icon: Users, color: 'orange' });
  }

  if (insights.length === 0) {
    insights.push({ type: 'neutral', message: 'Operations are running smoothly. No critical anomalies detected.', icon: CheckCircle2, color: 'indigo' });
  }

  return insights;
};

// --- SUB-COMPONENTS ---

const NeuralCore = ({ insights }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % insights.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [insights]);

  const activeInsight = insights[currentIndex] || insights[0];
  const Icon = activeInsight.icon;

  return (
    <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 border border-white/10 rounded-[2rem] p-1 shadow-2xl relative overflow-hidden group mb-8">
      <div className={`absolute inset-0 opacity-20 bg-gradient-to-r from-${activeInsight.color}-500/20 to-transparent transition-colors duration-1000`}></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
      
      <div className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl bg-${activeInsight.color}-500/20 text-${activeInsight.color}-400 shadow-[0_0_15px_rgba(var(--color-primary),0.3)] animate-pulse-slow`}>
            <BrainCircuit size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-black uppercase tracking-widest text-${activeInsight.color}-400`}>AI Neural Analysis</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-ping"></span>
            </div>
            <p className="text-white font-medium text-sm md:text-base animate-fade-in key={currentIndex}">
              {activeInsight.message}
            </p>
          </div>
        </div>
        <div className="hidden md:flex gap-1">
          {insights.map((_, idx) => (
            <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? `w-8 bg-${activeInsight.color}-500` : 'w-2 bg-white/10'}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

const KpiCard = ({ label, value, trend, icon: Icon, color, isAlert, delay }) => {
  let bgClass = `bg-stone-900/60 border-white/5 hover:border-white/10`;
  let iconBg = `bg-${color}-500/10 text-${color}-400`;
  let trendClass = `bg-white/5 text-gray-400`;

  if (isAlert) {
    bgClass = `bg-rose-900/20 border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.2)] animate-pulse-slow`;
    iconBg = `bg-rose-500 text-white`;
    trendClass = `bg-rose-500/20 text-rose-300`;
  } else {
    // Dynamic color classes
    const colors = {
      emerald: { text: 'text-emerald-400', bg: 'bg-emerald-500/20' },
      indigo: { text: 'text-indigo-400', bg: 'bg-indigo-500/20' },
      amber: { text: 'text-amber-400', bg: 'bg-amber-500/20' },
      blue: { text: 'text-blue-400', bg: 'bg-blue-500/20' },
      purple: { text: 'text-purple-400', bg: 'bg-purple-500/20' },
    };
    if (colors[color]) {
      iconBg = colors[color].bg + ' ' + colors[color].text;
      trendClass = colors[color].bg + ' ' + colors[color].text; 
    }
  }

  return (
    <div 
      className={`p-6 rounded-[2rem] border transition-all hover:-translate-y-1 backdrop-blur-md ${bgClass} animate-fade-in-up group`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3.5 rounded-2xl ${iconBg} shadow-inner group-hover:scale-110 transition-transform`}>
          <Icon size={26} strokeWidth={2.5} />
        </div>
        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${trendClass}`}>
          {trend}
        </span>
      </div>
      <div className="text-4xl font-black text-white tracking-tight mb-1 drop-shadow-md">{value}</div>
      <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</div>
    </div>
  );
};

const QuickActionBtn = ({ icon: Icon, label, desc, color, onClick, delay }) => {
  let gradient = 'from-stone-700 to-stone-800';
  if (color === 'indigo') gradient = 'from-indigo-600 to-violet-600';
  if (color === 'emerald') gradient = 'from-emerald-600 to-teal-600';
  if (color === 'rose') gradient = 'from-rose-600 to-pink-600';
  if (color === 'amber') gradient = 'from-amber-500 to-orange-600';
  if (color === 'blue') gradient = 'from-blue-600 to-cyan-600';
  if (color === 'purple') gradient = 'from-purple-600 to-fuchsia-600';

  return (
    <button 
      onClick={onClick}
      className={`
        relative overflow-hidden group p-4 rounded-2xl border border-white/5 
        bg-gradient-to-br ${gradient} shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all
        text-left flex flex-col justify-between min-h-[110px] animate-fade-in-up
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute -right-4 -bottom-4 opacity-20 transform group-hover:scale-110 transition-transform duration-500 rotate-12">
        <Icon size={80} />
      </div>
      
      <div className="bg-black/20 w-fit p-2.5 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform border border-white/10 relative z-10">
        <Icon size={22} className="text-white" />
      </div>
      <div className="relative z-10 mt-3">
        <div className="text-sm font-black text-white leading-tight">{label}</div>
        <div className="text-[10px] font-medium text-white/70 mt-0.5">{desc}</div>
      </div>
    </button>
  );
};

const ActivityItem = ({ item }) => (
  <div className="flex gap-4 relative z-10 group animate-fade-in">
    <div className={`
        w-10 h-10 rounded-full flex items-center justify-center border-4 border-stone-950 shrink-0 shadow-lg
        ${item.type === 'alert' ? 'bg-gradient-to-br from-rose-500 to-pink-600 text-white' : 
          item.type === 'success' ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white' : 
          item.type === 'quote' ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white' :
          'bg-stone-800 text-gray-400 border-stone-700'}
    `}>
        {item.type === 'alert' ? <AlertTriangle size={16} strokeWidth={2.5} /> : 
         item.type === 'success' || item.type === 'quote' ? <CheckCircle2 size={16} strokeWidth={2.5} /> : 
         <Clock size={16} />}
    </div>
    <div className="bg-stone-900/50 border border-white/5 p-4 rounded-2xl flex-1 group-hover:border-white/10 group-hover:bg-stone-900 transition-all hover:translate-x-1">
        <p className="text-gray-200 font-bold text-sm">{item.message}</p>
        <div className="flex justify-between items-center mt-1">
           <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wide">{item.time}</span>
           {item.value && <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">{item.value}</span>}
        </div>
    </div>
  </div>
);

// --- MAIN COMPONENT ---

const UltimatePulseDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Data State
  const [stats, setStats] = useState({
    revenueTotal: 0,
    revenueToday: 0,
    revenueAverage: 0, // Added for insights
    profit: 0,
    activeProjects: 0,
    resourceConflicts: 0,
    pendingQuotes: 0,
    staffUtilization: 0,
    equipmentUtilization: 0
  });
  
  const [activityFeed, setActivityFeed] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], revenue: [], cost: [], forecast: [] });
  const [projectDistData, setProjectDistData] = useState({ labels: [], data: [] });
  const [projectHealth, setProjectHealth] = useState([]);
  const [topResources, setTopResources] = useState([]);
  
  // UI State
  const [chartPeriod, setChartPeriod] = useState(7); // 7 or 30 days
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' or 'alerts'

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [projectsRes, invoicesRes, quotesRes, diariesRes, allocationsRes, workflowsRes, staffRes, equipRes] = await Promise.all([
          api.get('/projects'),
          api.get('/invoices'),
          api.get('/quotes'),
          api.get('/paint-diaries'),
          api.get('/allocations'),
          api.get('/workflows'),
          api.get('/staff'),
          api.get('/equipment')
        ]);

        const projects = projectsRes.data.data || projectsRes.data || [];
        const quotes = quotesRes.data.data || quotesRes.data || [];
        const diaries = diariesRes.data || [];
        const allocations = allocationsRes.data || [];
        const staff = staffRes.data.data || staffRes.data || [];
        const equipment = equipRes.data.data || equipRes.data || [];

        // --- CALCULATIONS ---

        // 1. Financials
        const totalRevenue = diaries.reduce((acc, d) => acc + (parseFloat(d.totalRevenue) || 0), 0);
        const totalCost = diaries.reduce((acc, d) => acc + (parseFloat(d.totalCost) || 0), 0);
        const todayStr = new Date().toISOString().split('T')[0];
        const revenueToday = diaries
          .filter(d => d.date && d.date.startsWith(todayStr))
          .reduce((acc, d) => acc + (parseFloat(d.totalRevenue) || 0), 0);

        // 2. Chart Data (History + Simple Forecast)
        const daysToChart = chartPeriod;
        const historyDays = [...Array(daysToChart)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (daysToChart - 1 - i));
            return d.toISOString().split('T')[0];
        });

        const chartRevenue = historyDays.map(date => diaries.filter(d => d.date === date).reduce((sum, d) => sum + (parseFloat(d.totalRevenue)||0), 0));
        const chartCost = historyDays.map(date => diaries.filter(d => d.date === date).reduce((sum, d) => sum + (parseFloat(d.totalCost)||0), 0));
        
        // Simple Forecast: Average of last 3 active days * 1.1 (growth)
        const avgDailyRev = chartRevenue.reduce((a,b)=>a+b,0) / (chartRevenue.filter(r=>r>0).length || 1);
        const forecastData = chartRevenue.map((v, i) => i === chartRevenue.length - 1 ? v : null); // Start line at end
        // Add 2 days of forecast points
        const futureLabels = [...historyDays.map(d => new Date(d).toLocaleDateString('en-US', { weekday: 'short' })), 'Tom', 'Next'];
        const futureForecast = [...Array(historyDays.length).fill(null)];
        futureForecast[historyDays.length - 1] = chartRevenue[chartRevenue.length - 1]; // Connect lines
        futureForecast.push(avgDailyRev * 1.05);
        futureForecast.push(avgDailyRev * 1.1);


        // 3. Project Distribution
        const projectRevenue = {};
        diaries.forEach(d => {
           const pName = d.Project?.name || 'Unknown';
           projectRevenue[pName] = (projectRevenue[pName] || 0) + (parseFloat(d.totalRevenue) || 0);
        });
        const sortedProjects = Object.entries(projectRevenue).sort((a,b) => b[1] - a[1]).slice(0, 5);

        // 4. Operational & Resource Radar
        const conflictMap = {};
        let conflicts = 0;
        const resourceUsageCount = {};

        allocations.forEach(a => {
            const key = `${a.resourceId}-${a.startDate}`;
            if (conflictMap[key]) conflicts++;
            conflictMap[key] = true;
            
            // Count usage for Radar
            resourceUsageCount[a.resourceId] = (resourceUsageCount[a.resourceId] || 0) + 1;
        });

        // Top Resources Logic
        const topRes = [...staff, ...equipment]
           .map(r => ({ ...r, usage: resourceUsageCount[r.id] || 0 }))
           .sort((a,b) => b.usage - a.usage)
           .slice(0, 4);

        // Utilization %
        let activeStaffCount = 0;
        let activeEquipCount = 0;
        allocations.forEach(a => {
          if (a.startDate === todayStr) {
             if (staff.some(s => s.id === a.resourceId)) activeStaffCount++;
             if (equipment.some(e => e.id === a.resourceId)) activeEquipCount++;
          }
        });
        const staffUtil = staff.length > 0 ? Math.round((activeStaffCount / staff.length) * 100) : 0;
        const equipUtil = equipment.length > 0 ? Math.round((activeEquipCount / equipment.length) * 100) : 0;

        // 5. Activity Feed Construction
        let feed = [];
        if (conflicts > 0) feed.push({ id: 'alert-1', type: 'alert', message: `${conflicts} Resource conflict(s) detected.`, time: 'Now' });
        quotes.slice(0, 3).forEach(q => {
           feed.push({ id: `q-${q.id}`, type: 'quote', message: `Quote "${q.name}" Created`, time: new Date(q.createdAt).toLocaleDateString(), value: formatCurrency(q.totalRevenue) });
        });
        diaries.slice(0, 3).forEach(d => {
           feed.push({ id: `d-${d.id}`, type: 'success', message: `Work Logged: ${d.Project?.name || 'Project'}`, time: new Date(d.createdAt).toLocaleDateString(), value: `+${formatCurrency(d.totalRevenue)}` });
        });

        setStats({
          revenueTotal: totalRevenue,
          revenueToday: revenueToday,
          revenueAverage: avgDailyRev,
          profit: totalRevenue - totalCost,
          activeProjects: projects.filter(p => p.status === 'active').length,
          resourceConflicts: conflicts,
          pendingQuotes: quotes.filter(q => q.status === 'DRAFT').length,
          staffUtilization: staffUtil,
          equipmentUtilization: equipUtil
        });

        setChartData({
           labels: futureLabels,
           revenue: [...chartRevenue, null, null],
           cost: [...chartCost, null, null],
           forecast: futureForecast
        });

        setProjectDistData({ labels: sortedProjects.map(i => i[0]), data: sortedProjects.map(i => i[1]) });
        setProjectHealth(projects.filter(p => p.status === 'active').slice(0, 5));
        setTopResources(topRes);
        setActivityFeed(feed);
        setLoading(false);

      } catch (err) {
        console.error("Dashboard Error:", err);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [chartPeriod]);

  // Insights
  const neuralInsights = useMemo(() => generateSmartInsights(stats, stats.resourceConflicts, stats.pendingQuotes), [stats]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-t-4 border-b-4 border-indigo-500 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap size={24} className="text-indigo-400 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 font-sans text-gray-100 bg-transparent animate-fade-in pb-20">
      
      {/* --- TOP HEADER --- */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-8 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/20 ring-1 ring-white/10">
              <Activity className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 tracking-tight">
                {getTimeBasedGreeting()}, Master
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Clock size={12} className="text-indigo-400" />
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                  {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} • {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* System Status Pills */}
        <div className="flex items-center gap-4 bg-stone-900/80 p-1.5 pl-4 pr-1.5 rounded-full border border-white/10 backdrop-blur-md shadow-lg">
           <div className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></span>
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Systems Nominal</span>
           </div>
           <div className="h-4 w-px bg-white/10"></div>
           <button onClick={() => navigate('/settings')} className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
             <MoreHorizontal size={16} />
           </button>
        </div>
      </div>

      {/* --- NEURAL CORE (AI INSIGHTS) --- */}
      <NeuralCore insights={neuralInsights} />

      {/* --- KPI HERO GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        <KpiCard 
          label="Revenue (Today)" 
          value={formatCurrency(stats.revenueToday)} 
          trend="Live Pulse" 
          icon={Zap} 
          color="amber"
          delay={0}
        />
        <KpiCard 
          label="Net Profit (Total)" 
          value={formatCurrency(stats.profit)} 
          trend="+12.5%" 
          icon={TrendingUp} 
          color="emerald"
          delay={100}
        />
        <KpiCard 
          label="Staff Utilization" 
          value={`${stats.staffUtilization}%`} 
          trend={stats.staffUtilization > 80 ? 'High Load' : 'Optimal'} 
          icon={Users} 
          color="blue"
          delay={200}
        />
        <KpiCard 
          label="Critical Alerts" 
          value={stats.resourceConflicts} 
          trend={stats.resourceConflicts > 0 ? "Action Req" : "Clear"} 
          icon={AlertTriangle} 
          color="rose" 
          isAlert={stats.resourceConflicts > 0} 
          delay={300}
        />
      </div>

      {/* --- MAIN CONTENT SPLIT --- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN (2/3) */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* CHART SECTION */}
          <div className="bg-stone-900/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none transform group-hover:scale-110">
              <BarChart3 size={240} />
            </div>
            
            <div className="flex flex-wrap justify-between items-center mb-8 relative z-10 gap-4">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  Financial Velocity
                  <span className="px-2 py-0.5 rounded-full bg-stone-800 text-[10px] text-gray-400 border border-white/5">Forecast Enabled</span>
                </h3>
              </div>
              <div className="flex gap-2">
                {['7D', '30D'].map(p => (
                   <button 
                     key={p} 
                     onClick={() => setChartPeriod(p === '7D' ? 7 : 30)}
                     className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-colors ${chartPeriod === (p==='7D'?7:30) ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-stone-800 border-white/10 text-gray-400 hover:text-white'}`}
                   >
                     {p}
                   </button>
                ))}
              </div>
            </div>

            <div className="h-[320px] w-full relative z-10">
              <Line 
                data={{
                  labels: chartData.labels,
                  datasets: [
                    {
                      label: 'Revenue',
                      data: chartData.revenue,
                      borderColor: '#10b981',
                      backgroundColor: (context) => {
                        const ctx = context.chart.ctx;
                        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
                        gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
                        return gradient;
                      },
                      tension: 0.4,
                      fill: true,
                      borderWidth: 3,
                      pointRadius: 4,
                      pointHoverRadius: 8
                    },
                    {
                      label: 'Forecast',
                      data: chartData.forecast,
                      borderColor: '#f59e0b', // Amber for forecast
                      borderDash: [5, 5],
                      backgroundColor: 'transparent',
                      tension: 0.4,
                      borderWidth: 2,
                      pointRadius: 3
                    },
                    {
                      label: 'Cost',
                      data: chartData.cost,
                      borderColor: '#f43f5e',
                      backgroundColor: 'transparent',
                      borderDash: [2, 2],
                      tension: 0.4,
                      borderWidth: 2,
                      pointRadius: 0
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false, backgroundColor: 'rgba(20, 20, 20, 0.9)', titleColor: '#fff', bodyColor: '#ccc', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, padding: 12, displayColors: false } },
                  scales: { 
                    y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#6b7280', font: { family: 'monospace', size: 10 } }, border: { display: false } },
                    x: { grid: { display: false }, ticks: { color: '#6b7280', font: { weight: 'bold', size: 10 } }, border: { display: false } }
                  },
                  interaction: { mode: 'nearest', axis: 'x', intersect: false }
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* TOP EARNERS */}
            <div className="bg-stone-900/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative flex flex-col items-center">
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-6 w-full flex justify-between items-center">
                <span>Revenue Breakdown</span>
                <PieChart size={16} className="text-gray-500" />
              </h3>
              <div className="w-48 h-48 relative">
                <Doughnut 
                  data={{
                    labels: projectDistData.labels,
                    datasets: [{
                      data: projectDistData.data,
                      backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899'],
                      borderWidth: 0,
                      hoverOffset: 10
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '75%',
                    plugins: { legend: { display: false } }
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <span className="text-2xl font-black text-white">{projectDistData.labels.length}</span>
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Projects</div>
                  </div>
                </div>
              </div>
            </div>

            {/* RESOURCE RADAR */}
            <div className="bg-stone-900/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
              <h3 className="text-sm font-black text-white uppercase tracking-wider mb-6 w-full flex justify-between items-center">
                <span>Top Resources</span>
                <Users size={16} className="text-gray-500" />
              </h3>
              <div className="space-y-5">
                {topResources.map((r, i) => (
                  <div key={r.id || i}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-gray-300">{r.name}</span>
                      <span className="text-[10px] font-mono text-gray-500">{r.usage} Allocations</span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${i===0 ? 'bg-indigo-500' : i===1 ? 'bg-purple-500' : 'bg-gray-600'}`} 
                        style={{ width: `${Math.min(100, (r.usage * 10))}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
                {topResources.length === 0 && <p className="text-xs text-gray-500 text-center">No resource data available</p>}
              </div>
            </div>
          </div>

          {/* PROJECT HEALTH TABLE */}
          <div className="bg-stone-900/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Briefcase size={20} className="text-blue-400" /> Active Projects
              </h3>
              <button onClick={() => navigate('/projects')} className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-white transition-colors bg-indigo-500/10 px-3 py-1.5 rounded-full hover:bg-indigo-500">
                View All <ArrowRight size={12} />
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-white/5">
                    <th className="pb-4 pl-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Project</th>
                    <th className="pb-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                    <th className="pb-4 text-right text-[10px] font-black text-gray-500 uppercase tracking-widest">Progress</th>
                    <th className="pb-4 text-right pr-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {projectHealth.map((p, i) => (
                    <tr key={p.id || i} className="group hover:bg-white/5 transition-colors">
                      <td className="py-4 pl-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-lg">
                            {p.name.substring(0,2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm">{p.name}</div>
                            <div className="text-[10px] text-gray-500 flex items-center gap-1"><MapIcon size={8} /> {p.site || 'Remote'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                          Active
                        </span>
                      </td>
                      <td className="py-4 text-right w-48">
                        <div className="flex items-center justify-end gap-3">
                          <span className="text-[10px] font-mono font-bold text-gray-400">75%</span>
                          <div className="w-24 h-1.5 bg-stone-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 w-3/4 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-right pr-4 font-mono font-bold text-white text-sm">
                        {formatCurrency(p.value || 0)}
                      </td>
                    </tr>
                  ))}
                  {projectHealth.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-10 text-center text-gray-500 text-sm">
                        <Folder size={32} className="mx-auto mb-2 opacity-20" />
                        No active projects found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (1/3) - COMMAND CENTER */}
        <div className="space-y-8">
          
          {/* COMMAND DOCK */}
          <div className="bg-stone-900/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative">
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 blur-[60px] opacity-20 rounded-full pointer-events-none"></div>
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Zap size={14} className="text-amber-400" /> Command Hub
              </h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <QuickActionBtn 
                icon={FileText} 
                label="Quote Builder" 
                desc="Create Estimate"
                color="indigo" 
                onClick={() => navigate('/quotes/builder')} 
                delay={0}
              />
              <QuickActionBtn 
                icon={Clock} 
                label="Paint Diary" 
                desc="Log Daily Work"
                color="emerald" 
                onClick={() => navigate('/diary')} 
                delay={100}
              />
              <QuickActionBtn 
                icon={MapIcon} 
                label="Visual Map" 
                desc="Site Planning"
                color="blue" 
                onClick={() => navigate('/map-builder')} 
                delay={200}
              />
              <QuickActionBtn 
                icon={GitBranch} 
                label="Workflows" 
                desc="Manage Tasks"
                color="purple" 
                onClick={() => navigate('/workflows')} 
                delay={300}
              />
              <QuickActionBtn 
                icon={Box} 
                label="Resources" 
                desc="Staff & Stock"
                color="amber" 
                onClick={() => navigate('/resources')} 
                delay={400}
              />
              <QuickActionBtn 
                icon={DollarSign} 
                label="Invoicing" 
                desc="Bill Clients"
                color="rose" 
                onClick={() => navigate('/invoices')} 
                delay={500}
              />
            </div>
          </div>

          {/* INTEL STREAM (TABS) */}
          <div className="bg-stone-900/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl flex-1 min-h-[400px]">
            <div className="flex items-center gap-6 mb-6 border-b border-white/10 pb-4">
               <button 
                  onClick={() => setActiveTab('feed')}
                  className={`text-sm font-black uppercase tracking-wider transition-colors ${activeTab === 'feed' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
               >
                 Live Feed
               </button>
               <button 
                  onClick={() => setActiveTab('alerts')}
                  className={`text-sm font-black uppercase tracking-wider transition-colors ${activeTab === 'alerts' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
               >
                 Alerts {stats.resourceConflicts > 0 && <span className="ml-1 text-rose-500">•</span>}
               </button>
            </div>

            <div className="space-y-6 relative pl-4">
              {/* Timeline Stem */}
              <div className="absolute left-[19px] top-2 bottom-6 w-0.5 bg-gradient-to-b from-stone-700 to-transparent"></div>

              {activeTab === 'feed' ? (
                activityFeed.length > 0 ? activityFeed.map((item, idx) => (
                  <ActivityItem key={idx} item={item} />
                )) : (
                  <div className="text-center py-12 text-gray-500 text-sm">
                    <CheckCircle2 size={32} className="mx-auto mb-3 opacity-20" />
                    All quiet on the front.
                  </div>
                )
              ) : (
                stats.resourceConflicts > 0 ? (
                   <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl animate-pulse-slow">
                      <div className="flex gap-3">
                        <AlertTriangle className="text-rose-500" size={20} />
                        <div>
                          <h4 className="font-bold text-white text-sm">Conflict Detected</h4>
                          <p className="text-xs text-rose-300 mt-1">Multiple resources assigned to overlapping tasks today.</p>
                          <button onClick={() => navigate('/resources')} className="mt-3 text-[10px] font-bold bg-rose-500 text-white px-3 py-1.5 rounded-lg hover:bg-rose-400 transition-colors">Resolve Now</button>
                        </div>
                      </div>
                   </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 text-sm">
                    <CheckCircle2 size={32} className="mx-auto mb-3 opacity-20 text-emerald-500" />
                    System Healthy. No alerts.
                  </div>
                )
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default UltimatePulseDashboard;