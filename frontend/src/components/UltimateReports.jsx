/*
 * MasterDiaryApp Official - Ultimate Reports Page (Simplified)
 * Fully Functional Enhanced Reports with Real-Time Profitability Analysis
 * Integrates Diaries, Paint Diaries, Quotes for Seamless Comparison
 * Simplified version without external dependencies to avoid build errors
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 */

import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

const UltimateReports = () => {
  const [projects, setProjects] = useState([]);
  const [diaries, setDiaries] = useState([]);
  const [paintDiaries, setPaintDiaries] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [filteredData, setFilteredData] = useState({
    diaries: [],
    paintDiaries: [],
    quotes: []
  });
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    projectId: '',
    dataType: 'all'
  });
  const [summary, setSummary] = useState({
    totalHours: 0,
    totalCosts: 0,
    totalRevenues: 0,
    totalMargin: 0,
    avgMarginPct: 0,
    quoteAccuracy: 0,
    realTimeProfitability: 0
  });
  const [realTimeData, setRealTimeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [diaries, paintDiaries, quotes, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [diariesRes, paintDiariesRes, quotesRes, projectsRes] = await Promise.all([
        api.get('/diaries'),
        api.get('/paint-diaries'),
        api.get('/quotes'),
        api.get('/projects')
      ]);

      setDiaries(diariesRes.data);
      setPaintDiaries(paintDiariesRes.data);
      setQuotes(quotesRes.data);
      setProjects(projectsRes.data.data || projectsRes.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const filterByDate = (items, dateField) => {
      let filtered = items;
      if (filters.startDate) {
        filtered = filtered.filter(item => item[dateField] >= filters.startDate);
      }
      if (filters.endDate) {
        filtered = filtered.filter(item => item[dateField] <= filters.endDate);
      }
      if (filters.projectId) {
        filtered = filtered.filter(item => item.projectId === filters.projectId);
      }
      return filtered;
    };

    const filteredDiaries = filterByDate(diaries, 'date');
    const filteredPaintDiaries = filterByDate(paintDiaries, 'date');
    const filteredQuotes = filters.projectId ? quotes.filter(q => q.projectId === filters.projectId) : quotes;

    setFilteredData({
      diaries: filteredDiaries,
      paintDiaries: filteredPaintDiaries,
      quotes: filteredQuotes
    });

    calculateSummary(filteredDiaries, filteredPaintDiaries, filteredQuotes);
    updateRealTimeData(filteredDiaries, filteredPaintDiaries, filteredQuotes);
  };

  const calculateSummary = (diariesList, paintList, quotesList) => {
    const allEntries = [...diariesList, ...paintList];

    const totalHours = allEntries.reduce((sum, d) => sum + parseFloat(d.totalHours || 0), 0);
    const totalCosts = allEntries.reduce((sum, d) => sum + parseFloat(d.costs || d.totalCost || 0), 0);
    const totalRevenues = allEntries.reduce((sum, d) => sum + parseFloat(d.revenues || d.totalRevenue || 0), 0);
    const totalMargin = totalRevenues - totalCosts;
    const avgMarginPct = totalRevenues > 0 ? (totalMargin / totalRevenues) * 100 : 0;

    const quoteAccuracy = calculateQuoteAccuracy(quotesList, allEntries);

    setSummary({
      totalHours: totalHours.toFixed(2),
      totalCosts: totalCosts.toFixed(2),
      totalRevenues: totalRevenues.toFixed(2),
      totalMargin: totalMargin.toFixed(2),
      avgMarginPct: avgMarginPct.toFixed(2),
      quoteAccuracy: quoteAccuracy.toFixed(2),
      realTimeProfitability: avgMarginPct.toFixed(2)
    });
  };

  const calculateQuoteAccuracy = (quotes, entries) => {
    if (quotes.length === 0 || entries.length === 0) return 0;

    let totalAccuracy = 0;
    let count = 0;

    quotes.forEach(quote => {
      const projectEntries = entries.filter(e => e.projectId === quote.projectId);
      if (projectEntries.length > 0) {
        const actualRevenue = projectEntries.reduce((sum, e) => sum + parseFloat(e.revenues || e.totalRevenue || 0), 0);
        const quotedRevenue = parseFloat(quote.totalPrice || 0);
        if (quotedRevenue > 0) {
          const accuracy = Math.min(100, (actualRevenue / quotedRevenue) * 100);
          totalAccuracy += accuracy;
          count++;
        }
      }
    });

    return count > 0 ? totalAccuracy / count : 0;
  };

  const updateRealTimeData = (diariesList, paintList, quotesList) => {
    const combined = [
      ...diariesList.map(d => ({ ...d, type: 'diary', profit: parseFloat(d.marginPct || 0) })),
      ...paintList.map(p => ({ ...p, type: 'paint', profit: p.totalRevenue && p.totalCost ? ((p.totalRevenue - p.totalCost) / p.totalRevenue) * 100 : 0 })),
      ...quotesList.map(q => ({ ...q, type: 'quote', profit: 0 }))
    ].sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

    setRealTimeData(combined.slice(0, 10));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0a0a0a', color: '#ffffff' }}>
        <div>Loading Ultimate Reports...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#0a0a0a', color: '#ffffff', minHeight: '100vh' }}>
        <h2 style={{ color: '#ff6b6b' }}>Error Loading Reports</h2>
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
        <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#00d4aa' }}>Ultimate Construction Reports</h1>

        <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '15px', color: '#00d4aa' }}>Advanced Filters</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#cccccc' }}>Start Date:</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                style={{ width: '100%', padding: '8px', backgroundColor: '#2a2a2a', color: '#ffffff', border: '1px solid #444', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#cccccc' }}>End Date:</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                style={{ width: '100%', padding: '8px', backgroundColor: '#2a2a2a', color: '#ffffff', border: '1px solid #444', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#cccccc' }}>Project:</label>
              <select
                value={filters.projectId}
                onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}
                style={{ width: '100%', padding: '8px', backgroundColor: '#2a2a2a', color: '#ffffff', border: '1px solid #444', borderRadius: '4px' }}
              >
                <option value="">All Projects</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', color: '#cccccc' }}>Data Type:</label>
              <select
                value={filters.dataType}
                onChange={(e) => setFilters({ ...filters, dataType: e.target.value })}
                style={{ width: '100%', padding: '8px', backgroundColor: '#2a2a2a', color: '#ffffff', border: '1px solid #444', borderRadius: '4px' }}
              >
                <option value="all">All Data</option>
                <option value="diaries">Diaries Only</option>
                <option value="paint-diaries">Paint Diaries Only</option>
                <option value="quotes">Quotes Only</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>$</div>
            <h3 style={{ margin: '0', color: '#00d4aa' }}>Total Revenue</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0' }}>${summary.totalRevenues}</p>
            <p style={{ color: '#cccccc', margin: '0' }}>Margin: {summary.avgMarginPct}%</p>
          </div>
          <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>⏱️</div>
            <h3 style={{ margin: '0', color: '#4CAF50' }}>Total Hours</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0' }}>{summary.totalHours}h</p>
            <p style={{ color: '#cccccc', margin: '0' }}>Productive Time</p>
          </div>
          <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>🎯</div>
            <h3 style={{ margin: '0', color: '#2196F3' }}>Quote Accuracy</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0' }}>{summary.quoteAccuracy}%</p>
            <p style={{ color: '#cccccc', margin: '0' }}>Estimate vs Actual</p>
          </div>
          <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>{parseFloat(summary.realTimeProfitability) >= 0 ? '📈' : '📉'}</div>
            <h3 style={{ margin: '0', color: parseFloat(summary.realTimeProfitability) >= 0 ? '#4CAF50' : '#f44336' }}>Real-Time Profitability</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '5px 0' }}>{summary.realTimeProfitability}%</p>
            <p style={{ color: '#cccccc', margin: '0' }}>Live Margin</p>
          </div>
        </div>

        <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '15px', color: '#00d4aa' }}>Real-Time Activity Feed</h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {realTimeData.map((item, index) => (
              <div key={index} style={{ padding: '10px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ color: '#00d4aa', fontWeight: 'bold' }}>{item.type.toUpperCase()}</span>
                  <span style={{ color: '#cccccc', marginLeft: '10px' }}>
                    {item.date || item.createdAt?.split('T')[0]} - {item.Project?.name || item.projectName || 'N/A'}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', color: item.profit >= 0 ? '#4CAF50' : '#f44336' }}>
                    {item.type === 'quote' ? `$${item.totalPrice || 0}` : `${item.profit?.toFixed(1) || 0}% Profit`}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    {item.Staff?.name || item.clientName || 'N/A'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {filters.dataType === 'all' || filters.dataType === 'diaries' ? (
          <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '15px', color: '#00d4aa' }}>Diary Entries ({filteredData.diaries.length})</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#2a2a2a' }}>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#ffffff' }}>Date</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#ffffff' }}>Project</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#ffffff' }}>Worker</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#ffffff' }}>Hours</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#ffffff' }}>Costs</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#ffffff' }}>Revenues</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#ffffff' }}>Margin %</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.diaries.map(d => (
                    <tr key={d.id} style={{ borderBottom: '1px solid #333' }}>
                      <td style={{ padding: '10px', color: '#cccccc' }}>{d.date}</td>
                      <td style={{ padding: '10px', color: '#cccccc' }}>{d.Project?.name}</td>
                      <td style={{ padding: '10px', color: '#cccccc' }}>{d.Staff?.name}</td>
                      <td style={{ padding: '10px', color: '#cccccc' }}>{d.totalHours}</td>
                      <td style={{ padding: '10px', color: '#cccccc' }}>${d.costs}</td>
                      <td style={{ padding: '10px', color: '#cccccc' }}>${d.revenues}</td>
                      <td style={{ padding: '10px', color: d.marginPct >= 0 ? '#4CAF50' : '#f44336' }}>{d.marginPct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filters.dataType === 'all' || filters.dataType === 'paint-diaries' ? (
          <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '15px', color: '#00d4aa' }}>Paint Diary Entries ({filteredData.paintDiaries.length})</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#2a2a2a' }}>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#ffffff' }}>Date</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#ffffff' }}>Project</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#ffffff' }}>Cost</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#ffffff' }}>Revenue</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#ffffff' }}>Profit</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#ffffff' }}>Margin %</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.paintDiaries.map(p => {
                    const profit = p.totalRevenue - p.totalCost;
                    const marginPct = p.totalRevenue > 0 ? (profit / p.totalRevenue) * 100 : 0;
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid #333' }}>
                        <td style={{ padding: '10px', color: '#cccccc' }}>{p.date}</td>
                        <td style={{ padding: '10px', color: '#cccccc' }}>{p.Project?.name}</td>
                        <td style={{ padding: '10px', color: '#cccccc' }}>${p.totalCost}</td>
                        <td style={{ padding: '10px', color: '#cccccc' }}>${p.totalRevenue}</td>
                        <td style={{ padding: '10px', color: profit >= 0 ? '#4CAF50' : '#f44336' }}>${profit.toFixed(2)}</td>
                        <td style={{ padding: '10px', color: marginPct >= 0 ? '#4CAF50' : '#f44336' }}>{marginPct.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filters.dataType === 'all' || filters.dataType === 'quotes' ? (
          <div style={{ backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '15px', color: '#00d4aa' }}>Quotes ({filteredData.quotes.length})</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#2a2a2a' }}>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#ffffff' }}>Date</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#ffffff' }}>Client</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#ffffff' }}>Project</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#ffffff' }}>Total Price</th>
                    <th style={{ padding: '10px', textAlign: 'left', color: '#ffffff' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.quotes.map(q => (
                    <tr key={q.id} style={{ borderBottom: '1px solid #333' }}>
                      <td style={{ padding: '10px', color: '#cccccc' }}>{q.createdAt?.split('T')[0]}</td>
                      <td style={{ padding: '10px', color: '#cccccc' }}>{q.clientName}</td>
                      <td style={{ padding: '10px', color: '#cccccc' }}>{q.projectName}</td>
                      <td style={{ padding: '10px', color: '#cccccc' }}>${q.totalPrice}</td>
                      <td style={{ padding: '10px', color: '#cccccc' }}>{q.status || 'Pending'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button
            onClick={() => window.print()}
            style={{
              padding: '15px 30px',
              backgroundColor: '#00d4aa',
              color: '#0a0a0a',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Print Report
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', color: '#888', fontSize: '14px' }}>
          Real-time updates every 30 seconds • Data refreshes automatically
        </div>
      </div>
    </div>
  );
};

export default UltimateReports;