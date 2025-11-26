const aiController = require('./aiController'); // Import the AI controller

const getRecommendations = async (req, res) => {
  try {
    // Forward the request to the AI controller's getRecommendations function
    // The AI controller will handle the actual Gemini API call, including error handling and response sending.
    await aiController.getRecommendations(req, res);
  } catch (error) {
    // This catch block is primarily for errors in the forwarding mechanism itself,
    // as aiController.getRecommendations should handle its own internal errors.
    console.error('[Recommender Controller] Error forwarding request:', error.message);
    res.status(500).json({ error: "Failed to process recommendation request" });
  }
};

module.exports = { getRecommendations };