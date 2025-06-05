import express from "express";
import db from "../db/index.js";
import * as jwt from "../utils/jwt.js";
import * as authUtils from "../utils/auth.js";
import * as authMiddleware from "../middleware/auth.js";

let router = express.Router();

router.use(express.json());
router.use(authMiddleware.authenticationMiddleware);

//AUTHORIZATION FOR EACH ROUTE
// only let those deserving to see info

router.get("/", async (req, res) => {
  if (!req.params.limit) req.params.limit = -1;
  if (!req.params.offset) req.params.offset = 0;
  let limit = Number(req.params.limit);
  let offset = Number(req.params.offset);
  let orders = await db.Order.getAllOrders(limit, offset);
  res.send(orders);
});

router.post("/", async (req, res) => {
  let table_no = req.body.table_no;
  if (!table_no) {
    return res.status(400).send({ message: "Table number is required" });
  }
  try {
    let order = new db.Order({
      table_no: table_no,
      issued_by: res.locals.user.id,
    });
    await order.create();
    res.send(order);
  } catch (err) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.get("/:orderid", async (req, res) => {
  try {
    let order = await db.Order.getOrderById(Number(req.params.orderid));
    res.send(order);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.delete("/:orderid", async (req, res) => {
  try {
    let order = await db.Order.getOrderById(Number(req.params.orderid));
    await order.delete();
    res.send(order);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.put("/:orderid", async (req, res) => {
  try {
    let order = await db.Order.getOrderById(Number(req.params.orderid));

    if (!req.body.status) req.body.status = -1;
    if (!req.body.billable_amount) req.body.billable_amount = -1;
    if (!req.body.table_no) req.body.table_no = -1;

    order = await db.Order.updateOrder(
      order.id,
      req.body.status,
      req.body.billable_amount,
      req.body.table_no,
    );
    res.send(order);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.get("/:orderid/items", async (req, res) => {
  try {
    let order = await db.Order.getOrderById(Number(req.params.orderid));
    let items = await order.getOrderedItems();
    res.send(items);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.post("/:orderid/items", async (req, res) => {
  try {
    let order = await db.Order.getOrderById(Number(req.params.orderid));

    let item_id = req.body.item_id;
    let quantity = req.body.quantity;
    let instructions = req.body.instructions;

    if (!item_id || !quantity) {
      throw new Error("Invalid input");
    }

    let item = await order.orderItem(item_id, quantity, instructions);
    res.send(item);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.get("/:orderid/bill", async (req, res) => {
  try {
    let order = await db.Order.getOrderById(Number(req.params.orderid));
    let resolveStat = req.query.resolve == "true" ? true : false;
    let billamt = await order.resolveBillableAmount(resolveStat);
    let orderitems = await order.getOrderedItems();

    res.send({
      billable_amount: billamt,
      items: orderitems,
      order_id: order.id,
      order_status: order.status,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.post("/:orderid/bill/pay", async (req, res) => {
  try {
    let order = await db.Order.getOrderById(Number(req.params.orderid));
    if (order.status != "billed") throw new Error("Order not billed");
    let amount = req.body.amount;

    if (!amount) {
      throw new Error("Invalid input");
    }
    if (amount < order.billable_amount) {
      throw new Error("Insufficient amount");
    }

    await order.payBill(res.locals.user.id, amount - order.billable_amount);
    await order.hydrate();
    res.send({ message: "Bill paid successfully", order: order });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

export default router;
