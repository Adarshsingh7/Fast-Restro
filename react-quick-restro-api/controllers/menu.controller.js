const Menu = require('../models/menu.model');
const handlerFactory = require('./handlerFactory');

exports.createMenu = handlerFactory.createOne(Menu);
exports.getMenu = handlerFactory.getOne(Menu);
exports.getAllMenus = handlerFactory.getAll(Menu);
exports.updateMenu = handlerFactory.updateOne(Menu);
exports.deleteMenu = handlerFactory.deleteOne(Menu);
