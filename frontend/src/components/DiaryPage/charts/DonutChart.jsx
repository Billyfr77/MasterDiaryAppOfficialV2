import React from "react"
import { Doughnut } from "react-chartjs-2"

const DonutChart = ({ data = [] }) => {
  const labels = data.map(d => d.label)
  const values = data.map(d => d.value)
  const colors = ["var(--accent-indigo)","var(--accent-teal)","var(--accent-amber)","var(--accent-red)","var(--accent-pink)"]
  return <Doughnut data={{ labels, datasets:[{ data: values, backgroundColor: colors }] }} options={{ responsive:true, plugins:{legend:{position:"bottom", labels:{color:"var(--text-primary)"}}} }} />
}

export default DonutChart