import React, { useState, useEffect } from 'react';
import { Clock, Calendar, ChevronRight, ChevronLeft, User, Wrench, Package } from 'lucide-react';

const DiaryGantt = ({ items }) => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Generate hours 6 AM to 6 PM
    const hours = Array.from({ length: 13 }, (_, i) => i + 6);

    const getPosition = (start, duration) => {
        const [h, m] = (start || "07:00").split(':').map(Number);
        const startHour = h + (m / 60);
        const offset = Math.max(0, startHour - 6); // Offset from 6 AM
        
        // Grid is 13 columns (12 hours). 100px per hour.
        const left = offset * 100;
        const width = (parseFloat(duration) || 1) * 100;
        
        return { left: `${left}px`, width: `${width}px` };
    };

    const getCurrentTimePosition = () => {
        const h = currentTime.getHours();
        const m = currentTime.getMinutes();
        const timeDecimal = h + (m / 60);
        const offset = Math.max(0, timeDecimal - 6);
        return offset * 100;
    };

    const getTypeIcon = (type) => {
        if (type === 'staff') return <User size={12} className="text-emerald-400" />;
        if (type === 'equipment') return <Wrench size={12} className="text-amber-400" />;
        return <Package size={12} className="text-indigo-400" />;
    };

    return (
        <div className="w-full h-full bg-[#0a0a0c] rounded-[2rem] overflow-hidden border border-white/10 flex flex-col shadow-2xl relative group">
            {/* Header */}
            <div className="flex bg-[#161b22] border-b border-white/5 sticky top-0 z-30 shadow-md">
                <div className="w-64 p-4 border-r border-white/5 font-black text-gray-400 uppercase text-[10px] tracking-widest flex items-center gap-2 bg-[#161b22]">
                    <Clock size={14} className="text-indigo-500" /> Resource Schedule
                </div>
                <div className="flex-1 overflow-hidden relative">
                    <div className="flex min-w-max">
                        {hours.map(h => (
                            <div key={h} className="w-[100px] p-4 text-[10px] font-mono font-bold text-gray-500 border-r border-white/5 text-center bg-[#161b22]">
                                {h}:00
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#0a0a0c]">
                {/* Immersive Background Visuals */}
                <div className="absolute inset-0 pointer-events-none opacity-20">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#4f46e508_0%,transparent_100%)]"></div>
                </div>

                {items.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-600">
                        <Calendar size={48} className="mb-4 opacity-20" />
                        <span className="text-xs font-bold uppercase tracking-widest opacity-50">No items scheduled</span>
                    </div>
                )}
                
                <div className="relative min-w-max">
                    {/* Background Grid */}
                    <div className="absolute inset-0 flex pointer-events-none h-full z-0">
                        <div className="w-64 border-r border-white/5 bg-[#0f1115]/50 h-full shrink-0" />
                        {hours.map(h => (
                            <div key={h} className="w-[100px] border-r border-white/5 h-full relative">
                                {/* Half-hour line */}
                                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/5 border-r border-dashed border-white/10 opacity-30"></div>
                            </div>
                        ))}
                    </div>

                    {/* Current Time Line */}
                    <div 
                        className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 shadow-[0_0_15px_rgba(239,68,68,0.6)]"
                        style={{ left: `${256 + getCurrentTimePosition()}px` }} 
                    >
                        <div className="absolute -top-3 -left-3 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-lg">NOW</div>
                        <div className="absolute -bottom-1 -left-1.5 w-3 h-3 bg-red-500 rounded-full" />
                    </div>

                    {items.map((item, idx) => (
                        <div key={item.id} className="flex relative z-10 hover:bg-white/[0.03] transition-colors group/row h-16 items-center border-b border-white/5">
                            <div className="w-64 p-4 border-r border-white/5 flex items-center gap-3 shrink-0 sticky left-0 bg-[#0a0a0c]/95 backdrop-blur-md z-20 group-hover/row:bg-[#1a1d24]/95 transition-colors shadow-lg">
                                <div className={`w-1.5 h-10 rounded-full shadow-[0_0_10px_currentColor] ${item.type === 'staff' ? 'bg-emerald-500 text-emerald-500' : item.type === 'equipment' ? 'bg-amber-500 text-amber-500' : 'bg-indigo-500 text-indigo-500'}`} />
                                <div className="overflow-hidden">
                                    <div className="font-bold text-white text-xs truncate flex items-center gap-2">
                                        {getTypeIcon(item.type)} {item.name}
                                    </div>
                                    <div className="text-[10px] text-gray-500 font-mono truncate pl-5">{item.note || 'No notes'}</div>
                                </div>
                            </div>
                            <div className="flex-1 relative h-full flex items-center">
                                {/* Bar */}
                                <div 
                                    className={`absolute h-9 rounded-xl shadow-lg flex items-center px-3 text-[10px] font-black text-white overflow-hidden transition-all hover:scale-[1.02] hover:shadow-2xl cursor-pointer ring-1 ring-white/20 hover:ring-white/40
                                        ${item.type === 'staff' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-900/20' : 
                                          item.type === 'equipment' ? 'bg-gradient-to-r from-amber-600 to-orange-600 shadow-amber-900/20' : 
                                          'bg-gradient-to-r from-indigo-600 to-violet-600 shadow-indigo-900/20'}
                                    `}
                                    style={getPosition(item.startTime, item.duration)}
                                    title={`${item.name}: ${item.startTime} - ${item.finishTime || '?'} (${item.quantity}hrs)`}
                                >
                                    <span className="drop-shadow-md truncate flex items-center gap-2 tracking-tight">
                                        <Clock size={10} className="opacity-70" /> {item.quantity}hrs
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DiaryGantt;
