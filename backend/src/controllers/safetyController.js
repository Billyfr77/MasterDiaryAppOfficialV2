const db = require('../models');
const { SafetyForm, Project, User, SafetyTemplate } = db;
const pinnacleAi = require('../services/grokService');

// Get all forms (optionally filter by Project)
exports.getForms = async (req, res) => {
  console.log('SafetyController: getForms called');
  
  if (!SafetyForm) {
    console.error('SafetyForm model is UNDEFINED');
    return res.status(500).json({ message: 'Critical: SafetyForm model is not loaded', dbKeys: Object.keys(db) });
  }

  try {
    const { projectId, type } = req.query;
    const where = {};
    if (projectId) where.projectId = projectId;
    if (type) where.type = type;

    console.log('Querying SafetyForms with:', where);

    try {
        const forms = await SafetyForm.findAll({
          where,
          include: [
            { model: User, as: 'creator', attributes: ['id', 'username', 'email'] },
            { model: Project, as: 'project', attributes: ['id', 'name'] }
          ],
          order: [['createdAt', 'DESC']]
        });
        console.log(`Found ${forms.length} forms (with includes)`);
        return res.json(forms);
    } catch (includeError) {
        console.error('Query with includes failed:', includeError.message);
        console.log('Retrying without includes...');
        
        // Fallback: Fetch without includes to confirm basic table access
        const simpleForms = await SafetyForm.findAll({ where, order: [['createdAt', 'DESC']] });
        console.log(`Found ${simpleForms.length} forms (NO includes)`);
        
        // Attach a warning to the response so frontend/dev knows
        return res.json(simpleForms.map(f => ({ 
            ...f.toJSON(), 
            _warning: 'Associations failed to load',
            project: { name: 'Unknown Project' },
            creator: { username: 'Unknown User' }
        })));
    }

  } catch (error) {
    console.error('Error fetching safety forms:', error);
    res.status(500).json({ 
      message: 'Error fetching safety forms', 
      error: error.message, 
      stack: error.stack,
      dbKeys: Object.keys(db)
    });
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
    console.error('Error fetching safety form:', error);
    res.status(500).json({ message: 'Error fetching safety form', error: error.message, stack: error.stack });
  }
};

// Create new form
exports.createForm = async (req, res) => {
  try {
    const { title, type, projectId, data, status, latitude, longitude, locationDetails, riskLevel, templateId } = req.body;
    
    let targetProjectId = projectId;

    // Fallback: If no projectId provided, try to grab the most recent active project
    if (!targetProjectId) {
        const lastProject = await Project.findOne({ order: [['updatedAt', 'DESC']] });
        if (lastProject) {
            targetProjectId = lastProject.id;
        }
        // If still null, it's okay -> Unassigned Draft
    }
    
    // Validate project exists IF we have an ID
    if (targetProjectId) {
        const project = await Project.findByPk(targetProjectId);
        if (!project) return res.status(404).json({ message: 'Project not found' });
    }

    let finalData = data || {};

    // If templateId provided, merge template structure/defaults
    if (templateId && SafetyTemplate) {
        const template = await SafetyTemplate.findByPk(templateId);
        if (template) {
            // Logic to merge template structure into form data if needed
            // For now, we assume 'data' might be pre-filled with template structure
        }
    }

    const newForm = await SafetyForm.create({
      title,
      type,
      projectId: targetProjectId,
      templateId: templateId || null,
      data: finalData,
      status: status || 'DRAFT',
      latitude,
      longitude,
      locationDetails,
      riskLevel,
      createdBy: req.user ? req.user.id : null
    });

    // Trigger Workflow Engine
    const workflowEngine = require('../services/workflowEngine');
    workflowEngine.emit('job.completed', { safetyForm: newForm, projectId: targetProjectId, userId: req.user?.id });

    res.status(201).json(newForm);
  } catch (error) {
    console.error('Error creating safety form:', error);
    res.status(500).json({ message: 'Error creating safety form', error: error.message, stack: error.stack });
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
    
    // Simple Version bump logic
    await form.save();

    // Trigger Workflow Engine
    const workflowEngine = require('../services/workflowEngine');
    workflowEngine.emit('job.completed', { safetyForm: form, projectId: form.projectId, userId: req.user?.id });

    res.json(form);
  } catch (error) {
    console.error('Error updating safety form:', error);
    res.status(500).json({ message: 'Error updating safety form', error: error.message, stack: error.stack });
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
      signature: signatureData, // Base64 string usually
      timestamp: new Date()
    };

    // Append to signatures array
    // Sequelize JSON array manipulation
    const currentSignatures = form.signatures || [];
    form.signatures = [...currentSignatures, newSignature];

    await form.save();
    res.json(form);
  } catch (error) {
    console.error('Error signing safety form:', error);
    res.status(500).json({ message: 'Error signing safety form', error: error.message, stack: error.stack });
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
    console.error('Error deleting safety form:', error);
    res.status(500).json({ message: 'Error deleting safety form', error: error.message, stack: error.stack });
  }
};

// --- NEW CAPABILITIES ---

// Create Template
exports.createTemplate = async (req, res) => {
    try {
        console.log("createTemplate called with:", JSON.stringify(req.body, null, 2));
        
        // Ensure structure is valid JSON (if it's a string, parse it; if object, keep it)
        let cleanStructure = req.body.structure;
        if (typeof cleanStructure === 'string') {
            try { cleanStructure = JSON.parse(cleanStructure); } catch(e) {}
        }

        const payload = {
            name: req.body.name || 'Untitled Template',
            type: req.body.type || 'SWMS',
            structure: cleanStructure || [],
            createdBy: req.user ? req.user.id : null
        };
        console.log("Creating template with payload:", payload);

        const template = await db.SafetyTemplate.create(payload);
        console.log("Template created:", template.id);
        res.status(201).json(template);
    } catch(e) {
        console.error("Template Creation Error:", e);
        res.status(500).json({ error: e.message, stack: e.stack });
    }
};

// Get Templates
exports.getTemplates = async (req, res) => {
    try {
        if (!SafetyTemplate) return res.status(500).json({ message: "SafetyTemplate model not loaded" });
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
                - 'header': Section titles (e.g., "1. High Risk Construction Work").
                - 'paragraph': Read-only text for instructions, legislation, or procedures.
                - 'text': Single line inputs (e.g., "Project Manager Name").
                - 'date': Date pickers.
                - 'time': Time pickers.
                - 'checkbox': Checkbox lists (e.g., for PPE or Pre-starts).
                - 'hazard': A specialized card for Risk/Control. Label = Hazard, Value = Control Measure.
                - 'signature': Sign-off blocks.
                - 'select': Dropdowns.

                **Mandatory Structure & Content Quality:**
                1.  **Document Control Header:** Start with fields for "Project Name", "Site Address", "Date", and "Permit/SWMS Number".
                2.  **Scope & Legislation:** Include a 'paragraph' field with a professional "Scope of Works" description and a list of relevant Standards/Codes of Practice (e.g., "AS/NZS 3000 for Electrical", "Code of Practice: Excavation").
                3.  **Emergency Response:** Include a section defining the assembly point and emergency contact details.
                4.  **Critical Risk Analysis:** Generate specific 'hazard' fields. 
                    -   *Label*: The specific hazard (e.g., "Trench Collapse > 1.5m").
                    -   *Value*: A detailed, realistic hierarchy of control (e.g., "1. Benching/battering required. 2. Shoring box installed. 3. Geotech report reviewed."). DO NOT use generic text like "Be careful".
                5.  **PPE & Plant:** Use a 'checkbox' field for standard PPE (Hard Hat, Boots, Hi-Vis, Glasses, Gloves) and specific items (e.g., Harness, Respirator).
                6.  **Sign-Off:** Conclude with a clear declaration paragraph ("I have read and understood...") followed by signature fields for "Worker(s)" and "Supervisor".

                **Tone:** Formal, Technical, Legalistic.
             `;
             
             const result = await pinnacleAi.generateJSON(`${prompt} Context: ${JSON.stringify(context)}`, systemPrompt);
             return res.json({ result });

        } else if (mode === 'polish') {
             // Text polishing mode (returns simple JSON wrapper)
             systemPrompt = "You are a professional technical writer for construction safety. Improve the clarity, tone, and professionalism of the provided text. Return JSON: { \"text\": \"Polished text...\" }";
             const result = await pinnacleAi.generateJSON(prompt, systemPrompt);
             return res.json({ result });

        } else if (mode === 'consult') {
            // Consultation Mode (New Feature)
            systemPrompt = `
                You are "Pinnacle Safety Copilot", an expert Construction Safety Consultant (ISO 45001).
                Your goal is to advise the user on what safety documentation is required for their described work activity.

                **Output Format:**
                Return a valid JSON object:
                {
                    "reply": "A concise, professional conversational response explaining the risks and requirements.",
                    "suggestedDocuments": [
                        {
                            "title": "Document Title (e.g. Roof Work SWMS)",
                            "description": "Brief explanation of why this is needed.",
                            "type": "SWMS" | "PERMIT" | "RISK_ASSESSMENT" | "INCIDENT_REPORT" | "TOOLBOX_TALK"
                        }
                    ]
                }

                **Rules:**
                1. Analyze the user's work description (e.g. "digging a trench").
                2. Identify key risks (collapse, services, access).
                3. Recommend specific documents to manage those risks.
                4. Keep the "reply" helpful and ask for confirmation to proceed.
            `;
            const result = await pinnacleAi.generateJSON(`${prompt} Context: ${JSON.stringify(context)}`, systemPrompt);
            return res.json({ result });

        } else {
             // Legacy/Simple mode
             systemPrompt = "You are an expert Safety Officer (ISO 45001). Generate a JSON list of hazards and controls based on the work description. Format: [{ hazard: '', risk: 'High', controls: [''] }]";
             const content = await pinnacleAi.generateText(`${prompt} Context: ${JSON.stringify(context)}`, systemPrompt);
             // Robust JSON Parsing for legacy text mode
             let cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
             let result;
             try {
                result = JSON.parse(cleanContent);
             } catch (e) {
                result = { error: "Could not parse AI response", raw: cleanContent };
             }
             return res.json({ result });
        }

    } catch(e) {
        console.error("AI Generation Error:", e);
        res.status(500).json({ error: "AI Generation Failed" });
    }
};

// Import Document
exports.importDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { projectId, title, type } = req.body;
        
        // Use the path from the storage engine (Google Storage public URL or local path)
        let fileUrl = req.file.path;
        
        // For local development, prefix with server address if it's just a filename/path
        if (process.env.NODE_ENV !== 'production' && !fileUrl.startsWith('http')) {
             const protocol = req.protocol;
             const host = req.get('host');
             fileUrl = `${protocol}://${host}/${fileUrl.replace(/\\/g, '/')}`;
        }

        const newForm = await SafetyForm.create({
            title: title || req.file.originalname,
            type: type || 'IMPORTED_DOC',
            projectId: projectId || null,
            status: 'COMPLETED', // Imported docs are usually final
            data: { 
                fileUrl: fileUrl,
                filename: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size
            },
            createdBy: req.user ? req.user.id : null
        });

        res.status(201).json({ 
            message: "Document imported successfully",
            form: newForm
        });
    } catch(e) {
        console.error("Import Error:", e);
        res.status(500).json({ error: e.message });
    }
};

