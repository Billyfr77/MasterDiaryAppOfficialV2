import React from 'react';
import SummaryCard from './SummaryCard';
import { Sun, Moon, Download, FileSpreadsheet } from 'lucide-react';

const Tools = ({
  theme = 'dark',
  onThemeToggle = () => {},
  onExport = () => {},
  onExportCSV = () => {}
}) => {
  return (
    <SummaryCard title="Tools" accentColor="pink">
      <div className="space-y-3">
        <button
          onClick={onThemeToggle}
          className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors duration-200"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          Toggle Theme
        </button>
        <button
          onClick={onExport}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 px-4 rounded-lg transition-colors duration-200"
        >
          <Download size={18} />
          Export JSON
        </button>
        <button
          onClick={onExportCSV}
          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white py-3 px-4 rounded-lg transition-colors duration-200"
        >
          <FileSpreadsheet size={18} />
          Export CSV
        </button>
      </div>
    </SummaryCard>
  );
};

export default Tools;