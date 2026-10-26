const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema(
  {
    number: {
      type: Number,
      required: true,
      unique: true,
    },
    isOccupied: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Seat = mongoose.model('Seat', seatSchema);

module.exports = Seat;
