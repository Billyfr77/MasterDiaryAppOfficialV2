import React from 'react'

const Tooltip = ({ children, content }) => {
  const [visible, setVisible] = React.useState(false)
  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '0.9em',
          whiteSpace: 'nowrap',
          zIndex: 1000,
          marginBottom: '8px',
          fontFamily: "'Inter', sans-serif"
        }}>
          {content}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            border: '5px solid transparent',
            borderTopColor: 'rgba(0,0,0,0.8)'
          }}></div>
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
    <div style={{
      padding: 'var(--spacing-md)',
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      borderRadius: '12px',
      color: 'white',
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      animation: 'glow 2s ease-in-out infinite alternate',
      fontFamily: "'Inter', sans-serif"
    }}>
      <h4 style={{ margin: 0, marginBottom: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', fontFamily: "'Poppins', sans-serif" }}>
        Enhanced Quote Summary
      </h4>
      <Tooltip content="Total cost before margin">
        <p style={{ margin: 'var(--spacing-xs) 0' }}>Cost: <strong>${totalCost.toFixed(2)}</strong></p>
      </Tooltip>
      <Tooltip content="Total revenue after margin">
        <p style={{ margin: 'var(--spacing-xs) 0' }}>Revenue: <strong>${totalRevenue.toFixed(2)}</strong></p>
      </Tooltip>
      <Tooltip content="Profit margin">
        <p style={{ margin: 'var(--spacing-xs) 0' }}>Margin: <strong style={{ color: marginPct > 20 ? '#28a745' : marginPct > 10 ? '#ffc107' : '#dc3545' }}>${margin.toFixed(2)}</strong></p>
      </Tooltip>
      <div style={{ height: '8px', background: '#333', borderRadius: '4px', marginTop: 'var(--spacing-xs)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${Math.min(margin / 10000 * 100, 100)}%`,
          background: marginPct > 20 ? '#28a745' : marginPct > 10 ? '#ffc107' : '#dc3545',
          borderRadius: '4px',
          transition: 'width 0.5s ease'
        }}></div>
      </div>
      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-md)' }}>
        <Tooltip content="Export quote as PDF">
          <button
            onClick={exportPDF}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              cursor: 'pointer',
              fontFamily: "'Poppins', sans-serif",
              fontSize: '0.9em'
            }}
          >
            Export PDF
          </button>
        </Tooltip>
        <Tooltip content="Export summary as CSV">
          <button
            onClick={exportCSV}
            style={{
              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              cursor: 'pointer',
              fontFamily: "'Poppins', sans-serif",
              fontSize: '0.9em'
            }}
          >
            Export CSV
          </button>
        </Tooltip>
        <Tooltip content="Send quote to client">
          <button
            onClick={sendToClient}
            style={{
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              cursor: 'pointer',
              fontFamily: "'Poppins', sans-serif",
              fontSize: '0.9em'
            }}
          >
            Send to Client
          </button>
        </Tooltip>
      </div>
    </div>
  )
}

export default EnhancedSummary