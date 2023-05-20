const userDAO = require('../daos/user');

const isUserAuthorized = async (req, res, next) => {
  //   console.log('Middleware use test: ');
  const tokenString = req.headers.authorization
    ? req.headers.authorization.split(' ')
    : [];

  if (tokenString[0] === 'Bearer') {
    req.user = {};
    try {
      //   console.log('Verifying token...');
      req.user = await userDAO.verifyToken(tokenString[1]);
      req.user.isAuthorized = true;
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

module.exports = isUserAuthorized;
