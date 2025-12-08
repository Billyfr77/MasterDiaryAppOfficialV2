/*
 * MasterDiaryApp Official - Construction SaaS Platform
 * App.jsx - Stable Version
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 */

import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Home, Folder, Users, Calendar, Settings as SettingsIcon, Wrench, FileText, LogOut, Package, DollarSign, Moon, Sun, Command, GitBranch, Briefcase, CreditCard, Activity } from 'lucide-react'
import { NotificationProvider } from './context/NotificationContext'
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

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [darkMode, setDarkMode] = useState(true);

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
          
          {/* Header */}
          {!isPortal && (
            <header className="sticky top-0 z-50 glass-panel border-b-0 rounded-none shadow-lg transition-all duration-300">
              <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                      <Home className="text-white w-5 h-5" />
                    </div>
                    <span className="font-bold text-xl tracking-tight hidden md:block">MasterDiary<span className="text-indigo-400">OS</span></span>
                  </div>
                  
                  <nav className="hidden md:flex items-center gap-1 overflow-x-auto no-scrollbar">
                    <NavLink to="/pulse" icon={<Activity size={16} />} label="Pulse" />
                    <NavLink to="/projects" icon={<Briefcase size={16} />} label="Projects" />
                    <NavLink to="/map-builder" icon={<Command size={16} />} label="Map" />
                    <NavLink to="/clients" icon={<Users size={16} />} label="Clients" />
                    <NavLink to="/quotes" icon={<DollarSign size={16} />} label="Quotes" />
                    <NavLink to="/invoices" icon={<CreditCard size={16} />} label="Invoices" />
                    <NavLink to="/workflows" icon={<GitBranch size={16} />} label="Flows" />
                    <NavLink to="/resources" icon={<Calendar size={16} />} label="Resources" />
                    <NavLink to="/nodes" icon={<Package size={16} />} label="Materials" />
                    <NavLink to="/staff" icon={<Users size={16} />} label="Staff" />
                    <NavLink to="/equipment" icon={<Wrench size={16} />} label="Equipment" />
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
              <Route path="/xero/callback" element={<XeroCallback />} />
              <Route path="/portal/view/:projectId" element={<ClientPortal />} />
            </Routes>
          </main>
        </div>
      </DndProvider>
    </NotificationProvider>
  )
}

// Helper Component for Nav Links
const NavLink = ({ to, icon, label }) => {
  const location = useLocation()
  // Active if exact match OR if it's a sub-route (e.g. /quotes/builder is active for /quotes), excluding root /
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to))

  return (
    <Link
      to={to}
      title={label} 
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