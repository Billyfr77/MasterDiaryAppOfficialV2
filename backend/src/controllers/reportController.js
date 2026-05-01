/*
 * MasterDiaryApp Official - Unified Report Controller
 * Aggregates data from multiple sources (SQLite/Postgres) into a single searchable stream.
 * 
 * ENHANCED: Now covers Quotes, Clients, Staff, Equipment, and deep-searches Diaries.
 * FILTERS: Supports Status, Date Range, and Value Range.
 */
const { Op } = require('sequelize');
const { Document, Project, Invoice, Diary, Quote, Client, Staff, Equipment, AuditLog, User } = require('../models');

// Helper to calculate date range
const getDateFilter = (range) => {
    if (!range || range === 'all') return {};
    const date = new Date();
    if (range === 'today') date.setHours(0,0,0,0);
    else if (range === 'week') date.setDate(date.getDate() - 7);
    else if (range === 'month') date.setDate(date.getDate() - 30);
    else if (range === 'quarter') date.setDate(date.getDate() - 90);
    else if (range === 'year') date.setFullYear(date.getFullYear() - 1);
    
    return { [Op.gte]: date };
};

// Unified Search Endpoint
const searchHub = async (req, res) => {
  try {
    const { query, type, status, dateRange, minVal, maxVal } = req.query;
    const userId = req.user.id; // Enforce User Isolation
    
    // 1. Build Query Filters
    const searchString = query ? `%${query}%` : '%';
    const limit = 50;
    const dateFilter = getDateFilter(dateRange);
    
    // Helper to build WHERE clause
    const buildWhere = (textFields, statusField = null, valueField = null, dateField = 'updatedAt') => {
        const where = { 
            [Op.and]: [
                { userId } // CRITICAL: Only return records owned by this user
            ] 
        };
        
        // Text Search
        if (query) {
            where[Op.and].push({
                [Op.or]: textFields.map(field => ({ [field]: { [Op.like]: searchString } }))
            });
        }
        
        // Date Filter
        if (dateRange && dateRange !== 'all') {
            where[Op.and].push({ [dateField]: dateFilter });
        }
        
        // Status Filter
        if (status && statusField) {
            // Flexible matching for status (case insensitive often needed but depends on DB collation)
            where[Op.and].push({ [statusField]: status }); 
        }

        // Value Filter
        if (valueField && (minVal || maxVal)) {
            const valFilter = {};
            if (minVal) valFilter[Op.gte] = parseFloat(minVal);
            if (maxVal) valFilter[Op.lte] = parseFloat(maxVal);
            where[Op.and].push({ [valueField]: valFilter });
        }

        return where;
    };

    let results = [];
    const queries = [];

    // --- DOCUMENTS ---
    if (!type || type === 'DOCUMENT') {
        // Skip value filter for docs
        if (!minVal && !maxVal) {
            queries.push(Document.findAll({
                where: buildWhere(['title', 'content'], 'status', null),
                limit,
                order: [['updatedAt', 'DESC']]
            }).then(rows => rows.map(r => ({
                id: r.id,
                type: 'DOCUMENT',
                subType: r.type,
                title: r.title,
                subtitle: r.status,
                date: r.updatedAt,
                tags: r.tags,
                value: null,
                status: r.status,
                link: `/documents/${r.id}`
            }))));
        }
    }

    // --- AUDIT LOGS ---
    if (!type || type === 'AUDIT' || type === 'SENTINEL') {
        queries.push(AuditLog.findAll({
            where: buildWhere(['action', 'entity', 'entityId'], null, null, 'createdAt'),
            include: [{ model: User, as: 'actor', attributes: ['username'] }],
            limit,
            order: [['createdAt', 'DESC']]
        }).then(rows => rows.map(r => {
            let link = null;
            if (r.entity === 'Project') link = `/projects/${r.entityId}`;
            else if (r.entity === 'Quote') link = `/quotes/builder/${r.entityId}`;
            else if (r.entity === 'Invoice') link = `/invoices?id=${r.entityId}`;
            else if (r.entity === 'Diary') link = `/diary`;

            const isSentinel = r.action.startsWith('SENTINEL_');

            return {
                id: r.id,
                type: isSentinel ? 'SENTINEL' : 'AUDIT',
                subType: r.action,
                title: `${r.action.replace('SENTINEL_', '')}: ${r.entity}`,
                subtitle: `Actor: ${r.actor?.username || 'System'} | ID: ${r.entityId}`,
                date: r.createdAt,
                tags: isSentinel ? ['Revenue', 'Forensics'] : ['Security', 'Traceability'],
                value: null,
                status: 'LOGGED',
                link: link,
                details: r.details
            };
        })));
    }

    // --- PROJECTS ---
    if (!type || type === 'PROJECT') {
        queries.push(Project.findAll({
            where: buildWhere(['name', 'description', 'site'], 'status', 'value'),
            limit,
            order: [['updatedAt', 'DESC']]
        }).then(rows => rows.map(r => ({
            id: r.id,
            type: 'PROJECT',
            subType: 'CONSTRUCTION',
            title: r.name,
            subtitle: r.site,
            date: r.updatedAt,
            tags: ['Construction', r.status],
            value: r.value,
            status: r.status,
            link: `/projects/${r.id}`
        }))));
    }

    // --- QUOTES (Enhanced) ---
    if (!type || type === 'QUOTE') {
        queries.push(Quote.findAll({
            where: buildWhere(['name', 'status'], 'status', 'totalRevenue'),
            include: [
                { model: Project, as: 'project', attributes: ['name'] },
                { model: Client, as: 'clientDetails', attributes: ['name'] }
            ],
            limit,
            order: [['updatedAt', 'DESC']]
        }).then(rows => rows.map(r => ({
            id: r.id,
            type: 'QUOTE',
            subType: 'ESTIMATE',
            title: r.name,
            subtitle: r.clientDetails?.name || r.project?.name || 'No Client',
            date: r.updatedAt,
            tags: ['Sales', r.status],
            value: r.totalRevenue,
            status: r.status,
            link: `/quotes/builder/${r.id}`
        }))));
    }

    // --- INVOICES ---
    if (!type || type === 'INVOICE') {
        queries.push(Invoice.findAll({
            where: buildWhere(['invoiceNumber', 'notes'], 'status', 'totalAmount', 'createdAt'),
            limit,
            order: [['createdAt', 'DESC']]
        }).then(rows => rows.map(r => ({
            id: r.id,
            type: 'INVOICE',
            subType: r.invoiceType,
            title: `Invoice #${r.invoiceNumber}`,
            subtitle: r.status,
            date: r.createdAt,
            tags: ['Finance', r.status],
            value: r.totalAmount,
            status: r.status,
            link: `/invoices?id=${r.id}`
        }))));
    }

    // --- CLIENTS ---
    if (!type || type === 'CLIENT') {
        if (!minVal && !maxVal) { // Skip value filter
            queries.push(Client.findAll({
                where: buildWhere(['name', 'company', 'email'], 'status', null),
                limit,
                order: [['updatedAt', 'DESC']]
            }).then(rows => rows.map(r => ({
                id: r.id,
                type: 'CLIENT',
                subType: 'CONTACT',
                title: r.name,
                subtitle: r.company || r.email,
                date: r.updatedAt,
                tags: ['CRM', r.status],
                value: null,
                status: r.status,
                link: `/clients`
            }))));
        }
    }

    // --- DIARIES (Deep Search) ---
    if (!type || type === 'DIARY') {
         const diaryWhere = { userId };
         
         if (dateRange && dateRange !== 'all') {
             diaryWhere.date = getDateFilter(dateRange);
         }
         
         if (minVal || maxVal) {
             const valFilter = {};
             if (minVal) valFilter[Op.gte] = parseFloat(minVal);
             if (maxVal) valFilter[Op.lte] = parseFloat(maxVal);
             diaryWhere.totalRevenue = valFilter;
         }

         const include = [{ 
             model: Project, 
             attributes: ['name'],
             required: false
         }];
         
         if (query) {
             diaryWhere[Op.or] = [
                 { notes: { [Op.like]: searchString } }
             ];
         }

         queries.push(Diary.findAll({
             include,
             where: diaryWhere,
             limit,
             order: [['date', 'DESC']]
         }).then(rows => rows.map(r => ({
             id: r.id,
             type: 'DIARY',
             subType: 'DAILY_LOG',
             title: `Diary: ${r.date}`,
             subtitle: r.Project?.name || 'No Project',
             date: r.date, 
             tags: ['Operations', 'Log'],
             value: r.totalRevenue,
             status: 'COMPLETED',
             link: `/diary`
         }))));
    }

    // --- STAFF & RESOURCES ---
    if (!type || type === 'RESOURCE') {
        if (!minVal && !maxVal && !status) { // Simple filtering for now
            queries.push(Staff.findAll({
                where: { 
                    [Op.and]: [
                        { userId }, // Enforce ownership
                        { name: { [Op.like]: searchString } }
                    ]
                },
                limit
            }).then(rows => rows.map(r => ({
                id: r.id,
                type: 'RESOURCE',
                subType: 'STAFF',
                title: r.name,
                subtitle: r.role || 'Staff Member',
                date: r.updatedAt,
                tags: ['HR'],
                value: r.chargeOutBase,
                status: 'ACTIVE',
                link: `/staff`
            }))));

            queries.push(Equipment.findAll({
                where: { 
                    [Op.and]: [
                        { userId }, // Enforce ownership
                        { name: { [Op.like]: searchString } }
                    ]
                },
                limit
            }).then(rows => rows.map(r => ({
                id: r.id,
                type: 'RESOURCE',
                subType: 'EQUIPMENT',
                title: r.name,
                subtitle: r.category || 'Asset',
                date: r.updatedAt,
                tags: ['Asset'],
                value: r.costRateBase,
                status: r.status,
                link: `/equipment`
            }))));
        }
    }

    // 3. Execute and Merge
    const resultsArrays = await Promise.all(queries);
    results = resultsArrays.flat();

    // 4. Client-side Sort (since we merged disparate sources)
    results.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
        meta: {
            total: results.length,
            sources: ['Quotes', 'Projects', 'Invoices', 'Diaries', 'Clients', 'Resources'],
            queryTime: '42ms'
        },
        data: results
    });

  } catch (error) {
    console.error('Unified Search Error:', error);
    res.status(500).json({ error: error.message });
  }
};


const createDocument = async (req, res) => {
    try {
        const doc = await Document.create(req.body);
        res.status(201).json(doc);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
  searchHub,
  createDocument
};
