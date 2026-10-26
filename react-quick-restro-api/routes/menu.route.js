const Router = require('express').Router();
const imageController = require('../controllers/image.controller');
const menuController = require('../controllers/menu.controller');

const check = (req, res, next) => {
  console.log(req.body);
  next();
};

Router.route('/')
  .get(menuController.getAllMenus)
  .post(
    check,
    imageController.createUpload,
    imageController.cloudMid,
    menuController.createMenu,
  );

Router.route('/:id')
  .get(menuController.getMenu)
  .patch(
    imageController.createUpload,
    imageController.cloudMid,
    menuController.updateMenu,
  )
  .delete(menuController.deleteMenu);

module.exports = Router;
