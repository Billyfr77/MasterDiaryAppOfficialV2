import React, { useEffect, useState } from 'react';

/**
 * HMR Status Indicator Component
 * Shows a visual indicator when Hot Module Replacement updates occur
 * Only visible in development mode
 */
const HMRIndicator = () => {
  const [status, setStatus] = useState('idle');
  const [updateCount, setUpdateCount] = useState(0);

  useEffect(() => {
    // Only show in development
    if (import.meta.env.PROD) return;

    // Listen for HMR updates
    if (import.meta.hot) {
      import.meta.hot.on('vite:beforeUpdate', () => {
        setStatus('updating');
      });

      import.meta.hot.on('vite:afterUpdate', () => {
        setStatus('updated');
        setUpdateCount(prev => prev + 1);
        
        // Reset to idle after 2 seconds
        setTimeout(() => {
          setStatus('idle');
        }, 2000);
      });

      import.meta.hot.on('vite:error', () => {
        setStatus('error');
      });
    }
  }, []);

  // Don't render in production
  if (import.meta.env.PROD) return null;

  const getStatusConfig = () => {
    switch (status) {
      case 'updating':
        return {
          bg: 'bg-yellow-500',
          text: 'Updating...',
          icon: '🔄'
        };
      case 'updated':
        return {
          bg: 'bg-green-500',
          text: 'Updated!',
          icon: '✓'
        };
      case 'error':
        return {
          bg: 'bg-red-500',
          text: 'Error',
          icon: '⚠️'
        };
      default:
        return {
          bg: 'bg-blue-500',
          text: 'Live',
          icon: '●'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        transition: 'all 0.3s ease',
        opacity: status === 'idle' ? 0.6 : 1,
        transform: status === 'idle' ? 'scale(0.9)' : 'scale(1)',
      }}
    >
      <div
        className={`${config.bg} text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium`}
        style={{
          animation: status === 'updating' ? 'pulse 1s infinite' : 'none',
        }}
      >
        <span>{config.icon}</span>
        <span>{config.text}</span>
        {updateCount > 0 && (
          <span className="bg-white bg-opacity-20 px-2 py-0.5 rounded text-xs">
            {updateCount}
          </span>
        )}
      </div>
      
      {/* Tooltip */}
      <div
        style={{
          position: 'absolute',
          bottom: '100%',
          right: 0,
          marginBottom: '8px',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          whiteSpace: 'nowrap',
          opacity: status !== 'idle' ? 1 : 0,
          pointerEvents: 'none',
          transition: 'opacity 0.2s',
        }}
      >
        Hot Module Replacement Active
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: '20px',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid rgba(0, 0, 0, 0.9)',
          }}
        />
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
};

export default HMRIndicator;
