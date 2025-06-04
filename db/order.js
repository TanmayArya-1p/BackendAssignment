import db from "./db.js";
import Item from "./item.js";

export default class Order {
  constructor(p) {
    this.hydrated = false;
    if (typeof p === "object") {
      Object.assign(this, p);
      if (
        this.id &&
        this.issued_by &&
        this.issued_at &&
        this.status &&
        Array.isArray(this.ordered_items)
      )
        this.hydrated = true;
    } else if (typeof p === "number") {
      this.id = p;
    } else {
      throw new Error("Invalid Parameter");
    }
  }

  async getOrderedItems() {
    let items = await db.query("SELECT * FROM order_items WHERE order_id = ?", [
      this.id,
    ]);
    return items[0];
  }

  static async getOrderById(order_id) {
    let order = await db.query("SELECT * FROM orders WHERE id = ?", [order_id]);
    let items = await new Order(order_id).getOrderedItems();
    order[0][0].ordered_items = items;
    return new Order(order[0][0]);
  }

  async hydrate() {
    let res = await Order.getOrderById(this.id);
    Object.assign(this, res);
    this.hydrated = true;
  }

  async create() {
    if (!this.issued_by || !this.table_no) {
      throw new Error("Invalid Parameter");
    }
    let orderID = await db.query(
      "INSERT INTO orders (issued_by, table_no) VALUES (?, ?)",
      [this.issued_by, this.table_no],
    );
    this.id = orderID[0].insertId;
    await this.hydrate();
    return this;
  }

  static async deleteAllItemOrders(order_id) {
    await db.query("DELETE FROM order_items WHERE order_id = ?", [order_id]);
  }

  async delete() {
    await Order.deleteAllItemOrders(this.id);
    await db.query("DELETE FROM orders WHERE id = ?", [this.id]);
  }

  async resolveBillableAmount(resolve_status = false) {
    let items = await this.getOrderedItems();
    let newOrder = await Order.updateOrder(
      this.id,
      resolve_status ? "billed" : this.status,
      items.reduce((prev, a) => a.price + prev, 0),
    );

    return newOrder.billable_amount;
  }

  static async updateOrder(id, status = -1, billable_amount = -1) {
    if (status === -1 && billable_amount === -1) {
      return Promise.resolve();
    }
    let order = null;
    if (status == -1) {
      await db.query("UPDATE orders SET billable_amount = ? WHERE id = ?", [
        billable_amount,
        id,
      ]);
    } else if (billable_amount == -1) {
      await db.query("UPDATE orders SET status = ? WHERE id = ?", [status, id]);
    } else {
      await db.query(
        "UPDATE orders SET status = ?, billable_amount = ? WHERE id = ?",
        [status, billable_amount, id],
      );
    }
    order = await Order.getOrderById(id);
    return order;
  }

  async orderItem(item_id, quantity, instructions = null) {
    let price = await Item.getItemById(item_id);
    price = price.price * quantity;
    await db.query(
      "INSERT INTO order_items (order_id, item_id, quantity, price,instructions) VALUES (?, ?, ?, ?,?)",
      [this.id, item_id, quantity, price, instructions],
    );
  }

  static async getAllOrders() {
    let orders = await db.query("SELECT * FROM orders");
    return orders[0].map((order) => new Order(order));
  }

  async payBill(payer_id, tip) {
    await this.hydrate();
    if (this.status != "billed") {
      throw new Error("Order is not billed yet");
    }
    await db.query(
      "UPDATE orders SET status= ?,payer = ?, tip = ?, paid_at = NOW() WHERE id = ?",
      ["paid", payer_id, tip, this.id],
    );
  }
}
