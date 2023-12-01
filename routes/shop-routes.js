const express = require("express");
const { check } = require("express-validator");

const shopController = require("../controllers/shop-controller");
const checkAuth = require("../middleware/auth");

const router = express.Router();

router.post(
  "/create-product",
  checkAuth,
  [check("title").notEmpty(), check("price").notEmpty()],
  shopController.addProduct
);

router.post("/addToCart/:productId", checkAuth, shopController.addToCart);

router.get("/get-user-cart", checkAuth, shopController.getCartByUserId);

router.post("/post-order", checkAuth, shopController.postOrder);

module.exports = router;
