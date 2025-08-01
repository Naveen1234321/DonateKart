// DonateKart Express App
require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();
const { connectDB, getStorage } = require('./config/db');
const itemsRoutes = require('./routes/items');
const requestsRoutes = require('./routes/requests');
const authRoutes = require('./routes/auth');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Session configuration
app.use(session({
    secret: 'donatekart-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Make storage available to routes
app.use((req, res, next) => {
    req.storage = getStorage();
    next();
});

app.use('/api', itemsRoutes);
app.use('/api', requestsRoutes);
app.use('/api', authRoutes);

// Placeholder route
app.get('/api/health', (req, res) => {
    res.json({ status: 'DonateKart backend is running.' });
});

// Connect to MongoDB
connectDB();

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 