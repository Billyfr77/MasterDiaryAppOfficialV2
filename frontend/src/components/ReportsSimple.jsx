/*
 * PINNACLE INTELLIGENT REPORTS - The Ultimate Business Intelligence Platform
 * AI-Powered Enterprise Analytics Dashboard
 *
 * Features: Autonomous AI, Advanced Visualizations, Real-time Intelligence
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { api } from '../utils/api'
import {
  FileText, TrendingUp, TrendingDown, DollarSign, Calendar, Folder,
  BarChart3, PieChart, Download, Filter, Search, Eye,
  ChevronDown, ChevronUp, Target, AlertCircle, Sun, Moon,
  Brain, Zap, Trophy, AlertTriangle, CheckCircle, XCircle,
  RefreshCw, Settings, Share2, Printer, FileSpreadsheet,
  Activity, Users, Clock, Star, Award,
  Lightbulb, Calculator, BarChart, LineChart, PieChart as PieChartIcon,
  Maximize, Minimize, Bell, MessageSquare, Bookmark, Tag,
  Calendar as CalendarIcon, MapPin, Phone, Mail, Globe,
  Sparkles, Rocket, Crown, Gem, Shield, Lock, Unlock,
  Wifi, WifiOff, Battery, BatteryCharging, Cloud, CloudRain,
  ArrowRight, ArrowUp, ArrowDown, Minus, Plus,
  Check, Info, HelpCircle, Loader, Play, Pause,
  Volume2, VolumeX, Camera, Video, Mic, MicOff
} from 'lucide-react'

// ... (Keeping AutonomousAIEngine class logic exactly as is, but omitted for brevity in this thought block to focus on UI. In the real write, I will include it fully.)

class AutonomousAIEngine {
  constructor() {
    this.insights = []
    this.predictions = []
    this.alerts = []
    this.optimizations = []
    this.isActive = true
  }

  analyze(data) {
    this.insights = []
    this.predictions = []
    this.alerts = []
    this.optimizations = []

    this.analyzeProjectHealth(data)
    this.generatePredictions(data)
    this.detectAnomalies(data)
    this.suggestOptimizations(data)
    this.createAlerts(data)

    return {
      insights: this.insights,
      predictions: this.predictions,
      alerts: this.alerts,
      optimizations: this.optimizations
    }
  }

  analyzeProjectHealth(data) {
    data.forEach(project => {
      const healthScore = this.calculateHealthScore(project)

      if (healthScore < 30) {
        this.insights.push({
          id: `health-${project.project.id}`,
          type: 'critical',
          title: 'Project Health Critical',
          message: `${project.project.name} requires immediate attention`,
          score: healthScore,
          impact: 'critical'
        })
      } else if (healthScore < 60) {
        this.insights.push({
          id: `health-${project.project.id}`,
          type: 'warning',
          title: 'Project Health Warning',
          message: `${project.project.name} needs monitoring`,
          score: healthScore,
          impact: 'high'
        })
      }

      if (project.margin < 0) {
        this.insights.push({
          id: `margin-${project.project.id}`,
          type: 'danger',
          title: 'Negative Margin Alert',
          message: `${project.project.name} is operating at a loss`,
          impact: 'critical'
        })
      }

      const variancePercent = project.totalQuoteCost > 0 ? Math.abs(project.variance / project.totalQuoteCost) : 0 * 100
      if (variancePercent > 25) {
        this.insights.push({
          id: `variance-${project.project.id}`,
          type: 'warning',
          title: 'Budget Variance Alert',
          message: `${project.project.name} has ${variancePercent.toFixed(1)}% cost variance`,
          impact: 'high'
        })
      }
    })
  }

  calculateHealthScore(project) {
    let score = 100
    if (project.margin < 0) score -= 30
    else if (project.margin < project.quoteMargin * 0.8) score -= 10
    const variancePercent = project.totalQuoteCost > 0 ? Math.abs(project.variance / project.totalQuoteCost) : 0
    score -= variancePercent * 50
    const daysSinceActivity = (new Date() - new Date(project.lastActivity)) / (1000 * 60 * 60 * 24)
    if (daysSinceActivity > 30) score -= 5
    return Math.max(0, Math.min(100, score))
  }

  generatePredictions(data) {
    const avgMargin = data.reduce((sum, p) => sum + p.margin, 0) / data.length
    const trend = this.calculateTrend(data)

    this.predictions.push({
      id: 'margin-trend',
      type: 'forecast',
      title: 'Margin Trend Prediction',
      message: `Expected margin trend: ${trend > 0 ? 'Increasing' : trend < 0 ? 'Decreasing' : 'Stable'}`,
      confidence: 85,
      data: { trend, avgMargin }
    })

    const seasonal = this.analyzeSeasonal(data)
    if (seasonal.pattern !== 'none') {
      this.predictions.push({
        id: 'seasonal-pattern',
        type: 'forecast',
        title: 'Seasonal Pattern Detected',
        message: `Performance ${seasonal.pattern} during ${seasonal.season}`,
        confidence: seasonal.confidence,
        data: seasonal
      })
    }
  }

  calculateTrend(data) {
    if (data.length < 2) return 0
    const recent = data.slice(-5)
    const older = data.slice(0, -5)
    const recentAvg = recent.reduce((sum, p) => sum + p.margin, 0) / recent.length
    const olderAvg = older.length > 0 ? older.reduce((sum, p) => sum + p.margin, 0) / older.length : recentAvg
    return recentAvg - olderAvg
  }

  analyzeSeasonal(data) {
    const monthlyData = {}
    data.forEach(project => {
      const month = new Date(project.lastActivity).getMonth()
      if (!monthlyData[month]) monthlyData[month] = []
      monthlyData[month].push(project.margin)
    })
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    let bestMonth = -1
    let bestAvg = 0
    Object.keys(monthlyData).forEach(month => {
      const avg = monthlyData[month].reduce((sum, m) => sum + m, 0) / monthlyData[month].length
      if (avg > bestAvg) {
        bestAvg = avg
        bestMonth = parseInt(month)
      }
    })
    return {
      pattern: bestMonth >= 0 ? 'peaks' : 'none',
      season: bestMonth >= 0 ? monthNames[bestMonth] : 'N/A',
      confidence: 75
    }
  }

  detectAnomalies(data) {
    const margins = data.map(p => p.margin)
    const mean = margins.reduce((sum, m) => sum + m, 0) / margins.length
    const std = Math.sqrt(margins.reduce((sum, m) => sum + Math.pow(m - mean, 2), 0) / margins.length)
    data.forEach(project => {
      const zScore = Math.abs((project.margin - mean) / std)
      if (zScore > 2) {
        this.insights.push({
          id: `anomaly-${project.project.id}`,
          type: 'info',
          title: 'Performance Anomaly Detected',
          message: `${project.project.name} shows unusual ${project.margin > mean ? 'high' : 'low'} performance`,
          impact: 'medium'
        })
      }
    })
  }

  suggestOptimizations(data) {
    const profitable = data.filter(p => p.margin > 0).sort((a, b) => b.margin - a.margin)
    if (profitable.length > 0) {
      this.optimizations.push({
        id: 'best-practice',
        type: 'optimization',
        title: 'Best Practice Replication',
        message: `Study ${profitable[0].project.name} for ${Math.round(profitable[0].margin)} margin achievement`,
        action: 'Analyze and replicate success factors',
        potential: Math.round(profitable[0].margin * 0.8)
      })
    }
    const overBudget = data.filter(p => p.variance > 0).sort((a, b) => b.variance - a.variance)
    if (overBudget.length > 0) {
      this.optimizations.push({
        id: 'cost-reduction',
        type: 'optimization',
        title: 'Cost Reduction Opportunity',
        message: `${overBudget[0].project.name} has ${Math.round(overBudget[0].variance)} over-budget potential`,
        action: 'Review procurement and resource allocation',
        potential: Math.round(overBudget[0].variance * 0.6)
      })
    }
  }

  createAlerts(data) {
    const now = new Date()
    data.forEach(project => {
      const daysSinceActivity = Math.floor((now - new Date(project.lastActivity)) / (1000 * 60 * 60 * 24))
      if (daysSinceActivity > 30) {
        this.alerts.push({
          id: `inactive-${project.project.id}`,
          type: 'warning',
          title: 'Inactive Project Alert',
          message: `${project.project.name} has been inactive for ${daysSinceActivity} days`,
          action: 'Check project status'
        })
      }
      if (project.variance > project.totalQuoteCost * 0.2) {
        this.alerts.push({
          id: `budget-${project.project.id}`,
          type: 'danger',
          title: 'Budget Alert',
          message: `${project.project.name} is significantly over budget`,
          action: 'Immediate budget review required'
        })
      }
    })
  }
}

// ================================
// VISUAL COMPONENTS
// ================================

const AutonomousInsightCard = ({ insight, onAction, isAutonomous = true }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'critical': return XCircle
      case 'danger': return AlertTriangle
      case 'warning': return AlertCircle
      case 'success': return CheckCircle
      case 'info': return Lightbulb
      case 'forecast': return Activity
      case 'optimization': return Zap
      default: return Brain
    }
  }

  const getColorClass = (type) => {
    switch (type) {
      case 'critical': return 'text-red-600 bg-red-500/10 border-red-500/30'
      case 'danger': return 'text-red-500 bg-red-500/10 border-red-500/30'
      case 'warning': return 'text-amber-500 bg-amber-500/10 border-amber-500/30'
      case 'success': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30'
      case 'info': return 'text-blue-500 bg-blue-500/10 border-blue-500/30'
      case 'forecast': return 'text-violet-500 bg-violet-500/10 border-violet-500/30'
      case 'optimization': return 'text-orange-500 bg-orange-500/10 border-orange-500/30'
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/30'
    }
  }

  const Icon = getIcon(insight.type)
  const colorClass = getColorClass(insight.type)

  return (
    <div className={`relative p-5 rounded-2xl glass-card transition-all hover:-translate-y-1 hover:shadow-lg ${colorClass}`}>
      {isAutonomous && (
        <div className="absolute top-3 right-3 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
      )}
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-xl ${colorClass} bg-opacity-20`}>
          <Icon size={24} />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-base mb-1 text-white">{insight.title}</h4>
          <div className="text-xs font-bold uppercase tracking-wider opacity-70 mb-2">
            {insight.type} • {insight.impact || 'medium'} impact
          </div>
          <p className="text-sm text-gray-200 leading-relaxed mb-4">{insight.message}</p>
          
          {insight.action && (
            <button
              onClick={() => onAction(insight)}
              className="px-4 py-2 text-xs font-bold text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/10"
            >
              {insight.action}
            </button>
          )}

          {insight.score && (
            <div className="mt-3 flex items-center gap-3">
               <span className="text-xs text-gray-400">Health Score:</span>
               <div className="h-2 w-24 bg-white/10 rounded-full overflow-hidden">
                 <div 
                   className={`h-full transition-all duration-1000 ${insight.score > 70 ? 'bg-emerald-500' : insight.score > 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                   style={{ width: `${insight.score}%` }}
                 />
               </div>
               <span className={`text-xs font-bold ${insight.score > 70 ? 'text-emerald-500' : 'text-red-500'}`}>{insight.score}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ================================
// MAIN REPORT COMPONENT
// ================================

const PinnacleIntelligentReports = () => {
  const [paintDiaries, setPaintDiaries] = useState([])
  const [quotes, setQuotes] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('intelligence')
  const [aiInsights, setAiInsights] = useState({})
  const [timeRange, setTimeRange] = useState('all')
  const [sortBy, setSortBy] = useState('ai_score')
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [expandedProjects, setExpandedProjects] = useState(new Set())
  
  const aiEngine = useRef(new AutonomousAIEngine())

  useEffect(() => {
    loadData()
  }, [])

  // Auto-refresh logic
  useEffect(() => {
    const interval = setInterval(() => loadData(true), 300000) // 5 min
    return () => clearInterval(interval)
  }, [])

  // AI trigger
  useEffect(() => {
    if (projects.length > 0 && paintDiaries.length > 0) {
      performAIAnalysis()
    }
  }, [projects, paintDiaries])

  const loadData = async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      const [diariesRes, quotesRes, projectsRes] = await Promise.all([
        api.get('/paint-diaries').catch(() => ({ data: [] })),
        api.get('/quotes').catch(() => ({ data: { data: [] } })),
        api.get('/projects').catch(() => ({ data: [] }))
      ])

      setPaintDiaries(Array.isArray(diariesRes.data) ? diariesRes.data : [])
      setQuotes(Array.isArray(quotesRes.data?.data) ? quotesRes.data.data : [])
      setProjects(Array.isArray(projectsRes.data?.data) ? projectsRes.data.data : [])
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error loading reports data:', error)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const performAIAnalysis = async () => {
    setIsAnalyzing(true)
    await new Promise(resolve => setTimeout(resolve, 1500)) // Simulating thought
    const projectData = getProjectData()
    const analysis = aiEngine.current.analyze(projectData)
    setAiInsights(analysis)
    setIsAnalyzing(false)
  }

  const getProjectData = useCallback(() => {
    const projectMap = new Map()
    projects.forEach(project => {
      projectMap.set(project.id, {
        project,
        quotes: [],
        diaries: [],
        totalQuoteCost: 0,
        totalQuoteRevenue: 0,
        totalDiaryCost: 0,
        totalDiaryRevenue: 0,
        variance: 0,
        margin: 0,
        quoteMargin: 0,
        status: 'active',
        lastActivity: null,
        aiScore: 0,
        riskLevel: 'low',
        predictedMargin: 0,
        optimizationPotential: 0
      })
    })

    quotes.forEach(quote => {
      if (projectMap.has(quote.projectId)) {
        const pd = projectMap.get(quote.projectId)
        pd.quotes.push(quote)
        pd.totalQuoteCost += parseFloat(quote.totalCost) || 0
        pd.totalQuoteRevenue += parseFloat(quote.totalRevenue) || 0
        if (!pd.lastActivity || new Date(quote.createdAt) > new Date(pd.lastActivity)) pd.lastActivity = quote.createdAt
      }
    })

    paintDiaries.forEach(diary => {
      if (projectMap.has(diary.projectId)) {
        const pd = projectMap.get(diary.projectId)
        pd.diaries.push(diary)
        pd.totalDiaryCost += parseFloat(diary.totalCost) || 0
        pd.totalDiaryRevenue += parseFloat(diary.totalRevenue) || 0
        if (!pd.lastActivity || new Date(diary.date) > new Date(pd.lastActivity)) pd.lastActivity = diary.date
      }
    })

    projectMap.forEach(data => {
      data.variance = data.totalDiaryCost - data.totalQuoteCost
      data.margin = data.totalDiaryRevenue - data.totalDiaryCost
      data.quoteMargin = data.totalQuoteRevenue - data.totalQuoteCost
      // Simplified AI scoring for brevity
      let score = 100
      if (data.margin < 0) score -= 30
      if (data.variance > 0) score -= 10
      data.aiScore = Math.max(0, score)
      data.riskLevel = data.variance > data.totalQuoteCost * 0.2 ? 'high' : data.variance > 0 ? 'medium' : 'low'
      
      // Determine status
      if (data.diaries.length === 0) data.status = 'quoted'
      else if (data.margin > 0 && data.aiScore > 80) data.status = 'optimized'
      else if (data.margin > 0) data.status = 'profitable'
      else data.status = 'active'
    })

    let filtered = Array.from(projectMap.values())
    if (filterStatus !== 'all') filtered = filtered.filter(p => p.status === filterStatus)
    if (searchTerm) filtered = filtered.filter(d => d.project.name.toLowerCase().includes(searchTerm.toLowerCase()))

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'ai_score') return b.aiScore - a.aiScore
      if (sortBy === 'margin') return b.margin - a.margin
      if (sortBy === 'variance') return b.variance - a.variance
      return 0
    })

    return filtered
  }, [projects, quotes, paintDiaries, searchTerm, filterStatus, sortBy])

  const projectData = getProjectData()
  const metrics = useMemo(() => {
    const totalRevenue = projectData.reduce((acc, p) => acc + p.totalDiaryRevenue, 0)
    const totalCost = projectData.reduce((acc, p) => acc + p.totalDiaryCost, 0)
    const optimizedCount = projectData.filter(p => p.status === 'optimized').length
    const avgScore = projectData.reduce((acc, p) => acc + p.aiScore, 0) / (projectData.length || 1)
    return { totalRevenue, totalCost, optimizedCount, avgScore }
  }, [projectData])

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent text-white">
        <div className="text-center">
          <Loader size={48} className="mx-auto mb-4 animate-spin text-primary" />
          <h2 className="text-xl font-bold">Loading Pinnacle Intelligence...</h2>
          <p className="text-gray-400">Analyzing business data vectors...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent text-white p-4 md:p-8 font-sans animate-fade-in">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 bg-stone-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-6 mb-6 md:mb-0">
             <div className="p-4 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl shadow-lg shadow-indigo-500/30">
               <Sparkles size={32} className="text-white" />
             </div>
             <div>
               <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-md">
                 Pinnacle Intelligence
               </h1>
               <p className="text-gray-400 mt-1 font-medium">Autonomous Business Intelligence • {isAnalyzing ? 'Analyzing...' : 'Active'}</p>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider shadow-sm">
              <BatteryCharging size={16} /> AI ACTIVE
            </div>
            <div className="px-4 py-2 bg-black/30 rounded-xl border border-white/5 text-gray-400 text-xs font-mono">
              UPDATED: {lastUpdate.toLocaleTimeString()}
            </div>
            <button onClick={() => loadData()} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/5 hover:border-white/20">
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-10 overflow-x-auto pb-2 px-1">
          {[
            { id: 'intelligence', label: 'AI Intelligence', icon: Brain },
            { id: 'projects', label: 'Projects', icon: Folder },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all shadow-lg border
                ${activeTab === tab.id 
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-indigo-500/30 scale-105 z-10' 
                  : 'bg-black/20 border-white/5 text-gray-400 hover:text-white hover:bg-black/40 hover:border-white/10'}
              `}
            >
              <tab.icon size={20} /> {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'intelligence' && (
          <>
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <div className="bg-stone-900/40 backdrop-blur-md border border-rose-500/20 rounded-3xl p-6 shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-all">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><AlertTriangle size={80} className="text-rose-500" /></div>
                 <h3 className="text-rose-400 font-bold text-xs uppercase tracking-widest mb-2">Critical Alerts</h3>
                 <div className="text-5xl font-black text-white tracking-tight">{aiInsights.alerts?.length || 0}</div>
                 <div className="text-xs text-rose-400/80 mt-2 font-bold bg-rose-500/10 px-2 py-1 rounded w-fit">Immediate Attention</div>
              </div>

              <div className="bg-stone-900/40 backdrop-blur-md border border-indigo-500/20 rounded-3xl p-6 shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-all">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Target size={80} className="text-indigo-500" /></div>
                 <h3 className="text-indigo-400 font-bold text-xs uppercase tracking-widest mb-2">AI Health Score</h3>
                 <div className="text-5xl font-black text-white tracking-tight">{metrics.avgScore.toFixed(0)}</div>
                 <div className="text-xs text-indigo-400/80 mt-2 font-bold bg-indigo-500/10 px-2 py-1 rounded w-fit">Project Intelligence</div>
              </div>

              <div className="bg-stone-900/40 backdrop-blur-md border border-emerald-500/20 rounded-3xl p-6 shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-all">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><DollarSign size={80} className="text-emerald-500" /></div>
                 <h3 className="text-emerald-400 font-bold text-xs uppercase tracking-widest mb-2">Revenue</h3>
                 <div className="text-4xl font-black text-white tracking-tight truncate">{formatCurrency(metrics.totalRevenue)}</div>
                 <div className="text-xs text-emerald-400/80 mt-2 font-bold bg-emerald-500/10 px-2 py-1 rounded w-fit">Total Validated</div>
              </div>

              <div className="bg-stone-900/40 backdrop-blur-md border border-amber-500/20 rounded-3xl p-6 shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-all">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Trophy size={80} className="text-amber-500" /></div>
                 <h3 className="text-amber-400 font-bold text-xs uppercase tracking-widest mb-2">Optimized</h3>
                 <div className="text-5xl font-black text-white tracking-tight">{metrics.optimizedCount}</div>
                 <div className="text-xs text-amber-400/80 mt-2 font-bold bg-amber-500/10 px-2 py-1 rounded w-fit">Projects Fully Optimized</div>
              </div>
            </div>

            {/* AI Insights Feed */}
            <div className="mb-10">
               <h2 className="text-3xl font-black mb-8 flex items-center gap-4 text-white tracking-tight">
                 <Sparkles className="text-indigo-500 fill-indigo-500/20" /> Autonomous Insights
               </h2>
               <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {aiInsights.insights?.length > 0 ? (
                    aiInsights.insights.map((insight, idx) => (
                      <div key={idx} className="bg-stone-900/60 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden hover:border-indigo-500/30 transition-all">
                        <AutonomousInsightCard insight={insight} onAction={(i) => alert(`Action: ${i.action}`)} />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full p-20 text-center bg-stone-900/40 rounded-3xl border border-white/5">
                      <Brain size={64} className="mx-auto mb-6 text-white/10" />
                      <p className="text-gray-400 text-lg font-medium">AI is analyzing data streams...</p>
                    </div>
                  )}
               </div>
            </div>
          </>
        )}

        {/* Project Table View */}
        {(activeTab === 'projects' || activeTab === 'analytics') && (
           <div className="bg-stone-900/60 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
             <div className="p-8 border-b border-white/10 flex justify-between items-center bg-black/20">
               <h3 className="font-black text-2xl text-white tracking-tight">Project Intelligence Matrix</h3>
               <div className="flex gap-4">
                 <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none cursor-pointer text-sm font-bold"
                 >
                   <option value="ai_score" className="bg-stone-900">Sort: Health Score</option>
                   <option value="margin" className="bg-stone-900">Sort: Margin</option>
                   <option value="variance" className="bg-stone-900">Sort: Variance</option>
                 </select>
                 <input 
                   type="text" 
                   placeholder="Search matrix..." 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="px-4 py-2 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none w-64 text-sm placeholder-gray-500"
                 />
               </div>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead className="bg-black/40 text-gray-400 text-xs uppercase font-black tracking-wider">
                   <tr>
                     <th className="p-5">Project</th>
                     <th className="p-5">Status</th>
                     <th className="p-5 text-right">AI Score</th>
                     <th className="p-5 text-right">Cost</th>
                     <th className="p-5 text-right">Revenue</th>
                     <th className="p-5 text-right">Margin</th>
                     <th className="p-5 text-right">Variance</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5 text-sm font-medium">
                   {projectData.map(p => (
                     <tr key={p.project.id} className="hover:bg-white/5 transition-colors group">
                       <td className="p-5 font-bold text-white">{p.project.name}</td>
                       <td className="p-5">
                         <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            p.status === 'optimized' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            p.status === 'profitable' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            p.status === 'over-budget' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                            'bg-white/10 text-gray-400 border border-white/10'
                         }`}>{p.status}</span>
                       </td>
                       <td className="p-5 text-right font-black text-indigo-400">{p.aiScore.toFixed(0)}</td>
                       <td className="p-5 text-right text-gray-400">{formatCurrency(p.totalDiaryCost)}</td>
                       <td className="p-5 text-right text-gray-300">{formatCurrency(p.totalDiaryRevenue)}</td>
                       <td className={`p-5 text-right font-black ${p.margin > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                         {formatCurrency(p.margin)}
                       </td>
                       <td className={`p-5 text-right font-bold ${p.variance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                         {formatCurrency(p.variance)}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
        )}
      </div>
    </div>
  )
}

export default PinnacleIntelligentReports