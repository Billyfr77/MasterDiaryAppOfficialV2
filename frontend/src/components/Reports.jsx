import React, { useState, useEffect } from 'react'
import { api } from '../utils/api'

const Reports = () => {
  const [diaries, setDiaries] = useState([])
  const [summary, setSummary] = useState({ totalRevenue: 0, totalCosts: 0, totalMargin: 0 })

  const fetchDiaries = async () => {
    try {
      const response = await api.get('/diaries')
      setDiaries(response.data)
      
      // Calculate summary
      const totalRevenue = response.data.reduce((sum, d) => sum + parseFloat(d.revenues), 0)
      const totalCosts = response.data.reduce((sum, d) => sum + parseFloat(d.costs), 0)
      const totalMargin = totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0
      setSummary({ totalRevenue, totalCosts, totalMargin })
    } catch (err) {
      console.error('Error fetching diaries:', err)
    }
  }

  useEffect(() => {
    fetchDiaries()
  }, [])

  return (
    <div>
      <h2>Reports</h2>
      <div>
        <h3>Summary</h3>
        <p>Total Revenue: ${summary.totalRevenue.toFixed(2)}</p>
        <p>Total Costs: ${summary.totalCosts.toFixed(2)}</p>
        <p>Overall Margin: {summary.totalMargin.toFixed(2)}%</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Date</th><th>Project</th><th>Worker</th><th>Hours</th><th>Costs</th><th>Revenues</th><th>Margin %</th>
          </tr>
        </thead>
        <tbody>
          {diaries.map(d => (
            <tr key={d.id}>
              <td>{d.date}</td>
              <td>{d.Project?.name}</td>
              <td>{d.Staff?.name}</td>
              <td>{d.totalHours}</td>
              <td>${d.costs}</td>
              <td>${d.revenues}</td>
              <td>{d.marginPct}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Reports