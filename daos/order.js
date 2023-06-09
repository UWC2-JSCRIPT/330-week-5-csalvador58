const { mongoose, mongo } = require('mongoose');
const Order = require('../models/order');
const Item = require('../models/item');
const User = require('../models/user');
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

module.exports.getOrderById = async (userId, orderId) => {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new Error('Invalid orderId');
  }

  try {
    const query = await User.aggregate([
      {
        // Match userId to _id in User collection
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        // include documents from orders collection using $lookup
        $lookup: {
          from: 'orders',
          pipeline: [
            {
              // filter for specific order by id
              $match: {
                _id: new mongoose.Types.ObjectId(orderId),
              },
            },
            {
              // $unwind needed to separate each item into it's own document to
              //   handle duplicate ids
              $unwind: '$items',
            },
            {
              // include a new field to include title and price details from
              //  items collection
              $lookup: {
                from: 'items',
                localField: 'items',
                foreignField: '_id',
                as: 'itemDetails',
              },
            },
            // $unwind used to separate each item data set to match formatting of test
            {
              $unwind: '$itemDetails',
            },
            {
              // group stage to match shape required for test
              $group: {
                _id: '$_id',
                userId: {
                  $first: '$userId',
                },
                total: {
                  $first: '$total',
                },
                items: {
                  $push: '$itemDetails',
                },
              },
            },
          ],
          as: 'orders',
        },
      },
      {
        // Project stage added to add conditional to check if user has an
        //   admin role to view all order. If normal user, then filter
        //   to only orders by user.
        $project: {
          orders: {
            $cond: {
              if: {
                $in: ['admin', '$roles'],
              },
              then: '$orders',
              else: {
                $filter: {
                  input: '$orders',
                  as: 'orders',
                  cond: {
                    $eq: [
                      '$$orders.userId',
                      new mongoose.Types.ObjectId(userId),
                    ],
                  },
                },
              },
            },
          },
        },
      },
    ]);

    // console.log('DAOs- query');
    // console.log('query[0].toObject()');
    // console.log(query[0]);
    // console.log('query[0].orders');
    // console.log(query[0].orders[0]);
    if (query[0].orders[0]) {
      return query[0].orders[0];
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

module.exports.getOrders = async (userId) => {
  try {
    const query = await User.aggregate([
      {
        // Match userId to _id in User collection
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        // lookup all orders from orders collection and add to last stage
        $lookup: {
          from: 'orders',
          pipeline: [],
          as: 'orders',
        },
      },
      {
        // Reshape last stage to only include orders field and create a condition to
        // only include orders matching a userId unless the user does has the 'admin' role
        $project: {
          orders: {
            $cond: {
              if: {
                $in: ['admin', '$roles'],
              },
              then: '$orders',
              else: {
                $filter: {
                  input: '$orders',
                  as: 'orders',
                  cond: {
                    $eq: [
                      '$$orders.userId',
                      new mongoose.Types.ObjectId(userId),
                    ],
                  },
                },
              },
            },
          },
        },
      },
    ]);

    // console.log('DAOs - query');
    // console.log(query[0].orders);
    return query[0].orders;
  } catch (error) {
    throw new Error(error.message);
  }
};

class BadDataError extends Error {}
module.exports.BadDataError = BadDataError;
