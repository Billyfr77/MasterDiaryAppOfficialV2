import React from 'react'
import { Brain, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, DollarSign, Target, Star, Award, Zap, Users, BarChart3, Calculator } from 'lucide-react'

const AISuggestionsEnhanced = ({ quoteData, onApplySuggestion, onReviewPricing }) => {
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
      impact: `+$${((totalCosts * 0.2) - profit).toFixed(2)} profit`,
      actionable: true
    })
  } else if (margin > 35) {
    suggestions.push({
      id: 'high-margin',
      type: 'info',
      icon: <Target size={20} />,
      title: 'High Profit Margin',
      description: `Your margin of ${margin}% is quite high. Consider if this is competitive for your market.`,
      action: 'Review pricing strategy',
      impact: 'Potential volume increase',
      actionable: true
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
      impact: 'Potential 10-15% savings',
      actionable: true
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
      impact: 'Potential cost savings',
      actionable: true
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
      impact: '5-10% material savings',
      actionable: true
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
      impact: 'Reusable success pattern',
      actionable: true
    })
  }

  // Suggestion 6: Pricing strategy review
  if (margin < 15 || margin > 35) {
    suggestions.push({
      id: 'pricing-strategy',
      type: 'warning',
      icon: <Star size={20} />,
      title: 'Review Pricing Strategy',
      description: `Current margin of ${margin.toFixed(1)}% needs strategic review. Industry standard is 20-30%. Consider competitor analysis and value proposition assessment.`,
      action: 'Review pricing strategy',
      impact: 'Optimize profit margins',
      actionable: true,
      onClick: () => onReviewPricing && onReviewPricing()
    })
  }

  // Suggestion 7: Market positioning
  if (totalCosts > 25000 && margin < 20) {
    suggestions.push({
      id: 'market-positioning',
      type: 'info',
      icon: <Award size={20} />,
      title: 'Premium Positioning Opportunity',
      description: 'High project value with low margins suggests opportunity for premium positioning. Consider value-added services and quality differentiation.',
      action: 'Analyze market positioning',
      impact: 'Increase profit per project',
      actionable: true
    })
  }

  // Suggestion 8: Volume vs. Premium strategy
  const projectCount = quoteData.diaries?.length || 0
  if (projectCount > 50 && margin < 18) {
    suggestions.push({
      id: 'volume-strategy',
      type: 'info',
      icon: <BarChart3 size={20} />,
      title: 'Volume vs. Premium Strategy',
      description: `With ${projectCount} projects, consider shifting from volume to premium pricing strategy for better margins.`,
      action: 'Evaluate pricing tiers',
      impact: 'Strategic profit optimization',
      actionable: true
    })
  }

  // Suggestion 9: Competitive analysis
  if (totalCosts > 30000 && margin > 25) {
    suggestions.push({
      id: 'competitive-analysis',
      type: 'success',
      icon: <Users size={20} />,
      title: 'Competitive Advantage',
      description: 'Strong margins indicate competitive advantage. Consider market expansion or premium service offerings.',
      action: 'Conduct competitor analysis',
      impact: 'Market leadership positioning',
      actionable: true
    })
  }

  // Suggestion 10: Cost control excellence
  if (totalCosts < 15000 && margin > 22) {
    suggestions.push({
      id: 'cost-control',
      type: 'success',
      icon: <Calculator size={20} />,
      title: 'Cost Control Excellence',
      description: 'Efficient cost management with strong margins. This pricing strategy is optimal for similar projects.',
      action: 'Document as best practice',
      impact: 'Standardize success patterns',
      actionable: true
    })
  }

  if (suggestions.length === 0) {
    return (
      <div className="ai-suggestions empty">
        <Brain size={48} color="#667eea" />
        <h3>AI Analysis Complete</h3>
        <p>Your quote looks well-optimized! All key metrics are within recommended ranges.</p>
        <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(78, 205, 196, 0.1)', borderRadius: '8px', border: '1px solid rgba(78, 205, 196, 0.3)' }}>
          <p style={{ margin: 0, color: '#4ecdc4', fontSize: '14px' }}>
            💡 <strong>Pro Tip:</strong> Consider regular pricing strategy reviews to maintain optimal margins.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="ai-suggestions">
      <div className="suggestions-header">
        <Brain size={24} />
        <h3>AI-Powered Business Intelligence</h3>
        <span className="suggestion-count">{suggestions.length} insights</span>
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
                {suggestion.actionable && (
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={suggestion.onClick || (() => onApplySuggestion && onApplySuggestion(suggestion))}
                  >
                    {suggestion.action}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pricing-strategy-section" style={{ marginTop: '24px', padding: '16px', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '12px', border: '1px solid rgba(102, 126, 234, 0.3)' }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#667eea', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Star size={20} />
          Strategic Pricing Analysis
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', fontSize: '14px' }}>
          <div>
            <strong>Current Margin:</strong><br/>
            <span style={{ color: margin < 15 ? '#ff6b6b' : margin > 35 ? '#ffd93d' : '#4ecdc4' }}>
              {margin.toFixed(1)}%
            </span>
          </div>
          <div>
            <strong>Industry Avg:</strong><br/>
            <span style={{ color: '#667eea' }}>20-30%</span>
          </div>
          <div>
            <strong>Optimization:</strong><br/>
            <span style={{ color: '#4ecdc4' }}>
              {margin < 20 ? `+${(20 - margin).toFixed(1)}% needed` : 'Optimal'}
            </span>
          </div>
        </div>
        <button
          onClick={() => onReviewPricing && onReviewPricing()}
          style={{
            marginTop: '12px',
            padding: '8px 16px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          📊 Review Pricing Strategy
        </button>
      </div>
    </div>
  )
}

export default AISuggestionsEnhanced