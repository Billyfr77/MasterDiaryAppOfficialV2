/*
 * MasterDiaryApp Official - Construction SaaS Platform
 * Enhanced App.jsx - The Best Version Ever
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 */

import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Home, Folder, Users, Calendar, Settings as SettingsIcon, Wrench, FileText, LogOut, Package, DollarSign, Moon, Sun, Command } from 'lucide-react'
import Login from './components/Login'
import Landing from './components/Landing'
import MasterDashboard from './components/UltimateDashboardFinal'
import EnhancedStaff from './components/EnhancedStaff'
import EnhancedEquipment from './components/EnhancedEquipment'
import EnhancedNodes from './components/EnhancedNodes'
import EnhancedProjects from './components/EnhancedProjects'
import ReportsSimple from './components/ReportsSimple';
import EnhancedSettings from './components/EnhancedSettings'
import EnhancedDiary from './components/EnhancedDiary'
import Quotes from './components/Quotes'
import NodesLibrary from './components/NodesLibrary'
import QuoteBuilder from './components/QuoteBuilder'
import PaintDiary from './components/PaintDiary'
import VisualMapBuilder from './components/VisualMapBuilder'
import FleetCommand from './components/FleetCommand'
import InvoiceBuilder from './components/InvoiceBuilder'
import XeroCallback from './components/XeroCallback'
import { NotificationProvider } from './context/NotificationContext'
import CommandPalette from './components/Shell/CommandPalette'
import './App.css'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved !== null ? saved === 'true' : true
  })

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  const handleLogin = (newToken) => {
    setToken(newToken)
    localStorage.setItem('token', newToken)
  }

  const handleLogout = () => {
    setToken('')
    localStorage.removeItem('token')
  }

  if (!token) {
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
          <CommandPalette />
          
          {/* Header */}
          <header className="sticky top-0 z-50 glass-panel border-b-0 rounded-none shadow-lg transition-all duration-300">
            <div className="container mx-auto px-6 py-3">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                {/* Logo */}
                <div className="flex items-center gap-3 group cursor-pointer">
                  <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <FileText size={20} className="text-white" />
                  </div>
                  <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight">
                    MasterDiary<span className="text-indigo-500">App</span>
                  </h1>
                  <div className="hidden md:flex items-center gap-1 text-[10px] text-gray-500 bg-black/20 px-2 py-0.5 rounded border border-white/5 font-mono ml-2">
                    <Command size={10} /> + K
                  </div>
                </div>

                {/* Navigation */}
                <nav className="flex items-center gap-1 overflow-x-auto max-w-full pb-2 lg:pb-0 scrollbar-hide p-1">
                  <NavLink to="/dashboard" icon={<Home size={16} />} label="Dashboard" />
                  <NavLink to="/projects" icon={<Folder size={16} />} label="Projects" />
                  <NavLink to="/staff" icon={<Users size={16} />} label="Staff" />
                  <NavLink to="/equipment" icon={<Wrench size={16} />} label="Equipment" />
                  <NavLink to="/nodes" icon={<Package size={16} />} label="Materials" />
                  <NavLink to="/quotes" icon={<DollarSign size={16} />} label="Quotes" />
                  <NavLink to="/map-builder" icon={<Command size={16} />} label="Visual Map" />
                  <NavLink to="/diary" icon={<Calendar size={16} />} label="Diary" />
                  <NavLink to="/reports" icon={<FileText size={16} />} label="Reports" />
                  <NavLink to="/settings" icon={<SettingsIcon size={16} />} label="Settings" />
                  
                  <div className="h-6 w-px bg-white/10 mx-2"></div>

                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-white/10 transition-all hover:scale-110 active:scale-95"
                    title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  >
                    {darkMode ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className="text-indigo-600" />}
                  </button>

                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all hover:scale-110 active:scale-95"
                    title="Logout"
                  >
                    <LogOut size={16} />
                  </button>
                </nav>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 container mx-auto px-4 py-8 animate-fade-in">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="/dashboard" element={<MasterDashboard />} />
              <Route path="/projects" element={<EnhancedProjects />} />
              <Route path="/staff" element={<EnhancedStaff />} />
              <Route path="/diary" element={<PaintDiary />} />
              <Route path="/settings" element={<EnhancedSettings />} />
              <Route path="/equipment" element={<FleetCommand />} />
              <Route path="/nodes" element={<EnhancedNodes />} />
              <Route path="/quotes" element={<Quotes />} />
              <Route path="/quotes/library" element={<NodesLibrary />} />
              <Route path="/quotes/new" element={<QuoteBuilder />} />
              <Route path="/map-builder" element={<VisualMapBuilder />} />
              <Route path="/reports" element={<ReportsSimple />} />
              <Route path="/invoices" element={<InvoiceBuilder />} />
              <Route path="/xero/callback" element={<XeroCallback />} />
            </Routes>
          </main>
        </div>
      </DndProvider>
    </NotificationProvider>
  )
}

// Helper Component for Nav Links
const NavLink = ({ to, icon, label }) => {
  const isActive = window.location.pathname === to
  return (
    <Link
      to={to}
      className={`
        flex flex-col lg:flex-row items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 group text-xs font-bold whitespace-nowrap
        ${isActive 
          ? 'bg-white/10 text-white shadow-lg border border-white/10' 
          : 'text-gray-400 hover:text-white hover:bg-white/5'}
      `}
    >
      <span className={`transition-transform duration-300 ${isActive ? 'scale-110 text-indigo-400' : 'group-hover:scale-110 group-hover:text-indigo-400'}`}>{icon}</span>
      <span className="hidden xl:block">{label}</span>
    </Link>
  )
}

export default App