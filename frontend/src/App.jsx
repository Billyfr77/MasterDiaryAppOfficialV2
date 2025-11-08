import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import { Home, Folder, Users, Calendar, Settings as SettingsIcon, Wrench, FileText, LogOut, Package, DollarSign } from 'lucide-react'
import Login from './components/Login'
import Landing from './components/Landing'
import Dashboard from './components/Dashboard'
import Projects from './components/Projects'
import Staff from './components/Staff'
import Diary from './components/Diary'
import Settings from './components/Settings'
import Equipment from './components/Equipment'
import Reports from './components/Reports'
import Nodes from './components/Nodes'
import Quotes from './components/Quotes'
import NodesLibrary from './components/NodesLibrary'
import QuoteBuilder from './components/QuoteBuilder'
import './App.css'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    if (saved !== null) return saved === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => {
      if (localStorage.getItem('darkMode') === null) {
        setDarkMode(e.matches)
      }
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

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
    <div className="App">
      <header style={{ padding: 'var(--spacing-lg)', backgroundColor: 'var(--gray-100)', borderBottom: '1px solid var(--gray-200)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--primary-color)' }}>MasterDiaryApp</h1>
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
  <Link to="/diary" className="nav-link" title="Diary">
    <Calendar size={20} />
  </Link>
  <Link to="/settings" className="nav-link" title="Settings">
    <SettingsIcon size={20} />
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
  <Link to="/reports" className="nav-link" title="Reports">
    <FileText size={20} />
  </Link>
  <button onClick={() => setDarkMode(!darkMode)} className="btn btn-outline" title={darkMode ? 'Light Mode' : 'Dark Mode'} style={{ marginLeft: 'var(--spacing-lg)' }}>
    {darkMode ? '☀️' : '🌙'}
  </button>
  <button onClick={handleLogout} className="btn btn-danger" title="Logout">
    <LogOut size={20} />
  </button>
</nav>
        </div>
      </header>
      <main className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
        <Routes>
  <Route path="/" element={<Landing />} />
  <Route path="/login" element={<Login onLogin={handleLogin} />} />
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/projects" element={<Projects />} />
  <Route path="/staff" element={<Staff />} />
  <Route path="/diary" element={<Diary />} />
  <Route path="/settings" element={<Settings />} />
  <Route path="/equipment" element={<Equipment />} />
  <Route path="/nodes" element={<Nodes />} />
  <Route path="/quotes" element={<Quotes />} />
  <Route path="/quotes/library" element={<NodesLibrary />} />
  <Route path="/quotes/new" element={<QuoteBuilder />} />
  <Route path="/reports" element={<Reports />} />
</Routes>
      </main>
    </div>
  )
}

export default App