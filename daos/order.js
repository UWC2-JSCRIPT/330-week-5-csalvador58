const { mongoose } = require('mongoose');
const Order = require('../models/order');
const Item = require('../models/item');
const { aggregate } = require('../models/user');

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

    //   const idsFromOrder = [
    //     new mongoose.Types.ObjectId('645fa490d37df3fbb71b48f9'),
    //     new mongoose.Types.ObjectId('645fa490d37df3fbb71b48fa'),
    //   ];

    //   const formattedUserId = new mongoose.Types.ObjectId(userId);

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
        console.log('item.price');
        console.log(item.price);
        if (item.price) {
          return acc + item.price;
        } else {
          throw new Error('Invalid item');
        }
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

class BadDataError extends Error {}
module.exports.BadDataError = BadDataError;
