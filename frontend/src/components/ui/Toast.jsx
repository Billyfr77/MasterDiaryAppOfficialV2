import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

const Toast = ({ id, type = 'info', message, duration = 5000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const styles = {
    success: 'bg-emerald-500/10 border-emerald-500/50 text-emerald-200',
    error: 'bg-red-500/10 border-red-500/50 text-red-200',
    warning: 'bg-amber-500/10 border-amber-500/50 text-amber-200',
    info: 'bg-blue-500/10 border-blue-500/50 text-blue-200',
  };

  const icons = {
    success: <CheckCircle size={20} className="text-emerald-400" />,
    error: <AlertCircle size={20} className="text-red-400" />,
    warning: <AlertTriangle size={20} className="text-amber-400" />,
    info: <Info size={20} className="text-blue-400" />,
  };

  return (
    <div className={`
      flex items-center gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl 
      animate-slide-left min-w-[300px] max-w-md pointer-events-auto
      ${styles[type]}
    `}>
      <div className="flex-shrink-0">{icons[type]}</div>
      <div className="flex-1 text-sm font-medium">{message}</div>
      <button 
        onClick={() => onClose(id)}
        className="p-1 hover:bg-white/10 rounded-full transition-colors opacity-70 hover:opacity-100"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
