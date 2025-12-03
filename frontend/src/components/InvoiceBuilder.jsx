import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../utils/api';
import { FileText, Save, Plus, Trash2, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const InvoiceBuilder = () => {
  const location = useLocation();
  const [invoice, setInvoice] = useState({
    clientName: '',
    clientEmail: '',
    items: [],
    status: 'draft',
    dueDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  // Load Invoice Data from PaintDiary if available
  useEffect(() => {
    if (location.state?.diaryItems) {
      const newItems = location.state.diaryItems.map(item => ({
        description: item.name,
        quantity: item.quantity || item.duration || 1,
        rate: item.chargeRate || 0,
        amount: (item.quantity || item.duration || 1) * (item.chargeRate || 0)
      }));
      setInvoice(prev => ({ ...prev, items: newItems }));
    }
  }, [location.state]);

  const handleAddItem = () => {
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, rate: 0, amount: 0 }]
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...invoice.items];
    newItems[index][field] = value;
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }
    setInvoice(prev => ({ ...prev, items: newItems }));
  };

  const handleRemoveItem = (index) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotal = () => {
    return invoice.items.reduce((acc, item) => acc + item.amount, 0);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.post('/invoices', {
        ...invoice,
        totalAmount: calculateTotal()
      });
      alert('Invoice saved successfully!');
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Failed to save invoice.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('INVOICE', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Client: ${invoice.clientName}`, 20, 40);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 50);
    doc.text(`Due Date: ${invoice.dueDate}`, 20, 60);

    // Table
    const tableColumn = ["Description", "Quantity", "Rate", "Amount"];
    const tableRows = [];

    invoice.items.forEach(item => {
      const itemData = [
        item.description,
        item.quantity,
        `$${item.rate}`,
        `$${item.amount}`
      ];
      tableRows.push(itemData);
    });

    autoTable(doc, {
      startY: 70,
      head: [tableColumn],
      body: tableRows,
      foot: [['', '', 'Total', `$${calculateTotal()}`]],
    });

    doc.save(`invoice_${invoice.clientName}_${new Date().getTime()}.pdf`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white dark:bg-stone-900 rounded-xl shadow-lg animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <FileText className="text-indigo-500" /> Invoice Builder
        </h2>
        <div className="flex gap-2">
          <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors">
            <Download size={18} /> PDF
          </button>
          <button onClick={handleSave} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
            <Save size={18} /> {loading ? 'Saving...' : 'Save Invoice'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client Name</label>
          <input
            type="text"
            value={invoice.clientName}
            onChange={(e) => setInvoice({ ...invoice, clientName: e.target.value })}
            className="w-full p-2 border border-gray-300 dark:border-stone-700 rounded-lg bg-transparent dark:text-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
          <input
            type="date"
            value={invoice.dueDate}
            onChange={(e) => setInvoice({ ...invoice, dueDate: e.target.value })}
            className="w-full p-2 border border-gray-300 dark:border-stone-700 rounded-lg bg-transparent dark:text-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Line Items</h3>
          <button onClick={handleAddItem} className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-500">
            <Plus size={16} /> Add Item
          </button>
        </div>
        
        <div className="space-y-2">
          {invoice.items.map((item, index) => (
            <div key={index} className="flex gap-4 items-center bg-gray-50 dark:bg-stone-800/50 p-3 rounded-lg">
              <input
                type="text"
                placeholder="Description"
                value={item.description}
                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                className="flex-1 p-2 bg-transparent border-b border-gray-300 dark:border-stone-700 focus:border-indigo-500 outline-none dark:text-white"
              />
              <input
                type="number"
                placeholder="Qty"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                className="w-20 p-2 bg-transparent border-b border-gray-300 dark:border-stone-700 focus:border-indigo-500 outline-none dark:text-white"
              />
              <input
                type="number"
                placeholder="Rate"
                value={item.rate}
                onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value))}
                className="w-24 p-2 bg-transparent border-b border-gray-300 dark:border-stone-700 focus:border-indigo-500 outline-none dark:text-white"
              />
              <div className="w-24 text-right font-mono font-bold dark:text-white">
                ${item.amount.toFixed(2)}
              </div>
              <button onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-600 p-1">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end border-t border-gray-200 dark:border-stone-700 pt-4">
        <div className="text-right">
          <div className="text-sm text-gray-500">Total Amount</div>
          <div className="text-3xl font-bold text-gray-800 dark:text-white">${calculateTotal().toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceBuilder;