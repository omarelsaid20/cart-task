const { validationResult } = require("express-validator");
const { default: mongoose } = require("mongoose");

const httpError = require("../models/http-error");
const Product = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");

exports.addProduct = async (req, res, next) => {
  const creator = req.userData.userId;
  const { title, price, descriptionr } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  if (price <= 0) {
    return res.status(400).send({
      message: "price must be greater than 0",
    });
  }

  const createdProduct = new Product({
    title,
    price,
    description,
    userId: creator,
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new httpError("Creating failed, try again later", 500);
    return next(error);
  }

  if (!user) {
    const error = new httpError("Could not find user for provided id", 404);
    return next(error);
  }

  console.log(user);

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdProduct.save({ session: sess });
    user.products.push(createdProduct);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    const error = new httpError("Creating failed, please try again later", 500);
    return next(error);
  }

  console.log(title, price);

  res.status(201).send({ message: "product created successfully" });
};

exports.addToCart = async (req, res, next) => {
  const { userId } = req.userData;
  const productId = req.params.productId;
  const quantity = req.body.quantity;

  // console.log(productId, userId);

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new httpError("Creating failed, try again later", 500);
    return next(error);
  }

  if (!user) {
    const error = new httpError("Could not find user for provided id", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    user.cart.items.push({ productId, quantity: quantity });
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new httpError("SomeThing went wrong", 422);
    return next(error);
  }

  res.status(201).send({ message: "product added to cart" });
};

exports.getCartByUserId = async (req, res, next) => {
  const userId = req.userData.userId;
  let user;
  try {
    user = await User.findById(userId).populate("cart.items.productId");
  } catch (err) {
    const error = new httpError("Fetching cart failed, try again later", 500);
    return next(error);
  }
  if (!user) {
    const error = new httpError("Could not find user for provided id", 404);
    return next(error);
  }

  let totalPrice;
  try {
    totalPrice = user.cart.items
      .map((item) => item.productId.price * item.quantity)
      .reduce((a, b) => a + b, 0);
  } catch (err) {
    const error = new httpError("Fetching cart failed, try again later", 500);
    return next(error);
  }

  res.json({ cartItems: user.cart.items, totalPrice: totalPrice });
};

exports.postOrder = async (req, res, next) => {
  const userId = req.userData.userId;
  const email = req.userData.email;

  try {
    user = await User.findById(userId).populate("cart.items.productId");
  } catch (err) {
    const error = new httpError("Fetching cart failed, try again later", 500);
    return next(error);
  }
  if (!user) {
    const error = new httpError("Could not find user for provided id", 404);
    return next(error);
  }

  const products = user.cart.items.map((i) => {
    return { quantity: i.quantity, product: { ...i.productId._doc } };
  });

  const order = new Order({
    user: {
      email,
      userId,
    },
    products: products,
  });

  let totalPrice;
  try {
    totalPrice = user.cart.items
      .map((item) => item.productId.price * item.quantity)
      .reduce((a, b) => a + b, 0);
  } catch (err) {
    const error = new httpError("Ordering failed, try again later", 500);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await order.save({ session: sess });
    user.cart.items = [];
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new httpError("SomeThing went wrong", 422);
    return next(error);
  }

  res.status(201).send({ message: "successfully ordered", order, totalPrice });
};
