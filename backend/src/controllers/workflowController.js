const db = require('../models');
const { integrateNodeAction } = require('../services/workflowIntegrationService');
const templates = require('../utils/workflowTemplates');
const workflowEngine = require('../services/workflowEngine');

const Workflow = db.Workflow;

// @desc    Run/Start a workflow
// @route   POST /api/workflows/:id/run
// @access  Private
const runWorkflow = async (req, res) => {
  try {
    const context = req.body.context || {};
    const workflow = await workflowEngine.startWorkflow(req.params.id, context);
    res.json(workflow);
  } catch (error) {
    console.error("Run Workflow Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resume a suspended node (complete task/approval)
// @route   POST /api/workflows/:id/nodes/:nodeId/resume
// @access  Private
const resumeNode = async (req, res) => {
  try {
    const inputData = req.body;
    const workflow = await workflowEngine.resumeWorkflow(req.params.id, req.params.nodeId, inputData);
    res.json(workflow);
  } catch (error) {
    console.error("Resume Node Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all workflows
// @route   GET /api/workflows
// @access  Private
const getWorkflows = async (req, res) => {
  try {
    const query = { where: {} };
    if (req.query.integrationId) query.where.integrationId = req.query.integrationId;
    
    const workflows = await Workflow.findAll({
      ...query,
      order: [['updatedAt', 'DESC']]
    });
    res.json(workflows);
  } catch (error) {
    console.error("Get Workflows Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single workflow
// @route   GET /api/workflows/:id
// @access  Private
const getWorkflowById = async (req, res) => {
  try {
    const workflow = await Workflow.findByPk(req.params.id);
    if (workflow) {
      res.json(workflow);
    } else {
      res.status(404).json({ message: 'Workflow not found' });
    }
  } catch (error) {
    console.error("Get Workflow By ID Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a workflow
// @route   POST /api/workflows
// @access  Private
const createWorkflow = async (req, res) => {
  try {
    const { title, description, nodes, edges, integrationId, integrationType, status } = req.body;
    
    const workflow = await Workflow.create({
      title: title || 'New Workflow',
      description,
      nodes: nodes || [],
      edges: edges || [],
      status: status || 'draft',
      createdBy: req.user ? req.user.id : 'system',
      integrationId,
      integrationType
    });

    res.status(201).json(workflow);
  } catch (error) {
    console.error("Create Workflow Error:", error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a workflow
// @route   PUT /api/workflows/:id
// @access  Private
const updateWorkflow = async (req, res) => {
  try {
    const { title, nodes, edges, status, settings } = req.body;
    const workflow = await Workflow.findByPk(req.params.id);

    if (workflow) {
      // Update fields
      if (title) workflow.title = title;
      if (nodes) workflow.nodes = nodes;
      if (edges) workflow.edges = edges;
      if (status) workflow.status = status;
      if (settings) workflow.settings = settings;

      await workflow.save();
      
      // Automation Hook: Check for completed nodes in the new payload
      if (nodes && Array.isArray(nodes)) {
          nodes.forEach(node => {
              if (node.data && node.data.status === 'completed') {
                  // Trigger integration actions
                  integrateNodeAction(node, workflow.id);
              }
          });
      }

      res.json(workflow);
    } else {
      res.status(404).json({ message: 'Workflow not found' });
    }
  } catch (error) {
    console.error("Update Workflow Error:", error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a workflow
// @route   DELETE /api/workflows/:id
// @access  Private
const deleteWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findByPk(req.params.id);
    if (workflow) {
      await workflow.destroy();
      res.json({ message: 'Workflow removed' });
    } else {
      res.status(404).json({ message: 'Workflow not found' });
    }
  } catch (error) {
    console.error("Delete Workflow Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate a template workflow
// @route   POST /api/workflows/template
// @access  Private
const generateTemplate = async (req, res) => {
    const { type, prompt } = req.body;
    let templateData = { nodes: [], edges: [] };

    // AI Prompt Simulation (Basic keyword matching)
    if (prompt) {
        const lowerPrompt = prompt.toLowerCase();
        if (lowerPrompt.includes('bathroom') || lowerPrompt.includes('reno')) {
            templateData = templates.renovation_bathroom;
        } else if (lowerPrompt.includes('safety') || lowerPrompt.includes('audit')) {
            templateData = templates.inspection;
        } else if (lowerPrompt.includes('onboard') || lowerPrompt.includes('induction')) {
            templateData = templates.onboarding;
        } else if (lowerPrompt.includes('quote') || lowerPrompt.includes('approval')) {
            templateData = templates.quote_approval;
        } else {
            // Default to full construction if vague but construction related
            templateData = templates.construction;
        }
    } else if (templates[type]) {
        templateData = templates[type];
    } else {
        // Fallback default
        templateData = {
            nodes: [
                { id: '1', type: 'input', data: { label: 'Start', status: 'pending' }, position: { x: 250, y: 0 } },
                { id: '2', type: 'output', data: { label: 'End', status: 'pending' }, position: { x: 250, y: 100 } }
            ],
            edges: [
                { id: 'e1-2', source: '1', target: '2', type: 'custom' }
            ]
        };
    }

    res.json(templateData);
};

module.exports = {
  getWorkflows,
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  generateTemplate,
  runWorkflow,
  resumeNode
};
