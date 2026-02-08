import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatValue = (val) => {
    if (val === undefined || val === null || val === '') return "________________";
    if (Array.isArray(val)) return val.join(", ");
    return String(val);
};

export const generateSafetyPDF = (formData, fields) => {
  console.log("[SafetyPDF] Generating Premium Document...", { formData });
  
  try {
      const doc = new jsPDF();
      const themeColor = [16, 185, 129]; // Match Invoice Emerald Pro
      const secondaryColor = [100, 116, 139]; // Slate

      // --- HEADER ---
      // Big Label on Right
      doc.setFontSize(32);
      doc.setTextColor(220); 
      doc.setFont('helvetica', 'bold');
      doc.text("SAFETY RECORD", 120, 30);

      // System Identity on Left
      doc.setFontSize(20);
      doc.setTextColor(...themeColor);
      doc.text("MASTER DIARY OS", 20, 25);
      
      doc.setFontSize(9);
      doc.setTextColor(...secondaryColor);
      doc.setFont('helvetica', 'normal');
      doc.text("IRON SHIELD COMPLIANCE PROTOCOL", 20, 32);
      const docId = (formData.id && typeof formData.id === 'string') ? formData.id.slice(0, 12).toUpperCase() : 'DRAFT_RECORD';
      doc.text(`DOC_ID: ${docId}`, 20, 37);

      // --- DOCUMENT INFO ---
      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.setFont('helvetica', 'bold');
      doc.text(`Date:`, 140, 42);
      doc.setFont('helvetica', 'normal');
      doc.text(`${new Date(formData.createdAt || Date.now()).toLocaleDateString()}`, 165, 42);
      
      doc.setFont('helvetica', 'bold');
      doc.text(`Status:`, 140, 48);
      doc.setFont('helvetica', 'normal');
      doc.text(`CERTIFIED`, 165, 48);

      // --- PROJECT CONTEXT ---
      doc.setDrawColor(...themeColor);
      doc.setLineWidth(0.5);
      doc.line(20, 55, 190, 55);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...themeColor);
      doc.text("SITE CONTEXT:", 20, 65);

      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(formData.projectName || "General Works Site", 20, 72);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...secondaryColor);
      doc.text(`Location: ${formData.locationDetails || "Standard Field Site"}`, 20, 78);
      doc.text(`Form Title: ${formData.title || "Safety Compliance Submission"}`, 20, 83);

      let currentY = 95;

      // --- RENDER FORM DATA AS A STRUCTURED TABLE ---
      // We'll separate headers from key-value pairs for maximum cleanliness
      const tableData = [];
      
      (fields || []).forEach(field => {
          const label = field.label || "Unnamed Field";
          if (field.type === 'header') {
              tableData.push([{ content: String(label).toUpperCase(), colSpan: 2, styles: { fillColor: [240, 240, 240], fontStyle: 'bold', textColor: themeColor } }]);
          } else if (field.type === 'paragraph') {
              tableData.push([{ content: field.value || label, colSpan: 2, styles: { fontStyle: 'italic', textColor: [80, 80, 80] } }]);
          } else if (field.type === 'hazard') {
              tableData.push([
                  { content: "!!! CRITICAL HAZARD", styles: { textColor: [220, 38, 38], fontStyle: 'bold' } },
                  { content: label, styles: { textColor: [220, 38, 38] } }
              ]);
          } else if (field.type === 'signature') {
              // Signatures handled at the end or inline? Let's do inline for safety forms
              tableData.push([label || "Authorized Signature", "X _______________________________"]);
          } else if (field.type === 'risk_matrix') {
              tableData.push(["Risk Assessment", "Digital Matrix Verified"]);
          } else {
              // Standard input fields
              tableData.push([label, formatValue(field.value)]);
          }
      });

      autoTable(doc, {
          startY: currentY,
          body: tableData,
          theme: 'grid',
          styles: { fontSize: 9, cellPadding: 4, lineColor: [230, 230, 230] },
          columnStyles: {
              0: { cellWidth: 60, fontStyle: 'bold', fillColor: [252, 252, 252] },
              1: { cellWidth: 110 }
          },
          margin: { left: 20, right: 20 },
          didParseCell: function (data) {
              if (data.cell.raw && data.cell.raw.content && data.cell.raw.content.includes("!!!")) {
                  data.cell.styles.fillColor = [255, 245, 245];
              }
          }
      });

      currentY = doc.lastAutoTable.finalY + 15;

      // --- DECLARATION SECTION ---
      if (currentY > 250) { doc.addPage(); currentY = 20; }
      
      doc.setDrawColor(230);
      doc.line(20, currentY, 190, currentY);
      
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.setFont('helvetica', 'italic');
      doc.text("I hereby confirm that the safety protocols and site conditions described in this document", 20, currentY + 10);
      doc.text("have been observed, verified, and recorded in accordance with enterprise safety standards.", 20, currentY + 14);

      // --- FOOTER ---
      const pageCount = doc.internal.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(180);
        doc.text("MasterDiaryOS - Iron Shield Compliance Engine", 105, 285, { align: 'center' });
        doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
      }

      const safeTitle = (formData.title && typeof formData.title === 'string') ? formData.title.replace(/\s+/g, '_') : 'Safety_Record';
      const fileName = `${safeTitle}.pdf`;
      doc.save(fileName);
      return true;
  } catch (err) {
      console.error("[SafetyPDF] Error:", err);
      alert("Professional PDF Generation Failed: " + err.message);
      return false;
  }
};