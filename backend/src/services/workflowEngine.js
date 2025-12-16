const EventEmitter = require('events');
const { logAudit } = require('./auditService');
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
      if (!db.Workflow) {
          console.warn("[WorkflowEngine] Workflow model not loaded.");
          return;
      }

      // 1. Fetch Active Workflows
      const workflows = await db.Workflow.findAll({ where: { status: 'active' } });

      for (const wf of workflows) {
        const nodes = wf.nodes || [];
        const edges = wf.edges || [];

        // 2. Find Trigger Nodes
        const triggers = nodes.filter(n => n.type === 'trigger' && n.data?.event === eventName);

        for (const trigger of triggers) {
          console.log(`[WorkflowEngine] ⚡ Trigger hit: ${trigger.data?.label} (Workflow: ${wf.title})`);
          
          // Start Recursive Execution
          await this.executeNodeChain(trigger, payload, wf, nodes, edges, new Set());
        }
      }
    } catch (err) {
      console.error("[WorkflowEngine] Critical Error:", err);
    }
  }

  // Recursive Graph Traversal
  async executeNodeChain(currentNode, payload, workflow, allNodes, allEdges, visited) {
      if (visited.has(currentNode.id)) return; // Prevent loops
      visited.add(currentNode.id);

      // Execute current node logic
      const success = await this.executeAction(currentNode, payload, workflow);
      
      if (!success && currentNode.type !== 'trigger') {
          console.warn(`[WorkflowEngine] Node execution failed or halted at ${currentNode.id}`);
          return;
      }

      // Find outgoing edges
      const outgoingEdges = allEdges.filter(e => e.source === currentNode.id);
      
      for (const edge of outgoingEdges) {
          // Handle Conditional Logic (Decision Nodes)
          if (currentNode.type === 'decision') {
              // Simple logic: Check payload values against edge label or node rules
              // For MVP: If edge label matches a flag in payload (e.g., "approved" -> "Yes")
              // This part requires a more complex rules engine. 
              // For now, we follow ALL paths unless explicitly blocked.
          }

          const targetNode = allNodes.find(n => n.id === edge.target);
          if (targetNode) {
              // Add a small delay for realism/ordering
              await new Promise(r => setTimeout(r, 500));
              await this.executeNodeChain(targetNode, payload, workflow, allNodes, allEdges, visited);
          }
      }
  }

  async executeAction(node, payload, workflow) {
      const actionType = node.data?.actionType;
      const label = node.data?.label || 'Unknown Action';
      console.log(`[WorkflowEngine] ▶ Executing Node: ${label} (${node.type})`);
      
      try {
          // --- TYPE: ACTION ---
          if (node.type === 'action') {
              
              // 1. CREATE PROJECT
              if (actionType === 'create_project' && payload.quote) {
                  const { quote } = payload;
                  const newProject = await db.Project.create({
                      name: quote.name,
                      client: 'Derived from Quote',
                      clientId: quote.clientId,
                      status: 'active',
                      value: quote.totalRevenue,
                      site: 'Site TBD',
                      userId: payload.user?.id
                  });
                  
                  // Notify
                  await this.sendSystemNotification(payload.user?.id, 'Project Created', `Project "${newProject.name}" created automatically via workflow.`);
                  await logAudit(payload.user?.id, 'WORKFLOW_ACTION', 'Project', newProject.id, { msg: `Created from Quote` });
              } 
              
              // 2. CREATE INVOICE
              else if (actionType === 'create_invoice' && payload.project) {
                  // Assuming Invoice model exists
                  if (db.Invoice) {
                      const inv = await db.Invoice.create({
                          projectId: payload.project.id,
                          amount: payload.project.value || 0,
                          status: 'draft',
                          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // +7 days
                      });
                       await this.sendSystemNotification(payload.user?.id, 'Invoice Generated', `Draft invoice #${inv.id} created for project.`);
                  }
              }

              // 3. ASSIGN STAFF (ALLOCATION)
              else if (actionType === 'assign_staff' && payload.project) {
                  const staffId = node.data?.staffId; // Should be set in node data
                  if (staffId && db.Allocation) {
                      await db.Allocation.create({
                          projectId: payload.project.id,
                          resourceType: 'staff',
                          resourceId: staffId,
                          startDate: new Date(),
                          endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day default
                          status: 'active'
                      });
                      await this.sendSystemNotification(payload.user?.id, 'Resource Allocated', `Staff assigned to project via workflow.`);
                  }
              }

              // 4. SEND EMAIL / NOTIFICATION (Explicit)
              else if (actionType === 'send_notification' || actionType === 'send_email') {
                  const recipientId = node.data?.assigneeId || payload.user?.id;
                  const message = node.data?.description || `Action required: ${label}`;
                  await this.sendSystemNotification(recipientId, 'Workflow Alert', message);
              }
          }
          
          // --- TYPE: APPROVAL / MILESTONE ---
          else if (node.type === 'approval' || node.type === 'milestone') {
             // Just notify for now
             const msg = node.type === 'approval' ? `Approval Required: ${label}` : `Milestone Reached: ${label}`;
             await this.sendSystemNotification(payload.user?.id, 'Workflow Update', msg);
          }

          return true; // Success

      } catch (e) {
          console.error(`[WorkflowEngine] ❌ Action Failed: ${e.message}`);
          await logAudit(payload.user?.id, 'WORKFLOW_ERROR', 'Workflow', workflow.id, { error: e.message });
          return false;
      }
  }

  async sendSystemNotification(userId, title, message) {
      if (!userId) return;
      try {
          if (db.Notification) {
              await db.Notification.create({
                  userId,
                  type: 'SYSTEM',
                  title,
                  message,
                  isRead: false,
                  data: { timestamp: new Date() }
              });
              console.log(`[WorkflowEngine] 🔔 Notification sent to User ${userId}`);
          }
      } catch (e) {
          console.error("Failed to send notification:", e.message);
      }
  }
}

const workflowEngine = new WorkflowEngine();
module.exports = workflowEngine;
