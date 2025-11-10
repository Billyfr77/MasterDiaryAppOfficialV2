/*
 * MasterDiaryApp Official - Construction SaaS Platform
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 *
 * This software and associated documentation contain proprietary
 * and confidential information of Billy Fraser.
 *
 * Unauthorized copying, modification, distribution, or use of this
 * software, in whole or in part, is strictly prohibited without
 * prior written permission from the copyright holder.
 *
 * For licensing inquiries: billyfr77@example.com
 *
 * Patent Pending: Drag-and-drop construction quote builder system
 * Trade Secret: Real-time calculation algorithms and optimization techniques
 */import React, { useState, useEffect } from 'react'
import { api } from '../utils/api'

const CostInsights = ({ selectedProject, quoteItems, marginPct }) => {
  const [insights, setInsights] = useState({ avgMargin: 0, quotesCount: 0, quotes: [] })

  useEffect(() => {
    const fetchInsights = async () => {
      if (!selectedProject) return
      try {
        const response = await api.get(`/quotes?projectId=${selectedProject}`)
        const quotes = response.data.data || response.data
        const avgMargin = quotes.length > 0 ? quotes.reduce((sum, q) => sum + q.marginPct, 0) / quotes.length : 0
        setInsights({ avgMargin, quotesCount: quotes.length, quotes })
      } catch (err) {
        console.error('Error fetching insights:', err)
      }
    }
    fetchInsights()
  }, [selectedProject])

  const topCostDrivers = quoteItems
    .map(item => {
      const cost = item.type === 'staff'
        ? item.material.payRate * item.quantity
        : item.type === 'equipment'
        ? item.material.costRate * item.quantity
        : item.material.pricePerUnit * item.quantity
      return { ...item, cost }
    })
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 3)

  const marginSuggestion = marginPct < 15
    ? 'Consider increasing margin to 20% for better profitability.'
    : 'Margin looks good!'

  return (
    <div style={{ marginTop: 'var(--spacing-lg)' }}>
      <h4 style={{ color: '#ffffff', fontFamily: "'Poppins', sans-serif", marginBottom: 'var(--spacing-sm)' }}>Cost Insights</h4>
      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <h5 style={{ color: '#ffffff', fontFamily: "'Inter', sans-serif" }}>Top Cost Drivers</h5>
        {topCostDrivers.length > 0 ? (
          topCostDrivers.map((item, idx) => (
            <div key={item.nodeId} style={{ color: '#ffffff', fontFamily: "'Inter', sans-serif", marginBottom: 'var(--spacing-xs)' }}>
              {idx + 1}. {item.material.name}: ${item.cost.toFixed(2)}
            </div>
          ))
        ) : (
          <div style={{ color: '#ffffff', fontFamily: "'Inter', sans-serif" }}>No items added yet.</div>
        )}
      </div>
      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <h5 style={{ color: '#ffffff', fontFamily: "'Inter', sans-serif" }}>Margin Suggestion</h5>
        <p style={{ color: '#ffffff', fontFamily: "'Inter', sans-serif" }}>{marginSuggestion}</p>
      </div>
      <div>
        <h5 style={{ color: '#ffffff', fontFamily: "'Inter', sans-serif" }}>Historical Comparison</h5>
        <p style={{ color: '#ffffff', fontFamily: "'Inter', sans-serif" }}>
          Average margin for this project: {insights.avgMargin ? `${insights.avgMargin.toFixed(1)}%` : 'No data'} ({insights.quotesCount} quotes)
        </p>
        {insights.quotes.length > 0 && (
          <div>
            <h6 style={{ color: '#ffffff', fontFamily: "'Inter', sans-serif" }}>Quote Versions</h6>
            {insights.quotes.map((q, idx) => {
              const prevMargin = idx > 0 ? insights.quotes[idx - 1].marginPct : 0
              const delta = idx > 0 ? q.marginPct - prevMargin : 0
              return (
                <div key={q.id} style={{ color: '#ffffff', fontFamily: "'Inter', sans-serif", marginBottom: 'var(--spacing-xs)' }}>
                  Version {idx + 1}: Margin {q.marginPct}%, Cost ${q.totalCost}, Revenue ${q.totalRevenue}
                  {idx > 0 && ` (Delta: ${delta > 0 ? '+' : ''}${delta.toFixed(1)}%)`}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default CostInsights