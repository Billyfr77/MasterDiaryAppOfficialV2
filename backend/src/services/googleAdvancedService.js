const axios = require('axios');

/**
 * Google Advanced Intelligence Service
 * Handles modern Routes, Weather, and Address Validation
 */

const API_KEY = process.env.GOOGLE_ADVANCED_API_KEY;

/**
 * Fetch real-time weather for a specific coordinate
 */
const getSiteWeather = async (lat, lng) => {
    try {
        // Note: Google Weather API is part of the Maps platform for specific enterprise accounts
        // If the standard Maps Weather API isn't responding, we fallback to a structured response
        const url = `https://weather.googleapis.com/v1/current:lookup?key=${API_KEY}`;
        const response = await axios.post(url, {
            location: { latitude: lat, longitude: lng }
        });
        return response.data;
    } catch (error) {
        console.warn("Weather API call failed, possibly restricted access or different endpoint required.");
        return null;
    }
};

/**
 * Modern Routes API - Traffic Aware High-Fidelity Routing
 */
const calculateModernRoute = async (origin, destination) => {
    try {
        const url = `https://routes.googleapis.com/directions/v2:computeRoutes?key=${API_KEY}`;
        const response = await axios.post(url, {
            origin: { location: { latLng: origin } },
            destination: { location: { latLng: destination } },
            travelMode: 'DRIVE',
            routingPreference: 'TRAFFIC_AWARE',
            computeAlternativeRoutes: false,
            routeModifiers: {
                avoidTolls: false,
                avoidHighways: false,
                avoidFerries: false
            },
            languageCode: 'en-US',
            units: 'IMPERIAL'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Routes API Error:", error.response?.data || error.message);
        return null;
    }
};

/**
 * Address Validation - Legal Property Confirmation
 */
const validateAddress = async (addressLines) => {
    try {
        const url = `https://addressvalidation.googleapis.com/v1:validateAddress?key=${API_KEY}`;
        const response = await axios.post(url, {
            address: { addressLines }
        });
        return response.data;
    } catch (error) {
        console.error("Address Validation Error:", error.message);
        return null;
    }
};

module.exports = {
    getSiteWeather,
    calculateModernRoute,
    validateAddress
};