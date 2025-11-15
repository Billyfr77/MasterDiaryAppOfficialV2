import React, { useEffect, useState } from 'react'
import { Clock, DollarSign, TrendingUp, Users, Wrench } from 'lucide-react'
import SummaryCard from './DiarySummary/SummaryCard'

/**
 * DiarySummary
 * - If `data` prop is supplied it renders directly.
 * - Otherwise it attempts to fetch live data from backend:
 *    http://localhost:5003/api/summary (primary)
 *    http://localhost:5000/api/summary (fallback)
 */
const DiarySummary = ({ data: propData }) => {
  const [data, setData] = useState(propData || null)
  const [loading, setLoading] = useState(!propData)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (propData) return

    let mounted = true
    const tryFetch = async () => {
      setLoading(true)
      setError(null)
      const endpoints = [
        'http://localhost:5003/api/summary',
        'http://localhost:5000/api/summary'
      ]
      for (const url of endpoints) {
        try {
          const res = await fetch(url, { credentials: 'include' })
          if (!res.ok) throw new Error(`Status ${res.status}`)
          const json = await res.json()
          if (mounted) {
            setData(json)
            setLoading(false)
          }
          return
        } catch (err) {
          // try next
          console.warn(`Summary fetch failed for ${url}:`, err.message)
        }
      }
      // fallback sample
      if (mounted) {
        setError('Unable to load live summary; showing fallback sample.')
        setData({
          session: { date: '2025-11-15', project: 'Site A', worker: 'Alice', start: '08:00', end: '16:00', durationHrs: 8 },
          financial: { costs: 1200, revenues: 2000, profit: 800 },
          performance: { productivityScore: 78, efficiencyPct: 85, marginPct: 40 },
          resources: { staffCount: 4, equipmentCount: 2, materialsCount: 12, topItems: [{ name: 'Cement', qty: 20 }] },
          tools: [{ name: 'Export PDF', href: '#' }]
        })
        setLoading(false)
      }
    }
    tryFetch()
    return () => { mounted = false }
  }, [propData])

  const formatCurrency = (n) => {
    if (n == null) return '-'
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(n))
    } catch {
      return `$${n}`
    }
  }

  if (loading) {
    return <div className="p-6 text-white">Loading summary...</div>
  }

  return (
    <section className="w-full p-4">
      {error && (
        <div style={{ marginBottom: 12, color: '#ffd93d' }}>
          {error}
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Summary</h2>
        <div className="text-sm text-white/60">Updated: {new Date().toLocaleString()}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <SummaryCard title="Session Details" icon={Clock} accent="indigo">
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-sm text-white/80">Date</span><span className="text-sm text-white/90">{data.session?.date || '—'}</span></div>
            <div className="flex justify-between"><span className="text-sm text-white/80">Project</span><span className="text-sm text-white/90">{data.session?.project || '—'}</span></div>
            <div className="flex justify-between"><span className="text-sm text-white/80">Worker</span><span className="text-sm text-white/90">{data.session?.worker || '—'}</span></div>
            <div className="flex justify-between"><span className="text-sm text-white/80">Start → End</span><span className="text-sm text-white/90">{data.session?.start || '—'} → {data.session?.end || '—'}</span></div>
            <div className="flex justify-between"><span className="text-sm text-white/80">Duration</span><span className="text-sm text-white/90">{data.session?.durationHrs ?? '—'}h</span></div>
          </div>
        </SummaryCard>

        <SummaryCard title="Financial Snapshot" icon={DollarSign} accent="teal">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/80">Costs</span>
              <span className="text-lg font-semibold text-white/100">{formatCurrency(data.financial?.costs ?? 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/80">Revenues</span>
              <span className="text-lg font-semibold text-white/100">{formatCurrency(data.financial?.revenues ?? 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/80">Profit</span>
              <span className="text-lg font-semibold text-white/100">{formatCurrency(data.financial?.profit ?? ((data.financial?.revenues || 0) - (data.financial?.costs || 0)))}</span>
            </div>
            <div className="mt-3">
              <div className="h-2 bg-white/6 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-gradient-to-r from-teal-400 to-indigo-500"
                  style={{ width: `${Math.min(100, Math.max(0, ((data.performance?.marginPct || 0) + 50)))}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-white/60">Margin: {(data.performance?.marginPct ?? 0)}%</div>
            </div>
          </div>
        </SummaryCard>

        <SummaryCard title="Performance Metrics" icon={TrendingUp} accent="amber">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-white/80">Productivity</span>
              <span className="text-sm font-semibold text-white/90">{data.performance?.productivityScore ?? 0}/100</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-white/80">Efficiency</span>
              <span className="text-sm font-semibold text-white/90">{(data.performance?.efficiencyPct ?? 0)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-white/80">Margin</span>
              <span className="text-sm font-semibold text-white/90">{(data.performance?.marginPct ?? 0)}%</span>
            </div>
            <div className="mt-2">
              <div className="w-full bg-white/6 h-2 rounded-full">
                <div className="h-2 bg-gradient-to-r from-amber-400 to-pink-500" style={{ width: `${Math.min(100, data.performance?.productivityScore || 0)}%` }} />
              </div>
            </div>
          </div>
        </SummaryCard>

        <SummaryCard title="Resources" icon={Users} accent="pink">
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-sm text-white/80">Staff</span><span className="text-sm text-white/90">{data.resources?.staffCount ?? 0}</span></div>
            <div className="flex justify-between"><span className="text-sm text-white/80">Equipment</span><span className="text-sm text-white/90">{data.resources?.equipmentCount ?? 0}</span></div>
            <div className="flex justify-between"><span className="text-sm text-white/80">Materials</span><span className="text-sm text-white/90">{data.resources?.materialsCount ?? 0}</span></div>

            {data.resources?.topItems && data.resources.topItems.length > 0 && (
              <ul className="mt-2 space-y-1">
                {data.resources.topItems.slice(0,4).map((it, idx) => (
                  <li key={idx} className="text-sm text-white/70 flex justify-between">
                    <span>{it.name}</span>
                    <span className="text-white/90">{it.qty ?? it.count ?? ''}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </SummaryCard>

        <SummaryCard title="Tools & Shortcuts" icon={Wrench} accent="indigo">
          <div className="space-y-3">
            {(!data.tools || data.tools.length === 0) && <div className="text-sm text-white/70">No tools configured</div>}
            <div className="flex flex-col gap-2">
              {data.tools?.slice(0,5).map((t, i) => (
                <a
                  key={i}
                  href={t.href || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-between gap-3 px-3 py-2 rounded-md bg-white/3 hover:bg-white/6 text-sm text-white/90 transition"
                >
                  <span className="truncate">{t.name}</span>
                  <span className="text-xs text-white/60">Open</span>
                </a>
              ))}
            </div>
          </div>
        </SummaryCard>
      </div>
    </section>
  )
}

export default DiarySummaryimport React, { useEffect, useState } from 'react'
import { Clock, DollarSign, TrendingUp, Users, Wrench } from 'lucide-react'
import SummaryCard from './DiarySummary/SummaryCard'

/**
 * DiarySummary
 * - If `data` prop is supplied it renders directly.
 * - Otherwise it attempts to fetch live data from backend:
 *    http://localhost:5003/api/summary (primary)
 *    http://localhost:5000/api/summary (fallback)
 */
const DiarySummary = ({ data: propData }) => {
  const [data, setData] = useState(propData || null)
  const [loading, setLoading] = useState(!propData)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (propData) return

    let mounted = true
    const tryFetch = async () => {
      setLoading(true)
      setError(null)
      const endpoints = [
        'http://localhost:5003/api/summary',
        'http://localhost:5000/api/summary'
      ]
      for (const url of endpoints) {
        try {
          const res = await fetch(url, { credentials: 'include' })
          if (!res.ok) throw new Error(`Status ${res.status}`)
          const json = await res.json()
          if (mounted) {
            setData(json)
            setLoading(false)
          }
          return
        } catch (err) {
          // try next
          console.warn(`Summary fetch failed for ${url}:`, err.message)
        }
      }
      // fallback sample
      if (mounted) {
        setError('Unable to load live summary; showing fallback sample.')
        setData({
          session: { date: '2025-11-15', project: 'Site A', worker: 'Alice', start: '08:00', end: '16:00', durationHrs: 8 },
          financial: { costs: 1200, revenues: 2000, profit: 800 },
          performance: { productivityScore: 78, efficiencyPct: 85, marginPct: 40 },
          resources: { staffCount: 4, equipmentCount: 2, materialsCount: 12, topItems: [{ name: 'Cement', qty: 20 }] },
          tools: [{ name: 'Export PDF', href: '#' }]
        })
        setLoading(false)
      }
    }
    tryFetch()
    return () => { mounted = false }
  }, [propData])

  const formatCurrency = (n) => {
    if (n == null) return '-'
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(n))
    } catch {
      return `$${n}`
    }
  }

  if (loading) {
    return <div className="p-6 text-white">Loading summary...</div>
  }

  return (
    <section className="w-full p-4">
      {error && (
        <div style={{ marginBottom: 12, color: '#ffd93d' }}>
          {error}
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Summary</h2>
        <div className="text-sm text-white/60">Updated: {new Date().toLocaleString()}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <SummaryCard title="Session Details" icon={Clock} accent="indigo">
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-sm text-white/80">Date</span><span className="text-sm text-white/90">{data.session?.date || '—'}</span></div>
            <div className="flex justify-between"><span className="text-sm text-white/80">Project</span><span className="text-sm text-white/90">{data.session?.project || '—'}</span></div>
            <div className="flex justify-between"><span className="text-sm text-white/80">Worker</span><span className="text-sm text-white/90">{data.session?.worker || '—'}</span></div>
            <div className="flex justify-between"><span className="text-sm text-white/80">Start → End</span><span className="text-sm text-white/90">{data.session?.start || '—'} → {data.session?.end || '—'}</span></div>
            <div className="flex justify-between"><span className="text-sm text-white/80">Duration</span><span className="text-sm text-white/90">{data.session?.durationHrs ?? '—'}h</span></div>
          </div>
        </SummaryCard>

        <SummaryCard title="Financial Snapshot" icon={DollarSign} accent="teal">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/80">Costs</span>
              <span className="text-lg font-semibold text-white/100">{formatCurrency(data.financial?.costs ?? 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/80">Revenues</span>
              <span className="text-lg font-semibold text-white/100">{formatCurrency(data.financial?.revenues ?? 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/80">Profit</span>
              <span className="text-lg font-semibold text-white/100">{formatCurrency(data.financial?.profit ?? ((data.financial?.revenues || 0) - (data.financial?.costs || 0)))}</span>
            </div>
            <div className="mt-3">
              <div className="h-2 bg-white/6 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-gradient-to-r from-teal-400 to-indigo-500"
                  style={{ width: `${Math.min(100, Math.max(0, ((data.performance?.marginPct || 0) + 50)))}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-white/60">Margin: {(data.performance?.marginPct ?? 0)}%</div>
            </div>
          </div>
        </SummaryCard>

        <SummaryCard title="Performance Metrics" icon={TrendingUp} accent="amber">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-white/80">Productivity</span>
              <span className="text-sm font-semibold text-white/90">{data.performance?.productivityScore ?? 0}/100</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-white/80">Efficiency</span>
              <span className="text-sm font-semibold text-white/90">{(data.performance?.efficiencyPct ?? 0)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-white/80">Margin</span>
              <span className="text-sm font-semibold text-white/90">{(data.performance?.marginPct ?? 0)}%</span>
            </div>
            <div className="mt-2">
              <div className="w-full bg-white/6 h-2 rounded-full">
                <div className="h-2 bg-gradient-to-r from-amber-400 to-pink-500" style={{ width: `${Math.min(100, data.performance?.productivityScore || 0)}%` }} />
              </div>
            </div>
          </div>
        </SummaryCard>

        <SummaryCard title="Resources" icon={Users} accent="pink">
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-sm text-white/80">Staff</span><span className="text-sm text-white/90">{data.resources?.staffCount ?? 0}</span></div>
            <div className="flex justify-between"><span className="text-sm text-white/80">Equipment</span><span className="text-sm text-white/90">{data.resources?.equipmentCount ?? 0}</span></div>
            <div className="flex justify-between"><span className="text-sm text-white/80">Materials</span><span className="text-sm text-white/90">{data.resources?.materialsCount ?? 0}</span></div>

            {data.resources?.topItems && data.resources.topItems.length > 0 && (
              <ul className="mt-2 space-y-1">
                {data.resources.topItems.slice(0,4).map((it, idx) => (
                  <li key={idx} className="text-sm text-white/70 flex justify-between">
                    <span>{it.name}</span>
                    <span className="text-white/90">{it.qty ?? it.count ?? ''}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </SummaryCard>

        <SummaryCard title="Tools & Shortcuts" icon={Wrench} accent="indigo">
          <div className="space-y-3">
            {(!data.tools || data.tools.length === 0) && <div className="text-sm text-white/70">No tools configured</div>}
            <div className="flex flex-col gap-2">
              {data.tools?.slice(0,5).map((t, i) => (
                <a
                  key={i}
                  href={t.href || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-between gap-3 px-3 py-2 rounded-md bg-white/3 hover:bg-white/6 text-sm text-white/90 transition"
                >
                  <span className="truncate">{t.name}</span>
                  <span className="text-xs text-white/60">Open</span>
                </a>
              ))}
            </div>
          </div>
        </SummaryCard>
      </div>
    </section>
  )
}

export default DiarySummaryimport React, { useEffect, useState } from 'react'
import { Clock, DollarSign, TrendingUp, Users, Wrench } from 'lucide-react'
import SummaryCard from './DiarySummary/SummaryCard'

/**
 * DiarySummary
 * - If `data` prop is supplied it renders directly.
 * - Otherwise it attempts to fetch live data from backend:
 *    http://localhost:5003/api/summary (primary)
 *    http://localhost:5000/api/summary (fallback)
 */
const DiarySummary = ({ data: propData }) => {
  const [data, setData] = useState(propData || null)
  const [loading, setLoading] = useState(!propData)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (propData) return

    let mounted = true
    const tryFetch = async () => {
      setLoading(true)
      setError(null)
      const endpoints = [
        'http://localhost:5003/api/summary',
        'http://localhost:5000/api/summary'
      ]
      for (const url of endpoints) {
        try {
          const res = await fetch(url, { credentials: 'include' })
          if (!res.ok) throw new Error(`Status ${res.status}`)
          const json = await res.json()
          if (mounted) {
            setData(json)
            setLoading(false)
          }
          return
        } catch (err) {
          // try next
          console.warn(`Summary fetch failed for ${url}:`, err.message)
        }
      }
      // fallback sample
      if (mounted) {
        setError('Unable to load live summary; showing fallback sample.')
        setData({
          session: { date: '2025-11-15', project: 'Site A', worker: 'Alice', start: '08:00', end: '16:00', durationHrs: 8 },
          financial: { costs: 1200, revenues: 2000, profit: 800 },
          performance: { productivityScore: 78, efficiencyPct: 85, marginPct: 40 },
          resources: { staffCount: 4, equipmentCount: 2, materialsCount: 12, topItems: [{ name: 'Cement', qty: 20 }] },
          tools: [{ name: 'Export PDF', href: '#' }]
        })
        setLoading(false)
      }
    }
    tryFetch()
    return () => { mounted = false }
  }, [propData])

  const formatCurrency = (n) => {
    if (n == null) return '-'
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(n))
    } catch {
      return `$${n}`
    }
  }

  if (loading) {
    return <div className="p-6 text-white">Loading summary...</div>
  }

  return (
    <section className="w-full p-4">
      {error && (
        <div style={{ marginBottom: 12, color: '#ffd93d' }}>
          {error}
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Summary</h2>
        <div className="text-sm text-white/60">Updated: {new Date().toLocaleString()}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <SummaryCard title="Session Details" icon={Clock} accent="indigo">
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-sm text-white/80">Date</span><span className="text-sm text-white/90">{data.session?.date || '—'}</span></div>
            <div className="flex justify-between"><span className="text-sm text-white/80">Project</span><span className="text-sm text-white/90">{data.session?.project || '—'}</span></div>
            <div className="flex justify-between"><span className="text-sm text-white/80">Worker</span><span className="text-sm text-white/90">{data.session?.worker || '—'}</span></div>
            <div className="flex justify-between"><span className="text-sm text-white/80">Start → End</span><span className="text-sm text-white/90">{data.session?.start || '—'} → {data.session?.end || '—'}</span></div>
            <div className="flex justify-between"><span className="text-sm text-white/80">Duration</span><span className="text-sm text-white/90">{data.session?.durationHrs ?? '—'}h</span></div>
          </div>
        </SummaryCard>

        <SummaryCard title="Financial Snapshot" icon={DollarSign} accent="teal">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/80">Costs</span>
              <span className="text-lg font-semibold text-white/100">{formatCurrency(data.financial?.costs ?? 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/80">Revenues</span>
              <span className="text-lg font-semibold text-white/100">{formatCurrency(data.financial?.revenues ?? 0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/80">Profit</span>
              <span className="text-lg font-semibold text-white/100">{formatCurrency(data.financial?.profit ?? ((data.financial?.revenues || 0) - (data.financial?.costs || 0)))}</span>
            </div>
            <div className="mt-3">
              <div className="h-2 bg-white/6 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-gradient-to-r from-teal-400 to-indigo-500"
                  style={{ width: `${Math.min(100, Math.max(0, ((data.performance?.marginPct || 0) + 50)))}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-white/60">Margin: {(data.performance?.marginPct ?? 0)}%</div>
            </div>
          </div>
        </SummaryCard>

        <SummaryCard title="Performance Metrics" icon={TrendingUp} accent="amber">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-white/80">Productivity</span>
              <span className="text-sm font-semibold text-white/90">{data.performance?.productivityScore ?? 0}/100</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-white/80">Efficiency</span>
              <span className="text-sm font-semibold text-white/90">{(data.performance?.efficiencyPct ?? 0)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-white/80">Margin</span>
              <span className="text-sm font-semibold text-white/90">{(data.performance?.marginPct ?? 0)}%</span>
            </div>
            <div className="mt-2">
              <div className="w-full bg-white/6 h-2 rounded-full">
                <div className="h-2 bg-gradient-to-r from-amber-400 to-pink-500" style={{ width: `${Math.min(100, data.performance?.productivityScore || 0)}%` }} />
              </div>
            </div>
          </div>
        </SummaryCard>

        <SummaryCard title="Resources" icon={Users} accent="pink">
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-sm text-white/80">Staff</span><span className="text-sm text-white/90">{data.resources?.staffCount ?? 0}</span></div>
            <div className="flex justify-between"><span className="text-sm text-white/80">Equipment</span><span className="text-sm text-white/90">{data.resources?.equipmentCount ?? 0}</span></div>
            <div className="flex justify-between"><span className="text-sm text-white/80">Materials</span><span className="text-sm text-white/90">{data.resources?.materialsCount ?? 0}</span></div>

            {data.resources?.topItems && data.resources.topItems.length > 0 && (
              <ul className="mt-2 space-y-1">
                {data.resources.topItems.slice(0,4).map((it, idx) => (
                  <li key={idx} className="text-sm text-white/70 flex justify-between">
                    <span>{it.name}</span>
                    <span className="text-white/90">{it.qty ?? it.count ?? ''}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </SummaryCard>

        <SummaryCard title="Tools & Shortcuts" icon={Wrench} accent="indigo">
          <div className="space-y-3">
            {(!data.tools || data.tools.length === 0) && <div className="text-sm text-white/70">No tools configured</div>}
            <div className="flex flex-col gap-2">
              {data.tools?.slice(0,5).map((t, i) => (
                <a
                  key={i}
                  href={t.href || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-between gap-3 px-3 py-2 rounded-md bg-white/3 hover:bg-white/6 text-sm text-white/90 transition"
                >
                  <span className="truncate">{t.name}</span>
                  <span className="text-xs text-white/60">Open</span>
                </a>
              ))}
            </div>
          </div>
        </SummaryCard>
      </div>
    </section>
  )
}

export default DiarySummary