import React, { useMemo } from "react"
import { Bar } from "react-chartjs-2"

const BarChart = ({ entries = [] }) => {
  const byStaff = useMemo(()=> {
    const map = {}
    entries.forEach(e => { const s = e.Staff?.name || "Unassigned"; map[s] = (map[s]||0) + Number(e.totalHours||0) })
    return Object.entries(map).map(([k,v])=>({k,v}))
  }, [entries])
  const labels = byStaff.map(b=>b.k)
  const data = byStaff.map(b=>b.v)
  return <div style={{height:180}}><Bar data={{labels,datasets:[{label:"Hours",data,backgroundColor:"var(--accent-teal)"}]}} options={{responsive:true,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{color:"var(--text-primary)"}},x:{ticks:{color:"var(--text-primary)"}}}}} /></div>
}

export default BarChart