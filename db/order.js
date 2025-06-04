import db from "./db.js";
import * as item from "./item.js";

export async function getOrderedItems(id) {
  let items = await db.query("SELECT * FROM order_items WHERE order_id = ?", [
    id,
  ]);
  return items[0];
}

export async function getOrder(id) {
  let order = await db.query("SELECT * FROM orders WHERE id = ?", [id]);
  let items = await getOrderedItems(id);
  order[0][0].ordered_items = items;
  return order[0][0];
}

export async function createOrder(issued_by) {
  let orderID = await db.query("INSERT INTO orders (issued_by) VALUES (?)", [
    issued_by,
  ]).insertId;
  let order = await getOrder(orderID);
  return order;
}

export async function updateOrder(id, status = -1, billable_amount = -1) {
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
  order = await getOrder(id);
  return order;
}

export async function deleteAllItemOrders(order_id) {
  await db.query("DELETE FROM order_items WHERE order_id = ?", [order_id]);
}

export async function orderItem(order_id, item_id, quantity) {
  let price = (await item.getItemById(item_id).price) * quantity;
  await db.query(
    "INSERT INTO order_items (order_id, item_id, quantity, price) VALUES (?, ?, ?, ?)",
    [order_id, item_id, quantity, price],
  );
}

export async function deleteOrder(id) {
  await deleteAllItemOrders(id);
  await db.query("DELETE FROM orders WHERE id = ?", [id]);
}

export async function resolveBill(id) {
  let items = await getOrderedItems(id);
  let newOrder = await updateOrder(
    id,
    "billed",
    items.reduce((a, prev) => a.price + prev, 0),
  );
  return newOrder.billable_amount;
}
