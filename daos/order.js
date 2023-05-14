const { mongoose } = require('mongoose');
const Order = require('../models/order');
const Item = require('../models/item');
const { aggregate, findById } = require('../models/user');

module.exports = {};

module.exports.createOrder = async (userId, items) => {
  //   console.log('DAOS - order');
  //   console.log(items);
  try {
    // Validate items are valid IDs in db
    const validateItemsInOrder = items.map(async (item) => {
      const itemId = new mongoose.Types.ObjectId(item);
      const isItemValid = await Item.findOne({ _id: itemId }).lean();

      if (isItemValid) {
        return itemId;
      } else {
        throw new Error('Invalid item');
      }
    });

    const idsFromOrder = await Promise.all(validateItemsInOrder);

    // create order without accumulated total
    const createOrderFromIds = await Order.create({
      userId: userId,
      items: idsFromOrder,
      total: 0,
    });

    // Populate the 'items' field to include 'price', then calculate total of all items in the order using reduce method
    const total = (
      await Order.findById(createOrderFromIds._id).populate(['items'])
    ).items
      .reduce((acc, item) => {
        if (!item.price) {
          throw new Error('Invalid item');
        }
        return acc + item.price;
      }, 0)
      .toFixed(2);

    // Update total in db
    const completedOrder = await Order.findOneAndUpdate(
      { _id: createOrderFromIds._id },
      { total: total }
    );

    return completedOrder;
  } catch (error) {
    console.log('DAOS - error');
    console.log(error.message);

    if (error.message.includes('Invalid item')) {
      throw new BadDataError(error.message);
    } else {
      throw new Error(error.message);
    }
  }
};

module.exports.getById = async (userRoles, userEmail, orderId) => {
  console.log('orderId');
  console.log(orderId);
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new Error('Invalid orderId');
  }

  try {
    const order = await Order.findById(orderId).populate(['userId']);
    console.log('DAOs - order');
    console.log(order);
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

class BadDataError extends Error {}
module.exports.BadDataError = BadDataError;
