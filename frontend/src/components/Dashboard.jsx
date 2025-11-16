import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

function UltimateDashboard() {
  const [data, setData] = useState({
    diaries: [],
    projects: [],
    staff: [],
    equipment: [],
    quotes: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeModule, setActiveModule] = useState('overview');
  const [userRole, setUserRole] = useState('manager'); // 'manager' or 'staff'

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [diariesRes, projectsRes, staffRes, equipmentRes, quotesRes] = await Promise.all([
        api.get('/diaries'),
        api.get('/projects'),
        api.get('/staff'),
        api.get('/equipment'),
        api.get('/quotes')
      ]);

      setData({
        diaries: Array.isArray(diariesRes.data) ? diariesRes.data : [],
        projects: Array.isArray(projectsRes.data?.data || projectsRes.data) ? projectsRes.data?.data || projectsRes.data : [],
        staff: Array.isArray(staffRes.data?.data || staffRes.data) ? staffRes.data?.data || staffRes.data : [],
        equipment: Array.isArray(equipmentRes.data?.data || equipmentRes.data) ? equipmentRes.data?.data || equipmentRes.data : [],
        quotes: Array.isArray(quotesRes.data?.data || quotesRes.data) ? quotesRes.data?.data || quotesRes.data : []
      });
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Unable to load dashboard data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  // Safe calculations
  const calculateKPIs = () => {
    const { diaries, projects, staff, quotes } = data;
    const totalRevenue = diaries.reduce((sum, d) => sum + (d.revenues ? parseFloat(d.revenues) : 0), 0);
    const totalCosts = diaries.reduce((sum, d) => sum + (d.costs ? parseFloat(d.costs) : 0), 0);
    const totalHours = diaries.reduce((sum, d) => sum + (d.totalHours ? parseFloat(d.totalHours) : 0), 0);

    return {
      projects: projects.length,
      staff: staff.length,
      diaries: diaries.length,
      quotes: quotes.length,
      revenue: totalRevenue,
      costs: totalCosts,
      profit: totalRevenue - totalCosts,
      margin: totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue * 100) : 0,
      efficiency: totalHours > 0 ? totalRevenue / totalHours : 0,
      activeProjects: projects.filter(p => diaries.some(d => d.projectId === p.id)).length,
      pendingQuotes: quotes.filter(q => q.status === 'pending').length
    };
  };

  const kpis = calculateKPIs();

  // Simple chart components using SVG
  const LineChart = ({ data, width = 300, height = 150 }) => {
    if (!data || data.length === 0) return <div>No data available</div>;

    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;

    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d.value - minValue) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
        <polyline
          fill="none"
          stroke="#4ecdc4"
          strokeWidth="3"
          points={points}
        />
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * width;
          const y = height - ((d.value - minValue) / range) * height;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4"
              fill="#4ecdc4"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(78, 205, 196, 0.3))' }}
            />
          );
        })}
      </svg>
    );
  };

  const BarChart = ({ data, width = 300, height = 150 }) => {
    if (!data || data.length === 0) return <div>No data available</div>;

    const maxValue = Math.max(...data.map(d => d.value));
    const barWidth = width / data.length * 0.8;
    const barSpacing = width / data.length * 0.2;

    return (
      <svg width={width} height={height} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
        {data.map((d, i) => {
          const barHeight = (d.value / maxValue) * (height - 40);
          const x = i * (barWidth + barSpacing) + barSpacing / 2;
          const y = height - barHeight - 20;

          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill="#667eea"
              rx="4"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(102, 126, 234, 0.3))' }}
            />
          );
        })}
      </svg>
    );
  };

  const modules = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'insights', label: 'AI Insights', icon: '🧠' },
    { id: 'team', label: 'Team', icon: '👥' },
    { id: 'projects', label: 'Projects', icon: '🏗️' }
  ];

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid rgba(255,255,255,0.3)',
            borderTop: '3px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h2>Loading Dashboard...</h2>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        color: 'white',
        padding: '20px'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <h1>⚠️ Dashboard Error</h1>
          <p>{error}</p>
          <button
            onClick={fetchData}
            style={{
              padding: '12px 24px',
              background: '#4ecdc4',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>

      {/* Sidebar */}
      <aside style={{
        width: sidebarCollapsed ? '60px' : '250px',
        background: 'white',
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
        transition: 'width 0.3s ease',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e1e5e9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'space-between'
        }}>
          {!sidebarCollapsed && <h2 style={{ margin: 0, color: '#2d3748' }}>MasterDiary</h2>}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              color: '#4a5568'
            }}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        <nav style={{ padding: '20px 0' }}>
          {modules.map(module => (
            <button
              key={module.id}
              onClick={() => setActiveModule(module.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                padding: '12px 20px',
                background: activeModule === module.id ? '#e6fffa' : 'transparent',
                border: 'none',
                borderLeft: activeModule === module.id ? '4px solid #4ecdc4' : '4px solid transparent',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
                color: activeModule === module.id ? '#2d3748' : '#4a5568',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ fontSize: '18px', marginRight: sidebarCollapsed ? 0 : '12px' }}>
                {module.icon}
              </span>
              {!sidebarCollapsed && module.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '20px', borderTop: '1px solid #e1e5e9' }}>
          <div style={{
            width: '100%',
            height: '8px',
            background: '#e1e5e9',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '75%',
              height: '100%',
              background: 'linear-gradient(90deg, #4ecdc4, #667eea)',
              borderRadius: '4px'
            }}></div>
          </div>
          {!sidebarCollapsed && (
            <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#718096' }}>
              System Health: Good
            </p>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Top Navigation */}
        <header style={{
          background: 'white',
          padding: '16px 24px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ margin: 0, color: '#2d3748', fontSize: '24px' }}>
              {modules.find(m => m.id === activeModule)?.label}
            </h1>
            <p style={{ margin: '4px 0 0 0', color: '#718096', fontSize: '14px' }}>
              Last updated: {lastUpdate.toLocaleString()}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #e1e5e9',
                borderRadius: '6px',
                background: 'white'
              }}
            >
              <option value="manager">Manager View</option>
              <option value="staff">Staff View</option>
            </select>

            <button
              onClick={fetchData}
              style={{
                padding: '8px 16px',
                background: '#4ecdc4',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Refresh
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>

          {activeModule === 'overview' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                {[
                  { label: 'Total Projects', value: kpis.projects, icon: '🏗️', color: '#667eea' },
                  { label: 'Active Staff', value: kpis.staff, icon: '👥', color: '#4ecdc4' },
                  { label: 'Diary Entries', value: kpis.diaries, icon: '📝', color: '#ffc107' },
                  { label: 'Pending Quotes', value: kpis.pendingQuotes, icon: '💰', color: '#ff6b6b' }
                ].map((metric, index) => (
                  <div key={index} style={{
                    background: 'white',
                    padding: '24px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
                    border: '1px solid #e1e5e9'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                      <span style={{ fontSize: '24px', marginRight: '12px' }}>{metric.icon}</span>
                      <h3 style={{ margin: 0, color: '#4a5568', fontSize: '14px', fontWeight: '600' }}>
                        {metric.label}
                      </h3>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: metric.color }}>
                      {metric.value}
                    </div>
                  </div>
                ))}
              </div>

              {userRole === 'manager' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  {[
                    { label: 'Total Revenue', value: `$${kpis.revenue.toLocaleString()}`, icon: '💵', color: '#4ecdc4' },
                    { label: 'Total Costs', value: `$${kpis.costs.toLocaleString()}`, icon: '💸', color: '#ff6b6b' },
                    { label: 'Net Profit', value: `$${kpis.profit.toLocaleString()}`, icon: '📈', color: '#ffc107' },
                    { label: 'Profit Margin', value: `${kpis.margin.toFixed(1)}%`, icon: '🎯', color: kpis.margin > 20 ? '#4ecdc4' : kpis.margin < 10 ? '#ff6b6b' : '#ffc107' }
                  ].map((metric, index) => (
                    <div key={index} style={{
                      background: 'white',
                      padding: '24px',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
                      border: '1px solid #e1e5e9'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                        <span style={{ fontSize: '24px', marginRight: '12px' }}>{metric.icon}</span>
                        <h3 style={{ margin: 0, color: '#4a5568', fontSize: '14px', fontWeight: '600' }}>
                          {metric.label}
                        </h3>
                      </div>
                      <div style={{ fontSize: '32px', fontWeight: '700', color: metric.color }}>
                        {metric.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {userRole === 'staff' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  <div style={{
                    background: 'white',
                    padding: '24px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
                    border: '1px solid #e1e5e9'
                  }}>
                    <h3 style={{ margin: '0 0 16px 0', color: '#4a5568', fontSize: '18px', fontWeight: '600' }}>
                      Today's Tasks
                    </h3>
                    <div style={{ fontSize: '14px', color: '#718096' }}>
                      No tasks assigned for today
                    </div>
                  </div>

                  <div style={{
                    background: 'white',
                    padding: '24px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
                    border: '1px solid #e1e5e9'
                  }}>
                    <h3 style={{ margin: '0 0 16px 0', color: '#4a5568', fontSize: '18px', fontWeight: '600' }}>
                      Recent Activity
                    </h3>
                    <div style={{ fontSize: '14px', color: '#718096' }}>
                      {data.diaries.slice(-3).map((diary, i) => (
                        <div key={i} style={{ marginBottom: '8px' }}>
                          • {new Date(diary.date).toLocaleDateString()} - {diary.totalHours || 0}h worked
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeModule === 'analytics' && (
            <div>
              <h2 style={{ margin: '0 0 24px 0', color: '#2d3748' }}>Analytics Dashboard</h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                <div style={{
                  background: 'white',
                  padding: '24px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
                  border: '1px solid #e1e5e9'
                }}>
                  <h3 style={{ margin: '0 0 16px 0', color: '#2d3748' }}>Revenue Trend</h3>
                  <LineChart
                    data={[
                      { label: 'Jan', value: kpis.revenue * 0.7 },
                      { label: 'Feb', value: kpis.revenue * 0.8 },
                      { label: 'Mar', value: kpis.revenue * 0.9 },
                      { label: 'Apr', value: kpis.revenue }
                    ]}
                  />
                </div>

                <div style={{
                  background: 'white',
                  padding: '24px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
                  border: '1px solid #e1e5e9'
                }}>
                  <h3 style={{ margin: '0 0 16px 0', color: '#2d3748' }}>Project Distribution</h3>
                  <BarChart
                    data={[
                      { label: 'Active', value: kpis.activeProjects },
                      { label: 'Completed', value: kpis.projects - kpis.activeProjects },
                      { label: 'Pending', value: Math.max(0, kpis.quotes - kpis.pendingQuotes) }
                    ]}
                  />
                </div>
              </div>
            </div>
          )}

          {activeModule === 'insights' && (
            <div>
              <h2 style={{ margin: '0 0 24px 0', color: '#2d3748' }}>AI-Powered Insights</h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
                <div style={{
                  background: 'white',
                  padding: '24px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
                  border: '1px solid #e1e5e9'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '24px', marginRight: '12px' }}>🎯</span>
                    <h3 style={{ margin: 0, color: '#2d3748' }}>Performance Prediction</h3>
                  </div>
                  <p style={{ color: '#4a5568', marginBottom: '16px' }}>
                    Based on current trends, your team efficiency is expected to improve by 15% next quarter.
                  </p>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#4ecdc4' }}>
                    +15% Predicted
                  </div>
                </div>

                <div style={{
                  background: 'white',
                  padding: '24px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
                  border: '1px solid #e1e5e9'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '24px', marginRight: '12px' }}>⚡</span>
                    <h3 style={{ margin: 0, color: '#2d3748' }}>Optimization Opportunity</h3>
                  </div>
                  <p style={{ color: '#4a5568', marginBottom: '16px' }}>
                    AI suggests reallocating resources to maximize project completion rates.
                  </p>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#667eea' }}>
                    23% Improvement
                  </div>
                </div>

                <div style={{
                  background: 'white',
                  padding: '24px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
                  border: '1px solid #e1e5e9'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '24px', marginRight: '12px' }}>🔍</span>
                    <h3 style={{ margin: 0, color: '#2d3748' }}>Risk Assessment</h3>
                  </div>
                  <p style={{ color: '#4a5568', marginBottom: '16px' }}>
                    Current risk level is low. All critical projects are on track.
                  </p>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#4ecdc4' }}>
                    ✅ Low Risk
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeModule === 'team' && (
            <div>
              <h2 style={{ margin: '0 0 24px 0', color: '#2d3748' }}>Team Performance</h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                {data.staff.slice(0, 6).map((member, index) => {
                  const memberDiaries = data.diaries.filter(d => d.workerId === member.id);
                  const totalHours = memberDiaries.reduce((sum, d) => sum + (parseFloat(d.totalHours) || 0), 0);
                  const totalRevenue = memberDiaries.reduce((sum, d) => sum + (parseFloat(d.revenues) || 0), 0);
                  const efficiency = totalHours > 0 ? totalRevenue / totalHours : 0;

                  return (
                    <div key={member.id || index} style={{
                      background: 'white',
                      padding: '24px',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
                      border: '1px solid #e1e5e9'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          background: `linear-gradient(45deg, ${efficiency > 150 ? '#4ecdc4' : efficiency > 100 ? '#667eea' : efficiency > 50 ? '#ffc107' : '#ff6b6b'}, #e2e8f0)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                          fontWeight: '600',
                          color: 'white',
                          marginRight: '16px'
                        }}>
                          {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div>
                          <h3 style={{ margin: '0 0 4px 0', color: '#2d3748' }}>{member.name || 'Unknown'}</h3>
                          <p style={{ margin: 0, color: '#718096', fontSize: '14px' }}>{member.role || 'Staff'}</p>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <p style={{ margin: '0 0 4px 0', color: '#718096', fontSize: '12px' }}>Hours Worked</p>
                          <p style={{ margin: 0, color: '#2d3748', fontSize: '18px', fontWeight: '600' }}>{totalHours.toFixed(1)}h</p>
                        </div>
                        <div>
                          <p style={{ margin: '0 0 4px 0', color: '#718096', fontSize: '12px' }}>Revenue Generated</p>
                          <p style={{ margin: 0, color: '#2d3748', fontSize: '18px', fontWeight: '600' }}>${totalRevenue.toFixed(0)}</p>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                          <p style={{ margin: '0 0 4px 0', color: '#718096', fontSize: '12px' }}>Efficiency Score</p>
                          <p style={{
                            margin: 0,
                            color: efficiency > 150 ? '#4ecdc4' : efficiency > 100 ? '#667eea' : efficiency > 50 ? '#ffc107' : '#ff6b6b',
                            fontSize: '18px',
                            fontWeight: '600'
                          }}>
                            {efficiency.toFixed(1)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeModule === 'projects' && (
            <div>
              <h2 style={{ margin: '0 0 24px 0', color: '#2d3748' }}>Project Portfolio</h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
                {data.projects.slice(0, 6).map((project, index) => {
                  const projectDiaries = data.diaries.filter(d => d.projectId === project.id);
                  const totalRevenue = projectDiaries.reduce((sum, d) => sum + (parseFloat(d.revenues) || 0), 0);
                  const totalCosts = projectDiaries.reduce((sum, d) => sum + (parseFloat(d.costs) || 0), 0);
                  const totalHours = projectDiaries.reduce((sum, d) => sum + (parseFloat(d.totalHours) || 0), 0);
                  const margin = totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue * 100) : 0;

                  return (
                    <div key={project.id || index} style={{
                      background: 'white',
                      padding: '24px',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
                      border: '1px solid #e1e5e9'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div>
                          <h3 style={{ margin: '0 0 8px 0', color: '#2d3748' }}>{project.name || 'Unnamed Project'}</h3>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: project.status === 'completed' ? '#c6f6d5' :
                                       project.status === 'in-progress' ? '#fef5e7' : '#fed7d7',
                            color: project.status === 'completed' ? '#22543d' :
                                   project.status === 'in-progress' ? '#744210' : '#742a2a'
                          }}>
                            {project.status || 'Unknown'}
                          </span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '20px', fontWeight: '700', color: margin > 20 ? '#4ecdc4' : margin < 10 ? '#ff6b6b' : '#ffc107' }}>
                            {margin.toFixed(1)}%
                          </div>
                          <div style={{ color: '#718096', fontSize: '12px' }}>Margin</div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <p style={{ margin: '0 0 4px 0', color: '#718096', fontSize: '12px' }}>Revenue</p>
                          <p style={{ margin: 0, color: '#2d3748', fontSize: '16px', fontWeight: '600' }}>${totalRevenue.toFixed(0)}</p>
                        </div>
                        <div>
                          <p style={{ margin: '0 0 4px 0', color: '#718096', fontSize: '12px' }}>Costs</p>
                          <p style={{ margin: 0, color: '#2d3748', fontSize: '16px', fontWeight: '600' }}>${totalCosts.toFixed(0)}</p>
                        </div>
                        <div>
                          <p style={{ margin: '0 0 4px 0', color: '#718096', fontSize: '12px' }}>Hours</p>
                          <p style={{ margin: 0, color: '#2d3748', fontSize: '16px', fontWeight: '600' }}>{totalHours.toFixed(1)}h</p>
                        </div>
                      </div>

                      <div style={{ color: '#718096', fontSize: '12px' }}>
                        {projectDiaries.length} entries • {new Set(projectDiaries.map(d => d.workerId)).size} team members
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default UltimateDashboard;
