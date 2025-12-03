/*
 * MasterDiaryApp Official - Construction SaaS Platform
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 */
import React from 'react'

const Tooltip = ({ children, content }) => {
  const [visible, setVisible] = React.useState(false)
  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-sm rounded-lg whitespace-nowrap z-[1000] font-sans shadow-lg">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
        </div>
      )}
    </div>
  )
}

const EnhancedSummary = ({ totalCost, totalRevenue, margin, marginPct, onExportPDF, onExportCSV, onSendToClient }) => {
  const exportPDF = () => {
    // Placeholder for PDF export
    alert('PDF export not implemented yet. Use jsPDF library.')
    // onExportPDF && onExportPDF()
  }

  const exportCSV = () => {
    // Placeholder for CSV export
    const csv = `Cost,Revenue,Margin,Margin%\n${totalCost},${totalRevenue},${margin},${marginPct}`
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'quote_summary.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const sendToClient = () => {
    // Placeholder for send to client
    alert('Send to client not implemented yet. Integrate email API.')
    // onSendToClient && onSendToClient()
  }

  return (
    <div className="p-4 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl text-white shadow-xl animate-pulse-slow font-sans border border-white/20">
      <h4 className="m-0 mb-3 flex items-center gap-2 font-bold text-lg font-sans">
        Enhanced Quote Summary
      </h4>
      <div className="space-y-2">
        <Tooltip content="Total cost before margin">
          <p className="flex justify-between"><span>Cost:</span> <strong>${totalCost.toFixed(2)}</strong></p>
        </Tooltip>
        <Tooltip content="Total revenue after margin">
          <p className="flex justify-between"><span>Revenue:</span> <strong>${totalRevenue.toFixed(2)}</strong></p>
        </Tooltip>
        <Tooltip content="Profit margin">
          <p className="flex justify-between">
            <span>Margin:</span> 
            <strong className={marginPct > 20 ? 'text-green-300' : marginPct > 10 ? 'text-yellow-300' : 'text-red-300'}>
              ${margin.toFixed(2)}
            </strong>
          </p>
        </Tooltip>
      </div>
      
      <div className="h-2 bg-black/30 rounded-full mt-3 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${marginPct > 20 ? 'bg-green-400' : marginPct > 10 ? 'bg-yellow-400' : 'bg-red-400'}`}
          style={{ width: `${Math.min(margin / 10000 * 100, 100)}%` }}
        ></div>
      </div>

      <div className="flex gap-2 mt-4">
        <Tooltip content="Export quote as PDF">
          <button
            onClick={exportPDF}
            className="flex-1 px-3 py-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white text-sm font-bold rounded-lg shadow-md transition-all hover:-translate-y-0.5"
          >
            Export PDF
          </button>
        </Tooltip>
        <Tooltip content="Export summary as CSV">
          <button
            onClick={exportCSV}
            className="flex-1 px-3 py-2 bg-gradient-to-r from-success to-emerald-600 hover:opacity-90 text-white text-sm font-bold rounded-lg shadow-md transition-all hover:-translate-y-0.5"
          >
            Export CSV
          </button>
        </Tooltip>
        <Tooltip content="Send quote to client">
          <button
            onClick={sendToClient}
            className="flex-1 px-3 py-2 bg-gradient-to-r from-danger to-red-600 hover:opacity-90 text-white text-sm font-bold rounded-lg shadow-md transition-all hover:-translate-y-0.5"
          >
            Send
          </button>
        </Tooltip>
      </div>
    </div>
  )
}

export default EnhancedSummary
