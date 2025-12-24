import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/ui/Toast';

const UIContext = createContext();

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within a UIProvider');
  return context;
};

export const UIProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  
  // Onboarding State
  const [onboarding, setOnboarding] = useState({
    activeModule: null, // 'quote', 'diary', 'dashboard'
    stepIndex: 0,
    isVisible: false
  });

  const startOnboarding = useCallback((moduleName) => {
    setOnboarding({ activeModule: moduleName, stepIndex: 0, isVisible: true });
  }, []);

  const nextStep = useCallback(() => {
    setOnboarding(prev => ({ ...prev, stepIndex: prev.stepIndex + 1 }));
  }, []);

  const prevStep = useCallback(() => {
    setOnboarding(prev => ({ ...prev, stepIndex: Math.max(0, prev.stepIndex - 1) }));
  }, []);

  const closeOnboarding = useCallback(() => {
    setOnboarding(prev => ({ ...prev, isVisible: false, activeModule: null }));
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Helper helpers
  const success = (msg) => showToast(msg, 'success');
  const error = (msg) => showToast(msg, 'error');
  const warning = (msg) => showToast(msg, 'warning');
  const info = (msg) => showToast(msg, 'info');

  return (
    <UIContext.Provider value={{ 
      showToast, removeToast, success, error, warning, info,
      onboarding, startOnboarding, nextStep, prevStep, closeOnboarding
    }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <Toast 
            key={toast.id}
            {...toast}
            onClose={removeToast}
          />
        ))}
      </div>
    </UIContext.Provider>
  );
};
