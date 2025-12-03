const getMapEmbed = async (req, res) => {
  try {
    const { q, zoom = 15 } = req.query;
    const apiKey = process.env.GOOGLE_API_KEY;
    const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(q)}&zoom=${zoom}`;
    res.json({ embedUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getMapEmbed };