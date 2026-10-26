const Transaction = require('../models/transaction.model');
const handlerFactory = require('./handlerFactory');

exports.createTransaction = handlerFactory.createOne(Transaction);
exports.getTransaction = handlerFactory.getOne(Transaction);
exports.getAllTransactions = handlerFactory.getAll(Transaction);
exports.updateTransaction = handlerFactory.updateOne(Transaction);
exports.deleteTransaction = handlerFactory.deleteOne(Transaction);
