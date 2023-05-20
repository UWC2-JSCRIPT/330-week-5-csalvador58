const { Router } = require('express');
const router = Router();

const itemDAO = require('../daos/item');
const userDAO = require('../daos/user');
const isUserAuthorized = require('./isUserAuthorized');
const isUserAdmin = require('./isUserAdmin');

router.use(isUserAuthorized, async (req, res, next) => {
  // console.log('Middleware Items test - verify jwt token');
  if (req.user.isAuthorized) {
    next();
  } else {
    res.status(401).send('Login required');
  }
});

router.post('/', isUserAdmin, async (req, res, next) => {
  // console.log('Items Test - post /');

  // Post item if user has admin role
  try {
    const { title, price } = req.body;
    const storedItem = await itemDAO.storeItem({
      title: title,
      price: price,
    });
    res.json(storedItem);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.put('/:id', isUserAdmin, async (req, res, next) => {
  // console.log('Items Test - put /:id');

  const itemId = req.params.id;
  const newData = req.body;
  try {
    const updatedItem = await itemDAO.updateItemById(itemId, newData);
    res.json(updatedItem);
  } catch (error) {
    // console.log('500 error');
    // console.log(error);
    res.status(500).send(error.message);
  }
});

router.get('/:id', async (req, res, next) => {
  // console.log('Items Test - get /:id');

  const itemId = req.params.id;
  try {
    const item = await itemDAO.getItemById(itemId);
    res.json(item);
  } catch (error) {
    if (error instanceof itemDAO.BadDataError) {
      res.status(400).send(error.message);
    }
    res.sendStatus(500);
  }
});

router.get('/', async (req, res, next) => {
  // console.log('Items test - get /');

  try {
    const items = await itemDAO.getAllItems();
    res.json(items);
  } catch (error) {
    res.sendStatus(500);
  }
});

module.exports = router;
