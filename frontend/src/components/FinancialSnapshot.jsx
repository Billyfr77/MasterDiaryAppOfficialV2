import React from 'react';
import SummaryCard from './SummaryCard';

const FinancialSnapshot = ({
  totalCost = 0,
  totalRevenue = 0,
  margin = 0,
  formatCurrency = (val) => `$${val.toFixed(2)}`
}) => {
  const profit = totalRevenue - totalCost;
  const profitMargin = totalCost > 0 ? (profit / totalRevenue) * 100 : 0;

  return (
    <SummaryCard title="Financial Snapshot" accentColor="green">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-200">Total Cost:</span>
          <span className="font-semibold text-red-300">{formatCurrency(totalCost)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-200">Total Revenue:</span>
          <span className="font-semibold text-green-300">{formatCurrency(totalRevenue)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-200">Profit:</span>
          <span className={`font-semibold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(profit)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-200">Margin:</span>
          <span className="font-semibold text-blue-300">{margin}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-200">Profit Margin:</span>
          <span className="font-semibold text-purple-300">{profitMargin.toFixed(1)}%</span>
        </div>
      </div>
    </SummaryCard>
  );
};

export default FinancialSnapshot;