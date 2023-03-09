const Order = require("../models/order");
const Product = require("../models/product");
const BigPromise = require("../middlewares/bigPromise");
const CustomError = require("../utils/customError");
const order = require("../models/order");

exports.createOrder = BigPromise(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    taxAmount,
    shippingAmount,
    totalAmount,
    user: req.user._id,
  });

  res.status(200).json({
    success: true,
    order,
  });
});

exports.getOneOrder = BigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(new CustomError("Please check order id", 401));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

exports.getUserOrders = BigPromise(async (req, res, next) => {
  const order = await Order.find({ user: req.user._id });

  if (!order) {
    return next(new CustomError("Please check order id", 401));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

exports.admingetallOrders = BigPromise(async (req, res, next) => {
  const orders = await Order.find();

  if (!orders) {
    return next(new CustomError("Please check order id", 401));
  }

  res.status(200).json({
    success: true,
    orders,
  });
});

exports.adminUpdateOrder = BigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new CustomError("Please check order id", 401));
  }

  order.orderStatus = req.body.orderStatus;

  order.orderItems.forEach(async (prod) => {
    await updateProductStoke(prod.product, prod.quantity);
  });

  await order.save();

  res.status(200).json({
    success: true,
    order,
  });
});

exports.adminDeletOrder = BigPromise(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  await order.remove();

  res.status(200).json({
    success: true,
    order,
  });
});

async function updateProductStoke(productId, quantity) {
  const product = await Product.findById(productId);

  product.stoke = product.stoke - quantity;

  await product.save({ validateBeforeSave: false });
}
