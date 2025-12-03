const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function testMaps() {
  console.log("--- Testing Google Maps Geocoding API ---");
  const apiKey = process.env.GOOGLE_API_KEY;
  
  if (!apiKey) {
    console.error("Error: GOOGLE_API_KEY is missing in .env");
    return;
  }

  console.log(`Using API Key: ${apiKey.substring(0, 10)}...`);

  const address = "1600 Amphitheatre Parkway, Mountain View, CA";
  const url = `https://maps.googleapis.com/maps/api/geocode/json`;

  try {
    console.log(`Geocoding address: "${address}"...`);
    const response = await axios.get(url, {
      params: {
        address: address,
        key: apiKey
      }
    });

    if (response.data.status === 'OK') {
      const location = response.data.results[0].geometry.location;
      console.log("Success! Geocoding works.");
      console.log(`Coordinates: Lat ${location.lat}, Lng ${location.lng}`);
    } else {
      console.error("Geocoding Failed. Status:", response.data.status);
      if (response.data.error_message) {
        console.error("Error Message:", response.data.error_message);
      }
    }

  } catch (error) {
    console.error("Network/Request Error:", error.message);
  }
}

testMaps();
