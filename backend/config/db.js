// backend/config/db.js
const mongoose = require('mongoose');

let isMongoConnected = false;
let inMemoryStorage = null;

const connectDB = async () => {
    try {
        // For testing, let's use in-memory storage
        console.log('Using in-memory storage for testing...');
        console.log('Note: Data will be lost when server restarts');
        
        // Initialize in-memory storage
        const InMemoryStorage = require('./inMemoryStorage');
        inMemoryStorage = new InMemoryStorage();
        isMongoConnected = false;
        
        // Uncomment the following lines to use MongoDB Atlas
        /*
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/donatekart');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        isMongoConnected = true;
        */
    } catch (error) {
        console.error('MongoDB connection error:', error);
        console.error('Falling back to in-memory storage for testing...');
        console.error('Note: Data will be lost when server restarts');
        console.error('To use MongoDB:');
        console.error('- Install MongoDB locally: https://docs.mongodb.com/manual/installation/');
        console.error('- Or use MongoDB Atlas: https://www.mongodb.com/cloud/atlas');
        
        // Initialize in-memory storage
        const InMemoryStorage = require('./inMemoryStorage');
        inMemoryStorage = new InMemoryStorage();
        isMongoConnected = false;
    }
};

const getStorage = () => {
    return { isMongoConnected, inMemoryStorage };
};

module.exports = { connectDB, getStorage }; 