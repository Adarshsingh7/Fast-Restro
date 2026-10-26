const Router = require('express').Router();
const transactionController = require('../controllers/transaction.controller');
Router.route('/')
  .get(transactionController.getAllTransactions)
  .post(transactionController.createTransaction);

Router.route('/:id')
  .get(transactionController.getTransaction)
  .patch(transactionController.updateTransaction)
  .delete(transactionController.deleteTransaction);

module.exports = Router;
