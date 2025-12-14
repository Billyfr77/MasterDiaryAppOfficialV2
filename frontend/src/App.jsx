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
import JobBoard from './components/JobBoard'
import XeroCallback from './components/XeroCallback'
import PinnacleCopilot from './components/PinnacleCopilot'
import SafetyDashboard from './components/Safety/SafetyDashboard'
import SafetyFormViewer from './components/Safety/SafetyFormViewer'
import { ClipboardCheck, Layout } from 'lucide-react'

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

  // --- DRAG TO SCROLL NAV ---
  const navRef = useRef(null);
  const [isNavDragging, setIsNavDragging] = useState(false);
  const [navStartX, setNavStartX] = useState(0);
  const [navScrollLeft, setNavScrollLeft] = useState(0);

  // --- CUSTOM SCROLLBAR STATE ---
  const [scrollThumbWidth, setScrollThumbWidth] = useState(0);
  const [scrollThumbLeft, setScrollThumbLeft] = useState(0);
  const [isThumbDragging, setIsThumbDragging] = useState(false);
  const [thumbStartX, setThumbStartX] = useState(0);
  const [thumbStartScroll, setThumbStartScroll] = useState(0);

  // Update Scrollbar on Mount/Resize
  useEffect(() => {
    const updateScrollbar = () => {
        if (navRef.current) {
            const { clientWidth, scrollWidth, scrollLeft } = navRef.current;
            const widthPercentage = (clientWidth / scrollWidth) * 100;
            const leftPercentage = (scrollLeft / scrollWidth) * 100;
            setScrollThumbWidth(widthPercentage < 100 ? widthPercentage : 0);
            setScrollThumbLeft(leftPercentage);
        }
    };
    updateScrollbar();
    window.addEventListener('resize', updateScrollbar);
    return () => window.removeEventListener('resize', updateScrollbar);
  }, []);

  const handleNavScroll = (e) => {
    const { scrollWidth, scrollLeft } = e.target;
    setScrollThumbLeft((scrollLeft / scrollWidth) * 100);
  };

  const handleNavMouseDown = (e) => {
    setIsNavDragging(true);
    setNavStartX(e.pageX - navRef.current.offsetLeft);
    setNavScrollLeft(navRef.current.scrollLeft);
  };

  const handleNavMouseMove = (e) => {
    if (!isNavDragging) return;
    e.preventDefault();
    const x = e.pageX - navRef.current.offsetLeft;
    const walk = (x - navStartX) * 2; 
    navRef.current.scrollLeft = navScrollLeft - walk;
  };

  const handleNavMouseUp = () => setIsNavDragging(false);
  const handleNavMouseLeave = () => setIsNavDragging(false);

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

  const isPortal = window.location.pathname.startsWith('/portal');

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
                <div className="min-h-screen flex flex-col text-gray-900 dark:text-gray-100 font-sans bg-fixed bg-cover bg-center transition-all duration-500"
             style={{
               backgroundImage: darkMode 
                 ? 'url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop")' 
                 : 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)'
             }}
        >
          <style>{`
            .custom-scrollbar-x::-webkit-scrollbar {
              height: 0px; /* Hide default scrollbar since we have custom one */
            }
            .custom-scrollbar-x {
              scrollbar-width: none; /* Firefox */
            }
          `}</style>
          {/* Dark Overlay for readability */}
          {darkMode && <div className="fixed inset-0 bg-stone-950/85 z-[-1] pointer-events-none" />}

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
                    <NavLink to="/jobs" icon={<Layout size={18} />} label="Job Board" onClick={() => setMobileMenuOpen(false)} />
                    <NavLink to="/diary" icon={<PenTool size={18} />} label="Site Diary" onClick={() => setMobileMenuOpen(false)} />
                    
                    <div className="text-xs font-bold text-gray-500 uppercase px-2 mb-1 mt-4">Finance</div>
                    <NavLink to="/quotes" icon={<DollarSign size={18} />} label="Quotes & Estimates" onClick={() => setMobileMenuOpen(false)} />
                    <NavLink to="/invoices" icon={<CreditCard size={18} />} label="Invoices" onClick={() => setMobileMenuOpen(false)} />
                    
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
          {!isPortal && (
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
                        className="flex items-center gap-1 overflow-x-auto custom-scrollbar-x cursor-grab active:cursor-grabbing select-none h-full items-center"
                        onMouseDown={handleNavMouseDown}
                        onMouseLeave={handleNavMouseLeave}
                        onMouseUp={handleNavMouseUp}
                        onMouseMove={handleNavMouseMove}
                        onScroll={handleNavScroll}
                        onWheel={(e) => { 
                          if (navRef.current) {
                            navRef.current.scrollLeft += e.deltaY;
                            e.preventDefault();
                          }
                        }}
                      >
                        <NavLink to="/pulse" icon={<Activity size={16} />} label="Pulse" />
                        <NavLink to="/projects" icon={<Briefcase size={16} />} label="Projects" />
                        <NavLink to="/jobs" icon={<Layout size={16} />} label="Jobs" />
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
          <main className={`flex-1 ${!isPortal ? 'container mx-auto px-4 py-8' : ''} animate-fade-in`}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="/pulse" element={<UltimatePulseDashboard />} />
              <Route path="/dashboard" element={<UltimatePulseDashboard />} />
              <Route path="/projects" element={<EnhancedProjects />} />
              <Route path="/jobs" element={<JobBoard />} />
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