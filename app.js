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
import { orderColourMap,paginate } from "./utils/misc.js";

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

app.get("/home", authMiddleware.authenticationMiddleware(false,true) ,async function (req, res) {

  let selectedTags = req.query.tags ? req.query.tags.split(",") : [];
  let selectHM = {}
  for(const i of selectedTags) {
    selectHM[i] = true;
  }


  let orders = null;
  if( res.locals.user.role === "customer") {
    orders = await db.Order.getAllOrdersByUser(res.locals.user);
  } else {
    orders = await db.Order.getAllOrders();
  }
  

  let items=null;
  if(selectedTags.length > 0) {
    items= await db.Item.getItemsofTag(selectedTags, -1, 0);
  } else {
    items = await db.Item.getAllItems(-1,0);
  }

  let page = paginate(items,req)
  items=page.filtered
  console.log(page)
  res.render(`${res.locals.user.role}-home` , {user: res.locals.user , orders : orders, items: items , orderColourMap : orderColourMap, tags: (await db.Tags.getAllTags()) , selectedTags: selectHM , page:page}); 
})

app.get("/order/create",authMiddleware.authenticationMiddleware(false,true) ,async function (req, res) {
  res.render("create-order" , {user: res.locals.user, items: (await db.Item.getAllItems()) });
})


app.get("/order/:orderid",authMiddleware.authenticationMiddleware(false,true) ,async function (req, res) {
  let order = await db.Order.getOrderById(Number(req.params.orderid));
  if (!order) {
    return res.status(404).send("Not Found");
  }

  if (res.locals.user.role === "customer" && order.issued_by !== res.locals.user.id) {
    return res.status(403).send("Forbidden");
  }

  res.render("order-view" , {user: res.locals.user, items: (await db.Item.getAllItems()) , order: order, orderColourMap : orderColourMap});
})


app.get("/register",function (req, res) {
  res.render("register");
})


app.use("/api/auth", authRouter);
app.use("/api/items", itemsRouter);
app.use("/api/users", usersRouter);
app.use("/api/orders", ordersRouter);

app.use(function (req, res, next) {
  res.status(404).send("404 Not Found");
});

export default app;
