import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle, MoreHorizontal, User, Calendar } from 'lucide-react';

export default function ListView({ nodes, onNodeClick }) {
  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <div className="opacity-50 text-4xl mb-2">📋</div>
        <p>No tasks found.</p>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle size={16} className="text-green-500" />;
      case 'in-progress': return <Clock size={16} className="text-blue-500" />;
      case 'error': return <AlertCircle size={16} className="text-red-500" />;
      default: return <div className="w-4 h-4 rounded-full border-2 border-slate-600" />;
    }
  };

  return (
    <div className="h-full w-full overflow-hidden bg-slate-950 p-6">
      <div className="w-full max-w-6xl mx-auto bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm">
        
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-900/80">
          <div className="col-span-5 pl-2">Task Name</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Assignee</div>
          <div className="col-span-2">Deadline</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-slate-800 overflow-y-auto max-h-[calc(100vh-250px)] custom-scrollbar">
          {nodes.map((node, index) => (
            <motion.div 
              key={node.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-800/50 transition-colors group cursor-pointer"
              onClick={(e) => onNodeClick(e, node)}
            >
              {/* Name */}
              <div className="col-span-5 flex items-center gap-3 pl-2">
                <div className={`p-2 rounded-lg bg-slate-800 border border-slate-700 ${node.type === 'milestone' ? 'text-yellow-500' : 'text-slate-400'}`}>
                   {/* Simple type indicator */}
                   {node.type === 'milestone' ? '★' : '●'}
                </div>
                <div>
                  <h4 className="font-medium text-slate-200 text-sm">{node.data.label}</h4>
                  <span className="text-[10px] text-slate-500 uppercase">{node.type}</span>
                </div>
              </div>

              {/* Status */}
              <div className="col-span-2 flex items-center gap-2">
                {getStatusIcon(node.data.status)}
                <span className="text-sm text-slate-300 capitalize">{node.data.status || 'Pending'}</span>
              </div>

              {/* Assignee */}
              <div className="col-span-2">
                {node.data.assignee ? (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                      {node.data.assignee.charAt(0)}
                    </div>
                    <span className="text-sm text-slate-300 truncate">{node.data.assignee}</span>
                  </div>
                ) : (
                  <span className="text-sm text-slate-600 italic">Unassigned</span>
                )}
              </div>

              {/* Deadline */}
              <div className="col-span-2 flex items-center gap-2 text-slate-400">
                <Calendar size={14} />
                <span className="text-sm">
                  {node.data.deadline ? new Date(node.data.deadline).toLocaleDateString() : '-'}
                </span>
              </div>

              {/* Action */}
              <div className="col-span-1 text-right">
                <button className="p-2 text-slate-500 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
