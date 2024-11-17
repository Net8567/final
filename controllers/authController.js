// File: controllers/authController.js

const nodemailer = require('nodemailer');

exports.signIn = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).send('Invalid credentials.');
        }

        // Generate a 2FA code
        const twoFACode = Math.floor(100000 + Math.random() * 900000); // Random 6-digit code
        req.session.twoFACode = twoFACode; // Store in session
        req.session.tempUser = user; // Store user temporarily until 2FA is verified

        // Send 2FA code via email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Your 2FA Code',
            text: `Your 2FA code is: ${twoFACode}`,
        });

        res.redirect('/auth/verify-2fa'); // Redirect to verification page
    } catch (err) {
        console.error(err);
        res.status(500).send('Error signing in.');
    }
};