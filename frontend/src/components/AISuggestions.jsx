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
 */import React from 'react'
import { Brain, TrendingUp, AlertTriangle, CheckCircle, DollarSign, Target } from 'lucide-react'

const AISuggestions = ({ quoteData, onApplySuggestion }) => {
  const suggestions = []

  // Calculate metrics
  const totalCost = quoteData.nodes?.reduce((sum, node) => sum + (node.price_per_unit * (node.quantity || 1)), 0) || 0
  const totalStaffCost = quoteData.staff?.reduce((sum, s) => sum + (s.pay_base * (s.hours || 8)), 0) || 0
  const totalEquipmentCost = quoteData.equipment?.reduce((sum, e) => sum + (e.cost_base * (e.days || 1)), 0) || 0
  const totalCosts = totalCost + totalStaffCost + totalEquipmentCost
  const margin = quoteData.marginPct || 20
  const markup = totalCosts * (1 + margin / 100)
  const profit = markup - totalCosts

  // Suggestion 1: Margin optimization
  if (margin < 15) {
    suggestions.push({
      id: 'low-margin',
      type: 'warning',
      icon: <TrendingUp size={20} />,
      title: 'Low Profit Margin',
      description: `Your current margin of ${margin}% is below industry standard. Consider increasing to 20-25% for better profitability.`,
      action: 'Increase margin to 20%',
      impact: `+$${((totalCosts * 0.2) - profit).toFixed(2)} profit`
    })
  } else if (margin > 35) {
    suggestions.push({
      id: 'high-margin',
      type: 'info',
      icon: <Target size={20} />,
      title: 'High Profit Margin',
      description: `Your margin of ${margin}% is quite high. Consider if this is competitive for your market.`,
      action: 'Review pricing strategy',
      impact: 'Potential volume increase'
    })
  }

  // Suggestion 2: Cost optimization
  if (totalStaffCost > totalCosts * 0.6) {
    suggestions.push({
      id: 'high-staff-cost',
      type: 'warning',
      icon: <AlertTriangle size={20} />,
      title: 'High Labor Costs',
      description: 'Labor costs exceed 60% of total. Consider optimizing staff allocation or finding cost-effective alternatives.',
      action: 'Review staff efficiency',
      impact: 'Potential 10-15% savings'
    })
  }

  // Suggestion 3: Equipment utilization
  if (quoteData.equipment?.length > 5) {
    suggestions.push({
      id: 'equipment-heavy',
      type: 'info',
      icon: <CheckCircle size={20} />,
      title: 'Equipment-Intensive Project',
      description: 'This project uses significant equipment. Consider rental vs. ownership costs.',
      action: 'Compare rental options',
      impact: 'Potential cost savings'
    })
  }

  // Suggestion 4: Material efficiency
  const materialCount = quoteData.nodes?.length || 0
  if (materialCount > 10) {
    suggestions.push({
      id: 'material-optimization',
      type: 'success',
      icon: <DollarSign size={20} />,
      title: 'Bulk Material Savings',
      description: `With ${materialCount} materials, you may qualify for bulk discounts. Consider negotiating with suppliers.`,
      action: 'Check bulk pricing',
      impact: '5-10% material savings'
    })
  }

  // Suggestion 5: Profit potential
  if (profit > totalCosts * 0.3) {
    suggestions.push({
      id: 'high-profit',
      type: 'success',
      icon: <Target size={20} />,
      title: 'Strong Profit Potential',
      description: `This quote shows excellent profitability. Consider using this as a template for similar projects.`,
      action: 'Save as template',
      impact: 'Reusable success pattern'
    })
  }

  if (suggestions.length === 0) {
    return (
      <div className="ai-suggestions empty">
        <Brain size={48} color="#667eea" />
        <h3>AI Analysis Complete</h3>
        <p>Your quote looks well-optimized! All key metrics are within recommended ranges.</p>
      </div>
    )
  }

  return (
    <div className="ai-suggestions">
      <div className="suggestions-header">
        <Brain size={24} />
        <h3>AI-Powered Insights</h3>
        <span className="suggestion-count">{suggestions.length} suggestions</span>
      </div>

      <div className="suggestions-list">
        {suggestions.map((suggestion) => (
          <div key={suggestion.id} className={`suggestion-card ${suggestion.type}`}>
            <div className="suggestion-icon">
              {suggestion.icon}
            </div>
            <div className="suggestion-content">
              <h4>{suggestion.title}</h4>
              <p>{suggestion.description}</p>
              <div className="suggestion-meta">
                <span className="impact">{suggestion.impact}</span>
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => onApplySuggestion && onApplySuggestion(suggestion)}
                >
                  {suggestion.action}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AISuggestions