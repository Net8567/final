// File: routes/cars.js
const express = require('express');
const router = express.Router();
const Car = require('../models/Car');
const { isAdmin, isUser } = require('../middleware/roles');

// Create a Car Listing (Users and Admins)
router.post('/', isUser, async (req, res) => {
    try {
        const car = new Car({
            photo: req.body.photo,
            price: req.body.price,
            mileage: req.body.mileage,
            createdBy: req.user._id,
        });
        await car.save();
        res.status(201).json(car);
    } catch (err) {
        res.status(500).json({ message: 'Error creating car listing', error: err });
    }
});

// Read All Car Listings (Public Access)
router.get('/', async (req, res) => {
    try {
        const cars = await Car.find();
        res.status(200).json(cars);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching car listings', error: err });
    }
});

// Update a Car Listing (Admins Only)
router.put('/:id', isAdmin, async (req, res) => {
    try {
        const car = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!car) return res.status(404).json({ message: 'Car not found' });
        res.status(200).json(car);
    } catch (err) {
        res.status(500).json({ message: 'Error updating car listing', error: err });
    }
});

// Delete a Car Listing (Admins Only)
router.delete('/:id', isAdmin, async (req, res) => {
    try {
        const car = await Car.findByIdAndDelete(req.params.id);
        if (!car) return res.status(404).json({ message: 'Car not found' });
        res.status(200).json({ message: 'Car deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting car listing', error: err });
    }
});


module.exports = router;