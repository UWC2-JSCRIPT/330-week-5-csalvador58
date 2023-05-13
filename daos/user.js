const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
// saltRounds => 1 used for testing only, 10 is recommended
const saltRounds = 1;
const secret = 'secretKey';

module.exports = {};

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

module.exports.generateToken = async (data) => {
  return await jwt.sign(data, secret);
};

module.exports.getUser = async (userObj) => {
  try {
    const user = await User.findOne(userObj).lean();
    if (user) {
      return user;
    } else {
      throw new Error('User does not exist');
    }
  } catch (error) {
    if (error.message.includes('User does not exist')) {
      throw new BadDataError(error.message);
    } else {
      throw new Error(error.message);
    }
  }
};

module.exports.updateUserPassword = async (userId, newPassword) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(newPassword, saltRounds).then(async (hashedPassword) => {
      try {
        const updatedPassword = await User.findOneAndUpdate(
          { _id: userId },
          { password: hashedPassword },
          { new: true }
        );
        resolve(updatedPassword);
      } catch (error) {
        reject(new Error(error.message));
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

module.exports.verifyToken = async (token) => {
  try {
    return await jwt.verify(token, secret);
  } catch (error) {
    throw new BadDataError(`Invalid token: ${error.message}`);
  }
};

class BadDataError extends Error {}
module.exports.BadDataError = BadDataError;
