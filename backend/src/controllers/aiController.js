const express = require('express');
const { generateJSON, generateContent } = require('../utils/aiService');
const { Project, Diary } = require('../models');

// --- WORKFLOW GENERATION ---
const generateWorkflow = async (req, res) => {
  try {
    const { prompt, type } = req.body;
    
    const systemPrompt = `
      You are an expert construction project manager. 
      Create a React Flow node/edge structure for a workflow based on the user's request.
      
      Output JSON format must match:
      {
        "nodes": [ { "id": "1", "type": "default", "data": { "label": "Task Name", "status": "pending" }, "position": { "x": 0, "y": 0 } } ],
        "edges": [ { "id": "e1-2", "source": "1", "target": "2", "type": "custom" } ]
      }
      
      Ensure the nodes are positioned logically (dagre-like layout) so they don't overlap.
      Use node types: 'default' (tasks), 'decision' (logic), 'milestone' (important), 'approval' (sign-off).
    `;

    const workflowData = await generateJSON(`Create a workflow for: ${prompt || type}`, systemPrompt);
    res.json(workflowData);

  } catch (error) {
    console.error("AI Controller Error FULL:", error); // Log full object
    res.status(500).json({ error: error.message, details: error.toString() });
  }
};

// --- SMART SUMMARY (DIARIES) ---
const generateDiarySummary = async (req, res) => {
    try {
        const { projectId } = req.body;
        
        // Fetch last 10 diaries for context
        const diaries = await Diary.findAll({
            where: { projectId }, 
            limit: 10, 
            order: [['date', 'DESC']]
        });

        if (!diaries.length) return res.json({ summary: "No recent diary entries to analyze." });

        const diaryText = diaries.map(d => `Date: ${d.date}, Weather: ${d.weather}, Notes: ${d.notes}`).join('\n');

        const systemPrompt = "You are a senior site foreman. Summarize the recent site activity into a concise, professional progress report for the client. Highlight key achievements and any weather delays.";
        
        const summary = await generateContent(`Summarize these logs:\n${diaryText}`, systemPrompt);
        
        res.json({ summary });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- GLOBAL CHAT ASSISTANT ---
const chatGlobal = async (req, res) => {
    try {
        const { message, context } = req.body;
        
        const systemPrompt = `
            You are Pinnacle AI, the advanced super-assistant for MasterDiaryOS.
            Your goal is to help construction managers, site supervisors, and business owners manage their operations.
            
            Capabilities:
            - Answer questions about construction management, scheduling, and resource allocation.
            - Draft professional emails, diary entries, and quotes.
            - Analyze project risks and suggest improvements.
            - Provide navigation help within the app (pulse, projects, diary, resources, map-builder, reports).
            
            Tone: Professional, concise, authoritative yet helpful.
            
            Current Context: ${JSON.stringify(context || {})}
        `;

        const reply = await generateContent(message, systemPrompt);
        res.json({ reply });

    } catch (error) {
        console.error("AI Chat Error:", error);
        res.status(500).json({ error: "I'm having trouble processing that right now." });
    }
};

module.exports = {
  generateWorkflow,
  generateDiarySummary,
  chatGlobal
};
