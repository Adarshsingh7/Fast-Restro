const Seat = require('../models/seat.model');
const handlerFactory = require('./handlerFactory');

exports.createSeat = handlerFactory.createOne(Seat);
exports.getSeat = handlerFactory.getOne(Seat);
exports.getAllSeats = handlerFactory.getAll(Seat);
exports.updateSeat = handlerFactory.updateOne(Seat);
exports.deleteSeat = handlerFactory.deleteOne(Seat);
