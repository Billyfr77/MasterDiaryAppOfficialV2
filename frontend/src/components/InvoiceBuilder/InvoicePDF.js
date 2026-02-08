import jsPDF from 'jspdf';
import 'jspdf-autotable';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount || 0);
};

export const generatePDF = (invoice, totals) => {
  const doc = new jsPDF();
  const themeColor = invoice.accentColor ? 
    // Convert hex to RGB array if needed, but we'll use a standard pro color if none
    [16, 185, 129] : [16, 185, 129]; // Emerald pro

  // --- HEADER ---
  // Company Logo/Name
  if (invoice.senderLogo) {
      try {
          doc.addImage(invoice.senderLogo, 'PNG', 20, 15, 40, 40, undefined, 'FAST');
      } catch (e) {
          doc.setFontSize(24);
          doc.setTextColor(...themeColor);
          doc.setFont('helvetica', 'bold');
          doc.text("MASTER DIARY", 20, 25);
      }
  } else {
      doc.setFontSize(24);
      doc.setTextColor(...themeColor);
      doc.setFont('helvetica', 'bold');
      doc.text("MASTER DIARY", 20, 25);
  }
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.senderABN ? `ABN: ${invoice.senderABN}` : "", 20, 35);

  // Invoice Info (Right Side)
  doc.setFontSize(36);
  doc.setTextColor(220); 
  doc.text("INVOICE", 140, 30);
  
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text(`Invoice #: ${invoice.invoiceNumber || 'DRAFT'}`, 140, 40);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 140, 45);
  doc.text(`Due Date: ${invoice.dueDate || 'Upon Receipt'}`, 140, 50);

  // --- CLIENT INFO ---
  doc.setDrawColor(...themeColor);
  doc.setLineWidth(0.5);
  doc.line(20, 60, 190, 60);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...themeColor);
  doc.text("BILL TO:", 20, 70);

  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.text(invoice.clientName || "Valued Client", 20, 77);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  if (invoice.projectName) {
      doc.text(`Project: ${invoice.projectName}`, 20, 83);
  }

  // --- ITEMS TABLE ---
  const tableColumn = ["Description", "Qty", "Unit", "Rate", "Amount"];
  const tableRows = (invoice.items || []).map(item => [
    item.description,
    item.quantity,
    item.unit || '-',
    formatCurrency(item.rate),
    formatCurrency(item.amount)
  ]);

  doc.autoTable({
    startY: 95,
    head: [tableColumn],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: themeColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 4
    },
    columnStyles: {
      0: { cellWidth: 80 }, // Description
      1: { cellWidth: 20, halign: 'center' }, // Qty
      2: { cellWidth: 20, halign: 'center' }, // Unit
      3: { cellWidth: 35, halign: 'right' }, // Rate
      4: { cellWidth: 35, halign: 'right' }  // Amount
    }
  });

  // --- TOTALS ---
  const finalY = doc.lastAutoTable.finalY + 10;
  const rightMargin = 190;
  const labelOffset = 45;
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Subtotal:", rightMargin - labelOffset, finalY, { align: 'right' });
  doc.setTextColor(0);
  doc.text(formatCurrency(totals.subtotal), rightMargin, finalY, { align: 'right' });
  
  if (totals.discountAmount > 0) {
      doc.setTextColor(100);
      doc.text("Discount:", rightMargin - labelOffset, finalY + 7, { align: 'right' });
      doc.setTextColor(200, 0, 0);
      doc.text(`-${formatCurrency(totals.discountAmount)}`, rightMargin, finalY + 7, { align: 'right' });
  }

  const taxY = totals.discountAmount > 0 ? finalY + 14 : finalY + 7;
  doc.setTextColor(100);
  doc.text(`Tax (${invoice.taxRate}%):`, rightMargin - labelOffset, taxY, { align: 'right' });
  doc.setTextColor(0);
  doc.text(formatCurrency(totals.taxAmount), rightMargin, taxY, { align: 'right' });

  const totalY = taxY + 10;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text("Total Amount:", rightMargin - labelOffset, totalY, { align: 'right' });
  doc.setTextColor(...themeColor);
  doc.text(formatCurrency(totals.total), rightMargin, totalY, { align: 'right' });

  // --- PAYMENT & NOTES ---
  if (invoice.notes || invoice.bankName) {
      const bottomY = Math.max(totalY + 20, 220);
      doc.setDrawColor(230);
      doc.line(20, bottomY - 5, 190, bottomY - 5);

      if (invoice.notes) {
          doc.setFontSize(10);
          doc.setTextColor(...themeColor);
          doc.text("NOTES", 20, bottomY);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100);
          const splitNotes = doc.splitTextToSize(invoice.notes, 80);
          doc.text(splitNotes, 20, bottomY + 7);
      }

      if (invoice.bankName) {
          doc.setFontSize(10);
          doc.setTextColor(...themeColor);
          doc.text("PAYMENT DETAILS", 110, bottomY);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100);
          doc.text(`Bank: ${invoice.bankName}`, 110, bottomY + 7);
          doc.text(`BSB: ${invoice.bankBSB}`, 110, bottomY + 12);
          doc.text(`Account: ${invoice.bankAccount}`, 110, bottomY + 17);
      }
  }

  // --- FOOTER ---
  doc.setFontSize(8);
  doc.setTextColor(180);
  doc.text("Thank you for your business.", 105, 285, { align: 'center' });
  doc.text(`Generated by MasterDiaryApp Official v2`, 105, 290, { align: 'center' });

  doc.save(`Invoice_${invoice.invoiceNumber || 'Draft'}.pdf`);
  return true;
};