const userDAO = require('../daos/user');

const isUserAdmin = async (req, res, next) => {
  //   console.log('Middleware use test: isUserAdmin ');

  // isUserAuthorized middleware needs to be ran first to retrieve user roles
  try {
    const rolesAllowed = ['admin'];
    if (req.user.roles.some((role) => rolesAllowed.includes(role))) {
      next();
    } else {
      res.status(403).send('Restricted Access');
    }
  } catch (error) {
    if (error instanceof userDAO.BadDataError) {
      res.status(401).send(error.message);
    } else {
      //   console.log('500 error.message');
      //   console.log(error.message);
      res.status(500).send(error.message);
    }
  }
};

module.exports = isUserAdmin;
