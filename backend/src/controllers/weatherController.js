const axios = require('axios');

exports.getWeather = async (req, res) => {
    try {
        const { lat, lng } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ error: 'Latitude and Longitude are required' });
        }

        // Use Open-Meteo API (Free, No Key, High Quality)
        // Fetching current weather + daily forecast
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,snowfall,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto`;

        const response = await axios.get(url);
        const data = response.data;

        // Map WMO codes to human readable descriptions
        const getWeatherDesc = (code) => {
            const codes = {
                0: 'Clear sky',
                1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
                45: 'Fog', 48: 'Depositing rime fog',
                51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
                61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
                71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
                77: 'Snow grains',
                80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
                95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail'
            };
            return codes[code] || 'Unknown';
        };

        const result = {
            location: { lat, lng },
            current: {
                temp: data.current.temperature_2m,
                humidity: data.current.relative_humidity_2m,
                feelsLike: data.current.apparent_temperature,
                windSpeed: data.current.wind_speed_10m,
                description: getWeatherDesc(data.current.weather_code),
                precipitation: data.current.precipitation
            },
            daily: {
                maxTemp: data.daily.temperature_2m_max[0],
                minTemp: data.daily.temperature_2m_min[0],
                sunrise: data.daily.sunrise[0],
                sunset: data.daily.sunset[0],
                uvIndex: data.daily.uv_index_max[0],
                description: getWeatherDesc(data.daily.weather_code[0])
            }
        };

        res.json(result);

    } catch (error) {
        console.error('Weather API Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
};
