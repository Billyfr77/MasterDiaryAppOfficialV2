const cron = require('node-cron');
const { User, Project, Diary, Notification } = require('../models');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini for analysis
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const getModel = () => genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const startWatchdog = () => {
  console.log('🐶 [AI WATCHDOG] Started. Monitoring projects for profit leaks...');

  // Run every night at 2 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('🐶 [AI WATCHDOG] Running nightly analysis...');
    try {
      const users = await User.findAll();
      
      for (const user of users) {
        await analyzeUserProjects(user.id);
      }
    } catch (err) {
      console.error('🐶 [AI WATCHDOG] Error:', err);
    }
  });
};

const analyzeUserProjects = async (userId) => {
  try {
    // Fetch active projects
    const projects = await Project.findAll({
      where: { userId, status: 'active' },
      include: [{
        model: Diary,
        limit: 5,
        order: [['date', 'DESC']]
      }]
    });

    if (projects.length === 0) return;

    // Prepare data for Gemini
    const projectSummaries = projects.map(p => {
      const recentLogs = p.Diaries || [];
      const totalCost = recentLogs.reduce((acc, d) => acc + (d.totalCost || 0), 0);
      const totalRev = recentLogs.reduce((acc, d) => acc + (d.totalRevenue || 0), 0);
      return {
        name: p.name,
        recentCost: totalCost,
        recentRevenue: totalRev,
        logsCount: recentLogs.length
      };
    });

    const prompt = `
    Analyze these active construction projects for User ID ${userId}.
    Data: ${JSON.stringify(projectSummaries)}
    
    Identify ANY project that is "leaking profit" (Cost > Revenue) or looks suspicious.
    If everything is fine, return "OK".
    If there is a risk, return a short, urgent warning message (max 1 sentence) for the worst project.
    `;

    const model = getModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = response.text().trim();

    if (analysis !== "OK" && analysis.length > 5) {
      // Create Notification
      await Notification.create({
        userId,
        type: 'WARNING',
        title: 'Profit Leak Detected',
        message: analysis,
        isRead: false
      });
      console.log(`🐶 [AI WATCHDOG] Alert created for User ${userId}: ${analysis}`);
    }

  } catch (error) {
    console.error(`🐶 [AI WATCHDOG] Analysis failed for User ${userId}:`, error);
  }
};

module.exports = { startWatchdog };
