import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

const ReportsSimple = () => {
  const [diaries, setDiaries] = useState([]);
  const [paintDiaries, setPaintDiaries] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [diariesRes, paintDiariesRes, quotesRes] = await Promise.all([
        api.get('/diaries').catch(() => ({ data: [] })),
        api.get('/paint-diaries').catch(() => ({ data: [] })),
        api.get('/quotes').catch(() => ({ data: { data: [] } }))
      ]);

      setDiaries(Array.isArray(diariesRes.data) ? diariesRes.data : []);
      setPaintDiaries(Array.isArray(paintDiariesRes.data) ? paintDiariesRes.data : []);
      setQuotes(Array.isArray(quotesRes.data?.data) ? quotesRes.data.data :
               Array.isArray(quotesRes.data) ? quotesRes.data : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = [...(Array.isArray(diaries) ? diaries : []), ...(Array.isArray(paintDiaries) ? paintDiaries : [])].reduce((sum, item) => sum + (parseFloat(item.revenues) || parseFloat(item.totalRevenue) || 0), 0);
  const totalCosts = [...(Array.isArray(diaries) ? diaries : []), ...(Array.isArray(paintDiaries) ? paintDiaries : [])].reduce((sum, item) => sum + (parseFloat(item.costs) || parseFloat(item.totalCost) || 0), 0);
  const totalProfit = totalRevenue - totalCosts;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  const getRecentActivity = () => {
    const allItems = [
      ...(Array.isArray(diaries) ? diaries : []).map(d => ({ ...d, type: 'Diary Entry' })),
      ...(Array.isArray(paintDiaries) ? paintDiaries : []).map(p => ({ ...p, type: 'Paint Diary' })),
      ...(Array.isArray(quotes) ? quotes : []).map(q => ({ ...q, type: 'Quote' }))
    ];

    return allItems
      .sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0))
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0a0a0a', color: '#ffffff' }}>
        Loading Reports...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#0a0a0a', color: '#ffffff', minHeight: '100vh' }}>
        <h1>Error Loading Reports</h1>
        <p>{error}</p>
        <button onClick={fetchData} style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#0a0a0a', color: '#ffffff', minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#00d4aa' }}>Construction Reports</h1>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ color: '#00d4aa', margin: '0 0 10px 0' }}>Total Revenue</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>${totalRevenue.toFixed(2)}</p>
          </div>
          <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ color: '#4CAF50', margin: '0 0 10px 0' }}>Total Costs</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0' }}>${totalCosts.toFixed(2)}</p>
          </div>
          <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ color: totalProfit >= 0 ? '#4CAF50' : '#f44336', margin: '0 0 10px 0' }}>Net Profit</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0', color: totalProfit >= 0 ? '#4CAF50' : '#f44336' }}>
              ${totalProfit.toFixed(2)}
            </p>
          </div>
          <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ color: '#2196F3', margin: '0 0 10px 0' }}>Profit Margin</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0', color: profitMargin >= 0 ? '#4CAF50' : '#f44336' }}>
              {profitMargin.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Data Overview */}
        <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3 style={{ color: '#00d4aa', marginBottom: '15px' }}>Data Overview</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
            <div><strong>Diary Entries:</strong> {(Array.isArray(diaries) ? diaries : []).length}</div>
            <div><strong>Paint Diaries:</strong> {(Array.isArray(paintDiaries) ? paintDiaries : []).length}</div>
            <div><strong>Quotes:</strong> {(Array.isArray(quotes) ? quotes : []).length}</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3 style={{ color: '#00d4aa', marginBottom: '15px' }}>Recent Activity</h3>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {getRecentActivity().map((item, index) => (
              <div key={index} style={{ padding: '10px', borderBottom: '1px solid #333' }}>
                <strong>{item.type || 'Entry'}</strong> - {item.date || item.createdAt?.split('T')[0] || 'N/A'} - ${item.revenues || item.totalRevenue || item.totalPrice || 0}
              </div>
            ))}
          </div>
        </div>

        {/* Quotes Table */}
        <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3 style={{ color: '#00d4aa', marginBottom: '15px' }}>Quotes ({(Array.isArray(quotes) ? quotes : []).length})</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#2a2a2a' }}>
                  <th style={{ padding: '10px', textAlign: 'left', color: '#ffffff' }}>Date</th>
                  <th style={{ padding: '10px', textAlign: 'left', color: '#ffffff' }}>Name</th>
                  <th style={{ padding: '10px', textAlign: 'left', color: '#ffffff' }}>Project</th>
                  <th style={{ padding: '10px', textAlign: 'left', color: '#ffffff' }}>Total Revenue</th>
                  <th style={{ padding: '10px', textAlign: 'left', color: '#ffffff' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(quotes) ? quotes : []).map(q => (
                  <tr key={q.id} style={{ borderBottom: '1px solid #333' }}>
                    <td style={{ padding: '10px', color: '#cccccc' }}>{q.createdAt?.split('T')[0]}</td>
                    <td style={{ padding: '10px', color: '#cccccc' }}>{q.name}</td>
                    <td style={{ padding: '10px', color: '#cccccc' }}>{q.project?.name}</td>
                    <td style={{ padding: '10px', color: '#cccccc' }}>${q.totalRevenue}</td>
                    <td style={{ padding: '10px', color: '#cccccc' }}>Saved</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Refresh Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={fetchData}
            style={{
              padding: '15px 30px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsSimple;