/*
 * MasterDiaryApp Official - Construction SaaS Platform
 * App.jsx - Stable Version
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 */

import React, { useState, useEffect, useRef } from 'react'
import { Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Home, Folder, Users, Calendar, Settings as SettingsIcon, Wrench, FileText, LogOut, Package, DollarSign, Moon, Sun, Command, GitBranch, Briefcase, CreditCard, Activity, PenTool, Menu, X, Globe, Shield } from 'lucide-react'
import { NotificationProvider } from './context/NotificationContext'
import { SettingsProvider } from './context/SettingsContext'
import { UIProvider } from './context/UIContext'
import { DataProvider } from './context/DataContext'
import SovereignErrorBoundary from './components/ui/SovereignErrorBoundary'
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
import { DiaryThemeProvider, useDiaryTheme } from './components/PaintDiary/ThemeContext'
import ResourceCommand from './components/ResourceCommand'
import Quotes from './components/Quotes'
import NodesLibrary from './components/NodesLibrary'
import QuoteBuilder from './components/QuoteBuilder'
import VisualMapBuilder from './components/VisualMapBuilder'
import WorkflowBuilder from './components/WorkflowBuilder/WorkflowBuilder'
import ExecutiveHQ from './components/ExecutiveHQ'
import InvoiceBuilder from './components/InvoiceBuilder'
import XeroCallback from './components/XeroCallback'
import PinnacleCopilot from './components/PinnacleCopilot'
import AuditUltraLog from './components/AuditUltraLog'
import SafetyDashboard from './components/Safety/SafetyDashboard'
import SafetyFormViewer from './components/Safety/SafetyFormViewer'
import SubscriptionPage from './components/SubscriptionPage'
import OnboardingWizard from './components/Onboarding/OnboardingWizard'
import AIOnboardingOverlay from './components/Onboarding/AIOnboardingOverlay'
import NotificationDropdown from './components/NotificationDropdown'
import { ClipboardCheck, Layout, Crown } from 'lucide-react'
import MainHeader, { NavLink } from './components/Shell/MainHeader'

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

  const handleLogin = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const location = useLocation();
  const isPortal = location.pathname.startsWith('/portal');
  const isLanding = location.pathname === '/';
  const isWorkflowBuilder = location.pathname.startsWith('/workflows');
  const isExecutiveHQ = location.pathname.startsWith('/hq');
  const isMapBuilder = location.pathname.startsWith('/map-builder');

  return (
    <SovereignErrorBoundary>
      <UIProvider>
        <NotificationProvider>
          <SettingsProvider>
            <DataProvider>
              <DiaryThemeProvider>
                <DndProvider backend={HTML5Backend}>
                  <AppInner 
                    token={token} onLogin={handleLogin}
                    darkMode={darkMode} setDarkMode={setDarkMode} 
                    mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen}
                    isLanding={isLanding} isPortal={isPortal}
                    isWorkflowBuilder={isWorkflowBuilder || isExecutiveHQ}
                    isMapBuilder={isMapBuilder}
                  />
                </DndProvider>
              </DiaryThemeProvider>
            </DataProvider>
          </SettingsProvider>
        </NotificationProvider>
      </UIProvider>
    </SovereignErrorBoundary>
  );
}

// Split into sub-component to use context
function AppInner({ 
    token, onLogin,
    darkMode, setDarkMode, mobileMenuOpen, setMobileMenuOpen, 
    isLanding, isPortal, isWorkflowBuilder, isMapBuilder
}) {
  const { theme, allThemes, setActiveTheme, activeTheme, liteMode } = useDiaryTheme();
  const location = useLocation();
  const navigate = useNavigate();

  if (!token && !isPortal) {
    return <Login onLogin={onLogin} />
  }

  return (
    <div className={`min-h-screen flex flex-col text-gray-900 dark:text-gray-100 font-sans transition-all duration-500 ${isLanding ? 'bg-transparent' : 'bg-[#0a0a0c]'}`}>
          <style>{`
            @keyframes wave-flow {
              0% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 0.4; }
              50% { transform: translate(2%, 5%) rotate(2deg) scale(1.1); opacity: 0.8; }
              100% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 0.4; }
            }
            @keyframes grid-drift {
              0% { background-position: 0 0; }
              100% { background-position: 100px 100px; }
            }
          `}</style>
          
          {!liteMode && !isPortal && !isLanding && (
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#000000]">
               <div className="absolute inset-0 bg-black"></div>
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,27,75,0.15)_0%,transparent_100%)]"></div>
               <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay"></div>
               <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:100px_100px] opacity-10 animate-[grid-drift_60s_linear_infinite]"></div>

               <div className="absolute inset-0 mix-blend-screen filter blur-[140px]">
                   <div 
                    className="absolute top-[-20%] left-[-20%] w-[80%] h-[140%] bg-gradient-to-b from-transparent to-transparent animate-[wave-flow_20s_ease-in-out_infinite] rotate-[25deg]" 
                    style={{ backgroundImage: `linear-gradient(to bottom, transparent, ${theme.accent}44, transparent)` }}
                   />
                   <div 
                    className="absolute top-[-10%] right-[-20%] w-[70%] h-[120%] bg-gradient-to-b from-transparent to-transparent animate-[wave-flow_25s_ease-in-out_infinite_reverse] rotate-[-15deg]" 
                    style={{ backgroundImage: `linear-gradient(to bottom, transparent, ${theme.accent}33, transparent)` }}
                   />
               </div>
            </div>
          )}

          {!isPortal && <CommandPalette />}
          
          {/* Mobile Menu */}
          {mobileMenuOpen && !isPortal && (
            <div className="fixed inset-0 z-[100] flex md:hidden">
               <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setMobileMenuOpen(false)} />
               <div className="relative w-72 h-full bg-stone-900 border-r border-white/10 shadow-2xl p-4 flex flex-col gap-4 animate-slide-right overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme.accent }}>
                          <Home className="text-white w-5 h-5" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-white">MasterDiary<span style={{ color: theme.accent }}>OS</span></span>
                    </div>
                    <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-full">
                      <X size={20} />
                    </button>
                  </div>
                  
                  <nav className="flex flex-col gap-2">
                    <div className="text-xs font-bold text-gray-500 uppercase px-2 mb-1 mt-2">Core</div>
                    <NavLink to="/pulse" icon={<Activity size={18} />} label="Pulse Dashboard" onClick={() => setMobileMenuOpen(false)} activeColor={theme.accent} />
                    <NavLink to="/projects" icon={<Briefcase size={18} />} label="Projects" onClick={() => setMobileMenuOpen(false)} activeColor={theme.accent} />
                    <NavLink to="/diary" icon={<PenTool size={18} />} label="Site Diary" onClick={() => setMobileMenuOpen(false)} activeColor={theme.accent} />
                  </nav>
               </div>
            </div>
          )}

          {/* Header */}
          {!isPortal && !isLanding && (
            <MainHeader 
                darkMode={darkMode} 
                setDarkMode={setDarkMode} 
                setMobileMenuOpen={setMobileMenuOpen} 
            />
          )}

          <main className={`flex-1 ${(!isPortal && !isLanding && !isWorkflowBuilder && !isMapBuilder) ? 'container mx-auto px-4 py-8' : ''} ${isMapBuilder ? 'flex flex-col' : ''} ${liteMode ? '' : 'animate-fade-in'}`}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login onLogin={onLogin} />} />
              <Route path="/pulse" element={<ExecutiveHQ />} />
              <Route path="/dashboard" element={<ExecutiveHQ />} />
              <Route path="/hq" element={<ExecutiveHQ />} />
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
              <Route path="/hq" element={<ExecutiveHQ />} />
              <Route path="/reports" element={<PinnacleIntelligentReports />} />
              <Route path="/reports/new" element={<DocumentForm />} />
              <Route path="/reports/edit/:id" element={<DocumentForm />} />
              <Route path="/invoices" element={<InvoiceBuilder />} />
              <Route path="/audit" element={<AuditUltraLog />} />
              <Route path="/safety" element={<SafetyDashboard />} />
              <Route path="/safety/:id" element={<SafetyFormViewer />} />
              <Route path="/xero/callback" element={<XeroCallback />} />
              <Route path="/subscription" element={<SubscriptionPage />} />
              <Route path="/onboarding" element={<OnboardingWizard />} />
              <Route path="/portal/view/:projectId" element={<ClientPortal />} />
            </Routes>
          </main>

          {!isPortal && !isMapBuilder && <PinnacleCopilot />}
          {!isPortal && !isMapBuilder && <AIOnboardingOverlay />}
        </div>
  );
}

export default App