import React, { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { api } from '../utils/api'
import jsPDF from 'jspdf'
import { FileText, Eye, Edit, Download, Trash2, Plus, Sparkles, Palette, Zap } from 'lucide-react'

const Quotes = () => {
  const [quotes, setQuotes] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedQuote, setSelectedQuote] = useState(null)
  const [editingQuote, setEditingQuote] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const projectId = searchParams.get('projectId')

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    projectId: projectId || '',
    marginPct: 20,
    nodes: [],
    staff: [],
    equipment: []
  })

  // Available items for selection
  const [availableNodes, setAvailableNodes] = useState([])
  const [availableStaff, setAvailableStaff] = useState([])
  const [availableEquipment, setAvailableEquipment] = useState([])

  useEffect(() => {
    fetchData()
    if (projectId) {
      setFormData(prev => ({ ...prev, projectId }))
    }
  }, [projectId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [quotesRes, projectsRes, nodesRes, staffRes, equipmentRes] = await Promise.all([
        api.get('/quotes'),
        api.get('/projects'),
        api.get('/nodes'),
        api.get('/staff'),
        api.get('/equipment')
      ])

      setQuotes(quotesRes.data.data || quotesRes.data)
      setProjects(projectsRes.data.data || projectsRes.data)
      setAvailableNodes(nodesRes.data.data || nodesRes.data)
      setAvailableStaff(staffRes.data.data || staffRes.data)
      setAvailableEquipment(equipmentRes.data.data || equipmentRes.data)
    } catch (err) {
      console.error('Error fetching data:', err)
      alert('Error loading data: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleViewQuote = (quote) => {
    setSelectedQuote(quote)
  }

  const handleEditQuote = (quote) => {
    setEditingQuote(quote)
    setFormData({
      name: quote.name,
      projectId: quote.projectId,
      marginPct: quote.marginPct,
      nodes: quote.nodes || [],
      staff: quote.staff || [],
      equipment: quote.equipment || []
    })
    setShowCreateForm(true)
  }

  const handleDeleteQuote = async (quoteId) => {
    if (!confirm('Are you sure you want to delete this quote? This action cannot be undone.')) return

    try {
      await api.delete(`/quotes/${quoteId}`)
      setQuotes(quotes.filter(q => q.id !== quoteId))
      alert('Quote deleted successfully')
    } catch (err) {
      alert('Error deleting quote: ' + (err.response?.data?.error || err.message))
    }
  }

  const handleCreateQuote = () => {
    setEditingQuote(null)
    setFormData({
      name: '',
      projectId: projectId || '',
      marginPct: 20,
      nodes: [],
      staff: [],
      equipment: []
    })
    setShowCreateForm(true)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()

    try {
      const quoteData = {
        name: formData.name,
        projectId: formData.projectId,
        marginPct: parseFloat(formData.marginPct),
        nodes: formData.nodes.filter(item => item.nodeId && item.quantity > 0),
        staff: formData.staff.filter(item => item.staffId && item.hours > 0),
        equipment: formData.equipment.filter(item => item.equipmentId && item.hours > 0)
      }

      if (editingQuote) {
        const response = await api.put(`/quotes/${editingQuote.id}`, quoteData)
        setQuotes(quotes.map(q => q.id === editingQuote.id ? response.data : q))
        alert('Quote updated successfully')
      } else {
        const response = await api.post('/quotes', quoteData)
        setQuotes([response.data, ...quotes])
        alert('Quote created successfully')
      }

      setShowCreateForm(false)
      setEditingQuote(null)
    } catch (err) {
      alert('Error saving quote: ' + (err.response?.data?.error || err.message))
    }
  }

  const addItem = (type, itemId) => {
    const itemKey = `${type}Id`
    const arrayName = type + 's'
    const existingItem = formData[arrayName].find(item => item[itemKey] === itemId)

    if (!existingItem) {
      setFormData(prev => ({
        ...prev,
        [arrayName]: [...prev[arrayName], {
          [itemKey]: itemId,
          [type === 'node' ? 'quantity' : 'hours']: 1
        }]
      }))
    }
  }

  const updateItemQuantity = (type, itemId, value) => {
    const itemKey = `${type}Id`
    const arrayName = type + 's'

    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].map(item =>
        item[itemKey] === itemId
          ? { ...item, [type === 'node' ? 'quantity' : 'hours']: parseFloat(value) || 0 }
          : item
      )
    }))
  }

  const removeItem = (type, itemId) => {
    const itemKey = `${type}Id`
    const arrayName = type + 's'

    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter(item => item[itemKey] !== itemId)
    }))
  }

  const calculateItemCost = (type, itemId, quantity) => {
    let item
    switch (type) {
      case 'node':
        item = availableNodes.find(n => n.id === itemId)
        return item ? (parseFloat(item.pricePerUnit) * quantity) : 0
      case 'staff':
        item = availableStaff.find(s => s.id === itemId)
        return item ? (parseFloat(item.chargeOutBase || item.payRateBase) * quantity) : 0
      case 'equipment':
        item = availableEquipment.find(e => e.id === itemId)
        return item ? (parseFloat(item.costRateBase) * quantity) : 0
      default:
        return 0
    }
  }

  const calculateTotalCost = () => {
    let total = 0
    formData.nodes.forEach(item => {
      total += calculateItemCost('node', item.nodeId, item.quantity || 0)
    })
    formData.staff.forEach(item => {
      total += calculateItemCost('staff', item.staffId, item.hours || 0)
    })
    formData.equipment.forEach(item => {
      total += calculateItemCost('equipment', item.equipmentId, item.hours || 0)
    })
    return total
  }

  const calculateTotalRevenue = () => {
    const cost = calculateTotalCost()
    return cost * (1 + (parseFloat(formData.marginPct) / 100))
  }

  const generateProfessionalPDF = (quote) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height
    const margin = 20
    let currentY = margin

    // Add company branding/header
    doc.setFillColor(102, 126, 234) // Primary blue
    doc.rect(0, 0, pageWidth, 40, 'F')

    // Company logo area (placeholder)
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(24)
    doc.text('MasterDiary', margin, 25)

    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Professional Construction Management', margin, 32)

    // Add date and quote number
    const today = new Date().toLocaleDateString()
    doc.setFontSize(10)
    doc.text(`Date: ${today}`, pageWidth - margin - 50, 25)
    doc.text(`Quote #: ${quote.id.slice(-8).toUpperCase()}`, pageWidth - margin - 50, 32)

    currentY = 60

    // Project information section
    doc.setFillColor(248, 249, 250) // Light gray background
    doc.rect(margin, currentY, pageWidth - 2 * margin, 25, 'F')

    doc.setTextColor(33, 37, 41) // Dark text
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text('PROJECT INFORMATION', margin + 5, currentY + 8)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.text(`Project: ${quote.project?.name || 'N/A'}`, margin + 5, currentY + 18)
    doc.text(`Margin: ${quote.marginPct}%`, pageWidth - margin - 40, currentY + 18)

    currentY += 35

    // Financial summary section
    doc.setFillColor(240, 248, 255) // Light blue background
    doc.rect(margin, currentY, pageWidth - 2 * margin, 30, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('FINANCIAL SUMMARY', margin + 5, currentY + 8)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    const summaryY = currentY + 18
    doc.text(`Total Cost: $${quote.totalCost}`, margin + 5, summaryY)
    doc.text(`Total Revenue: $${quote.totalRevenue}`, margin + 80, summaryY)
    doc.text(`Profit Margin: $${(quote.totalRevenue - quote.totalCost).toFixed(2)}`, margin + 155, summaryY)

    currentY += 45

    // Items breakdown
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.text('QUOTE BREAKDOWN', margin, currentY)
    currentY += 10

    // Materials section
    if (quote.nodes && quote.nodes.length > 0) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(102, 126, 234) // Blue
      doc.text('MATERIALS', margin, currentY)
      currentY += 8

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(33, 37, 41) // Dark

      quote.nodes.forEach((item, index) => {
        if (currentY > pageHeight - 30) {
          doc.addPage()
          currentY = margin
        }

        const node = availableNodes.find(n => n.id === item.nodeId)
        if (node) {
          const cost = node.pricePerUnit * item.quantity
          doc.text(`${node.name}`, margin + 5, currentY)
          doc.text(`${item.quantity} ${node.unit}`, margin + 80, currentY)
          doc.text(`$${node.pricePerUnit.toFixed(2)}`, margin + 120, currentY)
          doc.text(`$${cost.toFixed(2)}`, margin + 160, currentY)
          currentY += 6
        }
      })
      currentY += 5
    }

    // Staff section
    if (quote.staff && quote.staff.length > 0) {
      if (currentY > pageHeight - 50) {
        doc.addPage()
        currentY = margin
      }

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(76, 175, 80) // Green
      doc.text('STAFF', margin, currentY)
      currentY += 8

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(33, 37, 41)

      quote.staff.forEach((item, index) => {
        const staff = availableStaff.find(s => s.id === item.staffId)
        if (staff) {
          const rate = staff.chargeOutBase || staff.payRateBase
          const cost = rate * item.hours
          doc.text(`${staff.name}`, margin + 5, currentY)
          doc.text(`${item.hours} hrs`, margin + 80, currentY)
          doc.text(`$${rate.toFixed(2)}/hr`, margin + 120, currentY)
          doc.text(`$${cost.toFixed(2)}`, margin + 160, currentY)
          currentY += 6
        }
      })
      currentY += 5
    }

    // Equipment section
    if (quote.equipment && quote.equipment.length > 0) {
      if (currentY > pageHeight - 50) {
        doc.addPage()
        currentY = margin
      }

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(255, 152, 0) // Orange
      doc.text('EQUIPMENT', margin, currentY)
      currentY += 8

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(33, 37, 41)

      quote.equipment.forEach((item, index) => {
        const equipment = availableEquipment.find(e => e.id === item.equipmentId)
        if (equipment) {
          const cost = equipment.costRateBase * item.hours
          doc.text(`${equipment.name}`, margin + 5, currentY)
          doc.text(`${item.hours} hrs`, margin + 80, currentY)
          doc.text(`$${equipment.costRateBase.toFixed(2)}/hr`, margin + 120, currentY)
          doc.text(`$${cost.toFixed(2)}`, margin + 160, currentY)
          currentY += 6
        }
      })
    }

    // Footer
    const footerY = pageHeight - 20
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8)
    doc.setTextColor(128, 128, 128)
    doc.text('Generated by MasterDiary - Professional Construction Management', pageWidth / 2, footerY, { align: 'center' })
    doc.text(`Quote ID: ${quote.id} | Generated: ${new Date().toLocaleString()}`, pageWidth / 2, footerY + 5, { align: 'center' })

    // Save with professional filename
    const filename = `Quote_${quote.project?.name || 'Project'}_${quote.id.slice(-8)}.pdf`
    doc.save(filename)
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '18px',
        fontFamily: "'Poppins', sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          Loading Professional Quotes...
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      fontFamily: "'Inter', sans-serif",
      padding: '20px'
    }}>
      <style>{`
        .quote-card {
          transition: all 0.3s ease;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
          background: white;
          border: 1px solid rgba(102, 126, 234, 0.1);
        }
        .quote-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(102, 126, 234, 0.15);
        }
        .action-button {
          transition: all 0.2s ease;
          border-radius: 8px;
          border: none;
          padding: 8px 16px;
          font-weight: 500;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
        }
        .action-button:hover {
          transform: translateY(-1px);
        }
        .view-btn { background: linear-gradient(135deg, #17a2b8, #0d8a9a); color: white; }
        .edit-btn { background: linear-gradient(135deg, #ffc107, #e0a800); color: #212529; }
        .pdf-btn { background: linear-gradient(135deg, #6f42c1, #5a359a); color: white; }
        .delete-btn { background: linear-gradient(135deg, #dc3545, #bd2130); color: white; }
        .create-btn {
          background: linear-gradient(135deg, #28a745, #1e7e34);
          color: white;
          padding: 12px 24px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
        }
        .visual-builder-banner {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.25);
          margin: 20px 0;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }
        .modal-content {
          background: white;
          border-radius: 16px;
          padding: 24px;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          animation: slideUp 0.3s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .table-container {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          overflow-x: auto;
        }
        .table-header {
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          border-bottom: 2px solid #dee2e6;
        }
        .status-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
        }
        .status-active { background: #d4edda; color: #155724; }
        .status-pending { background: #fff3cd; color: #856404; }
      `}</style>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <div>
            <h1 style={{
              margin: '0 0 8px 0',
              color: '#2c3e50',
              fontSize: '2.5rem',
              fontWeight: '700',
              fontFamily: "'Poppins', sans-serif",
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              📋 Professional Quotes
            </h1>
            <p style={{
              margin: 0,
              color: '#6c757d',
              fontSize: '1.1rem',
              fontFamily: "'Inter', sans-serif"
            }}>
              Manage your construction quotes with professional tools and beautiful presentations
            </p>
          </div>

          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <Link
              to="/quotes/new"
              style={{
                padding: '14px 28px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '16px',
                boxShadow: '0 6px 16px rgba(102, 126, 234, 0.3)',
                border: '2px solid rgba(255,255,255,0.2)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)'
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.3)'
              }}
            >
              <Palette size={20} />
              🎨 VISUAL QUOTE BUILDER
            </Link>
            <button
              onClick={handleCreateQuote}
              className="create-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Plus size={20} />
              Create Quote
            </button>
          </div>
        </div>

        {/* Visual Builder Banner */}
        <div className="visual-builder-banner">
          <h3 style={{
            margin: '0 0 12px 0',
            color: 'white',
            fontSize: '1.8rem',
            fontWeight: '700',
            fontFamily: "'Poppins', sans-serif",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}>
            <Sparkles size={28} style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))' }} />
            Experience Next-Level Quote Building
          </h3>
          <p style={{
            
            color: 'rgba(255,255,255,0.9)',
            fontSize: '1.1rem',
            fontFamily: "'Inter', sans-serif",
            maxWidth: '600px',
            margin: '0 auto 20px'
          }}>
            Drag & drop materials, staff, and equipment onto an interactive canvas with real-time calculations,
            stunning animations, and professional PDF generation!
          </p>
          <Link
            to="/quotes/new"
            style={{
              
              padding: '14px 32px',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '25px',
              fontWeight: '600',
              fontSize: '18px',
              border: '2px solid rgba(255,255,255,0.5)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.3)'
              e.target.style.transform = 'scale(1.05)'
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'
              e.target.style.transform = 'scale(1)'
            }}
          >
            <Zap size={24} />
            🚀 Launch Visual Builder
          </Link>
        </div>

        {/* Quotes Table */}
        <div className="table-container">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{
              margin: 0,
              color: '#2c3e50',
              fontSize: '1.8rem',
              fontWeight: '600',
              fontFamily: "'Poppins', sans-serif"
            }}>
              Quote Portfolio {projectId && `(Filtered by Project)`}
            </h2>
            <div style={{
              background: '#e9ecef',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '14px',
              color: '#495057'
            }}>
              {quotes.length} Quote{quotes.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: "'Inter', sans-serif"
            }}>
              <thead>
                <tr className="table-header">
                  <th style={{
                    padding: '16px 12px',
                    textAlign: 'left',
                    fontWeight: '600',
                    color: '#495057',
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Quote Details</th>
                  <th style={{
                    padding: '16px 12px',
                    textAlign: 'left',
                    fontWeight: '600',
                    color: '#495057',
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Project</th>
                  <th style={{
                    padding: '16px 12px',
                    textAlign: 'right',
                    fontWeight: '600',
                    color: '#495057',
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Financials</th>
                  <th style={{
                    padding: '16px 12px',
                    textAlign: 'center',
                    fontWeight: '600',
                    color: '#495057',
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map(quote => (
                  <tr key={quote.id} className="quote-card" style={{
                    borderBottom: '1px solid #e9ecef',
                    transition: 'all 0.2s ease'
                  }}>
                    <td style={{ padding: '16px 12px' }}>
                      <div style={{
                        fontWeight: '600',
                        color: '#2c3e50',
                        fontSize: '16px',
                        marginBottom: '4px'
                      }}>
                        {quote.name}
                      </div>
                      <div style={{
                        color: '#6c757d',
                        fontSize: '14px'
                      }}>
                        ID: {quote.id.slice(-8).toUpperCase()}
                      </div>
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <div style={{
                        fontWeight: '500',
                        color: '#495057',
                        fontSize: '15px'
                      }}>
                        {quote.project?.name || 'No Project'}
                      </div>
                    </td>
                    <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                      <div style={{
                        fontWeight: '600',
                        color: '#28a745',
                        fontSize: '16px',
                        marginBottom: '4px'
                      }}>
                        ${quote.totalRevenue}
                      </div>
                      <div style={{
                        color: '#6c757d',
                        fontSize: '14px'
                      }}>
                        Cost: ${quote.totalCost} • Margin: {quote.marginPct}%
                      </div>
                    </td>
                    <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleViewQuote(quote)}
                          className="action-button view-btn"
                          title="View Quote Details"
                        >
                          <Eye size={16} />
                          View
                        </button>
                        <button
                          onClick={() => handleEditQuote(quote)}
                          className="action-button edit-btn"
                          title="Edit Quote"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => generateProfessionalPDF(quote)}
                          className="action-button pdf-btn"
                          title="Download PDF"
                        >
                          <Download size={16} />
                          PDF
                        </button>
                        <button
                          onClick={() => handleDeleteQuote(quote.id)}
                          className="action-button delete-btn"
                          title="Delete Quote"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {quotes.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{
                      padding: '40px',
                      textAlign: 'center',
                      color: '#6c757d',
                      fontSize: '16px'
                    }}>
                      <FileText size={48} style={{ color: '#dee2e6', marginBottom: '16px' }} />
                      <div>No quotes found. Create your first professional quote!</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Quote Modal */}
        {selectedQuote && (
          <div className="modal-overlay" onClick={() => setSelectedQuote(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '2px solid #e9ecef'
              }}>
                <h2 style={{
                  margin: 0,
                  color: '#2c3e50',
                  fontSize: '1.8rem',
                  fontWeight: '700',
                  fontFamily: "'Poppins', sans-serif"
                }}>
                  📋 Quote Details: {selectedQuote.name}
                </h2>
                <button
                  onClick={() => setSelectedQuote(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#6c757d',
                    padding: '4px'
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    background: '#f8f9fa',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #dee2e6'
                  }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#495057' }}>Project Information</h4>
                    <p style={{ margin: '4px 0', color: '#2c3e50', fontWeight: '500' }}>
                      <strong>Project:</strong> {selectedQuote.project?.name || 'N/A'}
                    </p>
                    <p style={{ margin: '4px 0', color: '#2c3e50', fontWeight: '500' }}>
                      <strong>Margin:</strong> {selectedQuote.marginPct}%
                    </p>
                  </div>

                  <div style={{
                    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                    padding: '16px',
                    borderRadius: '8px',
                    color: 'white'
                  }}>
                    <h4 style={{ margin: '0 0 8px 0' }}>Financial Summary</h4>
                    <p style={{ margin: '4px 0', fontSize: '18px', fontWeight: 'bold' }}>
                      Revenue: ${selectedQuote.totalRevenue}
                    </p>
                    <p style={{ margin: '4px 0' }}>
                      Cost: ${selectedQuote.totalCost}
                    </p>
                    <p style={{ margin: '4px 0' }}>
                      Profit: ${(selectedQuote.totalRevenue - selectedQuote.totalCost).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Items Breakdown */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                  {selectedQuote.nodes && selectedQuote.nodes.length > 0 && (
                    <div style={{
                      background: '#f8f9fa',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #dee2e6'
                    }}>
                      <h4 style={{ margin: '0 0 12px 0', color: '#495057', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Package size={20} style={{ color: '#667eea' }} />
                        Materials
                      </h4>
                      {selectedQuote.nodes.map((item, index) => {
                        const node = availableNodes.find(n => n.id === item.nodeId)
                        return (
                          <div key={index} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px',
                            marginBottom: '8px',
                            background: 'white',
                            borderRadius: '6px',
                            border: '1px solid #e9ecef'
                          }}>
                            <div>
                              <div style={{ fontWeight: '500', color: '#2c3e50' }}>{node?.name}</div>
                              <div style={{ fontSize: '14px', color: '#6c757d' }}>
                                {item.quantity} {node?.unit} × ${node?.pricePerUnit}
                              </div>
                            </div>
                            <div style={{ fontWeight: '600', color: '#28a745' }}>
                              ${(node?.pricePerUnit * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {selectedQuote.staff && selectedQuote.staff.length > 0 && (
                    <div style={{
                      background: '#f8f9fa',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #dee2e6'
                    }}>
                      <h4 style={{ margin: '0 0 12px 0', color: '#495057', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <User size={20} style={{ color: '#28a745' }} />
                        Staff
                      </h4>
                      {selectedQuote.staff.map((item, index) => {
                        const staff = availableStaff.find(s => s.id === item.staffId)
                        const rate = staff?.chargeOutBase || staff?.payRateBase
                        return (
                          <div key={index} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px',
                            marginBottom: '8px',
                            background: 'white',
                            borderRadius: '6px',
                            border: '1px solid #e9ecef'
                          }}>
                            <div>
                              <div style={{ fontWeight: '500', color: '#2c3e50' }}>{staff?.name}</div>
                              <div style={{ fontSize: '14px', color: '#6c757d' }}>
                                {item.hours} hours × ${rate}/hr
                              </div>
                            </div>
                            <div style={{ fontWeight: '600', color: '#28a745' }}>
                              ${(rate * item.hours).toFixed(2)}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {selectedQuote.equipment && selectedQuote.equipment.length > 0 && (
                    <div style={{
                      background: '#f8f9fa',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #dee2e6'
                    }}>
                      <h4 style={{ margin: '0 0 12px 0', color: '#495057', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Wrench size={20} style={{ color: '#ffc107' }} />
                        Equipment
                      </h4>
                      {selectedQuote.equipment.map((item, index) => {
                        const equipment = availableEquipment.find(e => e.id === item.equipmentId)
                        return (
                          <div key={index} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px',
                            marginBottom: '8px',
                            background: 'white',
                            borderRadius: '6px',
                            border: '1px solid #e9ecef'
                          }}>
                            <div>
                              <div style={{ fontWeight: '500', color: '#2c3e50' }}>{equipment?.name}</div>
                              <div style={{ fontSize: '14px', color: '#6c757d' }}>
                                {item.hours} hours × ${equipment?.costRateBase}/hr
                              </div>
                            </div>
                            <div style={{ fontWeight: '600', color: '#28a745' }}>
                              ${(equipment?.costRateBase * item.hours).toFixed(2)}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
                paddingTop: '16px',
                borderTop: '1px solid #e9ecef'
              }}>
                <button
                  onClick={() => generateProfessionalPDF(selectedQuote)}
                  style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #6f42c1, #5a359a)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Download size={16} />
                  Download PDF
                </button>
                <button
                  onClick={() => setSelectedQuote(null)}
                  style={{
                    padding: '10px 20px',
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create/Edit Quote Form - Simplified */}
        {showCreateForm && (
          <div className="modal-overlay" onClick={() => { setShowCreateForm(false); setEditingQuote(null) }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div style={{ textAlign: 'center', marginBottom: '24px', padding: '20px', backgroundColor: '#e9ecef', borderRadius: '8px' }}>
                <h4>💡 For Advanced Quote Building:</h4>
                <p style={{ margin: '8px 0 16px 0', color: '#495057' }}>
                  Use the <strong>VISUAL QUOTE BUILDER</strong> for drag-and-drop interface with real-time calculations and stunning animations!
                </p>
                <Link
                  to="/quotes/new"
                  style={{
                    
                    marginTop: '8px',
                    padding: '12px 24px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
                >
                  🚀 Go to Visual Builder →
                </Link>
              </div>

              <h3 style={{
                margin: '0 0 24px 0',
                color: '#2c3e50',
                fontSize: '1.5rem',
                fontWeight: '600',
                fontFamily: "'Poppins', sans-serif"
              }}>
                {editingQuote ? 'Edit Quote (Basic Form)' : 'Create Quote (Basic Form)'}
              </h3>

              <form onSubmit={handleFormSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#495057',
                    fontSize: '14px'
                  }}>
                    Quote Name:
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ced4da',
                      borderRadius: '6px',
                      fontSize: '16px',
                      fontFamily: "'Inter', sans-serif"
                    }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#495057',
                    fontSize: '14px'
                  }}>
                    Project:
                  </label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ced4da',
                      borderRadius: '6px',
                      fontSize: '16px',
                      fontFamily: "'Inter', sans-serif",
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="">Select Project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: '#495057',
                    fontSize: '14px'
                  }}>
                    Margin Percentage:
                  </label>
                  <input
                    type="number"
                    value={formData.marginPct}
                    onChange={(e) => setFormData({ ...formData, marginPct: e.target.value })}
                    min="0"
                    max="100"
                    step="0.1"
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #ced4da',
                      borderRadius: '6px',
                      fontSize: '16px',
                      fontFamily: "'Inter', sans-serif"
                    }}
                  />
                </div>

                <div style={{
                  textAlign: 'right',
                  paddingTop: '16px',
                  borderTop: '1px solid #e9ecef'
                }}>
                  <button
                    type="button"
                    onClick={() => { setShowCreateForm(false); setEditingQuote(null) }}
                    style={{
                      marginRight: '12px',
                      padding: '12px 24px',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '16px'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '16px'
                    }}
                  >
                    {editingQuote ? 'Update Quote' : 'Create Quote'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Quotes
