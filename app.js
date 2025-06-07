import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "./routers/auth.js";
import itemsRouter from "./routers/items.js";
import usersRouter from "./routers/users.js";
import ordersRouter from "./routers/orders.js";
import logger from "morgan";
import path from "path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as authMiddleware from "./middleware/auth.js";
import db from "./db/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.get("/" ,function (req, res) {
  res.render("index");
});
app.get("/login",function (req, res) {
  res.render("login");
})
app.get("/register",function (req, res) {
  res.render("register");
})


let orderColourMap = {
  'pending' : 'red-500',
  'preparing' : 'yellow-500',
  'served' : 'teal-500',
  'billed' : 'green-500',
  'paid': 'green-500'
}

app.get("/home", authMiddleware.authenticationMiddleware(false,true) ,async function (req, res) {
  let orders = null;
  if( res.locals.user.role === "customer") {
    orders = await db.Order.getAllOrdersByUser(res.locals.user);
  } else {
    orders = await db.Order.getAllOrders();
  }
  res.render(`${res.locals.user.role}-home` , {user: res.locals.user , orders : orders, items: (await db.Item.getAllItems()) , orderColourMap : orderColourMap , items: await db.Item.getAllItems()});
})

app.use("/api/auth", authRouter);
app.use("/api/items", itemsRouter);
app.use("/api/users", usersRouter);
app.use("/api/orders", ordersRouter);

app.use(function (req, res, next) {
  res.status(404).send("404 Not Found");
});

export default app;
