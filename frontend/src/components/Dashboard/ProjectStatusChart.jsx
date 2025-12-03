import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const ProjectStatusChart = ({ data }) => {
  const chartData = [
    { name: 'Active', value: data.activeProjects || 0, color: '#6366f1' }, // Indigo
    { name: 'Completed', value: data.completedProjects || 0, color: '#10b981' }, // Emerald
    { name: 'Overdue', value: data.overdueProjects || 0, color: '#ef4444' }, // Rose
  ];

  // Filter out zero values to avoid ugly empty charts or label collisions
  const activeData = chartData.filter(d => d.value > 0);

  if (activeData.length === 0) {
    return (
      <div className="h-64 w-full flex items-center justify-center text-gray-500 text-sm italic">
        No project data available to display.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={activeData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {activeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(23, 23, 23, 0.9)', 
              borderRadius: '12px', 
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
            }}
            itemStyle={{ color: '#e2e8f0' }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            formatter={(value) => <span className="text-gray-300 font-bold text-xs ml-1">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProjectStatusChart;
