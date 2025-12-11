import React, { useState } from 'react';
import { 
  AlertTriangle, Shield, Check, Plus, Trash2, 
  HardHat, Glasses, Ear, HandMetal, Shirt, Footprints, AlertOctagon 
} from 'lucide-react';

// --- RISK MATRIX ---
export const RiskMatrix = ({ value, onChange, readOnly = false }) => {
  const likelihoods = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'];
  const consequences = ['Insignificant', 'Minor', 'Moderate', 'Major', 'Catastrophic'];
  
  // 1=Low, 2=Med, 3=High, 4=Extreme
  const matrix = [
    [1, 1, 2, 3, 3], // Rare
    [1, 1, 2, 3, 4], // Unlikely
    [1, 2, 3, 4, 4], // Possible
    [2, 3, 3, 4, 4], // Likely
    [3, 3, 4, 4, 4]  // Almost Certain
  ];

  const getColor = (score) => {
    switch(score) {
      case 1: return 'bg-emerald-500 hover:bg-emerald-400'; // Low
      case 2: return 'bg-yellow-500 hover:bg-yellow-400'; // Med
      case 3: return 'bg-orange-500 hover:bg-orange-400'; // High
      case 4: return 'bg-red-600 hover:bg-red-500'; // Extreme
      default: return 'bg-gray-200';
    }
  };

  const getLabel = (score) => {
    switch(score) {
      case 1: return 'LOW';
      case 2: return 'MEDIUM';
      case 3: return 'HIGH';
      case 4: return 'EXTREME';
      default: return '';
    }
  };

  return (
    <div className="space-y-2">
      <h4 className="font-bold text-sm text-gray-500 uppercase">Risk Assessment</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="p-1"></th>
              {consequences.map(c => <th key={c} className="p-1 font-normal text-gray-500 text-[10px]">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {likelihoods.map((l, lIdx) => (
              <tr key={l}>
                <td className="p-1 font-normal text-gray-500 text-[10px] whitespace-nowrap text-right pr-2">{l}</td>
                {consequences.map((c, cIdx) => {
                  const score = matrix[lIdx][cIdx];
                  const isSelected = value?.l === lIdx && value?.c === cIdx;
                  return (
                    <td key={c} className="p-0.5">
                      <button
                        disabled={readOnly}
                        onClick={() => onChange({ l: lIdx, c: cIdx, score, label: getLabel(score) })}
                        className={`w-full h-8 rounded transition-all flex items-center justify-center font-bold text-white ${getColor(score)} ${isSelected ? 'ring-4 ring-white dark:ring-stone-900 scale-110 shadow-lg z-10 relative' : 'opacity-40 hover:opacity-100'}`}
                      >
                        {isSelected && <Check size={14} strokeWidth={4} />}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {value && (
        <div className={`mt-2 p-2 rounded text-center text-white font-bold text-xs ${getColor(value.score)}`}>
          Selected Risk Level: {value.label}
        </div>
      )}
    </div>
  );
};

// --- PPE SELECTOR ---
export const PPEGrid = ({ value = {}, onChange }) => {
  const items = [
    { key: 'helmet', label: 'Helmet', icon: HardHat },
    { key: 'glasses', label: 'Glasses', icon: Glasses },
    { key: 'ears', label: 'Ear Protection', icon: Ear },
    { key: 'gloves', label: 'Gloves', icon: HandMetal },
    { key: 'vest', label: 'Hi-Vis Vest', icon: Shirt },
    { key: 'boots', label: 'Safety Boots', icon: Footprints },
    { key: 'mask', label: 'Respirator', icon: Shield }, // Fallback icon
    { key: 'harness', label: 'Harness', icon: AlertOctagon }, // Fallback icon
  ];

  const toggle = (key) => {
    onChange({ ...value, [key]: !value[key] });
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map(item => {
        const Active = value[item.key];
        const Icon = item.icon;
        return (
          <button 
            key={item.key}
            onClick={() => toggle(item.key)}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${Active ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500/50 dark:text-indigo-400' : 'bg-white dark:bg-stone-800 border-gray-200 dark:border-stone-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-stone-700'}`}
          >
            <Icon size={24} />
            <span className="text-xs font-bold">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

// --- SWMS STEPS EDITOR ---
export const SWMSEditor = ({ steps = [], onChange }) => {
  const addStep = () => {
    onChange([...steps, { id: Date.now(), activity: '', hazards: '', risk: null, controls: '', residualRisk: null }]);
  };

  const updateStep = (id, field, val) => {
    onChange(steps.map(s => s.id === id ? { ...s, [field]: val } : s));
  };

  const removeStep = (id) => {
    if(confirm('Remove this step?')) onChange(steps.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-4">
      {steps.map((step, idx) => (
        <div key={step.id} className="bg-gray-50 dark:bg-stone-800/50 border border-gray-200 dark:border-stone-700 rounded-xl p-4 relative group">
          <div className="absolute top-2 left-2 w-6 h-6 bg-gray-200 dark:bg-stone-700 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
            {idx + 1}
          </div>
          <button 
            onClick={() => removeStep(step.id)} 
            className="absolute top-2 right-2 p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-600 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={14} />
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
            {/* Column 1: Activity & Hazard */}
            <div className="lg:col-span-4 space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400">Job Step / Activity</label>
                <textarea 
                  value={step.activity} 
                  onChange={e => updateStep(step.id, 'activity', e.target.value)}
                  className="w-full mt-1 bg-white dark:bg-stone-900 border border-gray-200 dark:border-stone-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  rows={2}
                  placeholder="What are you doing?"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400">Hazards</label>
                <textarea 
                  value={step.hazards} 
                  onChange={e => updateStep(step.id, 'hazards', e.target.value)}
                  className="w-full mt-1 bg-white dark:bg-stone-900 border border-gray-200 dark:border-stone-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  rows={2}
                  placeholder="What could go wrong?"
                />
              </div>
            </div>

            {/* Column 2: Initial Risk */}
            <div className="lg:col-span-2">
               <RiskMatrix value={step.risk} onChange={val => updateStep(step.id, 'risk', val)} />
            </div>

            {/* Column 3: Controls */}
            <div className="lg:col-span-4">
                <label className="text-[10px] uppercase font-bold text-gray-400">Control Measures</label>
                <textarea 
                  value={step.controls} 
                  onChange={e => updateStep(step.id, 'controls', e.target.value)}
                  className="w-full mt-1 bg-white dark:bg-stone-900 border border-gray-200 dark:border-stone-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none h-[140px]"
                  placeholder="How will you work safely?"
                />
            </div>

            {/* Column 4: Residual Risk */}
            <div className="lg:col-span-2">
               <div className="opacity-75">
                 <h4 className="text-[10px] uppercase font-bold text-gray-400 mb-1">Residual Risk</h4>
                 <RiskMatrix value={step.residualRisk} onChange={val => updateStep(step.id, 'residualRisk', val)} />
               </div>
            </div>
          </div>
        </div>
      ))}

      <button 
        onClick={addStep}
        className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-stone-700 rounded-xl text-gray-500 hover:border-indigo-500 hover:text-indigo-500 flex items-center justify-center gap-2 font-bold transition-all"
      >
        <Plus size={18} /> Add Job Step
      </button>
    </div>
  );
};
