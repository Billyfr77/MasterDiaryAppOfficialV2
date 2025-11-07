import React, { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../utils/api'

const SettingsContext = createContext()

export const useSettings = () => useContext(SettingsContext)

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings')
      const settingsObj = {}
      response.data.forEach(s => {
        settingsObj[s.parameter] = s.value
      })
      setSettings(settingsObj)
    } catch (err) {
      console.error('Error fetching settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (parameter, value) => {
    try {
      await api.put(`/settings/${parameter}`, { parameter, value })
      setSettings(prev => ({ ...prev, [parameter]: value }))
    } catch (err) {
      console.error('Error updating setting:', err)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, loading, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  )
}