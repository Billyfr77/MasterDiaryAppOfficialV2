/*
 * MasterDiaryApp Official - Construction SaaS Platform
 * App.jsx - Stable Version
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 */

import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Home, Folder, Users, Calendar, Settings as SettingsIcon, Wrench, FileText, LogOut, Package, DollarSign, Moon, Sun, Command, GitBranch, Briefcase, CreditCard, Activity, PenTool, Menu, X } from 'lucide-react'
import { NotificationProvider } from './context/NotificationContext'
import { SettingsProvider } from './context/SettingsContext'
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
import { ClipboardCheck } from 'lucide-react'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [darkMode, setDarkMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const isPortal = window.location.pathname.startsWith('/portal');

  if (!token && !isPortal) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <NotificationProvider>
      <SettingsProvider>
        <DndProvider backend={HTML5Backend}>
          <div className="min-h-screen flex flex-col text-gray-900 dark:text-gray-100 font-sans bg-fixed bg-cover bg-center transition-all duration-500"
             style={{
               backgroundImage: darkMode 
                 ? 'url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop")' 
                 : 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)'
             }}
        >
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
                <div className="flex items-center gap-4 md:gap-8">
                  {/* Hamburger for Mobile */}
                  <button 
                    onClick={() => setMobileMenuOpen(true)} 
                    className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Menu size={24} />
                  </button>

                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                      <Home className="text-white w-5 h-5" />
                    </div>
                    <span className="font-bold text-xl tracking-tight hidden md:block">MasterDiary<span className="text-indigo-400">OS</span></span>
                  </div>
                  
                  <nav className="hidden md:flex items-center gap-1 overflow-x-auto no-scrollbar">
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
                  </nav>
                </div>

                <div className="flex items-center gap-3">
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
            </SettingsProvider>
          </NotificationProvider>
        )
      }
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