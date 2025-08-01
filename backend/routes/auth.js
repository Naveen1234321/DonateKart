const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');

// POST /api/auth/register - Register new user
router.post('/auth/register', async (req, res) => {
    try {
        const { name, email, password, phone, location } = req.body;
        
        // Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required.' });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
        }
        
        const { isMongoConnected, inMemoryStorage } = req.storage;
        
        if (isMongoConnected) {
            // Check if user already exists
            const existingUser = await User.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                return res.status(400).json({ error: 'User with this email already exists.' });
            }
            
            // Create new user
            const user = new User({
                name,
                email: email.toLowerCase(),
                password,
                phone,
                location
            });
            
            await user.save();
            
            // Return user data (without password)
            const userResponse = {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                location: user.location,
                createdAt: user.createdAt
            };
            
            // Store user in session
            req.session.user = userResponse;
            
            res.status(201).json({ 
                message: 'User registered successfully', 
                user: userResponse 
            });
        } else {
            // Use in-memory storage
            const existingUser = await inMemoryStorage.findUserByEmail(email);
            if (existingUser) {
                return res.status(400).json({ error: 'User with this email already exists.' });
            }
            
            const user = await inMemoryStorage.createUser({
                name,
                email: email.toLowerCase(),
                password,
                phone,
                location
            });
            
            // Return user data (without password)
            const userResponse = {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                location: user.location,
                createdAt: user.createdAt
            };
            
            // Store user in session
            req.session.user = userResponse;
            
            res.status(201).json({ 
                message: 'User registered successfully', 
                user: userResponse 
            });
        }
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to register user', details: error.message });
    }
});

// POST /api/auth/login - Login user
router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Basic validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }
        
        const { isMongoConnected, inMemoryStorage } = req.storage;
        
        if (isMongoConnected) {
            // Find user by email
            const user = await User.findOne({ email: email.toLowerCase() });
            if (!user) {
                return res.status(401).json({ error: 'Invalid email or password.' });
            }
            
            // Check password
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Invalid email or password.' });
            }
            
            // Return user data (without password)
            const userResponse = {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                location: user.location,
                createdAt: user.createdAt
            };
            
            // Store user in session
            req.session.user = userResponse;
            
            res.json({ 
                message: 'Login successful', 
                user: userResponse 
            });
        } else {
            // Use in-memory storage
            const user = await inMemoryStorage.findUserByEmail(email);
            if (!user) {
                return res.status(401).json({ error: 'Invalid email or password.' });
            }
            
            // Check password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Invalid email or password.' });
            }
            
            // Return user data (without password)
            const userResponse = {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                location: user.location,
                createdAt: user.createdAt
            };
            
            // Store user in session
            req.session.user = userResponse;
            
            res.json({ 
                message: 'Login successful', 
                user: userResponse 
            });
        }
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login', details: error.message });
    }
});

// GET /api/auth/profile - Get current user profile
router.get('/auth/profile', (req, res) => {
    if (req.session.user) {
        res.json({ user: req.session.user });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

// POST /api/auth/logout - Logout user
router.post('/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to logout' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});

module.exports = router; 