import jsPDF from 'jspdf';
import 'jspdf-autotable';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount || 0);
};

export const generateQuotePDF = (quoteData, projectData, settings) => {
  const doc = new jsPDF();
  const themeColor = [79, 70, 229]; // Indigo-600

  // --- HEADER ---
  // Company Logo/Name
  doc.setFontSize(24);
  doc.setTextColor(...themeColor);
  doc.setFont('helvetica', 'bold');
  doc.text("MASTER BUILDERS", 20, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.setFont('helvetica', 'normal');
  doc.text("123 Construction Ave, Builder City", 20, 28);
  doc.text("contact@masterbuilders.com | (555) 123-4567", 20, 33);

  // Quote Info (Right Side)
  doc.setFontSize(36);
  doc.setTextColor(220); // Light Gray
  doc.text("QUOTE", 150, 25);
  
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 35);
  doc.text(`Valid Until: ${settings.validUntil || '30 Days'}`, 150, 40);
  doc.text(`Quote #: ${quoteData.id ? quoteData.id.slice(0, 8) : 'DRAFT'}`, 150, 45);

  // --- CLIENT INFO ---
  doc.setDrawColor(...themeColor);
  doc.setLineWidth(1);
  doc.line(20, 55, 190, 55);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...themeColor);
  doc.text("PREPARED FOR:", 20, 65);

  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.clientName || projectData?.client || "Valued Client", 20, 72);
  
  doc.setFont('helvetica', 'normal');
  if (settings.clientAddress) {
      doc.text(settings.clientAddress, 20, 78);
  } else if (projectData?.name) {
      doc.text(`Project: ${projectData.name}`, 20, 78);
  }

  if (settings.clientAddress && projectData?.name) {
      doc.text(`Project: ${projectData.name}`, 20, 84);
      if (projectData?.site) doc.text(`Site: ${projectData.site}`, 20, 90);
  } else if (projectData?.site) {
      doc.text(`Site: ${projectData.site}`, 20, 84);
  }

  // --- SCOPE OF WORKS (AI Generated) ---
  let tableStartY = 95;
  if (quoteData.scope) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...themeColor);
      doc.text("SCOPE OF WORKS", 20, 95);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50);
      
      const splitScope = doc.splitTextToSize(quoteData.scope, 170);
      doc.text(splitScope, 20, 102);
      
      tableStartY = 105 + (splitScope.length * 4);
      // Check for page overflow
      if (tableStartY > 260) {
          doc.addPage();
          tableStartY = 20;
      }
  }

  // --- ITEMS TABLE ---
  const tableColumn = ["Item", "Type", "Qty", "Rate", "Total"];
  const tableRows = [];

  // ... (rest of the code)

  doc.autoTable({
    startY: tableStartY,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: themeColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 10,
      cellPadding: 3
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250]
    },
    columnStyles: {
      0: { cellWidth: 80 }, // Item
      1: { cellWidth: 25 }, // Type
      2: { cellWidth: 20, halign: 'center' }, // Qty
      3: { cellWidth: 30, halign: 'right' }, // Rate
      4: { cellWidth: 35, halign: 'right' }  // Total
    }
  });

  // --- TOTALS ---
  const finalY = doc.lastAutoTable.finalY + 10;
  
  doc.setFontSize(10);
  doc.setTextColor(0);
  
  // Right align totals
  const rightMargin = 190;
  const labelOffset = 40;
  
  doc.text("Subtotal:", rightMargin - labelOffset, finalY, { align: 'right' });
  doc.text(formatCurrency(quoteData.totalRevenue), rightMargin, finalY, { align: 'right' });
  
  doc.text("Tax (10%):", rightMargin - labelOffset, finalY + 6, { align: 'right' });
  const tax = quoteData.totalRevenue * 0.1; // Example Tax
  doc.text(formatCurrency(tax), rightMargin, finalY + 6, { align: 'right' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text("Grand Total:", rightMargin - labelOffset, finalY + 14, { align: 'right' });
  doc.setTextColor(...themeColor);
  doc.text(formatCurrency(quoteData.totalRevenue + tax), rightMargin, finalY + 14, { align: 'right' });

  // --- TERMS ---
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.text("Terms & Conditions", 20, finalY + 25);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80);
  
  const terms = settings.terms || "1. Payment is due within 14 days of invoice.\n2. This quote is valid for 30 days.\n3. Changes to scope will be charged additionally.";
  const splitTerms = doc.splitTextToSize(terms, 170);
  doc.text(splitTerms, 20, finalY + 32);

  // --- FOOTER ---
  // Add page numbers
  const pageCount = doc.internal.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
    doc.text("Generated by MasterDiaryApp", 105, 295, { align: 'center' });
  }

  doc.save(`${quoteData.name || 'Quote'}.pdf`);
};
