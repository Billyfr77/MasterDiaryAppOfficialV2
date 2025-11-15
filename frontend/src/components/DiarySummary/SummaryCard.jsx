import React from 'react';

const SummaryCard = ({ title, accentColor, children }) => {
  const colorMap = {
    blue: 'border-blue-300 bg-blue-50',
    green: 'border-green-300 bg-green-50',
    purple: 'border-purple-300 bg-purple-50',
    orange: 'border-orange-300 bg-orange-50',
    pink: 'border-pink-300 bg-pink-50',
  };

  return (
    <div className={`backdrop-blur-lg bg-white/10 border ${colorMap[accentColor] || 'border-gray-300 bg-gray-50'} rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300`}>
      {title && (
        <div className="border-b border-gray-300 pb-2 mb-4">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
        </div>
      )}
      {children}
    </div>
  );
};

export default SummaryCard;