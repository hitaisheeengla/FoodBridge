const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const auth = require('../middleware/auth');

// Get all donations
router.get('/', async (req, res) => {
  try {
    const donations = await Donation.find({ status: 'available' })
      .populate('donor', 'name email')
      .sort({ createdAt: -1 });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a donation

router.post('/', auth, async (req, res) => {
  try {
    const {
      foodType,
      foodItems,
      quantity,
      quantityUnit,
      pickupDate,
      pickupStartTime,
      pickupEndTime,
      location,
      estimatedMeals,
      allergenInfo,
      dietaryInfo,
      additionalInfo
    } = req.body;

    if (
      !foodType ||
      !foodItems ||
      quantity == null ||
      !pickupDate ||
      !pickupStartTime ||
      !pickupEndTime ||
      !location
    ) {
      return res.status(400).json({
        message: 'Please fill in all required donation and pickup fields'
      });
    }

    if (!Number.isFinite(Number(quantity)) || Number(quantity) <= 0) {
      return res.status(400).json({
        message: 'Quantity must be greater than 0'
      });
    }

    const date = new Date(pickupDate);

    if (Number.isNaN(date.getTime())) {
      return res.status(400).json({
        message: 'Invalid pickup date'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) {
      return res.status(400).json({
        message: 'Pickup date cannot be in the past'
      });
    }

    if (pickupEndTime <= pickupStartTime) {
      return res.status(400).json({
        message: 'Pickup end time must be after pickup start time'
      });
    }

    const donation = new Donation({
      donor: req.user.userId,
      foodType,
      foodItems,
      quantity: Number(quantity),
      quantityUnit,
      pickupDate: date,
      pickupStartTime,
      pickupEndTime,
      location,
      estimatedMeals,
      allergenInfo,
      dietaryInfo,
      additionalInfo
    });

    const savedDonation = await donation.save();

    return res.status(201).json(savedDonation);
  } catch (err) {
    console.error('Create donation error:', err);

    return res.status(400).json({
      message: err.message
    });
  }
});


// Update donation status
router.patch('/:id', auth, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.donor.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (req.body.status) {
      donation.status = req.body.status;
    }
    if (req.body.description) {
      donation.description = req.body.description;
    }

    const updatedDonation = await donation.save();
    res.json(updatedDonation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a donation
router.delete('/:id', auth, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.donor.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Donation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Donation deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 