/*
 * Client Invoice Component - Professional, Client-Ready
 * Shows only costs, no internal details
 */

import React, { useState } from 'react'
import { FileText, Download, Printer, Building, Phone, Mail, MapPin } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const ClientInvoice = ({ entry, companyInfo, onClose }) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  // Calculate totals for client view (only revenue, no costs)
  const subtotal = entry.items.reduce((sum, item) => sum + (item.revenue || 0), 0)
  const taxRate = 0.1 // 10% tax
  const tax = subtotal * taxRate
  const total = subtotal + tax

  const generatePDF = async () => {
    setIsGeneratingPDF(true)
    try {
      const invoiceElement = document.getElementById('client-invoice')

      const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')

      const imgWidth = 210 // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      pdf.save(`Invoice-${entry.id}-${entry.time.replace(/:/g, '-')}.pdf`)

    } catch (error) {
      console.error('PDF generation error:', error)
      alert('PDF generation failed. Please try again.')
    }
    setIsGeneratingPDF(false)
  }

  const printInvoice = () => {
    window.print()
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        {/* Header Actions */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e9ecef',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, color: '#2c3e50' }}>Client Invoice</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={generatePDF}
              disabled={isGeneratingPDF}
              style={{
                padding: '8px 16px',
                background: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Download size={16} />
              {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
            </button>
            <button
              onClick={printInvoice}
              style={{
                padding: '8px 16px',
                background: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Printer size={16} />
              Print
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div
          id="client-invoice"
          style={{
            padding: '40px',
            fontFamily: "'Times New Roman', serif",
            color: '#2c3e50'
          }}
        >
          {/* Company Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '40px',
            borderBottom: '2px solid #4ecdc4',
            paddingBottom: '20px'
          }}>
            <div>
              <h1 style={{
                margin: '0 0 8px 0',
                color: '#4ecdc4',
                fontSize: '2.5rem',
                fontWeight: 'bold'
              }}>
                {companyInfo?.name || 'MasterDiary Construction'}
              </h1>
              <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                {companyInfo?.address && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <MapPin size={14} />
                    {companyInfo.address}
                  </div>
                )}
                {companyInfo?.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Phone size={14} />
                    {companyInfo.phone}
                  </div>
                )}
                {companyInfo?.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={14} />
                    {companyInfo.email}
                  </div>
                )}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <h2 style={{ margin: '0 0 16px 0', color: '#2c3e50' }}>INVOICE</h2>
              <div style={{ fontSize: '0.9rem' }}>
                <div><strong>Invoice #:</strong> INV-{entry.id}</div>
                <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
                <div><strong>Work Date:</strong> {entry.time}</div>
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '40px'
          }}>
            <div>
              <h3 style={{ margin: '0 0 12px 0', color: '#4ecdc4' }}>Bill To:</h3>
              <div style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                <div><strong>{entry.project || 'Client Name'}</strong></div>
                <div>Project: {entry.project || 'Construction Work'}</div>
                {entry.location && <div>Location: {entry.location.lat.toFixed(4)}, {entry.location.lng.toFixed(4)}</div>}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <h3 style={{ margin: '0 0 12px 0', color: '#4ecdc4' }}>Project Details:</h3>
              <div style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                <div><strong>Service Date:</strong> {entry.time}</div>
                <div><strong>Project:</strong> {entry.project || 'General Construction'}</div>
                <div><strong>Status:</strong> Completed</div>
              </div>
            </div>
          </div>

          {/* Services Table */}
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: '30px',
            fontSize: '0.9rem'
          }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{
                  padding: '12px',
                  textAlign: 'left',
                  border: '1px solid #dee2e6',
                  fontWeight: 'bold'
                }}>
                  Description
                </th>
                <th style={{
                  padding: '12px',
                  textAlign: 'center',
                  border: '1px solid #dee2e6',
                  fontWeight: 'bold',
                  width: '100px'
                }}>
                  Qty
                </th>
                <th style={{
                  padding: '12px',
                  textAlign: 'center',
                  border: '1px solid #dee2e6',
                  fontWeight: 'bold',
                  width: '100px'
                }}>
                  Rate
                </th>
                <th style={{
                  padding: '12px',
                  textAlign: 'right',
                  border: '1px solid #dee2e6',
                  fontWeight: 'bold',
                  width: '120px'
                }}>
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {entry.items.map((item, index) => (
                <tr key={index}>
                  <td style={{
                    padding: '12px',
                    border: '1px solid #dee2e6'
                  }}>
                    <div style={{ fontWeight: '500' }}>
                      {item.name}
                    </div>
                    {item.type === 'staff' && (
                      <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                        Labor services ({item.duration}h × {item.quantity || 1} worker{item.quantity > 1 ? 's' : ''})
                      </div>
                    )}
                    {item.type === 'equipment' && (
                      <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                        Equipment rental ({item.duration}h × {item.quantity || 1} unit{item.quantity > 1 ? 's' : ''})
                      </div>
                    )}
                    {item.type === 'material' && (
                      <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                        Materials ({item.quantity || 1} unit{item.quantity > 1 ? 's' : ''})
                      </div>
                    )}
                  </td>
                  <td style={{
                    padding: '12px',
                    textAlign: 'center',
                    border: '1px solid #dee2e6'
                  }}>
                    {item.quantity || 1}
                  </td>
                  <td style={{
                    padding: '12px',
                    textAlign: 'center',
                    border: '1px solid #dee2e6'
                  }}>
                    ${(item.revenue / ((item.quantity || 1) * (item.duration || 1))).toFixed(2)}
                    {item.type === 'material' ? '' : '/hr'}
                  </td>
                  <td style={{
                    padding: '12px',
                    textAlign: 'right',
                    border: '1px solid #dee2e6',
                    fontWeight: '500'
                  }}>
                    ${item.revenue.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Notes */}
          {entry.note && (
            <div style={{ marginBottom: '30px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#4ecdc4' }}>Work Description:</h4>
              <p style={{
                margin: 0,
                padding: '12px',
                background: '#f8f9fa',
                borderRadius: '6px',
                lineHeight: '1.6'
              }}>
                {entry.note}
              </p>
            </div>
          )}

          {/* Totals */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '40px'
          }}>
            <div style={{ width: '250px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid #dee2e6'
              }}>
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: '1px solid #dee2e6'
              }}>
                <span>Tax (10%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 0',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                borderTop: '2px solid #4ecdc4',
                marginTop: '8px'
              }}>
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            textAlign: 'center',
            paddingTop: '20px',
            borderTop: '1px solid #dee2e6',
            color: '#6c757d',
            fontSize: '0.8rem'
          }}>
            <p style={{ margin: '0 0 8px 0' }}>
              Thank you for choosing {companyInfo?.name || 'MasterDiary Construction'} for your construction needs.
            </p>
            <p style={{ margin: 0 }}>
              Payment is due within 30 days. Please include invoice number on your payment.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClientInvoice