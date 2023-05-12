const { Router } = require('express');
const router = Router();

const jwt = require('jsonwebtoken');

router.use((req, res, next) => {
  console.log(`${req.method} ${req.url} at ${new Date()}`);
  next();
});


router.use('/login', require('./login'));

router.use((err, req, res, next) => {
  console.log('Error detected: ', err);
});

module.exports = router;
