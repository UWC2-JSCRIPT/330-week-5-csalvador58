const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
// saltRounds => 1 used for testing only, 10 is recommended
const saltRounds = 1;

module.exports = {};

module.exports.getUser = async (userObj) => {
  try {
    const user = await User.findOne(userObj).lean();
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports.generateToken = async (data, secret) => {
  return await jwt.sign(data, secret);
};

module.exports.createUser = (userEmail, userPassword) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(userPassword, saltRounds).then(async (hashedPassword) => {
      try {
        const storedUser = await User.create({
          password: hashedPassword,
          email: userEmail,
          roles: ['user'],
        });
        resolve(storedUser);
      } catch (error) {
        if (error.message.includes('duplicate key')) {
          reject(new BadDataError('Email already exists'));
        } else {
          reject(new Error(error.message));
        }
      }
    });
  });
};

module.exports.validatePassword = async (password, hashedPassword) => {
  const passwordIsValid = await bcrypt.compare(password, hashedPassword);
  if (passwordIsValid) {
    return true;
  } else {
    throw new BadDataError('Password does not match');
  }
};

class BadDataError extends Error {}
module.exports.BadDataError = BadDataError;
