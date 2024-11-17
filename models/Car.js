// models/Car.js
const mongoose = require("mongoose");

const CarSchema = new mongoose.Schema({
    photo: { type: String, required: true },
    mileage: { type: Number, required: true },
    price: { type: Number, required: true },
});

// Use `mongoose.models` to prevent overwriting the model
module.exports = mongoose.models.Car || mongoose.model("Car", CarSchema);