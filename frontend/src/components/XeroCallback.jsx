import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

const XeroCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await api.post('/xero/callback', { url: window.location.href });
        alert('Xero connected successfully!');
        navigate('/settings');
      } catch (error) {
        console.error('Xero Connection Failed:', error);
        alert('Failed to connect Xero.');
        navigate('/settings');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-stone-900 text-white">
      <div className="w-12 h-12 border-4 border-[#13b5ea] border-t-transparent rounded-full animate-spin mb-4"></div>
      <h2 className="text-xl font-bold">Connecting to Xero...</h2>
    </div>
  );
};

export default XeroCallback;