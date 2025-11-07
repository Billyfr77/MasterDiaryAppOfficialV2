import React, { useState } from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Projects from './components/Projects'
import Staff from './components/Staff'
import Diary from './components/Diary'
import Settings from './components/Settings'
import Equipment from './components/Equipment'
import Reports from './components/Reports'
import './App.css'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')

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
      <header>
        <h1>MasterDiaryAppOfficial</h1>
        <nav>
          <Link to="/dashboard">Dashboard</Link> | 
          <Link to="/projects">Projects</Link> | 
          <Link to="/staff">Staff</Link> | 
          <Link to="/diary">Diary</Link> | 
          <Link to="/settings">Settings</Link> | 
          <Link to="/equipment">Equipment</Link> | 
          <Link to="/reports">Reports</Link> | 
          <button onClick={handleLogout}>Logout</button>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/diary" element={<Diary />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/equipment" element={<Equipment />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
    </div>
  )
}

export default App