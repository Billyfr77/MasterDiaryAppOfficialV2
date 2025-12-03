/*
 * MasterDiaryApp Official - Invoice Controller
 * PDF generation for customer and in-house invoices
 */

const { Invoice, Diary, Project, Staff, Equipment, Node } = require('../models');
const { sequelize } = require('../models');
const jsPDF = require('jspdf');
const fs = require('fs');
const path = require('path');

const createInvoice = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { diaryId, invoiceType, notes } = req.body;

    // Get the diary with related data
    const diary = await Diary.findByPk(diaryId, {
      include: [
        { model: Project, as: 'Project' }
      ],
      transaction
    });

    if (!diary) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Diary not found' });
    }

    // Calculate invoice data from canvas
    const canvasData = diary.canvasData || [];
    const invoiceItems = [];
    let totalAmount = 0;

    for (const entry of canvasData) {
      for (const item of entry.items || []) {
        const cost = await calculateItemCost(item);
        const revenue = invoiceType === 'customer' ? await calculateItemRevenue(item) : cost;

        invoiceItems.push({
          description: `${item.name} (${entry.time})`,
          quantity: item.quantity || 1,
          rate: revenue,
          amount: revenue * (item.quantity || 1)
        });

        totalAmount += revenue * (item.quantity || 1);
      }
    }

    // Additional costs
    if (diary.additionalCosts) {
      for (const cost of diary.additionalCosts) {
        invoiceItems.push({
          description: cost.description,
          quantity: 1,
          rate: cost.amount,
          amount: cost.amount
        });
        totalAmount += cost.amount;
      }
    }

    const invoiceData = {
      invoiceNumber: generateInvoiceNumber(),
      date: new Date().toISOString().split('T')[0],
      project: diary.Project?.name || 'No Project',
      items: invoiceItems,
      totalAmount,
      notes: notes || ''
    };

    // Create invoice record
    const invoice = await Invoice.create({
      diaryId,
      projectId: diary.projectId,
      invoiceType,
      invoiceData,
      totalAmount,
      status: 'draft',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days
    }, { transaction });

    await transaction.commit();

    // Generate PDF
    const pdfPath = await generateInvoicePDF(invoice);

    // Update invoice with PDF URL
    await Invoice.update(
      { pdfUrl: `/invoices/${invoice.id}.pdf` },
      { where: { id: invoice.id } }
    );

    res.status(201).json({
      ...invoice.toJSON(),
      pdfUrl: `/invoices/${invoice.id}.pdf`
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Create invoice error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        { model: Diary, include: [{ model: Project }] }
      ]
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getInvoices = async (req, res) => {
  try {
    const { status, invoiceType } = req.query;
    const where = {};

    if (status) where.status = status;
    if (invoiceType) where.invoiceType = invoiceType;

    const invoices = await Invoice.findAll({
      where,
      include: [
        { model: Diary, include: [{ model: Project }] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const [updated] = await Invoice.update(
      { status },
      { where: { id: req.params.id } }
    );

    if (updated) {
      const updatedInvoice = await Invoice.findByPk(req.params.id);
      res.json(updatedInvoice);
    } else {
      res.status(404).json({ error: 'Invoice not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const downloadInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);

    if (!invoice || !invoice.pdfUrl) {
      return res.status(404).json({ error: 'Invoice PDF not found' });
    }

    const pdfPath = path.join(__dirname, '../../invoices', `${invoice.id}.pdf`);

    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ error: 'PDF file not found' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`);

    const fileStream = fs.createReadStream(pdfPath);
    fileStream.pipe(res);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const generateInvoiceNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${year}${month}-${random}`;
};

const generateInvoicePDF = async (invoice) => {
  const doc = new jsPDF();

  // Company header
  doc.setFontSize(20);
  doc.text('MasterDiaryApp Official', 20, 30);
  doc.setFontSize(12);
  doc.text('Construction Management Solutions', 20, 40);
  doc.text('Professional Invoicing System', 20, 50);

  // Invoice details
  doc.setFontSize(16);
  doc.text(`Invoice #${invoice.invoiceData.invoiceNumber}`, 140, 30);
  doc.setFontSize(10);
  doc.text(`Date: ${invoice.invoiceData.date}`, 140, 40);
  doc.text(`Due Date: ${invoice.dueDate}`, 140, 50);
  doc.text(`Status: ${invoice.status.toUpperCase()}`, 140, 60);

  // Project info
  doc.setFontSize(12);
  doc.text('Project:', 20, 70);
  doc.text(invoice.invoiceData.project, 60, 70);

  // Items table
  let yPos = 90;
  doc.setFontSize(10);
  doc.text('Description', 20, yPos);
  doc.text('Qty', 120, yPos);
  doc.text('Rate', 140, yPos);
  doc.text('Amount', 170, yPos);

  yPos += 10;
  doc.line(20, yPos, 190, yPos);
  yPos += 5;

  invoice.invoiceData.items.forEach(item => {
    doc.text(item.description.substring(0, 50), 20, yPos);
    doc.text(item.quantity.toString(), 120, yPos);
    doc.text(`$${item.rate.toFixed(2)}`, 140, yPos);
    doc.text(`$${item.amount.toFixed(2)}`, 170, yPos);
    yPos += 10;
  });

  // Total
  yPos += 10;
  doc.line(20, yPos, 190, yPos);
  yPos += 10;
  doc.setFontSize(12);
  doc.text(`Total: $${invoice.totalAmount.toFixed(2)}`, 140, yPos);

  // Notes
  if (invoice.invoiceData.notes) {
    yPos += 20;
    doc.setFontSize(10);
    doc.text('Notes:', 20, yPos);
    yPos += 10;
    const notesLines = doc.splitTextToSize(invoice.invoiceData.notes, 170);
    doc.text(notesLines, 20, yPos);
  }

  // Footer
  yPos = 270;
  doc.setFontSize(8);
  doc.text('Thank you for your business!', 20, yPos);
  doc.text('Generated by MasterDiaryApp Official', 20, yPos + 10);

  // Ensure invoices directory exists
  const invoicesDir = path.join(__dirname, '../../invoices');
  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
  }

  const pdfPath = path.join(invoicesDir, `${invoice.id}.pdf`);
  doc.save(pdfPath);

  return pdfPath;
};

const calculateItemCost = async (item) => {
  switch (item.type) {
    case 'staff':
      const staff = await Staff.findByPk(item.data?.id);
      return staff ? staff.payRateBase : 0;
    case 'equipment':
      const equipment = await Equipment.findByPk(item.data?.id);
      return equipment ? equipment.costRateBase : 0;
    case 'material':
      const material = await Node.findByPk(item.data?.id);
      return material ? material.pricePerUnit : 0;
    default:
      return 0;
  }
};

const calculateItemRevenue = async (item) => {
  switch (item.type) {
    case 'staff':
      const staff = await Staff.findByPk(item.data?.id);
      return staff ? staff.chargeOutBase : 0;
    case 'equipment':
      const equipment = await Equipment.findByPk(item.data?.id);
      return equipment ? equipment.costRateBase * 1.3 : 0;
    case 'material':
      const material = await Node.findByPk(item.data?.id);
      return material ? material.pricePerUnit * 1.5 : 0;
    default:
      return 0;
  }
};

module.exports = {
  createInvoice,
  getInvoiceById,
  getInvoices,
  updateInvoiceStatus,
  downloadInvoicePDF
};