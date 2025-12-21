/*
 * MasterDiaryApp Official - Construction SaaS Platform
 * App.jsx - Stable Version
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 */

import React, { useState, useEffect, useRef } from 'react'
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Home, Folder, Users, Calendar, Settings as SettingsIcon, Wrench, FileText, LogOut, Package, DollarSign, Moon, Sun, Command, GitBranch, Briefcase, CreditCard, Activity, PenTool, Menu, X } from 'lucide-react'
import { NotificationProvider } from './context/NotificationContext'
import { SettingsProvider } from './context/SettingsContext'
import { UIProvider } from './context/UIContext'
import { DataProvider } from './context/DataContext'
import ErrorBoundary from './components/ErrorBoundary'
import CommandPalette from './components/CommandPalette'
import Login from './components/Login'
import Landing from './components/Landing'
import UltimatePulseDashboard from './components/Dashboard/UltimatePulseDashboard'
import EnhancedStaff from './components/EnhancedStaff'
import EnhancedEquipment from './components/EnhancedEquipment'
import EnhancedNodes from './components/EnhancedNodes'
import EnhancedProjects from './components/EnhancedProjects'
import PinnacleIntelligentReports from './components/PinnacleIntelligentReports';
import DocumentForm from './components/DocumentForm';
import ClientPortal from './components/ClientPortal';
import EnhancedSettings from './components/EnhancedSettings'
import Clients from './components/Clients/Clients'
import PaintDiary from './components/PaintDiary'
import ResourceCommand from './components/ResourceCommand'
import Quotes from './components/Quotes'
import NodesLibrary from './components/NodesLibrary'
import QuoteBuilder from './components/QuoteBuilder'
import VisualMapBuilder from './components/VisualMapBuilder'
import WorkflowBuilder from './components/WorkflowBuilder/WorkflowBuilder'
import InvoiceBuilder from './components/InvoiceBuilder'
import XeroCallback from './components/XeroCallback'
import PinnacleCopilot from './components/PinnacleCopilot'
import SafetyDashboard from './components/Safety/SafetyDashboard'
import SafetyFormViewer from './components/Safety/SafetyFormViewer'
import SubscriptionPage from './components/SubscriptionPage'
import { ClipboardCheck, Layout, Crown } from 'lucide-react'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [darkMode, setDarkMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle graceful logout without reload
  useEffect(() => {
    const handleLogout = () => setToken('');
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  // --- NAV SCROLL REFS ---
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
          // Prevent vertical scroll page-wide when scrolling this container
          e.preventDefault();
          el.scrollLeft += e.deltaY;
      };

      el.addEventListener('wheel', handleWheel, { passive: false });
      return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  const handleNavScroll = (e) => {
    const { scrollWidth, clientWidth, scrollLeft } = e.target;
    // Calculate thumb width percentage
    const widthPct = (clientWidth / scrollWidth) * 100;
    setScrollThumbWidth(widthPct < 100 ? widthPct : 0);
    
    // Calculate thumb position percentage
    // Max scroll left is scrollWidth - clientWidth
    const maxScrollLeft = scrollWidth - clientWidth;
    const scrollRatio = scrollLeft / maxScrollLeft;
    // Max thumb left is 100% - thumbWidth%
    const maxThumbLeft = 100 - widthPct;
    setScrollThumbLeft(scrollRatio * maxThumbLeft);
  };

  // Thumb Drag Handlers
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
          const scrollRatio = scrollWidth / clientWidth; // Approximation
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


  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const location = useLocation();
  const isPortal = location.pathname.startsWith('/portal');
  const isLanding = location.pathname === '/';

  if (!token && !isPortal) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <ErrorBoundary>
      <UIProvider>
        <NotificationProvider>
          <SettingsProvider>
            <DataProvider>
              <DndProvider backend={HTML5Backend}>
                <div className={`min-h-screen flex flex-col text-gray-900 dark:text-gray-100 font-sans transition-all duration-500 ${isLanding ? 'bg-transparent' : 'bg-[#0a0a0c]'}`}>
          <style>{`
            .custom-scrollbar-x::-webkit-scrollbar { height: 0px; }
            .custom-scrollbar-x { scrollbar-width: none; }
            
            @keyframes pulse-glow {
              0%, 100% { opacity: 0.3; transform: scale(1); }
              50% { opacity: 0.6; transform: scale(1.1); }
            }
          `}</style>
          
          {/* --- PREMIUM APP BACKGROUND --- */}
          {!isPortal && !isLanding && (
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
               {/* 1. Base Gradient & Noise */}
               <div className="absolute inset-0 bg-gradient-to-br from-[#0f1115] via-[#050505] to-[#0a0a0c]"></div>
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
               
               {/* 2. Cyber Grid (50px) */}
               <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:50px_50px] opacity-[0.03]"></div>
               
               {/* 3. High-Contrast Multi-Color Glows */}
               <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[radial-gradient(circle,rgba(99,102,241,0.15)_0%,transparent_70%)] blur-[100px] animate-[pulse-glow_8s_ease-in-out_infinite]" /> {/* Indigo */}
               <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[radial-gradient(circle,rgba(139,92,246,0.15)_0%,transparent_70%)] blur-[100px] animate-[pulse-glow_10s_ease-in-out_infinite_reverse]" /> {/* Violet */}
               <div className="absolute top-[30%] left-[40%] w-[50%] h-[50%] bg-[radial-gradient(circle,rgba(16,185,129,0.12)_0%,transparent_70%)] blur-[120px] animate-[pulse-glow_12s_ease-in-out_infinite]" /> {/* Emerald */}

               {/* 4. Deep Vignette */}
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.4)_100%)]"></div>
            </div>
          )}
          {/* Dark Overlay for readability removed in favor of premium background */}

          {/* Shell Components */}
          {!isPortal && <CommandPalette />}
          
          {/* Mobile Menu Overlay */}
          {mobileMenuOpen && !isPortal && (
            <div className="fixed inset-0 z-[100] flex md:hidden">
               {/* Backdrop */}
               <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setMobileMenuOpen(false)} />
               
               {/* Drawer */}
               <div className="relative w-72 h-full bg-stone-900 border-r border-white/10 shadow-2xl p-4 flex flex-col gap-4 animate-slide-right overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                          <Home className="text-white w-5 h-5" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-white">MasterDiary<span className="text-indigo-400">OS</span></span>
                    </div>
                    <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-full">
                      <X size={20} />
                    </button>
                  </div>
                  
                  <nav className="flex flex-col gap-2">
                    <div className="text-xs font-bold text-gray-500 uppercase px-2 mb-1 mt-2">Core</div>
                    <NavLink to="/pulse" icon={<Activity size={18} />} label="Pulse Dashboard" onClick={() => setMobileMenuOpen(false)} />
                    <NavLink to="/projects" icon={<Briefcase size={18} />} label="Projects" onClick={() => setMobileMenuOpen(false)} />
                    <NavLink to="/diary" icon={<PenTool size={18} />} label="Site Diary" onClick={() => setMobileMenuOpen(false)} />
                    
                    <div className="text-xs font-bold text-gray-500 uppercase px-2 mb-1 mt-4">Finance</div>
                    <NavLink to="/quotes" icon={<DollarSign size={18} />} label="Quotes & Estimates" onClick={() => setMobileMenuOpen(false)} />
                    <NavLink to="/invoices" icon={<CreditCard size={18} />} label="Invoices" onClick={() => setMobileMenuOpen(false)} />
                    <NavLink to="/subscription" icon={<Crown size={18} />} label="Upgrade Plan" onClick={() => setMobileMenuOpen(false)} />
                    
                    <div className="text-xs font-bold text-gray-500 uppercase px-2 mb-1 mt-4">Operations</div>
                    <NavLink to="/resources" icon={<Calendar size={18} />} label="Resource Scheduler" onClick={() => setMobileMenuOpen(false)} />
                    <NavLink to="/map-builder" icon={<Command size={18} />} label="Map Builder" onClick={() => setMobileMenuOpen(false)} />
                    <NavLink to="/workflows" icon={<GitBranch size={18} />} label="Workflows" onClick={() => setMobileMenuOpen(false)} />
                    <NavLink to="/safety" icon={<ClipboardCheck size={18} />} label="Safety & Compliance" onClick={() => setMobileMenuOpen(false)} />
                    
                    <div className="text-xs font-bold text-gray-500 uppercase px-2 mb-1 mt-4">Management</div>
                    <NavLink to="/clients" icon={<Users size={18} />} label="Clients CRM" onClick={() => setMobileMenuOpen(false)} />
                    <NavLink to="/staff" icon={<Users size={18} />} label="Staff & HR" onClick={() => setMobileMenuOpen(false)} />
                    <NavLink to="/equipment" icon={<Wrench size={18} />} label="Equipment Fleet" onClick={() => setMobileMenuOpen(false)} />
                    <NavLink to="/nodes" icon={<Package size={18} />} label="Materials Library" onClick={() => setMobileMenuOpen(false)} />
                    <NavLink to="/reports" icon={<FileText size={18} />} label="Reports" onClick={() => setMobileMenuOpen(false)} />
                  </nav>
               </div>
            </div>
          )}

          {/* Header */}
          {!isPortal && !isLanding && (
            <header className="sticky top-0 z-50 glass-panel border-b-0 rounded-none shadow-lg transition-all duration-300">
              <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4 md:gap-8 flex-1 min-w-0">
                  {/* Hamburger for Mobile */}
                  <button 
                    onClick={() => setMobileMenuOpen(true)} 
                    className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Menu size={24} />
                  </button>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                      <Home className="text-white w-5 h-5" />
                    </div>
                    <span className="font-bold text-xl tracking-tight hidden md:block">MasterDiary<span className="text-indigo-400">OS</span></span>
                  </div>
                  
                  {/* SCROLLABLE NAV CONTAINER */}
                  <div className="hidden md:flex flex-col flex-1 min-w-0 relative group/nav h-full justify-center">
                      <nav 
                        ref={navRef}
                        className="flex items-center gap-1 overflow-x-auto custom-scrollbar-x h-full items-center"
                        onScroll={handleNavScroll}
                      >
                        <NavLink to="/pulse" icon={<Activity size={16} />} label="Pulse" />
                        <NavLink to="/projects" icon={<Briefcase size={16} />} label="Projects" />
                        <NavLink to="/diary" icon={<PenTool size={16} />} label="Diary" />
                        <NavLink to="/resources" icon={<Calendar size={16} />} label="Resources" />
                        <NavLink to="/quotes" icon={<DollarSign size={16} />} label="Quotes" />
                        <NavLink to="/invoices" icon={<CreditCard size={16} />} label="Invoices" />
                        <NavLink to="/clients" icon={<Users size={16} />} label="Clients" />
                        <NavLink to="/map-builder" icon={<Command size={16} />} label="Map" />
                        <NavLink to="/nodes" icon={<Package size={16} />} label="Materials" />
                        <NavLink to="/staff" icon={<Users size={16} />} label="Staff" />
                        <NavLink to="/equipment" icon={<Wrench size={16} />} label="Equipment" />
                        <NavLink to="/workflows" icon={<GitBranch size={16} />} label="Flows" />
                        <NavLink to="/safety" icon={<ClipboardCheck size={16} />} label="Safety" />
                        <NavLink to="/reports" icon={<FileText size={16} />} label="Reports" />
                        <NavLink to="/subscription" icon={<Crown size={16} />} label="Upgrade" />
                      </nav>

                      {/* Custom Scrollbar Handle */}
                      {scrollThumbWidth > 0 && scrollThumbWidth < 100 && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 rounded-full opacity-0 group-hover/nav:opacity-100 transition-opacity duration-200">
                              <div 
                                  className="absolute top-0 bottom-0 bg-indigo-500 rounded-full cursor-grab active:cursor-grabbing hover:bg-indigo-400"
                                  style={{ left: `${scrollThumbLeft}%`, width: `${scrollThumbWidth}%` }}
                                  onMouseDown={handleThumbMouseDown}
                              />
                          </div>
                      )}
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                   <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                      {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                   </button>
                   <Link to="/settings" className="p-2 rounded-full hover:bg-white/10 transition-colors">
                      <SettingsIcon size={20} />
                   </Link>
                   <button onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }} className="p-2 rounded-full hover:bg-red-500/10 text-red-400 transition-colors">
                      <LogOut size={20} />
                   </button>
                </div>
              </div>
            </header>
          )}

          {/* Main Content */}
          <main className={`flex-1 ${(!isPortal && !isLanding) ? 'container mx-auto px-4 py-8' : ''} animate-fade-in`}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="/pulse" element={<UltimatePulseDashboard />} />
              <Route path="/dashboard" element={<UltimatePulseDashboard />} />
              <Route path="/projects" element={<EnhancedProjects />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/staff" element={<EnhancedStaff />} />
              <Route path="/diary" element={<PaintDiary />} />
              <Route path="/settings" element={<EnhancedSettings />} />
              <Route path="/equipment" element={<EnhancedEquipment />} />
              <Route path="/resources" element={<ResourceCommand />} />
              <Route path="/nodes" element={<EnhancedNodes />} />
              <Route path="/quotes" element={<Quotes />} />
              <Route path="/quotes/library" element={<NodesLibrary />} />
              <Route path="/quotes/builder" element={<QuoteBuilder />} />
              <Route path="/quotes/builder/:id" element={<QuoteBuilder />} />
              <Route path="/map-builder" element={<VisualMapBuilder />} />
              <Route path="/workflows" element={<WorkflowBuilder />} />
              <Route path="/reports" element={<PinnacleIntelligentReports />} />
              <Route path="/reports/new" element={<DocumentForm />} />
              <Route path="/reports/edit/:id" element={<DocumentForm />} />
              <Route path="/invoices" element={<InvoiceBuilder />} />
              <Route path="/safety" element={<SafetyDashboard />} />
              <Route path="/safety/:id" element={<SafetyFormViewer />} />
              <Route path="/xero/callback" element={<XeroCallback />} />
              <Route path="/subscription" element={<SubscriptionPage />} />
              <Route path="/portal/view/:projectId" element={<ClientPortal />} />
            </Routes>
          </main>

          {!isPortal && <PinnacleCopilot />}
        </div>
                            </DndProvider>
                          </DataProvider>
                        </SettingsProvider>
                      </NotificationProvider>
                    </UIProvider>
                  </ErrorBoundary>
                )      }
// Helper Component for Nav Links
const NavLink = ({ to, icon, label, onClick }) => {
  const location = useLocation()
  // Active if exact match OR if it's a sub-route (e.g. /quotes/builder is active for /quotes), excluding root /
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to))

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
      <span className={`transition-transform duration-300 ${isActive ? 'scale-110 text-indigo-400' : 'group-hover:scale-110 group-hover:text-indigo-400'}`}>{icon}</span>
      <span>{label}</span>
    </Link>
  )
}

export default App