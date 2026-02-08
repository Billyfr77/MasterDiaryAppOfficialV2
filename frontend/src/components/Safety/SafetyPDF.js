import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateSafetyPDF = (formData, fields) => {
  console.log("[SafetyPDF] Generating High-Fidelity Compliance Document...");
  
  try {
      const doc = new jsPDF();
      const themeColor = [40, 40, 40]; // Neutral dark grey for legal feel
      const accentRed = [220, 38, 38];

      // --- PAGE BORDER ---
      doc.setDrawColor(200);
      doc.setLineWidth(0.1);
      doc.rect(5, 5, 200, 287);

      // --- TOP LOGO / HEADER BOX ---
      doc.setFillColor(245, 245, 245);
      doc.rect(10, 10, 190, 30, 'F');
      doc.setDrawColor(150);
      doc.rect(10, 10, 190, 30, 'D');
      
      doc.setFontSize(22);
      doc.setTextColor(0);
      doc.setFont('helvetica', 'bold');
      doc.text("SITE SAFETY COMPLIANCE RECORD", 15, 25);
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text("OFFICIAL SITE DOCUMENT | MASTERDIARY OS IRON SHIELD PROTOCOL", 15, 33);
      
      // Document ID Box
      doc.setFontSize(9);
      doc.setTextColor(50);
      doc.text(`DOC_ID: ${formData.id ? formData.id.slice(0, 12).toUpperCase() : 'INTERNAL_DRAFT'}`, 140, 22);
      doc.text(`DATE: ${new Date().toLocaleDateString()}`, 140, 28);

      // --- PROJECT CONTEXT GRID ---
      let currentY = 45;
      
      const projectInfo = [
          ["Project Name:", formData.projectName || "General Works"],
          ["Location:", formData.locationDetails || "Site Alpha / Field Location"],
          ["Title:", formData.title || "Safety Record"]
      ];

      autoTable(doc, {
          startY: currentY,
          body: projectInfo,
          theme: 'grid',
          styles: { fontSize: 10, cellPadding: 3 },
          columnStyles: { 
              0: { cellWidth: 40, fontStyle: 'bold', fillColor: [250, 250, 250] },
              1: { cellWidth: 150 }
          },
          margin: { left: 10 }
      });

      currentY = doc.lastAutoTable.finalY + 10;

      // --- RENDER FORM FIELDS ---
      fields.forEach((field) => {
        // Page break safety
        if (currentY > 265) {
            doc.addPage();
            doc.setDrawColor(200);
            doc.rect(5, 5, 200, 287);
            currentY = 20;
        }

        if (field.type === 'header') {
            currentY += 5;
            doc.setFillColor(60, 60, 60);
            doc.rect(10, currentY, 190, 8, 'F');
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text(field.label.toUpperCase(), 15, currentY + 5.5);
            currentY += 15;
        } 
        else if (field.type === 'paragraph') {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(40);
            const text = field.value || field.label;
            const splitText = doc.splitTextToSize(text, 180);
            doc.text(splitText, 15, currentY);
            currentY += (splitText.length * 5) + 8;
        }
        else if (field.type === 'hazard') {
            doc.setDrawColor(...accentRed);
            doc.setLineWidth(0.5);
            doc.setFillColor(255, 245, 245);
            doc.rect(10, currentY, 190, 15, 'FD');
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...accentRed);
            doc.text(`[CRITICAL HAZARD] : ${field.label}`, 15, currentY + 9.5);
            currentY += 20;
            doc.setLineWidth(0.1); // Reset
        }
        else if (field.type === 'signature') {
            currentY += 5;
            doc.setDrawColor(180);
            doc.rect(10, currentY, 90, 30);
            doc.rect(100, currentY, 100, 30);
            
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text(field.label || "Authorized Signature", 15, currentY + 5);
            doc.text("Date Signed", 105, currentY + 5);
            
            doc.setFontSize(12);
            doc.setTextColor(200);
            doc.text("X _________________________", 15, currentY + 20);
            doc.text("________________", 105, currentY + 20);
            
            currentY += 40;
        }
        else if (field.type === 'risk_matrix') {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0);
            doc.text("RISK ASSESSMENT SUMMARY:", 15, currentY);
            doc.rect(15, currentY + 3, 180, 20);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.text("Note: Comprehensive digital matrix verification performed at source.", 20, currentY + 15);
            currentY += 30;
        }
        else {
            // Standard data field
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(80);
            doc.text(`${field.label}:`, 15, currentY);
            
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0);
            const val = field.value || "_________________________________";
            doc.text(val, 65, currentY);
            
            doc.setDrawColor(240);
            doc.line(15, currentY + 2, 195, currentY + 2);
            currentY += 10;
        }
      });

      // --- FINAL DECLARATION ---
      if (currentY > 250) { doc.addPage(); doc.setDrawColor(200); doc.rect(5, 5, 200, 287); currentY = 20; }
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.setFont('helvetica', 'italic');
      doc.text("DECLARATION: I hereby certify that the information recorded above is a true and accurate representation of the site", 15, 265);
      doc.text("conditions and safety protocols observed at the time of submission.", 15, 270);

      // --- FOOTER ---
      const pageCount = doc.internal.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(180);
        doc.text(`MasterDiaryOS Compliance Engine | Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
      }

      const fileName = `${formData.title?.replace(/\s+/g, '_') || 'Safety_Compliance'}.pdf`;
      doc.save(fileName);
      return true;
  } catch (err) {
      console.error("[SafetyPDF] Error:", err);
      alert("Failed to generate professional PDF: " + err.message);
      return false;
  }
};
