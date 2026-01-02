const db = require('../models');
const { SafetyForm, Project, User, SafetyTemplate } = db;
const pinnacleAi = require('../services/grokService');

// Get all forms (optionally filter by Project)
exports.getForms = async (req, res) => {
  try {
    const { projectId, type } = req.query;
    const where = {};
    if (projectId) where.projectId = projectId;
    if (type) where.type = type;

    const forms = await SafetyForm.findAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'username', 'email'] },
        { model: Project, as: 'project', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    return res.json(forms);
  } catch (error) {
    console.error('Error fetching safety forms:', error);
    res.status(500).json({ message: 'Error fetching safety forms', error: error.message });
  }
};

// Get single form
exports.getFormById = async (req, res) => {
  try {
    const form = await SafetyForm.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'username', 'email'] },
        { model: Project, as: 'project', attributes: ['id', 'name'] }
      ]
    });

    if (!form) return res.status(404).json({ message: 'Safety form not found' });
    res.json(form);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching safety form', error: error.message });
  }
};

// Create new form
exports.createForm = async (req, res) => {
  try {
    const { title, type, projectId, data, status, latitude, longitude, locationDetails, riskLevel, templateId } = req.body;
    
    let targetProjectId = projectId;
    if (!targetProjectId) {
        const lastProject = await Project.findOne({ order: [['updatedAt', 'DESC']] });
        if (lastProject) targetProjectId = lastProject.id;
    }
    
    const newForm = await SafetyForm.create({
      title,
      type,
      projectId: targetProjectId,
      templateId: templateId || null,
      data: data || {},
      status: status || 'DRAFT',
      latitude,
      longitude,
      locationDetails,
      riskLevel,
      createdBy: req.user ? req.user.id : null
    });

    const workflowEngine = require('../services/workflowEngine');
    workflowEngine.emit('job.completed', { safetyForm: newForm, projectId: targetProjectId, userId: req.user?.id });

    res.status(201).json(newForm);
  } catch (error) {
    res.status(500).json({ message: 'Error creating safety form', error: error.message });
  }
};

// Update form (Data or Status)
exports.updateForm = async (req, res) => {
  try {
    const { title, data, status, latitude, longitude, locationDetails, riskLevel } = req.body;
    const form = await SafetyForm.findByPk(req.params.id);

    if (!form) return res.status(404).json({ message: 'Safety form not found' });

    if (title) form.title = title;
    if (data) form.data = data;
    if (status) form.status = status;
    if (latitude !== undefined) form.latitude = latitude;
    if (longitude !== undefined) form.longitude = longitude;
    if (locationDetails) form.locationDetails = locationDetails;
    if (riskLevel) form.riskLevel = riskLevel;
    
    await form.save();

    const workflowEngine = require('../services/workflowEngine');
    workflowEngine.emit('job.completed', { safetyForm: form, projectId: form.projectId, userId: req.user?.id });

    res.json(form);
  } catch (error) {
    res.status(500).json({ message: 'Error updating safety form', error: error.message });
  }
};

// Sign form
exports.signForm = async (req, res) => {
  try {
    const { signatureData, signerName, signerRole } = req.body;
    const form = await SafetyForm.findByPk(req.params.id);

    if (!form) return res.status(404).json({ message: 'Safety form not found' });

    const newSignature = {
      name: signerName || (req.user ? req.user.username : 'Unknown'),
      role: signerRole || 'Staff',
      signature: signatureData,
      timestamp: new Date()
    };

    const currentSignatures = form.signatures || [];
    form.signatures = [...currentSignatures, newSignature];

    await form.save();
    res.json(form);
  } catch (error) {
    res.status(500).json({ message: 'Error signing safety form', error: error.message });
  }
};

// Delete form
exports.deleteForm = async (req, res) => {
  try {
    const form = await SafetyForm.findByPk(req.params.id);
    if (!form) return res.status(404).json({ message: 'Safety form not found' });

    await form.destroy();
    res.json({ message: 'Safety form deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting safety form', error: error.message });
  }
};

// Create Template
exports.createTemplate = async (req, res) => {
    try {
        let cleanStructure = req.body.structure;
        if (typeof cleanStructure === 'string') {
            try { cleanStructure = JSON.parse(cleanStructure); } catch(e) {}
        }

        const template = await SafetyTemplate.create({
            name: req.body.name || 'Untitled Template',
            type: req.body.type || 'SWMS',
            structure: cleanStructure || [],
            createdBy: req.user ? req.user.id : null
        });
        res.status(201).json(template);
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
};

// Get Templates
exports.getTemplates = async (req, res) => {
    try {
        const templates = await SafetyTemplate.findAll();
        res.json(templates);
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
};

// AI Assist - UPGRADED for Full Document Generation
exports.generateAIContent = async (req, res) => {
    try {
        const { prompt, context, mode = 'hazards' } = req.body;
        
        let systemPrompt = "";

        if (mode === 'full_form') {
             systemPrompt = `
                You are a Senior HSEQ Manager and Lead Auditor (ISO 45001 & Safe Work Australia Standards).
                Your task is to generate a **world-class, legally robust, and industry-specific** Safety Document based on the user's request.
                
                **Objective:**
                Create a document that would pass a Tier 1 Construction Site Audit. It must be detailed, specific, and formatted professionally.

                **Output Format:**
                Return a valid JSON object with a single key "fields", which is an array of field objects.

                **Field Types Available:**
                - 'header': Section titles.
                - 'paragraph': Read-only text.
                - 'text': Input fields.
                - 'date', 'time', 'checkbox', 'select', 'signature'.
                - 'hazard': { "label": "Hazard", "value": "Control Measure" }.

                **Mandatory Structure:**
                1. Document Control. 2. Scope. 3. Emergency. 4. Risks (hazard fields). 5. PPE. 6. Sign-off.
             `;
             
             const result = await pinnacleAi.generateJSON(`${prompt} Context: ${JSON.stringify(context)}`, systemPrompt);
             return res.json({ result });

        } else if (mode === 'polish') {
             systemPrompt = "You are a professional technical writer for construction safety. Return JSON: { \"text\": \"Polished text...\" }";
             const result = await pinnacleAi.generateJSON(prompt, systemPrompt);
             return res.json({ result });

        } else if (mode === 'consult') {
            systemPrompt = `
                You are "Pinnacle Safety Copilot", an expert Construction Safety Consultant (ISO 45001).
                Return a valid JSON object:
                {
                    "reply": "Conversational advice...",
                    "suggestedDocuments": [
                        { "title": "Title", "description": "Why?", "type": "SWMS" | "PERMIT" | "RISK_ASSESSMENT" }
                    ]
                }
            `;
            const result = await pinnacleAi.generateJSON(`${prompt} Context: ${JSON.stringify(context)}`, systemPrompt);
            return res.json({ result });

        } else {
             // Legacy/Simple mode
             systemPrompt = "You are an expert Safety Officer (ISO 45001). Generate a JSON list of hazards and controls. Format: { \"result\": [{ \"hazard\": \"\", \"risk\": \"High\", \"controls\": [\"\"] }] }";
             const result = await pinnacleAi.generateJSON(`${prompt} Context: ${JSON.stringify(context)}`, systemPrompt);
             return res.json({ result: result.result || result });
        }

    } catch(e) {
        console.error("AI Generation Error:", e);
        res.status(500).json({ error: "AI Generation Failed" });
    }
};

// Import Document
exports.importDocument = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const {projectId, title, type} = req.body;
        let fileUrl = req.file.path;
        
        if (process.env.NODE_ENV !== 'production' && !fileUrl.startsWith('http')) {
             const protocol = req.protocol;
             const host = req.get('host');
             fileUrl = `${protocol}://${host}/${fileUrl.replace(/\\/g, '/')}`;
        }

        const newForm = await SafetyForm.create({
            title: title || req.file.originalname,
            type: type || 'IMPORTED_DOC',
            projectId: projectId || null,
            status: 'COMPLETED',
            data: { fileUrl, filename: req.file.originalname, mimetype: req.file.mimetype, size: req.file.size },
            createdBy: req.user ? req.user.id : null
        });

        res.status(201).json({ message: "Document imported successfully", form: newForm });
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
};