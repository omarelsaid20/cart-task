const httpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res, next) => {
  const { name, email, password } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new httpError("Invalid inputs, please enter correct data", 422)
    );
  }

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new httpError("Signup failed, please try again", 500);
    return next(error);
  }

  if (existingUser) {
    const error = new httpError("User exists already", 422);
    return next(error);
  }

  const newUser = new User({
    name,
    email,
    password,
    cart: { items: [] },
    products: [],
  });

  console.log(newUser);

  try {
    await newUser.save();
  } catch (err) {
    const error = new httpError("Signing Up  failed ", 422);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      "supersecret-dont-share",
      {
        expiresIn: "1h",
      }
    );
  } catch (err) {
    const error = new httpError("Signing Up  failed ", 422);
    return next(error);
  }

  console.log(newUser);
  res.status(201).json({
    msg: "User Created",
    userId: newUser.id,
    email: newUser.email,
    token: token,
  });
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new httpError("Signup failed, please try again", 500);
    return next(error);
  }

  if (!existingUser || existingUser.password !== password) {
    const error = new httpError("Invalid credentials", 401);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      "supersecret-dont-share",
      {
        expiresIn: "1h",
      }
    );
  } catch (err) {
    const error = new httpError("Logging in  failed ", 422);
    return next(error);
  }

  res.status(200).json({
    msg: "login successfully",
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
  });
};
