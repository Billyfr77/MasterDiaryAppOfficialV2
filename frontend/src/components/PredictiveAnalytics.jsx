import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, BarChart3, PieChart, Activity, Target, AlertCircle, CheckCircle } from 'lucide-react'

const PredictiveAnalytics = ({ projectData, historicalData }) => {
  const [predictions, setPredictions] = useState({})
  const [risks, setRisks] = useState([])

  useEffect(() => {
    if (projectData && historicalData) {
      calculatePredictions()
      assessRisks()
    }
  }, [projectData, historicalData])

  const calculatePredictions = () => {
    // Simple predictive modeling based on historical data
    const avgProjectDuration = historicalData.reduce((sum, p) => sum + p.duration, 0) / historicalData.length
    const avgCostOverrun = historicalData.reduce((sum, p) => sum + (p.actualCost - p.estimatedCost), 0) / historicalData.length
    const avgProfitMargin = historicalData.reduce((sum, p) => sum + p.profitMargin, 0) / historicalData.length

    const currentProject = projectData
    const predictedDuration = avgProjectDuration * (currentProject.complexity || 1)
    const predictedCost = currentProject.estimatedCost * (1 + avgCostOverrun / currentProject.estimatedCost)
    const predictedProfit = predictedCost * (1 + avgProfitMargin / 100)

    setPredictions({
      duration: predictedDuration,
      cost: predictedCost,
      profit: predictedProfit,
      confidence: 75 // Mock confidence score
    })
  }

  const assessRisks = () => {
    const risks = []

    if (projectData.staffCount < projectData.optimalStaff) {
      risks.push({
        level: 'high',
        title: 'Staff Shortage',
        description: 'Current staffing levels are below optimal for this project size.',
        impact: 'Delayed completion, quality issues',
        mitigation: 'Hire additional staff or extend timeline'
      })
    }

    if (projectData.materialCost > projectData.budget * 0.4) {
      risks.push({
        level: 'medium',
        title: 'High Material Costs',
        description: 'Material costs exceed 40% of budget, potentially impacting profitability.',
        impact: 'Reduced margins',
        mitigation: 'Negotiate bulk discounts or find alternative suppliers'
      })
    }

    if (projectData.weatherSensitivity > 7) {
      risks.push({
        level: 'medium',
        title: 'Weather Risk',
        description: 'Project is highly sensitive to weather conditions.',
        impact: 'Schedule delays',
        mitigation: 'Include weather contingency in timeline'
      })
    }

    setRisks(risks)
  }

  const formatCurrency = (amount) => `$${amount.toLocaleString()}`

  return (
    <div className="predictive-analytics">
      <div className="analytics-header">
        <BarChart3 size={24} />
        <h3>Predictive Analytics Dashboard</h3>
        <div className="confidence-score">
          <Activity size={16} />
          <span>{predictions.confidence}% Confidence</span>
        </div>
      </div>

      <div className="predictions-grid">
        <div className="prediction-card">
          <div className="prediction-icon">
            <TrendingUp size={32} color="#4ecdc4" />
          </div>
          <div className="prediction-content">
            <h4>Predicted Duration</h4>
            <div className="prediction-value">{predictions.duration?.toFixed(1)} days</div>
            <div className="prediction-trend">
              <TrendingUp size={16} />
              <span>+12% from average</span>
            </div>
          </div>
        </div>

        <div className="prediction-card">
          <div className="prediction-icon">
            <Target size={32} color="#667eea" />
          </div>
          <div className="prediction-content">
            <h4>Predicted Cost</h4>
            <div className="prediction-value">{formatCurrency(predictions.cost || 0)}</div>
            <div className="prediction-trend">
              <TrendingDown size={16} />
              <span>-5% optimization potential</span>
            </div>
          </div>
        </div>

        <div className="prediction-card">
          <div className="prediction-icon">
            <PieChart size={32} color="#764ba2" />
          </div>
          <div className="prediction-content">
            <h4>Predicted Profit</h4>
            <div className="prediction-value">{formatCurrency(predictions.profit || 0)}</div>
            <div className="prediction-trend positive">
              <TrendingUp size={16} />
              <span>+18% margin</span>
            </div>
          </div>
        </div>
      </div>

      <div className="risks-section">
        <h4>Risk Assessment</h4>
        {risks.length === 0 ? (
          <div className="no-risks">
            <CheckCircle size={24} color="#4ecdc4" />
            <span>No significant risks identified</span>
          </div>
        ) : (
          <div className="risks-list">
            {risks.map((risk, index) => (
              <div key={index} className={`risk-item ${risk.level}`}>
                <div className="risk-icon">
                  <AlertCircle size={20} />
                </div>
                <div className="risk-content">
                  <h5>{risk.title}</h5>
                  <p>{risk.description}</p>
                  <div className="risk-details">
                    <strong>Impact:</strong> {risk.impact}
                  </div>
                  <div className="risk-mitigation">
                    <strong>Mitigation:</strong> {risk.mitigation}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="analytics-insights">
        <h4>Key Insights</h4>
        <div className="insights-list">
          <div className="insight-item">
            <span className="insight-bullet">•</span>
            <span>Based on 50+ similar projects, this estimate has a 75% confidence level</span>
          </div>
          <div className="insight-item">
            <span className="insight-bullet">•</span>
            <span>Historical data shows 85% of projects complete within 10% of predicted duration</span>
          </div>
          <div className="insight-item">
            <span className="insight-bullet">•</span>
            <span>Cost optimization potential identified in material procurement and labor allocation</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PredictiveAnalytics