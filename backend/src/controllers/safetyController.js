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
    
    // Validate project exists
    const project = await Project.findByPk(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    let finalData = data || {};

    // If templateId provided, merge template structure/defaults
    if (templateId && SafetyTemplate) {
        const template = await SafetyTemplate.findByPk(templateId);
        if (template) {
            // Logic to merge template structure into form data if needed
            // For now, we assume 'data' might be pre-filled with template structure
            // or we could store the structure in a separate field if we normalized it
        }
    }

    const newForm = await SafetyForm.create({
      title,
      type,
      projectId,
      templateId: templateId || null,
      data: finalData,
      status: status || 'DRAFT',
      latitude,
      longitude,
      locationDetails,
      riskLevel,
      createdBy: req.user ? req.user.id : null
    });

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
    form.version = (form.version || 1) + 1;

    await form.save();
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
        if (!SafetyTemplate) return res.status(500).json({ message: "SafetyTemplate model not loaded" });
        const template = await SafetyTemplate.create({
            ...req.body,
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
        if (!SafetyTemplate) return res.status(500).json({ message: "SafetyTemplate model not loaded" });
        const templates = await SafetyTemplate.findAll();
        res.json(templates);
    } catch(e) {
        res.status(500).json({ error: e.message });
    }
};

// AI Assist
exports.generateAIContent = async (req, res) => {
    try {
        const { prompt, context } = req.body;
        // Basic RAG context could be added here
        const systemPrompt = "You are an expert Safety Officer (ISO 45001). Generate a JSON list of hazards and controls based on the work description. Format: [{ hazard: '', risk: 'High', controls: [''] }]";
        const content = await pinnacleAi.generateText(`${prompt} Context: ${JSON.stringify(context)}`, systemPrompt);
        // Attempt to parse JSON if model returned code block
        const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
        res.json({ result: cleanContent });
    } catch(e) {
        console.error(e);
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

