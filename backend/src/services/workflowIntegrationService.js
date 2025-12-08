const db = require('../models');

// Mock notification service (replace with actual Twilio/SendGrid integration)
const sendNotification = async (userId, message, type = 'in-app') => {
  console.log(`[Notification Service] Sending ${type} to User ${userId}: ${message}`);
  // In real app: await sendGrid.send(...) or twilio.messages.create(...)
  // We could also store this in a Notifications table if it exists
  try {
      if (db.Notification) {
          await db.Notification.create({
              userId: userId === 'admin' ? null : userId, // Handle admin generic user
              message,
              type,
              read: false,
              priority: 'high'
          });
      }
  } catch (err) {
      console.error("Failed to save notification to DB", err);
  }
};

const integrateNodeAction = async (node, workflowId) => {
  try {
    const { automation } = node.data;
    if (!automation) return;

    console.log(`[Workflow Integration] Processing automation for Node ${node.id}`);
    
    // Retrieve workflow to check integration context
    // Using Sequelize
    const workflow = await db.Workflow.findByPk(workflowId);
    if (!workflow) return;

    // 1. Quoting Integration
    if (automation.updateQuoteStatus) {
       if (workflow.integrationType === 'quote' && workflow.integrationId) {
           console.log(`[Integration] Updating Quote ${workflow.integrationId} status to ${automation.updateQuoteStatus}`);
           
           try {
               // Use Sequelize model
               const quote = await db.Quote.findByPk(workflow.integrationId);
               if (quote) {
                   quote.status = automation.updateQuoteStatus;
                   await quote.save();
                   console.log(`[Integration] Quote status updated.`);
               } else {
                   console.warn(`[Integration] Quote not found with ID ${workflow.integrationId}`);
               }
           } catch (dbError) {
               console.error(`[Integration] DB Error updating quote:`, dbError);
           }
       }
    }

    // 2. Invoicing Integration
    if (automation.createInvoice) {
        console.log(`[Integration] Generatng Invoice for Node completion...`);
        // Basic placeholder creation logic
        if (workflow.integrationType === 'project' && workflow.integrationId) {
             try {
                // Check if Invoice model exists and has required fields
                if (db.Invoice) {
                     await db.Invoice.create({
                         projectId: workflow.integrationId,
                         diaryId: null, // Optional in this context?
                         invoiceType: 'customer',
                         status: 'draft',
                         totalAmount: 0, // Would need calculation logic
                         invoiceData: { generatedFrom: `Workflow: ${workflow.title}`, nodeId: node.id },
                         notes: `Auto-generated from workflow node: ${node.data.label}`
                     });
                     console.log(`[Integration] Invoice Draft Created.`);
                }
             } catch (dbError) {
                 console.error(`[Integration] DB Error creating invoice:`, dbError);
             }
        }
    }

    // 3. Email/SMS Notifications
    if (automation.sendEmail) {
        const assignee = node.data.assignee;
        if (assignee) {
             // In a real app, resolve assignee name to User ID
             // For now, passing name/ID directly
             await sendNotification(assignee, `Task "${node.data.label}" is ready for you!`, 'email');
        }
    }
    
    // 4. Escalation / Alerts
    if (node.data.deadline && new Date(node.data.deadline) < new Date()) {
         await sendNotification('admin', `Escalation: Node ${node.data.label} is overdue!`, 'sms');
    }

    // 5. Resource Allocation Integration
    if (automation.allocateResource) {
        console.log(`[Integration] Auto-allocating resource for Node ${node.id}`);
        if (workflow.integrationType === 'project' && workflow.integrationId) {
            try {
                // Find resource by assignee name (simple resolution)
                let resource = null;
                let resourceType = 'staff';
                
                if (node.data.assignee) {
                    resource = await db.Staff.findOne({ where: { name: node.data.assignee } });
                    if (!resource) {
                        resource = await db.Equipment.findOne({ where: { name: node.data.assignee } });
                        if (resource) resourceType = 'equipment';
                    }
                }

                if (resource && db.Allocation) {
                    const startDate = node.data.startDate || new Date();
                    const endDate = node.data.deadline || new Date();
                    
                    await db.Allocation.create({
                        resourceType,
                        resourceId: resource.id,
                        projectId: workflow.integrationId,
                        startDate: startDate,
                        endDate: endDate,
                        status: 'scheduled',
                        notes: `Auto-scheduled via Workflow: ${node.data.label}`
                    });
                    console.log(`[Integration] Resource ${resource.name} allocated.`);
                } else {
                    console.warn(`[Integration] Could not resolve resource for allocation.`);
                }
            } catch (dbError) {
                console.error(`[Integration] DB Error allocating resource:`, dbError);
            }
        }
    }

  } catch (error) {
    console.error('[Workflow Integration Error]', error);
  }
};

const checkWorkflowAutomations = async (workflowId) => {
    // This function can be called by a CRON job or after update
    // Using Sequelize
    const workflow = await db.Workflow.findByPk(workflowId);
    if (!workflow) return;

    // Check for "Auto-start" nodes or Bottlenecks
    // For each pending node, check if all parents are completed
    // This requires building a graph from edges
    // Simplify: Just check deadlines for now
    
    const now = new Date();
    // Use .nodes (JSON parsed by Sequelize if defined correctly, or manual parsing needed?)
    // In our model definition, it's DataTypes.JSON, so it should be an object/array already.
    const nodes = workflow.nodes || [];
    
    nodes.forEach(async (node) => {
         if (node.data && node.data.status !== 'completed' && node.data.deadline) {
             if (new Date(node.data.deadline) < now) {
                 // Overdue!
                 console.log(`[Automation] Node ${node.id} is overdue.`);
                 if (node.data.automation?.autoEscalate) {
                      await sendNotification('admin', `Escalation: Node ${node.data.label} is overdue!`, 'push');
                 }
             }
         }
    });
};

module.exports = {
  integrateNodeAction,
  checkWorkflowAutomations
};
