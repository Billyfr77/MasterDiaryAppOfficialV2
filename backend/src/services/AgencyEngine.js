/**
 * MasterDiaryOS // Agency Engine
 * The Agentic Core // Level 18 Autonomous Action
 * PROTOCOL OMEGA-ONE: Self-Correction & Database Agency
 */
const db = require('../models');

class AgencyEngine {
    constructor() {
        this.authorizedActions = ['UPDATE_QUOTE', 'UPDATE_PROJECT', 'ADJUST_LABOUR_RATE', 'SHIFT_WORKFLOW'];
    }

    /**
     * Proposes a neural directive for human sign-off
     * @param {Object} directive - The JSON action proposed by Grok
     */
    async proposeDirective(directive, userId) {
        console.log(`[AgencyEngine] 🛡️ Proposing Guarded Directive: ${directive.action}`);
        
        try {
            // Create a specialized Proposal Notification
            await db.Notification.create({
                userId,
                type: 'PROPOSAL',
                title: 'Strategic Sign-off Required',
                message: `Our AI Partner has identified a way to optimize our ${directive.action.replace(/_/g, ' ')}. Please review the rationale and sign off.`,
                isRead: false,
                data: { 
                    directive,
                    status: 'PENDING_SIGN_OFF',
                    timestamp: new Date()
                }
            });

            return { success: true, message: "Strategic proposal queued for our review." };
        } catch (err) {
            console.error(`[AgencyEngine] ❌ Proposal Failed: ${err.message}`);
            return { success: false, error: err.message };
        }
    }

    /**
     * Executes an approved directive
     */
    async executeApprovedDirective(notificationId, userId) {
        const notification = await db.Notification.findByPk(notificationId);
        if (!notification || notification.type !== 'PROPOSAL') throw new Error("Proposal not found.");
        
        const { directive } = notification.data;
        console.log(`[AgencyEngine] ✍️ Signing Off: ${directive.action}`);

        let result;
        switch (directive.action) {
            case 'UPDATE_QUOTE_MARGIN':
                result = await this.patchQuoteMargin(directive.quoteId, directive.newMargin, userId);
                break;
            case 'SHIFT_PROJECT_TIMELINE':
                result = await this.patchProjectTimeline(directive.projectId, directive.days, userId);
                break;
            case 'AUTO_CORRECT_LABOUR_DNA':
                result = await this.patchLabourRates(directive.staffId, directive.suggestedRate, userId);
                break;
            case 'UPDATE_MATERIAL_PRICE':
                result = await this.patchMaterialPrice(directive.nodeId, directive.newPrice, userId);
                break;
            case 'CREATE_BUSINESS_RULE':
                result = await this.recordBusinessRule(directive.title, directive.description, userId);
                break;
            default:
                throw new Error("Action type invalid.");
        }

        if (result.success) {
            notification.isRead = true;
            notification.data = { ...notification.data, status: 'EXECUTED', executedAt: new Date() };
            await notification.save();
        }

        return result;
    }

    async recordBusinessRule(title, description, userId) {
        await db.Insight.create({
            title,
            description,
            type: 'recommendation',
            priority: 1, // High priority for learned rules
            isRead: false
        });
        
        await this.logAgencyAction(userId, 'BRAIN_RULE_CREATED', `New Business Rule: ${title}`);
        return { success: true, message: "Rule stored in Corporate Brain." };
    }

    async patchMaterialPrice(id, price, userId) {
        const node = await db.Node.findByPk(id);
        if (!node) throw new Error("Material node not found.");
        
        const oldPrice = node.pricePerUnit;
        node.pricePerUnit = price;
        await node.save();
        
        await this.logAgencyAction(userId, 'MATERIAL_PRICE_SYNC', `Updated ${node.name} price from $${oldPrice} to $${price} based on recent receipt analysis.`);
        return { success: true, message: "Material DNA synchronized." };
    }

    async patchQuoteMargin(id, margin, userId) {
        const quote = await db.Quote.findByPk(id);
        if (!quote) throw new Error("Quote not found");
        
        const oldMargin = quote.marginPct;
        quote.marginPct = margin;
        // Recalculate total revenue based on new margin
        const cost = parseFloat(quote.totalCost);
        quote.totalRevenue = (cost * (1 + margin / 100)).toFixed(2);
        
        await quote.save();
        await this.logAgencyAction(userId, 'QUOTE_MARGIN_CORRECTION', `Auto-adjusted margin from ${oldMargin}% to ${margin}% to protect yield.`);
        return { success: true, message: `Quote ${id} margin protected.` };
    }

    async patchProjectTimeline(id, days, userId) {
        const project = await db.Project.findByPk(id);
        if (!project) throw new Error("Project not found");
        
        const newEnd = new Date(project.endDate);
        newEnd.setDate(newEnd.getDate() + days);
        project.endDate = newEnd;
        
        await project.save();
        await this.logAgencyAction(userId, 'TIMELINE_AUTO_SHIFTER', `Shifted project ${id} timeline by ${days} days due to site friction.`);
        return { success: true, message: "Timeline recalibrated." };
    }

    async patchLabourRates(id, rate, userId) {
        const staff = await db.Staff.findByPk(id);
        if (!staff) throw new Error("Staff member not found");
        
        staff.chargeOutBase = rate;
        await staff.save();
        await this.logAgencyAction(userId, 'DNA_REWRITE', `Updated charge rate for ${staff.name} to $${rate}/hr based on efficiency learning.`);
        return { success: true, message: "DNA Record Updated." };
    }

    async logAgencyAction(userId, type, message) {
        if (db.Notification) {
            await db.Notification.create({
                userId,
                type: 'SYSTEM',
                title: 'Autonomous Agency Executed',
                message,
                isRead: false
            });
        }
        console.log(`[Agency] ${type}: ${message}`);
    }
}

module.exports = new AgencyEngine();