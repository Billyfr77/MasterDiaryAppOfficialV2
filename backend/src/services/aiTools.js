const db = require('../models');

// --- Tool Implementations ---

async function get_project_details({ projectId }) {
  if (!projectId) return { error: "Project ID is required to get details." };
  try {
    const project = await db.Project.findByPk(projectId, { 
      include: ['quotes', { model: db.Diary, as: 'Diaries' }, 'documents'] 
    });
    // Note: Financials are calculated on the fly in projectController, we can replicate or simplify here for AI
    return project ? project.toJSON() : { error: "Project not found." };
  } catch (e) {
    return { error: `Database error: ${e.message}` };
  }
}

async function get_recent_diaries({ projectId, limit = 5 }) {
    if (!projectId) return { error: "Project ID is required to get diaries." };
    try {
        const diaries = await db.Diary.findAll({ where: { projectId }, limit, order: [['date', 'DESC']] });
        return diaries.length > 0 ? diaries.map(d => d.toJSON()) : { info: "No recent diaries found for this project." };
    } catch (e) {
        return { error: `Database error: ${e.message}` };
    }
}

async function get_active_projects({ limit = 5 }) {
    try {
        const projects = await db.Project.findAll({ where: { status: 'active' }, limit, order: [['createdAt', 'DESC']]});
        return projects.length > 0 ? projects.map(p => ({ id: p.id, name: p.name, site: p.site, status: p.status })) : { info: "No active projects found."};
    } catch (e) {
        return { error: `Database error: ${e.message}` };
    }
}


// --- Tool Manifest ---

const tools = [
  {
    name: 'get_project_details',
    description: 'Get full details, quotes, and diaries for a specific project by its ID.',
    function: get_project_details,
    schema: {
        type: 'function',
        function: {
            name: 'get_project_details',
            description: 'Get full details for a single project.',
            parameters: { type: 'object', properties: { projectId: { type: 'string', description: 'The UUID of the project.' } }, required: ['projectId'] }
        }
    }
  },
  {
    name: 'get_recent_diaries',
    description: 'Get the most recent diary entries for a specific project ID.',
    function: get_recent_diaries,
    schema: {
        type: 'function',
        function: {
            name: 'get_recent_diaries',
            description: 'Get recent diary entries for a project.',
            parameters: { type: 'object', properties: { projectId: { type: 'string', description: 'The UUID of the project.' }, limit: { type: 'integer', description: 'Number of entries to return.'} }, required: ['projectId'] }
        }
    }
  },
  {
    name: 'get_active_projects',
    description: 'Get a list of currently active projects.',
    function: get_active_projects,
    schema: {
        type: 'function',
        function: {
            name: 'get_active_projects',
            description: 'Get a list of active projects.',
            parameters: { type: 'object', properties: { limit: { type: 'integer', description: 'Number of projects to return.'} } }
        }
    }
  }
];

module.exports = {
    getTool(name) {
        return tools.find(t => t.name === name);
    },
    getToolSchemas() {
        return tools.map(t => t.schema);
    }
};
