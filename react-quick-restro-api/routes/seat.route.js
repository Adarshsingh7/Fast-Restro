const Router = require('express').Router();
const seatController = require('../controllers/seat.controller');
Router.route('/')
  .get(seatController.getAllSeats)
  .post(seatController.createSeat);

Router.route('/:id')
  .get(seatController.getSeat)
  .patch(seatController.updateSeat)
  .delete(seatController.deleteSeat);

module.exports = Router;
