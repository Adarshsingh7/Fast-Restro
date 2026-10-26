const { notify } = require('../controllers/pusher.controller');

const Router = require('express').Router();

Router.post('/', notify);

module.exports = Router;
