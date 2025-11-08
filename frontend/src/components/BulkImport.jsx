import React, { useState } from 'react'

const BulkImport = ({ onAddItems }) => {
  const [csvText, setCsvText] = useState('')
  const [previewItems, setPreviewItems] = useState([])
  const [errors, setErrors] = useState([])

  const parseCSV = () => {
    const lines = csvText.trim().split('\n')
    if (lines.length < 2) {
      setErrors(['CSV must have at least a header and one data row.'])
      return
    }
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const expectedHeaders = ['name', 'quantity', 'unit', 'price']
    if (!expectedHeaders.every(h => headers.includes(h))) {
      setErrors(['CSV headers must include: name, quantity, unit, price'])
      return
    }
    const items = []
    const errs = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      if (values.length !== 4) {
        errs.push(`Row ${i + 1}: Must have 4 columns`)
        continue
      }
      const [name, qtyStr, unit, priceStr] = values
      const quantity = parseFloat(qtyStr)
      const price = parseFloat(priceStr)
      if (isNaN(quantity) || quantity <= 0) {
        errs.push(`Row ${i + 1}: Quantity must be a positive number`)
        continue
      }
      if (isNaN(price) || price < 0) {
        errs.push(`Row ${i + 1}: Price must be a non-negative number`)
        continue
      }
      items.push({ name, quantity, unit, pricePerUnit: price, type: 'material', category: 'Imported' })
    }
    setPreviewItems(items)
    setErrors(errs)
  }

  const addItems = () => {
    if (previewItems.length > 0 && errors.length === 0) {
      onAddItems(previewItems)
      setCsvText('')
      setPreviewItems([])
      setErrors([])
      alert('Items added successfully!')
    }
  }

  return (
    <div style={{ marginTop: 'var(--spacing-lg)' }}>
      <h4 style={{ color: '#ffffff', fontFamily: "'Poppins', sans-serif", marginBottom: 'var(--spacing-sm)' }}>Bulk Import</h4>
      <textarea
        placeholder="Paste CSV here (name,quantity,unit,price)&#10;Example:&#10;name,quantity,unit,price&#10;Cement,10,bags,50&#10;Sand,5,tons,100"
        value={csvText}
        onChange={(e) => setCsvText(e.target.value)}
        style={{
          width: '100%',
          height: '100px',
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(102, 126, 234, 0.3)',
          borderRadius: '8px',
          color: 'white',
          fontFamily: "'Inter', sans-serif",
          padding: 'var(--spacing-sm)',
          marginBottom: 'var(--spacing-sm)'
        }}
      />
      <button
        onClick={parseCSV}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: 'var(--spacing-sm) var(--spacing-md)',
          cursor: 'pointer',
          marginRight: 'var(--spacing-sm)',
          fontFamily: "'Poppins', sans-serif"
        }}
      >
        Preview
      </button>
      {previewItems.length > 0 && (
        <div style={{ marginTop: 'var(--spacing-sm)' }}>
          <h5 style={{ color: '#ffffff', fontFamily: "'Inter', sans-serif" }}>Preview</h5>
          {previewItems.map((item, idx) => (
            <div key={idx} style={{ color: '#ffffff', fontFamily: "'Inter', sans-serif", marginBottom: 'var(--spacing-xs)' }}>
              {item.name}: Qty {item.quantity} {item.unit}, Price ${item.pricePerUnit}
            </div>
          ))}
          <button
            onClick={addItems}
            style={{
              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              cursor: 'pointer',
              marginTop: 'var(--spacing-sm)',
              fontFamily: "'Poppins', sans-serif"
            }}
          >
            Add Items
          </button>
        </div>
      )}
      {errors.length > 0 && (
        <div style={{ marginTop: 'var(--spacing-sm)' }}>
          <h5 style={{ color: '#ff6b6b', fontFamily: "'Inter', sans-serif" }}>Errors</h5>
          {errors.map((err, idx) => (
            <div key={idx} style={{ color: '#ff6b6b', fontFamily: "'Inter', sans-serif" }}>{err}</div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BulkImport