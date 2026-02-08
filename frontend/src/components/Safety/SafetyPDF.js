import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateSafetyPDF = (formData, fields) => {
  console.log("[SafetyPDF] Generating Compliance Document...", { formData, fieldCount: fields.length });
  
  try {
      const doc = new jsPDF();
      const themeColor = [220, 38, 38]; // Professional Safety Red

      // --- HEADER BAR ---
      doc.setFillColor(...themeColor);
      doc.rect(0, 0, 210, 35, 'F');
      
      doc.setFontSize(20);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text("SAFETY COMPLIANCE RECORD", 20, 22);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`CERTIFIED DOCUMENT | ID: ${formData.id ? formData.id.slice(0, 8) : 'DRAFT'}`, 20, 29);

      // --- FORM TITLE ---
      doc.setTextColor(0);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(formData.title || "SITE SAFETY FORM", 20, 50);
      
      // Project Info Box
      doc.setDrawColor(230);
      doc.setFillColor(249, 250, 251);
      doc.rect(20, 55, 170, 25, 'FD');
      
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text("PROJECT:", 25, 62);
      doc.text("LOCATION:", 25, 68);
      doc.text("DATE:", 25, 74);
      
      doc.setTextColor(0);
      doc.setFont('helvetica', 'bold');
      doc.text(formData.projectName || "General Works", 55, 62);
      doc.text(formData.locationDetails || "Not Specified", 55, 68);
      doc.text(new Date(formData.createdAt || Date.now()).toLocaleDateString(), 55, 74);

      let currentY = 90;

      // --- RENDER FIELDS ---
      fields.forEach((field) => {
        // Page break safety
        if (currentY > 270) {
            doc.addPage();
            currentY = 20;
        }

        if (field.type === 'header') {
            currentY += 5;
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...themeColor);
            doc.text(field.label.toUpperCase(), 20, currentY);
            doc.setDrawColor(...themeColor);
            doc.line(20, currentY + 2, 190, currentY + 2);
            currentY += 12;
        } 
        else if (field.type === 'paragraph') {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(60);
            const text = field.value || field.label;
            const splitText = doc.splitTextToSize(text, 170);
            doc.text(splitText, 20, currentY);
            currentY += (splitText.length * 5) + 8;
        }
        else if (field.type === 'hazard') {
            doc.setDrawColor(220, 38, 38);
            doc.setFillColor(254, 242, 242);
            doc.rect(20, currentY, 170, 12, 'FD');
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(153, 27, 27);
            doc.text(`[!] HAZARD IDENTIFIED: ${field.label}`, 25, currentY + 8);
            currentY += 18;
        }
        else if (field.type === 'signature') {
            currentY += 10;
            doc.setDrawColor(150);
            doc.line(20, currentY + 15, 90, currentY + 15);
            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.setFont('helvetica', 'italic');
            doc.text(field.label || "Authorized Signature", 20, currentY + 20);
            doc.text("Date Signed: ________________", 120, currentY + 20);
            currentY += 35;
        }
        else if (field.type === 'risk_matrix') {
            doc.setDrawColor(200);
            doc.rect(20, currentY, 170, 20);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0);
            doc.text("COMPLIANCE RISK MATRIX", 105, currentY + 12, { align: 'center' });
            currentY += 28;
        }
        else if (field.type === 'photo') {
            doc.setDrawColor(240);
            doc.rect(20, currentY, 40, 30);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text("Evidence Photo", 25, currentY + 15);
            doc.setFontSize(10);
            doc.setTextColor(0);
            doc.text(field.label || "Image description", 65, currentY + 15);
            currentY += 38;
        }
        else {
            // Standard label: value pair
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(50);
            doc.text(`${field.label}:`, 20, currentY);
            
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0);
            const val = field.value || "___________________________";
            doc.text(val, 70, currentY);
            currentY += 10;
        }
      });

      // --- FOOTER ---
      const pageCount = doc.internal.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(180);
        doc.text(`MasterDiaryOS Iron Shield - Compliance Record - Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
        doc.text("This document is a legally recognized site record generated within the Sovereign Intelligence Lattice.", 105, 290, { align: 'center' });
      }

      const fileName = `${formData.title?.replace(/\s+/g, '_') || 'Safety_Report'}.pdf`;
      doc.save(fileName);
      console.log("[SafetyPDF] Document generated successfully:", fileName);
      return true;
  } catch (err) {
      console.error("[SafetyPDF] FATAL ERROR:", err);
      alert("Safety PDF Generation Failed: " + err.message);
      return false;
  }
};