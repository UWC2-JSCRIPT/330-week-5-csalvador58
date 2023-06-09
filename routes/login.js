const { Router } = require('express');
const router = Router();

const userDAO = require('../daos/user');
const isUserAuthorized = require('./isUserAuthorized')

router.post('/logout', async (req, res, next) => {
  // console.log('Login Test - /logout');

  // logout method to remove token/cookie from client browser
  res.status(404).send('Login token required');
});

router.post('/password', isUserAuthorized, async (req, res, next) => {
  // console.log('Login Test post /password');
  const { password } = req.body;

  if (req.user.isAuthorized && password !== '') {
    try {
      const updatedPassword = await userDAO.updateUserPassword(
        req.user._id,
        password
      );
      // console.log('Password is now updated');
      // console.log(updatedPassword);
      res.status(200).send('User password is now updated.');
    } catch (error) {
      res.status(500).send(error.message);
    }
  } else if (password === '') {
    res.status(400).send('Password invalid');
  } else {
    res.status(401).send('Login required');
  }
});

router.use(async (req, res, next) => {
  // console.log('Middleware use test - check email/password: ');
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

router.post('/', isUserAuthorized, async (req, res, next) => {
  // console.log('Login Test post /');
  const { email, password } = req.body;

  try {
    // Retrieve user password from db
    const user = await userDAO.getUser({ email: email });

    // Verify password input and password from db matches
    const isLoggedIn = await userDAO.validatePassword(password, user.password);

    // Generate jwt token
    const loginToken = await userDAO.generateToken({
      _id: user._id,
      email: user.email,
      roles: user.roles,
    });
    
    res.json({ token: loginToken });
  } catch (error) {
    if (error instanceof userDAO.BadDataError) {
      res.status(401).send(error.message);
    } else {
      console.log(error);
      res.status(500).send(error.message);
    }
  }
});

router.post('/signup', isUserAuthorized, async (req, res, next) => {
  // console.log('Login Test post /signup');
  const { email, password } = req.body;

  try {
    const storedUser = await userDAO.createUser(email, password);
    res.status(200).send('New user created successfully');
  } catch (error) {
    if (error instanceof userDAO.BadDataError) {
      res.status(409).send(error.message);
    } else {
      // console.log('500 Error', error.message);
      res.status(500).send(error.message);
    }
  }
});

module.exports = router;
