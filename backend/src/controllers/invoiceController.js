/*
 * MasterDiaryApp Official - Invoice Controller
 * PDF generation for customer and in-house invoices
 */

const { Invoice, Diary, Project, Staff, Equipment, Node, Client, Job } = require('../models');
const { sequelize } = require('../models');
const jsPDF = require('jspdf');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');

const createInvoice = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { diaryId, diaryIds, projectId, clientId, invoiceType, notes, items: manualItems, status } = req.body;

    // Determine target diaries
    let targetDiaryIds = [];
    if (diaryIds && Array.isArray(diaryIds)) targetDiaryIds = diaryIds;
    else if (diaryId) targetDiaryIds = [diaryId];

    // Fetch diaries if any
    let diaries = [];
    if (targetDiaryIds.length > 0) {
        diaries = await Diary.findAll({
            where: { id: targetDiaryIds },
            include: [{ model: Project, as: 'Project' }],
            transaction
        });
    }

    // Calculate invoice data
    const invoiceItems = manualItems || []; // Allow manual items if passed directly
    let totalAmount = 0;

    // If no manual items provided, calculate from diaries
    if (invoiceItems.length === 0 && diaries.length > 0) {
        for (const diary of diaries) {
            const canvasData = diary.canvasData || [];
            // Process Canvas Data
            for (const entry of canvasData) {
                for (const item of entry.items || []) {
                    const cost = await calculateItemCost(item);
                    const revenue = invoiceType === 'customer' ? await calculateItemRevenue(item) : cost;
                    const amount = revenue * (item.quantity || 1);
                    
                    invoiceItems.push({
                        description: `${item.name} (${diary.date})`,
                        quantity: item.quantity || 1,
                        rate: revenue,
                        amount: amount
                    });
                    totalAmount += amount;
                }
            }
            // Process Additional Costs
            if (diary.additionalCosts) {
                for (const cost of diary.additionalCosts) {
                    invoiceItems.push({
                        description: `${cost.description} (${diary.date})`,
                        quantity: 1,
                        rate: cost.amount,
                        amount: cost.amount
                    });
                    totalAmount += cost.amount;
                }
            }
            // Add Diary Base Cost/Revenue if stored directly
            if (diary.totalRevenue && (!diary.canvasData || diary.canvasData.length === 0)) {
                 invoiceItems.push({
                    description: `Site Diary Entry - ${diary.date}`,
                    quantity: 1,
                    rate: diary.totalRevenue,
                    amount: diary.totalRevenue
                 });
                 totalAmount += parseFloat(diary.totalRevenue);
            }
        }
    } else {
        // Recalculate total from passed manual items
        totalAmount = invoiceItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    }

    const invoiceData = {
      invoiceNumber: generateInvoiceNumber(),
      date: new Date().toISOString().split('T')[0],
      project: diaries[0]?.Project?.name || 'Multiple/General',
      items: invoiceItems,
      totalAmount,
      notes: notes || ''
    };

    // Create invoice record
    const invoice = await Invoice.create({
      diaryId: targetDiaryIds.length === 1 ? targetDiaryIds[0] : null, // Keep for legacy if single
      projectId: projectId || diaries[0]?.projectId,
      clientId: clientId || diaries[0]?.clientId,
      invoiceType,
      invoiceData,
      totalAmount,
      status: status || 'draft',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days
    }, { transaction });

    // Link Diaries to Invoice
    if (targetDiaryIds.length > 0) {
        await Diary.update(
            { invoiceId: invoice.id },
            { where: { id: targetDiaryIds }, transaction }
        );
    }

    await transaction.commit();

    // Generate PDF (Optional: can be done on demand)
    // const pdfPath = await generateInvoicePDF(invoice);
    // await Invoice.update({ pdfUrl: `/invoices/${invoice.id}.pdf` }, { where: { id: invoice.id } });

    res.status(201).json(invoice);

  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error('Create invoice error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        { model: Diary }, // Now returns array due to hasMany
        { model: Project },
        { model: Client }
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
    const { status, invoiceType, projectId, search } = req.query;
    const where = {};

    if (status) where.status = status;
    if (invoiceType) where.invoiceType = invoiceType;
    if (projectId) where.projectId = projectId;
    if (search) where.invoiceNumber = { [Op.like]: `%${search}%` };

    const invoices = await Invoice.findAll({
      where,
      include: [
          { model: Project },
          { model: Client }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(invoices);
  } catch (error) {
    console.error('Get Invoices Error:', error);
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

// NEW: Bulk Update Status
const bulkUpdateStatus = async (req, res) => {
    try {
        const { ids, status } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'No IDs provided' });
        
        await Invoice.update(
            { status },
            { where: { id: ids } }
        );
        res.json({ message: 'Invoices updated successfully', count: ids.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// NEW: Get Uninvoiced Diaries
const getUninvoicedDiaries = async (req, res) => {
    try {
        const { projectId, clientId, jobId } = req.query;
        const where = { invoiceId: null }; // Only fetch diaries not yet linked to an invoice
        
        if (projectId) where.projectId = projectId;
        if (clientId) where.clientId = clientId;
        if (jobId) where.jobId = jobId;

        const diaries = await Diary.findAll({
            where,
            include: [{ model: Project }, { model: Job, as: 'job' }],
            order: [['date', 'DESC']]
        });
        res.json(diaries);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const downloadInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id);

    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    
    // Generate fresh if not exists
    let pdfPath;
    if (invoice.pdfUrl) {
        pdfPath = path.join(__dirname, '../../invoices', path.basename(invoice.pdfUrl));
    }
    
    if (!pdfPath || !fs.existsSync(pdfPath)) {
        // Regenerate
        pdfPath = await generateInvoicePDF(invoice);
        await Invoice.update({ pdfUrl: `/invoices/${invoice.id}.pdf` }, { where: { id: invoice.id } });
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
  doc.text(invoice.invoiceData.project || '', 60, 70);

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
  downloadInvoicePDF,
  bulkUpdateStatus,
  getUninvoicedDiaries
};