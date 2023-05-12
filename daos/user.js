const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
// saltRounds => 1 used for testing only, 10 is recommended
const saltRounds = 1;
const secret = 'secretKey';

module.exports = {};

module.exports.getUser = async (userObj) => {
  try {
    const user = await User.findOne(userObj).lean();
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports.generateToken = async (data) => {
  return await jwt.sign(data, secret);
};

module.exports.verifyToken = async (token) => {
  try {
    const verifiedToken = await jwt.verify(token, secret);
    return verifiedToken;
  } catch (error) {
    console.log('error.message');
    console.log(error.message);
    if (
      error.message.includes('invalid signature') ||
      error.message.includes('jwt malformed')
    ) {
      throw new BadDataError('Invalid Token');
    } else {
      throw new Error(error.message);
    }
  }
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
