const { Router } = require('express');
const router = Router();

const orderDAO = require('../daos/order');
const userDAO = require('../daos/user');
const order = require('../models/order');
const isUserAuthorized = require('./isUserAuthorized');

router.use(isUserAuthorized, async (req, res, next) => {
  // console.log('MW Orders Test - jwt token check');
  if (req.user.isAuthorized) {
    next();
  } else {
    res.status(401).send('Login required');
  }
});

router.post('/', async (req, res, next) => {
  // console.log('Orders Test - post /');

  const rolesAllowed = ['admin', 'user'];
  if (req.user.roles.some((role) => rolesAllowed.includes(role))) {
    try {
      const createdOrder = await orderDAO.createOrder(req.user._id, req.body);
      res.json(createdOrder);
    } catch (error) {
      if (error instanceof orderDAO.BadDataError) {
        res.status(400).send(error.message);
      } else {
        res.status(500).send(error.message);
      }
    }
  } else {
    res.status(403).send('Not authorized to post items');
  }
});

router.get('/:id', async (req, res, next) => {
  // console.log('Orders Test - get /:id');

  const orderId = req.params.id;
  const userId = req.user._id; 
  try {
    const order = await orderDAO.getOrderById(userId, orderId);
    res.json(order);
  } catch (error) {
    if (error instanceof orderDAO.BadDataError) {
      res.status(404).send(error.message);
    } else {
      res.status(500).send(error.message);
    }
  }
});

router.get('/', async (req, res, next) => {
  // console.log('Orders Test - get /')
  const userId = req.user._id;  
  try {
    const orders = await orderDAO.getOrders(userId);
    res.json(orders);
  } catch (error) {
    if (error instanceof orderDAO.BadDataError) {
      res.status(404).send(error.message);
    } else {
      console.log(error);
      res.status(500).send(error.message);
    }
  }
});

module.exports = router;
