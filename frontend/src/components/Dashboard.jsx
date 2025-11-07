import React, { useState, useEffect } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { Line } from 'react-chartjs-2'
import { api } from '../utils/api'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const Dashboard = () => {
  const [diaries, setDiaries] = useState([])

  const fetchDiaries = async () => {
    try {
      const response = await api.get('/diaries')
      setDiaries(response.data)
    } catch (err) {
      console.error('Error fetching diaries:', err)
    }
  }

  useEffect(() => {
    fetchDiaries()
  }, [])

  // Group by date
  const grouped = diaries.reduce((acc, d) => {
    const date = d.date
    if (!acc[date]) acc[date] = { revenues: 0, margins: 0, count: 0 }
    acc[date].revenues += parseFloat(d.revenues)
    acc[date].margins += parseFloat(d.marginPct)
    acc[date].count += 1
    return acc
  }, {})

  const labels = Object.keys(grouped).sort()
  const revenues = labels.map(date => grouped[date].revenues)
  const margins = labels.map(date => grouped[date].margins / grouped[date].count) // average margin

  const data = {
    labels,
    datasets: [
      {
        label: 'Revenue ($)',
        data: revenues,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
      {
        label: 'Average Margin (%)',
        data: margins,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        yAxisID: 'y1',
      },
    ],
  }

  const options = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
        text: 'Revenue and Margin Trends',
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  }

  return (
    <div>
      <h2>Dashboard</h2>
      <Line options={options} data={data} />
    </div>
  )
}

export default Dashboard