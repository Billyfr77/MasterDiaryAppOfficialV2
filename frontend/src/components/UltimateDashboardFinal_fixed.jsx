import React, { useState, useEffect, useRef } from 'react' 
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js' 
import { Line, Bar, Doughnut } from 'react-chartjs-2' 
import * as d3 from 'd3' 
import { api } from '../utils/api' 
import { io } from 'socket.io-client' 
import { 
TrendingUp, TrendingDown, DollarSign, Clock, BarChart3, Sparkles, Volume2, VolumeX, 
Zap, Target, AlertTriangle, CheckCircle, Activity, Users, Wrench, Calendar, 
Settings, Download, RefreshCw, Maximize2, Minimize2, Grid, Layers, Brain, 
Eye, EyeOff, Filter, Search, ChevronDown, ChevronUp, Star, Award, 
Mail, Calendar as CalendarIcon, Clock as ClockIcon, Save, FileText, X 
} from 'lucide-react' 
import AISuggestionsEnhanced from './AISuggestionsEnhanced' 
import PredictiveAnalytics from './PredictiveAnalytics' 
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement) 
const [data, setData] = useState({ 
diaries: [], 
projects: [], 
staff: [], 
equipment: [] 
}) 
const [loading, setLoading] = useState(true) 
const [lastUpdate, setLastUpdate] = useState(new Date()) 
const [socketConnected, setSocketConnected] = useState(false) 
const [widgets, setWidgets] = useState({ 
kpi: { visible: true, size: 'large' }, 
charts: { visible: true, size: 'large' }, 
activities: { visible: true, size: 'medium' }, 
insights: { visible: true, size: 'medium' }, 
predictive: { visible: true, size: 'large' }, 
heatmap: { visible: true, size: 'medium' } 
}) 
const [layoutMode, setLayoutMode] = useState(false) 
const [filters, setFilters] = useState({ 
dateRange: '7d', 
project: 'all', 
staff: 'all' 
}) 
const [soundEnabled, setSoundEnabled] = useState(false) 
const [theme, setTheme] = useState('dark') 
const [pricingReviewOpen, setPricingReviewOpen] = useState(false) 
const [reportSchedule, setReportSchedule] = useState({ 
frequency: 'weekly', 
time: '09:00', 
email: '', 
format: 'pdf' 
}) 
const socketRef = useRef(null) 
const heatmapRef = useRef(null) 
// WebSocket connection 
socketRef.current = io('http://localhost:5000', { 
transports: ['websocket', 'polling'] 
}) 
setSocketConnected(true) 
console.log('Dashboard connected to real-time updates') 
}) 
setSocketConnected(false) 
console.log('Dashboard disconnected from real-time updates') 
}) 
setLastUpdate(new Date()) 
if (soundEnabled) { 
const audio = new Audio('/notification.mp3') 
} 
}) 
if (socketRef.current) { 
socketRef.current.disconnect() 
} 
} 
}, [soundEnabled]) 
// Initial data fetch 
setLoading(true) 
try { 
const [diariesRes, projectsRes, staffRes, equipmentRes] = await Promise.all([ 
api.get('/diaries'), 
api.get('/projects'), 
api.get('/staff'), 
api.get('/equipment') 
]) 
const newData = { 
diaries: diariesRes.data, 
projects: projectsRes.data.data 
staff: staffRes.data.data 
equipment: equipmentRes.data.data 
} 
setData(newData) 
setLastUpdate(new Date()) 
if (socketRef.current) { 
socketRef.current.emit('dashboard-data', newData) 
} 
} catch (err) { 
console.error('Error fetching dashboard data:', err) 
} finally { 
setLoading(false) 
} 
} 
fetchData() 
const interval = setInterval(fetchData, 30000) 
}, []) 
// Advanced metrics calculation 
const { diaries, projects, staff, equipment } = data 
const totalMargin = totalRevenues - totalCosts 
const projectCount = projects.length 
const lastWeek = new Date() 
lastWeek.setDate(lastWeek.getDate() - 7) 
return { 
totalHours, 
totalCosts, 
totalRevenues, 
totalMargin, 
avgMargin, 
laborEfficiency, 
projectCount, 
activeProjects, 
staffUtilization, 
weeklyGrowth, 
diaryCount: diaries.length, 
staffCount: staff.length, 
equipmentCount: equipment.length 
} 
}, [data]) 
// D3.js Heatmap 
if (heatmapRef.current 
createHeatmap() 
} 
}, [data.diaries, filters]) 
const svg = d3.select(heatmapRef.current) 
svg.selectAll("*").remove() 
const margin = { top: 20, right: 20, bottom: 60, left: 60 } 
const width = 600 - margin.left - margin.right 
const height = 300 - margin.top - margin.bottom 
const heatmapData = d3.rollups( 
data.diaries, 
count: v.length 
}), 
) 
const colorScale = d3.scaleSequential(d3.interpolateRdYlGn) 
const x = d3.scaleBand().domain(dates).range([0, width]).padding(0.1) 
const y = d3.scaleBand().domain(projects).range([0, height]).padding(0.1) 
svg.attr("width", width + margin.left + margin.right) 
.attr("height", height + margin.top + margin.bottom) 
const g = svg.append("g") 
.attr("transform", `translate(${margin.left},${margin.top})`) 
const value = cellData ? cellData[1].revenue : 0 
g.append("rect") 
.attr("x", x(date)) 
.attr("y", y(project)) 
.attr("width", x.bandwidth()) 
.attr("height", y.bandwidth()) 
.attr("stroke", "#555") 
.attr("stroke-width", 1) 
.on("mouseover", function() { 
d3.select(this).attr("stroke", "#fff").attr("stroke-width", 2) 
}) 
.on("mouseout", function() { 
d3.select(this).attr("stroke", "#555").attr("stroke-width", 1) 
}) 
.append("title") 
.text(`${project} - ${date}: $${value.toLocaleString()}`) 
}) 
}) 
g.append("g") 
.attr("transform", `translate(0,${height})`) 
.selectAll("text") 
.style("text-anchor", "end") 
.attr("dx", "-.8em") 
.attr("dy", ".15em") 
.attr("transform", "rotate(-65)") 
g.append("g") 
.call(d3.axisLeft(y)) 
} 
// Widget management 
...prev, 
[widgetName]: { 
...prev[widgetName], 
visible: !prev[widgetName].visible 
} 
})) 
} 
...prev, 
[widgetName]: { 
...prev[widgetName], 
size: newSize 
} 
})) 
} 
// Pricing strategy review 
setPricingReviewOpen(true) 
} 
setPricingReviewOpen(false) 
} 
// Report scheduling 
try { 
// This would typically send to backend for scheduling 
alert(`Report scheduled!\nFrequency: ${reportSchedule.frequency}\nTime: ${reportSchedule.time}\nFormat: ${reportSchedule.format}`) 
console.log('Report scheduled:', reportSchedule) 
} catch (err) { 
console.error('Error scheduling report:', err) 
} 
} 
// Export functions 
alert('PDF Export feature - Would generate comprehensive dashboard PDF report') 
console.log('Exporting to PDF...') 
} 
alert('Excel Export feature - Would generate spreadsheet with all dashboard data') 
console.log('Exporting to Excel...') 
} 
if (loading) { 
return ( 
height: '100vh', 
display: 'flex', 
flexDirection: 'column', 
alignItems: 'center', 
justifyContent: 'center', 
background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)', 
color: 'white', 
fontFamily: "'Inter', sans-serif" 
width: '60px', 
height: '60px', 
border: '6px solid rgba(102, 126, 234, 0.3)', 
borderTop: '6px solid #667eea', 
borderRadius: '50%', 
animation: 'spin 1s linear infinite', 
marginBottom: 'var(--spacing-md)' 
marginTop: 'var(--spacing-md)', 
display: 'flex', 
alignItems: 'center', 
gap: 'var(--spacing-sm)', 
color: socketConnected ? '#4ecdc4' : '#ff6b6b' 
) 
} 
return ( 
minHeight: '100vh', 
background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)', 
position: 'relative', 
fontFamily: "'Inter', sans-serif", 
padding: 'var(--spacing-xl)', 
overflow: 'hidden' 
{/* Enhanced Animations */} 
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } 
@keyframes glow { from { box-shadow: 0 0 20px rgba(102, 126, 234, 0.5); } to { box-shadow: 0 0 40px rgba(102, 126, 234, 1); } } 
@keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } } 
@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } } 
@keyframes slideIn { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } 
@keyframes fadeInUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } } 
@keyframes realTimePulse { 
0%, 100% { box-shadow: 0 0 5px rgba(78, 205, 196, 0.5); } 
50% { box-shadow: 0 0 20px rgba(78, 205, 196, 1); } 
} 
{/* Background Effects */} 
position: 'absolute', 
top: 0, 
left: 0, 
right: 0, 
bottom: 0, 
background: 'url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3
backgroundSize: 'cover', 
opacity: 0.03, 
zIndex: -2 
position: 'absolute', 
top: 0, 
left: 0, 
right: 0, 
bottom: 0, 
background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.2) 0%, transparent 50%)', 
zIndex: -1 
{/* Dashboard Header */} 
display: 'flex', 
justifyContent: 'space-between', 
alignItems: 'center', 
marginBottom: 'var(--spacing-xl)', 
paddingBottom: 'var(--spacing-md)', 
borderBottom: '2px solid #667eea', 
position: 'relative' 
position: 'absolute', 
top: 0, 
left: 0, 
width: '100%', 
height: '2px', 
background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb)', 
animation: 'glow 2s ease-in-out infinite alternate' 
margin: 0, 
color: '#ffffff', 
fontFamily: "'Poppins', sans-serif", 
fontWeight: 700, 
textShadow: '0 0 20px rgba(102, 126, 234, 0.5)', 
fontSize: '2.5em', 
animation: 'float 3s ease-in-out infinite' 
Ultimate Dashboard 
display: 'flex', 
alignItems: 'center', 
gap: 'var(--spacing-md)', 
marginTop: 'var(--spacing-xs)' 
display: 'flex', 
alignItems: 'center', 
gap: 'var(--spacing-xs)', 
color: socketConnected ? '#4ecdc4' : '#ff6b6b', 
fontSize: '0.9em' 
Last updated: {lastUpdate.toLocaleTimeString()} 
style={{ 
padding: 'var(--spacing-sm) var(--spacing-md)', 
background: layoutMode ? 'rgba(102, 126, 234, 0.8)' : 'rgba(255,255,255, 0.1)', 
border: '1px solid rgba(102, 126, 234, 0.3)', 
borderRadius: '8px', 
color: 'white', 
cursor: 'pointer', 
display: 'flex', 
alignItems: 'center', 
gap: 'var(--spacing-xs)', 
fontSize: '0.9em' 
}} 
{layoutMode ? 'Exit Customize' : 'Customize'} 
onClick={fetchData} 
style={{ 
padding: 'var(--spacing-sm)', 
background: 'rgba(78, 205, 196, 0.2)', 
border: '1px solid #4ecdc4', 
borderRadius: '50%', 
color: '#4ecdc4', 
cursor: 'pointer' 
}} 
display: 'flex', 
alignItems: 'center', 
gap: 'var(--spacing-xs)', 
color: '#ccc', 
fontSize: '0.9em' 
{/* Filters Bar */} 
background: 'rgba(26, 26, 46, 0.95)', 
borderRadius: '15px', 
padding: 'var(--spacing-md)', 
marginBottom: 'var(--spacing-xl)', 
display: 'flex', 
gap: 'var(--spacing-md)', 
alignItems: 'center', 
flexWrap: 'wrap', 
border: '1px solid rgba(102, 126, 234, 0.3)' 
value={filters.dateRange} 
style={{ 
padding: 'var(--spacing-xs) var(--spacing-sm)', 
background: 'rgba(255,255,255,0.1)', 
border: '1px solid rgba(102, 126, 234, 0.3)', 
borderRadius: '6px', 
color: 'white' 
}} 
value={filters.project} 
style={{ 
padding: 'var(--spacing-xs) var(--spacing-sm)', 
background: 'rgba(255,255,255,0.1)', 
border: '1px solid rgba(102, 126, 234, 0.3)', 
borderRadius: '6px', 
color: 'white' 
}} 
))} 
value={filters.staff} 
style={{ 
padding: 'var(--spacing-xs) var(--spacing-sm)', 
background: 'rgba(255,255,255,0.1)', 
border: '1px solid rgba(102, 126, 234, 0.3)', 
borderRadius: '6px', 
color: 'white' 
}} 
))} 
{/* Widgets Grid */} 
display: 'grid', 
gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
gap: 'var(--spacing-xl)', 
marginBottom: 'var(--spacing-xl)' 
{/* KPI Cards Widget */} 
gridColumn: widgets.kpi.size === 'large' ? 'span 2' : 'span 1', 
background: 'rgba(26, 26, 46, 0.95)', 
borderRadius: '20px', 
padding: 'var(--spacing-lg)', 
boxShadow: '0 8px 32px rgba(0,0,0,0.3)', 
backdropFilter: 'blur(20px)', 
border: '1px solid rgba(102, 126, 234, 0.3)', 
position: 'relative', 
animation: 'fadeInUp 0.6s ease-out' 
position: 'absolute', 
top: '10px', 
right: '10px', 
display: 'flex', 
gap: 'var(--spacing-xs)', 
zIndex: 10 
value={widgets.kpi.size} 
style={{ fontSize: '12px', padding: '2px' }} 
)} 
background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))', 
padding: 'var(--spacing-md)', 
borderRadius: '12px', 
textAlign: 'center', 
border: '1px solid rgba(102, 126, 234, 0.3)' 
+{metrics.weeklyGrowth}/day avg 
background: 'linear-gradient(135deg, rgba(78, 205, 196, 0.2), rgba(70, 160, 140, 0.2))', 
padding: 'var(--spacing-md)', 
borderRadius: '12px', 
textAlign: 'center', 
border: '1px solid rgba(78, 205, 196, 0.3)' 
background: 'linear-gradient(135deg, rgba(255, 193, 77, 0.2), rgba(255, 160, 0, 0.2))', 
padding: 'var(--spacing-md)', 
borderRadius: '12px', 
textAlign: 'center', 
border: '1px solid rgba(255, 193, 77, 0.3)' 
${metrics.laborEfficiency}/hr efficiency 
background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(220, 53, 69, 0.2))', 
padding: 'var(--spacing-md)', 
borderRadius: '12px', 
textAlign: 'center', 
border: '1px solid rgba(255, 107, 107, 0.3)' 
{metrics.activeProjects}/{metrics.projectCount} active projects 
)} 
{/* Charts Widget */} 
gridColumn: widgets.charts.size === 'large' ? 'span 2' : 'span 1', 
background: 'rgba(26, 26, 46, 0.95)', 
borderRadius: '20px', 
padding: 'var(--spacing-lg)', 
boxShadow: '0 8px 32px rgba(0,0,0,0.3)', 
backdropFilter: 'blur(20px)', 
border: '1px solid rgba(102, 126, 234, 0.3)', 
position: 'relative', 
animation: 'fadeInUp 0.8s ease-out' 
position: 'absolute', 
top: '10px', 
right: '10px', 
display: 'flex', 
gap: 'var(--spacing-xs)', 
zIndex: 10 
value={widgets.charts.size} 
style={{ fontSize: '12px', padding: '2px' }} 
)} 
data={{ 
labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], 
datasets: [ 
{ 
label: 'Revenue ($)', 
data: [1200, 1500, 1800, 2100, 1900, 2200, 2500], 
borderColor: '#667eea', 
backgroundColor: 'rgba(102, 126, 234, 0.1)', 
tension: 0.4, 
pointBackgroundColor: '#667eea' 
}, 
{ 
label: 'Margin (%)', 
data: [15, 18, 22, 20, 25, 23, 28], 
borderColor: '#4ecdc4', 
backgroundColor: 'rgba(78, 205, 196, 0.1)', 
yAxisID: 'y1', 
tension: 0.4, 
pointBackgroundColor: '#4ecdc4' 
} 
] 
}} 
options={{ 
responsive: true, 
maintainAspectRatio: false, 
plugins: { 
legend: { labels: { color: 'white' } } 
}, 
scales: { 
x: { ticks: { color: 'white' }, grid: { color: 'rgba(255,255,255,0.1)' } }, 
y: { 
ticks: { color: 'white' }, 
grid: { color: 'rgba(255,255,255,0.1)' }, 
title: { display: true, text: 'Revenue ($)', color: 'white' } 
}, 
y1: { 
ticks: { color: 'white' }, 
position: 'right', 
title: { display: true, text: 'Margin (%)', color: 'white' }, 
grid: { drawOnChartArea: false } 
} 
} 
}} 
)} 
{/* AI Insights Widget */} 
gridColumn: widgets.insights.size === 'large' ? 'span 2' : 'span 1', 
background: 'rgba(26, 26, 46, 0.95)', 
borderRadius: '20px', 
padding: 'var(--spacing-lg)', 
boxShadow: '0 8px 32px rgba(0,0,0,0.3)', 
backdropFilter: 'blur(20px)', 
border: '1px solid rgba(102, 126, 234, 0.3)', 
position: 'relative', 
animation: 'fadeInUp 1s ease-out' 
position: 'absolute', 
top: '10px', 
right: '10px', 
display: 'flex', 
gap: 'var(--spacing-xs)', 
zIndex: 10 
value={widgets.insights.size} 
style={{ fontSize: '12px', padding: '2px' }} 
)} 
quoteData={{ 
nodes: data.diaries, 
staff: data.staff, 
marginPct: metrics.avgMargin, 
diaries: data.diaries 
}} 
console.log('Applying suggestion:', suggestion) 
}} 
onReviewPricing={handlePricingReview} 
)} 
{/* Predictive Analytics Widget */} 
gridColumn: widgets.predictive.size === 'large' ? 'span 2' : 'span 1', 
background: 'rgba(26, 26, 46, 0.95)', 
borderRadius: '20px', 
padding: 'var(--spacing-lg)', 
boxShadow: '0 8px 32px rgba(0,0,0,0.3)', 
backdropFilter: 'blur(20px)', 
border: '1px solid rgba(102, 126, 234, 0.3)', 
position: 'relative', 
animation: 'fadeInUp 1.2s ease-out' 
position: 'absolute', 
top: '10px', 
right: '10px', 
display: 'flex', 
gap: 'var(--spacing-xs)', 
zIndex: 10 
value={widgets.predictive.size} 
style={{ fontSize: '12px', padding: '2px' }} 
)} 
projectData={{ 
staffCount: metrics.staffCount, 
optimalStaff: Math.ceil(metrics.diaryCount / 10), 
materialCost: metrics.totalCosts * 0.6, 
budget: metrics.totalRevenues, 
weatherSensitivity: 7, 
complexity: 1.2 
}} 
historicalData={[ 
{ duration: 45, actualCost: 15000, estimatedCost: 14000, profitMargin: 22 }, 
{ duration: 38, actualCost: 12000, estimatedCost: 13000, profitMargin: 18 }, 
{ duration: 52, actualCost: 18000, estimatedCost: 17000, profitMargin: 25 } 
]} 
)} 
{/* Heatmap Widget */} 
gridColumn: widgets.heatmap.size === 'large' ? 'span 2' : 'span 1', 
background: 'rgba(26, 26, 46, 0.95)', 
borderRadius: '20px', 
padding: 'var(--spacing-lg)', 
boxShadow: '0 8px 32px rgba(0,0,0,0.3)', 
backdropFilter: 'blur(20px)', 
border: '1px solid rgba(102, 126, 234, 0.3)', 
position: 'relative', 
animation: 'fadeInUp 1.4s ease-out' 
position: 'absolute', 
top: '10px', 
right: '10px', 
display: 'flex', 
gap: 'var(--spacing-xs)', 
zIndex: 10 
value={widgets.heatmap.size} 
style={{ fontSize: '12px', padding: '2px' }} 
)} 
)} 
{/* Recent Activities Widget */} 
gridColumn: widgets.activities.size === 'large' ? 'span 2' : 'span 1', 
background: 'rgba(26, 26, 46, 0.95)', 
borderRadius: '20px', 
padding: 'var(--spacing-lg)', 
boxShadow: '0 8px 32px rgba(0,0,0,0.3)', 
backdropFilter: 'blur(20px)', 
border: '1px solid rgba(102, 126, 234, 0.3)', 
position: 'relative', 
animation: 'fadeInUp 1.6s ease-out' 
position: 'absolute', 
top: '10px', 
right: '10px', 
display: 'flex', 
gap: 'var(--spacing-xs)', 
zIndex: 10 
value={widgets.activities.size} 
style={{ fontSize: '12px', padding: '2px' }} 
)} 
padding: 'var(--spacing-md)', 
border: '1px solid rgba(102, 126, 234, 0.3)', 
borderRadius: '10px', 
background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))', 
transition: 'all 0.3s ease', 
cursor: 'pointer' 
}} 
e.currentTarget.style.transform = 'translateY(-2px)' 
e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)' 
}} 
e.currentTarget.style.transform = 'translateY(0)' 
e.currentTarget.style.boxShadow = 'none' 
}} 
{d.Staff?.name} on {d.Project?.name} 
{d.date} • {d.totalHours}h worked 
${d.revenues} 
fontSize: '0.9em' 
{d.marginPct.toFixed(1)}% 
))} 
)} 
{/* Export Controls */} 
background: 'rgba(26, 26, 46, 0.95)', 
borderRadius: '15px', 
padding: 'var(--spacing-md)', 
display: 'flex', 
gap: 'var(--spacing-md)', 
justifyContent: 'center', 
alignItems: 'center', 
border: '1px solid rgba(102, 126, 234, 0.3)' 
padding: 'var(--spacing-sm) var(--spacing-md)', 
background: 'linear-gradient(135deg, #28a745, #20c997)', 
border: 'none', 
borderRadius: '8px', 
color: 'white', 
cursor: 'pointer', 
display: 'flex', 
alignItems: 'center', 
gap: 'var(--spacing-xs)', 
fontSize: '0.9em' 
Export PDF 
padding: 'var(--spacing-sm) var(--spacing-md)', 
background: 'linear-gradient(135deg, #007bff, #0056b3)', 
border: 'none', 
borderRadius: '8px', 
color: 'white', 
cursor: 'pointer', 
display: 'flex', 
alignItems: 'center', 
gap: 'var(--spacing-xs)', 
fontSize: '0.9em' 
Export Excel 
padding: 'var(--spacing-sm) var(--spacing-md)', 
background: 'linear-gradient(135deg, #6f42c1, #5a32a3)', 
border: 'none', 
borderRadius: '8px', 
color: 'white', 
cursor: 'pointer', 
display: 'flex', 
alignItems: 'center', 
gap: 'var(--spacing-xs)', 
fontSize: '0.9em' 
Schedule Reports 
{/* Pricing Review Modal */} 
position: 'fixed', 
top: 0, 
left: 0, 
right: 0, 
bottom: 0, 
background: 'rgba(0,0,0,0.8)', 
display: 'flex', 
alignItems: 'center', 
justifyContent: 'center', 
zIndex: 1000 
background: 'rgba(26, 26, 46, 0.95)', 
borderRadius: '20px', 
padding: 'var(--spacing-xl)', 
maxWidth: '600px', 
width: '90%', 
maxHeight: '80vh', 
overflow: 'auto', 
border: '1px solid rgba(102, 126, 234, 0.3)' 
📊 Pricing Strategy Review 
onClick={closePricingReview} 
style={{ 
background: 'rgba(255,107,107,0.2)', 
border: '1px solid #ff6b6b', 
borderRadius: '50%', 
width: '40px', 
height: '40px', 
color: '#ff6b6b', 
cursor: 'pointer', 
display: 'flex', 
alignItems: 'center', 
justifyContent: 'center' 
}} 
✕ 
{metrics.avgMargin.toFixed(1)}% 
)} 
)} 
)} 
{/* Report Scheduling Modal */} 
position: 'fixed', 
top: 0, 
left: 0, 
right: 0, 
bottom: 0, 
background: 'rgba(0,0,0,0.8)', 
display: 'flex', 
alignItems: 'center', 
justifyContent: 'center', 
zIndex: 1000 
background: 'rgba(26, 26, 46, 0.95)', 
borderRadius: '20px', 
padding: 'var(--spacing-xl)', 
maxWidth: '500px', 
width: '90%', 
border: '1px solid rgba(102, 126, 234, 0.3)' 
📅 Schedule Reports 
style={{ 
background: 'rgba(255,107,107,0.2)', 
border: '1px solid #ff6b6b', 
borderRadius: '50%', 
width: '40px', 
height: '40px', 
color: '#ff6b6b', 
cursor: 'pointer', 
display: 'flex', 
alignItems: 'center', 
justifyContent: 'center' 
}} 
✕ 
value={reportSchedule.frequency} 
style={{ 
width: '100%', 
padding: 'var(--spacing-sm)', 
background: 'rgba(255,255,255,0.1)', 
border: '1px solid rgba(102, 126, 234, 0.3)', 
borderRadius: '8px', 
color: 'white' 
}} 
type="time" 
value={reportSchedule.time} 
style={{ 
width: '100%', 
padding: 'var(--spacing-sm)', 
background: 'rgba(255,255,255,0.1)', 
border: '1px solid rgba(102, 126, 234, 0.3)', 
borderRadius: '8px', 
color: 'white' 
}} 
type="email" 
placeholder="your@email.com" 
value={reportSchedule.email} 
style={{ 
width: '100%', 
padding: 'var(--spacing-sm)', 
background: 'rgba(255,255,255,0.1)', 
border: '1px solid rgba(102, 126, 234, 0.3)', 
borderRadius: '8px', 
color: 'white' 
}} 
value={reportSchedule.format} 
style={{ 
width: '100%', 
padding: 'var(--spacing-sm)', 
background: 'rgba(255,255,255,0.1)', 
border: '1px solid rgba(102, 126, 234, 0.3)', 
borderRadius: '8px', 
color: 'white' 
}} 
onClick={scheduleReport} 
style={{ 
marginTop: 'var(--spacing-md)', 
padding: 'var(--spacing-md)', 
background: 'linear-gradient(135deg, #667eea, #764ba2)', 
color: 'white', 
border: 'none', 
borderRadius: '10px', 
cursor: 'pointer', 
fontSize: '1em', 
fontWeight: '600', 
display: 'flex', 
alignItems: 'center', 
justifyContent: 'center', 
gap: 'var(--spacing-sm)' 
}} 
Schedule Report 
)} 
) 
} 
export default UltimateDashboardFinal 
