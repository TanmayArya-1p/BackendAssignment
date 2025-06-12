import express from "express";
import db from "../db/index.js";
import * as jwt from "../utils/jwt.js";
import * as authUtils from "../utils/auth.js";
import * as authMiddleware from "../middleware/auth.js";

let router = express.Router();

router.use(express.json());
router.use(authMiddleware.authenticationMiddleware());

/**
 * @openapi
 * /api/orders/item/{order_item}/bump:
 *  post:
 *    summary: Bump status of an order item
 *    description: Status of Order Items progresses like PENDING -> PREPARING -> SERVED
 *    security:
 *      - AuthHeader : []
 *    tags:
 *      - Orders
 *    parameters:
 *      - name: order_item
 *        type: number
 *        required : true
 *        in : path
 *    responses:
 *      200:
 *        description: Success
 *
 */
router.post(
  "/item/:orderitem/bump",
  authMiddleware.authorizationMiddleware(authUtils.CHEF),
  async (req, res) => {
    try {
      let order = await db.OrderItems.bumpStatus(Number(req.params.orderitem));
      res.send({ message: `Bumped Status to ${order.status}` });
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Internal Server Error" });
    }
  },
);

/**
 * @openapi
 * /api/orders:
 *  get:
 *    summary: Get all Orders
 *    description: Need to have authorization of CHEF or above to perform this request
 *    tags:
 *      - Orders
 *    security:
 *      - AuthHeader : []
 *    parameters:
 *      - name: limit
 *        description: Max no of orders to retrieve
 *        in: query
 *        required: false
 *      - name: offset
 *        description: Offset from the start to fetch orders
 *        in: query
 *        required: false
 *    responses:
 *      200:
 *        description: Success
 *
 */
router.get(
  "/",
  authMiddleware.authorizationMiddleware(authUtils.CHEF),
  async (req, res) => {
    let limit = Number(req.query.limit);
    let offset = Number(req.query.offset);
    if (isNaN(limit)) limit = -1;
    if (isNaN(offset)) offset = 0;

    let orders = await db.Order.getAllOrders(limit, offset);
    res.send(orders);
  },
);

/**
 * @openapi
 * /api/orders/my:
 *  get:
 *    summary: "Get orders issued by the user making the request"
 *    security:
 *      - AuthHeader : []
 *    tags:
 *      - Orders
 *    parameters:
 *      - name: limit
 *        description: Max no of orders to retrieve
 *        in: query
 *        required: false
 *      - name: offset
 *        description: Offset from the start to fetch orders
 *        in: query
 *        required: false
 *    responses:
 *      200:
 *        description: Success
 */
router.get("/my", async (req, res) => {
  let limit = Number(req.query.limit);
  let offset = Number(req.query.offset);
  if (isNaN(limit)) limit = -1;
  if (isNaN(offset)) offset = 0;
  let orders = await db.Order.getAllOrdersByUser(
    res.locals.user,
    limit,
    offset,
  );
  res.send(orders);
});

/**
 * @openapi
 * /api/orders:
 *  post:
 *    summary: "Create an order"
 *    security:
 *      - AuthHeader : []
 *    tags:
 *      - Orders
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              table_no:
 *                type: number
 *    responses:
 *      200:
 *        description: Success
 */
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

/**
 * @openapi
 * /api/orders/{orderid}:
 *  get:
 *    summary: "Get a specific order and the items ordered in it"
 *    security:
 *      - AuthHeader : []
 *    tags:
 *      - Orders
 *    parameters:
 *      - name: order_id
 *        type: number
 *        in: path
 *    responses:
 *      200:
 *        description: Success
 */
router.get("/:orderid", async (req, res) => {
  try {
    let order = await db.Order.getOrderById(Number(req.params.orderid));
    if (
      res.locals.user.role === "customer" &&
      order.issued_by !== res.locals.user.id
    ) {
      return res.status(401).send({ message: "Unauthorized" });
    } else {
      console.log("PASSESCHECKED", res.locals.user);
    }
    res.send(order);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

/**
 * @openapi
 * /api/orders/{orderid}:
 *  delete:
 *    summary: "Delete a specific order and the items ordered in it"
 *    security:
 *      - AuthHeader : []
 *    tags:
 *      - Orders
 *    parameters:
 *      - name: order_id
 *        type: number
 *        in: path
 *    responses:
 *      200:
 *        description: Success
 */
router.delete(
  "/:orderid",
  authMiddleware.authorizationMiddleware(authUtils.CHEF),
  async (req, res) => {
    try {
      let order = await db.Order.getOrderById(Number(req.params.orderid));
      await order.delete();
      res.send(order);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Internal Server Error" });
    }
  },
);

/**
 * @openapi
 * /api/orders/{orderid}:
 *  put:
 *    summary: "Update a specific order"
 *    security:
 *      - AuthHeader : []
 *    tags:
 *      - Orders
 *    parameters:
 *      - name: orderid
 *        in: path
 *        type: number
 *        required: true
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: string
 *                enum: [pending,preparing,served,billed,paid]
 *              table_no:
 *                type: number
 *              billable_amount:
 *                type: number
 *    responses:
 *      200:
 *        description: Success
 */
router.put(
  "/:orderid",
  authMiddleware.authorizationMiddleware(authUtils.CHEF),
  async (req, res) => {
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
  },
);

/**
 * @openapi
 * /api/orders/{orderid}/items:
 *  get:
 *    summary: "Get all ordered items in a specific order"
 *    description: "If you have the role of CUSTOMER then you must have issued the order to see its items"
 *    security:
 *      - AuthHeader : []
 *    tags:
 *      - Orders
 *    parameters:
 *      - name: orderid
 *        in: path
 *        type: number
 *        required: true
 *    responses:
 *      200:
 *        description: Success
 */
router.get("/:orderid/items", async (req, res) => {
  try {
    let order = await db.Order.getOrderById(Number(req.params.orderid));
    if (
      res.locals.user.role === "customer" &&
      res.locals.user.id !== order.issued_by
    )
      return res.status(400).send({ message: "Unauthorized" });
    let items = await order.getOrderedItems();
    res.send(items);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

/**
 * @openapi
 * /api/orders/{orderid}/items:
 *  post:
 *    summary: "Order a new item"
 *    description: "If you have the role of CUSTOMER then you must have issued the order to order an item in it"
 *    security:
 *      - AuthHeader : []
 *    tags:
 *      - Orders
 *    parameters:
 *      - name: orderid
 *        in: path
 *        required: true
 *        type: number
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              item_id:
 *                required: true
 *                type: number
 *              quantity:
 *                 required: true
 *                 type: number
 *              instructions:
 *                type: string
 *    responses:
 *      200:
 *        description: Success
 */
router.post("/:orderid/items", async (req, res) => {
  try {
    let order = await db.Order.getOrderById(Number(req.params.orderid));
    if (
      res.locals.user.role === "customer" &&
      res.locals.user.id !== order.issued_by
    )
      return res.status(400).send({ message: "Unauthorized" });
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

/**
 * @openapi
 * /api/orders/{orderid}/bill:
 *  get:
 *    summary: "Get the current bill of the order"
 *    description: "If you have the role of CUSTOMER then you must have issued the order to order an item in it"
 *    security:
 *      - AuthHeader : []
 *    tags:
 *      - Orders
 *    parameters:
 *      - name: orderid
 *        in: path
 *        required: true
 *        type: number
 *      - name: resolve
 *        in: query
 *        type: string
 *        enum: [false,true]
 *        description: if set to 'true' then the order will be marked as 'BILLED'. Once marked for billing, users will no longer be able to order items in it.
 *    responses:
 *      200:
 *        description: Success
 */
router.get("/:orderid/bill", async (req, res) => {
  try {
    let order = await db.Order.getOrderById(Number(req.params.orderid));
    if (
      res.locals.user.role === "customer" &&
      res.locals.user.id !== order.issued_by
    )
      return res.status(400).send({ message: "Unauthorized" });
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

/**
 * @openapi
 * /api/orders/{orderid}/pay:
 *  post:
 *    summary: "Mark an order as paid"
 *    description: "Must have role of CHEF or above"
 *    security:
 *      - AuthHeader : []
 *    tags:
 *      - Orders
 *    parameters:
 *      - name: orderid
 *        in: path
 *        required: true
 *        type: number
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *            schema:
 *              type: object
 *              properties:
 *                amount:
 *                  required: true
 *                  type: number
 *                  description: Amount paid by the issuer of the order. Excess will be considered as a tip
 *    responses:
 *      200:
 *        description: Success
 */
router.post(
  "/:orderid/bill/pay",
  authMiddleware.authorizationMiddleware(authUtils.CHEF),
  async (req, res) => {
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
  },
);

export default router;
