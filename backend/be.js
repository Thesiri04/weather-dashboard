const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection (Docker container)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/weatherdb';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Connected to MongoDB successfully');
})
.catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
});

// Weather data schema
const weatherSchema = new mongoose.Schema({
    location: {
        name: String,
        latitude: Number,
        longitude: Number,
    },
    current: {
        temperature: Number,
        humidity: Number,
        windSpeed: Number,
        windDirection: Number,
        weatherCode: Number,
        description: String,
        timestamp: { type: Date, default: Date.now }
    },
    forecast: [{
        date: String,
        maxTemp: Number,
        minTemp: Number,
        weatherCode: Number,
        description: String,
        precipitation: Number
    }],
    createdAt: { type: Date, default: Date.now }
});

const Weather = mongoose.model('Weather', weatherSchema);

// Weather codes mapping
const weatherCodes = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
};

// Helper function to get weather description
function getWeatherDescription(code) {
    return weatherCodes[code] || 'Unknown';
}

// Routes
// Get current weather for a location
app.get('/api/weather/current/:lat/:lon', async (req, res) => {
    try {
        const { lat, lon } = req.params;
        const { name } = req.query;
        
        // Fetch from Open-Meteo API
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=7`
        );
        
        const data = await response.json();
        
        const weatherData = {
            location: {
                name: name || `${lat}, ${lon}`,
                latitude: parseFloat(lat),
                longitude: parseFloat(lon)
            },
            current: {
                temperature: data.current.temperature_2m,
                humidity: data.current.relative_humidity_2m,
                windSpeed: data.current.wind_speed_10m,
                windDirection: data.current.wind_direction_10m,
                weatherCode: data.current.weather_code,
                description: getWeatherDescription(data.current.weather_code),
                timestamp: new Date()
            },
            forecast: data.daily.time.map((date, index) => ({
                date: date,
                maxTemp: data.daily.temperature_2m_max[index],
                minTemp: data.daily.temperature_2m_min[index],
                weatherCode: data.daily.weather_code[index],
                description: getWeatherDescription(data.daily.weather_code[index]),
                precipitation: data.daily.precipitation_sum[index]
            }))
        };
        
        // Save to MongoDB
        const weather = new Weather(weatherData);
        await weather.save();
        
        res.json(weatherData);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

// Get historical weather data
app.get('/api/weather/history', async (req, res) => {
    try {
        const { location, limit = 10 } = req.query;
        
        let query = {};
        if (location) {
            query['location.name'] = { $regex: location, $options: 'i' };
        }
        
        const historicalData = await Weather.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));
            
        res.json(historicalData);
    } catch (error) {
        console.error('Error fetching historical data:', error);
        res.status(500).json({ error: 'Failed to fetch historical data' });
    }
});

// Search for locations (using a simple geocoding service)
app.get('/api/locations/search/:query', async (req, res) => {
    try {
        const { query } = req.params;
        
        // Using Open-Meteo's geocoding API
        const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
        );
        
        const data = await response.json();
        
        if (data.results) {
            const locations = data.results.map(result => ({
                name: result.name,
                country: result.country,
                latitude: result.latitude,
                longitude: result.longitude,
                displayName: `${result.name}, ${result.country || result.admin1 || ''}`
            }));
            res.json(locations);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('Error searching locations:', error);
        res.status(500).json({ error: 'Failed to search locations' });
    }
});

// Get weather statistics
app.get('/api/weather/stats', async (req, res) => {
    try {
        const stats = await Weather.aggregate([
            {
                $group: {
                    _id: null,
                    totalRecords: { $sum: 1 },
                    avgTemperature: { $avg: '$current.temperature' },
                    maxTemperature: { $max: '$current.temperature' },
                    minTemperature: { $min: '$current.temperature' },
                    uniqueLocations: { $addToSet: '$location.name' }
                }
            }
        ]);
        
        const result = stats[0] || {
            totalRecords: 0,
            avgTemperature: 0,
            maxTemperature: 0,
            minTemperature: 0,
            uniqueLocations: []
        };
        
        result.uniqueLocationCount = result.uniqueLocations.length;
        
        res.json(result);
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// ESP32 Sensor data schema
const sensorSchema = new mongoose.Schema({
    deviceId: String,
    location: {
        name: String,
        latitude: Number,
        longitude: Number,
    },
    sensorData: {
        temperature: Number,
        humidity: Number,
        timestamp: { type: Date, default: Date.now },
        source: { type: String, default: 'ESP32' }
    },
    createdAt: { type: Date, default: Date.now }
});

const SensorData = mongoose.model('SensorData', sensorSchema);

// Receive sensor data from ESP32
app.post('/api/sensors/data', async (req, res) => {
    try {
        const { deviceId, location, sensorData } = req.body;
        
        console.log('Received sensor data from ESP32:', req.body);
        
        const newSensorData = new SensorData({
            deviceId: deviceId || 'Unknown-ESP32',
            location: {
                name: location?.name || 'ESP32 Sensor',
                latitude: location?.latitude || 0,
                longitude: location?.longitude || 0
            },
            sensorData: {
                temperature: sensorData.temperature,
                humidity: sensorData.humidity,
                timestamp: new Date(sensorData.timestamp) || new Date(),
                source: sensorData.source || 'ESP32'
            }
        });
        
        await newSensorData.save();
        
        res.status(200).json({ 
            success: true, 
            message: 'Sensor data saved successfully',
            data: newSensorData
        });
        
        console.log('✅ ESP32 sensor data saved to MongoDB');
        
    } catch (error) {
        console.error('Error saving sensor data:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to save sensor data' 
        });
    }
});

// Get latest sensor data
app.get('/api/sensors/latest', async (req, res) => {
    try {
        const { deviceId } = req.query;
        
        let query = {};
        if (deviceId) {
            query.deviceId = deviceId;
        }
        
        const latestData = await SensorData.findOne(query)
            .sort({ createdAt: -1 });
            
        if (!latestData) {
            return res.status(404).json({ 
                success: false, 
                message: 'No sensor data found' 
            });
        }
        
        res.json({
            success: true,
            data: latestData
        });
        
    } catch (error) {
        console.error('Error fetching latest sensor data:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch sensor data' 
        });
    }
});

// Get sensor data history
app.get('/api/sensors/history', async (req, res) => {
    try {
        const { deviceId, limit = 20 } = req.query;
        
        let query = {};
        if (deviceId) {
            query.deviceId = deviceId;
        }
        
        const sensorHistory = await SensorData.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));
            
        res.json({
            success: true,
            data: sensorHistory,
            count: sensorHistory.length
        });
        
    } catch (error) {
        console.error('Error fetching sensor history:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch sensor history' 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Ready to receive ESP32 sensor data at /api/sensors/data`);
});

module.exports = app;