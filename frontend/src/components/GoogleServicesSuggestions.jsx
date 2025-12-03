import React from 'react';
import { X, Map, Calendar, Image, Truck, HardDrive, Eye } from 'lucide-react';

const ServiceCard = ({ icon: Icon, title, description, benefits }) => (
  <div className="bg-stone-800/50 border border-white/5 rounded-xl p-4 hover:bg-stone-800 transition-colors group">
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
        <Icon size={20} />
      </div>
      <h3 className="font-bold text-white text-sm">{title}</h3>
    </div>
    <p className="text-xs text-gray-400 mb-3 leading-relaxed">{description}</p>
    <div className="space-y-1">
      {benefits.map((b, i) => (
        <div key={i} className="flex items-center gap-2 text-[10px] text-gray-500">
          <div className="w-1 h-1 rounded-full bg-emerald-500" />
          {b}
        </div>
      ))}
    </div>
  </div>
);

const GoogleServicesSuggestions = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const services = [
    {
      icon: Map,
      title: "Google Places API",
      description: "Auto-complete addresses and find local suppliers near your job site.",
      benefits: ["Validates client addresses", "Finds nearest hardware stores", "Calculates local tax rates"]
    },
    {
      icon: Truck,
      title: "Google Routes API",
      description: "Calculate precise travel times and fuel costs for your crew.",
      benefits: ["Accurate travel charges", "Route optimization", "Traffic-aware scheduling"]
    },
    {
      icon: Image,
      title: "Street View Static API",
      description: "Add professional property photos to your quote cover pages automatically.",
      benefits: ["Instant visual context", "Professional presentation", "Remote site verification"]
    },
    {
      icon: Calendar,
      title: "Google Calendar API",
      description: "Sync project timelines directly to your staff's mobile calendars.",
      benefits: ["Automated scheduling", "Crew availability checks", "Client meeting invites"]
    },
    {
      icon: HardDrive,
      title: "Google Drive API",
      description: "Auto-save every generated PDF quote to a secure client folder.",
      benefits: ["Cloud backup", "Easy sharing", "Version history"]
    },
    {
      icon: Eye,
      title: "Google Vision API",
      description: "Analyze site photos to detect materials or damage automatically.",
      benefits: ["Automated inspections", "Material identification", "Safety hazard detection"]
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-stone-900 border border-white/10 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-indigo-900/20 to-purple-900/20 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">POWER-UP YOUR APP</h2>
            <p className="text-sm text-indigo-400 font-medium">Recommended Google Cloud Integrations</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service, i) => (
              <ServiceCard key={i} {...service} />
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-indigo-900/20 border border-indigo-500/20 rounded-xl">
            <h4 className="text-sm font-bold text-white mb-2">Why integrate these?</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              By connecting these services, your <strong>Master Diary App</strong> transforms from a simple tool into a 
              <strong> connected enterprise platform</strong>. You save time on data entry, improve quote accuracy with real-world travel data, 
              and impress clients with automated, professional visuals.
            </p>
          </div>
        </div>
        
        <div className="p-4 border-t border-white/10 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleServicesSuggestions;
