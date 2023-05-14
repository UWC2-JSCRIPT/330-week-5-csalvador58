const { Router } = require('express');
const router = Router();

const orderDAO = require('../daos/order');

router.use(async (req, res, next) => {
  console.log('MW Orders Test - jwt token check');
  if (req.user.isAuthorized) {
    next();
  } else {
    res.status(401).send('Login required');
  }
});

router.post('/', async (req, res, next) => {
  console.log('Orders Test - post /');

  const rolesAllowed = ['admin', 'user'];
  if (req.user.roles.some((role) => rolesAllowed.includes(role))) {
    console.log('req.body');
    console.log(req.body);
    console.log('req.user')
    console.log(req.user)
    try {
      const createdOrder = await orderDAO.createOrder(req.user._id, req.body);
      console.log('createdOrder')
      console.log(createdOrder)
      res.sendStatus(200);
    } catch (error) {
      if (error instanceof orderDAO.BadDataError) {
        res.status(400).send(error.message);
      } else {
        console.log('500 error.message')
        console.log(error.message)
        res.status(500).send(error.message);
      }
    }
  } else {
    res.status(403).send('Not authorized to post items');
  }
});

module.exports = router;
