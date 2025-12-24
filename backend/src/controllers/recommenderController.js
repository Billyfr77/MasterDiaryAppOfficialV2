const aiController = require('./aiController'); // Import the AI controller

const getRecommendations = async (req, res) => {
  try {
    // Forward the request to the AI controller's existing node suggestion function
    // as 'getRecommendations' was not implemented in aiController.js
    await aiController.generateNodeSuggestions(req, res);
  } catch (error) {
    console.error('[Recommender Controller] Error forwarding request:', error.message);
    res.status(500).json({ error: "Failed to process recommendation request" });
  }
};

module.exports = { getRecommendations };