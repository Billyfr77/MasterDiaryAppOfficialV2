const db = require('../models');
const { integrateNodeAction } = require('./workflowIntegrationService');

class WorkflowEngine {
  constructor() {
    this.Workflow = db.Workflow;
    // Map node types to handler functions
    this.handlers = {
      'start': this.handleStartNode.bind(this),
      'email': this.handleEmailNode.bind(this),
      'approval': this.handleApprovalNode.bind(this),
      'decision': this.handleDecisionNode.bind(this),
      'delay': this.handleDelayNode.bind(this),
      'default': this.handleDefaultNode.bind(this)
    };
  }

  /**
   * Starts a workflow execution
   * @param {string} workflowId 
   * @param {object} context Initial data (e.g., projectId, quoteId)
   */
  async startWorkflow(workflowId, context = {}) {
    console.log(`[WorkflowEngine] Starting workflow ${workflowId}`);
    const workflow = await this.Workflow.findByPk(workflowId);
    if (!workflow) throw new Error('Workflow not found');

    // Reset status to active and clear node statuses if restarting
    // For now, let's assume we are just updating the existing record state
    // In a real system, we might create a "WorkflowInstance" record
    
    // Find start node(s) - usually nodes with no incoming edges or type 'input'/'start'
    const startNodes = workflow.nodes.filter(n => n.type === 'input' || n.type === 'start');
    
    if (startNodes.length === 0) {
        // Fallback: Find nodes with no incoming edges
        const targetIds = new Set(workflow.edges.map(e => e.target));
        const roots = workflow.nodes.filter(n => !targetIds.has(n.id));
        startNodes.push(...roots);
    }

    // Update workflow status
    workflow.status = 'active';
    
    // Reset all nodes to pending, except start nodes to in-progress
    const updatedNodes = workflow.nodes.map(node => ({
        ...node,
        data: {
            ...node.data,
            status: startNodes.find(sn => sn.id === node.id) ? 'in-progress' : 'pending'
        }
    }));
    
    workflow.nodes = updatedNodes;
    await workflow.save();

    // Process start nodes
    for (const node of startNodes) {
        await this.processNode(workflow, node, context);
    }

    return workflow;
  }

  /**
   * Processes a single node
   */
  async processNode(workflow, node, context) {
    console.log(`[WorkflowEngine] Processing node ${node.id} (${node.type})`);
    
    // 1. Update status to in-progress
    await this.updateNodeStatus(workflow, node.id, 'in-progress');

    try {
        // 2. Execute handler
        const handler = this.handlers[node.type] || this.handlers['default'];
        const result = await handler(node, context);

        // 3. If handler returns completed (synchronous action), move next
        if (result.status === 'completed') {
            await this.completeNode(workflow, node, result.output);
        } else if (result.status === 'suspended') {
            // Waiting for external event (e.g., approval)
            console.log(`[WorkflowEngine] Node ${node.id} suspended (waiting)`);
        }

    } catch (error) {
        console.error(`[WorkflowEngine] Error in node ${node.id}:`, error);
        await this.updateNodeStatus(workflow, node.id, 'error', { error: error.message });
    }
  }

  /**
   * Marks a node as complete and triggers next steps
   */
  async completeNode(workflow, node, output = {}) {
    console.log(`[WorkflowEngine] Completing node ${node.id}`);
    
    // 1. Mark current as completed
    await this.updateNodeStatus(workflow, node.id, 'completed', { output });

    // 1b. Trigger Integrations (Email, Invoice, Resource Allocation)
    if (integrateNodeAction) {
        await integrateNodeAction(node, workflow.id);
    }

    // 2. Find outgoing edges
    const outgoingEdges = workflow.edges.filter(e => e.source === node.id);

    // 3. Determine next nodes
    for (const edge of outgoingEdges) {
        const targetNode = workflow.nodes.find(n => n.id === edge.target);
        if (!targetNode) continue;

        // Logic Check: If the previous node was a decision, check the edge handle/condition
        if (node.type === 'decision') {
            // Ensure the edge matches the decision result (e.g., 'true' or 'false')
            // Default decision output should map to sourceHandle
            if (edge.sourceHandle && edge.sourceHandle !== String(output.decision)) {
                continue; // Skip this path
            }
        }

        // Dependency Check: Are all parents of targetNode completed?
        const incomingEdges = workflow.edges.filter(e => e.target === targetNode.id);
        const allParentsCompleted = incomingEdges.every(inEdge => {
            const parent = workflow.nodes.find(n => n.id === inEdge.source);
            return parent && parent.data && parent.data.status === 'completed';
        });

        if (!allParentsCompleted) {
            console.log(`[WorkflowEngine] Node ${targetNode.id} waiting for dependencies.`);
            continue;
        }

        // Trigger next node
        await this.processNode(workflow, targetNode, {});
    }
  }

  /**
   * Helper to update node data in JSON blob
   */
  async updateNodeStatus(workflow, nodeId, status, extraData = {}) {
    // Reload workflow to ensure we have latest state (concurrency handling would be better here)
    const freshWorkflow = await this.Workflow.findByPk(workflow.id);
    const nodes = freshWorkflow.nodes.map(n => {
        if (n.id === nodeId) {
            return {
                ...n,
                data: { ...n.data, status, ...extraData }
            };
        }
        return n;
    });

    freshWorkflow.nodes = nodes;
    freshWorkflow.changed('nodes', true); // Force Sequelize to recognize JSON change
    await freshWorkflow.save();
    
    // Update local reference
    workflow.nodes = nodes; 
  }

  // --- HANDLERS ---

  async handleStartNode(node, context) {
    return { status: 'completed', output: { startedAt: new Date() } };
  }

  async handleDefaultNode(node, context) {
    // Default nodes (tasks) generally require manual completion, 
    // but if it's just a pass-through or purely informational, complete immediately.
    // For "Task" type, we might return 'suspended' until user clicks complete in UI.
    
    if (node.data && node.data.autoComplete) {
         return { status: 'completed' };
    }
    return { status: 'suspended' }; // Wait for manual user action
  }

  async handleEmailNode(node, context) {
    console.log(`[Action] Sending email notification for node ${node.id}`);
    // Use the workflowIntegrationService to send a notification
    // Assume `node.data.automation.sendEmail` is true and `node.data.assignee` is the target.
    if (node.data.automation?.sendEmail && node.data.assignee) {
        await integrateNodeAction({ ...node, data: { ...node.data, automation: { sendEmail: true } } }, null); // workflowId is null as it's handled internally by the service
        return { status: 'completed', output: { sent: true } };
    }
    return { status: 'completed', output: { sent: false, reason: 'No assignee or email automation configured.' } };
  }

  async handleDecisionNode(node, context) {
    // Decision nodes require a 'condition' in their data, e.g., 'context.someValue > 10'
    // For enterprise-grade, this would use a secure expression evaluator.
    // For now, we simulate a simple boolean condition based on node data.
    console.log(`[Action] Evaluating decision for node ${node.id}: ${node.data.condition}`);
    let decisionResult = false;
    if (typeof node.data.condition === 'boolean') {
        decisionResult = node.data.condition;
    } else if (typeof node.data.condition === 'string') {
        // Basic string evaluation (e.g., 'true', 'false', 'APPROVED', 'REJECTED')
        decisionResult = (node.data.condition.toLowerCase() === 'true' || node.data.condition.toLowerCase() === 'approved');
    }

    return { status: 'completed', output: { decision: decisionResult } };
  }

  async handleDelayNode(node, context) {
    const duration = node.data.duration || 5000; // Default 5 seconds
    console.log(`[Action] Delaying workflow for ${duration}ms at node ${node.id}`);
    
    // In a real production system, this would not block the event loop.
    // Instead, it would save the workflow state and schedule a background job
    // to resume it after the delay. For this demonstration, we use setTimeout.
    await new Promise(resolve => setTimeout(resolve, duration));
    
    return { status: 'completed', output: { delayedFor: duration } };
  }

  async handleApprovalNode(node, context) {
     console.log(`[Action] Approval requested for node ${node.id}. Suspending workflow.`);
     return { status: 'suspended' }; // Wait for manual user approval
  }

  // --- PUBLIC METHODS FOR EXTERNAL TRIGGERS ---

  /**
   * Called by API when a user manually completes a task/approval
   * @param {string} workflowId 
   * @param {string} nodeId 
   * @param {object} inputData Data from the user's action (e.g., { approved: true, comment: 'Looks good' })
   */
  async resumeWorkflow(workflowId, nodeId, inputData = {}) {
     const workflow = await this.Workflow.findByPk(workflowId);
     if (!workflow) throw new Error('Workflow not found');

     const node = workflow.nodes.find(n => n.id === nodeId);
     if (!node) throw new Error('Node not found');
     
     // Specific logic for approval nodes
     if (node.type === 'approval') {
         const { approved, comment } = inputData;
         if (approved === undefined) throw new Error('Approval decision (approved: true/false) is required.');
         
         // Decision will be passed to completeNode and used by outgoing edges
         const output = { approved, comment, completedBy: 'user', completedAt: new Date() };
         await this.completeNode(workflow, node, output);
     } else {
         // Generic task completion
         const output = { ...inputData, completedBy: 'user', completedAt: new Date() };
         await this.completeNode(workflow, node, output);
     }
     
     return workflow;
  }
}

module.exports = new WorkflowEngine();
