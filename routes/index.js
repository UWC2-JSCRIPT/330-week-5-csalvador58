const { Router } = require('express');
const router = Router();

const jwt = require('jsonwebtoken');
const userDAO = require('../daos/user');

router.use((req, res, next) => {
  console.log(`
  ${req.method} ${req.url} 
  Headers: ${req.headers.authorization}
  Body: ${JSON.stringify(req.body)}
  at ${new Date()}`);
  next();
});

// router.use(async (req, res, next) => {
//   console.log('Middleware use test: ');
//   const tokenString = req.headers.authorization
//     ? req.headers.authorization.split(' ')
//     : [];

//   if (tokenString[0] === 'Bearer') {
//     try {
//       //   console.log('Verifying token...');
//       const verifiedToken = await userDAO.verifyToken(tokenString[1]);
//       //   console.log('verifiedToken');
//       //   console.log(verifiedToken);

//       const user = await userDAO.getUser({ _id: verifiedToken._id });
//       req.user = user ? user : {};
//       req.user.isAuthorized = tokenString[1];
//       //   console.log('Valid Token')
//       next();
//     } catch (error) {
//       if (error instanceof userDAO.BadDataError) {
//         res.status(401).send(error.message);
//       } else {
//         res.status(500).send(error.message);
//       }
//     }
//   } else {
//     // console.log('No token')
//     req.user = { isAuthorized: false };
//     next();
//   }
// });

const isAuthorized = async (req, res, next) => {
  console.log('Middleware use test: ');
  const tokenString = req.headers.authorization
    ? req.headers.authorization.split(' ')
    : [];

  if (tokenString[0] === 'Bearer') {
    try {
      //   console.log('Verifying token...');
      const verifiedToken = await userDAO.verifyToken(tokenString[1]);
      //   console.log('verifiedToken');
      //   console.log(verifiedToken);

      const user = await userDAO.getUser({ _id: verifiedToken._id });
      req.user = user ? user : {};
      req.user.isAuthorized = tokenString[1];
      //   console.log('Valid Token')
      next();
    } catch (error) {
      if (error instanceof userDAO.BadDataError) {
        res.status(401).send(error.message);
      } else {
        res.status(500).send(error.message);
      }
    }
  } else {
    // console.log('No token')
    req.user = { isAuthorized: false };
    next();
  }
};

router.use('/login', require('./login'));
router.use('/items', require('./items'));
router.use('/orders', require('./orders'));

router.use((err, req, res, next) => {
  console.log('Error detected: ', err);
});

module.exports = router;
module.exports = isAuthorized;
