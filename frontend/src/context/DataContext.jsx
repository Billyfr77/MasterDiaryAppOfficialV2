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
      refreshAll, refreshProjects, refreshStaff, refreshEquipment 
    }}>
      {children}
    </DataContext.Provider>
  );
};
