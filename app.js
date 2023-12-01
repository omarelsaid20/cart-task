const express = require("express");
const { default: mongoose } = require("mongoose");
const bodyparser = require("body-parser");

const app = express();

const shopRoutes = require("./routes/shop-routes");
const userRoutes = require("./routes/user-routes");

const mongodbUrl =
  "mongodb+srv://omar:omar123@cluster0.ib5pg.mongodb.net/cart-task?retryWrites=true&w=majority";
const PORT = 5000;

app.use(bodyparser.json());

app.use("/", shopRoutes);
app.use("/auth", userRoutes);

app.use((error, req, res, next) => {
  if (res.headerSet) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "" });
});

mongoose
  .connect(mongodbUrl)
  .then(() => {
    console.log("connected to db");
    app.listen(PORT, () => {
      console.log(`server is running on port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));
