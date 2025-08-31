const mongoose = require('mongoose');

// Replace with your actual connection string (with real password)
const MONGODB_URI = 'mongodb+srv://root:YOUR_PASSWORD_HERE@weatherdashboard.9zcbkud.mongodb.net/?retryWrites=true&w=majority&appName=weatherdashboard';

async function testConnection() {
    try {
        console.log('🔄 Connecting to MongoDB Atlas...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas successfully!');
        
        // Test creating a simple document
        const testSchema = new mongoose.Schema({
            message: String,
            timestamp: { type: Date, default: Date.now }
        });
        const TestModel = mongoose.model('Test', testSchema);
        
        const testDoc = new TestModel({ message: 'Connection test successful!' });
        await testDoc.save();
        console.log('✅ Test document saved successfully!');
        
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB Atlas');
        
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
    }
}

testConnection();
