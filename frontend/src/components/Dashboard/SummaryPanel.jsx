import React from 'react';
import { Folder, Users, Wrench, Package, Brain, DollarSign, Activity } from 'lucide-react';
import CountUp from 'react-countup';

const StatCard = ({ id, icon: Icon, gradient, iconColor, label, value, subtext, onClick, isCurrency }) => (
  <div 
    onClick={onClick}
    className={`
      relative overflow-hidden rounded-3xl p-1 cursor-pointer transition-all duration-300 group
      hover:scale-[1.03] hover:-translate-y-1 hover:shadow-2xl
      ${gradient} shadow-lg
    `}
  >
    {/* Glass Inner Container */}
    <div className="bg-black/10 backdrop-blur-sm h-full rounded-[20px] p-5 border border-white/10 flex flex-col justify-between relative z-10">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl bg-white/20 backdrop-blur-md shadow-inner border border-white/20 text-white`}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">{label}</p>
          <div className="h-1 w-8 bg-white/30 rounded-full ml-auto group-hover:w-12 transition-all duration-500" />
        </div>
      </div>

      {/* Value */}
      <div className="mt-2">
        <h3 className="text-3xl font-black text-white tracking-tight drop-shadow-md">
          {isCurrency && '$'}
          <CountUp end={value} separator="," duration={2.5} />
        </h3>
        <p className="mt-2 text-xs font-medium text-white/80 flex items-center gap-1.5">
          <Activity size={12} className="animate-pulse" />
          {subtext}
        </p>
      </div>
    </div>

    {/* Glossy Overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10 pointer-events-none" />
  </div>
);

const SummaryPanel = ({ metrics, setActiveTab }) => {
  const cards = [
    {
      id: 'projects',
      icon: Folder,
      gradient: 'bg-gradient-to-br from-blue-600 to-indigo-700 shadow-blue-900/20',
      label: 'Projects',
      value: metrics.totalProjects,
      subtext: `${metrics.activeProjects} active • ${metrics.overdueProjects} overdue`
    },
    {
      id: 'staff',
      icon: Users,
      gradient: 'bg-gradient-to-br from-emerald-500 to-teal-700 shadow-emerald-900/20',
      label: 'Staff',
      value: metrics.totalStaff,
      subtext: `${metrics.avgProductivity.toFixed(1)}% avg productivity`
    },
    {
      id: 'equipment',
      icon: Wrench,
      gradient: 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-900/20',
      label: 'Equipment',
      value: metrics.totalEquipment,
      subtext: `${metrics.maintenanceNeeded} need service`
    },
    {
      id: 'materials',
      icon: Package,
      gradient: 'bg-gradient-to-br from-violet-600 to-purple-700 shadow-violet-900/20',
      label: 'Materials',
      value: metrics.totalMaterials,
      subtext: `${metrics.lowStockItems} low stock`
    },
    {
      id: 'insights',
      icon: Brain,
      gradient: 'bg-gradient-to-br from-rose-500 to-pink-700 shadow-rose-900/20',
      label: 'AI Insights',
      value: metrics.aiInsights + metrics.aiAlerts + metrics.aiPredictions,
      subtext: `${metrics.aiAlerts} alerts detected`
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
      {cards.map((card) => (
        <StatCard 
          key={card.id}
          {...card}
          onClick={() => setActiveTab(card.id)}
        />
      ))}

      {/* Total Value Summary (Special Card) */}
      <div className="relative overflow-hidden rounded-3xl p-1 shadow-xl bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-600 shadow-amber-500/20 hover:scale-[1.03] transition-transform duration-300">
        <div className="bg-black/10 backdrop-blur-sm h-full rounded-[20px] p-5 border border-white/20 flex flex-col justify-between relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md shadow-inner border border-white/30 text-white">
              <DollarSign size={24} strokeWidth={3} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Total Value</p>
          </div>
          <div>
            <h3 className="text-3xl font-black text-white tracking-tight drop-shadow-md truncate">
              $<CountUp end={metrics.totalValue || 0} separator="," duration={3} />
            </h3>
            <p className="mt-2 text-xs font-bold text-white/80">
              Estimated Asset Value
            </p>
          </div>
        </div>
        {/* Shimmer Effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-transparent opacity-50 pointer-events-none" />
      </div>
    </div>
  );
};

export default SummaryPanel;
