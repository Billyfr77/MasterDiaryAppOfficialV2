const getWeather = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: "Latitude and Longitude are required" });
    }

    // Using Open-Meteo API (Free, No Key, High Reliability for Lat/Lon)
    // Asking for current weather: temp, wind speed, weather code
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`;
    
    console.log(`[Weather] Fetching from: ${url}`);
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Weather API Error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Transform to our standard format
    const weather = {
        temp: data.current_weather.temperature,
        conditionCode: data.current_weather.weathercode,
        windSpeed: data.current_weather.windspeed,
        unit: 'Celsius' // Open-Meteo defaults to Celsius
    };
    
    res.json(weather);

  } catch (error) {
    console.error('[Weather] Error:', error.message);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
};

module.exports = { getWeather };