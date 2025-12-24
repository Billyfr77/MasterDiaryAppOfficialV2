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
import { TrendingUp, TrendingDown, BarChart3, PieChart, Activity, Target, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { api } from '../utils/api'

const PredictiveAnalytics = ({ projectData, historicalData }) => {
  const [predictions, setPredictions] = useState({})
  const [risks, setRisks] = useState([])
  const [insights, setInsights] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (projectData) {
      fetchPredictions()
    }
  }, [projectData, historicalData])

  const fetchPredictions = async () => {
    setIsLoading(true)
    try {
      const res = await api.post('/ai/analyze-prism', {
        context: {
            ...projectData,
            command: 'predictive_dashboard' // Signal for broader analysis
        },
        history: historicalData || []
      })
      
      const data = res.data
      
      setPredictions({
        duration: data.completionDrift || 'On Track',
        cost: data.driftStats?.cost?.absoluteVariance || '$0',
        profit: data.predictedFinalMargin || '0%',
        confidence: Math.min(100, Math.max(50, (data.velocity || 1) * 75)) // Derived confidence
      })

      const aiRisks = (data.insights || [])
        .filter(i => i.severity === 'critical' || i.severity === 'warning')
        .map(i => ({
            level: i.severity === 'critical' ? 'high' : 'medium',
            title: i.type?.toUpperCase() || 'RISK DETECTED',
            description: i.text,
            impact: 'Margin Erosion',
            mitigation: i.tacticalAdvice || 'Review resource allocation'
        }))
      
      setRisks(aiRisks.length > 0 ? aiRisks : [{
          level: 'low',
          title: 'System Stable',
          description: 'No significant risks detected by Neural Engine.',
          impact: 'None',
          mitigation: 'Monitor'
      }])

      setInsights((data.insights || []).map(i => i.text))

    } catch (err) {
      console.error("AI Prediction Error:", err)
      // Fallback/Error state is handled by showing empty or preserved data
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (val) => {
      if (typeof val === 'string' && val.includes('$')) return val;
      return `$${(parseFloat(val) || 0).toLocaleString()}`;
  }

  return (
    <div className="predictive-analytics relative">
      {isLoading && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
              <Loader2 className="animate-spin text-emerald-400" size={32} />
          </div>
      )}
      
      <div className="analytics-header">
        <BarChart3 size={24} />
        <h3>Predictive Analytics Dashboard</h3>
        <div className="confidence-score">
          <Activity size={16} />
          <span>{predictions.confidence?.toFixed(0)}% Confidence</span>
        </div>
      </div>

      <div className="predictions-grid">
        <div className="prediction-card">
          <div className="prediction-icon">
            <TrendingUp size={32} color="#4ecdc4" />
          </div>
          <div className="prediction-content">
            <h4>Predicted Drift</h4>
            <div className="prediction-value">{predictions.duration}</div>
            <div className="prediction-trend">
              <TrendingUp size={16} />
              <span>Schedule Impact</span>
            </div>
          </div>
        </div>

        <div className="prediction-card">
          <div className="prediction-icon">
            <Target size={32} color="#667eea" />
          </div>
          <div className="prediction-content">
            <h4>Cost Variance</h4>
            <div className="prediction-value">{predictions.cost}</div>
            <div className="prediction-trend">
              <TrendingDown size={16} />
              <span>Projected Variance</span>
            </div>
          </div>
        </div>

        <div className="prediction-card">
          <div className="prediction-icon">
            <PieChart size={32} color="#764ba2" />
          </div>
          <div className="prediction-content">
            <h4>Predicted Margin</h4>
            <div className="prediction-value">{predictions.profit}</div>
            <div className="prediction-trend positive">
              <TrendingUp size={16} />
              <span>Final Outlook</span>
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
          {insights.length > 0 ? insights.map((text, i) => (
              <div key={i} className="insight-item">
                <span className="insight-bullet">•</span>
                <span>{text}</span>
              </div>
          )) : (
              <div className="insight-item">
                <span className="insight-bullet">•</span>
                <span>Gathering neural intelligence...</span>
              </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PredictiveAnalytics