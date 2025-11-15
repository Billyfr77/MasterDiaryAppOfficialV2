import React, { useMemo, useRef } from "react"
import DonutChart from "./charts/DonutChart"
import BarChart from "./charts/BarChart"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

/**
 * LedgerPanel - Dark theme ledger panel with export functionality
 */
const LedgerPanel = ({ diaries = [], onExportPdf, userRole }) => {
  const totals = useMemo(()=> {
    const costs = diaries.reduce((s,d)=> s + Number(d.costs||0),0)
    const revenues = diaries.reduce((s,d)=> s + Number(d.revenues||0),0)
    const profit = revenues - costs
    const margin = revenues ? (profit / revenues * 100).toFixed(1) : 0
    return { costs, revenues, profit, margin }
  }, [diaries])

  const exportRef = useRef()
  const handleExport = async () => {
    const el = exportRef.current
    const canvas = await html2canvas(el, { scale: 2 })
    const img = canvas.toDataURL("image/png")
    const pdf = new jsPDF({ orientation: "portrait" })
    const w = pdf.internal.pageSize.getWidth()
    pdf.addImage(img, "PNG", 0, 0, w, (canvas.height * w) / canvas.width)
    pdf.save("diary-summary.pdf")
  }

  const costBreakdown = useMemo(()=> {
    const map = {}
    diaries.forEach(d => {
      const key = d.Project?.name || "Misc"
      map[key] = (map[key] || 0) + Number(d.costs||0)
    })
    return Object.entries(map).map(([k,v])=> ({ label:k, value:v }))
  }, [diaries])

  return (
    <aside className="bg-gray-800 p-4 rounded-lg border border-gray-700 sticky top-6" aria-label="Ledger panel">
      <div ref={exportRef}>
        <h3 className="text-lg font-semibold mb-3 text-white">Ledger</h3>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 bg-gray-700 rounded border border-gray-600">
            <div className="text-sm text-gray-400">Revenue</div>
            <div className="text-xl font-bold text-white">${totals.revenues.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-gray-700 rounded border border-gray-600">
            <div className="text-sm text-gray-400">Costs</div>
            <div className="text-xl font-bold text-white">${totals.costs.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-gray-700 rounded border border-gray-600">
            <div className="text-sm text-gray-400">Profit</div>
            <div className="text-xl font-bold text-white">${totals.profit.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-gray-700 rounded border border-gray-600">
            <div className="text-sm text-gray-400">Margin</div>
            <div className="text-xl font-bold text-white">{totals.margin}%</div>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2 text-white">Cost Breakdown</h4>
          <DonutChart data={costBreakdown} />
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2 text-white">Time Utilization</h4>
          <BarChart entries={diaries} />
        </div>

        <div className="flex gap-2">
          <button onClick={handleExport} className="btn-primary w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded">Export PDF</button>
          {userRole === "admin" && <button className="btn-ghost w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">Approve</button>}
        </div>
      </div>
    </aside>
  )
}

export default LedgerPanel