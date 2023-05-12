const { Router } = require('express');
const router = Router();

const userDAO = require('../daos/user');

router.use('/logout', async (req, res, next) => {
  res.sendStatus(404);
});

router.post('/password', async (req, res, next) => {
  // change password
});

router.use(async (req, res, next) => {
  console.log('Middleware use test - check email/password: ');
  const { email, password } = req.body;
  if (
    !password ||
    JSON.stringify(password) === '{}' ||
    !email ||
    JSON.stringify(email) === '{}'
  ) {
    res.status(400).send('Invalid Email/Password');
  } else {
    next();
  }
});

// router.use(async (req, res, next) => {
//     console.log('Middleware use test: ')
//   const tokenString = req.headers.authorization
//     ? req.headers.authorization.split(' ')
//     : [];

//   if (tokenString[0] === 'Bearer') {
//     try {
//       // retrieve user from db with token
//     } catch (error) {
//       res.sendStatus(401);
//     }
//   } else {
//     req.user = { token: false };
//     // next();
//   }
// });

router.post('/', async (req, res, next) => {
  console.log('Login Test post /');
  const { email, password } = req.body;
  console.log('email, password');
  console.log(email, password);

  try {
    const user = await userDAO.getUser({ email: email });
    console.log('user');
    console.log(user);

    const isLoggedIn = await userDAO.validatePassword(password, user.password);
    if (isLoggedIn) {
      const loginToken = await userDAO.generateToken(
        { _id: user._id, email: user.email, roles: user.roles },
        user.password
      );
      console.log('loginToken');
      console.log(loginToken);
      res.status(200).send({ token: loginToken });
    }
  } catch (error) {
    if (error instanceof userDAO.BadDataError) {
      res.status(401).send(error.message);
    } else {
      console.log(error);
      res.status(500).send(error.message);
    }
  }
});

router.post('/signup', async (req, res, next) => {
  console.log('Login Test post /signup');
  const { email, password } = req.body;

  try {
    const storedUser = await userDAO.createUser(email, password);
    res.status(200).send('New user created successfully');
  } catch (error) {
    if (error instanceof userDAO.BadDataError) {
      res.status(409).send(error.message);
    } else {
      console.log('500 Error', error.message);
      res.status(500).send(error.message);
    }
  }
});

module.exports = router;
