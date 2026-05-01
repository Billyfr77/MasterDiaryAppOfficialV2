const pinnacleAi = require('../services/grokService');
const ExcelJS = require('exceljs');
const { getSetting } = require('../utils/settingsCache');
const db = require('../models');
const { Diary, Project, Staff, Equipment, Client, Job, Quote, Sequelize } = db;
const { Op } = Sequelize;

// --- 1. VISION TRANSCRIPTION (LOGBOOK -> NODES) ---
const transcribeLogbook = async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) return res.status(400).json({ error: "No image provided." });

        const systemPrompt = `
            You are "Neural Transcriber", a specialist in converting handwritten construction site logs into structured digital data.
            
            **MISSION:**
            Analyze the image of a physical site diary/notebook/whiteboard.
            Extract every resource, worker, and event mentioned.
            Convert them into a JSON structure compatible with our Digital Diary.
            
            **OUTPUT SCHEMA (JSON ONLY):**
            {
                "items": [
                    {
                        "type": "staff" | "equipment" | "material",
                        "name": "Name found in text (e.g. Dave, Excavator 5T)",
                        "quantity": number (count or hours),
                        "description": "Any extra notes found"
                    }
                ],
                "notes": "Full transcription of the general site notes found in the image."
            }
        `;

        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        const resultText = await pinnacleAi.analyzeImage(base64Data, "Transcribe this logbook page into structured data.", systemPrompt);
        
        let resultJson;
        try {
            const jsonMatch = resultText.match(/\{[\s\S]*\}/);
            resultJson = jsonMatch ? JSON.parse(jsonMatch[0]) : { notes: resultText, items: [] };
        } catch (e) {
            resultJson = { notes: resultText, items: [], parseError: true };
        }

        res.json(resultJson);
    } catch (error) {
        console.error("Transcription Error:", error);
        res.status(500).json({ error: "Vision Transcription Failed." });
    }
};

// --- 2. SINGLE DIARY EXPORT (DIARY -> .XLSX) ---
const exportToExcel = async (req, res) => {
    try {
        const { diaryData, projectName, date, jobRef } = req.body;
        const companyName = getSetting('companyName', 'MasterDiary Construction');

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'MasterDiaryOS';
        workbook.created = new Date();

        const sheet = workbook.addWorksheet('Site Manifest');

        // --- STYLING ---
        const headerFont = { name: 'Arial', family: 4, size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
        const subHeaderFont = { name: 'Arial', family: 4, size: 11, bold: true };
        const brandFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2937' } }; // Dark Slate
        
        // --- HEADER ---
        sheet.mergeCells('A1:E1');
        const titleCell = sheet.getCell('A1');
        titleCell.value = `${companyName.toUpperCase()} - SITE MANIFEST`;
        titleCell.fill = brandFill;
        titleCell.font = headerFont;
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        sheet.getRow(1).height = 40;

        sheet.mergeCells('A2:E2');
        const metaCell = sheet.getCell('A2');
        metaCell.value = `PROJECT: ${projectName || 'General'} | JOB REF: ${jobRef || 'N/A'} | DATE: ${date || new Date().toLocaleDateString()}`;
        metaCell.alignment = { horizontal: 'center' };
        metaCell.font = { italic: true };

        // --- STAFF SECTION ---
        let currentRow = 4;
        sheet.getCell(`A${currentRow}`).value = "LABOUR RESOURCES";
        sheet.getCell(`A${currentRow}`).font = subHeaderFont;
        currentRow++;

        const staffHeaders = ['Name', 'Role', 'Hours', 'Rate', 'Total Cost'];
        const staffRow = sheet.getRow(currentRow);
        staffRow.values = staffHeaders;
        staffRow.font = { bold: true };
        staffRow.border = { bottom: { style: 'thin' } };
        currentRow++;

        const staffItems = (diaryData.items || []).filter(i => i.type === 'staff');
        staffItems.forEach(item => {
            const cost = (parseFloat(item.quantity) || 0) * (parseFloat(item.costRate) || 0);
            sheet.getRow(currentRow).values = [
                item.name, 
                item.role || 'Worker', 
                item.quantity, 
                item.costRate, 
                cost
            ];
            currentRow++;
        });

        // --- EQUIPMENT SECTION ---
        currentRow += 2;
        sheet.getCell(`A${currentRow}`).value = "PLANT & EQUIPMENT";
        sheet.getCell(`A${currentRow}`).font = subHeaderFont;
        currentRow++;

        const equipRow = sheet.getRow(currentRow);
        equipRow.values = ['Item', 'Type', 'Qty/Hrs', 'Rate', 'Total Cost'];
        equipRow.font = { bold: true };
        equipRow.border = { bottom: { style: 'thin' } };
        currentRow++;

        const equipItems = (diaryData.items || []).filter(i => i.type === 'equipment');
        equipItems.forEach(item => {
            const cost = (parseFloat(item.quantity) || 0) * (parseFloat(item.costRate) || 0);
            sheet.getRow(currentRow).values = [
                item.name, 
                'Machinery', 
                item.quantity, 
                item.costRate, 
                cost
            ];
            currentRow++;
        });

        // --- MATERIALS SECTION ---
        currentRow += 2;
        sheet.getCell(`A${currentRow}`).value = "MATERIALS & CONSUMABLES";
        sheet.getCell(`A${currentRow}`).font = subHeaderFont;
        currentRow++;

        const matRow = sheet.getRow(currentRow);
        matRow.values = ['Item', 'Unit', 'Qty', 'Rate', 'Total Cost'];
        matRow.font = { bold: true };
        matRow.border = { bottom: { style: 'thin' } };
        currentRow++;

        const matItems = (diaryData.items || []).filter(i => i.type === 'material');
        matItems.forEach(item => {
            const cost = (parseFloat(item.quantity) || 0) * (parseFloat(item.costRate) || 0);
            sheet.getRow(currentRow).values = [
                item.name, 
                'Unit', 
                item.quantity, 
                item.costRate, 
                cost
            ];
            currentRow++;
        });

        // --- TOTALS ---
        currentRow += 2;
        const totalCost = (diaryData.items || []).reduce((sum, i) => sum + (parseFloat(i.quantity||0)*parseFloat(i.costRate||0)), 0);
        const totalRev = (diaryData.items || []).reduce((sum, i) => sum + (parseFloat(i.quantity||0)*parseFloat(i.chargeRate||0)), 0);
        
        sheet.getCell('D' + currentRow).value = "TOTAL COST:";
        sheet.getCell('D' + currentRow).font = { bold: true };
        sheet.getCell('E' + currentRow).value = totalCost;
        
        currentRow++;
        sheet.getCell('D' + currentRow).value = "TOTAL REVENUE:";
        sheet.getCell('D' + currentRow).font = { bold: true };
        sheet.getCell('E' + currentRow).value = totalRev;

        // Auto-width
        sheet.columns.forEach(column => {
            column.width = 20;
        });

        // Write to buffer
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=SiteManifest_${Date.now()}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error("Excel Export Error:", error);
        res.status(500).json({ error: "Export Failed" });
    }
};

// --- 3. GLOBAL NEURAL EXPORT (THE "BILLION DOLLAR" SPREADSHEET) ---
const exportGlobalManifest = async (req, res) => {
    try {
        const { startDate, endDate, projectId, clientId } = req.body;
        const companyName = getSetting('companyName', 'MasterDiary Construction');
        const companyABN = getSetting('companyABN', 'ABN: 00 000 000 000');
        const companyAddress = getSetting('companyAddress', 'Firm Headquarters');

        console.log(`[Global Export] Initializing for user ${req.user?.id}...`);

        // 1. Fetch Deep Data
        const where = {};
        if (req.user?.id) where.userId = req.user.id;
        
        // Robust UUID validation regex
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        if (projectId && uuidRegex.test(projectId)) {
            where.projectId = projectId;
        }
        if (clientId && uuidRegex.test(clientId)) {
            where.clientId = clientId;
        }

        const diaryWhere = { ...where };
        const quoteWhere = { ...where };

        if (startDate || endDate) {
            const dateFilter = {};
            if (startDate) dateFilter[Op.gte] = startDate;
            if (endDate) dateFilter[Op.lte] = endDate;
            
            diaryWhere.date = dateFilter;
            quoteWhere.createdAt = dateFilter;
        }

        // Ensure we only fetch existing, non-deleted diaries 
        const diaries = await Diary.findAll({
            where: diaryWhere,
            include: [
                { model: Project, attributes: ['name', 'value'], required: false },
                { model: Client, attributes: ['name', 'email'], required: false },
                { model: Job, as: 'job', attributes: ['jobNumber'], required: false }
            ],
            order: [['date', 'DESC']]
        });

        // Also fetch Quotes for the global lattice
        const quotes = await Quote.findAll({
            where: quoteWhere,
            include: [
                { model: Project, as: 'project', attributes: ['name'], required: false },
                { model: Client, as: 'clientDetails', attributes: ['name'], required: false }
            ],
            order: [['createdAt', 'DESC']]
        });

        console.log(`[Global Export] Data Fetched. Diaries: ${diaries.length}, Quotes: ${quotes.length}`);

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'MasterDiaryOS';
        
        // --- SHEET 1: EXECUTIVE DASHBOARD ---
        const dash = workbook.addWorksheet('Executive Dashboard');
        dash.columns = [{ width: 25 }, { width: 25 }, { width: 25 }, { width: 25 }];
        
        dash.mergeCells('A1:D2');
        const title = dash.getCell('A1');
        title.value = `${companyName.toUpperCase()} - OPERATIONAL INTELLIGENCE`;
        title.font = { size: 18, bold: true, color: { argb: 'FFFFFFFF' } };
        title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
        title.alignment = { horizontal: 'center', vertical: 'middle' };

        dash.getCell('A4').value = "TOTAL JOURNALS";
        dash.getCell('B4').value = diaries.length;
        dash.getCell('A5').value = "TOTAL QUOTES";
        dash.getCell('B5').value = quotes.length;
        dash.getCell('A6').value = "EXPORT DATE";
        dash.getCell('B6').value = new Date().toLocaleDateString();

        // --- SHEET 2: THE FINANCIAL LATTICE (Diary Data) ---
        const diarySheetName = 'Financial Lattice (Diaries)';
        const dataSheet = workbook.addWorksheet(diarySheetName);
        const headers = ['Date', 'Project', 'Job Ref', 'Client', 'Item Name', 'Category', 'Qty/Hrs', 'Cost Rate', 'Charge Rate', 'Total Cost', 'Total Revenue', 'Margin %', 'Site Notes'];
        dataSheet.addRow(headers);
        dataSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        dataSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2937' } };

        let rowCount = 2;
        diaries.forEach(diary => {
            try {
                const canvasData = diary.canvasData;
                // Handle both array and object formats for canvasData
                const entries = Array.isArray(canvasData) ? canvasData : (canvasData?.entries || []);
                const canvas = entries[0] || {};
                const items = canvas.items || [];
                const jobRef = diary.job?.jobNumber || 'N/A';
                const projectName = (diary.Project || diary.project)?.name || 'N/A';
                const clientName = (diary.Client || diary.client)?.name || 'N/A';
                
                if (items.length === 0) {
                    dataSheet.addRow([
                        diary.date,
                        projectName,
                        jobRef,
                        clientName,
                        'N/A',
                        'DIARY_LOG',
                        0, 0, 0, 0, 0, 0,
                        diary.notes || ''
                    ]);
                    rowCount++;
                } else {
                    items.forEach(item => {
                        if (!item) return;
                        const qty = parseFloat(item.quantity || item.duration || 0);
                        const costRate = parseFloat(item.costRate || item.cost || 0);
                        const chargeRate = parseFloat(item.chargeRate || item.revenue || 0);
                        
                        const cost = qty * costRate;
                        const rev = qty * chargeRate;
                        const margin = rev > 0 ? ((rev - cost) / rev) : 0;

                        dataSheet.addRow([
                            diary.date,
                            projectName,
                            jobRef,
                            clientName,
                            item.name || 'Unnamed',
                            item.type || 'Other',
                            qty,
                            costRate,
                            chargeRate,
                            cost,
                            rev,
                            margin,
                            diary.notes || ''
                        ]);
                        
                        // Format currency columns
                        ['H', 'I', 'J', 'K'].forEach(col => {
                            dataSheet.getCell(`${col}${rowCount}`).numFmt = '"$"#,##0.00';
                        });
                        dataSheet.getCell(`L${rowCount}`).numFmt = '0.0%';
                        rowCount++;
                    });
                }
            } catch (err) {
                console.warn(`[Global Export] Skipping diary ${diary.id} due to processing error:`, err.message);
            }
        });

        dataSheet.autoFilter = { from: 'A1', to: `M${rowCount - 1}` };

        // --- SHEET 3: QUOTE LATTICE ---
        const quoteSheet = workbook.addWorksheet('Neural Quote Lattice');
        const quoteHeaders = ['Created', 'Project', 'Client', 'Status', 'Total Revenue', 'Total Cost', 'Margin %', 'Version'];
        quoteSheet.addRow(quoteHeaders);
        quoteSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        quoteSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };

        let qRow = 2;
        quotes.forEach(q => {
            try {
                const rev = parseFloat(q.totalRevenue) || 0;
                const cost = parseFloat(q.totalCost) || 0;
                const margin = rev > 0 ? ((rev - cost) / rev) : 0;

                quoteSheet.addRow([
                    q.createdAt,
                    q.project?.name || q.Project?.name || 'N/A',
                    q.clientDetails?.name || q.Client?.name || 'N/A',
                    q.status,
                    rev,
                    cost,
                    margin,
                    q.version
                ]);

                ['E', 'F'].forEach(col => {
                    quoteSheet.getCell(`${col}${qRow}`).numFmt = '"$"#,##0.00';
                });
                quoteSheet.getCell(`G${qRow}`).numFmt = '0.0%';
                qRow++;
            } catch (err) {
                console.warn(`[Global Export] Skipping quote ${q.id} due to processing error:`, err.message);
            }
        });

        quoteSheet.autoFilter = { from: 'A1', to: `H${qRow - 1}` };

        // --- SHEET 4: PRINTABLE INVOICE GENERATOR ---
        const inv = workbook.addWorksheet('Printable Pro-forma');
        inv.columns = [{ width: 15 }, { width: 40 }, { width: 12 }, { width: 15 }, { width: 15 }];

        inv.mergeCells('A1:E1');
        inv.getCell('A1').value = companyName;
        inv.getCell('A1').font = { size: 20, bold: true };
        
        inv.getCell('A2').value = companyAddress;
        inv.getCell('A3').value = companyABN;

        inv.getCell('E1').value = 'PRO-FORMA';
        inv.getCell('E1').font = { size: 16, bold: true, color: { argb: 'FF999999' } };
        inv.getCell('E1').alignment = { horizontal: 'right' };

        inv.getCell('A5').value = "BILL TO:";
        inv.getCell('A5').font = { bold: true };
        
        let firstClient = "[Select Client]";
        if (diaries.length > 0) firstClient = (diaries[0].Client || diaries[0].client)?.name || firstClient;
        else if (quotes.length > 0) firstClient = (quotes[0].clientDetails || quotes[0].Client)?.name || firstClient;
        
        inv.getCell('A6').value = firstClient;

        const tableRow = 10;
        inv.getRow(tableRow).values = ['DATE', 'DESCRIPTION', 'QTY', 'RATE', 'AMOUNT'];
        inv.getRow(tableRow).font = { bold: true };
        inv.getRow(tableRow).border = { bottom: { style: 'thick' } };

        inv.getCell('D30').value = "TOTAL (FILTERED):";
        inv.getCell('D30').font = { bold: true };
        inv.getCell('E30').value = {
            formula: `SUBTOTAL(109, '${diarySheetName}'!K:K)`,
            result: 0
        };
        inv.getCell('E30').font = { bold: true };
        inv.getCell('E30').numFmt = '"$"#,##0.00';

        inv.getCell('A32').value = "INSTRUCTIONS: Use filters on 'Financial Lattice' sheets to select specific data, then print this sheet.";
        inv.getCell('A32').font = { italic: true, size: 9, color: { argb: 'FF666666' } };

        console.log(`[Global Export] Finalizing Workbook...`);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Neural_Lattice_Export_${Date.now()}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error("Global Export Error:", error);
        res.status(500).json({ error: "High-fidelity export failed: " + error.message });
    }
};

// --- 4. QUOTE EXPORT (QUOTE -> .XLSX) ---
const exportQuoteToExcel = async (req, res) => {
    try {
        const { quoteData, quoteSettings, financials } = req.body;
        const companyName = getSetting('companyName', 'MasterDiary Construction');
        const companyABN = getSetting('companyABN', 'ABN: 00 000 000 000');
        const companyAddress = getSetting('companyAddress', 'Firm Headquarters');

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'MasterDiaryOS';
        
        const sheet = workbook.addWorksheet('Quote Blueprint');

        const brandFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } }; // Indigo-600
        const headerFont = { name: 'Arial', family: 4, size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
        const subHeaderFont = { name: 'Arial', family: 4, size: 11, bold: true };

        sheet.mergeCells('A1:E1');
        const titleCell = sheet.getCell('A1');
        titleCell.value = `${companyName.toUpperCase()} - QUOTE BLUEPRINT`;
        titleCell.fill = brandFill;
        titleCell.font = headerFont;
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        sheet.getRow(1).height = 40;

        sheet.mergeCells('A2:E2');
        const metaCell = sheet.getCell('A2');
        metaCell.value = `CLIENT: ${quoteSettings?.clientName || 'N/A'} | DATE: ${new Date().toLocaleDateString()}`;
        metaCell.alignment = { horizontal: 'center' };
        metaCell.font = { italic: true };

        let currentRow = 4;
        sheet.getCell('A' + currentRow).value = "PROPOSED WORKS & MATERIALS";
        sheet.getCell('A' + currentRow).font = subHeaderFont;
        currentRow++;

        const tableHeaders = ['Description', 'Category', 'Qty', 'Rate', 'Total'];
        const headerRow = sheet.getRow(currentRow);
        headerRow.values = tableHeaders;
        headerRow.font = { bold: true };
        headerRow.border = { bottom: { style: 'thin' } };
        currentRow++;

        const items = quoteData.nodes || [];
        items.forEach(node => {
            const data = node.data || {};
            if (['quoteMaterial', 'quoteLabour', 'areaNode'].includes(node.type) || data.category) {
                const qty = parseFloat(data.quantity || data.duration || 1);
                const rate = parseFloat(data.rate || data.cost || 0);
                const total = qty * rate;

                sheet.getRow(currentRow).values = [
                    data.label || node.id,
                    data.category || data.nodeType || node.type,
                    qty,
                    rate,
                    total
                ];
                
                sheet.getCell(`D${currentRow}`).numFmt = '"$"#,##0.00';
                sheet.getCell(`E${currentRow}`).numFmt = '"$"#,##0.00';
                currentRow++;
            }
        });

        currentRow += 2;
        sheet.getCell('D' + currentRow).value = "SUBTOTAL:";
        sheet.getCell('D' + currentRow).font = { bold: true };
        sheet.getCell('E' + currentRow).value = financials?.subtotal || 0;
        sheet.getCell('E' + currentRow).numFmt = '"$"#,##0.00';
        currentRow++;

        sheet.getCell('D' + currentRow).value = "TAX (GST):";
        sheet.getCell('D' + currentRow).font = { bold: true };
        sheet.getCell('E' + currentRow).value = financials?.tax || 0;
        sheet.getCell('E' + currentRow).numFmt = '"$"#,##0.00';
        currentRow++;

        sheet.getCell('D' + currentRow).value = "TOTAL QUOTE:";
        sheet.getCell('D' + currentRow).font = { size: 12, bold: true, color: { argb: 'FF4F46E5' } };
        sheet.getCell('E' + currentRow).value = financials?.total || 0;
        sheet.getCell('E' + currentRow).font = { size: 12, bold: true };
        sheet.getCell('E' + currentRow).numFmt = '"$"#,##0.00';

        sheet.columns.forEach(column => {
            column.width = 25;
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Quote_${Date.now()}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error("Quote Export Error:", error);
        res.status(500).json({ error: "Quote export failed: " + error.message });
    }
};

// --- 5. EXCEL IMPORT (XLSX -> NODES) ---
const importExcel = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No Excel file uploaded." });

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(req.file.buffer);

        const sheet = workbook.getWorksheet(1); // Assume data is on first sheet
        const importedItems = [];

        sheet.eachRow((row, rowNumber) => {
            // Skip header (heuristic: check for known headers)
            const firstCell = row.getCell(1).value;
            if (rowNumber === 1 || String(firstCell).includes('Description') || String(firstCell).includes('Item Name')) return;

            // Heuristic Parsing: Map columns to our schema
            const name = row.getCell(1).text || row.getCell(1).value;
            const category = row.getCell(2).text || row.getCell(2).value || 'Material';
            const quantity = parseFloat(row.getCell(3).value) || 1;
            const rate = parseFloat(row.getCell(4).value) || 0;

            if (name) {
                importedItems.push({
                    id: `import-${Date.now()}-${rowNumber}`,
                    name: String(name),
                    type: String(category).toLowerCase().includes('labour') ? 'staff' : (String(category).toLowerCase().includes('equipment') ? 'equipment' : 'material'),
                    quantity,
                    rate,
                    costRate: rate,
                    chargeRate: rate * 1.2
                });
            }
        });

        res.json({ 
            success: true, 
            message: `Successfully analyzed ${importedItems.length} items.`,
            data: importedItems 
        });

    } catch (error) {
        console.error("Excel Import Error:", error);
        res.status(500).json({ error: "Failed to parse spreadsheet: " + error.message });
    }
};

module.exports = {
    transcribeLogbook,
    exportToExcel,
    exportGlobalManifest,
    exportQuoteToExcel,
    importExcel
};
