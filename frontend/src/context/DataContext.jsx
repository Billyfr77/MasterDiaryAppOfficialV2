import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { useUI } from './UIContext';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};

export const DataProvider = ({ children }) => {
  const { error } = useUI(); // Use our new toast for errors
  
  const [projects, setProjects] = useState([]);
  const [staff, setStaff] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- SESSION PERSISTENCE ---
  const [sessionState, setSessionState] = useState(() => {
      try {
          return JSON.parse(localStorage.getItem('MASTER_DIARY_SESSION') || '{}');
      } catch (e) { return {}; }
  });

  const saveSession = useCallback((key, data) => {
      setSessionState(prev => {
          const newState = { ...prev, [key]: data };
          localStorage.setItem('MASTER_DIARY_SESSION', JSON.stringify(newState));
          return newState;
      });
  }, []);

  const getSession = useCallback((key, defaultValue) => {
      return sessionState[key] !== undefined ? sessionState[key] : defaultValue;
  }, [sessionState]);

  const clearSession = useCallback((key) => {
      setSessionState(prev => {
          const newState = { ...prev };
          delete newState[key];
          localStorage.setItem('MASTER_DIARY_SESSION', JSON.stringify(newState));
          return newState;
      });
  }, []);

  const refreshProjects = useCallback(async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.data || res.data || []);
    } catch (e) {
      console.error("Project fetch failed", e);
      // Don't toast on background refresh to avoid annoyance, unless critical
    }
  }, []);

  const refreshStaff = useCallback(async () => {
    try {
      const res = await api.get('/staff');
      setStaff(res.data.data || res.data || []);
    } catch (e) { console.error(e); }
  }, []);

  const refreshEquipment = useCallback(async () => {
    try {
      const res = await api.get('/equipment');
      setEquipment(res.data.data || res.data || []);
    } catch (e) { console.error(e); }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
        await Promise.allSettled([
            refreshProjects(),
            refreshStaff(),
            refreshEquipment()
        ]);
    } catch (e) {
        error("Failed to sync with master database.");
    } finally {
        setLoading(false);
    }
  }, [refreshProjects, refreshStaff, refreshEquipment, error]);

  // Initial Load
  useEffect(() => {
    if (localStorage.getItem('token')) {
        refreshAll();
    } else {
        setLoading(false);
    }
  }, [refreshAll]);

  return (
    <DataContext.Provider value={{ 
      projects, staff, equipment, 
      loading, 
      refreshAll, refreshProjects, refreshStaff, refreshEquipment,
      saveSession, getSession, clearSession
    }}>
      {children}
    </DataContext.Provider>
  );
};
