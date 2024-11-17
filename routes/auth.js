// File: routes/auth.js

const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');  // Import the User model
const nodemailer = require('nodemailer');
const router = express.Router();
const path = require('path');
const transporter = require('../config/email');

// Registration Route
router.post('/register', async (req, res) => {
    const { username, password, email, firstName, lastName } = req.body;

    if (!username || !password || !email || !firstName || !lastName) {
        return res.status(400).send('All fields are required.');
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send('Email is already in use.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const confirmationCode = Math.random().toString(36).substring(2, 8).toUpperCase(); // 6-character code

        const newUser = new User({
            username,
            password: hashedPassword,
            email,
            firstName,
            lastName,
            confirmationCode,
        });

        await newUser.save();

        // Send confirmation email
        const mailOptions = {
            from: '"Wagenrad" <NetOnWork@yandex.kz>',
            to: email,
            subject: 'Wagenrad - Confirm Your Email',
            text: `Welcome to Wagenrad, ${firstName}!\n\nYour confirmation code is: ${confirmationCode}\n\nPlease enter this code to confirm your account.`,
        };

        await transporter.sendMail(mailOptions);
        res.status(201).send('Registration successful. Please check your email for the confirmation code.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error.');
    }
});

router.post('/confirm-email', async (req, res) => {
    const { email, confirmationCode } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || user.confirmationCode !== confirmationCode) {
            return res.status(400).send('Invalid confirmation code.');
        }

        user.isConfirmed = true;
        user.confirmationCode = null; // Clear the code after confirmation
        await user.save();

        res.status(200).send('Email confirmed successfully.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error.');
    }
});

// Render Sign Up page (GET request)
router.get('/signup', (req, res) => {
    res.render(__dirname + '/../views/signup.ejs');
});

// Sign In page route (GET request)
router.get('/signin', (req, res) => {
    res.render(__dirname + '/../views/signin.ejs');
});

// Handle Sign In (POST request)
router.post('/signin', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).send('Invalid credentials.');
        }

        if (!user.isConfirmed) {
            return res.status(403).send('Please confirm your email before signing in.');
        }

        // Send login notification
        const mailOptions = {
            from: '"Wagenrad" <NetOnWork@yandex.kz>',
            to: user.email,
            subject: 'Wagenrad - Login Notification',
            text: `Hello ${user.firstName},\n\nA new login to your Wagenrad account was detected. If this wasn't you, please contact support immediately.`,
        };

        await transporter.sendMail(mailOptions);

        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error.');
    }
});


module.exports = router;