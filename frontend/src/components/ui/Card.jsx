import React from 'react';

const Card = ({ children, className = '', hover = false, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-stone-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden
        ${hover ? 'hover:border-indigo-500/50 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group' : ''}
        ${className}
      `}
    >
      {/* Glassy Shine Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default Card;
