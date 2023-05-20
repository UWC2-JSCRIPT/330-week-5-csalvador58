const { Router } = require('express');
const router = Router();

const jwt = require('jsonwebtoken');
const userDAO = require('../daos/user');

// router.use((req, res, next) => {
//   console.log(`
//   ${req.method} ${req.url} 
//   Headers: ${req.headers.authorization}
//   Body: ${JSON.stringify(req.body)}
//   at ${new Date()}`);
//   next();
// });

router.use('/login', require('./login'));
router.use('/items', require('./items'));
router.use('/orders', require('./orders'));

router.use((err, req, res, next) => {
  console.log('Error detected: ', err);
});

module.exports = router;
