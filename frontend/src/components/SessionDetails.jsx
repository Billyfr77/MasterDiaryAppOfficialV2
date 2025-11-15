import React from 'react';
import SummaryCard from './SummaryCard';

const SessionDetails = ({ diaryEntries = [], selectedDate = new Date() }) => {
  const totalEntries = diaryEntries.length;
  const totalPhotos = diaryEntries.reduce((sum, entry) => sum + (entry.photos?.length || 0), 0);
  const totalVoiceNotes = diaryEntries.reduce((sum, entry) => sum + (entry.voiceNotes?.length || 0), 0);
  const totalLocations = diaryEntries.reduce((sum, entry) => sum + (entry.location ? 1 : 0), 0);

  return (
    <SummaryCard title="Session Details" accentColor="blue">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-200">Date:</span>
          <span className="font-semibold text-white">{selectedDate.toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-200">Total Entries:</span>
          <span className="font-semibold text-blue-300">{totalEntries}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-200">Photos:</span>
          <span className="font-semibold text-green-300">{totalPhotos}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-200">Voice Notes:</span>
          <span className="font-semibold text-purple-300">{totalVoiceNotes}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-200">Locations:</span>
          <span className="font-semibold text-orange-300">{totalLocations}</span>
        </div>
      </div>
    </SummaryCard>
  );
};

export default SessionDetails;