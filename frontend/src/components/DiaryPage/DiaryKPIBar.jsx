import React, { useMemo } from "react"
import Sparkline from "./charts/Sparkline"

/**
 * DiaryKPIBar - Modern KPI dashboard with dark theme and accessibility
 * Displays key metrics with sparklines and responsive design
 */
const MetricCard = ({ label, value, delta, children, colour = "indigo" }) => {
  const deltaClass = delta >= 0 ? "text-green-400" : "text-red-400"
  const bgColor = {
    teal: 'bg-teal-900/50 border-teal-500',
    red: 'bg-red-900/50 border-red-500',
    amber: 'bg-amber-900/50 border-amber-500',
    indigo: 'bg-indigo-900/50 border-indigo-500'
  }[colour] || 'bg-gray-800 border-gray-600'

  return (
    <div role="group" aria-label={`${label} metric`} tabIndex={0}
      className={`p-4 rounded-lg ${bgColor} shadow-lg focus:outline-none focus:ring-2 focus:ring-${colour}-500 transition-all duration-200 transform hover:scale-105 hover:shadow-xl`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-sm text-gray-400 font-medium">{label}</div>
          <div className="mt-1 text-2xl font-bold text-white">{value}</div>
        </div>
        <div className="text-right ml-4">
          <div className={`text-sm font-semibold ${deltaClass}`}>
            {delta >= 0 ? `+${delta}%` : `${delta}%`}
          </div>
          <div className="mt-2 w-20 h-8">
            <Sparkline data={children} stroke={colour} />
          </div>
        </div>
      </div>
    </div>
  )
}

const DiaryKPIBar = ({ diaries = [], loading }) => {
  const metrics = useMemo(() => {
    const totalCosts = diaries.reduce((s, d) => s + Number(d.costs || 0), 0)
    const totalRevenues = diaries.reduce((s, d) => s + Number(d.revenues || 0), 0)
    const profit = totalRevenues - totalCosts
    const margin = totalRevenues ? ((profit / totalRevenues) * 100).toFixed(1) : 0
    const productivity = diaries.length ? (diaries.reduce((s, d) => s + Number(d.totalHours || 0), 0) / Math.max(diaries.length,1)).toFixed(1) : 0
    const trend = diaries.slice(-14).map(d => Number(d.marginPct || margin || 0))
    return { totalCosts, totalRevenues, profit, margin, productivity, trend }
  }, [diaries])

  if (loading) {
    return (
      <div className="flex gap-4" aria-live="polite" aria-label="Loading KPIs">
        {Array.from({length:4}).map((_,i) => (
          <div key={i} className="h-24 bg-gray-700 rounded-md w-full animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" role="region" aria-label="Diary KPIs Summary">
      <MetricCard label="Revenue" value={`$${metrics.totalRevenues.toLocaleString()}`} delta={5} colour="teal">
        {metrics.trend}
      </MetricCard>
      <MetricCard label="Costs" value={`$${metrics.totalCosts.toLocaleString()}`} delta={-2} colour="red">
        {metrics.trend}
      </MetricCard>
      <MetricCard label="Profit" value={`$${metrics.profit.toLocaleString()}`} delta={8} colour="amber">
        {metrics.trend}
      </MetricCard>
      <MetricCard label="Margin %" value={`${metrics.margin}%`} delta={1.2} colour="indigo">
        {metrics.trend}
      </MetricCard>
    </div>
  )
}

export default DiaryKPIBar