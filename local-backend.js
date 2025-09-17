const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection (Local Docker MongoDB)
const MONGODB_URI = 'mongodb://weather-mongodb:27017/weatherdb';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('✅ Connected to Local MongoDB successfully');
})
.catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
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

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Local Weather API is running',
        timestamp: new Date().toISOString(),
        database: 'Local MongoDB'
    });
});

// Receive sensor data from ESP32
app.post('/api/sensors/data', async (req, res) => {
    try {
        const { deviceId, location, sensorData } = req.body;
        
        console.log('📡 Received sensor data from ESP32:', req.body);
        
        const newSensorData = new SensorData({
            deviceId: deviceId || 'ESP32-Local',
            location: {
                name: location?.name || 'ESP32 Sensor (Local)',
                latitude: location?.latitude || 0,
                longitude: location?.longitude || 0
            },
            sensorData: {
                temperature: sensorData.temperature,
                humidity: sensorData.humidity,
                timestamp: new Date(),
                source: sensorData.source || 'ESP32-Local'
            }
        });
        
        await newSensorData.save();
        
        res.status(200).json({ 
            success: true, 
            message: 'Sensor data saved to Local MongoDB',
            data: newSensorData
        });
        
        console.log('✅ ESP32 sensor data saved to Local MongoDB');
        
    } catch (error) {
        console.error('❌ Error saving sensor data:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to save sensor data to Local MongoDB' 
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
                message: 'No sensor data found in Local MongoDB' 
            });
        }
        
        res.json({
            success: true,
            data: latestData,
            source: 'Local MongoDB'
        });
        
    } catch (error) {
        console.error('❌ Error fetching latest sensor data:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch sensor data from Local MongoDB' 
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
            count: sensorHistory.length,
            source: 'Local MongoDB'
        });
        
    } catch (error) {
        console.error('❌ Error fetching sensor history:', error);
        res.json({
            success: false,
            data: [],
            count: 0,
            error: 'Failed to fetch sensor history from Local MongoDB'
        });
    }
});

// Get sensor statistics
app.get('/api/sensors/stats', async (req, res) => {
    try {
        const stats = await SensorData.aggregate([
            {
                $group: {
                    _id: null,
                    totalRecords: { $sum: 1 },
                    avgTemperature: { $avg: '$sensorData.temperature' },
                    maxTemperature: { $max: '$sensorData.temperature' },
                    minTemperature: { $min: '$sensorData.temperature' },
                    avgHumidity: { $avg: '$sensorData.humidity' },
                    maxHumidity: { $max: '$sensorData.humidity' },
                    minHumidity: { $min: '$sensorData.humidity' },
                    uniqueDevices: { $addToSet: '$deviceId' }
                }
            }
        ]);
        
        const result = stats[0] || {
            totalRecords: 0,
            avgTemperature: 0,
            maxTemperature: 0,
            minTemperature: 0,
            avgHumidity: 0,
            maxHumidity: 0,
            minHumidity: 0,
            uniqueDevices: []
        };
        
        result.uniqueDeviceCount = result.uniqueDevices?.length || 0;
        result.source = 'Local MongoDB';
        
        res.json(result);
    } catch (error) {
        console.error('❌ Error fetching statistics:', error);
        res.json({
            totalRecords: 0,
            avgTemperature: 0,
            maxTemperature: 0,
            minTemperature: 0,
            avgHumidity: 0,
            maxHumidity: 0,
            minHumidity: 0,
            uniqueDeviceCount: 0,
            source: 'Local MongoDB',
            error: 'Failed to fetch statistics'
        });
    }
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
    try {
        const stats = await SensorData.aggregate([
            {
                $group: {
                    _id: null,
                    totalRecords: { $sum: 1 },
                    avgTemperature: { $avg: '$sensorData.temperature' },
                    maxTemperature: { $max: '$sensorData.temperature' },
                    minTemperature: { $min: '$sensorData.temperature' },
                    avgHumidity: { $avg: '$sensorData.humidity' },
                    maxHumidity: { $max: '$sensorData.humidity' },
                    minHumidity: { $min: '$sensorData.humidity' }
                }
            }
        ]);

        // Get latest sensor reading
        const latestData = await SensorData.findOne()
            .sort({ createdAt: -1 });

        const result = stats[0] || {
            totalRecords: 0,
            avgTemperature: 0,
            maxTemperature: 0,
            minTemperature: 0,
            avgHumidity: 0,
            maxHumidity: 0,
            minHumidity: 0
        };

        // Generate Prometheus metrics format
        const metrics = `# HELP esp32_sensor_records_total Total number of sensor records in database
# TYPE esp32_sensor_records_total counter
esp32_sensor_records_total ${result.totalRecords}

# HELP esp32_temperature_celsius Current temperature reading from ESP32
# TYPE esp32_temperature_celsius gauge
esp32_temperature_celsius ${latestData?.sensorData?.temperature || 0}

# HELP esp32_humidity_percent Current humidity reading from ESP32
# TYPE esp32_humidity_percent gauge
esp32_humidity_percent ${latestData?.sensorData?.humidity || 0}

# HELP esp32_temperature_avg_celsius Average temperature from all readings
# TYPE esp32_temperature_avg_celsius gauge
esp32_temperature_avg_celsius ${result.avgTemperature || 0}

# HELP esp32_temperature_max_celsius Maximum temperature recorded
# TYPE esp32_temperature_max_celsius gauge
esp32_temperature_max_celsius ${result.maxTemperature || 0}

# HELP esp32_temperature_min_celsius Minimum temperature recorded
# TYPE esp32_temperature_min_celsius gauge
esp32_temperature_min_celsius ${result.minTemperature || 0}

# HELP esp32_humidity_avg_percent Average humidity from all readings
# TYPE esp32_humidity_avg_percent gauge
esp32_humidity_avg_percent ${result.avgHumidity || 0}

# HELP esp32_humidity_max_percent Maximum humidity recorded
# TYPE esp32_humidity_max_percent gauge
esp32_humidity_max_percent ${result.maxHumidity || 0}

# HELP esp32_humidity_min_percent Minimum humidity recorded
# TYPE esp32_humidity_min_percent gauge
esp32_humidity_min_percent ${result.minHumidity || 0}

# HELP esp32_last_update_timestamp Unix timestamp of last sensor reading
# TYPE esp32_last_update_timestamp gauge
esp32_last_update_timestamp ${latestData ? new Date(latestData.createdAt).getTime() / 1000 : 0}
`;

        res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
        res.send(metrics);
        
    } catch (error) {
        console.error('❌ Error generating metrics:', error);
        res.status(500).send('# Error generating metrics');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Local Weather API server is running on port ${PORT}`);
    console.log(`📡 Ready to receive ESP32 sensor data at /api/sensors/data`);
    console.log(`🏥 Health check available at /health`);
    console.log(`📊 Prometheus metrics available at /metrics`);
    console.log(`💾 Using Local MongoDB for data storage`);
});

module.exports = app;