import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      const res = await api.get('/settings');
      // Convert array [{parameter: 'x', value: 'y'}] to object {x: 'y'}
      const settingsMap = {};
      if (Array.isArray(res.data)) {
        res.data.forEach(s => {
          settingsMap[s.parameter] = s.value;
        });
      }
      setSettings(settingsMap);
    } catch (error) {
      console.error('Failed to load settings context:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key, value, notes = '') => {
    try {
      // Optimistic update
      setSettings(prev => ({ ...prev, [key]: value }));
      
      // Upsert via API (Backend needs to handle "upsert" logic based on parameter name)
      // We'll assume the backend has a specific endpoint or we use the generic POST/PUT
      // For now, let's use the generic POST which creates or errors if exists, 
      // but ideally we want a "set" endpoint.
      // We will implement a `updateByKey` helper in the component or backend.
      
      // Actually, let's just reload to be safe or rely on the component to call the API 
      // and then we reload here. But a global "set" is better.
      await api.post('/settings/upsert', { parameter: key, value: String(value), notes });
      await loadSettings();
    } catch (error) {
      console.error('Failed to update setting:', error);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, loadSettings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
};
