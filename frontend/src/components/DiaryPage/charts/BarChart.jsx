import React, { useMemo } from "react"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js"
import { Bar } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const BarChart = ({ entries = [], height = 180 }) => {
  const byStaff = useMemo(() => {
    const map = {}
    entries.forEach(e => {
      const s = e?.Staff?.name || "Unassigned"
      map[s] = (map[s] || 0) + Number(e.totalHours || 0)
    })
    return Object.entries(map).map(([k, v]) => ({ k, v }))
  }, [entries])

  if (!byStaff || byStaff.length === 0) {
    return (
      <div role="status" aria-live="polite" className="p-4 text-sm text-muted">
        No time utilization data available
      </div>
    )
  }

  const labels = byStaff.map(b => b.k)
  const datasetValues = byStaff.map(b => b.v)

  const data = useMemo(() => ({
    labels,
    datasets: [
      {
        label: "Hours",
        data: datasetValues,
        backgroundColor: Array.from({ length: labels.length }, () => "var(--accent-teal)"),
        borderRadius: 6,
        maxBarThickness: 40
      }
    ]
  }), [labels, datasetValues])

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 600 },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx =>   h
        }
      }
    },
    scales: {
      x: {
        ticks: { color: "var(--text-primary)", maxRotation: 30, minRotation: 0 },
        grid: { display: false }
      },
      y: {
        beginAtZero: true,
        ticks: { color: "var(--text-primary)" },
        grid: { color: "rgba(255,255,255,0.04)" }
      }
    }
  }), [])

  return (
    <div style={{ height }} aria-label="Time utilization by staff" role="img">
      <Bar data={data} options={options} />
    </div>
  )
}

export default React.memo(BarChart)
