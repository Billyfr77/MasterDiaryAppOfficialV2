/*
 * MasterDiaryApp Official - Client Portal
 * A secure, read-only view for clients to track project progress.
 */

import React from 'react';
import { useParams } from 'react-router-dom';
import VisualMapBuilder from './VisualMapBuilder';
import { Shield, CheckCircle2 } from 'lucide-react';

const ClientPortal = () => {
  const { projectId } = useParams();

  return (
    <div className="h-screen w-screen bg-stone-950 flex flex-col overflow-hidden">
      
      {/* Portal Header */}
      <div className="h-16 border-b border-white/10 bg-stone-900/95 flex items-center justify-between px-8 z-50 shadow-2xl relative">
          <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                  <Shield size={20} className="text-emerald-400" />
              </div>
              <div>
                  <h1 className="text-white font-black text-lg tracking-tight leading-none">MASTER DIARY <span className="text-emerald-400">PORTAL</span></h1>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Secure Client Access</p>
              </div>
          </div>

          <div className="flex items-center gap-4">
              <div className="px-3 py-1.5 bg-emerald-900/20 border border-emerald-500/20 rounded-full flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Live Connection</span>
              </div>
          </div>
      </div>

      {/* Map Content */}
      <div className="flex-1 relative">
          <VisualMapBuilder readOnly={true} initialProjectId={projectId} />
      </div>

    </div>
  );
};

export default ClientPortal;
