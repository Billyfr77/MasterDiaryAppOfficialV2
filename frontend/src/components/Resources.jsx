import React from 'react';
import SummaryCard from './SummaryCard';

const Resources = ({ staff = [], equipment = [], materials = [] }) => {
  return (
    <SummaryCard title="Resources" accentColor="orange">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-200">Staff Members:</span>
          <span className="font-semibold text-blue-300">{staff.length}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-200">Equipment:</span>
          <span className="font-semibold text-green-300">{equipment.length}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-200">Materials:</span>
          <span className="font-semibold text-purple-300">{materials.length}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-200">Total Resources:</span>
          <span className="font-semibold text-orange-300">{staff.length + equipment.length + materials.length}</span>
        </div>
      </div>
    </SummaryCard>
  );
};

export default Resources;