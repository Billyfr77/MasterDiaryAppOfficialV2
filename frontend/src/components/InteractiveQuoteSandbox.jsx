// Interactive Quote Sandbox Component
// Add this as a new component in your components folder
// Then import and add to Landing.jsx

import React, { useState, useEffect } from 'react'
import { Plus, Minus, Share2, Save, RotateCcw, TrendingUp, DollarSign, Users, Wrench, Package } from 'lucide-react'

const InteractiveQuoteSandbox = () => {
  const [quoteItems, setQuoteItems] = useState([])
  const [margin, setMargin] = useState(25)
  const [totalCost, setTotalCost] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalProfit, setTotalProfit] = useState(0)
  const [savedQuotes, setSavedQuotes] = useState([])

  // Dummy data for the sandbox
  const dummyData = {
    materials: [
      { id: 1, name: 'Concrete', category: 'Foundation', pricePerUnit: 125, unit: 'cubic yard', icon: '🏗️' },
      { id: 2, name: 'Steel Rebar', category: 'Structural', pricePerUnit: 0.85, unit: 'lb', icon: '🔧' },
      { id: 3, name: 'Lumber 2x4', category: 'Framing', pricePerUnit: 3.25, unit: 'linear foot', icon: '🌲' },
      { id: 4, name: 'Drywall Sheets', category: 'Interior', pricePerUnit: 12.50, unit: 'sheet', icon: '🏠' },
      { id: 5, name: 'Roofing Shingles', category: 'Roofing', pricePerUnit: 85, unit: 'square', icon: '🏡' }
    ],
    staff: [
      { id: 101, name: 'Project Manager', role: 'Management', payRate: 75, chargeRate: 125, icon: '👔' },
      { id: 102, name: 'Lead Carpenter', role: 'Skilled Labor', payRate: 45, chargeRate: 85, icon: '👷' },
      { id: 103, name: 'Electrician', role: 'Specialized', payRate: 55, chargeRate: 95, icon: '⚡' },
      { id: 104, name: 'Laborer', role: 'General Labor', payRate: 25, chargeRate: 50, icon: '🔨' }
    ],
    equipment: [
      { id: 201, name: 'Excavator', category: 'Heavy Equipment', costRate: 250, icon: '🏗️' },
      { id: 202, name: 'Concrete Mixer', category: 'Construction', costRate: 75, icon: '🔄' },
      { id: 203, name: 'Forklift', category: 'Material Handling', costRate: 125, icon: '📦' },
      { id: 204, name: 'Generator', category: 'Power', costRate: 50, icon: '⚡' }
    ]
  }

  // Calculate totals whenever quoteItems or margin changes
  useEffect(() => {
    let cost = 0
    let revenue = 0

    quoteItems.forEach(item => {
      if (item.type === 'material') {
        const itemCost = item.quantity * item.pricePerUnit
        cost += itemCost
        revenue += itemCost * (1 + margin / 100)
      } else if (item.type === 'staff') {
        const itemCost = item.hours * item.payRate
        const itemRevenue = item.hours * item.chargeRate
        cost += itemCost
        revenue += itemRevenue
      } else if (item.type === 'equipment') {
        const itemCost = item.days * item.costRate
        cost += itemCost
        revenue += itemCost * (1 + margin / 100)
      }
    })

    setTotalCost(cost)
    setTotalRevenue(revenue)
    setTotalProfit(revenue - cost)
  }, [quoteItems, margin])

  // Add item to quote
  const addItem = (item, type) => {
    const existingItem = quoteItems.find(qi =>
      qi.id === item.id && qi.type === type
    )

    if (existingItem) {
      // Increase quantity/hours/days
      setQuoteItems(quoteItems.map(qi =>
        qi.id === item.id && qi.type === type
          ? type === 'material'
            ? { ...qi, quantity: qi.quantity + 1 }
            : type === 'staff'
            ? { ...qi, hours: qi.hours + 8 }
            : { ...qi, days: qi.days + 1 }
          : qi
      ))
    } else {
      // Add new item
      const newItem = {
        ...item,
        type,
        quantity: type === 'material' ? 1 : undefined,
        hours: type === 'staff' ? 8 : undefined,
        days: type === 'equipment' ? 1 : undefined
      }
      setQuoteItems([...quoteItems, newItem])
    }
  }

  // Remove item from quote
  const removeItem = (itemId, type) => {
    setQuoteItems(quoteItems.filter(item => !(item.id === itemId && item.type === type)))
  }

  // Adjust quantity/hours/days
  const adjustQuantity = (itemId, type, change) => {
    setQuoteItems(quoteItems.map(item => {
      if (item.id === itemId && item.type === type) {
        if (type === 'material') {
          const newQuantity = Math.max(0, item.quantity + change)
          return newQuantity === 0 ? null : { ...item, quantity: newQuantity }
        } else if (type === 'staff') {
          const newHours = Math.max(0, item.hours + change)
          return newHours === 0 ? null : { ...item, hours: newHours }
        } else if (type === 'equipment') {
          const newDays = Math.max(0, item.days + change)
          return newDays === 0 ? null : { ...item, days: newDays }
        }
      }
      return item
    }).filter(Boolean))
  }

  // Save current quote
  const saveQuote = () => {
    const quoteData = {
      id: Date.now(),
      items: quoteItems,
      margin,
      totals: { cost: totalCost, revenue: totalRevenue, profit: totalProfit },
      timestamp: new Date().toISOString()
    }

    const updatedSaved = [quoteData, ...savedQuotes.slice(0, 4)] // Keep only last 5
    setSavedQuotes(updatedSaved)
    localStorage.setItem('sandboxQuotes', JSON.stringify(updatedSaved))

    // Show success message
    alert('Quote saved! You can now share it with others.')
  }

  // Share quote
  const shareQuote = () => {
    const shareData = {
      items: quoteItems.length,
      profit: totalProfit.toFixed(2),
      margin: margin
    }

    const shareUrl = `${window.location.origin}/sandbox?${new URLSearchParams(shareData).toString()}`

    if (navigator.share) {
      navigator.share({
        title: 'My Construction Quote',
        text: `Check out this quote I created: $${totalProfit.toFixed(2)} profit with ${margin}% margin`,
        url: shareUrl
      })
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/sandbox?${new URLSearchParams(shareData).toString()}`)
      alert('Share link copied to clipboard!')
    }
  }

  // Load saved quotes on mount
  useEffect(() => {
    const saved = localStorage.getItem('sandboxQuotes')
    if (saved) {
      try {
        setSavedQuotes(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading saved quotes:', e)
      }
    }
  }, [])

  // Reset sandbox
  const resetSandbox = () => {
    setQuoteItems([])
    setMargin(25)
  }

  return (
    <section className="sandbox-section">
      <div className="container">
        <div className="sandbox-header">
          <div className="section-badge">
            <Package size={24} />
            <span>INTERACTIVE SANDBOX</span>
          </div>
          <h2 className="section-title">Try the Revolution Yourself</h2>
          <p className="section-subtitle">
            Build a sample quote with our drag-and-drop system. No signup required—just click to add items and watch your profits grow!
          </p>
        </div>

        <div className="sandbox-container">
          {/* Item Library */}
          <div className="item-library">
            <h3>Click to Add Items</h3>

            <div className="item-category">
              <h4><Package size={16} /> Materials</h4>
              <div className="item-grid">
                {dummyData.materials.map(item => (
                  <div key={item.id} className="library-item" onClick={() => addItem(item, 'material')}>
                    <div className="item-icon">{item.icon}</div>
                    <div className="item-details">
                      <div className="item-name">{item.name}</div>
                      <div className="item-price">${item.pricePerUnit}/{item.unit}</div>
                    </div>
                    <Plus size={16} className="add-icon" />
                  </div>
                ))}
              </div>
            </div>

            <div className="item-category">
              <h4><Users size={16} /> Staff</h4>
              <div className="item-grid">
                {dummyData.staff.map(item => (
                  <div key={item.id} className="library-item" onClick={() => addItem(item, 'staff')}>
                    <div className="item-icon">{item.icon}</div>
                    <div className="item-details">
                      <div className="item-name">{item.name}</div>
                      <div className="item-price">${item.chargeRate}/hr</div>
                    </div>
                    <Plus size={16} className="add-icon" />
                  </div>
                ))}
              </div>
            </div>

            <div className="item-category">
              <h4><Wrench size={16} /> Equipment</h4>
              <div className="item-grid">
                {dummyData.equipment.map(item => (
                  <div key={item.id} className="library-item" onClick={() => addItem(item, 'equipment')}>
                    <div className="item-icon">{item.icon}</div>
                    <div className="item-details">
                      <div className="item-name">{item.name}</div>
                      <div className="item-price">${item.costRate}/day</div>
                    </div>
                    <Plus size={16} className="add-icon" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quote Canvas */}
          <div className="quote-canvas">
            <div className="canvas-header">
              <h3>Your Quote</h3>
              <div className="canvas-controls">
                <button className="control-btn" onClick={resetSandbox}>
                  <RotateCcw size={16} />
                  Reset
                </button>
                <button className="control-btn" onClick={saveQuote} disabled={quoteItems.length === 0}>
                  <Save size={16} />
                  Save
                </button>
                <button className="control-btn" onClick={shareQuote} disabled={quoteItems.length === 0}>
                  <Share2 size={16} />
                  Share
                </button>
              </div>
            </div>

            <div className="canvas-items">
              {quoteItems.length === 0 ? (
                <div className="empty-canvas">
                  <Package size={48} />
                  <p>Click items from the library to add them to your quote</p>
                </div>
              ) : (
                quoteItems.map((item, index) => (
                  <div key={`${item.type}-${item.id}`} className="canvas-item">
                    <div className="item-icon">{item.icon}</div>
                    <div className="item-content">
                      <div className="item-name">{item.name}</div>
                      <div className="item-meta">
                        {item.type === 'material' && `${item.quantity} ${item.unit}`}
                        {item.type === 'staff' && `${item.hours} hours`}
                        {item.type === 'equipment' && `${item.days} days`}
                      </div>
                    </div>
                    <div className="item-controls">
                      <button onClick={() => adjustQuantity(item.id, item.type, -1)}>
                        <Minus size={14} />
                      </button>
                      <span className="quantity">
                        {item.type === 'material' ? item.quantity :
                         item.type === 'staff' ? item.hours :
                         item.days}
                      </span>
                      <button onClick={() => adjustQuantity(item.id, item.type, 1)}>
                        <Plus size={14} />
                      </button>
                      <button className="remove-btn" onClick={() => removeItem(item.id, item.type)}>
                        ×
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Calculations Panel */}
          <div className="calculations-panel">
            <div className="margin-control">
              <label>Margin: {margin}%</label>
              <input
                type="range"
                min="0"
                max="50"
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="margin-slider"
              />
            </div>

            <div className="calculation-results">
              <div className="result-item">
                <div className="result-label">Total Cost</div>
                <div className="result-value cost">${totalCost.toLocaleString()}</div>
              </div>
              <div className="result-item">
                <div className="result-label">Total Revenue</div>
                <div className="result-value revenue">${totalRevenue.toLocaleString()}</div>
              </div>
              <div className="result-item profit">
                <div className="result-label">Net Profit</div>
                <div className={`result-value profit ${totalProfit >= 0 ? 'positive' : 'negative'}`}>
                  ${totalProfit.toLocaleString()}
                  {totalProfit > 0 && <TrendingUp size={16} />}
                </div>
              </div>
            </div>

            <div className="profit-meter">
              <div className="meter-fill" style={{
                width: `${Math.min((totalProfit / totalRevenue) * 100, 100)}%`,
                background: totalProfit > 0 ? '#4ecdc4' : '#ff6b6b'
              }}></div>
            </div>

            {savedQuotes.length > 0 && (
              <div className="saved-quotes">
                <h4>Your Saved Quotes</h4>
                {savedQuotes.slice(0, 3).map(quote => (
                  <div key={quote.id} className="saved-quote">
                    <div className="quote-info">
                      <span>{quote.items.length} items</span>
                      <span>${quote.totals.profit.toFixed(2)} profit</span>
                    </div>
                    <div className="quote-date">
                      {new Date(quote.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .sandbox-section {
          padding: 100px 0;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        }

        .sandbox-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .section-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
          padding: 8px 16px;
          border-radius: 50px;
          font-size: 0.9em;
          font-weight: bold;
          margin-bottom: 24px;
        }

        .section-title {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 900;
          margin-bottom: 16px;
          color: #333;
        }

        .section-subtitle {
          font-size: 1.2rem;
          color: #666;
          max-width: 600px;
          margin: 0 auto;
        }

        .sandbox-container {
          display: grid;
          grid-template-columns: 1fr 2fr 1fr;
          gap: 32px;
          align-items: start;
        }

        .item-library {
          background: white;
          padding: 24px;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .item-category {
          margin-bottom: 32px;
        }

        .item-category h4 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          color: #333;
          font-weight: 600;
        }

        .item-grid {
          display: grid;
          gap: 12px;
        }

        .library-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border: 1px solid #e9ecef;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .library-item:hover {
          border-color: #667eea;
          background: rgba(102, 126, 234, 0.05);
          transform: translateX(4px);
        }

        .add-icon {
          color: #667eea;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .library-item:hover .add-icon {
          opacity: 1;
        }

        .quote-canvas {
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .canvas-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #e9ecef;
        }

        .canvas-controls {
          display: flex;
          gap: 8px;
        }

        .control-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border: 1px solid #e9ecef;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .control-btn:hover:not(:disabled) {
          border-color: #667eea;
          color: #667eea;
        }

        .control-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .canvas-items {
          padding: 24px;
          min-height: 300px;
        }

        .empty-canvas {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: #999;
          text-align: center;
        }

        .canvas-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          border: 1px solid #e9ecef;
          border-radius: 12px;
          margin-bottom: 12px;
          transition: all 0.3s ease;
        }

        .canvas-item:hover {
          border-color: #667eea;
          background: rgba(102, 126, 234, 0.02);
        }

        .item-content {
          flex: 1;
        }

        .item-name {
          font-weight: 600;
          color: #333;
        }

        .item-meta {
          font-size: 0.9rem;
          color: #666;
          margin-top: 4px;
        }

        .item-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .quantity {
          min-width: 40px;
          text-align: center;
          font-weight: 600;
        }

        .remove-btn {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: none;
          background: #ff6b6b;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          transition: all 0.3s ease;
        }

        .remove-btn:hover {
          background: #e63946;
        }

        .calculations-panel {
          background: white;
          padding: 24px;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .margin-control {
          margin-bottom: 24px;
        }

        .margin-control label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #333;
        }

        .margin-slider {
          width: 100%;
          -webkit-appearance: none;
          height: 8px;
          border-radius: 4px;
          background: #e9ecef;
          outline: none;
        }

        .margin-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #667eea;
          cursor: pointer;
        }

        .calculation-results {
          margin-bottom: 24px;
        }

        .result-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f8f9fa;
        }

        .result-item.profit {
          border-bottom: none;
          font-size: 1.2rem;
          font-weight: 700;
        }

        .result-label {
          color: #666;
        }

        .result-value {
          font-weight: 600;
        }

        .result-value.cost {
          color: #ff6b6b;
        }

        .result-value.revenue {
          color: #4ecdc4;
        }

        .result-value.profit.positive {
          color: #4ecdc4;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .result-value.profit.negative {
          color: #ff6b6b;
        }

        .profit-meter {
          height: 8px;
          background: #e9ecef;
          border-radius: 4px;
          margin-bottom: 24px;
          overflow: hidden;
        }

        .meter-fill {
          height: 100%;
          transition: width 0.5s ease;
        }

        .saved-quotes {
          border-top: 1px solid #e9ecef;
          padding-top: 24px;
        }

        .saved-quotes h4 {
          margin-bottom: 16px;
          color: #333;
        }

        .saved-quote {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 8px;
          margin-bottom: 8px;
        }

        .quote-info {
          display: flex;
          gap: 16px;
          font-size: 0.9rem;
        }

        .quote-date {
          font-size: 0.8rem;
          color: #666;
        }

        @media (max-width: 1024px) {
          .sandbox-container {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .item-library {
            order: 2;
          }

          .quote-canvas {
            order: 1;
          }

          .calculations-panel {
            order: 3;
          }
        }

        @media (max-width: 768px) {
          .canvas-header {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .canvas-controls {
            justify-content: center;
          }

          .item-grid {
            grid-template-columns: 1fr;
          }

          .library-item {
            padding: 16px;
          }

          .result-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
        }
      `}</style>
    </section>
  )
}

export default InteractiveQuoteSandbox