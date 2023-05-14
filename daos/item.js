const { mongoose } = require('mongoose');
const Item = require('../models/item');

module.exports = {};

module.exports.getAllItems = async () => {
  try {
    return await Item.find().lean();
  } catch (error) {
    throw Error(error.message);
  }
};

module.exports.getItemById = async (itemId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      throw Error('Invalid id');
    }
    return await Item.findById(itemId);
  } catch (error) {
    console.log();
    if (error.message.includes('Invalid id')) {
      throw new BadDataError(error.message);
    } else {
      throw new Error(error.message);
    }
  }
};

module.exports.storeItem = async (itemObj) => {
  try {
    return await Item.create(itemObj);
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports.updateItemById = async (itemId, newData) => {
  try {
    return await Item.findByIdAndUpdate(itemId, newData);
  } catch (error) {
    throw new Error(error.message);
  }
};

class BadDataError extends Error {}
module.exports.BadDataError = BadDataError;
