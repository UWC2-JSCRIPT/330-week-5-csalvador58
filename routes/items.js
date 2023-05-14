const { Router } = require('express');
const router = Router();

const itemDAO = require('../daos/item');

router.use(async (req, res, next) => {
  console.log('Middleware Items test - verify jwt token');
  if (req.user.isAuthorized) {
    next();
  } else {
    res.status(401).send('Login required');
  }
});

router.post('/', async (req, res, next) => {
  console.log('Items Test - post /');

  // Post item if user has admin role
  // console.log('req.user.roles');
  // console.log(req.user.roles);
  const rolesAllowed = ['admin'];
  if (req.user.roles.some((role) => rolesAllowed.includes(role))) {
    try {
      // console.log('req.body');
      // console.log(req.body);
      const { title, price } = req.body;
      const storedItem = await itemDAO.storeItem({
        title: title,
        price: price,
      });
      res.json(storedItem);
    } catch (error) {
      res.status(500).send(error.message);
    }
  } else {
    res.status(403).send('Not authorized to post items');
  }
});

router.put('/:id', async (req, res, next) => {
  console.log('Items Test - put /:id');

  const rolesAllowed = ['admin'];
  if (req.user.roles.some((role) => rolesAllowed.includes(role))) {
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
  } else {
    res.status(403).send('Not authorized to update items');
  }
});

router.get('/:id', async (req, res, next) => {
  console.log('Items Test - get /:id');

  const rolesAllowed = ['admin', 'user'];
  if (req.user.roles.some((role) => rolesAllowed.includes(role))) {
    const itemId = req.params.id;
    try {
      const item = await itemDAO.getItemById(itemId);
      res.json(item);
    } catch (error) {
      if (error instanceof itemDAO.BadDataError) {
        res.status(400).send(error.message);
      }
      //   console.log('error');
      //   console.log(error);
      res.sendStatus(500);
    }
  } else {
    res.status(403).send('Not authorized to update items');
  }
});

router.get('/', async (req, res, next) => {
  console.log('Items test - get /');

  const rolesAllowed = ['admin', 'user'];
  if (req.user.roles.some((role) => rolesAllowed.includes(role))) {
    try {
      const items = await itemDAO.getAllItems();
      // console.log('items')
      // console.log(items)
      res.json(items);
    } catch (error) {
      res.sendStatus(500);
    }
  } else {
    res.status(403).send('Not authorized to update items');
  }
});

module.exports = router;
