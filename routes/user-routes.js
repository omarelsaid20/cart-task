const express = require("express");
const { check } = require("express-validator");
const router = express.Router();

const userController = require("../controllers/user-controller");

router.post(
  "/signup",
  [
    check("name").notEmpty(),
    check("email").notEmpty().isEmail(),
    check("password").notEmpty().isLength({ min: 6 }),
  ],
  userController.signup
);

router.post(
  "/login",
  [
    check("email").notEmpty().isEmail(),
    check("password").notEmpty().isLength({ min: 6 }),
  ],
  userController.login
);

module.exports = router;
