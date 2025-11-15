/*
 * MasterDiaryApp Official - Construction SaaS Platform
 * Enhanced App.jsx - The Best Version Ever
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 *
 * This is the upgraded version of App.jsx with:
 * - Dark mode enabled by default for eye comfort
 * - Enhanced header with gradient background
 * - Professional UI improvements
 * - All original functionality preserved
 */

import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Home, Folder, Users, Calendar, Settings as SettingsIcon, Wrench, FileText, LogOut, Package, DollarSign } from 'lucide-react'
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
import HMRIndicator from './components/HMRIndicator'
import './App.css'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved !== null ? saved === 'true' : true  // Default to true (dark mode)
  })

  useEffect(() => {
    document.body.className = darkMode ? 'dark' : 'light'
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
    <DndProvider backend={HTML5Backend}>
      <div className="App">
        <HMRIndicator />
        <header style={{
          padding: 'var(--spacing-lg)',
          background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #2c3e50 100%)',
          borderBottom: '1px solid rgba(78, 205, 196, 0.3)',
          color: 'var(--gray-100)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          position: 'relative'
        }}>
          <style>{`
            header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: linear-gradient(45deg, rgba(78, 205, 196, 0.05) 0%, rgba(102, 126, 234, 0.05) 100%);
              pointer-events: none;
            }
            header > div {
              position: relative;
              z-index: 1;
            }
            .nav-link {
              opacity: 0.7;
              transition: opacity 0.3s ease;
            }
            .nav-link:hover {
              opacity: 1;
            }
          `}</style>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{
              margin: 0,
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 'var(--font-weight-bold)',
              background: 'linear-gradient(135deg, #4ecdc4 0%, #667eea 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 2px 4px rgba(78, 205, 196, 0.3)',
              letterSpacing: '-0.5px'
            }}>
              MasterDiaryApp
            </h1>
            <nav className="nav" style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center', flexWrap: 'wrap' }}>
              <Link to="/dashboard" className="nav-link" title="Dashboard">
                <Home size={20} />
              </Link>
              <Link to="/projects" className="nav-link" title="Projects">
                <Folder size={20} />
              </Link>
              <Link to="/staff" className="nav-link" title="Staff">
                <Users size={20} />
              </Link>
              <Link to="/equipment" className="nav-link" title="Equipment">
                <Wrench size={20} />
              </Link>
              <Link to="/nodes" className="nav-link" title="Materials">
                <Package size={20} />
              </Link>
              <Link to="/quotes" className="nav-link" title="Quotes">
                <DollarSign size={20} />
              </Link>
              <Link to="/diary" className="nav-link" title="Diary">
                <Calendar size={20} />
              </Link>
              <Link to="/reports" className="nav-link" title="Reports">
                <FileText size={20} />
              </Link>
              <Link to="/settings" className="nav-link" title="Settings">
                <SettingsIcon size={20} />
              </Link>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="btn btn-outline"
                title={darkMode ? 'Light Mode' : 'Dark Mode'}
                style={{
                  marginLeft: 'var(--spacing-lg)',
                  background: 'rgba(78, 205, 196, 0.1)',
                  border: '1px solid rgba(78, 205, 196, 0.3)',
                  color: '#4ecdc4',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              <button
                onClick={handleLogout}
                className="btn btn-danger"
                title="Logout"
                style={{
                  background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                  border: 'none',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <LogOut size={20} />
              </button>
            </nav>
          </div>
        </header>
        <main className="container" style={{
          paddingTop: 'var(--spacing-xl)',
          paddingBottom: 'var(--spacing-xl)',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
          minHeight: 'calc(100vh - 80px)',
          color: 'var(--gray-100)'
        }}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/dashboard" element={<MasterDashboard />} />
            <Route path="/projects" element={<EnhancedProjects />} />
            <Route path="/staff" element={<EnhancedStaff />} />

            <Route path="/diary" element={<PaintDiary />} />
            <Route path="/settings" element={<EnhancedSettings />} />
            <Route path="/equipment" element={<EnhancedEquipment />} />
            <Route path="/nodes" element={<EnhancedNodes />} />
            <Route path="/quotes" element={<Quotes />} />
            <Route path="/quotes/library" element={<NodesLibrary />} />
            <Route path="/quotes/new" element={<QuoteBuilder />} />
<Route path="/reports" element={<ReportsSimple />} />
                      </Routes>
        </main>
      </div>
    </DndProvider>
  )
}

export default App