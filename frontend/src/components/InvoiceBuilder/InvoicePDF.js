import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatCurrency = (amount) => {
  const val = parseFloat(amount);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(isNaN(val) ? 0 : val);
};

export const generatePDF = (invoice, totals) => {
  console.log("[InvoicePDF] Generating Pro-Grade PDF...");
  
  try {
      const doc = new jsPDF();
      const themeColor = [16, 185, 129]; // Emerald pro

      // --- HEADER ---
      if (invoice.senderLogo && String(invoice.senderLogo).startsWith('data:image')) {
          try {
              doc.addImage(invoice.senderLogo, 'PNG', 20, 15, 30, 30, undefined, 'FAST');
          } catch (e) {
              doc.setFontSize(20);
              doc.setTextColor(...themeColor);
              doc.text(invoice.senderName || "MASTER DIARY", 20, 25);
          }
      } else {
          doc.setFontSize(20);
          doc.setTextColor(...themeColor);
          doc.setFont('helvetica', 'bold');
          doc.text(invoice.senderName || "MASTER DIARY", 20, 25);
      }
      
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.setFont('helvetica', 'normal');
      doc.text(invoice.senderABN ? `ABN: ${invoice.senderABN}` : "", 20, 48);
      if (invoice.senderAddress) doc.text(invoice.senderAddress, 20, 53);

      doc.setFontSize(32);
      doc.setTextColor(200); 
      doc.text("INVOICE", 140, 30);
      
      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.text(`Invoice #: ${invoice.invoiceNumber || 'DRAFT'}`, 140, 42);
      doc.text(`Date: ${new Date(invoice.issueDate || Date.now()).toLocaleDateString()}`, 140, 48);

      doc.setDrawColor(...themeColor);
      doc.setLineWidth(0.5);
      doc.line(20, 65, 190, 65);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...themeColor);
      doc.text("BILL TO:", 20, 75);

      doc.setFontSize(11);
      doc.setTextColor(0);
      doc.text(invoice.clientName || "Valued Client", 20, 82);
      
      if (invoice.projectName) {
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text(`Project: ${invoice.projectName}`, 20, 95);
      }

      const tableColumn = ["Description", "Qty", "Unit", "Rate", "Total"];
      const tableRows = (invoice.items || []).map(item => [
        item.description || 'Item',
        item.quantity || 0,
        item.unit || 'ea',
        formatCurrency(item.rate),
        formatCurrency(item.amount)
      ]);

      // CRITICAL FIX: Use explicit autoTable function
      autoTable(doc, {
        startY: 105,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: themeColor, textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 20, halign: 'center' },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 35, halign: 'right' },
          4: { cellWidth: 35, halign: 'right' }
        }
      });

      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.text(`Subtotal: ${formatCurrency(totals.subtotal)}`, 190, finalY, { align: 'right' });
      doc.text(`Tax: ${formatCurrency(totals.taxAmount)}`, 190, finalY + 7, { align: 'right' });
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...themeColor);
      doc.text(`TOTAL: ${formatCurrency(totals.total)}`, 190, finalY + 16, { align: 'right' });

      if (invoice.bankName || invoice.bankAccount) {
          const bankY = Math.max(finalY + 30, 230);
          doc.setFontSize(10);
          doc.setTextColor(0);
          doc.text("PAYMENT DETAILS", 20, bankY);
          doc.setFontSize(9);
          doc.setTextColor(100);
          doc.text(`Bank: ${invoice.bankName} | BSB: ${invoice.bankBSB} | Acc: ${invoice.bankAccount}`, 20, bankY + 7);
      }

      doc.save(`Invoice_${invoice.invoiceNumber || 'Draft'}.pdf`);
      return true;
  } catch (err) {
      console.error("[InvoicePDF] Error:", err);
      return false;
  }
};
