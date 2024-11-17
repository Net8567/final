// File: server.js

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const axios = require('axios');

// Import custom routes and middleware
const authRoutes = require('./routes/auth'); // Authentication routes
const postRoutes = require('./routes/posts'); // Post routes
const authenticate = require('./middleware/authenticate'); // Authentication middleware

const app = express();

// MongoDB connection
mongoose.connect('mongodb+srv://usertest:test123@cluster0.rhbh6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Middleware for JSON and URL-encoded form parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Currency exchange route
app.get('/api/exchange-rates', async (req, res) => {
    const baseCurrency = req.query.base || 'USD';
    try {
        const response = await axios.get(`https://v6.exchangerate-api.com/v6/cb15b3225474aa4cc20fef2c/latest/${baseCurrency}`);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        res.status(500).json({ error: 'Failed to fetch exchange rates' });
    }
});

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Use custom routes
app.use('/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Default sign-in page
app.get('/', (req, res) => res.render('signin'));

// Main dashboard
app.get('/dashboard', (req, res) => res.render('index'));

// Car model
const Car = require('./models/Car');

// Car routes
// Fetch all cars

const carRoutes = require('./routes/cars'); // Import the car routes

// Global error-handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).render('error', {
        message: err.message || 'Something went wrong.',
        status: err.status || 500,
    });
});

// Start the server
app.listen(3000, () => console.log('Server is running on http://localhost:3000'));