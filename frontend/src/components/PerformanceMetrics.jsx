import React from 'react';
import SummaryCard from './SummaryCard';

const PerformanceMetrics = ({ productivityScore = 0, diaryEntries = [] }) => {
  const totalHours = diaryEntries.reduce((sum, entry) =>
    sum + entry.items.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0), 0
  );
  const totalItems = diaryEntries.reduce((sum, entry) => sum + entry.items.length, 0);
  const avgItemsPerEntry = diaryEntries.length > 0 ? (totalItems / diaryEntries.length).toFixed(1) : 0;

  return (
    <SummaryCard title="Performance Metrics" accentColor="purple">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-200">Productivity Score:</span>
          <span className="font-semibold text-purple-300">{productivityScore}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-200">Total Hours:</span>
          <span className="font-semibold text-blue-300">{totalHours.toFixed(1)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-200">Total Items:</span>
          <span className="font-semibold text-green-300">{totalItems}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-200">Avg Items/Entry:</span>
          <span className="font-semibold text-orange-300">{avgItemsPerEntry}</span>
        </div>
      </div>
    </SummaryCard>
  );
};

export default PerformanceMetrics;