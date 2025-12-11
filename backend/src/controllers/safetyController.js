const db = require('../models');
const { SafetyForm, Project, User } = db;

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
    const { title, type, projectId, data, status, latitude, longitude, locationDetails, riskLevel } = req.body;
    
    // Validate project exists
    const project = await Project.findByPk(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const newForm = await SafetyForm.create({
      title,
      type,
      projectId,
      data: data || {},
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
