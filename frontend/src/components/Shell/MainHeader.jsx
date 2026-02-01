import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Menu, Sun, Moon, Settings as SettingsIcon, LogOut, Globe, Briefcase, PenTool, Calendar, DollarSign, CreditCard, Users, Package, Command, GitBranch, ClipboardCheck, Shield, FileText, Crown, Wrench, Zap } from 'lucide-react';
import NotificationDropdown from '../NotificationDropdown';
import { useDiaryTheme } from '../PaintDiary/ThemeContext';

export const NavLink = ({ to, icon, label, onClick, activeColor }) => {
    const location = useLocation();
    const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

    return (
        <Link
            to={to}
            title={label}
            onClick={onClick}
            className={`
                flex flex-row items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 group text-xs font-bold whitespace-nowrap
                ${isActive 
                    ? 'bg-white/10 text-white shadow-lg border border-white/10' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'}
            `}
        >
            <span 
                className="transition-transform duration-300"
                style={{ color: isActive ? activeColor : undefined }}
            >
                {icon}
            </span>
            <span>{label}</span>
        </Link>
    );
};

const MainHeader = ({ darkMode, setDarkMode, setMobileMenuOpen }) => {
    const { theme, liteMode, toggleLiteMode } = useDiaryTheme();
    const navRef = useRef(null);

    // --- CUSTOM SCROLLBAR STATE ---
    const [scrollThumbWidth, setScrollThumbWidth] = useState(0);
    const [scrollThumbLeft, setScrollThumbLeft] = useState(0);
    const [isThumbDragging, setIsThumbDragging] = useState(false);
    const [thumbStartX, setThumbStartX] = useState(0);
    const [thumbStartScroll, setThumbStartScroll] = useState(0);

    // --- HORIZONTAL SCROLL HANDLER (NON-PASSIVE) ---
    useEffect(() => {
        const el = navRef.current;
        if (!el) return;

        const handleWheel = (e) => {
            if (e.deltaY === 0) return;
            e.preventDefault();
            el.scrollLeft += e.deltaY;
        };

        el.addEventListener('wheel', handleWheel, { passive: false });
        return () => el.removeEventListener('wheel', handleWheel);
    }, []);

    const handleNavScroll = (e) => {
        const { scrollWidth, clientWidth, scrollLeft } = e.target;
        const widthPct = (clientWidth / scrollWidth) * 100;
        setScrollThumbWidth(widthPct < 100 ? widthPct : 0);
        
        const maxScrollLeft = scrollWidth - clientWidth;
        const scrollRatio = scrollLeft / maxScrollLeft;
        const maxThumbLeft = 100 - widthPct;
        setScrollThumbLeft(scrollRatio * maxThumbLeft);
    };

    const handleThumbMouseDown = (e) => {
        e.stopPropagation();
        e.preventDefault();
        setIsThumbDragging(true);
        setThumbStartX(e.pageX);
        setThumbStartScroll(navRef.current.scrollLeft);
    };

    useEffect(() => {
        const handleGlobalMove = (e) => {
            if (!isThumbDragging || !navRef.current) return;
            e.preventDefault();
            const { scrollWidth, clientWidth } = navRef.current;
            const deltaX = e.pageX - thumbStartX;
            const scrollRatio = scrollWidth / clientWidth; 
            navRef.current.scrollLeft = thumbStartScroll + (deltaX * scrollRatio);
        };
        
        const handleGlobalUp = () => setIsThumbDragging(false);

        if (isThumbDragging) {
            window.addEventListener('mousemove', handleGlobalMove);
            window.addEventListener('mouseup', handleGlobalUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleGlobalMove);
            window.removeEventListener('mouseup', handleGlobalUp);
        };
    }, [isThumbDragging, thumbStartX, thumbStartScroll]);

    return (
        <header className="sticky top-0 z-[100] glass-panel border-b-0 rounded-none shadow-lg transition-all duration-300">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4 md:gap-8 flex-1 min-w-0">
                    <button 
                        onClick={() => setMobileMenuOpen(true)} 
                        className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme.accent }}>
                            <Home className="text-white w-5 h-5" />
                        </div>
                        <span className="font-bold text-xl tracking-tight hidden md:block text-white">
                            MasterDiary<span style={{ color: theme.accent }}>OS</span>
                        </span>
                    </div>
                    
                    <div className="hidden md:flex flex-col flex-1 min-w-0 relative group/nav h-full justify-center">
                        <nav 
                            ref={navRef} 
                            className="flex items-center gap-1 overflow-x-auto custom-scrollbar-x h-full items-center" 
                            onScroll={handleNavScroll}
                        >
                            <NavLink to="/hq" icon={<Globe size={16} />} label="Neural HQ" activeColor={theme.accent} />
                            <NavLink to="/projects" icon={<Briefcase size={16} />} label="Projects" activeColor={theme.accent} />
                            <NavLink to="/diary" icon={<PenTool size={16} />} label="Diary" activeColor={theme.accent} />
                            <NavLink to="/resources" icon={<Calendar size={16} />} label="Resources" activeColor={theme.accent} />
                            <NavLink to="/quotes" icon={<DollarSign size={16} />} label="Quotes" activeColor={theme.accent} />
                            <NavLink to="/invoices" icon={<CreditCard size={16} />} label="Invoices" activeColor={theme.accent} />
                            <NavLink to="/clients" icon={<Users size={16} />} label="Clients" activeColor={theme.accent} />
                            <NavLink to="/map-builder" icon={<Command size={16} />} label="Map" activeColor={theme.accent} />
                            <NavLink to="/nodes" icon={<Package size={16} />} label="Materials" activeColor={theme.accent} />
                            <NavLink to="/staff" icon={<Users size={16} />} label="Staff" activeColor={theme.accent} />
                            <NavLink to="/equipment" icon={<Wrench size={16} />} label="Equipment" activeColor={theme.accent} />
                            <NavLink to="/workflows" icon={<GitBranch size={16} />} label="Flows" activeColor={theme.accent} />
                            <NavLink to="/safety" icon={<ClipboardCheck size={16} />} label="Safety" activeColor={theme.accent} />
                            <NavLink to="/audit" icon={<Shield size={16} />} label="Audit" activeColor={theme.accent} />
                            <NavLink to="/reports" icon={<FileText size={16} />} label="Reports" activeColor={theme.accent} />
                            <NavLink to="/subscription" icon={<Crown size={16} />} label="Upgrade" activeColor={theme.accent} />
                        </nav>

                        {scrollThumbWidth > 0 && scrollThumbWidth < 100 && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 rounded-full opacity-0 group-hover/nav:opacity-100 transition-opacity duration-200">
                                <div 
                                    className="absolute top-0 bottom-0 rounded-full cursor-grab active:cursor-grabbing"
                                    style={{ left: `${scrollThumbLeft}%`, width: `${scrollThumbWidth}%`, backgroundColor: theme.accent }}
                                    onMouseDown={handleThumbMouseDown}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                    <NotificationDropdown />
                    <button 
                        onClick={toggleLiteMode} 
                        className={`p-2 rounded-full transition-all duration-300 ${liteMode ? 'bg-amber-500/20 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'hover:bg-white/10 text-gray-400'}`}
                        title={liteMode ? "Lite Mode Active (High Performance)" : "Enable Lite Mode"}
                    >
                        <Zap size={20} fill={liteMode ? "currentColor" : "none"} />
                    </button>
                    <button 
                        onClick={() => setDarkMode(!darkMode)} 
                        className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400"
                    >
                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <Link 
                        to="/settings" 
                        className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400"
                    >
                        <SettingsIcon size={20} />
                    </Link>
                    <button 
                        onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }} 
                        className="p-2 rounded-full hover:bg-red-500/10 text-red-400 transition-colors"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default MainHeader;
