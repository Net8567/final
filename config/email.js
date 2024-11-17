// File: /config/email.js

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.yandex.com',
    port: 465, // For secure SSL
    secure: true, // Use SSL
    auth: {
        user: 'NetOnWork@yandex.com', // Replace with your Yandex email
        pass: 'tzkmittxekxpsinm', // Replace with your Yandex password or App Password
    },
});

module.exports = transporter;