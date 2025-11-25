import React from 'react';
import {
  Activity,
  Folder,
  Users,
  Wrench,
  Package,
  Brain,
  TrendingUp,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

const Tabs = ({ activeTab, setActiveTab, metrics }) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'gemini', label: 'Gemini AI', icon: Sparkles },
    { id: 'projects', label: 'Projects', icon: Folder },
    { id: 'staff', label: 'Staff', icon: Users },
    { id: 'equipment', label: 'Equipment', icon: Wrench },
    { id: 'materials', label: 'Materials', icon: Package },
    { id: 'insights', label: 'AI Insights', icon: Brain },
    { id: 'predictions', label: 'Predictions', icon: TrendingUp },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
  ];

  return (
    <div className="flex gap-2 mb-8 border-b border-white/10 overflow-x-auto pb-4 scrollbar-hide px-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const tabMetrics =
          tab.id === 'alerts'
            ? metrics.aiAlerts
            : tab.id === 'insights'
            ? metrics.aiInsights
            : tab.id === 'predictions'
            ? metrics.aiPredictions
            : 0;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all duration-300 relative whitespace-nowrap border
              ${isActive 
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] scale-105 z-10' 
                : 'bg-black/20 border-white/5 text-gray-400 hover:bg-black/40 hover:text-white hover:border-white/10'}
            `}
            aria-label={`Switch to ${tab.label} tab`}
          >
            <Icon size={16} strokeWidth={2.5} />
            <span className="text-sm">{tab.label}</span>
            {tabMetrics > 0 && (
              <span
                className={`
                  ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-black text-white shadow-sm
                  ${tab.id === 'alerts' ? 'bg-rose-500 shadow-rose-500/50' : 'bg-indigo-400 shadow-indigo-400/50'}
                `}
              >
                {tabMetrics}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
