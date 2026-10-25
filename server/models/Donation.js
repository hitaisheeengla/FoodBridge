
const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  foodType: {
    type: String,
    required: true
  },
  foodItems: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  quantityUnit: {
    type: String,
    default: 'kg'
  },
  pickupDate: {
    type: Date,
    required: true
  },
  pickupStartTime: {
    type: String,
    required: true
  },
  pickupEndTime: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  estimatedMeals: {
    type: Number
  },
  allergenInfo: {
    type: String,
    default: ''
  },
  dietaryInfo: {
    type: String,
    default: ''
  },
  additionalInfo: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'collected'],
    default: 'available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Donation', donationSchema);
