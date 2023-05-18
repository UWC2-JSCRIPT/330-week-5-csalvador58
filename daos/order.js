const { mongoose } = require('mongoose');
const Order = require('../models/order');
const Item = require('../models/item');
const { aggregate, findById } = require('../models/user');

module.exports = {};

module.exports.createOrder = async (userId, items) => {
  try {
    // Validate items are valid IDs in db
    const validateItemsInOrder = items.map(async (item) => {
      const itemId = new mongoose.Types.ObjectId(item);
      const itemDetails = await Item.findOne({ _id: itemId }).lean();
      if (!itemDetails) {
        throw new Error('Invalid item');
      }
      return itemDetails;
    });

    const itemsFromOrder = await Promise.all(validateItemsInOrder);

    // calculate total
    const totalPriceInOrder = itemsFromOrder
      .reduce((acc, item) => {
        return acc + item.price;
      }, 0)
      .toFixed(2);

    // create order
    const createdOrder = await Order.create({
      userId: userId,
      items: itemsFromOrder.map((item) => item._id),
      total: totalPriceInOrder,
    });

    return createdOrder;
  } catch (error) {

    if (error.message.includes('Invalid item')) {
      throw new BadDataError(error.message);
    } else {
      throw new Error(error.message);
    }
  }
};

module.exports.getById = async (userRoles, userEmail, orderId) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new Error('Invalid orderId');
  }

  try {
    const order = await Order.findById(orderId).populate(['userId']);
    if (order.userId.email === userEmail || userRoles.includes('admin')) {
      return await Order.findById(orderId).populate(['items']);
    } else {
      throw new Error('Restricted access');
    }
  } catch (error) {
    if (
      error.message.includes('Invalid orderId') ||
      error.message.includes('Restricted access')
    ) {
      throw new BadDataError(error.message);
    }
    throw new Error(error.message);
  }
};

module.exports.getOrders = async (userRoles, userId) => {
  try {
    if (userRoles.includes('admin')) {
      return Order.find().lean().exec();
    } else {
      return Order.find({ userId: userId }).lean().exec();
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

class BadDataError extends Error {}
module.exports.BadDataError = BadDataError;
