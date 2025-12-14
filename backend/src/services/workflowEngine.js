const EventEmitter = require('events');
const { logAudit } = require('./auditService');
// Lazy load models to avoid circular dependency issues during init
const db = require('../models');

class WorkflowEngine extends EventEmitter {
  constructor() {
    super();
    // Register Event Listeners
    this.on('quote.approved', (data) => this.processEvent('quote.approved', data));
    this.on('job.completed', (data) => this.processEvent('job.completed', data));
    this.on('project.created', (data) => this.processEvent('project.created', data));
  }

  async processEvent(eventName, payload) {
    console.log(`[WorkflowEngine] Processing event: ${eventName}`);
    
    try {
      // 1. Fetch Active Workflows
      // Check if Workflow model is loaded
      if (!db.Workflow) {
          console.warn("[WorkflowEngine] Workflow model not loaded yet.");
          return;
      }

      const workflows = await db.Workflow.findAll({ where: { status: 'active' } });

      for (const wf of workflows) {
        const nodes = wf.nodes || [];
        const edges = wf.edges || [];

        // 2. Find Trigger Nodes matching this event
        // We look for nodes with type 'trigger' and matching event name in data
        const triggers = nodes.filter(n => n.type === 'trigger' && n.data?.event === eventName);

        for (const trigger of triggers) {
          console.log(`[WorkflowEngine] Trigger hit: ${trigger.data?.label || 'Unnamed'} in workflow "${wf.title}"`);
          
          // 3. Find Connected Actions (BFS Traversal could go here, but doing immediate neighbors for MVP)
          const connectedEdges = edges.filter(e => e.source === trigger.id);
          const nextNodeIds = connectedEdges.map(e => e.target);
          const actionNodes = nodes.filter(n => nextNodeIds.includes(n.id) && n.type === 'action');

          // 4. Execute Actions
          for (const actionNode of actionNodes) {
             await this.executeAction(actionNode, payload, wf);
          }
        }
      }
    } catch (err) {
      console.error("[WorkflowEngine] Error processing event:", err);
    }
  }

  async executeAction(node, payload, workflow) {
      const actionType = node.data?.actionType;
      console.log(`[WorkflowEngine] Executing Action: ${actionType} (Node: ${node.id})`);
      
      try {
          if (actionType === 'create_project') {
              // Example: Convert Quote to Project
              if (payload.quote) {
                  const { quote } = payload;
                  console.log(`--> Converting Quote ${quote.id} to Project...`);
                  await db.Project.create({
                      name: quote.name,
                      client: ' Derived from Quote', // Simplified
                      clientId: quote.clientId,
                      status: 'active',
                      value: quote.totalRevenue,
                      site: 'Site TBD',
                      userId: payload.user?.id
                  });
                  await logAudit(payload.user?.id, 'WORKFLOW_ACTION', 'Project', 'New', { msg: `Created from Quote via Workflow "${workflow.title}"` });
              }
          } 
          else if (actionType === 'send_email') {
              console.log(`--> Sending Notification Email to ${node.data?.recipient || 'Admin'}...`);
              // Implement emailService call here
          } 
          else if (actionType === 'log_audit') {
              await logAudit(payload.user?.id, 'WORKFLOW_LOG', 'System', 'N/A', { 
                  message: node.data?.message || 'Workflow executed',
                  context: payload 
              });
          }
          
          // Mark node as 'completed' in visual state? 
          // (Requires a 'WorkflowExecution' model to track instance state, skipped for MVP)

      } catch (e) {
          console.error(`[WorkflowEngine] Action Failed: ${e.message}`);
          await logAudit(payload.user?.id, 'WORKFLOW_ERROR', 'Workflow', workflow.id, { error: e.message });
      }
  }
}

const workflowEngine = new WorkflowEngine();
module.exports = workflowEngine;
