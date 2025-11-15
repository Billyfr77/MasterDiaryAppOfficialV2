import React from "react"
import { Line } from "react-chartjs-2"

const Sparkline = ({ data = [], stroke = "indigo" }) => {
  const cfg = {
    labels: data.map((_,i)=>i),
    datasets: [{ data, borderColor: `var(--accent-${stroke})`, fill: false, pointRadius: 0, borderWidth: 2 }]
  }
  const opts = { responsive: true, maintainAspectRatio: false, elements: { line: { tension: 0.3 } }, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }
  return <div style={{height:28}}><Line data={cfg} options={opts} /></div>
}

export default Sparkline